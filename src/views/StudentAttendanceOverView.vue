<template>
  <dashPageView />

  <div class="dashboard-layout bg-light min-vh-100 d-flex">
    <!-- Left Sidebar -->
    <aside class="sidebar-wrapper"></aside>

    <!-- Main Content -->
    <div class="main-wrapper flex-grow-1 min-vh-100 d-flex flex-column">
      <RouterView />

      <main class="attendance-summary-section py-3 py-md-4 px-2 px-md-3">
        <div class="container-fluid p-0">
          <!-- =========================
                       PAGE HEADER
                  ========================== -->
          <div class="row mb-4">
            <div class="col-12">
              <div
                class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3"
              >
                <div>
                  <h2 class="h4 fw-bold text-dark mb-1">Student Attendance Yearly Summary</h2>

                  <p class="text-muted small mb-0">Overview of students' yearly attendance</p>
                </div>

                <!-- Year Filter -->
                <div>
                  <select
                    v-model="selectedYear"
                    @change="fetchAllData"
                    class="form-select form-select-sm"
                  >
                    <option v-for="year in availableYears" :key="year" :value="year">
                      {{ year }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <!-- =========================
                    SEARCH / FILTER
               ========================== -->
          <div class="card border-0 shadow-sm rounded-3 mb-3">
            <div class="card-body">
              <div class="row g-3 align-items-end">
                <!-- Search Student -->
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

                <!-- Class Filter -->
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

                <!-- Reset -->
                <div class="col-12 col-md-1">
                  <button
                    type="button"
                    class="btn btn-sm btn-outline-secondary w-100"
                    @click="resetFilters"
                    title="Reset filters"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- =========================
                         MAIN TABLE
                  ========================== -->
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
                    <!-- Loading -->
                    <tr v-if="loading">
                      <td colspan="9" class="text-center py-4 text-muted">
                        <div class="spinner-border spinner-border-sm me-2" role="status"></div>

                        Loading yearly attendance...
                      </td>
                    </tr>

                    <!-- Students -->
                    <tr v-else v-for="student in paginatedStudents" :key="student.id">
                      <td class="ps-4">
                        <div class="fw-bold text-dark">
                          {{ student.student_code }}
                        </div>
                      </td>

                      <td>
                        <div class="fw-bold text-dark">
                          {{ student.name }}
                        </div>
                      </td>

                      <td>
                        <span class="text-muted">
                          {{ student.class_name || '-' }}
                        </span>
                      </td>

                      <td class="text-center fw-bold text-success">
                        {{ student.present }}
                      </td>

                      <td class="text-center fw-bold text-warning">
                        {{ student.late }}
                      </td>

                      <td class="text-center fw-bold text-danger">
                        {{ student.absent }}
                      </td>

                      <td class="text-center fw-bold text-secondary">
                        {{ student.leave }}
                      </td>

                      <td class="text-center font-monospace">
                        <span
                          class="badge bg-info bg-opacity-10 text-info fw-semibold border border-info border-opacity-25 px-2 py-1"
                        >
                          {{ student.total_records }}
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

                    <!-- No Data -->
                    <tr v-if="!loading && filteredStudents.length === 0">
                      <td colspan="9" class="text-center py-4 text-muted">
                        No students found matching your search/filter.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- =========================
                           PAGINATION
                   ========================== -->

              <div
                v-if="!loading && filteredStudents.length > 0"
                class="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 px-3 px-md-4 py-3 border-top"
              >
                <!-- Showing Information -->
                <div class="small text-muted">
                  Showing

                  <strong>
                    {{ paginationStart }}
                  </strong>

                  to

                  <strong>
                    {{ paginationEnd }}
                  </strong>

                  of

                  <strong>
                    {{ filteredStudents.length }}
                  </strong>

                  students
                </div>

                <!-- Pagination Buttons -->
                <nav aria-label="Student attendance pagination">
                  <ul class="pagination pagination-sm mb-0">
                    <!-- Previous -->
                    <li
                      class="page-item"
                      :class="{
                        disabled: currentPage === 1,
                      }"
                    >
                      <button
                        class="page-link"
                        type="button"
                        @click="previousPage"
                        :disabled="currentPage === 1"
                      >
                        Previous
                      </button>
                    </li>

                    <!-- Page Numbers -->
                    <li
                      v-for="page in visiblePages"
                      :key="page"
                      class="page-item"
                      :class="{
                        active: currentPage === page,
                      }"
                    >
                      <button class="page-link" type="button" @click="goToPage(page)">
                        {{ page }}
                      </button>
                    </li>

                    <!-- Next -->
                    <li
                      class="page-item"
                      :class="{
                        disabled: currentPage === totalPages,
                      }"
                    >
                      <button
                        class="page-link"
                        type="button"
                        @click="nextPage"
                        :disabled="currentPage === totalPages"
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

    <!-- ==================================================
             STUDENT MONTHLY REPORT MODAL
         =================================================== -->

    <div class="modal fade" id="studentReportModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-xl modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <!-- Modal Header -->
          <div class="modal-header bg-light">
            <h5 class="modal-title fw-bold">
              {{ selectedStudent?.name }}

              - Yearly Report ({{ selectedYear }})
            </h5>

            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>

          <!-- Modal Body -->
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

                  <!-- Year Total -->
                  <tr class="table-light">
                    <td class="ps-3">
                      <strong>YEAR TOTAL</strong>
                    </td>

                    <td class="text-center text-success fw-bold">
                      {{ selectedStudent?.present || 0 }}
                    </td>

                    <td class="text-center text-warning fw-bold">
                      {{ selectedStudent?.late || 0 }}
                    </td>

                    <td class="text-center text-danger fw-bold">
                      {{ selectedStudent?.absent || 0 }}
                    </td>

                    <td class="text-center text-secondary fw-bold">
                      {{ selectedStudent?.leave || 0 }}
                    </td>

                    <td class="text-center fw-bold">
                      {{ selectedStudent?.total_records || 0 }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Modal Footer -->
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

/* ==================================================
   STATE
================================================== */

const currentYear = new Date().getFullYear()

const selectedYear = ref(String(currentYear))

const availableYears = ref([])

const studentsSummary = ref([])

const loading = ref(false)

const selectedStudent = ref(null)

const selectedStudentMonthlyReports = ref([])

/* ==================================================
   SEARCH / FILTER
================================================== */

const searchStudent = ref('')

const selectedClass = ref('')

/* ==================================================
   AVAILABLE CLASSES
================================================== */

const availableClasses = computed(() => {
  const classes = studentsSummary.value
    .map((student) => student.class_name)
    .filter((className) => className)

  return [...new Set(classes)].sort((a, b) => String(a).localeCompare(String(b)))
})

/* ==================================================
   FILTERED STUDENTS
================================================== */

const filteredStudents = computed(() => {
  const search = searchStudent.value.trim().toLowerCase()

  const classFilter = selectedClass.value.trim().toLowerCase()

  return studentsSummary.value.filter((student) => {
    const studentId = String(student.student_code || '').toLowerCase()

    const studentName = String(student.name || '').toLowerCase()

    const className = String(student.class_name || '').toLowerCase()

    /*
     * One search box:
     * Student ID OR Student Name
     */
    const matchesSearch = !search || studentId.includes(search) || studentName.includes(search)

    /*
     * Class filter
     */
    const matchesClass = !classFilter || className === classFilter

    return matchesSearch && matchesClass
  })
})

/* ==================================================
   PAGINATION
================================================== */

const currentPage = ref(1)

const perPage = 20

const totalPages = computed(() => {
  return Math.ceil(filteredStudents.value.length / perPage)
})

const paginatedStudents = computed(() => {
  const start = (currentPage.value - 1) * perPage

  const end = start + perPage

  return filteredStudents.value.slice(start, end)
})

const paginationStart = computed(() => {
  if (filteredStudents.value.length === 0) {
    return 0
  }

  return (currentPage.value - 1) * perPage + 1
})

const paginationEnd = computed(() => {
  return Math.min(currentPage.value * perPage, filteredStudents.value.length)
})

/* ==================================================
   VISIBLE PAGE NUMBERS
================================================== */

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
  if (page === '...') {
    return
  }

  if (page < 1 || page > totalPages.value) {
    return
  }

  currentPage.value = page
}

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

/* ==================================================
   RESET PAGE WHEN FILTER CHANGES
================================================== */

watch([searchStudent, selectedClass], () => {
  currentPage.value = 1
})

/* ==================================================
   RESET FILTERS
================================================== */

const resetFilters = () => {
  searchStudent.value = ''

  selectedClass.value = ''

  currentPage.value = 1
}

/* ==================================================
   MONTH NAMES
================================================== */

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

/* ==================================================
   YEAR OPTIONS
================================================== */

const buildYearOptions = () => {
  const years = []

  for (let year = currentYear; year >= currentYear - 5; year--) {
    years.push(String(year))
  }

  availableYears.value = years
}

/* ==================================================
   FETCH YEARLY DATA
================================================== */

const fetchAllData = async () => {
  loading.value = true

  currentPage.value = 1

  try {
    const response = await api.get('/student-attendance/yearly-summary', {
      params: {
        year: selectedYear.value,
      },
    })

    if (response.data?.status) {
      studentsSummary.value = response.data.students || []
    } else {
      studentsSummary.value = []
    }
  } catch (error) {
    console.error('Error fetching student yearly attendance:', error)

    console.error('Response:', error.response?.data)

    studentsSummary.value = []
  } finally {
    loading.value = false
  }
}

/* ==================================================
   VIEW STUDENT MONTHLY REPORT
================================================== */

const viewStudentDetails = (student) => {
  selectedStudent.value = student

  /*
   * Create all 12 months
   */

  const monthlyReports = monthNames.map((monthName, index) => {
    return {
      monthNumber: index + 1,

      monthName,

      present: 0,

      late: 0,

      absent: 0,

      leave: 0,

      totalRecords: 0,
    }
  })

  /*
   * Calculate monthly attendance
   */

  if (Array.isArray(student.attendances)) {
    student.attendances.forEach((attendance) => {
      if (!attendance.date) {
        return
      }

      const date = new Date(attendance.date)

      /*
       * Laravel response is ISO UTC datetime.
       */

      const monthIndex = date.getUTCMonth()

      if (monthIndex < 0 || monthIndex > 11) {
        return
      }

      const month = monthlyReports[monthIndex]

      const status = String(attendance.status || '').toLowerCase()

      if (status === 'present') {
        month.present++
      } else if (status === 'late') {
        month.late++
      } else if (status === 'absent') {
        month.absent++
      } else if (status === 'leave') {
        month.leave++
      }

      month.totalRecords++
    })
  }

  selectedStudentMonthlyReports.value = monthlyReports

  /*
   * Open Modal
   */

  const modalElement = document.getElementById('studentReportModal')

  if (!modalElement) {
    return
  }

  const modal = new bootstrap.Modal(modalElement)

  modal.show()
}

/* ==================================================
   MOUNT
================================================== */

onMounted(() => {
  buildYearOptions()

  fetchAllData()
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

/* ==================================================
   PAGINATION
================================================== */

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
