<template>
  <RouterView />
  <AccountMenuView />

  <div class="mid">
    <div class="container-fluid py-4">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h2 class="fw-bold mb-1 header-title">Expense Management</h2>
          <p class="text-muted mb-0">Manage expenses by academic session.</p>
        </div>

        <button
          class="btn btn-primary px-4 py-2 fw-semibold rounded-3 btn-hover-effect"
          data-bs-toggle="modal"
          data-bs-target="#expenseModal"
          @click="resetForm"
        >
          <i class="bi bi-plus-circle me-2"></i>
          Add Expense
        </button>
      </div>

      <!-- Session Filter -->
      <div class="card border-0 shadow-sm rounded-4 mb-4">
        <div class="card-body">
          <div class="row g-3 align-items-end">
            <div class="col-md-5">
              <label class="form-label fw-semibold">Filter by Academic Session</label>
              <select
                class="form-select rounded-3"
                v-model="selectedSessionId"
                @change="currentPage = 1"
              >
                <option value="">All Sessions</option>
                <option
                  v-for="session in academicSessions"
                  :key="session.id"
                  :value="String(session.id)"
                >
                  {{ session.name }}{{ session.is_active ? ' (Active)' : '' }}
                </option>
              </select>
            </div>

            <div class="col-md-5">
              <label class="form-label fw-semibold">Search Expenses</label>
              <input
                type="text"
                class="form-control rounded-3"
                placeholder="Search expense, employee or method"
                v-model="search"
                @input="currentPage = 1"
              />
            </div>

            <div class="col-md-2">
              <button
                type="button"
                class="btn btn-outline-primary rounded-3 w-100"
                @click="resetFilters"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="row g-3 mb-4">
        <div class="col-lg-3 col-md-6">
          <div class="dash-summary-card card-blue animated-card">
            <div>
              <small>Total Expense</small>
              <h2>৳ {{ totalExpense.toFixed(2) }}</h2>
            </div>
            <div class="summary-icon"><i class="bi bi-wallet2"></i></div>
          </div>
        </div>

        <div class="col-lg-3 col-md-6">
          <div class="dash-summary-card card-green animated-card">
            <div>
              <small>Total Paid</small>
              <h2>৳ {{ totalPaid.toFixed(2) }}</h2>
            </div>
            <div class="summary-icon"><i class="bi bi-check-circle"></i></div>
          </div>
        </div>

        <div class="col-lg-3 col-md-6">
          <div class="dash-summary-card card-orange animated-card">
            <div>
              <small>Pending Due</small>
              <h2>৳ {{ totalDue.toFixed(2) }}</h2>
            </div>
            <div class="summary-icon"><i class="bi bi-clock-history"></i></div>
          </div>
        </div>

        <div class="col-lg-3 col-md-6">
          <div class="dash-summary-card card-purple animated-card">
            <div>
              <small>Monthly Expense</small>
              <h2>৳ {{ monthlyExpense.toFixed(2) }}</h2>
            </div>
            <div class="summary-icon"><i class="bi bi-calendar-check"></i></div>
          </div>
        </div>
      </div>

      <!-- Expense Table -->
      <div class="card shadow-sm border-0 rounded-4 overflow-hidden mb-4">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="custom-blue-header">
              <tr>
                <th>#</th>
                <th>Branch</th>
                <th>Academic Session</th>
                <th>Expense Type</th>
                <th>Employee Name</th>
                <th>Salary</th>
                <th>Paid</th>
                <th>Due</th>
                <th>Paid Month</th>
                <th>Method</th>
                <th>Created By</th>
                <th>Date</th>
                <th class="text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="(expense, index) in paginatedExpenses" :key="expense.id">
                <td class="fw-semibold text-muted">
                  {{ (currentPage - 1) * itemsPerPage + index + 1 }}
                </td>

                <td>
                  <span class="badge bg-primary-subtle text-primary border">
                    {{ getBranchName(expense.branch_id) }}
                  </span>
                </td>

                <td>
                  <span
                    v-if="getSessionName(expense)"
                    class="badge bg-info-subtle text-info-emphasis border"
                  >
                    {{ getSessionName(expense) }}
                  </span>
                  <span v-else class="text-muted">Unassigned</span>
                </td>

                <td class="fw-bold">{{ expense.expense_type }}</td>
                <td>{{ expense.employee_name || '-' }}</td>
                <td>৳ {{ money(expense.salary_amount) }}</td>

                <td>
                  <span class="badge bg-success-subtle text-success border px-2 py-1">
                    ৳ {{ money(expense.paid_amount) }}
                  </span>
                </td>

                <td>
                  <span class="badge bg-danger-subtle text-danger border px-2 py-1">
                    ৳ {{ money(expense.due_amount) }}
                  </span>
                </td>

                <td class="text-success fw-semibold">
                  {{ formatPaymentMonth(expense.payment_month) }}
                </td>

                <td>{{ expense.payment_method }}</td>

                <td>
                  <span class="badge bg-light text-dark border">
                    {{ expense.created_by || 'Admin' }}
                  </span>
                </td>

                <td>{{ expense.payment_date || '-' }}</td>

                <td>
                  <div class="d-flex justify-content-center gap-2">
                    <button
                      class="btn btn-sm btn-warning text-white fw-semibold"
                      data-bs-toggle="modal"
                      data-bs-target="#expenseModal"
                      @click="editExpense(expense)"
                    >
                      Edit
                    </button>

                    <button
                      class="btn btn-sm btn-danger fw-semibold"
                      @click="deleteExpense(expense.id)"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>

              <tr v-if="filteredExpenses.length === 0">
                <td colspan="13" class="text-center py-5 text-muted">
                  No expense records found for this session.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div
          class="card-footer bg-white py-3 border-0 d-flex justify-content-between align-items-center flex-wrap gap-3"
        >
          <span class="text-secondary">
            Showing {{ showingStart }} - {{ showingEnd }} of {{ filteredExpenses.length }} expenses
          </span>

          <div v-if="filteredExpenses.length" class="d-flex align-items-center gap-2">
            <button
              class="btn btn-light border"
              :disabled="currentPage <= 1"
              @click="currentPage--"
            >
              Previous
            </button>

            <span class="badge bg-primary-subtle text-primary border px-3 py-2">
              {{ currentPage }} / {{ totalPages }}
            </span>

            <button
              class="btn btn-light border"
              :disabled="currentPage >= totalPages"
              @click="currentPage++"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <!-- Add/Edit Modal -->
      <div class="modal fade" id="expenseModal" tabindex="-1">
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content border-0 shadow-lg rounded-4">
            <form @submit.prevent="saveExpense">
              <div class="modal-header border-bottom-0">
                <h5 class="modal-title fw-bold">
                  {{ isEditing ? 'Update Expense' : 'Add Expense' }}
                </h5>
                <button class="btn-close" data-bs-dismiss="modal" type="button"></button>
              </div>

              <div class="modal-body p-4">
                <div class="row g-3">
                  <!-- Branch: Manager -->
                  <div v-if="isManager" class="col-md-6">
                    <label class="form-label fw-semibold">Branch</label>
                    <select class="form-select rounded-3" v-model="form.branch_id" required>
                      <option value="">Select Branch</option>
                      <option
                        v-for="branch in branchesList"
                        :key="branch.id"
                        :value="String(branch.id)"
                      >
                        {{ branch.name }}
                      </option>
                    </select>
                  </div>

                  <!-- Academic Session -->
                  <div class="col-md-6">
                    <label class="form-label fw-semibold">Academic Session</label>
                    <select
                      class="form-select rounded-3"
                      v-model="form.academic_session_id"
                      required
                    >
                      <option value="">Select Academic Session</option>
                      <option
                        v-for="session in formSessions"
                        :key="session.id"
                        :value="String(session.id)"
                      >
                        {{ session.name }}{{ session.is_active ? ' (Active)' : '' }}
                      </option>
                    </select>
                    <small class="text-muted"> Choose the session this expense belongs to. </small>
                  </div>

                  <!-- Expense Type -->
                  <div class="col-md-6">
                    <label class="form-label fw-semibold">Expense Type</label>
                    <select class="form-select rounded-3" v-model="form.expense_type" required>
                      <option value="">Select Expense Type</option>
                      <option v-for="type in expenseTypes" :key="type.id" :value="type.name">
                        {{ type.name }}
                      </option>
                    </select>
                  </div>

                  <!-- Employee -->
                  <div class="col-md-6">
                    <label class="form-label fw-semibold">Employee / Teacher Name</label>

                    <select
                      v-if="form.expense_type === 'Teacher Payment'"
                      class="form-select rounded-3"
                      v-model="form.employee_name"
                      @change="onEmployeeSelect"
                      required
                    >
                      <option value="">Select Teacher</option>
                      <option
                        v-for="teacher in teachersList"
                        :key="teacher.id"
                        :value="teacher.full_name"
                      >
                        {{ teacher.full_name }}
                      </option>
                    </select>

                    <select
                      v-else-if="form.expense_type === 'Staff Payment'"
                      class="form-select rounded-3"
                      v-model="form.employee_name"
                      @change="onEmployeeSelect"
                      required
                    >
                      <option value="">Select Staff</option>
                      <option v-for="staff in staffsList" :key="staff.id" :value="staff.user_name">
                        {{ staff.user_name }}
                      </option>
                    </select>

                    <input
                      v-else
                      class="form-control rounded-3"
                      v-model="form.employee_name"
                      placeholder="Optional"
                    />
                  </div>

                  <!-- Salary -->
                  <div class="col-md-4">
                    <label class="form-label fw-semibold">Salary / Expense Amount</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      class="form-control rounded-3"
                      v-model="form.salary_amount"
                      required
                    />
                  </div>

                  <!-- Paid -->
                  <div class="col-md-4">
                    <label class="form-label fw-semibold">Paid Amount</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      class="form-control rounded-3"
                      v-model="form.paid_amount"
                      required
                    />
                  </div>

                  <!-- Due -->
                  <div class="col-md-4">
                    <label class="form-label fw-semibold">Due Amount</label>
                    <input
                      type="number"
                      class="form-control rounded-3 bg-light"
                      :value="form.due_amount"
                      readonly
                    />
                  </div>

                  <!-- Payment Month -->
                  <div class="col-md-6">
                    <label class="form-label fw-semibold">Payment Month</label>
                    <input
                      type="month"
                      class="form-control rounded-3"
                      v-model="form.payment_month"
                      required
                    />
                  </div>

                  <!-- Payment Date -->
                  <div class="col-md-6">
                    <label class="form-label fw-semibold">Payment Date</label>
                    <input type="date" class="form-control rounded-3" v-model="form.payment_date" />
                  </div>

                  <!-- Payment Method -->
                  <div class="col-md-6">
                    <label class="form-label fw-semibold">Payment Method</label>
                    <select class="form-select rounded-3" v-model="form.payment_method" required>
                      <option value="">Select Payment Method</option>
                      <option v-for="method in paymentMethods" :key="method" :value="method">
                        {{ method }}
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              <div class="modal-footer border-top-0">
                <button class="btn btn-light px-4 rounded-3" data-bs-dismiss="modal" type="button">
                  Cancel
                </button>

                <button class="btn btn-primary px-4 rounded-3" type="submit">
                  {{ isEditing ? 'Update Expense' : 'Save Expense' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import * as bootstrap from 'bootstrap'
import api from '@/services/api'
import AccountMenuView from './AccountMenuView.vue'

// =====================================================
// USER / ROLE
// =====================================================

const currentUser = ref(null)
const currentRole = ref('')

const loadCurrentUser = () => {
  try {
    currentUser.value = JSON.parse(localStorage.getItem('user') || 'null')
    currentRole.value = currentUser.value?.role || ''
  } catch (error) {
    console.error('Error loading current user:', error)
    currentUser.value = null
    currentRole.value = ''
  }
}

const isManager = computed(() => currentRole.value === 'Manager')

// =====================================================
// STATE
// =====================================================

const expenses = ref([])
const teachersList = ref([])
const staffsList = ref([])
const branchesList = ref([])
const academicSessions = ref([])

const search = ref('')
const selectedSessionId = ref('')
const isEditing = ref(false)
const editingId = ref(null)

const currentPage = ref(1)
const itemsPerPage = ref(10)

const today = () => {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getPreviousMonth = () => {
  const d = new Date()
  d.setMonth(d.getMonth() - 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

const emptyForm = () => ({
  expense_type: '',
  employee_name: '',
  salary_amount: '',
  paid_amount: '',
  due_amount: 0,
  payment_month: getPreviousMonth(),
  payment_date: today(),
  payment_method: '',
  branch_id: '',
  academic_session_id: '',
})

const form = ref(emptyForm())

// =====================================================
// EXPENSE TYPES / PAYMENT METHODS
// =====================================================

const expenseTypes = [
  { id: 1, name: 'Staff Payment' },
  { id: 2, name: 'Teacher Payment' },
  { id: 3, name: 'Rent' },
  { id: 4, name: 'Electricity Bill' },
  { id: 5, name: 'Internet Bill' },
  { id: 6, name: 'Office Expense' },
  { id: 7, name: 'Others' },
]

const paymentMethods = ['Cash', 'Bkash', 'Nagad', 'Bank']

// =====================================================
// NORMALIZE API LIST RESPONSES
// =====================================================

const normalizeList = (data, keys = []) => {
  if (Array.isArray(data)) return data

  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key]
  }

  if (Array.isArray(data?.data)) return data.data

  return []
}

// =====================================================
// FETCH BRANCHES
// =====================================================

const fetchBranches = async () => {
  try {
    const response = await api.get('/branches')
    branchesList.value = normalizeList(response.data, ['branches'])
  } catch (error) {
    console.error('Error fetching branches:', error)
  }
}

const getBranchName = (branchId) => {
  if (!branchId) return '-'

  const branch = branchesList.value.find((item) => Number(item.id) === Number(branchId))

  return branch?.name || `Branch #${branchId}`
}

// =====================================================
// FETCH ACADEMIC SESSIONS
// =====================================================

const fetchAcademicSessions = async () => {
  try {
    const response = await api.get('/academic-sessions')

    academicSessions.value = normalizeList(response.data, [
      'academic_sessions',
      'academicSessions',
      'sessions',
    ])

    // Set the active session as the initial list filter.
    const activeSession = academicSessions.value.find((session) => Boolean(session.is_active))

    if (!selectedSessionId.value && activeSession) {
      selectedSessionId.value = String(activeSession.id)
    }

    // For a new expense, preselect the active session of its branch.
    if (!form.value.academic_session_id) {
      setActiveSessionForForm()
    }
  } catch (error) {
    console.error('Error fetching academic sessions:', error)
  }
}

// =====================================================
// BRANCH-AWARE SESSION OPTIONS
// =====================================================

const formSessions = computed(() => {
  let sessions = academicSessions.value

  let branchId = ''

  if (isManager.value) {
    branchId = form.value.branch_id
  } else {
    branchId = currentUser.value?.branch_id || ''
  }

  if (branchId) {
    sessions = sessions.filter((session) => Number(session.branch_id) === Number(branchId))
  } else if (isManager.value) {
    // Manager must select a branch before selecting a session.
    sessions = []
  }

  return sessions
})

const setActiveSessionForForm = () => {
  const activeSession = formSessions.value.find((session) => Boolean(session.is_active))

  if (activeSession) {
    form.value.academic_session_id = String(activeSession.id)
  }
}

watch(
  () => form.value.branch_id,
  (newBranchId, oldBranchId) => {
    if (!isManager.value || newBranchId === oldBranchId) return

    form.value.academic_session_id = ''
    setActiveSessionForForm()
  },
)

watch(
  () => formSessions.value.map((session) => session.id).join(','),
  () => {
    if (
      form.value.academic_session_id &&
      !formSessions.value.some(
        (session) => String(session.id) === String(form.value.academic_session_id),
      )
    ) {
      form.value.academic_session_id = ''
    }
  },
)

// =====================================================
// SESSION LABELS
// =====================================================

const getSessionName = (expense) => {
  const relation = expense.academic_session || expense.academicSession

  if (relation?.name) return relation.name

  const session = academicSessions.value.find(
    (item) => Number(item.id) === Number(expense.academic_session_id),
  )

  return session?.name || ''
}

// =====================================================
// FETCH TEACHERS / STAFF
// =====================================================

const fetchTeachers = async () => {
  try {
    const response = await api.get('/expense-teachers')
    teachersList.value = normalizeList(response.data, ['teachers'])
  } catch (error) {
    console.error('Error fetching teachers:', error)
  }
}

const fetchStaffs = async () => {
  try {
    const response = await api.get('/expense-staffs')
    staffsList.value = normalizeList(response.data, ['staffs'])
  } catch (error) {
    console.error('Error fetching staffs:', error)
  }
}

// =====================================================
// EMPLOYEE SELECTION
// =====================================================

const onEmployeeSelect = () => {
  let selectedPerson = null

  if (form.value.expense_type === 'Teacher Payment') {
    selectedPerson = teachersList.value.find(
      (teacher) => teacher.full_name === form.value.employee_name,
    )
  } else if (form.value.expense_type === 'Staff Payment') {
    selectedPerson = staffsList.value.find((staff) => staff.user_name === form.value.employee_name)
  }

  if (selectedPerson) {
    form.value.salary_amount = selectedPerson.salary ?? ''
    form.value.paid_amount = selectedPerson.salary ?? ''
    form.value.payment_method = 'Cash'
    form.value.payment_month = getPreviousMonth()
  } else {
    form.value.salary_amount = ''
  }
}

watch(
  () => form.value.employee_name,
  (newName) => {
    if (!newName) return
    onEmployeeSelect()
  },
)

// =====================================================
// CALCULATE DUE
// =====================================================

watch(
  () => [form.value.salary_amount, form.value.paid_amount],
  () => {
    const salary = Number(form.value.salary_amount) || 0
    const paid = Number(form.value.paid_amount) || 0
    form.value.due_amount = Math.max(0, salary - paid)
  },
)

// =====================================================
// SESSION-WISE FILTERING
// =====================================================

const sessionFilteredExpenses = computed(() => {
  if (!selectedSessionId.value) return expenses.value

  return expenses.value.filter(
    (expense) => String(expense.academic_session_id ?? '') === String(selectedSessionId.value),
  )
})

const filteredExpenses = computed(() => {
  const query = search.value.trim().toLowerCase()

  if (!query) return sessionFilteredExpenses.value

  return sessionFilteredExpenses.value.filter((expense) =>
    [
      expense.id,
      expense.expense_type,
      expense.employee_name,
      expense.payment_method,
      expense.created_by,
    ].some((value) =>
      String(value ?? '')
        .toLowerCase()
        .includes(query),
    ),
  )
})

const paginatedExpenses = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredExpenses.value.slice(start, start + itemsPerPage.value)
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredExpenses.value.length / itemsPerPage.value)),
)

const showingStart = computed(() =>
  filteredExpenses.value.length ? (currentPage.value - 1) * itemsPerPage.value + 1 : 0,
)

const showingEnd = computed(() =>
  Math.min(currentPage.value * itemsPerPage.value, filteredExpenses.value.length),
)

// =====================================================
// SESSION-WISE SUMMARY CARDS
// =====================================================

const totalExpense = computed(() =>
  sessionFilteredExpenses.value.reduce(
    (total, expense) => total + Number(expense.salary_amount || 0),
    0,
  ),
)

const totalPaid = computed(() =>
  sessionFilteredExpenses.value.reduce(
    (total, expense) => total + Number(expense.paid_amount || 0),
    0,
  ),
)

const totalDue = computed(() =>
  sessionFilteredExpenses.value.reduce(
    (total, expense) => total + Number(expense.due_amount || 0),
    0,
  ),
)

const monthlyExpense = computed(() => {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  return sessionFilteredExpenses.value
    .filter((expense) => {
      if (!expense.payment_date) return false

      // Avoid timezone shifts when reading a date-only database value.
      const parts = String(expense.payment_date).split('-')
      if (parts.length < 3) return false

      return Number(parts[1]) - 1 === currentMonth && Number(parts[0]) === currentYear
    })
    .reduce((total, expense) => total + Number(expense.salary_amount || 0), 0)
})

// =====================================================
// RESET FILTERS / FORM
// =====================================================

const resetFilters = () => {
  selectedSessionId.value = ''
  search.value = ''
  currentPage.value = 1
}

const resetForm = () => {
  isEditing.value = false
  editingId.value = null
  form.value = emptyForm()
  setActiveSessionForForm()
}

// =====================================================
// FORMATTING
// =====================================================

const money = (value) => Number(value || 0).toFixed(2)

const formatPaymentMonth = (monthStr) => {
  if (!monthStr) return '-'

  const parts = String(monthStr).split('-')
  if (parts.length < 2) return monthStr

  const year = Number(parts[0])
  const month = Number(parts[1])

  if (!year || month < 1 || month > 12) return monthStr

  return new Date(year, month - 1, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
}

// =====================================================
// FETCH EXPENSES
// =====================================================

const getExpenses = async () => {
  try {
    const response = await api.get('/expenses')
    expenses.value = normalizeList(response.data, ['expenses'])
    currentPage.value = 1
  } catch (error) {
    console.error('Error fetching expenses:', error)
    alert(error.response?.data?.message || 'Unable to load expenses.')
  }
}

// =====================================================
// MODAL CLEANUP
// =====================================================

const cleanupModals = () => {
  document.querySelectorAll('.modal').forEach((modalEl) => {
    const instance = bootstrap.Modal.getInstance(modalEl)
    if (instance) instance.dispose()

    modalEl.classList.remove('show')
    modalEl.style.removeProperty('display')
    modalEl.style.removeProperty('padding-right')
    modalEl.removeAttribute('aria-modal')
    modalEl.setAttribute('aria-hidden', 'true')
    modalEl.removeAttribute('role')
  })

  document.querySelectorAll('.modal-backdrop').forEach((backdrop) => backdrop.remove())

  document.body.classList.remove('modal-open')
  document.body.style.removeProperty('overflow')
  document.body.style.removeProperty('padding-right')
  document.documentElement.style.removeProperty('overflow')
  document.documentElement.style.removeProperty('padding-right')
}

const handleBrowserBack = () => cleanupModals()

const closeModal = () => {
  const modalElement = document.getElementById('expenseModal')

  if (modalElement) {
    bootstrap.Modal.getInstance(modalElement)?.hide()
  }

  window.setTimeout(cleanupModals, 150)
}

// =====================================================
// SAVE EXPENSE
// =====================================================

const saveExpense = async () => {
  try {
    if (!form.value.academic_session_id) {
      alert('Please select an academic session.')
      return
    }

    if (isManager.value && !form.value.branch_id) {
      alert('Please select a branch.')
      return
    }

    const session = formSessions.value.find(
      (item) => String(item.id) === String(form.value.academic_session_id),
    )

    if (!session) {
      alert('The selected session does not belong to the selected branch.')
      return
    }

    const payload = {
      expense_type: form.value.expense_type,
      employee_name: form.value.employee_name || null,
      salary_amount: Number(form.value.salary_amount),
      paid_amount: Number(form.value.paid_amount),
      due_amount: Number(form.value.due_amount),
      payment_month: form.value.payment_month,
      payment_date: form.value.payment_date || null,
      payment_method: form.value.payment_method,
      academic_session_id: Number(form.value.academic_session_id),
    }

    // Only Manager supplies a branch.
    if (isManager.value) {
      payload.branch_id = Number(form.value.branch_id)
    }

    if (isEditing.value) {
      await api.put(`/expenses/${editingId.value}`, payload)
    } else {
      await api.post('/expenses', payload)
    }

    closeModal()
    await getExpenses()
    resetForm()

    alert(isEditing.value ? 'Expense Updated Successfully' : 'Expense Saved Successfully')
  } catch (error) {
    console.error('Error saving expense:', error)

    if (error.response?.data?.errors) {
      alert(Object.values(error.response.data.errors).flat().join('\n'))
    } else {
      alert(error.response?.data?.message || 'Something went wrong.')
    }
  }
}

// =====================================================
// EDIT EXPENSE
// =====================================================

const editExpense = (expense) => {
  isEditing.value = true
  editingId.value = expense.id

  form.value = {
    expense_type: expense.expense_type || '',
    employee_name: expense.employee_name || '',
    salary_amount: expense.salary_amount ?? '',
    paid_amount: expense.paid_amount ?? '',
    due_amount: expense.due_amount ?? 0,
    payment_month: String(expense.payment_month || '').slice(0, 7),
    payment_date: expense.payment_date || '',
    payment_method: expense.payment_method || '',
    branch_id: isManager.value ? String(expense.branch_id || '') : '',
    academic_session_id: expense.academic_session_id ? String(expense.academic_session_id) : '',
  }
}

// =====================================================
// DELETE EXPENSE
// =====================================================

const deleteExpense = async (id) => {
  if (!confirm('Are you sure you want to delete this expense?')) return

  try {
    await api.delete(`/expenses/${id}`)
    await getExpenses()
    alert('Expense Deleted Successfully')
  } catch (error) {
    console.error('Error deleting expense:', error)
    alert(error.response?.data?.message || 'Unable to delete expense.')
  }
}

// =====================================================
// LIFECYCLE
// =====================================================

onMounted(async () => {
  loadCurrentUser()

  window.addEventListener('popstate', handleBrowserBack)
  window.addEventListener('pageshow', handleBrowserBack)

  await Promise.all([
    fetchBranches(),
    fetchAcademicSessions(),
    fetchTeachers(),
    fetchStaffs(),
    getExpenses(),
  ])
})

onBeforeUnmount(() => {
  window.removeEventListener('popstate', handleBrowserBack)
  window.removeEventListener('pageshow', handleBrowserBack)
  cleanupModals()
})
</script>

<style scoped>
.dash-summary-card {
  border-radius: 12px;
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;
  transition: all 0.3s ease;
}

.animated-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.12);
}

.dash-summary-card small {
  opacity: 0.9;
  font-size: 14px;
  font-weight: 500;
}

.dash-summary-card h2 {
  margin-top: 8px;
  font-size: 24px;
  font-weight: 700;
  color: #fff !important;
  margin-bottom: 0;
  overflow-wrap: anywhere;
}

.card-blue {
  background: #1d4ed8;
}
.card-green {
  background: #15803d;
}
.card-orange {
  background: #c2410c;
}
.card-purple {
  background: #6d28d9;
}

.summary-icon {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.custom-blue-header th {
  background-color: #2563eb !important;
  color: #fff !important;
  font-weight: 600;
  padding: 14px;
  border: none;
  white-space: nowrap;
}

.table td {
  padding: 14px;
  white-space: nowrap;
}

.btn-hover-effect {
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.btn-hover-effect:active {
  transform: scale(0.96);
}

.mid {
  width: calc(100% - 266px);
  margin-left: 266px;
  transition: all 0.3s ease;
}

@media (max-width: 991.98px) {
  .mid {
    width: 100%;
    margin-left: 0;
    padding: 15px;
  }
}
</style>
