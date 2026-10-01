<template>
  <dashPageView />

  <!-- ================= MAIN CONTENT ================= -->
  <div class="branch-page">
    <div class="branch-content">
      <!-- ================= HEADER ================= -->
      <div class="d-flex justify-content-between align-items-center mb-4 branch-header">
        <div>
          <h2 class="fw-bold mb-1">Branches</h2>
          <p class="text-muted mb-0">Manage your branches</p>
        </div>

        <button class="btn btn-primary" @click="openCreateModal">
          <i class="bi bi-plus-lg me-1"></i>
          Add Branch
        </button>
      </div>

      <!-- ================= ALERT ================= -->
      <div v-if="successMessage" class="alert alert-success">
        {{ successMessage }}
      </div>

      <div v-if="errorMessage" class="alert alert-danger">
        {{ errorMessage }}
      </div>

      <!-- ================= BRANCH LIST ================= -->
      <div class="card border-0 shadow-sm rounded-4">
        <div class="card-body">
          <!-- Loading -->
          <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary"></div>

            <p class="mt-2 text-muted mb-0">Loading branches...</p>
          </div>

          <!-- Empty -->
          <div v-else-if="branches.length === 0" class="text-center py-5">
            <h5 class="text-muted">No branches found.</h5>

            <button class="btn btn-primary mt-3" @click="openCreateModal">
              Create First Branch
            </button>
          </div>

          <!-- Table -->
          <div v-else class="table-responsive">
            <table class="table align-middle mb-0">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Branch Name</th>
                  <th>Code</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th class="text-end">Action</th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="(branch, index) in branches" :key="branch.id">
                  <td>
                    {{ index + 1 }}
                  </td>

                  <td class="fw-semibold">
                    {{ branch.name }}
                  </td>

                  <td>
                    {{ branch.code }}
                  </td>

                  <td>
                    {{ branch.phone || '-' }}
                  </td>

                  <td>
                    {{ branch.email || '-' }}
                  </td>

                  <td>
                    <span v-if="branch.status" class="badge bg-success-subtle text-success">
                      Active
                    </span>

                    <span v-else class="badge bg-danger-subtle text-danger"> Inactive </span>
                  </td>

                  <td class="text-end">
                    <button
                      class="btn btn-sm btn-outline-primary me-2"
                      @click="openEditModal(branch)"
                    >
                      Edit
                    </button>

                    <button class="btn btn-sm btn-outline-danger" @click="deleteBranch(branch)">
                      Delete
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ================= CREATE / EDIT MODAL ================= -->
  <div v-if="showModal" class="modal-backdrop-custom">
    <div class="modal-dialog-custom">
      <div class="card border-0 shadow-lg rounded-4">
        <!-- Modal Header -->
        <div class="card-header bg-white border-0 p-4">
          <div class="d-flex justify-content-between align-items-center">
            <h5 class="fw-bold mb-0">
              {{ isEditing ? 'Edit Branch' : 'Create New Branch' }}
            </h5>

            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
        </div>

        <!-- Modal Body -->
        <div class="card-body px-4 pb-4">
          <form @submit.prevent="saveBranch">
            <!-- Branch Name -->
            <div class="mb-3">
              <label class="form-label fw-semibold"> Branch Name </label>

              <input
                v-model="form.name"
                type="text"
                class="form-control"
                placeholder="Enter branch name"
                required
              />
            </div>

            <!-- Branch Code -->
            <div class="mb-3">
              <label class="form-label fw-semibold"> Branch Code </label>

              <input
                v-model="form.code"
                type="text"
                class="form-control"
                placeholder="Example: MIRPUR"
                required
              />
            </div>

            <!-- Address -->
            <div class="mb-3">
              <label class="form-label fw-semibold"> Address </label>

              <textarea
                v-model="form.address"
                class="form-control"
                rows="2"
                placeholder="Enter branch address"
              ></textarea>
            </div>

            <!-- Phone -->
            <div class="mb-3">
              <label class="form-label fw-semibold"> Phone </label>

              <input
                v-model="form.phone"
                type="text"
                class="form-control"
                placeholder="Enter phone number"
              />
            </div>

            <!-- Email -->
            <div class="mb-3">
              <label class="form-label fw-semibold"> Email </label>

              <input
                v-model="form.email"
                type="email"
                class="form-control"
                placeholder="Enter email"
              />
            </div>

            <!-- Status -->
            <div class="form-check mb-4">
              <input
                v-model="form.status"
                class="form-check-input"
                type="checkbox"
                id="branchStatus"
              />

              <label class="form-check-label" for="branchStatus"> Active </label>
            </div>

            <!-- Buttons -->
            <div class="d-flex justify-content-end gap-2">
              <button type="button" class="btn btn-light" @click="closeModal">Cancel</button>

              <button type="submit" class="btn btn-primary" :disabled="saving">
                <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>

                {{ saving ? 'Saving...' : isEditing ? 'Update Branch' : 'Create Branch' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'
import dashPageView from './dashPageView.vue'

// =============================
// STATE
// =============================

const branches = ref([])

const loading = ref(false)
const saving = ref(false)

const showModal = ref(false)
const isEditing = ref(false)

const successMessage = ref('')
const errorMessage = ref('')

const editingBranchId = ref(null)

const form = ref({
  name: '',
  code: '',
  address: '',
  phone: '',
  email: '',
  status: true,
})

// =============================
// RESET FORM
// =============================

const resetForm = () => {
  form.value = {
    name: '',
    code: '',
    address: '',
    phone: '',
    email: '',
    status: true,
  }

  editingBranchId.value = null
}

// =============================
// FETCH BRANCHES
// =============================

const fetchBranches = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await api.get('/branches')

    branches.value = response.data.branches || []
  } catch (error) {
    console.error('Fetch branches error:', error)

    errorMessage.value = error.response?.data?.message || 'Failed to load branches.'
  } finally {
    loading.value = false
  }
}

// =============================
// OPEN CREATE MODAL
// =============================

const openCreateModal = () => {
  resetForm()

  isEditing.value = false

  successMessage.value = ''
  errorMessage.value = ''

  showModal.value = true
}

// =============================
// OPEN EDIT MODAL
// =============================

const openEditModal = (branch) => {
  isEditing.value = true

  editingBranchId.value = branch.id

  form.value = {
    name: branch.name || '',
    code: branch.code || '',
    address: branch.address || '',
    phone: branch.phone || '',
    email: branch.email || '',
    status: Boolean(branch.status),
  }

  successMessage.value = ''
  errorMessage.value = ''

  showModal.value = true
}

// =============================
// CLOSE MODAL
// =============================

const closeModal = () => {
  if (saving.value) {
    return
  }

  showModal.value = false

  resetForm()
}

// =============================
// CREATE / UPDATE
// =============================

const saveBranch = async () => {
  saving.value = true

  errorMessage.value = ''
  successMessage.value = ''

  try {
    if (isEditing.value) {
      const response = await api.put(`/branches/${editingBranchId.value}`, form.value)

      successMessage.value = response.data.message || 'Branch updated successfully.'
    } else {
      const response = await api.post('/branches', form.value)

      successMessage.value = response.data.message || 'Branch created successfully.'
    }

    showModal.value = false

    resetForm()

    await fetchBranches()
  } catch (error) {
    console.error('Save branch error:', error)

    if (error.response?.data?.errors) {
      const errors = error.response.data.errors

      errorMessage.value = Object.values(errors).flat().join(' ')
    } else {
      errorMessage.value = error.response?.data?.message || 'Failed to save branch.'
    }
  } finally {
    saving.value = false
  }
}

// =============================
// DELETE BRANCH
// =============================

const deleteBranch = async (branch) => {
  const confirmed = confirm(`Are you sure you want to delete "${branch.name}"?`)

  if (!confirmed) {
    return
  }

  errorMessage.value = ''
  successMessage.value = ''

  try {
    const response = await api.delete(`/branches/${branch.id}`)

    successMessage.value = response.data.message || 'Branch deleted successfully.'

    await fetchBranches()
  } catch (error) {
    console.error('Delete branch error:', error)

    errorMessage.value = error.response?.data?.message || 'Failed to delete branch.'
  }
}

// =============================
// INITIAL LOAD
// =============================

onMounted(() => {
  fetchBranches()
})
</script>

<style scoped>
/* =========================================
   MAIN BRANCH PAGE
========================================= */

.branch-page {
  margin-left: 280px;
  min-height: 100vh;
  background: #f8f9fa;
  padding: 24px;
}

.branch-content {
  width: 100%;
}

/* =========================================
   TABLE
========================================= */

.table th {
  font-weight: 600;
  white-space: nowrap;
}

.table td {
  vertical-align: middle;
}

/* =========================================
   MODAL
========================================= */

.modal-backdrop-custom {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 1050;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 20px;
}

.modal-dialog-custom {
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-dialog-custom .card {
  overflow: hidden;
}

/* =========================================
   MOBILE
========================================= */

@media (max-width: 991px) {
  .branch-page {
    margin-left: 0;
    padding: 20px 15px;
  }
}

/* =========================================
   SMALL MOBILE
========================================= */

@media (max-width: 576px) {
  .branch-page {
    padding: 15px 10px;
  }

  .branch-header {
    align-items: flex-start !important;
    gap: 15px;
    flex-direction: column;
  }

  .branch-header .btn {
    width: 100%;
  }

  .card-body {
    padding: 15px !important;
  }

  .table {
    min-width: 850px;
  }

  .modal-backdrop-custom {
    padding: 10px;
  }

  .modal-dialog-custom {
    max-width: 100%;
  }
}
</style>
