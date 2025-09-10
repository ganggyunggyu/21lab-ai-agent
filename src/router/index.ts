import { createRouter, createWebHistory } from 'vue-router';
import ModernChatPage from './_ModernChatPage.vue';
import ModernUploadPage from './_ModernUploadPage.vue';
import ChatPage from './_ChatPage.vue';
import PublishedListPage from './_PublishedListPage.vue';

const routes = [
  {
    path: '/',
    name: 'ChatPage',
    component: ModernChatPage,
    meta: {
      title: '채팅',
    },
  },
  {
    path: '/prev',
    name: 'PrevChatPage',
    component: ChatPage,
    meta: {
      title: '채팅',
    },
  },
  {
    path: '/upload',
    name: 'Upload',
    component: ModernUploadPage,
    meta: {
      title: '파일 업로드',
    },
  },
  {
    path: '/published',
    name: 'PublishedList',
    component: PublishedListPage,
    meta: {
      title: '발행원고',
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Update document title based on route
router.beforeEach((to, _from, next) => {
  document.title = to.meta?.title
    ? `${to.meta.title} - 21Lab AI Agent`
    : '21Lab AI Agent';
  next();
});

export default router;
