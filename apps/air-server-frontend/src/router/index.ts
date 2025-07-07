import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

import UserLogin from '../views/UserLogin.vue'
import MainDashboard from '../views/MainDashboard.vue'
import RespondersList from '../views/RespondersList.vue'
import JobsList from '../views/JobsList.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: UserLogin,
    meta: { requiresGuest: true },
  },
  {
    path: '/',
    name: 'Dashboard',
    component: MainDashboard,
    meta: { requiresAuth: true },
  },
  {
    path: '/responders',
    name: 'Responders',
    component: RespondersList,
    meta: { requiresAuth: true },
  },
  {
    path: '/jobs',
    name: 'Jobs',
    component: JobsList,
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router
