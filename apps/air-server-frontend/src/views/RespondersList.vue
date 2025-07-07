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
        <div style="display: flex; gap: 12px">
          <button @click="openRegisterModal" class="btn btn-primary">Register New Responder</button>
          <button @click="refreshResponders" class="btn btn-secondary">
            {{ loading ? 'Refreshing...' : 'Refresh' }}
          </button>
        </div>
      </div>

      <div v-if="loading" class="loading">
        <div class="spinner"></div>
      </div>

      <div v-else class="card">
        <div
          v-if="responders.length === 0"
          style="text-align: center; padding: 40px; color: #6b7280"
        >
          No responders found
        </div>
        <table v-else class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Status</th>
              <th>Last Seen</th>
              <th>Operating System</th>
              <th>IP Address</th>
              <th>Token</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="responder in responders" :key="responder.id">
              <td>{{ responder.id }}</td>
              <td>
                <span
                  class="status-badge"
                  :class="formatters.formatStatus('healthy', responder.lastSeen).class"
                >
                  {{ formatters.formatStatus('healthy', responder.lastSeen).text }}
                </span>
              </td>
              <td>
                <div>
                  <div>{{ formatters.formatRelativeTime(responder.lastSeen) }}</div>
                  <div style="font-size: 12px; color: #6b7280">
                    {{ formatters.formatDate(responder.lastSeen) }}
                  </div>
                </div>
              </td>
              <td>{{ responder.operatingSystem }}</td>
              <td>{{ responder.ipAddress }}</td>
              <td>
                <code
                  style="font-size: 12px; background: #f3f4f6; padding: 2px 6px; border-radius: 4px"
                >
                  {{ responder.token.substring(0, 20) }}...
                </code>
              </td>
              <td>{{ formatters.formatRelativeTime(responder.createdAt) }}</td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div
          v-if="meta"
          class="pagination"
          style="
            margin-top: 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          "
        >
          <div style="color: #6b7280; font-size: 14px">
            Showing {{ meta.itemCount }} of {{ meta.totalItems }} responders
          </div>
          <div style="display: flex; gap: 8px">
            <button
              @click="loadPage(meta.currentPage - 1)"
              :disabled="meta.currentPage <= 1"
              class="btn btn-secondary"
              style="padding: 6px 12px; font-size: 12px"
            >
              Previous
            </button>
            <span style="padding: 6px 12px; color: #374151">
              Page {{ meta.currentPage }} of {{ meta.totalPages }}
            </span>
            <button
              @click="loadPage(meta.currentPage + 1)"
              :disabled="meta.currentPage >= meta.totalPages"
              class="btn btn-secondary"
              style="padding: 6px 12px; font-size: 12px"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <!-- Register Responder Modal -->
      <div v-if="showRegisterModal" class="modal-overlay" @click="closeRegisterModal">
        <div class="modal-content register-modal" @click.stop>
          <div class="modal-header">
            <h3>Register New Responder</h3>
            <button @click="closeRegisterModal" class="modal-close">&times;</button>
          </div>

          <div class="modal-body">
            <div v-if="!enrollmentToken && !generatingToken" class="register-info">
              <div class="info-icon">
                <svg width="48" height="48" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                  />
                </svg>
              </div>
              <h4>Generate Enrollment Token</h4>
              <p>
                Click the button below to generate a new enrollment token for registering a
                responder. The token will be valid for 10 minutes.
              </p>
              <button
                @click="generateToken"
                class="btn btn-primary"
                style="width: 100%; margin-top: 16px"
              >
                Generate Enrollment Token
              </button>
            </div>

            <div v-if="generatingToken" class="generating-state">
              <div class="spinner" style="margin: 0 auto 16px"></div>
              <p style="text-align: center; color: #6b7280">Generating enrollment token...</p>
            </div>

            <div v-if="enrollmentToken" class="token-display">
              <div class="token-header">
                <div class="success-icon">
                  <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                    <path
                      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                    />
                  </svg>
                </div>
                <h4>Enrollment Token Generated</h4>
              </div>

              <div class="token-container">
                <label class="form-label">Enrollment Token</label>
                <div class="token-input-group">
                  <input
                    :value="enrollmentToken"
                    type="text"
                    class="form-input token-input"
                    readonly
                  />
                  <button
                    @click="copyToken"
                    class="btn btn-secondary copy-btn"
                    :class="{ copied: tokenCopied }"
                  >
                    <svg
                      v-if="!tokenCopied"
                      width="16"
                      height="16"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"
                      />
                    </svg>
                    <svg v-else width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                    {{ tokenCopied ? 'Copied!' : 'Copy' }}
                  </button>
                </div>
              </div>

              <div class="countdown-container">
                <div class="countdown-header">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path
                      d="M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42C16.07 4.74 14.12 4 12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9 9-4.03 9-9c0-2.12-.74-4.07-1.97-5.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"
                    />
                  </svg>
                  <span>Token expires in:</span>
                </div>
                <div
                  class="countdown-timer"
                  :class="{ warning: timeLeft <= 120, danger: timeLeft <= 60 }"
                >
                  {{ formatTime(timeLeft) }}
                </div>
                <div class="countdown-progress">
                  <div class="progress-bar" :style="{ width: `${(timeLeft / 600) * 100}%` }"></div>
                </div>
              </div>

              <div class="instructions">
                <h5>Instructions:</h5>
                <ol>
                  <li>Copy the enrollment token above</li>
                  <li>Run your responder application with this token</li>
                  <li>The responder will automatically register and appear in the list</li>
                  <li>Token expires in 10 minutes</li>
                </ol>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button @click="closeRegisterModal" class="btn btn-secondary">Close</button>
            <button v-if="enrollmentToken" @click="generateNewToken" class="btn btn-primary">
              Generate New Token
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { respondersService } from '../services/responders'
import { formatters } from '../utils/formatters'
import type { Responder, PaginationMeta } from '../types'

const router = useRouter()
const authStore = useAuthStore()

const responders = ref<Responder[]>([])
const meta = ref<PaginationMeta | null>(null)
const loading = ref<boolean>(false)
const currentPage = ref<number>(1)
const itemsPerPage = ref<number>(20)

// Register modal state
const showRegisterModal = ref<boolean>(false)
const enrollmentToken = ref<string>('')
const generatingToken = ref<boolean>(false)
const tokenCopied = ref<boolean>(false)
const timeLeft = ref<number>(600) // 10 minutes in seconds
const countdownInterval = ref<NodeJS.Timeout | null>(null)

const handleLogout = (): void => {
  authStore.logout()
  router.push('/login')
}

const loadResponders = async (page: number = 1): Promise<void> => {
  try {
    loading.value = true
    const response = await respondersService.getResponders(page, itemsPerPage.value)
    responders.value = response.data
    meta.value = response.meta
    currentPage.value = page
  } catch (error: any) {
    console.error('Failed to load responders:', error)
    if (error.status === 401) {
      authStore.handleAuthError()
    }
  } finally {
    loading.value = false
  }
}

const loadPage = (page: number): void => {
  if (page >= 1 && meta.value && page <= meta.value.totalPages) {
    loadResponders(page)
  }
}

const refreshResponders = (): void => {
  loadResponders(currentPage.value)
}

const openRegisterModal = (): void => {
  showRegisterModal.value = true
  enrollmentToken.value = ''
  generatingToken.value = false
  tokenCopied.value = false
  timeLeft.value = 600
}

const closeRegisterModal = (): void => {
  showRegisterModal.value = false
  enrollmentToken.value = ''
  tokenCopied.value = false

  // Clear countdown interval
  if (countdownInterval.value) {
    clearInterval(countdownInterval.value)
    countdownInterval.value = null
  }

  // Refresh responders list when modal closes
  refreshResponders()
}

const generateToken = async (): Promise<void> => {
  try {
    generatingToken.value = true
    const response = await respondersService.generateEnrollmentToken()
    enrollmentToken.value = response.enrollmentToken
    timeLeft.value = 600 // Reset to 10 minutes
    startCountdown()
  } catch (error: any) {
    console.error('Failed to generate enrollment token:', error)
    alert(`Failed to generate token: ${error.message}`)
  } finally {
    generatingToken.value = false
  }
}

const generateNewToken = async (): Promise<void> => {
  // Clear existing countdown
  if (countdownInterval.value) {
    clearInterval(countdownInterval.value)
    countdownInterval.value = null
  }

  enrollmentToken.value = ''
  tokenCopied.value = false
  await generateToken()
}

const copyToken = async (): Promise<void> => {
  try {
    await navigator.clipboard.writeText(enrollmentToken.value)
    tokenCopied.value = true
    setTimeout(() => {
      tokenCopied.value = false
    }, 2000)
  } catch (error) {
    console.error('Failed to copy token:', error)
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = enrollmentToken.value
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    tokenCopied.value = true
    setTimeout(() => {
      tokenCopied.value = false
    }, 2000)
  }
}

const startCountdown = (): void => {
  countdownInterval.value = setInterval(() => {
    timeLeft.value--
    if (timeLeft.value <= 0) {
      clearInterval(countdownInterval.value!)
      countdownInterval.value = null
      enrollmentToken.value = ''
      alert('Enrollment token has expired. Please generate a new one.')
    }
  }, 1000)
}

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

onMounted(() => {
  loadResponders()
})

onUnmounted(() => {
  if (countdownInterval.value) {
    clearInterval(countdownInterval.value)
  }
})
</script>

<style scoped>
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

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
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.register-modal {
  max-width: 600px;
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
  font-size: 20px;
  font-weight: 600;
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
  border-radius: 6px;
  transition: all 0.2s ease;
}

.modal-close:hover {
  color: #374151;
  background-color: #f3f4f6;
}

.modal-body {
  padding: 24px;
}

.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 24px;
  border-top: 1px solid #e5e7eb;
  background-color: #f9fafb;
  border-radius: 0 0 12px 12px;
}

.register-info {
  text-align: center;
  padding: 20px 0;
}

.info-icon {
  width: 64px;
  height: 64px;
  background-color: #dbeafe;
  color: #3b82f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.register-info h4 {
  margin: 0 0 12px;
  color: #1f2937;
  font-size: 18px;
  font-weight: 600;
}

.register-info p {
  margin: 0 0 20px;
  color: #6b7280;
  line-height: 1.5;
}

.generating-state {
  text-align: center;
  padding: 40px 0;
}

.token-display {
  padding: 20px 0;
}

.token-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.success-icon {
  width: 32px;
  height: 32px;
  background-color: #dcfce7;
  color: #16a34a;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.token-header h4 {
  margin: 0;
  color: #1f2937;
  font-size: 18px;
  font-weight: 600;
}

.token-container {
  margin-bottom: 24px;
}

.token-input-group {
  display: flex;
  gap: 8px;
}

.token-input {
  flex: 1;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 2px;
  text-align: center;
  background-color: #f8fafc;
  border: 2px solid #e2e8f0;
}

.copy-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 16px;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.copy-btn.copied {
  background-color: #16a34a;
  color: white;
}

.countdown-container {
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
}

.countdown-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
}

.countdown-timer {
  font-size: 32px;
  font-weight: bold;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  text-align: center;
  margin-bottom: 16px;
  color: #16a34a;
  transition: color 0.3s ease;
}

.countdown-timer.warning {
  color: #f59e0b;
}

.countdown-timer.danger {
  color: #ef4444;
}

.countdown-progress {
  width: 100%;
  height: 8px;
  background-color: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background-color: #16a34a;
  transition: all 0.3s ease;
  border-radius: 4px;
}

.countdown-timer.warning + .countdown-progress .progress-bar {
  background-color: #f59e0b;
}

.countdown-timer.danger + .countdown-progress .progress-bar {
  background-color: #ef4444;
}

.instructions {
  background-color: #fffbeb;
  border: 1px solid #fed7aa;
  border-radius: 8px;
  padding: 16px;
}

.instructions h5 {
  margin: 0 0 12px;
  color: #92400e;
  font-size: 14px;
  font-weight: 600;
}

.instructions ol {
  margin: 0;
  padding-left: 20px;
  color: #92400e;
  font-size: 14px;
  line-height: 1.5;
}

.instructions li {
  margin-bottom: 4px;
}

@media (max-width: 768px) {
  .table {
    font-size: 12px;
  }

  .table th,
  .table td {
    padding: 8px 4px;
  }

  .pagination {
    flex-direction: column;
    gap: 16px;
  }

  .modal-content {
    width: 95%;
    margin: 20px;
  }

  .token-input-group {
    flex-direction: column;
  }

  .copy-btn {
    justify-content: center;
  }
}
</style>
