<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import {
  ArrowBack as BackIcon,
  Newspaper as NewsIcon,
  RadioButtonOn as ActiveIcon,
  RadioButtonOff as InactiveIcon,
  Apps as AllIcon,
} from '@vicons/ionicons5';
import { Button } from '@/components/ui';
import { usePublishedStore } from '@/features';

interface Props {
  onGoBack?: () => void;
}

const props = defineProps<Props>();

// 직접 store 사용
const publishedStore = usePublishedStore();
const { displayList, activeFilter } = storeToRefs(publishedStore);

const totalCount = computed(() => displayList.value?.length || 0);
const visibleCount = computed(
  () => displayList.value?.filter((item: any) => item.isVisible).length || 0
);

const handleGoBack = () => {
  if (props.onGoBack) {
    props.onGoBack();
  } else {
    window.history.back();
  }
};

// 필터 변경 핸들러
const handleFilterChange = (filter: 'active' | 'inactive' | 'all') => {
  publishedStore.activeFilter = filter;
};

// 컴포넌트 마운트 시 데이터 로드
onMounted(() => {
  publishedStore.loadArticles();
});
</script>

<template>
  <div class="page-header">
    <div class="header-wrapper">
      <!-- 뒤로가기 버튼 -->
      <Button
        variant="ghost"
        size="sm"
        :icon="BackIcon"
        @click="handleGoBack"
        class="back-button"
      />

      <!-- 제목 영역 -->
      <div class="title-section">
        <div class="title-row">
          <NewsIcon class="title-icon" />
          <h1 class="page-title">발행원고</h1>
        </div>
        <p class="page-subtitle">
          {{ totalCount }}개 원고 | {{ visibleCount }}개 노출중
        </p>
      </div>

      <!-- 필터 버튼들 -->
      <div class="filter-section">
        <Button
          variant="ghost"
          size="sm"
          :icon="ActiveIcon"
          @click="handleFilterChange('active')"
          :class="['filter-button', { active: activeFilter === 'active' }]"
        >
          활성화
        </Button>
        <Button
          variant="ghost"
          size="sm"
          :icon="InactiveIcon"
          @click="handleFilterChange('inactive')"
          :class="['filter-button', { active: activeFilter === 'inactive' }]"
        >
          비활성화
        </Button>
        <Button
          variant="ghost"
          size="sm"
          :icon="AllIcon"
          @click="handleFilterChange('all')"
          :class="['filter-button', { active: activeFilter === 'all' }]"
        >
          모두보기
        </Button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-header {
  margin-bottom: 16px;
  max-width: 960px;
  margin-left: auto;
  margin-right: auto;
}

.header-wrapper {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 0;
}

.back-button {
  flex-shrink: 0;
}

.title-section {
  flex: 1;
}

.filter-section {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.filter-button {
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.filter-button.active {
  background: rgba(0, 196, 113, 0.1) !important;
  color: var(--color-success) !important;
  border-color: rgba(0, 196, 113, 0.3);
}

.filter-button:not(.active):hover {
  background: rgba(107, 114, 128, 0.1) !important;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.title-icon {
  width: 24px !important;
  height: 24px !important;
  color: var(--color-primary);
  flex-shrink: 0;
  min-width: 24px;
  min-height: 24px;
  max-width: 24px;
  max-height: 24px;
}

.page-title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1.2;
}

.page-subtitle {
  margin: 0;
  font-size: 14px;
  color: var(--color-text-secondary);
  font-weight: 500;
}

/* Responsive */
@media (max-width: 768px) {
  .page-header {
    margin-bottom: 12px;
  }

  .header-wrapper {
    gap: 12px;
    padding: 8px 0;
  }

  .title-icon {
    width: 18px !important;
    height: 18px !important;
    min-width: 18px;
    min-height: 18px;
    max-width: 18px;
    max-height: 18px;
  }

  .page-title {
    font-size: 20px;
  }

  .page-subtitle {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .header-wrapper {
    gap: 10px;
  }
}
</style>
