<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import {
  NCard,
  NButton,
  NSpace,
  NTag,
  NModal,
  NInput,
  NInputNumber,
  NText,
  NEmpty,
  NGrid,
  NGridItem,
  NSelect,
  NSwitch,
} from 'naive-ui';
import {
  DocumentText as DocumentIcon,
  Copy as CopyIcon,
  Trash as TrashIcon,
  Star as StarIcon,
  ArrowBack as BackIcon,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
  Link as LinkIcon,
  ChatboxEllipses as ChatIcon,
  CheckmarkCircle as CheckIcon,
  Newspaper as NewsIcon,
} from '@vicons/ionicons5';
import ModernCard from '@/components/ui/ModernCard.vue';
import ModernButton from '@/components/ui/ModernButton.vue';
import {
  getFavoriteSearches,
  removeFavoriteSearch,
  updatePublishedMemo,
  updatePublishedExposure,
  type FavoriteSearch,
} from '@/utils/_localStorage';
import { useChatStore } from '@/stores/_chat';

const chatStore = useChatStore();
const publishedList = ref<FavoriteSearch[]>([]);
const showDetailModal = ref(false);
const selectedItem = ref<FavoriteSearch | null>(null);

// 메모 편집용 상태
const editingMemo = ref<string | null>(null);
const tempMemo = ref<string>('');

// Toolbar state
const searchQuery = ref<string>('');
const sortBy = ref<'recent' | 'title'>('recent');
const isOnlyWithRef = ref<boolean>(false);

const loadPublishedList = () => {
  const allFavorites = getFavoriteSearches();
  publishedList.value = allFavorites.filter((item) => item.isPublished);
};

const handleItemClick = (item: FavoriteSearch) => {
  selectedItem.value = item;
  showDetailModal.value = true;
};

const handleCopyKeyword = (item: FavoriteSearch) => {
  navigator.clipboard.writeText(item.keyword);
  console.log('키워드가 클립보드에 복사되었습니다.');
};

const handleCopyRef = (item: FavoriteSearch) => {
  if (item.refMsg) {
    navigator.clipboard.writeText(item.refMsg);
    console.log('참조원고 전체가 클립보드에 복사되었습니다.');
  }
};

const handleCopyFullResult = (item: FavoriteSearch) => {
  if (item.botContent) {
    navigator.clipboard.writeText(item.botContent);
    console.log('전체 결과 원고가 클립보드에 복사되었습니다.');
  }
};

const handleUseTemplate = (item: FavoriteSearch) => {
  chatStore.keyword = item.keyword;
  if (item.refMsg) {
    chatStore.refMsg = item.refMsg;
    chatStore.showRefInput = true;
  }
  // 채팅 페이지로 이동
  window.location.href = '/';
};

const handleDelete = (item: FavoriteSearch) => {
  if (confirm('이 발행원고를 삭제하시겠습니까?')) {
    removeFavoriteSearch(item.id);
    loadPublishedList();
    if (selectedItem.value?.id === item.id) {
      showDetailModal.value = false;
    }
  }
};

const goBack = () => {
  window.history.back();
};

// 메모 편집 관련 함수
const startEditMemo = (item: FavoriteSearch) => {
  editingMemo.value = item.id;
  tempMemo.value = item.memo || '';
};

const saveMemo = (item: FavoriteSearch) => {
  updatePublishedMemo(item.id, tempMemo.value);
  item.memo = tempMemo.value; // 즉시 화면 업데이트
  editingMemo.value = null;
  loadPublishedList(); // 전체 데이터 다시 로드
};

const cancelEditMemo = () => {
  editingMemo.value = null;
  tempMemo.value = '';
};

const handleMemoKeydown = (e: KeyboardEvent, item: FavoriteSearch) => {
  if (e.key === 'Enter' && e.shiftKey) {
    e.preventDefault();
    saveMemo(item);
  }
};

// 노출 설정 관련 함수들
const toggleVisibility = (item: FavoriteSearch) => {
  const newVisibility = !item.isVisible;
  updatePublishedExposure(item.id, newVisibility, item.exposureRank);
  item.isVisible = newVisibility; // 즉시 화면 업데이트
  loadPublishedList(); // 전체 데이터 다시 로드
};

const updateRank = (item: FavoriteSearch, rank: number | null) => {
  const newRank = rank || undefined;
  updatePublishedExposure(item.id, item.isVisible || false, newRank);
  item.exposureRank = newRank; // 즉시 화면 업데이트
  loadPublishedList(); // 전체 데이터 다시 로드
};

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

onMounted(() => {
  loadPublishedList();
});

// Derived list with search / filter / sort
const displayList = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  const baseList = publishedList.value.slice();

  const filtered = baseList.filter((item) => {
    const matchesQuery =
      !query ||
      item.title.toLowerCase().includes(query) ||
      item.keyword.toLowerCase().includes(query) ||
      (item.refMsg ? item.refMsg.toLowerCase().includes(query) : false);
    const matchesRef = !isOnlyWithRef.value || !!item.refMsg;
    return matchesQuery && matchesRef;
  });

  if (sortBy.value === 'title') {
    filtered.sort((a, b) => a.title.localeCompare(b.title));
  } else {
    filtered.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
  return filtered;
});
</script>

<template>
  <div class="published-list-container">
    <!-- 헤더 -->
    <div class="page-header">
      <div class="header-background">
        <div class="header-decoration"></div>
      </div>
      <ModernCard variant="glass" class="header-card">
        <div class="header-content">
          <div class="header-left">
            <ModernButton
              variant="ghost"
              size="sm"
              :icon="BackIcon"
              @click="goBack"
              class="back-button"
            />
          </div>
          <div class="header-center">
            <div class="header-icon-wrapper">
              <NewsIcon class="header-main-icon" />
            </div>
            <div class="header-text">
              <h1 class="page-title">발행원고 리스트</h1>
              <p class="page-subtitle">검증된 원고 템플릿 관리</p>
            </div>
          </div>
          <div class="header-right">
            <div class="header-stats">
              <div class="stats-item">
                <span class="stats-number">{{ publishedList.length }}</span>
                <span class="stats-label">총 원고</span>
              </div>
              <div class="stats-item">
                <span class="stats-number">{{
                  publishedList.filter((item) => item.isVisible).length
                }}</span>
                <span class="stats-label">노출중</span>
              </div>
            </div>
          </div>
        </div>
      </ModernCard>
    </div>

    <!-- 툴바 -->
    <div class="toolbar">
      <ModernCard variant="glass" class="toolbar-card">
        <div class="toolbar-row">
          <div class="toolbar-left">
            <n-input
              v-model:value="searchQuery"
              placeholder="제목/키워드/참조에서 검색"
              clearable
              size="large"
            />
          </div>
          <div class="toolbar-right">
            <n-select
              v-model:value="sortBy"
              :options="[
                { label: '최근 등록순', value: 'recent' },
                { label: '제목순', value: 'title' },
              ]"
              size="large"
              class="toolbar-select"
            />
            <div class="toolbar-switch">
              <n-switch v-model:value="isOnlyWithRef" size="large" />
              <span class="switch-label">참조원고 있는 항목만</span>
            </div>
          </div>
        </div>
      </ModernCard>
    </div>

    <!-- 발행원고 리스트 -->
    <div class="list-container">
      <n-empty
        v-if="displayList.length === 0"
        description="아직 등록된 발행원고가 없습니다"
        style="margin: 60px 0"
      >
        <template #icon>
          <component :is="DocumentIcon" style="font-size: 48px; color: #ccc" />
        </template>
        <template #extra>
          <n-text depth="3">
            채팅에서 원고를 생성한 후 "발행원고 등록" 기능을 사용해보세요!
          </n-text>
        </template>
      </n-empty>

      <n-grid v-else :cols="1" :x-gap="16" :y-gap="16" class="published-grid">
        <n-grid-item v-for="item in displayList" :key="item.id">
          <ModernCard
            variant="glass"
            class="published-item-card"
            @click="handleItemClick(item)"
          >
            <div class="published-item">
              <div class="item-header">
                <div class="item-title-section">
                  <CheckIcon class="published-badge-icon" />
                  <h3 class="item-title">{{ item.title }}</h3>
                </div>
                <div class="item-actions">
                  <ModernButton
                    variant="ghost"
                    size="sm"
                    icon-only
                    :icon="CopyIcon"
                    @click.stop="handleCopyKeyword(item)"
                    title="키워드 복사"
                    class="action-btn"
                  />
                  <ModernButton
                    variant="ghost"
                    size="sm"
                    icon-only
                    :icon="StarIcon"
                    @click.stop="handleUseTemplate(item)"
                    title="원고 발행"
                    class="action-btn use-button"
                  />
                  <ModernButton
                    variant="ghost"
                    size="sm"
                    icon-only
                    :icon="TrashIcon"
                    @click.stop="handleDelete(item)"
                    title="삭제"
                    class="action-btn delete-button"
                  />
                </div>
              </div>

              <div class="item-content compact">
                <div class="keyword-line">
                  <span class="keyword">{{ item.keyword }}</span>
                  <div class="tag-group">
                    <span v-if="item.refMsg" class="ref-flag">
                      <LinkIcon class="ref-icon" />
                      참조
                    </span>
                    <span
                      v-if="item.isVisible"
                      class="visibility-badge visible"
                    >
                      <EyeIcon class="visibility-icon" />
                      노출
                      {{ item.exposureRank ? `#${item.exposureRank}` : '' }}
                    </span>
                    <span
                      v-else-if="item.isVisible === false"
                      class="visibility-badge hidden"
                    >
                      <EyeOffIcon class="visibility-icon" />
                      미노출
                    </span>
                  </div>
                </div>
                <div v-if="item.memo" class="memo-preview">
                  <ChatIcon class="memo-icon" />
                  <span class="memo-text">{{ item.memo }}</span>
                </div>
              </div>

              <div class="item-footer">
                <span class="created-date">{{
                  formatDate(item.createdAt)
                }}</span>
              </div>
            </div>
          </ModernCard>
        </n-grid-item>
      </n-grid>
    </div>

    <!-- 상세보기 모달 -->
    <n-modal 
      v-model:show="showDetailModal" 
      preset="card" 
      :style="{ 
        width: '600px', 
        maxWidth: 'calc(100vw - 32px)',
        maxHeight: 'calc(100vh - 64px)'
      }"
      class="published-detail-modal"
    >
      <template #header>
        <div style="display: flex; align-items: center; gap: 8px">
          <CheckIcon class="modal-badge-icon" />
          {{ selectedItem?.title }}
        </div>
      </template>

      <div v-if="selectedItem" class="modal-content">
        <div class="modal-section">
          <div class="modal-item-header">
            <strong>키워드:</strong>
            <n-button size="tiny" @click="handleCopyKeyword(selectedItem)">
              복사
            </n-button>
          </div>
          <p class="modal-text">{{ selectedItem.keyword }}</p>
        </div>

        <div v-if="selectedItem.refMsg" class="modal-section">
          <div class="modal-item-header">
            <strong>참조원고:</strong>
            <n-button size="tiny" @click="handleCopyRef(selectedItem)">
              복사
            </n-button>
          </div>
          <div class="preview-container">
            {{ selectedItem.refMsg }}
          </div>
        </div>

        <div class="modal-section" v-if="selectedItem.botContent">
          <div class="modal-item-header">
            <strong>결과원고:</strong>
            <n-button size="tiny" @click="handleCopyFullResult(selectedItem)">
              복사
            </n-button>
          </div>
          <div class="preview-container">
            {{ selectedItem.botContent }}
          </div>
        </div>

        <div class="modal-section">
          <div class="modal-item-header">
            <strong>메모:</strong>
            <n-button
              v-if="editingMemo !== selectedItem.id"
              size="tiny"
              @click="startEditMemo(selectedItem)"
            >
              편집
            </n-button>
            <n-space v-else size="small">
              <n-button
                size="tiny"
                type="primary"
                @click="saveMemo(selectedItem)"
              >
                저장
              </n-button>
              <n-button size="tiny" @click="cancelEditMemo"> 취소 </n-button>
            </n-space>
          </div>
          <div v-if="editingMemo === selectedItem.id" class="memo-edit">
            <n-input
              v-model:value="tempMemo"
              type="textarea"
              placeholder="수정 내역, 발행 일정 등을 기록해주세요 (Shift+Enter로 저장)"
              :autosize="{ minRows: 2, maxRows: 4 }"
              @keydown="handleMemoKeydown($event, selectedItem)"
            />
          </div>
          <div v-else class="memo-display">
            {{ selectedItem.memo || '메모가 없습니다.' }}
          </div>
        </div>

        <div class="modal-section">
          <div class="modal-item-header">
            <strong>노출 설정:</strong>
          </div>
          <div class="exposure-controls">
            <div class="exposure-row">
              <span class="control-label">노출 여부:</span>
              <n-switch
                :value="selectedItem.isVisible || false"
                @update:value="(val) => toggleVisibility(selectedItem)"
                size="medium"
              >
                <template #checked>노출</template>
                <template #unchecked>미노출</template>
              </n-switch>
            </div>
            <div class="exposure-row" v-if="selectedItem.isVisible">
              <span class="control-label">노출 순위:</span>
              <n-input-number
                :value="selectedItem.exposureRank"
                @update:value="(val) => updateRank(selectedItem, val)"
                :min="1"
                :max="999"
                placeholder="순위"
                size="small"
                style="width: 100px"
              />
              <span class="rank-hint">낮을수록 우선 노출</span>
            </div>
          </div>
        </div>

        <div class="modal-section">
          <strong>등록일:</strong> {{ formatDate(selectedItem.createdAt) }}
        </div>
      </div>

      <template #footer>
        <n-space justify="space-between">
          <n-button type="error" @click="handleDelete(selectedItem!)">
            삭제
          </n-button>
          <n-space>
            <n-button @click="showDetailModal = false">닫기</n-button>
            <n-button type="primary" @click="handleUseTemplate(selectedItem!)">
              원고 재출력
            </n-button>
          </n-space>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<style scoped>
.published-list-container {
  min-height: 100vh;
  padding: 16px;
  /* Light theme: airy colorful halos */
  background: radial-gradient(
      1200px 600px at 50% -20%,
      rgba(59, 130, 246, 0.16),
      transparent
    ),
    radial-gradient(
      900px 500px at 80% 10%,
      rgba(16, 185, 129, 0.14),
      transparent
    ),
    radial-gradient(
      900px 500px at 20% 10%,
      rgba(236, 72, 153, 0.12),
      transparent
    );
}

/* Dark theme tuning: deeper base + neon glows */
:global(.dark) .published-list-container {
  background: #0b1220
      radial-gradient(
        1200px 600px at 50% -20%,
        rgba(59, 130, 246, 0.22),
        transparent
      ),
    radial-gradient(
      900px 500px at 80% 10%,
      rgba(16, 185, 129, 0.2),
      transparent
    ),
    radial-gradient(
      900px 500px at 20% 10%,
      rgba(236, 72, 153, 0.16),
      transparent
    );
}

.page-header {
  margin-bottom: 12px;
}

.header-card {
  padding: 12px 16px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-text {
  flex: 1;
}
.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  background: linear-gradient(90deg, #111111, #3b82f6, #10b981);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.page-subtitle {
  margin: 2px 0 0;
  color: #666;
  font-size: 13px;
}

/* Toolbar */
.toolbar {
  margin-bottom: 12px;
}
.toolbar-card {
  padding: 12px 16px;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.6);
}
:global(.dark) .toolbar-card {
  background: rgba(17, 24, 39, 0.5);
}
.toolbar-row {
  display: flex;
  gap: 12px;
  align-items: center;
}
.toolbar-left {
  flex: 1;
}
.toolbar-right {
  display: flex;
  gap: 12px;
  align-items: center;
}
.toolbar-select {
  min-width: 140px;
}
.toolbar-switch {
  display: flex;
  gap: 8px;
  align-items: center;
}
.switch-label {
  font-size: 13px;
  color: #555;
}
:global(.dark) .switch-label {
  color: #cbd5e1;
}

/* List */
.list-container {
  max-width: 960px;
  margin: 0 auto;
}
.published-item-card {
  cursor: pointer;
  transition: box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease;
  border: 1px solid rgba(59, 130, 246, 0.14);
}
.published-item-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(59, 130, 246, 0.18),
    0 6px 14px rgba(16, 185, 129, 0.12);
  border-color: rgba(16, 185, 129, 0.28);
}
.item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}
.item-title-section {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}
.published-badge {
  width: 18px;
  height: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #34d399, #10b981);
  color: #fff;
  border-radius: 50%;
  font-size: 11px;
  font-weight: 700;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.18),
    0 6px 18px rgba(16, 185, 129, 0.25);
}
.item-title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
}
.item-content {
  margin-top: 4px;
}
.item-content.compact {
  padding: 0;
}
.keyword-line {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
}

.tag-group {
  display: flex;
  gap: 6px;
  align-items: center;
}
.label {
  font-weight: 600;
  font-size: 13px;
  color: #333;
}
.keyword {
  margin-left: 6px;
  color: #111;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}
.ref-flag {
  font-size: 12px;
  color: #2563eb;
  background: rgba(37, 99, 235, 0.08);
  border: 1px solid rgba(37, 99, 235, 0.2);
  padding: 2px 6px;
  border-radius: 999px;
}

.visibility-badge {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 999px;
  font-weight: 600;
}

.visibility-badge.visible {
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.visibility-badge.hidden {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
}
.item-footer {
  margin-top: 8px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  padding-top: 8px;
}
.created-date {
  font-size: 12px;
  color: #888;
}

/* Compact card spacing & actions */
.published-item {
  padding: 12px;
}
.item-actions {
  display: flex;
  gap: 6px;
  align-items: center;
}
.action-btn {
  border-radius: 999px;
}

/* Modal polish */
.preview-container {
  white-space: pre-wrap;
  word-break: break-word;
  background: rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.06);
  padding: 12px 14px;
  border-radius: 8px;
  max-height: 120px;
  overflow-y: auto;
  line-height: 1.4;
  font-size: 13px;
  color: #444;

  /* 스크롤바 스타일링 */
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
}

.preview-container::-webkit-scrollbar {
  width: 6px;
}

.preview-container::-webkit-scrollbar-track {
  background: transparent;
}

.preview-container::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.15);
  border-radius: 3px;
}

.preview-container::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.25);
}

:global(.dark) .preview-container {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
}

:global(.dark) .preview-container::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
}

:global(.dark) .preview-container::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

.modal-section {
  margin-bottom: 16px;
}

.modal-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.modal-text {
  margin: 4px 0;
  color: #333;
  font-weight: 500;
}

:global(.dark) .modal-text {
  color: #e2e8f0;
}

.memo-preview {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
  font-style: italic;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}

:global(.dark) .memo-preview {
  color: #94a3b8;
}

.memo-display {
  margin: 4px 0;
  color: #555;
  font-size: 14px;
  line-height: 1.4;
  white-space: pre-wrap;
  word-break: break-word;
}

:global(.dark) .memo-display {
  color: #cbd5e1;
}

.memo-edit {
  margin-top: 8px;
}

.exposure-controls {
  margin-top: 8px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 8px;
}

:global(.dark) .exposure-controls {
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.08);
}

.exposure-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.exposure-row:last-child {
  margin-bottom: 0;
}

.control-label {
  font-size: 13px;
  font-weight: 600;
  color: #555;
  min-width: 70px;
}

:global(.dark) .control-label {
  color: #cbd5e1;
}

.rank-hint {
  font-size: 12px;
  color: #888;
  font-style: italic;
}

:global(.dark) .rank-hint {
  color: #94a3b8;
}

/* Responsive */
@media (max-width: 768px) {
  .toolbar-row {
    flex-direction: column;
    align-items: stretch;
  }
  .toolbar-right {
    justify-content: space-between;
  }
}
</style>
