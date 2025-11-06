import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import type { FavoriteSearch, BlogIdGroupInfo } from '@/entities';
import { useChatStore } from '@/stores';
import { usePublishedStore } from '@/features';
import { PublishedApi } from '@/entities';

export const usePublishedList = () => {
  const chatStore = useChatStore();
  const { keyword, refMsg, showRefInput } = storeToRefs(chatStore);

  // 직접 store 사용
  const publishedStore = usePublishedStore();
  const {
    articles,
    sortBy,
    isOnlyWithRef,
    isOnlyWithBlogId,
    displayList,
    getBlogIdGroups,
  } = storeToRefs(publishedStore);

  // 아이템이 그룹의 몇 번째인지 확인
  const getItemGroupInfo = (item: FavoriteSearch): BlogIdGroupInfo | null => {
    if (!item.blogId) return null;

    const group = getBlogIdGroups.value.get(item.blogId);
    if (!group || group.length <= 1) return null;

    const sortedGroup = [...group].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const index = sortedGroup.findIndex((g) => g.id === item.id);
    return {
      total: group.length,
      position: index + 1,
      isLatest: index === 0,
    };
  };

  // 키워드 복사
  const handleCopyKeyword = (item: FavoriteSearch) => {
    navigator.clipboard.writeText(item.keyword);
  };

  // 템플릿 사용 (채팅으로 이동) - storeToRefs 반응성 보장
  const handleUseTemplate = (item: FavoriteSearch) => {
    keyword.value = item.keyword;
    if (item.refMsg) {
      refMsg.value = item.refMsg;
      showRefInput.value = true;
    }
    // 채팅 페이지로 이동
    window.location.href = '/';
  };

  // 발행원고 삭제
  const handleDelete = (item: FavoriteSearch) => {
    if (confirm('이 발행원고를 삭제하시겠습니까?')) {
      PublishedApi.delete(item.id);
      publishedStore.loadArticles();
    }
  };

  onMounted(() => {
    publishedStore.loadArticles();
  });

  return {
    // Store State (storeToRefs로 반응성 보장)
    publishedList: articles,
    sortBy,
    isOnlyWithRef,
    isOnlyWithBlogId,
    displayList,

    loadPublishedList: publishedStore.loadArticles,
    getItemGroupInfo,
    handleCopyKeyword,
    handleUseTemplate,
    handleDelete,
  };
};