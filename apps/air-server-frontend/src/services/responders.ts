import { respondersApi } from './api'
import type { Responder, PaginatedResponse } from '../types'
import { isResponderHealthy } from '../utils/formatters'

export const respondersService = {
  async getResponders(page = 1, limit = 50): Promise<PaginatedResponse<Responder>> {
    return respondersApi.get<PaginatedResponse<Responder>>(
      `/responders?page=${page}&limit=${limit}`,
    )
  },

  async getAllResponders(): Promise<Responder[]> {
    // Get all responders for dropdown selection
    const response = await respondersApi.get<PaginatedResponse<Responder>>(
      `/responders?page=1&limit=1000`,
    )
    return response.data
  },

  async getHealthyResponders(): Promise<Responder[]> {
    // Get all responders and filter for healthy ones based on lastSeen
    const response = await respondersApi.get<PaginatedResponse<Responder>>(
      `/responders?page=1&limit=1000`,
    )
    return response.data.filter((responder) => isResponderHealthy(responder.lastSeen))
  },

  async generateEnrollmentToken(): Promise<{ enrollmentToken: string }> {
    return respondersApi.post<{ enrollmentToken: string }>('/responders/token')
  },

  async deregisterResponder(responderId: number): Promise<void> {
    return respondersApi.delete(`/responders/${responderId}`)
  },
}
