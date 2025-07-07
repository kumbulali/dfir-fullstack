<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1>AIR Server</h1>
        <p>Sign in to your dashboard</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label class="form-label" for="email">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            class="form-input"
            placeholder="Enter your email"
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
            placeholder="Enter your password"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="tenantId">Tenant ID</label>
          <input
            id="tenantId"
            v-model="form.tenantId"
            type="text"
            class="form-input"
            placeholder="Enter your tenant ID"
            required
          />
        </div>

        <button type="submit" class="btn btn-primary login-btn" :disabled="loading">
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </button>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </form>

      <div class="login-demo">
        <p><strong>API Connection Status:</strong></p>
        <div class="api-status">
          <div class="status-item">
            <span class="status-dot" :class="{ online: !networkError }"></span>
            <span>Network Connection</span>
          </div>
        </div>
        <div class="api-info">
          <p><strong>Required API Servers:</strong></p>
          <p>• Auth: http://localhost:3000</p>
          <p>• Responders: http://localhost:3001</p>
          <p>• Jobs: http://localhost:3002</p>
          <p><small>Make sure all servers are running and accessible</small></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import type { LoginCredentials } from '../types'

const router = useRouter()
const authStore = useAuthStore()

const form = ref<LoginCredentials>({
  email: '',
  password: '',
  tenantId: '',
})

const loading = ref<boolean>(false)
const error = ref<string>('')
const networkError = ref<boolean>(false)

const handleLogin = async (): Promise<void> => {
  try {
    loading.value = true
    error.value = ''
    networkError.value = false

    await authStore.login(form.value)
    router.push('/')
  } catch (err: any) {
    console.error('Login error:', err)

    if (err.status === 0 || err.message.includes('Network error')) {
      networkError.value = true
      error.value =
        'Cannot connect to API servers. Please ensure they are running on the correct ports.'
    } else if (err.status === 401) {
      error.value = 'Invalid credentials. Please check your email, password, and tenant ID.'
    } else if (err.status === 404) {
      error.value =
        'API endpoint not found. Please check if the auth server is running on port 3000.'
    } else {
      error.value = err.message || 'Login failed. Please try again.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

.login-demo {
  background: #f9fafb;
  border-radius: 8px;
  padding: 16px;
  font-size: 14px;
  color: #6b7280;
  text-align: center;
}

.login-demo p {
  margin: 4px 0;
}

.login-demo strong {
  color: #374151;
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

.api-info {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.api-info p {
  margin: 4px 0;
}

.api-info small {
  color: #9ca3af;
}
</style>
