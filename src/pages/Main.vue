<script setup lang="ts">
import { nextTick, ref } from 'vue'
import {
  NScrollbar,
  NInput,
  NButton,
  NSelect,
createDiscreteApi
} from 'naive-ui'
import { delay } from 'es-toolkit'
import { CopyOutline as CopyIcon, DownloadOutline as DownloadIcon } from '@vicons/ionicons5'
import { generateText } from '../service/chat.service'
import MagicCard from '../components/MagicCard.vue'

interface Message {
  role: 'user' | 'bot';
  content: string;
  keyword?: string;
}

const splitSections = (text: string): string[] => {
  return text.split(/-{3,}/).map(part => part.trim())
}
const formatMessage = (text:string) => {
  if (!text) return ''
  return text.replace(/\n/g, '<br/>')
}

const scrollToBottom = async () => {
  await nextTick()
  await delay(500)
  
}
const { message } = createDiscreteApi(['message'])


const keyword = ref('')
const refMsg = ref('')
const service = ref<'gpt' | 'claude' | 'solar' | 'gemini'>('gpt')
const isLoading = ref(false)


const messages = ref<Message[]>([
  { role: 'bot', content: '원고 생성 챗봇입니다. 키워드를 입력하세요.' }
])

const handleGenerate = async () => {
  if (!keyword.value.trim()) return
  const input = keyword.value
  messages.value.push({ role: 'user', content: input, keyword: input })
  keyword.value = ''
  isLoading.value = true

  const loadingIndex = messages.value.length
  messages.value.push({ role: 'bot', content: 'loading', keyword: input })

  await scrollToBottom() 
try {
  const res = await generateText({
    service: service.value,
    keyword: input,
    ref: refMsg.value
  })

  const botResponse: string = res?.content || '(응답 없음)'
  
  const parts = botResponse.split(/-{3,}/).map(p => p.trim())

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
  await scrollToBottom()  
}

const copyMsg = (text: string) => {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text)
      .then(() => message.success('복사 성공'))
      .catch(() => message.error('복사 실패'));
  } else {
    // Fallback for older browsers or insecure contexts
    const textArea = document.createElement('textarea');
    textArea.value = text;
    
    // Make the textarea out of sight
    textArea.style.position = 'fixed';
    textArea.style.top = '-9999px';
    textArea.style.left = '-9999px';

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      if (successful) {
        message.success('복사 성공');
      } else {
        message.error('복사 실패');
      }
    } catch (err) {
      message.error('복사 실패');
    }

    document.body.removeChild(textArea);
  }
};

const downloadMsg = (msg: Message) => {
  const blob = new Blob([msg.content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${msg.keyword}_${msg.content.trim().replace(/\s+/g, '').length}.txt`;  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  message.success('다운로드 성공')
}
</script>

<template>

  <div class="chat-container">
    <MagicCard>
      <div style="padding: 20px; color: white;">
        <h2>Magic Card</h2>
        <p>This is a cool magic card from Vue Bits!</p>
      </div>
    </MagicCard>
 <header class="chat-header">
      <div class="header-title"></div>
      <n-select
        v-model:value="service"
        :options="[
          { label: 'GPT', value: 'gpt' },
          { label: 'Claude', value: 'claude' },
          { label: 'Solar', value: 'solar' }, 
          { label: 'Gemini', value: 'gemini' }
        ]"
        size="small"
        class="service-selector"
      />
    </header>

    <section class="chat-messages">
  <n-scrollbar>
    <div
      v-for="(msg, idx) in messages"
      :key="idx"
      :class="['message', msg.role]"
    >
      <div class="bubble">
        <div class="chat-content">
          <template v-if="msg.content === 'loading'">
            <div class="typing-dots">
              <span></span><span></span><span></span>
            </div>
          </template>
          <template v-else>
            <div v-html="formatMessage(msg.content)" />
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
          @click="downloadMsg(msg)"
        >
          <template #icon>
            <download-icon />
          </template>
          다운로드
        
</n-button>
      </div>
    </div>
  
</n-scrollbar>

  <div style="height: 10px;" ref="bottomAnchor" />
</section>

    <footer class="chat-footer">
<div class="chat-input">
  <n-input
    v-model:value="refMsg"
    placeholder="참고 문서를 입력해주세요"
    
    @keyup.enter="handleGenerate"
  />
</div>
<div class="chat-input">
  <n-input
    v-model:value="keyword"
    placeholder="키워드를 입력하세요 (예시: 스마일라식 다음날)"
    
    @keyup.enter="handleGenerate"
  />
  <n-button :loading="isLoading" @click="handleGenerate">
    전송
  
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
.chat-header {
  padding: 16px;
  background: #2d2d2d;
  border-bottom: 1px solid #444;
  font-size: 18px;
  font-weight: bold;
}
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
.copy-btn { 
  color: white;
}
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
.typing-dots {
  display: flex;
  align-items: center;
  gap: 4px;
}
.typing-dots span {
  width: 6px;
  height: 6px;
  background: #888;
  border-radius: 50%;
  animation: blink 1.4s infinite both;
}
.typing-dots span:nth-child(2) {
  animation-delay: 0.2s;
}
.typing-dots span:nth-child(3) {
  animation-delay: 0.4s;
}
@keyframes blink {
  0%, 80%, 100% { opacity: 0 }
  40% { opacity: 1 }
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
</style>
