<script setup lang="ts">
import { ref } from 'vue';
import { NUpload, NButton, NCard, NScrollbar } from 'naive-ui';
import { CloudUploadOutline as UploadIcon } from '@vicons/ionicons5';
import type { UploadFileInfo } from 'naive-ui';
import { uploadTextApi, type UploadTextsRes } from '../service/_upload.service';

const fileList = ref<UploadFileInfo[]>([]);
const isUploading = ref(false);
const result = ref<UploadTextsRes | null>(null);

const handleUpload = async () => {
  if (!fileList.value.length) {
    alert('업로드할 파일을 선택해주세요');
    return;
  }
  isUploading.value = true;
  result.value = null;
  try {
    const files = fileList.value
      .map((f) => f.file as File | null)
      .filter((f): f is File => !!f);

    const res = await uploadTextApi(files);
    if (!res.ok) throw new Error('업로드 실패');
    result.value = res;
    alert(`업로드 완료: ${res.count}개 처리됨`);
  } catch (e: any) {
    alert(`에러 발생: ${e.message ?? e}`);
  } finally {
    isUploading.value = false;
  }
};
</script>

<template>
  <div class="upload-container">
    <header class="upload-header">
      <h1>📁 파일 업로드</h1>
    </header>

    <main class="upload-body">
      <n-card class="upload-card" title="파일 선택">
        <n-upload
          multiple
          directory-dnd
          :default-upload="false"
          v-model:file-list="fileList"
          class="upload-dropzone"
          accept=".txt"
        >
          <n-button dashed>
            <template #icon>
              <UploadIcon />
            </template>
            파일 선택 또는 드래그 앤 드롭
          </n-button>
        </n-upload>

        <div class="upload-actions">
          <n-button type="primary" :loading="isUploading" @click="handleUpload">
            업로드
          </n-button>
        </div>
      </n-card>

      <!-- 결과 미리보기 -->
      <n-card
        v-if="result"
        class="result-card"
        title="분석 결과"
        content-style="padding: 0"
      >
        <n-scrollbar style="max-height: 50vh; padding: 16px">
          <ul class="result-list">
            <li
              v-for="(item, idx) in result.results"
              :key="idx"
              class="result-item"
            >
              <div class="result-head">
                <span class="file">{{ item.filename }}</span>
                <span class="badge" :class="item.ok ? 'ok' : 'fail'">{{
                  item.ok ? 'OK' : 'FAIL'
                }}</span>
              </div>

              <template v-if="item.ok">
                <div class="meta">
                  <span>length: {{ item.length }}</span>
                </div>
                <pre class="preview">{{ item.preview }}</pre>
              </template>

              <template v-else>
                <div class="error">에러: {{ item.error }}</div>
              </template>
            </li>
          </ul>
        </n-scrollbar>
      </n-card>
    </main>
  </div>
</template>

<style scoped>
.upload-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: #f1f5f9;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
}

.upload-header {
  padding: 16px;
  background: rgba(30, 41, 59, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
  font-size: 18px;
  font-weight: 700;
  background: linear-gradient(135deg, #6366f1 0%, #10b981 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.upload-body {
  flex: 1;
  display: grid;
  place-items: start center;
  gap: 16px;
  padding: 24px;
  color: #f0f0f0;
}

.upload-card,
.result-card {
  width: 800px;
  background: #2d2d2d;
  border: 1px solid #444;
  color: #f0f0f0;
}

.upload-dropzone {
  background: #1f1f1f;
  color: #f0f0f0;
  border: 2px dashed #555;
  border-radius: 12px;
  padding: 40px;
  margin: 20px 0;
  text-align: center;
  transition: border-color 0.25s ease;
}
.upload-dropzone:hover {
  border-color: #4f46e5;
}

.upload-actions {
  display: flex;
  justify-content: flex-end;
}

.n-card-header {
  color: #f0f0f0;
}

/* 결과 리스트 */
.result-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 12px;
}

.result-item {
  border: 1px solid #3a3a3a;
  border-radius: 10px;
  padding: 12px 14px;
  background: #232323;
}

.result-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.file {
  font-weight: 600;
}

.badge {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 999px;
  border: 1px solid #555;
}
.badge.ok {
  background: #134e4a;
  border-color: #2dd4bf;
  color: #ccfbf1;
}
.badge.fail {
  background: #3f1d1d;
  border-color: #ef4444;
  color: #fecaca;
}

.meta {
  font-size: 12px;
  color: #bdbdbd;
  margin-bottom: 6px;
}

.preview {
  background: #111827;
  border: 1px solid #374151;
  border-radius: 8px;
  padding: 10px;
  white-space: pre-wrap;
  color: #e5e7eb;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
    'Liberation Mono', 'Courier New', monospace;
  max-height: 220px;
  overflow: auto;
}

.error {
  color: #fda4af;
}
</style>
