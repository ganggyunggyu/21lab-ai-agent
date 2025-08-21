<script setup lang="ts">
import { ref, watch, nextTick, onMounted, type ComponentPublicInstance } from 'vue'
import { NScrollbar, NInput, NButton, NSelect, createDiscreteApi } from 'naive-ui'
import { delay } from 'es-toolkit'
import { CopyOutline as CopyIcon, DownloadOutline as DownloadIcon } from '@vicons/ionicons5'
import { generateText, getCategory } from '../service/chat.service'
import LoadingDots from '../components/LoadingDots.vue'
import { downloadText } from '../utils/downloadText'
import MarkdownIt from 'markdown-it'
import { formatMessage } from '../utils/formatMsg'
import { MODEL_OPTIONS, type ModelService } from '../constants/models'
import { INTRO_MARKDOWN, MSG_COPY_FAIL, MSG_COPY_SUCCESS, MSG_DOWNLOAD_FAIL, MSG_DOWNLOAD_SUCCESS, MSG_WARN_ENTER_KEYWORD, categoryInfo } from '../constants/texts'
import { AUTO_SCROLL_DELAY } from '../constants/timings'
import { PART_SEPARATOR } from '../constants/regex'
import { MARKDOWN_OPTIONS } from '../constants/markdown'

const md = new MarkdownIt(MARKDOWN_OPTIONS)

// 마크다운 렌더 헬퍼
const renderMarkdown = (raw: string) => md.render(raw)
interface Message {
  role: 'user' | 'bot';
  content: string;
  keyword?: string;
}

const { message } = createDiscreteApi(['message'])

const messages = ref<Message[]>([
  {
    role: 'bot',
    content: INTRO_MARKDOWN
  }
])
const keyword = ref('')
const refMsg = ref('')
const service = ref<ModelService>('gpt')
const isLoading = ref(false)
const isCategoryLoading = ref(false)
const category = ref('')

const lastMessageRef = ref<HTMLDivElement | null>(null)
const scrollbarRef = ref<InstanceType<typeof NScrollbar> | null>(null)

const setLastMessageRef = (el: Element | ComponentPublicInstance | null, idx: number) => {
  if (idx === messages.value.length - 1) {
    lastMessageRef.value = (el as unknown as HTMLDivElement) || null
  }
}

const scrollToLast = async () => {
  await nextTick()
  const lastEl = lastMessageRef.value
  const sc = scrollbarRef.value
  if (lastEl && sc) sc.scrollTo({ top: lastEl.offsetTop, behavior: 'smooth' })
}

const handleGenerate = async () => {
  if (!keyword.value.trim()) return
  const input = keyword.value
  messages.value.push({ role: 'user', content: input, keyword: input })
  keyword.value = ''
  isLoading.value = true

  const loadingIndex = messages.value.length
  messages.value.push({ role: 'bot', content: 'loading', keyword: input })

try {
  const res = await generateText({
    service: service.value,
    keyword: input,
    ref: refMsg.value
  })

  const botResponse: string = res?.content || '(응답 없음)'
  const parts = botResponse.split(PART_SEPARATOR).map(p => p.trim()).filter(Boolean)

  messages.value.splice(loadingIndex, 1)

  for (const part of parts) {
    messages.value.push({
      role: 'bot',
      content: part,
      keyword: input
    })
  }
} catch (error) {
  messages.value[loadingIndex] = {
    role: 'bot',
    content: '⚠️ 오류가 발생했어요. 다시 시도해주세요!',
    keyword: input
  }
  console.error(error)
} finally {
    isLoading.value = false
  } 
}

const handleCategoryClick = async () => {
  isCategoryLoading.value = true
  try {
    if (keyword.value.length === 0) {
      message.warning(MSG_WARN_ENTER_KEYWORD)
      return
    }
    const res = await getCategory({ keyword: keyword.value })
    category.value = res
    message.info(categoryInfo(category.value))
  } catch (error) {
    console.error(error)
  } finally {
    isCategoryLoading.value = false
  }
}

const copyMsg = async (text: string) => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
    } else {
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.top = '-9999px'
      textArea.style.left = '-9999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
    }
    message.success(MSG_COPY_SUCCESS)
  } catch {
    message.error(MSG_COPY_FAIL)
  }
}

const handleDownloadClick = (msg: Message) => {
  const fileName = `${msg.keyword}_${msg.content.trim().replace(/\s+/g, '').length}`;  
  const content = msg?.content

  try {
    downloadText({
      fileName, content
    })
    message.success(MSG_DOWNLOAD_SUCCESS)
  } catch (error) {
    message.error(MSG_DOWNLOAD_FAIL)
  }
}

watch(() => messages.value.length, async () => {
  await delay(AUTO_SCROLL_DELAY)
  scrollToLast()
})

onMounted(()=>{
//   document.addEventListener("keydown", (e) => {
//   if (e.key === "Tab") {
//     e.preventDefault(); // 기본 탭 이동 막음
//     const keywordInput = document.getElementById("keyword-input")
//     if(keywordInput){
//       keywordInput.focus();
//     }
//   }
// });
})
</script>

<template>

  <div class="chat-container">

 <header class="chat-header">
      <div class="header-title"></div>
      <n-select
        v-model:value="service"
        :options="MODEL_OPTIONS"
        size="small"
        class="service-selector"
      />
    </header>

    <section class="chat-messages">
  <n-scrollbar ref="scrollbarRef">
    <div v-for="(msg, idx) in messages" :key="idx" :class="['message', msg.role]">
        <div class="bubble" :ref="(el) => setLastMessageRef(el, idx)">
        <div class="chat-content">
          <template v-if="msg.content === 'loading'">
            <LoadingDots/>
          </template>
          <template v-else>
            <div v-html="idx === 0 ? renderMarkdown(msg.content) : formatMessage(msg.content)" />
          </template>
        </div>
        <n-button
          v-if="msg.role === 'bot' && msg.content !== 'loading' && idx !== 0"
          class="copy-btn"
          size="tiny"
          tertiary
          quaternary
          style="margin-left: auto;"
          @click="copyMsg(msg.content)"
        >
          <template #icon>
            <copy-icon />
          </template>
          복사
        
</n-button>
        <n-button
          v-if="msg.role === 'bot' && msg.content !== 'loading' && idx !== 0"
          class="download-btn"
          size="tiny"
          tertiary
          quaternary
          style="margin-left: 8px; color: white;"
          @click="handleDownloadClick(msg)"
        >
          <template #icon>
            <download-icon />
          </template>
          다운로드
        
</n-button>
      </div>
    </div>
  
</n-scrollbar>

  <div style="height: 10px;" />
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
  <n-button :loading="isLoading" @click="handleGenerate">
    전송
  
</n-button>
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
  font-family: 'Pretendard', sans-serif;
  background: #1a1a1a;
  color: #f0f0f0;
}
/* unify header block with compact header below */
.chat-messages {
  flex: 1;
  padding: 16px;
  overflow: hidden;
}
.message {
  display: flex;
  margin-bottom: 12px;
}
.message.user {
  justify-content: flex-end;
} 
.message.bot {
  justify-content: flex-start;
}
.bubble {
  display: flex;
  flex-direction: column;
  gap: 3px;
  position: relative;
  
  padding: 12px;
  border-radius: 12px;
  word-break: break-word;
}
.message.user .bubble {
  background: #4f46e5;
  color: #fff;
  border-top-right-radius: 0;
}
.message.bot .bubble {
  background: #2d2d2d;
  color: #f0f0f0;
  border-top-left-radius: 0;
  max-width: 70vw;
}
.copy-btn { color: white; }
.chat-footer {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 16px;
  padding: 16px;
  background: #2d2d2d;
  border-top: 1px solid #444;
}
.chat-input .n-input {
  flex: 1;
  margin-right: 8px;
}
.chat-input .n-button{
  color: white;
}

.chat-content {
  line-height: 1.7;
  white-space: pre-wrap;
}

.copy-btn {
  color: #93c5fd;
  transition: all 0.3s ease;
}
.copy-btn:hover {
  color: white;
  transform: scale(1.05);
}


.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #2d2d2d;
  border-bottom: 1px solid #444;
  font-size: 16px;
}

.header-title {
  font-weight: bold;
}

.service-selector {
  width: 120px;
}
.chat-input{
  display: flex;
}

.bubble :deep(h1) { font-size: 20px;  color: #e5e7eb; }
.bubble :deep(h2) { font-size: 18px;  color: #e5e7eb; }
.bubble :deep(h3) { font-size: 16px;  color: #e5e7eb; }
.bubble :deep(ul) { margin: 0 0 0 20px; list-style: disc; }
.bubble :deep(ol) { margin: 0 0 0 20px; list-style: decimal; }
.bubble :deep(code),
.bubble :deep(kbd) { background: #111827; padding: 2px 6px; border-radius: 6px; }
.bubble :deep(blockquote) {
   padding: 8px 12px; border-left: 3px solid #4f46e5; background: #1f2937; border-radius: 6px;
}
</style>
