import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router"
import { useAuthStore } from "@/stores/auth"

const AdminLogin = () => import("../views/AdminLogin.vue")
const AdminDashboard = () => import("../views/AdminDashboard.vue")
const TenantsManagement = () => import("../views/TenantsManagement.vue")
const TenantDetail = () => import("../views/TenantDetail.vue")

const routes: RouteRecordRaw[] = [
  {
    path: "/login",
    name: "Login",
    component: AdminLogin,
    meta: { requiresGuest: true },
  },
  {
    path: "/",
    name: "Dashboard",
    component: AdminDashboard,
    meta: { requiresAuth: true },
  },
  {
    path: "/tenants",
    name: "Tenants",
    component: TenantsManagement,
    meta: { requiresAuth: true },
  },
  {
    path: "/tenants/:id",
    name: "TenantDetail",
    component: TenantDetail,
    meta: { requiresAuth: true },
    props: true,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  if (!authStore.user && !authStore.token) {
    authStore.initializeAuth()
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next("/login")
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next("/")
  } else {
    next()
  }
})

export default router
