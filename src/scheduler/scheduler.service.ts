import { Injectable, Inject, Logger } from '@nestjs/common';
import { CrawlerService } from '../crawler/crawler.service';
import { SheetService } from '../sheet/sheet.service';
import type { TargetsConfig, TargetConfig } from './scheduler.type';
import type { CrawlResult } from '../crawler/types/crawlResult.type';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private readonly crawlerService: CrawlerService,
    private readonly sheetService: SheetService,
    @Inject('TARGETS_CONFIG') private readonly targetsConfig: TargetsConfig,
  ) {}

  async run(): Promise<void> {
    this.logger.log('크롤링 스케줄러 시작');

    const allResults: CrawlResult[] = [];

    for (const target of this.targetsConfig.targets) {
      try {
        const results = await this.crawlTarget(target);
        allResults.push(...results);
      } catch (error) {
        this.logger.error(`타겟 크롤링 실패: ${target.name}`, error);
      }
    }

    if (allResults.length > 0) {
      await this.sheetService.appendRows(allResults);
      this.logger.log(`총 ${allResults.length}개의 결과를 저장했습니다`);
    }

    this.logger.log('크롤링 스케줄러 완료');
  }

  private async crawlTarget(target: TargetConfig): Promise<CrawlResult[]> {
    this.logger.log(`크롤링 시작: ${target.name}`);

    const results = await this.crawlerService.crawl(
      target.baseUrl,
      target.searchParams,
    );

    this.logger.log(`크롤링 완료: ${target.name}, ${results.length}개 수집`);
    return results;
  }
}
