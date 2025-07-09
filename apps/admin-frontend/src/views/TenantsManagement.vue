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
        <h1>Tenant Management</h1>
        <div class="header-actions">
          <button @click="openCreateModal" class="btn btn-primary">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 4v16m8-8H4" />
            </svg>
            Create Tenant
          </button>
          <button @click="refreshTenants" class="btn btn-secondary" :disabled="loading">
            {{ loading ? "Refreshing..." : "Refresh" }}
          </button>
        </div>
      </div>

      <div v-if="loading" class="loading">
        <LoadingSpinner message="Loading tenants..." />
      </div>

      <div v-else class="card">
        <div v-if="tenants.length === 0" class="empty-state">
          <div class="empty-icon">
            <svg width="64" height="64" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
              />
            </svg>
          </div>
          <h3>No tenants found</h3>
          <p>Get started by creating your first tenant</p>
          <button @click="openCreateModal" class="btn btn-primary">Create First Tenant</button>
        </div>

        <table v-else class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="tenant in tenants" :key="tenant.id">
              <td>{{ tenant.id }}</td>
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
              <td>{{ formatters.formatRelativeTime(tenant.createdAt) }}</td>
              <td>
                <div class="actions-cell">
                  <router-link
                    :to="`/tenants/${tenant.id}`"
                    class="btn-action btn-view"
                    title="Manage users"
                  >
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                      <path
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </router-link>
                  <button
                    @click="openEditModal(tenant)"
                    class="btn-action btn-edit"
                    title="Edit tenant"
                  >
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                      <path
                        d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
                      />
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button
                    @click="confirmDelete(tenant)"
                    class="btn-action btn-delete"
                    :disabled="deletingId === tenant.id"
                    title="Delete tenant"
                  >
                    <svg
                      v-if="deletingId !== tenant.id"
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
        <div v-if="meta" class="pagination">
          <div class="pagination-info">
            Showing {{ meta.itemCount }} of {{ meta.totalItems }} tenants
          </div>
          <div class="pagination-controls">
            <button
              @click="loadPage(meta.currentPage - 1)"
              :disabled="meta.currentPage <= 1"
              class="btn btn-secondary btn-sm"
            >
              Previous
            </button>
            <span class="page-info"> Page {{ meta.currentPage }} of {{ meta.totalPages }} </span>
            <button
              @click="loadPage(meta.currentPage + 1)"
              :disabled="meta.currentPage >= meta.totalPages"
              class="btn btn-secondary btn-sm"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <!-- Create/Edit Modal -->
      <div v-if="showModal" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>{{ isEditing ? "Edit Tenant" : "Create New Tenant" }}</h3>
            <button @click="closeModal" class="modal-close">&times;</button>
          </div>

          <form @submit.prevent="saveTenant" class="modal-body">
            <div class="form-group">
              <label class="form-label">Tenant ID</label>
              <input
                v-model="tenantForm.tenantId"
                type="text"
                class="form-input"
                placeholder="Enter tenant ID"
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label">Tenant Name</label>
              <input
                v-model="tenantForm.tenantName"
                type="text"
                class="form-input"
                placeholder="Enter tenant name"
                required
              />
            </div>

            <div class="modal-footer">
              <button type="button" @click="closeModal" class="btn btn-secondary">Cancel</button>
              <button type="submit" class="btn btn-primary" :disabled="saving">
                {{ saving ? "Saving..." : isEditing ? "Update Tenant" : "Create Tenant" }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div v-if="showDeleteModal" class="modal-overlay" @click="closeModal">
        <div class="modal-content delete-modal" @click.stop>
          <div class="modal-header">
            <h3>Confirm Deletion</h3>
            <button @click="closeModal" class="modal-close">&times;</button>
          </div>

          <div class="modal-body">
            <div class="warning-container">
              <div class="warning-icon">
                <svg width="48" height="48" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
                </svg>
              </div>
              <div class="warning-content">
                <h4>Are you sure you want to delete this tenant?</h4>
                <p>
                  This action will permanently remove the tenant and all associated data including
                  users and responders.
                </p>

                <div v-if="tenantToDelete" class="tenant-details">
                  <div class="detail-row">
                    <span class="detail-label">Name:</span>
                    <span class="detail-value">{{ tenantToDelete.name }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Users:</span>
                    <span class="detail-value">{{ tenantToDelete.userCount }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Responders:</span>
                    <span class="detail-value">{{ tenantToDelete.responderCount }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Status:</span>
                    <span class="detail-value">{{
                      tenantToDelete.status === "active" ? "Active" : "Inactive"
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
            <button @click="closeModal" class="btn btn-secondary">Cancel</button>
            <button @click="deleteTenant" class="btn btn-danger" :disabled="deletingId !== null">
              {{ deletingId ? "Deleting..." : "Delete Tenant" }}
            </button>
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
import { tenantsService } from "../services/tenants";
import { formatters } from "../utils/formatters";
import LoadingSpinner from "../components/LoadingSpinner.vue";
import type { Tenant, PaginationMeta, CreateTenantRequest, UpdateTenantRequest } from "../types";
import { useNotifications } from "@/composables/useNotifications";

const { showSuccess, showError } = useNotifications();

const router = useRouter();
const authStore = useAuthStore();
const user = authStore.user;

const tenants = ref<Tenant[]>([]);
const meta = ref<PaginationMeta | null>(null);
const loading = ref<boolean>(false);
const currentPage = ref<number>(1);
const itemsPerPage = ref<number>(20);

// Modal state
const showModal = ref<boolean>(false);
const isEditing = ref<boolean>(false);
const saving = ref<boolean>(false);
const tenantForm = ref<CreateTenantRequest & { status?: string }>({
  tenantId: "",
  tenantName: "",
});
const editingTenant = ref<Tenant | null>(null);

// Delete modal state
const showDeleteModal = ref<boolean>(false);
const tenantToDelete = ref<Tenant | null>(null);
const deletingId = ref<number | null>(null);

const handleLogout = (): void => {
  authStore.logout();
  router.push("/login");
};

const loadTenants = async (page: number = 1): Promise<void> => {
  try {
    loading.value = true;
    const response = await tenantsService.getTenants(page, itemsPerPage.value);
    tenants.value = response.data;
    meta.value = response.meta;
    currentPage.value = page;
  } catch (error: any) {
    console.error("Failed to load tenants:", error);
    if (error.status === 401) {
      authStore.handleAuthError();
    }
  } finally {
    loading.value = false;
  }
};

const loadPage = (page: number): void => {
  if (page >= 1 && meta.value && page <= meta.value.totalPages) {
    loadTenants(page);
  }
};

const refreshTenants = (): void => {
  loadTenants(currentPage.value);
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

// Modal functions
const openCreateModal = (): void => {
  isEditing.value = false;
  tenantForm.value = {
    tenantId: "",
    tenantName: "",
  };
  showModal.value = true;
};

const openEditModal = (tenant: Tenant): void => {
  isEditing.value = true;
  editingTenant.value = tenant;
  tenantForm.value = {
    tenantId: tenant.id,
    tenantName: tenant.name,
  };
  showModal.value = true;
};

const closeModal = (): void => {
  showModal.value = false;
  editingTenant.value = null;
};

const saveTenant = async (): Promise<void> => {
  try {
    saving.value = true;

    if (isEditing.value && editingTenant.value) {
      const updateData: UpdateTenantRequest = {
        tenantName: tenantForm.value.tenantName,
      };
      await tenantsService.updateTenant(editingTenant.value.id, updateData);
      showSuccess("Tenant updated successfully!", "Success");
    } else {
      const createData: CreateTenantRequest = {
        tenantId: tenantForm.value.tenantId,
        tenantName: tenantForm.value.tenantName,
      };
      await tenantsService.createTenant(createData);
      showSuccess("Tenant created successfully!", "Success");
    }

    closeModal();
    refreshTenants();
  } catch (error: any) {
    console.error("Failed to save tenant:", error);
    showError(`Failed to save tenant: ${error.message}`, "Error");
  } finally {
    saving.value = false;
  }
};

const deleteTenant = async (): Promise<void> => {
  if (!tenantToDelete.value) return;

  try {
    deletingId.value = tenantToDelete.value.id;
    await tenantsService.deleteTenant(tenantToDelete.value.id);

    showSuccess("Tenant deleted successfully!", "Success");
    closeModal();
    refreshTenants();
  } catch (error: any) {
    console.error("Failed to delete tenant:", error);
    showError(`Failed to delete tenant: ${error.message}`, "Error");
  } finally {
    deletingId.value = null;
  }
};

const confirmDelete = (tenant: Tenant): void => {
  tenantToDelete.value = tenant;
  showDeleteModal.value = true;
};

onMounted(() => {
  loadTenants();
});
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.page-header h1 {
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

.tenant-name {
  font-weight: 600;
  color: #1f2937;
}

.tenant-description {
  color: #6b7280;
  font-size: 14px;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.count-display {
  font-weight: 600;
  font-size: 16px;
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
  text-decoration: none;
}

.btn-action:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-view {
  background-color: #e0e7ff;
  color: #3730a3;
}

.btn-view:hover:not(:disabled) {
  background-color: #c7d2fe;
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

.tenant-details {
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

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .header-actions {
    justify-content: center;
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
