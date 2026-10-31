<template>
  <div class="dashboard-container">
    <StudentsDashboardMenueView />

    <div class="main-wrapper p-3 p-md-4">
      <header
        class="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-3 border-bottom"
      >
        <div>
          <h3 class="fw-bold text-dark mb-1">Payment History</h3>
          <p class="text-muted mb-0 small">View your fee payments and outstanding balance.</p>
        </div>

        <button
          class="btn btn-outline-primary btn-sm rounded-3"
          @click="fetchPayments"
          :disabled="loading"
        >
          <i class="bi me-1" :class="loading ? 'bi-arrow-repeat spin' : 'bi-arrow-clockwise'"></i>
          Refresh
        </button>
      </header>

      <!-- SUMMARY CARDS -->
      <div class="row g-3 mb-4">
        <div class="col-12 col-md-6 col-lg-4">
          <div class="summary-card bg-gradient-green text-white">
            <h6>Total Paid Amount</h6>
            <div class="summary-value">{{ money(totalPaid) }}</div>
            <small>Payments recorded for your account</small>
          </div>
        </div>

        <div class="col-12 col-md-6 col-lg-4">
          <div class="summary-card bg-gradient-orange text-white">
            <h6>Outstanding Fees</h6>
            <div class="summary-value">{{ money(totalDue) }}</div>
            <small>Remaining unpaid amount</small>
          </div>
        </div>

        <div class="col-12 col-md-6 col-lg-4">
          <div class="summary-card bg-gradient-blue text-white">
            <h6>Total Transactions</h6>
            <div class="summary-value">{{ payments.length }}</div>
            <small>Recorded payment entries</small>
          </div>
        </div>
      </div>

      <!-- PAYMENT HISTORY -->
      <div class="card border-0 shadow-sm rounded-4 p-3 p-md-4 mb-4">
        <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
          <div>
            <h5 class="fw-bold text-dark mb-1">Transaction Records</h5>
            <small class="text-muted"> {{ filteredHistory.length }} payment records </small>
          </div>

          <div class="d-flex flex-wrap align-items-center gap-2">
            <select v-model="selectedSession" class="form-select form-select-sm filter-select">
              <option value="All">All Sessions</option>
              <option v-for="session in availableSessions" :key="session" :value="session">
                {{ session }}
              </option>
            </select>

            <select v-model="selectedStatus" class="form-select form-select-sm filter-select">
              <option value="All">All Status</option>
              <option v-for="status in availableStatuses" :key="status" :value="status">
                {{ status }}
              </option>
            </select>
          </div>
        </div>

        <!-- ERROR -->
        <div v-if="errorMessage" class="alert alert-danger">
          <i class="bi bi-exclamation-circle me-2"></i>
          {{ errorMessage }}
          <button class="btn btn-sm btn-outline-danger ms-2" @click="fetchPayments">Retry</button>
        </div>

        <!-- LOADING -->
        <div v-if="loading" class="loading-state">
          <div class="spinner-border text-primary"></div>
          <p class="text-muted mt-3 mb-0">Loading payment history...</p>
        </div>

        <!-- TABLE -->
        <div v-else-if="!errorMessage" class="table-responsive">
          <table class="table table-borderless align-middle mb-0">
            <thead class="table-light text-muted text-uppercase">
              <tr>
                <th class="ps-3">Payment ID</th>
                <th>Payment Date</th>
                <th>Purpose / Month</th>
                <th>Payment Method</th>
                <th>Amount</th>
                <th>Due Amount</th>
                <th>Status</th>
                <th class="text-end pe-3">Receipt</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="item in paginatedHistory"
                :key="item.id"
                class="border-bottom border-light table-row-hover"
              >
                <td class="fw-semibold text-primary ps-3">#{{ item.id }}</td>

                <td class="text-muted">
                  {{ formatDate(item.payment_date) }}
                </td>

                <td>
                  <div class="fw-semibold text-dark">
                    {{ item.purpose }}
                  </div>
                  <small class="text-muted" v-if="item.session">
                    {{ item.session }}
                  </small>
                </td>

                <td>
                  <span class="d-inline-flex align-items-center gap-2">
                    <i :class="methodIcon(item.method)"></i>
                    {{ item.method || '—' }}
                  </span>
                </td>

                <td class="fw-bold text-dark">
                  {{ money(item.paid_amount) }}
                </td>

                <td class="text-danger fw-semibold">
                  {{ money(item.due_amount) }}
                </td>

                <td>
                  <span class="badge px-2 py-2" :class="statusClass(item.status)">
                    {{ item.status }}
                  </span>
                </td>

                <td class="text-end pe-3">
                  <button
                    type="button"
                    class="btn btn-outline-primary btn-sm rounded-3"
                    @click="downloadReceipt(item)"
                  >
                    <i class="bi bi-receipt me-1"></i>
                    Receipt
                  </button>
                </td>
              </tr>

              <tr v-if="filteredHistory.length === 0">
                <td colspan="8" class="text-center py-5 text-muted">
                  <i class="bi bi-folder2-open fs-2 d-block mb-2"></i>
                  No payment records found.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- PAGINATION -->
        <div
          v-if="!loading && !errorMessage && filteredHistory.length"
          class="d-flex flex-wrap justify-content-between align-items-center gap-3 mt-4 pt-3 border-top"
        >
          <small class="text-muted">
            Showing {{ firstItem }}–{{ lastItem }} of {{ filteredHistory.length }} entries
          </small>

          <nav>
            <ul class="pagination pagination-sm mb-0">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <button class="page-link" :disabled="currentPage === 1" @click="currentPage--">
                  Prev
                </button>
              </li>

              <li
                v-for="page in visiblePages"
                :key="page"
                class="page-item"
                :class="{ active: currentPage === page }"
              >
                <button class="page-link" @click="currentPage = page">
                  {{ page }}
                </button>
              </li>

              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <button
                  class="page-link"
                  :disabled="currentPage === totalPages"
                  @click="currentPage++"
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <footer class="d-flex flex-wrap justify-content-between gap-2 text-muted small py-2">
        <span>
          <i class="bi bi-shield-check text-success me-1"></i>
          Your payment records are private.
        </span>
        <span>Payment History</span>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import api from '@/services/api'
import StudentsDashboardMenueView from './StudentsDashboardMenueView.vue'

const payments = ref([])
const loading = ref(false)
const errorMessage = ref('')

const selectedSession = ref('All')
const selectedStatus = ref('All')

const currentPage = ref(1)
const perPage = 10

const numberValue = (value) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

const money = (value) => {
  return `৳${numberValue(value).toLocaleString('en-BD', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

const formatDate = (value) => {
  if (!value) return '—'

  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`)

  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const normalizeStatus = (payment) => {
  const rawStatus = String(payment.status || '').toLowerCase()

  if (rawStatus === 'paid' || rawStatus === 'completed') {
    return 'Completed'
  }

  if (rawStatus === 'failed' || rawStatus === 'cancelled') {
    return 'Failed'
  }

  if (numberValue(payment.due_amount) > 0) {
    return 'Pending'
  }

  return rawStatus ? rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1) : 'Recorded'
}

const normalizePayment = (payment) => {
  const paidAmount = numberValue(payment.paid_amount)
  const dueAmount = numberValue(payment.due_amount)

  const month = payment.month || payment.due_month || ''
  const purposeParts = []

  if (numberValue(payment.admission_fee) > 0) {
    purposeParts.push('Admission Fee')
  }

  if (numberValue(payment.exam_fee) > 0) {
    purposeParts.push('Examination Fee')
  }

  if (paidAmount > 0 && month) {
    purposeParts.push(`Monthly Fee - ${month}`)
  }

  if (!purposeParts.length) {
    purposeParts.push(month ? `Fee Payment - ${month}` : 'Fee Payment')
  }

  return {
    id: payment.id,
    payment_date: payment.payment_date,
    purpose: purposeParts.join(', '),
    session:
      payment.student_session?.academic_session?.name ||
      payment.student_session?.academic_session?.session_name ||
      payment.academic_session?.name ||
      payment.academic_session?.session_name ||
      '',
    method: payment.payment_method || payment.method || '—',
    paid_amount: paidAmount,
    due_amount: dueAmount,
    status: normalizeStatus(payment),
    raw: payment,
  }
}

const fetchPayments = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await api.get('/student/payments')
    const data = response?.data ?? {}

    const list = Array.isArray(data.payments)
      ? data.payments
      : Array.isArray(data.payments?.data)
        ? data.payments.data
        : Array.isArray(data.data)
          ? data.data
          : []

    payments.value = list.map(normalizePayment)
  } catch (error) {
    console.error('Failed to load student payments:', error)

    payments.value = []

    errorMessage.value =
      error?.response?.data?.message ||
      'Could not load payment history. Please check the student payments API.'
  } finally {
    loading.value = false
  }
}

const totalPaid = computed(() => {
  return payments.value.reduce((sum, payment) => sum + payment.paid_amount, 0)
})

const totalDue = computed(() => {
  // Sum the current outstanding due per payment record.
  return payments.value.reduce((sum, payment) => sum + payment.due_amount, 0)
})

const availableSessions = computed(() => {
  return [...new Set(payments.value.map((payment) => payment.session).filter(Boolean))]
})

const availableStatuses = computed(() => {
  return [...new Set(payments.value.map((payment) => payment.status).filter(Boolean))]
})

const filteredHistory = computed(() => {
  return payments.value.filter((payment) => {
    const sessionMatch =
      selectedSession.value === 'All' || payment.session === selectedSession.value

    const statusMatch = selectedStatus.value === 'All' || payment.status === selectedStatus.value

    return sessionMatch && statusMatch
  })
})

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(filteredHistory.value.length / perPage))
})

const paginatedHistory = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return filteredHistory.value.slice(start, start + perPage)
})

const firstItem = computed(() => {
  return filteredHistory.value.length ? (currentPage.value - 1) * perPage + 1 : 0
})

const lastItem = computed(() => {
  return Math.min(currentPage.value * perPage, filteredHistory.value.length)
})

const visiblePages = computed(() => {
  const total = totalPages.value
  const start = Math.max(1, Math.min(currentPage.value - 2, total - 4))
  const end = Math.min(total, start + 4)

  return Array.from({ length: end - start + 1 }, (_, index) => start + index)
})

const statusClass = (status) => {
  switch (String(status).toLowerCase()) {
    case 'completed':
    case 'paid':
      return 'bg-success-subtle text-success'

    case 'pending':
    case 'due':
      return 'bg-warning-subtle text-warning'

    case 'failed':
    case 'cancelled':
      return 'bg-danger-subtle text-danger'

    default:
      return 'bg-secondary-subtle text-secondary'
  }
}

const methodIcon = (method) => {
  const value = String(method || '').toLowerCase()

  if (value.includes('bkash')) return 'bi bi-phone-fill text-danger'
  if (value.includes('nagad')) return 'bi bi-phone text-warning'
  if (value.includes('bank')) return 'bi bi-bank text-success'
  if (value.includes('card')) return 'bi bi-credit-card text-primary'
  if (value.includes('cash')) return 'bi bi-cash-stack text-success'

  return 'bi bi-wallet2 text-primary'
}

const downloadReceipt = async (payment) => {
  try {
    const response = await api.get(`/payments/${payment.id}/receipt`)

    const receiptUrl = response.data?.url || response.data?.pdf_url || response.data?.receipt_url

    if (!receiptUrl) {
      window.alert('Receipt PDF URL was not returned by the server.')
      return
    }

    window.open(receiptUrl, '_blank', 'noopener,noreferrer')
  } catch (error) {
    console.error('Receipt download failed:', error)

    window.alert(error?.response?.data?.message || 'Unable to open the receipt. Please try again.')
  }
}

watch([selectedSession, selectedStatus], () => {
  currentPage.value = 1
})

watch(totalPages, (total) => {
  if (currentPage.value > total) {
    currentPage.value = total
  }
})

onMounted(fetchPayments)
</script>

<style scoped>
.dashboard-container {
  display: flex;
  min-height: 100vh;
  background-color: #f4f6f9;
}

.main-wrapper {
  margin-left: 260px;
  flex-grow: 1;
  width: calc(100% - 260px);
  min-width: 0;
}

.summary-card {
  min-height: 125px;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 3px 12px rgba(25, 40, 70, 0.08);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.summary-card h6 {
  font-size: 13px;
  font-weight: 600;
  opacity: 0.92;
  margin-bottom: 8px;
}

.summary-value {
  font-size: 27px;
  font-weight: 750;
  margin: 2px 0 7px;
}

.summary-card small {
  font-size: 12px;
  opacity: 0.8;
}

.bg-gradient-blue {
  background: linear-gradient(135deg, #1e63e9 0%, #0d47a1 100%);
}

.bg-gradient-green {
  background: linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%);
}

.bg-gradient-orange {
  background: linear-gradient(135deg, #ef6c00 0%, #e65100 100%);
}

.filter-select {
  min-width: 140px;
  max-width: 190px;
  border-radius: 8px;
}

.table thead th {
  padding: 13px 12px;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

.table tbody td {
  padding: 15px 12px;
  font-size: 13px;
  vertical-align: middle;
}

.table-row-hover {
  transition: background-color 0.2s ease;
}

.table-row-hover:hover {
  background-color: rgba(30, 99, 233, 0.035);
}

.loading-state {
  min-height: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 992px) {
  .main-wrapper {
    margin-left: 0;
    width: 100%;
  }
}

@media (max-width: 576px) {
  .summary-value {
    font-size: 24px;
  }

  .filter-select {
    flex: 1;
    min-width: 125px;
  }
}
</style>
