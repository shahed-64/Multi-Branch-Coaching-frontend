<template>
  <RouterView />
  <AccountMenuView />

  <div class="layout bgc">
    <div class="content">
      <!-- WELCOME BANNER -->
      <div
        class="mb-4 text-white d-flex justify-content-between align-items-center position-relative overflow-hidden"
        style="
          background: linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #4f46e5 100%);
          border-radius: 18px;
          padding: 24px 32px;
          box-shadow: 0 10px 25px -5px rgba(37, 99, 235, 0.3);
        "
      >
        <div class="d-flex align-items-center gap-3" style="z-index: 1">
          <div
            class="d-flex align-items-center justify-content-center"
            style="
              width: 52px;
              height: 52px;
              background: rgba(255, 255, 255, 0.18);
              border-radius: 14px;
              border: 1px solid rgba(255, 255, 255, 0.25);
              font-size: 22px;
            "
          >
            <i class="fa-solid fa-gauge-high"></i>
          </div>

          <div>
            <h3 class="fw-bold mb-1" style="font-size: 22px; color: #fff">
              Welcome Back, Administrator 👋
            </h3>
            <p class="mb-0" style="font-size: 13px; color: rgba(255, 255, 255, 0.85)">
              Manage your students, payments and coaching activities from one place.
            </p>
          </div>
        </div>

        <div
          class="d-flex align-items-center gap-2"
          style="
            background: rgba(255, 255, 255, 0.18);
            padding: 10px 16px;
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.25);
            z-index: 1;
          "
        >
          <i class="fa-regular fa-calendar-days" style="font-size: 20px"></i>
          <div style="line-height: 1.2">
            <small style="font-size: 10px; display: block; opacity: 0.8">Today</small>
            <span style="font-size: 13px; font-weight: 700">Dashboard</span>
          </div>
        </div>

        <div
          style="
            position: absolute;
            right: -40px;
            bottom: -40px;
            width: 220px;
            height: 220px;
            background: rgba(255, 255, 255, 0.08);
            border-radius: 50%;
            pointer-events: none;
          "
        ></div>
      </div>

      <!-- STUDENT CARD -->
      <div class="card-box">
        <div class="student-topbar">
          <div>
            <p class="section-subtitle">Search and collect monthly payments.</p>
          </div>

          <div class="student-filters">
            <div class="filter-item">
              <select v-model="selectedClass" class="form-select custom-select">
                <option value="">All Classes</option>
                <option v-for="cls in uniqueClasses" :key="cls" :value="cls">
                  {{ cls }}
                </option>
              </select>
            </div>

            <div class="filter-item">
              <input
                v-model="search"
                type="text"
                class="form-control custom-input"
                placeholder="Search ID / Name / Email"
              />
            </div>
          </div>
        </div>

        <div class="student-table-wrapper mt-3">
          <div class="table-responsive">
            <table class="table student-table align-middle">
              <thead>
                <tr>
                  <th style="width: 50px">#</th>
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>Class</th>
                  <th>Email</th>
                  <th>Due Months</th>
                  <th>Status</th>
                  <th class="text-center">Action</th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="(s, index) in paginatedStudents" :key="s.id">
                  <td>
                    <span class="row-index">
                      {{ (currentPage - 1) * perPage + index + 1 }}
                    </span>
                  </td>

                  <td>
                    <span class="id-badge">{{ s.student_id }}</span>
                  </td>

                  <td>
                    <div class="student-info-inline">
                      <img :src="getImageUrl(s)" alt="Student Avatar" class="student-table-img" />
                      <span class="student-name">{{ s.full_name }}</span>
                    </div>
                  </td>

                  <td>
                    <span class="class-text">{{ s.batch_name }}</span>
                  </td>

                  <td>
                    <div class="email-text">{{ s.email || 'No Email' }}</div>
                  </td>

                  <td>
                    <span v-if="s.due_months?.length" class="due-badge">
                      {{ s.due_months.join(', ') }}
                    </span>
                    <span v-else class="paid-badge">Paid</span>
                  </td>

                  <td>
                    <span
                      class="status-badge"
                      :class="s.status === 'Active' ? 'status-active' : 'status-inactive'"
                    >
                      {{ s.status }}
                    </span>
                  </td>

                  <td class="text-center">
                    <div class="action-buttons-group">
                      <button
                        class="btn-action btn-payment"
                        data-bs-toggle="modal"
                        data-bs-target="#paymentModal"
                        @click="openPaymentModal(s)"
                        title="Payment"
                      >
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          class="me-1"
                        >
                          <rect width="20" height="14" x="2" y="5" rx="2" />
                          <line x1="2" x2="22" y1="10" y2="10" />
                        </svg>
                        Payment
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-if="students.length === 0" class="empty-state">
          <div class="empty-icon">
            <i class="fa-solid fa-user-slash"></i>
          </div>
          <h5>No Student Found</h5>
          <p>Try searching with another student ID or name</p>
        </div>

        <div v-if="students.length > 0" class="pagination-container">
          <div class="pagination-info">
            Showing <strong>{{ showingFrom }} - {{ showingTo }}</strong> of
            <strong>{{ totalStudents }}</strong> Students
          </div>

          <div class="pagination-control">
            <button class="pagination-btn" @click="prevPage" :disabled="currentPage === 1">
              Previous
            </button>

            <div class="page-number">{{ currentPage }} / {{ totalPages }}</div>

            <button class="pagination-btn" @click="nextPage" :disabled="currentPage === totalPages">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- PAYMENT MODAL -->
  <div class="modal fade" id="paymentModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content payment-modal">
        <div class="modal-header payment-header">
          <div class="d-flex align-items-center gap-3">
            <div class="modal-icon">
              <i class="fa-solid fa-money-bill-transfer"></i>
            </div>
            <div>
              <h5 class="modal-title text-white">Student Payment</h5>
              <p class="mb-0 text-white-50">Record session-wise monthly payment</p>
            </div>
          </div>

          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
        </div>

        <div class="modal-body p-4">
          <!-- STUDENT INFORMATION -->
          <div class="student-payment-card mb-4">
            <img
              :src="getImageUrl(selectedStudent)"
              alt="Student Avatar"
              class="student-avatar-large-img"
            />
            <div>
              <h6 class="mb-1 text-dark fw-bold">
                {{ selectedStudent.full_name }}
              </h6>
              <span class="badge bg-primary-subtle text-primary fw-medium">
                {{ selectedStudent.student_id }}
              </span>
            </div>
          </div>

          <!-- ACADEMIC SESSION -->
          <div class="form-group mb-3">
            <label class="form-label fw-semibold text-secondary">
              Academic Session <span class="text-danger">*</span>
            </label>

            <select v-model="form.student_session_id" class="form-select custom-select" required>
              <option value="">Select Academic Session</option>

              <option
                v-for="session in studentSessions"
                :key="session.id"
                :value="String(session.id)"
              >
                {{ getSessionName(session) }}
              </option>
            </select>

            <small v-if="studentSessions.length === 0" class="text-danger">
              No academic session enrollment found for this student.
            </small>
          </div>

          <!-- MONTHLY FEE -->
          <div class="form-group mb-3">
            <label class="form-label fw-semibold text-secondary">Monthly Fee</label>

            <input
              v-model="form.amount"
              type="number"
              min="0"
              step="0.01"
              class="form-control custom-input"
              :readonly="
                !!selectedSession &&
                selectedSession.monthly_fee !== null &&
                selectedSession.monthly_fee !== undefined
              "
              :class="{
                'bg-light':
                  !!selectedSession &&
                  selectedSession.monthly_fee !== null &&
                  selectedSession.monthly_fee !== undefined,
              }"
              placeholder="Enter monthly fee"
            />
          </div>

          <!-- PAID AMOUNT -->
          <div class="form-group mb-3">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <label class="form-label fw-semibold text-secondary mb-0"> Paid Amount </label>

              <div class="form-check mb-0">
                <input
                  id="fullPaymentCheck"
                  v-model="fullPayment"
                  class="form-check-input"
                  type="checkbox"
                />
                <label class="form-check-label fw-semibold text-success" for="fullPaymentCheck">
                  Full Payment
                </label>
              </div>
            </div>

            <input
              v-model="form.paid_amount"
              type="number"
              min="0"
              step="0.01"
              class="form-control custom-input"
              :readonly="fullPayment"
              :class="{ 'bg-light': fullPayment }"
              placeholder="Enter paid amount"
            />
          </div>

          <!-- PAYMENT MONTH -->
          <div class="form-group mb-3">
            <label class="form-label fw-semibold text-secondary">
              Payment Month <span class="text-danger">*</span>
            </label>

            <select
              v-model="form.month"
              class="form-select custom-select"
              required
              :disabled="!form.student_session_id || availableMonths.length === 0"
            >
              <option disabled value="">Select Month</option>
              <option v-for="month in availableMonths" :key="month" :value="month">
                {{ month }}
              </option>
            </select>

            <small
              v-if="form.student_session_id && availableMonths.length === 0"
              class="text-danger"
            >
              No unpaid months are available for this session, or the backend has not returned
              session-wise available months.
            </small>
          </div>

          <!-- PAYMENT DATE -->
          <div class="form-group mb-3">
            <label class="form-label fw-semibold text-secondary">Payment Date</label>
            <input v-model="form.payment_date" type="date" class="form-control custom-input" />
          </div>

          <!-- EXTRA FEES -->
          <div class="row g-3 mb-3">
            <div class="col-md-6">
              <label class="form-label fw-semibold text-secondary">Admission Fee</label>
              <input
                v-model="form.admission_fee"
                type="number"
                min="0"
                step="0.01"
                class="form-control custom-input"
                placeholder="Admission fee"
              />
            </div>

            <div class="col-md-6">
              <label class="form-label fw-semibold text-secondary">Exam Fee</label>
              <input
                v-model="form.exam_fee"
                type="number"
                min="0"
                step="0.01"
                class="form-control custom-input"
                placeholder="Exam fee"
              />
            </div>
          </div>

          <!-- PAYMENT METHOD -->
          <div class="form-group mb-2">
            <label class="form-label fw-semibold text-secondary">Payment Method</label>
            <select v-model="form.payment_method" class="form-select custom-select">
              <option disabled value="">Select Method</option>
              <option>Cash</option>
              <option>Bkash</option>
              <option>Nogod</option>
            </select>
          </div>

          <div v-if="formError" class="alert alert-danger mt-3 mb-0">
            {{ formError }}
          </div>
        </div>

        <div class="modal-footer payment-footer">
          <button type="button" class="btn btn-light rounded-3 px-4" data-bs-dismiss="modal">
            Close
          </button>

          <button
            class="btn save-btn"
            :disabled="saving || !form.student_session_id || !form.month"
            @click="savePayment"
          >
            <i class="fa-solid fa-check me-1"></i>
            {{ saving ? 'Saving...' : 'Save Payment' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import * as bootstrap from 'bootstrap'

import AccountMenuView from './AccountMenuView.vue'
import api from '@/services/api'
import { getImageUrl } from '@/utils/img'

const router = useRouter()

const students = ref([])
const search = ref('')
const selectedClass = ref('')

const currentPage = ref(1)
const perPage = 10
const totalPages = ref(1)
const totalStudents = ref(0)
const showingFrom = ref(0)
const showingTo = ref(0)

const studentSessions = ref([])
const availableMonths = ref([])
const fullPayment = ref(true)
const saving = ref(false)
const formError = ref('')

const selectedStudent = reactive({
  id: null,
  student_id: '',
  full_name: '',
  monthly_fee: null,
  image: null,
})

const form = reactive({
  student_id: '',
  student_session_id: '',
  amount: '',
  paid_amount: '',
  payment_method: 'Cash',
  payment_date: new Date().toLocaleDateString('en-CA'),
  month: '',
  admission_fee: null,
  exam_fee: null,
})

const paginatedStudents = computed(() => students.value)

const selectedSession = computed(() => {
  return (
    studentSessions.value.find(
      (session) => String(session.id) === String(form.student_session_id),
    ) || null
  )
})

const uniqueClasses = computed(() => {
  const classes = students.value.map((student) => student.batch_name).filter(Boolean)
  return [...new Set(classes)]
})

const getSessionName = (session) => {
  return (
    session.academic_session?.name ||
    session.academicSession?.name ||
    session.name ||
    `Session ${session.academic_session_id ?? session.id}`
  )
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    getStudents(currentPage.value + 1)
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    getStudents(currentPage.value - 1)
  }
}

const openPaymentModal = (student) => {
  formError.value = ''

  selectedStudent.id = student.id
  selectedStudent.student_id = student.student_id
  selectedStudent.full_name = student.full_name
  selectedStudent.monthly_fee = student.monthly_fee
  selectedStudent.image = student.image

  form.student_id = String(student.id)

  studentSessions.value = Array.isArray(student.student_sessions) ? student.student_sessions : []

  // Automatically select a session only when exactly one exists.
  form.student_session_id =
    studentSessions.value.length === 1 ? String(studentSessions.value[0].id) : ''

  form.amount = ''
  form.paid_amount = ''
  form.month = ''
  form.payment_method = 'Cash'
  form.payment_date = new Date().toLocaleDateString('en-CA')
  form.admission_fee = null
  form.exam_fee = null
  fullPayment.value = true

  updateSelectedSession()
}
const updateSelectedSession = () => {
  const session = selectedSession.value

  const months = Array.isArray(session?.available_months) ? session.available_months : []

  availableMonths.value = months

  form.amount =
    session?.monthly_fee !== null && session?.monthly_fee !== undefined ? session.monthly_fee : ''

  form.paid_amount = fullPayment.value ? form.amount : ''

  // Keep the selected month only if it is still available.
  if (!months.includes(form.month)) {
    form.month = months[0] || ''
  }
}

watch(
  () => form.student_session_id,
  () => {
    updateSelectedSession()
    formError.value = ''
  },
)

watch(fullPayment, (isFullPayment) => {
  if (isFullPayment) {
    form.paid_amount = form.amount || ''
  }
})

watch(
  () => form.amount,
  (amount) => {
    if (fullPayment.value) {
      form.paid_amount = amount || ''
    }
  },
)

const getStudents = async (page = 1) => {
  try {
    const response = await api.get('/students', {
      params: {
        page,
        per_page: perPage,
        search: search.value.trim(),
      },
    })

    if (response.data?.status) {
      students.value = response.data.students || []

      const pagination = response.data.pagination || {}
      currentPage.value = pagination.current_page || 1
      totalPages.value = pagination.last_page || 1
      totalStudents.value = pagination.total || 0
      showingFrom.value = pagination.from || 0
      showingTo.value = pagination.to || 0
    } else {
      resetPagination()
    }
  } catch (error) {
    console.error('Error fetching students:', error)
    resetPagination()
  }
}

const resetPagination = () => {
  students.value = []
  currentPage.value = 1
  totalPages.value = 1
  totalStudents.value = 0
  showingFrom.value = 0
  showingTo.value = 0
}

watch(search, () => {
  getStudents(1)
})

watch(selectedClass, () => {
  currentPage.value = 1
})

const savePayment = async () => {
  formError.value = ''

  if (!form.student_id) {
    formError.value = 'Student information is missing.'
    return
  }

  if (!form.student_session_id) {
    formError.value = 'Please select an academic session.'
    return
  }

  if (!form.month) {
    formError.value = 'Please select a payment month.'
    return
  }

  if (form.amount === '' || Number(form.amount) < 0) {
    formError.value = 'Please enter a valid monthly fee.'
    return
  }

  if (form.paid_amount === '' || Number(form.paid_amount) < 0) {
    formError.value = 'Please enter a valid paid amount.'
    return
  }

  saving.value = true

  try {
    const payload = {
      student_id: Number(form.student_id),
      student_session_id: Number(form.student_session_id),
      paid_amount: Number(form.paid_amount),
      payment_method: form.payment_method || null,
      payment_date: form.payment_date || null,
      month: form.month,
      admission_fee: Number(form.admission_fee || 0),
      exam_fee: Number(form.exam_fee || 0),
    }

    const response = await api.post('/payments', payload)

    const paymentId = response.data?.payment?.id || response.data?.id

    const modalElement = document.getElementById('paymentModal')

    if (modalElement) {
      const instance =
        bootstrap.Modal.getInstance(modalElement) ||
        bootstrap.Modal.getOrCreateInstance(modalElement)

      instance.hide()
    }

    cleanupModals()

    if (paymentId) {
      router.push(`/singlePayment/${paymentId}`)
    } else {
      await getStudents(currentPage.value)
    }
  } catch (error) {
    console.error('Payment error:', error)

    formError.value =
      error.response?.data?.message ||
      Object.values(error.response?.data?.errors || {}).flat()[0] ||
      'Payment save failed. Please try again.'
  } finally {
    saving.value = false
  }
}

const cleanupModals = () => {
  document.querySelectorAll('.modal').forEach((modalElement) => {
    const instance = bootstrap.Modal.getInstance(modalElement)

    if (instance) {
      instance.dispose()
    }

    modalElement.classList.remove('show')
    modalElement.style.removeProperty('display')
    modalElement.style.removeProperty('padding-right')
    modalElement.removeAttribute('aria-modal')
    modalElement.setAttribute('aria-hidden', 'true')
    modalElement.removeAttribute('role')
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

const handleBrowserBack = () => {
  cleanupModals()
}

onMounted(() => {
  getStudents(1)
  window.addEventListener('popstate', handleBrowserBack)
  window.addEventListener('pageshow', handleBrowserBack)
})

onBeforeUnmount(() => {
  window.removeEventListener('popstate', handleBrowserBack)
  window.removeEventListener('pageshow', handleBrowserBack)
  cleanupModals()
})
</script>

<style scoped>
.bgc {
  background: #f8fafc;
  min-height: 100vh;
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    sans-serif;
}

.layout {
  display: flex;
  min-height: 100vh;
}

.content {
  flex: 1;
  margin-left: 250px;
  padding: 30px;
}

.card-box {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
}

.student-topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.section-subtitle {
  color: #64748b;
  font-size: 14px;
  margin: 0;
}

.student-filters {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.custom-select,
.custom-input {
  border: 1px solid #e2e8f0;
  background-color: #fff;
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 14px;
  color: #334155;
  transition: all 0.2s ease-in-out;
}

.custom-select:hover,
.custom-input:hover {
  border-color: #cbd5e1;
}

.custom-select:focus,
.custom-input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  outline: none;
}

.student-table-wrapper {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #f1f5f9;
}

.student-table {
  margin: 0;
}

.student-table thead th {
  background: #2563eb;
  color: #fff;
  padding: 14px 16px;
  font-size: 13px;
  font-weight: 600;
  border: none;
  text-transform: capitalize;
}

.student-table tbody tr {
  border-bottom: 1px solid #f1f5f9;
  transition: all 0.2s ease-in-out;
}

.student-table tbody tr:hover {
  background-color: #f1f5f9;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
}

.student-table td {
  padding: 14px 16px;
  color: #334155;
  font-size: 14px;
}

.row-index {
  color: #64748b;
  font-weight: 500;
}

.id-badge {
  background-color: #eff6ff;
  color: #2563eb;
  padding: 4px 10px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 13px;
  display: inline-block;
}

.student-info-inline {
  display: flex;
  align-items: center;
  gap: 10px;
}

.student-table-img {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.student-name {
  font-weight: 600;
  color: #0f172a;
}

.class-text {
  color: #475569;
}

.email-text {
  color: #64748b;
}

.paid-badge {
  background: #16a34a;
  color: #fff;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.due-badge {
  background: #ef4444;
  color: #fff;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.status-active {
  background: #16a34a;
  color: #fff;
}

.status-inactive {
  background: #94a3b8;
  color: #fff;
}

.action-buttons-group {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.btn-action {
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.btn-action:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
}

.btn-payment {
  background: #16a34a;
  color: #fff;
}

.btn-payment:hover {
  background: #15803d;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.pagination-info {
  color: #64748b;
  font-size: 14px;
}

.pagination-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-btn {
  background: #f1f5f9;
  color: #334155;
  border: none;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.pagination-btn:hover:not(:disabled) {
  background: #e2e8f0;
  color: #0f172a;
  transform: translateY(-1px);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-number {
  background: #eff6ff;
  color: #2563eb;
  padding: 6px 12px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 13px;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
}

.empty-icon {
  width: 60px;
  height: 60px;
  margin: auto;
  border-radius: 50%;
  background: #f1f5f9;
  color: #94a3b8;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
}

.empty-state h5 {
  margin-top: 12px;
  color: #334155;
}

.empty-state p {
  color: #94a3b8;
  font-size: 14px;
}

.payment-modal {
  border-radius: 16px;
  border: none;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.payment-header {
  padding: 20px 24px;
  border: none;
  background: linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #4f46e5 100%);
}

.modal-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 18px;
}

.student-payment-card {
  background: #f8fafc;
  border-radius: 12px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid #f1f5f9;
}

.student-avatar-large-img {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #e2e8f0;
}

.payment-footer {
  padding: 16px 24px;
  border-top: 1px solid #f1f5f9;
  background: #f8fafc;
}

.save-btn {
  background: #16a34a;
  color: #fff;
  padding: 8px 20px;
  border-radius: 8px;
  font-weight: 500;
  border: none;
  transition: all 0.2s ease;
}

.save-btn:hover {
  background: #15803d;
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(22, 163, 74, 0.2);
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .content {
    margin-left: 0;
    padding: 15px;
  }

  .student-topbar {
    flex-direction: column;
    align-items: stretch;
  }

  .student-filters {
    flex-direction: column;
  }

  .pagination-container {
    flex-direction: column;
    gap: 12px;
  }
}
</style>
