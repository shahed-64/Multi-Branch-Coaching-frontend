<template>
  <RouterView />

  <dashPageView />

  <div class="container-fluid body py-4">
    <!-- Page Header -->
    <div class="row mb-4 align-items-center">
      <div class="col">
        <h2 class="fw-bold text-dark mb-1">Examination Management</h2>
        <p class="text-muted mb-0">Manage all teacher examinations and schedules easily.</p>
      </div>

      <div class="col-auto">
        <button
          @click="openAddModal"
          class="btn btn-primary d-flex align-items-center gap-2 shadow-sm"
        >
          <i class="bi bi-plus-lg"></i>
          Add New Examination
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
    </div>

    <!-- Examinations Table Card -->
    <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light text-uppercase fs-7 text-secondary">
              <tr>
                <th class="py-3 ps-4">#ID</th>
                <th class="py-3">Examination Name</th>
                <th class="py-3">Examination Year</th>
                <th class="py-3">Exam Mark</th>
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
                  Loading examinations...
                </td>
              </tr>

              <tr v-else-if="examinations.length === 0">
                <td colspan="5" class="text-center py-5 text-muted">No examinations found.</td>
              </tr>

              <tr v-for="(examination, index) in examinations" :key="examination.id">
                <td class="ps-4 fw-semibold text-secondary">
                  {{ index + 1 }}
                </td>

                <td class="fw-bold text-dark">
                  {{ examination.examination_type }}
                </td>

                <td class="fw-bold text-dark">
                  {{ examination.examination_year }}
                </td>

                <td>
                  <!-- <span>{{ examination.start_time }}</span> -->
                </td>

                <td class="fw-bold text-dark">
                  {{ examination.exam_mark ?? 'Subject Mark' }}
                </td>

                <td></td>

                <td class="text-end pe-4">
                  <button
                    @click="openEditModal(examination)"
                    class="btn btn-sm btn-outline-primary me-2 px-3"
                  >
                    Edit
                  </button>

                  <button
                    @click="deleteExamination(examination.id)"
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

    <!-- Modal for Add/Edit Examination -->
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
              {{ isEditMode ? 'Edit Examination' : 'Add New Examination' }}
            </h5>

            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>

          <form @submit.prevent="saveExamination">
            <div class="modal-body py-4">
              <!-- ================= MANAGER BRANCH ================= -->
              <div v-if="role === 'Manager'" class="mb-3">
                <label class="form-label fw-semibold text-secondary small"> Branch </label>

                <select v-model="form.branch_id" class="form-select form-select-lg fs-6" required>
                  <option value="" disabled>Select Branch</option>

                  <option v-for="branch in branches" :key="branch.id" :value="branch.id">
                    {{ branch.name }}
                  </option>
                </select>
              </div>

              <!-- Examination Name -->
              <div class="mb-3">
                <label class="form-label fw-semibold text-secondary small">
                  Examination Name
                </label>

                <input
                  type="text"
                  v-model="form.examination_type"
                  @input="form.examination_type = form.examination_type.toUpperCase()"
                  placeholder="e.g. MORNING EXAMINATION"
                  required
                  class="form-control form-control-lg fs-6 text-uppercase"
                />

                <label class="form-label fw-semibold text-secondary small mt-3">
                  Examination Year
                </label>

                <input
                  type="text"
                  v-model="form.examination_year"
                  placeholder="e.g. Examination Year"
                  required
                  class="form-control form-control-lg fs-6"
                />
              </div>

              <!-- Exam Mark -->
              <div class="mb-3">
                <label class="form-label fw-semibold text-secondary small"> Exam Mark </label>

                <input
                  type="number"
                  v-model="form.exam_mark"
                  min="1"
                  step="0.01"
                  placeholder="e.g. 20, 25"
                  class="form-control form-control-lg fs-6"
                />

                <small class="text-muted">
                  Optional — leave empty if this exam should use the subject's full mark.
                </small>
              </div>
            </div>

            <div class="modal-footer border-0 pt-0">
              <button type="button" @click="closeModal" class="btn btn-light px-4">Cancel</button>

              <button type="submit" class="btn btn-primary px-4">
                {{ isEditMode ? 'Update Examination' : 'Save Examination' }}
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

const examinations = ref([])
const branches = ref([])

const loading = ref(false)
const showModal = ref(false)
const isEditMode = ref(false)
const currentExaminationId = ref(null)

const role = localStorage.getItem('role')

const form = ref({
  examination_type: '',
  examination_year: '',
  exam_mark: '',
  branch_id: '',
})

const message = ref('')
const isError = ref(false)

/*
|--------------------------------------------------------------------------
| Fetch Branches
|--------------------------------------------------------------------------
*/

const fetchBranches = async () => {
  if (role !== 'Manager') {
    return
  }

  try {
    const response = await api.get('/branches')

    branches.value = response.data.branches || []
  } catch (error) {
    console.error('Fetch branches error:', error)

    showAlert(error.response?.data?.message || 'Failed to fetch branches.', true)
  }
}

/*
|--------------------------------------------------------------------------
| Fetch Examinations
|--------------------------------------------------------------------------
*/

const fetchExaminations = async () => {
  loading.value = true

  try {
    const response = await api.get('/examinations')

    if (response.data.status) {
      examinations.value = response.data.data
    }
  } catch (error) {
    showAlert('Failed to fetch examinations.', true)
  } finally {
    loading.value = false
  }
}

/*
|--------------------------------------------------------------------------
| Open Add Modal
|--------------------------------------------------------------------------
*/

const openAddModal = () => {
  isEditMode.value = false

  form.value.examination_type = ''
  form.value.examination_year = ''
  form.value.exam_mark = ''
  form.value.branch_id = ''

  currentExaminationId.value = null

  showModal.value = true
}

/*
|--------------------------------------------------------------------------
| Open Edit Modal
|--------------------------------------------------------------------------
*/

const openEditModal = (examination) => {
  isEditMode.value = true

  form.value.examination_type = examination.examination_type
  form.value.examination_year = examination.examination_year
  form.value.exam_mark = examination.exam_mark ?? ''

  // Manager হলে existing branch automatically selected হবে
  form.value.branch_id = examination.branch_id ?? ''

  currentExaminationId.value = examination.id

  showModal.value = true
}

/*
|--------------------------------------------------------------------------
| Close Modal
|--------------------------------------------------------------------------
*/

const closeModal = () => {
  showModal.value = false
}

/*
|--------------------------------------------------------------------------
| Save / Update Examination
|--------------------------------------------------------------------------
*/

const saveExamination = async () => {
  try {
    // Manager-এর জন্য branch অবশ্যই select করতে হবে
    if (role === 'Manager' && !form.value.branch_id) {
      showAlert('Please select a branch.', true)
      return
    }

    let response

    if (isEditMode.value) {
      response = await api.put(`/examinations/${currentExaminationId.value}`, form.value)
    } else {
      response = await api.post('/examinations', form.value)
    }

    if (response.data.status) {
      showAlert(response.data.message)

      fetchExaminations()

      closeModal()
    }
  } catch (error) {
    showAlert(error.response?.data?.message || 'Something went wrong!', true)
  }
}

/*
|--------------------------------------------------------------------------
| Delete Examination
|--------------------------------------------------------------------------
*/

const deleteExamination = async (id) => {
  if (confirm('Are you sure you want to delete this examination?')) {
    try {
      const response = await api.delete(`/examinations/${id}`)

      if (response.data.status) {
        showAlert(response.data.message)

        fetchExaminations()
      }
    } catch (error) {
      showAlert('Failed to delete examination.', true)
    }
  }
}

/*
|--------------------------------------------------------------------------
| Alert
|--------------------------------------------------------------------------
*/

const showAlert = (msg, error = false) => {
  message.value = msg
  isError.value = error

  setTimeout(() => {
    message.value = ''
  }, 3000)
}

/*
|--------------------------------------------------------------------------
| Initial Load
|--------------------------------------------------------------------------
*/

onMounted(() => {
  fetchExaminations()
  fetchBranches()
})
</script>

<style scoped>
.body {
  width: 86%;
  margin-left: 259px;
}

/* মোবাইল ও ছোট ডিভাইসের জন্য রেসপন্সিভ স্টাইল */

@media (max-width: 768px) {
  .body {
    width: 100%;
    margin-left: 0;
    padding: 15px;
  }
}
</style>
