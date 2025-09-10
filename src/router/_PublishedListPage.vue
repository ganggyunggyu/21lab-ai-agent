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
    console.log('참조원고 전체가 클립보드에 복사되었습니다.');
  }
};

const handleCopyRefPreview = (item: FavoriteSearch) => {
  if (item.refMsg) {
    const preview = item.refMsg.split('\n').filter(l=>l.trim().length>0).slice(0,3).join('\n');
    navigator.clipboard.writeText(preview);
    console.log('참조원고 3줄 미리보기가 클립보드에 복사되었습니다.');
  }
};

const handleCopyResult = (item: FavoriteSearch) => {
  if (item.resultSample) {
    navigator.clipboard.writeText(item.resultSample);
    console.log('결과 원고 예시가 클립보드에 복사되었습니다.');
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
                    title="템플릿 사용"
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
                  <span v-if="item.refMsg" class="ref-flag">📎 참조</span>
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
            <strong>참조원고 미리보기 (3줄):</strong>
            <n-space size="small">
              <n-button size="tiny" type="primary" @click="handleCopyResult(selectedItem)">
                3줄 복사
              </n-button>
              <n-button size="tiny" @click="handleCopyRef(selectedItem)">
                전체 복사
              </n-button>
            </n-space>
          </div>
          <div class="preview-box ref-preview-box">
            {{ selectedItem.refMsg.split('\n').filter(l=>l.trim().length>0).slice(0,3).join('\n') }}
          </div>
        </div>

        <div class="modal-section" v-if="selectedItem.resultSample || selectedItem.botContent">
          <div class="modal-item-header">
            <strong>결과원고 미리보기 (3줄):</strong>
            <n-space size="small">
              <n-button size="tiny" type="primary" @click="handleCopyResult(selectedItem)">
                3줄 복사
              </n-button>
              <n-button size="tiny" @click="handleCopyFullResult(selectedItem)" v-if="selectedItem.botContent">
                전체 복사
              </n-button>
            </n-space>
          </div>
          <div class="preview-box result-preview-box">
            {{ selectedItem.resultSample || selectedItem.botContent?.split('\n').filter(l=>l.trim().length>0).slice(0,3).join('\n') }}
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
  /* Light theme: airy colorful halos */
  background: radial-gradient(1200px 600px at 50% -20%, rgba(59,130,246,0.16), transparent),
              radial-gradient(900px 500px at 80% 10%, rgba(16,185,129,0.14), transparent),
              radial-gradient(900px 500px at 20% 10%, rgba(236,72,153,0.12), transparent);
}

/* Dark theme tuning: deeper base + neon glows */
:global(.dark) .published-list-container {
  background: #0b1220 radial-gradient(1200px 600px at 50% -20%, rgba(59,130,246,0.22), transparent),
              radial-gradient(900px 500px at 80% 10%, rgba(16,185,129,0.20), transparent),
              radial-gradient(900px 500px at 20% 10%, rgba(236,72,153,0.16), transparent);
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
  box-shadow: 0 10px 30px rgba(59, 130, 246, 0.18), 0 6px 14px rgba(16, 185, 129, 0.12);
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
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.18), 0 6px 18px rgba(16, 185, 129, 0.25);
}
.item-title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
}
.item-content { margin-top: 4px; }
.item-content.compact { padding: 0; }
.keyword-line { display: flex; gap: 8px; align-items: center; justify-content: space-between; }
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
.ref-flag { font-size: 12px; color: #2563eb; background: rgba(37, 99, 235, .08); border: 1px solid rgba(37, 99, 235, .2); padding: 2px 6px; border-radius: 999px; }
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
.published-item { padding: 12px; }
.item-actions { display: flex; gap: 6px; align-items: center; }
.action-btn { border-radius: 999px; }

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
