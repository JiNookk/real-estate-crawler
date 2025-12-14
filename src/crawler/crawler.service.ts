import { Injectable, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PlaywrightProvider } from './providers/playwright.provider';
import { SelectorCacheService } from '../selector-cache/selectorCache.service';
import { LlmService } from '../llm/llm.service';
import type { CrawlResult, SearchParams } from './types/crawlResult.type';

const TARGET_FIELDS = ['price', 'size', 'address', 'floor', 'roomType'];

@Injectable()
export class CrawlerService {
  private readonly logger = new Logger(CrawlerService.name);
  private readonly requestDelayMs: number;

  constructor(
    private readonly playwrightProvider: PlaywrightProvider,
    private readonly selectorCacheService: SelectorCacheService,
    private readonly llmService: LlmService,
    @Inject('REQUEST_DELAY_MS') requestDelayMs?: number,
  ) {
    this.requestDelayMs = requestDelayMs ?? 1000;
  }

  async crawl(
    url: string,
    searchParams: SearchParams,
  ): Promise<CrawlResult[]> {
    const siteKey = this.extractSiteKey(url);
    const page = await this.playwrightProvider.newPage();

    try {
      await page.goto(url, { waitUntil: 'networkidle' });
      await this.delay(this.requestDelayMs);

      let selectors = this.selectorCacheService.get(siteKey)?.selectors;

      if (!selectors) {
        this.logger.log(`캐시된 셀렉터 없음. LLM으로 셀렉터 생성: ${siteKey}`);
        const html = await page.content();
        const result = await this.llmService.generateSelectors(
          html,
          TARGET_FIELDS,
        );
        selectors = result.selectors;
        this.selectorCacheService.set(siteKey, selectors, new Date());
      }

      const results = await this.extractData(page, selectors, url, searchParams);
      this.selectorCacheService.updateSuccessRate(siteKey, results.length > 0);

      return results;
    } catch (error) {
      this.logger.error(`크롤링 실패: ${url}`, error);
      this.selectorCacheService.updateSuccessRate(siteKey, false);
      throw error;
    } finally {
      await page.close();
    }
  }

  private extractSiteKey(url: string): string {
    const urlObj = new URL(url);
    const host = urlObj.hostname.replace(/^www\./, '');
    const path = urlObj.pathname;
    return `${host}${path}`;
  }

  private async extractData(
    page: any,
    selectors: Record<string, string>,
    url: string,
    searchParams: SearchParams,
  ): Promise<CrawlResult[]> {
    const itemSelector = Object.values(selectors)[0]?.split(' ')[0] || 'div';

    try {
      const items = await page.$$eval(
        itemSelector,
        (elements: Element[], sels: Record<string, string>) => {
          return elements.map((el) => {
            const result: Record<string, string> = {};
            for (const [field, selector] of Object.entries(sels)) {
              const target = el.querySelector(selector);
              result[field] = target?.textContent?.trim() || '';
            }
            return result;
          });
        },
        selectors,
      );

      return items.map((item: Record<string, string>) => ({
        collectedAt: new Date(),
        platform: this.extractPlatformName(url),
        region: searchParams.region,
        address: item.address || '',
        price: item.price || '',
        size: item.size || '',
        floor: item.floor || '',
        roomType: item.roomType || '',
        originalUrl: url,
      }));
    } catch {
      return [];
    }
  }

  private extractPlatformName(url: string): string {
    const host = new URL(url).hostname;
    if (host.includes('zigbang')) return '직방';
    if (host.includes('dabang')) return '다방';
    return host;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
