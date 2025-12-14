import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SchedulerService } from './scheduler/scheduler.service';

async function bootstrap() {
  const isCrawlMode = process.argv.includes('--crawl');

  if (isCrawlMode) {
    // Standalone application 모드 (cron용)
    const app = await NestFactory.createApplicationContext(AppModule);
    const scheduler = app.get(SchedulerService);

    try {
      await scheduler.run();
    } catch (error) {
      console.error('크롤링 실행 중 오류 발생:', error);
      process.exit(1);
    } finally {
      await app.close();
    }
  } else {
    // HTTP 서버 모드 (개발용)
    const app = await NestFactory.create(AppModule);
    await app.listen(process.env.PORT ?? 3000);
  }
}

bootstrap();
