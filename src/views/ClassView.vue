<template>
  <dashPageView />

  <div class="container-fluid body py-4">
    <!-- =====================================================
         PAGE HEADER
    ====================================================== -->

    <div class="row mb-4 align-items-center">
      <div class="col">
        <h2 class="fw-bold text-dark mb-1">Class Management</h2>

        <p class="text-muted mb-0">Manage all Student Classes from here easily.</p>
      </div>

      <div class="col-auto">
        <button
          type="button"
          @click="openAddModal"
          class="btn btn-primary d-flex align-items-center gap-2 shadow-sm"
        >
          <i class="bi bi-plus-lg"></i>
          Add New Class
        </button>
      </div>
    </div>

    <!-- =====================================================
         ALERT MESSAGE
    ====================================================== -->

    <div
      v-if="message"
      class="alert alert-dismissible fade show shadow-sm"
      :class="isError ? 'alert-danger' : 'alert-success'"
      role="alert"
    >
      {{ message }}

      <button type="button" class="btn-close" @click="message = ''"></button>
    </div>

    <!-- =====================================================
         CLASSES TABLE
    ====================================================== -->

    <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light text-uppercase fs-7 text-secondary">
              <tr>
                <th class="py-3 ps-4">#ID</th>

                <th class="py-3">Class Name</th>

                <th class="py-3">Subjects</th>

                <th class="py-3 text-end pe-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              <!-- EMPTY -->

              <tr v-if="classes.length === 0">
                <td colspan="4" class="text-center py-5 text-muted">No classes found.</td>
              </tr>

              <!-- CLASS ROW -->

              <tr v-for="(cls, index) in classes" :key="cls.id">
                <!-- ID -->

                <td class="ps-4 fw-semibold text-secondary">
                  {{ cls.id || index + 1 }}
                </td>

                <!-- CLASS NAME -->

                <td class="fw-bold text-dark">
                  {{ cls.class_name || cls.name || 'N/A' }}
                </td>

                <!-- SUBJECTS -->

                <td>
                  <div v-if="cls.subjects && cls.subjects.length" class="d-flex flex-wrap gap-1">
                    <span
                      v-for="subject in cls.subjects"
                      :key="subject.id"
                      class="badge bg-primary-subtle text-primary border border-primary-subtle"
                    >
                      {{ subject.subject_name || subject.name }}
                    </span>
                  </div>

                  <span v-else class="text-muted small"> No subjects assigned </span>
                </td>

                <!-- ACTIONS -->

                <td class="text-end pe-4">
                  <button
                    type="button"
                    @click="openEditModal(cls)"
                    class="btn btn-sm btn-outline-primary me-2 px-3"
                  >
                    <i class="bi bi-pencil me-1"></i>
                    Edit
                  </button>

                  <button
                    type="button"
                    @click="deleteClass(cls.id)"
                    class="btn btn-sm btn-outline-danger px-3"
                  >
                    <i class="bi bi-trash me-1"></i>
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- =====================================================
         ADD / EDIT CLASS MODAL
    ====================================================== -->

    <div
      v-if="showModal"
      class="modal fade show d-block"
      tabindex="-1"
      aria-modal="true"
      role="dialog"
      style="background-color: rgba(0, 0, 0, 0.5)"
      @click.self="closeModal"
    >
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content border-0 shadow-lg rounded-4">
          <!-- MODAL HEADER -->

          <div class="modal-header border-0 pb-0">
            <div>
              <h5 class="modal-title fw-bold text-dark">
                {{ isEditMode ? 'Edit Class' : 'Add New Class' }}
              </h5>

              <p class="text-muted small mb-0">
                {{
                  isEditMode
                    ? 'Update class information and assigned subjects.'
                    : 'Create a class and assign subjects.'
                }}
              </p>
            </div>

            <button type="button" class="btn-close" :disabled="saving" @click="closeModal"></button>
          </div>

          <!-- FORM -->

          <form @submit.prevent="saveClass">
            <div class="modal-body py-4">
              <!-- =================================================
                   BRANCH
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
                   CLASS NAME
              ================================================== -->

              <div class="mb-4">
                <label class="form-label fw-semibold text-secondary">
                  Class Name

                  <span class="text-danger">*</span>
                </label>

                <input
                  type="text"
                  v-model="form.class_name"
                  placeholder="e.g. Class 7"
                  required
                  class="form-control form-control-lg fs-6"
                />
              </div>

              <!-- =================================================
                   SUBJECT SECTION
              ================================================== -->

              <div>
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <label class="form-label fw-semibold text-secondary mb-0">
                    Assign Subjects
                  </label>

                  <span class="badge bg-primary-subtle text-primary">
                    {{ form.subject_ids.length }} Selected
                  </span>
                </div>

                <div class="border rounded-3 p-3 subject-selection-box">
                  <!-- LOADING -->

                  <div v-if="subjectsLoading" class="text-center py-4 text-muted">
                    <div class="spinner-border spinner-border-sm me-2" role="status"></div>

                    Loading subjects...
                  </div>

                  <!-- MANAGER: NO BRANCH SELECTED -->

                  <div
                    v-else-if="role === 'Manager' && !form.branch_id"
                    class="text-center py-4 text-muted"
                  >
                    <i class="bi bi-diagram-3 fs-3 d-block mb-2"></i>

                    Please select a branch first.

                    <div class="small mt-1">Subjects will appear after selecting a branch.</div>
                  </div>

                  <!-- NO SUBJECT -->

                  <div
                    v-else-if="availableSubjects.length === 0"
                    class="text-center py-4 text-muted"
                  >
                    <i class="bi bi-book fs-3 d-block mb-2"></i>

                    No subjects found.

                    <div class="small mt-1">Please create subjects for this branch first.</div>
                  </div>

                  <!-- SUBJECT CHECKBOXES -->

                  <div v-else class="row g-2">
                    <div
                      v-for="subject in availableSubjects"
                      :key="subject.id"
                      class="col-12 col-sm-6 col-md-4"
                    >
                      <div
                        class="form-check subject-check-card border rounded-3 p-3"
                        :class="{
                          'selected-subject': form.subject_ids.includes(Number(subject.id)),
                        }"
                        @click="toggleSubject(subject.id)"
                      >
                        <input
                          class="form-check-input ms-0 me-2"
                          type="checkbox"
                          :id="'subject-' + subject.id"
                          :value="Number(subject.id)"
                          v-model="form.subject_ids"
                          @click.stop
                        />

                        <label
                          class="form-check-label fw-semibold"
                          :for="'subject-' + subject.id"
                          @click.stop
                        >
                          {{ subject.subject_name || subject.name }}

                          <span v-if="subject.code" class="d-block text-muted small mt-1">
                            {{ subject.code }}
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="form-text mt-2">
                  Select all subjects that should be available for this class.
                </div>
              </div>
            </div>

            <!-- =================================================
                 MODAL FOOTER
            ================================================== -->

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

                <i v-else class="bi" :class="isEditMode ? 'bi-check-lg' : 'bi-plus-lg'"></i>

                {{ isEditMode ? 'Update Class' : 'Save Class' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import api from '../services/api'
import dashPageView from './dashPageView.vue'

/* =========================================================
   ROLE
========================================================= */

const role = localStorage.getItem('role')

/* =========================================================
   ACADEMIC ACCESS
========================================================= */

const hasAcademicAccess = computed(() => {
  return !['Branch Accountant', 'Accountant'].includes(role)
})

/* =========================================================
   CLASSES
========================================================= */

const classes = ref([])

/* =========================================================
   SUBJECTS
========================================================= */

const subjects = ref([])
const subjectsLoading = ref(false)

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
const currentClassID = ref(null)
const saving = ref(false)

/* =========================================================
   FORM
========================================================= */

const form = ref({
  class_name: '',
  branch_id: '',
  subject_ids: [],
})

/* =========================================================
   ALERT
========================================================= */

const message = ref('')
const isError = ref(false)

/* =========================================================
   AVAILABLE SUBJECTS
=========================================================
   Manager:
   - Branch select করার পর selected branch-এর subjects দেখাবে।

   Admin / Branch Manager:
   - Backend /subjects endpoint থেকেই own branch-এর
     subjects আসবে।
   - তাই এখানে subjects.value সরাসরি দেখানো হবে।
========================================================= */

const availableSubjects = computed(() => {
  if (role === 'Manager') {
    if (!form.value.branch_id) {
      return []
    }

    return subjects.value.filter(
      (subject) => Number(subject.branch_id) === Number(form.value.branch_id),
    )
  }

  return subjects.value
})

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
  currentClassID.value = null

  form.value = {
    class_name: '',
    branch_id: '',
    subject_ids: [],
  }

  subjects.value = []

  message.value = ''
  isError.value = false

  showModal.value = true

  /*
   * Manager:
   * প্রথমে শুধু Branch load হবে।
   * Branch select না করা পর্যন্ত subjects load হবে না।
   */

  if (role === 'Manager') {
    await fetchBranches()
  } else {
    /*
     * Admin / Branch Manager:
     * Backend নিজের branch-এর subjects return করবে।
     */

    await fetchSubjects()
  }
}

/* =========================================================
   OPEN EDIT MODAL
========================================================= */

const openEditModal = async (classItem) => {
  console.log('EDIT CLICKED:', classItem)

  isEditMode.value = true
  currentClassID.value = classItem.id

  form.value = {
    class_name: classItem.class_name || classItem.name || '',

    branch_id: classItem.branch_id ? Number(classItem.branch_id) : '',

    subject_ids: Array.isArray(classItem.subjects)
      ? classItem.subjects.map((subject) => Number(subject.id))
      : [],
  }

  subjects.value = []

  message.value = ''
  isError.value = false

  showModal.value = true

  /*
   * Manager-এর existing class-এর branch_id already আছে।
   * তাই সেই branch-এর subjects load হবে।
   */

  if (role === 'Manager') {
    await fetchBranches()
    await fetchSubjects()
  } else {
    /*
     * Admin / Branch Manager:
     * নিজের branch-এর subjects load হবে।
     */

    await fetchSubjects()
  }
}

/* =========================================================
   WATCH BRANCH CHANGE
=========================================================
   Manager branch change করলে নতুন branch-এর subjects
   আবার API থেকে load হবে।
========================================================= */

watch(
  () => form.value.branch_id,
  async (newBranchId, oldBranchId) => {
    /*
     * শুধু Manager-এর ক্ষেত্রে branch change-এর
     * উপর subject reload হবে।
     */

    if (role !== 'Manager') {
      return
    }

    if (!newBranchId) {
      subjects.value = []

      form.value.subject_ids = []

      return
    }

    /*
     * Branch change হলে নতুন branch-এর subjects load।
     */

    await fetchSubjects()

    const branchId = Number(newBranchId)

    /*
     * নতুন branch-এর বাইরে কোনো previously selected
     * subject থাকলে remove করা হবে।
     */

    form.value.subject_ids = form.value.subject_ids.filter((subjectId) => {
      const subject = subjects.value.find((item) => Number(item.id) === Number(subjectId))

      return subject && Number(subject.branch_id) === branchId
    })
  },
)

/* =========================================================
   TOGGLE SUBJECT
========================================================= */

const toggleSubject = (subjectId) => {
  const id = Number(subjectId)

  const index = form.value.subject_ids.indexOf(id)

  if (index === -1) {
    form.value.subject_ids.push(id)
  } else {
    form.value.subject_ids.splice(index, 1)
  }
}

/* =========================================================
   FETCH CLASSES
========================================================= */

const fetchClasses = async () => {
  try {
    const response = await api.get('/classes')

    if (Array.isArray(response.data)) {
      classes.value = response.data
    } else if (response.data && Array.isArray(response.data.data)) {
      classes.value = response.data.data
    } else if (response.data && Array.isArray(response.data.classes)) {
      classes.value = response.data.classes
    } else {
      classes.value = []
    }
  } catch (error) {
    console.error('Failed to fetch classes:', error)

    showAlert(error.response?.data?.message || 'Failed to fetch classes.', true)
  }
}

/* =========================================================
   FETCH SUBJECTS
=========================================================
   Manager:
   /subjects?branch_id=selectedBranch

   Admin / Branch Manager:
   /subjects
   Backend নিজের branch-এর subjects দেবে।
========================================================= */

const fetchSubjects = async () => {
  subjectsLoading.value = true

  try {
    let response

    if (role === 'Manager') {
      /*
       * Manager-এর branch select করা না থাকলে
       * কোনো subject request করা হবে না।
       */

      if (!form.value.branch_id) {
        subjects.value = []

        return
      }

      response = await api.get('/subjects', {
        params: {
          branch_id: Number(form.value.branch_id),
        },
      })
    } else {
      /*
       * Admin / Branch Manager:
       * Backend নিজে own branch scope করবে।
       */

      response = await api.get('/subjects')
    }

    if (Array.isArray(response.data)) {
      subjects.value = response.data
    } else if (response.data && Array.isArray(response.data.data)) {
      subjects.value = response.data.data
    } else if (response.data && Array.isArray(response.data.subjects)) {
      subjects.value = response.data.subjects
    } else {
      subjects.value = []
    }
  } catch (error) {
    console.error('Failed to fetch subjects:', error)

    subjects.value = []

    showAlert(error.response?.data?.message || 'Failed to fetch subjects.', true)
  } finally {
    subjectsLoading.value = false
  }
}

/* =========================================================
   SAVE CLASS
========================================================= */

const saveClass = async () => {
  if (saving.value) {
    return
  }

  /* Class Name validation */

  if (!form.value.class_name.trim()) {
    showAlert('Class name is required.', true)

    return
  }

  /* Manager branch validation */

  if (role === 'Manager' && !form.value.branch_id) {
    showAlert('Please select a branch.', true)

    return
  }

  saving.value = true

  try {
    /* =====================================================
       PAYLOAD
    ====================================================== */

    const payload = {
      class_name: form.value.class_name.trim(),

      subject_ids: form.value.subject_ids.map((id) => Number(id)),
    }

    /* =====================================================
       MANAGER BRANCH
    ====================================================== */

    if (role === 'Manager') {
      payload.branch_id = Number(form.value.branch_id)
    }

    /* =====================================================
       UPDATE
    ====================================================== */

    if (isEditMode.value) {
      console.log('UPDATING CLASS:', currentClassID.value, payload)

      const response = await api.put(`/classes/${currentClassID.value}`, payload)

      if (response.status === 200 || response.data?.status) {
        showAlert(response.data?.message || 'Class updated successfully!')

        closeModal()

        await fetchClasses()
      }
    } else {
      /* =================================================
         CREATE
      ================================================== */

      console.log('CREATING CLASS:', payload)

      const response = await api.post('/classes', payload)

      if (response.status === 201 || response.status === 200 || response.data?.status) {
        showAlert(response.data?.message || 'Class created successfully!')

        closeModal()

        await fetchClasses()
      }
    }
  } catch (error) {
    console.error('Class save error:', error)

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

  currentClassID.value = null

  subjects.value = []

  form.value = {
    class_name: '',
    branch_id: '',
    subject_ids: [],
  }
}

/* =========================================================
   DELETE CLASS
========================================================= */

const deleteClass = async (id) => {
  console.log('DELETE CLICKED:', id)

  if (!id) {
    showAlert('Invalid class ID.', true)

    return
  }

  if (!confirm('Are you sure you want to delete this class?')) {
    return
  }

  try {
    const response = await api.delete(`/classes/${id}`)

    console.log('DELETE RESPONSE:', response.data)

    if (response.status === 200 || response.data?.status) {
      showAlert(response.data?.message || 'Class deleted successfully!')

      await fetchClasses()
    }
  } catch (error) {
    console.error('Failed to delete class:', error)

    console.error('Delete response:', error.response?.data)

    showAlert(error.response?.data?.message || 'Failed to delete class.', true)
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
   ON MOUNT
========================================================= */

onMounted(() => {
  if (!hasAcademicAccess.value) {
    return
  }

  fetchClasses()
})
</script>

<style scoped>
/* =========================================================
   BODY
========================================================= */

.body {
  width: 86%;

  margin-left: 259px;
}

/* =========================================================
   SUBJECT SELECTION BOX
========================================================= */

.subject-selection-box {
  background-color: #f8f9fa;

  max-height: 320px;

  overflow-y: auto;
}

/* =========================================================
   SUBJECT CHECK CARD
========================================================= */

.subject-check-card {
  background-color: #ffffff;

  cursor: pointer;

  transition: all 0.2s ease;

  min-height: 70px;

  display: flex;

  align-items: flex-start;
}

/* Hover */

.subject-check-card:hover {
  border-color: #86b7fe !important;

  background-color: #f8fbff;
}

/* Selected */

.subject-check-card.selected-subject {
  border-color: #0d6efd !important;

  background-color: rgba(13, 110, 253, 0.06);
}

/* Checkbox */

.subject-check-card .form-check-input {
  margin-top: 3px;

  cursor: pointer;
}

/* Label */

.subject-check-card .form-check-label {
  cursor: pointer;

  flex: 1;
}

/* =========================================================
   TABLE
========================================================= */

.table th {
  font-size: 0.8rem;

  letter-spacing: 0.03em;
}

.table td {
  vertical-align: middle;
}

/* =========================================================
   MODAL
========================================================= */

.modal {
  z-index: 1055;
}

/* =========================================================
   MOBILE
========================================================= */

@media (max-width: 768px) {
  .body {
    width: 100%;

    margin-left: 0;

    padding: 15px;
  }
}
</style>
