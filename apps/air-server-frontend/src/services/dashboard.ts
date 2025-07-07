import type { DashboardStats, LineChartData, PieChartData } from '../types'

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    // Mock data - replace with actual API call
    const mockStats: DashboardStats = {
      responders: {
        online: 45,
        total: 120,
      },
      jobs: {
        total: 1250,
        completed: 980,
        pending: 180,
        failed: 90,
      },
    }

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))
    return mockStats

    // Actual API call (uncomment when ready)
    // return api.get<DashboardStats>('/dashboard/stats')
  },

  async getResponderChart(): Promise<LineChartData> {
    // Mock chart data
    const mockData: LineChartData = {
      labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
      datasets: [
        {
          label: 'Online Responders',
          data: [12, 8, 25, 45, 38, 32],
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
        },
        {
          label: 'Total Responders',
          data: [120, 120, 120, 120, 120, 120],
          borderColor: '#6b7280',
          backgroundColor: 'rgba(107, 114, 128, 0.1)',
          tension: 0.4,
        },
      ],
    }

    await new Promise((resolve) => setTimeout(resolve, 300))
    return mockData

    // Actual API call (uncomment when ready)
    // return api.get<LineChartData>('/dashboard/responder-chart')
  },

  async getJobsChart(): Promise<PieChartData> {
    // Mock pie chart data
    const mockData: PieChartData = {
      labels: ['Completed', 'Pending', 'Failed'],
      datasets: [
        {
          data: [980, 180, 90],
          backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
          borderWidth: 2,
          borderColor: '#ffffff',
        },
      ],
    }

    await new Promise((resolve) => setTimeout(resolve, 300))
    return mockData

    // Actual API call (uncomment when ready)
    // return api.get<PieChartData>('/dashboard/jobs-chart')
  },
}
