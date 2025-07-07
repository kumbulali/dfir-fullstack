<template>
  <Teleport to="body">
    <div class="toast-container">
      <Transition v-for="notification in notifications" :key="notification.id" name="toast" appear>
        <div
          class="toast"
          :class="[`toast-${notification.type}`, { 'toast-dismissible': notification.dismissible }]"
        >
          <div class="toast-icon">
            <!-- Success Icon -->
            <svg
              v-if="notification.type === 'success'"
              width="20"
              height="20"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
              />
            </svg>
            <!-- Error Icon -->
            <svg
              v-else-if="notification.type === 'error'"
              width="20"
              height="20"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
              />
            </svg>
            <!-- Warning Icon -->
            <svg
              v-else-if="notification.type === 'warning'"
              width="20"
              height="20"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
            </svg>
            <!-- Info Icon -->
            <svg v-else width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
              />
            </svg>
          </div>

          <div class="toast-content">
            <div v-if="notification.title" class="toast-title">
              {{ notification.title }}
            </div>
            <div class="toast-message">
              {{ notification.message }}
            </div>
          </div>

          <button
            v-if="notification.dismissible"
            @click="removeNotification(notification.id)"
            class="toast-close"
          >
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
              />
            </svg>
          </button>
        </div>
      </Transition>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  duration?: number
  dismissible?: boolean
}

const notifications = ref<Notification[]>([])
const timeouts = new Map<string, NodeJS.Timeout>()

const addNotification = (notification: Omit<Notification, 'id'>) => {
  const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
  const newNotification: Notification = {
    id,
    dismissible: true,
    duration: 5000,
    ...notification,
  }

  notifications.value.push(newNotification)

  // Auto remove after duration
  if (newNotification.duration && newNotification.duration > 0) {
    const timeout = setTimeout(() => {
      removeNotification(id)
    }, newNotification.duration)
    timeouts.set(id, timeout)
  }
}

const removeNotification = (id: string) => {
  const index = notifications.value.findIndex((n) => n.id === id)
  if (index > -1) {
    notifications.value.splice(index, 1)
  }

  // Clear timeout if exists
  const timeout = timeouts.get(id)
  if (timeout) {
    clearTimeout(timeout)
    timeouts.delete(id)
  }
}

const clearAll = () => {
  notifications.value = []
  timeouts.forEach((timeout) => clearTimeout(timeout))
  timeouts.clear()
}

// Global notification methods
const showSuccess = (message: string, title?: string, options?: Partial<Notification>) => {
  addNotification({ type: 'success', message, title, ...options })
}

const showError = (message: string, title?: string, options?: Partial<Notification>) => {
  addNotification({ type: 'error', message, title, ...options })
}

const showWarning = (message: string, title?: string, options?: Partial<Notification>) => {
  addNotification({ type: 'warning', message, title, ...options })
}

const showInfo = (message: string, title?: string, options?: Partial<Notification>) => {
  addNotification({ type: 'info', message, title, ...options })
}

// Expose methods globally
defineExpose({
  addNotification,
  removeNotification,
  clearAll,
  showSuccess,
  showError,
  showWarning,
  showInfo,
})

onUnmounted(() => {
  timeouts.forEach((timeout) => clearTimeout(timeout))
  timeouts.clear()
})
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  min-width: 320px;
  max-width: 480px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow:
    0 10px 25px rgba(0, 0, 0, 0.1),
    0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  pointer-events: auto;
  position: relative;
  overflow: hidden;
}

.toast::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
}

.toast-success {
  border-left-color: #10b981;
}

.toast-success::before {
  background-color: #10b981;
}

.toast-success .toast-icon {
  color: #10b981;
  background-color: #d1fae5;
}

.toast-error {
  border-left-color: #ef4444;
}

.toast-error::before {
  background-color: #ef4444;
}

.toast-error .toast-icon {
  color: #ef4444;
  background-color: #fee2e2;
}

.toast-warning {
  border-left-color: #f59e0b;
}

.toast-warning::before {
  background-color: #f59e0b;
}

.toast-warning .toast-icon {
  color: #f59e0b;
  background-color: #fef3c7;
}

.toast-info {
  border-left-color: #3b82f6;
}

.toast-info::before {
  background-color: #3b82f6;
}

.toast-info .toast-icon {
  color: #3b82f6;
  background-color: #dbeafe;
}

.toast-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}

.toast-content {
  flex: 1;
  min-width: 0;
}

.toast-title {
  font-weight: 600;
  font-size: 14px;
  color: #1f2937;
  margin-bottom: 4px;
  line-height: 1.4;
}

.toast-message {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.4;
  word-wrap: break-word;
}

.toast-close {
  background: none;
  border: none;
  cursor: pointer;
  color: #9ca3af;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
  flex-shrink: 0;
  margin-top: 2px;
}

.toast-close:hover {
  color: #6b7280;
  background-color: #f3f4f6;
}

/* Animations */
.toast-enter-active {
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.toast-leave-active {
  transition: all 0.2s ease-in;
}

.toast-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

@media (max-width: 640px) {
  .toast-container {
    top: 10px;
    right: 10px;
    left: 10px;
  }

  .toast {
    min-width: auto;
    max-width: none;
  }
}
</style>
