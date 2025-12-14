import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { chromium, Browser, Page } from 'playwright';

@Injectable()
export class PlaywrightProvider implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PlaywrightProvider.name);
  private browser: Browser | null = null;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const headless = this.configService.get<string>('CRAWLER_HEADLESS', 'true');
    this.browser = await chromium.launch({
      headless: headless === 'true',
    });
    this.logger.log('Playwright 브라우저 초기화 완료');
  }

  async onModuleDestroy() {
    if (this.browser) {
      await this.browser.close();
      this.logger.log('Playwright 브라우저 종료');
    }
  }

  async newPage(): Promise<Page> {
    if (!this.browser) {
      throw new Error('브라우저가 초기화되지 않았습니다');
    }
    const page = await this.browser.newPage();

    // User-Agent 설정
    await page.setExtraHTTPHeaders({
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });

    return page;
  }
}
