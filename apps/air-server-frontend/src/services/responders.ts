import type { Responder, JobForm } from '../types'

interface AssignJobResponse {
  success: boolean
  message: string
}

export const respondersService = {
  async getResponders(): Promise<Responder[]> {
    // Mock data - replace with actual API call
    const mockResponders: Responder[] = [
      {
        id: 1,
        name: 'Responder-001',
        status: 'online',
        lastSeen: new Date().toISOString(),
        operatingSystem: 'Windows 10',
        ipAddress: '192.168.1.100',
        assignedJobs: 3,
      },
      {
        id: 2,
        name: 'Responder-002',
        status: 'offline',
        lastSeen: new Date(Date.now() - 300000).toISOString(),
        operatingSystem: 'Ubuntu 20.04',
        ipAddress: '192.168.1.101',
        assignedJobs: 1,
      },
      {
        id: 3,
        name: 'Responder-003',
        status: 'online',
        lastSeen: new Date().toISOString(),
        operatingSystem: 'macOS Big Sur',
        ipAddress: '192.168.1.102',
        assignedJobs: 5,
      },
      {
        id: 4,
        name: 'Responder-004',
        status: 'online',
        lastSeen: new Date(Date.now() - 60000).toISOString(),
        operatingSystem: 'Windows 11',
        ipAddress: '192.168.1.103',
        assignedJobs: 2,
      },
    ]

    await new Promise((resolve) => setTimeout(resolve, 500))
    return mockResponders

    // Actual API call (uncomment when ready)
    // return api.get<Responder[]>('/responders')
  },

  async assignJob(
    responderId: number,
    jobData: Omit<JobForm, 'assignedTo'>,
  ): Promise<AssignJobResponse> {
    // Mock response
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return { success: true, message: 'Job assigned successfully' }

    // Actual API call (uncomment when ready)
    // return api.post<AssignJobResponse>(`/responders/${responderId}/assign-job`, jobData)
  },
}
