<script setup lang="ts">
import {  ref, watch } from 'vue'
import {
  NScrollbar,
  NInput,
  NButton,
  NSelect,
createDiscreteApi
} from 'naive-ui'
import { delay } from 'es-toolkit'
import { CopyOutline as CopyIcon, DownloadOutline as DownloadIcon } from '@vicons/ionicons5'
import { generateText, getCategory } from '../service/chat.service'
import LoadingDots from '../components/LoadingDots.vue'
import { downloadText } from '../utils/downloadText'
import MarkdownIt from 'markdown-it'
import { formatMessage } from '../utils/formatMsg'

const md = new MarkdownIt({ linkify: true, breaks: true })

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
    content: `
# **시작하려면 아래 순서대로 입력하세요.**

## 1. 키워드 입력
- 예시: \`위고비 가격\`

## 2. 카테고리 선택
- 예시: \`위고비 가격 카테고리: 다이어트\`

### 사용 가능 카테고리
- 뷰티제품
- 뷰티시술
- 다이어트
- 건강기능식품
- 가전제품
- 병원
- 법률
- 안과
- 애완/애견
- 창업
- 여행
- 치과
- 웨딩

## 3. 원고 형태 선택
- 리뷰형 또는 정보성
- 예시:
  - \`위고비 가격 카테고리: 다이어트 (리뷰형 요망)\`
  - \`주식리딩방사기 카테고리: 법률 (정보성 요망)\`

## 4. 강조 사항 지정 (선택)
- 특정 화자/타겟 설정 가능
- 예시: \`위고비 가격 카테고리: 다이어트 (20대 여성을 화자로 입력 요망)\`

## 5. 참조 문서
- 카테고리에 없는 글을 넣을 경우 첨부해주세요.
- 글의 흐름 및 제품의 정보를 인식하는 역할을 합니다.

> 아래 입력창에 **참고 문서**(선택)와 **키워드**를 넣고 전송을 누르면 원고를 생성합니다.
`
  }
])
const keyword = ref('')
const refMsg = ref('')
const service = ref<'gpt' | 'claude' | 'solar' | 'gemini' | 'gpt-5'>('gpt')
const isLoading = ref(false)
const isCategoryLoading = ref(false)
const category = ref('')

const chatMessagesRef = ref<HTMLDivElement | null>(null)
const lastMessageRef = ref<HTMLDivElement | null>(null)
const scrollbarRef = ref<InstanceType<typeof NScrollbar> | null>(null) 

const scrollToLast = async () => {
  
  const lastEl = lastMessageRef.value
  const sc = scrollbarRef.value
  if (lastEl && sc) {

    sc.scrollTo({ top: lastEl.offsetTop, behavior: 'smooth' })
  }
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
}

const handleCategoryClick = async () => {
  isCategoryLoading.value = true
try {
    if(keyword.value.length === 0) {
      message.warning('키워드를 입력해주세요.')
      return
    }
    const res = await getCategory({keyword: keyword.value})

    category.value  = res

    message.info(`해당 키워드의 카테고리는 ${category.value} 입니다.`)
  } catch (error) {
    console.error(error)
    
  }finally{
    isCategoryLoading.value = false
  }
}

const copyMsg = (text: string) => {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text)
      .then(() => message.success('복사 성공'))
      .catch(() => message.error('복사 실패'));
  } else {
    
    const textArea = document.createElement('textarea');
    textArea.value = text;
    
    
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

const handleDownloadClick = (msg: Message) => {
  const fileName = `${msg.keyword}_${msg.content.trim().replace(/\s+/g, '').length}`;  
  const content = msg?.content

  try {
    downloadText({
      fileName, content
    })
    message.success('다운로드가 완료되었습니다.')
  } catch (error) {
    message.error('다운로드에 실패하였습니다.')
  }
}

watch(() => messages.value.length, async () => {
  await delay(1000)
  scrollToLast()
})
</script>

<template>

  <div class="chat-container">

 <header class="chat-header">
      <div class="header-title"></div>
      <n-select
        v-model:value="service"
        :options="[
          { label: 'GPT', value: 'gpt' },
          { label: 'GPT5', value: 'gpt-5' },
          { label: 'Gemini', value: 'gemini' },
          { label: 'Claude', value: 'claude' },
          { label: 'Solar', value: 'solar' }, 
        ]"
        size="small"
        class="service-selector"
      />
    </header>

    <section ref="chatMessagesRef" class="chat-messages">
  <n-scrollbar>
    <div
      v-for="(msg, idx) in messages"
      :key="idx"
      :class="['message', msg.role]"
    >
        <div
          class="bubble"
          :ref="(el) => {                   
            if (idx === messages.length - 1) {
              lastMessageRef = el as HTMLDivElement
            }
          }"
        >
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

  <div style="height: 10px;" ref="bottomAnchor" />
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
    v-model:value="keyword"
    placeholder="키워드를 입력하세요 (예시: 스마일라식 다음날)"
    tabindex="1"
    
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
