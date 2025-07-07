import { respondersApi, jobsApi } from './api'
import type { DashboardStats, PieChartData, PaginatedResponse, Responder, Job } from '../types'

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
    try {
      // Get responders stats
      const respondersResponse = await respondersApi.get<PaginatedResponse<Responder>>(
        '/responders?page=1&limit=1000',
      )
      const responders = respondersResponse.data

      // Get jobs stats
      const jobsResponse = await jobsApi.get<PaginatedResponse<Job>>('/jobs?page=1&limit=1000')
      const jobs = jobsResponse.data

      // Calculate healthy responders based on lastSeen timestamp
      const healthyResponders = responders.filter((r) => isResponderHealthy(r.lastSeen)).length
      const completedJobs = jobs.filter((j) => j.status === 'completed').length
      const pendingJobs = jobs.filter((j) => j.status === 'pending').length
      const failedJobs = jobs.filter((j) => j.status === 'failed').length

      return {
        responders: {
          online: healthyResponders,
          total: responders.length,
        },
        jobs: {
          total: jobs.length,
          completed: completedJobs,
          pending: pendingJobs,
          failed: failedJobs,
        },
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error)
      // Return default stats on error
      return {
        responders: { online: 0, total: 0 },
        jobs: { total: 0, completed: 0, pending: 0, failed: 0 },
      }
    }
  },

  async getResponderStatusChart(): Promise<PieChartData> {
    try {
      const respondersResponse = await respondersApi.get<PaginatedResponse<Responder>>(
        '/responders?page=1&limit=1000',
      )
      const responders = respondersResponse.data

      // Calculate healthy/unhealthy counts based on lastSeen timestamp
      const healthyCount = responders.filter((r) => isResponderHealthy(r.lastSeen)).length
      const unhealthyCount = responders.length - healthyCount

      return {
        labels: ['Healthy', 'Unhealthy'],
        datasets: [
          {
            data: [healthyCount, unhealthyCount],
            backgroundColor: [
              '#10b981', // Green for healthy
              '#ef4444', // Red for unhealthy
            ],
            borderWidth: 3,
            borderColor: '#ffffff',
          },
        ],
      }
    } catch (error) {
      console.error('Failed to fetch responder status chart data:', error)
      return {
        labels: ['Healthy', 'Unhealthy'],
        datasets: [
          {
            data: [0, 0],
            backgroundColor: ['#10b981', '#ef4444'],
            borderWidth: 3,
            borderColor: '#ffffff',
          },
        ],
      }
    }
  },

  async getJobsChart(): Promise<PieChartData> {
    try {
      const jobsResponse = await jobsApi.get<PaginatedResponse<Job>>('/jobs?page=1&limit=1000')
      const jobs = jobsResponse.data

      const completedCount = jobs.filter((j) => j.status === 'completed').length
      const pendingCount = jobs.filter((j) => j.status === 'pending').length
      const failedCount = jobs.filter((j) => j.status === 'failed').length

      return {
        labels: ['Completed', 'Pending', 'Failed'],
        datasets: [
          {
            data: [completedCount, pendingCount, failedCount],
            backgroundColor: [
              '#10b981', // Green for completed
              '#f59e0b', // Amber for pending
              '#ef4444', // Red for failed
            ],
            borderWidth: 3,
            borderColor: '#ffffff',
          },
        ],
      }
    } catch (error) {
      console.error('Failed to fetch jobs chart data:', error)
      return {
        labels: ['Completed', 'Pending', 'Failed'],
        datasets: [
          {
            data: [0, 0, 0],
            backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
            borderWidth: 3,
            borderColor: '#ffffff',
          },
        ],
      }
    }
  },
}
