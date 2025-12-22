import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import { resolve } from 'path';
import tailwindcss from '@tailwindcss/vite';
import { crx } from '@crxjs/vite-plugin';
import manifest from './extension/manifest';

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    crx({ manifest }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@pages': resolve(__dirname, 'src/pages'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@entities': resolve(__dirname, 'src/entities'),
      '@features': resolve(__dirname, 'src/features'),
      '@stores': resolve(__dirname, 'src/stores'),
      '@extension': resolve(__dirname, 'extension'),
    },
  },
  build: {
    outDir: 'dist-extension',
    rollupOptions: {
      input: {
        sidepanel: resolve(__dirname, 'extension/sidepanel.html'),
      },
    },
  },
  server: {
    port: 5522,
    strictPort: true,
    hmr: {
      port: 5522,
    },
  },
});
