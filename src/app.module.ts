import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CrawlerModule } from './crawler/crawler.module';
import { LlmModule } from './llm/llm.module';
import { SelectorCacheModule } from './selector-cache/selectorCache.module';
import { SheetModule } from './sheet/sheet.module';
import { SchedulerModule } from './scheduler/scheduler.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CrawlerModule,
    LlmModule,
    SelectorCacheModule,
    SheetModule,
    SchedulerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
