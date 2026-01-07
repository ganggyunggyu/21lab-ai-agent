<script setup lang="ts">
import { ref, computed } from 'vue';
import { Button, Card, Input, Switch } from '@/components/ui';
import { scheduleAxiosInstance } from '@/app/config';
import { ACCOUNT_PRESETS, type AccountPreset } from '@/constants';

const selectAccountForQueue = (queue: QueueItem, account: AccountPreset) => {
  queue.accountId = account.id;
  queue.accountPassword = account.password;
};

const getAccountMvpn = (accountId: string) => {
  const account = ACCOUNT_PRESETS.find((a) => a.id === accountId);
  return account?.mvpn || null;
};

const copyMvpn = async (mvpn: string) => {
  await navigator.clipboard.writeText(mvpn);
};

const isLoading = ref(false);
const result = ref<any>(null);
const error = ref<string | null>(null);

interface QueueItem {
  id: string;
  accountId: string;
  accountPassword: string;
  keywordsText: string;
}

const queues = ref<QueueItem[]>([
  {
    id: crypto.randomUUID(),
    accountId: '',
    accountPassword: '',
    keywordsText: '',
  },
]);

const addQueue = () => {
  queues.value.push({
    id: crypto.randomUUID(),
    accountId: '',
    accountPassword: '',
    keywordsText: '',
  });
};

const removeQueue = (queueId: string) => {
  if (queues.value.length <= 1) return;
  queues.value = queues.value.filter((q) => q.id !== queueId);
};

const getKeywordList = (queue: QueueItem) => {
  return queue.keywordsText
    .split('\n')
    .map((k) => k.trim())
    .filter(Boolean);
};

const totalKeywordCount = computed(() => {
  return queues.value.reduce((sum, q) => sum + getKeywordList(q).length, 0);
});

const scheduleDate = ref(new Date().toISOString().split('T')[0]);
const generateImages = ref(true);

const canSubmit = computed(() => {
  const allQueuesValid = queues.value.every(
    (q) =>
      q.accountId.trim() !== '' &&
      q.accountPassword.trim() !== '' &&
      getKeywordList(q).length >= 1
  );
  const hasDate = scheduleDate.value !== '';
  return allQueuesValid && hasDate;
});

const handleSubmit = async () => {
  if (!canSubmit.value || isLoading.value) return;

  isLoading.value = true;
  error.value = null;
  result.value = null;

  try {
    const queuePayload = queues.value.map((queue) => ({
      account: {
        id: queue.accountId,
        password: queue.accountPassword,
      },
      keywords: getKeywordList(queue),
    }));

    const response = await scheduleAxiosInstance.post('/bot/auto-schedule', {
      queues: queuePayload,
      schedule_date: scheduleDate.value,
      generate_images: generateImages.value,
    });
    result.value = response.data;
  } catch (err: any) {
    error.value = err.response?.data?.detail || err.message || '요청 실패';
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div
    class="p-6 min-h-screen bg-linear-to-br from-[#0f0f1a] via-[#1a1a2e] to-[#16213e]"
  >
    <div class="max-w-[900px] mx-auto">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-white mb-2">예약발행</h1>
        <p class="text-slate-400 text-sm">
          계정별 키워드를 입력하고 예약 날짜를 선택하세요
        </p>
      </div>

      <div class="flex flex-col gap-4">
        <!-- 날짜 선택 & 옵션 -->
        <Card
          class="bg-white/3 backdrop-blur-[10px] border border-white/8 rounded-2xl p-0!"
        >
          <div class="p-5 px-6 flex flex-wrap items-end gap-6">
            <div>
              <h3
                class="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3"
              >
                예약 날짜
              </h3>
              <input
                v-model="scheduleDate"
                type="date"
                class="w-full max-w-[200px] p-3 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500/50"
              />
            </div>
            <div class="flex items-center gap-3">
              <Switch v-model="generateImages" />
              <span class="text-sm text-slate-300">이미지 생성</span>
            </div>
          </div>
        </Card>

        <!-- 큐 카드 (계정 + 키워드) -->
        <Card
          v-for="(queue, queueIndex) in queues"
          :key="queue.id"
          class="bg-white/3 backdrop-blur-[10px] border border-white/8 rounded-2xl p-0! relative"
        >
          <!-- 큐 헤더 -->
          <div class="p-4 px-6 border-b border-white/5 flex justify-between items-center">
            <div class="flex items-center gap-3">
              <span
                class="w-6 h-6 flex items-center justify-center bg-indigo-500/20 text-indigo-400 text-xs font-bold rounded-full"
              >
                {{ queueIndex + 1 }}
              </span>
              <h3 class="text-sm font-semibold text-slate-300">
                {{ queue.accountId || `계정 ${queueIndex + 1}` }}
              </h3>
              <span
                :class="[
                  'text-[10px] font-medium px-2 py-0.5 rounded',
                  getKeywordList(queue).length >= 1
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-amber-500/20 text-amber-400',
                ]"
              >
                {{ getKeywordList(queue).length }}개 키워드
              </span>
            </div>
            <button
              v-if="queues.length > 1"
              class="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-all"
              @click="removeQueue(queue.id)"
              title="큐 삭제"
            >
              ×
            </button>
          </div>

          <!-- 계정 빠른 선택 -->
          <div class="p-3 px-6 border-b border-white/5 bg-white/2">
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="account in ACCOUNT_PRESETS"
                :key="account.id + account.name"
                :class="[
                  'px-2.5 py-1 text-[11px] font-medium rounded-md transition-all',
                  queue.accountId === account.id
                    ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/40'
                    : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 hover:text-slate-200',
                ]"
                @click="selectAccountForQueue(queue, account)"
              >
                {{ account.name }}
              </button>
            </div>
          </div>

          <!-- 계정 정보 -->
          <div class="p-4 px-6 border-b border-white/5">
            <div class="grid grid-cols-2 gap-3">
              <Input
                v-model="queue.accountId"
                placeholder="아이디"
                class="bg-white/5 border-white/10"
              />
              <Input
                v-model="queue.accountPassword"
                type="password"
                placeholder="비밀번호"
                class="bg-white/5 border-white/10"
              />
            </div>
            <!-- MVPN 표시 -->
            <div
              v-if="getAccountMvpn(queue.accountId)"
              class="mt-2 flex items-center gap-2"
            >
              <span class="text-[10px] text-slate-500">MVPN:</span>
              <span class="text-[11px] text-emerald-400 font-mono">{{
                getAccountMvpn(queue.accountId)
              }}</span>
              <button
                class="px-1.5 py-0.5 text-[10px] text-slate-400 bg-white/5 border border-white/10 rounded hover:bg-white/10 hover:text-slate-200 transition-all"
                @click="copyMvpn(getAccountMvpn(queue.accountId)!)"
              >
                복사
              </button>
            </div>
          </div>

          <!-- 키워드 입력 -->
          <div class="p-4 px-6">
            <textarea
              v-model="queue.keywordsText"
              placeholder="키워드를 한 줄에 하나씩 입력하세요"
              class="w-full h-[180px] p-3 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-200 placeholder-slate-500 resize-none focus:outline-none focus:border-indigo-500/50"
            />
          </div>
        </Card>

        <!-- 큐 추가 버튼 -->
        <button
          class="w-full py-3.5 border-2 border-dashed border-white/15 rounded-xl text-slate-400 text-sm font-medium hover:border-indigo-500/40 hover:text-indigo-400 hover:bg-indigo-500/5 transition-all"
          @click="addQueue"
        >
          + 계정 추가
        </button>

        <!-- 제출 버튼 -->
        <Button
          :loading="isLoading"
          :disabled="!canSubmit"
          size="lg"
          display="full"
          @click="handleSubmit"
        >
          예약발행 시작 ({{ queues.length }}개 계정, {{ totalKeywordCount }}개 키워드)
        </Button>

        <!-- 결과 표시 -->
        <Card
          v-if="result || error"
          class="bg-white/3 backdrop-blur-[10px] border border-white/8 rounded-2xl p-0!"
        >
          <div class="p-5 px-6">
            <h3
              class="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4"
            >
              결과
            </h3>

            <div
              v-if="error"
              class="p-4 bg-red-500/10 border border-red-500/20 rounded-xl"
            >
              <p class="text-sm text-red-400">{{ error }}</p>
            </div>

            <div v-else-if="result" class="flex flex-col gap-3">
              <div
                class="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl"
              >
                <p class="text-sm text-emerald-400">
                  예약발행이 완료되었습니다
                </p>
                <p class="text-xs text-slate-500 mt-1">
                  Queue ID: {{ result.queue_results?.[0]?.queue_id || result.queue_id }}
                </p>
              </div>

              <div
                v-if="result.summary"
                class="grid grid-cols-2 gap-2 text-xs"
              >
                <div class="p-2 bg-white/3 rounded-lg">
                  <span class="text-slate-500">키워드</span>
                  <span class="text-slate-200 ml-2">{{
                    result.summary.total_keywords
                  }}</span>
                </div>
                <div class="p-2 bg-white/3 rounded-lg">
                  <span class="text-slate-500">발행</span>
                  <span class="text-slate-200 ml-2">{{
                    result.summary.total_published
                  }}</span>
                </div>
                <div class="p-2 bg-white/3 rounded-lg">
                  <span class="text-slate-500">실패</span>
                  <span class="text-slate-200 ml-2">{{
                    result.summary.total_failed
                  }}</span>
                </div>
                <div class="p-2 bg-white/3 rounded-lg">
                  <span class="text-slate-500">소요</span>
                  <span class="text-slate-200 ml-2"
                    >{{ Math.round(result.summary.elapsed) }}초</span
                  >
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  </div>
</template>
