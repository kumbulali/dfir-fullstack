export interface User {
  id: number;
  email: string;
  tenantId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user?: User;
}

export interface ApiError {
  status?: number;
  message: string;
  data?: any;
}

export interface Tenant {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  status: string;
}

export interface TenantStats {
  totalUsers: number;
  totalResponders: number;
  healthyResponders: number;
  healthyRate: number;
}

export interface CreateTenantRequest {
  tenantId: string;
  tenantName: string;
}

export interface UpdateTenantRequest {
  tenantName?: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  tenantId: string;
}

export interface UpdateUserRequest {
  email?: string;
  password?: string;
  tenantId: string;
}

export interface DashboardStats {
  totalTenants: number;
  totalResponders: number;
  healthyResponders: number;
  healthyPercentage: number;
  totalJobs: number;
  pendingJobs: number;
  completedJobs: number;
  failedJobs: number;
}

export interface PaginationMeta {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}

export interface PieChartData extends ChartData {}
export interface BarChartData extends ChartData {}

export interface HealthStatus {
  success: true;
}
