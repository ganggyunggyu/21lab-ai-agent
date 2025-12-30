<script setup lang="ts">
import { ref, computed } from 'vue';
import JSZip from 'jszip';
import { Button, Switch, Card, Input } from '@/components/ui';
import { axiosInstance } from '@/app/config';

const isLoading = ref(false);
const result = ref<any>(null);
const error = ref<string | null>(null);

// 원고 모드: true = AI 생성, false = ZIP 업로드
const useAiGeneration = ref(true);

// 계정 정보
const accountId = ref('');
const accountPassword = ref('');

// 키워드 (AI 생성 모드용, 줄바꿈 구분)
const keywordsText = ref('');
const keywordList = computed(() =>
  keywordsText.value
    .split('\n')
    .map((k) => k.trim())
    .filter(Boolean)
);

// ZIP 업로드 모드용
interface UploadedFolder {
  name: string;
  manuscriptFile: File | null;
  imageFiles: File[];
}
const uploadedFolderList = ref<UploadedFolder[]>([]);
const isDragOver = ref(false);

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

// 현재 모드에 따른 원고 개수
const manuscriptCount = computed(() => {
  if (useAiGeneration.value) {
    return keywordList.value.length;
  } else {
    return uploadedFolderList.value.length;
  }
});

// 총 일수 계산
const totalDays = computed(() => {
  if (manuscriptCount.value === 0) return 0;
  return Math.ceil(manuscriptCount.value / postsPerDay.value);
});

// 스케줄 미리보기
const schedulePreview = computed(() => {
  const items = useAiGeneration.value
    ? keywordList.value
    : uploadedFolderList.value.map((f) => f.name);

  if (items.length === 0) return null;

  const preview: Record<string, string[]> = {};
  const start = new Date(startDate.value);

  for (let day = 0; day < totalDays.value; day++) {
    const date = new Date(start);
    date.setDate(date.getDate() + day);
    const dateStr = date.toISOString().split('T')[0];
    const startIdx = day * postsPerDay.value;
    const endIdx = Math.min(startIdx + postsPerDay.value, items.length);
    preview[dateStr] = items.slice(startIdx, endIdx);
  }

  return preview;
});

const canSubmit = computed(() => {
  const hasAccount =
    accountId.value.trim() !== '' && accountPassword.value.trim() !== '';
  const hasManuscripts = manuscriptCount.value >= 1;
  const hasDate = startDate.value !== '';
  return hasAccount && hasManuscripts && hasDate;
});

// 폴더 드래그앤드롭
const handleDragOver = (e: DragEvent) => {
  e.preventDefault();
  isDragOver.value = true;
};

const handleDragLeave = () => {
  isDragOver.value = false;
};

const handleDrop = async (e: DragEvent) => {
  e.preventDefault();
  isDragOver.value = false;
  const items = e.dataTransfer?.items;
  if (!items) return;

  const dirEntries: FileSystemDirectoryEntry[] = [];
  for (const item of Array.from(items)) {
    if (item.kind === 'file') {
      const entry = item.webkitGetAsEntry();
      if (entry?.isDirectory) {
        dirEntries.push(entry as FileSystemDirectoryEntry);
      }
    }
  }

  for (const dirEntry of dirEntries) {
    await processDirectory(dirEntry);
  }
};

const processDirectory = async (dirEntry: FileSystemDirectoryEntry) => {
  const folder: UploadedFolder = {
    name: dirEntry.name,
    manuscriptFile: null,
    imageFiles: [],
  };

  const readEntries = (
    reader: FileSystemDirectoryReader
  ): Promise<FileSystemEntry[]> =>
    new Promise((resolve, reject) => reader.readEntries(resolve, reject));

  const getFile = (fileEntry: FileSystemFileEntry): Promise<File> =>
    new Promise((resolve, reject) => fileEntry.file(resolve, reject));

  const processEntry = async (entry: FileSystemEntry, _path = '') => {
    if (entry.isFile) {
      const file = await getFile(entry as FileSystemFileEntry);
      if (file.name.endsWith('.txt')) {
        folder.manuscriptFile = file;
      } else if (
        file.type.startsWith('image/') ||
        /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name)
      ) {
        folder.imageFiles.push(file);
      }
    } else if (entry.isDirectory) {
      const entries = await readEntries(
        (entry as FileSystemDirectoryEntry).createReader()
      );
      for (const subEntry of entries) {
        await processEntry(subEntry, _path + entry.name + '/');
      }
    }
  };

  const entries = await readEntries(dirEntry.createReader());
  for (const entry of entries) {
    await processEntry(entry);
  }

  if (folder.manuscriptFile || folder.imageFiles.length > 0) {
    uploadedFolderList.value.push(folder);
  }
};

const removeFolder = (index: number) => {
  uploadedFolderList.value.splice(index, 1);
};

const clearFolderList = () => {
  uploadedFolderList.value = [];
};

const handleSubmit = async () => {
  if (!canSubmit.value) return;

  isLoading.value = true;
  error.value = null;
  result.value = null;

  try {
    if (useAiGeneration.value) {
      // AI 생성 모드 - /bot/auto-schedule (queues 배열 구조)
      const response = await axiosInstance.post('/bot/auto-schedule', {
        queues: [
          {
            account: {
              id: accountId.value,
              password: accountPassword.value,
            },
            keywords: keywordList.value,
          },
        ],
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
    } else {
      // ZIP 업로드 모드 - /bot/upload-schedule
      const zip = new JSZip();

      for (const folder of uploadedFolderList.value) {
        const folderName = folder.name;
        if (folder.manuscriptFile) {
          zip.file(
            `${folderName}/${folder.manuscriptFile.name}`,
            await folder.manuscriptFile.text()
          );
        }
        for (const img of folder.imageFiles) {
          zip.file(`${folderName}/${img.name}`, await img.arrayBuffer());
        }
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const formData = new FormData();
      formData.append('file', zipBlob, 'manuscripts.zip');
      formData.append('account_id', accountId.value);
      formData.append('password', accountPassword.value);
      formData.append('start_date', startDate.value);
      formData.append('start_hour', startHour.value.toString());
      formData.append('posts_per_day', postsPerDay.value.toString());
      formData.append('interval_hours', intervalHours.value.toString());
      formData.append('delay_between_posts', delayBetweenPosts.value.toString());

      const response = await axiosInstance.post(
        '/bot/upload-schedule',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 600000,
        }
      );
      result.value = response.data;
      uploadedFolderList.value = [];
    }
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
          원고 개수에 따라 자동으로 일수가 계산되어 예약 발행됩니다
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

          <!-- 원고 소스 선택 -->
          <Card
            class="bg-white/3 backdrop-blur-[10px] border border-white/8 rounded-2xl p-0!"
          >
            <div class="p-5 px-6">
              <h3
                class="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4"
              >
                원고 소스
              </h3>
              <div class="flex gap-1 p-1 bg-slate-900/40 rounded-lg">
                <button
                  :class="[
                    'flex-1 py-2.5 px-4 text-sm font-medium rounded-md transition-all',
                    useAiGeneration
                      ? 'bg-indigo-500/30 text-slate-200'
                      : 'text-slate-400 hover:text-slate-200',
                  ]"
                  @click="useAiGeneration = true"
                >
                  🤖 AI 생성
                </button>
                <button
                  :class="[
                    'flex-1 py-2.5 px-4 text-sm font-medium rounded-md transition-all',
                    !useAiGeneration
                      ? 'bg-blue-500/30 text-slate-200'
                      : 'text-slate-400 hover:text-slate-200',
                  ]"
                  @click="useAiGeneration = false"
                >
                  📁 ZIP 업로드
                </button>
              </div>
            </div>
          </Card>

          <!-- AI 생성: 키워드 입력 -->
          <Card
            v-if="useAiGeneration"
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

          <!-- ZIP 업로드: 폴더 드래그앤드롭 -->
          <Card
            v-else
            class="bg-white/3 backdrop-blur-[10px] border border-white/8 rounded-2xl p-0!"
          >
            <div class="p-5 px-6">
              <div class="flex justify-between items-center mb-4">
                <h3
                  class="text-sm font-semibold text-slate-400 uppercase tracking-wide"
                >
                  원고 폴더
                </h3>
                <span
                  :class="[
                    'text-xs font-medium px-2 py-1 rounded',
                    uploadedFolderList.length >= 1
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-amber-500/20 text-amber-400',
                  ]"
                >
                  {{ uploadedFolderList.length }}개 → {{ totalDays }}일
                </span>
              </div>

              <div
                :class="[
                  'flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl transition-all cursor-pointer',
                  isDragOver
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-white/20 hover:border-white/30 bg-slate-900/40',
                ]"
                @dragover="handleDragOver"
                @dragleave="handleDragLeave"
                @drop="handleDrop"
              >
                <span class="text-3xl mb-2">📁</span>
                <p class="text-sm font-medium text-slate-200">
                  폴더를 여기에 드래그하세요
                </p>
                <p class="text-[11px] text-slate-500 mt-1">
                  폴더 안에 원고.txt + 이미지 구조
                </p>
              </div>

              <div v-if="uploadedFolderList.length > 0" class="mt-4">
                <div class="flex justify-between items-center mb-2">
                  <span class="text-xs font-medium text-slate-400"
                    >{{ uploadedFolderList.length }}개 폴더</span
                  >
                  <button
                    class="text-[11px] text-red-400 border border-red-500/30 px-2 py-1 rounded hover:bg-red-500/10 transition-all"
                    @click="clearFolderList"
                  >
                    전체 삭제
                  </button>
                </div>
                <ul class="flex flex-col gap-1.5 max-h-[200px] overflow-y-auto">
                  <li
                    v-for="(folder, index) in uploadedFolderList"
                    :key="folder.name"
                    class="flex justify-between items-center p-2.5 px-3 bg-white/3 border border-white/6 rounded-lg"
                  >
                    <div class="flex items-center gap-2.5">
                      <span class="text-[13px] font-medium text-slate-200">{{
                        folder.name
                      }}</span>
                      <span class="text-[11px] text-slate-500"
                        >{{ folder.manuscriptFile ? '📄' : '❌' }}
                        {{ folder.imageFiles.length }}장</span
                      >
                    </div>
                    <button
                      class="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-red-400 transition-colors"
                      @click="removeFolder(index)"
                    >
                      ×
                    </button>
                  </li>
                </ul>
              </div>
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

          <!-- 발행 옵션 (AI 생성 모드만) -->
          <Card
            v-if="useAiGeneration"
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
            <template v-if="useAiGeneration">
              예약발행 시작 ({{ keywordList.length }}개 키워드, {{ totalDays }}일)
            </template>
            <template v-else>
              예약발행 시작 ({{ uploadedFolderList.length }}개 원고,
              {{ totalDays }}일)
            </template>
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
                  v-for="(items, date) in schedulePreview"
                  :key="date"
                  class="p-3 bg-white/3 border border-white/6 rounded-xl"
                >
                  <div class="text-xs text-slate-500 mb-2">{{ date }}</div>
                  <div class="flex flex-col gap-1.5">
                    <div
                      v-for="(item, idx) in items"
                      :key="idx"
                      class="flex items-center gap-2"
                    >
                      <span class="text-[10px] text-slate-600 w-10">
                        {{ getTimeSlots(startHour, postsPerDay, intervalHours)[idx] }}
                      </span>
                      <span class="text-sm text-slate-300 truncate">{{
                        item
                      }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div
                v-else
                class="text-center py-8 text-slate-500 text-sm border border-dashed border-white/10 rounded-xl"
              >
                <template v-if="useAiGeneration">
                  키워드를 입력하면<br />스케줄이 표시됩니다
                </template>
                <template v-else>
                  폴더를 업로드하면<br />스케줄이 표시됩니다
                </template>
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
                    Queue ID: {{ result.queue_results?.[0]?.queue_id || result.queue_id }}
                  </p>
                </div>

                <div
                  v-if="result.summary"
                  class="grid grid-cols-2 gap-2 text-xs"
                >
                  <div class="p-2 bg-white/3 rounded-lg">
                    <span class="text-slate-500">{{
                      useAiGeneration ? '키워드' : '업로드'
                    }}</span>
                    <span class="text-slate-200 ml-2">{{
                      result.summary.total_keywords || result.summary.generated || result.summary.uploaded
                    }}</span>
                  </div>
                  <div class="p-2 bg-white/3 rounded-lg">
                    <span class="text-slate-500">발행</span>
                    <span class="text-slate-200 ml-2">{{
                      result.summary.total_published || result.summary.published
                    }}</span>
                  </div>
                  <div class="p-2 bg-white/3 rounded-lg">
                    <span class="text-slate-500">실패</span>
                    <span class="text-slate-200 ml-2">{{
                      result.summary.total_failed || result.summary.failed
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
