<template>
  <n-message-provider>
    <router-view />
  </n-message-provider>
</template>

<script setup lang="ts">
import './style.css';
import { onMounted } from 'vue';
import { NMessageProvider } from 'naive-ui';
import { useThemeStore } from '@/stores/_theme';

const themeStore = useThemeStore();

onMounted(() => {
  themeStore.initTheme();
});
</script>
