<script setup lang="ts">
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { NButton, NCard, NIcon, NProgress, NSelect, useMessage } from 'naive-ui';
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
import { useChatStore } from '@/stores/_chat';
import ModernInput from '@/components/ui/ModernInput.vue';
import * as Papa from 'papaparse';
import { getBatchHistory, removeBatchHistory, type BatchHistoryItem } from '@/utils/_localStorage';
import { MODEL_OPTIONS } from '@/constants/_models';

const router = useRouter();
const chatStore = useChatStore();
const message = useMessage();

const { batchRequests, batchStatuses, service } = storeToRefs(chatStore);
const { addBatchRequest, removeBatchRequest, updateBatchRequest, handleBatchGenerate, clearBatchRequests } = chatStore;

const fileInputRef = ref<HTMLInputElement | null>(null);
const batchHistory = ref<BatchHistoryItem[]>(getBatchHistory());
const showHistory = ref(false);

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

const getStatusClass = (status: 'pending' | 'loading' | 'success' | 'error') => {
  return `status-${status}`;
};

const handleBack = () => {
  router.push('/');
};

const handleFileUploadClick = () => {
  fileInputRef.value?.click();
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
          // 20개 제한 체크
          if (batchRequests.value.length >= 20) {
            return;
          }

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
    if (batchRequests.value.length >= 20) return;

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
</script>

<template>
  <div class="batch-page">
    <header class="batch-header">
      <div class="header-left">
        <NButton text @click="handleBack" class="back-btn">
          <template #icon>
            <NIcon :component="BackIcon" />
          </template>
        </NButton>
        <NSelect
          v-model:value="service"
          :options="MODEL_OPTIONS"
          size="large"
          class="service-selector"
        />
      </div>

      <div class="header-right">
        <NButton
          secondary
          size="large"
          @click="showHistory = !showHistory"
          class="history-btn-header"
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
          class="upload-btn-header"
        >
          <template #icon>
            <NIcon :component="UploadIcon" />
          </template>
          CSV 업로드
        </NButton>

        <NButton
          dashed
          size="large"
          @click="addBatchRequest"
          :disabled="batchRequests.length >= 20"
          class="add-row-btn-header"
        >
          <template #icon>
            <NIcon :component="AddIcon" />
          </template>
          원고 추가 ({{ batchRequests.length }}/20)
        </NButton>

        <NButton
          type="primary"
          size="large"
          @click="handleGenerate"
          :disabled="validRequests.length === 0"
          class="generate-btn"
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
      style="display: none"
    />

    <div class="batch-container">
      <NCard class="batch-card">
        <div class="table-wrapper">
          <table class="batch-table">
            <thead>
              <tr>
                <th class="col-no">#</th>
                <th class="col-keyword">키워드</th>
                <th class="col-ref">참조원고</th>
                <th class="col-status">상태</th>
                <th class="col-action">액션</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(req, idx) in batchRequests"
                :key="req.id"
                class="batch-row"
              >
                <td class="col-no">
                  <span class="row-number">{{ idx + 1 }}</span>
                </td>
                <td class="col-keyword">
                  <ModernInput
                    :modelValue="req.keyword"
                    @update:modelValue="(val: string) => updateBatchRequest(idx as number, { keyword: val })"
                    placeholder="키워드를 입력하세요..."
                    type="text"
                    class="table-input"
                  />
                </td>
                <td class="col-ref">
                  <ModernInput
                    :modelValue="req.refMsg || ''"
                    @update:modelValue="(val: string) => updateBatchRequest(idx as number, { refMsg: val })"
                    placeholder="참조원고 (선택)"
                    type="textarea"
                    :rows="1"
                    :autosize="{ minRows: 1, maxRows: 3 }"
                    class="table-input"
                  />
                </td>
                <td class="col-status">
                  <span
                    v-if="batchStatuses[req.id]"
                    :class="['status-badge', getStatusClass(batchStatuses[req.id])]"
                  >
                    {{ getStatusText(batchStatuses[req.id]) }}
                  </span>
                  <span v-else class="status-badge status-pending">대기</span>
                </td>
                <td class="col-action">
                  <NButton
                    text
                    type="error"
                    @click="removeBatchRequest(idx)"
                    class="delete-btn"
                  >
                    <template #icon>
                      <NIcon :component="TrashIcon" />
                    </template>
                  </NButton>
                </td>
              </tr>

              <!-- 빈 행 표시 -->
              <tr v-if="batchRequests.length === 0" class="empty-row">
                <td colspan="5">
                  <div class="empty-state">
                    <p>아직 추가된 원고가 없습니다.</p>
                    <p class="empty-hint">"+ 원고 추가" 버튼을 눌러 시작하세요</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </NCard>

      <!-- 진행률 표시 -->
      <div v-if="Object.keys(batchStatuses).length > 0" class="progress-section">
        <NCard class="progress-card">
          <h3>생성 진행 상황</h3>
          <div class="progress-info">
            <span>완료: {{ Object.values(batchStatuses).filter(s => s === 'success').length }}</span>
            <span>진행중: {{ Object.values(batchStatuses).filter(s => s === 'loading').length }}</span>
            <span>실패: {{ Object.values(batchStatuses).filter(s => s === 'error').length }}</span>
          </div>
        </NCard>
      </div>

      <!-- 히스토리 섹션 -->
      <div v-if="showHistory" class="history-section">
        <NCard class="history-card">
          <div class="history-header">
            <h3>배치 생성 히스토리</h3>
            <NButton text @click="showHistory = false">닫기</NButton>
          </div>

          <div v-if="batchHistory.length === 0" class="empty-history">
            <p>저장된 히스토리가 없습니다</p>
          </div>

          <div v-else class="history-list">
            <div
              v-for="item in batchHistory"
              :key="item.id"
              class="history-item"
            >
              <div class="history-item-header">
                <div class="history-title">
                  <strong>{{ item.title }}</strong>
                  <span class="history-meta">
                    {{ new Date(item.timestamp).toLocaleString('ko-KR') }} ·
                    {{ item.totalCount }}개 원고 ·
                    서비스: {{ item.service.toUpperCase() }}
                  </span>
                </div>
                <div class="history-actions">
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
              <div class="history-preview">
                <span v-for="(req, idx) in item.requests.slice(0, 3)" :key="idx" class="preview-keyword">
                  {{ req.keyword }}
                </span>
                <span v-if="item.requests.length > 3" class="preview-more">
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

<style scoped>
.batch-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 24px;
}

.batch-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 20px 24px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  font-size: 18px;
  color: #64748b;
  transition: all 0.2s;
  min-height: 40px;
  height: 40px;
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

.back-btn:hover {
  color: #6366f1;
  background: rgba(99, 102, 241, 0.1);
}

.service-selector {
  width: 150px;
}

.service-selector :deep(.n-base-selection) {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.9));
  border-radius: 12px;
  border: 1px solid rgba(99, 102, 241, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.08);
  min-height: 40px;
  height: 40px;
  display: flex;
  align-items: center;
}

.service-selector :deep(.n-base-selection:hover) {
  border-color: rgba(99, 102, 241, 0.4);
  background: linear-gradient(135deg, rgba(255, 255, 255, 1), rgba(248, 250, 252, 0.95));
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
}

.service-selector :deep(.n-base-selection-label) {
  font-weight: 600;
  font-size: 14px;
  display: flex;
  align-items: center;
  height: 100%;
}

.service-selector :deep(.n-base-selection-input) {
  display: flex;
  align-items: center;
  height: 100%;
}

.service-selector :deep(.n-base-selection-input__content) {
  font-weight: 600;
  font-size: 14px;
  color: #1e293b;
  line-height: 1;
}

.service-selector :deep(.n-base-suffix) {
  display: flex;
  align-items: center;
  height: 100%;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-right :deep(.n-button) {
  min-height: 40px;
  height: 40px;
  display: flex;
  align-items: center;
}

.upload-btn-header {
  font-weight: 600;
  color: #10b981;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05));
  border: 1px solid rgba(16, 185, 129, 0.3);
  transition: all 0.3s;
}

.upload-btn-header:hover {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.08));
  border-color: rgba(16, 185, 129, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.2);
}

.add-row-btn-header {
  font-weight: 600;
  border: 2px dashed #cbd5e1;
  color: #6366f1;
  background: rgba(99, 102, 241, 0.05);
  transition: all 0.3s;
}

.add-row-btn-header:hover:not(:disabled) {
  border-color: #6366f1;
  background: rgba(99, 102, 241, 0.1);
  transform: translateY(-2px);
}

.generate-btn {
  font-weight: 700;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border: none;
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.3);
  transition: all 0.3s;
}

.generate-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4);
}

.batch-container {
  max-width: 1400px;
  margin: 0 auto;
}

.batch-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.table-wrapper {
  overflow-x: auto;
}

.batch-table {
  width: 100%;
  border-collapse: collapse;
}

.batch-table thead {
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-bottom: 2px solid #e2e8f0;
}

.batch-table th {
  padding: 16px;
  text-align: left;
  font-size: 13px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.batch-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #f1f5f9;
}

.batch-row {
  transition: background 0.2s;
}

.batch-row:hover {
  background: #f8fafc;
}

.col-no {
  width: 60px;
  text-align: center;
}

.col-keyword {
  width: 35%;
}

.col-ref {
  width: 40%;
}

.col-status {
  width: 120px;
}

.col-action {
  width: 80px;
  text-align: center;
}

.row-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(99, 102, 241, 0.05));
  border-radius: 8px;
  font-weight: 700;
  color: #6366f1;
}

.table-input {
  width: 100%;
}

.table-input :deep(.n-input) {
  background: transparent;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  transition: all 0.2s;
}

.table-input :deep(.n-input:hover) {
  border-color: #cbd5e1;
}

.table-input :deep(.n-input:focus-within) {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.status-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
}

.status-pending {
  background: rgba(148, 163, 184, 0.1);
  color: #64748b;
}

.status-loading {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
  animation: pulse 1.5s ease-in-out infinite;
}

.status-success {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.status-error {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.delete-btn {
  font-size: 18px;
  color: #94a3b8;
  transition: all 0.2s;
}

.delete-btn:hover {
  color: #ef4444;
  transform: scale(1.1);
}

.empty-row td {
  padding: 60px 20px;
}

.empty-state {
  text-align: center;
  color: #94a3b8;
}

.empty-state p {
  margin: 0;
  font-size: 16px;
}

.empty-hint {
  margin-top: 8px;
  font-size: 14px;
  color: #cbd5e1;
}

.progress-section {
  margin-top: 24px;
}

.progress-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.progress-card h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
}

.progress-info {
  display: flex;
  gap: 24px;
  font-size: 14px;
  font-weight: 600;
}

.progress-info span {
  padding: 8px 16px;
  background: #f8fafc;
  border-radius: 8px;
}

.history-section {
  margin-top: 24px;
}

.history-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.history-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
}

.empty-history {
  text-align: center;
  padding: 40px 20px;
  color: #94a3b8;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-item {
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s;
}

.history-item:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.history-item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.history-title {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.history-title strong {
  font-size: 14px;
  color: #1e293b;
}

.history-meta {
  font-size: 12px;
  color: #64748b;
}

.history-actions {
  display: flex;
  gap: 8px;
}

.history-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.preview-keyword {
  padding: 4px 10px;
  background: white;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 12px;
  color: #475569;
}

.preview-more {
  padding: 4px 10px;
  font-size: 12px;
  color: #94a3b8;
  font-weight: 600;
}

.history-btn-header {
  font-weight: 600;
  color: #8b5cf6;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05));
  border: 1px solid rgba(139, 92, 246, 0.3);
  transition: all 0.3s;
}

.history-btn-header:hover {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(139, 92, 246, 0.08));
  border-color: rgba(139, 92, 246, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(139, 92, 246, 0.2);
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

@media (max-width: 768px) {
  .batch-page {
    padding: 16px;
  }

  .batch-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .header-right {
    width: 100%;
    justify-content: space-between;
  }

  .page-title {
    font-size: 20px;
  }

  .batch-table {
    font-size: 13px;
  }

  .col-keyword {
    width: 30%;
  }

  .col-ref {
    width: 35%;
  }
}
</style>
