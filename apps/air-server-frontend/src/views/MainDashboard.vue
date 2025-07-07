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
      <h1 style="margin-bottom: 32px; color: #1f2937">Dashboard</h1>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-number">{{ stats.responders.online }}</div>
          <div class="stat-label">Online Responders</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ stats.responders.total }}</div>
          <div class="stat-label">Total Responders</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ stats.jobs.total }}</div>
          <div class="stat-label">Total Jobs</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ stats.jobs.completed }}</div>
          <div class="stat-label">Completed Jobs</div>
        </div>
      </div>

      <!-- Charts -->
      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 32px; margin-bottom: 32px">
        <div class="card">
          <h3 style="margin-bottom: 24px; color: #1f2937">Responder Activity</h3>
          <div class="chart-container">
            <canvas ref="responderChart" width="400" height="200"></canvas>
          </div>
        </div>

        <div class="card">
          <h3 style="margin-bottom: 24px; color: #1f2937">Job Status Distribution</h3>
          <div class="chart-container">
            <canvas ref="jobsChart" width="300" height="300"></canvas>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { dashboardService } from '../services/dashboard'
import type { DashboardStats } from '../types'

const router = useRouter()
const authStore = useAuthStore()

const stats = ref<DashboardStats>({
  responders: { online: 0, total: 0 },
  jobs: { total: 0, completed: 0, pending: 0, failed: 0 },
})

const responderChart = ref<HTMLCanvasElement | null>(null)
const jobsChart = ref<HTMLCanvasElement | null>(null)

const handleLogout = (): void => {
  authStore.logout()
  router.push('/login')
}

const loadStats = async (): Promise<void> => {
  try {
    const data = await dashboardService.getStats()
    stats.value = data
  } catch (error) {
    console.error('Failed to load stats:', error)
  }
}

const drawResponderChart = async (): Promise<void> => {
  try {
    const chartData = await dashboardService.getResponderChart()
    const canvas = responderChart.value
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Simple line chart implementation
    const width = canvas.width
    const height = canvas.height
    const padding = 40

    ctx.clearRect(0, 0, width, height)

    // Draw grid
    ctx.strokeStyle = '#e5e7eb'
    ctx.lineWidth = 1

    for (let i = 0; i <= 5; i++) {
      const y = padding + ((height - 2 * padding) * i) / 5
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
      ctx.stroke()
    }

    // Draw online responders line
    ctx.strokeStyle = '#3b82f6'
    ctx.lineWidth = 3
    ctx.beginPath()

    const onlineData = chartData.datasets[0].data
    for (let i = 0; i < onlineData.length; i++) {
      const x = padding + ((width - 2 * padding) * i) / (onlineData.length - 1)
      const y = height - padding - ((height - 2 * padding) * onlineData[i]) / 50

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.stroke()

    // Draw labels
    ctx.fillStyle = '#6b7280'
    ctx.font = '12px sans-serif'
    ctx.textAlign = 'center'

    chartData.labels.forEach((label, i) => {
      const x = padding + ((width - 2 * padding) * i) / (chartData.labels.length - 1)
      ctx.fillText(label, x, height - 10)
    })
  } catch (error) {
    console.error('Failed to draw responder chart:', error)
  }
}

const drawJobsChart = async (): Promise<void> => {
  try {
    const chartData = await dashboardService.getJobsChart()
    const canvas = jobsChart.value
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Simple pie chart implementation
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(centerX, centerY) - 40

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const data = chartData.datasets[0].data
    const colors = chartData.datasets[0].backgroundColor
    const total = data.reduce((sum, value) => sum + value, 0)

    let currentAngle = -Math.PI / 2

    data.forEach((value, index) => {
      const sliceAngle = (value / total) * 2 * Math.PI

      ctx.fillStyle = colors[index]
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle)
      ctx.closePath()
      ctx.fill()

      // Draw label
      const labelAngle = currentAngle + sliceAngle / 2
      const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7)
      const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7)

      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 14px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(value.toString(), labelX, labelY)

      currentAngle += sliceAngle
    })
  } catch (error) {
    console.error('Failed to draw jobs chart:', error)
  }
}

onMounted(async () => {
  await loadStats()
  await nextTick()
  drawResponderChart()
  drawJobsChart()
})
</script>

<style scoped>
.chart-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
}

.activity-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 14px;
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 4px;
}

.activity-time {
  font-size: 14px;
  color: #6b7280;
}

@media (max-width: 768px) {
  .navbar-content {
    flex-direction: column;
    height: auto;
    padding: 16px 0;
  }

  .navbar-nav {
    margin: 16px 0;
  }

  div[style*='grid-template-columns: 2fr 1fr'] {
    grid-template-columns: 1fr !important;
  }
}
</style>
