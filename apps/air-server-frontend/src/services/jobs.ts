import type { Job, JobForm } from '../types'

export const jobsService = {
  async getJobs(): Promise<Job[]> {
    // Mock data - replace with actual API call
    const mockJobs: Job[] = [
      {
        id: 1,
        title: 'System Scan',
        description: 'Full system security scan',
        status: 'completed',
        assignedTo: 'Responder-001',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        completedAt: new Date(Date.now() - 1800000).toISOString(),
      },
      {
        id: 2,
        title: 'File Collection',
        description: 'Collect log files from target system',
        status: 'pending',
        assignedTo: 'Responder-002',
        createdAt: new Date(Date.now() - 1800000).toISOString(),
        completedAt: null,
      },
      {
        id: 3,
        title: 'Registry Analysis',
        description: 'Analyze Windows registry for anomalies',
        status: 'failed',
        assignedTo: 'Responder-003',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        completedAt: null,
      },
    ]

    await new Promise((resolve) => setTimeout(resolve, 500))
    return mockJobs

    // Actual API call (uncomment when ready)
    // return api.get<Job[]>('/jobs')
  },

  async createJob(jobData: JobForm): Promise<Job> {
    // Mock response
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return {
      id: Date.now(),
      ...jobData,
      status: 'pending',
      createdAt: new Date().toISOString(),
      completedAt: null,
    }

    // Actual API call (uncomment when ready)
    // return api.post<Job>('/jobs', jobData)
  },
}
