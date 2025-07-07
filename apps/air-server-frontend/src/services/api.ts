import axios, { type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import { storageManager } from "../utils/storage";
import type { ApiError } from "../types";

// Use different base URLs for development and production
const isDevelopment = import.meta.env.DEV;

// In development, use proxy paths; in production, use direct URLs
const getBaseURL = (service: string) => {
  if (isDevelopment) {
    // Use Vite proxy in development
    return `/api/${service}`;
  } else {
    // Use direct URLs in production (you may need to adjust these)
    const urls = {
      auth: "http://localhost:3000",
      responders: "http://localhost:3001",
      jobs: "http://localhost:3002",
    };
    return urls[service as keyof typeof urls];
  }
};

// Create separate axios instances for different services
const createApiInstance = (service: string) => {
  const instance = axios.create({
    baseURL: getBaseURL(service),
    timeout: 30000, // Increased timeout
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: false, // Set to true if you need cookies
  });

  // Add request logging in development
  if (isDevelopment) {
    instance.interceptors.request.use(
      (config) => {
        console.log(`🚀 API Request [${service}]:`, {
          method: config.method?.toUpperCase(),
          url: config.url,
          baseURL: config.baseURL,
          headers: config.headers,
          data: config.data,
        });
        return config;
      },
      (error) => {
        console.error(`❌ API Request Error [${service}]:`, error);
        return Promise.reject(error);
      },
    );

    instance.interceptors.response.use(
      (response) => {
        console.log(`✅ API Response [${service}]:`, {
          status: response.status,
          data: response.data,
        });
        return response;
      },
      (error) => {
        console.error(`❌ API Response Error [${service}]:`, {
          status: error.response?.status,
          message: error.message,
          data: error.response?.data,
        });
        return Promise.reject(error);
      },
    );
  }

  return instance;
};

export const authApi = createApiInstance("auth");
export const respondersApi = createApiInstance("responders");
export const jobsApi = createApiInstance("jobs");

authApi.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const tenantId = storageManager.getTenantId();
    if (tenantId && config.headers) {
      config.headers["x-tenant-id"] = tenantId;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

respondersApi.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = storageManager.getToken();
    const tenantId = storageManager.getTenantId();

    if (config.headers) {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      if (tenantId) {
        config.headers["x-tenant-id"] = tenantId;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Request interceptor for jobs API (needs both tenant and auth)
jobsApi.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = storageManager.getToken();
    const tenantId = storageManager.getTenantId();

    if (config.headers) {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      if (tenantId) {
        config.headers["x-tenant-id"] = tenantId;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptors for all APIs
const setupResponseInterceptor = (apiInstance: typeof authApi) => {
  apiInstance.interceptors.response.use(
    (response: AxiosResponse) => {
      return response.data;
    },
    (error) => {
      const { response } = error;

      // Handle network errors
      if (!response) {
        const networkError: ApiError = {
          message: "Network error - please check if the API servers are running",
          status: 0,
        };
        return Promise.reject(networkError);
      }

      if (response?.status === 401 || response?.status === 403) {
        // Handle unauthorized/forbidden errors
        storageManager.clear();
        window.location.href = "/login";
      }

      // Handle other errors
      const errorMessage = response?.data?.message || error.message || "An error occurred";

      const apiError: ApiError = {
        status: response?.status,
        message: errorMessage,
        data: response?.data,
      };

      return Promise.reject(apiError);
    },
  );
};

// Setup response interceptors for all API instances
setupResponseInterceptor(authApi);
setupResponseInterceptor(respondersApi);
setupResponseInterceptor(jobsApi);

export default authApi;
