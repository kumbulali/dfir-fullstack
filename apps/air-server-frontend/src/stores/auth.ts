import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '../services/auth'
import { storageManager } from '../utils/storage'
import type { User, LoginCredentials, LoginResponse } from '../types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!token.value)

  const initializeAuth = (): void => {
    const savedToken = storageManager.getToken()
    const savedUser = storageManager.getUser()

    if (savedToken && savedUser) {
      token.value = savedToken
      user.value = savedUser
    }
  }

  const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      loading.value = true
      error.value = null

      const response = await authService.login(credentials)

      token.value = response.accessToken
      user.value = response.user

      storageManager.setToken(response.accessToken)
      storageManager.setUser(response.user)

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
    storageManager.clear()
  }

  const handleAuthError = (): void => {
    logout()
    window.location.href = '/login'
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    initializeAuth,
    login,
    logout,
    handleAuthError,
  }
})
