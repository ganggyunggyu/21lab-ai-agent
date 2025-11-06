import { storeToRefs } from 'pinia';
import type { FavoriteSearch } from '@/entities';
import { usePublishedStore } from '@/features';
import { PublishedApi } from '@/entities';
import { renderMarkdown } from '@/utils/markdown/renderer';

export const usePublishedModal = () => {
  // 직접 store 사용
  const publishedStore = usePublishedStore();
  
  // store actions 구조분해할당
  const {
    openDetailModal,
    openMarkdownModal,
    closeMarkdownModal,
    startEditMemo,
    cancelEditMemo,
    startEditBlogId,
    cancelEditBlogId,
  } = publishedStore;

  const itemClick = (item: FavoriteSearch) => {
    openDetailModal(item);
  };

  const saveMemo = (item: FavoriteSearch, tempMemo: string, onSuccess?: () => void) => {
    PublishedApi.updateMemo(item.id, tempMemo);
    item.memo = tempMemo;
    cancelEditMemo();
    onSuccess?.();
  };

  const memoKeydown = (
    e: KeyboardEvent,
    item: FavoriteSearch,
    tempMemo: string,
    onSuccess?: () => void
  ) => {
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      saveMemo(item, tempMemo, onSuccess);
    }
  };

  const saveBlogId = (item: FavoriteSearch, tempBlogId: string, onSuccess?: () => void) => {
    PublishedApi.updateBlogId(item.id, tempBlogId);
    item.blogId = tempBlogId;
    cancelEditBlogId();
    onSuccess?.();
  };

  const blogIdKeydown = (
    e: KeyboardEvent,
    item: FavoriteSearch,
    tempBlogId: string,
    onSuccess?: () => void
  ) => {
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      saveBlogId(item, tempBlogId, onSuccess);
    }
  };

  const openMarkdownEditor = (item: FavoriteSearch) => {
    openMarkdownModal(item.memo || '');
  };

  const saveMarkdownMemo = (selectedItem: FavoriteSearch, content: string, onSuccess?: () => void) => {
    PublishedApi.updateMemo(selectedItem.id, content);
    selectedItem.memo = content;
    closeMarkdownModal();
    onSuccess?.();
  };

  const markdownKeydown = (e: KeyboardEvent, selectedItem: FavoriteSearch, content: string, onSuccess?: () => void) => {
    if (e.shiftKey && e.key === 'Enter') {
      e.preventDefault();
      saveMarkdownMemo(selectedItem, content, onSuccess);
    }
  };

  const toggleVisibility = (item: FavoriteSearch, onSuccess?: () => void) => {
    const newVisibility = !item.isVisible;
    PublishedApi.updateExposure(item.id, newVisibility, item.exposureRank);
    item.isVisible = newVisibility;
    onSuccess?.();
  };

  const updateExposureRank = (
    item: FavoriteSearch,
    rank: number,
    onSuccess?: () => void
  ) => {
    PublishedApi.updateExposure(item.id, item.isVisible || false, rank);
    item.exposureRank = rank;
    onSuccess?.();
  };

  const toggleActive = (item: FavoriteSearch, onSuccess?: () => void) => {
    const newActiveState = !(item.isActive ?? true); // 기본값 true
    PublishedApi.updateActive(item.id, newActiveState);
    item.isActive = newActiveState;
    onSuccess?.();
  };

  return {
    // actions only
    itemClick,
    startEditMemo,
    saveMemo,
    cancelEditMemo,
    memoKeydown,
    startEditBlogId,
    saveBlogId,
    cancelEditBlogId,
    blogIdKeydown,
    openMarkdownEditor,
    saveMarkdownMemo,
    closeMarkdownModal,
    markdownKeydown,
    toggleVisibility,
    toggleActive,
    updateExposureRank,
    renderMarkdown,
  };
};