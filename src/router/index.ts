import { createRouter, createWebHistory } from 'vue-router';
import ChatPage from '../pages/ChatPage.vue';
import UploadPage from '../pages/UploadPage.vue';

const routes = [
  {
    path: '/',
    name: 'ChatPage',
    component: ChatPage,
    meta: {
      title: '채팅'
    }
  },
  {
    path: '/upload',
    name: 'Upload',
    component: UploadPage,
    meta: {
      title: '파일 업로드'
    }
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Update document title based on route
router.beforeEach((to, _from, next) => {
  document.title = to.meta?.title ? `${to.meta.title} - 21Lab AI Agent` : '21Lab AI Agent';
  next();
});

export default router;
