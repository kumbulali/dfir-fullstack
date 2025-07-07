<template>
  <div id="app">
    <Suspense>
      <router-view />
      <template #fallback>
        <LoadingSpinner message="Loading page..." />
      </template>
    </Suspense>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'
import LoadingSpinner from './components/LoadingSpinner.vue'

const authStore = useAuthStore()

// Initialize auth state from localStorage
onMounted(() => {
  authStore.initializeAuth()
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: #f5f5f5;
}

#app {
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 24px;
  margin-bottom: 24px;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background-color: #2563eb;
}

.btn-secondary {
  background-color: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background-color: #4b5563;
}

.btn-danger {
  background-color: #ef4444;
  color: white;
}

.btn-danger:hover {
  background-color: #dc2626;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #374151;
}

.form-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.error-message {
  color: #ef4444;
  font-size: 14px;
  margin-top: 8px;
}

.success-message {
  color: #10b981;
  font-size: 14px;
  margin-top: 8px;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
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
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.stat-number {
  font-size: 32px;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 8px;
}

.stat-label {
  color: #6b7280;
  font-size: 14px;
}

.table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.table th,
.table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.table th {
  background-color: #f9fafb;
  font-weight: 600;
  color: #374151;
}

.table tr:hover {
  background-color: #f9fafb;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.status-online {
  background-color: #d1fae5;
  color: #065f46;
}

.status-offline {
  background-color: #fee2e2;
  color: #991b1b;
}

.navbar {
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 0 20px;
}

.navbar-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 64px;
}

.navbar-brand {
  font-size: 20px;
  font-weight: bold;
  color: #1f2937;
  text-decoration: none;
}

.navbar-nav {
  display: flex;
  list-style: none;
  gap: 32px;
}

.navbar-nav a {
  text-decoration: none;
  color: #6b7280;
  font-weight: 500;
  transition: color 0.2s;
}

.navbar-nav a:hover,
.navbar-nav a.router-link-active {
  color: #3b82f6;
}

.navbar-user {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-info {
  font-size: 14px;
  color: #6b7280;
}

@media (max-width: 768px) {
  .navbar-nav {
    display: none;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .table {
    font-size: 14px;
  }

  .table th,
  .table td {
    padding: 8px;
  }
}
</style>
