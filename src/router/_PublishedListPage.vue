<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import {
  NCard,
  NButton,
  NSpace,
  NTag,
  NModal,
  NInput,
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
} from '@vicons/ionicons5';
import ModernCard from '@/components/ui/ModernCard.vue';
import ModernButton from '@/components/ui/ModernButton.vue';
import {
  getFavoriteSearches,
  removeFavoriteSearch,
  type FavoriteSearch,
} from '@/utils/_localStorage';
import { useChatStore } from '@/stores/_chat';

const chatStore = useChatStore();
const publishedList = ref<FavoriteSearch[]>([]);
const showDetailModal = ref(false);
const selectedItem = ref<FavoriteSearch | null>(null);

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
    console.log('참조원고가 클립보드에 복사되었습니다.');
  }
};

const handleCopyResult = (item: FavoriteSearch) => {
  if (item.resultSample) {
    navigator.clipboard.writeText(item.resultSample);
    console.log('결과 원고 예시가 클립보드에 복사되었습니다.');
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
      <ModernCard variant="glass" class="header-card">
        <div class="header-content">
          <ModernButton
            variant="ghost"
            size="sm"
            :icon="BackIcon"
            @click="goBack"
            class="back-button"
          />
          <div class="header-text">
            <h1 class="page-title">📝 발행원고 리스트</h1>
            <p class="page-subtitle">검증된 원고 템플릿 목록</p>
          </div>
          <div class="header-stats">
            <n-tag type="success" size="large">
              총 {{ publishedList.length }}개
            </n-tag>
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
                  <span class="published-badge">✓</span>
                  <h3 class="item-title">{{ item.title }}</h3>
                </div>
                <div class="item-actions">
                  <ModernButton
                    variant="ghost"
                    size="md"
                    :icon="CopyIcon"
                    @click.stop="handleCopyKeyword(item)"
                    title="키워드 복사"
                  />
                  <ModernButton
                    variant="ghost"
                    size="md"
                    :icon="StarIcon"
                    @click.stop="handleUseTemplate(item)"
                    title="템플릿 사용"
                    class="use-button"
                  />
                  <ModernButton
                    variant="ghost"
                    size="md"
                    :icon="TrashIcon"
                    @click.stop="handleDelete(item)"
                    title="삭제"
                    class="delete-button"
                  />
                </div>
              </div>

              <div class="item-content">
                <div class="keyword-section">
                  <span class="label">키워드:</span>
                  <span class="keyword">{{ item.keyword }}</span>
                </div>

                <div v-if="item.refMsg" class="ref-section">
                  <span class="label">참조원고:</span>
                  <p class="ref-preview">{{ item.refMsg.slice(0, 100) }}...</p>
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
    <n-modal v-model:show="showDetailModal" preset="card" style="width: 600px">
      <template #header>
        <div style="display: flex; align-items: center; gap: 8px">
          <span class="published-badge">✓</span>
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
            <strong>참조원고 예시 (3줄):</strong>
            <n-button size="tiny" @click="handleCopyRef(selectedItem)">
              복사
            </n-button>
          </div>
          <p class="modal-text ref-content">
            {{ selectedItem.refMsg.split('\n').filter(l=>l.trim().length>0).slice(0,3).join('\n') }}
          </p>
        </div>

        <div class="modal-section" v-if="selectedItem.resultSample">
          <div class="modal-item-header">
            <strong>결과 원고 예시 (3줄):</strong>
            <n-button size="tiny" @click="handleCopyResult(selectedItem)">복사</n-button>
          </div>
          <p class="modal-text result-content">{{ selectedItem.resultSample }}</p>
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
              템플릿 사용
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
  background: radial-gradient(1200px 600px at 50% -20%, rgba(59,130,246,0.12), transparent),
              radial-gradient(900px 500px at 80% 10%, rgba(16,185,129,0.12), transparent),
              radial-gradient(900px 500px at 20% 10%, rgba(236,72,153,0.08), transparent);
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

/* List */
.list-container {
  max-width: 960px;
  margin: 0 auto;
}
.published-item-card {
  cursor: pointer;
  transition: box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease;
}
.published-item-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(59, 130, 246, 0.18), 0 6px 14px rgba(16, 185, 129, 0.12);
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
  background: #10b981;
  color: #fff;
  border-radius: 50%;
  font-size: 11px;
  font-weight: 700;
}
.item-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}
.item-content {
  margin-top: 6px;
}
.label {
  font-weight: 600;
  font-size: 13px;
  color: #333;
}
.keyword {
  margin-left: 6px;
  color: #111;
}
.ref-preview {
  margin: 4px 0 0;
  font-size: 13px;
  color: #555;
  line-height: 1.4;
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

/* Modal polish */
.ref-content,
.result-content {
  white-space: pre-wrap;
  word-break: break-word;
  background: rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.06);
  padding: 10px 12px;
  border-radius: 8px;
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
