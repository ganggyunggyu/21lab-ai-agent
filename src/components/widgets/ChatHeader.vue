<script setup lang="ts">
import { ref, computed, watch, onMounted, type Ref } from 'vue';
import { storeToRefs } from 'pinia';
import {
  NScrollbar,
  NSelect,
  NModal,
  NCard,
  NSpace,
  NButton,
  NInput,
  NDropdown,
  NIcon,
} from 'naive-ui';

import { useRouter } from 'vue-router';
import { useChatStore } from '@/stores';
import { useChatActions } from '@/hooks/useChatActions';
import { useScrollToBottom } from '@/hooks/useScrollToBottom';
import { useLayoutManager } from '@/hooks/useLayoutManager';
import { MODEL_OPTIONS } from '@/constants/_models';

import { useAutoScroll } from '@/hooks/useAutoScroll';
import ModernButton from '../ui/ModernButton.vue';
import { ChatService } from '@/types';
import { ChevronDown as MenuIcon } from '@vicons/ionicons5';

const chatStore = useChatStore();

const { messages, service } = storeToRefs(chatStore);

const { updateService, clearChat, exportChat } = chatStore;

const { downloadChatHistory } = useChatActions();

const scrollbarRef: Ref<InstanceType<typeof NScrollbar> | null> = ref(null);
const { scrollToLast } = useAutoScroll({
  containerRef: scrollbarRef,
  lastItemRef: ref(null),
});

const { hardScrollToBottom } = useScrollToBottom(scrollbarRef);

const router = useRouter();

const { headerRef } = useLayoutManager();

const showClearModal = ref(false);
const naverSearchQuery = ref('');

// IME(한글 조합) 중 Enter 제출 방지용 플래그
const isComposing = ref(false);

// 드롭다운 메뉴 옵션
const menuOptions = computed(() => [
  {
    label: '이전 버전 사용',
    key: 'prev-version',
  },
  {
    type: 'divider' as const,
    key: 'd1',
  },
  {
    label: '채팅 초기화',
    key: 'clear-chat',
    disabled: messages.value.length <= 1,
  },
  {
    label: '채팅 내보내기',
    key: 'export-chat',
    disabled: messages.value.length <= 1,
  },
]);

const handleChatHistoryDownload = () => {
  downloadChatHistory(exportChat);
};

const handlePrevChat = () => {
  router.push('/prev');
};

const handleClearChat = () => {
  showClearModal.value = true;
};

const handlePublishedList = () => {
  router.push('/published');
};

const handleNaverSearch = () => {
  window.open('https://naver-search-app-xu8w.vercel.app/', '_blank');
};

const handleDirectNaverSearch = (query?: string) => {
  const searchTerm = query || naverSearchQuery.value.trim();
  if (!searchTerm) {
    // 검색어가 없으면 기본 네이버 검색 앱으로 이동
    handleNaverSearch();
    return;
  }

  const encodedQuery = encodeURIComponent(searchTerm);
  window.open(
    `https://naver-search-app-xu8w.vercel.app/${encodedQuery}`,
    '_blank'
  );
  naverSearchQuery.value = ''; // 검색 후 인풋 초기화
};

// Enter 키 처리 함수 (IME 조합 중에는 무시)
const handleSearchKeydown = (e: KeyboardEvent) => {
  if (e.isComposing || (e as unknown as { keyCode?: number }).keyCode === 229) {
    return;
  }

  if (e.key === 'Enter') {
    e.preventDefault();
    handleDirectNaverSearch();
  }
};

const confirmClearChat = () => {
  clearChat();
  showClearModal.value = false;
};

const cancelClearChat = () => {
  showClearModal.value = false;
};

// 드롭다운 메뉴 선택 핸들러
const handleMenuSelect = (key: string) => {
  switch (key) {
    case 'prev-version':
      handlePrevChat();
      break;
    case 'clear-chat':
      handleClearChat();
      break;
    case 'export-chat':
      handleChatHistoryDownload();
      break;
  }
};

watch(service, (newService) => {
  updateService(newService as ChatService);
});

onMounted(async () => {
  scrollToLast();
  hardScrollToBottom(false);
});
</script>

<template>
  <header class="floating-header" ref="headerRef">
    <section class="header-content">
      <nav class="header-navigation" aria-label="채팅 컨트롤">
        <section class="model-selector" aria-label="AI 모델 선택">
          <n-select
            v-model:value="service"
            :options="MODEL_OPTIONS"
            size="small"
            :consistent-menu-width="false"
            aria-label="AI 서비스 선택"
          />
        </section>

        <ModernButton
          variant="ghost"
          size="sm"
          @click="handlePublishedList"
          title="발행원고 목록 보기"
          class="published-button compact-button"
          aria-label="발행원고 목록으로 이동"
        >
          발행원고
        </ModernButton>

        <section class="naver-search-group" aria-label="네이버 검색">
          <n-input
            v-model:value="naverSearchQuery"
            placeholder="검색어..."
            size="small"
            class="search-input"
            @keydown="handleSearchKeydown"
            @compositionstart="isComposing = true"
            @compositionend="isComposing = false"
            aria-label="네이버 검색 입력"
            clearable
          />
          <ModernButton
            variant="ghost"
            size="sm"
            @click="() => handleDirectNaverSearch()"
            title="네이버 검색 실행 (Enter)"
            class="naver-search-button compact-button"
            aria-label="네이버 검색 실행"
          >
            검색
          </ModernButton>
        </section>

        <n-dropdown
          trigger="click"
          :options="menuOptions"
          @select="handleMenuSelect"
        >
          <ModernButton
            variant="ghost"
            size="sm"
            title="더보기 메뉴"
            class="compact-button menu-button"
            aria-label="메뉴 열기"
            aria-haspopup="menu"
          >
            <n-icon size="16" aria-hidden="true">
              <MenuIcon />
            </n-icon>
          </ModernButton>
        </n-dropdown>
      </nav>
    </section>

    <n-modal v-model:show="showClearModal">
      <n-card
        style="width: 400px"
        title="초기화 확인"
        :bordered="false"
        size="huge"
        role="dialog"
        aria-modal="true"
      >
        <template #header-extra> </template>
        <p>채팅 내역을 초기화하시겠습니까?</p>
        <p style="color: #999; font-size: 14px; margin-top: 8px">
          이 작업은 되돌릴 수 없습니다.
        </p>
        <template #footer>
          <n-space justify="end">
            <n-button @click="cancelClearChat"> 취소 </n-button>
            <n-button type="error" @click="confirmClearChat"> 초기화 </n-button>
          </n-space>
        </template>
      </n-card>
    </n-modal>
  </header>
</template>
<style lang="css" scoped>
.floating-header {
  position: fixed;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  width: 100vw;
  max-width: 90vw;

  /* 작은 화면에서 100vw */
  @media (max-width: 768px) {
    width: 100vw;
    max-width: calc(100vw - 32px);
  }
}
.header-content {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(25px) saturate(180%);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06),
    0 1px 0 rgba(255, 255, 255, 0.8) inset, 0 -1px 0 rgba(0, 0, 0, 0.05) inset;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}
.header-navigation {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: nowrap;
  white-space: nowrap;
}
.header-content::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(
    circle,
    rgba(99, 102, 241, 0.03) 0%,
    transparent 70%
  );
  animation: liquidBubble 15s ease-in-out infinite;
  pointer-events: none;
}
.header-content:hover {
  transform: translateY(-2px) scale(1.01);
  box-shadow: 0 16px 64px rgba(0, 0, 0, 0.1),
    0 1px 0 rgba(255, 255, 255, 0.9) inset;
}

.compact-button {
  font-size: 13px;
  padding: 4px 8px;
  min-width: auto;
  white-space: nowrap;
  word-break: keep-all;
  font-feature-settings: 'kern' 1;
  -webkit-font-smoothing: antialiased;
}

.published-button {
  color: #10b981;
  font-weight: 600;
  position: absolute;
  left: 20px;
}

.naver-search-group {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(6, 214, 160, 0.1);
  border-radius: 10px;
  padding: 3px 6px;
  border: 1px solid rgba(6, 214, 160, 0.2);
  transition: all 0.2s ease;
}

.naver-search-group:hover {
  background: rgba(6, 214, 160, 0.15);
  border-color: rgba(6, 214, 160, 0.3);
}

.search-input {
  width: 100px;
  min-width: 80px;
}

.naver-search-button {
  color: #06d6a0;
  font-weight: 600;
  white-space: nowrap;
  word-break: keep-all;
}

.model-selector {
  position: absolute;
  right: 60px;
  min-width: 80px;
}

.menu-button {
  position: absolute;
  right: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.menu-button:hover {
  background: rgba(0, 0, 0, 0.05);
}

@media (max-width: 768px) {
  .header-navigation {
    gap: 6px;
  }

  .search-input {
    width: 80px;
    min-width: 70px;
  }

  .naver-search-group {
    padding: 2px 4px;
    gap: 4px;
  }

  .compact-button {
    font-size: 12px;
    padding: 3px 6px;
  }
}
</style>
