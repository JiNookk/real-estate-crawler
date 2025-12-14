import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import { SheetService } from './sheet.service';

@Module({
  providers: [
    {
      provide: 'SHEETS_CLIENT',
      useFactory: async (configService: ConfigService) => {
        const credentialsPath = configService.get<string>(
          'GOOGLE_SHEETS_CREDENTIALS_PATH',
        );

        const auth = new google.auth.GoogleAuth({
          keyFile: credentialsPath,
          scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        return google.sheets({ version: 'v4', auth });
      },
      inject: [ConfigService],
    },
    {
      provide: 'SHEET_ID',
      useFactory: (configService: ConfigService) => {
        return configService.get<string>('TARGET_SHEET_ID');
      },
      inject: [ConfigService],
    },
    {
      provide: 'SHEET_NAME',
      useFactory: (configService: ConfigService) => {
        return configService.get<string>('TARGET_SHEET_NAME', 'Sheet1');
      },
      inject: [ConfigService],
    },
    SheetService,
  ],
  exports: [SheetService],
})
export class SheetModule {}
