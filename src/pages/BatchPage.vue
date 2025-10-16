<script setup lang="ts">
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { NButton, NCard, NIcon, NProgress, useMessage } from 'naive-ui';
import {
  Add as AddIcon,
  Trash as TrashIcon,
  Send as SendIcon,
  ArrowBack as BackIcon,
  CloudUpload as UploadIcon,
} from '@vicons/ionicons5';
import { useRouter } from 'vue-router';
import { useChatStore } from '@/stores/_chat';
import ModernInput from '@/components/ui/ModernInput.vue';
import * as Papa from 'papaparse';

const router = useRouter();
const chatStore = useChatStore();
const message = useMessage();

const { batchRequests, batchStatuses, service } = storeToRefs(chatStore);
const { addBatchRequest, removeBatchRequest, updateBatchRequest, handleBatchGenerate } = chatStore;

const fileInputRef = ref<HTMLInputElement | null>(null);

const validRequests = computed(() => {
  return batchRequests.value.filter((req) => req.keyword.trim());
});

const handleGenerate = async () => {
  await handleBatchGenerate();
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
        console.error(error);
      }
    },
    error: (error: Error) => {
      message.error(`파일 읽기 실패: ${error.message}`);
    }
  });
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
          돌아가기
        </NButton>
        <h1 class="page-title">배치 원고 생성</h1>
      </div>

      <div class="header-right">
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

        <span class="request-count">{{ validRequests.length }}개 대기</span>

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
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
  transition: all 0.2s;
}

.back-btn:hover {
  color: #6366f1;
}

.page-title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.request-count {
  font-size: 14px;
  font-weight: 600;
  color: #6366f1;
  padding: 8px 16px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(99, 102, 241, 0.05));
  border-radius: 12px;
  border: 1px solid rgba(99, 102, 241, 0.2);
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
