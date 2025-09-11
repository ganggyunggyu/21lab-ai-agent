<script setup lang="ts">
import { ref, watch, onMounted, type ComponentPublicInstance } from 'vue';
import {
  NScrollbar,
  NInput,
  NButton,
  NSelect,
  createDiscreteApi,
} from 'naive-ui';
import { delay } from 'es-toolkit';
import { generateText, getCategory } from '../service/_chat.service';
import { downloadText } from '../utils/_downloadText';
import { MODEL_OPTIONS } from '../constants/_models';
import {
  INTRO_MARKDOWN,
  MSG_COPY_FAIL,
  MSG_COPY_SUCCESS,
  MSG_DOWNLOAD_FAIL,
  MSG_DOWNLOAD_SUCCESS,
  MSG_WARN_ENTER_KEYWORD,
  categoryInfo,
} from '../constants/_texts';
import { AUTO_SCROLL_DELAY } from '../constants/_timings';
import { PART_SEPARATOR } from '../constants/_regex';
import { copyToClipboard } from '../utils/_clipboard';
import { getSelectedService, setSelectedService } from '../utils/_localStorage';
import MessageItem from '../components/MessageItem.vue';
import { useAutoScroll } from '../hooks/useAutoScroll';
import type { ChatService, Message } from '../types/_chat';

const { message } = createDiscreteApi(['message']);

const messages = ref<Message[]>([
  {
    role: 'bot',
    content: INTRO_MARKDOWN,
  },
]);
const keyword = ref('');
const refMsg = ref('');
const service = ref<ChatService>(getSelectedService() as ChatService);
const isLoading = ref(false);
const isCategoryLoading = ref(false);
const category = ref('');

const lastMessageRef = ref<HTMLDivElement | null>(null);
const scrollbarRef = ref<InstanceType<typeof NScrollbar> | null>(null);
const { setLastItemRef: _setLastItemRef, scrollToLast } = useAutoScroll({
  containerRef: scrollbarRef,
  lastItemRef: lastMessageRef,
});
const setLastMessageRef = (
  el: Element | ComponentPublicInstance | null,
  idx: number
) => {
  if (idx === messages.value.length - 1) _setLastItemRef(el, idx);
};

const handleGenerate = async () => {
  if (!keyword.value.trim()) return;
  const input = keyword.value;
  messages.value.push({ role: 'user', content: input, keyword: input });
  keyword.value = '';
  isLoading.value = true;

  const loadingIndex = messages.value.length;
  messages.value.push({ role: 'bot', content: 'loading', keyword: input });

  try {
    const res = await generateText({
      service: service.value,
      keyword: input,
      ref: refMsg.value,
    });

    const botResponse: string = res?.content || '(응답 없음)';
    const parts = botResponse
      .split(PART_SEPARATOR)
      .map((p) => p.trim())
      .filter(Boolean);

    messages.value.splice(loadingIndex, 1);

    for (const part of parts) {
      messages.value.push({
        role: 'bot',
        content: part,
        keyword: input,
      });
    }
  } catch (error) {
    messages.value[loadingIndex] = {
      role: 'bot',
      content: `⚠️ ${
        (error as Error).message || '오류가 발생했어요. 다시 시도해주세요!'
      }`,
      keyword: input,
    };
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};

const handleCategoryClick = async () => {
  isCategoryLoading.value = true;
  try {
    if (keyword.value.length === 0) {
      message.warning(MSG_WARN_ENTER_KEYWORD);
      return;
    }
    const res = await getCategory({ keyword: keyword.value });
    category.value = res;
    message.info(categoryInfo(category.value));
  } catch (error) {
    console.error(error);
  } finally {
    isCategoryLoading.value = false;
  }
};

const copyMsg = async (text: string) => {
  try {
    await copyToClipboard(text);
    message.success(MSG_COPY_SUCCESS);
  } catch {
    message.error(MSG_COPY_FAIL);
  }
};

const handleDownloadClick = (msg: Message) => {
  const fileName = `${msg.keyword}_${
    msg.content.trim().replace(/\s+/g, '').length
  }`;
  const content = msg?.content;

  try {
    downloadText({
      fileName,
      content,
    });
    message.success(MSG_DOWNLOAD_SUCCESS);
  } catch (error) {
    message.error(MSG_DOWNLOAD_FAIL);
  }
};

watch(
  () => messages.value.length,
  async () => {
    await delay(AUTO_SCROLL_DELAY);
    scrollToLast();
  }
);

watch(
  () => service.value,
  (newService) => {
    setSelectedService(newService);
  }
);

onMounted(() => {
});
</script>

<template>
  <div class="chat-container">
    <header class="chat-header">
      <n-select
        v-model:value="service"
        :options="MODEL_OPTIONS"
        size="small"
        class="service-selector"
      />
    </header>

    <section class="chat-messages">
      <n-scrollbar ref="scrollbarRef">
        <MessageItem
          v-for="(msg, idx) in messages"
          :key="idx"
          :msg="msg"
          :idx="idx"
          :is-intro="idx === 0"
          :set-last-message-ref="setLastMessageRef"
          @copy="copyMsg"
          @download="handleDownloadClick"
        />
      </n-scrollbar>

      <div style="height: 10px" />
    </section>

    <footer class="chat-footer">
      <div class="chat-input">
        <n-input
          v-model:value="refMsg"
          placeholder="참고 문서를 입력해주세요"
          tabindex="2"
          @keyup.enter="handleGenerate"
        />
      </div>
      <div class="chat-input">
        <n-input
          id="keyword-input"
          v-model:value="keyword"
          placeholder="키워드를 입력하세요 (예시: 스마일라식 다음날)"
          tabindex="1"
          autofocus
          @keyup.enter="handleGenerate"
        />
        <n-button :loading="isLoading" @click="handleGenerate"> 전송 </n-button>
        <n-button :loading="isCategoryLoading" @click="handleCategoryClick">
          카테고리 확인
        </n-button>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: #f1f5f9;
}
/* unify header block with compact header below */
.chat-messages {
  flex: 1;
  padding: 16px;
  overflow: hidden;
}
.chat-footer {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 16px;
  padding: 16px;
  background: rgba(30, 41, 59, 0.95);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(148, 163, 184, 0.2);
}
.chat-input .n-input {
  flex: 1;
  margin-right: 8px;
}
.chat-input .n-button {
  color: white;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(30, 41, 59, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
  font-size: 16px;
}

.header-title {
  font-weight: 700;
  background: linear-gradient(135deg, #6366f1 0%, #10b981 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 20px;
}

.service-selector {
  width: 120px;
}
.chat-input {
  display: flex;
}
</style>
