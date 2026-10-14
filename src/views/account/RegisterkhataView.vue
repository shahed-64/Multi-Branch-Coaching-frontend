<template>
  <div class="app-layout">
    <AccountMenuView class="sidebar-wrapper" />

    <main class="main-content">
      <div class="container-fluid py-4">
        <!-- FILTERS: SEPARATE AT THE TOP -->
        <div class="card border-0 shadow-sm mb-4 no-print">
          <div class="card-body">
            <div class="row g-3 align-items-end">
              <div v-if="isManager" class="col-12 col-md-4">
                <label class="form-label fw-semibold">Select Branch</label>
                <select v-model="selectedBranchId" class="form-select" @change="handleBranchChange">
                  <option value="">All Branches</option>
                  <option v-for="branch in branches" :key="branch.id" :value="String(branch.id)">
                    {{ branch.name }}
                  </option>
                </select>
              </div>

              <div class="col-12 col-md-4">
                <label class="form-label fw-semibold">Academic Session</label>
                <select v-model="selectedSessionId" class="form-select" @change="loadRegister">
                  <option v-if="!selectedBranchId" value="">All Active Sessions</option>

                  <option
                    v-for="session in availableSessions"
                    :key="session.id"
                    :value="String(session.id)"
                  >
                    {{ session.name }}
                    {{ session.is_active ? '(Current)' : '' }}
                  </option>
                </select>
              </div>

              <div class="col-12 col-md-4">
                <label class="form-label fw-semibold">Select Class</label>
                <select v-model="selectedClassId" class="form-select">
                  <option value="">All Classes</option>
                  <option
                    v-for="group in filteredClassOptions"
                    :key="group.class_id"
                    :value="String(group.class_id)"
                  >
                    {{ getClassName(group) }}
                  </option>
                </select>
              </div>

              <div class="col-12 col-md-6">
                <label class="form-label fw-semibold">Search Student</label>
                <input
                  v-model="searchQuery"
                  type="search"
                  class="form-control"
                  placeholder="Search by student ID, name or phone..."
                />
              </div>

              <div class="col-12 col-md-6 text-md-end">
                <button
                  type="button"
                  class="btn btn-outline-secondary"
                  :disabled="loading"
                  @click="resetFilters"
                >
                  <i class="bi bi-arrow-counterclockwise me-1"></i>
                  Reset Filters
                </button>

                <button
                  type="button"
                  class="btn btn-primary ms-2"
                  :disabled="loading"
                  @click="loadRegister"
                >
                  <i class="bi bi-arrow-clockwise me-1"></i>
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- SUMMARY -->
        <div class="row g-3 mb-4 no-print">
          <div class="col-12 col-sm-6 col-lg-4">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-body">
                <div class="text-secondary small">Total Students</div>
                <div class="fs-3 fw-bold text-primary">
                  {{ totalFilteredStudents }}
                </div>
              </div>
            </div>
          </div>

          <div class="col-12 col-sm-6 col-lg-4">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-body">
                <div class="text-secondary small">Classes</div>
                <div class="fs-3 fw-bold text-success">
                  {{ visibleClassGroups.length }}
                </div>
              </div>
            </div>
          </div>

          <div class="col-12 col-sm-6 col-lg-4">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-body">
                <div class="text-secondary small">Academic Session</div>
                <div class="fs-5 fw-bold">
                  {{ selectedSessionName }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- LOADING -->
        <div v-if="loading" class="card border-0 shadow-sm">
          <div class="card-body text-center py-5">
            <div class="spinner-border text-primary mb-3"></div>
            <p class="text-secondary mb-0">Loading payment register...</p>
          </div>
        </div>

        <!-- ERROR -->
        <div v-else-if="errorMessage" class="alert alert-danger no-print">
          <i class="bi bi-exclamation-triangle me-2"></i>
          {{ errorMessage }}

          <button type="button" class="btn btn-sm btn-outline-danger ms-2" @click="loadRegister">
            Retry
          </button>
        </div>

        <!-- CLASS-WISE REGISTERS -->
        <template v-else>
          <div
            v-for="group in visibleClassGroups"
            :key="group.class_id"
            class="card border-0 shadow-sm mb-4 register-card"
          >
            <!-- CLASS TOOLBAR -->
            <div
              class="card-header bg-white d-flex flex-wrap justify-content-between align-items-center gap-2 py-3 no-print"
            >
              <div>
                <h5 class="fw-bold text-primary mb-1">
                  {{ getClassName(group) }}
                </h5>
                <small class="text-secondary"> {{ group.students.length }} student(s) </small>
              </div>

              <div class="d-flex flex-wrap align-items-center gap-2">
                <span
                  v-if="group.students.length"
                  class="badge bg-light text-dark border px-3 py-2"
                >
                  {{ getSectionSummary(group.students) }}
                </span>

                <button
                  type="button"
                  class="btn btn-primary btn-sm"
                  :disabled="!group.students.length"
                  @click="downloadClassPdf(group)"
                >
                  <i class="bi bi-file-earmark-pdf me-1"></i>
                  Download PDF
                </button>
              </div>
            </div>

            <!-- TABLE: INSTITUTE INFO IS PART OF EACH CLASS TABLE -->
            <div class="card-body p-0">
              <div class="table-responsive">
                <table
                  class="table table-bordered table-hover align-middle text-center mb-0 register-table"
                >
                  <thead>
                    <!-- INSTITUTE INFO -->
                    <tr>
                      <th colspan="18" class="institute-header">
                        <h2 class="fw-bold text-primary mb-1 text-uppercase tracking-wide">
                          Icon Academy
                        </h2>

                        <p class="text-secondary small mb-1">
                          <i class="bi bi-geo-alt-fill me-1"></i>
                          257/1/G Ahmednagar, PaikPara, Mirpur, Dhaka-1216
                        </p>

                        <p class="text-secondary small mb-2">
                          <i class="bi bi-telephone-fill me-1"></i>
                          01674099838, 01829015429
                        </p>

                        <div class="small mb-2">www.iconacademyedu.com</div>

                        <hr class="my-2 opacity-25" />

                        <div class="d-flex flex-wrap justify-content-center gap-2">
                          <span class="badge bg-primary px-3 py-2">
                            {{ getClassName(group) }} — Payment Register
                          </span>

                          <span class="badge bg-light text-dark border px-3 py-2">
                            Session: {{ selectedSessionName }}
                          </span>
                        </div>
                      </th>
                    </tr>

                    <!-- ORIGINAL TABLE COLUMNS -->
                    <tr class="table-dark text-nowrap">
                      <th>Sl.</th>
                      <th>ID</th>
                      <th class="text-start">Name</th>
                      <th>Section</th>
                      <th>Shift</th>
                      <th>Admission</th>

                      <th v-for="month in months" :key="month">
                        {{ month }}
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr
                      v-for="(student, index) in group.students"
                      :key="student.student_session_id"
                    >
                      <td>{{ index + 1 }}</td>

                      <td class="fw-semibold text-secondary text-nowrap">
                        {{ student.student_code || '-' }}
                      </td>

                      <td class="text-start student-name">
                        <div class="fw-semibold text-dark">
                          {{ student.full_name }}
                        </div>
                        <small class="text-secondary">
                          {{ student.phone || '' }}
                        </small>
                      </td>

                      <td>{{ getRelationName(student.section) }}</td>

                      <td>{{ getRelationName(student.shift) }}</td>

                      <td class="text-nowrap">
                        <span
                          v-if="Number(student.admission_fee) > 0"
                          class="text-success fw-semibold"
                        >
                          {{ formatAmount(student.admission_fee) }}
                        </span>
                        <span v-else class="text-secondary">—</span>
                      </td>

                      <!-- PAID AMOUNT OR DASH -->
                      <td v-for="month in months" :key="month" class="text-nowrap">
                        <span v-if="isPaid(student, month)" class="text-success fw-semibold">
                          {{ formatAmount(getMonthPayment(student, month).paid_amount) }}
                        </span>
                        <span v-else class="text-secondary">-</span>
                      </td>
                    </tr>

                    <tr v-if="!group.students.length">
                      <td colspan="18" class="text-center py-4 text-secondary">
                        No students found in this class.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div v-if="!visibleClassGroups.length" class="card border-0 shadow-sm no-print">
            <div class="card-body text-center py-5">
              <i class="bi bi-inbox fs-1 text-secondary"></i>
              <h5 class="mt-3">No Students Found</h5>
              <p class="text-secondary mb-0">Try selecting another branch, session or class.</p>
            </div>
          </div>
        </template>

        <RouterView />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AccountMenuView from './AccountMenuView.vue'
import api from '@/services/api'

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const branches = ref([])
const availableSessions = ref([])
const classGroups = ref([])

const selectedBranchId = ref('')
const selectedSessionId = ref('')
const selectedClassId = ref('')
const searchQuery = ref('')

const loading = ref(false)
const errorMessage = ref('')
const hasLoadedRegister = ref(false)

const storedRole = localStorage.getItem('role')
const isManager = computed(() => storedRole === 'Manager')

const selectedSessionName = computed(() => {
  if (!selectedSessionId.value) {
    return 'All Active Sessions'
  }

  const session = availableSessions.value.find(
    (item) => String(item.id) === String(selectedSessionId.value),
  )

  return session?.name || 'Selected Session'
})

const filteredClassOptions = computed(() => classGroups.value)

const visibleClassGroups = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  return classGroups.value
    .filter((group) => {
      if (!selectedClassId.value) return true

      return String(group.class_id) === String(selectedClassId.value)
    })
    .map((group) => {
      const filteredStudents = (group.students || []).filter((student) => {
        if (!query) return true

        return [student.student_code, student.full_name, student.phone].some((value) =>
          String(value || '')
            .toLowerCase()
            .includes(query),
        )
      })

      return {
        ...group,
        students: filteredStudents,
      }
    })
    .filter((group) => group.students.length > 0)
})

const totalFilteredStudents = computed(() =>
  visibleClassGroups.value.reduce((total, group) => total + group.students.length, 0),
)

function normalizeList(responseData, possibleKeys = []) {
  if (Array.isArray(responseData)) return responseData

  for (const key of possibleKeys) {
    if (Array.isArray(responseData?.[key])) {
      return responseData[key]
    }
  }

  if (Array.isArray(responseData?.data)) {
    return responseData.data
  }

  return []
}

function getClassName(group) {
  const info = group?.class_info

  if (typeof info === 'string') return info

  return info?.name || info?.class_name || info?.title || `Class ${group?.class_id ?? ''}`
}

function getRelationName(relation) {
  if (!relation) return '-'
  if (typeof relation === 'string') return relation

  return relation.name || relation.section_name || relation.shift_name || relation.title || '-'
}

function getSectionSummary(students) {
  const sections = [
    ...new Set(
      students.map((student) => getRelationName(student.section)).filter((name) => name !== '-'),
    ),
  ]

  return sections.length ? sections.join(', ') : 'All Sections'
}

function getMonthPayment(student, month) {
  return (
    (student.monthly_payments || []).find(
      (payment) => String(payment.month || '').toLowerCase() === month.toLowerCase(),
    ) || null
  )
}

function isPaid(student, month) {
  const payment = getMonthPayment(student, month)

  return Boolean(payment && payment.status !== 'unpaid' && Number(payment.paid_amount || 0) > 0)
}

function formatAmount(value) {
  return Number(value || 0).toLocaleString('en-BD', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

async function loadBranches() {
  if (!isManager.value) return

  try {
    const response = await api.get('/branches')
    branches.value = normalizeList(response.data, ['branches'])
  } catch (error) {
    console.error('Failed to load branches:', error)
    branches.value = []
  }
}

async function loadRegister() {
  loading.value = true
  errorMessage.value = ''

  try {
    const params = {}

    if (selectedBranchId.value) {
      params.branch_id = selectedBranchId.value
    }

    if (selectedSessionId.value) {
      params.academic_session_id = selectedSessionId.value
    }

    const response = await api.get('/student-payment-register', { params })
    const data = response.data

    if (data?.status !== true) {
      throw new Error(data?.message || 'Failed to load payment register.')
    }

    availableSessions.value = normalizeList(data, ['available_sessions'])
    classGroups.value = normalizeList(data, ['class_groups'])
    hasLoadedRegister.value = true

    // Select the current session automatically for a specific branch.
    if (selectedBranchId.value && !selectedSessionId.value) {
      const activeSession = availableSessions.value.find(
        (session) => session.is_active === true || session.is_active === 1,
      )

      if (activeSession) {
        selectedSessionId.value = String(activeSession.id)

        const nextResponse = await api.get('/student-payment-register', {
          params: {
            ...params,
            academic_session_id: selectedSessionId.value,
          },
        })

        if (nextResponse.data?.status !== true) {
          throw new Error(nextResponse.data?.message || 'Failed to load selected session.')
        }

        availableSessions.value = normalizeList(nextResponse.data, ['available_sessions'])

        classGroups.value = normalizeList(nextResponse.data, ['class_groups'])
      }
    }

    if (
      selectedClassId.value &&
      !classGroups.value.some((group) => String(group.class_id) === String(selectedClassId.value))
    ) {
      selectedClassId.value = ''
    }
  } catch (error) {
    console.error('Payment register error:', error)

    errorMessage.value =
      error.response?.data?.message || error.message || 'Could not load payment register.'

    classGroups.value = []
  } finally {
    loading.value = false
  }
}

async function handleBranchChange() {
  selectedSessionId.value = ''
  selectedClassId.value = ''
  availableSessions.value = []
  classGroups.value = []

  await loadRegister()
}

async function resetFilters() {
  selectedClassId.value = ''
  searchQuery.value = ''

  if (isManager.value) {
    selectedBranchId.value = ''
  }

  selectedSessionId.value = ''

  await loadRegister()
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function downloadClassPdf(group) {
  const printWindow = window.open('', '_blank')

  if (!printWindow) {
    alert('Please allow pop-ups to download the register as PDF.')
    return
  }

  const instituteInfoHtml = `
    <div class="institute">
      <h2>Icon Academy</h2>
      <p>257/1/G Ahmednagar, PaikPara, Mirpur, Dhaka-1216</p>
      <p>01674099838, 01829015429</p>
      <p>www.iconacademyedu.com</p>
      <hr>
      <h3>${escapeHtml(getClassName(group))} — Payment Register</h3>
      <p>Academic Session: ${escapeHtml(selectedSessionName.value)}</p>
    </div>
  `

  const headerHtml = `
    <tr>
      <th>Sl.</th>
      <th>ID</th>
      <th>Name</th>
      <th>Section</th>
      <th>Shift</th>
      <th>Admission</th>
      ${months.map((month) => `<th>${escapeHtml(month)}</th>`).join('')}
    </tr>
  `

  const rowsHtml = group.students
    .map((student, index) => {
      const monthCells = months
        .map((month) => {
          const payment = getMonthPayment(student, month)
          const paid = isPaid(student, month)
          const amount = paid ? formatAmount(payment.paid_amount) : '-'

          return `<td>${escapeHtml(amount)}</td>`
        })
        .join('')

      return `
      <tr>
        <td>${index + 1}</td>
        <td>${escapeHtml(student.student_code || '-')}</td>
        <td class="student-name">
          <strong>${escapeHtml(student.full_name || '-')}</strong>
          <div>${escapeHtml(student.phone || '')}</div>
        </td>
        <td>${escapeHtml(getRelationName(student.section))}</td>
        <td>${escapeHtml(getRelationName(student.shift))}</td>
        <td>
          ${
            Number(student.admission_fee) > 0
              ? escapeHtml(formatAmount(student.admission_fee))
              : '—'
          }
        </td>
        ${monthCells}
      </tr>
    `
    })
    .join('')

  const documentHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>${escapeHtml(getClassName(group))} Payment Register</title>
        <style>
          @page {
            size: A4 landscape;
            margin: 8mm;
          }

          * {
            box-sizing: border-box;
          }

          body {
            font-family: Arial, sans-serif;
            color: #222;
            margin: 0;
            font-size: 9px;
          }

          .institute {
            text-align: center;
            margin-bottom: 14px;
            line-height: 1.5;
          }

          .institute h2 {
            color: #2563eb;
            font-size: 22px;
            text-transform: uppercase;
            margin: 0 0 5px;
          }

          .institute h3 {
            font-size: 14px;
            margin: 8px 0 4px;
          }

          .institute p {
            margin: 3px 0;
          }

          .institute hr {
            border: 0;
            border-top: 1px solid #ddd;
            margin: 8px 0;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            table-layout: auto;
          }

          th, td {
            border: 1px solid #777;
            padding: 5px 3px;
            text-align: center;
            vertical-align: middle;
            overflow-wrap: anywhere;
          }

          th {
            background: #343a40;
            color: white;
            font-weight: bold;
          }

          td.student-name {
            text-align: left;
            min-width: 110px;
          }

          .student-name div {
            color: #666;
            margin-top: 2px;
          }

          thead {
            display: table-header-group;
          }

          tr {
            page-break-inside: avoid;
          }

          @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        </style>
      </head>
      <body>
        ${instituteInfoHtml}

        <table>
          <thead>${headerHtml}</thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      </body>
    </html>
  `

  printWindow.document.open()
  printWindow.document.write(documentHtml)
  printWindow.document.close()

  // Print only after the new document has finished loading.
  printWindow.onload = () => {
    printWindow.focus()
    printWindow.print()
  }
}

onMounted(async () => {
  await loadBranches()
  await loadRegister()
})
</script>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
  width: 100%;
}

.sidebar-wrapper {
  width: 260px;
  flex-shrink: 0;
}

.main-content {
  flex-grow: 1;
  min-width: 0;
  background-color: #f4f6f9;
}

.tracking-wide {
  letter-spacing: 1px;
}

.register-card {
  overflow: hidden;
}

.register-table {
  min-width: 1200px;
}

.register-table th,
.register-table td {
  font-size: 13px;
  padding: 10px 8px;
}

.register-table thead th {
  vertical-align: middle;
}

.institute-header {
  background: #fff !important;
  color: #333 !important;
  padding: 22px 12px !important;
  white-space: normal !important;
  line-height: 1.5;
}

.institute-header h2 {
  font-size: 24px;
}

.institute-header p {
  margin-bottom: 4px;
}

.student-name {
  min-width: 170px;
}

@media (max-width: 767.98px) {
  .sidebar-wrapper {
    width: auto;
  }

  .register-table th,
  .register-table td {
    padding: 8px 6px;
    font-size: 12px;
  }
}
</style>
