// import { defineConfig } from 'vite';
// import vue from '@vitejs/plugin-vue';

// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [vue()],
// });

import fs from 'fs';
import vue from '@vitejs/plugin-vue';

const cert = fs.readFileSync('localhost.pem');
const key = fs.readFileSync('localhost-key.pem');

export default {
  plugins: [vue()],
  resolve: {
    alias: [
      { find: '@', replacement: '/src' },
    ],
  },
  server: {
    host: true,
    https: {
      key,
      cert,
    },
  },
};