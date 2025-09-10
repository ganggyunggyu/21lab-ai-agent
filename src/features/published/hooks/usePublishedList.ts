import { ref, computed, onMounted } from 'vue';
import type { FavoriteSearch, SortBy, BlogIdGroupInfo } from '@/entities/published';
import { PublishedApi } from '@/entities/published';

export const usePublishedList = () => {
  const publishedList = ref<FavoriteSearch[]>([]);
  const sortBy = ref<SortBy>('recent');
  const isOnlyWithRef = ref<boolean>(false);
  const isOnlyWithBlogId = ref<boolean>(false);

  const loadPublishedList = () => {
    publishedList.value = PublishedApi.getAll();
  };

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

  // 블로그 ID별 그룹 정보 계산
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

  // 아이템이 그룹의 몇 번째인지 확인
  const getItemGroupInfo = (item: FavoriteSearch): BlogIdGroupInfo | null => {
    if (!item.blogId) return null;
    
    const group = getBlogIdGroups.value.get(item.blogId);
    if (!group || group.length <= 1) return null;
    
    const sortedGroup = [...group].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    const index = sortedGroup.findIndex(g => g.id === item.id);
    return {
      total: group.length,
      position: index + 1,
      isLatest: index === 0
    };
  };

  onMounted(() => {
    loadPublishedList();
  });

  return {
    // State
    publishedList,
    sortBy,
    isOnlyWithRef,
    isOnlyWithBlogId,
    
    // Computed
    displayList,
    
    // Methods
    loadPublishedList,
    getItemGroupInfo
  };
};