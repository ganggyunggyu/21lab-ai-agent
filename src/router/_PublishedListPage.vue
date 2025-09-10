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
  Code as MarkdownIcon,
  Eye as PreviewIcon,
} from '@vicons/ionicons5';
import ModernCard from '@/components/ui/ModernCard.vue';
import ModernButton from '@/components/ui/ModernButton.vue';
import {
  getFavoriteSearches,
  removeFavoriteSearch,
  updatePublishedMemo,
  updatePublishedExposure,
  updatePublishedBlogId,
  type FavoriteSearch,
} from '@/utils/_localStorage';
import { renderMarkdown } from '@/utils/markdown/renderer';
import { useChatStore } from '@/stores/_chat';

const chatStore = useChatStore();
const publishedList = ref<FavoriteSearch[]>([]);
const showDetailModal = ref(false);
const selectedItem = ref<FavoriteSearch | null>(null);

// 메모 편집용 상태
const editingMemo = ref<string | null>(null);
const tempMemo = ref<string>('');

// 블로그 ID 편집용 상태
const editingBlogId = ref<string | null>(null);
const tempBlogId = ref<string>('');

// 마크다운 에디터 상태
const showMarkdownEditor = ref(false);
const markdownContent = ref<string>('');
const showMarkdownPreview = ref(false);

// Toolbar state
const sortBy = ref<'recent' | 'title'>('recent');
const isOnlyWithRef = ref<boolean>(false);
const isOnlyWithBlogId = ref<boolean>(false);

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

// 블로그 ID 편집 관련 함수
const startEditBlogId = (item: FavoriteSearch) => {
  editingBlogId.value = item.id;
  tempBlogId.value = item.blogId || '';
};

const saveBlogId = (item: FavoriteSearch) => {
  updatePublishedBlogId(item.id, tempBlogId.value);
  item.blogId = tempBlogId.value; // 즉시 화면 업데이트
  editingBlogId.value = null;
  loadPublishedList(); // 전체 데이터 다시 로드
};

const cancelEditBlogId = () => {
  editingBlogId.value = null;
  tempBlogId.value = '';
};

const handleBlogIdKeydown = (e: KeyboardEvent, item: FavoriteSearch) => {
  if (e.key === 'Enter' && e.shiftKey) {
    e.preventDefault();
    saveBlogId(item);
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

// 마크다운 에디터 관련 함수들
const openMarkdownEditor = (item: FavoriteSearch) => {
  markdownContent.value = item.memo || '';
  showMarkdownEditor.value = true;
  showMarkdownPreview.value = false;
};

const saveMarkdownMemo = () => {
  if (selectedItem.value) {
    updatePublishedMemo(selectedItem.value.id, markdownContent.value);
    selectedItem.value.memo = markdownContent.value; // 즉시 화면 업데이트
    showMarkdownEditor.value = false;
    loadPublishedList(); // 전체 데이터 다시 로드
  }
};

const closeMarkdownEditor = () => {
  showMarkdownEditor.value = false;
  markdownContent.value = '';
  showMarkdownPreview.value = false;
};

const handleMarkdownKeydown = (e: KeyboardEvent) => {
  if (e.shiftKey && e.key === 'Enter') {
    e.preventDefault();
    saveMarkdownMemo();
  }
};

const toggleMarkdownPreview = () => {
  showMarkdownPreview.value = !showMarkdownPreview.value;
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

// Derived list with filter / sort
const displayList = computed(() => {
  const baseList = publishedList.value.slice();

  const filtered = baseList.filter((item) => {
    const matchesRef = !isOnlyWithRef.value || !!item.refMsg;
    const matchesBlogId = !isOnlyWithBlogId.value || !!item.blogId;
    return matchesRef && matchesBlogId;
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
      <div class="header-wrapper">
        <!-- 뒤로가기 버튼 -->
        <ModernButton
          variant="ghost"
          size="sm"
          :icon="BackIcon"
          @click="goBack"
          class="back-button"
        />

        <!-- 제목 영역 -->
        <div class="title-section">
          <div class="title-row">
            <NewsIcon class="title-icon" />
            <h1 class="page-title">발행원고</h1>
          </div>
          <p class="page-subtitle">
            {{ publishedList.length }}개 원고 |
            {{ publishedList.filter((item) => item.isVisible).length }}개 노출중
          </p>
        </div>
      </div>
    </div>

    <!-- 컴팩트 툴바 -->
    <div class="compact-toolbar">
      <ModernCard variant="glass" class="compact-toolbar-card">
        <div class="compact-toolbar-content">
          <!-- 정렬 선택 -->
          <div class="toolbar-section">
            <n-select
              v-model:value="sortBy"
              :options="[
                { label: '최신순', value: 'recent' },
                { label: '제목순', value: 'title' },
              ]"
              size="medium"
              class="compact-select"
            />
          </div>
          
          <!-- 필터 그룹 -->
          <div class="toolbar-section filter-group">
            <span class="filter-group-label">필터:</span>
            <div class="switch-group">
              <div class="compact-switch" title="참조원고 있는 항목만">
                <n-switch v-model:value="isOnlyWithRef" size="medium" />
                <span class="compact-switch-label">참조</span>
              </div>
              <div class="compact-switch" title="블로그 ID 있는 항목만">
                <n-switch v-model:value="isOnlyWithBlogId" size="medium" />
                <span class="compact-switch-label">ID</span>
              </div>
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
                    <span v-if="item.blogId" class="blog-id-badge">
                      <LinkIcon class="ref-icon" />
                      ID: {{ item.blogId.length > 10 ? item.blogId.substring(0, 10) + '...' : item.blogId }}
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
        width: '560px',
        maxWidth: 'calc(100vw - 32px)',
        maxHeight: 'calc(100vh - 100px)',
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
            <n-space v-if="editingMemo !== selectedItem.id" size="small">
              <n-button size="tiny" @click="startEditMemo(selectedItem)">
                편집
              </n-button>
              <n-button
                size="tiny"
                @click="openMarkdownEditor(selectedItem)"
                title="마크다운으로 수정하기"
                style="color: #6366f1"
              >
                <MarkdownIcon
                  style="width: 12px; height: 12px; margin-right: 2px"
                />
                MD
              </n-button>
            </n-space>
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
            <strong>블로그 ID:</strong>
            <n-space v-if="editingBlogId !== selectedItem.id" size="small">
              <n-button size="tiny" @click="startEditBlogId(selectedItem)">
                편집
              </n-button>
            </n-space>
            <n-space v-else size="small">
              <n-button
                size="tiny"
                type="primary"
                @click="saveBlogId(selectedItem)"
              >
                저장
              </n-button>
              <n-button size="tiny" @click="cancelEditBlogId"> 취소 </n-button>
            </n-space>
          </div>
          <div v-if="editingBlogId === selectedItem.id" class="memo-edit">
            <n-input
              v-model:value="tempBlogId"
              placeholder="네이버 블로그 포스트 ID 등을 입력하세요 (Shift+Enter로 저장)"
              @keydown="handleBlogIdKeydown($event, selectedItem)"
            />
          </div>
          <div v-else class="memo-display">
            {{ selectedItem.blogId || '블로그 ID가 없습니다.' }}
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

    <!-- 마크다운 에디터 모달 -->
    <n-modal
      v-model:show="showMarkdownEditor"
      preset="card"
      :style="{
        width: '900px',
        maxWidth: 'calc(100vw - 32px)',
        maxHeight: 'calc(100vh - 80px)',
      }"
      class="markdown-editor-modal"
    >
      <template #header>
        <div style="display: flex; align-items: center; gap: 8px">
          <MarkdownIcon style="width: 20px; height: 20px; color: #6366f1" />
          마크다운 에디터
        </div>
      </template>

      <div class="markdown-editor-container">
        <!-- 에디터 헤더 -->
        <div class="editor-header">
          <n-space align="center" justify="space-between">
            <span style="color: #6366f1; font-weight: 600; font-size: 14px">
              실시간 마크다운 에디터
            </span>
            <div
              style="
                display: flex;
                flex-direction: column;
                align-items: end;
                gap: 2px;
              "
            >
              <n-text depth="3" style="font-size: 12px">
                **굵게**, *기울임*, `코드`, # 제목, - 리스트, [링크](url)
              </n-text>
              <n-text
                depth="3"
                style="font-size: 11px; color: #10b981; font-weight: 500"
              >
                💾 Shift + Enter로 저장
              </n-text>
            </div>
          </n-space>
        </div>

        <!-- 분할 에디터 -->
        <div class="split-editor">
          <!-- 왼쪽: 마크다운 입력 -->
          <div class="editor-input-panel">
            <div class="panel-header">
              <MarkdownIcon
                style="
                  width: 14px;
                  height: 14px;
                  margin-right: 4px;
                  color: #6366f1;
                "
              />
              <span>마크다운 입력</span>
            </div>
            <n-input
              v-model:value="markdownContent"
              type="textarea"
              placeholder="# 제목&#10;&#10;**굵은 글씨**, *기울임체*, `코드`&#10;&#10;- 리스트 항목&#10;- 또 다른 항목&#10;&#10;[링크](https://example.com)"
              class="markdown-input"
              show-count
              @keydown="handleMarkdownKeydown"
            />
          </div>

          <!-- 오른쪽: 실시간 미리보기 -->
          <div class="editor-preview-panel">
            <div class="panel-header">
              <PreviewIcon
                style="
                  width: 14px;
                  height: 14px;
                  margin-right: 4px;
                  color: #10b981;
                "
              />
              <span>실시간 미리보기</span>
            </div>
            <div class="live-preview">
              <div
                class="markdown-content"
                v-html="renderMarkdown(markdownContent)"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <n-space justify="end">
          <n-button @click="closeMarkdownEditor">취소</n-button>
          <n-button type="primary" @click="saveMarkdownMemo">저장</n-button>
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
  margin-bottom: 2px;
}

.title-icon {
  width: 20px !important;
  height: 20px !important;
  color: #3b82f6;
  flex-shrink: 0;
  min-width: 20px;
  min-height: 20px;
  max-width: 20px;
  max-height: 20px;
}

.page-title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1.2;
}

:global(.dark) .page-title {
  color: #fff;
}

.page-subtitle {
  margin: 0;
  font-size: 13px;
  color: #666;
  font-weight: 500;
}

:global(.dark) .page-subtitle {
  color: #94a3b8;
}

/* Toolbar */
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
.published-badge-icon {
  width: 16px;
  height: 16px;
  color: #10b981;
  background: rgba(16, 185, 129, 0.15);
  border-radius: 50%;
  padding: 2px;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.18),
    0 6px 18px rgba(16, 185, 129, 0.25);
  flex-shrink: 0;
}

.modal-badge-icon {
  width: 18px;
  height: 18px;
  color: #10b981;
  flex-shrink: 0;
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
  display: flex;
  align-items: center;
  gap: 3px;
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
  padding: 10px 12px;
  border-radius: 8px;
  max-height: 100px;
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
  margin-bottom: 12px;
}

.modal-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
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

.memo-display {
  margin: 4px 0;
  color: #555;
  font-size: 13px;
  line-height: 1.4;
  white-space: pre-wrap;
  word-break: break-word;
  background: rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.06);
  padding: 10px 12px;
  border-radius: 8px;
  max-height: 100px;
  overflow-y: auto;

  /* 스크롤바 스타일링 */
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
}

.memo-display::-webkit-scrollbar {
  width: 6px;
}

.memo-display::-webkit-scrollbar-track {
  background: transparent;
}

.memo-display::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.15);
  border-radius: 3px;
}

.memo-display::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.25);
}

:global(.dark) .memo-display {
  color: #cbd5e1;
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.1);
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
}

:global(.dark) .memo-display::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
}

:global(.dark) .memo-display::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

.memo-edit {
  margin-top: 8px;
}

.exposure-controls {
  margin-top: 6px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 6px;
}

:global(.dark) .exposure-controls {
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.08);
}

.exposure-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
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

/* 아이콘 크기 강제 제한 */
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

.published-badge-icon {
  width: 16px !important;
  height: 16px !important;
  min-width: 16px;
  min-height: 16px;
  max-width: 16px;
  max-height: 16px;
}

.modal-badge-icon {
  width: 18px !important;
  height: 18px !important;
  min-width: 18px;
  min-height: 18px;
  max-width: 18px;
  max-height: 18px;
}

/* Responsive */
@media (max-width: 768px) {
  .published-list-container {
    padding: 12px;
  }

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

@media (max-width: 480px) {
  .published-list-container {
    padding: 8px;
  }

  .header-wrapper {
    gap: 10px;
    padding: 6px 0;
  }

  .title-icon {
    width: 16px !important;
    height: 16px !important;
    min-width: 16px;
    min-height: 16px;
    max-width: 16px;
    max-height: 16px;
  }

  .page-title {
    font-size: 18px;
  }

  .page-subtitle {
    font-size: 11px;
  }

  .back-button {
    min-width: 36px;
    min-height: 36px;
  }
}

/* 마크다운 에디터 스타일 */
.markdown-editor-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.editor-header {
  padding: 12px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
}

:global(.dark) .editor-header {
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

.split-editor {
  display: flex;
  gap: 16px;
  height: 500px;
  flex: 1;
}

.editor-input-panel,
.editor-preview-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.markdown-input {
  flex: 1;
  height: 450px;
}

.markdown-input :deep(textarea) {
  height: 450px !important;
  resize: none;
  overflow-y: auto;

  /* 스크롤바 스타일링 */
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
}

.markdown-input :deep(textarea)::-webkit-scrollbar {
  width: 6px;
}

.markdown-input :deep(textarea)::-webkit-scrollbar-track {
  background: transparent;
}

.markdown-input :deep(textarea)::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.15);
  border-radius: 3px;
}

.markdown-input :deep(textarea)::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.25);
}

:global(.dark) .markdown-input :deep(textarea) {
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
}

:global(.dark) .markdown-input :deep(textarea)::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
}

:global(.dark) .markdown-input :deep(textarea)::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
  padding: 6px 0;
}

:global(.dark) .panel-header {
  color: #d1d5db;
}

.editor-input-panel .n-input {
  flex: 1;
}

.live-preview {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  height: 450px;
  max-height: 450px;

  /* 스크롤바 스타일링 */
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
}

.live-preview::-webkit-scrollbar {
  width: 6px;
}

.live-preview::-webkit-scrollbar-track {
  background: transparent;
}

.live-preview::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.15);
  border-radius: 3px;
}

.live-preview::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.25);
}

:global(.dark) .live-preview {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
}

:global(.dark) .live-preview::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
}

:global(.dark) .live-preview::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

.markdown-content h1,
.markdown-content h2,
.markdown-content h3 {
  margin: 16px 0 8px;
  color: #1a1a1a;
  font-weight: 600;
}

.markdown-content h1 {
  font-size: 24px;
}
.markdown-content h2 {
  font-size: 20px;
}
.markdown-content h3 {
  font-size: 16px;
}

:global(.dark) .markdown-content h1,
:global(.dark) .markdown-content h2,
:global(.dark) .markdown-content h3 {
  color: #e2e8f0;
}

.markdown-content strong {
  font-weight: 600;
  color: #374151;
}

:global(.dark) .markdown-content strong {
  color: #f3f4f6;
}

.markdown-content em {
  font-style: italic;
  color: #4b5563;
}

:global(.dark) .markdown-content em {
  color: #d1d5db;
}

.markdown-content code {
  background: rgba(79, 70, 229, 0.1);
  color: #4f46e5;
  padding: 2px 4px;
  border-radius: 4px;
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 13px;
}

:global(.dark) .markdown-content code {
  background: rgba(99, 102, 241, 0.2);
  color: #a5b4fc;
}

.markdown-content a {
  color: #3b82f6;
  text-decoration: none;
  border-bottom: 1px solid rgba(59, 130, 246, 0.3);
}

.markdown-content a:hover {
  border-bottom-color: #3b82f6;
}

.markdown-content li {
  margin: 4px 0;
  padding-left: 8px;
  position: relative;
}

.markdown-content li::before {
  content: '•';
  position: absolute;
  left: -8px;
  color: #6b7280;
}

.editor-help {
  flex: 1;
}

/* 마크다운 에디터 모바일 최적화 */
@media (max-width: 768px) {
  .markdown-editor-modal .n-card {
    margin: 16px;
  }

  .split-editor {
    flex-direction: column;
    height: auto;
    gap: 12px;
  }

  .editor-input-panel .n-input {
    min-height: 200px;
  }

  .live-preview {
    min-height: 200px;
    max-height: 300px;
  }

  .panel-header {
    font-size: 12px;
  }
}
</style>
