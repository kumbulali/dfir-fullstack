import apiInstance from "./api";
import type { User, PaginatedResponse, CreateUserRequest, UpdateUserRequest } from "../types";

export const usersService = {
  async getUsers(page = 1, limit = 20, tenantId?: string): Promise<PaginatedResponse<User>> {
    if (tenantId) {
      return apiInstance.get<PaginatedResponse<User>>(
        `/tenants/${tenantId}/users?page=${page}&limit=${limit}`,
      );
    }
    return apiInstance.get<PaginatedResponse<User>>(`/users?page=${page}&limit=${limit}`);
  },

  async getUser(id: number): Promise<User> {
    return apiInstance.get<User>(`/users/${id}`);
  },

  async createUser(data: CreateUserRequest): Promise<User> {
    return apiInstance.post<User>(`/tenants/${data.tenantId}/users`, data);
  },

  async updateUser(id: number, data: UpdateUserRequest, tenantId?: string): Promise<User> {
    if (tenantId) {
      return apiInstance.patch<User>(`/tenants/${tenantId}/users/${id}`, data);
    }
    return apiInstance.patch<User>(`/users/${id}`, data);
  },

  async deleteUser(id: number, tenantId?: string): Promise<void> {
    if (tenantId) {
      return apiInstance.delete(`/tenants/${tenantId}/users/${id}`);
    }
    return apiInstance.delete(`/users/${id}`);
  },
};
