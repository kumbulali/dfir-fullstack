import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Use dynamic imports for better code splitting
const UserLogin = () => import('../views/UserLogin.vue')
const MainDashboard = () => import('../views/MainDashboard.vue')
const RespondersList = () => import('../views/RespondersList.vue')
const JobsList = () => import('../views/JobsList.vue')

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

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Wait for auth store to initialize if needed
  if (!authStore.user && !authStore.token) {
    authStore.initializeAuth()
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router
