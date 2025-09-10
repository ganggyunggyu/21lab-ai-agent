import { ref } from 'vue';
import type { FavoriteSearch } from '@/entities/published';
import { PublishedApi } from '@/entities/published';
import { renderMarkdown } from '@/utils/markdown/renderer';

export const usePublishedModal = () => {
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

  // 모달 열기
  const handleItemClick = (item: FavoriteSearch) => {
    selectedItem.value = item;
    showDetailModal.value = true;
  };

  // 메모 편집 관련 함수
  const startEditMemo = (item: FavoriteSearch) => {
    editingMemo.value = item.id;
    tempMemo.value = item.memo || '';
  };

  const saveMemo = (item: FavoriteSearch, onSuccess?: () => void) => {
    PublishedApi.updateMemo(item.id, tempMemo.value);
    item.memo = tempMemo.value; // 즉시 화면 업데이트
    editingMemo.value = null;
    onSuccess?.();
  };

  const cancelEditMemo = () => {
    editingMemo.value = null;
    tempMemo.value = '';
  };

  const handleMemoKeydown = (e: KeyboardEvent, item: FavoriteSearch, onSuccess?: () => void) => {
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      saveMemo(item, onSuccess);
    }
  };

  // 블로그 ID 편집 관련 함수
  const startEditBlogId = (item: FavoriteSearch) => {
    editingBlogId.value = item.id;
    tempBlogId.value = item.blogId || '';
  };

  const saveBlogId = (item: FavoriteSearch, onSuccess?: () => void) => {
    PublishedApi.updateBlogId(item.id, tempBlogId.value);
    item.blogId = tempBlogId.value; // 즉시 화면 업데이트
    editingBlogId.value = null;
    onSuccess?.();
  };

  const cancelEditBlogId = () => {
    editingBlogId.value = null;
    tempBlogId.value = '';
  };

  const handleBlogIdKeydown = (e: KeyboardEvent, item: FavoriteSearch, onSuccess?: () => void) => {
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      saveBlogId(item, onSuccess);
    }
  };

  // 마크다운 에디터 관련 함수들
  const openMarkdownEditor = (item: FavoriteSearch) => {
    markdownContent.value = item.memo || '';
    showMarkdownEditor.value = true;
  };

  const saveMarkdownMemo = (onSuccess?: () => void) => {
    if (selectedItem.value) {
      PublishedApi.updateMemo(selectedItem.value.id, markdownContent.value);
      selectedItem.value.memo = markdownContent.value; // 즉시 화면 업데이트
      showMarkdownEditor.value = false;
      onSuccess?.();
    }
  };

  const closeMarkdownEditor = () => {
    showMarkdownEditor.value = false;
    markdownContent.value = '';
  };

  const handleMarkdownKeydown = (e: KeyboardEvent, onSuccess?: () => void) => {
    if (e.shiftKey && e.key === 'Enter') {
      e.preventDefault();
      saveMarkdownMemo(onSuccess);
    }
  };

  // 노출 설정 관련 함수들
  const toggleVisibility = (item: FavoriteSearch, onSuccess?: () => void) => {
    const newVisibility = !item.isVisible;
    PublishedApi.updateExposure(item.id, newVisibility, item.exposureRank);
    item.isVisible = newVisibility;
    onSuccess?.();
  };

  const updateExposureRank = (item: FavoriteSearch, rank: number, onSuccess?: () => void) => {
    PublishedApi.updateExposure(item.id, item.isVisible || false, rank);
    item.exposureRank = rank;
    onSuccess?.();
  };

  return {
    // State
    showDetailModal,
    selectedItem,
    editingMemo,
    tempMemo,
    editingBlogId,
    tempBlogId,
    showMarkdownEditor,
    markdownContent,

    // Methods
    handleItemClick,
    startEditMemo,
    saveMemo,
    cancelEditMemo,
    handleMemoKeydown,
    startEditBlogId,
    saveBlogId,
    cancelEditBlogId,
    handleBlogIdKeydown,
    openMarkdownEditor,
    saveMarkdownMemo,
    closeMarkdownEditor,
    handleMarkdownKeydown,
    toggleVisibility,
    updateExposureRank,

    // Utils
    renderMarkdown
  };
};