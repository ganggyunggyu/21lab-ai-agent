<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  Copy as CopyIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  Information as InfoIcon,
  AlertCircle as AlertIcon,
  Link as LinkIcon,
} from '@vicons/ionicons5';
import { renderMarkdown, cn, extractKeywordDisplay } from '@/utils';
import type { Message } from '@/types';
import { MODEL_OPTIONS } from '@/constants';
import { Button, Skeleton, ImageViewer } from '@/components/ui';
import { useChatStore } from '@/stores';
import { useChatActions } from '@/hooks';

const getLoadingMessage = (progress: number): string => {
  if (progress < 30) return 'AI 모델 준비 중...';
  if (progress < 60) return '원고 작성 중...';
  if (progress < 85) return '응답 생성 중...';
  return '거의 완료...';
};

interface Props {
  message: Message;
  index: number;
}

interface Emits {
  showDetail: [message: Message];
}

const props = defineProps<Props>();
defineEmits<Emits>();

const chatStore = useChatStore();
const { handleRegenerate, deleteMessage } = chatStore;
const { copyMsg, handleDownloadClick, handleDownloadImages } = useChatActions();

// 이미지 뷰어 상태
const showImageViewer = ref(false);
const viewerInitialIndex = ref(0);

const openImageViewer = (index: number) => {
  viewerInitialIndex.value = index;
  showImageViewer.value = true;
};

const closeImageViewer = () => {
  showImageViewer.value = false;
};

const handleViewerDownload = async (image: { url: string }, index: number) => {
  try {
    const response = await fetch(image.url);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const ext = image.url.match(/\.(\w+)(?:\?|$)/)?.[1] || 'png';
    link.href = url;
    link.download = `${props.message.keyword || 'image'}_${index + 1}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch {
    console.error('이미지 다운로드 실패');
  }
};

const hasImages = computed(() => {
  return props.message.images && props.message.images.length > 0;
});

const hasManuscriptId = computed(() => {
  return Boolean(props.message.manuscriptId);
});

const copyManuscriptId = async () => {
  if (!props.message.manuscriptId) return;
  try {
    await navigator.clipboard.writeText(props.message.manuscriptId);
    // toast는 useChatActions에서 가져와서 쓰거나 간단히 처리
  } catch {
    console.error('ID 복사 실패');
  }
};

// 이미지 전용 메시지 (content가 비어있고 이미지 관련 상태만 있음)
const isImageOnlyMessage = computed(() => {
  return props.message.content === '' &&
    (props.message.imageLoading || props.message.images?.length || props.message.imageError);
});

const onDownloadText = () => {
  handleDownloadClick(props.message);
};

const onDownloadImages = () => {
  handleDownloadImages(props.message);
};

const renderedContent = computed(() => {
  if (props.message.content === 'loading') return '';

  if (props.index === 0) {
    return renderMarkdown(props.message.content);
  }

  return props.message.content.replace(/\n/g, '<br>');
});

const formatTime = (timestamp?: number) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getServiceLabel = (service?: string) => {
  if (!service) return 'Unknown';
  const option = MODEL_OPTIONS.find((opt) => opt.value === service);
  return option?.label || service;
};

const bubbleClasses = computed(() => {
  return cn(
    'flex mb-6',
    {
      'justify-end': props.message.role === 'user',
      'justify-start': props.message.role === 'bot',
    }
  );
});

const contentClasses = computed(() => {
  return cn(
    'flex gap-3 max-w-[80%] items-start md:max-w-full md:gap-2 xs:gap-1.5',
    {
      'flex-row-reverse': props.message.role === 'user',
    }
  );
});

const messageBodyClasses = 'flex-1 min-w-0';

const headerClasses = 'flex items-center gap-2 mb-1 md:gap-3 md:mb-2 xs:gap-2 xs:mb-1.5';

const senderClasses = computed(() => {
  return cn('text-base font-semibold opacity-70 text-gray-900 dark:text-gray-100 md:text-base xs:text-base');
});

const timeClasses = 'text-base opacity-50 text-gray-900 dark:text-gray-100 md:text-base xs:text-base';

const messageTextClasses = computed(() => {
  const base = 'px-5 py-4 rounded-2xl relative transition-all duration-300 hover:shadow-lg';

  if (props.message.role === 'user') {
    return cn(base, 'bg-brand text-white hover:bg-brand/90 hover:-translate-y-0.5');
  }

  return cn(base, 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600 hover:border-brand/30 hover:-translate-y-0.5');
});

const actionsClasses = 'mt-2 flex gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100 md:flex-wrap md:gap-1.5 md:mt-3 xs:mt-4';

const botActionsClasses = 'flex gap-1 md:gap-1.5 md:flex-wrap xs:w-full xs:justify-between';

const userInfoClasses = 'p-2 rounded-lg text-base md:p-3 md:text-base xs:p-2.5';

const generationInfoClasses = 'flex flex-wrap gap-3 items-center max-h-[calc(1.6em*3)] overflow-hidden leading-relaxed md:gap-2 md:flex-col md:items-start xs:gap-1.5';

const refStatusClasses = computed(() => {
  return cn(
    'px-2 py-1 rounded-lg text-sm font-medium',
    {
      'bg-success text-white': props.message.ref,
      'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400': !props.message.ref,
    }
  );
});
</script>

<template>
  <article
    :class="cn(bubbleClasses, 'group')"
    role="article"
    :aria-label="
      message.role === 'user' ? '사용자 메시지' : 'AI 어시스턴트 메시지'
    "
  >
    <div :class="contentClasses">
      <div :class="messageBodyClasses">
        <header :class="headerClasses">
          <span :class="senderClasses">
            {{ message.role === 'user' ? 'You' : 'AI Assistant' }}
          </span>
          <time
            :class="timeClasses"
            :datetime="new Date(message.timestamp || 0).toISOString()"
          >
            {{ formatTime(message.timestamp) }}
          </time>
        </header>

        <main :class="messageTextClasses">
          <Transition name="content-fade" mode="out-in">
            <!-- 텍스트 로딩 상태 -->
            <section
              v-if="message.content === 'loading'"
              key="loading"
              class="loading-state py-4"
              aria-live="polite"
              aria-label="AI 응답 생성 중"
            >
              <div class="mb-4">
                <Skeleton variant="text" :lines="3" />
              </div>
              <div class="flex flex-col gap-2 w-full max-w-[300px]">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-brand font-medium">
                    {{ getLoadingMessage(message.loadingProgress || 0) }}
                  </span>
                  <span class="text-brand/70 font-semibold">
                    {{ message.loadingProgress || 0 }}%
                  </span>
                </div>
                <div class="w-full h-1.5 bg-brand/10 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-brand rounded-full transition-all duration-300 ease-out progress-bar-shimmer"
                    :style="{ width: `${message.loadingProgress || 0}%` }"
                  />
                </div>
              </div>
            </section>

            <!-- 이미지 전용 메시지 -->
            <section v-else-if="isImageOnlyMessage" key="image" class="image-only-section">
              <Transition name="content-fade" mode="out-in">
                <!-- 이미지 로딩 중 -->
                <div v-if="message.imageLoading" key="img-loading" class="message-image-loading">
                  <div class="image-loading-spinner"></div>
                  <span class="image-loading-text">이미지 생성 중... (4장)</span>
                </div>

                <!-- 이미지 로드 완료 -->
                <div v-else-if="message.images?.length" key="img-done" class="message-images-grid">
                  <div
                    v-for="(img, idx) in message.images"
                    :key="idx"
                    class="message-image-item"
                    :style="{ animationDelay: `${idx * 0.1}s` }"
                    @click="openImageViewer(idx)"
                  >
                    <img
                      :src="img.url"
                      :alt="`${message.keyword} 이미지 ${idx + 1}`"
                      class="message-image"
                      loading="lazy"
                    />
                  </div>
                </div>

                <!-- 이미지 에러 -->
                <div v-else-if="message.imageError" key="img-error" class="message-image-error">
                  <AlertIcon class="image-error-icon" />
                  <span class="image-error-text">{{ message.imageError }}</span>
                </div>
              </Transition>
            </section>

            <!-- 일반 메시지 -->
            <section
              v-else
              key="content"
              class="content-reveal"
              @dblclick="copyMsg(message.content, message)"
              role="document"
            >
              <aside
                v-if="message.role === 'user'"
                :class="userInfoClasses"
                aria-label="메시지 생성 정보"
              >
                <div :class="generationInfoClasses">
                  <span class="font-semibold opacity-80">키워드:</span>
                  {{ extractKeywordDisplay(message.keyword || '') }}
                  <span class="font-semibold opacity-80">서비스:</span>
                  {{ getServiceLabel(message.service) }}
                  <span :class="refStatusClasses">
                    {{ message.ref ? '참조원고 있음' : '참조원고 없음' }}
                  </span>
                </div>
              </aside>

              <div
                v-show="message.role === 'bot'"
                class="leading-relaxed text-base wrap-break-word md:text-base md:leading-relaxed xs:text-base xs:leading-relaxed message-content-wrapper"
                v-html="renderedContent"
                role="document"
                aria-label="AI 응답 내용"
              ></div>
            </section>
          </Transition>
        </main>

        <footer :class="actionsClasses" role="toolbar" aria-label="메시지 액션">
          <!-- 이미지 전용 메시지 액션 -->
          <nav
            v-if="isImageOnlyMessage && hasImages"
            :class="botActionsClasses"
            aria-label="이미지 액션 버튼"
          >
            <Button
              color="light" variant="weak"
              size="sm"
              :icon="DownloadIcon"
              @click="onDownloadImages"
              class="text-base px-3 py-2 h-auto rounded-lg"
              aria-label="이미지 다운로드"
            >
              이미지 저장
            </Button>
          </nav>

          <!-- 일반 메시지 액션 -->
          <nav
            v-else-if="message.content !== 'loading' && message.content !== ''"
            :class="botActionsClasses"
            aria-label="메시지 액션 버튼"
          >
            <Button
              color="light" variant="weak"
              size="sm"
              :icon="CopyIcon"
              @click="copyMsg(message.content, message)"
              class="text-base px-3 py-2 h-auto rounded-lg md:text-base md:px-3.5 md:py-2.5 md:min-h-11 md:min-w-20 xs:text-base xs:px-4 xs:py-3 xs:min-h-12 xs:flex-1 xs:justify-center"
              aria-label="메시지 내용 복사"
            >
              복사
            </Button>

            <Button
              v-if="hasManuscriptId"
              color="light" variant="weak"
              size="sm"
              :icon="LinkIcon"
              @click="copyManuscriptId"
              class="text-base px-3 py-2 h-auto rounded-lg md:text-base md:px-3.5 md:py-2.5 md:min-h-11 md:min-w-20 xs:text-base xs:px-4 xs:py-3 xs:min-h-12 xs:flex-1 xs:justify-center"
              aria-label="원고 ID 복사"
              :title="message.manuscriptId"
            >
              ID
            </Button>

            <Button
              color="light" variant="weak"
              size="sm"
              :icon="DownloadIcon"
              @click="onDownloadText"
              class="text-base px-3 py-2 h-auto rounded-lg md:text-base md:px-3.5 md:py-2.5 md:min-h-11 md:min-w-20 xs:text-base xs:px-4 xs:py-3 xs:min-h-12 xs:flex-1 xs:justify-center"
              aria-label="원고 저장"
            >
              저장
            </Button>

            <Button
              color="light" variant="weak"
              size="sm"
              :icon="RefreshIcon"
              @click="handleRegenerate(message)"
              class="text-base px-3 py-2 h-auto rounded-lg md:text-base md:px-3.5 md:py-2.5 md:min-h-11 md:min-w-20 xs:text-base xs:px-4 xs:py-3 xs:min-h-12 xs:flex-1 xs:justify-center"
              aria-label="AI 응답 재생성"
            >
              재생성
            </Button>

            <Button
              color="light" variant="weak"
              size="sm"
              :icon="InfoIcon"
              @click="$emit('showDetail', message)"
              class="text-base px-3 py-2 h-auto rounded-lg md:text-base md:px-3.5 md:py-2.5 md:min-h-11 md:min-w-20 xs:text-base xs:px-4 xs:py-3 xs:min-h-12 xs:flex-1 xs:justify-center"
              aria-label="메시지 상세정보 보기"
            >
              상세정보
            </Button>

          </nav>

          <Button
            v-if="index > 0"
            color="light" variant="weak"
            size="sm"
            :icon="CloseIcon"
            @click="deleteMessage(index)"
            class="text-red-500 border-red-500/20 hover:bg-red-500/10 hover:border-red-500/30 text-base px-3 py-2 h-auto rounded-lg md:text-base md:px-3.5 md:py-2.5 md:min-h-11 md:min-w-20 xs:text-base xs:px-4 xs:py-3 xs:min-h-12 xs:flex-1 xs:justify-center"
            title="메시지 삭제"
            aria-label="이 메시지 삭제"
          >
            삭제
          </Button>
        </footer>
      </div>
    </div>

    <!-- 이미지 뷰어 -->
    <ImageViewer
      v-if="hasImages"
      :show="showImageViewer"
      :images="message.images || []"
      :initial-index="viewerInitialIndex"
      @close="closeImageViewer"
      @download="handleViewerDownload"
    />
  </article>
</template>

<style>

.message-content-wrapper :deep(h1),
.message-content-wrapper :deep(h2),
.message-content-wrapper :deep(h3) {
  margin: 16px 0 8px 0;
  font-weight: 600;
  color: var(--color-text-primary);
}

.message-content-wrapper :deep(p) {
  margin: 8px 0;
  color: var(--color-text-primary);
}

.message-content-wrapper :deep(ul),
.message-content-wrapper :deep(ol) {
  margin: 12px 0;
  padding-left: 20px;
}

.message-content-wrapper :deep(li) {
  margin: 4px 0;
  color: var(--color-text-primary);
}

.message-content-wrapper :deep(code) {
  background: rgba(0, 0, 0, 0.05);
  padding: 2px 4px;
  border-radius: 4px;
  font-size: 1em;
  font-family: ui-monospace, 'SF Mono', Monaco, monospace;
}

.message-bubble--user .message-content-wrapper :deep(code) {
  background: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.9);
}

.message-content-wrapper :deep(pre) {
  background: rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 12px;
  margin: 12px 0;
  overflow-x: auto;
}

.message-bubble--user .message-content-wrapper :deep(pre) {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.message-content-wrapper :deep(blockquote) {
  border-left: 3px solid var(--color-primary);
  margin: 12px 0;
  padding: 8px 16px;
  background: rgba(98, 194, 176, 0.08);
  border-radius: 0 8px 8px 0;
}

.message-content-wrapper :deep(a) {
  color: var(--color-primary);
  text-decoration: underline;
}

.message-bubble--user .message-content-wrapper :deep(a) {
  color: rgba(255, 255, 255, 0.9);
}

/* 이미지 섹션 스타일 */
.message-image-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--color-border-primary);
}

.message-image-loading {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: var(--color-bg-secondary);
  border-radius: 12px;
}

.image-loading-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid var(--color-border-primary);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.image-loading-text {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.message-images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 8px;
}

.message-image-item {
  border-radius: 8px;
  overflow: hidden;
  aspect-ratio: 1;
  background: var(--color-bg-secondary);
}

.message-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.message-image:hover {
  transform: scale(1.05);
  filter: brightness(1.1);
}

.message-image-item {
  transition: all 0.3s ease;
}

.message-image-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.message-image-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
}

.image-error-icon {
  width: 20px;
  height: 20px;
  color: #ef4444;
  flex-shrink: 0;
}

.image-error-text {
  font-size: 14px;
  color: #ef4444;
}

/* 프로그레스 바 shimmer 효과 */
.progress-bar-shimmer {
  position: relative;
  overflow: hidden;
}

.progress-bar-shimmer::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.4),
    transparent
  );
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* 로딩 섹션 pulse 효과 */
.loading-state {
  animation: loadingPulse 2s ease-in-out infinite;
}

@keyframes loadingPulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* 로딩 -> 메시지 전환 트랜지션 */
.content-fade-enter-active {
  animation: contentReveal 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}

.content-fade-leave-active {
  animation: contentFadeOut 0.25s ease-out forwards;
}

@keyframes contentReveal {
  0% {
    opacity: 0;
    transform: translateY(10px);
    filter: blur(4px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
}

@keyframes contentFadeOut {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(0.98);
  }
}

/* 메시지 내용 reveal 효과 */
.content-reveal {
  animation: contentReveal 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}

/* 이미지 그리드 아이템 stagger 애니메이션 */
.message-images-grid .message-image-item {
  animation: imageReveal 0.4s cubic-bezier(0.22, 1, 0.36, 1) backwards;
}

@keyframes imageReveal {
  0% {
    opacity: 0;
    transform: scale(0.8) translateY(10px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>
