<template>
  <RouterView />

  <dashPageView />

  <div class="result-page-wrapper py-4">
    <div class="container-fluid px-4">
      <!-- =====================================================
           SUMMARY CARDS
      ====================================================== -->

      <!-- Exam Participants -->
      <div class="row g-4 mb-4">
        <div class="col-md-3 col-sm-6">
          <div class="card border-0 shadow-sm rounded-4 p-3 border-start border-success border-4">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <p class="text-muted mb-1 small fw-bold">Exam Participants</p>
                <h4 class="fw-bold text-dark mb-0">
                  {{ totalStudents }}
                </h4>
              </div>

              <div class="icon-box bg-success-subtle text-success rounded-3 p-3">🎓</div>
            </div>
          </div>
        </div>

        <!-- Published Results -->
        <div class="col-md-3 col-sm-6">
          <div class="card border-0 shadow-sm rounded-4 p-3 border-start border-primary border-4">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <p class="text-muted mb-1 small fw-bold">Published Results</p>
                <h4 class="fw-bold text-dark mb-0">
                  {{ publishedResults }}
                </h4>
              </div>

              <div class="icon-box bg-primary-subtle text-primary rounded-3 p-3">📄</div>
            </div>
          </div>
        </div>

        <!-- Pass Rate -->
        <div class="col-md-3 col-sm-6">
          <div class="card border-0 shadow-sm rounded-4 p-3 border-start border-warning border-4">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <p class="text-muted mb-1 small fw-bold">Pass Rate</p>
                <h4 class="fw-bold text-dark mb-0">{{ passRate }}%</h4>
              </div>

              <div class="icon-box bg-warning-subtle text-warning rounded-3 p-3">📈</div>
            </div>
          </div>
        </div>

        <!-- GPA 5 -->
        <div class="col-md-3 col-sm-6">
          <div class="card border-0 shadow-sm rounded-4 p-3 border-start border-info border-4">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <p class="text-muted mb-1 small fw-bold">Total GPA 5.00</p>
                <h4 class="fw-bold text-dark mb-0">
                  {{ totalGpaFive }}
                </h4>
              </div>

              <div class="icon-box bg-info-subtle text-info rounded-3 p-3">⭐</div>
            </div>
          </div>
        </div>
      </div>

      <!-- =====================================================
           RESULT LIST
      ====================================================== -->

      <div class="card border-0 shadow-sm rounded-4 p-4">
        <!-- Header -->
        <div
          class="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mb-4"
        >
          <h4 class="fw-bold text-dark mb-0">Student Result List</h4>

          <div class="d-flex align-items-center gap-3">
            <!-- Search -->
            <div class="search-box position-relative" style="width: 260px">
              <input
                type="text"
                class="form-control"
                v-model="search"
                placeholder="Search by Student ID or Name..."
              />

              <span class="position-absolute top-50 end-0 translate-middle-y me-3 text-muted">
                🔍
              </span>
            </div>

            <!-- Add Result -->
            <button
              type="button"
              class="btn btn-success btn-sm px-4 py-2 fw-bold rounded-pill shadow-sm d-flex align-items-center gap-2 text-nowrap result-add-btn"
              @click.stop.prevent="openAddModal"
            >
              <span>+ Add Result</span>
            </button>
          </div>
        </div>

        <!-- =====================================================
             TABLE
        ====================================================== -->

        <div class="table-responsive">
          <table class="table align-middle table-hover mb-0">
            <thead class="table-light text-uppercase fs-7 text-muted">
              <tr>
                <th class="py-3 ps-3" style="width: 8%">#</th>
                <th class="py-3">Student ID</th>
                <th class="py-3">Student Name</th>
                <th class="py-3">Exam Info</th>
                <th class="py-3">Exam Year</th>
                <th class="py-3 text-center" style="width: 20%">Action / Receipt</th>
              </tr>
            </thead>

            <tbody>
              <!-- Result Rows -->
              <tr v-for="(result, index) in filteredResults" :key="result?.id ?? `result-${index}`">
                <td class="ps-3 fw-semibold text-muted">
                  {{ (currentPage - 1) * perPage + index + 1 }}
                </td>

                <td class="fw-bold text-dark">
                  {{ result?.student?.student_id || 'N/A' }}
                </td>

                <td class="fw-bold text-dark">
                  {{ result?.student?.full_name || 'N/A' }}
                </td>

                <td class="fw-medium text-secondary">
                  {{ result?.exam_type || 'N/A' }}
                </td>

                <td>
                  <span class="badge bg-light text-dark border px-3 py-1 rounded-pill">
                    {{ result?.exam_year || 'N/A' }}
                  </span>
                </td>

                <td class="text-center">
                  <a
                    :href="`/resultShow?id=${result?.id}`"
                    target="_blank"
                    class="btn btn-primary btn-sm"
                  >
                    PDF
                  </a>
                </td>
              </tr>

              <!-- Empty -->
              <tr v-if="filteredResults.length === 0">
                <td colspan="6" class="text-center py-5 text-muted">No result found!</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- =====================================================
             PAGINATION FOOTER
        ====================================================== -->

        <div
          v-if="filteredTotal > 0"
          class="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mt-4 pt-3 border-top"
        >
          <!-- Showing -->
          <p class="text-muted small mb-0">
            Showing
            <b>{{ showingFrom }}</b>
            to
            <b>{{ showingTo }}</b>
            of
            <b>{{ filteredTotal }}</b>
            result(s)
          </p>

          <!-- Pagination -->
          <nav v-if="totalPages > 1">
            <ul class="pagination pagination-sm mb-0">
              <!-- Previous -->
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <button
                  type="button"
                  class="page-link"
                  @click="previousPage"
                  :disabled="currentPage === 1"
                >
                  Previous
                </button>
              </li>

              <!-- Page Numbers -->
              <li
                v-for="(page, index) in pageNumbers"
                :key="`${page}-${index}`"
                class="page-item"
                :class="{
                  active: page === currentPage,
                  disabled: page === '...',
                }"
              >
                <button
                  v-if="page !== '...'"
                  type="button"
                  class="page-link"
                  @click="goToPage(page)"
                >
                  {{ page }}
                </button>

                <span v-else class="page-link"> ... </span>
              </li>

              <!-- Next -->
              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <button
                  type="button"
                  class="page-link"
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

  <!-- =========================================================
       ADD RESULT MODAL
       TELEPORT TO BODY
  ========================================================== -->

  <Teleport to="body">
    <div
      v-if="isAddModalOpen"
      class="result-modal-overlay"
      role="dialog"
      aria-modal="true"
      @click.self="closeAddModal"
    >
      <div class="result-modal-dialog" @click.stop>
        <div class="result-modal-content">
          <!-- Modal Header -->
          <div class="result-modal-header">
            <h5 class="fw-bold text-dark mb-0">Insert Student Result & Marks</h5>

            <button
              type="button"
              class="btn-close shadow-none"
              @click.stop="closeAddModal"
            ></button>
          </div>

          <!-- Modal Body -->
          <div class="result-modal-body">
            <form @submit.prevent="saveNewResult">
              <!-- =================================================
                   STUDENT / YEAR / EXAM
              ================================================== -->

              <div class="row">
                <!-- Student -->
                <div class="col-md-4 mb-3 position-relative">
                  <label class="form-label small fw-bold text-muted"> Student ID / Name </label>

                  <div class="input-group">
                    <input
                      type="text"
                      class="form-control rounded-3"
                      v-model="studentSearchText"
                      placeholder="Type ID or Name..."
                      @focus="isStudentDropdownOpen = true"
                      @input="isStudentDropdownOpen = true"
                    />

                    <button
                      v-if="studentSearchText"
                      type="button"
                      class="btn btn-outline-secondary"
                      @click="clearStudentSelection"
                    >
                      ✕
                    </button>
                  </div>

                  <!-- Student Dropdown -->
                  <div
                    v-if="isStudentDropdownOpen"
                    class="dropdown-menu show shadow-lg border rounded-3 bg-white position-absolute w-100 mt-1"
                    style="max-height: 220px; overflow-y: auto; z-index: 1060"
                  >
                    <button
                      v-for="student in searchableStudents"
                      :key="student.id"
                      type="button"
                      class="dropdown-item py-2 px-3 border-bottom text-wrap text-start"
                      @click="selectStudent(student)"
                    >
                      <span class="fw-bold text-primary">
                        {{ student.student_id }}
                      </span>

                      -
                      {{ student.full_name }}

                      <small class="text-muted d-block">
                        Class:
                        {{
                          student.class_info?.class_name ||
                          student.class_name ||
                          student.batch_name ||
                          'N/A'
                        }}

                        <span v-if="getStudentGroupName(student)">
                          | Group:
                          {{ getStudentGroupName(student) }}
                        </span>
                      </small>
                    </button>

                    <div
                      v-if="searchableStudents.length === 0"
                      class="p-3 text-muted text-center small"
                    >
                      No student found!
                    </div>
                  </div>
                </div>

                <!-- Exam Year -->
                <div class="col-md-4 mb-3 position-relative">
                  <label class="form-label small fw-bold text-muted"> Exam Year </label>

                  <div class="input-group">
                    <input
                      type="text"
                      class="form-control rounded-3"
                      v-model="yearSearchText"
                      placeholder="Search or select year..."
                      @focus="isYearDropdownOpen = true"
                      @input="isYearDropdownOpen = true"
                    />

                    <button
                      v-if="yearSearchText"
                      type="button"
                      class="btn btn-outline-secondary"
                      @click="clearYearSelection"
                    >
                      ✕
                    </button>
                  </div>

                  <!-- Year Dropdown -->
                  <div
                    v-if="isYearDropdownOpen"
                    class="dropdown-menu show shadow-lg border rounded-3 bg-white position-absolute w-100 mt-1"
                    style="max-height: 220px; overflow-y: auto; z-index: 1060"
                  >
                    <button
                      v-for="exam in searchableYears"
                      :key="exam.id"
                      type="button"
                      class="dropdown-item py-2 px-3 border-bottom text-wrap text-start"
                      @click="selectYear(exam)"
                    >
                      <span class="fw-bold text-warning">
                        {{ exam.examination_year }}
                      </span>
                    </button>

                    <div
                      v-if="searchableYears.length === 0"
                      class="p-3 text-muted text-center small"
                    >
                      No year found!
                    </div>
                  </div>
                </div>

                <!-- Exam Type -->
                <div class="col-md-4 mb-3 position-relative">
                  <label class="form-label small fw-bold text-muted"> Exam Type </label>

                  <div class="input-group">
                    <input
                      type="text"
                      class="form-control rounded-3"
                      v-model="examSearchText"
                      placeholder="Search or select exam type..."
                      @focus="isExamDropdownOpen = true"
                      @input="isExamDropdownOpen = true"
                    />

                    <button
                      v-if="examSearchText"
                      type="button"
                      class="btn btn-outline-secondary"
                      @click="clearExamSelection"
                    >
                      ✕
                    </button>
                  </div>

                  <!-- Exam Dropdown -->
                  <div
                    v-if="isExamDropdownOpen"
                    class="dropdown-menu show shadow-lg border rounded-3 bg-white position-absolute w-100 mt-1"
                    style="max-height: 220px; overflow-y: auto; z-index: 1060"
                  >
                    <button
                      v-for="exam in searchableExaminations"
                      :key="exam.id"
                      type="button"
                      class="dropdown-item py-2 px-3 border-bottom text-wrap text-start"
                      @click="selectExam(exam)"
                    >
                      <span class="fw-bold text-success">
                        {{ exam.examination_type }}
                      </span>
                    </button>

                    <div
                      v-if="searchableExaminations.length === 0"
                      class="p-3 text-muted text-center small"
                    >
                      No examination found!
                    </div>
                  </div>
                </div>
              </div>

              <hr class="my-3 text-muted opacity-25" />

              <!-- =========================================================
                   STUDENT CLASS & GROUP INFO
              ========================================================== -->

              <div v-if="form.student_id && selectedStudent" class="mb-4">
                <div class="card border-0 bg-light rounded-3">
                  <div class="card-body py-3">
                    <div class="row align-items-center">
                      <!-- CLASS -->
                      <div class="col-md-6 mb-2 mb-md-0">
                        <div class="d-flex align-items-center gap-2">
                          <i class="bi bi-mortarboard-fill text-primary fs-5"></i>

                          <div>
                            <small class="text-muted d-block fw-semibold"> Class </small>

                            <span class="fw-bold text-dark">
                              {{
                                selectedStudent.class_info?.class_name ||
                                selectedStudent.class_name ||
                                selectedStudent.batch_name ||
                                'N/A'
                              }}
                            </span>
                          </div>
                        </div>
                      </div>

                      <!-- GROUP -->
                      <div class="col-md-6">
                        <div class="d-flex align-items-center gap-2">
                          <i class="bi bi-people-fill text-success fs-5"></i>

                          <div>
                            <small class="text-muted d-block fw-semibold"> Group </small>

                            <span class="fw-bold text-dark">
                              {{ getStudentGroupName(selectedStudent) }}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- =========================================================
                   SUBJECT MARKS
              ========================================================== -->

              <h6 class="fw-bold text-dark mb-3">Subject Marks</h6>

              <!-- NO STUDENT -->
              <div v-if="!form.student_id" class="alert alert-info">
                <i class="bi bi-info-circle me-2"></i>
                Please select a student first.
              </div>

              <!-- NO SUBJECT -->
              <div v-else-if="currentSubjects.length === 0" class="alert alert-warning">
                <i class="bi bi-exclamation-triangle me-2"></i>
                No subjects are assigned to this student's class/group.
              </div>

              <!-- SUBJECTS -->
              <div v-else>
                <!-- MAIN SUBJECTS -->
                <div v-if="mainSubjects.length" class="mb-4">
                  <div class="d-flex justify-content-between align-items-center mb-3">
                    <h6 class="fw-bold text-primary mb-0">
                      <i class="bi bi-book me-2"></i>
                      Main Subjects
                    </h6>

                    <span class="badge bg-primary-subtle text-primary">
                      {{ mainSubjects.length }} Subjects
                    </span>
                  </div>

                  <div class="row">
                    <div
                      v-for="subject in mainSubjects"
                      :key="subject.unique_key"
                      class="col-md-4 mb-3"
                    >
                      <div class="border rounded-3 p-3 bg-white shadow-sm">
                        <label class="form-label fw-bold mb-2">
                          {{ subject.name }}

                          <span v-if="subject.code" class="text-muted small">
                            ({{ subject.code }})
                          </span>
                        </label>

                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="999.99"
                          class="form-control rounded-3"
                          :value="subject.marks"
                          placeholder="Enter Marks"
                          @input="updateSubjectMarks(subject.unique_key, $event.target.value)"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- ADDITIONAL SUBJECT -->
                <div v-if="additionalSubjects.length" class="mt-4">
                  <div class="d-flex justify-content-between align-items-center mb-3">
                    <h6 class="fw-bold text-success mb-0">
                      <i class="bi bi-plus-circle me-2"></i>
                      Additional Subject
                    </h6>

                    <span class="badge bg-success-subtle text-success">
                      {{ additionalSubjects.length }} Subject
                    </span>
                  </div>

                  <div class="row">
                    <div
                      v-for="subject in additionalSubjects"
                      :key="subject.unique_key"
                      class="col-md-4 mb-3"
                    >
                      <div
                        class="border border-success-subtle rounded-3 p-3 bg-success bg-opacity-10"
                      >
                        <label class="form-label fw-bold mb-2">
                          {{ subject.name }}

                          <span v-if="subject.code" class="text-muted small">
                            ({{ subject.code }})
                          </span>
                        </label>

                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="999.99"
                          class="form-control rounded-3"
                          :value="subject.marks"
                          placeholder="Enter Marks"
                          @input="updateSubjectMarks(subject.unique_key, $event.target.value)"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- =================================================
                   MODAL FOOTER
              ================================================== -->

              <div class="modal-footer border-0 px-0 pb-0 pt-3">
                <button
                  type="button"
                  class="btn btn-outline-secondary rounded-pill px-4"
                  @click="closeAddModal"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  class="btn btn-success rounded-pill px-4 fw-bold shadow-sm"
                  :disabled="isSaving"
                >
                  <span v-if="isSaving"> Saving... </span>

                  <span v-else> Add Result </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import dashPageView from './dashPageView.vue'
import api from '@/services/api'

/**
 * |--------------------------------------------------------------------------
 * | STATE
 * |--------------------------------------------------------------------------
 */

const resultsList = ref([])
const studentsList = ref([])
const examinationsList = ref([])
const currentSubjects = ref([])

const search = ref('')
const isAddModalOpen = ref(false)
const isSaving = ref(false)

/**
 * |--------------------------------------------------------------------------
 * | PAGINATION
 * |--------------------------------------------------------------------------
 */

const currentPage = ref(1)
const perPage = ref(10)
const filteredTotal = ref(0)
const totalPages = ref(1)
const showingFrom = ref(0)
const showingTo = ref(0)

/**
 * |--------------------------------------------------------------------------
 * | SEARCH STATES
 * |--------------------------------------------------------------------------
 */

const studentSearchText = ref('')
const yearSearchText = ref('')
const examSearchText = ref('')

const isStudentDropdownOpen = ref(false)
const isYearDropdownOpen = ref(false)
const isExamDropdownOpen = ref(false)

/**
 * |--------------------------------------------------------------------------
 * | FORM
 * |--------------------------------------------------------------------------
 */

const form = reactive({
  student_id: '',
  exam_year: '',
  exam_type: '',
  subjects: [],
})

/**
 * |--------------------------------------------------------------------------
 * | SELECTED STUDENT
 * |--------------------------------------------------------------------------
 */

const selectedStudent = computed(() => {
  if (!form.student_id) {
    return null
  }

  return studentsList.value.find((student) => student && student.id == form.student_id) || null
})

/**
 * |--------------------------------------------------------------------------
 * | GET STUDENT GROUP NAME
 * |--------------------------------------------------------------------------
 */

const getStudentGroupName = (student) => {
  if (!student) {
    return 'N/A'
  }

  return (
    student.group?.group_name ||
    student.group?.name ||
    student.group_name ||
    student.group?.title ||
    'N/A'
  )
}

/**
 * |--------------------------------------------------------------------------
 * | MAIN SUBJECTS
 * |--------------------------------------------------------------------------
 */

const mainSubjects = computed(() => {
  return currentSubjects.value.filter((subject) => subject && !subject.is_additional)
})

/**
 * |--------------------------------------------------------------------------
 * | ADDITIONAL SUBJECTS
 * |--------------------------------------------------------------------------
 */

const additionalSubjects = computed(() => {
  return currentSubjects.value.filter((subject) => subject && subject.is_additional)
})

/**
 * |--------------------------------------------------------------------------
 * | FETCH RESULTS + STUDENTS
 * |--------------------------------------------------------------------------
 */

const fetchData = async (page = 1) => {
  try {
    const response = await api.get('/results', {
      params: {
        results_page: page,
        students_page: 1,
        per_page: perPage.value,
      },
    })

    /**
     * Result list
     */
    resultsList.value = Array.isArray(response.data.results)
      ? response.data.results.filter((result) => result !== null && typeof result === 'object')
      : []

    /**
     * Student list
     */
    studentsList.value = Array.isArray(response.data.students)
      ? response.data.students.filter((student) => student !== null && typeof student === 'object')
      : []

    /**
     * Result pagination
     */
    const resultPagination = response.data.results_pagination || {}

    currentPage.value = resultPagination.current_page || 1

    totalPages.value = resultPagination.last_page || 1

    filteredTotal.value = resultPagination.total || 0

    showingFrom.value = resultPagination.from || 0

    showingTo.value = resultPagination.to || 0

    console.log('Students:', studentsList.value)
    console.log('Results:', resultsList.value)
    console.log('Result Pagination:', resultPagination)
  } catch (error) {
    console.error('Error fetching result data:', error)
  }
}

/**
 * |--------------------------------------------------------------------------
 * | PAGINATION - GO TO PAGE
 * |--------------------------------------------------------------------------
 */

const goToPage = (page) => {
  if (page < 1 || page > totalPages.value || page === currentPage.value) {
    return
  }

  fetchData(page)
}

/**
 * |--------------------------------------------------------------------------
 * | PAGINATION - PREVIOUS
 * |--------------------------------------------------------------------------
 */

const previousPage = () => {
  if (currentPage.value > 1) {
    fetchData(currentPage.value - 1)
  }
}

/**
 * |--------------------------------------------------------------------------
 * | PAGINATION - NEXT
 * |--------------------------------------------------------------------------
 */

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    fetchData(currentPage.value + 1)
  }
}

/**
 * |--------------------------------------------------------------------------
 * | PAGINATION - PAGE NUMBERS
 * |--------------------------------------------------------------------------
 */

const pageNumbers = computed(() => {
  const pages = []

  const total = totalPages.value
  const current = currentPage.value

  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }

    return pages
  }

  pages.push(1)

  if (current > 4) {
    pages.push('...')
  }

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  if (current < total - 3) {
    pages.push('...')
  }

  pages.push(total)

  return pages
})

/**
 * |--------------------------------------------------------------------------
 * | FETCH EXAMINATIONS
 * |--------------------------------------------------------------------------
 */

const fetchExaminations = async () => {
  try {
    const response = await api.get('/examinations')

    if (response.data.status) {
      examinationsList.value = Array.isArray(response.data.data)
        ? response.data.data.filter((exam) => exam !== null && typeof exam === 'object')
        : []
    } else {
      examinationsList.value = []
    }
  } catch (error) {
    console.error('Error fetching examinations:', error)

    examinationsList.value = []
  }
}

/**
 * |--------------------------------------------------------------------------
 * | SEARCHABLE STUDENTS
 * |--------------------------------------------------------------------------
 */

const searchableStudents = computed(() => {
  const text = studentSearchText.value.toLowerCase().trim()

  const validStudents = studentsList.value.filter(
    (student) => student !== null && typeof student === 'object',
  )

  if (!text) {
    return validStudents.slice(0, 50)
  }

  return validStudents.filter((student) => {
    const id = student.student_id?.toString().toLowerCase() || ''

    const name = student.full_name?.toString().toLowerCase() || ''

    const group = getStudentGroupName(student)?.toString().toLowerCase() || ''

    return id.includes(text) || name.includes(text) || group.includes(text)
  })
})

/**
 * |--------------------------------------------------------------------------
 * | SEARCHABLE EXAMINATIONS
 * |--------------------------------------------------------------------------
 */

const searchableExaminations = computed(() => {
  const text = examSearchText.value.toLowerCase().trim()

  let examinations = examinationsList.value.filter(
    (exam) => exam !== null && typeof exam === 'object',
  )

  /**
   * Selected student's branch অনুযায়ী
   */
  if (selectedStudent.value?.branch_id) {
    examinations = examinations.filter(
      (exam) => Number(exam.branch_id) === Number(selectedStudent.value.branch_id),
    )
  }

  if (!text) {
    return examinations.slice(0, 50)
  }

  return examinations.filter((exam) => {
    const type = exam.examination_type?.toString().toLowerCase() || ''

    return type.includes(text)
  })
})

/**
 * |--------------------------------------------------------------------------
 * | SEARCHABLE YEARS
 * |--------------------------------------------------------------------------
 */

const searchableYears = computed(() => {
  const map = new Map()

  let examinations = examinationsList.value.filter(
    (exam) => exam !== null && typeof exam === 'object',
  )

  /**
   * Selected student's branch অনুযায়ী
   */
  if (selectedStudent.value?.branch_id) {
    examinations = examinations.filter(
      (exam) => Number(exam.branch_id) === Number(selectedStudent.value.branch_id),
    )
  }

  examinations.forEach((exam) => {
    if (exam.examination_year && !map.has(exam.examination_year)) {
      map.set(exam.examination_year, exam)
    }
  })

  const years = Array.from(map.values())

  const text = yearSearchText.value.toLowerCase().trim()

  if (!text) {
    return years.slice(0, 50)
  }

  return years.filter((exam) => {
    const year = exam.examination_year?.toString().toLowerCase() || ''

    return year.includes(text)
  })
})

/**
 * |--------------------------------------------------------------------------
 * | SELECT STUDENT
 * |--------------------------------------------------------------------------
 */

const selectStudent = (student) => {
  if (!student) {
    return
  }

  form.student_id = student.id

  studentSearchText.value = `${student.student_id} - ${student.full_name}`

  isStudentDropdownOpen.value = false

  /**
   * Student change হলে পুরোনো exam/year selection clear
   */
  form.exam_year = ''
  form.exam_type = ''

  yearSearchText.value = ''
  examSearchText.value = ''

  loadStudentSubjects()
}

/**
 * |--------------------------------------------------------------------------
 * | CLEAR STUDENT
 * |--------------------------------------------------------------------------
 */

const clearStudentSelection = () => {
  form.student_id = ''

  studentSearchText.value = ''

  form.exam_year = ''
  form.exam_type = ''

  yearSearchText.value = ''
  examSearchText.value = ''

  currentSubjects.value = []
  form.subjects = []

  isStudentDropdownOpen.value = true
}

/**
 * |--------------------------------------------------------------------------
 * | LOAD STUDENT SUBJECTS
 * |--------------------------------------------------------------------------
 */

const loadStudentSubjects = () => {
  const student = studentsList.value.find((item) => item && item.id == form.student_id)

  if (!student) {
    currentSubjects.value = []
    form.subjects = []

    return
  }

  console.log('====================================')
  console.log('SELECTED STUDENT:', student)
  console.log('STUDENT BRANCH:', student.branch_id)
  console.log('CLASS INFO:', student.class_info)
  console.log('GROUP:', student.group)
  console.log('GROUP NAME:', getStudentGroupName(student))
  console.log('GROUP SUBJECTS:', student.group_subjects)
  console.log('MAPPED GROUP SUBJECTS:', student.mapped_group_subjects)
  console.log('====================================')

  /**
   * ==========================================================
   * 1. CLASS SUBJECTS
   * ==========================================================
   */

  let classSubjects = []

  if (student.class_info && Array.isArray(student.class_info.subjects)) {
    classSubjects = student.class_info.subjects
  } else if (Array.isArray(student.subjects)) {
    classSubjects = student.subjects
  } else if (Array.isArray(student.class_subjects)) {
    classSubjects = student.class_subjects
  }

  /**
   * ==========================================================
   * 2. EXISTING GROUP SUBJECTS
   * ==========================================================
   */

  let groupSubjects = []

  if (Array.isArray(student.group_subjects)) {
    groupSubjects = student.group_subjects
  }

  /**
   * ==========================================================
   * 3. GROUP SUBJECT MAPPINGS
   * ==========================================================
   */

  let mappedGroupSubjects = []

  if (Array.isArray(student.mapped_group_subjects)) {
    mappedGroupSubjects = student.mapped_group_subjects
  }

  /**
   * ==========================================================
   * 4. MAPPED SUBJECT ID SET
   * ==========================================================
   */

  const mappedSubjectIds = new Set(
    mappedGroupSubjects
      .filter((subject) => subject !== null && typeof subject === 'object')
      .map((subject) => Number(subject.id))
      .filter((id) => !Number.isNaN(id)),
  )

  /**
   * ==========================================================
   * 5. GROUP SUBJECT ID SET
   * ==========================================================
   */

  const additionalSubjectIds = new Set(
    groupSubjects
      .filter((subject) => subject !== null && typeof subject === 'object')
      .map((subject) => Number(subject.id))
      .filter((id) => !Number.isNaN(id)),
  )

  /**
   * ==========================================================
   * 6. NORMALIZE CLASS SUBJECTS
   * ==========================================================
   */

  const normalizedClassSubjects = classSubjects
    .filter((subject) => subject !== null && typeof subject === 'object')
    .filter((subject) => {
      const subjectId = Number(subject.id)

      if (additionalSubjectIds.has(subjectId)) {
        return false
      }

      return true
    })
    .map((subject) => {
      return {
        unique_key: `main_${subject.id}`,

        id: subject.id,

        name: subject.name || subject.subject_name || subject.subject?.name || 'Unknown Subject',

        code: subject.code || subject.subject_code || subject.subject?.code || null,

        is_additional: false,

        marks: '',
      }
    })

  /**
   * ==========================================================
   * 7. NORMALIZE GROUP MAPPED SUBJECTS
   * ==========================================================
   */

  const normalizedMappedGroupSubjects = mappedGroupSubjects
    .filter((subject) => subject !== null && typeof subject === 'object')
    .filter((subject) => {
      const subjectId = Number(subject.id)

      return !Number.isNaN(subjectId) && !additionalSubjectIds.has(subjectId)
    })
    .map((subject) => {
      return {
        unique_key: `mapped_group_${subject.id}`,

        id: subject.id,

        name: subject.name || subject.subject_name || subject.subject?.name || 'Unknown Subject',

        code: subject.code || subject.subject_code || subject.subject?.code || null,

        is_additional: false,

        marks: '',
      }
    })

  /**
   * ==========================================================
   * 8. NORMALIZE EXISTING GROUP SUBJECTS
   * ==========================================================
   */

  const normalizedGroupSubjects = groupSubjects
    .filter((subject) => subject !== null && typeof subject === 'object')
    .map((subject) => {
      return {
        unique_key: `group_${subject.id}`,

        id: subject.id,

        name: subject.name || subject.subject_name || subject.subject?.name || 'Unknown Subject',

        code: subject.code || subject.subject_code || subject.subject?.code || null,

        is_additional:
          subject.is_additional === true ||
          subject.is_additional === 1 ||
          subject.is_additional === '1',

        marks: '',
      }
    })

  /**
   * ==========================================================
   * 9. MERGE SUBJECTS
   * ==========================================================
   */

  const mergedSubjects = [
    ...normalizedClassSubjects,
    ...normalizedMappedGroupSubjects,
    ...normalizedGroupSubjects,
  ]

  /**
   * ==========================================================
   * 10. REMOVE DUPLICATES
   * ==========================================================
   */

  const subjectMap = new Map()

  mergedSubjects.forEach((subject) => {
    if (!subject) {
      return
    }

    const subjectId = Number(subject.id)

    const existing = subjectMap.get(subjectId)

    if (!existing) {
      subjectMap.set(subjectId, subject)

      return
    }

    if (subject.is_additional && !existing.is_additional) {
      subjectMap.set(subjectId, subject)
    }
  })

  /**
   * ==========================================================
   * 11. FINAL SUBJECTS
   * ==========================================================
   */

  currentSubjects.value = Array.from(subjectMap.values())

  console.log('FINAL CURRENT SUBJECTS:', currentSubjects.value)

  console.log('MAIN SUBJECTS:', mainSubjects.value)

  console.log('ADDITIONAL SUBJECTS:', additionalSubjects.value)

  /**
   * ==========================================================
   * 12. SYNC FORM
   * ==========================================================
   */

  syncFormSubjects()
}

/**
 * |--------------------------------------------------------------------------
 * | UPDATE SUBJECT MARKS
 * |--------------------------------------------------------------------------
 */

const updateSubjectMarks = (subjectKey, marks) => {
  const subject = currentSubjects.value.find((item) => item && item.unique_key === subjectKey)

  if (!subject) {
    return
  }

  subject.marks = marks

  syncFormSubjects()
}

/**
 * |--------------------------------------------------------------------------
 * | SYNC FORM SUBJECTS
 * |--------------------------------------------------------------------------
 */

const syncFormSubjects = () => {
  form.subjects = currentSubjects.value
    .filter((subject) => subject !== null && typeof subject === 'object')
    .map((subject) => ({
      subject_id: subject.id,

      marks: subject.marks === '' || subject.marks === null ? null : Number(subject.marks),

      is_additional: subject.is_additional,
    }))
}

/**
 * |--------------------------------------------------------------------------
 * | SELECT EXAM
 * |--------------------------------------------------------------------------
 */

const selectExam = (exam) => {
  if (!exam) {
    return
  }

  form.exam_type = exam.examination_type

  examSearchText.value = exam.examination_type

  isExamDropdownOpen.value = false
}

/**
 * |--------------------------------------------------------------------------
 * | CLEAR EXAM
 * |--------------------------------------------------------------------------
 */

const clearExamSelection = () => {
  form.exam_type = ''

  examSearchText.value = ''

  isExamDropdownOpen.value = true
}

/**
 * |--------------------------------------------------------------------------
 * | SELECT YEAR
 * |--------------------------------------------------------------------------
 */

const selectYear = (exam) => {
  if (!exam) {
    return
  }

  form.exam_year = exam.examination_year

  yearSearchText.value = exam.examination_year

  isYearDropdownOpen.value = false
}

/**
 * |--------------------------------------------------------------------------
 * | CLEAR YEAR
 * |--------------------------------------------------------------------------
 */

const clearYearSelection = () => {
  form.exam_year = ''

  yearSearchText.value = ''

  isYearDropdownOpen.value = true
}

/**
 * |--------------------------------------------------------------------------
 * | CLOSE MODAL
 * |--------------------------------------------------------------------------
 */

const closeAddModal = () => {
  isAddModalOpen.value = false

  isStudentDropdownOpen.value = false
  isYearDropdownOpen.value = false
  isExamDropdownOpen.value = false
}

/**
 * |--------------------------------------------------------------------------
 * | OPEN MODAL
 * |--------------------------------------------------------------------------
 */

const openAddModal = () => {
  console.log('ADD RESULT BUTTON CLICKED')

  form.student_id = ''
  form.exam_year = ''
  form.exam_type = ''
  form.subjects = []

  studentSearchText.value = ''
  yearSearchText.value = ''
  examSearchText.value = ''

  currentSubjects.value = []

  isStudentDropdownOpen.value = false
  isYearDropdownOpen.value = false
  isExamDropdownOpen.value = false

  isAddModalOpen.value = true

  console.log('isAddModalOpen:', isAddModalOpen.value)
}

/**
 * |--------------------------------------------------------------------------
 * | EXTRACT CREATED RESULT
 * |--------------------------------------------------------------------------
 *
 * Backend response-এর structure যেভাবেই আসুক,
 * নতুন result object খুঁজে বের করার চেষ্টা করবে।
 */

const extractCreatedResult = (data) => {
  if (!data || typeof data !== 'object') {
    return null
  }

  const candidates = [data.data, data.result, data.result_data, data.resultData]

  for (const candidate of candidates) {
    /**
     * Direct object
     */
    if (candidate && typeof candidate === 'object' && !Array.isArray(candidate) && candidate.id) {
      return candidate
    }

    /**
     * Array-এর মধ্যে result
     */
    if (Array.isArray(candidate)) {
      const found = candidate.find((item) => item && typeof item === 'object' && item.id)

      if (found) {
        return found
      }
    }
  }

  /**
   * যদি response নিজেই result object হয়
   */
  if (data.id) {
    return data
  }

  return null
}

/**
 * |--------------------------------------------------------------------------
 * | SAVE RESULT
 * |--------------------------------------------------------------------------
 */

const saveNewResult = async () => {
  if (isSaving.value) {
    return
  }

  if (!form.student_id) {
    alert('Please select a student.')
    return
  }

  if (!form.exam_year) {
    alert('Please select exam year.')
    return
  }

  if (!form.exam_type) {
    alert('Please select examination.')
    return
  }

  if (!form.subjects || form.subjects.length === 0) {
    alert('Please enter marks for at least one subject.')
    return
  }

  try {
    isSaving.value = true

    const payload = {
      student_id: form.student_id,

      exam_year: form.exam_year,

      exam_type: form.exam_type,

      subjects: form.subjects.map((subject) => ({
        subject_id: subject.subject_id,

        marks: subject.marks,
      })),
    }

    console.log('RESULT SAVE PAYLOAD:', payload)

    /**
     * ==========================================================
     * CREATE RESULT
     * ==========================================================
     */

    const response = await api.post('/results', payload)

    console.log('RESULT SAVE RESPONSE:', response.data)

    if (response.data.status) {
      /**
       * ========================================================
       * নতুন Result response থেকে বের করি
       * ========================================================
       */

      const createdResult = extractCreatedResult(response.data)

      console.log('CREATED RESULT FROM RESPONSE:', createdResult)

      /**
       * Search clear
       */
      search.value = ''

      /**
       * ========================================================
       * প্রথমে backend থেকে fresh data আনি
       * ========================================================
       */

      await fetchData(1)

      /**
       * ========================================================
       * IMPORTANT FIX
       *
       * Backend-এর pagination/order-এর কারণে newly created
       * result page-1 এ না থাকলে manually list-এর শুরুতে
       * বসিয়ে দিচ্ছি।
       * ========================================================
       */

      if (createdResult && createdResult.id) {
        const alreadyExists = resultsList.value.some(
          (result) => result && result.id == createdResult.id,
        )

        if (!alreadyExists) {
          /**
           * Student relation response-এ না থাকলে
           * selectedStudent থেকে সেট করার চেষ্টা।
           */
          const resultToInsert = {
            ...createdResult,

            student: createdResult.student || selectedStudent.value || null,
          }

          resultsList.value = [resultToInsert, ...resultsList.value]

          /**
           * Pagination total update
           */
          filteredTotal.value = Number(filteredTotal.value || 0) + 1

          /**
           * New result এখন page-1-এর প্রথম item
           */
          currentPage.value = 1

          showingFrom.value = 1

          showingTo.value = Math.min(resultsList.value.length, perPage.value)

          /**
           * Total pages
           */
          totalPages.value = Math.max(1, Math.ceil(filteredTotal.value / perPage.value))
        }
      }

      /**
       * Modal close
       */
      closeAddModal()

      alert(response.data.message || 'Result saved successfully.')
    } else {
      alert(response.data.message || 'Failed to save result.')
    }
  } catch (error) {
    console.error('Error saving result:', error)

    console.error('Response:', error.response?.data)

    alert(error.response?.data?.message || 'Failed to save result. Please try again.')
  } finally {
    isSaving.value = false
  }
}

/**
 * |--------------------------------------------------------------------------
 * | FILTER RESULTS
 * |--------------------------------------------------------------------------
 */

const filteredResults = computed(() => {
  const keyword = search.value.toLowerCase().trim()

  const validResults = resultsList.value.filter(
    (result) => result !== null && typeof result === 'object',
  )

  if (!keyword) {
    return validResults
  }

  return validResults.filter((result) => {
    const studentId = result.student?.student_id?.toString().toLowerCase() || ''

    const studentName = result.student?.full_name?.toString().toLowerCase() || ''

    const examType = result.exam_type?.toString().toLowerCase() || ''

    const examYear = result.exam_year?.toString().toLowerCase() || ''

    return (
      studentId.includes(keyword) ||
      studentName.includes(keyword) ||
      examType.includes(keyword) ||
      examYear.includes(keyword)
    )
  })
})

/**
 * |--------------------------------------------------------------------------
 * | GRADE POINT
 * |--------------------------------------------------------------------------
 */

const getPoint = (marks) => {
  if (marks === null || marks === undefined || marks === '') {
    return null
  }

  const m = Number(marks)

  if (m >= 80) return 5.0
  if (m >= 70) return 4.0
  if (m >= 60) return 3.5
  if (m >= 50) return 3.0
  if (m >= 40) return 2.0
  if (m >= 33) return 1.0

  return 0.0
}

/**
 * |--------------------------------------------------------------------------
 * | CALCULATE RESULT
 * |--------------------------------------------------------------------------
 */

const calculateResultDetails = (result) => {
  if (!result) {
    return {
      gpa: 0,
      status: 'Fail',
    }
  }

  const subjects = result.result_subjects || result.resultSubjects || []

  let totalPoints = 0
  let subjectCount = 0
  let hasFailed = false

  subjects
    .filter((resultSubject) => resultSubject !== null && typeof resultSubject === 'object')
    .forEach((resultSubject) => {
      const marks = resultSubject.marks

      if (marks === null || marks === undefined) {
        return
      }

      const point = getPoint(marks)

      if (point === null) {
        return
      }

      totalPoints += point

      subjectCount++

      if (point === 0) {
        hasFailed = true
      }
    })

  if (subjectCount === 0 || hasFailed) {
    return {
      gpa: 0,
      status: 'Fail',
    }
  }

  const gpa = Math.min(5, totalPoints / subjectCount)

  return {
    gpa: Number(gpa.toFixed(2)),
    status: 'Pass',
  }
}

/**
 * |--------------------------------------------------------------------------
 * | DASHBOARD COUNTS
 * |--------------------------------------------------------------------------
 */

const totalStudents = computed(() => {
  return filteredTotal.value
})

const publishedResults = computed(() => {
  return filteredTotal.value
})

const passRate = computed(() => {
  const validResults = resultsList.value.filter(
    (result) => result !== null && typeof result === 'object',
  )

  if (!validResults.length) {
    return '0.0'
  }

  const passed = validResults.filter(
    (result) => calculateResultDetails(result).status === 'Pass',
  ).length

  return ((passed / validResults.length) * 100).toFixed(1)
})

/**
 * |--------------------------------------------------------------------------
 * | TOTAL GPA 5.00
 * |--------------------------------------------------------------------------
 */

const totalGpaFive = computed(() => {
  const validResults = resultsList.value.filter(
    (result) => result !== null && typeof result === 'object',
  )

  return validResults.filter((result) => {
    const details = calculateResultDetails(result)

    const gpa = Number(details.gpa)

    return details.status === 'Pass' && Number.isFinite(gpa) && gpa >= 5
  }).length
})

/**
 * |--------------------------------------------------------------------------
 * | CLOSE DROPDOWNS
 * |--------------------------------------------------------------------------
 */

const closeDropdowns = () => {
  isStudentDropdownOpen.value = false
  isYearDropdownOpen.value = false
  isExamDropdownOpen.value = false
}

/**
 * |--------------------------------------------------------------------------
 * | ON MOUNT
 * |--------------------------------------------------------------------------
 */

onMounted(async () => {
  await Promise.all([fetchData(1), fetchExaminations()])
})
</script>

<style scoped>
.result-page-wrapper {
  background-color: #f8f9fa;
  min-height: 100vh;
  font-family: Arial, sans-serif;
  width: 86%;
  margin-left: 259px;
}

.fs-7 {
  font-size: 0.75rem;
  letter-spacing: 0.5px;
}

.card {
  transition: all 0.2s ease-in-out;
}

.table td,
.table th {
  vertical-align: middle;
}

.dropdown-menu {
  display: block;
}

.icon-box {
  min-width: 48px;
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}

/* =========================================================
   ADD RESULT BUTTON
========================================================= */

.result-add-btn {
  position: relative;
  z-index: 10;
  cursor: pointer;
}

/* =========================================================
   RESULT INSERT MODAL
   Completely independent from Bootstrap modal CSS
========================================================= */

.result-modal-overlay {
  position: fixed !important;
  inset: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  background: rgba(0, 0, 0, 0.55);
  z-index: 2147483647 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 20px;
  overflow-x: hidden;
  overflow-y: auto;
}

.result-modal-dialog {
  position: relative !important;
  width: 100%;
  max-width: 950px;
  margin: 30px auto;
  z-index: 2147483647 !important;
  pointer-events: auto !important;
}

.result-modal-content {
  position: relative !important;
  width: 100%;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 25px 70px rgba(0, 0, 0, 0.35);
  overflow: visible;
  z-index: 2147483647 !important;
  pointer-events: auto !important;
}

.result-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #eeeeee;
}

.result-modal-body {
  padding: 24px;
  max-height: calc(100vh - 180px);
  overflow-y: auto;
}

/* Modal footer */

.result-modal-body .modal-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

/* Prevent Bootstrap modal rules from interfering */

.result-modal-overlay .modal,
.result-modal-overlay .fade,
.result-modal-overlay .show,
.result-modal-overlay .d-block {
  display: block;
}

/* =========================================================
   RESPONSIVE
========================================================= */

@media (max-width: 992px) {
  .result-page-wrapper {
    width: 100% !important;
    margin-left: 0 !important;
    padding-left: 15px;
    padding-right: 15px;
  }

  .result-modal-dialog {
    max-width: 95%;
  }
}

@media (max-width: 768px) {
  .search-box {
    width: 100% !important;
  }

  .result-modal-overlay {
    align-items: flex-start !important;
    padding: 10px;
  }

  .result-modal-dialog {
    max-width: 100%;
    margin: 10px auto;
  }

  .result-modal-header {
    padding: 16px;
  }

  .result-modal-body {
    padding: 16px;
    max-height: calc(100vh - 120px);
  }
}
</style>
