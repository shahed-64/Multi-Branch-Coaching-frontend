<template>
  <div class="d-flex min-vh-100 bg-light app-layout">
    <!-- SIDEBAR -->
    <div class="sidebar-wrapper flex-shrink-0 bg-white border-end" style="width: 260px">
      <AccountMenuView />
    </div>

    <!-- MAIN CONTENT -->
    <div class="flex-grow-1 p-4 overflow-auto main-content">
      <div class="card shadow-sm border-0 p-4 bg-white">
        <!-- DATE FILTERS -->
        <div class="row g-3 align-items-end mb-4 no-print">
          <div class="col-md-3">
            <label class="form-label fw-semibold">From Date</label>
            <input v-model="startDate" type="date" class="form-control" />
          </div>

          <div class="col-md-3">
            <label class="form-label fw-semibold">To Date</label>
            <input v-model="endDate" type="date" class="form-control" />
          </div>

          <div class="col-md-6 d-flex gap-2 flex-wrap">
            <button
              class="btn btn-primary"
              :disabled="loading || !startDate || !endDate || startDate > endDate"
              @click="fetchLedger"
            >
              <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
              {{ loading ? 'Loading...' : 'Show Ledger' }}
            </button>

            <button class="btn btn-outline-secondary" :disabled="loading" @click="printLedger">
              Print
            </button>
          </div>
        </div>

        <!-- INSTITUTE HEADER -->
        <div class="text-center mb-4">
          <h3 class="fw-bold text-dark mb-1">Icon Academy</h3>
          <p class="text-muted small mb-1">(257/1/G Ahmednagar, PaikPara, Mirpur, Dhaka-1216)</p>
          <p class="text-muted small mb-1">Phone: 01674099838, 01829015429</p>
          <p class="text-muted small mb-2">www.iconacademyedu.com</p>

          <h5 class="fw-semibold text-secondary text-decoration-underline">
            Accounts Ledger from {{ startDate || '—' }} to {{ endDate || '—' }}
          </h5>
        </div>

        <!-- SUMMARY -->
        <div class="row g-3 mb-4">
          <div class="col-md-4">
            <div class="border rounded p-3 h-100">
              <div class="text-muted small">Total Receive / Deposit</div>
              <h5 class="fw-bold text-success mb-0">
                {{ money(totalReceive) }}
              </h5>
            </div>
          </div>

          <div class="col-md-4">
            <div class="border rounded p-3 h-100">
              <div class="text-muted small">Total Payment / Withdraw</div>
              <h5 class="fw-bold text-danger mb-0">
                {{ money(totalPayment) }}
              </h5>
            </div>
          </div>

          <div class="col-md-4">
            <div class="border rounded p-3 h-100">
              <div class="text-muted small">Net Balance</div>
              <h5 class="fw-bold mb-0" :class="netBalance >= 0 ? 'text-primary' : 'text-danger'">
                {{ money(netBalance) }}
              </h5>
            </div>
          </div>
        </div>

        <!-- ERROR -->
        <div v-if="errorMessage" class="alert alert-danger no-print" role="alert">
          {{ errorMessage }}
        </div>

        <!-- LEDGER TABLE -->
        <div class="table-responsive">
          <table class="table table-bordered table-striped align-middle fs-7">
            <thead class="table-light text-center align-middle">
              <tr>
                <th style="width: 5%">Sl.</th>
                <th style="width: 15%">Transaction Date</th>
                <th style="width: 35%">Particulars</th>
                <th style="width: 15%">Receive / Deposit</th>
                <th style="width: 15%">Payment / Withdraw</th>
                <th style="width: 15%">Remarks</th>
              </tr>
            </thead>

            <tbody>
              <tr v-if="loading">
                <td colspan="6" class="text-center py-4">Loading ledger data...</td>
              </tr>

              <tr v-else v-for="(item, index) in ledgerRows" :key="item.key">
                <td class="text-center">{{ index + 1 }}</td>

                <td class="text-center">
                  {{ item.date || '—' }}
                </td>

                <td style="white-space: pre-line">{{ item.particulars }}</td>

                <td class="text-end text-success">
                  {{ item.receive > 0 ? money(item.receive) : '—' }}
                </td>

                <td class="text-end text-danger">
                  {{ item.payment > 0 ? money(item.payment) : '—' }}
                </td>

                <td>{{ item.remarks || '—' }}</td>
              </tr>

              <tr v-if="!loading && !ledgerRows.length">
                <td colspan="6" class="text-center text-muted py-4">
                  No transactions found for the selected dates.
                </td>
              </tr>
            </tbody>

            <tfoot v-if="!loading && ledgerRows.length">
              <tr class="table-light fw-bold">
                <td colspan="3" class="text-end">Total</td>
                <td class="text-end text-success">
                  {{ money(totalReceive) }}
                </td>
                <td class="text-end text-danger">
                  {{ money(totalPayment) }}
                </td>
                <td></td>
              </tr>

              <tr class="table-light fw-bold">
                <td colspan="3" class="text-end">Net Balance</td>
                <td colspan="2" class="text-end">
                  {{ money(netBalance) }}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div class="text-muted small mt-2 no-print">
          Total transactions: {{ ledgerRows.length }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AccountMenuView from './AccountMenuView.vue'
import api from '@/services/api'

const ledgerRows = ref([])
const loading = ref(false)
const errorMessage = ref('')

function localDateString(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const today = new Date()

const startDate = ref(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`)

const endDate = ref(localDateString(today))

function amount(value) {
  const number = Number(value ?? 0)
  return Number.isFinite(number) ? number : 0
}

function money(value) {
  return amount(value).toLocaleString('en-BD', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function getResponseData(response) {
  return response?.data ?? response ?? {}
}

function getStudentName(payment) {
  return (
    payment?.student?.full_name ||
    payment?.student?.name ||
    payment?.studentSession?.student?.full_name ||
    payment?.studentSession?.student?.name ||
    ''
  )
}

function getStudentId(payment) {
  return payment?.student?.student_id || payment?.studentSession?.student?.student_id || ''
}

function studentParticulars(payment, description) {
  const name = getStudentName(payment)
  const studentId = getStudentId(payment)

  const studentInfo = [name, studentId ? `ID: ${studentId}` : ''].filter(Boolean).join('\n')

  return [description, studentInfo].filter(Boolean).join('\n')
}

function addRow({ key, date, particulars, receive = 0, payment = 0, remarks = '' }) {
  ledgerRows.value.push({
    key,
    date: date ? String(date).slice(0, 10) : '',
    particulars,
    receive: amount(receive),
    payment: amount(payment),
    remarks: remarks || '',
  })
}

function normalizePayments(data) {
  const payments = Array.isArray(data) ? data : Array.isArray(data?.payments) ? data.payments : []

  payments.forEach((item) => {
    const paidAmount = amount(item.paid_amount)
    const duePaymentAmount = amount(item.due_payment_amount)

    if (paidAmount > 0) {
      addRow({
        key: `payment-${item.id}-paid`,
        date: item.payment_date,
        particulars: studentParticulars(item, 'Student Payment'),
        receive: paidAmount,
      })
    }

    if (duePaymentAmount > 0) {
      addRow({
        key: `payment-${item.id}-due`,
        date: item.payment_date,
        particulars: studentParticulars(item, 'Due Collection'),
        receive: duePaymentAmount,
      })
    }
  })
}

function normalizeOtherPayments(data) {
  const payments = Array.isArray(data) ? data : Array.isArray(data?.payments) ? data.payments : []

  payments.forEach((item) => {
    addRow({
      key: `other-${item.id}`,
      date: item.payment_date,
      particulars: item.payment_type || '',
      receive: item.total_amount,
      remarks: item.remarks,
    })
  })
}

function normalizeExpenses(data) {
  const expenses = Array.isArray(data) ? data : Array.isArray(data?.expenses) ? data.expenses : []

  expenses.forEach((item) => {
    addRow({
      key: `expense-${item.id}`,
      date: item.payment_date,
      particulars: item.expense_type || '',
      payment: item.paid_amount,
      remarks: item.remarks,
    })
  })
}

async function fetchLedger() {
  if (!startDate.value || !endDate.value) {
    errorMessage.value = 'Please select both dates.'
    return
  }

  if (startDate.value > endDate.value) {
    errorMessage.value = 'From Date cannot be after To Date.'
    return
  }

  loading.value = true
  errorMessage.value = ''
  ledgerRows.value = []

  try {
    const params = {
      start_date: startDate.value,
      end_date: endDate.value,
    }

    const [paymentResponse, otherPaymentResponse, expenseResponse] = await Promise.all([
      api.get('/payments/ledger', { params }),
      api.get('/other-payments/ledger', { params }),
      api.get('/expenses/ledger', { params }),
    ])

    normalizePayments(getResponseData(paymentResponse))
    normalizeOtherPayments(getResponseData(otherPaymentResponse))
    normalizeExpenses(getResponseData(expenseResponse))

    ledgerRows.value.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date)

      if (dateCompare !== 0) {
        return dateCompare
      }

      return a.key.localeCompare(b.key)
    })
  } catch (error) {
    console.error('Ledger fetch failed:', error)

    ledgerRows.value = []

    errorMessage.value =
      error?.response?.data?.message ||
      'Ledger data could not be loaded. Please check the API routes and permissions.'
  } finally {
    loading.value = false
  }
}

const totalReceive = computed(() => ledgerRows.value.reduce((sum, item) => sum + item.receive, 0))

const totalPayment = computed(() => ledgerRows.value.reduce((sum, item) => sum + item.payment, 0))

const netBalance = computed(() => totalReceive.value - totalPayment.value)

function printLedger() {
  window.print()
}

onMounted(fetchLedger)
</script>

<style scoped>
.fs-7 {
  font-size: 0.85rem;
}

/* Mobile responsive sidebar fix */
@media (max-width: 767.98px) {
  .app-layout {
    flex-direction: column !important;
  }

  .sidebar-wrapper {
    width: 100% !important;
  }
}

@media print {
  .sidebar-wrapper,
  .no-print {
    display: none !important;
  }

  .d-flex.min-vh-100 {
    display: block !important;
    min-height: auto !important;
  }

  .flex-grow-1 {
    padding: 0 !important;
    overflow: visible !important;
  }

  .card {
    border: none !important;
    box-shadow: none !important;
    padding: 0 !important;
  }

  .table-responsive {
    overflow: visible !important;
  }

  table {
    width: 100% !important;
    font-size: 11px !important;
  }

  th,
  td {
    padding: 5px !important;
  }

  body {
    background: white !important;
  }
}
</style>
