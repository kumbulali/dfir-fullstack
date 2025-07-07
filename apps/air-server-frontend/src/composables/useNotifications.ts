import { ref } from 'vue'

export interface NotificationOptions {
  title?: string
  duration?: number
  dismissible?: boolean
}

// Global notification state
const notificationComponent = ref<any>(null)

export const useNotifications = () => {
  const setNotificationComponent = (component: any) => {
    notificationComponent.value = component
  }

  const showSuccess = (message: string, options?: NotificationOptions) => {
    if (notificationComponent.value) {
      notificationComponent.value.showSuccess(message, options?.title, options)
    }
  }

  const showError = (message: string, options?: NotificationOptions) => {
    if (notificationComponent.value) {
      notificationComponent.value.showError(message, options?.title, options)
    }
  }

  const showWarning = (message: string, options?: NotificationOptions) => {
    if (notificationComponent.value) {
      notificationComponent.value.showWarning(message, options?.title, options)
    }
  }

  const showInfo = (message: string, options?: NotificationOptions) => {
    if (notificationComponent.value) {
      notificationComponent.value.showInfo(message, options?.title, options)
    }
  }

  const clearAll = () => {
    if (notificationComponent.value) {
      notificationComponent.value.clearAll()
    }
  }

  return {
    setNotificationComponent,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    clearAll,
  }
}
