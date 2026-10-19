<template>
  <RouterView />
  <dashPageView />

  <div class="result-page-wrapper py-4">
    <div class="container-fluid px-4">
      <!-- SUMMARY CARDS -->
      <div class="row g-4 mb-4">
        <div class="col-md-3 col-sm-6">
          <div class="card border-0 shadow-sm rounded-4 p-3 border-start border-success border-4">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <p class="text-muted mb-1 small fw-bold">Exam Participants</p>
                <h4 class="fw-bold text-dark mb-0">{{ totalStudents }}</h4>
              </div>
              <div class="icon-box bg-success-subtle text-success rounded-3 p-3">🎓</div>
            </div>
          </div>
        </div>

        <div class="col-md-3 col-sm-6">
          <div class="card border-0 shadow-sm rounded-4 p-3 border-start border-primary border-4">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <p class="text-muted mb-1 small fw-bold">Published Results</p>
                <h4 class="fw-bold text-dark mb-0">{{ publishedResults }}</h4>
              </div>
              <div class="icon-box bg-primary-subtle text-primary rounded-3 p-3">📄</div>
            </div>
          </div>
        </div>

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

        <div class="col-md-3 col-sm-6">
          <div class="card border-0 shadow-sm rounded-4 p-3 border-start border-info border-4">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <p class="text-muted mb-1 small fw-bold">Total GPA 5.00</p>
                <h4 class="fw-bold text-dark mb-0">{{ totalGpaFive }}</h4>
              </div>
              <div class="icon-box bg-info-subtle text-info rounded-3 p-3">⭐</div>
            </div>
          </div>
        </div>
      </div>

      <!-- RESULT LIST -->
      <div class="card border-0 shadow-sm rounded-4 p-4">
        <div
          class="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mb-4"
        >
          <h4 class="fw-bold text-dark mb-0">Student Result List</h4>

          <div class="d-flex align-items-center gap-3 flex-wrap">
            <div class="search-box position-relative" style="width: 260px">
              <input
                type="text"
                class="form-control"
                v-model="search"
                placeholder="Search by Student ID or Name..."
                @input="currentPage = 1"
              />
              <span class="position-absolute top-50 end-0 translate-middle-y me-3 text-muted">
                🔍
              </span>
            </div>

            <button
              type="button"
              class="btn btn-success btn-sm px-4 py-2 fw-bold rounded-pill shadow-sm d-flex align-items-center gap-2 text-nowrap result-add-btn"
              @click.stop.prevent="openAddModal"
            >
              <span>+ Add Result</span>
            </button>
          </div>
        </div>

        <!-- RESULT TABLE -->
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

                <td class="text-center text-nowrap">
                  <button
                    v-if="!isResultEntry"
                    type="button"
                    class="btn btn-warning btn-sm me-1"
                    @click="openEditModal(result)"
                  >
                    Edit
                  </button>

                  <a
                    :href="`/resultShow?id=${result?.id}`"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="btn btn-primary btn-sm"
                  >
                    PDF
                  </a>
                </td>
              </tr>

              <tr v-if="filteredResults.length === 0">
                <td colspan="6" class="text-center py-5 text-muted">No result found!</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- PAGINATION -->
        <div
          v-if="filteredTotal > 0"
          class="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mt-4 pt-3 border-top"
        >
          <p class="text-muted small mb-0">
            Showing <b>{{ showingFrom }}</b> to <b>{{ showingTo }}</b> of
            <b>{{ filteredTotal }}</b> result(s)
          </p>

          <nav v-if="totalPages > 1">
            <ul class="pagination pagination-sm mb-0">
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

              <li
                v-for="(page, index) in pageNumbers"
                :key="`${page}-${index}`"
                class="page-item"
                :class="{ active: page === currentPage, disabled: page === '...' }"
              >
                <button
                  v-if="page !== '...'"
                  type="button"
                  class="page-link"
                  @click="goToPage(page)"
                >
                  {{ page }}
                </button>
                <span v-else class="page-link">...</span>
              </li>

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

  <!-- ADD / EDIT RESULT MODAL -->
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
          <div class="result-modal-header">
            <h5 class="fw-bold text-dark mb-0">
              {{ isEditMode ? 'Edit Student Result & Marks' : 'Insert Student Result & Marks' }}
            </h5>

            <button
              type="button"
              class="btn-close shadow-none"
              aria-label="Close"
              @click.stop="closeAddModal"
            ></button>
          </div>

          <div class="result-modal-body">
            <form @submit.prevent="saveNewResult">
              <!-- STUDENT SELECTION -->
              <div class="row">
                <div class="col-md-3 mb-3 position-relative">
                  <label class="form-label small fw-bold text-muted">Student ID / Name</label>

                  <div class="input-group">
                    <input
                      type="text"
                      class="form-control rounded-3"
                      v-model="studentSearchText"
                      placeholder="Type ID or Name..."
                      @focus="isStudentDropdownOpen = !isEditMode"
                      @input="isStudentDropdownOpen = true"
                      :readonly="isEditMode"
                      required
                    />

                    <button
                      v-if="studentSearchText && !isEditMode"
                      type="button"
                      class="btn btn-outline-secondary"
                      @click="clearStudentSelection"
                    >
                      ✕
                    </button>
                  </div>

                  <div
                    v-if="isStudentDropdownOpen && !isEditMode"
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
                      <span class="fw-bold text-primary">{{ student.student_id }}</span>
                      - {{ student.full_name }}

                      <small class="text-muted d-block">
                        Current Class:
                        {{
                          student.class_info?.class_name ||
                          student.class_name ||
                          student.batch_name ||
                          'N/A'
                        }}
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

                <!-- ACADEMIC SESSION -->
                <div class="col-md-3 mb-3">
                  <label class="form-label small fw-bold text-muted">Academic Session</label>

                  <select
                    class="form-select rounded-3"
                    v-model="form.student_session_id"
                    @change="selectStudentSession"
                    :disabled="!selectedStudent || isEditMode"
                    required
                  >
                    <option value="">Select Session</option>
                    <option
                      v-for="session in studentSessions"
                      :key="session.id"
                      :value="String(session.id)"
                    >
                      {{ getSessionLabel(session) }}
                    </option>
                  </select>

                  <small v-if="selectedStudent && studentSessions.length === 0" class="text-danger">
                    No academic session found.
                  </small>
                </div>

                <!-- EXAM YEAR -->
                <div class="col-md-3 mb-3 position-relative">
                  <label class="form-label small fw-bold text-muted">Exam Year</label>

                  <div class="input-group">
                    <input
                      type="text"
                      class="form-control rounded-3"
                      v-model="yearSearchText"
                      placeholder="Select session first..."
                      readonly
                      @focus="isYearDropdownOpen = !isEditMode"
                    />

                    <button
                      v-if="yearSearchText && !isEditMode"
                      type="button"
                      class="btn btn-outline-secondary"
                      @click="clearYearSelection"
                    >
                      ✕
                    </button>
                  </div>

                  <div
                    v-if="isYearDropdownOpen && !isEditMode"
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
                      <span class="fw-bold text-warning">{{ exam.examination_year }}</span>
                    </button>

                    <div
                      v-if="searchableYears.length === 0"
                      class="p-3 text-muted text-center small"
                    >
                      No examination year found for this session.
                    </div>
                  </div>
                </div>

                <!-- EXAM TYPE -->
                <div class="col-md-3 mb-3 position-relative">
                  <label class="form-label small fw-bold text-muted">Exam Type</label>

                  <div class="input-group">
                    <input
                      type="text"
                      class="form-control rounded-3"
                      v-model="examSearchText"
                      placeholder="Select exam type..."
                      @focus="isExamDropdownOpen = !isEditMode"
                      @input="isExamDropdownOpen = true"
                      :disabled="!form.student_session_id || isEditMode"
                      required
                    />

                    <button
                      v-if="examSearchText && !isEditMode"
                      type="button"
                      class="btn btn-outline-secondary"
                      @click="clearExamSelection"
                    >
                      ✕
                    </button>
                  </div>

                  <div
                    v-if="isExamDropdownOpen && !isEditMode"
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
                      <span class="fw-bold text-success">{{ exam.examination_type }}</span>
                    </button>

                    <div
                      v-if="searchableExaminations.length === 0"
                      class="p-3 text-muted text-center small"
                    >
                      No examination found for this session.
                    </div>
                  </div>
                </div>
              </div>

              <hr class="my-3 text-muted opacity-25" />

              <!-- SELECTED SESSION INFORMATION -->
              <div v-if="form.student_id && selectedStudent && selectedStudentSession" class="mb-4">
                <div class="card border-0 bg-light rounded-3">
                  <div class="card-body py-3">
                    <div class="row">
                      <div class="col-md-4 mb-3">
                        <small class="text-muted d-block fw-semibold">Academic Session</small>
                        <span class="fw-bold text-dark">
                          {{
                            selectedStudentSession.academic_session?.name ||
                            selectedStudentSession.academicSession?.name ||
                            'N/A'
                          }}
                        </span>
                      </div>

                      <div class="col-md-4 mb-3">
                        <small class="text-muted d-block fw-semibold">Class</small>
                        <span class="fw-bold text-dark">
                          {{
                            selectedStudentSession.class_info?.class_name ||
                            selectedStudentSession.class_info?.name ||
                            'N/A'
                          }}
                        </span>
                      </div>

                      <div class="col-md-4 mb-3">
                        <small class="text-muted d-block fw-semibold">Group</small>
                        <span class="fw-bold text-dark">
                          {{
                            selectedStudentSession.class_group?.group_name ||
                            selectedStudentSession.class_group?.name ||
                            'N/A'
                          }}
                        </span>
                      </div>

                      <div class="col-md-6">
                        <small class="text-muted d-block fw-semibold">Section</small>
                        <span class="fw-bold text-dark">
                          {{
                            selectedStudentSession.section?.name ||
                            selectedStudentSession.section?.section_name ||
                            'N/A'
                          }}
                        </span>
                      </div>

                      <div class="col-md-6">
                        <small class="text-muted d-block fw-semibold">Shift</small>
                        <span class="fw-bold text-dark">
                          {{
                            selectedStudentSession.shift?.name ||
                            selectedStudentSession.shift?.shift_name ||
                            'N/A'
                          }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- SUBJECT MARKS -->
              <h6 class="fw-bold text-dark mb-3">Subject Marks</h6>

              <div v-if="!form.student_id" class="alert alert-info">
                <i class="bi bi-info-circle me-2"></i>
                Please select a student first.
              </div>

              <div v-else-if="!form.student_session_id" class="alert alert-info">
                <i class="bi bi-info-circle me-2"></i>
                Please select the student's academic session first.
              </div>

              <div v-else-if="currentSubjects.length === 0" class="alert alert-warning">
                <i class="bi bi-exclamation-triangle me-2"></i>
                No subjects are assigned to this session's class/group.
              </div>

              <div v-else>
                <!-- MAIN SUBJECTS -->
                <div v-if="mainSubjects.length" class="mb-4">
                  <div class="d-flex justify-content-between align-items-center mb-3">
                    <h6 class="fw-bold text-primary mb-0">
                      <i class="bi bi-book me-2"></i>Main Subjects
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
                          required
                          class="form-control rounded-3"
                          :value="subject.marks"
                          placeholder="Enter Marks"
                          @input="updateSubjectMarks(subject.unique_key, $event.target.value)"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- ADDITIONAL SUBJECTS -->
                <div v-if="additionalSubjects.length" class="mt-4">
                  <div class="d-flex justify-content-between align-items-center mb-3">
                    <h6 class="fw-bold text-success mb-0">
                      <i class="bi bi-plus-circle me-2"></i>Additional Subject
                    </h6>
                    <span class="badge bg-success-subtle text-success">
                      {{ additionalSubjects.length }} Subjects
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
                          required
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

              <!-- MODAL FOOTER -->
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
                  :disabled="isSaving || currentSubjects.length === 0"
                >
                  <span v-if="isSaving">
                    {{ isEditMode ? 'Updating...' : 'Saving...' }}
                  </span>
                  <span v-else>
                    {{ isEditMode ? 'Update Result' : 'Add Result' }}
                  </span>
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

const resultsList = ref([])
const studentsList = ref([])
const examinationsList = ref([])
const currentSubjects = ref([])

const search = ref('')
const isAddModalOpen = ref(false)
const isSaving = ref(false)
const isEditMode = ref(false)
const editingResultId = ref(null)

// Result Entry can create results but cannot edit existing results.
const userRole = localStorage.getItem('role')
const isResultEntry = userRole === 'Result Entry'

const currentPage = ref(1)
const perPage = ref(10)
const filteredTotal = ref(0)
const totalPages = ref(1)
const showingFrom = ref(0)
const showingTo = ref(0)

const studentSearchText = ref('')
const yearSearchText = ref('')
const examSearchText = ref('')

const isStudentDropdownOpen = ref(false)
const isYearDropdownOpen = ref(false)
const isExamDropdownOpen = ref(false)

const form = reactive({
  student_id: '',
  student_session_id: '',
  exam_year: '',
  exam_type: '',
  subjects: [],
})

const selectedStudent = computed(() => {
  if (!form.student_id) return null

  return (
    studentsList.value.find(
      (student) => student && String(student.id) === String(form.student_id),
    ) || null
  )
})

const studentSessions = computed(() => {
  const sessions = selectedStudent.value?.student_sessions
  return Array.isArray(sessions) ? sessions : []
})

const selectedStudentSession = computed(() => {
  if (!form.student_session_id) return null

  return (
    studentSessions.value.find(
      (session) => String(session.id) === String(form.student_session_id),
    ) || null
  )
})

const getSessionLabel = (session) => {
  if (!session) return 'Unknown Session'

  const academicYear =
    session.academic_session?.name || session.academicSession?.name || 'Unknown Session'
  const className = session.class_info?.class_name || session.class_info?.name || 'N/A'
  const sectionName = session.section?.name || session.section?.section_name || ''
  const groupName = session.class_group?.group_name || session.class_group?.name || ''

  return [
    academicYear,
    `Class: ${className}`,
    sectionName ? `Section: ${sectionName}` : '',
    groupName ? `Group: ${groupName}` : '',
  ]
    .filter(Boolean)
    .join(' | ')
}

const getStudentGroupName = (student) => {
  if (!student) return 'N/A'

  return (
    student.class_group?.group_name ||
    student.class_group?.name ||
    student.group?.group_name ||
    student.group?.name ||
    student.group_name ||
    student.group?.title ||
    'N/A'
  )
}

const mainSubjects = computed(() =>
  currentSubjects.value.filter((subject) => subject && !subject.is_additional),
)

const additionalSubjects = computed(() =>
  currentSubjects.value.filter((subject) => subject && subject.is_additional),
)

/**
 * Fetch results and students.
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

    const resultData = response.data.results?.data ?? []
    resultsList.value = Array.isArray(resultData)
      ? resultData.filter((result) => result && typeof result === 'object')
      : []

    studentsList.value = Array.isArray(response.data.students)
      ? response.data.students.filter((student) => student && typeof student === 'object')
      : []

    const pagination = response.data.results_pagination || {}
    currentPage.value = pagination.current_page || 1
    totalPages.value = pagination.last_page || 1
    filteredTotal.value = pagination.total || 0
    showingFrom.value = pagination.from || 0
    showingTo.value = pagination.to || 0
  } catch (error) {
    console.error('Error fetching result data:', error)
    resultsList.value = []
    studentsList.value = []
    filteredTotal.value = 0
    totalPages.value = 1
    showingFrom.value = 0
    showingTo.value = 0
  }
}

const goToPage = (page) => {
  if (page < 1 || page > totalPages.value || page === currentPage.value) return
  fetchData(page)
}

const previousPage = () => {
  if (currentPage.value > 1) fetchData(currentPage.value - 1)
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) fetchData(currentPage.value + 1)
}

const pageNumbers = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = currentPage.value

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
    return pages
  }

  pages.push(1)
  if (current > 4) pages.push('...')

  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.push(i)
  }

  if (current < total - 3) pages.push('...')
  pages.push(total)
  return pages
})

const fetchExaminations = async () => {
  try {
    const response = await api.get('/examinations')
    examinationsList.value =
      response.data.status && Array.isArray(response.data.data)
        ? response.data.data.filter((exam) => exam && typeof exam === 'object')
        : []
  } catch (error) {
    console.error('Error fetching examinations:', error)
    examinationsList.value = []
  }
}

const searchableStudents = computed(() => {
  const text = studentSearchText.value.toLowerCase().trim()
  const validStudents = studentsList.value.filter(
    (student) => student && typeof student === 'object',
  )

  if (!text) return validStudents.slice(0, 50)

  return validStudents.filter((student) => {
    const id = student.student_id?.toString().toLowerCase() || ''
    const name = student.full_name?.toString().toLowerCase() || ''
    const group = getStudentGroupName(student)?.toString().toLowerCase() || ''
    return id.includes(text) || name.includes(text) || group.includes(text)
  })
})

const searchableExaminations = computed(() => {
  const text = examSearchText.value.toLowerCase().trim()
  const sessionYear =
    selectedStudentSession.value?.academic_session?.name ||
    selectedStudentSession.value?.academicSession?.name ||
    ''

  if (!selectedStudent.value || !sessionYear) return []

  let examinations = examinationsList.value.filter((exam) => exam && typeof exam === 'object')

  if (selectedStudent.value.branch_id != null) {
    examinations = examinations.filter(
      (exam) => Number(exam.branch_id) === Number(selectedStudent.value.branch_id),
    )
  }

  examinations = examinations.filter(
    (exam) => String(exam.examination_year) === String(sessionYear),
  )

  if (!text) return examinations.slice(0, 50)

  return examinations.filter((exam) =>
    (exam.examination_type?.toString().toLowerCase() || '').includes(text),
  )
})

const searchableYears = computed(() => {
  const sessionYear =
    selectedStudentSession.value?.academic_session?.name ||
    selectedStudentSession.value?.academicSession?.name ||
    ''

  if (!selectedStudent.value || !sessionYear) return []

  let examinations = examinationsList.value.filter(
    (exam) =>
      exam && typeof exam === 'object' && String(exam.examination_year) === String(sessionYear),
  )

  if (selectedStudent.value.branch_id != null) {
    examinations = examinations.filter(
      (exam) => Number(exam.branch_id) === Number(selectedStudent.value.branch_id),
    )
  }

  const uniqueYears = new Map()
  examinations.forEach((exam) => {
    const year = String(exam.examination_year)
    if (!uniqueYears.has(year)) uniqueYears.set(year, exam)
  })

  const years = Array.from(uniqueYears.values())
  const text = yearSearchText.value.toLowerCase().trim()

  if (!text) return years.slice(0, 50)

  return years.filter((exam) => String(exam.examination_year).toLowerCase().includes(text))
})

const selectStudent = (student) => {
  if (!student) return

  form.student_id = student.id
  form.student_session_id = ''
  form.exam_year = ''
  form.exam_type = ''
  form.subjects = []

  studentSearchText.value = `${student.student_id} - ${student.full_name}`
  yearSearchText.value = ''
  examSearchText.value = ''
  currentSubjects.value = []

  isStudentDropdownOpen.value = false
  isYearDropdownOpen.value = false
  isExamDropdownOpen.value = false
}

const clearStudentSelection = () => {
  form.student_id = ''
  form.student_session_id = ''
  form.exam_year = ''
  form.exam_type = ''
  form.subjects = []

  studentSearchText.value = ''
  yearSearchText.value = ''
  examSearchText.value = ''
  currentSubjects.value = []

  isStudentDropdownOpen.value = true
  isYearDropdownOpen.value = false
  isExamDropdownOpen.value = false
}

const selectStudentSession = () => {
  currentSubjects.value = []
  form.subjects = []
  form.exam_type = ''
  examSearchText.value = ''

  const session = selectedStudentSession.value

  if (!session) {
    form.exam_year = ''
    yearSearchText.value = ''
    isYearDropdownOpen.value = false
    isExamDropdownOpen.value = false
    return
  }

  const year = session.academic_session?.name || session.academicSession?.name || ''
  form.exam_year = String(year)
  yearSearchText.value = String(year)

  isYearDropdownOpen.value = false
  isExamDropdownOpen.value = false

  loadStudentSubjects()
}

const loadStudentSubjects = () => {
  const session = selectedStudentSession.value
  currentSubjects.value = []
  form.subjects = []

  if (!session) return

  let subjects = Array.isArray(session.assigned_subjects) ? session.assigned_subjects : []

  if (subjects.length === 0) {
    const classSubjects = Array.isArray(session.class_info?.subjects)
      ? session.class_info.subjects
      : []
    const groupSubjects = Array.isArray(session.class_group?.subjects)
      ? session.class_group.subjects
      : []
    subjects = [...classSubjects, ...groupSubjects]
  }

  const subjectMap = new Map()

  subjects.forEach((subject) => {
    if (!subject || typeof subject !== 'object' || subject.id == null) return

    const id = Number(subject.id)
    const normalized = {
      unique_key: `subject_${id}`,
      id: subject.id,
      name: subject.name || subject.subject_name || subject.subject?.name || 'Unknown Subject',
      code: subject.code || subject.subject_code || subject.subject?.code || null,
      is_additional:
        subject.is_additional === true ||
        subject.is_additional === 1 ||
        subject.is_additional === '1',
      marks: '',
    }

    const existing = subjectMap.get(id)
    if (!existing || normalized.is_additional) subjectMap.set(id, normalized)
  })

  currentSubjects.value = Array.from(subjectMap.values())
  syncFormSubjects()
}

const updateSubjectMarks = (subjectKey, marks) => {
  const subject = currentSubjects.value.find((item) => item && item.unique_key === subjectKey)

  if (!subject) return

  subject.marks = marks
  syncFormSubjects()
}

const syncFormSubjects = () => {
  form.subjects = currentSubjects.value
    .filter((subject) => subject && typeof subject === 'object')
    .map((subject) => ({
      subject_id: subject.id,
      marks: subject.marks === '' || subject.marks === null ? null : Number(subject.marks),
      is_additional: subject.is_additional,
    }))
}

const selectExam = (exam) => {
  if (!exam) return

  const sessionYear =
    selectedStudentSession.value?.academic_session?.name ||
    selectedStudentSession.value?.academicSession?.name ||
    ''

  if (!sessionYear || String(exam.examination_year) !== String(sessionYear)) {
    alert('Exam year must match the selected academic session.')
    return
  }

  if (
    selectedStudent.value?.branch_id != null &&
    Number(exam.branch_id) !== Number(selectedStudent.value.branch_id)
  ) {
    alert('Please select an examination from the student branch.')
    return
  }

  form.exam_year = String(sessionYear)
  yearSearchText.value = String(sessionYear)
  form.exam_type = exam.examination_type
  examSearchText.value = exam.examination_type

  isExamDropdownOpen.value = false
  isYearDropdownOpen.value = false
}

const clearExamSelection = () => {
  form.exam_type = ''
  examSearchText.value = ''
  isExamDropdownOpen.value = true
}

const selectYear = (exam) => {
  const sessionYear =
    selectedStudentSession.value?.academic_session?.name ||
    selectedStudentSession.value?.academicSession?.name ||
    ''

  if (!exam || !sessionYear) return

  if (String(exam.examination_year) !== String(sessionYear)) {
    alert('Exam year must match the selected academic session.')
    return
  }

  form.exam_year = String(sessionYear)
  yearSearchText.value = String(sessionYear)
  isYearDropdownOpen.value = false
}

const clearYearSelection = () => {
  if (selectedStudentSession.value) {
    const year =
      selectedStudentSession.value.academic_session?.name ||
      selectedStudentSession.value.academicSession?.name ||
      ''
    form.exam_year = String(year)
    yearSearchText.value = String(year)
  } else {
    form.exam_year = ''
    yearSearchText.value = ''
  }

  isYearDropdownOpen.value = false
}

const resetForm = () => {
  form.student_id = ''
  form.student_session_id = ''
  form.exam_year = ''
  form.exam_type = ''
  form.subjects = []

  studentSearchText.value = ''
  yearSearchText.value = ''
  examSearchText.value = ''
  currentSubjects.value = []

  editingResultId.value = null
  isEditMode.value = false
  isStudentDropdownOpen.value = false
  isYearDropdownOpen.value = false
  isExamDropdownOpen.value = false
}

const closeAddModal = () => {
  isAddModalOpen.value = false
  isStudentDropdownOpen.value = false
  isYearDropdownOpen.value = false
  isExamDropdownOpen.value = false
}

const openAddModal = () => {
  resetForm()
  isAddModalOpen.value = true
}

/**
 * Open the existing result in the same modal.
 */
const openEditModal = (result) => {
  // UI-level protection; backend must also reject Result Entry updates.
  if (isResultEntry) {
    alert('You are not allowed to edit existing results.')
    return
  }

  if (!result?.id) {
    alert('Result ID could not be found.')
    return
  }

  resetForm()

  let student = studentsList.value.find((item) => String(item.id) === String(result.student_id))

  if (!student && result.student?.id) {
    student = result.student
    studentsList.value = [...studentsList.value, student]
  }

  if (!student) {
    alert('Student details could not be loaded. Please refresh the page and try again.')
    return
  }

  const sessionId = result.student_session_id

  if (!sessionId) {
    alert(
      'This result does not contain a student session ID. Please check the Result API response.',
    )
    return
  }

  const sessionExists = (student.student_sessions || []).some(
    (session) => String(session.id) === String(sessionId),
  )

  if (!sessionExists) {
    alert(
      'The academic session for this result is not available in the student data. Please check the Result API response.',
    )
    return
  }

  isEditMode.value = true
  editingResultId.value = result.id

  form.student_id = student.id
  form.student_session_id = String(sessionId)

  studentSearchText.value = `${student.student_id || ''} - ${student.full_name || ''}`

  const session = (student.student_sessions || []).find(
    (item) => String(item.id) === String(sessionId),
  )

  const sessionYear =
    session?.academic_session?.name || session?.academicSession?.name || result.exam_year || ''

  form.exam_year = String(result.exam_year || sessionYear)
  yearSearchText.value = form.exam_year

  form.exam_type = result.exam_type || ''
  examSearchText.value = form.exam_type

  loadStudentSubjects()

  const savedSubjects = result.result_subjects || result.resultSubjects || []
  const marksBySubject = new Map(
    savedSubjects
      .filter((item) => item && item.subject_id != null)
      .map((item) => [String(item.subject_id), item.marks]),
  )

  currentSubjects.value = currentSubjects.value.map((subject) => ({
    ...subject,
    marks: marksBySubject.has(String(subject.id))
      ? String(marksBySubject.get(String(subject.id)) ?? '')
      : '',
  }))

  syncFormSubjects()

  isStudentDropdownOpen.value = false
  isYearDropdownOpen.value = false
  isExamDropdownOpen.value = false
  isAddModalOpen.value = true
}

/**
 * Insert or update result.
 */
const saveNewResult = async () => {
  if (isSaving.value) return

  // Do not allow Result Entry to update an existing result, even if the
  // edit method is invoked accidentally from the UI.
  if (isResultEntry && isEditMode.value) {
    alert('You are not allowed to edit existing results.')
    return
  }

  if (!form.student_id) {
    alert('Please select a student.')
    return
  }

  if (!form.student_session_id) {
    alert('Please select an academic session.')
    return
  }

  if (!selectedStudentSession.value) {
    alert('The selected academic session could not be found. Please select it again.')
    return
  }

  if (!form.exam_year) {
    alert('Please select an exam year.')
    return
  }

  if (!form.exam_type) {
    alert('Please select an examination.')
    return
  }

  if (!form.subjects || form.subjects.length === 0) {
    alert('No subjects are available for this session.')
    return
  }

  const missingSubjects = currentSubjects.value.filter(
    (subject) => subject.marks === '' || subject.marks === null || subject.marks === undefined,
  )

  if (missingSubjects.length > 0) {
    const subjectNames = missingSubjects.map((subject) => subject.name).join(', ')
    alert(`Please enter marks for all subjects. Missing: ${subjectNames}`)
    return
  }

  const invalidSubject = form.subjects.some(
    (subject) =>
      subject.marks === null ||
      subject.marks === undefined ||
      subject.marks === '' ||
      !Number.isFinite(Number(subject.marks)) ||
      Number(subject.marks) < 0 ||
      Number(subject.marks) > 999.99,
  )

  if (invalidSubject) {
    alert('Please enter valid marks for every subject (0–999.99).')
    return
  }

  const payload = {
    student_id: form.student_id,
    student_session_id: Number(form.student_session_id),
    exam_year: form.exam_year,
    exam_type: form.exam_type,
    subjects: form.subjects.map((subject) => ({
      subject_id: subject.subject_id,
      marks: Number(subject.marks),
      is_additional: subject.is_additional,
    })),
  }

  try {
    isSaving.value = true

    let response

    if (isEditMode.value && editingResultId.value) {
      response = await api.put(`/results/${editingResultId.value}`, payload)
    } else {
      response = await api.post('/results', payload)
    }

    if (response.data?.status === false) {
      alert(response.data.message || 'Failed to save result.')
      return
    }

    await fetchData(currentPage.value)
    closeAddModal()
    resetForm()

    alert(
      response.data?.message ||
        (isEditMode.value ? 'Result updated successfully.' : 'Result saved successfully.'),
    )
  } catch (error) {
    console.error('Error saving result:', error)
    console.error('Response:', error.response?.data)

    const errors = error.response?.data?.errors

    if (errors && typeof errors === 'object') {
      const firstError = Object.values(errors).flat().find(Boolean)
      alert(firstError || error.response?.data?.message || 'Failed to save result.')
    } else {
      alert(error.response?.data?.message || 'Failed to save result. Please try again.')
    }
  } finally {
    isSaving.value = false
  }
}

const filteredResults = computed(() => {
  const keyword = search.value.toLowerCase().trim()

  const validResults = resultsList.value.filter((result) => result && typeof result === 'object')

  if (!keyword) return validResults

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

const getPoint = (marks) => {
  if (marks === null || marks === undefined || marks === '') return null

  const value = Number(marks)

  if (value >= 80) return 5.0
  if (value >= 70) return 4.0
  if (value >= 60) return 3.5
  if (value >= 50) return 3.0
  if (value >= 40) return 2.0
  if (value >= 33) return 1.0

  return 0.0
}

const calculateResultDetails = (result) => {
  if (!result) return { gpa: 0, status: 'Fail' }

  const subjects = result.result_subjects || result.resultSubjects || []
  let totalPoints = 0
  let subjectCount = 0
  let hasFailed = false

  subjects
    .filter((item) => item && typeof item === 'object')
    .forEach((item) => {
      if (item.marks === null || item.marks === undefined) return

      const point = getPoint(item.marks)
      if (point === null) return

      totalPoints += point
      subjectCount++

      if (point === 0) hasFailed = true
    })

  if (subjectCount === 0 || hasFailed) return { gpa: 0, status: 'Fail' }

  return {
    gpa: Number(Math.min(5, totalPoints / subjectCount).toFixed(2)),
    status: 'Pass',
  }
}

const totalStudents = computed(() => filteredTotal.value)
const publishedResults = computed(() => filteredTotal.value)

const passRate = computed(() => {
  const validResults = resultsList.value.filter((result) => result && typeof result === 'object')

  if (validResults.length === 0) return '0.0'

  const passed = validResults.filter(
    (result) => calculateResultDetails(result).status === 'Pass',
  ).length

  return ((passed / validResults.length) * 100).toFixed(1)
})

const totalGpaFive = computed(() => {
  const validResults = resultsList.value.filter((result) => result && typeof result === 'object')

  return validResults.filter((result) => {
    const details = calculateResultDetails(result)
    const gpa = Number(details.gpa)
    return details.status === 'Pass' && Number.isFinite(gpa) && gpa >= 5
  }).length
})

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

.result-add-btn {
  position: relative;
  z-index: 10;
  cursor: pointer;
}

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

.result-modal-body .modal-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.result-modal-overlay .modal,
.result-modal-overlay .fade,
.result-modal-overlay .show,
.result-modal-overlay .d-block {
  display: block;
}

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
