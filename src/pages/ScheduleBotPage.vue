<script setup lang="ts">
import { ref, computed } from 'vue';
import { Button, Switch, Card, Input } from '@/components/ui';
import { axiosInstance } from '@/app/config';

const isLoading = ref(false);
const result = ref<any>(null);
const error = ref<string | null>(null);

// 계정 정보
const accountId = ref('');
const accountPassword = ref('');

// 키워드 (줄바꿈 구분, 개수 제한 없음)
const keywordsText = ref('');
const keywordList = computed(() =>
  keywordsText.value
    .split('\n')
    .map((k) => k.trim())
    .filter(Boolean)
);

// 스케줄 설정
const startDate = ref(new Date().toISOString().split('T')[0]);
const startHour = ref(10);
const postsPerDay = ref(3);
const intervalHours = ref(2);

// 발행 옵션
const service = ref('default');
const refText = ref('');
const generateImages = ref(true);
const imageCount = ref(5);
const delayBetweenPosts = ref(10);

// 총 일수 계산
const totalDays = computed(() => {
  if (keywordList.value.length === 0) return 0;
  return Math.ceil(keywordList.value.length / postsPerDay.value);
});

// 스케줄 미리보기
const schedulePreview = computed(() => {
  if (keywordList.value.length === 0) return null;

  const preview: Record<string, string[]> = {};
  const start = new Date(startDate.value);

  for (let day = 0; day < totalDays.value; day++) {
    const date = new Date(start);
    date.setDate(date.getDate() + day);
    const dateStr = date.toISOString().split('T')[0];
    const startIdx = day * postsPerDay.value;
    const endIdx = Math.min(startIdx + postsPerDay.value, keywordList.value.length);
    preview[dateStr] = keywordList.value.slice(startIdx, endIdx);
  }

  return preview;
});

const canSubmit = computed(() => {
  return (
    accountId.value.trim() !== '' &&
    accountPassword.value.trim() !== '' &&
    keywordList.value.length >= 1 &&
    startDate.value !== ''
  );
});

const handleSubmit = async () => {
  if (!canSubmit.value) return;

  isLoading.value = true;
  error.value = null;
  result.value = null;

  try {
    const response = await axiosInstance.post('/bot/auto-schedule', {
      account: {
        id: accountId.value,
        password: accountPassword.value,
      },
      keywords: keywordList.value,
      start_date: startDate.value,
      start_hour: startHour.value,
      posts_per_day: postsPerDay.value,
      interval_hours: intervalHours.value,
      service: service.value,
      ref: refText.value,
      generate_images: generateImages.value,
      image_count: imageCount.value,
      delay_between_posts: delayBetweenPosts.value,
    });

    result.value = response.data;
  } catch (err: any) {
    error.value = err.response?.data?.detail || err.message || '요청 실패';
  } finally {
    isLoading.value = false;
  }
};

const getTimeSlots = (hour: number, count: number, interval: number) => {
  const slots = [];
  for (let i = 0; i < count; i++) {
    slots.push(`${hour + i * interval}:00`);
  }
  return slots;
};

const getEndDate = computed(() => {
  if (totalDays.value === 0) return '';
  const start = new Date(startDate.value);
  start.setDate(start.getDate() + totalDays.value - 1);
  return start.toISOString().split('T')[0];
});
</script>

<template>
  <div
    class="p-6 min-h-screen bg-linear-to-br from-[#0f0f1a] via-[#1a1a2e] to-[#16213e]"
  >
    <div class="max-w-[1200px] mx-auto">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-white mb-2">예약발행</h1>
        <p class="text-slate-400 text-sm">
          키워드 개수에 따라 자동으로 일수가 계산되어 예약 발행됩니다
        </p>
      </div>

      <div class="grid grid-cols-[1fr_400px] gap-6 max-lg:grid-cols-1">
        <!-- 왼쪽: 입력 폼 -->
        <div class="flex flex-col gap-4">
          <!-- 계정 정보 -->
          <Card
            class="bg-white/3 backdrop-blur-[10px] border border-white/8 rounded-2xl p-0!"
          >
            <div class="p-5 px-6">
              <h3
                class="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4"
              >
                네이버 계정
              </h3>
              <div class="flex flex-col gap-3">
                <Input
                  v-model="accountId"
                  placeholder="아이디"
                  class="bg-white/5 border-white/10"
                />
                <Input
                  v-model="accountPassword"
                  type="password"
                  placeholder="비밀번호"
                  class="bg-white/5 border-white/10"
                />
              </div>
            </div>
          </Card>

          <!-- 키워드 입력 -->
          <Card
            class="bg-white/3 backdrop-blur-[10px] border border-white/8 rounded-2xl p-0!"
          >
            <div class="p-5 px-6">
              <div class="flex justify-between items-center mb-4">
                <h3
                  class="text-sm font-semibold text-slate-400 uppercase tracking-wide"
                >
                  키워드
                </h3>
                <span
                  :class="[
                    'text-xs font-medium px-2 py-1 rounded',
                    keywordList.length >= 1
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-amber-500/20 text-amber-400',
                  ]"
                >
                  {{ keywordList.length }}개 → {{ totalDays }}일
                </span>
              </div>
              <textarea
                v-model="keywordsText"
                placeholder="키워드를 한 줄에 하나씩 입력하세요"
                class="w-full h-[300px] p-4 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-200 placeholder-slate-500 resize-none focus:outline-none focus:border-blue-500/50"
              />
            </div>
          </Card>

          <!-- 스케줄 설정 -->
          <Card
            class="bg-white/3 backdrop-blur-[10px] border border-white/8 rounded-2xl p-0!"
          >
            <div class="p-5 px-6">
              <h3
                class="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4"
              >
                스케줄 설정
              </h3>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="text-xs text-slate-500 mb-1.5 block"
                    >시작 날짜</label
                  >
                  <input
                    v-model="startDate"
                    type="date"
                    class="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500/50"
                  />
                </div>
                <div>
                  <label class="text-xs text-slate-500 mb-1.5 block"
                    >첫 발행 시간</label
                  >
                  <select
                    v-model="startHour"
                    class="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500/50"
                  >
                    <option v-for="h in 20" :key="h - 1" :value="h - 1">
                      {{ (h - 1).toString().padStart(2, '0') }}:00
                    </option>
                  </select>
                </div>
                <div>
                  <label class="text-xs text-slate-500 mb-1.5 block"
                    >하루 발행 수</label
                  >
                  <select
                    v-model="postsPerDay"
                    class="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500/50"
                  >
                    <option v-for="n in 10" :key="n" :value="n">
                      {{ n }}개
                    </option>
                  </select>
                </div>
                <div>
                  <label class="text-xs text-slate-500 mb-1.5 block"
                    >발행 간격 (시간)</label
                  >
                  <select
                    v-model="intervalHours"
                    class="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500/50"
                  >
                    <option v-for="n in 12" :key="n" :value="n">
                      {{ n }}시간
                    </option>
                  </select>
                </div>
              </div>
              <p class="mt-3 text-xs text-slate-500">
                발행 시간:
                {{ getTimeSlots(startHour, postsPerDay, intervalHours).join(', ') }}
              </p>
            </div>
          </Card>

          <!-- 발행 옵션 -->
          <Card
            class="bg-white/3 backdrop-blur-[10px] border border-white/8 rounded-2xl p-0!"
          >
            <div class="p-5 px-6">
              <h3
                class="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4"
              >
                발행 옵션
              </h3>
              <div class="flex flex-col gap-4">
                <div>
                  <label class="text-xs text-slate-500 mb-1.5 block"
                    >서비스</label
                  >
                  <Input
                    v-model="service"
                    placeholder="default"
                    class="bg-white/5 border-white/10"
                  />
                </div>

                <label
                  class="flex items-center gap-3.5 p-3.5 px-4 bg-white/2 border border-white/6 rounded-xl cursor-pointer hover:bg-white/4 transition-all"
                >
                  <Switch v-model="generateImages" size="sm" />
                  <div class="flex flex-col gap-0.5">
                    <span class="text-sm font-medium text-slate-200"
                      >이미지 자동생성</span
                    >
                    <span class="text-[11px] text-slate-500"
                      >AI로 이미지 생성</span
                    >
                  </div>
                </label>

                <div v-if="generateImages" class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="text-xs text-slate-500 mb-1.5 block"
                      >이미지 수</label
                    >
                    <input
                      v-model.number="imageCount"
                      type="number"
                      min="1"
                      max="10"
                      class="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                  <div>
                    <label class="text-xs text-slate-500 mb-1.5 block"
                      >발행 대기 (초)</label
                    >
                    <input
                      v-model.number="delayBetweenPosts"
                      type="number"
                      min="5"
                      max="60"
                      class="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label class="text-xs text-slate-500 mb-1.5 block"
                    >참조 원고 (선택)</label
                  >
                  <textarea
                    v-model="refText"
                    placeholder="참조할 원고 내용을 입력하세요"
                    class="w-full h-[100px] p-3 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-200 placeholder-slate-500 resize-none focus:outline-none focus:border-blue-500/50"
                  />
                </div>
              </div>
            </div>
          </Card>

          <!-- 제출 버튼 -->
          <Button
            :loading="isLoading"
            :disabled="!canSubmit"
            size="lg"
            display="full"
            @click="handleSubmit"
          >
            예약발행 시작 ({{ keywordList.length }}개 키워드, {{ totalDays }}일)
          </Button>
        </div>

        <!-- 오른쪽: 스케줄 미리보기 -->
        <div class="flex flex-col gap-4">
          <Card
            class="bg-white/3 backdrop-blur-[10px] border border-white/8 rounded-2xl p-0! sticky top-6"
          >
            <div class="p-5 px-6">
              <div class="flex justify-between items-center mb-4">
                <h3
                  class="text-sm font-semibold text-slate-400 uppercase tracking-wide"
                >
                  스케줄 미리보기
                </h3>
                <span v-if="totalDays > 0" class="text-xs text-slate-500">
                  {{ startDate }} ~ {{ getEndDate }}
                </span>
              </div>

              <div
                v-if="schedulePreview"
                class="flex flex-col gap-3 max-h-[500px] overflow-y-auto"
              >
                <div
                  v-for="(keywords, date) in schedulePreview"
                  :key="date"
                  class="p-3 bg-white/3 border border-white/6 rounded-xl"
                >
                  <div class="text-xs text-slate-500 mb-2">{{ date }}</div>
                  <div class="flex flex-col gap-1.5">
                    <div
                      v-for="(kw, idx) in keywords"
                      :key="idx"
                      class="flex items-center gap-2"
                    >
                      <span class="text-[10px] text-slate-600 w-10">
                        {{ getTimeSlots(startHour, postsPerDay, intervalHours)[idx] }}
                      </span>
                      <span class="text-sm text-slate-300 truncate">{{
                        kw
                      }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div
                v-else
                class="text-center py-8 text-slate-500 text-sm border border-dashed border-white/10 rounded-xl"
              >
                키워드를 입력하면<br />스케줄이 표시됩니다
              </div>
            </div>
          </Card>

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
                    Queue ID: {{ result.queue_id }}
                  </p>
                </div>

                <div
                  v-if="result.summary"
                  class="grid grid-cols-2 gap-2 text-xs"
                >
                  <div class="p-2 bg-white/3 rounded-lg">
                    <span class="text-slate-500">생성</span>
                    <span class="text-slate-200 ml-2">{{
                      result.summary.generated
                    }}</span>
                  </div>
                  <div class="p-2 bg-white/3 rounded-lg">
                    <span class="text-slate-500">발행</span>
                    <span class="text-slate-200 ml-2">{{
                      result.summary.published
                    }}</span>
                  </div>
                  <div class="p-2 bg-white/3 rounded-lg">
                    <span class="text-slate-500">실패</span>
                    <span class="text-slate-200 ml-2">{{
                      result.summary.failed
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
  </div>
</template>
