import type { User } from '../types'

export const storageManager = {
  // Token management
  setToken(token: string): void {
    localStorage.setItem('air_server_token', token)
  },

  getToken(): string | null {
    return localStorage.getItem('air_server_token')
  },

  removeToken(): void {
    localStorage.removeItem('air_server_token')
  },

  // User management
  setUser(user: User): void {
    localStorage.setItem('air_server_user', JSON.stringify(user))
  },

  getUser(): User | null {
    const user = localStorage.getItem('air_server_user')
    return user ? JSON.parse(user) : null
  },

  removeUser(): void {
    localStorage.removeItem('air_server_user')
  },

  // Clear all data
  clear(): void {
    localStorage.removeItem('air_server_token')
    localStorage.removeItem('air_server_user')
  },

  // Generic storage methods
  set<T>(key: string, value: T): void {
    localStorage.setItem(`air_server_${key}`, JSON.stringify(value))
  },

  get<T>(key: string): T | null {
    const item = localStorage.getItem(`air_server_${key}`)
    return item ? JSON.parse(item) : null
  },

  remove(key: string): void {
    localStorage.removeItem(`air_server_${key}`)
  },
}
