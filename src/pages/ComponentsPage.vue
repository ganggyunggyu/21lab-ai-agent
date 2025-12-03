<script setup lang="ts">
import { ref } from 'vue';
import {
  Send as SendIcon,
  Add as AddIcon,
  Trash as TrashIcon,
  Settings as SettingsIcon,
} from '@vicons/ionicons5';
import { Button, Card, Input, Select, Dropdown, Modal, Switch } from '@/components/ui';
import { toast } from '@/utils/_toast';

// Button states
const buttonLoading = ref(false);
const handleButtonLoading = () => {
  buttonLoading.value = true;
  setTimeout(() => {
    buttonLoading.value = false;
    toast.success('작업이 완료되었습니다!');
  }, 2000);
};

// Input state
const inputValue = ref('');
const textareaValue = ref('');

// Select state
const selectValue = ref('gpt-5-v2');
const selectOptions = [
  { label: 'GPT-5', value: 'gpt-5-v2' },
  { label: 'GPT-4', value: 'gpt-4-v2' },
  { label: 'Solar', value: 'solar' },
  { label: 'Chunk', value: 'chunk' },
];

// Dropdown
const dropdownOptions = [
  { label: '수정', key: 'edit' },
  { label: '복사', key: 'copy' },
  { type: 'divider' as const, key: 'd1' },
  { label: '삭제', key: 'delete' },
];
const lastAction = ref('');
const handleDropdownSelect = (key: string) => {
  lastAction.value = key;
  toast.info(`선택: ${key}`);
};

// Modal
const showModal = ref(false);

// Switch
const switchValue = ref(false);

// Toast demos
const showToastDemo = (type: 'success' | 'error' | 'warning' | 'info') => {
  const messages = {
    success: '성공적으로 저장되었습니다!',
    error: '오류가 발생했습니다.',
    warning: '주의가 필요합니다.',
    info: '참고 정보입니다.',
  };
  toast[type](messages[type]);
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 md:px-6">
    <div class="max-w-5xl mx-auto">
      <!-- Header -->
      <header class="mb-10">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          UI Component Library
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          21Lab AI Agent 커스텀 컴포넌트 시스템
        </p>
      </header>

      <div class="space-y-8">
        <!-- Button Section -->
        <Card variant="elevated">
          <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Button</h2>

          <!-- Variants -->
          <div class="mb-8">
            <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">Variants</h3>
            <div class="flex flex-wrap gap-3">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
            </div>
          </div>

          <!-- Sizes -->
          <div class="mb-8">
            <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">Sizes</h3>
            <div class="flex flex-wrap items-center gap-3">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>
          </div>

          <!-- With Icons -->
          <div class="mb-8">
            <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">With Icons</h3>
            <div class="flex flex-wrap items-center gap-3">
              <Button :icon="SendIcon">전송</Button>
              <Button variant="secondary" :icon="AddIcon">추가</Button>
              <Button variant="danger" :icon="TrashIcon">삭제</Button>
              <Button variant="ghost" icon-only :icon="SettingsIcon" />
            </div>
          </div>

          <!-- States -->
          <div>
            <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">States</h3>
            <div class="flex flex-wrap items-center gap-3">
              <Button disabled>Disabled</Button>
              <Button :loading="buttonLoading" @click="handleButtonLoading">
                {{ buttonLoading ? '처리중...' : 'Click Me' }}
              </Button>
            </div>
          </div>
        </Card>

        <!-- Input Section -->
        <Card variant="elevated">
          <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Input</h2>

          <div class="grid md:grid-cols-2 gap-6">
            <div>
              <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">Text Input</h3>
              <Input v-model="inputValue" placeholder="텍스트를 입력하세요..." />
              <p class="mt-2 text-sm text-gray-500">값: {{ inputValue || '(비어있음)' }}</p>
            </div>

            <div>
              <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">Disabled</h3>
              <Input model-value="비활성화됨" disabled />
            </div>

            <div class="md:col-span-2">
              <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">Textarea</h3>
              <Input
                v-model="textareaValue"
                type="textarea"
                placeholder="여러 줄의 텍스트를 입력하세요..."
                :rows="4"
              />
            </div>
          </div>
        </Card>

        <!-- Select Section -->
        <Card variant="elevated">
          <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Select</h2>

          <div class="grid md:grid-cols-3 gap-6">
            <div>
              <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">Small</h3>
              <Select v-model="selectValue" :options="selectOptions" size="sm" />
            </div>

            <div>
              <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">Medium</h3>
              <Select v-model="selectValue" :options="selectOptions" size="md" />
            </div>

            <div>
              <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">Large</h3>
              <Select v-model="selectValue" :options="selectOptions" size="lg" />
            </div>
          </div>
          <p class="mt-4 text-sm text-gray-500">선택된 값: {{ selectValue }}</p>
        </Card>

        <!-- Dropdown Section -->
        <Card variant="elevated">
          <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Dropdown</h2>

          <div class="flex flex-wrap items-center gap-6">
            <div>
              <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">Click Trigger</h3>
              <Dropdown :options="dropdownOptions" @select="handleDropdownSelect">
                <Button variant="secondary">메뉴 열기</Button>
              </Dropdown>
            </div>

            <div>
              <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">Hover Trigger</h3>
              <Dropdown :options="dropdownOptions" trigger="hover" @select="handleDropdownSelect">
                <Button variant="ghost">호버하세요</Button>
              </Dropdown>
            </div>

            <div class="flex-1">
              <p class="text-sm text-gray-500">마지막 선택: {{ lastAction || '(없음)' }}</p>
            </div>
          </div>
        </Card>

        <!-- Modal Section -->
        <Card variant="elevated">
          <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Modal</h2>

          <Button @click="showModal = true">모달 열기</Button>

          <Modal v-model:show="showModal" title="모달 제목">
            <p class="text-gray-600 dark:text-gray-300 mb-6">
              모달 컨텐츠입니다. 배경을 클릭하거나 X 버튼을 눌러 닫을 수 있습니다.
            </p>
            <div class="flex justify-end gap-3">
              <Button variant="ghost" @click="showModal = false">취소</Button>
              <Button @click="showModal = false; toast.success('확인되었습니다!')">확인</Button>
            </div>
          </Modal>
        </Card>

        <!-- Switch Section -->
        <Card variant="elevated">
          <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Switch</h2>

          <div class="space-y-6">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-medium text-gray-900 dark:text-gray-100">기본 스위치</h3>
                <p class="text-sm text-gray-500">기본 토글 스위치</p>
              </div>
              <Switch v-model="switchValue" />
            </div>

            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-medium text-gray-900 dark:text-gray-100">크기별</h3>
                <p class="text-sm text-gray-500">sm / md / lg</p>
              </div>
              <div class="flex items-center gap-4">
                <Switch v-model="switchValue" size="sm" />
                <Switch v-model="switchValue" size="md" />
                <Switch v-model="switchValue" size="lg" />
              </div>
            </div>

            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-medium text-gray-900 dark:text-gray-100">비활성화</h3>
                <p class="text-sm text-gray-500">disabled 상태</p>
              </div>
              <Switch :model-value="true" disabled />
            </div>
          </div>
          <p class="mt-4 text-sm text-gray-500">현재 값: {{ switchValue }}</p>
        </Card>

        <!-- Toast Section -->
        <Card variant="elevated">
          <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Toast</h2>

          <div class="flex flex-wrap gap-3">
            <Button
              class="bg-emerald-500 hover:bg-emerald-600 border-emerald-500"
              @click="showToastDemo('success')"
            >
              Success
            </Button>
            <Button
              class="bg-red-500 hover:bg-red-600 border-red-500"
              @click="showToastDemo('error')"
            >
              Error
            </Button>
            <Button
              class="bg-amber-500 hover:bg-amber-600 border-amber-500"
              @click="showToastDemo('warning')"
            >
              Warning
            </Button>
            <Button
              class="bg-blue-500 hover:bg-blue-600 border-blue-500"
              @click="showToastDemo('info')"
            >
              Info
            </Button>
          </div>
        </Card>

        <!-- Card Section -->
        <Card variant="elevated">
          <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Card</h2>

          <div class="grid md:grid-cols-2 gap-6">
            <div>
              <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">Flat (기본)</h3>
              <Card variant="flat">
                <p class="text-gray-600 dark:text-gray-300">평평한 스타일의 카드입니다.</p>
              </Card>
            </div>

            <div>
              <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">Elevated</h3>
              <Card variant="elevated">
                <p class="text-gray-600 dark:text-gray-300">그림자가 있는 카드입니다.</p>
              </Card>
            </div>

            <div class="md:col-span-2">
              <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">Hoverable</h3>
              <Card variant="elevated" hoverable>
                <p class="text-gray-600 dark:text-gray-300">호버 시 살짝 올라오는 효과가 있습니다. 마우스를 올려보세요!</p>
              </Card>
            </div>
          </div>
        </Card>

        <!-- Color Palette -->
        <Card variant="elevated">
          <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Color Palette</h2>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="space-y-2">
              <div class="h-20 rounded-xl bg-brand flex items-center justify-center">
                <span class="text-white font-mono text-sm">#62C2B0</span>
              </div>
              <p class="text-sm font-medium text-gray-700 dark:text-gray-300">Brand</p>
            </div>
            <div class="space-y-2">
              <div class="h-20 rounded-xl bg-accent flex items-center justify-center">
                <span class="text-gray-800 font-mono text-sm">#F3C969</span>
              </div>
              <p class="text-sm font-medium text-gray-700 dark:text-gray-300">Accent</p>
            </div>
            <div class="space-y-2">
              <div class="h-20 rounded-xl bg-emerald-500 flex items-center justify-center">
                <span class="text-white font-mono text-sm">Success</span>
              </div>
              <p class="text-sm font-medium text-gray-700 dark:text-gray-300">Success</p>
            </div>
            <div class="space-y-2">
              <div class="h-20 rounded-xl bg-red-500 flex items-center justify-center">
                <span class="text-white font-mono text-sm">Danger</span>
              </div>
              <p class="text-sm font-medium text-gray-700 dark:text-gray-300">Danger</p>
            </div>
          </div>
        </Card>
      </div>

      <!-- Footer -->
      <footer class="mt-10 text-center text-gray-500 dark:text-gray-400 text-sm">
        <p>21Lab AI Agent - Custom UI Component System</p>
      </footer>
    </div>
  </div>
</template>
