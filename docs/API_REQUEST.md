# 검색 페이지 신규 API 요청서

> 프론트엔드에서 필요한 기능 구현을 위해 백엔드에 요청하는 API 명세입니다.

---

## 현재 원고 데이터 구조 (참고)

```typescript
interface Manuscript {
  _id: string;              // MongoDB ObjectId
  content: string;          // 원고 내용
  createdAt: string;        // ISO 날짜 "2025-12-15T06:42:25.731+00:00"
  engine: string;           // "grok-4-fast-non-reasoning"
  service: string;          // "grok_grok"
  category: string;         // "브로멜라인"
  keyword: string;          // "파인애플효소"
  ref: string;              // 참조원고 (빈 문자열 가능)
  work_start_date: string;  // "2025-01-15"
  test_mode: boolean;       // false
}
```

---

## 1. 검색 자동완성 API

### 목적
사용자가 검색어 입력 시 실시간으로 관련 키워드를 추천하여 UX 향상

### 요청 스펙

```
GET /search/autocomplete?q={query}&limit={limit}
```

| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|-----|------|
| q | string | O | 검색어 (2자 이상) |
| limit | number | X | 결과 수 (기본값: 5, 최대: 10) |

### 기대 응답

```json
{
  "suggestions": [
    { "keyword": "위고비 효능", "count": 152 },
    { "keyword": "위고비 부작용", "count": 89 },
    { "keyword": "위고비 가격", "count": 67 }
  ]
}
```

### 구현 참고
- 기존 원고의 `keyword` 필드 기반 집계
- 디바운스 300ms 적용 예정 (프론트)
- 한글 초성 검색 지원되면 좋음 (예: "ㅇㄱㅂ" → "위고비")

---

## 2. 인기 검색어 API

### 목적
메인 화면 또는 검색창에 인기 검색어 노출

### 요청 스펙

```
GET /search/popular?period={period}&limit={limit}
```

| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|-----|------|
| period | string | X | 기간 (today, week, month) 기본값: week |
| limit | number | X | 결과 수 (기본값: 10) |

### 기대 응답

```json
{
  "period": "week",
  "keywords": [
    { "rank": 1, "keyword": "위고비", "count": 523, "change": 2 },
    { "rank": 2, "keyword": "다이어트", "count": 412, "change": -1 },
    { "rank": 3, "keyword": "삭센다", "count": 389, "change": 0 }
  ]
}
```

### 필드 설명
- `change`: 순위 변동 (양수: 상승, 음수: 하락, 0: 유지)

---

## 3. 최근 검색어 API

### 목적
사용자별 최근 검색어 저장 및 조회

### 3-1. 검색어 저장

```
POST /search/history
```

```json
{
  "keyword": "위고비 효능",
  "category": "health"
}
```

### 3-2. 검색어 조회

```
GET /search/history?limit={limit}
```

### 기대 응답

```json
{
  "history": [
    { "id": "abc123", "keyword": "위고비", "category": "health", "searchedAt": 1702656000000 },
    { "id": "def456", "keyword": "삭센다", "category": null, "searchedAt": 1702569600000 }
  ]
}
```

### 3-3. 검색어 삭제

```
DELETE /search/history/{id}
```

### 3-4. 전체 삭제

```
DELETE /search/history
```

---

## 4. 원고 삭제 API

### 목적
검색 결과에서 불필요한 원고 삭제

### 요청 스펙

```
DELETE /search/manuscript/{id}
```

### 기대 응답

```json
{
  "ok": true,
  "deletedId": "manuscript_id_here"
}
```

### 구현 참고
- 소프트 삭제 권장 (복구 가능하도록)
- 삭제 권한 체크 필요시 추후 논의

---

## 5. 원고 수정 API

### 목적
생성된 원고 내용 수정

### 요청 스펙

```
PATCH /search/manuscript/{id}
```

```json
{
  "content": "수정된 원고 내용...",
  "memo": "수정 메모 (선택)"
}
```

### 기대 응답

```json
{
  "ok": true,
  "manuscript": {
    "_id": "manuscript_id",
    "content": "수정된 원고 내용...",
    "updatedAt": 1702656000000
  }
}
```

---

## 6. 검색 필터 확장

### 목적
현재 카테고리만 필터 가능 → 다양한 필터 옵션 추가

### 요청 스펙 (기존 API 확장)

```
POST /search/keyword
```

```json
{
  "query": "위고비",
  "category": "health",
  "filters": {
    "dateFrom": "2024-01-01",
    "dateTo": "2024-12-31",
    "engine": ["gpt-5-v2", "clean-claude"],
    "hasRef": true,
    "minLength": 500
  },
  "sort": {
    "field": "timestamp",
    "order": "desc"
  },
  "page": 1,
  "limit": 20
}
```

### 필터 옵션 설명

| 필터 | 타입 | 설명 |
|-----|------|------|
| dateFrom | string | 시작 날짜 (YYYY-MM-DD) |
| dateTo | string | 종료 날짜 (YYYY-MM-DD) |
| engine | string[] | 사용된 AI 엔진 필터 |
| hasRef | boolean | 참조원고 유무 |
| minLength | number | 최소 글자수 |

### 정렬 옵션

| field | 설명 |
|-------|------|
| timestamp | 생성일 기준 |
| length | 글자수 기준 |
| relevance | 관련도 기준 (기본값) |

---

## 7. 원고 통계 API

### 목적
대시보드 또는 통계 페이지용 데이터

### 요청 스펙

```
GET /search/stats?period={period}
```

| 파라미터 | 타입 | 설명 |
|---------|------|------|
| period | string | day, week, month |

### 기대 응답

```json
{
  "period": "week",
  "totalCount": 1523,
  "byEngine": {
    "gpt-5-v2": 523,
    "clean-claude": 412,
    "solar": 289,
    "chunk": 299
  },
  "byCategory": {
    "health": 623,
    "beauty": 412,
    "food": 289
  },
  "daily": [
    { "date": "2024-12-10", "count": 152 },
    { "date": "2024-12-11", "count": 189 },
    { "date": "2024-12-12", "count": 203 }
  ]
}
```

---

## 8. 원고 즐겨찾기 API

### 목적
자주 참조하는 원고 북마크

### 8-1. 즐겨찾기 추가

```
POST /search/bookmark/{manuscriptId}
```

### 8-2. 즐겨찾기 해제

```
DELETE /search/bookmark/{manuscriptId}
```

### 8-3. 즐겨찾기 목록

```
GET /search/bookmarks?page={page}&limit={limit}
```

### 기대 응답

```json
{
  "bookmarks": [
    {
      "id": "bookmark_id",
      "manuscript": { /* SearchDocument 전체 */ },
      "createdAt": 1702656000000
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 10
}
```

---

## 우선순위 제안

| 순위 | API | 이유 |
|-----|-----|------|
| 1 | 검색 자동완성 | UX 개선 효과 큼 |
| 2 | 원고 삭제 | 기본 CRUD 필수 |
| 3 | 검색 필터 확장 | 사용성 향상 |
| 4 | 인기 검색어 | 신규 사용자 가이드 |
| 5 | 원고 수정 | 콘텐츠 관리 |
| 6 | 최근 검색어 | 개인화 |
| 7 | 즐겨찾기 | 개인화 |
| 8 | 통계 | 부가 기능 |

---

## 공통 사항

### 에러 응답 형식

```json
{
  "ok": false,
  "error": {
    "code": "INVALID_QUERY",
    "message": "검색어는 2자 이상이어야 합니다."
  }
}
```

### HTTP 상태 코드

| 코드 | 설명 |
|-----|------|
| 200 | 성공 |
| 400 | 잘못된 요청 |
| 404 | 리소스 없음 |
| 429 | 요청 제한 초과 |
| 500 | 서버 오류 |
