<template>
  <dashPageView />

  <div class="container-fluid body py-4">
    <!-- Page Header -->
    <div class="row mb-4 align-items-center">
      <div class="col">
        <h2 class="fw-bold text-dark mb-1">Section Management</h2>

        <p class="text-muted mb-0">Manage all Students Sections for here easily.</p>
      </div>

      <div class="col-auto">
        <button
          @click="openAddModal"
          class="btn btn-primary d-flex align-items-center gap-2 shadow-sm"
        >
          <i class="bi bi-plus-lg"></i>
          Add New Section
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

    <!-- Sections Table Card -->
    <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light text-uppercase fs-7 text-secondary">
              <tr>
                <th class="py-3 ps-4">#ID</th>

                <th class="py-3">Section Name</th>

                <th class="py-3">Assigned Students</th>

                <th class="py-3 text-end pe-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              <!-- Empty -->
              <tr v-if="sections.length === 0">
                <td colspan="4" class="text-center py-5 text-muted">No sections found.</td>
              </tr>

              <!-- Sections -->
              <tr v-for="(section, index) in sections" :key="section.id">
                <td class="ps-4 fw-semibold text-secondary">
                  {{ section.id || index + 1 }}
                </td>

                <td class="fw-bold text-dark">
                  {{ section.section_name || section.name || 'N/A' }}
                </td>

                <td>
                  <div class="d-flex flex-wrap gap-1">
                    <span
                      v-if="section.students_count"
                      class="badge bg-primary bg-opacity-10 text-primary px-2 py-1"
                    >
                      {{ section.students_count }} Students
                    </span>

                    <span v-else class="text-muted small"> No students assigned </span>
                  </div>
                </td>

                <td class="text-end pe-4">
                  <button
                    @click="openEditModal(section)"
                    class="btn btn-sm btn-outline-primary me-2 px-3"
                  >
                    Edit
                  </button>

                  <button
                    @click="deleteSection(section.id)"
                    class="btn btn-sm btn-outline-danger px-3"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal for Add/Edit Section -->
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
              {{ isEditMode ? 'Edit Section' : 'Add New Section' }}
            </h5>

            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>

          <form @submit.prevent="saveSection">
            <div class="modal-body py-4">
              <!-- =================================================
                   BRANCH SELECT - MANAGER ONLY
              ================================================== -->

              <div v-if="role === 'Manager'" class="mb-4">
                <label class="form-label fw-semibold text-secondary">
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

              <!-- =================================================
                   SECTION NAME
              ================================================== -->

              <div class="mb-3">
                <label class="form-label fw-semibold text-secondary small">
                  Section Name
                  <span class="text-danger">*</span>
                </label>

                <input
                  type="text"
                  v-model="form.section_name"
                  placeholder="e.g. Section A"
                  required
                  class="form-control form-control-lg fs-6"
                />
              </div>
            </div>

            <div class="modal-footer border-0 pt-0">
              <button
                type="button"
                @click="closeModal"
                class="btn btn-light px-4"
                :disabled="saving"
              >
                Cancel
              </button>

              <button type="submit" class="btn btn-primary px-4" :disabled="saving">
                <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>

                {{ isEditMode ? 'Update Section' : 'Save Section' }}
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
   SECTIONS
========================================================= */

const sections = ref([])

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

const currentSectionID = ref(null)

const saving = ref(false)

/* =========================================================
   FORM
========================================================= */

const form = ref({
  section_name: '',

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
   OPEN ADD MODAL
========================================================= */

const openAddModal = async () => {
  isEditMode.value = false

  currentSectionID.value = null

  form.value = {
    section_name: '',

    branch_id: '',
  }

  message.value = ''

  isError.value = false

  showModal.value = true

  /*
  |--------------------------------------------------------------------------
  | Manager হলে Branch load হবে
  |--------------------------------------------------------------------------
  */

  if (role === 'Manager') {
    await fetchBranches()
  }
}

/* =========================================================
   OPEN EDIT MODAL
========================================================= */

const openEditModal = async (sectionItem) => {
  isEditMode.value = true

  currentSectionID.value = sectionItem.id

  form.value = {
    section_name: sectionItem.section_name || sectionItem.name || '',

    branch_id: sectionItem.branch_id ? Number(sectionItem.branch_id) : '',
  }

  message.value = ''

  isError.value = false

  showModal.value = true

  /*
  |--------------------------------------------------------------------------
  | Manager হলে Branch list load হবে
  |--------------------------------------------------------------------------
  */

  if (role === 'Manager') {
    await fetchBranches()
  }
}

/* =========================================================
   FETCH SECTIONS
========================================================= */

const fetchSections = async () => {
  try {
    const response = await api.get('/sections')

    if (Array.isArray(response.data)) {
      sections.value = response.data
    } else if (response.data && Array.isArray(response.data.data)) {
      sections.value = response.data.data
    } else if (response.data && Array.isArray(response.data.sections)) {
      sections.value = response.data.sections
    } else {
      sections.value = []
    }
  } catch (error) {
    console.error('Failed to fetch sections:', error)

    showAlert(error.response?.data?.message || 'Failed to fetch sections.', true)
  }
}

/* =========================================================
   SAVE SECTION
========================================================= */

const saveSection = async () => {
  if (saving.value) {
    return
  }

  /*
  |--------------------------------------------------------------------------
  | Section name validation
  |--------------------------------------------------------------------------
  */

  if (!form.value.section_name.trim()) {
    showAlert('Please enter section name.', true)

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
    /*
    |--------------------------------------------------------------------------
    | Payload
    |--------------------------------------------------------------------------
    */

    const payload = {
      section_name: form.value.section_name.trim(),
    }

    /*
    |--------------------------------------------------------------------------
    | Manager branch
    |--------------------------------------------------------------------------
    */

    if (role === 'Manager') {
      payload.branch_id = Number(form.value.branch_id)
    }

    console.log('Section save payload:', payload)

    let response

    /*
    |--------------------------------------------------------------------------
    | UPDATE
    |--------------------------------------------------------------------------
    */

    if (isEditMode.value) {
      response = await api.put(`/sections/${currentSectionID.value}`, payload)
    } else {
      /*
    |--------------------------------------------------------------------------
    | CREATE
    |--------------------------------------------------------------------------
    */
      response = await api.post('/sections', payload)
    }

    /*
    |--------------------------------------------------------------------------
    | SUCCESS
    |--------------------------------------------------------------------------
    */

    if (response.status === 200 || response.status === 201 || response.data?.status) {
      showAlert(response.data?.message || 'Saved successfully!')

      closeModal()

      await fetchSections()
    }
  } catch (error) {
    console.error('Failed to save section:', error)

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
   CLOSE MODAL
========================================================= */

const closeModal = () => {
  if (saving.value) {
    return
  }

  showModal.value = false

  isEditMode.value = false

  currentSectionID.value = null

  form.value = {
    section_name: '',

    branch_id: '',
  }
}

/* =========================================================
   DELETE SECTION
========================================================= */

const deleteSection = async (id) => {
  if (!confirm('Are you sure you want to delete this section?')) {
    return
  }

  try {
    await api.delete(`/sections/${id}`)

    sections.value = sections.value.filter((section) => section.id !== id)

    showAlert('Section deleted successfully!')

    await fetchSections()
  } catch (error) {
    console.error('Failed to delete section:', error)

    showAlert(error.response?.data?.message || 'Failed to delete section.', true)
  }
}

/* =========================================================
   SHOW ALERT
========================================================= */

const showAlert = (msg, error = false) => {
  message.value = msg

  isError.value = error

  setTimeout(() => {
    message.value = ''
  }, 3000)
}

/* =========================================================
   ON MOUNT
========================================================= */

onMounted(() => {
  fetchSections()
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
