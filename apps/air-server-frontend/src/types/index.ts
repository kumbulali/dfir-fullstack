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
  tenantId: string
}

export interface LoginResponse {
  accessToken: string
  user: User
}

export interface ApiError {
  status?: number
  message: string
  data?: any
}

export interface Responder {
  id: number
  name: string
  status: 'online' | 'offline'
  lastSeen: string
  operatingSystem: string
  ipAddress: string
  assignedJobs: number
}

export interface Job {
  id: number
  title: string
  description: string
  status: 'completed' | 'pending' | 'failed'
  assignedTo: string
  createdAt: string
  completedAt: string | null
  priority?: 'low' | 'medium' | 'high'
}

export interface JobForm {
  title: string
  description: string
  assignedTo: string
  priority: 'low' | 'medium' | 'high'
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

export type ResponderStatus = 'online' | 'offline'
export type JobStatus = 'completed' | 'pending' | 'failed'
export type JobPriority = 'low' | 'medium' | 'high'
