<template>
  <RouterView />

  <!-- Sidebar -->
  <AccountMenuView />

  <!-- Main Dashboard -->
  <div class="d-flex bg-light min-vh-100">
    <div class="dashboard-content">
      <!-- ================= HEADER ================= -->
      <div
        class="dashboard-header bg-white rounded-4 p-4 mb-4 shadow-sm d-flex justify-content-between align-items-center"
      >
        <!-- Left Side -->
        <div>
          <h3 class="fw-bold mb-1 text-dark">Dashboard</h3>
          <p class="text-muted mb-0 small">Welcome back! Here's today's coaching overview.</p>
        </div>

        <!-- Right Side -->
        <div class="d-flex align-items-center gap-3">
          <div class="text-end">
            <h6 class="fw-bold text-dark mb-0">
              {{ currentUser.name || 'Administrator' }}
            </h6>

            <small class="text-muted text-capitalize">
              {{ currentUser.role || 'System Admin' }}
            </small>
          </div>

          <div class="profile-avatar">
            <img
              :src="currentUser.image || defaultAvatar"
              @error="onImageError"
              class="profile-img"
              alt="Profile Image"
            />
          </div>
        </div>
      </div>

      <!-- ================= TOP STATISTICS ================= -->
      <div class="row g-4">
        <!-- Paid -->
        <div class="col-xl-3 col-md-6">
          <div class="dashboard-card paid-card">
            <div class="card-content">
              <span>Paid Amount</span>

              <h2 class="text-success">৳ {{ Number(totalCollection).toLocaleString() }}</h2>
            </div>

            <div class="stat-icon success">
              <i class="bi bi-wallet2"></i>
            </div>
          </div>
        </div>

        <!-- Expense -->
        <div class="col-xl-3 col-md-6">
          <div class="dashboard-card expense-card">
            <div class="card-content">
              <span>Total Expense</span>

              <h2 class="text-danger">৳ {{ Number(totalExpense).toLocaleString() }}</h2>
            </div>

            <div class="stat-icon danger">
              <i class="bi bi-cash-stack"></i>
            </div>
          </div>
        </div>

        <!-- Due -->
        <div class="col-xl-3 col-md-6">
          <div class="dashboard-card due-card">
            <div class="card-content">
              <span>Total Due</span>

              <h2 class="text-warning">৳ {{ Number(totalDueAmount).toLocaleString() }}</h2>
            </div>

            <div class="stat-icon warning">
              <i class="bi bi-exclamation-circle"></i>
            </div>
          </div>
        </div>

        <!-- Cash -->
        <div class="col-xl-3 col-md-6">
          <div class="dashboard-card cash-card">
            <div class="card-content">
              <span>Current Cash</span>

              <h2 class="text-primary">৳ {{ Number(currentCash).toLocaleString() }}</h2>
            </div>

            <div class="stat-icon primary">
              <i class="bi bi-bank"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- ================= CHART + QUICK OVERVIEW ================= -->
      <div class="row g-4 mt-4">
        <!-- Chart -->
        <div class="col-lg-8">
          <div class="dashboard-box chart-box" style="height: 588px">
            <div class="box-header">
              <div>
                <h5>
                  <i class="bi bi-bar-chart-line-fill text-primary"></i>
                  Monthly Payment Chart
                </h5>

                <p>Monthly collection performance</p>
              </div>

              <button class="btn btn-light btn-sm">This Year</button>
            </div>

            <div class="chart-area" style="height: 453px">
              <MonthlyPaymentChart :payments="monthlyPayments" />
            </div>
          </div>
        </div>

        <!-- Quick Overview -->
        <div class="col-lg-4">
          <div class="dashboard-box quick-box">
            <h5 class="mb-4">Quick Overview</h5>

            <!-- This Month Collection -->
            <div class="quick-item">
              <i class="bi bi-currency-dollar text-success"></i>

              <div>
                <h4>৳ {{ Number(thisMonthCollection).toLocaleString() }}</h4>

                <small>This Month Collection</small>
              </div>
            </div>

            <!-- Other Collection -->
            <div class="quick-item">
              <i class="bi bi-bag-check text-primary"></i>

              <div>
                <h4>৳ {{ Number(totalOtherPayment).toLocaleString() }}</h4>

                <small>Other Collection</small>
              </div>
            </div>

            <!-- This Month Due -->
            <div class="quick-item">
              <i class="bi bi-calendar-x text-danger"></i>

              <div>
                <h4>৳ {{ Number(thisMonthDue).toLocaleString() }}</h4>

                <small>This Month Due</small>
              </div>
            </div>

            <!-- Total Students -->
            <div class="quick-item">
              <i class="bi bi-person-x text-warning"></i>

              <div>
                <h4>
                  {{ totalStudents }}
                </h4>

                <small>Total Students</small>
              </div>
            </div>

            <!-- Unpaid Students -->
            <div class="quick-item">
              <i class="bi bi-person-x text-warning"></i>

              <div>
                <h4>
                  {{ runningMonthUnpaidStudents }}
                </h4>

                <small>Unpaid Students</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ================= STUDENT STATISTICS ================= -->
      <div class="row g-4 mt-4">
        <!-- Due Students -->
        <div class="col-md-3">
          <div class="dashboard-box small-stat">
            <i class="bi bi-exclamation-triangle text-danger"></i>

            <h3>
              {{ dueStudents }}
            </h3>

            <p>Due Students</p>
          </div>
        </div>

        <!-- Today's Collection -->
        <div class="col-md-3">
          <div class="dashboard-box small-stat">
            <i class="bi bi-cash-coin text-success"></i>

            <h3>৳ {{ Number(todayCollection).toLocaleString() }}</h3>

            <p>Today's Collection</p>
          </div>
        </div>

        <!-- Today's Expense -->
        <div class="col-md-3">
          <div class="dashboard-box small-stat">
            <i class="bi bi-mortarboard text-primary"></i>

            <h3>৳ {{ Number(todayExpense).toLocaleString() }}</h3>

            <p>Today's Expense</p>
          </div>
        </div>

        <!-- Admission + Exam -->
        <div class="col-md-3">
          <div class="dashboard-box small-stat">
            <i class="bi bi-receipt text-warning"></i>

            <h3>৳ {{ Number(admissionExamCollection).toLocaleString() }}</h3>

            <p>Admission + Exam Fee</p>
          </div>
        </div>
      </div>

      <!-- ================= RECENT PAYMENTS ================= -->
      <div class="dashboard-box payment-box mt-4">
        <div class="box-header">
          <div>
            <h5>
              <i class="bi bi-clock-history text-success"></i>
              Recent Payments
            </h5>

            <p>Latest student transactions</p>
          </div>

          <button class="btn btn-primary btn-sm" type="button">View All</button>
        </div>

        <div class="table-responsive">
          <table class="table payment-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Student</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              <!-- Empty -->
              <tr v-if="recentPayments.length === 0">
                <td colspan="5" class="text-center text-muted py-4">No recent payments found.</td>
              </tr>

              <!-- Payments -->
              <tr v-for="(payment, index) in recentPayments.slice(0, 5)" :key="payment.id || index">
                <td>
                  {{ index + 1 }}
                </td>

                <td>
                  {{ payment.student?.full_name || 'N/A' }}
                </td>

                <td>৳ {{ Number(payment.paid_amount || 0).toLocaleString() }}</td>

                <td>
                  <span
                    class="badge"
                    :class="payment.status === 'paid' ? 'bg-success' : 'bg-danger'"
                  >
                    {{ payment.status || 'due' }}
                  </span>
                </td>

                <td>
                  {{ payment.payment_date || 'N/A' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import AccountMenuView from './AccountMenuView.vue'
import MonthlyPaymentChart from '@/components/MonthlyPaymentChart.vue'
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'

/* =========================================================
   LOCAL SAFE AVATAR
========================================================= */

const defaultAvatar = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="%23cbd5e1"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.5-3.5-3.5S10.07 6 12 6zm0 14c-2.03 0-3.8-1.04-4.83-2.61.03-1.6 3.22-2.48 4.83-2.48s4.8 1.88 4.83 2.48C15.8 18.96 14.03 20 12 20z"/></svg>`

/* =========================================================
   DASHBOARD STATES
========================================================= */

const totalPaidAmount = ref(0)
const totalDueAmount = ref(0)
const totalStudents = ref(0)
const dueStudents = ref(0)
const recentPayments = ref([])
const monthlyPayments = ref([])
const thisMonthDue = ref(0)
const payments = ref([])
const totalExpense = ref(0)
const totalOtherPayment = ref(0)
const runningMonthUnpaidStudents = ref(0)
const rawOtherPayments = ref([])
const thisMonthCollection = ref(0)
const todayCollection = ref(0)
const todayExpense = ref(0)
const admissionExamCollection = ref(0)

/* =========================================================
   CURRENT USER
========================================================= */

const currentUser = ref({
  name: '',
  role: '',
  image: '',
})

/* =========================================================
   TOTAL COLLECTION
========================================================= */

const totalCollection = computed(() => {
  return (
    Number(totalPaidAmount.value) +
    Number(admissionExamCollection.value) +
    Number(totalOtherPayment.value)
  )
})

/* =========================================================
   CURRENT CASH
========================================================= */

const currentCash = computed(() => {
  return Number(totalCollection.value) - Number(totalExpense.value)
})

/* =========================================================
   IMAGE URL
========================================================= */

const getImageUrl = (path) => {
  if (!path) {
    return defaultAvatar
  }

  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:image')) {
    return path
  }

  const cleanPath = path.replace(/^\/+/, '')

  if (cleanPath.startsWith('storage/')) {
    return `http://127.0.0.1:8000/${cleanPath}`
  }

  return `http://127.0.0.1:8000/storage/${cleanPath}`
}

/* =========================================================
   IMAGE ERROR
========================================================= */

const onImageError = (e) => {
  e.target.onerror = null
  e.target.src = defaultAvatar
}

/* =========================================================
   GET DASHBOARD DATA
========================================================= */

const getDashboardData = async () => {
  try {
    const response = await api.get('/payments')

    const data = response.data

    console.log('FULL RESPONSE:', data)

    /* =====================================================
       BASIC DASHBOARD VALUES
    ===================================================== */

    totalPaidAmount.value = Number(data.total_paid_amount || 0)
    totalDueAmount.value = Number(data.total_due_amount || 0)
    totalStudents.value = Number(data.total_students || 0)
    dueStudents.value = Number(data.due_students || 0)

    /* =====================================================
       BACKEND CALCULATED COLLECTIONS
    ===================================================== */

    thisMonthDue.value = Number(data.this_month_due || 0)

    /* =====================================================
       PAGINATED PAYMENTS
    ===================================================== */

    payments.value = data.payments?.data || []

    /* =====================================================
       TODAY'S COLLECTION

       Backend today_collection
       +
       today's admission fee
       +
       today's exam fee

       NOTHING CHANGED HERE
    ===================================================== */

    const today = new Date().toISOString().slice(0, 10)

    const todayAdmissionExam = payments.value.reduce((total, payment) => {
      if (payment.payment_date?.slice(0, 10) === today) {
        return total + Number(payment.admission_fee || 0) + Number(payment.exam_fee || 0)
      }

      return total
    }, 0)

    todayCollection.value = Number(data.today_collection || 0) + todayAdmissionExam

    /* =====================================================
       THIS MONTH STUDENT COLLECTION

       ONLY student payment part here.
       Other Payment is combined later.
    ===================================================== */

    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.getMonth()

    const thisMonthStudentCollection = payments.value.reduce((total, payment) => {
      const paymentDate = payment.payment_date ? new Date(payment.payment_date) : null

      if (
        paymentDate &&
        paymentDate.getFullYear() === currentYear &&
        paymentDate.getMonth() === currentMonth
      ) {
        return (
          total +
          Number(payment.paid_amount || 0) +
          Number(payment.admission_fee || 0) +
          Number(payment.exam_fee || 0)
        )
      }

      return total
    }, 0)

    /* =====================================================
       STORE STUDENT COLLECTION TEMPORARILY
    ===================================================== */

    thisMonthCollection.value = thisMonthStudentCollection

    /* =====================================================
       OTHER DASHBOARD DATA
    ===================================================== */

    recentPayments.value = data.recent_payments || []
    monthlyPayments.value = data.monthly_payments || []

    runningMonthUnpaidStudents.value = Number(data.running_month_unpaid_students || 0)

    /* =====================================================
       ADMISSION + EXAM FEE
    ===================================================== */

    admissionExamCollection.value = payments.value.reduce((total, payment) => {
      return total + Number(payment.admission_fee || 0) + Number(payment.exam_fee || 0)
    }, 0)

    /* =====================================================
       LOGGED-IN USER
    ===================================================== */

    const loggedUser = data.user || data.manager || data.logged_in_user || data.accountant

    if (loggedUser) {
      currentUser.value = {
        name: loggedUser.name || loggedUser.full_name || loggedUser.username || 'Administrator',

        role: loggedUser.role || loggedUser.user_type || loggedUser.designation || 'System Admin',

        image: getImageUrl(
          loggedUser.image || loggedUser.profile_photo || loggedUser.avatar || loggedUser.photo,
        ),
      }
    }
  } catch (error) {
    console.error('Dashboard Data Fetch Error:', error.response?.data || error.message)
  }
}

/* =========================================================
   TOTAL EXPENSE + TODAY'S EXPENSE

   IMPORTANT BRANCH LOGIC:

   Manager
   -> /expenses returns ALL branches' expenses.

   Branch Manager / Branch Accountant
   -> /expenses returns ONLY their own branch's expenses.

   Therefore no branch_id is sent from frontend.
   Backend controls the branch isolation.

========================================================= */

const getTotalExpense = async () => {
  try {
    const response = await api.get('/expenses')

    const expenses = response.data.expenses || []

    /* =====================================================
       TOTAL EXPENSE

       Manager:
       -> All branch expenses

       Branch Manager / Branch Accountant:
       -> Own branch expenses only
    ===================================================== */

    totalExpense.value = expenses.reduce((total, expense) => {
      return total + Number(expense.paid_amount || 0)
    }, 0)

    /* =====================================================
       TODAY'S EXPENSE

       Same branch filtering comes from backend.
    ===================================================== */

    const today = new Date().toISOString().slice(0, 10)

    todayExpense.value = expenses.reduce((total, expense) => {
      if (expense.payment_date?.slice(0, 10) === today) {
        return total + Number(expense.paid_amount || 0)
      }

      return total
    }, 0)
  } catch (error) {
    console.error('Expense Error:', error.response?.data || error.message)

    totalExpense.value = 0
    todayExpense.value = 0
  }
}

/* =========================================================
   STAFF DASHBOARD + USER
========================================================= */

const getDashboardimages = async () => {
  try {
    /* =====================================================
       LOCAL STORAGE USER
    ===================================================== */

    const storedUser =
      localStorage.getItem('user') ||
      localStorage.getItem('userInfo') ||
      localStorage.getItem('auth_user')

    if (storedUser) {
      const parsedUser = JSON.parse(storedUser)

      currentUser.value = {
        name: parsedUser.name || parsedUser.full_name || parsedUser.username || 'Administrator',

        role: parsedUser.role || parsedUser.user_type || parsedUser.designation || 'System Admin',

        image: getImageUrl(
          parsedUser.image || parsedUser.profile_photo || parsedUser.avatar || parsedUser.photo,
        ),
      }
    }

    /* =====================================================
       STAFF DASHBOARD API
    ===================================================== */

    const response = await api.get('/staff/dashboard')

    const resData = response.data

    totalStudents.value = resData.total_students || totalStudents.value

    /* =====================================================
       API USER
    ===================================================== */

    if (resData.user) {
      const u = resData.user

      currentUser.value = {
        name: u.name || u.full_name || u.username || 'Administrator',

        role: u.role || u.user_type || u.designation || 'System Admin',

        image: getImageUrl(u.image || u.profile_photo || u.avatar || u.photo),
      }
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error.response?.data || error.message)
  }
}

/* =========================================================
   OTHER PAYMENTS

   This function ONLY loads and calculates
   Other Payment data.

   It does NOT directly modify thisMonthCollection.
========================================================= */

const getTotalOtherPayment = async () => {
  try {
    const response = await api.get('/other-payments')

    rawOtherPayments.value = response.data.data || []

    /* =====================================================
       TOTAL OTHER PAYMENT
    ===================================================== */

    totalOtherPayment.value = rawOtherPayments.value.reduce((total, payment) => {
      return total + Number(payment.total_amount || 0)
    }, 0)

    /* =====================================================
       THIS MONTH OTHER PAYMENT
    ===================================================== */

    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.getMonth()

    const thisMonthOtherPayment = rawOtherPayments.value.reduce((total, payment) => {
      const paymentDateValue = payment.payment_date || payment.date || payment.created_at

      const paymentDate = paymentDateValue ? new Date(paymentDateValue) : null

      if (
        paymentDate &&
        paymentDate.getFullYear() === currentYear &&
        paymentDate.getMonth() === currentMonth
      ) {
        return total + Number(payment.total_amount || 0)
      }

      return total
    }, 0)

    return thisMonthOtherPayment
  } catch (error) {
    console.error('Other Payment Error:', error)

    return 0
  }
}

/* =========================================================
   MOUNTED
========================================================= */

onMounted(async () => {
  /* =====================================================
     First load Payments + Other Payments together.
  ===================================================== */

  const [dashboardResult, otherPaymentResult] = await Promise.all([
    getDashboardData(),
    getTotalOtherPayment(),
  ])

  /* =====================================================
     Combine This Month Collection
  ===================================================== */

  thisMonthCollection.value =
    Number(thisMonthCollection.value || 0) + Number(otherPaymentResult || 0)

  /* =====================================================
     Independent Dashboard APIs
  ===================================================== */

  getDashboardimages()

  /*
   * IMPORTANT:
   *
   * Expense branch isolation is handled by
   * ExpenseController.
   *
   * Manager -> all branches
   * Branch Manager -> own branch
   * Branch Accountant -> own branch
   */
  getTotalExpense()
})
</script>

<style scoped>
.dashboard-content {
  margin-left: 250px;
  width: calc(100% - 250px);
  padding: 30px;
  background: #f8fafc;
  min-height: 100vh;
}

.dashboard-header {
  border: 1px solid #f1f5f9;
}

.profile-avatar img {
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.2);
}

.dashboard-card {
  background: white;
  border-radius: 22px;
  padding: 25px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: none;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08);
  transition: 0.35s ease;
  position: relative;
  overflow: hidden;
}

.dashboard-card::before {
  content: '';
  position: absolute;
  width: 100%;
  height: 5px;
  top: 0;
  left: 0;
}

.dashboard-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.15);
}

.paid-card::before {
  background: #16a34a;
}

.expense-card::before {
  background: #dc2626;
}

.due-card::before {
  background: #f59e0b;
}

.cash-card::before {
  background: #2563eb;
}

.card-content span {
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
}

.card-content h2 {
  margin-top: 12px;
  font-size: 28px;
  font-weight: 700;
}

.stat-icon {
  width: 65px;
  height: 65px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.stat-icon.success {
  background: #dcfce7;
  color: #16a34a;
}

.stat-icon.danger {
  background: #fee2e2;
  color: #dc2626;
}

.stat-icon.warning {
  background: #fef3c7;
  color: #d97706;
}

.stat-icon.primary {
  background: #dbeafe;
  color: #2563eb;
}

.dashboard-box {
  background: white;
  border-radius: 22px;
  padding: 25px;
  border: none;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08);
  transition: 0.35s ease;
}

.dashboard-box:hover {
  transform: translateY(-6px);
  box-shadow: 0 18px 35px rgba(15, 23, 42, 0.12);
}

.box-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.box-header h5 {
  font-weight: 700;
  color: #111827;
}

.box-header p {
  margin: 5px 0 0;
  color: #64748b;
  font-size: 14px;
}

.chart-area {
  height: 320px;
}

.quick-box h5 {
  font-weight: 700;
}

.quick-item {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 15px;
  background: #f8fafc;
  border-radius: 16px;
  margin-bottom: 15px;
  transition: 0.3s;
}

.quick-item:hover {
  background: #eff6ff;
  transform: translateX(5px);
}

.quick-item i {
  font-size: 32px;
}

.quick-item h4 {
  margin: 0;
  font-weight: 700;
}

.quick-item small {
  color: #64748b;
}

.small-stat {
  text-align: center;
}

.small-stat i {
  font-size: 45px;
}

.small-stat h3 {
  margin-top: 15px;
  font-weight: 700;
}

.small-stat p {
  color: #64748b;
  margin: 0;
}

.payment-box {
  margin-bottom: 30px;
}

.payment-table {
  margin: 0;
}

.payment-table thead th {
  background: #f8fafc;
  color: #64748b;
  font-size: 13px;
  border: none;
  padding: 15px;
}

.payment-table tbody td {
  padding: 16px;
  vertical-align: middle;
  border-bottom: 1px solid #f1f5f9;
}

.payment-table tbody tr {
  transition: 0.25s;
}

.payment-table tbody tr:hover {
  background: #f8fafc;
  transform: scale(1.01);
}

.badge {
  padding: 7px 14px;
  border-radius: 20px;
  font-size: 12px;
}

.btn {
  border-radius: 12px;
}

.profile-img {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 3px solid #2563eb;
  object-fit: cover;
}

.profile-avatar img {
  height: 60px;
  width: 60px;
  border-radius: 50%;
}

@media (max-width: 991px) {
  .dashboard-content {
    margin-left: 0;
    width: 100%;
    padding: 20px;
  }

  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
}

@media (max-width: 576px) {
  .dashboard-card {
    padding: 20px;
  }

  .stat-icon {
    width: 55px;
    height: 55px;
  }
}
</style>
