import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import type { FavoriteSearch, SortBy } from '@/entities/published';
import { PublishedApi } from '@/entities/published';

export const usePublishedStore = defineStore('published', () => {
  // ===== 비즈니스 데이터 =====
  const articles = ref<FavoriteSearch[]>([]);
  const sortBy = ref<SortBy>('recent');
  const isOnlyWithRef = ref<boolean>(false);
  const isOnlyWithBlogId = ref<boolean>(false);
  
  // ===== UI 상태 =====
  const detailModal = ref({
    open: false,
    selectedItem: null as FavoriteSearch | null,
  });
  
  const markdownModal = ref({
    open: false,
    content: '',
  });
  
  const editing = ref({
    memo: null as string | null,
    tempMemo: '',
    blogId: null as string | null,
    tempBlogId: '',
  });
  
  const loading = ref({
    list: false,
    delete: false,
    save: false,
  });

  // ===== COMPUTED =====
  const displayList = computed(() => {
    const filtered = articles.value.filter(item => {
      const matchesRef = !isOnlyWithRef.value || !!item.refMsg;
      const matchesBlogId = !isOnlyWithBlogId.value || !!item.blogId;
      return matchesRef && matchesBlogId;
    });

    if (sortBy.value === 'title') {
      return filtered.sort((a, b) => a.title.localeCompare(b.title));
    }
    
    return filtered.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  });

  const getBlogIdGroups = computed(() => {
    const groups = new Map<string, FavoriteSearch[]>();
    
    displayList.value.forEach(item => {
      if (item.blogId) {
        if (!groups.has(item.blogId)) {
          groups.set(item.blogId, []);
        }
        groups.get(item.blogId)!.push(item);
      }
    });
    
    return groups;
  });

  // ===== ACTIONS =====
  const loadArticles = () => {
    loading.value.list = true;
    try {
      articles.value = PublishedApi.getAll();
    } finally {
      loading.value.list = false;
    }
  };

  const openDetailModal = (item: FavoriteSearch) => {
    detailModal.value.open = true;
    detailModal.value.selectedItem = item;
  };
  
  const closeDetailModal = () => {
    detailModal.value.open = false;
    detailModal.value.selectedItem = null;
    cancelEditMemo();
    cancelEditBlogId();
  };
  
  const openMarkdownModal = (content = '') => {
    markdownModal.value.open = true;
    markdownModal.value.content = content;
  };
  
  const closeMarkdownModal = () => {
    markdownModal.value.open = false;
    markdownModal.value.content = '';
  };
  
  const startEditMemo = (itemId: string, memo = '') => {
    editing.value.memo = itemId;
    editing.value.tempMemo = memo;
  };
  
  const cancelEditMemo = () => {
    editing.value.memo = null;
    editing.value.tempMemo = '';
  };

  const startEditBlogId = (itemId: string, blogId = '') => {
    editing.value.blogId = itemId;
    editing.value.tempBlogId = blogId;
  };
  
  const cancelEditBlogId = () => {
    editing.value.blogId = null;
    editing.value.tempBlogId = '';
  };

  return {
    articles,
    sortBy,
    isOnlyWithRef,
    isOnlyWithBlogId,
    detailModal,
    markdownModal,
    editing,
    loading,
    
    displayList,
    getBlogIdGroups,
    
    // Actions
    loadArticles,
    openDetailModal,
    closeDetailModal,
    openMarkdownModal,
    closeMarkdownModal,
    startEditMemo,
    cancelEditMemo,
    startEditBlogId,
    cancelEditBlogId,
  };
});