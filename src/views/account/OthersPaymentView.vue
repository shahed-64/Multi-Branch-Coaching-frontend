<template>
  <RouterView />
  <AccountMenuView />

  <div class="box">
    <!-- Page Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h3 class="fw-bold mb-1 text-dark">
          <i class="bi bi-cart-check-fill text-primary me-2"></i>Other Payments
        </h3>
        <p class="text-muted small mb-0">Manage all student other payments and fees.</p>
      </div>

      <button
        type="button"
        class="btn btn-primary d-inline-flex align-items-center gap-2 px-3 py-2 rounded-3 shadow-sm"
        data-bs-toggle="modal"
        data-bs-target="#otherPaymentModal"
        @click="resetForm"
      >
        <i class="bi bi-plus-circle-fill"></i>
        <span>Add Other Payment</span>
      </button>
    </div>

    <!-- Summary Cards -->
    <div class="row g-3 mb-4">
      <div class="col-lg-3 col-md-6">
        <div class="card custom-card border-top-green border-0 shadow-sm rounded-4 h-100">
          <div class="card-body p-4 d-flex align-items-center justify-content-between">
            <div>
              <span class="card-title-text text-muted">Total Other Payment</span>
              <h3 class="fw-bold mb-0 text-success mt-2">
                ৳ {{ totalOtherPayment.toLocaleString() }}
              </h3>
            </div>
            <div class="card-icon-box bg-green-light text-success">
              <i class="bi bi-receipt fs-4"></i>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-3 col-md-6">
        <div class="card custom-card border-top-red border-0 shadow-sm rounded-4 h-100">
          <div class="card-body p-4 d-flex align-items-center justify-content-between">
            <div>
              <span class="card-title-text text-muted">This Month Collection</span>
              <h3 class="fw-bold mb-0 text-danger mt-2">
                ৳ {{ thisMonthOtherCollection.toLocaleString() }}
              </h3>
            </div>
            <div class="card-icon-box bg-red-light text-danger">
              <i class="bi bi-calendar-month fs-4"></i>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-3 col-md-6">
        <div class="card custom-card border-top-yellow border-0 shadow-sm rounded-4 h-100">
          <div class="card-body p-4 d-flex align-items-center justify-content-between">
            <div>
              <span class="card-title-text text-muted">Total Items Sold</span>
              <h3 class="fw-bold mb-0 text-warning mt-2">{{ totalItems }}</h3>
            </div>
            <div class="card-icon-box bg-yellow-light text-warning">
              <i class="bi bi-bag-check-fill fs-4"></i>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-3 col-md-6">
        <div class="card custom-card border-top-blue border-0 shadow-sm rounded-4 h-100">
          <div class="card-body p-4 d-flex align-items-center justify-content-between">
            <div>
              <span class="card-title-text text-muted">Last Purchase Date</span>
              <h5 class="fw-bold mb-0 text-primary mt-2">{{ lastPurchase }}</h5>
            </div>
            <div class="card-icon-box bg-blue-light text-primary">
              <i class="bi bi-calendar-check-fill fs-4"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Table -->
    <div class="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
      <div class="card-header bg-white border-bottom py-3 px-4">
        <div class="row g-3 align-items-center justify-content-between">
          <div class="col-md-4">
            <div class="input-group">
              <span class="input-group-text bg-light border-end-0 text-muted">
                <i class="bi bi-search"></i>
              </span>
              <input
                v-model="tableSearch"
                type="text"
                class="form-control bg-light border-start-0 ps-0"
                placeholder="Search Student ID or Name..."
                @input="currentPage = 1"
              />
            </div>
          </div>

          <div class="col-md-3 text-end">
            <span class="badge bg-light text-dark border px-3 py-2 rounded-pill">
              Total Records: {{ filteredOtherPayments.length }}
            </span>
          </div>
        </div>
      </div>

      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="my-custom-table w-100 align-middle">
            <thead>
              <tr>
                <th class="ps-4">#</th>
                <th>Student ID</th>
                <th>Student Name</th>
                <th>Academic Session</th>
                <th>Item</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
                <th>Method</th>
                <th>Date</th>
                <th width="120" class="text-end pe-4">Action</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="(payment, index) in paginatedPayments" :key="payment.id" class="data-row">
                <td class="ps-4 fw-semibold text-muted">
                  {{ (currentPage - 1) * itemsPerPage + index + 1 }}
                </td>

                <td class="fw-bold text-dark">
                  {{ payment.student?.student_id || 'N/A' }}
                </td>

                <td class="fw-medium">
                  <div class="d-flex align-items-center gap-2">
                    <img
                      :src="getImageUrl(payment.student)"
                      alt="Student Avatar"
                      class="student-table-img"
                    />
                    <span>{{ payment.student?.full_name || 'N/A' }}</span>
                  </div>
                </td>

                <td>
                  <span
                    v-if="getPaymentSession(payment)"
                    class="badge bg-info-subtle text-info border border-info-subtle"
                  >
                    {{ getSessionName(getPaymentSession(payment)) }}
                  </span>
                  <span v-else class="badge bg-light text-secondary border"> Not assigned </span>
                </td>

                <td>
                  <span class="badge bg-light text-dark border px-2 py-1 fw-normal">
                    {{ payment.item_name }}
                  </span>
                </td>

                <td>{{ payment.quantity }}</td>
                <td>৳ {{ Number(payment.price || 0).toLocaleString() }}</td>

                <td class="fw-bold text-success">
                  ৳ {{ Number(payment.total_amount || 0).toLocaleString() }}
                </td>

                <td>
                  <span
                    class="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-3 py-1"
                  >
                    {{ payment.payment_method || 'N/A' }}
                  </span>
                </td>

                <td class="text-muted small">
                  {{ formatDate(payment.payment_date) }}
                </td>

                <td class="text-end pe-4">
                  <button
                    class="btn btn-sm btn-light text-primary me-2 action-btn"
                    title="Edit"
                    @click="editPayment(payment)"
                  >
                    <i class="bi bi-pencil"></i>
                  </button>

                  <button
                    class="btn btn-sm btn-light text-danger action-btn"
                    title="Delete"
                    @click="deletePayment(payment.id)"
                  >
                    <i class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>

              <tr v-if="paginatedPayments.length === 0">
                <td colspan="11" class="text-center py-5 text-muted">No other payments found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagination -->
      <div
        class="card-footer bg-white border-top py-3 px-4 d-flex justify-content-between align-items-center flex-wrap gap-3"
      >
        <div class="text-muted small">
          Showing
          <b>{{ paginatedPayments.length ? (currentPage - 1) * itemsPerPage + 1 : 0 }}</b>
          to
          <b>{{ Math.min(currentPage * itemsPerPage, filteredOtherPayments.length) }}</b>
          of
          <b>{{ filteredOtherPayments.length }}</b>
          entries
        </div>

        <div class="d-flex align-items-center gap-1 flex-wrap">
          <button class="pg-btn" :disabled="currentPage === 1" @click="currentPage--">
            <i class="bi bi-chevron-left"></i> Previous
          </button>

          <button
            v-for="page in totalPages"
            :key="page"
            class="pg-num-btn"
            :class="{ active: currentPage === page }"
            @click="currentPage = page"
          >
            {{ page }}
          </button>

          <button
            class="pg-btn"
            :disabled="currentPage === totalPages || totalPages === 0"
            @click="currentPage++"
          >
            Next <i class="bi bi-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Add / Edit Modal -->
    <div
      class="modal fade"
      id="otherPaymentModal"
      tabindex="-1"
      aria-labelledby="otherPaymentModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4">
          <div class="modal-header bg-primary text-white px-4 py-3">
            <h5
              class="modal-title d-flex align-items-center gap-2 fs-6 fw-bold"
              id="otherPaymentModalLabel"
            >
              <i class="bi" :class="isEdit ? 'bi-pencil-square' : 'bi-plus-circle-fill'"></i>
              {{ isEdit ? 'Edit Other Payment' : 'Add Other Payment' }}
            </h5>

            <button
              type="button"
              class="btn-close btn-close-white"
              data-bs-dismiss="modal"
              aria-label="Close"
              @click="resetForm"
            ></button>
          </div>

          <div class="modal-body p-4">
            <div class="row g-3">
              <!-- Student Search -->
              <div class="col-md-6 position-relative">
                <label class="form-label fw-semibold">
                  Student ID <span class="text-danger">*</span>
                </label>

                <input
                  v-model="searchStudent"
                  type="text"
                  class="form-control"
                  placeholder="Search Student ID..."
                  autocomplete="off"
                />

                <div v-if="studentSearchLoading" class="small text-muted mt-1">
                  Searching students...
                </div>

                <div
                  v-if="filteredStudents.length"
                  class="list-group position-absolute w-100 shadow rounded-3 mt-1"
                  style="z-index: 1050; max-height: 180px; overflow-y: auto"
                >
                  <button
                    v-for="student in filteredStudents"
                    :key="student.id"
                    type="button"
                    class="list-group-item list-group-item-action py-2 text-start"
                    @click="selectStudent(student)"
                  >
                    <span class="fw-bold text-primary">{{ student.student_id }}</span>
                    - {{ student.full_name }}
                  </button>
                </div>
              </div>

              <!-- Academic Session -->
              <div class="col-md-6">
                <label class="form-label fw-semibold">
                  Academic Session <span class="text-danger">*</span>
                </label>

                <select
                  v-model="form.student_session_id"
                  class="form-select"
                  :disabled="!selectedStudent || studentSessionsLoading"
                  required
                >
                  <option value="">Select Academic Session</option>

                  <option
                    v-for="session in studentSessions"
                    :key="session.id"
                    :value="String(session.id)"
                  >
                    {{ getSessionName(session) }}
                    {{ isActiveSession(session) ? ' (Active)' : '' }}
                  </option>
                </select>

                <small v-if="studentSessionsLoading" class="text-muted">
                  Loading academic sessions...
                </small>

                <small
                  v-else-if="selectedStudent && studentSessions.length === 0"
                  class="text-danger"
                >
                  No academic session enrollment was returned for this student.
                </small>

                <small v-else-if="selectedStudent && !form.student_session_id" class="text-warning">
                  No active session was found. Please select a session manually.
                </small>

                <small v-else-if="isEdit && !form.student_session_id" class="text-warning">
                  This old payment has no assigned session. Select one before updating.
                </small>
              </div>

              <!-- Item Name -->
              <div class="col-md-6">
                <label class="form-label fw-semibold">
                  Item Name <span class="text-danger">*</span>
                </label>
                <input
                  v-model="form.item_name"
                  type="text"
                  class="form-control"
                  placeholder="Sheet / Card / Pen"
                />
              </div>

              <!-- Quantity -->
              <div class="col-md-3">
                <label class="form-label fw-semibold">Quantity</label>
                <input
                  v-model.number="form.quantity"
                  type="number"
                  min="1"
                  step="1"
                  class="form-control"
                />
              </div>

              <!-- Price -->
              <div class="col-md-3">
                <label class="form-label fw-semibold">Price</label>
                <input
                  v-model.number="form.price"
                  type="number"
                  min="0"
                  step="0.01"
                  class="form-control"
                />
              </div>

              <!-- Total -->
              <div class="col-md-6">
                <label class="form-label fw-semibold">Total Amount</label>
                <input
                  type="text"
                  class="form-control bg-light fw-bold text-success"
                  :value="'৳ ' + totalPrice.toLocaleString()"
                  readonly
                />
              </div>

              <!-- Payment Method -->
              <div class="col-md-6">
                <label class="form-label fw-semibold">Payment Method</label>
                <select v-model="form.payment_method" class="form-select">
                  <option value="Cash">Cash</option>
                  <option value="Bkash">Bkash</option>
                  <option value="Nagad">Nagad</option>
                  <option value="Bank">Bank</option>
                </select>
              </div>

              <!-- Payment Date -->
              <div class="col-md-6">
                <label class="form-label fw-semibold">Payment Date</label>
                <input v-model="form.payment_date" type="date" class="form-control" />
              </div>

              <!-- Remarks -->
              <div class="col-12">
                <label class="form-label fw-semibold">Remarks</label>
                <textarea
                  v-model="form.remarks"
                  rows="2"
                  class="form-control"
                  placeholder="Optional remarks..."
                ></textarea>
              </div>
            </div>

            <div v-if="formError" class="alert alert-danger mt-3 mb-0">
              {{ formError }}
            </div>
          </div>

          <div class="modal-footer bg-light px-4 py-3">
            <button
              type="button"
              class="btn btn-light text-secondary border"
              data-bs-dismiss="modal"
              :disabled="saving"
              @click="resetForm"
            >
              Cancel
            </button>

            <button
              type="button"
              class="btn btn-primary px-4 d-inline-flex align-items-center gap-2"
              :disabled="saving || !form.student_id || !form.student_session_id"
              @click="isEdit ? updatePayment() : savePayment()"
            >
              <span v-if="saving" class="spinner-border spinner-border-sm" role="status"></span>
              <i v-else class="bi" :class="isEdit ? 'bi-check-circle-fill' : 'bi-save-fill'"></i>
              <span>
                {{ saving ? 'Saving...' : isEdit ? 'Update Payment' : 'Save Payment' }}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import AccountMenuView from './AccountMenuView.vue'
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import api from '@/services/api'
import * as bootstrap from 'bootstrap'
import { getImageUrl } from '@/utils/img'

/* State */
const otherPayments = ref([])
const students = ref([])
const tableSearch = ref('')

const currentPage = ref(1)
const itemsPerPage = ref(10)

const searchStudent = ref('')
const selectedStudent = ref(null)
const isEdit = ref(false)
const editId = ref(null)

const studentSearchLoading = ref(false)
const studentSessionsLoading = ref(false)
const studentSessions = ref([])
const saving = ref(false)
const formError = ref('')

let studentSearchTimer = null
let studentSearchRequest = 0

/* Form */
const emptyForm = () => ({
  student_id: '',
  student_session_id: '',
  item_name: '',
  quantity: 1,
  price: '',
  total_amount: 0,
  payment_method: 'Cash',
  payment_date: new Date().toLocaleDateString('en-CA'),
  remarks: '',
})

const form = ref(emptyForm())

/* Session helpers */
const getSessionName = (session) => {
  if (!session) return 'Unknown Session'

  const academicSession =
    session.academic_session || session.academicSession || session.academic_session_info || null

  const sessionName =
    academicSession?.name || academicSession?.session_name || session.session_name || session.name

  const className = session.class_info?.name || session.classInfo?.name || session.class_name || ''

  const sectionName = session.section?.name || session.section_name || ''

  const details = [className, sectionName].filter(Boolean).join(' - ')

  if (sessionName && details) return `${sessionName} (${details})`
  if (sessionName) return sessionName

  return `Session ${session.academic_session_id ?? session.academicSession?.id ?? session.id}`
}

/* Detect active session */
const isActiveSession = (session) => {
  if (!session) return false

  const academicSession =
    session.academic_session || session.academicSession || session.academic_session_info || null

  return (
    academicSession?.is_active === true ||
    academicSession?.is_active === 1 ||
    academicSession?.is_active === '1'
  )
}

const getPaymentSession = (payment) => {
  return payment.student_session || payment.studentSession || null
}

const formatDate = (date) => {
  if (!date) return 'N/A'

  const parsedDate = new Date(`${String(date).slice(0, 10)}T00:00:00`)

  return Number.isNaN(parsedDate.getTime()) ? String(date) : parsedDate.toLocaleDateString()
}

/* Computed */
const filteredOtherPayments = computed(() => {
  const query = tableSearch.value.trim().toLowerCase()

  if (!query) return otherPayments.value

  return otherPayments.value.filter((payment) => {
    const studentId = payment.student?.student_id?.toLowerCase() || ''
    const studentName = payment.student?.full_name?.toLowerCase() || ''
    const itemName = payment.item_name?.toLowerCase() || ''
    const session = getPaymentSession(payment)
    const sessionName = session ? getSessionName(session).toLowerCase() : ''

    return (
      studentId.includes(query) ||
      studentName.includes(query) ||
      itemName.includes(query) ||
      sessionName.includes(query)
    )
  })
})

const totalPages = computed(() => {
  return Math.ceil(filteredOtherPayments.value.length / itemsPerPage.value) || 1
})

const paginatedPayments = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredOtherPayments.value.slice(start, start + itemsPerPage.value)
})

const totalPrice = computed(() => {
  return Number(form.value.quantity || 0) * Number(form.value.price || 0)
})

const totalOtherPayment = computed(() => {
  return otherPayments.value.reduce((sum, payment) => sum + Number(payment.total_amount || 0), 0)
})

const totalItems = computed(() => {
  return otherPayments.value.reduce((sum, payment) => sum + Number(payment.quantity || 0), 0)
})

const lastPurchase = computed(() => {
  if (!otherPayments.value.length) return '-'

  const latestPayment = [...otherPayments.value].sort((a, b) => {
    return String(b.payment_date || '').localeCompare(String(a.payment_date || ''))
  })[0]

  return formatDate(latestPayment.payment_date)
})

const thisMonthOtherCollection = computed(() => {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  return otherPayments.value
    .filter((payment) => {
      if (!payment.payment_date) return false

      const date = new Date(`${String(payment.payment_date).slice(0, 10)}T00:00:00`)

      return date.getMonth() === currentMonth && date.getFullYear() === currentYear
    })
    .reduce((sum, payment) => sum + Number(payment.total_amount || 0), 0)
})

const filteredStudents = computed(() => {
  if (!searchStudent.value.trim() || selectedStudent.value) return []
  return students.value
})

/* API: Other Payments */
const getOtherPayments = async () => {
  try {
    const response = await api.get('/other-payments')
    const data = response.data

    otherPayments.value = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []

    if (currentPage.value > totalPages.value) {
      currentPage.value = totalPages.value
    }
  } catch (error) {
    console.error('Error fetching other payments:', error)
    formError.value = error.response?.data?.message || 'Unable to load other payments.'
  }
}

/* API: Search students */
const searchStudents = async (search = '') => {
  const query = search.trim()
  const requestId = ++studentSearchRequest

  if (!query) {
    students.value = []
    studentSearchLoading.value = false
    return
  }

  studentSearchLoading.value = true

  try {
    const response = await api.get('/students', {
      params: {
        search: query,
        per_page: 20,
        page: 1,
      },
    })

    if (requestId !== studentSearchRequest) return

    const data = response.data
    const result = data?.students || data?.data || data

    students.value = Array.isArray(result) ? result : []
  } catch (error) {
    if (requestId !== studentSearchRequest) return

    console.error('Error searching students:', error)
    students.value = []
  } finally {
    if (requestId === studentSearchRequest) {
      studentSearchLoading.value = false
    }
  }
}

/* Student search debounce */
watch(searchStudent, (newValue) => {
  clearTimeout(studentSearchTimer)

  if (selectedStudent.value && newValue !== selectedStudent.value.student_id) {
    selectedStudent.value = null
    form.value.student_id = ''
    form.value.student_session_id = ''
    studentSessions.value = []
  }

  if (!newValue.trim()) {
    students.value = []
    studentSearchLoading.value = false
    return
  }

  if (selectedStudent.value) return

  studentSearchTimer = setTimeout(() => {
    searchStudents(newValue)
  }, 300)
})

/* Load sessions and auto-select active session */
const loadStudentSessions = (student, preferredSessionId = null, paymentSession = null) => {
  const sessions = Array.isArray(student?.student_sessions)
    ? [...student.student_sessions]
    : Array.isArray(student?.studentSessions)
      ? [...student.studentSessions]
      : []

  // Preserve the saved session while editing an existing payment.
  if (paymentSession?.id) {
    const exists = sessions.some((session) => Number(session.id) === Number(paymentSession.id))

    if (!exists) sessions.push(paymentSession)
  }

  studentSessions.value = sessions

  // Editing: retain the exact session previously saved on this payment.
  if (preferredSessionId !== null && preferredSessionId !== undefined) {
    const preferredSession = sessions.find(
      (session) => Number(session.id) === Number(preferredSessionId),
    )

    if (preferredSession) {
      form.value.student_session_id = String(preferredSession.id)
      return
    }
  }

  // New payment: automatically select an active session.
  const activeSession = sessions.find(isActiveSession)

  form.value.student_session_id = activeSession ? String(activeSession.id) : ''
}

/* Select student */
const selectStudent = (student) => {
  selectedStudent.value = student
  form.value.student_id = String(student.id)
  form.value.student_session_id = ''
  studentSessions.value = []

  loadStudentSessions(student)

  searchStudent.value = student.student_id || ''
  students.value = []
  formError.value = ''

  if (!Array.isArray(student.student_sessions) && !Array.isArray(student.studentSessions)) {
    formError.value =
      'Student sessions were not included in the students API response. Please check StudentController.'
  } else if (studentSessions.value.length === 0) {
    formError.value = 'This student has no academic session enrollment.'
  } else if (!form.value.student_session_id) {
    formError.value = 'No active academic session found. Please select a session manually.'
  }
}

/* Modal cleanup: do not remove backdrop while any modal is open */
const cleanupModals = () => {
  if (document.querySelector('.modal.show')) return

  document.querySelectorAll('.modal-backdrop').forEach((backdrop) => {
    backdrop.remove()
  })

  document.body.classList.remove('modal-open')
  document.body.style.removeProperty('overflow')
  document.body.style.removeProperty('padding-right')

  document.documentElement.style.removeProperty('overflow')
  document.documentElement.style.removeProperty('padding-right')

  const modalElement = document.getElementById('otherPaymentModal')

  if (modalElement) {
    modalElement.style.removeProperty('display')
    modalElement.style.removeProperty('padding-right')
    modalElement.removeAttribute('aria-modal')
    modalElement.removeAttribute('role')
    modalElement.setAttribute('aria-hidden', 'true')
  }
}

const handleBrowserBack = () => {
  cleanupModals()
}

/* Close modal and wait for Bootstrap transition */
const closeModal = () => {
  return new Promise((resolve) => {
    const modalElement = document.getElementById('otherPaymentModal')

    if (!modalElement) {
      resolve()
      return
    }

    const instance = bootstrap.Modal.getInstance(modalElement)

    if (!instance || !modalElement.classList.contains('show')) {
      resolve()
      return
    }

    modalElement.addEventListener('hidden.bs.modal', () => resolve(), { once: true })

    instance.hide()
  })
}

/* Validation */
const validateForm = () => {
  if (!form.value.student_id) {
    formError.value = 'Please select a student.'
    return false
  }

  if (!form.value.student_session_id) {
    formError.value = 'Please select an academic session.'
    return false
  }

  if (!form.value.item_name?.trim()) {
    formError.value = 'Please enter the item name.'
    return false
  }

  if (!Number.isFinite(Number(form.value.quantity)) || Number(form.value.quantity) < 1) {
    formError.value = 'Quantity must be at least 1.'
    return false
  }

  if (
    form.value.price === '' ||
    !Number.isFinite(Number(form.value.price)) ||
    Number(form.value.price) < 0
  ) {
    formError.value = 'Please enter a valid price.'
    return false
  }

  if (!form.value.payment_date) {
    formError.value = 'Please select the payment date.'
    return false
  }

  return true
}

/* Request payload */
const buildPayload = () => ({
  student_id: Number(form.value.student_id),
  student_session_id: Number(form.value.student_session_id),
  item_name: form.value.item_name.trim(),
  quantity: Number(form.value.quantity),
  price: Number(form.value.price),
  total_amount: totalPrice.value,
  payment_method: form.value.payment_method || 'Cash',
  payment_date: form.value.payment_date,
  remarks: form.value.remarks || null,
})

/* Save */
const savePayment = async () => {
  if (saving.value) return

  formError.value = ''

  if (!validateForm()) return

  saving.value = true

  try {
    await api.post('/other-payments', buildPayload())

    await getOtherPayments()
    await closeModal()
    resetForm()
    cleanupModals()
  } catch (error) {
    console.error('Save failed:', error.response?.data || error)

    formError.value =
      error.response?.data?.message ||
      Object.values(error.response?.data?.errors || {}).flat()[0] ||
      'Unable to save payment. Please try again.'
  } finally {
    saving.value = false
  }
}

/* Edit */
const editPayment = async (payment) => {
  formError.value = ''
  isEdit.value = true
  editId.value = payment.id

  let matchedStudent =
    students.value.find((student) => Number(student.id) === Number(payment.student_id)) ||
    payment.student ||
    null

  if (!matchedStudent && payment.student_id) {
    try {
      const response = await api.get('/students', {
        params: {
          search: payment.student_id,
          per_page: 20,
          page: 1,
        },
      })

      const data = response.data
      const result = data?.students || data?.data || data
      const studentList = Array.isArray(result) ? result : []

      matchedStudent =
        studentList.find((student) => Number(student.id) === Number(payment.student_id)) || null
    } catch (error) {
      console.error('Error loading payment student:', error)
    }
  }

  selectedStudent.value = matchedStudent
  searchStudent.value = matchedStudent?.student_id || payment.student?.student_id || ''

  const paymentSession = getPaymentSession(payment)

  form.value = {
    student_id: String(payment.student_id || matchedStudent?.id || ''),
    student_session_id: '',
    item_name: payment.item_name || '',
    quantity: Number(payment.quantity || 1),
    price: payment.price ?? '',
    total_amount: Number(payment.total_amount || 0),
    payment_method: payment.payment_method || 'Cash',
    payment_date: payment.payment_date
      ? String(payment.payment_date).slice(0, 10)
      : new Date().toLocaleDateString('en-CA'),
    remarks: payment.remarks || '',
  }

  // Do not silently assign an active session to an old payment
  // whose historical session was not saved.
  loadStudentSessions(
    matchedStudent,
    payment.student_session_id ?? paymentSession?.id ?? null,
    paymentSession,
  )

  if (!matchedStudent) {
    formError.value = 'Unable to load the student information. Please close and try again.'
  } else if (!form.value.student_session_id) {
    formError.value =
      'This payment has no saved academic session. Select a session before updating it.'
  }

  const modalElement = document.getElementById('otherPaymentModal')

  if (modalElement) {
    bootstrap.Modal.getOrCreateInstance(modalElement).show()
  }
}

/* Update */
const updatePayment = async () => {
  if (saving.value) return

  formError.value = ''

  if (!validateForm()) return

  saving.value = true

  try {
    await api.put(`/other-payments/${editId.value}`, buildPayload())

    await getOtherPayments()
    await closeModal()
    resetForm()
    cleanupModals()
  } catch (error) {
    console.error('Update failed:', error.response?.data || error)

    formError.value =
      error.response?.data?.message ||
      Object.values(error.response?.data?.errors || {}).flat()[0] ||
      'Unable to update payment. Please try again.'
  } finally {
    saving.value = false
  }
}

/* Delete */
const deletePayment = async (id) => {
  if (!confirm('Are you sure you want to delete this payment?')) return

  try {
    await api.delete(`/other-payments/${id}`)
    await getOtherPayments()
  } catch (error) {
    console.error('Delete failed:', error)

    alert(error.response?.data?.message || 'Unable to delete this payment. Please try again.')
  }
}

/* Reset */
const resetForm = () => {
  isEdit.value = false
  editId.value = null

  searchStudent.value = ''
  selectedStudent.value = null
  students.value = []
  studentSessions.value = []

  studentSessionsLoading.value = false
  studentSearchLoading.value = false
  formError.value = ''

  studentSearchRequest++
  form.value = emptyForm()
}

/* Lifecycle */
onMounted(() => {
  getOtherPayments()

  window.addEventListener('popstate', handleBrowserBack)
  window.addEventListener('pageshow', handleBrowserBack)
})

onBeforeUnmount(() => {
  clearTimeout(studentSearchTimer)

  window.removeEventListener('popstate', handleBrowserBack)
  window.removeEventListener('pageshow', handleBrowserBack)

  cleanupModals()
})
</script>

<style scoped>
.box {
  width: 85%;
  margin: auto;
  margin-left: 264px;
}

.custom-card {
  background-color: #ffffff;
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease;
  cursor: pointer;
}

.custom-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08) !important;
}

.border-top-green {
  border-top: 4px solid #10b981 !important;
}

.border-top-red {
  border-top: 4px solid #ef4444 !important;
}

.border-top-yellow {
  border-top: 4px solid #f59e0b !important;
}

.border-top-blue {
  border-top: 4px solid #3b82f6 !important;
}

.card-icon-box {
  width: 50px;
  height: 50px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bg-green-light {
  background-color: #d1fae5;
}

.bg-red-light {
  background-color: #fee2e2;
}

.bg-yellow-light {
  background-color: #fef3c7;
}

.bg-blue-light {
  background-color: #dbeafe;
}

.card-title-text {
  font-size: 0.85rem;
  font-weight: 500;
}

.my-custom-table {
  border-collapse: collapse;
}

.my-custom-table thead tr {
  background-color: #f8fafc;
  color: #64748b;
  font-size: 0.85rem;
  text-transform: uppercase;
  border-bottom: 2px solid #e2e8f0;
}

.my-custom-table th,
.my-custom-table td {
  padding: 14px 16px;
}

.my-custom-table tbody tr.data-row {
  border-bottom: 1px solid #f1f5f9;
  background-color: #ffffff;
  transition:
    background-color 0.2s ease,
    transform 0.1s ease;
  cursor: pointer;
}

.my-custom-table tbody tr.data-row:hover {
  background-color: #f0fdf4 !important;
  box-shadow: inset 4px 0 0 #10b981;
}

.student-table-img {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.pg-btn {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  color: #475569;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.pg-btn:hover:not(:disabled) {
  background-color: #0d6efd;
  border-color: #0d6efd;
  color: #ffffff;
}

.pg-btn:disabled {
  background-color: #f1f5f9;
  color: #94a3b8;
  cursor: not-allowed;
  border-color: #e2e8f0;
}

.pg-num-btn {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  color: #475569;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.pg-num-btn:hover {
  background-color: #e2e8f0;
}

.pg-num-btn.active {
  background-color: #0d6efd;
  border-color: #0d6efd;
  color: #ffffff;
}

.action-btn {
  transition: transform 0.2s ease;
}

.action-btn:hover {
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .box {
    width: 100%;
    margin-left: 0;
    padding: 15px;
  }
}
</style>
