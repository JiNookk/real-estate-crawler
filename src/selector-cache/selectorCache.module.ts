import { Module, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { SelectorCacheService } from './selectorCache.service';
import * as fs from 'fs';
import * as path from 'path';
import type { SelectorCacheData } from './selectorCache.type';

const CACHE_FILE_PATH = path.join(__dirname, 'cache', 'selectors.json');

@Module({
  providers: [
    {
      provide: SelectorCacheService,
      useFactory: () => {
        let cacheData: SelectorCacheData = {};
        try {
          const fileContent = fs.readFileSync(CACHE_FILE_PATH, 'utf-8');
          cacheData = JSON.parse(fileContent);
        } catch {
          // 파일이 없거나 파싱 실패 시 빈 캐시로 시작
        }
        return new SelectorCacheService(cacheData);
      },
    },
  ],
  exports: [SelectorCacheService],
})
export class SelectorCacheModule implements OnModuleDestroy {
  constructor(private readonly selectorCacheService: SelectorCacheService) {}

  onModuleDestroy() {
    const cacheData = this.selectorCacheService.getCacheData();
    fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify(cacheData, null, 2));
  }
}
