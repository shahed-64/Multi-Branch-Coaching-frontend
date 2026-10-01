<template>
  <RouterView />

  <dashPageView />

  <div class="content">
    <div class="staff-container">
      <!-- ================= HEADER ================= -->

      <div class="staff-header">
        <div>
          <h2>Staff Management</h2>

          <p>Manage your coaching team members and permissions</p>
        </div>

        <div class="staff-summary">
          <div class="summary-icon">
            <i class="fa-solid fa-users"></i>
          </div>

          <div>
            <h4>{{ staff.length }}</h4>

            <span>Total Staff</span>
          </div>
        </div>
      </div>

      <!-- ================= SEARCH + ACTION ================= -->

      <div class="staff-toolbar">
        <div class="search-box">
          <i class="fa-solid fa-magnifying-glass"></i>

          <input type="text" v-model="search" placeholder="Search staff..." />
        </div>

        <!-- ADD STAFF BUTTON -->

        <button
          class="btn btn-primary add-btn"
          data-bs-toggle="modal"
          data-bs-target="#addModal"
          @click="openAddModal"
          :disabled="!isManager"
          :title="!isManager ? 'Only Manager can add staff' : ''"
        >
          <i class="fa-solid fa-user-plus me-1"></i>

          Add Staff
        </button>
      </div>

      <!-- ================= TABLE CARD ================= -->

      <div class="staff-table-card">
        <div class="table-responsive">
          <table class="table staff-table align-middle">
            <thead>
              <tr>
                <th>#</th>
                <th>Photo</th>
                <th>Name</th>
                <th>User Name</th>
                <th>Work Type</th>
                <th>Email</th>
                <th>Role</th>
                <th>Branch</th>
                <th width="220">Action</th>
              </tr>
            </thead>

            <tbody>
              <!-- Loading -->

              <tr v-if="loading">
                <td colspan="9" class="text-center py-5">
                  <div class="spinner-border text-primary"></div>

                  <p class="mt-2 mb-0">Loading staff...</p>
                </td>
              </tr>

              <!-- Data -->

              <tr v-for="(item, index) in paginatedStaff" :key="item.id">
                <td>
                  {{ (currentPage - 1) * perPage + index + 1 }}
                </td>

                <td>
                  <img :src="getImageUrl(item.image)" class="staff-avatar" alt="Staff Image" />
                </td>

                <td>
                  <div class="staff-name">
                    <strong>
                      {{ item.name }}
                    </strong>
                  </div>
                </td>

                <td>
                  {{ item.user_name }}
                </td>

                <td>
                  <span class="skill-badge">
                    {{ item.skill || 'N/A' }}
                  </span>
                </td>

                <td>
                  {{ item.email }}
                </td>

                <td>
                  <span class="role-badge" :class="item.role?.toLowerCase().replace(/\s+/g, '-')">
                    {{ item.role }}
                  </span>
                </td>

                <td>
                  <span v-if="item.branch" class="branch-badge">
                    {{ item.branch.name }}
                  </span>

                  <span v-else class="text-muted small"> Global </span>
                </td>

                <td class="action-buttons">
                  <!-- VIEW -->

                  <button class="action-btn view" @click="openView(item)" title="View Details">
                    <i class="fa-solid fa-eye"></i>
                  </button>

                  <!-- EDIT -->

                  <button
                    class="action-btn edit"
                    data-bs-toggle="modal"
                    data-bs-target="#editModal"
                    @click="openEdit(item)"
                    :disabled="!isManager"
                    :title="!isManager ? 'Only Manager can edit' : 'Edit Staff'"
                  >
                    <i class="fa-solid fa-pen"></i>
                  </button>

                  <!-- DELETE -->

                  <button
                    class="action-btn delete"
                    @click="deleteStaff(item.id)"
                    :disabled="!isManager"
                    :title="!isManager ? 'Only Manager can delete' : 'Delete Staff'"
                  >
                    <i class="fa-solid fa-trash"></i>
                  </button>
                </td>
              </tr>

              <!-- Empty -->

              <tr v-if="!loading && paginatedStaff.length === 0">
                <td colspan="9">
                  <div class="empty-state">
                    <i class="fa-solid fa-users-slash"></i>

                    <h5>No Staff Found</h5>

                    <p>Try changing your search keyword</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- PAGINATION -->

        <div class="pagination-box" v-if="filteredStaff.length > 0">
          <button class="page-btn" @click="previousPage" :disabled="currentPage === 1">
            <i class="fa-solid fa-chevron-left"></i>
          </button>

          <span> Page {{ currentPage }} of {{ totalPages }} </span>

          <button class="page-btn" @click="nextPage" :disabled="currentPage === totalPages">
            <i class="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- ===================================================== -->
  <!-- ADD STAFF MODAL -->
  <!-- ===================================================== -->

  <div class="modal fade" id="addModal" tabindex="-1">
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content border-0 shadow">
        <div class="modal-header bg-primary text-white">
          <h5 class="modal-title fw-bold">
            <i class="fa-solid fa-user-plus me-2"></i>

            Registration Form
          </h5>

          <button
            type="button"
            class="btn-close btn-close-white"
            id="addModalClose"
            data-bs-dismiss="modal"
          ></button>
        </div>

        <form @submit.prevent="addStaff">
          <div class="modal-body p-4">
            <div class="row">
              <!-- Name -->

              <div class="col-md-6 mb-3">
                <label class="form-label font-semibold"> Name </label>

                <input
                  v-model="form.name"
                  type="text"
                  class="form-control"
                  placeholder="Enter name"
                  required
                />
              </div>

              <!-- User Name -->

              <div class="col-md-6 mb-3">
                <label class="form-label font-semibold"> User Name </label>

                <input
                  v-model="form.user_name"
                  type="text"
                  class="form-control"
                  placeholder="Username"
                  required
                />
              </div>

              <!-- Work Type -->

              <div class="col-md-6 mb-3">
                <label class="form-label font-semibold"> Work Type </label>

                <input
                  v-model="form.skill"
                  type="text"
                  class="form-control"
                  placeholder="Full-time, Part-time"
                />
              </div>

              <!-- Email -->

              <div class="col-md-6 mb-3">
                <label class="form-label font-semibold"> Email </label>

                <input
                  v-model="form.email"
                  type="email"
                  class="form-control"
                  placeholder="example@mail.com"
                  required
                />
              </div>

              <!-- ROLE -->

              <div class="col-md-6 mb-3">
                <label class="form-label font-semibold"> Role </label>

                <select v-model="form.role" class="form-select" required>
                  <option value="" disabled>Select Role</option>

                  <option value="Branch Manager">Branch Manager</option>

                  <option value="Admin">Admin</option>

                  <option value="Accountant">Accountant</option>
                </select>
              </div>

              <!-- BRANCH -->

              <div class="col-md-6 mb-3">
                <label class="form-label font-semibold"> Assign Branch </label>

                <select
                  v-model="form.branch_id"
                  class="form-select"
                  :required="['Branch Manager', 'Admin', 'Accountant'].includes(form.role)"
                >
                  <option value="" disabled>Select Branch</option>

                  <option v-for="branch in branches" :key="branch.id" :value="branch.id">
                    {{ branch.name }}

                    <span v-if="branch.code"> ({{ branch.code }}) </span>
                  </option>
                </select>
              </div>

              <!-- SHIFT -->

              <div class="col-md-6 mb-3">
                <label class="form-label font-semibold"> Assign Shift </label>

                <select v-model="form.shift_id" class="form-select" required>
                  <option value="" disabled>Select Shift</option>

                  <!-- IMPORTANT:
                       Only shifts belonging to selected branch -->

                  <option v-for="shift in filteredAddShifts" :key="shift.id" :value="shift.id">
                    {{ shift.name }}

                    ({{ shift.start_time }} - {{ shift.end_time }})
                  </option>
                </select>
              </div>

              <!-- PHOTO -->

              <div class="col-md-6 mb-3">
                <label class="form-label font-semibold"> Profile Photo </label>

                <input
                  type="file"
                  class="form-control"
                  @change="handleFileChange($event, 'add')"
                  accept="image/*"
                />
              </div>

              <!-- SALARY -->

              <div class="col-md-6 mb-3">
                <label class="form-label font-semibold"> Salary </label>

                <input
                  v-model="form.salary"
                  type="text"
                  class="form-control"
                  placeholder="Enter salary"
                  required
                />
              </div>

              <!-- PASSWORD -->

              <div class="col-md-6 mb-3">
                <label class="form-label font-semibold"> Password </label>

                <input
                  v-model="form.password"
                  type="password"
                  class="form-control"
                  placeholder="********"
                  required
                />
              </div>

              <!-- CONFIRM PASSWORD -->

              <div class="col-md-6 mb-3">
                <label class="form-label font-semibold"> Confirm Password </label>

                <input
                  v-model="form.password_confirmation"
                  type="password"
                  class="form-control"
                  placeholder="********"
                  required
                />
              </div>
            </div>
          </div>

          <div class="modal-footer bg-light">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>

            <button type="submit" class="btn btn-primary px-4" :disabled="submitting">
              <span v-if="submitting" class="spinner-border spinner-border-sm me-1"></span>

              Create Account
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- ===================================================== -->
  <!-- EDIT STAFF MODAL -->
  <!-- ===================================================== -->

  <div class="modal fade" id="editModal" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Edit Staff</h5>

          <button
            type="button"
            class="btn-close"
            id="editModalClose"
            data-bs-dismiss="modal"
          ></button>
        </div>

        <div class="modal-body">
          <input v-model="selectedStaff.name" class="form-control mb-2" placeholder="Name" />

          <input
            v-model="selectedStaff.user_name"
            class="form-control mb-2"
            placeholder="User Name"
          />

          <input v-model="selectedStaff.skill" class="form-control mb-2" placeholder="Skill" />

          <input v-model="selectedStaff.email" class="form-control mb-2" placeholder="Email" />

          <!-- EDIT ROLE -->

          <select v-model="selectedStaff.role" class="form-select mb-2">
            <option value="Branch Manager">Branch Manager</option>

            <option value="Admin">Admin</option>

            <option value="Accountant">Accountant</option>
          </select>

          <!-- EDIT BRANCH -->

          <div class="mb-2">
            <label class="form-label font-semibold text-muted small mb-1"> Assign Branch </label>

            <select
              v-model="selectedStaff.branch_id"
              class="form-select mb-2"
              :required="['Branch Manager', 'Admin', 'Accountant'].includes(selectedStaff.role)"
            >
              <option value="" disabled>Select Branch</option>

              <option v-for="branch in branches" :key="branch.id" :value="branch.id">
                {{ branch.name }}

                <span v-if="branch.code"> ({{ branch.code }}) </span>
              </option>
            </select>
          </div>

          <!-- SALARY -->

          <input
            v-model="selectedStaff.salary"
            type="number"
            class="form-control mb-3"
            placeholder="Salary"
          />

          <!-- SHIFT -->

          <div class="mb-2">
            <label class="form-label font-semibold text-muted small mb-1"> Assign Shift </label>

            <select v-model="selectedStaff.shift_id" class="form-select mb-2">
              <option value="" disabled>Select Shift</option>

              <!-- IMPORTANT:
                   Only shifts belonging to selected branch -->

              <option v-for="shift in filteredEditShifts" :key="shift.id" :value="shift.id">
                {{ shift.name }}

                ({{ shift.start_time }} - {{ shift.end_time }})
              </option>
            </select>
          </div>

          <!-- PHOTO -->

          <div class="mb-2">
            <label class="form-label font-semibold text-muted small mb-1">
              Change Profile Photo
            </label>

            <input
              type="file"
              class="form-control"
              @change="handleFileChange($event, 'edit')"
              accept="image/*"
            />
          </div>

          <!-- PASSWORD -->

          <input
            v-model="selectedStaff.password"
            type="password"
            class="form-control mb-2"
            placeholder="New Password (Optional)"
          />

          <input
            v-model="selectedStaff.password_confirmation"
            type="password"
            class="form-control"
            placeholder="Confirm Password"
          />
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" data-bs-dismiss="modal">Close</button>

          <button class="btn btn-primary" @click="updateStaff" :disabled="submitting">
            <span v-if="submitting" class="spinner-border spinner-border-sm me-1"></span>

            Update
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- ===================================================== -->
  <!-- VIEW MODAL -->
  <!-- ===================================================== -->

  <div class="modal fade" id="viewModal" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header bg-primary text-white">
          <h5 class="modal-title">Staff Details</h5>

          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
        </div>

        <div class="modal-body">
          <div class="text-center mb-3">
            <img
              :src="getImageUrl(viewData.image)"
              class="rounded-circle border"
              width="90"
              height="90"
              style="object-fit: cover"
              alt="Avatar"
            />
          </div>

          <div class="list-group">
            <div class="list-group-item">
              <strong>Name:</strong>

              {{ viewData.name }}
            </div>

            <div class="list-group-item">
              <strong>User Name:</strong>

              {{ viewData.user_name }}
            </div>

            <div class="list-group-item">
              <strong>Email:</strong>

              {{ viewData.email }}
            </div>

            <div class="list-group-item">
              <strong>Skill:</strong>

              {{ viewData.skill || 'N/A' }}
            </div>

            <div class="list-group-item">
              <strong>Role:</strong>

              {{ viewData.role }}
            </div>

            <div class="list-group-item">
              <strong>Branch:</strong>

              <span v-if="viewData.branch">
                {{ viewData.branch.name }}

                <span v-if="viewData.branch.code"> ({{ viewData.branch.code }}) </span>
              </span>

              <span v-else> Global </span>
            </div>

            <div class="list-group-item">
              <strong>Joining Date:</strong>

              {{
                viewData.created_at
                  ? new Date(viewData.created_at).toLocaleDateString('en-GB')
                  : 'N/A'
              }}
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import dashPageView from './dashPageView.vue'

import { ref, reactive, computed, onMounted, onBeforeUnmount, watch } from 'vue'

import api from '@/services/api'

// =======================
// STATES
// =======================

const staff = ref([])

const branches = ref([])

const search = ref('')

const loading = ref(false)

const submitting = ref(false)

const currentPage = ref(1)

const shifts = ref([])

const perPage = 10

const currentRole = localStorage.getItem('role')

// =======================
// HELPER: GET IMAGE URL
// =======================

const getImageUrl = (imagePath) => {
  if (imagePath) {
    if (imagePath.startsWith('http')) {
      return imagePath
    }

    const baseURL = api.defaults.baseURL
      ? api.defaults.baseURL.replace('/api', '')
      : 'http://localhost:8000'

    return `${baseURL}/storage/${imagePath}`
  }

  return 'https://i.pravatar.cc/100?img=1'
}

// =======================
// GET SHIFT
// =======================

const getShifts = async () => {
  try {
    const res = await api.get('/shifts')

    shifts.value = res.data.data || res.data.shifts || res.data || []
  } catch (error) {
    console.error('Error fetching shifts:', error.response?.data)
  }
}

// =======================
// GET BRANCHES
// =======================

const getBranches = async () => {
  try {
    const res = await api.get('/branches')

    branches.value = res.data.branches || res.data.data || []
  } catch (error) {
    console.error('Error fetching branches:', error.response?.data)
  }
}

// =======================
// PERMISSIONS
// =======================

const isManager = computed(() => {
  return currentRole?.toLowerCase() === 'manager'
})

// =======================
// FORM DATA
// =======================

const form = reactive({
  name: '',
  user_name: '',
  skill: '',
  role: '',
  email: '',
  salary: '',
  image: null,
  shift_id: '',
  branch_id: '',
  password: '',
  password_confirmation: '',
})

// =====================================================
// ADD STAFF → BRANCH WISE SHIFTS
// =====================================================

const filteredAddShifts = computed(() => {
  if (!form.branch_id) {
    return []
  }

  return shifts.value.filter((shift) => Number(shift.branch_id) === Number(form.branch_id))
})

// =====================================================
// EDIT STAFF → BRANCH WISE SHIFTS
// =====================================================

const filteredEditShifts = computed(() => {
  if (!selectedStaff.value.branch_id) {
    return []
  }

  return shifts.value.filter(
    (shift) => Number(shift.branch_id) === Number(selectedStaff.value.branch_id),
  )
})

// =====================================================
// FILE CHANGE
// =====================================================

const handleFileChange = (event, type) => {
  const file = event.target.files[0]

  if (type === 'add') {
    form.image = file
  } else if (type === 'edit') {
    selectedStaff.value.imageFile = file
  }
}

// =======================
// OPEN ADD MODAL
// =======================

const openAddModal = () => {
  if (!isManager.value) return

  form.name = ''

  form.user_name = ''

  form.skill = ''

  form.role = ''

  form.email = ''

  form.salary = ''

  form.shift_id = ''

  form.branch_id = ''

  form.image = null

  form.password = ''

  form.password_confirmation = ''
}

// =======================
// ADD STAFF
// =======================

const addStaff = async () => {
  if (!isManager.value) {
    alert('Permission Denied!')

    return
  }

  try {
    submitting.value = true

    const formData = new FormData()

    formData.append('name', form.name)

    formData.append('user_name', form.user_name)

    formData.append('skill', form.skill || '')

    formData.append('role', form.role)

    formData.append('email', form.email)

    formData.append('salary', form.salary)

    formData.append('shift_id', form.shift_id)

    if (form.branch_id) {
      formData.append('branch_id', form.branch_id)
    }

    formData.append('password', form.password)

    formData.append('password_confirmation', form.password_confirmation)

    if (form.image) {
      formData.append('image', form.image)
    }

    const res = await api.post('/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    alert(res.data.message || 'Registered successfully')

    await getStaff()

    document.querySelector('#addModalClose')?.click()
  } catch (error) {
    if (error.response) {
      const msg =
        error.response.data.message ||
        Object.values(error.response.data.errors || {})
          .flat()
          .join('\n')

      alert(msg)
    } else {
      alert('Network / Server error')
    }
  } finally {
    submitting.value = false
  }
}

// =======================
// VIEW DATA
// =======================

const viewData = ref({
  name: '',
  user_name: '',
  email: '',
  skill: '',
  role: '',
  image: '',
  salary: '',
  branch_id: '',
  branch: null,
})

// =======================
// OPEN VIEW
// =======================

const openView = (item) => {
  viewData.value = {
    ...item,
  }

  const modalEl = document.getElementById('viewModal')

  if (modalEl && window.bootstrap) {
    const modal = window.bootstrap.Modal.getOrCreateInstance(modalEl)

    modal.show()
  }
}

// =======================
// EDIT DATA
// =======================

const selectedStaff = ref({
  id: null,
  name: '',
  user_name: '',
  skill: '',
  email: '',
  role: '',
  salary: '',
  image: '',
  imageFile: null,
  shift_id: '',
  branch_id: '',
  password: '',
  password_confirmation: '',
})

// =======================
// OPEN EDIT
// =======================

const openEdit = (item) => {
  if (!isManager.value) return

  selectedStaff.value = {
    ...item,

    branch_id: item.branch_id || '',

    imageFile: null,

    password: '',

    password_confirmation: '',
  }
}

// =====================================================
// BRANCH CHANGE → RESET INVALID ADD SHIFT
// =====================================================

watch(
  () => form.branch_id,
  () => {
    if (!form.shift_id) return

    const validShift = shifts.value.some(
      (shift) =>
        Number(shift.id) === Number(form.shift_id) &&
        Number(shift.branch_id) === Number(form.branch_id),
    )

    if (!validShift) {
      form.shift_id = ''
    }
  },
)

// =====================================================
// BRANCH CHANGE → RESET INVALID EDIT SHIFT
// =====================================================

watch(
  () => selectedStaff.value.branch_id,
  () => {
    if (!selectedStaff.value.shift_id) return

    const validShift = shifts.value.some(
      (shift) =>
        Number(shift.id) === Number(selectedStaff.value.shift_id) &&
        Number(shift.branch_id) === Number(selectedStaff.value.branch_id),
    )

    if (!validShift) {
      selectedStaff.value.shift_id = ''
    }
  },
)

// =======================
// GET STAFF
// =======================

const getStaff = async () => {
  try {
    loading.value = true

    const res = await api.get('/staff')

    staff.value = res.data.staff || []
  } catch (error) {
    console.error('Error fetching staff:', error.response?.data)
  } finally {
    loading.value = false
  }
}

// =======================
// SEARCH FILTER
// =======================

const filteredStaff = computed(() => {
  if (!search.value) {
    return staff.value
  }

  const keyword = search.value.toLowerCase()

  return staff.value.filter((item) => {
    return (
      item.name?.toLowerCase().includes(keyword) ||
      item.user_name?.toLowerCase().includes(keyword) ||
      item.email?.toLowerCase().includes(keyword) ||
      item.skill?.toLowerCase().includes(keyword) ||
      item.role?.toLowerCase().includes(keyword) ||
      item.branch?.name?.toLowerCase().includes(keyword)
    )
  })
})

// =======================
// PAGINATION
// =======================

const totalPages = computed(() => {
  return Math.ceil(filteredStaff.value.length / perPage) || 1
})

const paginatedStaff = computed(() => {
  const start = (currentPage.value - 1) * perPage

  return filteredStaff.value.slice(start, start + perPage)
})

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

watch(search, () => {
  currentPage.value = 1
})

// =======================
// UPDATE STAFF
// =======================

const updateStaff = async () => {
  if (!isManager.value) return

  try {
    submitting.value = true

    const formData = new FormData()

    formData.append('_method', 'PUT')

    formData.append('name', selectedStaff.value.name)

    formData.append('user_name', selectedStaff.value.user_name)

    formData.append('skill', selectedStaff.value.skill || '')

    formData.append('role', selectedStaff.value.role)

    formData.append('email', selectedStaff.value.email)

    formData.append('salary', selectedStaff.value.salary)

    formData.append('shift_id', selectedStaff.value.shift_id)

    if (selectedStaff.value.branch_id) {
      formData.append('branch_id', selectedStaff.value.branch_id)
    }

    if (selectedStaff.value.password) {
      formData.append('password', selectedStaff.value.password)

      formData.append('password_confirmation', selectedStaff.value.password_confirmation)
    }

    if (selectedStaff.value.imageFile) {
      formData.append('image', selectedStaff.value.imageFile)
    }

    await api.post(`/staff/${selectedStaff.value.id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    alert('Updated successfully')

    await getStaff()

    document.querySelector('#editModalClose')?.click()
  } catch (error) {
    console.error(error.response?.data)

    const msg =
      error.response?.data?.message ||
      Object.values(error.response?.data?.errors || {})
        .flat()
        .join('\n') ||
      'Something went wrong!'

    alert(msg)
  } finally {
    submitting.value = false
  }
}

// =======================
// DELETE STAFF
// =======================

const deleteStaff = async (id) => {
  if (!isManager.value) return

  if (!confirm('Are you sure you want to delete this staff member?')) {
    return
  }

  try {
    await api.delete(`/staff/${id}`)

    staff.value = staff.value.filter((item) => item.id !== id)
  } catch (error) {
    console.error(error.response?.data)

    alert('Failed to delete staff!')
  }
}

// =====================================================
// MODAL CLEANUP
// =====================================================

const cleanupModals = () => {
  // -----------------------------------------
  // 1. Dispose Bootstrap modal instances
  // -----------------------------------------

  document.querySelectorAll('.modal').forEach((modalEl) => {
    try {
      const instance = window.bootstrap?.Modal?.getInstance(modalEl)

      if (instance) {
        instance.dispose()
      }
    } catch (error) {
      console.warn('Modal cleanup warning:', error)
    }

    // -----------------------------------------
    // 2. Remove stale modal classes/styles
    // -----------------------------------------

    modalEl.classList.remove('show')

    modalEl.style.removeProperty('display')

    modalEl.style.removeProperty('padding-right')

    modalEl.removeAttribute('aria-modal')

    modalEl.setAttribute('aria-hidden', 'true')

    modalEl.removeAttribute('role')
  })

  // -----------------------------------------
  // 3. Remove ALL Bootstrap backdrops
  // -----------------------------------------

  document.querySelectorAll('.modal-backdrop').forEach((backdrop) => {
    backdrop.remove()
  })

  // -----------------------------------------
  // 4. Restore body state
  // -----------------------------------------

  document.body.classList.remove('modal-open')

  document.body.style.removeProperty('overflow')

  document.body.style.removeProperty('padding-right')

  // -----------------------------------------
  // 5. Restore html/body scroll
  // -----------------------------------------

  document.documentElement.style.removeProperty('overflow')

  document.documentElement.style.removeProperty('padding-right')
}

// =====================================================
// BROWSER / MOBILE BACK HANDLER
// =====================================================

const handleBrowserBack = () => {
  cleanupModals()
}

// =====================================================
// INIT
// =====================================================

onMounted(() => {
  getStaff()

  getShifts()

  getBranches()

  // Browser / Mobile Back

  window.addEventListener('popstate', handleBrowserBack)

  // Browser restore / mobile navigation restore

  window.addEventListener('pageshow', handleBrowserBack)
})

// =====================================================
// COMPONENT UNMOUNT
// =====================================================

onBeforeUnmount(() => {
  // Remove listeners

  window.removeEventListener('popstate', handleBrowserBack)

  window.removeEventListener('pageshow', handleBrowserBack)

  // Final modal cleanup

  cleanupModals()
})
</script>

<style scoped>
/* =========================
   MAIN CONTENT
========================= */

.content {
  margin-left: 250px;

  width: calc(100% - 250px);

  padding: 30px;

  background: #f8fafc;

  min-height: 100vh;

  transition: all 0.3s ease;
}

.staff-container {
  width: 100%;
}

/* =========================
   HEADER & ANIMATIONS
========================= */

.staff-header {
  background: linear-gradient(135deg, #2563eb, #4f46e5);

  padding: 30px 35px;

  border-radius: 20px;

  color: white;

  display: flex;

  justify-content: space-between;

  align-items: center;

  margin-bottom: 25px;

  box-shadow: 0 15px 35px rgba(37, 99, 235, 0.2);

  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.staff-header:hover {
  transform: translateY(-2px);

  box-shadow: 0 20px 40px rgba(37, 99, 235, 0.25);
}

.staff-header h2 {
  font-weight: 700;

  margin-bottom: 8px;
}

.staff-header p {
  margin: 0;

  color: #dbeafe;
}

.staff-summary {
  background: rgba(255, 255, 255, 0.18);

  padding: 15px 22px;

  border-radius: 14px;

  display: flex;

  align-items: center;

  gap: 15px;

  backdrop-filter: blur(10px);

  transition: all 0.3s ease;
}

.staff-summary:hover {
  background: rgba(255, 255, 255, 0.25);

  transform: scale(1.03);
}

.summary-icon {
  width: 55px;

  height: 55px;

  border-radius: 15px;

  background: rgba(255, 255, 255, 0.2);

  display: flex;

  align-items: center;

  justify-content: center;

  font-size: 25px;
}

.staff-summary h4 {
  margin: 0;

  font-size: 28px;

  font-weight: 700;
}

.staff-summary span {
  color: #e0f2fe;

  font-size: 14px;
}

/* =========================
   TOOLBAR & SEARCH
========================= */

.staff-toolbar {
  background: white;

  padding: 20px;

  border-radius: 20px;

  display: flex;

  justify-content: space-between;

  align-items: center;

  margin-bottom: 25px;

  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08);
}

.search-box {
  position: relative;

  width: 350px;
}

.search-box i {
  position: absolute;

  left: 18px;

  top: 50%;

  transform: translateY(-50%);

  color: #94a3b8;

  transition: color 0.3s ease;
}

.search-box input {
  width: 100%;

  padding: 12px 20px 12px 45px;

  border-radius: 14px;

  border: 1px solid #e2e8f0;

  outline: none;

  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.search-box input:focus {
  border-color: #2563eb;

  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.15);
}

.search-box input:focus + i {
  color: #2563eb;
}

.add-btn {
  border-radius: 14px;

  padding: 12px 22px;

  font-weight: 600;

  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.add-btn:hover:not(:disabled) {
  transform: translateY(-2px);

  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.3);
}

.add-btn:active:not(:disabled) {
  transform: translateY(0);
}

/* =========================
   TABLE CARD
========================= */

.staff-table-card {
  background: white;

  border-radius: 18px;

  padding: 20px;

  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08);
}

.staff-table {
  margin: 0;
}

.staff-table thead th {
  background: #f8fafc;

  color: #64748b;

  font-size: 13px;

  font-weight: 600;

  border: none;

  padding: 14px 16px;
}

.staff-table tbody td {
  padding: 16px;

  border-bottom: 1px solid #f1f5f9;
}

.staff-table tbody tr {
  transition:
    transform 0.25s ease,
    background-color 0.25s ease,
    box-shadow 0.25s ease;

  will-change: transform;
}

.staff-table tbody tr:hover {
  background-color: #f8fafc;

  transform: translateY(-2px);

  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06);
}

/* =========================
   AVATAR
========================= */

.staff-avatar {
  width: 45px;

  height: 45px;

  border-radius: 50%;

  object-fit: cover;

  border: 3px solid #dbeafe;

  transition:
    transform 0.25s ease,
    border-color 0.25s ease;
}

.staff-table tbody tr:hover .staff-avatar {
  transform: scale(1.05);

  border-color: #2563eb;
}

.staff-name strong {
  color: #111827;
}

/* =========================
   BADGES
========================= */

.skill-badge {
  background: #eff6ff;

  color: #2563eb;

  padding: 6px 12px;

  border-radius: 20px;

  font-size: 12px;

  font-weight: 600;

  display: inline-block;

  transition:
    background-color 0.25s ease,
    color 0.25s ease;
}

.staff-table tbody tr:hover .skill-badge {
  background-color: #2563eb;

  color: #ffffff;
}

.role-badge {
  padding: 7px 14px;

  border-radius: 20px;

  font-size: 12px;

  font-weight: 600;

  display: inline-block;

  transition: transform 0.25s ease;
}

.role-badge:hover {
  transform: scale(1.05);
}

/* =========================
   ROLE COLORS
========================= */

.role-badge.admin {
  background: #dbeafe;

  color: #2563eb;
}

.role-badge.manager {
  background: #ede9fe;

  color: #7c3aed;
}

.role-badge.branch-manager {
  background: #ede9fe;

  color: #7c3aed;
}

.role-badge.accountant {
  background: #dcfce7;

  color: #16a34a;
}

/* =========================
   BRANCH BADGE
========================= */

.branch-badge {
  background: #f0fdf4;

  color: #15803d;

  padding: 6px 12px;

  border-radius: 20px;

  font-size: 12px;

  font-weight: 600;

  display: inline-block;

  white-space: nowrap;
}

/* =========================
   ACTION BUTTONS
========================= */

.action-buttons {
  display: flex;

  gap: 8px;
}

.action-btn {
  width: 38px;

  height: 38px;

  border: none;

  border-radius: 12px;

  display: flex;

  align-items: center;

  justify-content: center;

  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

  cursor: pointer;
}

.action-btn:hover:not(:disabled) {
  transform: translateY(-3px) scale(1.08);

  box-shadow: 0 5px 12px rgba(0, 0, 0, 0.15);
}

.action-btn:active:not(:disabled) {
  transform: translateY(0) scale(0.95);
}

.action-btn:disabled,
button:disabled {
  opacity: 0.45;

  cursor: not-allowed !important;

  transform: none !important;

  box-shadow: none !important;
}

.action-btn.view {
  background: #dbeafe;

  color: #2563eb;
}

.action-btn.view:hover:not(:disabled) {
  background: #2563eb;

  color: white;
}

.action-btn.edit {
  background: #fef3c7;

  color: #d97706;
}

.action-btn.edit:hover:not(:disabled) {
  background: #d97706;

  color: white;
}

.action-btn.delete {
  background: #fee2e2;

  color: #dc2626;
}

.action-btn.delete:hover:not(:disabled) {
  background: #dc2626;

  color: white;
}

/* =========================
   EMPTY STATE
========================= */

.empty-state {
  padding: 50px;

  text-align: center;

  color: #94a3b8;
}

.empty-state i {
  font-size: 45px;

  margin-bottom: 15px;

  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-8px);
  }
}

/* =========================
   PAGINATION
========================= */

.pagination-box {
  display: flex;

  justify-content: center;

  align-items: center;

  gap: 20px;

  margin-top: 25px;
}

.page-btn {
  width: 40px;

  height: 40px;

  border: none;

  border-radius: 12px;

  background: #2563eb;

  color: white;

  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-btn:hover:not(:disabled) {
  background: #1d4ed8;

  transform: translateY(-3px);

  box-shadow: 0 6px 15px rgba(37, 99, 235, 0.35);
}

.page-btn:active:not(:disabled) {
  transform: translateY(0);
}

.pagination-box span {
  font-weight: 600;

  color: #475569;
}

/* =========================
   RESPONSIVE
========================= */

@media (max-width: 991px) {
  .content {
    margin-left: 0;

    width: 100%;

    padding: 20px;
  }

  .staff-header {
    flex-direction: column;

    align-items: flex-start;

    gap: 20px;
  }

  .staff-toolbar {
    flex-direction: column;

    gap: 15px;

    align-items: stretch;
  }

  .search-box {
    width: 100%;
  }
}

@media (max-width: 576px) {
  .staff-table-card {
    padding: 15px;
  }

  .action-buttons {
    flex-wrap: wrap;
  }
}
</style>
