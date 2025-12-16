import { createRouter, createWebHistory } from 'vue-router';
import ChatPage from '../pages/ChatPage.vue';
import BatchPage from '../pages/BatchPage.vue';
import ComponentsPage from '../pages/ComponentsPage.vue';
import SearchPage from '../pages/SearchPage.vue';
import ManuscriptDetailPage from '../pages/ManuscriptDetailPage.vue';

const routes = [
  {
    path: '/',
    name: 'ChatPage',
    component: ChatPage,
    meta: {
      title: '채팅',
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
    path: '/search',
    name: 'Search',
    component: SearchPage,
    meta: {
      title: '원고 검색',
    },
  },
  {
    path: '/search/:id',
    name: 'ManuscriptDetail',
    component: ManuscriptDetailPage,
    meta: {
      title: '원고 상세',
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
