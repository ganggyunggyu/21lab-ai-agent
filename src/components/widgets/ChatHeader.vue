<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { useChatStore, useThemeStore } from '@/stores';
import { useChatActions } from '@/hooks/useChatActions';
import { useLayoutManager } from '@/hooks/useLayoutManager';
import { MODEL_OPTIONS } from '@/constants';

import { Button, Select, Input, Dropdown, Modal } from '@/components/ui';
import type { ChatService } from '@/types';
import {
  ChevronDown as MenuIcon,
  Sunny as LightIcon,
  Moon as DarkIcon,
} from '@vicons/ionicons5';

const chatStore = useChatStore();

const { messages, service } = storeToRefs(chatStore);

const { updateService, clearChat, exportChat } = chatStore;

const { downloadChatHistory } = useChatActions();

const router = useRouter();

const { headerRef } = useLayoutManager();

const themeStore = useThemeStore();
const { isDark } = storeToRefs(themeStore);
const { toggleTheme } = themeStore;

const showClearModal = ref(false);
const naverSearchQuery = ref('');

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

const handleBatchPage = () => {
  router.push('/batch');
};

const handleSearchPage = () => {
  router.push('/search');
};

const handleNaverSearch = () => {
  window.open('https://naver-search-app-xu8w.vercel.app/', '_blank');
};

const handleDirectNaverSearch = (query?: string) => {
  const searchTerm = query || naverSearchQuery.value.trim();
  if (!searchTerm) {
    handleNaverSearch();
    return;
  }

  const encodedQuery = encodeURIComponent(searchTerm);
  window.open(
    `https://naver-search-app-xu8w.vercel.app/${encodedQuery}`,
    '_blank'
  );
  naverSearchQuery.value = '';
};

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
</script>

<template>
  <header
    ref="headerRef"
    class="fixed top-5 left-1/2 -translate-x-1/2 z-100 w-screen max-w-[90vw] md:max-w-[calc(100vw-32px)] md:top-3"
  >
    <section
      class="flex items-center justify-center px-6 py-3 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg dark:shadow-black/30 transition-colors duration-200"
    >
      <nav
        class="flex items-center gap-5 flex-nowrap whitespace-nowrap w-full justify-between"
        aria-label="채팅 컨트롤"
      >
        <!-- 왼쪽: 검색 -->
        <section
          class="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-1.5 border border-gray-200 dark:border-gray-700 transition-colors duration-200 flex-[0_1_auto] max-w-80"
          aria-label="네이버 검색"
        >
          <Input
            v-model="naverSearchQuery"
            placeholder="검색어..."
            type="text"
            class="w-[180px] min-w-[140px] !border-0 !bg-transparent !shadow-none !ring-0 md:w-[100px] md:min-w-[90px]"
            @keydown="handleSearchKeydown"
          />
          <Button
            color="primary"
            variant="weak"
            size="sm"
            @click="() => handleDirectNaverSearch()"
            title="네이버 검색 실행 (Enter)"
            class="font-semibold whitespace-nowrap"
          >
            검색
          </Button>
        </section>

        <!-- 오른쪽 그룹: 액션 & 설정 -->
        <div class="flex items-center gap-2.5 shrink-0">
          <Button
            color="light"
            size="sm"
            @click="handleSearchPage"
            title="원고 검색"
            class="text-sm whitespace-nowrap font-semibold md:text-[13px]"
          >
            원고검색
          </Button>

          <Button
            color="light"
            size="sm"
            @click="handleBatchPage"
            title="배치 원고 생성"
            class="text-sm whitespace-nowrap font-semibold md:text-[13px]"
          >
            배치생성
          </Button>

          <section class="min-w-[150px]" aria-label="AI 모델 선택">
            <Select
              v-model="service"
              :options="MODEL_OPTIONS"
              size="sm"
            />
          </section>

          <Button
            color="light"
            variant="weak"
            size="sm"
            @click="toggleTheme"
            :title="isDark ? '라이트 모드로 전환' : '다크 모드로 전환'"
            icon-only
            class="w-10 h-10 md:w-9 md:h-9"
          >
            <component :is="isDark ? LightIcon : DarkIcon" class="w-[18px] h-[18px]" />
          </Button>

          <Dropdown
            trigger="click"
            :options="menuOptions"
            @select="handleMenuSelect"
          >
            <Button
              color="light"
              variant="weak"
              size="sm"
              title="더보기 메뉴"
              icon-only
              class="w-10 h-10 md:w-9 md:h-9"
            >
              <MenuIcon class="w-4 h-4" />
            </Button>
          </Dropdown>
        </div>
      </nav>
    </section>

    <Modal v-model:show="showClearModal" title="초기화 확인">
      <p>채팅 내역을 초기화하시겠습니까?</p>
      <p class="text-[var(--color-text-tertiary)] text-sm mt-2">
        이 작업은 되돌릴 수 없습니다.
      </p>
      <template #footer>
        <Button color="light" variant="weak" size="sm" @click="cancelClearChat">
          취소
        </Button>
        <Button color="danger" size="sm" @click="confirmClearChat">
          초기화
        </Button>
      </template>
    </Modal>
  </header>
</template>
