<template>
  <div>
    <nav class="navbar">
      <div class="navbar-content">
        <router-link to="/" class="navbar-brand">AIR Server</router-link>
        <ul class="navbar-nav">
          <li><router-link to="/">Dashboard</router-link></li>
          <li><router-link to="/responders">Responders</router-link></li>
          <li><router-link to="/jobs">Jobs</router-link></li>
        </ul>
        <div class="navbar-user">
          <span class="user-info">{{ authStore.user?.email }}</span>
          <button @click="handleLogout" class="btn btn-secondary">Logout</button>
        </div>
      </div>
    </nav>

    <div class="container" style="padding-top: 32px">
      <div
        style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        "
      >
        <h1 style="color: #1f2937">Jobs</h1>
        <div style="display: flex; gap: 12px">
          <button @click="openCreateJobModal" class="btn btn-primary">Create Job</button>
          <button @click="refreshJobs" class="btn btn-secondary">
            {{ loading ? 'Refreshing...' : 'Refresh' }}
          </button>
        </div>
      </div>

      <div v-if="loading" class="loading">
        <div class="spinner"></div>
      </div>

      <div v-else class="card">
        <table class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Description</th>
              <th>Status</th>
              <th>Assigned To</th>
              <th>Created</th>
              <th>Completed</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="job in jobs" :key="job.id">
              <td>{{ job.id }}</td>
              <td>{{ job.title }}</td>
              <td>{{ job.description }}</td>
              <td>
                <span class="status-badge" :class="formatters.formatStatus(job.status).class">
                  {{ formatters.formatStatus(job.status).text }}
                </span>
              </td>
              <td>{{ job.assignedTo }}</td>
              <td>{{ formatters.formatRelativeTime(job.createdAt) }}</td>
              <td>
                {{ job.completedAt ? formatters.formatRelativeTime(job.completedAt) : 'N/A' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Create Job Modal -->
      <div v-if="showCreateModal" class="modal-overlay" @click="closeCreateModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>Create New Job</h3>
            <button @click="closeCreateModal" class="modal-close">&times;</button>
          </div>

          <form @submit.prevent="createJob" class="modal-body">
            <div class="form-group">
              <label class="form-label">Job Title</label>
              <input
                v-model="jobForm.title"
                type="text"
                class="form-input"
                placeholder="Enter job title"
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea
                v-model="jobForm.description"
                class="form-input"
                rows="3"
                placeholder="Enter job description"
                required
              ></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">Assign To</label>
              <select v-model="jobForm.assignedTo" class="form-input" required>
                <option value="">Select a responder</option>
                <option value="Responder-001">Responder-001</option>
                <option value="Responder-002">Responder-002</option>
                <option value="Responder-003">Responder-003</option>
                <option value="Responder-004">Responder-004</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Priority</label>
              <select v-model="jobForm.priority" class="form-input" required>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div class="modal-footer">
              <button type="button" @click="closeCreateModal" class="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary" :disabled="creatingJob">
                {{ creatingJob ? 'Creating...' : 'Create Job' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { jobsService } from '../services/jobs'
import { formatters } from '../utils/formatters'
import type { Job, JobForm } from '../types'

const router = useRouter()
const authStore = useAuthStore()

const jobs = ref<Job[]>([])
const loading = ref<boolean>(false)
const showCreateModal = ref<boolean>(false)
const creatingJob = ref<boolean>(false)

const jobForm = ref<JobForm>({
  title: '',
  description: '',
  assignedTo: '',
  priority: 'medium',
})

const handleLogout = (): void => {
  authStore.logout()
  router.push('/login')
}

const loadJobs = async (): Promise<void> => {
  try {
    loading.value = true
    const data = await jobsService.getJobs()
    jobs.value = data
  } catch (error) {
    console.error('Failed to load jobs:', error)
  } finally {
    loading.value = false
  }
}

const refreshJobs = (): void => {
  loadJobs()
}

const openCreateJobModal = (): void => {
  showCreateModal.value = true
  jobForm.value = {
    title: '',
    description: '',
    assignedTo: '',
    priority: 'medium',
  }
}

const closeCreateModal = (): void => {
  showCreateModal.value = false
}

const createJob = async (): Promise<void> => {
  try {
    creatingJob.value = true

    const newJob = await jobsService.createJob(jobForm.value)
    jobs.value.unshift(newJob)

    closeCreateModal()
    alert('Job created successfully!')
  } catch (error) {
    console.error('Failed to create job:', error)
    alert('Failed to create job. Please try again.')
  } finally {
    creatingJob.value = false
  }
}

onMounted(() => {
  loadJobs()
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  color: #1f2937;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6b7280;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  color: #374151;
}

.modal-body {
  padding: 24px;
}

.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

@media (max-width: 768px) {
  .table {
    font-size: 12px;
  }

  .table th,
  .table td {
    padding: 8px 4px;
  }

  .modal-content {
    width: 95%;
    margin: 20px;
  }
}
</style>
