<script setup>
import { ref } from 'vue'
import {
  NScrollbar,
  NInput,
  NButton,
  NSpace,
  NRadioGroup,
  NRadio
} from 'naive-ui'
import { generateText } from './service/chat.service'
const formatMessage = (text) => {
  if (!text) return ''
  return text.replace(/\n/g, '<br/>')
}

const keyword = ref('')
const service = ref<'gpt' | 'claude'>('gpt')
const messages = ref([
  { role: 'bot', content: '원고 생성 챗봇입니다. 키워드를 입력하세요.' }
])
const isLoading = ref(false)

const handleGenerate = async () => {
  if (!keyword.value.trim()) return

  const input = keyword.value
  messages.value.push({ role: 'user', content: input })
  keyword.value = ''
  isLoading.value = true
  const loadingIndex = messages.value.length
  messages.value.push({ role: 'bot', content: 'loading' }) 
  try {
    const res = await generateText({
      service: 'solar',
      keyword: input
    })
    const botResponse = res?.response || '(응답 없음)'

    messages.value[loadingIndex] = { role: 'bot', content: botResponse }
  } catch (error) {
    messages.value[loadingIndex] = { role: 'bot', content: '⚠️ 오류가 발생했어요. 다시 시도해주세요!' }
  } finally {
    isLoading.value = false
  }
}

const copyMsg = (text) => {
  navigator.clipboard.writeText(text)
    .then(() => alert('원고가 복사되었습니다!'))
    .catch(() => alert('복사에 실패했습니다.'))
}
</script>

<template>
  <div class="chat-container">
    <!-- <header class="chat-header">
      
    </header> -->

    <section class="chat-messages">
  <n-scrollbar>
    <div
      v-for="(msg, idx) in messages"
      :key="idx"
      :class="['message', msg.role]"
    >
      <div class="bubble">
<div
  class="chat-content"
  v-html="msg.content === 'loading' ? '<span class=loading-dots></span>' : formatMessage(msg.content)"
/>
        <n-button
          v-if="msg.role === 'bot'"
          class="copy-btn"
          size="tiny"
          tertiary
          quaternary
          style="margin-left: auto;"
          @click="copyMsg(msg.content)"
        >
          복사
        </n-button>
      </div>
    </div>
  </n-scrollbar>
</section>

    <footer class="chat-input">
  <n-input
    v-model:value="keyword"
    placeholder="키워드를 입력하세요"
    
    @keyup.enter="handleGenerate"
  />
  <n-button :loading="isLoading" @click="handleGenerate">
    전송
  </n-button>
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
  gap: 3px;
  position: relative;
  max-width: 70%;
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
}
.copy-btn { 
  color: white;
}
.chat-input {
  display: flex;
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
</style>