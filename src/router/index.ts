import { createRouter, createWebHistory } from 'vue-router';
import ChatPage from '../pages/ChatPage.vue';
import UploadPage from '../pages/UploadPage.vue';

const routes = [
  {
    path: '/',
    name: 'ChatPage',
    component: ChatPage,
  },
  {
    path: '/upload',
    name: 'Upload',
    component: UploadPage,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
