import vue from '@vitejs/plugin-vue';

export default {
  plugins: [vue()],
  resolve: {
    alias: [{ find: '@', replacement: '/src' }],
  },
  server: {
    host: '0.0.0.0',
  },
};
