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
import { ModernButton, ModernCard, ModernInput } from '@/components/ui';
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

const handleEnterPress = (value: string) => {
  handleGenerate();
};

const handleShiftEnterPress = (value: string) => {
  // Shift+Enter는 줄바꿈으로 처리 (기본 동작)
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
    class="floating-input"
    ref="footerRef"
    role="contentinfo"
    aria-label="채팅 입력 영역"
  >
    <section class="input-container" aria-label="메시지 입력 컨테이너">
      <div variant="glass" class="input-card">
          <transition name="ref-slide">
            <section
              v-show="showRefInput"
              class="ref-input-section"
              aria-label="참조 원고 입력 영역"
            >
              <div class="input-surface" role="group" aria-label="참조 원고 입력">
                <ModernInput
                  v-model="refMsg"
                  type="textarea"
                  :rows="1"
                  :autosize="{ minRows: 1, maxRows: 4 }"
                  :placeholder="refPlaceholder"
                  class="main-input"
                  @focus="showRefInput = true"
                  @blur="showRefInput = false"
                  aria-label="참조 원고 텍스트 영역"
                />
              </div>
            </section>
          </transition>

          <section class="main-input-row" aria-label="메인 입력 영역">
          <div
            class="input-wrapper"
            role="group"
            aria-label="키워드 입력 및 액션"
          >
            <ModernInput
              v-model="keyword"
              type="text"
              :rows="1"
              :autosize="{ minRows: 1, maxRows: 4 }"
              :placeholder="getKeywordPlaceholder(service)"
              class="main-input"
              :onEnter="handleEnterPress"
              :onShiftEnter="handleShiftEnterPress"
              @focus="showRefInput = true"
              @blur="showRefInput = false"
              aria-label="키워드 입력"
            />

            <nav class="input-actions" aria-label="입력 관련 액션">
              <ModernButton
                variant="ghost"
                size="sm"
                icon-only
                :icon="DocumentIcon"
                @click="showRefInput = !showRefInput"
                :class="{ active: showRefInput }"
                aria-label="참조 입력 토글"
              />

              <!-- 즐겨찾기 버튼 -->
              <n-popover
                trigger="click"
                v-model:show="showFavorites"
                placement="top"
              >
                <template #trigger>
                  <ModernButton
                    variant="ghost"
                    size="sm"
                    icon-only
                    :icon="StarOutlineIcon"
                    aria-label="즐겨찾기"
                  />
                </template>

                <n-card
                  style="max-width: 300px; max-height: 400px; overflow-y: auto"
                  size="small"
                  role="dialog"
                  aria-label="즐겨찾기 관리"
                >
                  <template #header>
                    <header class="favorites-header">
                      <h3>즐겨찾기 검색</h3>
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
                            style="font-size: 11px"
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
                    class="empty-favorites"
                    aria-label="즐겨찾기 없음"
                  >
                    <p style="text-align: center; color: #999; padding: 20px">
                      저장된 즐겨찾기가 없습니다
                    </p>
                  </section>

                  <section
                    v-else
                    class="favorites-list"
                    aria-label="즐겨찾기 목록"
                  >
                    <n-space vertical size="small" role="list">
                      <article
                        v-for="favorite in favoriteSearches"
                        :key="favorite.id"
                        class="favorite-item"
                        :class="{ 'published-item': favorite.isPublished }"
                        @click="handleFavoriteClick(favorite)"
                        role="listitem"
                        tabindex="0"
                        :aria-label="`즐겨찾기: ${favorite.title}`"
                      >
                        <div class="favorite-content">
                          <h4 class="favorite-title">
                            <span
                              v-if="favorite.isPublished"
                              class="published-badge"
                              aria-label="발행됨"
                              >✓</span
                            >
                            {{ favorite.title }}
                          </h4>
                          <p class="favorite-keyword">
                            {{ favorite.keyword }}
                          </p>
                          <p v-if="favorite.refMsg" class="favorite-ref">
                            참조: {{ favorite.refMsg.slice(0, 50) }}...
                          </p>
                        </div>
                        <n-button
                          size="tiny"
                          type="error"
                          @click="handleRemoveFavorite(favorite.id, $event)"
                          style="margin-left: auto"
                          :aria-label="`${favorite.title} 삭제`"
                        >
                          삭제
                        </n-button>
                      </article>
                    </n-space>
                  </section>
                </n-card>
              </n-popover>

              <ModernButton
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

        <footer class="footer-info" aria-label="입력 정보">
          <div
            class="char-count"
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
<style scoped>
/* ===== FOOTER / INPUT ===== */
.floating-input {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100vw;
  max-width: 90vw;
  z-index: 100;

  /* 작은 화면에서 100vw */
  @media (max-width: 768px) {
    width: 100vw;
    max-width: 100vw;
  }
}
.input-container {
  position: relative;
}
.input-card {
  padding: 0;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(30px) saturate(200%);
  border-radius: 32px 32px 0 0;
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 20px 64px rgba(0, 0, 0, 0.1),
    0 1px 0 rgba(255, 255, 255, 0.8) inset, 0 -1px 0 rgba(0, 0, 0, 0.03) inset;
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.input-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  transition: left 0.6s ease;
}
.input-card:hover::before {
  left: 100%;
}
.input-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 32px 80px rgba(0, 0, 0, 0.15),
    0 1px 0 rgba(255, 255, 255, 0.9) inset;
}

/* 펼침/접힘(참고 입력) */
.ref-input-section {
  padding: 16px 20px 0;
  position: relative;
  overflow: hidden;
}
.ref-slide-enter-from,
.ref-slide-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-6px);
  filter: blur(1px);
}
.ref-slide-enter-to,
.ref-slide-leave-from {
  max-height: 180px;
  opacity: 1;
  transform: translateY(0);
  filter: none;
}
.ref-slide-enter-active,
.ref-slide-leave-active {
  transition: max-height 260ms cubic-bezier(0.2, 0.8, 0.2, 1),
    opacity 220ms ease, transform 260ms cubic-bezier(0.2, 0.8, 0.2, 1),
    filter 220ms ease;
}

/* 공통 입력 래퍼(참고/메인 동일 스타일) */
.input-wrapper,
.input-surface {
  margin-top: 5px;
  color: #000;
  display: flex;
  align-items: flex-end;
  gap: 8px;
  background: linear-gradient(
    145deg,
    rgba(248, 250, 252, 0.9),
    rgba(241, 245, 249, 0.8)
  );
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 24px;
  padding: 16px 20px;
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04),
    0 1px 0 rgba(255, 255, 255, 0.8) inset;
  position: relative;
  overflow: hidden;
}
.input-wrapper::after,
.input-surface::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4, #10b981);
  background-size: 200% 100%;
  opacity: 0;
  transition: opacity 0.3s ease;
  animation: liquidGradient 3s linear infinite;
}
.input-wrapper:focus-within,
.input-surface:focus-within {
  border-color: rgba(99, 102, 241, 0.4);
  background: linear-gradient(
    145deg,
    rgba(255, 255, 255, 0.95),
    rgba(248, 250, 252, 0.9)
  );
  box-shadow: 0 0 0 6px rgba(99, 102, 241, 0.08),
    0 8px 32px rgba(99, 102, 241, 0.15), 0 1px 0 rgba(255, 255, 255, 0.9) inset;
  transform: translateY(-1px) scale(1.01);
}
.input-wrapper:focus-within::after,
.input-surface:focus-within::after {
  opacity: 1;
}

/* Naive UI n-input 공통 오버라이드 */
.main-input :deep(.n-input),
.ref-input :deep(.n-input) {
  background: transparent;
  border: none;
  padding: 0;
}
.main-input :deep(.n-input .n-input-wrapper),
.ref-input :deep(.n-input .n-input-wrapper) {
  background: transparent;
  border: none;
  box-shadow: none;
  padding: 0;
}
.main-input :deep(.n-input .n-input__input),
.main-input :deep(.n-input .n-input__textarea),
.ref-input :deep(.n-input .n-input__input),
.ref-input :deep(.n-input .n-input__textarea) {
  color: #000 !important;
  background: transparent !important;
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
  font-family: inherit !important;
  font-size: 16px !important;
  line-height: 1.5 !important;
  padding: 0 !important;
  resize: none;
}
.main-input :deep(textarea:focus),
.ref-input :deep(textarea:focus),
.main-input :deep(input:focus),
.ref-input :deep(input:focus) {
  outline: none !important;
  box-shadow: none !important;
  border-color: transparent !important;
}
.main-input :deep(.n-input__input-el::placeholder),
.ref-input :deep(.n-input__input-el::placeholder) {
  color: rgba(0, 0, 0, 0.45);
}
.main-input {
  flex: 1;
}

/* 액션/칩 */
.input-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}
.input-actions .modern-btn {
  opacity: 0.6;
  transition: all 0.2s ease;
}
.input-actions .modern-btn:hover,
.input-actions .modern-btn.active {
  opacity: 1;
}
/* 새로운 스마트 제안 UI */
.bottom-actions {
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  padding: 12px 16px 8px;
}

.smart-suggestions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.suggestion-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.chips-scroll-container {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-label {
  font-size: 11px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-left: 4px;
}

.suggestion-chips {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 4px 0;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* Internet Explorer 10+ */
  flex: 1;
}

.suggestion-chips::-webkit-scrollbar {
  display: none; /* WebKit */
}

.scroll-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: rgba(99, 102, 241, 0.1);
  color: rgba(99, 102, 241, 0.8);
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  backdrop-filter: blur(10px);
}

.scroll-button:hover {
  background: rgba(99, 102, 241, 0.2);
  color: rgba(99, 102, 241, 1);
  transform: scale(1.1);
}

.scroll-button:active {
  transform: scale(0.95);
}

.scroll-button svg {
  width: 16px;
  height: 16px;
}

.smart-chip {
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  flex-shrink: 0; /* 칩이 줄어들지 않도록 */
}

.smart-chip.selection-active {
  box-shadow: 0 6px 18px rgba(59, 130, 246, 0.14);
  background: rgba(59, 130, 246, 0.12);
}

.smart-chip.chip-selected {
  background: rgba(59, 130, 246, 0.2);
  box-shadow: 0 8px 22px rgba(59, 130, 246, 0.25);
}

.smart-chip:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.chip-content {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.chip-main {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  min-width: 0;
}

.chip-keyword {
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 140px;
  line-height: 1.2;
}

.chip-badges {
  display: flex;
  align-items: center;
  gap: 4px;
}

.chip-checkbox {
  width: 22px;
  height: 22px;
  border-radius: 8px;
  border: 2px solid rgba(59, 130, 246, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.92);
  margin-right: 8px;
  transition: all 0.2s ease;
}

.chip-checkbox:hover {
  border-color: rgba(59, 130, 246, 0.8);
}

.chip-checkbox.selected {
  background: #3b82f6;
  border-color: #3b82f6;
  color: #ffffff;
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.28);
}

.chip-checkbox-icon {
  width: 14px;
  height: 14px;
}

.service-badge {
  font-size: 8px;
  background: rgba(0, 0, 0, 0.15);
  color: rgba(0, 0, 0, 0.8);
  padding: 2px 5px;
  border-radius: 8px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.ref-badge {
  font-size: 11px;
  opacity: 0.8;
}

.usage-badge {
  font-size: 10px;
  background: rgba(255, 255, 255, 0.4);
  color: rgba(0, 0, 0, 0.8);
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 600;
  min-width: 18px;
  text-align: center;
}

.star-icon {
  font-size: 12px;
  opacity: 0.9;
}

/* 유저 메시지 칩 스타일 */
.user-message-chip {
  background: linear-gradient(
    135deg,
    rgba(99, 102, 241, 0.12),
    rgba(99, 102, 241, 0.08)
  );
  border: 1px solid rgba(99, 102, 241, 0.25);
  color: rgba(0, 0, 0, 0.85);
}

.user-message-chip:hover {
  background: linear-gradient(
    135deg,
    rgba(99, 102, 241, 0.18),
    rgba(99, 102, 241, 0.12)
  );
  border-color: rgba(99, 102, 241, 0.35);
}

/* 즐겨찾기 칩 스타일 */
.favorite-chip {
  background: linear-gradient(
    135deg,
    rgba(34, 197, 94, 0.12),
    rgba(34, 197, 94, 0.08)
  );
  border: 1px solid rgba(34, 197, 94, 0.25);
  color: rgba(0, 0, 0, 0.85);
}

.favorite-chip:hover {
  background: linear-gradient(
    135deg,
    rgba(34, 197, 94, 0.18),
    rgba(34, 197, 94, 0.12)
  );
  border-color: rgba(34, 197, 94, 0.35);
}

.footer-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(0, 0, 0, 0.04);
}

.char-count {
  font-size: 12px;
}

.quick-actions {
  font-size: 11px;
  opacity: 0.7;
}

/* Semantic header styles */
.favorites-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.favorites-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

/* 즐겨찾기 스타일 */
.favorite-item {
  display: flex;
  align-items: flex-start;
  padding: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.favorite-item:hover {
  background: rgba(99, 102, 241, 0.05);
  border-color: rgba(99, 102, 241, 0.2);
}
.favorite-content {
  flex: 1;
}
.favorite-title {
  font-weight: 600;
  font-size: 14px;
  color: #000;
  margin: 0 0 4px 0;
}
.favorite-keyword {
  font-size: 12px;
  color: #666;
  margin: 0 0 2px 0;
}
.favorite-ref {
  font-size: 11px;
  color: #999;
  margin: 0;
}

/* 발행원고 스타일 */
.published-badge {
  display: inline-block;
  width: 16px;
  height: 16px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border-radius: 50%;
  text-align: center;
  line-height: 16px;
  font-size: 10px;
  font-weight: bold;
  margin-right: 6px;
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);
}

.published-item {
  background: linear-gradient(
    135deg,
    rgba(16, 185, 129, 0.08),
    rgba(16, 185, 129, 0.04)
  );
  border-color: rgba(16, 185, 129, 0.3);
}

.published-item:hover {
  background: linear-gradient(
    135deg,
    rgba(16, 185, 129, 0.12),
    rgba(16, 185, 129, 0.06)
  );
  border-color: rgba(16, 185, 129, 0.4);
}

.published-chip {
  background: linear-gradient(
    135deg,
    rgba(16, 185, 129, 0.15),
    rgba(16, 185, 129, 0.1)
  ) !important;
  border: 1px solid rgba(16, 185, 129, 0.35) !important;
  color: rgba(0, 0, 0, 0.9) !important;
}

.published-chip:hover {
  background: linear-gradient(
    135deg,
    rgba(16, 185, 129, 0.22),
    rgba(16, 185, 129, 0.15)
  ) !important;
  border-color: rgba(16, 185, 129, 0.45) !important;
}

/* 모달 스타일 */
.modal-item {
  margin-bottom: 8px;
}

.modal-item-header {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.modal-text {
  font-size: 14px;
  color: #333;
  margin: 0;
  line-height: 1.4;
  word-break: break-all;
}

.result-preview {
  background: rgba(99, 102, 241, 0.05);
  border: 1px solid rgba(99, 102, 241, 0.15);
  border-radius: 8px;
  padding: 10px;
  font-family: 'Pretendard', sans-serif;
  font-size: 13px;
  color: #555;
  white-space: pre-line;
  max-height: 80px;
  overflow: hidden;
  position: relative;
}

@keyframes liquidGradient {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
</style>
