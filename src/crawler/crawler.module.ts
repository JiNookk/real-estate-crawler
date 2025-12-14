import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CrawlerService } from './crawler.service';
import { PlaywrightProvider } from './providers/playwright.provider';
import { SelectorCacheModule } from '../selector-cache/selectorCache.module';
import { LlmModule } from '../llm/llm.module';

@Module({
  imports: [SelectorCacheModule, LlmModule],
  providers: [
    PlaywrightProvider,
    {
      provide: 'REQUEST_DELAY_MS',
      useFactory: (configService: ConfigService) => {
        return parseInt(
          configService.get<string>('CRAWLER_REQUEST_DELAY_MS', '1000'),
          10,
        );
      },
      inject: [ConfigService],
    },
    CrawlerService,
  ],
  exports: [CrawlerService],
})
export class CrawlerModule {}
