# 🤖 21Lab AI Agent

> Vue 3 + TypeScript + Naive UI 기반의 멀티 AI 채팅 & 배치 원고 생성 애플리케이션

다양한 AI 서비스(GPT-4, GPT-5, Solar, Chunk 등)와 연동하여 **실시간 채팅**, **배치 원고 생성**, **즐겨찾기 관리** 기능을 제공합니다.

---

## 🚀 빠른 시작

### 필수 요구사항
- **Node.js** 18 이상
- **pnpm** (권장)

### 설치 및 실행
```bash
# pnpm 설치 (없는 경우)
npm install -g pnpm

# 의존성 설치
pnpm install

# 개발 서버 실행 (http://localhost:5173)
pnpm dev

# 프로덕션 빌드 (타입체크 포함)
pnpm build

# 타입체크만 실행
pnpm typecheck

# 빌드 프리뷰
pnpm preview
```

### 환경 변수 설정
```bash
# .env (개발환경)
VITE_API_URL=http://localhost:3000/api

# .env.production (프로덕션)
VITE_API_URL=https://api.21lab.co.kr
```

---

## ✨ 주요 기능

### 1. 💬 실시간 AI 채팅
- **멀티 서비스 지원**: GPT-4, GPT-5, Solar, Chunk, GPT-Merge 등
- **스트리밍 응답**: 실시간으로 응답 출력
- **요청 취소**: 생성 중인 응답 즉시 중단 가능
- **메시지 관리**: 복사, 다운로드, 삭제 등
- **마크다운 지원**: 코드 블록 하이라이팅 및 수식 렌더링

### 2. 📝 배치 원고 생성
- **CSV 업로드**: `키워드`, `참조원고` 컬럼 자동 인식
- **최대 20개**: 한 번에 최대 20개 원고 동시 생성
- **진행률 표시**: 실시간 생성 상태 모니터링
- **ZIP 다운로드**: 생성된 모든 원고를 한 번에 다운로드

### 3. ⭐ 즐겨찾기 & 히스토리
- **Published 기능**: 자주 사용하는 키워드/원고 저장
- **메모 관리**: 각 즐겨찾기에 메모 추가 가능
- **서비스 배지**: 어떤 AI 서비스로 생성했는지 한눈에 확인
- **검색 히스토리**: 최근 검색 내역 자동 저장

### 4. 🎨 현대적 UI/UX
- **글래스모피즘**: 반투명 효과로 세련된 디자인
- **다크 모드**: 눈의 피로를 줄이는 다크 테마
- **반응형**: 모바일, 태블릿, 데스크톱 완벽 지원
- **IME 최적화**: 한글 입력 중 Enter 처리 완벽 지원

---

## 🏗️ 프로젝트 구조

### FSD (Feature-Sliced Design) 아키텍처
```
src/
├── app/                    # 앱 전역 설정
│   └── config/            # Axios, 환경변수 등
├── pages/                  # 페이지 컴포넌트
│   ├── BatchPage.vue      # 배치 원고 생성 페이지
│   └── ...
├── features/               # 기능 단위 모듈 (FSD)
│   └── published/         # 즐겨찾기 기능
│       ├── stores/        # Pinia 스토어
│       ├── hooks/         # 비즈니스 로직
│       └── api/           # API 호출
├── entities/               # 엔티티 레이어
│   └── published/         # Published 엔티티
├── components/             # 공통 컴포넌트
│   ├── ui/                # 재사용 UI 컴포넌트
│   │   ├── ModernButton.vue
│   │   ├── ModernInput.vue
│   │   ├── ModernCard.vue
│   │   └── MessageBubble.vue
│   └── widgets/           # 비즈니스 위젯
│       ├── ChatMain.vue
│       ├── ChatFooter.vue
│       └── ChatHeader.vue
├── stores/                 # 전역 Pinia 스토어
│   └── _chat.ts           # 채팅 상태 관리
├── constants/              # 상수 정의
│   ├── _models.ts         # AI 모델 옵션
│   ├── _texts.ts          # 정적 텍스트
│   └── _timings.ts        # 타이밍 상수
├── types/                  # TypeScript 타입
│   └── _chat.ts           # 채팅 관련 타입
├── utils/                  # 유틸리티 함수
│   ├── _formatMsg.ts      # 메시지 포맷팅
│   ├── _clipboard.ts      # 클립보드 조작
│   └── _localStorage.ts   # 로컬 스토리지 관리
├── service/                # API 서비스
│   └── _chat.service.ts   # 채팅 API
└── router/                 # Vue Router 설정
```

---

## 💻 핵심 기술 스택

### 프레임워크 & 라이브러리
- **Vue 3** (Composition API + `<script setup>`)
- **TypeScript** (타입 안정성)
- **Vite** (빠른 빌드 및 HMR)
- **Naive UI** (모던 컴포넌트 라이브러리)
- **Pinia** (상태 관리 + Persisted State)
- **Vue Router** (라우팅)

### 유틸리티
- **@tanstack/vue-query** (서버 상태 관리)
- **axios** (HTTP 클라이언트)
- **markdown-it** (마크다운 렌더링)
- **papaparse** (CSV 파싱)
- **jszip** (ZIP 파일 생성)
- **es-toolkit** (유틸리티 함수)

---

## 🎯 개발 가이드라인

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
import { storeToRefs } from 'pinia';
import { useChatStore } from '@/stores/_chat';

const chatStore = useChatStore();
const { messages, isLoading } = storeToRefs(chatStore);
const { handleGenerate } = chatStore;

const handleSubmit = () => {
  handleGenerate();
};
```

### FSD 상태관리 컨벤션
```typescript
// ✅ Vue 컴포넌트: Store에서 직접 state 가져오기
const publishedStore = usePublishedStore();
const { detailModal, editing } = storeToRefs(publishedStore);

// ✅ Hooks: Actions만 제공, state는 파라미터로 받기
export const usePublishedModal = () => {
  const publishedStore = usePublishedStore();

  const saveMemo = (item: FavoriteSearch, tempMemo: string) => {
    PublishedApi.updateMemo(item.id, tempMemo);
    item.memo = tempMemo;
  };

  return { saveMemo }; // actions only
};

// ❌ 금지: hooks에서 state 재export
return { detailModal, editing }; // 금지!
```

### 네이밍 컨벤션
```typescript
// 컴포넌트
ModernButton.vue    // UI 컴포넌트
ChatFooter.vue      // Widget 컴포넌트
BatchPage.vue       // 페이지 컴포넌트

// 함수
const handleGenerate = () => {};    // 이벤트 핸들러
const createMessage = () => {};     // CRUD
const isLoading = ref(false);       // Boolean
const messageList: Message[] = [];  // 배열
```

---

## 🔧 주요 구현 상세

### 1. 배치 원고 생성 (BatchPage.vue)
```typescript
// CSV 파일 업로드 및 파싱
Papa.parse(file, {
  header: true,
  skipEmptyLines: true,
  complete: (results) => {
    results.data.forEach((row: any) => {
      const keyword = row['키워드'] || row['keyword'] || '';
      const refMsg = row['참조원고'] || row['refMsg'] || '';

      if (keyword.trim()) {
        addBatchRequest();
        updateBatchRequest(idx, { keyword, refMsg });
      }
    });
  }
});

// 배치 생성 실행 (순차 처리)
const handleBatchGenerate = async () => {
  for (const [index, req] of batchRequests.value.entries()) {
    batchStatuses.value[index] = 'loading';

    const response = await chatService.generate(req);

    batchStatuses.value[index] = 'success';
  }
};
```

### 2. 실시간 스트리밍 채팅
```typescript
// 스트리밍 응답 처리
const handleGenerate = async () => {
  const loadingMsg: Message = {
    role: 'assistant',
    content: '',
    isLoading: true
  };
  messages.value.push(loadingMsg);

  const response = await chatService.streamGenerate(params);

  // 로딩 메시지를 실제 응답으로 교체
  const loadingIndex = messages.value.findIndex(m => m.isLoading);
  messages.value[loadingIndex] = {
    role: 'assistant',
    content: response,
    isLoading: false
  };
};
```

### 3. 요청 취소 (AbortController)
```typescript
const abortController = ref<AbortController | null>(null);

const handleGenerate = async () => {
  abortController.value = new AbortController();

  try {
    await fetch(url, { signal: abortController.value.signal });
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('요청이 취소되었습니다');
    }
  }
};

const handleCancelGenerate = () => {
  abortController.value?.abort();
};
```

### 4. IME 입력 최적화 (한글 처리)
```typescript
// 한글 입력 중 Enter 방지
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

---

## 🎨 스타일링 가이드

### CSS 클래스 네이밍 (BEM)
```css
/* Block */
.chat-footer { }

/* Element */
.chat-footer__input { }
.chat-footer__button { }

/* Modifier */
.chat-footer__button--primary { }
.chat-footer__button--disabled { }
```

### 글래스모피즘 효과
```css
.glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}
```

### 반응형 디자인 (모바일 우선)
```css
/* 기본 (모바일) */
.container {
  width: 100vw;
  padding: 16px;
}

/* 태블릿 */
@media (min-width: 768px) {
  .container {
    max-width: 90vw;
    padding: 24px;
  }
}

/* 데스크톱 */
@media (min-width: 1024px) {
  .container {
    max-width: 1200px;
    padding: 32px;
  }
}
```

---

## 🐛 디버깅 & 트러블슈팅

### Vue DevTools 활용
- **Components 탭**: 컴포넌트 트리 및 props 확인
- **Pinia 탭**: 상태 변화 추적
- **Network 탭**: API 호출 모니터링

### 로깅 전략
```typescript
// 개발 환경에서만 로그 출력
if (import.meta.env.DEV) {
  console.log('🐛 [DEBUG]', data);
}

// 프로덕션에서는 Sentry 등 사용
if (import.meta.env.PROD) {
  Sentry.captureException(error);
}
```

### 자주 발생하는 문제

#### 1. CSV 업로드 후 데이터가 안 보여요
```typescript
// 컬럼명 확인: '키워드', 'keyword', 'Keyword' 모두 지원
const keyword = row['키워드'] || row['keyword'] || row['Keyword'] || '';
```

#### 2. 한글 입력 중 Enter가 작동 안 해요
```typescript
// IME 조합 중 확인 필수
if (e.isComposing || e.keyCode === 229) return;
```

#### 3. 스트리밍 응답이 끊겨요
```typescript
// AbortController 제대로 관리
onUnmounted(() => {
  abortController.value?.abort();
});
```

---

## 📚 참고 자료

### 공식 문서
- [Vue 3 공식 문서](https://vuejs.org/)
- [Pinia 상태관리](https://pinia.vuejs.org/)
- [Naive UI 컴포넌트](https://www.naiveui.com/)
- [Vite 빌드 도구](https://vitejs.dev/)
- [TypeScript 핸드북](https://www.typescriptlang.org/docs/)

### 아키텍처
- [Feature-Sliced Design](https://feature-sliced.design/)
- [Vue 3 + TypeScript 가이드](https://vuejs.org/guide/typescript/overview.html)

---

## 📦 빌드 & 배포

### TypeScript 설정
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

### Vite 설정
```typescript
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: [{ find: '@', replacement: '/src' }],
  },
  server: {
    host: '0.0.0.0', // 네트워크 접근 허용
    port: 5173
  },
  build: {
    target: 'esnext',
    minify: 'terser'
  }
});
```

### 프로덕션 배포
```bash
# 1. 환경 변수 설정
cp .env.production.example .env.production

# 2. 빌드
pnpm build

# 3. dist/ 폴더를 서버에 배포
# - Nginx, Vercel, Netlify 등 정적 호스팅 서비스 사용
```

---

## 🤝 기여 가이드

### 브랜치 전략
- `main`: 프로덕션 배포 브랜치
- `develop`: 개발 통합 브랜치
- `feature/*`: 기능 개발 브랜치
- `fix/*`: 버그 수정 브랜치

### 커밋 컨벤션
```
feat: 새로운 기능 추가
fix: 버그 수정
refactor: 코드 리팩토링
style: 코드 스타일 정리
docs: 문서 수정
test: 테스트 추가/수정
chore: 기타 변경사항
```

### Pull Request 템플릿
```markdown
## 변경 사항
- [ ] 기능 추가/수정 내용

## 테스트
- [ ] 로컬 테스트 완료
- [ ] 타입 체크 통과 (pnpm typecheck)
- [ ] 빌드 성공 (pnpm build)

## 스크린샷
(선택) UI 변경 시 스크린샷 첨부
```

---

## 📄 라이선스

This project is private and proprietary to 21Lab.

---

## 📞 문의

- **개발팀**: dev@21lab.co.kr
- **버그 리포트**: GitHub Issues
- **기능 제안**: GitHub Discussions

---

**Made with ❤️ by 21Lab Development Team**
