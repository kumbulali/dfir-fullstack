import api from './api'
import type { LoginCredentials, LoginResponse } from '../types'

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    // Mock response - replace with actual API call
    const mockResponse: LoginResponse = {
      accessToken: 'mock-jwt-token-' + Date.now(),
      user: {
        id: 1,
        email: credentials.email,
        tenantId: credentials.tenantId,
        name: 'John Doe',
        role: 'admin',
      },
    }

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Simulate login validation
    if (credentials.email === 'admin@example.com' && credentials.password === 'password') {
      return mockResponse
    } else {
      throw new Error('Invalid credentials')
    }

    // Actual API call (uncomment when ready)
    // return api.post<LoginResponse>('/auth/login', credentials)
  },

  async refreshToken(): Promise<{ accessToken: string }> {
    return api.post('/auth/refresh')
  },

  async logout(): Promise<void> {
    return api.post('/auth/logout')
  },
}
