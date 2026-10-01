<template>
  <div class="dashboard-layout bg-light min-vh-100 d-flex">
    <!-- =========================================================
         LEFT SIDEBAR
    ========================================================== -->
    <aside class="sidebar-wrapper">
      <dashPageView />
    </aside>

    <!-- =========================================================
         MAIN CONTENT
    ========================================================== -->
    <div class="main-wrapper flex-grow-1 min-vh-100 d-flex flex-column">
      <RouterView />

      <main class="subject-section py-3 py-md-4 px-2 px-md-3">
        <div class="subject-container bg-white rounded-3 shadow-sm p-3 p-md-4">
          <!-- =====================================================
               PAGE HEADER
          ====================================================== -->
          <div
            class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4"
          >
            <div>
              <h2 class="h4 mb-1 fw-bold text-dark">Subject Management</h2>

              <p class="text-muted mb-0 small">Create, manage and organize all academic subjects</p>
            </div>

            <!-- ADD SUBJECT BUTTON -->
            <button
              type="button"
              class="btn btn-primary d-flex align-items-center justify-content-center gap-2 px-3"
              @click="openCreateModal"
            >
              <i class="bi bi-plus-lg"></i>
              Add Subject
            </button>
          </div>

          <!-- =====================================================
               SUMMARY CARDS
          ====================================================== -->
          <div class="row g-3 mb-4">
            <!-- TOTAL SUBJECTS -->
            <div class="col-12 col-sm-6 col-lg-4">
              <div class="summary-card bg-light border rounded-3 p-3 h-100">
                <div class="d-flex align-items-center">
                  <div class="summary-icon bg-primary bg-opacity-10 text-primary">
                    <i class="bi bi-book-half"></i>
                  </div>

                  <div class="ms-3">
                    <div class="text-muted small">Total Subjects</div>

                    <div class="fs-4 fw-bold text-dark">
                      {{ subjects.length }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- SEARCH RESULT -->
            <div class="col-12 col-sm-6 col-lg-4">
              <div class="summary-card bg-light border rounded-3 p-3 h-100">
                <div class="d-flex align-items-center">
                  <div class="summary-icon bg-success bg-opacity-10 text-success">
                    <i class="bi bi-list-check"></i>
                  </div>

                  <div class="ms-3">
                    <div class="text-muted small">Showing</div>

                    <div class="fs-4 fw-bold text-dark">
                      {{ filteredSubjects.length }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- STATUS -->
            <div class="col-12 col-sm-6 col-lg-4">
              <div class="summary-card bg-light border rounded-3 p-3 h-100">
                <div class="d-flex align-items-center">
                  <div class="summary-icon bg-info bg-opacity-10 text-info">
                    <i class="bi bi-check-circle"></i>
                  </div>

                  <div class="ms-3">
                    <div class="text-muted small">Management</div>

                    <div class="fw-bold text-dark">Active</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- =====================================================
               SEARCH & FILTER
          ====================================================== -->
          <div
            class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-3"
          >
            <!-- SEARCH -->
            <div class="search-box-wrapper w-100" style="max-width: 400px">
              <div class="input-group">
                <span class="input-group-text bg-white border-end-0 text-muted ps-3">
                  <i class="bi bi-search"></i>
                </span>

                <input
                  type="text"
                  v-model="searchQuery"
                  class="form-control border-start-0 ps-0 shadow-none"
                  placeholder="Search Subject Name or Code..."
                />

                <button
                  v-if="searchQuery"
                  type="button"
                  class="btn btn-outline-secondary border-start-0"
                  @click="searchQuery = ''"
                  title="Clear Search"
                >
                  <i class="bi bi-x-lg"></i>
                </button>
              </div>
            </div>

            <!-- TOTAL RECORDS -->
            <div class="text-muted small">
              <span class="badge bg-light text-secondary border px-3 py-2 rounded-pill">
                Total Records:

                <strong>
                  {{ filteredSubjects.length }}
                </strong>
              </span>
            </div>
          </div>

          <!-- =====================================================
               SUBJECT TABLE
          ====================================================== -->
          <div class="card border-0 shadow-sm">
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-hover align-middle mb-0 subject-table">
                  <!-- TABLE HEADER -->
                  <thead class="table-light">
                    <tr class="fw-semibold text-secondary small">
                      <th scope="col" class="ps-3 ps-md-4">#</th>

                      <th scope="col">SUBJECT NAME</th>

                      <th scope="col">SUBJECT CODE</th>

                      <th scope="col">FULL MARK</th>

                      <th scope="col">CREATED</th>

                      <th scope="col" class="text-end pe-3 pe-md-4">ACTION</th>
                    </tr>
                  </thead>

                  <!-- TABLE BODY -->
                  <tbody>
                    <!-- LOADING -->
                    <tr v-if="loading">
                      <td colspan="6" class="text-center py-5 text-muted">
                        <div class="spinner-border spinner-border-sm me-2" role="status"></div>

                        Loading subjects...
                      </td>
                    </tr>

                    <!-- SUBJECT ROWS -->
                    <tr
                      v-else
                      v-for="(subject, index) in filteredSubjects"
                      :key="subject.id"
                      class="subject-row"
                    >
                      <!-- NUMBER -->
                      <td class="ps-3 ps-md-4">
                        <span class="text-muted small">
                          {{ index + 1 }}
                        </span>
                      </td>

                      <!-- SUBJECT NAME -->
                      <td>
                        <div class="d-flex align-items-center">
                          <div class="subject-icon me-3">
                            <i class="bi bi-book"></i>
                          </div>

                          <div>
                            <div class="fw-bold text-dark text-nowrap">
                              {{ subject.name || '-' }}
                            </div>

                            <div class="text-muted small">Academic Subject</div>
                          </div>
                        </div>
                      </td>

                      <!-- SUBJECT CODE -->
                      <td>
                        <span class="badge bg-light text-dark border font-monospace px-2 py-1">
                          {{ subject.code || '-' }}
                        </span>
                      </td>

                      <!-- FULL MARK -->
                      <td>
                        <span
                          class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-2 py-1"
                        >
                          {{ subject.full_mark ?? '-' }}
                        </span>
                      </td>

                      <!-- CREATED DATE -->
                      <td class="small text-muted">
                        {{ formatDate(subject.created_at) }}
                      </td>

                      <!-- ACTION -->
                      <td class="text-end pe-3 pe-md-4">
                        <div class="d-flex justify-content-end gap-2">
                          <!-- EDIT -->
                          <button
                            type="button"
                            class="btn btn-sm btn-outline-primary action-btn"
                            @click="openEditModal(subject)"
                            title="Edit Subject"
                          >
                            <i class="bi bi-pencil"></i>
                          </button>

                          <!-- DELETE -->
                          <button
                            type="button"
                            class="btn btn-sm btn-outline-danger action-btn"
                            @click="deleteSubject(subject)"
                            title="Delete Subject"
                          >
                            <i class="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>

                    <!-- EMPTY -->
                    <tr v-if="!loading && filteredSubjects.length === 0">
                      <td colspan="6" class="text-center py-5">
                        <div class="empty-state">
                          <div class="empty-icon mb-3">
                            <i class="bi bi-book"></i>
                          </div>

                          <h6 class="fw-bold text-dark mb-1">No Subjects Found</h6>

                          <p class="text-muted small mb-3">
                            {{
                              searchQuery
                                ? 'No subject matches your search.'
                                : 'No subjects have been created yet.'
                            }}
                          </p>

                          <button
                            v-if="!searchQuery"
                            type="button"
                            class="btn btn-primary btn-sm"
                            @click="openCreateModal"
                          >
                            <i class="bi bi-plus-lg me-1"></i>
                            Add First Subject
                          </button>
                        </div>
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
  </div>

  <!-- =========================================================
       ADD / EDIT SUBJECT MODAL
  ========================================================== -->
  <div
    v-if="showModal"
    class="modal fade show"
    tabindex="-1"
    style="display: block"
    role="dialog"
    aria-modal="true"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content border-0 shadow">
        <!-- MODAL HEADER -->
        <div class="modal-header">
          <div>
            <h5 class="modal-title fw-bold text-dark mb-1">
              {{ editingSubject ? 'Edit Subject' : 'Add Subject' }}
            </h5>

            <p class="text-muted small mb-0">
              {{ editingSubject ? 'Update subject information' : 'Create a new academic subject' }}
            </p>
          </div>

          <button type="button" class="btn-close" @click="closeModal" :disabled="saving"></button>
        </div>

        <!-- MODAL BODY -->
        <div class="modal-body p-4">
          <!-- ERROR -->
          <div v-if="formError" class="alert alert-danger small py-2">
            <i class="bi bi-exclamation-triangle me-2"></i>
            {{ formError }}
          </div>

          <!-- =================================================
               BRANCH
          ================================================== -->
          <div v-if="role === 'Manager'" class="mb-3">
            <label class="form-label fw-semibold">
              Branch
              <span class="text-danger">*</span>
            </label>

            <select
              v-model="form.branch_id"
              class="form-select"
              :class="{
                'is-invalid': errors.branch_id,
              }"
              :disabled="branchesLoading"
            >
              <option value="">
                {{ branchesLoading ? 'Loading branches...' : 'Select Branch' }}
              </option>

              <option v-for="branch in branches" :key="branch.id" :value="branch.id">
                {{ branch.name }}
              </option>
            </select>

            <div v-if="errors.branch_id" class="invalid-feedback">
              {{ errors.branch_id }}
            </div>
          </div>

          <!-- SUBJECT NAME -->
          <div class="mb-3">
            <label class="form-label fw-semibold">
              Subject Name

              <span class="text-danger">*</span>
            </label>

            <input
              ref="subjectNameInput"
              type="text"
              v-model="form.name"
              class="form-control"
              :class="{
                'is-invalid': errors.name,
              }"
              placeholder="e.g. Mathematics"
              maxlength="255"
              @keyup.enter="saveSubject"
            />

            <div v-if="errors.name" class="invalid-feedback">
              {{ errors.name }}
            </div>
          </div>

          <!-- SUBJECT CODE -->
          <div class="mb-3">
            <label class="form-label fw-semibold">
              Subject Code

              <span class="text-danger">*</span>
            </label>

            <input
              type="text"
              v-model="form.code"
              class="form-control text-uppercase"
              :class="{
                'is-invalid': errors.code,
              }"
              placeholder="e.g. MATH"
              maxlength="50"
              @input="form.code = form.code.toUpperCase()"
              @keyup.enter="saveSubject"
            />

            <div v-if="errors.code" class="invalid-feedback">
              {{ errors.code }}
            </div>

            <div class="form-text">Use a unique code for each subject in the branch.</div>
          </div>

          <!-- FULL MARK -->
          <div class="mb-3">
            <label class="form-label fw-semibold">
              Full Mark

              <span class="text-danger">*</span>
            </label>

            <input
              type="number"
              v-model="form.full_mark"
              class="form-control"
              :class="{
                'is-invalid': errors.full_mark,
              }"
              placeholder="e.g. 100"
              min="1"
              step="1"
              @keyup.enter="saveSubject"
            />

            <div v-if="errors.full_mark" class="invalid-feedback">
              {{ errors.full_mark }}
            </div>

            <div class="form-text">Enter the maximum mark for this subject.</div>
          </div>
        </div>

        <!-- MODAL FOOTER -->
        <div class="modal-footer bg-light">
          <button type="button" class="btn btn-secondary" @click="closeModal" :disabled="saving">
            Cancel
          </button>

          <button
            type="button"
            class="btn btn-primary px-4"
            @click="saveSubject"
            :disabled="saving"
          >
            <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>

            <i v-else class="bi" :class="editingSubject ? 'bi-check-lg' : 'bi-plus-lg'"></i>

            {{ editingSubject ? 'Update Subject' : 'Create Subject' }}
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- MODAL BACKDROP -->
  <div v-if="showModal" class="modal-backdrop fade show" @click="closeModal"></div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'

import dashPageView from './dashPageView.vue'
import api from '@/services/api'

/* =========================================================
   ROLE
========================================================= */

const role = localStorage.getItem('role')

/* =========================================================
   STATES
========================================================= */

const subjects = ref([])
const loading = ref(false)
const saving = ref(false)

const searchQuery = ref('')

const showModal = ref(false)
const editingSubject = ref(null)

const formError = ref('')
const errors = ref({})

const subjectNameInput = ref(null)

/* =========================================================
   BRANCH STATES
========================================================= */

const branches = ref([])
const branchesLoading = ref(false)

/* =========================================================
   FORM
========================================================= */

const form = ref({
  name: '',
  code: '',
  full_mark: 100,
  branch_id: '',
})

/* =========================================================
   FETCH BRANCHES
========================================================= */

const fetchBranches = async () => {
  if (role !== 'Manager') {
    return
  }

  branchesLoading.value = true

  try {
    const response = await api.get('/branches')

    if (response.data && Array.isArray(response.data.data)) {
      branches.value = response.data.data
    } else if (response.data && Array.isArray(response.data.branches)) {
      branches.value = response.data.branches
    } else if (Array.isArray(response.data)) {
      branches.value = response.data
    } else {
      branches.value = []
    }
  } catch (error) {
    console.error('Error fetching branches:', error)

    branches.value = []

    formError.value = error.response?.data?.message || 'Failed to fetch branches.'
  } finally {
    branchesLoading.value = false
  }
}

/* =========================================================
   FETCH SUBJECTS
========================================================= */

const fetchSubjects = async () => {
  loading.value = true

  try {
    const response = await api.get('/subjects')

    if (response.data && Array.isArray(response.data.data)) {
      subjects.value = response.data.data
    } else if (Array.isArray(response.data)) {
      subjects.value = response.data
    } else {
      subjects.value = []
    }
  } catch (error) {
    console.error('Error fetching subjects:', error)

    subjects.value = []
  } finally {
    loading.value = false
  }
}

/* =========================================================
   FILTER SUBJECTS
========================================================= */

const filteredSubjects = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()

  if (!query) {
    return subjects.value
  }

  return subjects.value.filter((subject) => {
    const name = String(subject.name || '').toLowerCase()

    const code = String(subject.code || '').toLowerCase()

    return name.includes(query) || code.includes(query)
  })
})

/* =========================================================
   RESET FORM
========================================================= */

const resetForm = () => {
  form.value = {
    name: '',
    code: '',
    full_mark: 100,
    branch_id: '',
  }

  errors.value = {}
  formError.value = ''
}

/* =========================================================
   OPEN CREATE MODAL
========================================================= */

const openCreateModal = async () => {
  editingSubject.value = null

  resetForm()

  showModal.value = true

  if (role === 'Manager') {
    await fetchBranches()
  }

  await nextTick()

  subjectNameInput.value?.focus()
}

/* =========================================================
   OPEN EDIT MODAL
========================================================= */

const openEditModal = async (subject) => {
  editingSubject.value = subject

  errors.value = {}
  formError.value = ''

  form.value = {
    name: subject.name || '',

    code: subject.code || '',

    full_mark: subject.full_mark ?? 100,

    branch_id: subject.branch_id ? Number(subject.branch_id) : '',
  }

  showModal.value = true

  if (role === 'Manager') {
    await fetchBranches()
  }

  await nextTick()

  subjectNameInput.value?.focus()
}

/* =========================================================
   CLOSE MODAL
========================================================= */

const closeModal = () => {
  if (saving.value) {
    return
  }

  showModal.value = false

  editingSubject.value = null

  resetForm()
}

/* =========================================================
   VALIDATION
========================================================= */

const validateForm = () => {
  errors.value = {}

  let valid = true

  /* Branch */

  if (role === 'Manager' && !form.value.branch_id) {
    errors.value.branch_id = 'Branch is required.'

    valid = false
  }

  /* Subject Name */

  if (!form.value.name || !form.value.name.trim()) {
    errors.value.name = 'Subject name is required.'

    valid = false
  }

  /* Subject Code */

  if (!form.value.code || !form.value.code.trim()) {
    errors.value.code = 'Subject code is required.'

    valid = false
  }

  /* Full Mark */

  if (
    form.value.full_mark === '' ||
    form.value.full_mark === null ||
    form.value.full_mark === undefined
  ) {
    errors.value.full_mark = 'Full mark is required.'

    valid = false
  } else if (Number(form.value.full_mark) < 1) {
    errors.value.full_mark = 'Full mark must be at least 1.'

    valid = false
  }

  return valid
}

/* =========================================================
   SAVE SUBJECT
========================================================= */

const saveSubject = async () => {
  if (saving.value) {
    return
  }

  if (!validateForm()) {
    return
  }

  saving.value = true

  formError.value = ''
  errors.value = {}

  try {
    /* =====================================================
       PAYLOAD
    ====================================================== */

    const payload = {
      name: form.value.name.trim(),

      code: form.value.code.trim().toUpperCase(),

      full_mark: Number(form.value.full_mark),
    }

    /*
     * Manager must send branch_id.
     * Other roles are automatically assigned
     * their branch by the backend.
     */

    if (role === 'Manager') {
      payload.branch_id = Number(form.value.branch_id)
    }

    /* =====================================================
       CREATE
    ====================================================== */

    if (!editingSubject.value) {
      const response = await api.post('/subjects', payload)

      const newSubject = response.data?.data || response.data

      if (newSubject) {
        subjects.value.unshift(newSubject)
      }
    } else {
      /* ===================================================
         UPDATE
      ==================================================== */

      const response = await api.put(`/subjects/${editingSubject.value.id}`, payload)

      const updatedSubject = response.data?.data || response.data

      const index = subjects.value.findIndex((item) => item.id === editingSubject.value.id)

      if (index !== -1 && updatedSubject) {
        subjects.value[index] = updatedSubject
      }
    }

    closeModal()
  } catch (error) {
    console.error('FULL ERROR:', error)

    console.log('STATUS:', error.response?.status)

    console.log('RESPONSE DATA:', error.response?.data)

    /* =====================================================
       VALIDATION ERROR
    ====================================================== */

    if (error.response?.status === 422) {
      const validationErrors = error.response.data?.errors || {}

      errors.value = {}

      if (validationErrors.branch_id) {
        errors.value.branch_id = validationErrors.branch_id[0]
      }

      if (validationErrors.name) {
        errors.value.name = validationErrors.name[0]
      }

      if (validationErrors.code) {
        errors.value.code = validationErrors.code[0]
      }

      if (validationErrors.full_mark) {
        errors.value.full_mark = validationErrors.full_mark[0]
      }

      formError.value = error.response.data?.message || 'Please check the highlighted fields.'
    } else {
      formError.value = error.response?.data?.message || 'Something went wrong. Please try again.'
    }
  } finally {
    saving.value = false
  }
}

/* =========================================================
   DELETE SUBJECT
========================================================= */

const deleteSubject = async (subject) => {
  const subjectName = subject.name || 'this subject'

  const confirmed = window.confirm(`Are you sure you want to delete "${subjectName}"?`)

  if (!confirmed) {
    return
  }

  try {
    await api.delete(`/subjects/${subject.id}`)

    subjects.value = subjects.value.filter((item) => item.id !== subject.id)
  } catch (error) {
    console.error('Error deleting subject:', error)

    window.alert(error.response?.data?.message || 'Failed to delete subject.')
  }
}

/* =========================================================
   FORMAT DATE
========================================================= */

const formatDate = (dateValue) => {
  if (!dateValue) {
    return '-'
  }

  const date = new Date(dateValue)

  if (Number.isNaN(date.getTime())) {
    return '-'
  }

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

/* =========================================================
   ON MOUNT
========================================================= */

onMounted(() => {
  fetchSubjects()
})
</script>

<style scoped>
/* =========================================================
   MAIN LAYOUT
========================================================= */

.dashboard-layout {
  display: flex;
  width: 100%;
  overflow-x: hidden;
}

.sidebar-wrapper {
  flex-shrink: 0;
  min-width: 250px;
  z-index: 1000;
}

.main-wrapper {
  flex-grow: 1;
  width: calc(100% - 250px);
  overflow-y: auto;
}

/* =========================================================
   SUMMARY CARD
========================================================= */

.summary-card {
  transition: all 0.2s ease;
}

.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 0.125rem 0.4rem rgba(0, 0, 0, 0.08);
}

.summary-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

/* =========================================================
   SEARCH BOX
========================================================= */

.search-box-wrapper .input-group-text,
.search-box-wrapper .form-control {
  border-color: #e2e8f0;
}

.search-box-wrapper .input-group-text {
  border-radius: 6px 0 0 6px;
}

.search-box-wrapper .form-control {
  border-radius: 0 6px 6px 0;
}

.search-box-wrapper .form-control:focus {
  box-shadow: none;
  border-color: #86b7fe;
}

/* =========================================================
   SUBJECT TABLE
========================================================= */

.subject-table {
  border-collapse: separate;
  border-spacing: 0;
}

.subject-table thead th {
  border-bottom: 2px solid #e2e8f0 !important;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  padding-top: 0.85rem;
  padding-bottom: 0.85rem;
  white-space: nowrap;
}

.subject-row {
  border-bottom: 1px solid #e2e8f0;
}

.subject-row:last-child {
  border-bottom: none;
}

/* =========================================================
   SUBJECT ICON
========================================================= */

.subject-icon {
  width: 38px;
  height: 38px;
  min-width: 38px;
  border-radius: 8px;
  background-color: rgba(13, 110, 253, 0.08);
  color: #0d6efd;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* =========================================================
   ACTION BUTTON
========================================================= */

.action-btn {
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* =========================================================
   EMPTY STATE
========================================================= */

.empty-state {
  padding: 20px 10px;
}

.empty-icon {
  width: 58px;
  height: 58px;
  margin: 0 auto;
  border-radius: 50%;
  background-color: #f1f3f5;
  color: #6c757d;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

/* =========================================================
   MODAL
========================================================= */

.modal {
  z-index: 1055;
}

.modal-backdrop {
  z-index: 1050;
}

.modal-content {
  border-radius: 12px;
}

.modal-header {
  border-bottom: 1px solid #e9ecef;
}

.modal-footer {
  border-top: 1px solid #e9ecef;
}

/* =========================================================
   MOBILE
========================================================= */

@media (max-width: 768px) {
  .dashboard-layout {
    flex-direction: column;
  }

  .sidebar-wrapper {
    width: 100%;
    min-width: 100%;
  }

  .main-wrapper {
    width: 100%;
  }

  .subject-container {
    border-radius: 0 !important;
  }
}
</style>
