import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@pages': resolve(__dirname, 'src/pages'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@entities': resolve(__dirname, 'src/entities'),
      '@features': resolve(__dirname, 'src/features'),
      '@stores': resolve(__dirname, 'src/stores'),
    },
  },
  server: {
    host: '0.0.0.0',
  },
});
