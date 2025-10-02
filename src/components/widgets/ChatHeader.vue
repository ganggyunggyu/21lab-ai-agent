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
import {
  ChevronDown as MenuIcon,
  Checkmark as SelectIcon,
  Close as CancelIcon,
  Download as DownloadIcon,
  CheckmarkCircle as SelectAllIcon,
} from '@vicons/ionicons5';

const chatStore = useChatStore();

const {
  messages,
  service,
  isSelectionMode,
  selectedMessageIds,
  selectedMessagesCount,
  selectableMessagesCount,
  hasSelectedMessages,
} = storeToRefs(chatStore);

const {
  updateService,
  clearChat,
  exportChat,
  toggleSelectionMode,
  selectAllMessages,
  clearSelection,
  exportSelectedMessages,
} = chatStore;

const { downloadChatHistory, downloadZipFiles } = useChatActions();

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

const handlePublishedList = () => {
  router.push('/published');
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

// 선택 모드 관련
const totalSelectable = computed(() => selectableMessagesCount.value);
const isAllSelected = computed(
  () =>
    totalSelectable.value > 0 &&
    selectedMessageIds.value.size === totalSelectable.value
);

const handleToggleSelectAll = () => {
  if (isAllSelected.value) {
    clearSelection();
  } else {
    selectAllMessages();
  }
};

const handleDownloadSelected = async () => {
  if (!hasSelectedMessages.value) return;

  const packages = exportSelectedMessages();
  if (packages.length === 0) return;

  const files = packages.map((pkg: any) => {
    const resultBody = pkg.responses.length
      ? pkg.responses.map((r: any) => r.content).join('\n\n---\n\n')
      : '결과가 생성되지 않았습니다.';

    const resultLength = resultBody.replace(/\s+/g, '').length;
    const safeKeyword = (pkg.userMessage.keyword || 'message').replace(/[^\w가-힣]/g, '_');
    const fileName = `${safeKeyword}_${resultLength}.txt`;

    return { fileName, content: resultBody };
  });

  const timestamp = new Date().toISOString().slice(0, 16).replace(/:/g, '-');
  await downloadZipFiles(files, `selected-results-${timestamp}`);

  toggleSelectionMode();
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
        <!-- 선택 모드일 때 -->
        <div v-if="isSelectionMode" class="selection-toolbar-inline">
          <div class="selection-info">
            <span class="selection-count">{{ selectedMessagesCount }}개 선택</span>
          </div>

          <div class="selection-actions">
            <ModernButton
              variant="ghost"
              size="sm"
              :icon="SelectAllIcon"
              @click="handleToggleSelectAll"
              class="action-btn"
              :disabled="totalSelectable === 0"
            >
              {{ isAllSelected ? '전체해제' : '전체선택' }}
            </ModernButton>

            <ModernButton
              variant="primary"
              size="sm"
              :icon="DownloadIcon"
              @click="handleDownloadSelected"
              :disabled="!hasSelectedMessages"
              class="action-btn download-btn"
            >
              다운로드
            </ModernButton>

            <ModernButton
              variant="ghost"
              size="sm"
              :icon="CancelIcon"
              @click="toggleSelectionMode"
              class="action-btn cancel-btn"
            >
              취소
            </ModernButton>
          </div>
        </div>

        <!-- 일반 모드 -->
        <template v-else>
          <!-- 왼쪽 그룹: 주요 액션 -->
          <div class="header-left-group">
            <ModernButton
              variant="ghost"
              size="sm"
              @click="handlePublishedList"
              title="발행원고 목록 보기"
              class="published-button compact-button"
            >
              발행원고
            </ModernButton>

            <ModernButton
              variant="ghost"
              size="sm"
              @click="handleBatchPage"
              title="배치 원고 생성"
              class="batch-button compact-button"
            >
              배치생성
            </ModernButton>

            <ModernButton
              variant="ghost"
              size="sm"
              :icon="SelectIcon"
              @click="toggleSelectionMode"
              class="compact-button select-mode-btn"
              title="메시지 선택 모드"
            >
              메시지선택
            </ModernButton>
          </div>

          <!-- 중앙: 검색 -->
          <section class="naver-search-group" aria-label="네이버 검색">
            <n-input
              v-model:value="naverSearchQuery"
              placeholder="검색어..."
              size="small"
              class="search-input"
              @keydown="handleSearchKeydown"
              @compositionstart="isComposing = true"
              @compositionend="isComposing = false"
              clearable
            />
            <ModernButton
              variant="ghost"
              size="sm"
              @click="() => handleDirectNaverSearch()"
              title="네이버 검색 실행 (Enter)"
              class="naver-search-button compact-button"
            >
              검색
            </ModernButton>
          </section>

          <!-- 오른쪽 그룹: 설정 -->
          <div class="header-right-group">
            <section class="model-selector" aria-label="AI 모델 선택">
              <n-select
                v-model:value="service"
                :options="MODEL_OPTIONS"
                size="small"
                :consistent-menu-width="false"
              />
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
              >
                <n-icon size="16">
                  <MenuIcon />
                </n-icon>
              </ModernButton>
            </n-dropdown>
          </div>
        </template>
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
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  width: 100vw;
  max-width: 90vw;

  @media (max-width: 768px) {
    width: 100vw;
    max-width: calc(100vw - 32px);
    top: 12px;
  }
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.95),
    rgba(248, 250, 252, 0.9)
  );
  backdrop-filter: blur(30px) saturate(200%);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.08),
    0 2px 0 rgba(255, 255, 255, 0.9) inset,
    0 -2px 0 rgba(0, 0, 0, 0.03) inset;
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  position: relative;
  overflow: hidden;
}

.header-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(99, 102, 241, 0.08),
    transparent
  );
  transition: left 0.6s ease;
}

.header-content:hover::before {
  left: 100%;
}

.header-content:hover {
  transform: translateY(-3px);
  box-shadow: 0 20px 64px rgba(99, 102, 241, 0.12),
    0 2px 0 rgba(255, 255, 255, 1) inset;
  border-color: rgba(99, 102, 241, 0.2);
}

.header-navigation {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: nowrap;
  white-space: nowrap;
  width: 100%;
  justify-content: space-between;
}

/* 그룹 레이아웃 */
.header-left-group,
.header-right-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-left-group {
  flex-shrink: 0;
}

.header-right-group {
  flex-shrink: 0;
}

.compact-button {
  font-size: 14px;
  padding: 8px 16px;
  min-width: auto;
  white-space: nowrap;
  word-break: keep-all;
  font-weight: 600;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.compact-button:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 1);
  border-color: rgba(99, 102, 241, 0.2);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.published-button {
  color: #10b981;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05));
  border-color: rgba(16, 185, 129, 0.2);
}

.published-button:hover {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.08));
  border-color: rgba(16, 185, 129, 0.3);
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.15);
}

.batch-button {
  color: #f59e0b;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.05));
  border-color: rgba(245, 158, 11, 0.2);
}

.batch-button:hover {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(245, 158, 11, 0.08));
  border-color: rgba(245, 158, 11, 0.3);
  box-shadow: 0 8px 24px rgba(245, 158, 11, 0.15);
}

.naver-search-group {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, rgba(6, 214, 160, 0.12), rgba(6, 214, 160, 0.08));
  border-radius: 14px;
  padding: 6px 12px;
  border: 1px solid rgba(6, 214, 160, 0.25);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex: 0 1 auto;
  max-width: 320px;
}

.naver-search-group:hover {
  background: linear-gradient(135deg, rgba(6, 214, 160, 0.18), rgba(6, 214, 160, 0.12));
  border-color: rgba(6, 214, 160, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(6, 214, 160, 0.2);
}

.search-input {
  width: 180px;
  min-width: 140px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 10px;
}

.search-input :deep(.n-input__input) {
  font-size: 14px;
}

.naver-search-button {
  color: #06d6a0;
  font-weight: 700;
  white-space: nowrap;
  word-break: keep-all;
  background: transparent;
  border: none;
  padding: 4px 8px;
}

.naver-search-button:hover {
  background: rgba(6, 214, 160, 0.15);
  transform: scale(1.05);
}

.model-selector {
  min-width: 110px;
}

.model-selector :deep(.n-base-selection) {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.9));
  border-radius: 12px;
  border: 1px solid rgba(99, 102, 241, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.08);
}

.model-selector :deep(.n-base-selection:hover) {
  border-color: rgba(99, 102, 241, 0.4);
  background: linear-gradient(135deg, rgba(255, 255, 255, 1), rgba(248, 250, 252, 0.95));
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
}

.model-selector :deep(.n-base-selection-label) {
  font-weight: 600;
  font-size: 14px;
}

.menu-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.menu-button:hover {
  background: rgba(255, 255, 255, 1);
  border-color: rgba(99, 102, 241, 0.2);
  transform: translateY(-2px) rotate(90deg);
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.12);
}

/* 선택 모드 인라인 스타일 */
.selection-toolbar-inline {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  justify-content: space-between;
}

.selection-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.selection-count {
  font-size: 14px;
  font-weight: 700;
  color: #6366f1;
  padding: 6px 14px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(99, 102, 241, 0.1));
  border-radius: 10px;
  border: 1px solid rgba(99, 102, 241, 0.3);
}

.selection-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.action-btn {
  font-size: 14px !important;
  font-weight: 600 !important;
  padding: 8px 16px !important;
  border-radius: 10px !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.download-btn {
  background: linear-gradient(135deg, #6366f1, #8b5cf6) !important;
  color: white !important;
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.25) !important;
}

.download-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #4f46e5, #7c3aed) !important;
  transform: translateY(-2px) !important;
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.35) !important;
}

.cancel-btn:hover {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.12), rgba(239, 68, 68, 0.08)) !important;
  color: #ef4444 !important;
  border-color: rgba(239, 68, 68, 0.3) !important;
  transform: translateY(-2px) !important;
}

.select-mode-btn {
  background: rgba(99, 102, 241, 0.08) !important;
  color: #6366f1 !important;
  border-color: rgba(99, 102, 241, 0.2) !important;
}

.select-mode-btn:hover {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(99, 102, 241, 0.1)) !important;
  color: #4f46e5 !important;
  border-color: rgba(99, 102, 241, 0.35) !important;
  transform: translateY(-2px) !important;
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.2) !important;
}

/* 구분선 효과 */
.header-left-group::after,
.naver-search-group::after {
  content: '';
  position: absolute;
  right: -10px;
  top: 50%;
  transform: translateY(-50%);
  width: 1px;
  height: 24px;
  background: linear-gradient(
    to bottom,
    transparent,
    rgba(0, 0, 0, 0.1),
    transparent
  );
}

.header-left-group {
  position: relative;
}

.naver-search-group {
  position: relative;
}

@media (max-width: 768px) {
  .header-navigation {
    gap: 8px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .header-left-group,
  .header-right-group {
    gap: 6px;
  }

  .header-left-group::after,
  .naver-search-group::after {
    display: none;
  }

  .search-input {
    width: 100px;
    min-width: 90px;
  }

  .naver-search-group {
    padding: 4px 8px;
    gap: 6px;
    max-width: 240px;
  }

  .compact-button {
    font-size: 13px;
    padding: 6px 12px;
  }

  .menu-button {
    width: 36px;
    height: 36px;
  }

  .selection-toolbar-inline {
    flex-direction: column;
    gap: 12px;
  }

  .selection-actions {
    width: 100%;
    justify-content: space-between;
  }

  .action-btn {
    flex: 1;
    font-size: 13px !important;
    padding: 6px 10px !important;
  }
}
</style>
