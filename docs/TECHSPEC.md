# 적응형 부동산 크롤러 기술 명세

## 1. 프로젝트 개요

LLM 기반 적응형 크롤러로, 부동산 매물 정보를 수집하여 Google Sheets에 저장합니다.
사이트 구조가 변경되어도 LLM이 셀렉터를 재생성하여 자동 대응합니다.

## 2. 기술 스택

| 구분 | 기술 | 버전 |
|------|------|------|
| 런타임 | Node.js | 20.x LTS |
| 프레임워크 | NestJS | 11.x |
| 언어 | TypeScript | 5.x (strict 모드) |
| 브라우저 자동화 | Playwright | 최신 |
| LLM | Claude API | @anthropic-ai/sdk |
| 외부 연동 | Google Sheets API | googleapis |
| 테스트 | Jest | 29.x |

## 3. 아키텍처

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

## 4. 모듈별 역할

### 4.1 Crawler 모듈
- Playwright로 페이지 렌더링
- 셀렉터 적용하여 데이터 추출
- 무한스크롤, 팝업 처리

### 4.2 LLM 모듈
- 전략 패턴으로 LLM 클라이언트 추상화
- HTML → CSS 셀렉터 생성
- Claude API 기본, 확장 가능

### 4.3 Selector Cache 모듈
- path별 셀렉터 캐싱 (JSON 파일)
- 성공률 기반 캐시 무효화
- 재사용으로 LLM 호출 최소화

### 4.4 Sheet 모듈
- Google Sheets API 연동
- 크롤링 결과 append
- Service Account 인증

### 4.5 Scheduler 모듈
- NestJS standalone application
- cron으로 하루 1회 실행
- 전체 크롤링 플로우 오케스트레이션

## 5. 크롤링 플로우

```
1. 설정 파일에서 타겟 사이트/조건 로드
2. SelectorCache에서 해당 path의 셀렉터 조회
   - 있으면 → 바로 크롤링
   - 없으면 → 페이지 렌더링 후 LLM에 HTML 전달 → 셀렉터 생성 → 캐시 저장
3. Playwright로 페이지 렌더링
4. 셀렉터로 데이터 추출
5. 추출 실패 시 → 캐시 무효화 → LLM 재호출
6. 결과 Google Sheets에 저장
```

## 6. 데이터 모델

### CrawlResult
```typescript
interface CrawlResult {
  collectedAt: Date;    // 수집일시
  platform: string;     // 플랫폼 (직방, 다방)
  region: string;       // 지역
  address: string;      // 주소
  price: string;        // 가격
  size: string;         // 평수
  floor: string;        // 층수
  roomType: string;     // 타입
  originalUrl: string;  // 원본링크
}
```

### SearchParams
```typescript
interface SearchParams {
  region: string;
  size?: string;
  floorType?: 'underground' | 'ground' | 'rooftop';
}
```

## 7. 환경변수

| 변수명 | 설명 | 필수 |
|--------|------|------|
| CLAUDE_API_KEY | Claude API 키 | O |
| GOOGLE_SHEETS_CREDENTIALS_PATH | 서비스 계정 JSON 경로 | O |
| TARGET_SHEET_ID | 대상 스프레드시트 ID | O |
| TARGET_SHEET_NAME | 시트 이름 | X (기본: Sheet1) |
| CRAWLER_HEADLESS | headless 모드 | X (기본: true) |
| CRAWLER_REQUEST_DELAY_MS | 요청 간 딜레이 | X (기본: 1000) |

## 8. 배포

### EC2 cron 설정
```bash
# 매일 오전 9시 실행
0 9 * * * cd /path/to/project && npm run crawl >> /var/log/crawler.log 2>&1
```

### Playwright 브라우저 설치
```bash
npx playwright install chromium --with-deps
```

## 9. 컨벤션

- 파일명: camelCase.role.ts (예: crawler.service.ts)
- 테스트 명세: 한국어
- 도메인 객체: 순수 함수, 외부 의존성 금지
- TDD: 테스트 먼저 작성 → 최소 구현
