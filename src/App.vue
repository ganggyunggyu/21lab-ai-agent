<template>
  <n-config-provider :locale="koKR" :date-locale="dateKoKR">
    <n-global-style />
    <n-message-provider>
      <router-view />
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { NConfigProvider, NMessageProvider, NGlobalStyle } from 'naive-ui';
import { koKR, dateKoKR } from 'naive-ui';
</script>
