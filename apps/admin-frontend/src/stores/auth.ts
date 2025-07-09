import { defineStore } from "pinia";
import { ref } from "vue";
import { authService } from "../services/auth";
import { storageManager } from "../utils/storage";
import type { User, LoginCredentials } from "../types";

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);
  const isAuthenticated = ref<boolean>(false);

  const initializeAuth = (): void => {
    try {
      const storedToken = storageManager.getToken();
      const storedUser = storageManager.getUser();

      if (storedToken && storedUser) {
        token.value = storedToken;
        user.value = storedUser;
        isAuthenticated.value = true;
        console.log("Auth restored from storage:", { user: storedUser.email });
      } else {
        console.log("No stored auth found");
      }
    } catch (error) {
      console.error("Failed to initialize auth:", error);
      // Don't clear storage on initialization error
    }
  };

  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      const response = await authService.login(credentials);

      token.value = response.accessToken;
      // Create user object if not provided by API
      const userInfo = response.user || {
        id: 1,
        email: credentials.email,
        name: credentials.email.split("@")[0],
        role: "admin",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
      };
      user.value = userInfo;
      isAuthenticated.value = true;

      // Store in localStorage
      storageManager.setToken(response.accessToken);
      storageManager.setUser(userInfo);

      console.log("Login successful:", { user: userInfo.email });
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = (): void => {
    user.value = null;
    token.value = null;
    isAuthenticated.value = false;

    // Clear localStorage
    storageManager.clear();
  };

  const handleAuthError = (): void => {
    logout();
    // Redirect will be handled by router guard
  };

  return {
    user,
    token,
    isAuthenticated,
    initializeAuth,
    login,
    logout,
    handleAuthError,
  };
});
