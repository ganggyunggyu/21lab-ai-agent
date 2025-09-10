<script setup lang="ts">
import { ref, onMounted } from 'vue';
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

const loadPublishedList = () => {
  const allFavorites = getFavoriteSearches();
  publishedList.value = allFavorites.filter(item => item.isPublished);
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

    <!-- 발행원고 리스트 -->
    <div class="list-container">
      <n-empty 
        v-if="publishedList.length === 0"
        description="아직 등록된 발행원고가 없습니다"
        style="margin: 60px 0;"
      >
        <template #icon>
          <component :is="DocumentIcon" style="font-size: 48px; color: #ccc;" />
        </template>
        <template #extra>
          <n-text depth="3">
            채팅에서 원고를 생성한 후 "발행원고 등록" 기능을 사용해보세요!
          </n-text>
        </template>
      </n-empty>

      <n-grid v-else :cols="1" :x-gap="16" :y-gap="16" class="published-grid">
        <n-grid-item v-for="item in publishedList" :key="item.id">
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
                    size="xs"
                    :icon="CopyIcon"
                    @click.stop="handleCopyKeyword(item)"
                    title="키워드 복사"
                  />
                  <ModernButton
                    variant="ghost"
                    size="xs"
                    :icon="StarIcon"
                    @click.stop="handleUseTemplate(item)"
                    title="템플릿 사용"
                    class="use-button"
                  />
                  <ModernButton
                    variant="ghost"
                    size="xs"
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
                <span class="created-date">{{ formatDate(item.createdAt) }}</span>
              </div>
            </div>
          </ModernCard>
        </n-grid-item>
      </n-grid>
    </div>

    <!-- 상세보기 모달 -->
    <n-modal v-model:show="showDetailModal" preset="card" style="width: 600px;">
      <template #header>
        <div style="display: flex; align-items: center; gap: 8px;">
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
            <strong>참조원고:</strong>
            <n-button size="tiny" @click="handleCopyRef(selectedItem)">
              복사
            </n-button>
          </div>
          <p class="modal-text ref-content">{{ selectedItem.refMsg }}</p>
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

<style scoped></style>
