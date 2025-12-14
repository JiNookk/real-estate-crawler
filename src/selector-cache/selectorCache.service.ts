import { Injectable } from '@nestjs/common';
import type { CachedSelector, SelectorCacheData } from './selectorCache.type';

@Injectable()
export class SelectorCacheService {
  private readonly SUCCESS_RATE_WEIGHT = 0.1;

  constructor(private cacheData: SelectorCacheData = {}) {}

  get(siteKey: string): CachedSelector | null {
    return this.cacheData[siteKey] ?? null;
  }

  set(siteKey: string, selectors: Record<string, string>, now: Date): void {
    const isoString = now.toISOString();
    this.cacheData[siteKey] = {
      selectors,
      createdAt: isoString,
      lastUsedAt: isoString,
      successRate: 1.0,
    };
  }

  invalidate(siteKey: string): void {
    delete this.cacheData[siteKey];
  }

  updateSuccessRate(siteKey: string, success: boolean): void {
    const cached = this.cacheData[siteKey];
    if (!cached) {
      return;
    }

    const delta = success ? this.SUCCESS_RATE_WEIGHT : -this.SUCCESS_RATE_WEIGHT;
    cached.successRate = Math.max(0, Math.min(1, cached.successRate + delta));
    cached.lastUsedAt = new Date().toISOString();
  }

  getCacheData(): SelectorCacheData {
    return this.cacheData;
  }
}
