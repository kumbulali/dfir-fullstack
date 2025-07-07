import { authApi } from './api'
import type { LoginRequest, LoginResponse } from '../types'

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return authApi.post<LoginResponse>('/auth/login', credentials)
  },

  async refreshToken(): Promise<{ accessToken: string }> {
    return authApi.post('/auth/refresh')
  },

  async logout(): Promise<void> {
    return authApi.post('/auth/logout')
  },
}
