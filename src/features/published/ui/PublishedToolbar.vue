<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { NSelect, NSwitch } from 'naive-ui';
import { ModernCard } from '@/components/ui';
import { usePublishedStore } from '@/features';

// storeToRefs로 반응성 유지
const publishedStore = usePublishedStore();
const { sortBy, isOnlyWithRef, isOnlyWithBlogId } = storeToRefs(publishedStore);

const sortOptions = [
  { label: '최신순', value: 'recent' as const },
  { label: '제목순', value: 'title' as const },
];
</script>

<template>
  <div class="compact-toolbar">
    <ModernCard variant="glass" class="compact-toolbar-card">
      <div class="compact-toolbar-content">
        <!-- 정렬 선택 -->
        <div class="toolbar-section">
          <n-select
            v-model:value="sortBy"
            :options="sortOptions"
            size="medium"
            class="compact-select"
          />
        </div>

        <!-- 필터 그룹 -->
        <div class="toolbar-section filter-group">
          <span class="filter-group-label">필터:</span>
          <div class="switch-group">
            <div class="compact-switch" title="참조원고 있는 항목만">
              <n-switch
                v-model:value="isOnlyWithRef"
                size="medium"
              />
              <span class="compact-switch-label">참조</span>
            </div>
            <div class="compact-switch" title="블로그 ID 있는 항목만">
              <n-switch
                v-model:value="isOnlyWithBlogId"
                size="medium"
              />
              <span class="compact-switch-label">ID</span>
            </div>
          </div>
        </div>
      </div>
    </ModernCard>
  </div>
</template>

<style scoped>
/* 컴팩트 툴바 스타일 */
.compact-toolbar {
  margin-bottom: 16px;
  max-width: 960px;
  margin-left: auto;
  margin-right: auto;
}

.compact-toolbar-card {
  padding: 10px 16px;
  backdrop-filter: blur(15px);
  background: rgba(255, 255, 255, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

:global(.dark) .compact-toolbar-card {
  background: rgba(17, 24, 39, 0.6);
  border-color: rgba(255, 255, 255, 0.1);
}

.compact-toolbar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.toolbar-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.compact-select {
  min-width: 110px;
  font-size: 13px;
}

.filter-group {
  gap: 12px;
}

.filter-group-label {
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
  margin-right: 8px;
}

:global(.dark) .filter-group-label {
  color: #9ca3af;
}

.switch-group {
  display: flex;
  gap: 16px;
  align-items: center;
}

.compact-switch {
  display: flex;
  align-items: center;
  gap: 6px;
}

.compact-switch-label {
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  white-space: nowrap;
}

:global(.dark) .compact-switch-label {
  color: #9ca3af;
}

/* Responsive */
@media (max-width: 768px) {
  .compact-toolbar-content {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .toolbar-section {
    justify-content: center;
  }

  .switch-group {
    justify-content: center;
    gap: 12px;
  }

  .filter-group {
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }
}
</style>
