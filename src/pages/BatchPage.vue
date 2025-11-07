<script setup lang="ts">
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { NButton, NCard, NIcon, NSelect, useMessage } from 'naive-ui';
import {
  Add as AddIcon,
  Trash as TrashIcon,
  Send as SendIcon,
  ArrowBack as BackIcon,
  CloudUpload as UploadIcon,
  TimeOutline as HistoryIcon,
  RefreshOutline as ReloadIcon,
} from '@vicons/ionicons5';
import { useRouter } from 'vue-router';
import { useChatStore } from '@/stores';
import { Input } from '@/components/ui';
import * as Papa from 'papaparse';
import { getBatchHistory, removeBatchHistory, type BatchHistoryItem } from '@/utils/_localStorage';
import { MODEL_OPTIONS } from '@/constants/_models';

const router = useRouter();
const chatStore = useChatStore();
const message = useMessage();

const { batchRequests, batchStatuses, service } = storeToRefs(chatStore);
const { addBatchRequest, removeBatchRequest, updateBatchRequest, handleBatchGenerate, clearBatchRequests } = chatStore;

const fileInputRef = ref<HTMLInputElement | null>(null);
const txtInputRef = ref<HTMLInputElement | null>(null);
const batchHistory = ref<BatchHistoryItem[]>(getBatchHistory());
const showHistory = ref(false);
const isDragging = ref(false);

const validRequests = computed(() => {
  return batchRequests.value.filter((req) => req.keyword.trim());
});

const getStatusText = (status: 'pending' | 'loading' | 'success' | 'error') => {
  const map = {
    pending: '대기',
    loading: '생성중...',
    success: '✓ 완료',
    error: '✗ 실패',
  };
  return map[status];
};

const handleBack = () => {
  router.push('/');
};

const handleFileUploadClick = () => {
  fileInputRef.value?.click();
};

const handleTxtUploadClick = () => {
  txtInputRef.value?.click();
};

const handleTxtFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;

  if (!files || files.length === 0) return;

  // TXT 파일만 필터링
  const txtFiles = Array.from(files).filter(file => file.name.endsWith('.txt'));

  if (txtFiles.length === 0) {
    message.error('TXT 파일만 업로드 가능합니다');
    return;
  }

  let addedCount = 0;

  for (const file of txtFiles) {

    try {
      // 파일 내용 읽기
      const content = await file.text();

      // 파일명에서 확장자 제거하여 키워드로 사용
      const keyword = file.name.replace(/\.txt$/i, '');

      addBatchRequest();
      const idx = batchRequests.value.length - 1;
      updateBatchRequest(idx, {
        keyword: keyword.trim(),
        refMsg: content.trim()
      });
      addedCount++;
    } catch (error) {
      console.error(`파일 읽기 실패: ${file.name}`, error);
    }
  }

  if (addedCount > 0) {
    message.success(`${addedCount}개의 원고가 추가되었습니다`);
  } else {
    message.error('파일을 읽는 중 오류가 발생했습니다');
  }

  // 파일 인풋 초기화
  if (target) target.value = '';
};

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) return;

  // CSV 파일 체크
  if (!file.name.endsWith('.csv')) {
    message.error('CSV 파일만 업로드 가능합니다');
    return;
  }

  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
      try {
        // 기존 배치 요청 모두 클리어
        chatStore.clearBatchRequests();

        let addedCount = 0;

        results.data.forEach((row: any) => {
          const keyword = row['키워드'] || row['keyword'] || row['Keyword'] || '';
          const refMsg = row['참조원고'] || row['refMsg'] || row['reference'] || '';

          if (keyword.trim()) {
            addBatchRequest();
            const idx = batchRequests.value.length - 1;
            updateBatchRequest(idx, {
              keyword: keyword.trim(),
              refMsg: refMsg.trim()
            });
            addedCount++;
          }
        });

        if (addedCount > 0) {
          message.success(`${addedCount}개의 원고가 추가되었습니다`);
        } else {
          message.warning('추가할 수 있는 원고가 없습니다');
        }

        // 파일 인풋 초기화
        if (target) target.value = '';
      } catch (error) {
        message.error('파일 파싱 중 오류가 발생했습니다');
      }
    },
    error: (error: Error) => {
      message.error(`파일 읽기 실패: ${error.message}`);
    }
  });
};

const refreshHistory = () => {
  batchHistory.value = getBatchHistory();
};

const loadHistoryItem = (item: BatchHistoryItem) => {
  clearBatchRequests();

  item.requests.forEach((req) => {
    addBatchRequest();
    const idx = batchRequests.value.length - 1;
    updateBatchRequest(idx, {
      keyword: req.keyword,
      refMsg: req.refMsg || ''
    });
  });

  service.value = item.service as any;
  showHistory.value = false;
  message.success(`${item.requests.length}개의 원고를 불러왔습니다`);
};

const deleteHistoryItem = (id: string) => {
  removeBatchHistory(id);
  refreshHistory();
  message.success('히스토리가 삭제되었습니다');
};

const handleGenerate = async () => {
  await handleBatchGenerate();
  refreshHistory();
};

// 드래그 앤 드롭 핸들러
const handleDragEnter = (e: DragEvent) => {
  e.preventDefault();
  e.stopPropagation();
  isDragging.value = true;
};

const handleDragOver = (e: DragEvent) => {
  e.preventDefault();
  e.stopPropagation();
  isDragging.value = true;
};

const handleDragLeave = (e: DragEvent) => {
  e.preventDefault();
  e.stopPropagation();
  // 자식 요소로 이동할 때도 발생하므로 relatedTarget 체크
  if (e.currentTarget === e.target) {
    isDragging.value = false;
  }
};

const handleDrop = async (e: DragEvent) => {
  e.preventDefault();
  e.stopPropagation();
  isDragging.value = false;

  const files = e.dataTransfer?.files;
  if (!files || files.length === 0) return;

  // TXT 파일만 필터링
  const txtFiles = Array.from(files).filter(file => file.name.endsWith('.txt'));

  if (txtFiles.length === 0) {
    message.error('TXT 파일만 업로드 가능합니다');
    return;
  }

  let addedCount = 0;

  for (const file of txtFiles) {

    try {
      // 파일 내용 읽기
      const content = await file.text();

      // 파일명에서 확장자 제거하여 키워드로 사용
      const keyword = file.name.replace(/\.txt$/i, '');

      addBatchRequest();
      const idx = batchRequests.value.length - 1;
      updateBatchRequest(idx, {
        keyword: keyword.trim(),
        refMsg: content.trim()
      });
      addedCount++;
    } catch (error) {
      console.error(`파일 읽기 실패: ${file.name}`, error);
    }
  }

  if (addedCount > 0) {
    message.success(`${addedCount}개의 원고가 추가되었습니다`);
  } else {
    message.error('파일을 읽는 중 오류가 발생했습니다');
  }
};
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 dark:from-gray-950 dark:to-gray-900 p-6">
    <header class="flex justify-between items-center mb-6 p-5 bg-white dark:bg-gray-800 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
      <div class="flex items-center gap-4">
        <NButton
          text
          @click="handleBack"
          class="text-lg text-slate-500 transition-all min-h-[40px] h-10 w-10 flex items-center justify-center rounded-xl hover:text-indigo-500 hover:bg-indigo-500/10"
        >
          <template #icon>
            <NIcon :component="BackIcon" />
          </template>
        </NButton>
        <NSelect
          v-model:value="service"
          :options="MODEL_OPTIONS"
          size="large"
          class="w-[150px] [&_.n-base-selection]:bg-gradient-to-br [&_.n-base-selection]:from-white/95 [&_.n-base-selection]:to-slate-50/90 [&_.n-base-selection]:rounded-xl [&_.n-base-selection]:border [&_.n-base-selection]:border-indigo-500/20 [&_.n-base-selection]:transition-all [&_.n-base-selection]:shadow-[0_2px_8px_rgba(99,102,241,0.08)] [&_.n-base-selection]:min-h-[40px] [&_.n-base-selection]:h-10 [&_.n-base-selection:hover]:border-indigo-500/40 [&_.n-base-selection:hover]:bg-gradient-to-br [&_.n-base-selection:hover]:from-white [&_.n-base-selection:hover]:to-slate-50/95 [&_.n-base-selection:hover]:-translate-y-px [&_.n-base-selection:hover]:shadow-[0_4px_12px_rgba(99,102,241,0.15)] [&_.n-base-selection-label]:font-semibold [&_.n-base-selection-label]:text-sm [&_.n-base-selection-input__content]:font-semibold [&_.n-base-selection-input__content]:text-sm [&_.n-base-selection-input__content]:text-slate-800"
        />
      </div>

      <div class="flex items-center gap-3">
        <NButton
          secondary
          size="large"
          @click="showHistory = !showHistory"
          class="min-h-[40px] h-10 font-semibold text-purple-600 bg-gradient-to-br from-purple-600/10 to-purple-600/5 border border-purple-600/30 transition-all hover:bg-gradient-to-br hover:from-purple-600/15 hover:to-purple-600/8 hover:border-purple-600/40 hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(139,92,246,0.2)]"
        >
          <template #icon>
            <NIcon :component="HistoryIcon" />
          </template>
          히스토리 ({{ batchHistory.length }})
        </NButton>

        <NButton
          secondary
          size="large"
          @click="handleFileUploadClick"
          class="min-h-[40px] h-10 font-semibold text-emerald-600 bg-gradient-to-br from-emerald-600/10 to-emerald-600/5 border border-emerald-600/30 transition-all hover:bg-gradient-to-br hover:from-emerald-600/15 hover:to-emerald-600/8 hover:border-emerald-600/40 hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(16,185,129,0.2)]"
        >
          <template #icon>
            <NIcon :component="UploadIcon" />
          </template>
          CSV 업로드
        </NButton>

        <NButton
          secondary
          size="large"
          @click="handleTxtUploadClick"
          class="min-h-[40px] h-10 font-semibold text-blue-600 bg-gradient-to-br from-blue-600/10 to-blue-600/5 border border-blue-600/30 transition-all hover:bg-gradient-to-br hover:from-blue-600/15 hover:to-blue-600/8 hover:border-blue-600/40 hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(59,130,246,0.2)]"
        >
          <template #icon>
            <NIcon :component="UploadIcon" />
          </template>
          TXT 업로드
        </NButton>

        <NButton
          dashed
          size="large"
          @click="addBatchRequest"
          class="min-h-[40px] h-10 font-semibold border-2 border-dashed border-slate-300 text-indigo-500 bg-indigo-500/5 transition-all hover:border-indigo-500 hover:bg-indigo-500/10 hover:-translate-y-0.5"
        >
          <template #icon>
            <NIcon :component="AddIcon" />
          </template>
          원고 추가 ({{ batchRequests.length }})
        </NButton>

        <NButton
          type="primary"
          size="large"
          @click="handleGenerate"
          :disabled="validRequests.length === 0"
          class="min-h-[40px] h-10 font-bold bg-gradient-to-br from-indigo-500 to-purple-600 border-none shadow-[0_4px_16px_rgba(99,102,241,0.3)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(99,102,241,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          <template #icon>
            <NIcon :component="SendIcon" />
          </template>
          전체 생성
        </NButton>
      </div>
    </header>

    <!-- Hidden file input -->
    <input
      ref="fileInputRef"
      type="file"
      accept=".csv"
      @change="handleFileChange"
      class="hidden"
    />

    <!-- Hidden txt file input -->
    <input
      ref="txtInputRef"
      type="file"
      accept=".txt"
      multiple
      @change="handleTxtFileChange"
      class="hidden"
    />

    <div
      class="max-w-[1400px] mx-auto relative"
      @dragenter="handleDragEnter"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
    >
      <!-- 드래그 오버레이 -->
      <div
        v-if="isDragging"
        class="absolute inset-0 z-50 flex items-center justify-center bg-blue-500/10 border-4 border-dashed border-blue-500 rounded-2xl backdrop-blur-sm pointer-events-none"
      >
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center">
          <NIcon :component="UploadIcon" class="text-6xl text-blue-500 mb-4" />
          <p class="text-xl font-bold text-blue-600 m-0">TXT 파일을 여기에 드롭하세요</p>
          <p class="text-sm text-slate-500 mt-2 m-0">여러 파일을 동시에 추가할 수 있습니다</p>
        </div>
      </div>

      <NCard class="bg-white dark:bg-gray-800 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead class="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-700 dark:to-gray-800 border-b-2 border-slate-200 dark:border-gray-600">
              <tr>
                <th class="w-[60px] text-center p-4 text-left text-[13px] font-bold text-slate-500 dark:text-gray-300 uppercase tracking-wide">#</th>
                <th class="w-[35%] p-4 text-left text-[13px] font-bold text-slate-500 dark:text-gray-300 uppercase tracking-wide">키워드</th>
                <th class="w-[40%] p-4 text-left text-[13px] font-bold text-slate-500 dark:text-gray-300 uppercase tracking-wide">참조원고</th>
                <th class="w-[120px] p-4 text-left text-[13px] font-bold text-slate-500 dark:text-gray-300 uppercase tracking-wide">상태</th>
                <th class="w-[80px] text-center p-4 text-left text-[13px] font-bold text-slate-500 dark:text-gray-300 uppercase tracking-wide">액션</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(req, idx) in batchRequests"
                :key="req.id"
                class="transition-colors hover:bg-slate-50 dark:hover:bg-gray-700/50"
              >
                <td class="p-3 border-b border-slate-100 dark:border-gray-700 text-center">
                  <span class="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 dark:from-indigo-500/20 dark:to-indigo-500/10 rounded-lg font-bold text-indigo-500 dark:text-indigo-400">
                    {{ idx + 1 }}
                  </span>
                </td>
                <td class="p-3 border-b border-slate-100 dark:border-gray-700">
                  <Input
                    :modelValue="req.keyword"
                    @update:modelValue="(val: string) => updateBatchRequest(idx as number, { keyword: val })"
                    placeholder="키워드를 입력하세요..."
                    type="text"
                  />
                </td>
                <td class="p-3 border-b border-slate-100 dark:border-gray-700">
                  <Input
                    :modelValue="req.refMsg || ''"
                    @update:modelValue="(val: string) => updateBatchRequest(idx as number, { refMsg: val })"
                    placeholder="참조원고 (선택)"
                    type="textarea"
                    :rows="1"
                    :autosize="{ minRows: 1, maxRows: 3 }"
                  />
                </td>
                <td class="p-3 border-b border-slate-100 dark:border-gray-700">
                  <span
                    v-if="batchStatuses[req.id]"
                    :class="[
                      'inline-block px-3 py-1.5 rounded-lg text-[13px] font-semibold',
                      batchStatuses[req.id] === 'pending' && 'bg-slate-500/10 text-slate-600',
                      batchStatuses[req.id] === 'loading' && 'bg-amber-500/10 text-amber-600 animate-pulse',
                      batchStatuses[req.id] === 'success' && 'bg-emerald-500/10 text-emerald-600',
                      batchStatuses[req.id] === 'error' && 'bg-red-500/10 text-red-600'
                    ]"
                  >
                    {{ getStatusText(batchStatuses[req.id]) }}
                  </span>
                  <span v-else class="inline-block px-3 py-1.5 rounded-lg text-[13px] font-semibold bg-slate-500/10 text-slate-600">
                    대기
                  </span>
                </td>
                <td class="p-3 border-b border-slate-100 text-center">
                  <NButton
                    text
                    type="error"
                    @click="removeBatchRequest(idx)"
                    class="text-lg text-slate-400 transition-all hover:text-red-500 hover:scale-110"
                  >
                    <template #icon>
                      <NIcon :component="TrashIcon" />
                    </template>
                  </NButton>
                </td>
              </tr>

              <!-- 빈 행 표시 -->
              <tr v-if="batchRequests.length === 0">
                <td colspan="5" class="py-[60px] px-5">
                  <div class="text-center text-slate-400 dark:text-slate-500">
                    <NIcon :component="UploadIcon" class="text-6xl text-slate-300 dark:text-slate-600 mb-4" />
                    <p class="m-0 text-lg font-bold text-slate-600 dark:text-slate-400">아직 추가된 원고가 없습니다</p>
                    <p class="mt-3 m-0 text-sm text-slate-400 dark:text-slate-500">
                      <strong class="text-blue-500 dark:text-blue-400">TXT 파일을 드래그 앤 드롭</strong>하거나
                      <strong class="text-emerald-500 dark:text-emerald-400">CSV 업로드</strong> 버튼을 눌러 시작하세요
                    </p>
                    <p class="mt-2 m-0 text-xs text-slate-300 dark:text-slate-600">
                      💡 TXT 파일: 파일명 → 키워드, 파일 내용 → 참조원고
                    </p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </NCard>

      <!-- 진행률 표시 -->
      <div v-if="Object.keys(batchStatuses).length > 0" class="mt-6">
        <NCard class="bg-white dark:bg-gray-800 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
          <h3 class="m-0 mb-4 text-base font-bold text-slate-800 dark:text-gray-100">생성 진행 상황</h3>
          <div class="flex gap-6 text-sm font-semibold">
            <span class="px-4 py-2 bg-slate-50 dark:bg-gray-700 rounded-lg text-slate-700 dark:text-gray-200">
              완료: {{ Object.values(batchStatuses).filter(s => s === 'success').length }}
            </span>
            <span class="px-4 py-2 bg-slate-50 dark:bg-gray-700 rounded-lg text-slate-700 dark:text-gray-200">
              진행중: {{ Object.values(batchStatuses).filter(s => s === 'loading').length }}
            </span>
            <span class="px-4 py-2 bg-slate-50 dark:bg-gray-700 rounded-lg text-slate-700 dark:text-gray-200">
              실패: {{ Object.values(batchStatuses).filter(s => s === 'error').length }}
            </span>
          </div>
        </NCard>
      </div>

      <!-- 히스토리 섹션 -->
      <div v-if="showHistory" class="mt-6">
        <NCard class="bg-white dark:bg-gray-800 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
          <div class="flex justify-between items-center mb-4">
            <h3 class="m-0 text-base font-bold text-slate-800 dark:text-gray-100">배치 생성 히스토리</h3>
            <NButton text @click="showHistory = false" class="text-slate-600 dark:text-gray-300 hover:text-slate-800 dark:hover:text-gray-100">
              닫기
            </NButton>
          </div>

          <div v-if="batchHistory.length === 0" class="text-center py-10 px-5 text-slate-400 dark:text-gray-500">
            <p>저장된 히스토리가 없습니다</p>
          </div>

          <div v-else class="flex flex-col gap-3">
            <div
              v-for="item in batchHistory"
              :key="item.id"
              class="p-4 bg-slate-50 dark:bg-gray-700 rounded-xl border border-slate-200 dark:border-gray-600 transition-all hover:bg-slate-100 dark:hover:bg-gray-600 hover:border-slate-300 dark:hover:border-gray-500"
            >
              <div class="flex justify-between items-start mb-3">
                <div class="flex flex-col gap-1">
                  <strong class="text-sm text-slate-800 dark:text-gray-100">{{ item.title }}</strong>
                  <span class="text-xs text-slate-500 dark:text-gray-400">
                    {{ new Date(item.timestamp).toLocaleString('ko-KR') }} ·
                    {{ item.totalCount }}개 원고 ·
                    서비스: {{ item.service.toUpperCase() }}
                  </span>
                </div>
                <div class="flex gap-2">
                  <NButton
                    size="small"
                    type="primary"
                    @click="loadHistoryItem(item)"
                  >
                    <template #icon>
                      <NIcon :component="ReloadIcon" />
                    </template>
                    불러오기
                  </NButton>
                  <NButton
                    size="small"
                    type="error"
                    @click="deleteHistoryItem(item.id)"
                  >
                    <template #icon>
                      <NIcon :component="TrashIcon" />
                    </template>
                    삭제
                  </NButton>
                </div>
              </div>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="(req, idx) in item.requests.slice(0, 3)"
                  :key="idx"
                  class="px-2.5 py-1 bg-white dark:bg-gray-600 border border-slate-300 dark:border-gray-500 rounded-md text-xs text-slate-700 dark:text-gray-200"
                >
                  {{ req.keyword }}
                </span>
                <span
                  v-if="item.requests.length > 3"
                  class="px-2.5 py-1 text-xs text-slate-400 dark:text-gray-500 font-semibold"
                >
                  외 {{ item.requests.length - 3 }}개
                </span>
              </div>
            </div>
          </div>
        </NCard>
      </div>
    </div>
  </div>
</template>

