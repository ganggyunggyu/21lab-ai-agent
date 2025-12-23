import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Chat',
    component: () => import('@/pages/ChatPage.vue'),
    meta: { title: '채팅' },
  },
  {
    path: '/batch',
    name: 'Batch',
    component: () => import('@/pages/BatchPage.vue'),
    meta: { title: '배치 원고 생성' },
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('@/pages/SearchPage.vue'),
    meta: { title: '원고 검색' },
  },
  {
    path: '/search/:id',
    name: 'ManuscriptDetail',
    component: () => import('@/pages/ManuscriptDetailPage.vue'),
    meta: { title: '원고 상세' },
  },
  {
    path: '/components',
    name: 'Components',
    component: () => import('@/pages/ComponentsPage.vue'),
    meta: { title: '컴포넌트 쇼케이스' },
  },
  {
    path: '/bot',
    name: 'Bot',
    component: () => import('@/pages/BotPage.vue'),
    meta: { title: '자동화 봇' },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _, next) => {
  const title = to.meta?.title;
  document.title = title ? `${title} - 21Lab AI Agent` : '21Lab AI Agent';
  next();
});

export default router;
