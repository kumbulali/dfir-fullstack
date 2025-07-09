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
          <span class="user-info">{{ user?.email }}</span>
          <button @click="handleLogout" class="btn btn-secondary">Logout</button>
        </div>
      </div>
    </nav>

    <div class="container" style="padding-top: 32px">
      <div class="page-header">
        <div class="header-left">
          <router-link to="/tenants" class="back-link">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 12H5m7-7l-7 7 7 7" />
            </svg>
            Back to Tenants
          </router-link>
          <div v-if="tenant" class="tenant-header">
            <h1>{{ tenant.name }}</h1>
            <span
              class="status-badge"
              :class="tenant.status === 'active' ? 'status-active' : 'status-inactive'"
            >
              {{ tenant.status === "active" ? "Active" : "Inactive" }}
            </span>
          </div>
        </div>
        <div class="header-actions">
          <button @click="openCreateUserModal" class="btn btn-primary">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 4v16m8-8H4" />
            </svg>
            Add User
          </button>
          <button @click="refreshData" class="btn btn-secondary" :disabled="loading">
            {{ loading ? "Refreshing..." : "Refresh" }}
          </button>
        </div>
      </div>

      <div v-if="loading && !tenant" class="loading">
        <LoadingSpinner message="Loading tenant details..." />
      </div>

      <div v-else-if="tenant">
        <!-- Tenant Info Cards -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon" style="background-color: #10b981">
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ tenantStats?.totalUsers }}</div>
              <div class="stat-label">Total Users</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background-color: #f59e0b">
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ tenantStats?.totalResponders }}</div>
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
                {{ tenantStats?.healthyResponders }}
              </div>
              <div class="stat-label">Healthy Responders</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background-color: #3b82f6">
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ formatters.formatRelativeTime(tenant.createdAt) }}</div>
              <div class="stat-label">Created</div>
            </div>
          </div>
        </div>

        <!-- Users Table -->
        <div class="card">
          <div class="table-header">
            <h3>Users ({{ users.length }})</h3>
            <div class="header-actions">
              <button @click="openCreateUserModal" class="btn btn-primary btn-sm">Add User</button>
            </div>
          </div>

          <div v-if="users.length === 0" class="empty-state">
            <div class="empty-icon">
              <svg width="64" height="64" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3>No users found</h3>
            <p>Get started by adding the first user to this tenant</p>
            <button @click="openCreateUserModal" class="btn btn-primary">Add First User</button>
          </div>

          <table v-else class="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Email</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.id">
                <td>{{ user.id }}</td>
                <td>
                  <div class="user-email">{{ user.email }}</div>
                </td>
                <td>
                  <span class="status-badge" :class="true ? 'status-active' : 'status-inactive'">
                    {{ true ? "Active" : "Inactive" }}
                  </span>
                </td>
                <td>{{ formatters.formatRelativeTime(user.createdAt) }}</td>
                <td>
                  <div class="actions-cell">
                    <button
                      @click="openEditUserModal(user)"
                      class="btn-action btn-edit"
                      title="Edit user"
                    >
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      @click="confirmDeleteUser(user)"
                      class="btn-action btn-delete"
                      :disabled="deletingUserId === user.id"
                      title="Delete user"
                    >
                      <svg
                        v-if="deletingUserId !== user.id"
                        width="16"
                        height="16"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
                        />
                      </svg>
                      <div v-else class="mini-spinner"></div>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Pagination -->
          <div v-if="usersMeta" class="pagination">
            <div class="pagination-info">
              Showing {{ usersMeta.itemCount }} of {{ usersMeta.totalItems }} users
            </div>
            <div class="pagination-controls">
              <button
                @click="loadUsersPage(usersMeta.currentPage - 1)"
                :disabled="usersMeta.currentPage <= 1"
                class="btn btn-secondary btn-sm"
              >
                Previous
              </button>
              <span class="page-info">
                Page {{ usersMeta.currentPage }} of {{ usersMeta.totalPages }}
              </span>
              <button
                @click="loadUsersPage(usersMeta.currentPage + 1)"
                :disabled="usersMeta.currentPage >= usersMeta.totalPages"
                class="btn btn-secondary btn-sm"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        <!-- Create/Edit User Modal -->
        <div v-if="showUserModal" class="modal-overlay" @click="closeUserModal">
          <div class="modal-content" @click.stop>
            <div class="modal-header">
              <h3>{{ isEditingUser ? "Edit User" : "Add New User" }}</h3>
              <button @click="closeUserModal" class="modal-close">&times;</button>
            </div>

            <form @submit.prevent="saveUser" class="modal-body">
              <div class="form-group">
                <label class="form-label">Email</label>
                <input
                  v-model="userForm.email"
                  type="email"
                  class="form-input"
                  placeholder="Enter user email"
                  required
                />
              </div>

              <div class="form-group">
                <label class="form-label">Password</label>
                <input
                  v-model="userForm.password"
                  type="password"
                  class="form-input"
                  placeholder="Enter user password"
                  required
                />
              </div>

              <div class="modal-footer">
                <button type="button" @click="closeUserModal" class="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" class="btn btn-primary" :disabled="savingUser">
                  {{ savingUser ? "Saving..." : isEditingUser ? "Update User" : "Create User" }}
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Delete User Confirmation Modal -->
        <div v-if="showDeleteUserModal" class="modal-overlay" @click="closeDeleteUserModal">
          <div class="modal-content delete-modal" @click.stop>
            <div class="modal-header">
              <h3>Confirm User Deletion</h3>
              <button @click="closeDeleteUserModal" class="modal-close">&times;</button>
            </div>

            <div class="modal-body">
              <div class="warning-container">
                <div class="warning-icon">
                  <svg width="48" height="48" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
                  </svg>
                </div>
                <div class="warning-content">
                  <h4>Are you sure you want to delete this user?</h4>
                  <p>This action will permanently remove the user from the tenant.</p>

                  <div v-if="userToDelete" class="user-details">
                    <div class="detail-row">
                      <span class="detail-label">Name:</span>
                      <span class="detail-value">{{ userToDelete.name }}</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">Email:</span>
                      <span class="detail-value">{{ userToDelete.email }}</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">Role:</span>
                      <span class="detail-value">{{ userToDelete.role }}</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">Status:</span>
                      <span class="detail-value">{{
                        userToDelete.isActive ? "Active" : "Inactive"
                      }}</span>
                    </div>
                  </div>

                  <div class="warning-note">
                    <strong>Warning:</strong> This action cannot be undone.
                  </div>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button @click="closeDeleteUserModal" class="btn btn-secondary">Cancel</button>
              <button
                @click="deleteUser"
                class="btn btn-danger"
                :disabled="deletingUserId !== null"
              >
                {{ deletingUserId ? "Deleting..." : "Delete User" }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="error-state">
        <h2>Tenant not found</h2>
        <p>The requested tenant could not be found.</p>
        <router-link to="/tenants" class="btn btn-primary">Back to Tenants</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { tenantsService } from "../services/tenants";
import { usersService } from "../services/users";
import { formatters } from "../utils/formatters";
import LoadingSpinner from "../components/LoadingSpinner.vue";
import type {
  Tenant,
  User,
  PaginationMeta,
  CreateUserRequest,
  UpdateUserRequest,
  TenantStats,
} from "../types";
import { useNotifications } from "@/composables/useNotifications";

const { showSuccess, showError } = useNotifications();

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const user = authStore.user;

const tenantId = route.params.id as string;

const tenant = ref<Tenant | null>(null);
const tenantStats = ref<TenantStats | null>(null);
const users = ref<User[]>([]);
const usersMeta = ref<PaginationMeta | null>(null);
const loading = ref<boolean>(false);
const currentUsersPage = ref<number>(1);
const usersPerPage = ref<number>(20);

// User modal state
const showUserModal = ref<boolean>(false);
const isEditingUser = ref<boolean>(false);
const savingUser = ref<boolean>(false);
const userForm = ref<CreateUserRequest>({
  email: "",
  password: "",
  tenantId: tenantId,
});
const editingUser = ref<User | null>(null);

// Delete user modal state
const showDeleteUserModal = ref<boolean>(false);
const userToDelete = ref<User | null>(null);
const deletingUserId = ref<number | null>(null);

const handleLogout = (): void => {
  authStore.logout();
  router.push("/login");
};

const loadTenant = async (): Promise<void> => {
  try {
    const data = await tenantsService.getTenant(tenantId);
    const statsData = await tenantsService.getTenantStats(tenantId);
    tenant.value = data;
    tenantStats.value = statsData;
  } catch (error: any) {
    console.error("Failed to load tenant:", error);
    if (error.status === 401) {
      authStore.handleAuthError();
    }
  }
};

const loadUsers = async (page: number = 1): Promise<void> => {
  try {
    const response = await usersService.getUsers(page, usersPerPage.value, tenantId);
    users.value = response.data;
    usersMeta.value = response.meta;
    currentUsersPage.value = page;
  } catch (error: any) {
    console.error("Failed to load users:", error);
  }
};

const loadUsersPage = (page: number): void => {
  if (page >= 1 && usersMeta.value && page <= usersMeta.value.totalPages) {
    loadUsers(page);
  }
};

const refreshData = async (): Promise<void> => {
  loading.value = true;
  try {
    await Promise.all([loadTenant(), loadUsers(currentUsersPage.value)]);
  } finally {
    loading.value = false;
  }
};

const getHealthPercentage = (): number => {
  if (!tenant.value || tenant.value.responderCount === 0) return 0;
  return Math.round((tenant.value.healthyResponderCount / tenant.value.responderCount) * 100);
};

// User modal functions
const openCreateUserModal = (): void => {
  isEditingUser.value = false;
  userForm.value = {
    email: "",
    password: "",
    tenantId: tenantId,
  };
  showUserModal.value = true;
};

const openEditUserModal = (user: User): void => {
  isEditingUser.value = true;
  editingUser.value = user;
  userForm.value = {
    email: user.email,
    password: "", // Don't populate password for editing
    tenantId: tenantId,
  };
  showUserModal.value = true;
};

const closeUserModal = (): void => {
  showUserModal.value = false;
  editingUser.value = null;
};

const saveUser = async (): Promise<void> => {
  try {
    savingUser.value = true;

    if (isEditingUser.value && editingUser.value) {
      const updateData: UpdateUserRequest = {
        email: userForm.value.email,
        password: userForm.value.password,
        tenantId: userForm.value.tenantId,
      };
      // Only include password if it's provided
      if (userForm.value.password) {
        updateData.password = userForm.value.password;
      }
      await usersService.updateUser(editingUser.value.id, updateData, tenantId);
    } else {
      const createData: CreateUserRequest = {
        email: userForm.value.email,
        password: userForm.value.password,
        tenantId: tenantId,
      };
      await usersService.createUser(createData);
    }

    closeUserModal();
    showSuccess("User saved successfully!", "Success");
    await refreshData();
  } catch (error: any) {
    console.error("Failed to save user:", error);
    showError(`Failed to save user: ${error.message}`, "Error");
  } finally {
    savingUser.value = false;
  }
};

const deleteUser = async (): Promise<void> => {
  if (!userToDelete.value) return;

  try {
    deletingUserId.value = userToDelete.value.id;
    await usersService.deleteUser(userToDelete.value.id, tenantId);

    closeDeleteUserModal();
    showSuccess("User deleted successfully!", "Success");
    await refreshData();
  } catch (error: any) {
    console.error("Failed to delete user:", error);
    showError(`Failed to delete user: ${error.message}`, "Error");
  } finally {
    deletingUserId.value = null;
  }
};

const closeDeleteUserModal = (): void => {
  showDeleteUserModal.value = false;
  userToDelete.value = null;
};

const confirmDeleteUser = (user: User): void => {
  userToDelete.value = user;
  showDeleteUserModal.value = true;
};

onMounted(() => {
  refreshData();
});
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
}

.header-left {
  flex: 1;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #6b7280;
  text-decoration: none;
  font-size: 14px;
  margin-bottom: 16px;
  transition: color 0.2s ease;
}

.back-link:hover {
  color: #374151;
}

.tenant-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.tenant-header h1 {
  color: #1f2937;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.header-actions .btn {
  display: flex;
  align-items: center;
  gap: 8px;
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
  padding: 60px 20px;
}

.empty-icon {
  color: #d1d5db;
  margin-bottom: 16px;
}

.empty-state h3 {
  color: #1f2937;
  margin-bottom: 8px;
}

.empty-state p {
  color: #6b7280;
  margin-bottom: 24px;
}

.user-name {
  font-weight: 600;
  color: #1f2937;
}

.user-email {
  color: #6b7280;
  font-size: 14px;
}

.role-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  background-color: #e0e7ff;
  color: #3730a3;
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

.actions-cell {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.btn-action {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-action:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-edit {
  background-color: #dbeafe;
  color: #1d4ed8;
}

.btn-edit:hover:not(:disabled) {
  background-color: #bfdbfe;
}

.btn-delete {
  background-color: #fee2e2;
  color: #dc2626;
}

.btn-delete:hover:not(:disabled) {
  background-color: #fecaca;
}

.mini-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
}

.pagination-info {
  color: #6b7280;
  font-size: 14px;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-info {
  color: #374151;
  font-size: 14px;
  padding: 0 12px;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.delete-modal {
  max-width: 550px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  color: #1f2937;
  font-size: 20px;
  font-weight: 600;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6b7280;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.modal-close:hover {
  color: #374151;
  background-color: #f3f4f6;
}

.modal-body {
  padding: 24px;
}

.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

.form-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.form-checkbox input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: #3b82f6;
}

.checkbox-label {
  color: #374151;
  font-weight: 500;
}

.warning-container {
  display: flex;
  gap: 16px;
}

.warning-icon {
  width: 64px;
  height: 64px;
  background-color: #fef3c7;
  color: #d97706;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.warning-content {
  flex: 1;
}

.warning-content h4 {
  margin: 0 0 12px;
  color: #1f2937;
  font-size: 18px;
  font-weight: 600;
}

.warning-content p {
  margin: 0 0 20px;
  color: #6b7280;
  line-height: 1.5;
}

.user-details {
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.detail-row:last-child {
  margin-bottom: 0;
}

.detail-label {
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

.detail-value {
  color: #6b7280;
  font-size: 14px;
}

.warning-note {
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  padding: 12px;
  color: #991b1b;
  font-size: 14px;
  line-height: 1.4;
}

.error-state {
  text-align: center;
  padding: 60px 20px;
}

.error-state h2 {
  color: #1f2937;
  margin-bottom: 16px;
}

.error-state p {
  color: #6b7280;
  margin-bottom: 24px;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .tenant-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .header-actions {
    justify-content: center;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .stat-card {
    padding: 16px;
  }

  .table {
    font-size: 12px;
  }

  .table th,
  .table td {
    padding: 8px 4px;
  }

  .pagination {
    flex-direction: column;
    gap: 16px;
  }

  .modal-content {
    width: 95%;
    margin: 20px;
  }

  .warning-container {
    flex-direction: column;
    text-align: center;
  }

  .warning-icon {
    margin: 0 auto;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
