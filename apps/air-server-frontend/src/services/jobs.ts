import { jobsApi } from './api'
import type { Job, PaginatedResponse, CreateJobRequest, CreateJobResponse } from '../types'

export const jobsService = {
  async getJobs(page = 1, limit = 50): Promise<PaginatedResponse<Job>> {
    return jobsApi.get<PaginatedResponse<Job>>(`/jobs?page=${page}&limit=${limit}`)
  },

  async createJob(jobData: CreateJobRequest): Promise<CreateJobResponse> {
    return jobsApi.post<CreateJobResponse>('/jobs', jobData)
  },
}
