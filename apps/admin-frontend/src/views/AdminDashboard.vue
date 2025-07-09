<template>
  <div>
    <nav class="navbar">
      <div class="navbar-content">
        <router-link to="/" class="navbar-brand">AIR Admin</router-link>
        <ul class="navbar-nav">
          <li><router-link to="/">Dashboard</router-link></li>
          <li><router-link to="/tenants">Tenants</router-link></li>
        </ul>
        <div class="navbar-user">
          <span class="user-info">{{ authStore.user?.email }}</span>
          <button @click="handleLogout" class="btn btn-secondary">Logout</button>
        </div>
      </div>
    </nav>

    <div class="container" style="padding-top: 32px">
      <div class="dashboard-header">
        <h1>System Overview</h1>
        <button @click="refreshData" class="btn btn-primary" :disabled="loading">
          {{ loading ? "Refreshing..." : "Refresh Data" }}
        </button>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon" style="background-color: #3b82f6">
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
              />
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ formatters.formatNumber(stats.totalTenants) }}</div>
            <div class="stat-label">Total Tenants</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background-color: #f59e0b">
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ formatters.formatNumber(stats.totalResponders) }}</div>
            <div class="stat-label">Total Responders</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background-color: #8b5cf6">
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-number">
              {{ formatters.formatNumber(stats.healthyResponders || 0) }}
            </div>
            <div class="stat-label">Healthy Responders</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background-color: #10b981">
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-number">
              {{ formatters.formatPercentage(stats.healthyPercentage || 0) }}
            </div>
            <div class="stat-label">Health Percentage</div>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="charts-grid">
        <!-- Responder Health Overview -->
        <div class="card chart-card">
          <div class="chart-header">
            <h3>Responder Health Status</h3>
          </div>
          <DoughnutChart
            :data="responderHealthChartData"
            :center-text="formatters.formatNumber(stats.totalResponders)"
            center-subtext="Total Responders"
          />
        </div>

        <!-- Job Status Distribution -->
        <div class="card chart-card">
          <div class="chart-header">
            <h3>Job Status Distribution</h3>
          </div>
          <DoughnutChart
            :data="jobStatusChartData"
            :center-text="formatters.formatNumber(stats.totalJobs)"
            center-subtext="Total Jobs"
          />
        </div>
      </div>

      <!-- Tenants Overview -->
      <div class="card">
        <div class="table-header">
          <h3>Tenants Overview</h3>
          <router-link to="/tenants" class="btn btn-primary">Manage Tenants</router-link>
        </div>

        <div v-if="tenants.length === 0" class="empty-state">
          <p>No tenants available</p>
        </div>

        <table v-else class="table">
          <thead>
            <tr>
              <th>Tenant Name</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="tenant in tenants" :key="tenant.id">
              <td>
                <div class="tenant-name">{{ tenant.name }}</div>
              </td>
              <td>
                <span
                  class="status-badge"
                  :class="tenant.status === 'active' ? 'status-active' : 'status-inactive'"
                >
                  {{ tenant.status === "active" ? "Active" : "Inactive" }}
                </span>
              </td>
              <td>
                <router-link :to="`/tenants/${tenant.id}`" class="btn btn-sm btn-primary">
                  Manage Users
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { dashboardService } from "../services/dashboard";
import { tenantsService } from "../services/tenants";
import { formatters } from "../utils/formatters";
import DoughnutChart from "../components/charts/DoughnutChart.vue";
import type { DashboardStats, Tenant, PieChartData } from "../types";

const router = useRouter();
const authStore = useAuthStore();

const loading = ref<boolean>(false);
const stats = ref<DashboardStats>({
  totalTenants: 0,
  totalResponders: 0,
  healthyResponders: 0,
  healthyPercentage: 0,
  totalJobs: 0,
  pendingJobs: 0,
  completedJobs: 0,
  failedJobs: 0,
});

const tenants = ref<Tenant[]>([]);

const responderHealthChartData = computed(
  (): PieChartData => ({
    labels: ["Healthy", "Unhealthy"],
    datasets: [
      {
        data: [
          stats.value.healthyResponders,
          stats.value.totalResponders - stats.value.healthyResponders,
        ],
        backgroundColor: ["#10b981", "#ef4444"],
        borderColor: "#ffffff",
        borderWidth: 3,
      },
    ],
  }),
);

const jobStatusChartData = computed(
  (): PieChartData => ({
    labels: ["Completed", "Pending", "Failed"],
    datasets: [
      {
        data: [stats.value.completedJobs, stats.value.pendingJobs, stats.value.failedJobs],
        backgroundColor: ["#10b981", "#f59e0b", "#ef4444"],
        borderColor: "#ffffff",
        borderWidth: 3,
      },
    ],
  }),
);

const handleLogout = (): void => {
  authStore.logout();
  router.push("/login");
};

const loadStats = async (): Promise<void> => {
  try {
    const data = await dashboardService.getStats();
    stats.value = data;
  } catch (error: any) {
    console.error("Failed to load stats:", error);
    if (error.status === 401) {
      authStore.handleAuthError();
    }
  }
};

const loadTenants = async (): Promise<void> => {
  try {
    const response = await tenantsService.getTenants(1, 10); // Load first 10 tenants for overview
    tenants.value = response.data;
  } catch (error: any) {
    console.error("Failed to load tenants:", error);
  }
};

const refreshData = async (): Promise<void> => {
  loading.value = true;
  try {
    await Promise.all([loadStats(), loadTenants()]);
  } finally {
    loading.value = false;
  }
};

const getHealthPercentage = (tenant: Tenant): number => {
  if (tenant.responderCount === 0) return 0;
  return Math.round((tenant.healthyResponderCount / tenant.responderCount) * 100);
};

const getHealthClass = (percentage: number): string => {
  if (percentage >= 80) return "health-excellent";
  if (percentage >= 60) return "health-good";
  if (percentage >= 40) return "health-warning";
  return "health-critical";
};

onMounted(() => {
  refreshData();
});
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
  margin-bottom: 20px;
}

.chart-header h3 {
  margin: 0;
  color: #1f2937;
  font-size: 18px;
  font-weight: 600;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 0 24px;
  padding-top: 24px;
}

.table-header h3 {
  margin: 0;
  color: #1f2937;
  font-size: 18px;
  font-weight: 600;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #6b7280;
}

.tenant-name {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.tenant-description {
  color: #6b7280;
  font-size: 12px;
}

.count-display {
  font-weight: 600;
  font-size: 18px;
  color: #1f2937;
  text-align: center;
}

.health-indicator {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 80px;
}

.health-bar {
  height: 6px;
  background-color: #f3f4f6;
  border-radius: 3px;
  overflow: hidden;
}

.health-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.health-text {
  font-size: 12px;
  color: #6b7280;
  text-align: center;
}

.health-excellent {
  background-color: #10b981;
}

.health-good {
  background-color: #f59e0b;
}

.health-warning {
  background-color: #f97316;
}

.health-critical {
  background-color: #ef4444;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.status-active {
  background-color: #d1fae5;
  color: #065f46;
}

.status-inactive {
  background-color: #fee2e2;
  color: #991b1b;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
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

  .table-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
}
</style>
