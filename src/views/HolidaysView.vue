<template>
  <dashPageView />

  <div class="dashboard-layout bg-light min-vh-100 d-flex">
    <!-- Left Sidebar -->
    <aside class="sidebar-wrapper"></aside>

    <!-- Main Content -->
    <div class="main-wrapper flex-grow-1 min-vh-100 d-flex flex-column">
      <main class="holiday-management-section py-3 py-md-4 px-2 px-md-3">
        <div class="container-fluid p-0">
          <!-- Page Header & Add Button -->
          <div class="row mb-4 align-items-center">
            <div class="col-md-6">
              <h2 class="h4 fw-bold text-dark mb-1">Company Holidays Management</h2>

              <p class="text-muted small mb-0">
                Manage off days and public holidays for attendance tracking
              </p>
            </div>

            <div class="col-md-6 text-md-end mt-3 mt-md-0">
              <button class="btn btn-primary btn-sm fw-semibold" @click="openAddModal">
                + Add New Holiday
              </button>
            </div>
          </div>

          <!-- Holidays Table Card -->
          <div class="card border-0 shadow-sm rounded-3">
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                  <thead class="table-light">
                    <tr class="small text-secondary fw-semibold">
                      <th class="ps-4 py-3">TITLE / REASON</th>

                      <th v-if="role === 'Manager'" class="py-3">BRANCH</th>

                      <th class="py-3">DATE RANGE</th>

                      <th class="py-3">DESCRIPTION</th>

                      <th class="text-end pe-4 py-3">ACTION</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr v-if="loading">
                      <td :colspan="role === 'Manager' ? 5 : 4" class="text-center py-4 text-muted">
                        <div class="spinner-border spinner-border-sm me-2" role="status"></div>

                        Loading holidays...
                      </td>
                    </tr>

                    <tr
                      v-else-if="holidays.length > 0"
                      v-for="holiday in holidays"
                      :key="holiday.id"
                    >
                      <td class="ps-4 fw-bold text-dark">
                        {{ holiday.title }}
                      </td>

                      <!-- Manager Branch -->
                      <td v-if="role === 'Manager'">
                        <span class="badge bg-primary bg-opacity-10 text-primary border">
                          {{ getBranchName(holiday.branch_id) }}
                        </span>
                      </td>

                      <td>
                        <span class="badge bg-secondary bg-opacity-15 text-dark border">
                          {{ holiday.start_date }}

                          <span class="text-muted mx-1"> to </span>

                          {{ holiday.end_date }}
                        </span>
                      </td>

                      <td class="text-muted small">
                        {{ holiday.description || 'N/A' }}
                      </td>

                      <td class="text-end pe-4">
                        <button
                          class="btn btn-sm btn-outline-danger fw-semibold"
                          @click="deleteHoliday(holiday.id)"
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>

                    <tr v-else>
                      <td :colspan="role === 'Manager' ? 5 : 4" class="text-center py-4 text-muted">
                        No holidays found.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Modal for Adding Holiday -->
    <div class="modal fade" id="holidayModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header bg-light">
            <h5 class="modal-title fw-bold">Add New Holiday</h5>

            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>

          <form @submit.prevent="saveHoliday">
            <div class="modal-body">
              <!-- Branch Select - Manager Only -->
              <div v-if="role === 'Manager'" class="mb-3">
                <label class="form-label fw-semibold small"> Branch </label>

                <select v-model="form.branch_id" class="form-select" required>
                  <option value="" disabled>Select Branch</option>

                  <option v-for="branch in branches" :key="branch.id" :value="branch.id">
                    {{ branch.name }}
                  </option>
                </select>
              </div>

              <!-- Holiday Title -->
              <div class="mb-3">
                <label class="form-label fw-semibold small"> Holiday Title </label>

                <input
                  type="text"
                  v-model="form.title"
                  class="form-control"
                  placeholder="e.g. Eid-ul-Fitr"
                  required
                />
              </div>

              <!-- Dates -->
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label fw-semibold small"> Start Date </label>

                  <input type="date" v-model="form.start_date" class="form-control" required />
                </div>

                <div class="col-md-6 mb-3">
                  <label class="form-label fw-semibold small"> End Date </label>

                  <input type="date" v-model="form.end_date" class="form-control" required />
                </div>
              </div>

              <!-- Description -->
              <div class="mb-3">
                <label class="form-label fw-semibold small"> Description (Optional) </label>

                <textarea
                  v-model="form.description"
                  class="form-control"
                  rows="3"
                  placeholder="Optional details..."
                ></textarea>
              </div>
            </div>

            <div class="modal-footer bg-light">
              <button type="button" class="btn btn-sm btn-secondary" data-bs-dismiss="modal">
                Cancel
              </button>

              <button type="submit" class="btn btn-sm btn-primary" :disabled="saving">
                <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>

                Save Holiday
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import * as bootstrap from 'bootstrap'
import dashPageView from './dashPageView.vue'
import api from '@/services/api'

// =======================
// ROLE
// =======================

const role = localStorage.getItem('role')

// =======================
// STATES
// =======================

const holidays = ref([])
const branches = ref([])

const loading = ref(false)
const saving = ref(false)

const form = reactive({
  branch_id: '',
  title: '',
  start_date: '',
  end_date: '',
  description: '',
})

let holidayModal = null

// =======================
// FETCH BRANCHES
// =======================

const fetchBranches = async () => {
  if (role !== 'Manager') {
    return
  }

  try {
    const response = await api.get('/branches')

    branches.value = response.data.branches || []
  } catch (error) {
    console.error('Error fetching branches:', error)

    alert(error.response?.data?.message || 'Failed to fetch branches.')
  }
}

// =======================
// GET BRANCH NAME
// =======================

const getBranchName = (branchId) => {
  const branch = branches.value.find((item) => Number(item.id) === Number(branchId))

  return branch?.name || 'Unknown Branch'
}

// =======================
// FETCH HOLIDAYS
// =======================

const fetchHolidays = async () => {
  loading.value = true

  try {
    const response = await api.get('/holidays')

    if (Array.isArray(response.data)) {
      holidays.value = response.data
    } else if (response.data && Array.isArray(response.data.data)) {
      holidays.value = response.data.data
    } else {
      holidays.value = []
    }
  } catch (error) {
    console.error('Error fetching holidays:', error)
  } finally {
    loading.value = false
  }
}

// =======================
// OPEN ADD MODAL
// =======================

const openAddModal = () => {
  form.branch_id = ''
  form.title = ''
  form.start_date = ''
  form.end_date = ''
  form.description = ''

  const modalEl = document.getElementById('holidayModal')

  if (modalEl) {
    holidayModal = bootstrap.Modal.getOrCreateInstance(modalEl)

    holidayModal.show()
  }
}

// =======================
// SAVE HOLIDAY
// =======================

const saveHoliday = async () => {
  /*
  |--------------------------------------------------------------------------
  | Manager must select a branch
  |--------------------------------------------------------------------------
  */

  if (role === 'Manager' && !form.branch_id) {
    alert('Please select a branch.')

    return
  }

  saving.value = true

  try {
    await api.post('/holidays', {
      branch_id: role === 'Manager' ? Number(form.branch_id) : undefined,

      title: form.title,

      start_date: form.start_date,

      end_date: form.end_date,

      description: form.description,
    })

    if (holidayModal) {
      holidayModal.hide()
    }

    await fetchHolidays()
  } catch (error) {
    console.error('Error saving holiday:', error)

    alert(error.response?.data?.message || 'Failed to save holiday')
  } finally {
    saving.value = false
  }
}

// =======================
// DELETE HOLIDAY
// =======================

const deleteHoliday = async (id) => {
  if (!confirm('Are you sure you want to delete this holiday?')) {
    return
  }

  try {
    await api.delete(`/holidays/${id}`)

    await fetchHolidays()
  } catch (error) {
    console.error('Error deleting holiday:', error)
  }
}

// =====================================================
// MODAL CLEANUP
// =====================================================

const cleanupModals = () => {
  // -----------------------------------------
  // Dispose Bootstrap modal instances
  // -----------------------------------------

  document.querySelectorAll('.modal').forEach((modalEl) => {
    try {
      const instance = bootstrap.Modal.getInstance(modalEl)

      if (instance) {
        instance.dispose()
      }
    } catch (error) {
      console.warn('Modal cleanup warning:', error)
    }

    // -----------------------------------------
    // Remove stale modal state
    // -----------------------------------------

    modalEl.classList.remove('show')

    modalEl.style.removeProperty('display')

    modalEl.style.removeProperty('padding-right')

    modalEl.removeAttribute('aria-modal')

    modalEl.setAttribute('aria-hidden', 'true')

    modalEl.removeAttribute('role')
  })

  // -----------------------------------------
  // Remove all stale backdrops
  // -----------------------------------------

  document.querySelectorAll('.modal-backdrop').forEach((backdrop) => {
    backdrop.remove()
  })

  // -----------------------------------------
  // Restore body state
  // -----------------------------------------

  document.body.classList.remove('modal-open')

  document.body.style.removeProperty('overflow')

  document.body.style.removeProperty('padding-right')

  // -----------------------------------------
  // Restore HTML state
  // -----------------------------------------

  document.documentElement.style.removeProperty('overflow')

  document.documentElement.style.removeProperty('padding-right')
}

// =====================================================
// MOBILE / BROWSER BACK
// =====================================================

const handleBrowserBack = () => {
  cleanupModals()
}

// =====================================================
// INIT
// =====================================================

onMounted(() => {
  fetchHolidays()

  fetchBranches()

  const modalEl = document.getElementById('holidayModal')

  if (modalEl) {
    holidayModal = bootstrap.Modal.getOrCreateInstance(modalEl)
  }

  // Browser / Mobile Back

  window.addEventListener('popstate', handleBrowserBack)

  // Browser restore

  window.addEventListener('pageshow', handleBrowserBack)
})

// =====================================================
// COMPONENT UNMOUNT
// =====================================================

onBeforeUnmount(() => {
  window.removeEventListener('popstate', handleBrowserBack)

  window.removeEventListener('pageshow', handleBrowserBack)

  cleanupModals()

  holidayModal = null
})
</script>

<style scoped>
.main-wrapper {
  margin-left: 260px;
  width: calc(100% - 260px);
}

@media (max-width: 768px) {
  .main-wrapper {
    margin-left: 0;
    width: 100%;
  }
}
</style>
