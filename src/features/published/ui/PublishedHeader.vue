<script setup lang="ts">
import { computed } from 'vue';
import { ArrowBack as BackIcon, Newspaper as NewsIcon } from '@vicons/ionicons5';
import ModernButton from '@/components/ui/ModernButton.vue';
import type { FavoriteSearch } from '@/entities/published';

interface Props {
  publishedList: FavoriteSearch[];
  onGoBack?: () => void;
}

const props = defineProps<Props>();

const totalCount = computed(() => props.publishedList.length);
const visibleCount = computed(() => 
  props.publishedList.filter(item => item.isVisible).length
);

const handleGoBack = () => {
  if (props.onGoBack) {
    props.onGoBack();
  } else {
    window.history.back();
  }
};
</script>

<template>
  <div class="page-header">
    <div class="header-wrapper">
      <!-- 뒤로가기 버튼 -->
      <ModernButton
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
          {{ totalCount }}개 원고 |
          {{ visibleCount }}개 노출중
        </p>
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

.title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.title-icon {
  width: 24px !important;
  height: 24px !important;
  color: #3b82f6;
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
  color: #1f2937;
  line-height: 1.2;
}

:global(.dark) .page-title {
  color: #f9fafb;
}

.page-subtitle {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

:global(.dark) .page-subtitle {
  color: #9ca3af;
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