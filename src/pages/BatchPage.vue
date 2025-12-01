<script setup lang="ts">
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
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
import { Button, Card, Input, Select } from '@/components/ui';
import * as Papa from 'papaparse';
import { getBatchHistory, removeBatchHistory, type BatchHistoryItem } from '@/utils/_localStorage';
import { MODEL_OPTIONS } from '@/constants/_models';

const router = useRouter();
const chatStore = useChatStore();

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

const showToast = (text: string, type: 'success' | 'error' | 'warning' = 'success') => {
  const toast = document.createElement('div');
  const bgColor = type === 'success' ? 'bg-emerald-500' : type === 'error' ? 'bg-red-500' : 'bg-amber-500';
  toast.className = `fixed top-4 left-1/2 -translate-x-1/2 ${bgColor} text-white px-6 py-3 rounded-xl shadow-lg z-[9999] animate-[slideDown_0.3s_ease-out]`;
  toast.textContent = text;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
};

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

  const txtFiles = Array.from(files).filter(file => file.name.endsWith('.txt'));

  if (txtFiles.length === 0) {
    showToast('TXT 파일만 업로드 가능합니다', 'error');
    return;
  }

  let addedCount = 0;

  for (const file of txtFiles) {
    try {
      const content = await file.text();
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
    showToast(`${addedCount}개의 원고가 추가되었습니다`, 'success');
  } else {
    showToast('파일을 읽는 중 오류가 발생했습니다', 'error');
  }

  if (target) target.value = '';
};

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) return;

  if (!file.name.endsWith('.csv')) {
    showToast('CSV 파일만 업로드 가능합니다', 'error');
    return;
  }

  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
      try {
        chatStore.clearBatchRequests();

        let addedCount = 0;

        results.data.forEach((row: unknown) => {
          const r = row as Record<string, string>;
          const keyword = r['키워드'] || r['keyword'] || r['Keyword'] || '';
          const refMsg = r['참조원고'] || r['refMsg'] || r['reference'] || '';

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
          showToast(`${addedCount}개의 원고가 추가되었습니다`, 'success');
        } else {
          showToast('추가할 수 있는 원고가 없습니다', 'warning');
        }

        if (target) target.value = '';
      } catch {
        showToast('파일 파싱 중 오류가 발생했습니다', 'error');
      }
    },
    error: (error: Error) => {
      showToast(`파일 읽기 실패: ${error.message}`, 'error');
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

  service.value = item.service as typeof service.value;
  showHistory.value = false;
  showToast(`${item.requests.length}개의 원고를 불러왔습니다`, 'success');
};

const deleteHistoryItem = (id: string) => {
  removeBatchHistory(id);
  refreshHistory();
  showToast('히스토리가 삭제되었습니다', 'success');
};

const handleGenerate = async () => {
  await handleBatchGenerate();
  refreshHistory();
};

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

  const txtFiles = Array.from(files).filter(file => file.name.endsWith('.txt'));

  if (txtFiles.length === 0) {
    showToast('TXT 파일만 업로드 가능합니다', 'error');
    return;
  }

  let addedCount = 0;

  for (const file of txtFiles) {
    try {
      const content = await file.text();
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
    showToast(`${addedCount}개의 원고가 추가되었습니다`, 'success');
  } else {
    showToast('파일을 읽는 중 오류가 발생했습니다', 'error');
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
    <header class="flex flex-col gap-4 md:flex-row md:justify-between md:items-center mb-6 p-4 md:p-5 bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-black/30 border border-gray-200 dark:border-gray-700">
      <div class="flex items-center gap-3 md:gap-4">
        <Button
          variant="ghost"
          size="sm"
          icon-only
          @click="handleBack"
          class="w-10 h-10 flex-shrink-0"
        >
          <BackIcon class="w-5 h-5" />
        </Button>
        <Select
          v-model="service"
          :options="MODEL_OPTIONS"
          size="sm"
          class="flex-1 md:flex-none md:min-w-[120px]"
        />
      </div>

      <!-- 모바일: 아이콘 버튼 그룹 -->
      <div class="flex items-center justify-between gap-2 md:hidden">
        <div class="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon-only
            @click="showHistory = !showHistory"
            class="text-purple-600 bg-purple-600/10 border-purple-600/30 hover:bg-purple-600/15"
            title="히스토리"
          >
            <HistoryIcon class="w-4 h-4" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon-only
            @click="handleFileUploadClick"
            class="text-emerald-600 bg-emerald-600/10 border-emerald-600/30 hover:bg-emerald-600/15"
            title="CSV 업로드"
          >
            <UploadIcon class="w-4 h-4" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon-only
            @click="handleTxtUploadClick"
            class="text-brand bg-brand/10 border-brand/30 hover:bg-brand/15"
            title="TXT 업로드"
          >
            <UploadIcon class="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon-only
            @click="addBatchRequest"
            class="border-2 border-dashed border-gray-300 text-brand hover:border-brand hover:bg-brand/10"
            title="원고 추가"
          >
            <AddIcon class="w-4 h-4" />
          </Button>
        </div>
        <Button
          variant="primary"
          size="sm"
          @click="handleGenerate"
          :disabled="validRequests.length === 0"
        >
          <SendIcon class="w-4 h-4" />
          생성
        </Button>
      </div>

      <!-- 데스크톱: 텍스트 포함 버튼 -->
      <div class="hidden md:flex items-center gap-3">
        <Button
          variant="secondary"
          size="sm"
          @click="showHistory = !showHistory"
          class="text-purple-600 bg-purple-600/10 border-purple-600/30 hover:bg-purple-600/15"
        >
          <HistoryIcon class="w-4 h-4" />
          히스토리 ({{ batchHistory.length }})
        </Button>
        <Button
          variant="secondary"
          size="sm"
          @click="handleFileUploadClick"
          class="text-emerald-600 bg-emerald-600/10 border-emerald-600/30 hover:bg-emerald-600/15"
        >
          <UploadIcon class="w-4 h-4" />
          CSV
        </Button>
        <Button
          variant="secondary"
          size="sm"
          @click="handleTxtUploadClick"
          class="text-brand bg-brand/10 border-brand/30 hover:bg-brand/15"
        >
          <UploadIcon class="w-4 h-4" />
          TXT
        </Button>
        <Button
          variant="ghost"
          size="sm"
          @click="addBatchRequest"
          class="border-2 border-dashed border-gray-300 text-brand hover:border-brand hover:bg-brand/10"
        >
          <AddIcon class="w-4 h-4" />
          추가 ({{ batchRequests.length }})
        </Button>
        <Button
          variant="primary"
          size="sm"
          @click="handleGenerate"
          :disabled="validRequests.length === 0"
        >
          <SendIcon class="w-4 h-4" />
          생성
        </Button>
      </div>
    </header>

    <input
      ref="fileInputRef"
      type="file"
      accept=".csv"
      @change="handleFileChange"
      class="hidden"
    />

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
      <div
        v-if="isDragging"
        class="absolute inset-0 z-50 flex items-center justify-center bg-brand/10 border-4 border-dashed border-brand rounded-2xl pointer-events-none"
      >
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center border border-gray-200 dark:border-gray-700">
          <UploadIcon class="w-16 h-16 text-brand mx-auto mb-4" />
          <p class="text-xl font-bold text-brand m-0">TXT 파일을 여기에 드롭하세요</p>
          <p class="text-sm text-gray-500 mt-2 m-0">여러 파일을 동시에 추가할 수 있습니다</p>
        </div>
      </div>

      <Card variant="elevated" class="overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead class="bg-gray-50 dark:bg-gray-800 border-b-2 border-gray-200 dark:border-gray-700">
              <tr>
                <th class="w-[60px] text-center p-4 text-[13px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">#</th>
                <th class="w-[35%] p-4 text-left text-[13px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">키워드</th>
                <th class="w-[40%] p-4 text-left text-[13px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">참조원고</th>
                <th class="w-[120px] p-4 text-left text-[13px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">상태</th>
                <th class="w-[80px] text-center p-4 text-[13px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">액션</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(req, idx) in batchRequests"
                :key="req.id"
                class="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <td class="p-3 border-b border-gray-100 dark:border-gray-700 text-center">
                  <span class="inline-flex items-center justify-center w-8 h-8 bg-brand/10 dark:bg-brand/20 rounded-lg font-bold text-brand">
                    {{ idx + 1 }}
                  </span>
                </td>
                <td class="p-3 border-b border-gray-100 dark:border-gray-700">
                  <Input
                    :modelValue="req.keyword"
                    @update:modelValue="(val: string) => updateBatchRequest(idx as number, { keyword: val })"
                    placeholder="키워드를 입력하세요..."
                    type="text"
                  />
                </td>
                <td class="p-3 border-b border-gray-100 dark:border-gray-700">
                  <Input
                    :modelValue="req.refMsg || ''"
                    @update:modelValue="(val: string) => updateBatchRequest(idx as number, { refMsg: val })"
                    placeholder="참조원고 (선택)"
                    type="textarea"
                    :rows="1"
                    :autosize="{ minRows: 1, maxRows: 3 }"
                  />
                </td>
                <td class="p-3 border-b border-gray-100 dark:border-gray-700">
                  <span
                    v-if="batchStatuses[req.id]"
                    :class="[
                      'inline-block px-3 py-1.5 rounded-lg text-[13px] font-semibold',
                      batchStatuses[req.id] === 'pending' && 'bg-gray-500/10 text-gray-600',
                      batchStatuses[req.id] === 'loading' && 'bg-amber-500/10 text-amber-600 animate-pulse',
                      batchStatuses[req.id] === 'success' && 'bg-emerald-500/10 text-emerald-600',
                      batchStatuses[req.id] === 'error' && 'bg-red-500/10 text-red-600'
                    ]"
                  >
                    {{ getStatusText(batchStatuses[req.id]) }}
                  </span>
                  <span v-else class="inline-block px-3 py-1.5 rounded-lg text-[13px] font-semibold bg-gray-500/10 text-gray-600">
                    대기
                  </span>
                </td>
                <td class="p-3 border-b border-gray-100 text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon-only
                    @click="removeBatchRequest(idx)"
                    class="text-gray-400 hover:text-red-500 hover:bg-red-500/10"
                  >
                    <TrashIcon class="w-5 h-5" />
                  </Button>
                </td>
              </tr>

              <tr v-if="batchRequests.length === 0">
                <td colspan="5" class="py-[60px] px-5">
                  <div class="text-center text-gray-400 dark:text-gray-500">
                    <UploadIcon class="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p class="m-0 text-lg font-bold text-gray-600 dark:text-gray-400">아직 추가된 원고가 없습니다</p>
                    <p class="mt-3 m-0 text-sm text-gray-400 dark:text-gray-500">
                      <strong class="text-brand">TXT 파일을 드래그 앤 드롭</strong>하거나
                      <strong class="text-emerald-500">CSV 업로드</strong> 버튼을 눌러 시작하세요
                    </p>
                    <p class="mt-2 m-0 text-xs text-gray-300 dark:text-gray-600">
                      💡 TXT 파일: 파일명 → 키워드, 파일 내용 → 참조원고
                    </p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      <div v-if="Object.keys(batchStatuses).length > 0" class="mt-6">
        <Card variant="elevated">
          <h3 class="m-0 mb-4 text-base font-bold text-gray-800 dark:text-gray-100">생성 진행 상황</h3>
          <div class="flex gap-6 text-sm font-semibold">
            <span class="px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-200">
              완료: {{ Object.values(batchStatuses).filter(s => s === 'success').length }}
            </span>
            <span class="px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-200">
              진행중: {{ Object.values(batchStatuses).filter(s => s === 'loading').length }}
            </span>
            <span class="px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-200">
              실패: {{ Object.values(batchStatuses).filter(s => s === 'error').length }}
            </span>
          </div>
        </Card>
      </div>

      <div v-if="showHistory" class="mt-6">
        <Card variant="elevated">
          <div class="flex justify-between items-center mb-4">
            <h3 class="m-0 text-base font-bold text-gray-800 dark:text-gray-100">배치 생성 히스토리</h3>
            <Button variant="ghost" size="sm" @click="showHistory = false">
              닫기
            </Button>
          </div>

          <div v-if="batchHistory.length === 0" class="text-center py-10 px-5 text-gray-400 dark:text-gray-500">
            <p>저장된 히스토리가 없습니다</p>
          </div>

          <div v-else class="flex flex-col gap-3">
            <div
              v-for="item in batchHistory"
              :key="item.id"
              class="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 transition-colors hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              <div class="flex justify-between items-start mb-3">
                <div class="flex flex-col gap-1">
                  <strong class="text-sm text-gray-800 dark:text-gray-100">{{ item.title }}</strong>
                  <span class="text-xs text-gray-500 dark:text-gray-400">
                    {{ new Date(item.timestamp).toLocaleString('ko-KR') }} ·
                    {{ item.totalCount }}개 원고 ·
                    서비스: {{ item.service.toUpperCase() }}
                  </span>
                </div>
                <div class="flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    @click="loadHistoryItem(item)"
                  >
                    <ReloadIcon class="w-4 h-4" />
                    불러오기
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    @click="deleteHistoryItem(item.id)"
                  >
                    <TrashIcon class="w-4 h-4" />
                    삭제
                  </Button>
                </div>
              </div>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="(req, idx) in item.requests.slice(0, 3)"
                  :key="idx"
                  class="px-2.5 py-1 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md text-xs text-gray-700 dark:text-gray-200"
                >
                  {{ req.keyword }}
                </span>
                <span
                  v-if="item.requests.length > 3"
                  class="px-2.5 py-1 text-xs text-gray-400 dark:text-gray-500 font-semibold"
                >
                  외 {{ item.requests.length - 3 }}개
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  </div>
</template>

<style>
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translate(-50%, -20px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}
</style>
