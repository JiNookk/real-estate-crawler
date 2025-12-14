export interface CachedSelector {
  selectors: Record<string, string>;
  createdAt: string;
  lastUsedAt: string;
  successRate: number;
}

export interface SelectorCacheData {
  [siteKey: string]: CachedSelector;
}
