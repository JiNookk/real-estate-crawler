import { Module } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { SchedulerService } from './scheduler.service';
import { CrawlerModule } from '../crawler/crawler.module';
import { SheetModule } from '../sheet/sheet.module';
import type { TargetsConfig } from './scheduler.type';

const TARGETS_CONFIG_PATH = path.join(
  process.cwd(),
  'config',
  'targets.json',
);

@Module({
  imports: [CrawlerModule, SheetModule],
  providers: [
    {
      provide: 'TARGETS_CONFIG',
      useFactory: (): TargetsConfig => {
        const fileContent = fs.readFileSync(TARGETS_CONFIG_PATH, 'utf-8');
        return JSON.parse(fileContent);
      },
    },
    SchedulerService,
  ],
  exports: [SchedulerService],
})
export class SchedulerModule {}
