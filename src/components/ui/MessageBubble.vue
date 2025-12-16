<script setup lang="ts">
import { computed } from 'vue';
import {
  Copy as CopyIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  Information as InfoIcon,
  Options as OptionsIcon,
} from '@vicons/ionicons5';
import { renderMarkdown, cn, extractKeywordDisplay } from '@/utils';
import type { Message } from '@/types';
import { MODEL_OPTIONS } from '@/constants';
import { Button } from '@/components/ui';
import { useChatStore } from '@/stores';
import { useChatActions } from '@/hooks';

interface Props {
  message: Message;
  index: number;
}

interface Emits {
  showDetail: [message: Message];
  showWorkModal: [message: Message];
}

const props = defineProps<Props>();
defineEmits<Emits>();

const chatStore = useChatStore();
const { openActionModal, handleRegenerate, deleteMessage } = chatStore;
const { copyMsg, handleDownloadClick } = useChatActions();

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

const handleUserMessageClick = (userMsg: any) => {
  openActionModal(userMsg);
};

const bubbleClasses = computed(() => {
  return cn(
    'flex mb-6 animate-[slideIn_0.4s_ease-out]',
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
  const base = 'px-5 py-4 rounded-2xl relative transition-colors duration-200';

  if (props.message.role === 'user') {
    return cn(base, 'bg-brand text-white');
  }

  // 봇 메시지: 배경과 구분되도록 약간 다른 색상 + 테두리 적용
  return cn(base, 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600');
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
          <section
            v-if="message.content === 'loading'"
            class="flex items-center w-full py-3"
            aria-live="polite"
            aria-label="AI 응답 생성 중"
          >
            <div class="flex flex-col gap-2 w-full max-w-[400px]">
              <div class="w-full h-2 bg-brand/10 rounded-full overflow-hidden">
                <div
                  class="h-full bg-brand transition-all duration-300 ease-out"
                  :style="{ width: `${message.loadingProgress || 0}%` }"
                ></div>
              </div>
              <span class="text-sm text-brand font-semibold text-right">{{ message.loadingProgress || 0 }}%</span>
            </div>
          </section>

          <section
            v-else
            @dblclick="
              message.content !== 'loading' &&
                copyMsg(message.content, message)
            "
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
              class="leading-relaxed text-base break-words md:text-base md:leading-relaxed xs:text-base xs:leading-relaxed message-content-wrapper"
              v-html="renderedContent"
              role="document"
              aria-label="AI 응답 내용"
            ></div>
          </section>
        </main>

        <footer :class="actionsClasses" role="toolbar" aria-label="메시지 액션">
          <nav
            v-if="message.content !== 'loading'"
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
              color="light" variant="weak"
              size="sm"
              :icon="DownloadIcon"
              @click="handleDownloadClick(message)"
              class="text-base px-3 py-2 h-auto rounded-lg md:text-base md:px-3.5 md:py-2.5 md:min-h-11 md:min-w-20 xs:text-base xs:px-4 xs:py-3 xs:min-h-12 xs:flex-1 xs:justify-center"
              aria-label="메시지 파일로 저장"
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

            <Button
              color="light" variant="weak"
              size="sm"
              :icon="OptionsIcon"
              @click="handleUserMessageClick(message)"
              class="text-base px-3 py-2 h-auto rounded-lg md:text-base md:px-3.5 md:py-2.5 md:min-h-11 md:min-w-20 xs:text-base xs:px-4 xs:py-3 xs:min-h-12 xs:flex-1 xs:justify-center"
              aria-label="메시지 작업선택"
            >
              작업선택
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
  </article>
</template>

<style>
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-bubble:nth-child(1) { animation-delay: 0s; }
.message-bubble:nth-child(2) { animation-delay: 0.1s; }
.message-bubble:nth-child(3) { animation-delay: 0.2s; }
.message-bubble:nth-child(4) { animation-delay: 0.3s; }
.message-bubble:nth-child(5) { animation-delay: 0.4s; }

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
</style>
