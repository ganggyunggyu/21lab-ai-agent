<script setup lang="ts">
import { storeToRefs } from 'pinia';
import {
  Document as DocumentIcon,
  Send as SendIcon,
  StarOutline as StarOutlineIcon,
  Close as CloseIcon,
} from '@vicons/ionicons5';
import { Button, Card, Input } from '@/components/ui';
import { useChatStore } from '@/stores';
import { computed, watch, ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  getFrequentKeywords,
  addKeywordToFrequent,
  type FrequentKeyword,
  getFavoriteSearches,
  addFavoriteSearch,
  removeFavoriteSearch,
  type FavoriteSearch,
  getSearchHistory,
  addSearchHistory,
  type SearchHistory,
} from '@/utils';

const chatStore = useChatStore();
const router = useRouter();

const {
  keyword,
  refMsg,
  isLoading,
  showRefInput,
} = storeToRefs(chatStore);

const {
  handleGenerate,
} = chatStore;

const frequentKeywords = ref<FrequentKeyword[]>([]);

const favoriteSearches = ref<FavoriteSearch[]>([]);
const showFavorites = ref(false);
const favoritesRef = ref<HTMLElement | null>(null);

const searchHistory = ref<SearchHistory[]>([]);

const { service } = storeToRefs(chatStore);

const placeholderMap: Record<string, string> = {
  'gpt-merge': '원고 제목을 입력해주세요 (필수)',
  'gpt-5': '참조원고를 입력해주세요 (선택)',
  'gpt-4': '참조원고를 입력해주세요 (선택)',
  chunk: '입력하지 않아도 됩니다.',
};
const keywordPlaceholder: Record<string, string> = {
  'gpt-merge': '키워드를 입력해주세요.',
  'gpt-5': '키워드를 입력해주세요.',
  'gpt-4': '키워드를 입력해주세요.',
  chunk: '키워드를 입력해주세요.',
  clean: '키워드를 입력해주세요.',
  translation_compare: '책 제목 - 작가명을 입력해주세요. (예: 데미안 - 헤르만 헤세)',
};

const defaultPlaceholder = '참고 문서나 컨텍스트를 입력해주세요 (선택사항)';
const keywordDefaultPlaceholder = '키워드를 입력해주세요.';

const getKeywordPlaceholder = (service: string) => {
  return keywordPlaceholder[service] || keywordDefaultPlaceholder;
};

const refPlaceholder = computed(
  () => placeholderMap[service.value] ?? defaultPlaceholder
);

const loadFrequentKeywords = () => {
  frequentKeywords.value = getFrequentKeywords();
};

const loadFavoriteSearches = () => {
  favoriteSearches.value = getFavoriteSearches();
};

const loadSearchHistory = () => {
  searchHistory.value = getSearchHistory();
};

const handleAddFavorite = () => {
  const title = prompt('즐겨찾기 이름을 입력하세요:', keyword.value);
  if (title) {
    addFavoriteSearch(keyword.value, refMsg.value, title);
    loadFavoriteSearches();
  }
};

const handleFavoriteClick = (favorite: FavoriteSearch) => {
  keyword.value = favorite.keyword;
  if (favorite.refMsg) {
    refMsg.value = favorite.refMsg;
    showRefInput.value = true;
  } else {
    showRefInput.value = false;
  }
  showFavorites.value = false;

  handleGenerate();
};

const handleRemoveFavorite = (id: string, event: Event) => {
  event.stopPropagation();
  removeFavoriteSearch(id);
  loadFavoriteSearches();
};

const handlePublishedList = () => {
  showFavorites.value = false;
  router.push('/published');
};

const cleanText = (text: string) => {
  return text
    .replace(/Previous imageNext image/gi, ' ')
    .replace(/Previous image/gi, ' ')
    .replace(/Next image/gi, ' ')
    .trim();
};

const handleGenerateWithKeyword = () => {
  if (keyword.value.trim()) {
    addKeywordToFrequent(keyword.value.trim());
    addSearchHistory(keyword.value.trim(), refMsg.value, service.value);
    loadFrequentKeywords();
    loadSearchHistory();
  }
  handleGenerate();
};

const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  if (favoritesRef.value && !favoritesRef.value.contains(target)) {
    showFavorites.value = false;
  }
};

onMounted(() => {
  loadFrequentKeywords();
  loadFavoriteSearches();
  loadSearchHistory();
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

watch(refMsg, (newVal) => {
  if (!newVal) return;
  const cleaned = cleanText(newVal);
  if (cleaned !== newVal) {
    refMsg.value = cleaned;
  }
});
</script>
<template>
  <footer
    class="footer-container"
    ref="footerRef"
    role="contentinfo"
    aria-label="채팅 입력 영역"
  >
    <section class="footer-content" aria-label="메시지 입력 컨테이너">
      <div class="footer-inner">
        <transition
          enter-active-class="ref-enter-active"
          leave-active-class="ref-leave-active"
          enter-from-class="ref-enter-from"
          leave-to-class="ref-enter-from"
          enter-to-class="ref-enter-to"
          leave-from-class="ref-enter-to"
        >
          <section
            v-show="showRefInput"
            class="ref-section"
            aria-label="참조 원고 입력 영역"
          >
            <Input
              v-model="refMsg"
              type="textarea"
              :rows="2"
              :placeholder="refPlaceholder"
              class="footer-textarea"
              @focus="showRefInput = true"
              @blur="showRefInput = false"
            />
          </section>
        </transition>

        <section
          class="main-input-section"
          aria-label="메인 입력 영역"
        >
          <Input
            v-model="keyword"
            type="text"
            :placeholder="getKeywordPlaceholder(service)"
            class="footer-input"
            :on-enter="handleGenerateWithKeyword"
            prevent-enter-submit
            @focus="showRefInput = true"
            @blur="showRefInput = false"
          />

          <nav class="action-buttons" aria-label="입력 관련 액션">
              <Button
                color="light"
                variant="weak"
                size="sm"
                icon-only
                :icon="DocumentIcon"
                @click="showRefInput = !showRefInput"
                :class="['action-btn', showRefInput ? 'action-btn-active' : 'action-btn-inactive']"
                aria-label="참조 입력 토글"
              />

              <div class="favorites-wrapper" ref="favoritesRef">
                <Button
                  color="light"
                  variant="weak"
                  size="sm"
                  icon-only
                  :icon="StarOutlineIcon"
                  @click.stop="showFavorites = !showFavorites"
                  class="action-btn action-btn-inactive"
                  aria-label="즐겨찾기"
                />

                <Transition
                  enter-active-class="popover-enter-active"
                  leave-active-class="popover-leave-active"
                  enter-from-class="popover-enter-from"
                  leave-to-class="popover-enter-from"
                >
                  <div
                    v-if="showFavorites"
                    class="favorites-popover"
                    role="dialog"
                    aria-label="즐겨찾기 관리"
                  >
                    <header class="favorites-header">
                      <h3 class="favorites-title">즐겨찾기 검색</h3>
                      <div class="favorites-actions">
                        <Button
                          color="light"
                          size="sm"
                          @click="handlePublishedList"
                        >
                          발행원고 목록
                        </Button>
                        <Button
                          v-if="keyword.trim()"
                          color="primary"
                          size="sm"
                          @click="handleAddFavorite"
                        >
                          추가
                        </Button>
                      </div>
                    </header>

                    <section v-if="favoriteSearches.length === 0" class="favorites-empty">
                      <p>저장된 즐겨찾기가 없습니다</p>
                    </section>

                    <section v-else class="favorites-list" role="list">
                      <article
                        v-for="favorite in favoriteSearches"
                        :key="favorite.id"
                        :class="['favorite-item', favorite.isPublished && 'favorite-item-published']"
                        @click="handleFavoriteClick(favorite)"
                        role="listitem"
                        tabindex="0"
                        :aria-label="`즐겨찾기: ${favorite.title}`"
                      >
                        <div class="favorite-content">
                          <h4 class="favorite-title">
                            <span v-if="favorite.isPublished" class="published-badge">✓</span>
                            {{ favorite.title }}
                          </h4>
                          <p class="favorite-keyword">{{ favorite.keyword }}</p>
                          <p v-if="favorite.refMsg" class="favorite-ref">
                            참조: {{ favorite.refMsg.slice(0, 50) }}...
                          </p>
                        </div>
                        <Button
                          color="danger"
                          size="sm"
                          @click="handleRemoveFavorite(favorite.id, $event)"
                          :aria-label="`${favorite.title} 삭제`"
                        >
                          삭제
                        </Button>
                      </article>
                    </section>
                  </div>
                </Transition>
              </div>

              <Button
                v-if="keyword"
                color="primary"
                size="sm"
                icon-only
                :icon="SendIcon"
                @click="handleGenerateWithKeyword"
                aria-label="메시지 전송"
              />
            </nav>
        </section>

        <footer class="footer-info" aria-label="입력 정보">
          <div v-if="keyword.length > 0" class="char-count">
            {{ keyword.length }}/1000
          </div>
        </footer>
      </div>
    </section>
  </footer>
</template>

<style scoped>
.footer-container {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100vw;
  max-width: 90vw;
  z-index: 100;
}

@media (min-width: 768px) {
  .footer-container {
    max-width: calc(100vw - 32px);
  }
}

@media (max-width: 767px) {
  .footer-container {
    max-width: 100%;
  }
}

.footer-content {
  position: relative;
}

.footer-inner {
  padding: var(--space-4);
  background-color: var(--color-bg-primary);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  border: 1px solid var(--color-border-primary);
  border-bottom: none;
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.ref-section {
  position: relative;
  overflow: hidden;
}

.main-input-section {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) 0;
  cursor: text;
}

.footer-input,
.footer-textarea {
  flex: 1;
  width: 100%;
}

.footer-input :deep(.input-wrapper),
.footer-textarea :deep(.input-wrapper) {
  gap: 0;
  width: 100%;
}

.footer-input :deep(.input-base),
.footer-textarea :deep(.input-base) {
  background: transparent;
  border: none;
  box-shadow: none;
  padding: var(--space-2) 0;
  height: auto;
  font-size: var(--text-base);
}

.footer-input :deep(.input-base:focus),
.footer-textarea :deep(.input-base:focus),
.footer-input :deep(.input-focused),
.footer-textarea :deep(.input-focused) {
  border: none;
  box-shadow: none;
}

.footer-textarea :deep(.input-base) {
  min-height: auto;
  border-bottom: 1px solid var(--color-border-primary);
  border-radius: 0;
  margin-bottom: var(--space-2);
}

.footer-inner:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 6px;
}

.action-btn {
  transition: opacity var(--transition-fast);
}

.action-btn-active {
  opacity: 1;
}

.action-btn-inactive {
  opacity: 0.6;
}

.action-btn-inactive:hover {
  opacity: 1;
}

.favorites-wrapper {
  position: relative;
}

.favorites-popover {
  position: absolute;
  bottom: calc(100% + 8px);
  right: 0;
  width: 320px;
  max-height: 400px;
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-xl);
  overflow: hidden;
}

.favorites-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border-primary);
  background-color: var(--color-bg-secondary);
}

.favorites-title {
  margin: 0;
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
}

.favorites-actions {
  display: flex;
  gap: var(--space-2);
}

.favorites-empty {
  padding: var(--space-8);
  text-align: center;
}

.favorites-empty p {
  color: var(--color-text-tertiary);
  margin: 0;
}

.favorites-list {
  max-height: 300px;
  overflow-y: auto;
  padding: var(--space-2);
}

.favorite-item {
  display: flex;
  align-items: flex-start;
  padding: var(--space-3);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background-color var(--transition-fast);
  margin-bottom: var(--space-2);
}

.favorite-item:last-child {
  margin-bottom: 0;
}

.favorite-item:hover {
  background-color: var(--color-bg-secondary);
}

.favorite-item-published {
  background-color: rgba(0, 196, 113, 0.05);
  border-color: rgba(0, 196, 113, 0.3);
}

.favorite-content {
  flex: 1;
  min-width: 0;
}

.favorite-title {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-1) 0;
  display: flex;
  align-items: center;
}

.published-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  background-color: var(--color-success);
  color: white;
  border-radius: 50%;
  font-size: 10px;
  font-weight: var(--font-bold);
  margin-right: 6px;
}

.favorite-keyword {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  margin: 0 0 2px 0;
}

.favorite-ref {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  margin: 0;
}

.footer-info {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.char-count {
  font-size: var(--text-xs);
  color: var(--color-text-disabled);
}

/* Reference Section Transitions */
.ref-enter-active,
.ref-leave-active {
  transition: max-height 260ms cubic-bezier(0.2, 0.8, 0.2, 1),
              opacity 260ms cubic-bezier(0.2, 0.8, 0.2, 1),
              transform 260ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.ref-enter-from {
  max-height: 0;
  opacity: 0;
  transform: translateY(-6px);
}

.ref-enter-to {
  max-height: 180px;
  opacity: 1;
  transform: translateY(0);
}

/* Popover Transitions */
.popover-enter-active,
.popover-leave-active {
  transition: opacity var(--transition-fast), transform var(--transition-fast);
}

.popover-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
</style>
