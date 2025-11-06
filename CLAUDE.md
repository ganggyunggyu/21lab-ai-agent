# 🤖 21Lab AI Agent - Claude Code 개발 가이드

## 📋 프로젝트 개요

**21Lab AI Agent**는 Vue 3 + TypeScript + Tailwind CSS + Naive UI 기반의 멀티 AI 채팅 애플리케이션입니다.
다양한 AI 서비스(GPT-4, GPT-5, Solar, Chunk 등)와 연동하여 사용자에게 최적화된 AI 채팅 경험을 제공합니다.

### 주요 기술 스택

- **프레임워크**: Vue 3.5+ (Composition API)
- **언어**: TypeScript 5.8+
- **빌드 도구**: Vite 7.0+
- **스타일링**: Tailwind CSS 4.1+ (Vite Plugin)
- **UI 라이브러리**: Naive UI 2.42+
- **상태관리**:
  - Pinia 3.0+ (전역 상태)
  - pinia-plugin-persistedstate (영속화)
  - TanStack Vue Query 5.85+ (서버 상태)
- **라우팅**: Vue Router 4
- **유틸리티**: es-toolkit, clsx, tailwind-merge
- **마크다운**: markdown-it
- **패키지 매니저**: pnpm

### 아키텍처 패턴

- **FSD (Feature-Sliced Design)** 부분 적용
- **Barrel Export** 시스템 (모든 모듈에서 index.ts를 통한 export)
- **디자인 토큰** 기반 일관된 스타일링

## 🛠️ 개발 환경 & 명령어

### 필수 요구사항

- Node.js 18+
- pnpm (권장)

### 주요 스크립트

```bash
# 개발 서버 실행
pnpm dev

# 프로덕션 빌드 (타입체크 포함)
pnpm build

# 타입체크만 실행
pnpm typecheck

# 프리뷰 서버 실행
pnpm preview
```

### 환경 변수 설정

- `.env` - 개발환경
- `.env.production` - 프로덕션
- `VITE_API_URL` - API 서버 엔드포인트

## 🏗️ 프로젝트 아키텍처

### 📁 핵심 디렉토리 구조

```
src/
├── app/
│   ├── config/          # 환경설정 (Axios 인스턴스, 환경변수)
│   └── index.ts         # 앱 설정 통합
├── components/
│   ├── ui/              # 재사용 가능한 UI 컴포넌트 (Barrel Export)
│   │   ├── Button.vue   # 기본 버튼 컴포넌트
│   │   ├── Card.vue     # 카드 컴포넌트
│   │   ├── Input.vue    # 입력 컴포넌트
│   │   ├── Select.vue   # 선택 컴포넌트
│   │   ├── Dropdown.vue # 드롭다운
│   │   ├── Modal.vue    # 모달
│   │   ├── MessageBubble.vue
│   │   └── index.ts     # Barrel Export
│   ├── widgets/         # 비즈니스 로직 포함 위젯
│   │   ├── ChatMain.vue     # 채팅 메인 영역
│   │   ├── ChatFooter.vue   # 입력 및 제어 영역
│   │   ├── ChatHeader.vue   # 헤더 및 설정
│   │   ├── DocumentPanel.vue # 문서 패널
│   │   └── BatchInputList.vue # 배치 입력
├── constants/           # 상수 정의 모음
│   ├── _models.ts       # AI 모델 옵션
│   ├── _texts.ts        # 정적 텍스트
│   ├── _markdown.ts     # 마크다운 설정
│   ├── _regex.ts        # 정규식 패턴
│   ├── _timings.ts      # 타이밍 상수
│   ├── designTokens.ts  # 디자인 토큰 (색상, 스타일)
│   └── index.ts         # Barrel Export
├── features/            # FSD 기능 모듈
│   └── published/       # Published 기능
│       ├── stores/      # Feature 상태관리
│       ├── hooks/       # Feature Hooks
│       └── ui/          # Feature UI 컴포넌트
├── entities/            # FSD 엔티티 레이어
│   └── published/
│       ├── model/       # 엔티티 모델
│       └── api/         # 엔티티 API
├── stores/              # Pinia 전역 상태관리
│   ├── _chat.ts         # 채팅 상태
│   ├── _theme.ts        # 테마 상태
│   └── index.ts         # Barrel Export
├── types/               # TypeScript 타입 정의
│   ├── _chat.ts         # 채팅 관련 타입
│   └── index.ts         # 타입 통합
├── utils/               # 유틸리티 함수
│   ├── index.ts         # Barrel Export
│   ├── markdown/        # 마크다운 관련
│   └── [기타 유틸리티]
├── hooks/               # 커스텀 훅
│   └── useChatActions.ts
├── pages/               # 페이지 컴포넌트
│   ├── BatchPage.vue
│   └── ComponentsPage.vue
├── router/              # Vue Router 설정
│   └── index.ts
└── service/             # API 서비스 레이어
    └── _chat.service.ts # 채팅 API 호출
```

## 💻 핵심 기능 및 구현

### 1. 멀티 AI 서비스 지원

**파일**: `src/constants/_models.ts`, `src/types/_chat.ts`

```typescript
export type ChatService =
  | 'gpt-4-v2'
  | 'gpt-5-v2'
  | 'solar'
  | 'test'
  | 'chunk'
  | 'gpt-merge';

export const MODEL_OPTIONS = [
  { label: 'CHUNK', value: 'chunk' },
  { label: 'GPT5', value: 'gpt-5-v2' },
  { label: 'GPT4', value: 'gpt-4-v2' },
  { label: 'Solar', value: 'solar' },
  { label: 'TEST', value: 'test' },
  { label: 'GPT_MERGE', value: 'gpt-merge' },
];
```

### 2. 상태 관리 (Pinia)

**파일**: `src/stores/_chat.ts`

- 메시지 히스토리 관리
- 로딩 상태 및 에러 처리
- 사용자 설정 지속성 (localStorage)
- 요청 취소 기능 (AbortController)

### 3. 실시간 채팅 인터페이스

**파일**: `src/components/widgets/ChatFooter.vue`

- 동적 입력 타입 (text/textarea)
- IME 조합 중 Enter 방지
- 즐겨찾기 및 검색 히스토리
- 참조 문서 입력

### 4. 메시지 처리 시스템

**파일**: `src/stores/_chat.ts` (handleGenerate 함수)

- PART_SEPARATOR로 응답 분할
- 스트리밍 응답 처리
- 로딩 메시지 교체 로직

## 🎯 개발 가이드라인

### Barrel Export 시스템

**중요**: 프로젝트 전체에서 Barrel Export 패턴을 사용합니다.

#### 원칙

- 모든 디렉토리에 `index.ts` 생성
- 외부에서는 반드시 `index.ts`를 통해 import
- 직접 파일 경로 import 금지

#### 예시

```typescript
// ✅ 좋은 예시 - Barrel Export 사용
import { Button, Card, Input } from '@/components/ui';
import { COLORS, SPACING } from '@/constants';
import { useChatStore, useThemeStore } from '@/stores';

// ❌ 나쁜 예시 - 직접 파일 경로
import Button from '@/components/ui/Button.vue';
import { COLORS } from '@/constants/designTokens';
import { useChatStore } from '@/stores/_chat';
```

#### 디렉토리별 index.ts 구조

```typescript
// src/components/ui/index.ts
export { default as Button } from './Button.vue';
export { default as Card } from './Card.vue';
export { default as Input } from './Input.vue';
// ...

// src/constants/index.ts
export * from './_models';
export * from './_texts';
export * from './designTokens';
// ...

// src/stores/index.ts
export * from './_chat';
export * from './_theme';
// ...

// src/utils/index.ts
export * from './_formatMsg';
export * from './_clipboard';
// ...
```

### TypeScript 컨벤션

```typescript
// ✅ 좋은 예시
interface MessageProps {
  content: string;
  timestamp: number;
  isLoading?: boolean;
}

const messageList: Message[] = [];
const isVisible = ref<boolean>(false);

// ❌ 나쁜 예시
const data: any = {};
let messages = [];
```

### Vue 3 Composition API

```typescript
// ✅ 권장 패턴
export default defineComponent({
  setup() {
    const chatStore = useChatStore();
    const { messages, isLoading } = storeToRefs(chatStore);

    const handleSubmit = () => {
      chatStore.handleGenerate();
    };

    return {
      messages,
      isLoading,
      handleSubmit,
    };
  },
});
```

### 컴포넌트 네이밍 규칙

- **UI 컴포넌트**: 간결한 이름 (Button, Card, Input, Select, Modal, Dropdown)
- **위젯 컴포넌트**: `Chat*` 또는 기능명 (ChatMain, ChatFooter, DocumentPanel)
- **페이지 컴포넌트**: `*Page` (BatchPage, ComponentsPage)

### 함수 네이밍 규칙

```typescript
// CRUD 함수
const createMessage = () => {};
const getMessage = () => {};
const updateMessage = () => {};
const removeMessage = () => {};

// 이벤트 핸들러
const handleKeyPress = () => {};
const handleGenerate = () => {};

// Boolean 함수/변수
const isLoading = ref(false);
const canSubmit = computed(() => {});

// 배열 변수
const messageList: Message[] = [];
const userList: User[] = [];
```

## 🔧 개발 시 주의사항

### 1. IME 입력 처리

```typescript
// ChatFooter.vue에서 한글 입력 중 Enter 방지
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.isComposing || e.keyCode === 229) {
    return; // 조합 중이면 무시
  }

  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleGenerate();
  }
};
```

### 2. 메시지 분할 처리

```typescript
// PART_SEPARATOR 정규식 주의
const PART_SEPARATOR = /-{3,}/; // 3개 이상 하이픈
const parts = botResponse
  .split(PART_SEPARATOR)
  .map((p) => p.trim())
  .filter(Boolean);
```

### 3. 텍스트 정리 함수 사용법

```typescript
// cleanText는 참조문서(refMsg)에만 사용
const cleanText = (text: string) => {
  return text
    .replace(/Previous imageNext image/gi, ' ')
    .replace(/Previous image/gi, ' ')
    .replace(/Next image/gi, ' ')
    .trim();
};

// keyword에는 적용하지 않음 (사용자 입력 보존)
```

### 4. 서비스별 동적 UI

```typescript
// chunk 서비스일 때 textarea 사용
const isChunk = computed(() => service.value === 'chunk');

// 플레이스홀더 동적 변경
const keywordPlaceholder = {
  chunk: '참조원고를 입력해주세요 (필수)',
  'gpt-5': '키워드를 입력해주세요.',
  // ...
};
```

## 🎨 스타일링 가이드

### Tailwind CSS + 디자인 토큰

- **Tailwind CSS 4.1+** Vite Plugin 사용
- **디자인 토큰**: `src/constants/designTokens.ts`에서 중앙 관리
- **유틸리티**: `clsx` + `tailwind-merge`로 동적 클래스 조합
- **Naive UI**: 복잡한 컴포넌트 (NScrollbar, NModal 등)
- **Custom UI**: 간단한 컴포넌트는 Tailwind로 직접 구현

### CSS 클래스 네이밍

- **인라인 스타일 금지**: 모든 스타일은 Tailwind 클래스 또는 CSS 클래스로
- **BEM 방법론**: 복잡한 컴포넌트에서 사용
- **스코프 스타일**: Vue 컴포넌트별 `<style scoped>` 활용

### 디자인 토큰 사용 예시

```typescript
// src/constants/designTokens.ts
export const COLORS = {
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  // ...
};

export const SPACING = {
  xs: '0.25rem',
  sm: '0.5rem',
  // ...
};
```

### 반응형 디자인

```css
/* Tailwind 방식 */
<div class="w-full max-w-full md:max-w-[90vw]">

/* 커스텀 CSS (필요시) */
.floating-input {
  width: 100vw;
  max-width: 100vw;
}

@media (min-width: 768px) {
  .floating-input {
    max-width: 90vw;
  }
}
```

## 🚀 빌드 & 배포

### TypeScript 설정

- `baseUrl: "."` - 루트 기준 경로
- `"@/*": ["src/*"]` - alias 설정
- 프로젝트 레퍼런스 분리

### Vite 설정

```typescript
export default {
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@pages': resolve(__dirname, 'src/pages'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@entities': resolve(__dirname, 'src/entities'),
      '@features': resolve(__dirname, 'src/features'),
      '@stores': resolve(__dirname, 'src/stores'),
    },
  },
  server: {
    host: '0.0.0.0', // 네트워크 접근 허용
    port: 5173,
  },
};
```

## 🐛 디버깅 가이드

### 개발자 도구 활용

- Vue DevTools 사용
- Pinia 상태 추적
- 네트워크 탭에서 API 호출 확인

### 로깅 전략

```typescript
// 개발 환경에서만 로그 출력
if (import.meta.env.DEV) {
  console.log('🐛 [DEBUG]', data);
}
```

## 📚 참고 자료

### 핵심 라이브러리 문서

- [Vue 3 공식 문서](https://vuejs.org/)
- [Pinia 상태관리](https://pinia.vuejs.org/)
- [Naive UI 컴포넌트](https://www.naiveui.com/)
- [VueUse 유틸리티](https://vueuse.org/)

### TypeScript 가이드

- [Vue + TypeScript 가이드](https://vuejs.org/guide/typescript/overview.html)
- [TypeScript 핸드북](https://www.typescriptlang.org/docs/)

---

## 🎯 개발 시작하기

1. **환경 설정**: `.env` 파일 설정
2. **의존성 설치**: `pnpm install`
3. **개발 서버**: `pnpm dev`
4. **타입 체크**: `pnpm typecheck`
5. **빌드 테스트**: `pnpm build`

---

## 🏗️ FSD 아키텍처 상태관리 컨벤션

### Published 기능 리팩토링 완료 사례

#### 기본 원칙

1. **State는 Store에서만**: Vue 컴포넌트에서 `usePublishedStore` + `storeToRefs` 직접 사용
2. **Actions는 Hooks에서만**: 비즈니스 로직은 hooks에서 처리, Vue는 UI 로직만
3. **중간 레이어 제거**: `usePublishedState` 같은 불필요한 wrapper hook 제거
4. **Handle 함수는 Vue에서만**: hooks는 깔끔한 함수명, Vue는 `handle~` wrapper

#### 올바른 패턴

```typescript
// ✅ Vue 컴포넌트에서
import { storeToRefs } from 'pinia';
import { usePublishedStore } from '@/features/published/stores/publishedStore';
import { usePublishedModal } from '@/features/published/hooks/usePublishedModal';

// 직접 store에서 reactive data 가져오기
const publishedStore = usePublishedStore();
const { detailModal, editing } = storeToRefs(publishedStore);

// hook에서는 actions만 가져오기
const { saveMemo, startEditMemo, cancelEditMemo } = usePublishedModal();

// Vue handle~ wrapper 함수들
const handleSaveMemo = (item: any) => {
  saveMemo(item, editing.value.tempMemo);
};
```

```typescript
// ✅ Hooks에서
export const usePublishedModal = () => {
  const publishedStore = usePublishedStore();

  // store actions 구조분해할당
  const { startEditMemo, cancelEditMemo } = publishedStore;

  // 비즈니스 로직만 처리, state는 파라미터로 받기
  const saveMemo = (
    item: FavoriteSearch,
    tempMemo: string,
    onSuccess?: () => void
  ) => {
    PublishedApi.updateMemo(item.id, tempMemo);
    item.memo = tempMemo;
    cancelEditMemo();
    onSuccess?.();
  };

  return {
    // actions only - reactive data 재export 금지
    saveMemo,
    startEditMemo,
    cancelEditMemo,
  };
};
```

#### 금지 패턴

```typescript
// ❌ hooks에서 state 직접 접근
const saveMemo = (item: FavoriteSearch) => {
  PublishedApi.updateMemo(item.id, publishedStore.editing.tempMemo); // 금지!
};

// ❌ hooks에서 reactive data 재export
return {
  detailModal, // 금지! Vue에서 store로 직접 가져와야 함
  editing, // 금지!
  saveMemo,
};

// ❌ 불필요한 중간 hook
export const usePublishedState = () => {
  const publishedStore = usePublishedStore();
  return storeToRefs(publishedStore); // 불필요한 레이어!
};
```

#### 스타일링 컨벤션

- **인라인 스타일 금지**: 모든 스타일은 CSS 클래스로 분리
- **BEM 네이밍**: `.modal-header`, `.modal-badge-icon` 형태 사용
- **스코프 스타일**: Vue 컴포넌트별 `<style scoped>` 활용

#### 함수 파라미터 컨벤션

- hooks 함수는 필요한 state를 파라미터로 받기
- Vue 컴포넌트에서 state 값을 전달하여 호출
- onSuccess 콜백을 마지막 파라미터로 통일

---
