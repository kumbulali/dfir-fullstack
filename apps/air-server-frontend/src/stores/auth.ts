import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '../services/auth'
import { storageManager } from '../utils/storage'
import type { User, LoginCredentials, LoginResponse } from '../types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const tenantId = ref<string | null>(null)
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!token.value)

  const initializeAuth = (): void => {
    try {
      const savedToken = storageManager.getToken()
      const savedUser = storageManager.getUser()
      const savedTenantId = storageManager.getTenantId()

      if (savedToken && savedUser && savedTenantId) {
        token.value = savedToken
        user.value = savedUser
        tenantId.value = savedTenantId
        console.log('Auth initialized from localStorage')
      } else {
        console.log('No saved auth data found')
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error)
      // Clear potentially corrupted data
      storageManager.clear()
    }
  }

  const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      loading.value = true
      error.value = null

      // Store tenant ID before making the request
      tenantId.value = credentials.tenantId
      storageManager.setTenantId(credentials.tenantId)

      const response = await authService.login({
        email: credentials.email,
        password: credentials.password,
      })

      token.value = response.accessToken

      // Create user object from credentials since API doesn't return user info
      const userInfo: User = {
        id: 1, // You might want to get this from a separate API call
        email: credentials.email,
        tenantId: credentials.tenantId,
        name: credentials.email.split('@')[0], // Extract name from email
        role: 'user',
      }

      user.value = userInfo

      storageManager.setToken(response.accessToken)
      storageManager.setUser(userInfo)

      return response
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const logout = (): void => {
    token.value = null
    user.value = null
    tenantId.value = null
    storageManager.clear()
  }

  const handleAuthError = (): void => {
    logout()
    window.location.href = '/login'
  }

  return {
    user,
    token,
    tenantId,
    loading,
    error,
    isAuthenticated,
    initializeAuth,
    login,
    logout,
    handleAuthError,
  }
})
