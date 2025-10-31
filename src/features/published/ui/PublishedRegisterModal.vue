<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { NModal, NForm, NFormItem, NButton, NSpace, NSwitch } from 'naive-ui';
import { Save as SaveIcon, Close as CloseIcon } from '@vicons/ionicons5';
import ModernInput from '@/components/ui/ModernInput.vue';
import type { FavoriteSearch } from '@/entities/published';
import { PublishedApi } from '@/entities/published';

interface Props {
  show: boolean;
  message?: any; // 원본 메시지
}

interface Emits {
  close: [];
  registered: [item: FavoriteSearch];
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const localShow = ref(false);
const isLoading = ref(false);

// 폼 데이터
const formData = ref({
  title: '',
  memo: '',
  blogId: '',
  isActive: true,
  isVisible: false,
});

watch(() => props.show, (newValue) => {
  localShow.value = newValue;
  if (newValue && props.message) {
    // 메시지 데이터로 폼 초기화
    formData.value = {
      title: props.message.keyword || '제목 없음',
      memo: '',
      blogId: '',
      isActive: true,
      isVisible: false,
    };
  }
});

watch(localShow, (newValue) => {
  if (!newValue && props.show) {
    emit('close');
  }
});

const canSubmit = computed(() => {
  return formData.value.title.trim().length > 0;
});

const handleClose = () => {
  localShow.value = false;
  emit('close');
};

const handleRegister = async () => {
  if (!canSubmit.value || !props.message) return;

  isLoading.value = true;

  try {
    // FavoriteSearch 객체 생성
    const favoriteSearch: FavoriteSearch = {
      id: props.message.id || `msg-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      keyword: props.message.keyword || formData.value.title,
      refMsg: props.message.ref,
      title: formData.value.title,
      createdAt: props.message.timestamp ? new Date(props.message.timestamp) : new Date(),
      isPublished: true,
      resultSample: props.message.role === 'bot'
        ? props.message.content.slice(0, 100) + (props.message.content.length > 100 ? '...' : '')
        : undefined,
      memo: formData.value.memo,
      blogId: formData.value.blogId || undefined,

      isActive: formData.value.isActive,
      isVisible: formData.value.isVisible,
      exposureRank: 0,

      userMessageId: props.message.role === 'user' ? props.message.id : undefined,
      botMessageId: props.message.role === 'bot' ? props.message.id : undefined,
      botContent: props.message.role === 'bot' ? props.message.content : undefined,
      service: props.message.service,
      originalTimestamp: props.message.timestamp,
    };

    // 저장
    PublishedApi.save(favoriteSearch);

    emit('registered', favoriteSearch);
    handleClose();
  } catch (error) {
  } finally {
    isLoading.value = false;
  }
};

const handleEnterPress = (value: string) => {
  // 일반 Enter는 기본 동작 (줄바꿈)
};

const handleCtrlEnterPress = (e: KeyboardEvent) => {
  if (e.ctrlKey || e.metaKey) {
    handleRegister();
  }
};
</script>

<template>
  <n-modal
    v-model:show="localShow"
    preset="card"
    class="register-modal"
    title="발행원고 등록"
    @mask-click="handleClose"
    @esc="handleClose"
  >
    <template #header>
      <header class="modal-header">
        <SaveIcon class="modal-badge-icon" />
        <h2>발행원고 등록</h2>
      </header>
    </template>

    <main class="modal-content">
      <n-form
        :model="formData"
        label-placement="top"
        label-width="auto"
        require-mark-placement="right-hanging"
      >
        <n-form-item label="제목" required>
          <ModernInput
            v-model:value="formData.title"
            placeholder="발행원고 제목을 입력해주세요"
            @keydown="handleCtrlEnterPress"
          />
        </n-form-item>

        <n-form-item label="블로그 ID">
          <ModernInput
            v-model:value="formData.blogId"
            placeholder="블로그 포스트 ID를 입력해주세요 (선택사항)"
            @keydown="handleCtrlEnterPress"
          />
          <template #feedback>
            <span class="form-hint">네이버 블로그, 티스토리 등의 포스트 ID</span>
          </template>
        </n-form-item>

        <n-form-item label="메모">
          <ModernInput
            v-model:value="formData.memo"
            type="textarea"
            placeholder="메모를 입력해주세요 (선택사항)"
            :autosize="{ minRows: 2, maxRows: 4 }"
          />
        </n-form-item>

        <n-form-item label="설정">
          <div class="switch-group">
            <div class="switch-item">
              <n-switch v-model:value="formData.isActive" />
              <span class="switch-label">활성화</span>
            </div>
            <div class="switch-item">
              <n-switch v-model:value="formData.isVisible" />
              <span class="switch-label">노출</span>
            </div>
          </div>
        </n-form-item>
      </n-form>
    </main>

    <template #action>
      <n-space justify="end">
        <n-button @click="handleClose">
          취소
        </n-button>
        <n-button
          type="primary"
          :loading="isLoading"
          :disabled="!canSubmit"
          @click="handleRegister"
        >
          등록하기
        </n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<style scoped>
.register-modal {
  max-width: 500px;
  width: 90vw;
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.modal-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #374151;
}

.modal-badge-icon {
  width: 18px;
  height: 18px;
  color: #10b981;
  flex-shrink: 0;
}

.modal-content {
  padding: 8px 0;
}

.form-hint {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

.switch-group {
  display: flex;
  gap: 24px;
}

.switch-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.switch-label {
  font-size: 14px;
  color: #374151;
}

:global(.dark) .modal-header h2,
:global(.dark) .switch-label {
  color: #d1d5db;
}

:global(.dark) .form-hint {
  color: #9ca3af;
}
</style>