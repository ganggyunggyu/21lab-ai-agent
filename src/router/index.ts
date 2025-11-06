import { createRouter, createWebHistory } from 'vue-router';
import ModernChatPage from './_ModernChatPage.vue';
import ModernUploadPage from './_ModernUploadPage.vue';
import ChatPage from './_ChatPage.vue';
import PublishedListPage from './_PublishedListPage.vue';
import BatchPage from '../pages/BatchPage.vue';
import ComponentsPage from '../pages/ComponentsPage.vue';

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
  {
    path: '/batch',
    name: 'Batch',
    component: BatchPage,
    meta: {
      title: '배치 원고 생성',
    },
  },
  {
    path: '/components',
    name: 'Components',
    component: ComponentsPage,
    meta: {
      title: '컴포넌트 쇼케이스',
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _from, next) => {
  document.title = to.meta?.title
    ? `${to.meta.title} - 21Lab AI Agent`
    : '21Lab AI Agent';
  next();
});

export default router;
