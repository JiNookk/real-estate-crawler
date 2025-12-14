import { SheetService } from './sheet.service';
import type { CrawlResult } from '../crawler/types/crawlResult.type';

describe('SheetService', () => {
  let service: SheetService;
  let mockSheetsClient: any;

  beforeEach(() => {
    mockSheetsClient = {
      spreadsheets: {
        values: {
          append: jest.fn().mockResolvedValue({ data: {} }),
          get: jest.fn().mockResolvedValue({
            data: {
              values: [['2024-01-01 10:00', '직방', '서울', '역삼동']],
            },
          }),
        },
      },
    };

    service = new SheetService(
      mockSheetsClient,
      'test-sheet-id',
      'Sheet1',
    );
  });

  describe('appendRows', () => {
    it('크롤링 결과를 시트에 추가한다', async () => {
      // Given
      const results: CrawlResult[] = [
        {
          collectedAt: new Date('2024-01-15T10:00:00Z'),
          platform: '직방',
          region: '서울시 강남구',
          address: '역삼동 123-45',
          price: '1억 5000',
          size: '32평',
          floor: '5층',
          roomType: '지상',
          originalUrl: 'https://zigbang.com/room/1',
        },
      ];

      // When
      await service.appendRows(results);

      // Then
      expect(mockSheetsClient.spreadsheets.values.append).toHaveBeenCalledWith({
        spreadsheetId: 'test-sheet-id',
        range: 'Sheet1!A:I',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [
            [
              '2024-01-15T10:00:00.000Z',
              '직방',
              '서울시 강남구',
              '역삼동 123-45',
              '1억 5000',
              '32평',
              '5층',
              '지상',
              'https://zigbang.com/room/1',
            ],
          ],
        },
      });
    });

    it('빈 배열이면 아무것도 하지 않는다', async () => {
      // When
      await service.appendRows([]);

      // Then
      expect(
        mockSheetsClient.spreadsheets.values.append,
      ).not.toHaveBeenCalled();
    });
  });
});
