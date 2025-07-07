export interface User {
  id: number
  email: string
  tenantId: string
  name: string
  role: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
}

export interface ApiError {
  status?: number
  message: string
  data?: any
}

export interface Responder {
  id: number
  createdAt: string
  updatedAt: string
  token: string
  password: string
  ipAddress: string
  operatingSystem: string
  lastSeen: string
  status: 'healthy' | 'unhealthy'
  activeJti: string | null
}

export interface Job {
  id: number
  createdAt: string
  updatedAt: string
  command: string
  args: any[]
  status: 'pending' | 'completed' | 'failed'
  resultData: any | null
  responder: Responder
}

export interface CreateJobRequest {
  responderId: number
  command: string
  args: any[]
}

export interface CreateJobResponse {
  jobId: number
  message: string
}

export interface JobForm {
  responderId: number | null
  command: string
  args: string // Will be parsed as JSON
}

export interface PaginationMeta {
  totalItems: number
  itemCount: number
  itemsPerPage: number
  totalPages: number
  currentPage: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}

export interface DashboardStats {
  responders: {
    online: number
    total: number
  }
  jobs: {
    total: number
    completed: number
    pending: number
    failed: number
  }
}

export interface ChartDataset {
  label: string
  data: number[]
  borderColor: string
  backgroundColor: string
  tension?: number
}

export interface LineChartData {
  labels: string[]
  datasets: ChartDataset[]
}

export interface PieChartDataset {
  data: number[]
  backgroundColor: string[]
  borderWidth: number
  borderColor: string
}

export interface PieChartData {
  labels: string[]
  datasets: PieChartDataset[]
}

export interface StatusFormat {
  text: string
  class: string
}

export type ResponderStatus = 'healthy' | 'unhealthy'
export type JobStatus = 'pending' | 'completed' | 'failed'
export type JobPriority = 'low' | 'medium' | 'high'
