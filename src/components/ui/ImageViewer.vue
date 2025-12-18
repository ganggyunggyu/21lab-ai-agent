<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import {
  ChevronBack as PrevIcon,
  ChevronForward as NextIcon,
  Close as CloseIcon,
  Download as DownloadIcon,
} from '@vicons/ionicons5';
import { Button } from '@/components/ui';
import type { ImageItem } from '@/types';

interface Props {
  show: boolean;
  images: ImageItem[];
  initialIndex?: number;
}

const props = withDefaults(defineProps<Props>(), {
  initialIndex: 0,
});

const emit = defineEmits<{
  close: [];
  download: [image: ImageItem, index: number];
}>();

const currentIndex = ref(props.initialIndex);

const currentImage = computed(() => props.images[currentIndex.value]);
const hasMultiple = computed(() => props.images.length > 1);
const imageCounter = computed(() => `${currentIndex.value + 1} / ${props.images.length}`);

const goToPrev = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--;
  } else {
    currentIndex.value = props.images.length - 1;
  }
};

const goToNext = () => {
  if (currentIndex.value < props.images.length - 1) {
    currentIndex.value++;
  } else {
    currentIndex.value = 0;
  }
};

const handleClose = () => {
  emit('close');
};

const handleDownload = () => {
  if (currentImage.value) {
    emit('download', currentImage.value, currentIndex.value);
  }
};

const handleBackdropClick = (e: MouseEvent) => {
  if (e.target === e.currentTarget) {
    handleClose();
  }
};

const handleKeydown = (e: KeyboardEvent) => {
  if (!props.show) return;

  switch (e.key) {
    case 'Escape':
      handleClose();
      break;
    case 'ArrowLeft':
      goToPrev();
      break;
    case 'ArrowRight':
      goToNext();
      break;
  }
};

watch(() => props.show, (newShow) => {
  if (newShow) {
    currentIndex.value = props.initialIndex;
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});

watch(() => props.initialIndex, (newIndex) => {
  currentIndex.value = newIndex;
});

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
  document.body.style.overflow = '';
});
</script>

<template>
  <Teleport to="body">
    <Transition name="viewer-fade">
      <div
        v-if="show"
        class="image-viewer-overlay"
        @click="handleBackdropClick"
        role="dialog"
        aria-modal="true"
        aria-label="이미지 뷰어"
      >
        <!-- 헤더 -->
        <header class="viewer-header">
          <span v-if="hasMultiple" class="viewer-counter">{{ imageCounter }}</span>
          <div class="viewer-actions">
            <Button
              color="dark"
              variant="weak"
              size="sm"
              icon-only
              :icon="DownloadIcon"
              @click="handleDownload"
              aria-label="이미지 다운로드"
              class="viewer-btn"
            />
            <Button
              color="dark"
              variant="weak"
              size="sm"
              icon-only
              :icon="CloseIcon"
              @click="handleClose"
              aria-label="닫기"
              class="viewer-btn"
            />
          </div>
        </header>

        <!-- 이미지 컨테이너 -->
        <div class="viewer-content">
          <!-- 이전 버튼 -->
          <button
            v-if="hasMultiple"
            class="viewer-nav viewer-nav-prev"
            @click.stop="goToPrev"
            aria-label="이전 이미지"
          >
            <PrevIcon class="nav-icon" />
          </button>

          <!-- 메인 이미지 -->
          <div class="viewer-image-container">
            <Transition name="viewer-slide" mode="out-in">
              <img
                :key="currentIndex"
                :src="currentImage?.url"
                :alt="`이미지 ${currentIndex + 1}`"
                class="viewer-image"
                @click.stop
              />
            </Transition>
          </div>

          <!-- 다음 버튼 -->
          <button
            v-if="hasMultiple"
            class="viewer-nav viewer-nav-next"
            @click.stop="goToNext"
            aria-label="다음 이미지"
          >
            <NextIcon class="nav-icon" />
          </button>
        </div>

        <!-- 썸네일 (여러 이미지일 때) -->
        <footer v-if="hasMultiple" class="viewer-thumbnails">
          <button
            v-for="(img, idx) in images"
            :key="idx"
            class="thumbnail-item"
            :class="{ 'thumbnail-active': idx === currentIndex }"
            @click.stop="currentIndex = idx"
            :aria-label="`이미지 ${idx + 1} 보기`"
          >
            <img :src="img.url" :alt="`썸네일 ${idx + 1}`" class="thumbnail-img" />
          </button>
        </footer>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.image-viewer-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.viewer-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  z-index: 10;
}

.viewer-counter {
  color: white;
  font-size: 14px;
  font-weight: 500;
  background: rgba(0, 0, 0, 0.5);
  padding: 6px 12px;
  border-radius: 20px;
}

.viewer-actions {
  display: flex;
  gap: 8px;
}

.viewer-btn {
  background: rgba(255, 255, 255, 0.1) !important;
  color: white !important;
  border: none !important;
  backdrop-filter: blur(4px);
}

.viewer-btn:hover {
  background: rgba(255, 255, 255, 0.2) !important;
}

.viewer-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 60px 20px 80px;
  position: relative;
}

.viewer-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  z-index: 10;
  backdrop-filter: blur(4px);
}

.viewer-nav:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-50%) scale(1.1);
}

.viewer-nav-prev {
  left: 20px;
}

.viewer-nav-next {
  right: 20px;
}

.nav-icon {
  width: 24px;
  height: 24px;
  color: white;
}

.viewer-image-container {
  max-width: calc(100% - 140px);
  max-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.viewer-image {
  max-width: 100%;
  max-height: calc(100vh - 180px);
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

.viewer-thumbnails {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
}

.thumbnail-item {
  width: 48px;
  height: 48px;
  border-radius: 6px;
  overflow: hidden;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
  opacity: 0.6;
  background: transparent;
  padding: 0;
}

.thumbnail-item:hover {
  opacity: 0.9;
}

.thumbnail-active {
  border-color: white;
  opacity: 1;
}

.thumbnail-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 트랜지션 */
.viewer-fade-enter-active,
.viewer-fade-leave-active {
  transition: opacity 0.25s ease;
}

.viewer-fade-enter-from,
.viewer-fade-leave-to {
  opacity: 0;
}

.viewer-slide-enter-active,
.viewer-slide-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.viewer-slide-enter-from {
  opacity: 0;
  transform: scale(0.95);
}

.viewer-slide-leave-to {
  opacity: 0;
  transform: scale(1.05);
}

/* 모바일 대응 */
@media (max-width: 768px) {
  .viewer-nav {
    width: 40px;
    height: 40px;
  }

  .viewer-nav-prev {
    left: 10px;
  }

  .viewer-nav-next {
    right: 10px;
  }

  .viewer-image-container {
    max-width: calc(100% - 100px);
  }

  .thumbnail-item {
    width: 40px;
    height: 40px;
  }
}
</style>
