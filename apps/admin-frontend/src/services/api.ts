import axios, { type AxiosResponse, type InternalAxiosRequestConfig } from "axios"
import { storageManager } from "../utils/storage"
import type { ApiError } from "../types"

const isDevelopment = import.meta.env.DEV

const getBaseURL = () => {
  return "http://localhost:4000"
}

const apiInstance = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
})

// Request interceptor
apiInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = storageManager.getToken()

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    if (isDevelopment) {
      console.log(`🚀 API Request:`, {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        headers: config.headers,
        data: config.data,
      })
    }

    return config
  },
  (error) => {
    console.error(`❌ API Request Error:`, error)
    return Promise.reject(error)
  },
)

// Response interceptor
apiInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    if (isDevelopment) {
      console.log(`✅ API Response:`, {
        status: response.status,
        data: response.data,
      })
    }
    return response.data
  },
  (error) => {
    const { response } = error

    if (isDevelopment) {
      console.error(`❌ API Response Error:`, {
        status: response?.status,
        message: error.message,
        data: response?.data,
      })
    }

    // Handle network errors
    if (!response) {
      const networkError: ApiError = {
        message: "Network error - please check if the API server is running on localhost:4000",
        status: 0,
      }
      return Promise.reject(networkError)
    }

    if (response?.status === 401 || response?.status === 403) {
      // Handle unauthorized/forbidden errors
      storageManager.clear()
      window.location.href = "/login"
    }

    // Handle other errors
    const errorMessage = response?.data?.message || error.message || "An error occurred"

    const apiError: ApiError = {
      status: response?.status,
      message: errorMessage,
      data: response?.data,
    }

    return Promise.reject(apiError)
  },
)

export default apiInstance
