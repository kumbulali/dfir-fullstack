import apiInstance from "./api"
import type { LoginCredentials, LoginResponse } from "../types"

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    return apiInstance.post<LoginResponse>("/auth/login", credentials)
  },

  async logout(): Promise<void> {
    return apiInstance.post("/auth/logout")
  },

  async getProfile(): Promise<any> {
    return apiInstance.get("/auth/profile")
  },
}
