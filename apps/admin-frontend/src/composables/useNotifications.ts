import { ref } from "vue";

export interface NotificationOptions {
  title?: string;
  duration?: number;
  dismissible?: boolean;
}

// Global notification state
const notificationComponent = ref<any>(null);

export const useNotifications = () => {
  const setNotificationComponent = (component: any) => {
    notificationComponent.value = component;
  };

  const showSuccess = (message: string, title?: string, options?: NotificationOptions) => {
    if (notificationComponent.value) {
      notificationComponent.value.showSuccess(message, title, options);
    }
  };

  const showError = (message: string, title?: string, options?: NotificationOptions) => {
    if (notificationComponent.value) {
      notificationComponent.value.showError(message, title, options);
    }
  };

  const showWarning = (message: string, title?: string, options?: NotificationOptions) => {
    if (notificationComponent.value) {
      notificationComponent.value.showWarning(message, title, options);
    }
  };

  const showInfo = (message: string, title?: string, options?: NotificationOptions) => {
    if (notificationComponent.value) {
      notificationComponent.value.showInfo(message, title, options);
    }
  };

  const clearAll = () => {
    if (notificationComponent.value) {
      notificationComponent.value.clearAll();
    }
  };

  return {
    setNotificationComponent,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    clearAll,
  };
};
