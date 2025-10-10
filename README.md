# 21Lab AI Agent

Vue 3 + TypeScript 기반의 멀티 AI 채팅 및 배치 원고 생성 애플리케이션입니다.

- http://21lab-ai-agent.s3-website.ap-northeast-2.amazonaws.com

## Quick Start

```bash
pnpm install
pnpm dev
```

### Environment Variables

```bash
# .env
VITE_API_URL=http://localhost:3000/api
```

## Features

### Real-time AI Chat

- GPT-4, GPT-5, Solar, Chunk 등 다중 AI 서비스 지원
- 스트리밍 응답 및 요청 취소
- 마크다운 렌더링 (코드 하이라이팅, 수식)

### Batch Content Generation

- CSV 업로드를 통한 최대 20개 원고 동시 생성
- 실시간 진행 상태 표시
- ZIP 파일로 일괄 다운로드

### Favorites & History

- 자주 사용하는 키워드/원고 저장
- 메모 관리 및 서비스별 구분

## Tech Stack

**Core**: Vue 3, TypeScript, Vite, Naive UI
**State Management**: Pinia, @tanstack/vue-query
**Utilities**: axios, markdown-it, papaparse, jszip

## Project Structure

FSD(Feature-Sliced Design) 아키텍처를 따릅니다.

```
src/
├── app/config/           # 전역 설정
├── pages/                # 페이지 컴포넌트
├── features/             # 기능 모듈 (FSD)
├── components/
│   ├── ui/              # 재사용 UI 컴포넌트
│   └── widgets/         # 비즈니스 위젯
├── stores/              # Pinia 상태 관리
├── types/               # TypeScript 타입 정의
└── utils/               # 유틸리티 함수
```

## Development Guide

### Naming Conventions

```typescript
// Components
ModernButton.vue; // UI component
ChatFooter.vue; // Widget component
BatchPage.vue; // Page component

// Functions
handleGenerate(); // Event handler
createMessage(); // CRUD operation
isLoading; // Boolean
messageList; // Array
```

### State Management (FSD)

```typescript
// Vue component: Direct access to store state
const store = usePublishedStore();
const { detailModal } = storeToRefs(store);

// Hooks: Only provide actions
export const usePublishedModal = () => {
  const saveMemo = (item, tempMemo) => {
    /* ... */
  };
  return { saveMemo };
};
```

## Scripts

```bash
pnpm dev         # Start dev server
pnpm build       # Build for production
pnpm typecheck   # Run type checking
pnpm preview     # Preview production build
```

## Documentation

자세한 개발 가이드는 [CLAUDE.md](./CLAUDE.md)를 참고하세요.

**Official Docs**:

- [Vue 3](https://vuejs.org/)
- [Pinia](https://pinia.vuejs.org/)
- [Naive UI](https://www.naiveui.com/)
- [Feature-Sliced Design](https://feature-sliced.design/)

## License

Private and proprietary to 21Lab.
