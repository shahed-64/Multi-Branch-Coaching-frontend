<template>
  <RouterView />
  <dashPageView />

  <div class="institute-result-page py-4">
    <div class="container-fluid px-4">
      <!-- PAGE HEADER -->
      <div class="card border-0 shadow-sm rounded-4 p-4 mb-4 no-print">
        <h4 class="fw-bold text-dark mb-1">Institute Result</h4>
        <p class="text-muted mb-0">
          Select academic session and examination to view the class merit list.
        </p>
      </div>

      <!-- FILTERS -->
      <div class="card border-0 shadow-sm rounded-4 p-4 mb-4 no-print">
        <form @submit.prevent="showResult">
          <div class="row g-3">
            <div class="col-md-4">
              <label class="form-label fw-semibold">Academic Session</label>
              <select
                v-model="filters.academic_session_id"
                class="form-select"
                required
                @change="handleSessionChange"
              >
                <option value="">Select Academic Session</option>
                <option
                  v-for="session in academicSessions"
                  :key="session.id"
                  :value="String(session.id)"
                >
                  {{ session.name }}
                </option>
              </select>
            </div>

            <div class="col-md-4">
              <label class="form-label fw-semibold">Class</label>
              <select v-model="filters.class_id" class="form-select" required>
                <option value="">Select Class</option>
                <option v-for="item in classes" :key="item.id" :value="String(item.id)">
                  {{ item.class_name || item.name }}
                </option>
              </select>
            </div>

            <div class="col-md-4">
              <label class="form-label fw-semibold">Section</label>
              <select v-model="filters.section_id" class="form-select" required>
                <option value="">Select Section</option>
                <option v-for="item in sections" :key="item.id" :value="String(item.id)">
                  {{ item.section_name || item.name }}
                </option>
              </select>
            </div>

            <div class="col-md-4">
              <label class="form-label fw-semibold">Group</label>
              <select v-model="filters.class_group_id" class="form-select" required>
                <option value="">Select Group</option>
                <option v-for="item in classGroups" :key="item.id" :value="String(item.id)">
                  {{ item.group_name || item.name }}
                </option>
              </select>
            </div>

            <div class="col-md-4">
              <label class="form-label fw-semibold">Shift</label>
              <select v-model="filters.shift_id" class="form-select" required>
                <option value="">Select Shift</option>
                <option v-for="item in shifts" :key="item.id" :value="String(item.id)">
                  {{ item.name || item.shift_name }}
                </option>
              </select>
            </div>

            <div class="col-md-4">
              <label class="form-label fw-semibold">Examination</label>
              <select
                v-model="filters.examination_id"
                class="form-select"
                required
                :disabled="!filters.academic_session_id"
              >
                <option value="">Select Examination</option>
                <option
                  v-for="exam in availableExaminations"
                  :key="exam.id"
                  :value="String(exam.id)"
                >
                  {{ exam.examination_type }}
                </option>
              </select>
            </div>
          </div>

          <div class="d-flex flex-wrap gap-2 mt-4">
            <button
              type="submit"
              class="btn btn-primary px-4 fw-semibold"
              :disabled="loading || !isFilterComplete"
            >
              {{ loading ? 'Loading Result...' : 'Show Result' }}
            </button>

            <button
              type="button"
              class="btn btn-outline-secondary px-4"
              @click="resetFilters"
              :disabled="loading"
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      <!-- ERROR MESSAGE -->
      <div v-if="errorMessage" class="alert alert-danger no-print">
        {{ errorMessage }}
      </div>

      <!-- RESULT SUMMARY -->
      <div
        v-if="hasSearched && !loading && !errorMessage"
        class="card border-0 shadow-sm rounded-4 p-4 no-print"
      >
        <div class="d-flex flex-column flex-md-row justify-content-between gap-3 mb-4">
          <div>
            <h5 class="fw-bold mb-1">Class Merit List</h5>
            <p class="text-muted small mb-0">
              {{ selectedSessionName }} · {{ selectedClassName }} ·
              {{ selectedExaminationName }}
            </p>
          </div>

          <div class="d-flex align-items-center gap-3">
            <div class="text-md-end">
              <span class="text-muted small">Total Students</span>
              <h4 class="fw-bold mb-0">{{ results.length }}</h4>
            </div>

            <button
              type="button"
              class="btn btn-success fw-semibold"
              @click="downloadPdf"
              :disabled="results.length === 0"
            >
              Download PDF
            </button>
          </div>
        </div>

        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th class="py-3">SL No.</th>
                <th class="py-3">Student ID</th>
                <th class="py-3">Student Name</th>
                <th class="py-3 text-center">Total Marks</th>
                <th class="py-3 text-center">Obtained Marks</th>
                <th class="py-3 text-center">GPA</th>
                <th class="py-3 text-center">Merit List</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="(result, index) in results" :key="result.result_id ?? index">
                <td>{{ index + 1 }}</td>
                <td class="fw-semibold">
                  {{ result.student_id || 'N/A' }}
                </td>

                <td>{{ result.student_name || 'N/A' }}</td>

                <td class="text-center">
                  {{ formatMarks(result.total_marks) }}
                </td>

                <td class="text-center fw-semibold">
                  {{ formatMarks(result.obtained_marks) }}
                </td>

                <td class="text-center">
                  <span v-if="result.status === 'Fail'" class="badge bg-danger-subtle text-danger">
                    Fail
                  </span>
                  <span v-else>
                    {{ formatGpa(result.gpa) }}
                  </span>
                </td>

                <td class="text-center">
                  <span class="badge bg-primary-subtle text-primary px-3 py-2">
                    {{ ordinalRank(result.merit_rank) }}
                  </span>
                </td>
              </tr>

              <tr v-if="results.length === 0">
                <td colspan="6" class="text-center text-muted py-5">
                  No results found for the selected information.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  <!-- PDF / PRINT LAYOUT: HIDDEN ON SCREEN -->
  <section v-if="hasSearched && results.length > 0" class="pdf-print-area">
    <header class="pdf-heading">
      <h1>Icon Academy</h1>
      <p>257/1/G Ahmednagar, PaikPara, Mirpur, Dhaka-1216</p>
      <p>01674099838, 01829015429</p>
      <h2>Institute Result &amp; Merit List</h2>
    </header>

    <div class="pdf-details">
      <div><strong>Academic Session:</strong> {{ selectedSessionName }}</div>
      <div><strong>Class:</strong> {{ selectedClassName }}</div>
      <div><strong>Section:</strong> {{ selectedSectionName }}</div>
      <div><strong>Group:</strong> {{ selectedGroupName }}</div>
      <div><strong>Shift:</strong> {{ selectedShiftName }}</div>
      <div><strong>Examination:</strong> {{ selectedExaminationName }}</div>
      <div><strong>Total Students:</strong> {{ results.length }}</div>
    </div>

    <table class="pdf-result-table">
      <thead>
        <tr>
          <th>Student ID</th>
          <th>Student Name</th>
          <th>Total Marks</th>
          <th>Obtained Marks</th>
          <th>GPA</th>
          <th>Merit List</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="(result, index) in results" :key="result.result_id ?? index">
          <td>{{ result.student_id || 'N/A' }}</td>
          <td>{{ result.student_name || 'N/A' }}</td>
          <td>{{ formatMarks(result.total_marks) }}</td>
          <td>{{ formatMarks(result.obtained_marks) }}</td>
          <td>{{ result.status === 'Fail' ? 'Fail' : formatGpa(result.gpa) }}</td>
          <td>{{ ordinalRank(result.merit_rank) }}</td>
        </tr>
      </tbody>
    </table>

    <footer class="pdf-footer">Generated on: {{ generatedDate }}</footer>
  </section>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import dashPageView from './dashPageView.vue'
import api from '@/services/api'

const academicSessions = ref([])
const classes = ref([])
const sections = ref([])
const classGroups = ref([])
const shifts = ref([])
const examinations = ref([])
const results = ref([])

const loading = ref(false)
const hasSearched = ref(false)
const errorMessage = ref('')

const filters = reactive({
  academic_session_id: '',
  class_id: '',
  section_id: '',
  class_group_id: '',
  shift_id: '',
  examination_id: '',
})

const isFilterComplete = computed(() => Object.values(filters).every((value) => value !== ''))

const selectedSession = computed(() =>
  academicSessions.value.find((item) => String(item.id) === String(filters.academic_session_id)),
)

const selectedExamination = computed(() =>
  examinations.value.find((item) => String(item.id) === String(filters.examination_id)),
)

const availableExaminations = computed(() => {
  const sessionName = selectedSession.value?.name

  if (!sessionName) return []

  return examinations.value.filter((exam) => String(exam.examination_year) === String(sessionName))
})

const selectedSessionName = computed(() => selectedSession.value?.name || '')

const selectedClassName = computed(() => {
  const item = classes.value.find((entry) => String(entry.id) === String(filters.class_id))

  return item?.class_name || item?.name || ''
})

const selectedSectionName = computed(() => {
  const item = sections.value.find((entry) => String(entry.id) === String(filters.section_id))

  return item?.section_name || item?.name || ''
})

const selectedGroupName = computed(() => {
  const item = classGroups.value.find(
    (entry) => String(entry.id) === String(filters.class_group_id),
  )

  return item?.group_name || item?.name || ''
})

const selectedShiftName = computed(() => {
  const item = shifts.value.find((entry) => String(entry.id) === String(filters.shift_id))

  return item?.name || item?.shift_name || ''
})

const generatedDate = computed(() =>
  new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }),
)

const getArray = (response) => {
  const data = response?.data

  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.academic_sessions)) return data.academic_sessions
  if (Array.isArray(data?.classes)) return data.classes
  if (Array.isArray(data?.sections)) return data.sections
  if (Array.isArray(data?.class_groups)) return data.class_groups
  if (Array.isArray(data?.shifts)) return data.shifts

  return []
}

const loadFilterOptions = async () => {
  try {
    const [
      sessionResponse,
      classResponse,
      sectionResponse,
      groupResponse,
      shiftResponse,
      examinationResponse,
    ] = await Promise.all([
      api.get('/academic-sessions'),
      api.get('/classes'),
      api.get('/sections'),
      api.get('/class-groups'),
      api.get('/shifts'),
      api.get('/examinations'),
    ])

    academicSessions.value = getArray(sessionResponse)
    classes.value = getArray(classResponse)
    sections.value = getArray(sectionResponse)
    classGroups.value = getArray(groupResponse)
    shifts.value = getArray(shiftResponse)

    const examData = examinationResponse?.data

    examinations.value = Array.isArray(examData?.data)
      ? examData.data
      : Array.isArray(examData)
        ? examData
        : []
  } catch (error) {
    console.error('Institute Result filter loading error:', error)

    errorMessage.value =
      error.response?.data?.message ||
      'Could not load the selection options. Please check the API endpoints.'
  }
}

const handleSessionChange = () => {
  filters.examination_id = ''
  results.value = []
  hasSearched.value = false
  errorMessage.value = ''
}

const showResult = async () => {
  if (!isFilterComplete.value) {
    errorMessage.value = 'Please select all filters first.'
    return
  }

  const exam = selectedExamination.value
  const session = selectedSession.value

  if (!exam || !session) {
    errorMessage.value = 'The selected session or examination could not be found.'
    return
  }

  if (String(exam.examination_year) !== String(session.name)) {
    errorMessage.value = 'The examination year must match the selected academic session.'
    return
  }

  loading.value = true
  errorMessage.value = ''
  results.value = []
  hasSearched.value = false

  try {
    const response = await api.get('/results/institute', {
      params: {
        academic_session_id: Number(filters.academic_session_id),
        class_id: Number(filters.class_id),
        section_id: Number(filters.section_id),
        class_group_id: Number(filters.class_group_id),
        shift_id: Number(filters.shift_id),
        exam_year: exam.examination_year,
        exam_type: exam.examination_type,
      },
    })

    if (response.data?.status === false) {
      throw new Error(response.data.message || 'Unable to load institute result.')
    }

    results.value = Array.isArray(response.data?.results) ? response.data.results : []

    hasSearched.value = true
  } catch (error) {
    console.error('Institute Result loading error:', error)

    errorMessage.value =
      error.response?.data?.message || error.message || 'Failed to load the institute result.'
  } finally {
    loading.value = false
  }
}

const resetFilters = () => {
  Object.keys(filters).forEach((key) => {
    filters[key] = ''
  })

  results.value = []
  hasSearched.value = false
  errorMessage.value = ''
}

const formatMarks = (value) => {
  const number = Number(value)

  return Number.isFinite(number) ? Number(number.toFixed(2)) : '0'
}

const formatGpa = (value) => {
  const number = Number(value)

  return Number.isFinite(number) ? number.toFixed(2) : '0.00'
}

const ordinalRank = (rank) => {
  const number = Number(rank)

  if (!Number.isFinite(number) || number < 1) return '-'

  const mod100 = number % 100

  if (mod100 >= 11 && mod100 <= 13) {
    return `${number}th`
  }

  switch (number % 10) {
    case 1:
      return `${number}st`
    case 2:
      return `${number}nd`
    case 3:
      return `${number}rd`
    default:
      return `${number}th`
  }
}

const downloadPdf = () => {
  if (!results.value.length) return

  window.print()
}

onMounted(() => {
  loadFilterOptions()
})
</script>

<style scoped>
.institute-result-page {
  min-height: 100vh;
  width: 86%;
  margin-left: 259px;
  background-color: #f8f9fa;
  font-family: Arial, sans-serif;
}

.card {
  transition: box-shadow 0.2s ease-in-out;
}

.table th,
.table td {
  vertical-align: middle;
}

/* Hidden in the normal page */
.pdf-print-area {
  display: none;
}

.pdf-heading {
  text-align: center;
  margin-bottom: 22px;
}

.pdf-heading h1 {
  font-size: 26px;
  font-weight: 700;
  margin: 0 0 6px;
}

.pdf-heading p {
  font-size: 12px;
  margin: 3px 0;
}

.pdf-heading h2 {
  font-size: 19px;
  font-weight: 700;
  margin-top: 16px;
}

.pdf-details {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 9px 16px;
  font-size: 12px;
  margin-bottom: 18px;
}

.pdf-result-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
}

.pdf-result-table th,
.pdf-result-table td {
  border: 1px solid #333;
  padding: 8px 6px;
  text-align: left;
}

.pdf-result-table th {
  background: #e9ecef !important;
  font-weight: 700;
}

.pdf-footer {
  font-size: 10px;
  text-align: right;
  margin-top: 16px;
}

@media (max-width: 992px) {
  .institute-result-page {
    width: 100%;
    margin-left: 0;
    padding-left: 15px;
    padding-right: 15px;
  }
}

/* PDF / browser print layout */
@media print {
  @page {
    size: A4 portrait;
    margin: 10mm;
  }
  .pdf-result-table {
    width: 100%;
    table-layout: fixed;
    font-size: 9px;
  }

  .pdf-result-table th,
  .pdf-result-table td {
    padding: 6px 4px;
    overflow-wrap: anywhere;
  }

  .pdf-details {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    font-size: 11px;
  }

  :global(html),
  :global(body) {
    width: 100% !important;
    height: auto !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow: visible !important;
    background: #fff !important;
  }

  :global(body *) {
    visibility: hidden !important;
  }

  .pdf-print-area,
  .pdf-print-area * {
    visibility: visible !important;
  }

  .pdf-print-area {
    display: block !important;
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    background: #fff !important;
    color: #000 !important;
    font-family: Arial, sans-serif !important;
  }

  .pdf-result-table {
    page-break-inside: auto;
  }

  .pdf-result-table tr {
    page-break-inside: avoid;
    page-break-after: auto;
  }

  .pdf-result-table thead {
    display: table-header-group;
  }

  .pdf-result-table th {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
</style>
