<template>
  <dashPageView />

  <div class="container-fluid body py-4">
    <!-- Unauthorized -->
    <div v-if="!hasAcademicAccess" class="alert alert-danger">
      You are not authorized to access Class Groups.
    </div>

    <template v-else>
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h3 class="fw-bold mb-0">Class Group Management</h3>

        <button class="btn btn-primary" @click="openAddModal">
          <i class="bi bi-plus-lg me-1"></i>
          Add New Group
        </button>
      </div>

      <!-- Message -->
      <div v-if="message" class="alert" :class="isError ? 'alert-danger' : 'alert-success'">
        {{ message }}
      </div>

      <!-- Loading -->
      <div v-if="loadingGroups" class="text-center py-5">
        <div class="spinner-border text-primary"></div>
      </div>

      <!-- Table -->
      <div v-else class="card border-0 shadow-sm rounded-4">
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th class="ps-4">#ID</th>
                  <th>Group Name</th>
                  <th>Optional Subjects</th>
                  <th>Group Subjects</th>
                  <th class="text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                <tr v-if="groups.length === 0">
                  <td colspan="5" class="text-center py-4 text-muted">No class groups found.</td>
                </tr>

                <tr v-for="group in groups" :key="group.id">
                  <td class="ps-4">
                    {{ group.id }}
                  </td>

                  <td>
                    <span class="fw-semibold">
                      {{ group.group_name }}
                    </span>
                  </td>

                  <!-- Optional Subjects -->
                  <td>
                    <template v-if="group.subjects && group.subjects.length">
                      <span
                        v-for="subject in group.subjects"
                        :key="subject.id"
                        class="badge bg-primary-subtle text-primary me-1 mb-1"
                      >
                        {{ subject.name }}
                      </span>
                    </template>

                    <span v-else class="text-muted"> - </span>
                  </td>

                  <!-- Group Subjects -->
                  <td>
                    <template
                      v-if="group.group_subject_mappings && group.group_subject_mappings.length"
                    >
                      <span
                        v-for="mapping in group.group_subject_mappings"
                        :key="mapping.id"
                        class="badge bg-success-subtle text-success me-1 mb-1"
                      >
                        {{ mapping.subject?.name }}
                      </span>
                    </template>

                    <span v-else class="text-muted"> - </span>
                  </td>

                  <!-- Actions -->
                  <td class="text-center">
                    <button
                      class="btn btn-sm btn-outline-primary me-1"
                      @click="openEditModal(group)"
                    >
                      <i class="bi bi-pencil"></i>
                    </button>

                    <button class="btn btn-sm btn-outline-danger" @click="deleteGroup(group.id)">
                      <i class="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>

    <!-- ================= MODAL ================= -->

    <div
      v-if="showModal"
      class="modal fade show d-block"
      tabindex="-1"
      style="background: rgba(0, 0, 0, 0.5)"
    >
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 rounded-4 shadow">
          <!-- Modal Header -->
          <div class="modal-header">
            <h5 class="modal-title fw-bold">
              {{ isEditMode ? 'Edit Class Group' : 'Add New Class Group' }}
            </h5>

            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>

          <!-- Modal Body -->
          <div class="modal-body">
            <!-- Manager Branch -->
            <div v-if="role === 'Manager'" class="mb-3">
              <label class="form-label fw-semibold"> Branch </label>

              <select v-model="form.branch_id" class="form-select">
                <option value="">Select Branch</option>

                <option v-for="branch in branches" :key="branch.id" :value="branch.id">
                  {{ branch.name }}
                </option>
              </select>
            </div>

            <!-- Group Name -->
            <div class="mb-4">
              <label class="form-label fw-semibold"> Group Name </label>

              <input
                v-model="form.group_name"
                type="text"
                class="form-control"
                placeholder="Enter group name"
              />
            </div>

            <!-- Loading Subjects -->
            <div v-if="subjectsLoading" class="text-center py-4">
              <div class="spinner-border text-primary"></div>
              <div class="small text-muted mt-2">Loading subjects...</div>
            </div>

            <template v-else>
              <!-- ================= GROUP SUBJECTS ================= -->

              <div class="mb-4">
                <label class="form-label fw-semibold"> Group Subjects </label>

                <div v-if="availableSubjects.length" class="subject-grid">
                  <label
                    v-for="subject in availableSubjects"
                    :key="'group-' + subject.id"
                    class="subject-card"
                  >
                    <input type="checkbox" :value="subject.id" v-model="form.group_subject_ids" />

                    <span>
                      {{ subject.name }}
                    </span>
                  </label>
                </div>

                <div v-else class="text-muted small">
                  {{
                    role === 'Manager' && !form.branch_id
                      ? 'Please select a branch first.'
                      : 'No subjects found for this branch.'
                  }}
                </div>
              </div>

              <!-- ================= OPTIONAL SUBJECTS ================= -->

              <div class="mb-3">
                <label class="form-label fw-semibold"> Optional Subjects </label>

                <div v-if="availableSubjects.length" class="subject-grid">
                  <label
                    v-for="subject in availableSubjects"
                    :key="'optional-' + subject.id"
                    class="subject-card"
                  >
                    <input type="checkbox" :value="subject.id" v-model="form.subject_ids" />

                    <span>
                      {{ subject.name }}
                    </span>
                  </label>
                </div>

                <div v-else class="text-muted small">
                  {{
                    role === 'Manager' && !form.branch_id
                      ? 'Please select a branch first.'
                      : 'No subjects found for this branch.'
                  }}
                </div>
              </div>
            </template>
          </div>

          <!-- Modal Footer -->
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeModal">Cancel</button>

            <button type="button" class="btn btn-primary" :disabled="saving" @click="saveGroup">
              <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>

              <i v-else class="bi bi-check-lg me-1"></i>

              {{ isEditMode ? 'Update Group' : 'Save Group' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import api from '../services/api'
import dashPageView from './dashPageView.vue'

const role = localStorage.getItem('role')

/*
|--------------------------------------------------------------------------
| Academic Access
|--------------------------------------------------------------------------
*/

const hasAcademicAccess = computed(() => {
  return !['Branch Accountant', 'Accountant'].includes(role)
})

/*
|--------------------------------------------------------------------------
| Branches
|--------------------------------------------------------------------------
*/

const branches = ref([])
const branchesLoading = ref(false)

/*
|--------------------------------------------------------------------------
| Class Groups
|--------------------------------------------------------------------------
*/

const groups = ref([])
const loadingGroups = ref(false)

/*
|--------------------------------------------------------------------------
| Subjects
|--------------------------------------------------------------------------
*/

const subjects = ref([])
const subjectsLoading = ref(false)

/*
|--------------------------------------------------------------------------
| Modal
|--------------------------------------------------------------------------
*/

const showModal = ref(false)
const isEditMode = ref(false)
const currentGroupID = ref(null)
const saving = ref(false)

/*
|--------------------------------------------------------------------------
| Form
|--------------------------------------------------------------------------
*/

const form = ref({
  group_name: '',
  branch_id: '',
  subject_ids: [],
  group_subject_ids: [],
})

/*
|--------------------------------------------------------------------------
| Message
|--------------------------------------------------------------------------
*/

const message = ref('')
const isError = ref(false)

/*
|--------------------------------------------------------------------------
| Available Subjects
|--------------------------------------------------------------------------
|
| Manager:
|   branch select করার পর সেই branch-এর subject দেখাবে।
|
| Admin / Branch Manager:
|   backend already own branch-এর subject পাঠাবে।
|   তাই এখানে সব returned subject দেখানো হবে।
|
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Fetch Branches
|--------------------------------------------------------------------------
*/

const fetchBranches = async () => {
  branchesLoading.value = true

  try {
    const response = await api.get('/branches')

    if (Array.isArray(response.data)) {
      branches.value = response.data
    } else if (Array.isArray(response.data?.data)) {
      branches.value = response.data.data
    } else if (Array.isArray(response.data?.branches)) {
      branches.value = response.data.branches
    } else {
      branches.value = []
    }
  } catch (error) {
    console.error('Failed to fetch branches:', error)

    branches.value = []

    showMessage(error.response?.data?.message || 'Failed to load branches.', true)
  } finally {
    branchesLoading.value = false
  }
}

/*
|--------------------------------------------------------------------------
| Fetch Class Groups
|--------------------------------------------------------------------------
*/

const fetchGroups = async () => {
  loadingGroups.value = true

  try {
    const response = await api.get('/class-groups')

    if (Array.isArray(response.data)) {
      groups.value = response.data
    } else if (Array.isArray(response.data?.data)) {
      groups.value = response.data.data
    } else if (Array.isArray(response.data?.class_groups)) {
      groups.value = response.data.class_groups
    } else {
      groups.value = []
    }
  } catch (error) {
    console.error('Failed to fetch class groups:', error)

    groups.value = []

    showMessage(error.response?.data?.message || 'Failed to load class groups.', true)
  } finally {
    loadingGroups.value = false
  }
}

/*
|--------------------------------------------------------------------------
| Fetch Subjects
|--------------------------------------------------------------------------
|
| Manager:
|   /subjects?branch_id=SELECTED_BRANCH
|
| Admin / Branch Manager:
|   /subjects
|   Backend automatically own branch-এর subject দেবে।
|
|--------------------------------------------------------------------------
*/

const fetchSubjects = async () => {
  subjectsLoading.value = true

  try {
    let response

    if (role === 'Manager') {
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
      response = await api.get('/subjects')
    }

    if (Array.isArray(response.data)) {
      subjects.value = response.data
    } else if (Array.isArray(response.data?.data)) {
      subjects.value = response.data.data
    } else if (Array.isArray(response.data?.subjects)) {
      subjects.value = response.data.subjects
    } else {
      subjects.value = []
    }
  } catch (error) {
    console.error('Failed to fetch subjects:', error)

    subjects.value = []

    showMessage(error.response?.data?.message || 'Failed to load subjects.', true)
  } finally {
    subjectsLoading.value = false
  }
}

/*
|--------------------------------------------------------------------------
| Branch Change
|--------------------------------------------------------------------------
|
| Manager branch change করলে নতুন branch-এর subjects reload হবে।
|
|--------------------------------------------------------------------------
*/

watch(
  () => form.value.branch_id,
  async (newBranchId) => {
    if (!newBranchId) {
      form.value.subject_ids = []
      form.value.group_subject_ids = []

      if (role === 'Manager') {
        subjects.value = []
      }

      return
    }

    if (role === 'Manager') {
      await fetchSubjects()
    }

    const branchId = Number(newBranchId)

    /*
    |--------------------------------------------------------------------------
    | Remove previously selected subjects that do not belong
    | to the newly selected branch.
    |--------------------------------------------------------------------------
    */

    form.value.subject_ids = form.value.subject_ids.filter((subjectId) => {
      const subject = subjects.value.find((item) => Number(item.id) === Number(subjectId))

      return subject && Number(subject.branch_id) === branchId
    })

    form.value.group_subject_ids = form.value.group_subject_ids.filter((subjectId) => {
      const subject = subjects.value.find((item) => Number(item.id) === Number(subjectId))

      return subject && Number(subject.branch_id) === branchId
    })
  },
)

/*
|--------------------------------------------------------------------------
| Open Add Modal
|--------------------------------------------------------------------------
*/

const openAddModal = async () => {
  clearMessage()

  isEditMode.value = false
  currentGroupID.value = null

  form.value = {
    group_name: '',
    branch_id: '',
    subject_ids: [],
    group_subject_ids: [],
  }

  subjects.value = []

  showModal.value = true

  /*
  |--------------------------------------------------------------------------
  | Manager
  |--------------------------------------------------------------------------
  | Branch select করার আগে subject load হবে না।
  |--------------------------------------------------------------------------
  */

  if (role === 'Manager') {
    await fetchBranches()
  } else {
    /*
    |--------------------------------------------------------------------------
    | Admin / Branch Manager
    |--------------------------------------------------------------------------
    | Backend own branch-এর subject দেবে।
    |--------------------------------------------------------------------------
    */

    await fetchSubjects()
  }
}

/*
|--------------------------------------------------------------------------
| Open Edit Modal
|--------------------------------------------------------------------------
*/

const openEditModal = async (group) => {
  clearMessage()

  isEditMode.value = true
  currentGroupID.value = group.id

  form.value = {
    group_name: group.group_name || '',
    branch_id: group.branch_id || '',
    subject_ids: group.subjects ? group.subjects.map((subject) => Number(subject.id)) : [],
    group_subject_ids: group.group_subject_mappings
      ? group.group_subject_mappings.map((mapping) => Number(mapping.subject_id)).filter(Boolean)
      : [],
  }

  subjects.value = []

  showModal.value = true

  /*
  |--------------------------------------------------------------------------
  | Manager
  |--------------------------------------------------------------------------
  | Existing group-এর branch already form-এ আছে,
  | তাই সেই branch-এর subjects load হবে।
  |--------------------------------------------------------------------------
  */

  if (role === 'Manager') {
    await fetchBranches()
    await fetchSubjects()
  } else {
    await fetchSubjects()
  }
}

/*
|--------------------------------------------------------------------------
| Close Modal
|--------------------------------------------------------------------------
*/

const closeModal = () => {
  showModal.value = false
  isEditMode.value = false
  currentGroupID.value = null

  form.value = {
    group_name: '',
    branch_id: '',
    subject_ids: [],
    group_subject_ids: [],
  }

  subjects.value = []
}

/*
|--------------------------------------------------------------------------
| Save / Update Group
|--------------------------------------------------------------------------
*/

const saveGroup = async () => {
  clearMessage()

  if (!form.value.group_name.trim()) {
    showMessage('Please enter group name.', true)

    return
  }

  if (role === 'Manager' && !form.value.branch_id) {
    showMessage('Please select a branch.', true)

    return
  }

  saving.value = true

  try {
    const payload = {
      group_name: form.value.group_name.trim(),
      subject_ids: form.value.subject_ids,
      group_subject_ids: form.value.group_subject_ids,
    }

    /*
    |--------------------------------------------------------------------------
    | Only Manager sends branch_id.
    |--------------------------------------------------------------------------
    | Admin / Branch Manager-এর branch backend নিজে নির্ধারণ করবে।
    |--------------------------------------------------------------------------
    */

    if (role === 'Manager') {
      payload.branch_id = Number(form.value.branch_id)
    }

    if (isEditMode.value) {
      await api.put(`/class-groups/${currentGroupID.value}`, payload)

      showMessage('Class group updated successfully.', false)
    } else {
      await api.post('/class-groups', payload)

      showMessage('Class group created successfully.', false)
    }

    closeModal()

    await fetchGroups()
  } catch (error) {
    console.error('Failed to save class group:', error)

    const errors = error.response?.data?.errors

    if (errors) {
      const firstError = Object.values(errors)[0]

      showMessage(Array.isArray(firstError) ? firstError[0] : firstError, true)
    } else {
      showMessage(error.response?.data?.message || 'Failed to save class group.', true)
    }
  } finally {
    saving.value = false
  }
}

/*
|--------------------------------------------------------------------------
| Delete Group
|--------------------------------------------------------------------------
*/

const deleteGroup = async (id) => {
  if (!confirm('Are you sure you want to delete this class group?')) {
    return
  }

  clearMessage()

  try {
    await api.delete(`/class-groups/${id}`)

    showMessage('Class group deleted successfully.', false)

    await fetchGroups()
  } catch (error) {
    console.error('Failed to delete class group:', error)

    showMessage(error.response?.data?.message || 'Failed to delete class group.', true)
  }
}

/*
|--------------------------------------------------------------------------
| Message Helpers
|--------------------------------------------------------------------------
*/

const showMessage = (text, error = false) => {
  message.value = text
  isError.value = error

  setTimeout(() => {
    message.value = ''
  }, 4000)
}

const clearMessage = () => {
  message.value = ''
  isError.value = false
}

/*
|--------------------------------------------------------------------------
| Mounted
|--------------------------------------------------------------------------
*/

onMounted(async () => {
  if (!hasAcademicAccess.value) {
    return
  }

  await fetchGroups()
})
</script>

<style scoped>
.body {
  width: 86%;
  margin-left: 259px;
}

/* Subject Grid */

.subject-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

/* Subject Card */

.subject-card {
  border: 1px solid #dee2e6;
  border-radius: 10px;
  padding: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: 0.2s;
  background: #fff;
}

.subject-card:hover {
  border-color: #0d6efd;
  background: #f8fbff;
}

.subject-card input {
  cursor: pointer;
}

.subject-card span {
  font-size: 14px;
}

/* Mobile */

@media (max-width: 992px) {
  .body {
    width: 100%;
    margin-left: 0;
  }

  .subject-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 576px) {
  .subject-grid {
    grid-template-columns: 1fr;
  }
}
</style>
