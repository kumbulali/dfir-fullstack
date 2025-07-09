import apiInstance from "./api";
import type {
  Tenant,
  PaginatedResponse,
  CreateTenantRequest,
  UpdateTenantRequest,
  TenantStats,
} from "../types";

export const tenantsService = {
  async getTenants(page = 1, limit = 20): Promise<PaginatedResponse<Tenant>> {
    return apiInstance.get<PaginatedResponse<Tenant>>(`/tenants?page=${page}&limit=${limit}`);
  },

  async getTenant(id: string): Promise<Tenant> {
    return apiInstance.get<Tenant>(`/tenants/${id}`);
  },

  async getTenantStats(id: string): Promise<TenantStats> {
    return apiInstance.get<TenantStats>(`/tenants/${id}/stats`);
  },

  async createTenant(data: CreateTenantRequest): Promise<Tenant> {
    return apiInstance.post<Tenant>("/tenants", data);
  },

  async updateTenant(id: string, data: UpdateTenantRequest): Promise<Tenant> {
    return apiInstance.patch<Tenant>(`/tenants/${id}`, data);
  },

  async deleteTenant(id: string): Promise<void> {
    return apiInstance.delete(`/tenants/${id}`);
  },
};
