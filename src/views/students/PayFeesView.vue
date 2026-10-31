<template>
  <div class="dashboard-container">
    <StudentsDashboardMenueView />

    <div class="main-wrapper p-3 p-md-4">
      <header
        class="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-3 border-bottom"
      >
        <div>
          <h3 class="fw-bold text-dark mb-1">Fee Payment Gateway</h3>
          <small class="text-muted">Student fee payment portal</small>
        </div>

        <div class="d-flex align-items-center gap-3 mt-2 mt-md-0">
          <div
            class="bg-white p-2 rounded-circle shadow-sm d-flex align-items-center justify-content-center"
            style="width: 40px; height: 40px"
          >
            <i class="bi bi-bell fs-6 text-dark"></i>
          </div>

          <div class="d-flex align-items-center gap-2 bg-white px-3 py-2 rounded-pill shadow-sm">
            <div class="student-avatar">{{ initials }}</div>
            <div class="text-start lh-sm">
              <div class="fw-bold fs-sm text-dark">{{ student.full_name || 'Student' }}</div>
              <small class="text-muted fs-xs">ID: {{ student.student_id || '—' }}</small>
            </div>
          </div>
        </div>
      </header>

      <div class="alert alert-warning d-flex align-items-start gap-2 rounded-3 mb-4">
        <i class="bi bi-info-circle-fill fs-5 mt-1"></i>
        <div>
          <strong>Demo Payment Mode</strong>
          <div class="small">
            This is a demonstration payment. No real money will be charged. A successful demo
            payment will be recorded in the system.
          </div>
        </div>
      </div>

      <div v-if="loadingProfile" class="text-center py-5">
        <div class="spinner-border text-primary"></div>
        <p class="text-muted mt-3">Loading student payment information...</p>
      </div>

      <div v-else-if="profileError" class="alert alert-danger rounded-3">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>
        {{ profileError }}
        <button class="btn btn-sm btn-outline-danger ms-2" @click="loadPageData">Retry</button>
      </div>

      <div v-else class="row g-4 justify-content-center">
        <div class="col-12 col-lg-8">
          <div class="card border-0 shadow-sm rounded-4 p-3 p-md-4 bg-white">
            <h5 class="fw-bold text-dark mb-3">Select Payment Method</h5>

            <div class="row g-3 mb-4">
              <div v-for="method in methods" :key="method.id" class="col-6 col-md-3">
                <button
                  type="button"
                  class="payment-method-card border rounded-4 p-3 text-center position-relative h-100 w-100 d-flex flex-column align-items-center justify-content-center"
                  :class="{ 'active-card': selectedMethod === method.id }"
                  :disabled="processing"
                  @click="selectedMethod = method.id"
                >
                  <div class="logo-wrapper mb-2">
                    <svg v-if="method.id === 'bkash'" viewBox="0 0 100 80" width="40" height="40">
                      <polygon points="10,10 50,40 10,70" fill="#e2136e" />
                      <polygon points="50,40 90,10 90,70" fill="#e2136e" opacity=".8" />
                      <polygon points="50,40 90,70 10,70" fill="#c20d5e" />
                    </svg>

                    <svg
                      v-else-if="method.id === 'nagad'"
                      viewBox="0 0 100 100"
                      width="40"
                      height="40"
                    >
                      <circle cx="50" cy="50" r="40" fill="#f7921e" />
                      <path d="M30 65 Q50 20 70 65 Q50 45 30 65Z" fill="#ed1c24" />
                    </svg>

                    <i
                      v-else-if="method.id === 'card'"
                      class="bi bi-credit-card-2-front-fill fs-2 text-primary"
                    ></i>
                    <i v-else class="bi bi-bank2 fs-2 text-success"></i>
                  </div>

                  <span class="fw-bold fs-sm text-dark">{{ method.label }}</span>
                  <span
                    v-if="selectedMethod === method.id"
                    class="position-absolute top-0 end-0 mt-2 me-2 text-primary"
                  >
                    <i class="bi bi-check-circle-fill"></i>
                  </span>
                </button>
              </div>
            </div>

            <hr class="text-muted opacity-25 mb-4" />

            <form @submit.prevent="handlePayment">
              <h5 class="fw-bold text-dark mb-3">Payment Details</h5>

              <!-- Select a particular month -->
              <div class="mb-4">
                <label class="form-label fw-semibold text-muted">Select Month to Pay</label>
                <select
                  v-model="selectedMonth"
                  class="form-select bg-light shadow-none"
                  required
                  :disabled="processing || monthOptions.length === 0"
                  @change="onMonthChange"
                >
                  <option value="" disabled>Select an outstanding month</option>
                  <option v-for="item in monthOptions" :key="item.value" :value="item.value">
                    {{ item.label }} — Due ৳{{ formatMoney(item.due) }}
                  </option>
                </select>

                <div v-if="monthOptions.length === 0" class="alert alert-success mt-3 mb-0">
                  No outstanding monthly fees were found.
                </div>

                <div v-if="selectedMonthDue > 0" class="alert alert-info mt-3 mb-0">
                  <div class="d-flex justify-content-between gap-2">
                    <span>Selected month:</span>
                    <strong>{{ selectedMonthLabel }}</strong>
                  </div>
                  <div class="d-flex justify-content-between gap-2 mt-1">
                    <span>Outstanding for this month:</span>
                    <strong>৳{{ formatMoney(selectedMonthDue) }}</strong>
                  </div>
                </div>
              </div>

              <!-- Mobile banking -->
              <div v-if="['bkash', 'nagad'].includes(selectedMethod)" class="mb-3">
                <label class="form-label fw-semibold text-muted">
                  {{ selectedMethod === 'bkash' ? 'bKash' : 'Nagad' }} Mobile Number
                </label>
                <div class="input-group">
                  <span class="input-group-text bg-light fw-bold">+88</span>
                  <input
                    v-model.trim="form.mobile"
                    type="tel"
                    class="form-control bg-light shadow-none"
                    placeholder="017XXXXXXXX"
                    pattern="01[3-9][0-9]{8}"
                    maxlength="11"
                    required
                    :disabled="processing"
                  />
                </div>
                <small class="text-muted">Demo only. No OTP will be sent.</small>
              </div>

              <!-- Demo card fields -->
              <div v-if="selectedMethod === 'card'" class="row g-3">
                <div class="col-12">
                  <label class="form-label fw-semibold text-muted">Cardholder Name</label>
                  <input
                    v-model.trim="form.cardholder"
                    type="text"
                    class="form-control bg-light shadow-none"
                    placeholder="Demo Cardholder"
                    required
                    :disabled="processing"
                  />
                </div>
                <div class="col-12">
                  <label class="form-label fw-semibold text-muted">Demo Card Number</label>
                  <input
                    v-model.trim="form.cardNumber"
                    type="text"
                    class="form-control bg-light shadow-none"
                    placeholder="Demo number only"
                    required
                    :disabled="processing"
                  />
                  <small class="text-muted">Do not enter a real card number or CVV.</small>
                </div>
                <div class="col-6">
                  <label class="form-label fw-semibold text-muted">Expiry (Demo)</label>
                  <input
                    v-model.trim="form.expiry"
                    type="text"
                    class="form-control bg-light shadow-none"
                    placeholder="MM/YY"
                    required
                    :disabled="processing"
                  />
                </div>
                <div class="col-6">
                  <label class="form-label fw-semibold text-muted">Demo Security Code</label>
                  <input
                    v-model.trim="form.cvv"
                    type="password"
                    class="form-control bg-light shadow-none"
                    placeholder="Demo only"
                    maxlength="4"
                    required
                    :disabled="processing"
                  />
                </div>
              </div>

              <!-- Bank -->
              <div v-if="selectedMethod === 'bank'" class="mb-3">
                <label class="form-label fw-semibold text-muted">Select Bank</label>
                <select
                  v-model="form.bank"
                  class="form-select bg-light shadow-none mb-3"
                  required
                  :disabled="processing"
                >
                  <option value="" disabled>Choose Bank</option>
                  <option value="dbbl">Dutch-Bangla Bank Ltd (DBBL)</option>
                  <option value="brac">BRAC Bank PLC</option>
                  <option value="ebl">Eastern Bank Ltd (EBL)</option>
                </select>

                <label class="form-label fw-semibold text-muted">Demo Transaction Reference</label>
                <input
                  v-model.trim="form.bankReference"
                  type="text"
                  class="form-control bg-light shadow-none"
                  placeholder="DEMO-REFERENCE"
                  required
                  :disabled="processing"
                />
              </div>

              <!-- Amount is capped at the selected month's due -->
              <div class="amount-box mt-4">
                <div>
                  <div class="fw-semibold text-dark">Demo payment amount</div>
                  <small class="text-muted">
                    Maximum ৳{{ formatMoney(selectedMonthDue) }} for the selected month.
                  </small>
                </div>

                <div class="input-group amount-input">
                  <span class="input-group-text">৳</span>
                  <input
                    v-model.number="amount"
                    type="number"
                    min="0.01"
                    :max="selectedMonthDue"
                    step="0.01"
                    class="form-control shadow-none"
                    required
                    :disabled="processing || selectedMonthDue <= 0"
                  />
                </div>
              </div>

              <div
                v-if="selectedMonthDue <= 0 && selectedMonth"
                class="alert alert-warning mt-3 mb-0"
              >
                No outstanding balance is available for this month.
              </div>

              <div v-if="paymentError" class="alert alert-danger mt-3 mb-0">
                {{ paymentError }}
              </div>

              <button
                type="submit"
                class="btn btn-primary w-100 py-3 rounded-3 fw-bold shadow-sm mt-4"
                :disabled="processing || !selectedMonth || !isValidAmount"
              >
                <span v-if="processing" class="spinner-border spinner-border-sm me-2"></span>
                <i v-else class="bi bi-shield-lock-fill me-2"></i>
                {{
                  processing
                    ? 'Recording Demo Payment...'
                    : `Pay ৳${formatMoney(amount || 0)} (Demo)`
                }}
              </button>

              <p class="text-center text-muted fs-xs mt-3 mb-0">
                <i class="bi bi-shield-check text-success me-1"></i>
                Demo only. No real transaction will occur.
              </p>
            </form>
          </div>
        </div>

        <!-- Summary -->
        <div class="col-12 col-lg-4">
          <div
            class="card border-0 shadow-sm rounded-4 p-4 bg-white h-100 d-flex flex-column justify-content-between"
          >
            <div>
              <h5 class="fw-bold text-dark mb-3">Payment Summary</h5>

              <div class="bg-light p-3 rounded-3 mb-3">
                <div class="d-flex justify-content-between gap-3 mb-2 fs-sm">
                  <span class="text-muted">Student Name:</span>
                  <span class="fw-semibold text-dark text-end">{{ student.full_name || '—' }}</span>
                </div>
                <div class="d-flex justify-content-between gap-3 mb-2 fs-sm">
                  <span class="text-muted">Student ID:</span>
                  <span class="fw-semibold text-dark">{{ student.student_id || '—' }}</span>
                </div>
                <div class="d-flex justify-content-between gap-3 mb-2 fs-sm">
                  <span class="text-muted">Class:</span>
                  <span class="fw-semibold text-dark text-end">
                    {{ student.class_info?.name || student.class_info?.class_name || '—' }}
                  </span>
                </div>
                <div class="d-flex justify-content-between gap-3 fs-sm">
                  <span class="text-muted">Branch:</span>
                  <span class="fw-semibold text-dark text-end">{{
                    student.branch?.branch_name || '—'
                  }}</span>
                </div>
              </div>

              <div class="d-flex justify-content-between mb-2 fs-sm">
                <span class="text-muted">Monthly Fee:</span>
                <span class="fw-bold text-dark">৳{{ formatMoney(monthlyFee) }}</span>
              </div>

              <div class="d-flex justify-content-between mb-2 fs-sm">
                <span class="text-muted">Total Outstanding:</span>
                <span class="fw-bold text-danger">৳{{ formatMoney(totalOutstanding) }}</span>
              </div>

              <div class="d-flex justify-content-between mb-2 fs-sm">
                <span class="text-muted">Selected Month Due:</span>
                <span class="fw-bold text-danger">৳{{ formatMoney(selectedMonthDue) }}</span>
              </div>

              <div class="d-flex justify-content-between mb-2 fs-sm">
                <span class="text-muted">Gateway Fee:</span>
                <span class="fw-bold text-dark">৳0.00</span>
              </div>

              <hr class="text-muted opacity-25" />

              <div class="d-flex justify-content-between align-items-center mb-3">
                <span class="fw-bold text-dark">Demo Total:</span>
                <span class="h4 fw-bold text-primary mb-0">৳{{ formatMoney(amount || 0) }}</span>
              </div>
            </div>

            <div class="text-center text-muted fs-xs mt-3">
              <i class="bi bi-info-circle text-warning me-1"></i>
              Demo only. No real payment is collected.
            </div>
          </div>
        </div>
      </div>

      <!-- Result modal -->
      <div
        v-if="showResult"
        class="modal-backdrop-custom"
        role="presentation"
        @click.self="closeResult"
      >
        <div class="result-modal card border-0 shadow-lg rounded-4" role="dialog" aria-modal="true">
          <div class="text-center p-4 p-md-5">
            <div class="result-icon" :class="result.success ? 'success' : 'failed'">
              <i :class="result.success ? 'bi bi-check-lg' : 'bi bi-x-lg'"></i>
            </div>

            <h3 class="fw-bold mt-3" :class="result.success ? 'text-success' : 'text-danger'">
              {{ result.success ? 'Demo Payment Recorded!' : 'Demo Payment Failed' }}
            </h3>

            <p class="text-muted">
              {{
                result.success
                  ? 'The demo payment was recorded in the system. No real money was charged.'
                  : 'The demo payment could not be recorded.'
              }}
            </p>

            <div class="demo-watermark mb-3">DEMO TRANSACTION — NO REAL PAYMENT</div>

            <div v-if="result.success" class="receipt-details text-start">
              <div class="receipt-row">
                <span>Transaction ID</span><strong>{{ result.transactionId }}</strong>
              </div>
              <div class="receipt-row">
                <span>Student</span><strong>{{ student.full_name || '—' }}</strong>
              </div>
              <div class="receipt-row">
                <span>Student ID</span><strong>{{ student.student_id || '—' }}</strong>
              </div>
              <div class="receipt-row">
                <span>Month</span><strong>{{ result.month }}</strong>
              </div>
              <div class="receipt-row">
                <span>Payment Method</span><strong>{{ result.paymentMethod }}</strong>
              </div>
              <div class="receipt-row">
                <span>Paid Now</span><strong>৳{{ formatMoney(result.amount) }}</strong>
              </div>
              <div class="receipt-row">
                <span>Remaining for Month</span
                ><strong>৳{{ formatMoney(result.remainingDue) }}</strong>
              </div>
              <div class="receipt-row">
                <span>Date &amp; Time</span><strong>{{ result.date }}</strong>
              </div>
              <div class="receipt-row">
                <span>Record Status</span>
                <strong class="text-success">Recorded (Demo)</strong>
              </div>
            </div>

            <div class="d-flex flex-column flex-sm-row gap-2 mt-4">
              <button
                v-if="result.success"
                class="btn btn-outline-primary flex-fill"
                @click="printReceipt"
              >
                <i class="bi bi-printer me-2"></i>Print Receipt
              </button>
              <button class="btn btn-primary flex-fill" @click="closeResult">Close</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Printable receipt -->
      <div v-if="result.success" id="demo-receipt-print" class="print-only">
        <h2>Education Management System</h2>
        <h3>DEMO PAYMENT RECEIPT</h3>
        <p><strong>DEMO TRANSACTION — NO REAL PAYMENT</strong></p>
        <hr />
        <p>Transaction ID: {{ result.transactionId }}</p>
        <p>Student Name: {{ student.full_name || '—' }}</p>
        <p>Student ID: {{ student.student_id || '—' }}</p>
        <p>Month: {{ result.month }}</p>
        <p>Payment Method: {{ result.paymentMethod }}</p>
        <p>Paid Now: ৳{{ formatMoney(result.amount) }}</p>
        <p>Remaining for Month: ৳{{ formatMoney(result.remainingDue) }}</p>
        <p>Date &amp; Time: {{ result.date }}</p>
        <p>Status: RECORDED DEMO PAYMENT — NO REAL PAYMENT</p>
        <hr />
        <p>This receipt is for demonstration only. No money was collected.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import StudentsDashboardMenueView from './StudentsDashboardMenueView.vue'
import api from '@/services/api'

/*
 * Turn this off to disable demo payments in the frontend.
 * The backend must also enforce a server-side setting before this is used
 * in production.
 */
const DEMO_PAYMENT_ENABLED = true

const methods = [
  { id: 'bkash', label: 'bKash' },
  { id: 'nagad', label: 'Nagad' },
  { id: 'card', label: 'Card' },
  { id: 'bank', label: 'Bank Transfer' },
]

const selectedMethod = ref('bkash')
const loadingProfile = ref(true)
const profileError = ref('')
const paymentError = ref('')
const processing = ref(false)
const showResult = ref(false)
const student = ref({})
const payments = ref([])
const paymentSummary = ref({})
const amount = ref(0)
const selectedMonth = ref('')

const form = reactive({
  mobile: '',
  cardholder: '',
  cardNumber: '',
  expiry: '',
  cvv: '',
  bank: '',
  bankReference: '',
})

const result = reactive({
  success: false,
  transactionId: '',
  amount: 0,
  date: '',
  month: '',
  paymentMethod: '',
  remainingDue: 0,
})

const numeric = (value) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const formatMoney = (value) =>
  numeric(value).toLocaleString('en-BD', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

const monthlyFee = computed(() => {
  const sessions = student.value.student_sessions || student.value.studentSessions || []
  const activeSession = sessions.find((session) => session.status === 'active')
  return numeric(
    activeSession?.monthly_fee ??
      student.value.monthly_fee ??
      student.value.payment_summary?.monthly_fee ??
      0,
  )
})

const totalOutstanding = computed(() => {
  const value =
    paymentSummary.value.total_outstanding ??
    paymentSummary.value.outstanding_balance ??
    paymentSummary.value.total_due ??
    student.value.total_outstanding ??
    student.value.outstanding_balance ??
    student.value.total_due

  return Math.max(0, numeric(value))
})

const initials = computed(() => {
  const name = String(student.value.full_name || 'Student').trim()
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
})

const selectedMethodLabel = computed(
  () => methods.find((method) => method.id === selectedMethod.value)?.label || 'Unknown',
)

const monthLabel = (value) => {
  const date = new Date(`${value}-01T00:00:00`)
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

/*
 * Generate historical month keys from the student's admission month through
 * the current month. The backend remains responsible for validating the
 * selected month's actual due.
 */
const monthKeys = computed(() => {
  const now = new Date()
  const current = new Date(now.getFullYear(), now.getMonth(), 1)
  const admissionValue = student.value.admission_date
  const admissionDate = admissionValue ? new Date(admissionValue) : null

  const start =
    admissionDate && !Number.isNaN(admissionDate.getTime())
      ? new Date(admissionDate.getFullYear(), admissionDate.getMonth(), 1)
      : new Date(current.getFullYear(), current.getMonth() - 23, 1)

  const months = []
  const cursor = new Date(start)

  while (cursor <= current && months.length < 240) {
    months.push(`${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`)
    cursor.setMonth(cursor.getMonth() + 1)
  }

  return months.reverse()
})

const monthOptions = computed(() => {
  const fee = monthlyFee.value
  const rows = payments.value || []

  return monthKeys.value
    .map((key) => {
      const matchingRows = rows.filter((payment) => {
        const value = String(payment.month || '').trim()
        return value === monthLabel(key) || value === key
      })

      let due = 0

      if (matchingRows.length) {
        due = matchingRows.reduce((sum, payment) => {
          const rowDue = numeric(payment.due_amount)
          const rowDuePayment = numeric(payment.due_payment_amount)
          return sum + Math.max(0, rowDue - rowDuePayment)
        }, 0)
      } else {
        /*
         * If there is no monthly payment row, this frontend estimate uses the
         * active session's monthly fee. The backend must verify the real amount.
         */
        due = fee
      }

      return {
        value: key,
        label: monthLabel(key),
        due: Math.max(0, Number(due.toFixed(2))),
      }
    })
    .filter((item) => item.due > 0)
})

const selectedMonthItem = computed(
  () => monthOptions.value.find((item) => item.value === selectedMonth.value) || null,
)

const selectedMonthLabel = computed(() => selectedMonthItem.value?.label || '—')
const selectedMonthDue = computed(() => numeric(selectedMonthItem.value?.due))

const isValidAmount = computed(() => {
  const value = numeric(amount.value)
  return (
    Boolean(selectedMonth.value) &&
    value > 0 &&
    value <= selectedMonthDue.value &&
    selectedMonthDue.value > 0
  )
})

const onMonthChange = () => {
  amount.value = selectedMonthDue.value > 0 ? Number(selectedMonthDue.value.toFixed(2)) : 0
  paymentError.value = ''
}

const unwrapPayload = (response) => {
  const data = response?.data
  return data?.data ?? data
}

const fetchProfile = async () => {
  const response = await api.get('/student/profile')
  const payload = unwrapPayload(response)
  const profile = payload?.student || payload

  if (!profile || typeof profile !== 'object') {
    throw new Error('Student profile data was not found in the API response.')
  }

  student.value = profile
}

const fetchPayments = async () => {
  const response = await api.get('/student/payments')
  const payload = unwrapPayload(response)

  payments.value = Array.isArray(payload?.payments)
    ? payload.payments
    : Array.isArray(payload?.data?.payments)
      ? payload.data.payments
      : []

  paymentSummary.value = payload?.summary || payload?.data?.summary || {}
}

const loadPageData = async () => {
  loadingProfile.value = true
  profileError.value = ''
  paymentError.value = ''

  try {
    await Promise.all([fetchProfile(), fetchPayments()])

    const firstDueMonth = monthOptions.value[0]
    selectedMonth.value = firstDueMonth?.value || ''
    amount.value = firstDueMonth ? Number(firstDueMonth.due.toFixed(2)) : 0
  } catch (error) {
    console.error('Student payment page load failed:', error)
    profileError.value =
      error?.response?.data?.message ||
      error?.message ||
      'Unable to load student payment information.'
  } finally {
    loadingProfile.value = false
  }
}

const handlePayment = async () => {
  if (!DEMO_PAYMENT_ENABLED || processing.value) return

  if (!selectedMonth.value) {
    paymentError.value = 'Please select the month you want to pay for.'
    return
  }

  const paymentAmount = Number(numeric(amount.value).toFixed(2))

  if (
    !Number.isFinite(paymentAmount) ||
    paymentAmount <= 0 ||
    paymentAmount > selectedMonthDue.value
  ) {
    paymentError.value = 'Enter a valid amount within the selected month’s outstanding balance.'
    return
  }

  processing.value = true
  paymentError.value = ''

  const methodNames = {
    bkash: 'bKash',
    nagad: 'Nagad',
    card: 'Card',
    bank: 'Bank',
  }

  try {
    const sessionList = student.value.student_sessions || student.value.studentSessions || []
    const activeSession = sessionList.find((session) => session.status === 'active')

    /*
     * Backend demoPayment() must validate month, session ownership and amount.
     * Selected month is sent as "October 2026", which matches the backend format.
     */
    const response = await api.post('/student/demo-payment', {
      amount: paymentAmount,
      payment_method: `Demo ${methodNames[selectedMethod.value] || 'bKash'}`,
      month: selectedMonthLabel.value,
      ...(activeSession?.id ? { student_session_id: activeSession.id } : {}),
    })

    console.log('Demo payment API response:', response.data)

    const payload = response?.data?.data ?? response?.data
    const payment = payload?.payment

    if (!payment?.id) {
      console.error('Unexpected demo payment response:', response.data)

      throw new Error(
        payload?.message ||
          'Payment response is missing the payment record. Check the browser console and backend response.',
      )
    }
    result.success = true
    result.transactionId =
      response.data.transaction_id || response.data.data?.transaction_id || `DEMO-${payment.id}`

    result.amount = paymentAmount
    result.month = selectedMonthLabel.value
    result.paymentMethod = selectedMethodLabel.value
    result.remainingDue = numeric(payment.due_amount)

    result.date = new Date().toLocaleString('en-BD', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })

    showResult.value = true

    /*
     * Refresh balances and monthly dues from the backend after recording.
     */
    await Promise.all([fetchProfile(), fetchPayments()])

    const refreshedSelectedMonth = monthOptions.value.find(
      (item) => item.value === selectedMonth.value,
    )

    if (refreshedSelectedMonth) {
      amount.value = refreshedSelectedMonth.due
    } else {
      selectedMonth.value = monthOptions.value[0]?.value || ''
      amount.value = monthOptions.value[0]?.due || 0
    }
  } catch (error) {
    console.error('Demo payment failed:', error)
    paymentError.value =
      error?.response?.data?.message ||
      error?.message ||
      'Payment record could not be saved. Please try again.'
  } finally {
    processing.value = false
  }
}

const closeResult = () => {
  showResult.value = false
}

const printReceipt = () => {
  window.print()
}

onMounted(() => {
  if (DEMO_PAYMENT_ENABLED) {
    loadPageData()
  } else {
    loadingProfile.value = false
    profileError.value = 'Demo payment is currently disabled.'
  }
})
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

.student-avatar {
  width: 36px;
  height: 36px;
  flex: 0 0 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #dbeafe;
  color: #1d4ed8;
  font-weight: 700;
  font-size: 12px;
}

.payment-method-card {
  transition: all 0.2s ease-in-out;
  background-color: #fcfdfe;
  cursor: pointer;
  min-height: 105px;
}

.payment-method-card:hover:not(:disabled) {
  transform: translateY(-2px);
  border-color: #0d6efd !important;
}

.payment-method-card:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.active-card {
  border-color: #0d6efd !important;
  background-color: rgba(13, 110, 253, 0.05) !important;
  box-shadow: 0 0 0 1px rgba(13, 110, 253, 0.12);
}

.logo-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
}

.fs-xs {
  font-size: 0.75rem;
}

.fs-sm {
  font-size: 0.85rem;
}

.amount-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
}

.amount-input {
  max-width: 170px;
  flex-shrink: 0;
}

.modal-backdrop-custom {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(15, 23, 42, 0.65);
  overflow-y: auto;
}

.result-modal {
  width: 100%;
  max-width: 520px;
  margin: auto;
  background: #fff;
}

.result-icon {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 34px;
}

.result-icon.success {
  color: #15803d;
  background: #dcfce7;
}

.result-icon.failed {
  color: #b91c1c;
  background: #fee2e2;
}

.demo-watermark {
  padding: 10px;
  border: 1px dashed #d97706;
  background: #fffbeb;
  color: #92400e;
  font-size: 11px;
  font-weight: 800;
  border-radius: 8px;
  letter-spacing: 0.3px;
}

.receipt-details {
  padding: 14px;
  background: #f8fafc;
  border-radius: 10px;
}

.receipt-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 9px 0;
  border-bottom: 1px solid #e2e8f0;
  font-size: 13px;
}

.receipt-row:last-child {
  border-bottom: none;
}

.receipt-row span {
  color: #64748b;
}

.receipt-row strong {
  text-align: right;
  overflow-wrap: anywhere;
}

.print-only {
  display: none;
}

@media (max-width: 992px) {
  .main-wrapper {
    margin-left: 0;
    width: 100%;
  }
}

@media (max-width: 575px) {
  .amount-box {
    align-items: stretch;
    flex-direction: column;
  }

  .amount-input {
    max-width: none;
  }

  .receipt-row {
    font-size: 12px;
  }
}

@media print {
  body * {
    visibility: hidden !important;
  }

  #demo-receipt-print,
  #demo-receipt-print * {
    visibility: visible !important;
  }

  #demo-receipt-print {
    display: block !important;
    position: absolute;
    inset: 0;
    width: 100%;
    padding: 24px;
    color: #111827;
    background: #fff;
    font-family: Arial, sans-serif;
  }
}
</style>
