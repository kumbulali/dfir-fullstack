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
        <p><strong>Demo Credentials:</strong></p>
        <p>Email: admin@example.com</p>
        <p>Password: password</p>
        <p>Tenant ID: demo-tenant</p>
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

const handleLogin = async (): Promise<void> => {
  try {
    loading.value = true
    error.value = ''

    await authStore.login(form.value)
    router.push('/')
  } catch (err: any) {
    error.value = err.message
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
</style>
