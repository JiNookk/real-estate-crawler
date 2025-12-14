import { SchedulerService } from './scheduler.service';
import type { CrawlerService } from '../crawler/crawler.service';
import type { SheetService } from '../sheet/sheet.service';
import type { TargetsConfig } from './scheduler.type';

describe('SchedulerService', () => {
  let service: SchedulerService;
  let mockCrawlerService: jest.Mocked<CrawlerService>;
  let mockSheetService: jest.Mocked<SheetService>;
  let mockTargetsConfig: TargetsConfig;

  beforeEach(() => {
    mockCrawlerService = {
      crawl: jest.fn().mockResolvedValue([
        {
          collectedAt: new Date(),
          platform: '직방',
          region: '서울시 강남구',
          address: '역삼동',
          price: '1억',
          size: '20평',
          floor: '3층',
          roomType: '원룸',
          originalUrl: 'https://zigbang.com/1',
        },
      ]),
    } as any;

    mockSheetService = {
      appendRows: jest.fn().mockResolvedValue(undefined),
    } as any;

    mockTargetsConfig = {
      targets: [
        {
          name: '직방',
          baseUrl: 'https://www.zigbang.com/home/villa/items',
          searchParams: {
            region: '서울시 강남구',
            floorType: 'ground',
          },
        },
      ],
    };

    service = new SchedulerService(
      mockCrawlerService,
      mockSheetService,
      mockTargetsConfig,
    );
  });

  describe('run', () => {
    it('모든 타겟을 크롤링하고 결과를 시트에 저장한다', async () => {
      // When
      await service.run();

      // Then
      expect(mockCrawlerService.crawl).toHaveBeenCalledWith(
        'https://www.zigbang.com/home/villa/items',
        { region: '서울시 강남구', floorType: 'ground' },
      );
      expect(mockSheetService.appendRows).toHaveBeenCalled();
    });

    it('여러 타겟이 있으면 순차적으로 크롤링한다', async () => {
      // Given
      mockTargetsConfig.targets.push({
        name: '다방',
        baseUrl: 'https://www.dabang.com/rooms',
        searchParams: {
          region: '서울시 서초구',
        },
      });

      // When
      await service.run();

      // Then
      expect(mockCrawlerService.crawl).toHaveBeenCalledTimes(2);
    });

    it('한 타겟이 실패해도 나머지 타겟을 계속 처리한다', async () => {
      // Given
      mockTargetsConfig.targets.push({
        name: '다방',
        baseUrl: 'https://www.dabang.com/rooms',
        searchParams: {
          region: '서울시 서초구',
        },
      });

      mockCrawlerService.crawl
        .mockRejectedValueOnce(new Error('크롤링 실패'))
        .mockResolvedValueOnce([]);

      // When
      await service.run();

      // Then
      expect(mockCrawlerService.crawl).toHaveBeenCalledTimes(2);
    });
  });
});
