<template>
  <div>
    <nav class="navbar">
      <div class="navbar-content">
        <router-link to="/" class="navbar-brand">AIR Server</router-link>
        <ul class="navbar-nav">
          <li><router-link to="/">Dashboard</router-link></li>
          <li><router-link to="/responders">Responders</router-link></li>
          <li><router-link to="/jobs">Jobs</router-link></li>
        </ul>
        <div class="navbar-user">
          <span class="user-info">{{ authStore.user?.email }}</span>
          <button @click="handleLogout" class="btn btn-secondary">Logout</button>
        </div>
      </div>
    </nav>

    <div class="container" style="padding-top: 32px">
      <div
        style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        "
      >
        <h1 style="color: #1f2937">Jobs</h1>
        <div style="display: flex; gap: 12px">
          <button @click="openCreateJobModal" class="btn btn-primary">Create Job</button>
          <button @click="refreshJobs" class="btn btn-secondary">
            {{ loading ? "Refreshing..." : "Refresh" }}
          </button>
        </div>
      </div>

      <div v-if="loading" class="loading">
        <div class="spinner"></div>
      </div>

      <div v-else class="card">
        <div v-if="jobs.length === 0" style="text-align: center; padding: 40px; color: #6b7280">
          No jobs found
        </div>
        <table v-else class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Command</th>
              <th>Arguments</th>
              <th>Status</th>
              <th>Responder</th>
              <th>Created</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="job in jobs" :key="job.id">
              <td>{{ job.id }}</td>
              <td>
                <code
                  style="font-size: 12px; background: #f3f4f6; padding: 2px 6px; border-radius: 4px"
                >
                  {{ job.command }}
                </code>
              </td>
              <td>{{ formatters.formatArgs(job.args) }}</td>
              <td>
                <span class="status-badge" :class="formatters.formatStatus(job.status).class">
                  {{ formatters.formatStatus(job.status).text }}
                </span>
              </td>
              <td>
                <div style="font-size: 12px">
                  <div><strong>ID:</strong> {{ job.responder.id }}</div>
                  <div><strong>OS:</strong> {{ job.responder.operatingSystem }}</div>
                  <div><strong>IP:</strong> {{ job.responder.ipAddress }}</div>
                  <div>
                    <strong>Status:</strong>
                    <span
                      class="status-badge"
                      :class="formatters.formatStatus('healthy', job.responder.lastSeen).class"
                      style="font-size: 10px; padding: 2px 6px"
                    >
                      {{ formatters.formatStatus("healthy", job.responder.lastSeen).text }}
                    </span>
                  </div>
                </div>
              </td>
              <td>{{ formatters.formatRelativeTime(job.createdAt) }}</td>
              <td>
                <div
                  v-if="job.resultData"
                  style="
                    font-size: 12px;
                    max-width: 150px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                  "
                >
                  {{ JSON.stringify(job.resultData) }}
                </div>
                <span v-else style="color: #6b7280">-</span>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div
          v-if="meta"
          class="pagination"
          style="
            margin-top: 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          "
        >
          <div style="color: #6b7280; font-size: 14px">
            Showing {{ meta.itemCount }} of {{ meta.totalItems }} jobs
          </div>
          <div style="display: flex; gap: 8px">
            <button
              @click="loadPage(meta.currentPage - 1)"
              :disabled="meta.currentPage <= 1"
              class="btn btn-secondary"
              style="padding: 6px 12px; font-size: 12px"
            >
              Previous
            </button>
            <span style="padding: 6px 12px; color: #374151">
              Page {{ meta.currentPage }} of {{ meta.totalPages }}
            </span>
            <button
              @click="loadPage(meta.currentPage + 1)"
              :disabled="meta.currentPage >= meta.totalPages"
              class="btn btn-secondary"
              style="padding: 6px 12px; font-size: 12px"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <!-- Create Job Modal -->
      <div v-if="showCreateModal" class="modal-overlay" @click="closeCreateModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>Create New Job</h3>
            <button @click="closeCreateModal" class="modal-close">&times;</button>
          </div>

          <form @submit.prevent="createJob" class="modal-body">
            <div class="form-group">
              <label class="form-label">Responder</label>
              <select v-model="jobForm.responderId" class="form-input" required>
                <option :value="null">Select a responder</option>
                <option
                  v-for="responder in availableResponders"
                  :key="responder.id"
                  :value="responder.id"
                >
                  {{ responder.id }} - {{ responder.operatingSystem }} ({{ responder.ipAddress }}) -
                  {{ formatters.formatStatus("healthy", responder.lastSeen).text }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Command</label>
              <input
                v-model="jobForm.command"
                type="text"
                class="form-input"
                placeholder="e.g., add, subtract, multiply"
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label">Arguments (JSON Array)</label>
              <textarea
                v-model="jobForm.args"
                class="form-input"
                rows="3"
                placeholder='e.g., [2, 4] or ["param1", "param2"]'
                required
              ></textarea>
              <small style="color: #6b7280; font-size: 12px">
                Enter arguments as a JSON array, e.g., [2, 4] for numbers or ["hello", "world"] for
                strings
              </small>
            </div>

            <div class="modal-footer">
              <button type="button" @click="closeCreateModal" class="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary" :disabled="creatingJob">
                {{ creatingJob ? "Creating..." : "Create Job" }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { jobsService } from "../services/jobs";
import { respondersService } from "../services/responders";
import { formatters } from "../utils/formatters";
import type { Job, JobForm, PaginationMeta, Responder } from "../types";
import { useNotifications } from "../composables/useNotifications";

const router = useRouter();
const authStore = useAuthStore();

const jobs = ref<Job[]>([]);
const meta = ref<PaginationMeta | null>(null);
const loading = ref<boolean>(false);
const showCreateModal = ref<boolean>(false);
const creatingJob = ref<boolean>(false);
const availableResponders = ref<Responder[]>([]);
const currentPage = ref<number>(1);
const itemsPerPage = ref<number>(20);

const jobForm = ref<JobForm>({
  responderId: null,
  command: "",
  args: "[]",
});

const { showSuccess, showError } = useNotifications();

const handleLogout = (): void => {
  authStore.logout();
  router.push("/login");
};

const loadJobs = async (page: number = 1): Promise<void> => {
  try {
    loading.value = true;
    const response = await jobsService.getJobs(page, itemsPerPage.value);
    jobs.value = response.data;
    meta.value = response.meta;
    currentPage.value = page;
  } catch (error: any) {
    console.error("Failed to load jobs:", error);
    if (error.status === 401) {
      authStore.handleAuthError();
    }
  } finally {
    loading.value = false;
  }
};

const loadPage = (page: number): void => {
  if (page >= 1 && meta.value && page <= meta.value.totalPages) {
    loadJobs(page);
  }
};

const refreshJobs = (): void => {
  loadJobs(currentPage.value);
};

const loadResponders = async (): Promise<void> => {
  try {
    // Load all responders (both healthy and unhealthy) for selection
    const responders = await respondersService.getAllResponders();
    availableResponders.value = responders;
  } catch (error) {
    console.error("Failed to load responders:", error);
  }
};

const openCreateJobModal = async (): Promise<void> => {
  showCreateModal.value = true;
  jobForm.value = {
    responderId: null,
    command: "",
    args: "[]",
  };
  await loadResponders();
};

const closeCreateModal = (): void => {
  showCreateModal.value = false;
};

const createJob = async (): Promise<void> => {
  if (!jobForm.value.responderId) return;

  try {
    creatingJob.value = true;

    const parsedArgs = formatters.parseArgs(jobForm.value.args);

    const response = await jobsService.createJob({
      responderId: jobForm.value.responderId,
      command: jobForm.value.command,
      args: parsedArgs,
    });

    closeCreateModal();
    showSuccess(
      `Job has been created and assigned to responder ${jobForm.value.responderId}. The responder will execute the command shortly.`,
      `Job Created (ID: ${response.jobId})`,
    );

    // Refresh the jobs list
    await loadJobs(currentPage.value);
  } catch (error: any) {
    console.error("Failed to create job:", error);
    showError(`Failed to create job: ${error.message}`, "Job Creation Failed");
  } finally {
    creatingJob.value = false;
  }
};

onMounted(() => {
  loadJobs();
});
</script>

<style scoped>
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
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
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
}

.modal-close:hover {
  color: #374151;
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

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

@media (max-width: 768px) {
  .table {
    font-size: 12px;
  }

  .table th,
  .table td {
    padding: 8px 4px;
  }

  .modal-content {
    width: 95%;
    margin: 20px;
  }

  .pagination {
    flex-direction: column;
    gap: 16px;
  }
}
</style>
