<template>
  <div class="upload-app">
    <header class="floating-header">
      <div class="header-content">
        <div class="logo-section">
          <div class="logo-icon">📁</div>
          <div class="logo-info">
            <h1 class="logo-title">File Upload</h1>
            <p class="logo-subtitle">Document Analysis</p>
          </div>
        </div>

        <div class="header-stats" v-if="result">
          <div class="stat-item">
            <span class="stat-number">{{ result.count }}</span>
            <span class="stat-label">Files</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ successCount }}</span>
            <span class="stat-label">Success</span>
          </div>
        </div>
      </div>
    </header>

    <main class="upload-main">
      <div class="upload-container">
        <!-- Upload Zone -->
        <section class="upload-section">
          <ModernCard
            :class="[
              'upload-zone',
              {
                'upload-zone--dragging': isDragOver,
                'upload-zone--uploading': isUploading,
              },
            ]"
            variant="glass"
            hoverable
            @click="!isUploading && triggerFileInput()"
            @dragenter="handleDragEnter"
            @dragleave="handleDragLeave"
            @dragover="handleDragOver"
            @drop="handleDrop"
          >
            <div class="upload-zone-content">
              <!-- Upload Icon -->
              <div class="upload-icon-container">
                <div v-if="isUploading" class="upload-spinner">
                  <div class="spinner-ring"></div>
                  <div class="spinner-icon">📤</div>
                </div>
                <div
                  v-else
                  :class="[
                    'upload-icon',
                    { 'upload-icon--active': isDragOver },
                  ]"
                >
                  {{ isDragOver ? '📥' : '📁' }}
                </div>
              </div>

              <!-- Upload Text -->
              <div class="upload-text">
                <h3 class="upload-title">
                  {{
                    isUploading
                      ? '업로드 중...'
                      : isDragOver
                      ? '파일을 놓아주세요'
                      : '파일 업로드'
                  }}
                </h3>
                <p class="upload-description">
                  {{
                    isUploading
                      ? '파일을 분석하고 있습니다'
                      : 'TXT 파일을 드래그하거나 클릭하여 선택하세요'
                  }}
                </p>
              </div>

              <!-- Upload Features -->
              <div v-if="!isUploading" class="upload-features">
                <div class="feature-item">
                  <span class="feature-icon">📄</span>
                  <span class="feature-text">TXT 파일 지원</span>
                </div>
                <div class="feature-item">
                  <span class="feature-icon">📚</span>
                  <span class="feature-text">다중 파일 업로드</span>
                </div>
                <div class="feature-item">
                  <span class="feature-icon">🔍</span>
                  <span class="feature-text">자동 내용 분석</span>
                </div>
              </div>

              <!-- File List -->
              <div
                v-if="fileList.length > 0 && !isUploading"
                class="selected-files"
              >
                <div class="files-header">
                  <h4 class="files-title">
                    선택된 파일 {{ fileList.length }}개
                  </h4>
                  <ModernButton
                    variant="ghost"
                    size="sm"
                    :icon="TrashIcon"
                    @click="clearFiles"
                    icon-only
                  />
                </div>

                <div class="files-list">
                  <div
                    v-for="(file, index) in fileList"
                    :key="index"
                    class="file-item"
                  >
                    <div class="file-icon">📄</div>
                    <div class="file-info">
                      <div class="file-name">{{ file.name }}</div>
                      <div class="file-size">
                        {{ formatFileSize(file.size) }}
                      </div>
                    </div>
                    <ModernButton
                      variant="ghost"
                      size="sm"
                      :icon="CloseIcon"
                      @click="removeFile(index)"
                      icon-only
                    />
                  </div>
                </div>

                <div class="upload-actions">
                  <ModernButton
                    variant="primary"
                    size="lg"
                    :icon="SendIcon"
                    @click="handleUpload"
                    :disabled="fileList.length === 0"
                  >
                    {{ fileList.length }}개 파일 업로드
                  </ModernButton>
                </div>
              </div>
            </div>
          </ModernCard>
        </section>

        <!-- Results Section -->
        <section v-if="result" class="results-section">
          <ModernCard variant="glass" class="results-card">
            <template #header>
              <div class="results-header">
                <div class="results-title">
                  <div class="results-icon">✅</div>
                  <div>
                    <h3>분석 완료</h3>
                    <p class="results-subtitle">
                      {{ result.count }}개 파일 처리됨
                    </p>
                  </div>
                </div>
                <ModernButton
                  variant="secondary"
                  size="sm"
                  :icon="DownloadIcon"
                  @click="downloadResults"
                >
                  결과 다운로드
                </ModernButton>
              </div>
            </template>

            <div class="results-content">
              <div class="results-summary">
                <div class="summary-item">
                  <div class="summary-number success">{{ successCount }}</div>
                  <div class="summary-label">성공</div>
                </div>
                <div class="summary-item">
                  <div class="summary-number error">{{ failureCount }}</div>
                  <div class="summary-label">실패</div>
                </div>
                <div class="summary-item">
                  <div class="summary-number">{{ totalCharacters }}</div>
                  <div class="summary-label">총 글자수</div>
                </div>
              </div>

              <div class="results-list">
                <div
                  v-for="(item, index) in result.results"
                  :key="index"
                  :class="['result-item', { 'result-item--error': !item.ok }]"
                >
                  <div class="result-header">
                    <div class="result-status">
                      <div
                        :class="['status-icon', item.ok ? 'success' : 'error']"
                      >
                        {{ item.ok ? '✅' : '❌' }}
                      </div>
                      <div class="result-info">
                        <div class="result-filename">{{ item.filename }}</div>
                        <div class="result-meta">
                          {{ item.ok ? `${item.length} 글자` : '처리 실패' }}
                        </div>
                      </div>
                    </div>

                    <div v-if="item.ok" class="result-actions">
                      <ModernButton
                        variant="ghost"
                        size="sm"
                        :icon="EyeIcon"
                        @click="viewFullText(item)"
                        icon-only
                      />
                    </div>
                  </div>

                  <!-- Preview -->
                  <div v-if="item.ok && item.preview" class="result-preview">
                    <div class="preview-label">미리보기</div>
                    <div class="preview-content">{{ item.preview }}</div>
                  </div>

                  <!-- Error -->
                  <div v-else-if="!item.ok" class="result-error">
                    <div class="error-icon">⚠️</div>
                    <div class="error-message">
                      {{ item.error || '알 수 없는 오류' }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ModernCard>
        </section>
      </div>
    </main>

    <!-- Full Text Modal -->
    <div v-if="showFullText" class="modal-overlay" @click="closeFullText">
      <ModernCard class="full-text-modal" variant="solid" @click.stop>
        <template #header>
          <div class="modal-header">
            <div class="modal-title">
              <div class="modal-icon">📄</div>
              <div>
                <h3>{{ selectedItem?.filename }}</h3>
                <p class="modal-subtitle">{{ selectedItem?.length }} 글자</p>
              </div>
            </div>
            <ModernButton
              variant="ghost"
              size="sm"
              :icon="CloseIcon"
              @click="closeFullText"
              icon-only
            />
          </div>
        </template>

        <div class="modal-content">
          <div class="full-text-content">{{ selectedItem?.full_text }}</div>
        </div>

        <template #footer>
          <div class="modal-footer">
            <ModernButton
              variant="secondary"
              :icon="CopyIcon"
              @click="copyFullText"
            >
              복사
            </ModernButton>
            <ModernButton variant="primary" @click="closeFullText">
              닫기
            </ModernButton>
          </div>
        </template>
      </ModernCard>
    </div>

    <!-- Hidden File Input -->
    <input
      ref="fileInputRef"
      type="file"
      multiple
      accept=".txt"
      @change="handleFileSelect"
      style="display: none"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  Trash as TrashIcon,
  Close as CloseIcon,
  Send as SendIcon,
  Download as DownloadIcon,
  Eye as EyeIcon,
  Copy as CopyIcon,
} from '@vicons/ionicons5';
import { createDiscreteApi } from 'naive-ui';
import {
  uploadTextApi,
  type UploadTextsRes,
  type UploadTextItem,
} from '../service/_upload.service';
import { copyToClipboard } from '../utils/_clipboard';
import ModernButton from '../components/ui/ModernButton.vue';
import ModernCard from '../components/ui/ModernCard.vue';

const { message } = createDiscreteApi(['message']);

const isUploading = ref(false);
const result = ref<UploadTextsRes | null>(null);
const fileList = ref<File[]>([]);
const isDragOver = ref(false);
const showFullText = ref(false);
const selectedItem = ref<UploadTextItem | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);

const successCount = computed(
  () => result.value?.results.filter((r) => r.ok).length || 0
);

const failureCount = computed(() =>
  result.value ? result.value.count - successCount.value : 0
);

const totalCharacters = computed(
  () =>
    result.value?.results
      .filter((r) => r.ok)
      .reduce((sum, r) => sum + (r.length || 0), 0) || 0
);

const formatFileSize = (bytes: number): string => {
  return `${(bytes / 1024).toFixed(1)} KB`;
};

const handleDragEnter = (e: DragEvent) => {
  e.preventDefault();
  isDragOver.value = true;
};

const handleDragLeave = (e: DragEvent) => {
  e.preventDefault();
  const target = e.currentTarget as HTMLElement;
  const relatedTarget = e.relatedTarget as HTMLElement;
  if (!target?.contains(relatedTarget)) {
    isDragOver.value = false;
  }
};

const handleDragOver = (e: DragEvent) => {
  e.preventDefault();
};

const handleDrop = (e: DragEvent) => {
  e.preventDefault();
  isDragOver.value = false;

  const files = Array.from(e.dataTransfer?.files || []).filter(
    (file) => file.type === 'text/plain' || file.name.endsWith('.txt')
  );

  if (files.length > 0) {
    addFiles(files);
  } else {
    message.warning('TXT 파일만 업로드 가능합니다');
  }
};

const triggerFileInput = () => {
  fileInputRef.value?.click();
};

const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const files = Array.from(target.files || []);

  if (files.length > 0) {
    addFiles(files);
  }

  target.value = '';
};

const addFiles = (newFiles: File[]) => {
  const filteredFiles = newFiles.filter(
    (newFile) =>
      !fileList.value.some(
        (existingFile) =>
          existingFile.name === newFile.name &&
          existingFile.size === newFile.size
      )
  );

  fileList.value.push(...filteredFiles);

  if (filteredFiles.length !== newFiles.length) {
    message.warning('중복된 파일은 제외되었습니다');
  }

  if (filteredFiles.length > 0) {
    message.success(`${filteredFiles.length}개 파일이 선택되었습니다`);
  }
};

const removeFile = (index: number) => {
  fileList.value.splice(index, 1);
};
const clearFiles = () => {
  fileList.value = [];
  message.success('모든 파일이 제거되었습니다');
};

const handleUpload = async () => {
  if (fileList.value.length === 0) {
    message.warning('업로드할 파일을 선택해주세요');
    return;
  }

  isUploading.value = true;

  result.value = null;

  try {
    const res = await uploadTextApi(fileList.value);

    if (!res.ok) {
      throw new Error('업로드 실패');
    }

    result.value = res;
    fileList.value = [];

    const successCount = res.results.filter((r) => r.ok).length;
    const failCount = res.count - successCount;

    if (failCount === 0) {
      message.success(
        `🎉 모든 파일이 성공적으로 처리되었습니다! (${successCount}개)`
      );
    } else {
      message.warning(
        `업로드 완료: ${successCount}개 성공, ${failCount}개 실패`
      );
    }
  } catch (error: any) {
    console.error('Upload error:', error);
    message.error(`업로드 오류: ${error.message || error}`);
  } finally {
    isUploading.value = false;
  }
};

const viewFullText = (item: UploadTextItem) => {
  selectedItem.value = item;
  showFullText.value = true;
};

const closeFullText = () => {
  showFullText.value = false;
  selectedItem.value = null;
};

const copyFullText = async () => {
  if (!selectedItem.value?.full_text) return;

  try {
    await copyToClipboard(selectedItem.value.full_text);
    message.success('텍스트가 클립보드에 복사되었습니다');
  } catch {
    message.error('복사에 실패했습니다');
  }
};

const downloadResults = () => {
  if (!result.value) return;

  const dataStr = JSON.stringify(result.value, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `upload-results-${new Date()
    .toISOString()
    .slice(0, 10)}.json`;
  link.click();

  URL.revokeObjectURL(url);
  message.success('결과 파일이 다운로드되었습니다');
};
</script>

<style scoped>
.upload-app {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  position: relative;
  overflow-x: hidden;
}

/* Floating Header */
.floating-header {
  position: fixed;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  width: calc(100% - 32px);
  max-width: 1200px;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.logo-info {
  display: flex;
  flex-direction: column;
}

.logo-title {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  line-height: 1.2;
}

.logo-subtitle {
  font-size: 12px;
  color: #64748b;
  margin: 0;
  line-height: 1.2;
}

.header-stats {
  display: flex;
  gap: 20px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  line-height: 1;
}

.stat-label {
  font-size: 11px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Main Content */
.upload-main {
  padding: 100px 16px 32px;
  min-height: 100vh;
}

.upload-container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr;
  gap: 32px;
}

.upload-container:has(.results-section) {
  grid-template-columns: 1fr 1fr;
  align-items: start;
}

/* Upload Zone */
.upload-zone {
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px dashed rgba(59, 130, 246, 0.2);
  background: rgba(59, 130, 246, 0.02) !important;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-zone:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(59, 130, 246, 0.15);
  border-color: rgba(59, 130, 246, 0.4);
  background: rgba(59, 130, 246, 0.05) !important;
}

.upload-zone--dragging {
  border-color: rgba(16, 185, 129, 0.6);
  background: rgba(16, 185, 129, 0.08) !important;
  transform: scale(1.02);
}

.upload-zone--uploading {
  pointer-events: none;
  opacity: 0.8;
  border-color: rgba(245, 158, 11, 0.4);
  background: rgba(245, 158, 11, 0.05) !important;
}

.upload-zone-content {
  text-align: center;
  width: 100%;
  padding: 32px;
}

/* Upload Icon */
.upload-icon-container {
  margin-bottom: 24px;
}

.upload-icon {
  font-size: 64px;
  transition: all 0.3s ease;
  filter: drop-shadow(0 4px 12px rgba(59, 130, 246, 0.2));
}

.upload-icon--active {
  transform: scale(1.1);
  filter: drop-shadow(0 8px 24px rgba(16, 185, 129, 0.3));
}

.upload-spinner {
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner-ring {
  position: absolute;
  width: 80px;
  height: 80px;
  border: 3px solid rgba(245, 158, 11, 0.2);
  border-top: 3px solid #f59e0b;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.spinner-icon {
  font-size: 32px;
  z-index: 1;
}

/* Upload Text */
.upload-text {
  margin-bottom: 32px;
}

.upload-title {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px 0;
}

.upload-description {
  font-size: 16px;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
}

/* Upload Features */
.upload-features {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-bottom: 32px;
  flex-wrap: wrap;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 20px;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.feature-icon {
  font-size: 16px;
}

.feature-text {
  font-size: 14px;
  color: #475569;
  font-weight: 500;
}

/* Selected Files */
.selected-files {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  margin-top: 24px;
}

.files-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.files-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.files-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: 20px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(248, 250, 252, 0.8);
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;
}

.file-item:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-1px);
}

.file-icon {
  font-size: 20px;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-size {
  font-size: 12px;
  color: #64748b;
}

/* Results Section */
.results-card {
  background: rgba(255, 255, 255, 0.95) !important;
  border: 1px solid rgba(0, 0, 0, 0.08) !important;
}

.results-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.results-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.results-icon {
  font-size: 24px;
}

.results-title h3 {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.results-subtitle {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

.results-content {
  padding: 24px 0;
}

.results-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.summary-item {
  text-align: center;
  padding: 16px;
  background: rgba(248, 250, 252, 0.6);
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.summary-number {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  line-height: 1;
  margin-bottom: 4px;
}

.summary-number.success {
  color: #059669;
}

.summary-number.error {
  color: #dc2626;
}

.summary-label {
  font-size: 12px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 600px;
  overflow-y: auto;
}

.result-item {
  padding: 16px;
  background: rgba(248, 250, 252, 0.6);
  border-radius: 12px;
  border: 1px solid rgba(16, 185, 129, 0.1);
  transition: all 0.2s ease;
}

.result-item--error {
  border-color: rgba(239, 68, 68, 0.2);
  background: rgba(239, 68, 68, 0.02);
}

.result-item:hover {
  background: rgba(255, 255, 255, 0.8);
  transform: translateY(-1px);
}

.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.result-status {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.status-icon {
  font-size: 18px;
}

.result-info {
  flex: 1;
  min-width: 0;
}

.result-filename {
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.result-meta {
  font-size: 12px;
  color: #64748b;
}

.result-preview {
  margin-top: 12px;
}

.preview-label {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 6px;
}

.preview-content {
  background: rgba(248, 250, 252, 0.8);
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 8px;
  padding: 12px;
  font-size: 13px;
  line-height: 1.5;
  color: #475569;
  max-height: 100px;
  overflow: auto;
  white-space: pre-wrap;
  font-family: ui-monospace, 'SF Mono', Monaco, monospace;
}

.result-error {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.error-icon {
  font-size: 16px;
}

.error-message {
  font-size: 13px;
  color: #dc2626;
  font-weight: 500;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.full-text-modal {
  width: 100%;
  max-width: 800px;
  max-height: 80vh;
  overflow: hidden;
  animation: modalIn 0.3s ease-out;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.modal-icon {
  font-size: 24px;
}

.modal-title h3 {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.modal-subtitle {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

.modal-content {
  max-height: 500px;
  overflow-y: auto;
  margin: 16px 0;
}

.full-text-content {
  background: rgba(248, 250, 252, 0.8);
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 12px;
  padding: 20px;
  font-size: 14px;
  line-height: 1.6;
  color: #374151;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: ui-monospace, 'SF Mono', Monaco, monospace;
}

.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

/* Responsive */
@media (max-width: 1024px) {
  .upload-container:has(.results-section) {
    grid-template-columns: 1fr;
  }

  .header-stats {
    display: none;
  }
}

@media (max-width: 768px) {
  .floating-header {
    top: 8px;
    width: calc(100% - 16px);
  }

  .header-content {
    padding: 12px 16px;
    border-radius: 16px;
  }

  .upload-main {
    padding: 80px 8px 16px;
  }

  .upload-features {
    flex-direction: column;
    align-items: center;
  }

  .results-summary {
    grid-template-columns: 1fr;
  }

  .full-text-modal {
    max-height: 90vh;
    margin: 0 8px;
  }
}

/* Animations */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes modalIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Custom scrollbars */
.files-list::-webkit-scrollbar,
.results-list::-webkit-scrollbar,
.modal-content::-webkit-scrollbar {
  width: 6px;
}

.files-list::-webkit-scrollbar-track,
.results-list::-webkit-scrollbar-track,
.modal-content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.02);
  border-radius: 3px;
}

.files-list::-webkit-scrollbar-thumb,
.results-list::-webkit-scrollbar-thumb,
.modal-content::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

.files-list::-webkit-scrollbar-thumb:hover,
.results-list::-webkit-scrollbar-thumb:hover,
.modal-content::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.15);
}
</style>
