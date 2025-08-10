import { createRouter, createWebHistory } from 'vue-router'
import Main from '../pages/Main.vue'

const routes = [
  {
    path: '/',
    name: 'Main',
    component: Main
  },
  {
    path: '/ghost',
    name: 'Ghost',
    component: Main
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
