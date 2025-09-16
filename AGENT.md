# 🤖 21Lab AI Agent - 케인인님 전용 에이전트 가이드

## 📋 프로젝트 개요
**21Lab AI Agent**는 Vue 3 + TypeScript + Pinia + TanStack Query 기반의 **멀티 AI 채팅 플랫폼**입니다.
GPT-4, GPT-5, Solar, Chunk 등 다양한 AI 서비스를 통합하여 최고의 AI 채팅 경험을 제공합니다.

아이고난1! 이 프로젝트는 현대적인 FSD 아키텍처를 적용한 완벽한 뭉탱이입니다!

## 🛠️ 기술 스택

### 핵심 프레임워크
- **Vue 3** (Composition API)
- **TypeScript** 5.8.3
- **Vite** 7.0.4

### 상태관리 & 데이터
- **Pinia** 3.0.3 (상태관리)
- **Pinia Plugin Persistedstate** (localStorage 지속성)
- **Vue Query** (@tanstack/vue-query) (서버 상태 관리)

### UI/UX
- **Naive UI** 2.42.0 (컴포넌트 라이브러리)
- **Vicons** (아이콘)
- **Vue Router** 4 (라우팅)

### 유틸리티
- **Axios** (HTTP 클라이언트)
- **Markdown-it** (마크다운 파싱)
- **Es-toolkit** (유틸리티 함수)

## 📁 프로젝트 구조

```
src/
├── app/
│   ├── config/          # 환경설정 및 Axios 인스턴스
│   └── index.ts
├── components/
│   ├── ui/              # 재사용 가능한 UI 컴포넌트
│   │   ├── ModernButton.vue
│   │   ├── MessageBubble.vue
│   │   └── ModernCard.vue
│   ├── widgets/         # 기능별 위젯 컴포넌트
│   │   ├── ChatMain.vue
│   │   ├── ChatFooter.vue
│   │   └── ChatHeader.vue
│   └── [기타 컴포넌트들]
├── constants/           # 상수 정의
│   ├── _models.ts       # AI 모델 옵션
│   ├── _texts.ts        # 텍스트 상수
│   ├── _markdown.ts     # 마크다운 관련
│   ├── _regex.ts        # 정규식 패턴
│   └── _timings.ts      # 타이밍 상수
├── stores/              # Pinia 스토어
│   └── _chat.ts         # 채팅 상태관리
├── types/               # TypeScript 타입 정의
│   ├── _chat.ts         # 채팅 관련 타입
│   └── index.ts
├── utils/               # 유틸리티 함수
│   ├── _formatMsg.ts    # 메시지 포맷팅
│   ├── _downloadText.ts # 텍스트 다운로드
│   ├── _markdown.ts     # 마크다운 처리
│   └── _clipboard.ts    # 클립보드 유틸
├── router/              # Vue Router 설정
└── service/             # API 서비스 로직
```

## 🎯 핵심 기능 (나는! 나는..! 이 기능들을 완벽하게 파악했다!!)

### 1. 멀티 AI 서비스 지원
```typescript
// 지원하는 AI 서비스들 - 움직임이 예사롭지 않은 것은 맞아!
type ChatService = 'gpt-4-v2' | 'gpt-5-v2' | 'solar' | 'test' | 'chunk' | 'gpt-merge';

const MODEL_OPTIONS = [
  { label: 'CHUNK', value: 'chunk' },      // 참조문서 기반
  { label: 'GPT5', value: 'gpt-5-v2' },   // 최신 GPT-5
  { label: 'GPT4', value: 'gpt-4-v2' },   // GPT-4 터보
  { label: 'Solar', value: 'solar' },     // Solar 모델
  { label: 'TEST', value: 'test' },       // 테스트용
  { label: 'GPT_MERGE', value: 'gpt-merge' }, // GPT 병합
];
```

### 2. 실시간 채팅 인터페이스
- **ChatMain.vue**: 메시지 리스트, 자동 스크롤, 마크다운 렌더링
- **ChatFooter.vue**: 동적 입력 (text/textarea), IME 처리, 즐겨찾기
- **ChatHeader.vue**: AI 모델 선택, 설정 관리
- **스트리밍 응답**: PART_SEPARATOR로 응답 분할 처리

### 3. Published 기능 (FSD 리팩토링 완료)
오옹! 나이스! 이 기능은 완벽한 FSD 아키텍처를 적용했다!
- **features/published/**: 비즈니스 로직과 UI 분리
- **entities/published/**: API와 타입 정의
- **상태관리**: Store + Hooks 패턴으로 깔끔하게 분리

### 4. 고급 기능들
- **IME 입력 처리**: 한글 조합 중 Enter 방지
- **메시지 분할**: 3개 이상 하이픈으로 응답 분할
- **동적 UI**: chunk 서비스일 때 textarea 자동 전환
- **텍스트 정리**: 참조문서에서 불필요한 텍스트 제거

## 🔧 개발 환경 설정

### 필수 요구사항
- Node.js 18+
- Yarn 또는 npm

### 개발 서버 실행
```bash
yarn dev
```

### 빌드
```bash
yarn build
```

### 타입체크
```bash
yarn typecheck
```

## 📝 케인인님 전용 코딩 컨벤션 (엄격 준수!!)

### 네이밍 규칙 - 아이고난1, 이거 틀리면 안 돼!
```typescript
// ✅ 올바른 패턴
const messageList: Message[] = [];          // 배열은 ~List
const isLoading = ref<boolean>(false);      // Boolean은 is~
const canSubmit = computed(() => true);     // Boolean computed는 can~

// CRUD 함수들
const createMessage = () => {};             // 생성
const getMessage = () => {};                // 조회
const updateMessage = () => {};             // 수정
const removeMessage = () => {};             // 삭제

// 이벤트 핸들러
const handleKeyPress = () => {};            // handle~ 필수
const handleGenerate = () => {};
const handleSubmit = () => {};

// 컴포넌트 & 타입 (PascalCase)
interface MessageBubbleProps {}
export const MessageBubble = defineComponent({});
type ChatService = 'gpt-4-v2' | 'gpt-5-v2';

// API 타입들
type MessageCreateRequest = {};
type MessageUpdateRequest = {};
type MessageResponse = {};
```

### Vue 3 Composition API 패턴
```typescript
// ✅ 표준 컴포넌트 구조
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
      handleSubmit
    };
  }
});
```

### FSD 상태관리 패턴 (Published 기능 완료 사례)
```typescript
// ✅ Vue 컴포넌트에서
const store = usePublishedStore();
const { detailModal, editing } = storeToRefs(store); // 직접 가져오기

// ✅ Hooks에서
const { saveMemo, startEditMemo } = usePublishedModal(); // actions만

// Vue handle~ wrapper 함수
const handleSaveMemo = () => saveMemo(item, editing.value.tempMemo);

// ❌ 금지: hooks에서 state 재export
// ❌ 금지: 불필요한 중간 wrapper hook
```

## 🏗️ 아키텍처 패턴

### 컴포넌트 구조
- **UI 컴포넌트**: 재사용 가능한 순수 컴포넌트
- **Widget 컴포넌트**: 비즈니스 로직이 포함된 기능 컴포넌트
- **Page 컴포넌트**: 라우팅 단위 컴포넌트

### 상태 관리
- **Pinia Store**: 글로벌 상태 관리
- **Local State**: 컴포넌트 내부 상태
- **Vue Query**: 서버 상태 캐싱 및 동기화

### 서비스 레이어
- API 호출 로직 분리
- 에러 핸들링 중앙화
- 요청/응답 데이터 변환

## 🚀 확장 가능성

### 새로운 AI 서비스 추가
1. `constants/_models.ts`에 모델 옵션 추가
2. `service/` 폴더에 서비스 구현
3. 타입 정의 업데이트

### UI 컴포넌트 확장
1. `components/ui/` 폴더에 새 컴포넌트 추가
2. Storybook 스토리 작성 (향후 추가 예정)
3. 타입 정의 및 Props 인터페이스 작성

### 기능 확장
1. `features/` 폴더 구조 도입 고려
2. 모듈별 상태 관리 분리
3. 플러그인 시스템 도입

## ⚡ 성능 최적화

### 번들 최적화
- Vite의 code splitting 활용
- 동적 import를 통한 lazy loading
- Tree shaking 최적화

### 런타임 최적화
- Vue 3의 reactive system 활용
- 불필요한 재렌더링 방지
- 메모이제이션 적용

## 🔒 보안 고려사항

### API 키 관리
- 환경변수를 통한 민감 정보 관리
- 클라이언트 사이드에서의 API 키 노출 방지

### 사용자 데이터 보호
- localStorage 데이터 암호화 고려
- XSS 공격 방지를 위한 sanitization

---

## 📚 추가 학습 자료

- [Vue 3 공식 문서](https://vuejs.org/)
- [Pinia 상태관리](https://pinia.vuejs.org/)
- [Naive UI 컴포넌트](https://www.naiveui.com/)
- [TypeScript 핸드북](https://www.typescriptlang.org/docs/)

---

## 🔧 케인인님 전용 특수 구현사항

### 1. IME 입력 처리 (한글 조합 중 Enter 방지)
```typescript
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.isComposing || e.keyCode === 229) {
    return; // 한글 조합 중이면 무시 - 아이고난1!
  }

  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleGenerate();
  }
};
```

### 2. 메시지 분할 처리 (PART_SEPARATOR)
```typescript
const PART_SEPARATOR = /-{3,}/; // 3개 이상 하이픈
const parts = botResponse
  .split(PART_SEPARATOR)
  .map(p => p.trim())
  .filter(Boolean);
```

### 3. 텍스트 정리 함수 (참조문서 전용)
```typescript
// ✅ 참조문서(refMsg)에만 사용
const cleanText = (text: string) => {
  return text
    .replace(/Previous imageNext image/gi, ' ')
    .replace(/Previous image/gi, ' ')
    .replace(/Next image/gi, ' ')
    .trim();
};
// ⚠️ keyword에는 사용 금지! (사용자 입력 보존)
```

### 4. 동적 UI 패턴
```typescript
// chunk 서비스일 때만 textarea 사용
const isChunk = computed(() => service.value === 'chunk');

// 플레이스홀더 동적 변경
const keywordPlaceholder = computed(() => ({
  'chunk': '참조원고를 입력해주세요 (필수)',
  'gpt-5-v2': '키워드를 입력해주세요.',
  'solar': 'Solar AI에게 질문하세요.',
  'test': '테스트 메시지를 입력하세요.',
}[service.value] || '메시지를 입력하세요.'));
```

---

## 🎯 케인인님 개발 체크리스트

### ✅ 네이밍 컨벤션
- [ ] 모든 변수/함수는 camelCase인가?
- [ ] 배열은 ~List로 끝나는가?
- [ ] Boolean은 is~/can~로 시작하는가?
- [ ] 이벤트 핸들러는 handle~인가?
- [ ] 컴포넌트는 PascalCase인가?

### ✅ FSD 아키텍처
- [ ] Vue에서 storeToRefs 직접 사용했는가?
- [ ] Hooks는 actions만 제공하는가?
- [ ] 불필요한 중간 hook을 제거했는가?
- [ ] handle~ wrapper 함수를 Vue에서 작성했는가?

### ✅ Vue 3 패턴
- [ ] Composition API를 사용했는가?
- [ ] setup() 함수를 올바르게 작성했는가?
- [ ] computed와 watch를 적절히 사용했는가?

---

**Created by 케인인님 🤖**
*"나는! 나는..! 완벽한 21Lab AI Agent 가이드를 만들었다!! 잠시 소란이 있었어요."*

**오옹! 나이스! 이제 개발할 준비 끝! 아이고난1!!** 🚀