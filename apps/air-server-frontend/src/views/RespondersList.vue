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
        <h1 style="color: #1f2937">Responders</h1>
        <button @click="refreshResponders" class="btn btn-primary">
          {{ loading ? 'Refreshing...' : 'Refresh' }}
        </button>
      </div>

      <div v-if="loading" class="loading">
        <div class="spinner"></div>
      </div>

      <div v-else class="card">
        <table class="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Status</th>
              <th>Last Seen</th>
              <th>Operating System</th>
              <th>IP Address</th>
              <th>Assigned Jobs</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="responder in responders" :key="responder.id">
              <td>{{ responder.name }}</td>
              <td>
                <span class="status-badge" :class="formatters.formatStatus(responder.status).class">
                  {{ formatters.formatStatus(responder.status).text }}
                </span>
              </td>
              <td>{{ formatters.formatRelativeTime(responder.lastSeen) }}</td>
              <td>{{ responder.operatingSystem }}</td>
              <td>{{ responder.ipAddress }}</td>
              <td>{{ responder.assignedJobs }}</td>
              <td>
                <button
                  @click="openAssignJobModal(responder)"
                  class="btn btn-primary"
                  style="font-size: 12px; padding: 6px 12px"
                >
                  Assign Job
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Assign Job Modal -->
      <div v-if="showAssignModal" class="modal-overlay" @click="closeAssignModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>Assign Job to {{ selectedResponder?.name }}</h3>
            <button @click="closeAssignModal" class="modal-close">&times;</button>
          </div>

          <form @submit.prevent="assignJob" class="modal-body">
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
              <label class="form-label">Priority</label>
              <select v-model="jobForm.priority" class="form-input" required>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div class="modal-footer">
              <button type="button" @click="closeAssignModal" class="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary" :disabled="assigningJob">
                {{ assigningJob ? 'Assigning...' : 'Assign Job' }}
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
import { respondersService } from '../services/responders'
import { formatters } from '../utils/formatters'
import type { Responder, JobPriority } from '../types'

const router = useRouter()
const authStore = useAuthStore()

const responders = ref<Responder[]>([])
const loading = ref<boolean>(false)
const showAssignModal = ref<boolean>(false)
const selectedResponder = ref<Responder | null>(null)
const assigningJob = ref<boolean>(false)

interface JobFormData {
  title: string
  description: string
  priority: JobPriority
}

const jobForm = ref<JobFormData>({
  title: '',
  description: '',
  priority: 'medium',
})

const handleLogout = (): void => {
  authStore.logout()
  router.push('/login')
}

const loadResponders = async (): Promise<void> => {
  try {
    loading.value = true
    const data = await respondersService.getResponders()
    responders.value = data
  } catch (error) {
    console.error('Failed to load responders:', error)
  } finally {
    loading.value = false
  }
}

const refreshResponders = (): void => {
  loadResponders()
}

const openAssignJobModal = (responder: Responder): void => {
  selectedResponder.value = responder
  showAssignModal.value = true
  jobForm.value = {
    title: '',
    description: '',
    priority: 'medium',
  }
}

const closeAssignModal = (): void => {
  showAssignModal.value = false
  selectedResponder.value = null
}

const assignJob = async (): Promise<void> => {
  if (!selectedResponder.value) return

  try {
    assigningJob.value = true

    await respondersService.assignJob(selectedResponder.value.id, jobForm.value)

    // Update the responder's assigned jobs count
    const responderIndex = responders.value.findIndex((r) => r.id === selectedResponder.value!.id)
    if (responderIndex !== -1) {
      responders.value[responderIndex].assignedJobs++
    }

    closeAssignModal()
    alert('Job assigned successfully!')
  } catch (error) {
    console.error('Failed to assign job:', error)
    alert('Failed to assign job. Please try again.')
  } finally {
    assigningJob.value = false
  }
}

onMounted(() => {
  loadResponders()
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
