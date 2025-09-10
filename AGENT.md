# 🤖 21Lab AI Agent - 프로젝트 가이드

## 📋 프로젝트 개요
**21Lab AI Agent**는 Vue 3 + TypeScript 기반의 현대적인 AI 채팅 애플리케이션입니다.
다양한 AI 서비스와 연동하여 사용자와의 채팅 인터페이스를 제공합니다.

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

## 🎯 핵심 기능

### 1. 멀티 AI 서비스 지원
- 다양한 AI 모델과 연동 가능한 구조
- 서비스별 설정 및 API 관리

### 2. 실시간 채팅 인터페이스
- 스트리밍 응답 지원
- 메시지 히스토리 관리
- 로딩 상태 및 에러 처리

### 3. 상태 지속성
- localStorage를 통한 채팅 히스토리 저장
- 사용자 설정 유지

### 4. 현대적 UI/UX
- 반응형 디자인
- 다크/라이트 테마 대응 가능
- 모던한 컴포넌트 디자인

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

## 📝 코딩 컨벤션

### 네이밍 규칙
- **변수, 함수**: camelCase
- **배열**: 변수명 끝에 `List`
- **Boolean**: `is` 접두사
- **클래스**: PascalCase
- **상수**: UPPER_SNAKE_CASE

### 함수 네이밍
- 생성: `create` 접두사
- 조회: `get` 접두사
- 수정: `update` 접두사
- 삭제: `remove` 접두사
- 토글: `toggle` 접두사
- 변환: `convert` 접두사
- 이벤트 핸들러: `handle<Event명>`

### Vue 컴포넌트 규칙
- 함수형 컴포넌트는 화살표 함수 사용
- Props에는 반드시 interface 지정
- Fragment는 `<React.Fragment>` 사용 (Vue에서는 template)
- Composition API 우선 사용

### TypeScript 규칙
- `any` 사용 지양
- 명확한 타입 정의 필수
- 제네릭 활용 권장

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

**Created by 케인인님 🤖**  
*"나는! 나는..! 완벽한 문서를 만들었다!!"*