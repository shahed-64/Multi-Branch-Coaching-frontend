<template>
  <RouterView />

  <dashPageView />

  <div class="container-fluid body py-4">
    <!-- Page Header -->
    <div class="row mb-4 align-items-center">
      <div class="col">
        <h2 class="fw-bold text-dark mb-1">Shift Management</h2>

        <p class="text-muted mb-0">Manage all teacher shifts and schedules easily.</p>
      </div>

      <div class="col-auto">
        <button
          @click="openAddModal"
          class="btn btn-primary d-flex align-items-center gap-2 shadow-sm"
        >
          <i class="bi bi-plus-lg"></i>
          Add New Shift
        </button>
      </div>
    </div>

    <!-- Alert Message -->
    <div
      v-if="message"
      class="alert alert-dismissible fade show shadow-sm"
      :class="isError ? 'alert-danger' : 'alert-success'"
      role="alert"
    >
      {{ message }}

      <button type="button" class="btn-close" @click="message = ''"></button>
    </div>

    <!-- Shifts Table Card -->
    <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light text-uppercase fs-7 text-secondary">
              <tr>
                <th class="py-3 ps-4">#ID</th>

                <th class="py-3">Shift Name</th>

                <th class="py-3">Start Time</th>

                <th class="py-3">Assigned Teachers</th>

                <th class="py-3 text-end pe-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              <tr v-if="loading">
                <td colspan="5" class="text-center py-5 text-muted">
                  <div
                    class="spinner-border spinner-border-sm text-primary me-2"
                    role="status"
                  ></div>

                  Loading shifts...
                </td>
              </tr>

              <tr v-else-if="shifts.length === 0">
                <td colspan="5" class="text-center py-5 text-muted">No shifts found.</td>
              </tr>

              <tr v-for="(shift, index) in shifts" :key="shift.id">
                <td class="ps-4 fw-semibold text-secondary">
                  {{ index + 1 }}
                </td>

                <td class="fw-bold text-dark">
                  {{ shift.name }}
                </td>

                <td>
                  <span class="badge bg-light text-dark border font-monospace">
                    Starts: {{ formatTime12Hour(shift.start_time) }}
                  </span>
                </td>

                <td>
                  <div
                    v-if="shift.teachers && shift.teachers.length > 0"
                    class="d-flex flex-wrap gap-1"
                  >
                    <span
                      v-for="teacher in shift.teachers"
                      :key="teacher.id"
                      class="badge bg-primary bg-opacity-10 text-primary px-2 py-1"
                    >
                      {{ teacher.full_name }}
                    </span>
                  </div>

                  <span v-else class="text-muted fst-italic small"> No teachers assigned </span>
                </td>

                <td class="text-end pe-4">
                  <button
                    @click="openEditModal(shift)"
                    class="btn btn-sm btn-outline-primary me-2 px-3"
                  >
                    Edit
                  </button>

                  <button @click="deleteShift(shift.id)" class="btn btn-sm btn-outline-danger px-3">
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal for Add/Edit Shift -->
    <div
      v-if="showModal"
      class="modal fade show d-block"
      tabindex="-1"
      style="background-color: rgba(0, 0, 0, 0.5)"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title fw-bold text-dark">
              {{ isEditMode ? 'Edit Shift' : 'Add New Shift' }}
            </h5>

            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>

          <form @submit.prevent="saveShift">
            <div class="modal-body py-4">
              <!-- Manager Branch Selection -->
              <div v-if="role === 'Manager'" class="mb-3">
                <label class="form-label fw-semibold text-secondary small">
                  Select Branch
                  <span class="text-danger">*</span>
                </label>

                <select
                  v-model="form.branch_id"
                  class="form-select form-select-lg fs-6"
                  required
                  :disabled="branchesLoading"
                >
                  <option value="" disabled>
                    {{ branchesLoading ? 'Loading branches...' : 'Select Branch' }}
                  </option>

                  <option v-for="branch in branches" :key="branch.id" :value="branch.id">
                    {{ branch.name }}
                  </option>
                </select>
              </div>

              <!-- Shift Name -->
              <div class="mb-3">
                <label class="form-label fw-semibold text-secondary small">
                  Shift Name
                  <span class="text-danger">*</span>
                </label>

                <input
                  type="text"
                  v-model="form.name"
                  placeholder="e.g. Morning Shift"
                  required
                  class="form-control form-control-lg fs-6"
                />
              </div>

              <!-- Start Time -->
              <div class="mb-3">
                <label class="form-label fw-semibold text-secondary small">
                  Shift Start Time
                  <span class="text-danger">*</span>
                </label>

                <input type="time" v-model="form.start_time" class="form-control" required />
              </div>
            </div>

            <div class="modal-footer border-0 pt-0">
              <button type="button" @click="closeModal" class="btn btn-light px-4">Cancel</button>

              <button type="submit" class="btn btn-primary px-4" :disabled="saving">
                <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>

                {{ isEditMode ? 'Update Shift' : 'Save Shift' }}
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

import api from '../services/api'

import dashPageView from './dashPageView.vue'

/* =========================================================
   ROLE
========================================================= */

const role = localStorage.getItem('role')

/* =========================================================
   SHIFTS
========================================================= */

const shifts = ref([])

const loading = ref(false)

/* =========================================================
   BRANCHES
========================================================= */

const branches = ref([])

const branchesLoading = ref(false)

/* =========================================================
   MODAL
========================================================= */

const showModal = ref(false)

const isEditMode = ref(false)

const currentShiftId = ref(null)

const saving = ref(false)

/* =========================================================
   FORM
========================================================= */

const form = ref({
  name: '',

  start_time: '09:00',

  branch_id: '',
})

/* =========================================================
   ALERT
========================================================= */

const message = ref('')

const isError = ref(false)

/* =========================================================
   FETCH BRANCHES
========================================================= */

const fetchBranches = async () => {
  branchesLoading.value = true

  try {
    const response = await api.get('/branches')

    if (Array.isArray(response.data)) {
      branches.value = response.data
    } else if (response.data && Array.isArray(response.data.data)) {
      branches.value = response.data.data
    } else if (response.data && Array.isArray(response.data.branches)) {
      branches.value = response.data.branches
    } else {
      branches.value = []
    }
  } catch (error) {
    console.error('Failed to fetch branches:', error)

    branches.value = []

    showAlert(error.response?.data?.message || 'Failed to fetch branches.', true)
  } finally {
    branchesLoading.value = false
  }
}

/* =========================================================
   FETCH SHIFTS
========================================================= */

const fetchShifts = async () => {
  loading.value = true

  try {
    const response = await api.get('/shifts')

    if (response.data.status) {
      shifts.value = response.data.data
    } else {
      shifts.value = []
    }
  } catch (error) {
    console.error('Failed to fetch shifts:', error)

    showAlert(error.response?.data?.message || 'Failed to fetch shifts.', true)
  } finally {
    loading.value = false
  }
}

/* =========================================================
   OPEN ADD MODAL
========================================================= */

const openAddModal = async () => {
  isEditMode.value = false

  currentShiftId.value = null

  form.value = {
    name: '',

    start_time: '09:00',

    branch_id: '',
  }

  message.value = ''

  isError.value = false

  showModal.value = true

  if (role === 'Manager') {
    await fetchBranches()
  }
}

/* =========================================================
   OPEN EDIT MODAL
========================================================= */

const openEditModal = async (shift) => {
  isEditMode.value = true

  currentShiftId.value = shift.id

  form.value = {
    name: shift.name || '',

    start_time: shift.start_time || '09:00',

    branch_id: shift.branch_id ? Number(shift.branch_id) : '',
  }

  message.value = ''

  isError.value = false

  showModal.value = true

  if (role === 'Manager') {
    await fetchBranches()
  }
}

/* =========================================================
   CLOSE MODAL
========================================================= */

const closeModal = () => {
  if (saving.value) {
    return
  }

  showModal.value = false

  isEditMode.value = false

  currentShiftId.value = null

  form.value = {
    name: '',

    start_time: '09:00',

    branch_id: '',
  }
}

/* =========================================================
   SAVE / UPDATE SHIFT
========================================================= */

const saveShift = async () => {
  if (saving.value) {
    return
  }

  /*
  |--------------------------------------------------------------------------
  | Basic validation
  |--------------------------------------------------------------------------
  */

  if (!form.value.name.trim()) {
    showAlert('Please enter shift name.', true)

    return
  }

  /*
  |--------------------------------------------------------------------------
  | Manager branch validation
  |--------------------------------------------------------------------------
  */

  if (role === 'Manager' && !form.value.branch_id) {
    showAlert('Please select a branch.', true)

    return
  }

  saving.value = true

  try {
    const payload = {
      name: form.value.name.trim(),

      start_time: form.value.start_time,
    }

    /*
    |--------------------------------------------------------------------------
    | Manager sends selected branch
    |--------------------------------------------------------------------------
    */

    if (role === 'Manager') {
      payload.branch_id = Number(form.value.branch_id)
    }

    console.log('Shift save payload:', payload)

    let response

    /*
    |--------------------------------------------------------------------------
    | UPDATE
    |--------------------------------------------------------------------------
    */

    if (isEditMode.value) {
      response = await api.put(`/shifts/${currentShiftId.value}`, payload)
    } else {
      /*
    |--------------------------------------------------------------------------
    | CREATE
    |--------------------------------------------------------------------------
    */
      response = await api.post('/shifts', payload)
    }

    /*
    |--------------------------------------------------------------------------
    | SUCCESS
    |--------------------------------------------------------------------------
    */

    if (response.data.status) {
      showAlert(response.data.message || 'Shift saved successfully.')

      closeModal()

      await fetchShifts()
    }
  } catch (error) {
    console.error('Failed to save shift:', error)

    console.error('Validation errors:', error.response?.data?.errors)

    if (error.response?.status === 422) {
      const validationErrors = error.response?.data?.errors || {}

      const firstError = Object.values(validationErrors)[0]?.[0]

      showAlert(
        firstError || error.response?.data?.message || 'Please check the form fields.',
        true,
      )
    } else {
      showAlert(error.response?.data?.message || 'Something went wrong!', true)
    }
  } finally {
    saving.value = false
  }
}

/* =========================================================
   DELETE SHIFT
========================================================= */

const deleteShift = async (id) => {
  if (!confirm('Are you sure you want to delete this shift?')) {
    return
  }

  try {
    const response = await api.delete(`/shifts/${id}`)

    if (response.data.status) {
      showAlert(response.data.message)

      await fetchShifts()
    }
  } catch (error) {
    console.error('Failed to delete shift:', error)

    showAlert(error.response?.data?.message || 'Failed to delete shift.', true)
  }
}

/* =========================================================
   ALERT
========================================================= */

const showAlert = (msg, error = false) => {
  message.value = msg

  isError.value = error

  setTimeout(() => {
    message.value = ''
  }, 3000)
}

/* =========================================================
   FORMAT TIME
========================================================= */

const formatTime12Hour = (time24) => {
  if (!time24) {
    return 'N/A'
  }

  if (time24.includes('AM') || time24.includes('PM')) {
    return time24
  }

  const [hours, minutes] = time24.split(':')

  let h = parseInt(hours, 10)

  const ampm = h >= 12 ? 'PM' : 'AM'

  h = h % 12

  h = h ? h : 12

  return `${h}:${minutes} ${ampm}`
}

/* =========================================================
   ON MOUNT
========================================================= */

onMounted(() => {
  fetchShifts()
})
</script>

<style scoped>
.body {
  width: 86%;

  margin-left: 259px;
}

@media (max-width: 768px) {
  .body {
    width: 100%;

    margin-left: 0;

    padding: 15px;
  }
}
</style>
