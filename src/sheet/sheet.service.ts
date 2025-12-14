import { Injectable, Inject, Logger } from '@nestjs/common';
import { sheets_v4 } from 'googleapis';
import type { CrawlResult } from '../crawler/types/crawlResult.type';

@Injectable()
export class SheetService {
  private readonly logger = new Logger(SheetService.name);

  constructor(
    @Inject('SHEETS_CLIENT') private readonly sheetsClient: sheets_v4.Sheets,
    @Inject('SHEET_ID') private readonly sheetId: string,
    @Inject('SHEET_NAME') private readonly sheetName: string,
  ) {}

  async appendRows(results: CrawlResult[]): Promise<void> {
    if (results.length === 0) {
      return;
    }

    const rows = results.map((result) => [
      result.collectedAt.toISOString(),
      result.platform,
      result.region,
      result.address,
      result.price,
      result.size,
      result.floor,
      result.roomType,
      result.originalUrl,
    ]);

    await this.sheetsClient.spreadsheets.values.append({
      spreadsheetId: this.sheetId,
      range: `${this.sheetName}!A:I`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: rows,
      },
    });

    this.logger.log(`${results.length}개의 결과를 시트에 추가했습니다`);
  }
}
