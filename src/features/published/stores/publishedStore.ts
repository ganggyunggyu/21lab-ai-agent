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
  const activeFilter = ref<'active' | 'inactive' | 'all'>('active'); // 기본값: 활성화만 보기
  
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
      
      // 활성화 필터링
      let matchesActive = true;
      if (activeFilter.value === 'active') {
        matchesActive = item.isActive !== false; // undefined나 true는 활성화로 간주
      } else if (activeFilter.value === 'inactive') {
        matchesActive = item.isActive === false;
      }
      // 'all'인 경우는 모든 항목 표시
      
      return matchesRef && matchesBlogId && matchesActive;
    });

    if (sortBy.value === 'title') {
      return filtered.sort((a, b) => a.title.localeCompare(b.title));
    }
    
    // 기본 정렬: 활성화 상태 > 블로그ID 그룹핑 > 날짜순
    return filtered.sort((a, b) => {
      // 1. 활성화 상태 우선 (활성화가 위로)
      const aActive = a.isActive !== false;
      const bActive = b.isActive !== false;
      
      if (aActive !== bActive) {
        return aActive ? -1 : 1; // 활성화된 것이 먼저
      }
      
      // 2. 블로그ID 그룹핑 (같은 ID끼리 붙어있게)
      const aBlogId = a.blogId || '';
      const bBlogId = b.blogId || '';
      
      if (aBlogId !== bBlogId) {
        // 블로그ID가 있는 것 우선, 그 다음 알파벳 순
        if (!aBlogId && bBlogId) return 1;
        if (aBlogId && !bBlogId) return -1;
        return aBlogId.localeCompare(bBlogId);
      }
      
      // 3. 같은 그룹 내에서는 날짜순 (최신순)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
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
    activeFilter,
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