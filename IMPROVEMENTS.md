# 코드 개선점 분석 보고서

> 분석일: 2025-11-27
> 분석 대상: 21Lab AI Agent 전체 프로젝트
> **마지막 업데이트**: 2025-11-27

## 요약

- 🔴 Critical: ~~2건~~ → **0건 (모두 해결)**
- 🟠 High: ~~5건~~ → **0건 (모두 해결)**
- 🟡 Medium: 5건
- 🟢 Low: 4건

---

## ✅ 해결된 이슈 (2025-11-27)

### Critical Issues - 모두 해결

| ID | 문제 | 해결 방법 |
|----|------|-----------|
| CRIT-001 | computed 속성에 직접 할당 | `isLoading.value = false` 제거, pendingMessages.delete()로 자동 반영 |
| CRIT-002 | FavoriteSearch 타입 중복 | `_localStorage.ts`에서 중복 인터페이스 제거, `@/entities/published`에서 import |

### High Priority Issues - 모두 해결

| ID | 문제 | 해결 방법 |
|----|------|-----------|
| HIGH-001 | Barrel Export 패턴 미준수 | `_chat.ts`, `_chat.service.ts`, `ChatHeader.vue`, `_timings.ts` 모두 수정 |
| HIGH-002 | any 타입 사용 | `Message \| null`, `unknown` + `isAxiosError` 타입 가드 적용 |
| HIGH-003 | ChatService 타입 불일치 | `MODEL_OPTIONS`에서 `as const`로 타입 자동 추출 |
| HIGH-004 | 미사용 함수 정의 | `handleShiftEnterPress` 함수 및 prop 제거 |
| HIGH-005 | 파일명 오타 | `_axios.instancce.ts` → `_axios.instance.ts` |

### 추가 개선

- `ChatHeader.vue` 미사용 `isComposing` ref 및 composition 이벤트 제거

---

## 🟡 Medium Priority Issues (미해결)

### [MED-001] catch 블록에서 에러 무시

**위치**: `src/utils/_localStorage.ts:21-22, 27-28`

**문제**: 에러가 발생해도 아무런 로깅이나 처리 없이 무시됨.

**해결 방안**:
```typescript
export const setStoredValue = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn(`[localStorage] Failed to set ${key}:`, error);
    }
  }
};
```

---

### [MED-002] 매직 넘버 하드코딩

**위치**: 여러 파일

**문제**: 숫자 리터럴이 의미 없이 하드코딩되어 있음.

**현재 코드**:
```typescript
if (batchRequests.value.length >= 20) return;
const top10 = keywords.slice(0, 10);
const top20 = favorites.slice(0, 20);
```

**해결 방안**:
```typescript
// constants/_limits.ts
export const LIMITS = {
  MAX_BATCH_REQUESTS: 20,
  MAX_FREQUENT_KEYWORDS: 10,
  MAX_FAVORITE_SEARCHES: 20,
  MAX_SEARCH_HISTORY: 15,
} as const;
```

---

### [MED-003] 네이밍 불일치

**위치**: 여러 파일

**문제**: 같은 개념에 대해 다른 이름을 사용함.
- `refMsg` vs `ref` - 참조 문서를 나타내는 변수명이 일관되지 않음
- `Message.ref` vs `BatchRequest.refMsg`

**해결 방안**: 하나의 네이밍으로 통일 (예: `refMsg` 또는 `referenceMessage`)

---

### [MED-004] N+1 유사 패턴

**위치**: `src/stores/_chat.ts:109-116`

**문제**: 100ms마다 배열을 순회하여 메시지를 찾음.

**해결 방안**: 메시지 인덱스를 캐싱하거나 Map 구조 사용

```typescript
const loadingIndex = messages.value.findIndex((msg) => msg.id === loadingMessageId);

const progressInterval = setInterval(() => {
  const loadingMsg = messages.value[loadingIndex];
  if (loadingMsg) {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(95, (elapsed / expectedTime) * 100);
    loadingMsg.loadingProgress = Math.round(progress);
  }
}, 100);
```

---

### [MED-005] 이벤트 리스너 정리 미흡

**위치**: `src/components/ui/Select.vue:92-102`

**상태**: 현재는 올바르게 처리되어 있으나, 주석으로 명시해두면 좋음

---

## 🟢 Low Priority Issues (미해결)

### [LOW-001] 주석 부재

복잡한 비즈니스 로직에 설명 주석 추가 필요

### [LOW-002] 접근성 개선 여지

일부 인터랙티브 요소에 `aria-label` 누락, 키보드 네비게이션 지원 부족

### [LOW-003] 에러 메시지 하드코딩

에러 메시지를 상수로 분리 권장

### [LOW-004] console.log 디버깅 코드 잔재 가능성

ESLint `no-console` 규칙 추가 권장

---

## 개선 로드맵

### Phase 1: 긴급 수정 (Critical + High) ✅ 완료

1. [x] CRIT-001: computed 속성 직접 할당 제거
2. [x] CRIT-002: FavoriteSearch 타입 통합
3. [x] HIGH-001: Barrel Export 패턴 전체 적용
4. [x] HIGH-002: any 타입 제거
5. [x] HIGH-003: ChatService 타입 동기화
6. [x] HIGH-004: 미사용 함수 제거
7. [x] HIGH-005: 파일명 오타 수정

### Phase 2: 품질 개선 (Medium)

1. [ ] MED-001: 에러 로깅 추가
2. [ ] MED-002: 매직 넘버 상수화
3. [ ] MED-003: 네이밍 통일
4. [ ] MED-004: 성능 최적화 (인덱스 캐싱)
5. [ ] MED-005: 이벤트 리스너 주석 추가

### Phase 3: 리팩토링 (Low)

1. [ ] LOW-001: 주석 추가
2. [ ] LOW-002: 접근성 개선
3. [ ] LOW-003: 에러 메시지 상수화
4. [ ] LOW-004: console.log 정리 및 ESLint 규칙 추가

---

## 참고 사항

### 추가 권장 사항

1. **ESLint/Prettier 설정 강화**: 코드 스타일 자동 검사
2. **Husky + lint-staged**: 커밋 전 자동 검사
3. **단위 테스트 추가**: Vitest 활용
4. **E2E 테스트**: Playwright 또는 Cypress 도입 고려
