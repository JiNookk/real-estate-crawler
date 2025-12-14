import { SelectorCacheService } from './selectorCache.service';
import type { SelectorCacheData } from './selectorCache.type';

describe('SelectorCacheService', () => {
  let service: SelectorCacheService;
  let mockCacheData: SelectorCacheData;

  beforeEach(() => {
    mockCacheData = {};
    service = new SelectorCacheService(mockCacheData);
  });

  describe('get', () => {
    it('캐시된 셀렉터가 있으면 반환한다', () => {
      // Given
      mockCacheData['zigbang.com/room/items'] = {
        selectors: { price: '.item-price' },
        createdAt: '2024-01-01T00:00:00Z',
        lastUsedAt: '2024-01-01T00:00:00Z',
        successRate: 0.95,
      };

      // When
      const result = service.get('zigbang.com/room/items');

      // Then
      expect(result).toEqual({
        selectors: { price: '.item-price' },
        createdAt: '2024-01-01T00:00:00Z',
        lastUsedAt: '2024-01-01T00:00:00Z',
        successRate: 0.95,
      });
    });

    it('캐시된 셀렉터가 없으면 null을 반환한다', () => {
      // When
      const result = service.get('unknown.com/path');

      // Then
      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('셀렉터를 캐시에 저장한다', () => {
      // Given
      const now = new Date('2024-01-15T10:00:00Z');
      const selectors = { price: '.price', address: '.addr' };

      // When
      service.set('dabang.com/rooms', selectors, now);

      // Then
      const cached = service.get('dabang.com/rooms');
      expect(cached).not.toBeNull();
      expect(cached!.selectors).toEqual(selectors);
      expect(cached!.successRate).toBe(1.0);
    });
  });

  describe('invalidate', () => {
    it('캐시된 셀렉터를 삭제한다', () => {
      // Given
      mockCacheData['zigbang.com/room/items'] = {
        selectors: { price: '.item-price' },
        createdAt: '2024-01-01T00:00:00Z',
        lastUsedAt: '2024-01-01T00:00:00Z',
        successRate: 0.95,
      };

      // When
      service.invalidate('zigbang.com/room/items');

      // Then
      expect(service.get('zigbang.com/room/items')).toBeNull();
    });
  });

  describe('updateSuccessRate', () => {
    it('성공 시 성공률을 높인다', () => {
      // Given
      mockCacheData['zigbang.com/room/items'] = {
        selectors: { price: '.item-price' },
        createdAt: '2024-01-01T00:00:00Z',
        lastUsedAt: '2024-01-01T00:00:00Z',
        successRate: 0.8,
      };

      // When
      service.updateSuccessRate('zigbang.com/room/items', true);

      // Then
      const cached = service.get('zigbang.com/room/items');
      expect(cached!.successRate).toBeGreaterThan(0.8);
    });

    it('실패 시 성공률을 낮춘다', () => {
      // Given
      mockCacheData['zigbang.com/room/items'] = {
        selectors: { price: '.item-price' },
        createdAt: '2024-01-01T00:00:00Z',
        lastUsedAt: '2024-01-01T00:00:00Z',
        successRate: 0.8,
      };

      // When
      service.updateSuccessRate('zigbang.com/room/items', false);

      // Then
      const cached = service.get('zigbang.com/room/items');
      expect(cached!.successRate).toBeLessThan(0.8);
    });

    it('존재하지 않는 키에 대해서는 무시한다', () => {
      // When & Then
      expect(() =>
        service.updateSuccessRate('unknown.com/path', true),
      ).not.toThrow();
    });
  });
});
