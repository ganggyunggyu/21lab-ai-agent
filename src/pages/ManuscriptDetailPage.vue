<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  ArrowBackOutline as BackIcon,
  CopyOutline as CopyIcon,
  DocumentTextOutline as DocIcon,
  TimeOutline as TimeIcon,
  ServerOutline as EngineIcon,
  PricetagOutline as CategoryIcon,
  CodeSlashOutline as ServiceIcon,
  FlaskOutline as TestIcon,
  CheckmarkCircle as SuccessIcon,
  SparklesOutline as SparkleIcon,
} from '@vicons/ionicons5';
import { Button, Skeleton } from '@/components/ui';
import { toast } from '@/utils/_toast';
import { useManuscriptDetail } from '@/entities/search';
import type { SearchDocument } from '@/entities/search';

const route = useRoute();
const router = useRouter();

const manuscriptId = ref(route.params.id as string);
const category = ref(route.query.category as string | undefined);

const { manuscript, isLoading, isError, error } = useManuscriptDetail(manuscriptId, category);

const formatDate = (doc: SearchDocument) => {
  let date: Date | null = null;

  if (doc.createdAt) {
    date = new Date(doc.createdAt);
  } else if ((doc as any).timestamp) {
    const ts = (doc as any).timestamp;
    date = new Date(ts < 10000000000 ? ts * 1000 : ts);
  }

  if (!date || isNaN(date.getTime())) return '';

  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const contentLength = computed(() => {
  const len = manuscript.value?.content?.length || 0;
  if (len >= 1000) return `${(len / 1000).toFixed(1)}k`;
  return len.toString();
});

const categoryLabel = computed(() => {
  if (!manuscript.value) return '';
  return (manuscript.value as any).__category || manuscript.value.category || '';
});

const copied = ref(false);

const handleCopy = async () => {
  if (!manuscript.value) return;

  try {
    await navigator.clipboard.writeText(manuscript.value.content);
    copied.value = true;
    toast.success('원고가 복사되었습니다.');
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (err) {
    toast.error('복사에 실패했습니다.');
  }
};

const handleBack = () => {
  router.back();
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- 상단 그라디언트 배경 -->
    <div class="absolute inset-x-0 top-0 h-64 bg-linear-to-b from-brand/5 via-accent/5 to-transparent dark:from-brand/10 dark:via-accent/5 dark:to-transparent pointer-events-none" />

    <div class="relative p-6">
      <div class="max-w-[900px] mx-auto">
        <!-- Header -->
        <header class="mb-8 flex items-center justify-between">
          <Button
            color="light"
            variant="weak"
            size="md"
            @click="handleBack"
            class="group text-gray-600 dark:text-gray-400 hover:text-brand transition-colors"
          >
            <BackIcon class="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1" />
            뒤로가기
          </Button>

          <div class="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full border border-gray-200 dark:border-gray-700">
            <SparkleIcon class="w-4 h-4 text-brand" />
            <span class="text-sm font-medium text-gray-600 dark:text-gray-300">원고 상세</span>
          </div>
        </header>

        <!-- Loading State -->
        <div
          v-if="isLoading"
          class="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-xl dark:shadow-black/40"
        >
          <div class="h-2 bg-linear-to-r from-brand via-accent to-brand animate-pulse" />
          <div class="px-8 py-4 border-b border-gray-100 dark:border-gray-700">
            <Skeleton variant="text" width="120px" height="20px" />
          </div>
          <div class="p-8 space-y-6">
            <Skeleton variant="text" width="70%" height="36px" />
            <div class="flex gap-3">
              <Skeleton variant="rectangular" width="100px" height="32px" rounded />
              <Skeleton variant="rectangular" width="80px" height="32px" rounded />
              <Skeleton variant="rectangular" width="150px" height="32px" rounded />
            </div>
            <Skeleton variant="rectangular" width="100%" height="2px" />
            <div class="space-y-4">
              <Skeleton variant="text" :lines="6" />
              <Skeleton variant="text" :lines="6" />
              <Skeleton variant="text" :lines="4" />
            </div>
          </div>
        </div>

        <!-- Error State -->
        <div
          v-else-if="isError"
          class="bg-white dark:bg-gray-800 rounded-3xl border-2 border-dashed border-red-300 dark:border-red-700 p-12 text-center"
        >
          <div class="w-20 h-20 mx-auto mb-6 bg-linear-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 rounded-2xl flex items-center justify-center shadow-lg">
            <DocIcon class="w-10 h-10 text-red-500" />
          </div>
          <p class="text-red-600 dark:text-red-400 font-bold text-xl mb-2">
            원고를 불러올 수 없습니다
          </p>
          <p class="text-gray-500 dark:text-gray-400 text-sm">
            {{ error?.message || '잠시 후 다시 시도해주세요.' }}
          </p>
          <Button
            color="light"
            size="md"
            @click="handleBack"
            class="mt-6"
          >
            돌아가기
          </Button>
        </div>

        <!-- Main Card -->
        <article
          v-else-if="manuscript"
          class="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-xl dark:shadow-black/40"
        >
          <!-- 상단 컬러 바 -->
          <div class="h-1.5 bg-linear-to-r from-brand via-accent to-brand" />

          <!-- 상단 카테고리 바 -->
          <div
            v-if="categoryLabel"
            class="px-8 py-4 bg-linear-to-r from-brand/10 via-accent/5 to-transparent border-b border-gray-100 dark:border-gray-700"
          >
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 bg-brand/20 rounded-md flex items-center justify-center">
                <CategoryIcon class="w-3.5 h-3.5 text-brand" />
              </div>
              <span class="text-sm font-bold text-brand">{{ categoryLabel }}</span>
            </div>
          </div>

          <!-- 메인 컨텐츠 영역 -->
          <div class="p-8">
            <!-- Title & Copy Button -->
            <div class="flex items-start justify-between gap-6 mb-6">
              <h1 class="text-3xl font-black text-gray-900 dark:text-gray-100 flex-1 leading-tight">
                {{ manuscript.keyword }}
              </h1>
              <Button
                :color="copied ? 'primary' : 'light'"
                size="lg"
                @click="handleCopy"
                class="shrink-0 font-bold transition-all duration-300"
                :class="[
                  copied
                    ? 'bg-brand text-white shadow-[0_4px_20px_rgba(98,194,176,0.4)] scale-105'
                    : 'hover:border-brand hover:text-brand'
                ]"
              >
                <component
                  :is="copied ? SuccessIcon : CopyIcon"
                  class="w-5 h-5 mr-2 transition-transform"
                  :class="copied ? 'animate-bounce' : ''"
                />
                {{ copied ? '복사 완료!' : '원고 복사' }}
              </Button>
            </div>

            <!-- 메타 정보 태그들 -->
            <div class="flex flex-wrap items-center gap-3 mb-8">
              <div class="group flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700/70 rounded-xl text-sm transition-all hover:bg-brand/10 hover:text-brand cursor-default">
                <EngineIcon class="w-4 h-4 text-gray-400 group-hover:text-brand transition-colors" />
                <span class="font-medium text-gray-700 dark:text-gray-300 group-hover:text-brand transition-colors">{{ manuscript.engine }}</span>
              </div>
              <div class="group flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700/70 rounded-xl text-sm transition-all hover:bg-brand/10 hover:text-brand cursor-default">
                <DocIcon class="w-4 h-4 text-gray-400 group-hover:text-brand transition-colors" />
                <span class="font-medium text-gray-700 dark:text-gray-300 group-hover:text-brand transition-colors">{{ contentLength }}자</span>
              </div>
              <div class="group flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700/70 rounded-xl text-sm transition-all hover:bg-brand/10 hover:text-brand cursor-default">
                <TimeIcon class="w-4 h-4 text-gray-400 group-hover:text-brand transition-colors" />
                <span class="font-medium text-gray-700 dark:text-gray-300 group-hover:text-brand transition-colors">{{ formatDate(manuscript) }}</span>
              </div>
            </div>

            <!-- Fancy Divider -->
            <div class="relative mb-8">
              <div class="h-px bg-gray-200 dark:bg-gray-700" />
              <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-4 bg-white dark:bg-gray-800">
                <SparkleIcon class="w-5 h-5 text-gray-300 dark:text-gray-600" />
              </div>
            </div>

            <!-- Content -->
            <div class="prose prose-slate dark:prose-invert max-w-none">
              <pre class="whitespace-pre-wrap text-base leading-relaxed text-gray-700 dark:text-gray-300 font-sans">{{ manuscript.content }}</pre>
            </div>

            <!-- Reference (if exists) -->
            <div
              v-if="manuscript.ref"
              class="mt-10 relative"
            >
              <div class="absolute -inset-1 bg-linear-to-r from-amber-200/30 to-orange-200/30 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl blur" />
              <div class="relative p-6 bg-amber-50 dark:bg-amber-900/30 rounded-2xl border border-amber-200 dark:border-amber-700">
                <div class="flex items-center gap-3 mb-4">
                  <div class="w-8 h-8 bg-amber-200 dark:bg-amber-800 rounded-lg flex items-center justify-center">
                    <DocIcon class="w-4 h-4 text-amber-700 dark:text-amber-300" />
                  </div>
                  <h3 class="text-base font-bold text-amber-800 dark:text-amber-200">
                    참조 원고
                  </h3>
                </div>
                <pre class="whitespace-pre-wrap text-sm text-amber-900 dark:text-amber-100 font-sans leading-relaxed">{{ manuscript.ref }}</pre>
              </div>
            </div>
          </div>

          <!-- 하단 메타데이터 -->
          <div class="px-8 py-6 bg-linear-to-r from-gray-50 via-gray-100/50 to-gray-50 dark:from-gray-800/70 dark:via-gray-800 dark:to-gray-800/70 border-t border-gray-200 dark:border-gray-700">
            <div class="grid grid-cols-3 gap-6">
              <div class="group flex items-center gap-3 cursor-default">
                <div class="w-10 h-10 bg-white dark:bg-gray-700 rounded-xl flex items-center justify-center shadow-sm border border-gray-200 dark:border-gray-600 group-hover:border-brand group-hover:shadow-md transition-all">
                  <ServiceIcon class="w-5 h-5 text-gray-400 group-hover:text-brand transition-colors" />
                </div>
                <div>
                  <div class="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">서비스</div>
                  <div class="text-sm font-bold text-gray-900 dark:text-gray-100">
                    {{ manuscript.service || 'N/A' }}
                  </div>
                </div>
              </div>
              <div class="group flex items-center gap-3 cursor-default">
                <div class="w-10 h-10 bg-white dark:bg-gray-700 rounded-xl flex items-center justify-center shadow-sm border border-gray-200 dark:border-gray-600 group-hover:border-brand group-hover:shadow-md transition-all">
                  <TestIcon class="w-5 h-5 text-gray-400 group-hover:text-brand transition-colors" />
                </div>
                <div>
                  <div class="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">테스트 모드</div>
                  <div class="text-sm font-bold" :class="manuscript.test_mode ? 'text-amber-600 dark:text-amber-400' : 'text-gray-900 dark:text-gray-100'">
                    {{ manuscript.test_mode ? 'Yes' : 'No' }}
                  </div>
                </div>
              </div>
              <div class="group flex items-center gap-3 cursor-default">
                <div class="w-10 h-10 bg-white dark:bg-gray-700 rounded-xl flex items-center justify-center shadow-sm border border-gray-200 dark:border-gray-600 group-hover:border-brand group-hover:shadow-md transition-all">
                  <DocIcon class="w-5 h-5 text-gray-400 group-hover:text-brand transition-colors" />
                </div>
                <div class="min-w-0">
                  <div class="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">문서 ID</div>
                  <div class="text-sm font-bold text-gray-900 dark:text-gray-100 font-mono truncate" :title="manuscript._id">
                    {{ manuscript._id }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </article>

        <!-- 플로팅 복사 버튼 (스크롤시 유용) -->
        <div
          v-if="manuscript && !isLoading"
          class="fixed bottom-8 right-8 z-50"
        >
          <button
            @click="handleCopy"
            class="group relative w-16 h-16 bg-linear-to-br from-brand to-accent rounded-2xl shadow-[0_8px_30px_rgba(98,194,176,0.4)] hover:shadow-[0_12px_40px_rgba(98,194,176,0.5)] transition-all duration-300 hover:scale-110 hover:-translate-y-1 active:scale-95"
            :title="copied ? '복사됨!' : '원고 복사'"
          >
            <div class="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <component
              :is="copied ? SuccessIcon : CopyIcon"
              class="w-7 h-7 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              :class="copied ? 'animate-bounce' : ''"
            />
            <!-- 복사 완료 표시 -->
            <span
              v-if="copied"
              class="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-pulse"
            >
              <SuccessIcon class="w-4 h-4 text-white" />
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
