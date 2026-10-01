<template>
  <RouterView />

  <!-- Sidebar Component -->
  <dashPageView />

  <div class="content">
    <!-- ================= HEADER ================= -->
    <div class="staff-header">
      <div>
        <h2>Teachers Management</h2>
        <p>Manage Teachers academic and professional information</p>
      </div>

      <div class="staff-header-right">
        <div class="staff-summary">
          <div class="summary-icon">
            <i class="bi bi-person-badge-fill"></i>
          </div>

          <div>
            <h4>{{ totalTeachers }}</h4>
            <span>Total Teachers</span>
          </div>
        </div>

        <button
          class="btn btn-light add-btn"
          data-bs-toggle="modal"
          data-bs-target="#addModal"
          @click="resetForm"
        >
          <i class="bi bi-person-plus-fill"></i>
          Add a Teacher
        </button>
      </div>
    </div>

    <!-- ================= MAIN CARD ================= -->
    <div class="staff-table-card">
      <!-- TOOLBAR -->
      <div class="staff-toolbar">
        <div class="search-box">
          <i class="bi bi-search"></i>

          <input v-model="search" type="text" placeholder="Search teacher..." />
        </div>

        <select v-model="selectedDepartment" class="class-filter">
          <option value="">All Departments</option>

          <option v-for="dept in uniqueDepartments" :key="dept" :value="dept">
            {{ dept }}
          </option>
        </select>

        <!-- MANAGER ONLY -->
        <select v-if="canSelectBranch" v-model="selectedBranch" class="class-filter">
          <option value="">All Branches</option>

          <option v-for="branch in branches" :key="branch.id" :value="branch.id">
            {{ branch.name }}
          </option>
        </select>
      </div>

      <!-- TABLE -->
      <div class="table-responsive">
        <table class="table staff-table align-middle">
          <thead>
            <tr>
              <th>#</th>
              <th>Photo</th>
              <th>Name & ID</th>
              <th>Designation</th>
              <th>Department</th>
              <th>Branch</th>
              <th>Email</th>
              <th>Shifts</th>
              <th width="180">Action</th>
            </tr>
          </thead>

          <tbody>
            <!-- LOADING -->
            <tr v-if="loading">
              <td colspan="9" class="text-center py-4">Loading teachers...</td>
            </tr>

            <!-- TEACHERS -->
            <tr v-for="(item, index) in teachers" :key="item.id" v-else>
              <td>
                {{ (currentPage - 1) * perPage + index + 1 }}
              </td>

              <td>
                <img :src="item.image || defaultAvatar" class="staff-avatar" alt="Teacher Photo" />
              </td>

              <td>
                <div class="staff-name">
                  <strong>
                    {{ item.full_name }}
                  </strong>

                  <small>
                    {{ item.teacher_id }}
                  </small>
                </div>
              </td>

              <td>
                <span class="skill-badge">
                  {{ item.designation }}
                </span>
              </td>

              <td>
                {{ item.department }}
              </td>

              <!-- BRANCH -->
              <td>
                <span v-if="item.branch" class="branch-badge">
                  {{ item.branch.name }}
                </span>

                <span v-else class="text-muted small"> No Branch </span>
              </td>

              <td>
                {{ item.email }}
              </td>

              <td>
                <div class="d-flex flex-wrap gap-1">
                  <span v-for="sh in item.shifts" :key="sh.id" class="badge bg-secondary">
                    {{ sh.name }}
                  </span>

                  <span v-if="!item.shifts || item.shifts.length === 0" class="text-muted small">
                    No Shift
                  </span>
                </div>
              </td>

              <td>
                <div class="action-buttons">
                  <!-- VIEW -->
                  <button
                    class="action-btn view"
                    @click="openView(item)"
                    data-bs-toggle="modal"
                    data-bs-target="#viewModal"
                    title="View"
                  >
                    <i class="bi bi-eye"></i>
                  </button>

                  <!-- EDIT -->
                  <button
                    class="action-btn edit"
                    @click="openEdit(item)"
                    data-bs-toggle="modal"
                    data-bs-target="#editModal"
                    title="Edit"
                  >
                    <i class="bi bi-pencil"></i>
                  </button>

                  <!-- DELETE -->
                  <button class="action-btn delete" @click="deleteTeacher(item.id)" title="Delete">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- EMPTY STATE -->
      <div v-if="!loading && teachers.length === 0" class="empty-state">
        <i class="bi bi-person-x"></i>

        <h5>No Teacher Found</h5>

        <p>Try changing search or filter</p>
      </div>

      <!-- PAGINATION -->
      <div v-if="totalTeachers > 0" class="pagination-box">
        <div>
          Showing
          <b>{{ showingFrom }}</b>
          to
          <b>{{ showingTo }}</b>
          of
          <b>{{ totalTeachers }}</b>
        </div>

        <div class="page-buttons">
          <button class="page-btn" @click="prevPage" :disabled="currentPage === 1 || loading">
            <i class="bi bi-chevron-left"></i>
          </button>

          <span> {{ currentPage }} / {{ totalPages }} </span>

          <button
            class="page-btn"
            @click="nextPage"
            :disabled="currentPage === totalPages || loading"
          >
            <i class="bi bi-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- ================= ADD MODAL ================= -->
    <div class="modal fade" id="addModal" ref="addModalRef" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-scrollable">
        <div class="modal-content teacher-modal">
          <div class="modal-header">
            <h5>Add Teacher</h5>

            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              id="closeAddModal"
            ></button>
          </div>

          <div class="modal-body">
            <div class="text-center mb-3">
              <img
                :src="addPreview || defaultAvatar"
                class="image-preview mb-2"
                alt="Add Preview"
              />

              <input
                type="file"
                ref="addFileInput"
                class="form-control"
                @change="handleFileChange($event, 'add')"
                accept="image/*"
              />
            </div>

            <input v-model="form.full_name" class="form-control mb-3" placeholder="Full Name *" />

            <input
              v-model="form.designation"
              class="form-control mb-3"
              placeholder="Designation *"
            />

            <select v-model="form.department" class="form-control mb-3">
              <option value="" disabled>Select Department *</option>

              <option value="Computer Science">Computer Science</option>

              <option value="Electrical Engineering">Electrical Engineering</option>

              <option value="Physics">Physics</option>

              <option value="Mathematics">Mathematics</option>

              <option value="English">English</option>
            </select>

            <!-- MANAGER ONLY BRANCH SELECT -->
            <div v-if="canSelectBranch" class="mb-3">
              <label class="form-label"> Branch * </label>

              <select v-model="form.branch_id" class="form-control">
                <option value="" disabled>Select Branch</option>

                <option v-for="branch in branches" :key="branch.id" :value="branch.id">
                  {{ branch.name }}
                </option>
              </select>
            </div>

            <!-- NON-MANAGER OWN BRANCH -->
            <div v-else class="mb-3">
              <label class="form-label"> Branch </label>

              <input class="form-control" :value="getBranchName(form.branch_id)" readonly />
            </div>

            <input
              v-model="form.qualification"
              class="form-control mb-3"
              placeholder="Qualification *"
            />

            <input v-model="form.phone" class="form-control mb-3" placeholder="Phone *" />

            <input v-model="form.email" class="form-control mb-3" placeholder="Email *" />

            <input
              style="display: none"
              v-model="form.joining_date"
              type="date"
              class="form-control mb-3"
            />

            <input
              v-model="form.salary"
              type="number"
              class="form-control mb-3"
              placeholder="Salary"
            />

            <label class="form-label fw-bold"> Select Shifts * </label>

            <div class="shift-box">
              <div v-if="!form.branch_id" class="text-muted small">
                Please select a branch first.
              </div>

              <div v-else-if="availableShifts.length === 0" class="text-muted small">
                No shifts found for this branch.
              </div>

              <div v-for="shift in availableShifts" :key="shift.id" class="form-check">
                <input
                  class="form-check-input"
                  type="checkbox"
                  :value="shift.id"
                  :id="'add_shift_' + shift.id"
                  v-model="form.shift_ids"
                />

                <label class="form-check-label" :for="'add_shift_' + shift.id">
                  {{ shift.name }}
                </label>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>

            <button
              type="button"
              class="btn btn-primary"
              :disabled="loading"
              @click="teacher_create"
            >
              {{ loading ? 'Saving...' : 'Save' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ================= VIEW MODAL ================= -->
    <div class="modal fade" id="viewModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content teacher-modal">
          <div class="modal-header bg-primary text-white">
            <h5>Teacher Details</h5>

            <button
              type="button"
              class="btn-close btn-close-white"
              data-bs-dismiss="modal"
            ></button>
          </div>

          <div class="modal-body text-center">
            <img
              :src="selectedTeacher.image || defaultAvatar"
              class="teacher-modal-avatar mb-3"
              alt="Teacher Avatar"
            />

            <h4>
              {{ selectedTeacher.full_name }}
            </h4>

            <p class="text-muted">
              {{ selectedTeacher.teacher_id }}
            </p>

            <hr />

            <div class="text-start px-3 teacher-details">
              <p>
                <strong>Designation:</strong>
                {{ selectedTeacher.designation }}
              </p>

              <p>
                <strong>Department:</strong>
                {{ selectedTeacher.department }}
              </p>

              <p>
                <strong>Branch:</strong>
                {{ selectedTeacher.branch?.name || 'N/A' }}
              </p>

              <p>
                <strong>Qualification:</strong>
                {{ selectedTeacher.qualification }}
              </p>

              <p>
                <strong>Email:</strong>
                {{ selectedTeacher.email }}
              </p>

              <p>
                <strong>Phone:</strong>
                {{ selectedTeacher.phone }}
              </p>

              <p>
                <strong>Joining Date:</strong>

                {{
                  formatDisplayDate(
                    selectedTeacher.joining_date ||
                      selectedTeacher.join_date ||
                      selectedTeacher.created_at,
                  )
                }}
              </p>

              <p>
                <strong>Salary:</strong>
                {{ selectedTeacher.salary }}
              </p>

              <p>
                <strong>Shifts:</strong>

                <span
                  v-for="sh in selectedTeacher.shifts"
                  :key="sh.id"
                  class="badge bg-secondary me-1"
                >
                  {{ sh.name }}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ================= EDIT MODAL ================= -->
    <div class="modal fade" id="editModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-scrollable">
        <div class="modal-content teacher-modal">
          <div class="modal-header">
            <h5>Edit Teacher</h5>

            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              id="closeEditModal"
            ></button>
          </div>

          <div class="modal-body">
            <div class="text-center mb-3">
              <img
                :src="editPreview || selectedTeacher.image || defaultAvatar"
                class="image-preview mb-2"
                alt="Edit Preview"
              />

              <input
                type="file"
                ref="editFileInput"
                class="form-control"
                @change="handleFileChange($event, 'edit')"
                accept="image/*"
              />
            </div>

            <label class="form-label"> Full Name </label>

            <input
              v-model="selectedTeacher.full_name"
              class="form-control mb-3"
              placeholder="Name"
            />

            <label class="form-label"> Designation </label>

            <input
              v-model="selectedTeacher.designation"
              class="form-control mb-3"
              placeholder="Designation"
            />

            <label class="form-label"> Department </label>

            <select v-model="selectedTeacher.department" class="form-control mb-3">
              <option value="Computer Science">Computer Science</option>

              <option value="Electrical Engineering">Electrical Engineering</option>

              <option value="Physics">Physics</option>

              <option value="Mathematics">Mathematics</option>

              <option value="English">English</option>
            </select>

            <!-- MANAGER ONLY BRANCH -->
            <div v-if="canSelectBranch" class="mb-3">
              <label class="form-label"> Branch </label>

              <select v-model="selectedTeacher.branch_id" class="form-control">
                <option value="" disabled>Select Branch</option>

                <option v-for="branch in branches" :key="branch.id" :value="branch.id">
                  {{ branch.name }}
                </option>
              </select>
            </div>

            <!-- NON-MANAGER OWN BRANCH -->
            <div v-else class="mb-3">
              <label class="form-label"> Branch </label>

              <input
                class="form-control"
                :value="getBranchName(selectedTeacher.branch_id)"
                readonly
              />
            </div>

            <input
              v-model="selectedTeacher.qualification"
              class="form-control mb-3"
              placeholder="Qualification"
            />

            <label class="form-label"> Phone </label>

            <input v-model="selectedTeacher.phone" class="form-control mb-3" placeholder="Phone" />

            <label class="form-label"> Email </label>

            <input v-model="selectedTeacher.email" class="form-control mb-3" placeholder="Email" />

            <label class="form-label"> Joining Date </label>

            <input v-model="selectedTeacher.joining_date" type="date" class="form-control mb-3" />

            <label class="form-label"> Salary </label>

            <input v-model="selectedTeacher.salary" type="number" class="form-control mb-3" />

            <label class="form-label fw-bold"> Select Shifts * </label>

            <div class="shift-box">
              <div v-if="!selectedTeacher.branch_id" class="text-muted small">
                Please select a branch first.
              </div>

              <div v-else-if="editAvailableShifts.length === 0" class="text-muted small">
                No shifts found for this branch.
              </div>

              <div v-for="shift in editAvailableShifts" :key="shift.id" class="form-check">
                <input
                  class="form-check-input"
                  type="checkbox"
                  :value="shift.id"
                  :id="'edit_shift_' + shift.id"
                  v-model="selectedTeacher.shift_ids"
                />

                <label class="form-check-label" :for="'edit_shift_' + shift.id">
                  {{ shift.name }}
                </label>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>

            <button
              type="button"
              class="btn btn-primary"
              :disabled="loading"
              @click="updateTeacher"
            >
              {{ loading ? 'Updating...' : 'Update' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import api from '@/services/api'
import dashPageView from './dashPageView.vue'

/* =====================================================
   TEACHERS
===================================================== */

const teachers = ref([])
const allShifts = ref([])
const branches = ref([])
const loading = ref(false)

const search = ref('')
const selectedDepartment = ref('')
const selectedBranch = ref('')

const currentPage = ref(1)
const perPage = ref(10)

const totalTeachers = ref(0)
const totalPages = ref(1)

const defaultAvatar = ref('https://via.placeholder.com/150')

/* =====================================================
   ROLE + LOGGED IN USER
===================================================== */

const currentRole = ref(localStorage.getItem('role') || '')
const currentUser = ref({})

const loadCurrentUser = () => {
  try {
    const storedUser = localStorage.getItem('user')

    if (storedUser) {
      const parsedUser = JSON.parse(storedUser)
      currentUser.value = parsedUser || {}
    } else {
      currentUser.value = {}
    }
  } catch (error) {
    console.error('Error reading logged-in user:', error)
    currentUser.value = {}
  }
}

loadCurrentUser()

/* =====================================================
   ROLE CHECK
===================================================== */

const isManager = computed(() => {
  return (currentRole.value || '').toLowerCase() === 'manager'
})

const isAdmin = computed(() => {
  return (currentRole.value || '').toLowerCase() === 'admin'
})

/*
|--------------------------------------------------------------------------
| IMPORTANT
|--------------------------------------------------------------------------
| ONLY MANAGER CAN SELECT BRANCH MANUALLY.
|
| Admin / Branch Manager / Other assigned roles
| automatically use their own branch.
|--------------------------------------------------------------------------
*/

const canSelectBranch = computed(() => {
  return isManager.value
})

/* =====================================================
   CURRENT USER BRANCH
===================================================== */

const currentUserBranchId = computed(() => {
  const directBranchId = currentUser.value?.branch_id

  if (directBranchId) {
    return directBranchId
  }

  const nestedBranchId = currentUser.value?.branch?.id

  if (nestedBranchId) {
    return nestedBranchId
  }

  const storedBranchId = localStorage.getItem('branch_id')

  if (storedBranchId) {
    return storedBranchId
  }

  return ''
})

/* =====================================================
   SET OWN BRANCH
===================================================== */

const setOwnBranch = () => {
  if (canSelectBranch.value) {
    return
  }

  const branchId = currentUserBranchId.value

  if (branchId) {
    form.value.branch_id = Number(branchId)
  }
}

/* =====================================================
   ADD FORM
===================================================== */

const form = ref({
  full_name: '',
  designation: '',
  department: '',
  qualification: '',
  phone: '',
  email: '',
  joining_date: new Date().toISOString().slice(0, 10),
  salary: '',
  image: null,
  shift_ids: [],
  branch_id: '',
})

const addPreview = ref(null)

/* =====================================================
   SELECTED TEACHER
===================================================== */

const selectedTeacher = ref({
  id: null,
  full_name: '',
  teacher_id: '',
  designation: '',
  department: '',
  qualification: '',
  phone: '',
  email: '',
  joining_date: '',
  salary: '',
  image: null,
  shift_ids: [],
  shifts: [],
  branch_id: '',
  branch: null,
})

/* =====================================================
   IMAGE
===================================================== */

const editImageFile = ref(null)
const editPreview = ref(null)

const addFileInput = ref(null)
const editFileInput = ref(null)

/* =====================================================
   PAGINATION
===================================================== */

const showingFrom = computed(() => {
  if (totalTeachers.value === 0) {
    return 0
  }

  return (currentPage.value - 1) * perPage.value + 1
})

const showingTo = computed(() => {
  if (totalTeachers.value === 0) {
    return 0
  }

  return Math.min(currentPage.value * perPage.value, totalTeachers.value)
})

/* =====================================================
   DEPARTMENTS
===================================================== */

const uniqueDepartments = computed(() => {
  const depts = teachers.value.map((teacher) => teacher.department).filter(Boolean)

  return [...new Set(depts)]
})

/* =====================================================
   BRANCH-WISE SHIFTS
===================================================== */

const availableShifts = computed(() => {
  const branchId = form.value.branch_id

  if (!branchId) {
    return []
  }

  return allShifts.value.filter((shift) => Number(shift.branch_id) === Number(branchId))
})

const editAvailableShifts = computed(() => {
  const branchId = selectedTeacher.value.branch_id

  if (!branchId) {
    return []
  }

  return allShifts.value.filter((shift) => Number(shift.branch_id) === Number(branchId))
})

/* =====================================================
   GET BRANCH NAME
===================================================== */

const getBranchName = (branchId) => {
  const branch = branches.value.find((item) => Number(item.id) === Number(branchId))

  return branch?.name || 'N/A'
}

/* =====================================================
   MODAL CLEANUP
===================================================== */

const cleanupModals = () => {
  document.querySelectorAll('.modal-backdrop').forEach((b) => b.remove())

  document.querySelectorAll('.modal.show').forEach((m) => {
    m.classList.remove('show')
    m.style.display = 'none'
    m.removeAttribute('aria-modal')
    m.setAttribute('aria-hidden', 'true')
  })

  document.body.classList.remove('modal-open')

  document.body.style.removeProperty('overflow')
  document.body.style.removeProperty('padding-right')
}

/* =====================================================
   MOUNTED
===================================================== */

onMounted(async () => {
  loading.value = true

  try {
    loadCurrentUser()

    /*
    |--------------------------------------------------------------------------
    | Non-manager roles:
    | Get their own branch.
    |--------------------------------------------------------------------------
    */

    if (!canSelectBranch.value) {
      try {
        const response = await api.get('/staff/dashboard')

        const branchId =
          response.data?.user?.branch_id ||
          response.data?.user?.branch?.id ||
          currentUser.value?.branch_id ||
          currentUser.value?.branch?.id ||
          localStorage.getItem('branch_id') ||
          ''

        if (branchId) {
          form.value.branch_id = Number(branchId)

          /*
          | Keep localStorage updated so other pages
          | can also use the same branch.
          */
          localStorage.setItem('branch_id', String(branchId))
        }
      } catch (error) {
        console.error('Error loading staff branch:', error)

        /*
        |--------------------------------------------------------------------------
        | If dashboard request fails, try local user branch.
        |--------------------------------------------------------------------------
        */

        setOwnBranch()
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Load branches and shifts.
    |--------------------------------------------------------------------------
    */

    await fetchBranches()
    await fetchShifts()

    /*
    |--------------------------------------------------------------------------
    | Make absolutely sure non-manager has own branch
    | after user + branch data are loaded.
    |--------------------------------------------------------------------------
    */

    if (!canSelectBranch.value) {
      setOwnBranch()
    }

    /*
    |--------------------------------------------------------------------------
    | Load teachers.
    |--------------------------------------------------------------------------
    */

    await fetchTeachers()
  } catch (error) {
    console.error('Error loading teacher page:', error)
  } finally {
    loading.value = false
  }

  window.addEventListener('popstate', cleanupModals)
})

/* =====================================================
   SEARCH WATCH
===================================================== */

watch(search, (newValue, oldValue) => {
  if (newValue !== oldValue) {
    currentPage.value = 1

    fetchTeachers(1)
  }
})

/* =====================================================
   DEPARTMENT WATCH
===================================================== */

watch(selectedDepartment, () => {
  currentPage.value = 1

  fetchTeachers(1)
})

/* =====================================================
   BRANCH WATCH
===================================================== */

watch(selectedBranch, () => {
  /*
    |--------------------------------------------------------------------------
    | Only Manager can manually filter branch.
    |--------------------------------------------------------------------------
    */

  if (!canSelectBranch.value) {
    return
  }

  currentPage.value = 1

  fetchTeachers(1)
})

/* =====================================================
   ADD FORM BRANCH WATCH
===================================================== */

watch(
  () => form.value.branch_id,

  (newBranchId) => {
    /*
    |--------------------------------------------------------------------------
    | Non-manager must always keep own branch.
    |--------------------------------------------------------------------------
    */

    if (!newBranchId && !canSelectBranch.value) {
      setOwnBranch()

      return
    }

    /*
    |--------------------------------------------------------------------------
    | No branch = no shifts.
    |--------------------------------------------------------------------------
    */

    if (!newBranchId) {
      form.value.shift_ids = []

      return
    }

    /*
    |--------------------------------------------------------------------------
    | Remove shifts belonging to another branch.
    |--------------------------------------------------------------------------
    */

    form.value.shift_ids = form.value.shift_ids.filter((shiftId) => {
      const shift = allShifts.value.find((item) => Number(item.id) === Number(shiftId))

      return shift && Number(shift.branch_id) === Number(newBranchId)
    })
  },
)

/* =====================================================
   EDIT BRANCH WATCH
===================================================== */

watch(
  () => selectedTeacher.value.branch_id,

  (newBranchId) => {
    if (!newBranchId) {
      selectedTeacher.value.shift_ids = []

      return
    }

    selectedTeacher.value.shift_ids = selectedTeacher.value.shift_ids.filter((shiftId) => {
      const shift = allShifts.value.find((item) => Number(item.id) === Number(shiftId))

      return shift && Number(shift.branch_id) === Number(newBranchId)
    })
  },
)

/* =====================================================
   ROUTE LEAVE
===================================================== */

onBeforeRouteLeave(() => {
  cleanupModals()
})

/* =====================================================
   BEFORE UNMOUNT
===================================================== */

onBeforeUnmount(() => {
  cleanupModals()

  window.removeEventListener('popstate', cleanupModals)
})

/* =====================================================
   FETCH TEACHERS
===================================================== */

const fetchTeachers = async (page = currentPage.value) => {
  try {
    const params = {
      page,
      per_page: perPage.value,
    }

    if (search.value.trim()) {
      params.search = search.value.trim()
    }

    if (selectedDepartment.value) {
      params.department = selectedDepartment.value
    }

    /*
    |--------------------------------------------------------------------------
    | ONLY MANAGER can filter by selected branch.
    |--------------------------------------------------------------------------
    */

    if (canSelectBranch.value && selectedBranch.value) {
      params.branch_id = selectedBranch.value
    }

    const response = await api.get('/teachers', { params })

    if (response.data.status) {
      teachers.value = Array.isArray(response.data.data) ? response.data.data : []

      const pagination = response.data.pagination || {}

      currentPage.value = Number(pagination.current_page) || page

      totalPages.value = Number(pagination.last_page) || 1

      perPage.value = Number(pagination.per_page) || perPage.value

      totalTeachers.value = Number(pagination.total) || 0
    }
  } catch (error) {
    console.error('Error fetching teachers:', error)
  }
}

/* =====================================================
   FETCH SHIFTS
===================================================== */

const fetchShifts = async () => {
  try {
    const response = await api.get('/shifts')

    if (response.data.status) {
      allShifts.value = Array.isArray(response.data.data) ? response.data.data : []
    }
  } catch (error) {
    console.error('Error fetching shifts:', error)
  }
}

/* =====================================================
   FETCH BRANCHES
===================================================== */

const fetchBranches = async () => {
  try {
    const response = await api.get('/branches')

    if (response.data.status) {
      branches.value = Array.isArray(response.data.branches) ? response.data.branches : []
    }
  } catch (error) {
    console.error('Error fetching branches:', error)
  }
}

/* =====================================================
   FILE CHANGE
===================================================== */

const handleFileChange = (event, type) => {
  const file = event.target.files[0]

  if (!file) {
    return
  }

  if (type === 'add') {
    form.value.image = file

    if (addPreview.value) {
      URL.revokeObjectURL(addPreview.value)
    }

    addPreview.value = URL.createObjectURL(file)
  } else if (type === 'edit') {
    editImageFile.value = file

    if (editPreview.value) {
      URL.revokeObjectURL(editPreview.value)
    }

    editPreview.value = URL.createObjectURL(file)
  }
}

/* =====================================================
   RESET ADD FORM
===================================================== */

const resetForm = () => {
  if (addPreview.value) {
    URL.revokeObjectURL(addPreview.value)
  }

  /*
  |--------------------------------------------------------------------------
  | Manager:
  | branch empty -> manually select
  |
  | Non-manager:
  | own branch automatically selected
  |--------------------------------------------------------------------------
  */

  form.value = {
    full_name: '',
    designation: '',
    department: '',
    qualification: '',
    phone: '',
    email: '',

    joining_date: new Date().toISOString().slice(0, 10),

    salary: '',

    image: null,

    shift_ids: [],

    branch_id: canSelectBranch.value ? '' : currentUserBranchId.value,
  }

  /*
  |--------------------------------------------------------------------------
  | Extra safety:
  | if current user branch exists, force it.
  |--------------------------------------------------------------------------
  */

  if (!canSelectBranch.value) {
    setOwnBranch()
  }

  addPreview.value = null

  if (addFileInput.value) {
    addFileInput.value.value = ''
  }
}

/* =====================================================
   CREATE TEACHER
===================================================== */

const teacher_create = async () => {
  /*
  |--------------------------------------------------------------------------
  | Non-manager:
  | force own branch before submit.
  |--------------------------------------------------------------------------
  */

  if (!canSelectBranch.value) {
    setOwnBranch()
  }

  /*
  |--------------------------------------------------------------------------
  | Manager must select branch.
  |--------------------------------------------------------------------------
  */

  if (canSelectBranch.value && !form.value.branch_id) {
    alert('Branch is required.')

    return
  }

  /*
  |--------------------------------------------------------------------------
  | Non-manager must have assigned branch.
  |--------------------------------------------------------------------------
  */

  if (!canSelectBranch.value && !form.value.branch_id) {
    alert('Your account is not assigned to any branch.')

    return
  }

  loading.value = true

  try {
    const formData = new FormData()

    formData.append('full_name', form.value.full_name)

    formData.append('designation', form.value.designation)

    formData.append('department', form.value.department)

    formData.append('qualification', form.value.qualification)

    formData.append('phone', form.value.phone)

    formData.append('email', form.value.email)

    formData.append('joining_date', form.value.joining_date)

    formData.append('salary', form.value.salary || 0)

    /*
    |--------------------------------------------------------------------------
    | Branch
    |--------------------------------------------------------------------------
    */

    formData.append('branch_id', form.value.branch_id)

    /*
    |--------------------------------------------------------------------------
    | Shifts
    |--------------------------------------------------------------------------
    */

    form.value.shift_ids.forEach((id) => {
      formData.append('shift_ids[]', id)
    })

    /*
    |--------------------------------------------------------------------------
    | Image
    |--------------------------------------------------------------------------
    */

    if (form.value.image) {
      formData.append('image', form.value.image)
    }

    const response = await api.post('/teachers', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    if (response.data.status) {
      alert(response.data.message)

      currentPage.value = 1

      await fetchTeachers(1)

      resetForm()

      document.getElementById('closeAddModal')?.click()
    }
  } catch (error) {
    console.error('Teacher create error:', error)

    alert(error.response?.data?.message || 'Error creating teacher')
  } finally {
    loading.value = false
  }
}

/* =====================================================
   OPEN VIEW
===================================================== */

const openView = (teacher) => {
  selectedTeacher.value = {
    ...teacher,

    shifts: teacher.shifts || [],
  }
}

/* =====================================================
   OPEN EDIT
===================================================== */

const openEdit = (teacher) => {
  selectedTeacher.value = {
    ...teacher,

    joining_date: teacher.join_date || teacher.joining_date || '',

    shift_ids: teacher.shifts ? teacher.shifts.map((shift) => shift.id) : [],

    shifts: teacher.shifts || [],

    branch_id: teacher.branch_id || teacher.branch?.id || '',
  }

  /*
  |--------------------------------------------------------------------------
  | NON-MANAGER:
  | ALWAYS FORCE LOGGED-IN USER'S OWN BRANCH
  |--------------------------------------------------------------------------
  */

  if (!canSelectBranch.value) {
    selectedTeacher.value.branch_id = currentUserBranchId.value

    /*
    |--------------------------------------------------------------------------
    | If currentUserBranchId is temporarily empty,
    | try setting from current form branch.
    |--------------------------------------------------------------------------
    */

    if (!selectedTeacher.value.branch_id && form.value.branch_id) {
      selectedTeacher.value.branch_id = form.value.branch_id
    }
  }

  if (editPreview.value) {
    URL.revokeObjectURL(editPreview.value)
  }

  editPreview.value = null

  editImageFile.value = null

  if (editFileInput.value) {
    editFileInput.value.value = ''
  }
}

/* =====================================================
   UPDATE TEACHER
===================================================== */

const updateTeacher = async () => {
  /*
  |--------------------------------------------------------------------------
  | Non-manager:
  | force own branch.
  |--------------------------------------------------------------------------
  */

  if (!canSelectBranch.value) {
    selectedTeacher.value.branch_id = currentUserBranchId.value
  }

  /*
  |--------------------------------------------------------------------------
  | Manager branch validation.
  |--------------------------------------------------------------------------
  */

  if (canSelectBranch.value && !selectedTeacher.value.branch_id) {
    alert('Branch is required.')

    return
  }

  /*
  |--------------------------------------------------------------------------
  | Non-manager branch validation.
  |--------------------------------------------------------------------------
  */

  if (!canSelectBranch.value && !selectedTeacher.value.branch_id) {
    alert('Your account is not assigned to any branch.')

    return
  }

  loading.value = true

  try {
    const formData = new FormData()

    /*
    |--------------------------------------------------------------------------
    | Laravel method spoofing
    |--------------------------------------------------------------------------
    */

    formData.append('_method', 'PUT')

    formData.append('full_name', selectedTeacher.value.full_name)

    formData.append('designation', selectedTeacher.value.designation)

    formData.append('department', selectedTeacher.value.department)

    formData.append('qualification', selectedTeacher.value.qualification)

    formData.append('phone', selectedTeacher.value.phone)

    formData.append('email', selectedTeacher.value.email)

    formData.append('joining_date', selectedTeacher.value.joining_date)

    formData.append('salary', selectedTeacher.value.salary || 0)

    /*
    |--------------------------------------------------------------------------
    | Branch
    |--------------------------------------------------------------------------
    */

    formData.append('branch_id', selectedTeacher.value.branch_id)

    /*
    |--------------------------------------------------------------------------
    | Shifts
    |--------------------------------------------------------------------------
    */

    if (Array.isArray(selectedTeacher.value.shift_ids)) {
      selectedTeacher.value.shift_ids.forEach((id) => {
        formData.append('shift_ids[]', id)
      })
    }

    /*
    |--------------------------------------------------------------------------
    | Image
    |--------------------------------------------------------------------------
    */

    if (editImageFile.value) {
      formData.append('image', editImageFile.value)
    }

    const response = await api.post(`/teachers/${selectedTeacher.value.id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    if (response.data.status) {
      alert(response.data.message)

      await fetchTeachers(currentPage.value)

      document.getElementById('closeEditModal')?.click()
    }
  } catch (error) {
    console.error('Teacher update error:', error)

    alert(error.response?.data?.message || 'Error updating teacher')
  } finally {
    loading.value = false
  }
}

/* =====================================================
   FORMAT DATE
===================================================== */

const formatDisplayDate = (value) => {
  if (!value) {
    return 'N/A'
  }

  const datePart = String(value).slice(0, 10)

  const [year, month, day] = datePart.split('-')

  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]

  return `${day} ${months[Number(month) - 1]} ${year}`
}

/* =====================================================
   DELETE TEACHER
===================================================== */

const deleteTeacher = async (id) => {
  if (confirm('Are you sure you want to delete this teacher?')) {
    try {
      const response = await api.delete(`/teachers/${id}`)

      if (response.data.status) {
        alert(response.data.message)

        if (teachers.value.length === 1 && currentPage.value > 1) {
          currentPage.value--
        }

        await fetchTeachers(currentPage.value)
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Error deleting teacher')
    }
  }
}

/* =====================================================
   NEXT PAGE
===================================================== */

const nextPage = async () => {
  if (currentPage.value < totalPages.value && !loading.value) {
    await fetchTeachers(currentPage.value + 1)
  }
}

/* =====================================================
   PREVIOUS PAGE
===================================================== */

const prevPage = async () => {
  if (currentPage.value > 1 && !loading.value) {
    await fetchTeachers(currentPage.value - 1)
  }
}
</script>

<style scoped>
/* =====================================================
   IMAGE PREVIEW
===================================================== */

.image-preview {
  width: 90px;
  height: 90px;
  object-fit: cover;
  border-radius: 50%;
  border: 3px solid #2563eb;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

/* =====================================================
   BASE
===================================================== */

.content {
  margin-left: 250px;
  padding: 25px;
  background: #f8fafc;
  min-height: 100vh;
}

/* =====================================================
   HEADER
===================================================== */

.staff-header {
  background: linear-gradient(135deg, #2563eb, #4f46e5);
  padding: 28px 32px;
  border-radius: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  margin-bottom: 25px;
  box-shadow: 0 10px 30px rgba(37, 99, 235, 0.25);
}

.staff-header h2 {
  font-weight: 700;
  margin-bottom: 6px;
}

.staff-header p {
  margin: 0;
  color: #dbeafe;
}

.staff-header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.staff-summary {
  background: white;
  color: #111827;
  padding: 12px 18px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.summary-icon {
  width: 45px;
  height: 45px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #dbeafe;
  color: #2563eb;
  font-size: 22px;
}

.staff-summary h4 {
  margin: 0;
  font-weight: 700;
}

.staff-summary span {
  font-size: 13px;
  color: #6b7280;
}

.add-btn {
  color: #2563eb;
  font-weight: 600;
  border-radius: 12px;
  padding: 12px 20px;
  white-space: nowrap;
}

/* =====================================================
   TABLE CARD
===================================================== */

.staff-table-card {
  background: white;
  border-radius: 20px;
  padding: 25px;
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.08);
}

/* =====================================================
   TOOLBAR
===================================================== */

.staff-toolbar {
  display: flex;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 20px;
}

.search-box {
  position: relative;
  width: 350px;
}

.search-box i {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  z-index: 1;
}

.search-box input {
  width: 100%;
  padding: 12px 15px 12px 45px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  outline: none;
}

.search-box input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}

.class-filter {
  width: 200px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  padding: 10px;
}

/* =====================================================
   TABLE
===================================================== */

.table-responsive {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.staff-table {
  border-collapse: separate;
  border-spacing: 0 10px;
  margin-bottom: 0;
}

.staff-table thead th {
  background: #f1f5f9;
  border: none;
  padding: 15px;
  color: #374151;
  font-size: 14px;
  white-space: nowrap;
}

.staff-table tbody tr {
  background: white;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.05);
  transition: 0.3s;
}

.staff-table tbody tr:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.staff-table td {
  padding: 15px;
  border: none;
  white-space: nowrap;
}

.staff-avatar {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #dbeafe;
}

.staff-name {
  display: flex;
  flex-direction: column;
}

.staff-name small {
  color: #6b7280;
  font-size: 12px;
}

.skill-badge {
  background: #eff6ff;
  color: #2563eb;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}

/* =====================================================
   BRANCH BADGE
===================================================== */

.branch-badge {
  background: #ecfdf5;
  color: #047857;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}

/* =====================================================
   ACTION BUTTONS
===================================================== */

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 38px;
  height: 38px;
  border: none;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: 0.3s;
}

.action-btn:hover {
  transform: translateY(-3px);
}

.action-btn.view {
  background: #dbeafe;
  color: #2563eb;
}

.action-btn.edit {
  background: #fef3c7;
  color: #d97706;
}

.action-btn.delete {
  background: #fee2e2;
  color: #dc2626;
}

/* =====================================================
   EMPTY STATE
===================================================== */

.empty-state {
  text-align: center;
  padding: 50px;
  color: #6b7280;
}

.empty-state i {
  font-size: 45px;
  color: #9ca3af;
}

/* =====================================================
   PAGINATION
===================================================== */

.pagination-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  color: #6b7280;
}

.page-buttons {
  display: flex;
  align-items: center;
  gap: 10px;
}

.page-btn {
  border: none;
  background: #2563eb;
  color: white;
  width: 38px;
  height: 38px;
  border-radius: 10px;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* =====================================================
   MODAL
===================================================== */

.teacher-modal {
  border: none;
  border-radius: 20px;
  overflow: hidden;
}

.modal-header {
  padding: 20px 25px;
}

.modal-body {
  padding: 25px;
}

.modal-footer {
  padding: 18px 25px;
}

.modal .form-control {
  border-radius: 12px;
  padding: 12px;
}

.modal select.form-control {
  cursor: pointer;
}

.teacher-modal-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 5px solid #dbeafe;
  object-fit: cover;
}

.teacher-details p {
  margin-bottom: 12px;
  line-height: 1.6;
  word-break: break-word;
}

.shift-box {
  border: 1px solid #dee2e6;
  padding: 14px 16px;
  border-radius: 12px;
  margin-bottom: 10px;
  background: #f8fafc;
  max-height: 180px;
  overflow-y: auto;
}

.shift-box .form-check {
  margin-bottom: 8px;
}

.shift-box .form-check:last-child {
  margin-bottom: 0;
}

/* =====================================================
   MOBILE
===================================================== */

@media (max-width: 768px) {
  .content {
    margin-left: 0;
    padding: 15px;
    min-height: 100vh;
  }

  .staff-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
    padding: 22px 20px;
    border-radius: 16px;
  }

  .staff-header h2 {
    font-size: 22px;
  }

  .staff-header p {
    font-size: 14px;
  }

  .staff-header-right {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .staff-summary {
    width: 100%;
    justify-content: flex-start;
  }

  .add-btn {
    width: 100%;
    justify-content: center;
    display: flex;
    align-items: center;
    gap: 7px;
  }

  .staff-table-card {
    padding: 16px;
    border-radius: 16px;
    overflow: visible;
  }

  .staff-toolbar {
    flex-direction: column;
    gap: 12px;
  }

  .search-box,
  .class-filter {
    width: 100%;
  }

  .staff-table {
    min-width: 1050px;
  }

  .table-responsive {
    border-radius: 10px;
  }

  .pagination-box {
    flex-direction: column;
    align-items: center;
    gap: 15px;
    text-align: center;
  }

  .modal {
    overflow-y: auto !important;
    padding: 12px !important;
  }

  .modal-dialog {
    width: 100%;
    max-width: 100%;
    margin: 0 auto;
    min-height: calc(100% - 24px);
    display: flex;
    align-items: center;
  }

  .modal-dialog-scrollable {
    height: auto;
    max-height: none;
  }

  .modal-content.teacher-modal {
    width: 100%;
    max-height: calc(100dvh - 24px);
    border-radius: 16px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .modal-header {
    padding: 16px 18px;
    flex-shrink: 0;
  }

  .modal-header h5 {
    font-size: 18px;
  }

  .modal-body {
    padding: 18px;
    overflow-y: auto !important;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
    min-height: 0;
    flex: 1 1 auto;
  }

  .modal-footer {
    padding: 14px 18px;
    flex-shrink: 0;
    gap: 8px;
  }

  .modal-footer .btn {
    flex: 1;
  }

  .image-preview {
    width: 80px;
    height: 80px;
  }

  .teacher-modal-avatar {
    width: 90px;
    height: 90px;
  }

  .teacher-details {
    padding-left: 5px !important;
    padding-right: 5px !important;
  }

  .teacher-details p {
    font-size: 14px;
    margin-bottom: 10px;
  }

  .shift-box {
    max-height: 150px;
  }
}

/* =====================================================
   SMALL MOBILE
===================================================== */

@media (max-width: 480px) {
  .content {
    padding: 10px;
  }

  .staff-header {
    padding: 18px 16px;
  }

  .staff-header h2 {
    font-size: 20px;
  }

  .staff-table-card {
    padding: 12px;
  }

  .modal {
    padding: 8px !important;
  }

  .modal-dialog {
    min-height: calc(100% - 16px);
  }

  .modal-content.teacher-modal {
    max-height: calc(100dvh - 16px);
    border-radius: 14px;
  }

  .modal-body {
    padding: 15px;
  }

  .modal-footer {
    padding: 12px 15px;
  }

  .modal-footer .btn {
    padding: 9px 12px;
  }
}
</style>
