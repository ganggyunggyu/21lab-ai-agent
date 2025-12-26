# 21Lab AI Agent

Vue 3 + TypeScript 기반의 멀티 AI 채팅 및 블로그 자동화 애플리케이션입니다.

- **Web App**: http://21lab-ai-agent.s3-website.ap-northeast-2.amazonaws.com
- **Chrome Extension**: 네이버 블로그 자동화 도구

## Quick Start

```bash
pnpm install
pnpm dev
```

### Environment Variables

```bash
# .env
VITE_API_URL=http://localhost:8000
```

## Features

### Real-time AI Chat

- GPT-4, GPT-5, Gemini, Grok, DeepSeek 등 다중 AI 서비스 지원
- 스트리밍 응답 및 요청 취소
- 마크다운 렌더링 (코드 하이라이팅)

### Batch Content Generation

- CSV 업로드를 통한 최대 20개 원고 동시 생성
- 실시간 진행 상태 표시
- ZIP 파일로 일괄 다운로드

### Bot Automation (Bot Page)

- 네이버 블로그 자동 로그인
- 폴더 드래그앤드롭으로 원고 업로드 (ZIP 압축)
- AI 원고 자동생성 + 발행
- 예약 발행 설정

### Chrome Extension

- 네이버 블로그 사이드패널
- 원고 생성 및 복사
- 글자수 세기

### Favorites & History

- 자주 사용하는 키워드/원고 저장
- 메모 관리 및 서비스별 구분

## Tech Stack

| Category | Technologies |
|----------|-------------|
| **Core** | Vue 3.5+, TypeScript 5.8+, Vite 7.0+ |
| **Styling** | Tailwind CSS 4.1+, Naive UI |
| **State** | Pinia 3.0+, TanStack Vue Query |
| **Utilities** | axios, markdown-it, jszip, papaparse |
| **Extension** | Chrome Extension Manifest V3, CRXJS |

## Project Structure

FSD(Feature-Sliced Design) 아키텍처를 따릅니다.

```
src/
├── app/config/           # 전역 설정 (axios, env)
├── pages/                # 페이지 컴포넌트
│   ├── ChatPage.vue      # AI 채팅
│   ├── BatchPage.vue     # 배치 생성
│   ├── BotPage.vue       # 자동화 봇
│   └── SearchPage.vue    # 검색
├── features/             # 기능 모듈 (FSD)
│   ├── bot/              # 봇 자동화 기능
│   └── published/        # 발행 관리
├── components/
│   ├── ui/               # 재사용 UI 컴포넌트
│   └── widgets/          # 비즈니스 위젯
├── stores/               # Pinia 상태 관리
├── types/                # TypeScript 타입 정의
└── utils/                # 유틸리티 함수

extension/
├── manifest.ts           # Chrome Extension 매니페스트
├── service_worker.ts     # 백그라운드 스크립트
├── content_script.ts     # 콘텐츠 스크립트
└── sidepanel.html        # 사이드패널 엔트리
```

## Scripts

### Web Application

```bash
pnpm dev         # 개발 서버 실행
pnpm build       # 프로덕션 빌드 (타입체크 포함)
pnpm typecheck   # 타입 체크만 실행
pnpm preview     # 빌드 결과 프리뷰
```

### Chrome Extension

```bash
pnpm ext:dev     # Extension 개발 모드
pnpm ext:build   # Extension 빌드
pnpm ext:zip     # Extension ZIP 패키징
```

### Extension 설치 방법

1. `pnpm ext:build` 실행
2. Chrome에서 `chrome://extensions` 접속
3. "개발자 모드" 활성화
4. "압축해제된 확장 프로그램을 로드합니다" 클릭
5. `dist-extension` 폴더 선택

## Development Guide

### Naming Conventions

```typescript
// Components
Button.vue           // UI component
ChatFooter.vue       // Widget component
BatchPage.vue        // Page component

// Functions
handleGenerate()     // Event handler
createMessage()      // CRUD operation
isLoading            // Boolean
messageList          // Array
```

### State Management (FSD)

```typescript
// Vue component: Direct access to store state
const store = useBotStore();
const { logs, isUploading } = storeToRefs(store);

// Hooks: Only provide actions
export const useFolderUpload = () => {
  const handleUploadFolders = async () => { /* ... */ };
  return { handleUploadFolders };
};
```

### Barrel Export Pattern

모든 디렉토리에서 `index.ts`를 통해 export합니다.

```typescript
// Good
import { Button, Card } from '@/components/ui';
import { useBotStore, useBotLog } from '@/features/bot';

// Bad - direct file import
import Button from '@/components/ui/Button.vue';
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
