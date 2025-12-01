<template>
  <router-view />
</template>

<script setup lang="ts">
import './style.css';
import { onMounted } from 'vue';
import { useThemeStore } from '@/stores/_theme';

const themeStore = useThemeStore();

onMounted(() => {
  themeStore.initTheme();
});
</script>
