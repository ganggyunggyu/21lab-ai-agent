# 21Lab AI Agent — AGENTS.md (for Agents)

목적: 이 문서는 에이전트가 본 저장소(Vue 3 + TypeScript + Vite)에서 작업할 때 반드시 지켜야 할 코딩 규칙과 구조, 작업 절차를 정의한다. 사람용 가이드(AGENT.md)와 달리, 여기는 에이전트 실행 규약에 초점을 둔다.

## 범위
- 이 파일이 위치한 디렉터리 트리 전체에 적용된다.
- 여기 적힌 규칙은 사용자 지침의 우선순위를 따른다. 충돌 시 사용자/시스템/개발자 지침이 우선이다.

## 기술 스택 인식
- UI: Vue 3 (Composition API) + TypeScript
- 번들러: Vite
- 상태: Pinia (+ pinia-plugin-persistedstate), @tanstack/vue-query
- 라우팅: vue-router 4
- UI: Naive UI, @vicons/ionicons5
- 유틸: axios, markdown-it, es-toolkit

## 디렉터리 구조 규칙 (FSD 지향)
- `src/app/`: 앱 전역 설정 (예: `config/`, env, axios 인스턴스 등)
- `src/entities/`: 핵심 도메인 모델(필요 시). 현재는 `types/`, `constants/`가 역할 수행.
- `src/features/`: 단일 책임 기능 단위(필요 시). 현재는 `components/widgets`, `stores`, `service`가 담당.
- `src/views/`: 라우팅 페이지(SFC). 현재는 `src/router/*.vue`에 존재.
- `src/shared/`: 재사용 유틸/컴포저블/상수. 현재는 `utils/`, `hooks/`, `constants/`가 해당.

기존 폴더를 존중한다. 리팩터링은 요구될 때만 최소 변경으로 수행한다. 이 레포는 내부 전용/비공개 유틸 파일에 `_` 접두어를 널리 사용하므로, 신규 내부 전용 파일에도 동일 패턴을 유지한다(예: `_upload.service.ts`).

## 네이밍 규칙 (반드시 준수)
- 변수·함수: camelCase (예: `messageList`, `createMessage`)
- 배열: 이름 끝에 `List` (예: `fileList`)
- 불리언: `is` 접두사 (예: `isLoading`)
- 클래스: PascalCase
- 상수: UPPER_SNAKE_CASE (예: `DEFAULT_PAGE_SIZE`)
- 객체: “변수 객체”와 “상수 객체” 구분. 상수 객체는 `as const` 활용.
- CRUD 함수: `create`, `get`, `update`, `remove` 접두사
- 토글 함수: `toggle` 접두사
- 변환 함수: `convert` 접두사
- 배열 처리: `filter`, `find`, `convert` 등의 접두사 활용
- 이벤트 핸들러: `handle<Event명>` (예: `handleSubmit`)
- 매직 넘버 금지: 의미 있는 상수로 분리 후 사용

## Vue 규칙 (이 프로젝트의 기본)
- SFC는 `<script setup lang="ts">` 우선. 명시적 인터페이스로 Props 정의.
- 컴포저블(훅)은 `use` 접두사(예: `useAutoScroll`).
- 컴포넌트 파일명: PascalCase, 내부 전용은 필요 시 `_` 접두사 허용.
- 이벤트 핸들러는 `handle<Event>` 형태로 메서드/함수 분리.
- 상태는 Pinia 스토어로 전역, 로컬 상태는 컴포넌트 내부로 최소화.
- 외부 IO(HTTP)는 `src/service/`로 분리, axios 인스턴스 재사용.

## React / NestJS (향후 추가 시)
- React: 함수형 컴포넌트 화살표 함수, Props에 interface 지정, Fragment는 `<React.Fragment>` 사용, 훅은 `use` 접두사.
- NestJS: 컨트롤러에 Swagger 설정 포함, DTO 필수, `any` 지양(명확 타입/제네릭), 중복 로직은 서비스/헬퍼로 추출.

## TypeScript 규칙
- `any` 지양. 필요한 경우 좁힌 유니온/제네릭/타입 가드 사용.
- API 응답/요청 DTO 타입 명확화(예: `UploadRequestDto`, `ChatMessageDto`).
- 유틸/상수에 `as const` 적극 활용.
- strict 옵션 전제(로컬 tsconfig 준수). 암시적 any/this 금지.

## 서비스 계층(axios) 규칙
- 인스턴스: `src/app/config/_axios.instancce.ts`의 인스턴스를 재사용한다(파일명 오탈자 존재하지만, 범위 밖 리네임 금지).
- 서비스 함수 네이밍은 CRUD 접두사를 따른다.
- 입력/출력 타입을 DTO로 명확히 선언한다.

예시 (TypeScript + Vue 환경):

```ts
// src/service/_chat.service.ts (발췌 예시)
export interface ChatMessageDto {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
}

export interface CreateMessageDto {
  content: string;
}

export const createMessage = async (payload: CreateMessageDto): Promise<ChatMessageDto> => {
  const res = await axiosInstance.post<ChatMessageDto>('/chat/messages', payload);
  return res.data;
};

export const getMessageList = async (): Promise<ChatMessageDto[]> => {
  const res = await axiosInstance.get<ChatMessageDto[]>('/chat/messages');
  return res.data;
};
```

## Pinia 스토어 규칙
- 스토어는 단일 책임으로 쪼갠다(`_chat.ts` 등). 지속성은 플러그인으로 처리.
- 액션 네이밍은 위 접두사 규칙을 따른다.

예시:
```ts
// src/stores/_chat.ts (간단 예시)
import { defineStore } from 'pinia';

export interface ChatState {
  messageList: string[];
  isLoading: boolean;
}

export const useChatStore = defineStore('chat', {
  state: (): ChatState => ({
    messageList: [],
    isLoading: false,
  }),
  actions: {
    setMessageList(messageList: string[]) {
      this.messageList = messageList;
    },
    toggleLoading(is?: boolean) {
      this.isLoading = typeof is === 'boolean' ? is : !this.isLoading;
    },
  },
});
```

## 컴포넌트/컴포저블 예시

```vue
<!-- src/components/ui/ModernBadge.vue -->
<script setup lang="ts">
interface ModernBadgeProps {
  text: string;
  isPrimary?: boolean;
}

const props = defineProps<ModernBadgeProps>();
</script>

<template>
  <span :class="['badge', props.isPrimary ? 'badge--primary' : 'badge--default']">
    {{ props.text }}
  </span>
  <!-- Vue는 Fragment 대신 루트 엘리먼트(template) 사용 -->
  <!-- React 도입 시엔 <React.Fragment> 강제 (see above) -->
</template>

<style scoped>
.badge { padding: 2px 8px; border-radius: 6px; }
.badge--primary { background: #3b82f6; color: white; }
.badge--default { background: #e5e7eb; color: #111827; }
</style>
```

```ts
// src/hooks/useCountdown.ts
import { ref, onMounted, onBeforeUnmount } from 'vue';

export const useCountdown = (seconds: number) => {
  const remaining = ref(seconds);
  let timer: number | undefined;

  const start = () => {
    if (timer) return;
    timer = window.setInterval(() => {
      remaining.value = Math.max(0, remaining.value - 1);
      if (remaining.value === 0) stop();
    }, 1000);
  };

  const stop = () => {
    if (timer) {
      clearInterval(timer);
      timer = undefined;
    }
  };

  onMounted(start);
  onBeforeUnmount(stop);

  return { remaining, start, stop };
};
```

## 상수/유틸 규칙
- 상수는 도메인별 파일로 분리(`constants/_texts.ts`, `_regex.ts` 등)하고 UPPER_SNAKE_CASE.
- 유틸은 순수 함수로 작성하고 사이드 이펙트 금지. 변환 함수는 `convert*` 접두사 사용.

예시:
```ts
// src/utils/convertArray.ts
export const convertToIdList = <T extends { id: string }>(sourceList: T[]): string[] =>
  sourceList.map((item) => item.id);
```

## 환경 변수
- `src/app/config/_env.ts`를 통해 주입. 타입 세이프하게 파싱한다(누락/형 불일치 시 기본값 제공).

## 품질/포맷팅
- ESLint/Prettier 스타일 준수(프로젝트 설정에 맞춤). 임의 포맷 도입 금지.
- 임포트 정렬 및 사용되지 않는 심볼 제거.
- 타입체크 통과 필수: `yarn typecheck`

## 작업 절차 (에이전트)
1) 변경 범위 최소화: 요구사항 외 파일/리팩터링 금지.
2) 계획 수립: `update_plan` 사용해 단계 공개.
3) 탐색은 `rg`, 변경은 `apply_patch` 사용. 큰 파일은 청크로 열람.
4) 구현 후 자체 검증: 타입체크/빌드 명령 제안. 필요 시만 실행 요청.
5) 설명은 간결하게: 핵심만, 불필요한 주석/수식어 금지.

## 검증 명령
- 개발: `yarn dev`
- 빌드: `yarn build`
- 타입체크: `yarn typecheck` (package.json에 존재)

## 금지 사항
- 불필요한 라이브러리 추가, 대규모 리팩터링, 무관한 파일 포맷 변경.
- `any` 남용, 매직 넘버, 전역 네임스페이스 오염.

