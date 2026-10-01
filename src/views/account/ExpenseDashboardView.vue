<template>
  <RouterView />

  <AccountMenuView />

  <div class="mid">
    <div class="container-fluid py-4">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="fw-bold mb-1 header-title">Expense Management</h2>
          <p class="text-muted mb-0">Manage all coaching expenses, staff payments and bills.</p>
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

      <!-- Summary Cards -->
      <div class="row g-3 mb-4">
        <div class="col-lg-3 col-md-6">
          <div class="dash-summary-card card-blue animated-card">
            <div>
              <small>Total Expense</small>
              <h2>৳ {{ totalExpense }}</h2>
            </div>

            <div class="summary-icon">
              <i class="bi bi-wallet2"></i>
            </div>
          </div>
        </div>

        <div class="col-lg-3 col-md-6">
          <div class="dash-summary-card card-green animated-card">
            <div>
              <small>Monthly Expense</small>
              <h2>৳ {{ monthlyExpense }}</h2>
            </div>

            <div class="summary-icon">
              <i class="bi bi-calendar-check"></i>
            </div>
          </div>
        </div>

        <div class="col-lg-3 col-md-6">
          <div class="dash-summary-card card-orange animated-card">
            <div>
              <small>Total Paid</small>
              <h2>৳ {{ totalPaid }}</h2>
            </div>

            <div class="summary-icon">
              <i class="bi bi-check-circle"></i>
            </div>
          </div>
        </div>

        <div class="col-lg-3 col-md-6">
          <div class="dash-summary-card card-purple animated-card">
            <div>
              <small>Pending Due</small>
              <h2>৳ {{ totalDue }}</h2>
            </div>

            <div class="summary-icon">
              <i class="bi bi-clock-history"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Card Container -->
      <div class="card shadow-sm border-0 rounded-4 overflow-hidden mb-4">
        <!-- Search -->
        <div class="card-body bg-white border-bottom py-3">
          <div class="row g-3 justify-content-end align-items-center">
            <div class="col-md-4 col-lg-3">
              <input
                type="text"
                class="form-control rounded-3 search-input"
                placeholder="Search ID / Name / Method"
                v-model="search"
                @input="currentPage = 1"
              />
            </div>
          </div>
        </div>

        <!-- Table -->
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="custom-blue-header">
              <tr>
                <th width="50">#</th>
                <th>Branch</th>
                <th>Expense Type</th>
                <th>Employee Name</th>
                <th>Salary</th>
                <th>Paid</th>
                <th>Due</th>
                <th>Paid Months</th>
                <th>Method</th>
                <th>Created By</th>
                <th>Date</th>
                <th width="160" class="text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="(expense, index) in paginatedExpenses" :key="expense.id">
                <td class="fw-semibold text-muted">
                  {{ (currentPage - 1) * itemsPerPage + index + 1 }}
                </td>

                <!-- Branch -->
                <td>
                  <span class="badge bg-primary-subtle text-primary border border-primary-subtle">
                    {{ getBranchName(expense.branch_id) }}
                  </span>
                </td>

                <td class="fw-bold text-dark">
                  {{ expense.expense_type }}
                </td>

                <td>
                  {{ expense.employee_name || '-' }}
                </td>

                <td>৳ {{ expense.salary_amount }}</td>

                <td>
                  <span
                    class="badge bg-success-subtle text-success border border-success-subtle px-2 py-1"
                  >
                    ৳ {{ expense.paid_amount }}
                  </span>
                </td>

                <td>
                  <span
                    class="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1"
                  >
                    ৳ {{ expense.due_amount }}
                  </span>
                </td>

                <td class="text-success fw-semibold">
                  {{ formatPaymentMonth(expense.payment_month) }}
                </td>

                <td>
                  {{ expense.payment_method }}
                </td>

                <td>
                  <span class="badge bg-light text-dark border fw-semibold">
                    <i class="bi bi-person-fill me-1 text-secondary"></i>
                    {{ expense.created_by || 'Admin' }}
                  </span>
                </td>

                <td>
                  {{ expense.payment_date }}
                </td>

                <td>
                  <div class="d-flex justify-content-center gap-2">
                    <button
                      class="btn btn-sm btn-warning fw-semibold px-3 text-white btn-action"
                      @click="editExpense(expense)"
                      data-bs-toggle="modal"
                      data-bs-target="#expenseModal"
                    >
                      Edit
                    </button>

                    <button
                      class="btn btn-sm btn-danger fw-semibold px-3 btn-action"
                      @click="deleteExpense(expense.id)"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>

              <tr v-if="filteredExpenses.length === 0">
                <td colspan="12" class="text-center py-5 text-muted">No Expense Record Found</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div
          class="card-footer bg-white py-3 border-0 d-flex justify-content-between align-items-center flex-wrap gap-3"
        >
          <span class="text-secondary fw-semibold fs-7">
            Showing {{ showingStart }} - {{ showingEnd }} of {{ filteredExpenses.length }} Expenses
          </span>

          <div class="d-flex align-items-center gap-2" v-if="totalPages > 0">
            <button
              class="btn btn-light border px-3 fw-semibold text-muted"
              :class="{ disabled: currentPage === 1 }"
              @click="currentPage--"
              :disabled="currentPage === 1"
            >
              Previous
            </button>

            <span
              class="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 fs-6 fw-bold"
            >
              {{ currentPage }} / {{ totalPages }}
            </span>

            <button
              class="btn btn-light border px-3 fw-semibold text-muted"
              :class="{
                disabled: currentPage === totalPages || filteredExpenses.length === 0,
              }"
              @click="currentPage++"
              :disabled="currentPage === totalPages || filteredExpenses.length === 0"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <!-- Modal -->
      <div class="modal fade" id="expenseModal" tabindex="-1">
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content border-0 shadow-lg rounded-4 modal-animated">
            <form @submit.prevent="saveExpense">
              <div class="modal-header border-bottom-0 pb-0">
                <h5 class="modal-title fw-bold">
                  {{ isEditing ? 'Update Expense' : 'Add Expense' }}
                </h5>

                <button class="btn-close" data-bs-dismiss="modal" type="button"></button>
              </div>

              <div class="modal-body p-4">
                <div class="row g-3">
                  <!-- ================================================= -->
                  <!-- BRANCH -->
                  <!-- Manager ONLY -->
                  <!-- ================================================= -->
                  <div v-if="isManager" class="col-md-6">
                    <label class="form-label fw-semibold"> Branch </label>

                    <select
                      class="form-select rounded-3"
                      v-model="form.branch_id"
                      :required="isManager"
                    >
                      <option value="">Select Branch</option>

                      <option v-for="branch in branchesList" :key="branch.id" :value="branch.id">
                        {{ branch.name }}
                      </option>
                    </select>
                  </div>

                  <!-- ================================================= -->
                  <!-- EXPENSE TYPE -->
                  <!-- ================================================= -->
                  <div :class="isManager ? 'col-md-6' : 'col-md-6'">
                    <label class="form-label fw-semibold"> Expense Type </label>

                    <select class="form-select rounded-3" v-model="form.expense_type" required>
                      <option value="">Select Expense Type</option>

                      <option v-for="type in expenseTypes" :key="type.id" :value="type.name">
                        {{ type.name }}
                      </option>
                    </select>
                  </div>

                  <!-- Employee / Teacher Name -->
                  <div class="col-md-6">
                    <label class="form-label fw-semibold"> Employee / Teacher Name </label>

                    <!-- Teacher -->
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

                    <!-- Staff -->
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

                    <!-- Other -->
                    <input
                      v-else
                      class="form-control rounded-3"
                      v-model="form.employee_name"
                      placeholder="Optional"
                    />
                  </div>

                  <!-- Salary -->
                  <div class="col-md-4">
                    <label class="form-label fw-semibold"> Salary Amount </label>

                    <input
                      type="number"
                      class="form-control rounded-3"
                      v-model="form.salary_amount"
                      required
                    />
                  </div>

                  <!-- Paid -->
                  <div class="col-md-4">
                    <label class="form-label fw-semibold"> Paid Amount </label>

                    <input
                      type="number"
                      class="form-control rounded-3"
                      v-model="form.paid_amount"
                      required
                    />
                  </div>

                  <!-- Due -->
                  <div class="col-md-4">
                    <label class="form-label fw-semibold"> Due Amount </label>

                    <input
                      type="number"
                      class="form-control rounded-3 bg-light"
                      :value="form.due_amount"
                      readonly
                    />
                  </div>

                  <!-- Payment Month -->
                  <div class="col-md-6">
                    <label class="form-label fw-semibold"> Payment Month </label>

                    <input
                      type="month"
                      class="form-control rounded-3"
                      v-model="form.payment_month"
                      required
                    />
                  </div>

                  <!-- Payment Method -->
                  <div class="col-md-6">
                    <label class="form-label fw-semibold"> Payment Method </label>

                    <select class="form-select rounded-3" v-model="form.payment_method" required>
                      <option value="">Select Payment Method</option>

                      <option v-for="method in paymentMethods" :key="method" :value="method">
                        {{ method }}
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              <div class="modal-footer border-top-0 pt-0">
                <button class="btn btn-light px-4 rounded-3" data-bs-dismiss="modal" type="button">
                  Cancel
                </button>

                <button class="btn btn-primary px-4 rounded-3 btn-hover-effect" type="submit">
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
// CURRENT USER / ROLE
// =====================================================

const currentUser = ref(null)

const currentRole = ref('')

const loadCurrentUser = () => {
  try {
    const storedUser = localStorage.getItem('user')

    if (storedUser) {
      currentUser.value = JSON.parse(storedUser)
      currentRole.value = currentUser.value?.role || ''
    }
  } catch (error) {
    console.error('Error loading current user:', error)

    currentUser.value = null
    currentRole.value = ''
  }
}

// =====================================================
// ROLE CHECK
// =====================================================

const isManager = computed(() => {
  return currentRole.value === 'Manager'
})

const isBranchRestricted = computed(() => {
  return currentRole.value === 'Branch Manager' || currentRole.value === 'Branch Accountant'
})

// =====================================================
// STATE
// =====================================================

const expenses = ref([])

const teachersList = ref([])

const staffsList = ref([])

const branchesList = ref([])

const search = ref('')

const isEditing = ref(false)

const editingId = ref(null)

// =====================================================
// PAGINATION
// =====================================================

const currentPage = ref(1)

const itemsPerPage = ref(10)

// =====================================================
// FORM
// =====================================================

const form = ref({
  expense_type: '',
  employee_name: '',
  salary_amount: '',
  paid_amount: '',
  due_amount: 0,
  payment_month: '',
  payment_method: '',
  branch_id: '',
})

// =====================================================
// EXPENSE TYPES
// =====================================================

const expenseTypes = [
  {
    id: 1,
    name: 'Staff Payment',
  },
  {
    id: 2,
    name: 'Teacher Payment',
  },
  {
    id: 3,
    name: 'Rent',
  },
  {
    id: 4,
    name: 'Electricity Bill',
  },
  {
    id: 5,
    name: 'Internet Bill',
  },
  {
    id: 6,
    name: 'Office Expense',
  },
  {
    id: 7,
    name: 'Others',
  },
]

// =====================================================
// PAYMENT METHODS
// =====================================================

const paymentMethods = ['Cash', 'Bkash', 'Nagad', 'Bank']

// =====================================================
// FETCH BRANCHES
// =====================================================

const fetchBranches = async () => {
  try {
    const response = await api.get('/branches')

    branchesList.value = response.data.branches || []
  } catch (error) {
    console.error('Error fetching branches:', error)
  }
}

// =====================================================
// GET BRANCH NAME
// =====================================================

const getBranchName = (branchId) => {
  if (!branchId) {
    return '-'
  }

  const branch = branchesList.value.find((item) => Number(item.id) === Number(branchId))

  return branch ? branch.name : `Branch #${branchId}`
}

// =====================================================
// FETCH TEACHERS
// =====================================================

const fetchTeachers = async () => {
  try {
    const response = await api.get('/expense-teachers')

    teachersList.value = response.data.teachers || []
  } catch (error) {
    console.error('Error fetching teachers:', error)
  }
}

// =====================================================
// FETCH STAFFS
// =====================================================

const fetchStaffs = async () => {
  try {
    const response = await api.get('/expense-staffs')

    staffsList.value = response.data.staffs || []
  } catch (error) {
    console.error('Error fetching staffs:', error)
  }
}

// =====================================================
// PREVIOUS MONTH
// =====================================================

const getPreviousMonth = () => {
  const date = new Date()

  date.setMonth(date.getMonth() - 1)

  const year = date.getFullYear()

  const month = String(date.getMonth() + 1).padStart(2, '0')

  return `${year}-${month}`
}

// =====================================================
// EMPLOYEE / TEACHER SELECTION
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
    form.value.salary_amount = selectedPerson.salary

    form.value.paid_amount = selectedPerson.salary

    form.value.payment_method = 'Cash'

    form.value.payment_month = getPreviousMonth()
  } else {
    form.value.salary_amount = ''
  }
}

// =====================================================
// AUTO UPDATE SALARY
// =====================================================

watch(
  () => form.value.employee_name,
  (newName) => {
    if (!newName) {
      return
    }

    if (form.value.expense_type === 'Teacher Payment') {
      const selectedTeacher = teachersList.value.find((teacher) => teacher.full_name === newName)

      if (selectedTeacher) {
        form.value.salary_amount = selectedTeacher.salary

        form.value.paid_amount = selectedTeacher.salary

        form.value.payment_method = 'Cash'

        form.value.payment_month = getPreviousMonth()
      }
    } else if (form.value.expense_type === 'Staff Payment') {
      const selectedStaff = staffsList.value.find((staff) => staff.user_name === newName)

      if (selectedStaff) {
        form.value.salary_amount = selectedStaff.salary

        form.value.paid_amount = selectedStaff.salary

        form.value.payment_method = 'Cash'

        form.value.payment_month = getPreviousMonth()
      }
    }
  },
)

// =====================================================
// AUTO CALCULATE DUE
// =====================================================

watch(
  () => [form.value.salary_amount, form.value.paid_amount],
  () => {
    const salary = Number(form.value.salary_amount) || 0

    const paid = Number(form.value.paid_amount) || 0

    form.value.due_amount = salary - paid

    if (form.value.due_amount < 0) {
      form.value.due_amount = 0
    }
  },
)

// =====================================================
// FILTER
// =====================================================

const filteredExpenses = computed(() => {
  if (!search.value) {
    return expenses.value
  }

  const searchText = search.value.toLowerCase()

  return expenses.value.filter(
    (expense) =>
      expense.expense_type?.toLowerCase().includes(searchText) ||
      expense.employee_name?.toLowerCase().includes(searchText) ||
      expense.payment_method?.toLowerCase().includes(searchText),
  )
})

// =====================================================
// PAGINATION
// =====================================================

const paginatedExpenses = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value

  const end = start + itemsPerPage.value

  return filteredExpenses.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredExpenses.value.length / itemsPerPage.value) || 1
})

const showingStart = computed(() => {
  if (filteredExpenses.value.length === 0) {
    return 0
  }

  return (currentPage.value - 1) * itemsPerPage.value + 1
})

const showingEnd = computed(() => {
  const end = currentPage.value * itemsPerPage.value

  return end > filteredExpenses.value.length ? filteredExpenses.value.length : end
})

// =====================================================
// DASHBOARD CARDS
// =====================================================

const totalExpense = computed(() => {
  return expenses.value.reduce((total, expense) => total + Number(expense.salary_amount || 0), 0)
})

const totalPaid = computed(() => {
  return expenses.value.reduce((total, expense) => total + Number(expense.paid_amount || 0), 0)
})

const totalDue = computed(() => {
  return expenses.value.reduce((total, expense) => total + Number(expense.due_amount || 0), 0)
})

const monthlyExpense = computed(() => {
  const currentMonth = new Date().getMonth()

  const currentYear = new Date().getFullYear()

  return expenses.value
    .filter((expense) => {
      if (!expense.payment_date) {
        return false
      }

      const date = new Date(expense.payment_date)

      return date.getMonth() === currentMonth && date.getFullYear() === currentYear
    })
    .reduce((total, expense) => total + Number(expense.salary_amount || 0), 0)
})

// =====================================================
// RESET FORM
// =====================================================

const resetForm = () => {
  isEditing.value = false

  editingId.value = null

  form.value = {
    expense_type: '',
    employee_name: '',
    salary_amount: '',
    paid_amount: '',
    due_amount: 0,
    payment_month: '',
    payment_method: '',

    // Manager will select this.
    // Branch Manager / Branch Accountant
    // will leave this empty because backend
    // automatically uses their own branch.
    branch_id: '',
  }
}

// =====================================================
// FORMAT PAYMENT MONTH
// =====================================================

const formatPaymentMonth = (monthStr) => {
  if (!monthStr) {
    return '-'
  }

  try {
    const dateObj = new Date(monthStr)

    if (!isNaN(dateObj.getTime())) {
      return dateObj.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    }

    const parts = monthStr.split('-')

    if (parts.length >= 2) {
      const year = parts[0]

      const monthIndex = parseInt(parts[1], 10) - 1

      const date = new Date(year, monthIndex, 1)

      return date.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    }
  } catch (error) {
    console.error('Error formatting month:', error)
  }

  return monthStr
}

// =====================================================
// FETCH EXPENSES
// =====================================================

const getExpenses = async () => {
  try {
    const response = await api.get('/expenses')

    expenses.value = [...(response.data.expenses || response.data || [])]

    currentPage.value = 1
  } catch (error) {
    console.error('Error fetching expenses:', error)
  }
}

// =====================================================
// MODAL CLEANUP
// =====================================================

const cleanupModals = () => {
  document.querySelectorAll('.modal').forEach((modalEl) => {
    try {
      const instance = bootstrap.Modal.getInstance(modalEl)

      if (instance) {
        instance.dispose()
      }
    } catch (error) {
      console.warn('Modal cleanup warning:', error)
    }

    modalEl.classList.remove('show')

    modalEl.style.removeProperty('display')

    modalEl.style.removeProperty('padding-right')

    modalEl.removeAttribute('aria-modal')

    modalEl.setAttribute('aria-hidden', 'true')

    modalEl.removeAttribute('role')
  })

  document.querySelectorAll('.modal-backdrop').forEach((backdrop) => {
    backdrop.remove()
  })

  document.body.classList.remove('modal-open')

  document.body.style.removeProperty('overflow')

  document.body.style.removeProperty('padding-right')

  document.documentElement.style.removeProperty('overflow')

  document.documentElement.style.removeProperty('padding-right')
}

// =====================================================
// BROWSER BACK
// =====================================================

const handleBrowserBack = () => {
  cleanupModals()
}

// =====================================================
// CLOSE MODAL
// =====================================================

const closeModal = () => {
  const modalElement = document.getElementById('expenseModal')

  if (modalElement) {
    const modalInstance = bootstrap.Modal.getInstance(modalElement)

    if (modalInstance) {
      modalInstance.hide()
    }
  }

  setTimeout(() => {
    cleanupModals()
  }, 150)
}

// =====================================================
// SAVE EXPENSE
// =====================================================

const saveExpense = async () => {
  try {
    const wasEditing = isEditing.value

    // =================================================
    // MANAGER
    // =================================================
    // Manager MUST select a branch.
    // =================================================

    if (isManager.value && !form.value.branch_id) {
      alert('Please select a branch.')

      return
    }

    // =================================================
    // BRANCH MANAGER / BRANCH ACCOUNTANT
    // =================================================
    // Do NOT send a manually selected branch.
    // Backend will automatically use:
    // $user->branch_id
    // =================================================

    const payload = {
      expense_type: form.value.expense_type,

      employee_name: form.value.employee_name,

      salary_amount: form.value.salary_amount,

      paid_amount: form.value.paid_amount,

      due_amount: form.value.due_amount,

      payment_month: form.value.payment_month,

      payment_method: form.value.payment_method,
    }

    // Only Manager sends branch_id.
    if (isManager.value) {
      payload.branch_id = Number(form.value.branch_id)
    }

    // =================================================
    // UPDATE
    // =================================================

    if (wasEditing) {
      await api.put(`/expenses/${editingId.value}`, payload)
    }

    // =================================================
    // CREATE
    // =================================================
    else {
      await api.post('/expenses', payload)
    }

    closeModal()

    resetForm()

    await getExpenses()

    alert(wasEditing ? 'Expense Updated Successfully' : 'Expense Added Successfully')
  } catch (error) {
    console.error('Error saving expense:', error)

    if (error.response?.data?.errors) {
      alert(Object.values(error.response.data.errors).flat().join('\n'))
    } else if (error.response?.data?.message) {
      alert(error.response.data.message)
    } else {
      alert('Something went wrong.')
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

    salary_amount: expense.salary_amount || '',

    paid_amount: expense.paid_amount || '',

    due_amount: expense.due_amount || 0,

    payment_month: expense.payment_month || '',

    payment_method: expense.payment_method || '',

    // Manager can see selected branch.
    // Branch roles do not need to change it.
    branch_id: isManager.value ? expense.branch_id || '' : '',
  }
}

// =====================================================
// DELETE EXPENSE
// =====================================================

const deleteExpense = async (id) => {
  if (!confirm('Are you sure you want to delete this expense?')) {
    return
  }

  try {
    await api.delete(`/expenses/${id}`)

    alert('Expense Deleted Successfully')

    await getExpenses()
  } catch (error) {
    console.error('Error deleting expense:', error)

    if (error.response?.data?.message) {
      alert(error.response.data.message)
    }
  }
}

// =====================================================
// LIFECYCLE
// =====================================================

onMounted(() => {
  // Load logged-in user's role FIRST.
  loadCurrentUser()

  // Browser / Mobile Back button
  window.addEventListener('popstate', handleBrowserBack)

  window.addEventListener('pageshow', handleBrowserBack)

  getExpenses()

  fetchTeachers()

  fetchStaffs()

  // Branch list is only actually needed
  // for Manager, but keeping the fetch
  // does not affect other roles.
  fetchBranches()
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
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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
  font-size: 26px;
  font-weight: 700;
  color: #ffffff !important;
  margin-bottom: 0;
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

.custom-blue-header {
  background-color: #2563eb !important;
}

.custom-blue-header th {
  background-color: #2563eb !important;
  color: #ffffff !important;
  font-weight: 600;
  padding: 14px;
  border: none;
  white-space: nowrap;
}

.table td {
  padding: 14px;
  white-space: nowrap;
}

.table-row-enter-active,
.table-row-leave-active {
  transition: all 0.3s ease;
}

.table-row-enter-from {
  opacity: 0;
  transform: translateX(-10px);
}

.table-row-leave-to {
  opacity: 0;
  transform: translateX(10px);
}

.btn-hover-effect {
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.btn-hover-effect:active {
  transform: scale(0.96);
}

.btn-action {
  transition: transform 0.15s ease;
}

.btn-action:hover {
  transform: scale(1.05);
}

.search-input {
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.search-input:focus {
  box-shadow: 0 0 0 0.25rem rgba(37, 99, 235, 0.15);
}

.modal.fade .modal-animated {
  transition: transform 0.25s ease-out;
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
