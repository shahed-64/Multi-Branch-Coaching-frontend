<template>
  <dashPageView />

  <div class="dashboard-layout bg-light min-vh-100 d-flex">
    <aside class="sidebar-wrapper"></aside>

    <div class="main-wrapper flex-grow-1 min-vh-100 d-flex flex-column">
      <RouterView />

      <main class="attendance-summary-section py-3 py-md-4 px-2 px-md-3">
        <div class="container-fluid p-0">
          <!-- Header -->
          <div class="row mb-4">
            <div class="col-12">
              <div
                class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3"
              >
                <div>
                  <h2 class="h4 fw-bold text-dark mb-1">Student Attendance Yearly Summary</h2>
                  <p class="text-muted small mb-0">Overview of students' yearly attendance</p>
                </div>

                <div class="d-flex flex-column flex-sm-row gap-2">
                  <!-- Academic Session -->
                  <select
                    v-model="selectedSessionId"
                    class="form-select form-select-sm"
                    :disabled="sessionsLoading || availableSessions.length === 0"
                    @change="fetchAllData"
                  >
                    <option value="">Select Academic Session</option>
                    <option
                      v-for="session in availableSessions"
                      :key="session.id"
                      :value="String(session.id)"
                    >
                      {{
                        session.name ||
                        session.session_name ||
                        session.year ||
                        `Session ${session.id}`
                      }}
                    </option>
                  </select>

                  <!-- Year -->
                  <select
                    v-model="selectedYear"
                    class="form-select form-select-sm"
                    @change="fetchAllData"
                  >
                    <option v-for="year in availableYears" :key="year" :value="year">
                      {{ year }}
                    </option>
                  </select>
                </div>
              </div>

              <div v-if="sessionsLoading" class="small text-muted mt-2">
                Loading academic sessions...
              </div>

              <div v-if="pageError" class="alert alert-danger mt-3 mb-0">
                {{ pageError }}
              </div>
            </div>
          </div>

          <!-- Search / Filter -->
          <div class="card border-0 shadow-sm rounded-3 mb-3">
            <div class="card-body">
              <div class="row g-3 align-items-end">
                <div class="col-12 col-md-7">
                  <label class="form-label small fw-semibold text-secondary">
                    Search Student
                  </label>
                  <input
                    v-model="searchStudent"
                    type="text"
                    class="form-control form-control-sm"
                    placeholder="Search by Student ID or Student Name..."
                  />
                </div>

                <div class="col-12 col-md-4">
                  <label class="form-label small fw-semibold text-secondary"> Class </label>
                  <select v-model="selectedClass" class="form-select form-select-sm">
                    <option value="">All Classes</option>
                    <option
                      v-for="className in availableClasses"
                      :key="className"
                      :value="className"
                    >
                      {{ className }}
                    </option>
                  </select>
                </div>

                <div class="col-12 col-md-1">
                  <button
                    type="button"
                    class="btn btn-sm btn-outline-secondary w-100"
                    @click="resetFilters"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Attendance Table -->
          <div class="card border-0 shadow-sm rounded-3">
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                  <thead class="table-light">
                    <tr class="small text-secondary fw-semibold">
                      <th class="ps-4 py-3">STUDENT ID</th>
                      <th class="py-3">STUDENT NAME</th>
                      <th class="py-3">CLASS</th>
                      <th class="text-center py-3 text-success">PRESENT</th>
                      <th class="text-center py-3 text-warning">LATE</th>
                      <th class="text-center py-3 text-danger">ABSENT</th>
                      <th class="text-center py-3 text-secondary">LEAVE</th>
                      <th class="text-center py-3 text-info">TOTAL RECORDS</th>
                      <th class="text-end pe-4 py-3">ACTION</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr v-if="loading">
                      <td colspan="9" class="text-center py-4 text-muted">
                        <span class="spinner-border spinner-border-sm me-2"></span>
                        Loading yearly attendance...
                      </td>
                    </tr>

                    <tr
                      v-else
                      v-for="student in paginatedStudents"
                      :key="student.student_session_id || student.id"
                    >
                      <td class="ps-4">
                        <div class="fw-bold text-dark">
                          {{ student.student_code || student.student_id || '-' }}
                        </div>
                      </td>

                      <td>
                        <div class="fw-bold text-dark">
                          {{ student.name || '-' }}
                        </div>
                      </td>

                      <td>
                        <span class="text-muted">
                          {{ student.class_name || '-' }}
                        </span>
                      </td>

                      <td class="text-center fw-bold text-success">
                        {{ student.present ?? 0 }}
                      </td>

                      <td class="text-center fw-bold text-warning">
                        {{ student.late ?? 0 }}
                      </td>

                      <td class="text-center fw-bold text-danger">
                        {{ student.absent ?? 0 }}
                      </td>

                      <td class="text-center fw-bold text-secondary">
                        {{ student.leave ?? 0 }}
                      </td>

                      <td class="text-center font-monospace">
                        <span
                          class="badge bg-info bg-opacity-10 text-info fw-semibold border border-info border-opacity-25 px-2 py-1"
                        >
                          {{ student.total_records ?? 0 }}
                        </span>
                      </td>

                      <td class="text-end pe-4">
                        <button
                          type="button"
                          class="btn btn-sm btn-outline-primary fw-semibold"
                          @click="viewStudentDetails(student)"
                        >
                          👁️ View Report
                        </button>
                      </td>
                    </tr>

                    <tr v-if="!loading && filteredStudents.length === 0">
                      <td colspan="9" class="text-center py-4 text-muted">
                        {{
                          selectedSessionId
                            ? 'No students found matching your search/filter.'
                            : 'Please select an academic session.'
                        }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Pagination -->
              <div
                v-if="!loading && filteredStudents.length > 0"
                class="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 px-3 px-md-4 py-3 border-top"
              >
                <div class="small text-muted">
                  Showing <strong>{{ paginationStart }}</strong> to
                  <strong>{{ paginationEnd }}</strong> of
                  <strong>{{ filteredStudents.length }}</strong> students
                </div>

                <nav aria-label="Student attendance pagination">
                  <ul class="pagination pagination-sm mb-0">
                    <li class="page-item" :class="{ disabled: currentPage === 1 }">
                      <button
                        class="page-link"
                        type="button"
                        :disabled="currentPage === 1"
                        @click="previousPage"
                      >
                        Previous
                      </button>
                    </li>

                    <li
                      v-for="page in visiblePages"
                      :key="page"
                      class="page-item"
                      :class="{ active: currentPage === page }"
                    >
                      <button class="page-link" type="button" @click="goToPage(page)">
                        {{ page }}
                      </button>
                    </li>

                    <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                      <button
                        class="page-link"
                        type="button"
                        :disabled="currentPage === totalPages"
                        @click="nextPage"
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Student Monthly Report Modal -->
    <div id="studentReportModal" class="modal fade" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-xl modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header bg-light">
            <h5 class="modal-title fw-bold">
              {{ selectedStudent?.name }} - Yearly Report ({{ selectedYear }})
            </h5>

            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>

          <div class="modal-body p-0">
            <div class="table-responsive">
              <table class="table table-bordered mb-0 align-middle">
                <thead class="table-dark text-white small">
                  <tr>
                    <th class="ps-3">MONTH</th>
                    <th class="text-center">PRESENT</th>
                    <th class="text-center">LATE</th>
                    <th class="text-center">ABSENT</th>
                    <th class="text-center">LEAVE</th>
                    <th class="text-center">TOTAL RECORDS</th>
                  </tr>
                </thead>

                <tbody>
                  <tr v-for="month in selectedStudentMonthlyReports" :key="month.monthNumber">
                    <td class="ps-3 fw-bold text-primary">
                      {{ month.monthName }}
                    </td>
                    <td class="text-center text-success fw-semibold">
                      {{ month.present }}
                    </td>
                    <td class="text-center text-warning fw-semibold">
                      {{ month.late }}
                    </td>
                    <td class="text-center text-danger fw-semibold">
                      {{ month.absent }}
                    </td>
                    <td class="text-center text-secondary fw-semibold">
                      {{ month.leave }}
                    </td>
                    <td class="text-center">
                      {{ month.totalRecords }}
                    </td>
                  </tr>

                  <tr class="table-light">
                    <td class="ps-3"><strong>YEAR TOTAL</strong></td>
                    <td class="text-center text-success fw-bold">
                      {{ selectedStudent?.present ?? 0 }}
                    </td>
                    <td class="text-center text-warning fw-bold">
                      {{ selectedStudent?.late ?? 0 }}
                    </td>
                    <td class="text-center text-danger fw-bold">
                      {{ selectedStudent?.absent ?? 0 }}
                    </td>
                    <td class="text-center text-secondary fw-bold">
                      {{ selectedStudent?.leave ?? 0 }}
                    </td>
                    <td class="text-center fw-bold">
                      {{ selectedStudent?.total_records ?? 0 }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="modal-footer bg-light">
            <button type="button" class="btn btn-sm btn-secondary" data-bs-dismiss="modal">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import * as bootstrap from 'bootstrap'
import dashPageView from './dashPageView.vue'
import api from '@/services/api'

/* State */
const currentYear = new Date().getFullYear()
const selectedYear = ref(String(currentYear))
const availableYears = ref([])

const availableSessions = ref([])
const selectedSessionId = ref('')
const sessionsLoading = ref(false)

const studentsSummary = ref([])
const loading = ref(false)
const pageError = ref('')

const selectedStudent = ref(null)
const selectedStudentMonthlyReports = ref([])

/* Filters */
const searchStudent = ref('')
const selectedClass = ref('')

/* Classes */
const availableClasses = computed(() => {
  const classes = studentsSummary.value.map((student) => student.class_name).filter(Boolean)

  return [...new Set(classes)].sort((a, b) => String(a).localeCompare(String(b)))
})

/* Search and filter */
const filteredStudents = computed(() => {
  const search = searchStudent.value.trim().toLowerCase()
  const classFilter = selectedClass.value.trim().toLowerCase()

  return studentsSummary.value.filter((student) => {
    const studentId = String(student.student_code || student.student_id || '').toLowerCase()

    const studentName = String(student.name || '').toLowerCase()
    const className = String(student.class_name || '').toLowerCase()

    const matchesSearch = !search || studentId.includes(search) || studentName.includes(search)

    const matchesClass = !classFilter || className === classFilter

    return matchesSearch && matchesClass
  })
})

/* Pagination */
const currentPage = ref(1)
const perPage = 20

const totalPages = computed(() => Math.ceil(filteredStudents.value.length / perPage))

const paginatedStudents = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return filteredStudents.value.slice(start, start + perPage)
})

const paginationStart = computed(() =>
  filteredStudents.value.length ? (currentPage.value - 1) * perPage + 1 : 0,
)

const paginationEnd = computed(() =>
  Math.min(currentPage.value * perPage, filteredStudents.value.length),
)

const visiblePages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value

  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1)
  }

  if (current <= 4) {
    return [1, 2, 3, 4, 5, '...', total]
  }

  if (current >= total - 3) {
    return [1, '...', total - 4, total - 3, total - 2, total - 1, total]
  }

  return [1, '...', current - 1, current, current + 1, '...', total]
})

const goToPage = (page) => {
  if (page === '...') return
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
}

const previousPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}

watch([searchStudent, selectedClass], () => {
  currentPage.value = 1
})

/* Reset filters */
const resetFilters = () => {
  searchStudent.value = ''
  selectedClass.value = ''
  currentPage.value = 1
}

/* Months */
const monthNames = [
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

/* Year options */
const buildYearOptions = () => {
  availableYears.value = []

  for (let year = currentYear; year >= currentYear - 5; year--) {
    availableYears.value.push(String(year))
  }
}

/*
 * Load academic sessions.
 * Assumed endpoint: GET /academic-sessions
 *
 * Supports common response formats:
 * { data: [...] }, { sessions: [...] }, or [...]
 */
const fetchAcademicSessions = async () => {
  sessionsLoading.value = true
  pageError.value = ''

  try {
    const response = await api.get('/academic-sessions')
    const payload = response.data

    let sessions = []

    if (Array.isArray(payload)) {
      sessions = payload
    } else if (Array.isArray(payload?.data)) {
      sessions = payload.data
    } else if (Array.isArray(payload?.sessions)) {
      sessions = payload.sessions
    } else if (Array.isArray(payload?.academic_sessions)) {
      sessions = payload.academic_sessions
    }

    availableSessions.value = sessions

    if (sessions.length > 0) {
      const activeSession = sessions.find(
        (session) =>
          session.is_active === true || session.is_current === true || session.status === 'active',
      )

      selectedSessionId.value = String(activeSession?.id ?? sessions[0].id)

      await fetchAllData()
    } else {
      selectedSessionId.value = ''
      studentsSummary.value = []
      pageError.value = 'No academic sessions were returned by the API.'
    }
  } catch (error) {
    console.error('Error loading academic sessions:', error)
    console.error('Response:', error.response?.data)

    pageError.value =
      'Academic sessions could not be loaded. Please verify the session API endpoint.'
  } finally {
    sessionsLoading.value = false
  }
}

/* Fetch yearly attendance */
const fetchAllData = async () => {
  if (!selectedSessionId.value) {
    studentsSummary.value = []
    return
  }

  loading.value = true
  pageError.value = ''
  currentPage.value = 1

  try {
    const response = await api.get('/student-attendance/yearly-summary', {
      params: {
        academic_session_id: selectedSessionId.value,
        year: selectedYear.value,
      },
    })

    studentsSummary.value = Array.isArray(response.data?.students) ? response.data.students : []
  } catch (error) {
    console.error('Error fetching yearly attendance:', error)
    console.error('Response:', error.response?.data)

    studentsSummary.value = []

    pageError.value = error.response?.data?.message || 'Unable to load yearly attendance.'
  } finally {
    loading.value = false
  }
}

/* Student monthly report */
const viewStudentDetails = (student) => {
  selectedStudent.value = student

  const monthlyReports = monthNames.map((monthName, index) => ({
    monthNumber: index + 1,
    monthName,
    present: 0,
    late: 0,
    absent: 0,
    leave: 0,
    totalRecords: 0,
  }))

  if (Array.isArray(student.attendance_records)) {
    student.attendance_records.forEach((attendance) => {
      if (!attendance.date) return

      // Use the date's YYYY-MM-DD portion to avoid timezone month shifts.
      const dateText = String(attendance.date).slice(0, 10)
      const match = dateText.match(/^\d{4}-(\d{2})-\d{2}$/)

      if (!match) return

      const monthIndex = Number(match[1]) - 1
      if (monthIndex < 0 || monthIndex > 11) return

      const month = monthlyReports[monthIndex]
      const status = String(attendance.status || '').toLowerCase()

      if (status === 'present') month.present++
      else if (status === 'late') month.late++
      else if (status === 'absent') month.absent++
      else if (status === 'leave') month.leave++

      month.totalRecords++
    })
  }

  selectedStudentMonthlyReports.value = monthlyReports

  const modalElement = document.getElementById('studentReportModal')
  if (!modalElement) return

  bootstrap.Modal.getOrCreateInstance(modalElement).show()
}

/* Mount */
onMounted(() => {
  buildYearOptions()
  fetchAcademicSessions()
})
</script>

<style scoped>
.main-wrapper {
  margin-left: 260px;
  width: calc(100% - 260px);
}

@media (max-width: 768px) {
  .main-wrapper {
    margin-left: 0;
    width: 100%;
  }
}

.pagination {
  margin-bottom: 0;
}

.pagination .page-link {
  min-width: 34px;
  text-align: center;
}

.pagination .page-item.disabled .page-link {
  cursor: not-allowed;
}
</style>
