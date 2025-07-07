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
      <div class="dashboard-header">
        <h1>Dashboard</h1>
        <button @click="refreshData" class="btn btn-primary" :disabled="loading">
          {{ loading ? 'Refreshing...' : 'Refresh Data' }}
        </button>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon" style="background-color: #10b981">
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
              />
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.responders.online }}</div>
            <div class="stat-label">Healthy Responders</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background-color: #ef4444">
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
              />
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.responders.total - stats.responders.online }}</div>
            <div class="stat-label">Unhealthy Responders</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background-color: #3b82f6">
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zM4 18v-6h2.5l6 6H4zm16.5-9.5L19 7l-7.5 7.5L9 12l-2 2 5.5 5.5L22 10l-1.5-1.5z"
              />
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.responders.total }}</div>
            <div class="stat-label">Total Responders</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background-color: #f59e0b">
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"
              />
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.jobs.total }}</div>
            <div class="stat-label">Total Jobs</div>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="charts-grid">
        <!-- Responder Status Distribution -->
        <div class="card chart-card">
          <div class="chart-header">
            <h3>Responder Status</h3>
            <div class="chart-actions">
              <button @click="refreshResponderChart" class="btn-icon" title="Refresh">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"
                  />
                </svg>
              </button>
            </div>
          </div>
          <DoughnutChart :data="responderStatusChartData" />
        </div>

        <!-- Job Status Distribution -->
        <div class="card chart-card">
          <div class="chart-header">
            <h3>Job Status Distribution</h3>
            <div class="chart-actions">
              <button @click="refreshJobsChart" class="btn-icon" title="Refresh">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"
                  />
                </svg>
              </button>
            </div>
          </div>
          <DoughnutChart :data="jobsChartData" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { dashboardService } from '../services/dashboard'
import DoughnutChart from '../components/charts/DoughnutChart.vue'
import type { DashboardStats, PieChartData } from '../types'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref<boolean>(false)
const stats = ref<DashboardStats>({
  responders: { online: 0, total: 0 },
  jobs: { total: 0, completed: 0, pending: 0, failed: 0 },
})

const responderStatusChartData = ref<PieChartData>({
  labels: ['Healthy', 'Unhealthy'],
  datasets: [
    {
      data: [0, 0],
      backgroundColor: ['#10b981', '#ef4444'],
      borderWidth: 3,
      borderColor: '#ffffff',
    },
  ],
})

const jobsChartData = ref<PieChartData>({
  labels: ['Completed', 'Pending', 'Failed'],
  datasets: [
    {
      data: [0, 0, 0],
      backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
      borderWidth: 3,
      borderColor: '#ffffff',
    },
  ],
})

const handleLogout = (): void => {
  authStore.logout()
  router.push('/login')
}

const loadStats = async (): Promise<void> => {
  try {
    const data = await dashboardService.getStats()
    stats.value = data
  } catch (error: any) {
    console.error('Failed to load stats:', error)
    if (error.status === 401) {
      authStore.handleAuthError()
    }
  }
}

const loadResponderChart = async (): Promise<void> => {
  try {
    const data = await dashboardService.getResponderStatusChart()
    responderStatusChartData.value = data
  } catch (error) {
    console.error('Failed to load responder status chart:', error)
  }
}

const loadJobsChart = async (): Promise<void> => {
  try {
    const data = await dashboardService.getJobsChart()
    jobsChartData.value = data
  } catch (error) {
    console.error('Failed to load jobs chart:', error)
  }
}

const refreshData = async (): Promise<void> => {
  loading.value = true
  try {
    await Promise.all([loadStats(), loadResponderChart(), loadJobsChart()])
  } finally {
    loading.value = false
  }
}

const refreshResponderChart = (): void => {
  loadResponderChart()
}

const refreshJobsChart = (): void => {
  loadJobsChart()
}

onMounted(() => {
  refreshData()
})
</script>

<style scoped>
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.dashboard-header h1 {
  color: #1f2937;
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #f3f4f6;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 28px;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 4px;
}

.stat-label {
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
}

.charts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 32px;
}

.chart-card {
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #f3f4f6;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-header h3 {
  margin: 0;
  color: #1f2937;
  font-size: 18px;
  font-weight: 600;
}

.chart-actions {
  display: flex;
  gap: 8px;
}

.btn-icon {
  background: none;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 8px;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-icon:hover {
  background-color: #f9fafb;
  border-color: #d1d5db;
  color: #374151;
}

@media (max-width: 1024px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .stat-card {
    padding: 16px;
  }

  .chart-card {
    padding: 16px;
  }
}
</style>
