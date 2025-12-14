import { CrawlerService } from './crawler.service';
import type { PlaywrightProvider } from './providers/playwright.provider';
import type { SelectorCacheService } from '../selector-cache/selectorCache.service';
import type { LlmService } from '../llm/llm.service';
import type { Page } from 'playwright';

describe('CrawlerService', () => {
  let service: CrawlerService;
  let mockPlaywrightProvider: jest.Mocked<PlaywrightProvider>;
  let mockSelectorCacheService: jest.Mocked<SelectorCacheService>;
  let mockLlmService: jest.Mocked<LlmService>;
  let mockPage: jest.Mocked<Page>;

  beforeEach(() => {
    mockPage = {
      goto: jest.fn(),
      content: jest.fn(),
      $$eval: jest.fn(),
      close: jest.fn(),
      waitForLoadState: jest.fn(),
    } as any;

    mockPlaywrightProvider = {
      newPage: jest.fn().mockResolvedValue(mockPage),
    } as any;

    mockSelectorCacheService = {
      get: jest.fn(),
      set: jest.fn(),
      invalidate: jest.fn(),
      updateSuccessRate: jest.fn(),
    } as any;

    mockLlmService = {
      generateSelectors: jest.fn(),
    } as any;

    service = new CrawlerService(
      mockPlaywrightProvider,
      mockSelectorCacheService,
      mockLlmService,
      1000,
    );
  });

  describe('crawl', () => {
    it('캐시된 셀렉터가 있으면 LLM을 호출하지 않는다', async () => {
      // Given
      mockSelectorCacheService.get.mockReturnValue({
        selectors: { price: '.price', address: '.address' },
        createdAt: '2024-01-01',
        lastUsedAt: '2024-01-01',
        successRate: 0.9,
      });

      mockPage.$$eval.mockResolvedValue([
        { price: '1억', address: '서울시 강남구' },
      ]);

      // When
      await service.crawl('https://zigbang.com/rooms', {
        region: '서울시 강남구',
      });

      // Then
      expect(mockLlmService.generateSelectors).not.toHaveBeenCalled();
      expect(mockSelectorCacheService.get).toHaveBeenCalledWith(
        'zigbang.com/rooms',
      );
    });

    it('캐시된 셀렉터가 없으면 LLM으로 셀렉터를 생성한다', async () => {
      // Given
      mockSelectorCacheService.get.mockReturnValue(null);
      mockPage.content.mockResolvedValue('<div class="item"></div>');
      mockLlmService.generateSelectors.mockResolvedValue({
        selectors: { price: '.price' },
        confidence: 0.9,
      });
      mockPage.$$eval.mockResolvedValue([{ price: '1억' }]);

      // When
      await service.crawl('https://zigbang.com/rooms', {
        region: '서울시 강남구',
      });

      // Then
      expect(mockLlmService.generateSelectors).toHaveBeenCalled();
      expect(mockSelectorCacheService.set).toHaveBeenCalled();
    });

    it('URL에서 siteKey를 올바르게 추출한다', async () => {
      // Given
      mockSelectorCacheService.get.mockReturnValue({
        selectors: { price: '.price' },
        createdAt: '2024-01-01',
        lastUsedAt: '2024-01-01',
        successRate: 0.9,
      });
      mockPage.$$eval.mockResolvedValue([]);

      // When
      await service.crawl('https://www.dabang.com/search/rooms?region=gangnam', {
        region: '강남구',
      });

      // Then
      expect(mockSelectorCacheService.get).toHaveBeenCalledWith(
        'dabang.com/search/rooms',
      );
    });
  });
});
