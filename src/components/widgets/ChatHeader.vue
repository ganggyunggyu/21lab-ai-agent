<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { useChatStore } from '@/stores';
import { useChatActions } from '@/hooks/useChatActions';
import { useLayoutManager } from '@/hooks/useLayoutManager';
import { MODEL_OPTIONS } from '@/constants/_models';
import { useThemeStore } from '@/stores/_theme';

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

const isComposing = ref(false);

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
      class="flex items-center justify-center px-6 py-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-3xl border border-gray-200 dark:border-gray-700/50 shadow-lg dark:shadow-black/50 transition-all"
    >
      <nav
        class="flex items-center gap-5 flex-nowrap whitespace-nowrap w-full justify-between"
        aria-label="채팅 컨트롤"
      >
        <!-- 왼쪽: 검색 -->
        <section
          class="flex items-center gap-2 bg-gradient-to-br from-[#06d6a0]/12 to-[#06d6a0]/8 rounded-[14px] px-3 py-1.5 border border-[#06d6a0]/25 transition-all duration-300 flex-[0_1_auto] max-w-80 relative hover:bg-gradient-to-br hover:from-[#06d6a0]/18 hover:to-[#06d6a0]/12 hover:border-[#06d6a0]/40 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(6,214,160,0.2)] after:absolute after:-right-2.5 after:top-1/2 after:-translate-y-1/2 after:w-px after:h-6 after:bg-gradient-to-b after:from-transparent after:via-black/10 after:to-transparent md:after:hidden"
          aria-label="네이버 검색"
        >
          <Input
            v-model="naverSearchQuery"
            placeholder="검색어..."
            type="text"
            class="w-[180px] min-w-[140px] bg-white/90 rounded-[10px] md:w-[100px] md:min-w-[90px]"
            @keydown="handleSearchKeydown"
            @compositionstart="isComposing = true"
            @compositionend="isComposing = false"
          />
          <Button
            variant="ghost"
            size="sm"
            @click="() => handleDirectNaverSearch()"
            title="네이버 검색 실행 (Enter)"
            class="text-[#06d6a0] font-bold whitespace-nowrap bg-transparent border-none px-2 py-1 hover:bg-[#06d6a0]/15 hover:scale-105"
          >
            검색
          </Button>
        </section>

        <!-- 오른쪽 그룹: 액션 & 설정 -->
        <div class="flex items-center gap-2.5 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            @click="handleBatchPage"
            title="배치 원고 생성"
            class="text-sm px-4 py-2 min-w-0 whitespace-nowrap font-semibold rounded-xl transition-all duration-300 bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20 text-amber-500 hover:-translate-y-0.5 hover:bg-gradient-to-br hover:from-amber-500/15 hover:to-amber-500/8 hover:border-amber-500/30 hover:shadow-[0_8px_24px_rgba(245,158,11,0.15)] md:text-[13px] md:px-3 md:py-1.5"
          >
            배치생성
          </Button>

          <section class="min-w-[110px]" aria-label="AI 모델 선택">
            <Select
              v-model="service"
              :options="MODEL_OPTIONS"
              size="sm"
            />
          </section>

          <Button
            variant="ghost"
            size="sm"
            @click="toggleTheme"
            :title="isDark ? '라이트 모드로 전환' : '다크 모드로 전환'"
            class="w-10 h-10 p-0 flex items-center justify-center rounded-xl transition-all duration-300 bg-white/60 border border-black/8 hover:-translate-y-0.5 hover:bg-white hover:border-indigo-500/20 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] md:w-9 md:h-9"
          >
            <component :is="isDark ? LightIcon : DarkIcon" class="w-[18px] h-[18px]" />
          </Button>

          <Dropdown
            trigger="click"
            :options="menuOptions"
            @select="handleMenuSelect"
          >
            <Button
              variant="ghost"
              size="sm"
              title="더보기 메뉴"
              class="flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 bg-white/60 border border-black/8 hover:bg-white hover:border-indigo-500/20 hover:-translate-y-0.5 hover:rotate-90 hover:shadow-[0_8px_24px_rgba(99,102,241,0.12)] md:w-9 md:h-9"
            >
              <MenuIcon class="w-4 h-4" />
            </Button>
          </Dropdown>
        </div>
      </nav>
    </section>

    <Modal v-model:show="showClearModal" title="초기화 확인">
      <p>채팅 내역을 초기화하시겠습니까?</p>
      <p class="text-slate-500 text-sm mt-2">
        이 작업은 되돌릴 수 없습니다.
      </p>
      <template #footer>
        <div class="flex justify-end gap-2">
          <Button variant="ghost" size="sm" @click="cancelClearChat">
            취소
          </Button>
          <Button
            variant="primary"
            size="sm"
            @click="confirmClearChat"
            class="bg-red-500 hover:bg-red-600 text-white border-red-500"
          >
            초기화
          </Button>
        </div>
      </template>
    </Modal>
  </header>
</template>
