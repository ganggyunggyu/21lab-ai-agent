<script setup lang="ts">
import { storeToRefs } from 'pinia';
import {
  NText,
  NPopover,
  NCard,
  NButton,
  NSpace,
} from 'naive-ui';
import {
  Document as DocumentIcon,
  Send as SendIcon,
  StarOutline as StarOutlineIcon,
} from '@vicons/ionicons5';
import { Button, Card, Input } from '@/components/ui';
import { useChatStore } from '@/stores';
import { computed, watch, ref, onMounted } from 'vue';
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

const {
  keyword,
  refMsg,
  isLoading,
  showRefInput,
} = storeToRefs(chatStore);

const {
  handleGenerate,
} = chatStore;

const handleEnterPress = () => {
  handleGenerate();
};

const frequentKeywords = ref<FrequentKeyword[]>([]);

const favoriteSearches = ref<FavoriteSearch[]>([]);
const showFavorites = ref(false);

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

onMounted(() => {
  loadFrequentKeywords();
  loadFavoriteSearches();
  loadSearchHistory();
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
    class="fixed bottom-0 left-1/2 -translate-x-1/2 w-screen max-w-[90vw] md:max-w-[calc(100vw-32px)] max-md:max-w-full z-[100]"
    ref="footerRef"
    role="contentinfo"
    aria-label="채팅 입력 영역"
  >
    <section class="relative" aria-label="메시지 입력 컨테이너">
      <div class="p-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-[30px] backdrop-saturate-[200%] rounded-t-[32px] border border-white/40 dark:border-gray-600/40 shadow-lg dark:shadow-black/50 relative overflow-hidden transition-all duration-300 flex flex-col gap-[5px] hover:-translate-y-1">
          <transition
            enter-active-class="transition-[max-height,opacity,transform,filter] duration-[260ms] ease-[cubic-bezier(0.2,0.8,0.2,1)]"
            leave-active-class="transition-[max-height,opacity,transform,filter] duration-[260ms] ease-[cubic-bezier(0.2,0.8,0.2,1)]"
            enter-from-class="max-h-0 opacity-0 -translate-y-[6px] blur-[1px]"
            leave-to-class="max-h-0 opacity-0 -translate-y-[6px] blur-[1px]"
            enter-to-class="max-h-[180px] opacity-100 translate-y-0 blur-0"
            leave-from-class="max-h-[180px] opacity-100 translate-y-0 blur-0"
          >
            <section
              v-show="showRefInput"
              class="pt-4 px-5 pb-0 relative overflow-hidden"
              aria-label="참조 원고 입력 영역"
            >
              <div class="mt-[5px] text-gray-900 dark:text-gray-100 flex items-end gap-2 bg-gradient-to-br from-slate-50/90 to-slate-100/80 dark:from-gray-800/90 dark:to-gray-700/80 border border-slate-200 dark:border-gray-600 rounded-3xl p-4 px-5 transition-all shadow-lg dark:shadow-black/30 relative overflow-hidden focus-within:border-indigo-400/40 dark:focus-within:border-blue-500/40 focus-within:shadow-xl dark:focus-within:shadow-blue-900/50" role="group" aria-label="참조 원고 입력">
                <Input
                  v-model="refMsg"
                  type="textarea"
                  :rows="1"
                  :autosize="{ minRows: 1, maxRows: 4 }"
                  :placeholder="refPlaceholder"
                  class="flex-1"
                  @focus="showRefInput = true"
                  @blur="showRefInput = false"
                  aria-label="참조 원고 텍스트 영역"
                />
              </div>
            </section>
          </transition>

          <section aria-label="메인 입력 영역">
          <div
            class="mt-[5px] text-gray-900 dark:text-gray-100 flex items-end gap-2 bg-gradient-to-br from-slate-50/90 to-slate-100/80 dark:from-gray-800/90 dark:to-gray-700/80 border border-slate-200 dark:border-gray-600 rounded-3xl p-4 px-5 transition-all shadow-lg dark:shadow-black/30 relative overflow-hidden focus-within:border-indigo-400/40 dark:focus-within:border-blue-500/40 focus-within:shadow-xl dark:focus-within:shadow-blue-900/50"
            role="group"
            aria-label="키워드 입력 및 액션"
          >
            <Input
              v-model="keyword"
              type="text"
              :rows="1"
              :autosize="{ minRows: 1, maxRows: 4 }"
              :placeholder="getKeywordPlaceholder(service)"
              class="flex-1"
              :onEnter="handleEnterPress"
              @focus="showRefInput = true"
              @blur="showRefInput = false"
              aria-label="키워드 입력"
            />

            <nav class="flex items-center gap-[6px]" aria-label="입력 관련 액션">
              <Button
                variant="ghost"
                size="sm"
                icon-only
                :icon="DocumentIcon"
                @click="showRefInput = !showRefInput"
                :class="showRefInput ? 'opacity-100' : 'opacity-60 hover:opacity-100'"
                aria-label="참조 입력 토글"
              />

              <n-popover
                trigger="click"
                v-model:show="showFavorites"
                placement="top"
              >
                <template #trigger>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon-only
                    :icon="StarOutlineIcon"
                    class="opacity-60 hover:opacity-100"
                    aria-label="즐겨찾기"
                  />
                </template>

                <n-card
                  class="max-w-[300px] max-h-[400px] overflow-y-auto !bg-white dark:!bg-gray-800 !border-gray-200 dark:!border-gray-600"
                  size="small"
                  role="dialog"
                  aria-label="즐겨찾기 관리"
                >
                  <template #header>
                    <header class="flex justify-between items-center mb-2">
                      <h3 class="m-0 text-sm font-semibold text-gray-700 dark:text-gray-200">즐겨찾기 검색</h3>
                      <nav aria-label="즐겨찾기 액션">
                        <n-space size="small">
                          <n-button
                            size="small"
                            type="success"
                            @click="
                              () => {
                                showFavorites = false;
                                $router.push('/published');
                              }
                            "
                            class="text-[11px]"
                            aria-label="발행원고 목록으로 이동"
                          >
                            📝 발행원고 목록
                          </n-button>
                          <n-button
                            v-if="keyword.trim()"
                            size="small"
                            type="primary"
                            @click="handleAddFavorite"
                            aria-label="현재 검색을 즐겨찾기에 추가"
                          >
                            추가
                          </n-button>
                        </n-space>
                      </nav>
                    </header>
                  </template>

                  <section
                    v-if="favoriteSearches.length === 0"
                    aria-label="즐겨찾기 없음"
                  >
                    <p class="text-center text-gray-500 dark:text-gray-400 p-5">
                      저장된 즐겨찾기가 없습니다
                    </p>
                  </section>

                  <section
                    v-else
                    aria-label="즐겨찾기 목록"
                  >
                    <n-space vertical size="small" role="list">
                      <article
                        v-for="favorite in favoriteSearches"
                        :key="favorite.id"
                        class="flex items-start p-2 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer transition-all duration-200 hover:bg-indigo-500/5 dark:hover:bg-blue-500/10 hover:border-indigo-500/20 dark:hover:border-blue-500/30"
                        :class="favorite.isPublished ? 'bg-gradient-to-br from-emerald-500/[0.08] to-emerald-500/[0.04] dark:from-emerald-500/[0.12] dark:to-emerald-500/[0.08] border-emerald-500/30 dark:border-emerald-500/40 hover:from-emerald-500/[0.12] hover:to-emerald-500/[0.06] dark:hover:from-emerald-500/[0.16] dark:hover:to-emerald-500/[0.10] hover:border-emerald-500/40 dark:hover:border-emerald-500/50' : ''"
                        @click="handleFavoriteClick(favorite)"
                        role="listitem"
                        tabindex="0"
                        :aria-label="`즐겨찾기: ${favorite.title}`"
                      >
                        <div class="flex-1">
                          <h4 class="font-semibold text-sm text-gray-900 dark:text-gray-100 m-0 mb-1">
                            <span
                              v-if="favorite.isPublished"
                              class="inline-block w-4 h-4 bg-gradient-to-br from-emerald-500 to-emerald-600 dark:from-emerald-400 dark:to-emerald-500 text-white rounded-full text-center leading-4 text-[10px] font-bold mr-[6px] shadow-[0_2px_4px_rgba(16,185,129,0.3)] dark:shadow-[0_2px_4px_rgba(16,185,129,0.5)]"
                              aria-label="발행됨"
                              >✓</span
                            >
                            {{ favorite.title }}
                          </h4>
                          <p class="text-xs text-gray-600 dark:text-gray-400 m-0 mb-[2px]">
                            {{ favorite.keyword }}
                          </p>
                          <p v-if="favorite.refMsg" class="text-[11px] text-gray-500 dark:text-gray-500 m-0">
                            참조: {{ favorite.refMsg.slice(0, 50) }}...
                          </p>
                        </div>
                        <n-button
                          size="tiny"
                          type="error"
                          @click="handleRemoveFavorite(favorite.id, $event)"
                          class="ml-auto"
                          :aria-label="`${favorite.title} 삭제`"
                        >
                          삭제
                        </n-button>
                      </article>
                    </n-space>
                  </section>
                </n-card>
              </n-popover>

              <Button
                v-if="keyword"
                variant="primary"
                size="sm"
                icon-only
                :icon="SendIcon"
                @click="handleGenerateWithKeyword"
                aria-label="메시지 전송"
              />
            </nav>
          </div>
        </section>

        <footer class="flex items-center justify-between mt-2 pt-2 border-t border-black/[0.04]" aria-label="입력 정보">
          <div
            class="text-xs"
            v-if="keyword.length > 0"
            aria-label="문자 수"
          >
            <n-text depth="3">{{ keyword.length }}/1000</n-text>
          </div>
        </footer>
      </div>
    </section>

  </footer>
</template>
