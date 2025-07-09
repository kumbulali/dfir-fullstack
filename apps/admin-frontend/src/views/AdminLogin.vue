<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1>AIR Server Admin</h1>
        <p>Master dashboard for system administration</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label class="form-label" for="email">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            class="form-input"
            placeholder="Enter admin email"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="password">Password</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            class="form-input"
            placeholder="Enter admin password"
            required
          />
        </div>

        <button type="submit" class="btn btn-primary login-btn" :disabled="loading">
          {{ loading ? "Signing in..." : "Sign In" }}
        </button>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </form>

      <div class="login-info">
        <p><strong>System Health:</strong></p>
        <div class="api-status">
          <div class="status-item">
            <span class="status-dot" :class="{ online: systemHealthy }"></span>
            <span>API Server (localhost:4000)</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { dashboardService } from "../services/dashboard";
import type { LoginCredentials, HealthStatus } from "../types";

const router = useRouter();
const authStore = useAuthStore();

const form = ref<LoginCredentials>({
  email: "",
  password: "",
});

const loading = ref<boolean>(false);
const error = ref<string>("");
const systemHealthy = ref<boolean>(false);
const healthData = ref<HealthStatus | null>(null);

const handleLogin = async (): Promise<void> => {
  try {
    loading.value = true;
    error.value = "";

    await authStore.login(form.value);
    router.push("/");
  } catch (err: any) {
    console.error("Login error:", err);

    if (err.status === 0 || err.message.includes("Network error")) {
      error.value = "Cannot connect to API server. Please ensure it is running on localhost:4000.";
    } else if (err.status === 401) {
      error.value = "Invalid admin credentials. Please check your email and password.";
    } else if (err.status === 404) {
      error.value = "API endpoint not found. Please check if the server is running.";
    } else {
      error.value = err.message || "Login failed. Please try again.";
    }
  } finally {
    loading.value = false;
  }
};

const checkSystemHealth = async (): Promise<void> => {
  try {
    const health = await dashboardService.getHealth();
    healthData.value = health;
    systemHealthy.value = health.success;
  } catch (error) {
    console.error("Health check failed:", error);
    systemHealthy.value = false;
  }
};

onMounted(() => {
  checkSystemHealth();
  // Check health every 30 seconds
  setInterval(checkSystemHealth, 30000);
});
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%);
  padding: 20px;
}

.login-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 400px;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-header h1 {
  font-size: 28px;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 8px;
}

.login-header p {
  color: #6b7280;
  font-size: 16px;
}

.login-form {
  margin-bottom: 24px;
}

.login-btn {
  width: 100%;
  margin-top: 8px;
}

.login-info {
  background: #f9fafb;
  border-radius: 8px;
  padding: 16px;
  font-size: 14px;
  color: #6b7280;
  text-align: center;
}

.api-status {
  margin: 12px 0;
}

.status-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 8px 0;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #ef4444;
}

.status-dot.online {
  background-color: #10b981;
}

.health-details {
  margin-top: 8px;
  color: #9ca3af;
}
</style>
