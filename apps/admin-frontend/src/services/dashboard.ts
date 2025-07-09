import apiInstance from "./api"
import type { DashboardStats, HealthStatus } from "../types"

// Helper function to check if a responder is healthy based on lastSeen
const isResponderHealthy = (lastSeen: string | null): boolean => {
  if (!lastSeen) return false

  const lastSeenTime = new Date(lastSeen).getTime()
  const currentTime = new Date().getTime()
  const timeDifferenceInSeconds = (currentTime - lastSeenTime) / 1000

  // Consider healthy if last seen within 45 seconds
  return timeDifferenceInSeconds <= 45
}

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    return apiInstance.get<DashboardStats>("/dashboard/stats")
  },

  async getHealth(): Promise<HealthStatus> {
    return apiInstance.get<HealthStatus>("/health")
  },
}
