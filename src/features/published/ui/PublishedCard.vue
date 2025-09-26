<script setup lang="ts">
import {
  Trash as TrashIcon,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
  Link as LinkIcon,
  ChatboxEllipses as ChatIcon,
  CheckmarkCircle as CheckIcon,
  Time as TimeIcon,
  RadioButtonOn as ActiveIcon,
  RadioButtonOff as InactiveIcon,
  Copy as CopyIcon,
  Document as DocumentIcon,
} from '@vicons/ionicons5';
import ModernCard from '@/components/ui/ModernCard.vue';
import ModernButton from '@/components/ui/ModernButton.vue';
import { usePublishedList } from '@/features/published/hooks/usePublishedList';
import { usePublishedModal } from '@/features/published/hooks/usePublishedModal';
import { copyText } from '@/utils/_copyText';
import { MODEL_OPTIONS } from '@/constants/_models';
import type { FavoriteSearch, BlogIdGroupInfo } from '@/entities/published';

interface Props {
  item: FavoriteSearch;
  groupInfo?: BlogIdGroupInfo | null;
}

const props = defineProps<Props>();

const { handleDelete } = usePublishedList();
const { itemClick, toggleActive } = usePublishedModal();

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const handleClick = () => {
  itemClick(props.item);
};

const handleDeleteClick = (e: Event) => {
  e.stopPropagation();
  handleDelete(props.item);
};

const handleToggleActive = (e: Event) => {
  e.stopPropagation();
  toggleActive(props.item);
};

const handleCopyKeyword = async (e: Event) => {
  e.stopPropagation();
  try {
    await copyText(props.item.keyword);
    console.log('키워드가 복사되었습니다:', props.item.keyword);
  } catch (error) {
    console.error('키워드 복사 실패:', error);
  }
};

const handleCopyBotContent = async (e: Event) => {
  e.stopPropagation();
  try {
    if (props.item.botContent) {
      await copyText(props.item.botContent);
      console.log('결과원고가 복사되었습니다');
    } else {
      console.warn('복사할 결과원고가 없습니다');
    }
  } catch (error) {
    console.error('결과원고 복사 실패:', error);
  }
};

const getServiceInfo = (service?: string) => {
  if (!service) return null;

  const option = MODEL_OPTIONS.find((opt) => opt.value === service);
  return {
    label: option?.label || service.toUpperCase(),
    value: service,
  };
};

const getServiceColor = (service?: string) => {
  if (!service) return '';

  const colorMap: Record<string, { bg: string; border: string; text: string }> = {
    'chunk': { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.3)', text: '#ef4444' },
    'gpt-5-v2': { bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.3)', text: '#10b981' },
    'gpt-4-v2': { bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.3)', text: '#3b82f6' },
    'solar': { bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.3)', text: '#f59e0b' },
    'test': { bg: 'rgba(107, 114, 128, 0.1)', border: 'rgba(107, 114, 128, 0.3)', text: '#6b7280' },
    'gpt-merge': { bg: 'rgba(139, 92, 246, 0.1)', border: 'rgba(139, 92, 246, 0.3)', text: '#8b5cf6' },
  };

  return colorMap[service] || { bg: 'rgba(107, 114, 128, 0.1)', border: 'rgba(107, 114, 128, 0.3)', text: '#6b7280' };
};
</script>

<template>
  <ModernCard
    variant="glass"
    :class="[
      'published-item-card',
      { 'inactive-card': item.isActive === false },
    ]"
    @click="handleClick"
  >
    <div class="published-item">
      <div class="item-header">
        <div class="item-title-section">
          <CheckIcon class="published-badge-icon" />
          <h3 class="item-title">{{ item.title }}</h3>
          <!-- 그룹 뱃지 -->
          <span v-if="groupInfo" class="group-version-badge">
            {{ groupInfo.isLatest ? '최신' : `v${groupInfo.position}` }}
            / {{ groupInfo.total }}
          </span>
        </div>
        <div class="item-actions">
          <ModernButton
            v-if="item.botContent"
            variant="ghost"
            size="sm"
            icon-only
            :icon="DocumentIcon"
            @click="handleCopyBotContent"
            title="결과원고 복사"
            class="action-btn copy-content-button"
          />
          <ModernButton
            variant="ghost"
            size="sm"
            icon-only
            :icon="item.isActive !== false ? ActiveIcon : InactiveIcon"
            @click="handleToggleActive"
            :title="item.isActive !== false ? '비활성화' : '활성화'"
            :class="[
              'action-btn',
              'toggle-button',
              item.isActive !== false ? 'active-button' : 'inactive-button',
            ]"
          />
          <ModernButton
            variant="ghost"
            size="sm"
            icon-only
            :icon="TrashIcon"
            @click="handleDeleteClick"
            title="삭제"
            class="action-btn delete-button"
          />
        </div>
      </div>

      <div class="item-content compact">
        <div class="keyword-line">
          <div class="keyword-section">
            <span class="keyword">{{ item.keyword }}</span>
            <ModernButton
              variant="ghost"
              size="sm"
              icon-only
              :icon="CopyIcon"
              @click="handleCopyKeyword"
              title="키워드 복사"
              class="copy-keyword-btn"
            />
          </div>
          <div class="tag-group">
            <span
              v-if="getServiceInfo(item.service)"
              class="service-badge"
              :style="{
                background: getServiceColor(item.service).bg,
                borderColor: getServiceColor(item.service).border,
                color: getServiceColor(item.service).text,
              }"
            >
              {{ getServiceInfo(item.service)?.label }}
            </span>
            <span v-if="item.refMsg" class="ref-flag">
              <LinkIcon class="ref-icon" />
              참조
            </span>
            <span v-if="item.blogId" class="blog-id-badge">
              <LinkIcon class="ref-icon" />
              ID:
              {{
                item.blogId.length > 10
                  ? item.blogId.substring(0, 10) + '...'
                  : item.blogId
              }}
            </span>
            <span v-if="item.isVisible" class="visibility-badge visible">
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
        <div class="created-date">
          <TimeIcon class="date-icon" />
          {{ formatDate(item.createdAt) }}
        </div>
      </div>
    </div>
  </ModernCard>
</template>

<style scoped>
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

/* 비활성화된 카드 스타일 */
.inactive-card {
  opacity: 0.5;
  filter: grayscale(0.3);
  transition: opacity 0.3s ease, filter 0.3s ease, transform 0.2s ease;
}

.inactive-card:hover {
  opacity: 0.7;
  transform: translateY(-1px);
  box-shadow: 0 5px 15px rgba(59, 130, 246, 0.1),
    0 3px 7px rgba(16, 185, 129, 0.06);
}

.published-item {
  padding: 12px;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.item-title-section {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.published-badge-icon {
  width: 16px !important;
  height: 16px !important;
  min-width: 16px;
  min-height: 16px;
  max-width: 16px;
  max-height: 16px;
  color: #10b981;
  flex-shrink: 0;
}

.item-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
}

:global(.dark) .item-title {
  color: #f9fafb;
}

.group-version-badge {
  font-size: 10px;
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
  padding: 1px 4px;
  border-radius: 4px;
  font-weight: 600;
  margin-left: 6px;
  flex-shrink: 0;
}

.item-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.action-btn {
  width: 28px !important;
  height: 28px !important;
  min-width: 28px !important;
  min-height: 28px !important;
  padding: 0 !important;
}

.use-button:hover {
  background: rgba(16, 185, 129, 0.1) !important;
  color: #10b981 !important;
}

.copy-content-button:hover {
  background: rgba(16, 185, 129, 0.1) !important;
  color: #10b981 !important;
}

.delete-button:hover {
  background: rgba(239, 68, 68, 0.1) !important;
  color: #ef4444 !important;
}

.toggle-button.active-button:hover {
  background: rgba(34, 197, 94, 0.1) !important;
  color: #22c55e !important;
}

.toggle-button.inactive-button {
  opacity: 0.6;
}

.toggle-button.inactive-button:hover {
  background: rgba(107, 114, 128, 0.1) !important;
  color: #6b7280 !important;
  opacity: 0.8;
}

.item-content {
  margin-bottom: 8px;
}

.keyword-line {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 6px;
}

.keyword-section {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  min-width: 0;
}

.keyword {
  font-size: 14px;
  color: #374151;
  font-weight: 500;
  line-height: 1.4;
  flex: 1;
  min-width: 0;
  word-break: break-word;
}

.copy-keyword-btn {
  width: 24px !important;
  height: 24px !important;
  min-width: 24px !important;
  min-height: 24px !important;
  padding: 0 !important;
  opacity: 0;
  transition: opacity 0.2s ease, background-color 0.2s ease, transform 0.1s ease;
  flex-shrink: 0;
}

.published-item-card:hover .copy-keyword-btn {
  opacity: 1;
}

.copy-keyword-btn:hover {
  background: rgba(59, 130, 246, 0.1) !important;
  color: #3b82f6 !important;
  transform: scale(1.1);
}

.copy-keyword-btn:active {
  transform: scale(0.95);
}

:global(.dark) .keyword {
  color: #d1d5db;
}

.tag-group {
  display: flex;
  gap: 4px;
  align-items: center;
  flex-wrap: wrap;
}

.ref-flag {
  font-size: 11px;
  color: #2563eb;
  background: rgba(37, 99, 235, 0.08);
  border: 1px solid rgba(37, 99, 235, 0.2);
  padding: 2px 6px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  gap: 3px;
  font-weight: 600;
}

.visibility-badge {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 999px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 3px;
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

.service-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 12px;
  border: 1px solid;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.service-badge:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.blog-id-badge {
  font-size: 11px;
  color: #6366f1;
  background: rgba(99, 102, 241, 0.08);
  border: 1px solid rgba(99, 102, 241, 0.2);
  padding: 2px 6px;
  border-radius: 999px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 3px;
}

.ref-icon,
.visibility-icon,
.memo-icon {
  width: 12px !important;
  height: 12px !important;
  flex-shrink: 0;
  min-width: 12px;
  min-height: 12px;
  max-width: 12px;
  max-height: 12px;
}

.memo-preview {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
  font-style: italic;
  display: flex;
  align-items: center;
  gap: 4px;
}

.memo-preview .memo-text {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  flex: 1;
}

:global(.dark) .memo-preview {
  color: #94a3b8;
}

.item-footer {
  margin-top: 8px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  padding-top: 8px;
}

.created-date {
  font-size: 12px;
  color: #888;
  display: flex;
  align-items: center;
  gap: 4px;
}

.date-icon {
  width: 12px !important;
  height: 12px !important;
  flex-shrink: 0;
  min-width: 12px;
  min-height: 12px;
  max-width: 12px;
  max-height: 12px;
}

:global(.dark) .created-date {
  color: #9ca3af;
}

:global(.dark) .item-footer {
  border-top-color: rgba(255, 255, 255, 0.1);
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .copy-keyword-btn {
    opacity: 1; /* 모바일에서는 항상 보이게 */
    width: 28px !important;
    height: 28px !important;
    min-width: 28px !important;
    min-height: 28px !important;
  }

  .keyword-section {
    gap: 8px;
  }

  .keyword {
    font-size: 13px;
  }

  .tag-group {
    flex-wrap: wrap;
    gap: 3px;
  }
}
</style>
