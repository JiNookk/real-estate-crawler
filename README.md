# 적응형 부동산 크롤러

LLM 기반 적응형 크롤러로, 부동산 매물 정보를 수집하여 Google Sheets에 저장합니다.
사이트 구조가 변경되어도 LLM이 셀렉터를 재생성하여 자동 대응합니다.

## 기술 스택

- **Framework**: NestJS 11.x
- **Language**: TypeScript 5.x (strict mode)
- **Browser Automation**: Playwright
- **LLM**: Claude API (@anthropic-ai/sdk)
- **Storage**: Google Sheets API

## 아키텍처

```
src/
├── crawler/           # Playwright 기반 크롤러
│   ├── providers/     # 브라우저 인스턴스 관리
│   └── types/         # CrawlResult, SearchParams 등
├── llm/               # LLM 클라이언트 (전략 패턴)
│   └── strategies/    # Claude, OpenAI 등
├── selector-cache/    # 셀렉터 캐싱
│   └── cache/         # selectors.json
├── sheet/             # Google Sheets 연동
├── scheduler/         # 스케줄러 (standalone 실행)
└── main.ts
```

## 크롤링 플로우

```
1. 설정 파일에서 타겟 사이트/조건 로드
2. SelectorCache에서 해당 path의 셀렉터 조회
   - 있으면 → 바로 크롤링
   - 없으면 → LLM으로 셀렉터 생성 → 캐시 저장
3. Playwright로 페이지 렌더링 및 데이터 추출
4. 추출 실패 시 → 캐시 무효화 → LLM 재호출
5. 결과 Google Sheets에 저장
```

## 설치

```bash
npm install

# Playwright 브라우저 설치
npx playwright install chromium
```

## 환경변수 설정

`.env.example`을 `.env`로 복사 후 설정:

```bash
cp .env.example .env
```

| 변수명 | 설명 | 필수 |
|--------|------|------|
| CLAUDE_API_KEY | Claude API 키 | O |
| GOOGLE_SHEETS_CREDENTIALS_PATH | 서비스 계정 JSON 경로 | O |
| TARGET_SHEET_ID | 대상 스프레드시트 ID | O |
| TARGET_SHEET_NAME | 시트 이름 | X (기본: Sheet1) |
| CRAWLER_HEADLESS | headless 모드 | X (기본: true) |
| CRAWLER_REQUEST_DELAY_MS | 요청 간 딜레이 | X (기본: 1000) |

## 실행

```bash
# 개발 서버
npm run start:dev

# 크롤링 실행 (개발)
npm run crawl

# 크롤링 실행 (프로덕션)
npm run build
npm run crawl:prod
```

## 테스트

```bash
# 유닛 테스트
npm test

# 테스트 커버리지
npm run test:cov
```

## 크롤링 타겟 설정

`config/targets.json`에서 크롤링 대상 설정:

```json
{
  "targets": [
    {
      "name": "직방",
      "baseUrl": "https://www.zigbang.com/home/villa/items",
      "searchParams": {
        "region": "서울시 강남구",
        "floorType": "ground"
      }
    }
  ]
}
```

## EC2 배포

### Playwright 브라우저 설치

```bash
chmod +x scripts/install-playwright.sh
./scripts/install-playwright.sh
```

### Cron 설정 (매일 오전 9시)

```bash
0 9 * * * cd /path/to/project && npm run crawl:prod >> /var/log/crawler.log 2>&1
```

## 라이선스

UNLICENSED
