import axios, { type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { storageManager } from '../utils/storage'
import type { ApiError } from '../types'

const API_BASE_URL = 'https://api.example.com'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = storageManager.getToken()
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data
  },
  (error) => {
    const { response } = error

    if (response?.status === 401 || response?.status === 403) {
      // Handle unauthorized/forbidden errors
      storageManager.clear()
      window.location.href = '/login'
    }

    // Handle other errors
    const errorMessage = response?.data?.message || error.message || 'An error occurred'

    const apiError: ApiError = {
      status: response?.status,
      message: errorMessage,
      data: response?.data,
    }

    return Promise.reject(apiError)
  },
)

export default api
