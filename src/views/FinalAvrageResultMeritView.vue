<template>
  <RouterView />
  <dashPageView />

  <div class="average-result-page py-4">
    <div class="page-header d-flex justify-content-between align-items-center mb-4">
      <div>
        <h3 class="fw-bold mb-1">Average Result Merit List</h3>
        <p class="text-muted mb-0">Final Average Result based on Total Weighted Score</p>
      </div>

      <button
        v-if="hasSearched && results.length"
        class="btn btn-danger"
        type="button"
        @click="downloadPdf"
      >
        <i class="bi bi-file-earmark-pdf me-1"></i>
        Download PDF
      </button>
    </div>

    <!-- Filters -->
    <div class="card border-0 shadow-sm mb-4 filter-card">
      <div class="card-header bg-white py-3">
        <h5 class="mb-0 fw-semibold">Select Academic Information</h5>
      </div>

      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-4">
            <label class="form-label">Academic Session</label>
            <select
              v-model="filters.academic_session_id"
              class="form-select"
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
            <label class="form-label">Class</label>
            <select v-model="filters.class_id" class="form-select">
              <option value="">Select Class</option>
              <option v-for="item in classes" :key="item.id" :value="String(item.id)">
                {{ item.class_name || item.name }}
              </option>
            </select>
          </div>

          <div class="col-md-4">
            <label class="form-label">Section</label>
            <select v-model="filters.section_id" class="form-select">
              <option value="">Select Section</option>
              <option v-for="item in sections" :key="item.id" :value="String(item.id)">
                {{ item.section_name || item.name }}
              </option>
            </select>
          </div>

          <div class="col-md-4">
            <label class="form-label">Group</label>
            <select v-model="filters.class_group_id" class="form-select">
              <option value="">No Group</option>
              <option v-for="item in classGroups" :key="item.id" :value="String(item.id)">
                {{ item.class_group_name || item.group_name || item.name }}
              </option>
            </select>
          </div>

          <div class="col-md-4">
            <label class="form-label">Shift</label>
            <select v-model="filters.shift_id" class="form-select">
              <option value="">Select Shift</option>
              <option v-for="item in shifts" :key="item.id" :value="String(item.id)">
                {{ item.shift_name || item.name }}
              </option>
            </select>
          </div>
        </div>

        <div class="d-flex gap-2 mt-4">
          <button
            class="btn btn-primary px-4"
            type="button"
            :disabled="loading"
            @click="showResult"
          >
            <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
            {{ loading ? 'Loading...' : 'Show Merit List' }}
          </button>

          <button
            class="btn btn-outline-secondary px-4"
            type="button"
            :disabled="loading"
            @click="resetFilters"
          >
            Reset
          </button>
        </div>

        <div v-if="errorMessage" class="alert alert-danger mt-3 mb-0">
          {{ errorMessage }}
        </div>
      </div>
    </div>

    <!-- Results -->
    <div v-if="hasSearched" class="card border-0 shadow-sm result-card">
      <div class="card-header bg-white py-3">
        <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <h5 class="fw-bold mb-0">Average Result &amp; Merit List</h5>
          <span class="badge bg-primary"> Total Students: {{ results.length }} </span>
        </div>
      </div>

      <div class="card-body">
        <div class="result-summary mb-3">
          <div><strong>Academic Session:</strong> {{ selectedSessionName }}</div>
          <div><strong>Class:</strong> {{ selectedClassName }}</div>
          <div><strong>Section:</strong> {{ selectedSectionName }}</div>
          <div><strong>Group:</strong> {{ selectedGroupName }}</div>
          <div><strong>Shift:</strong> {{ selectedShiftName }}</div>
        </div>

        <div v-if="!results.length" class="alert alert-info mb-0">
          No Average Result found for the selected filters.
        </div>

        <div v-else class="table-responsive">
          <table class="table table-bordered table-hover align-middle result-table">
            <thead>
              <tr>
                <th class="text-center">SL No.</th>
                <th>Student ID</th>
                <th>Student Name</th>
                <th class="text-end">Total Marks</th>
                <th class="text-end">Total Weighted Score</th>
                <th class="text-center">GPA</th>
                <th class="text-center">Merit List</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="(student, index) in results"
                :key="student.student_session_id || student.student_id || index"
              >
                <td class="text-center">{{ index + 1 }}</td>
                <td>{{ student.student_id }}</td>
                <td>{{ student.student_name }}</td>
                <td class="text-end">{{ formatMarks(student.total_marks) }}</td>
                <td class="text-end fw-semibold">
                  {{ formatMarks(student.total_weighted_score ?? student.obtained_marks) }}
                </td>
                <td class="text-center">{{ formatMarks(student.gpa) }}</td>
                <td class="text-center">
                  <span class="rank-badge" :class="rankClass(student.merit_rank)">
                    {{ ordinalRank(student.merit_rank) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Printable PDF area -->
    <div v-if="hasSearched && results.length" class="pdf-print-area">
      <div class="pdf-institute-header">
        <h2>Icon Academy</h2>
        <p>257/1/G Ahmednagar, PaikPara, Mirpur, Dhaka-1216</p>
        <p>01674099838, 01829015429</p>
        <h3>Average Result &amp; Merit List</h3>
      </div>

      <div class="pdf-details">
        <div><strong>Academic Session:</strong> {{ selectedSessionName }}</div>
        <div><strong>Class:</strong> {{ selectedClassName }}</div>
        <div><strong>Section:</strong> {{ selectedSectionName }}</div>
        <div><strong>Group:</strong> {{ selectedGroupName }}</div>
        <div><strong>Shift:</strong> {{ selectedShiftName }}</div>
        <div><strong>Total Students:</strong> {{ results.length }}</div>
      </div>

      <table class="pdf-table">
        <thead>
          <tr>
            <th>SL</th>
            <th>Student ID</th>
            <th>Student Name</th>
            <th>Total Marks</th>
            <th>Total Weighted Score</th>
            <th>GPA</th>
            <th>Merit Rank</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="(student, index) in results"
            :key="student.student_session_id || student.student_id || index"
          >
            <td>{{ index + 1 }}</td>
            <td>{{ student.student_id }}</td>
            <td>{{ student.student_name }}</td>
            <td>{{ formatMarks(student.total_marks) }}</td>
            <td>
              {{ formatMarks(student.total_weighted_score ?? student.obtained_marks) }}
            </td>
            <td>{{ formatMarks(student.gpa) }}</td>
            <td>{{ ordinalRank(student.merit_rank) }}</td>
          </tr>
        </tbody>
      </table>

      <div class="pdf-footer">Generated on: {{ generatedDate }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { RouterView } from 'vue-router'
import dashPageView from './dashPageView.vue'
import api from '@/services/api'

const academicSessions = ref([])
const classes = ref([])
const sections = ref([])
const classGroups = ref([])
const shifts = ref([])
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
})

const getArray = (response, key = null) => {
  const data = response?.data

  if (Array.isArray(data)) return data
  if (key && Array.isArray(data?.[key])) return data[key]
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.data?.data)) return data.data.data

  return []
}

const loadFilterOptions = async () => {
  try {
    const [sessionResponse, classResponse, sectionResponse, groupResponse, shiftResponse] =
      await Promise.all([
        api.get('/academic-sessions'),
        api.get('/classes'),
        api.get('/sections'),
        api.get('/class-groups'),
        api.get('/shifts'),
      ])

    academicSessions.value = getArray(sessionResponse)
    classes.value = getArray(classResponse, 'classes')
    sections.value = getArray(sectionResponse, 'sections')
    classGroups.value = getArray(groupResponse)
    shifts.value = getArray(shiftResponse)
  } catch (error) {
    console.error('Failed to load Average Result filters:', error)

    errorMessage.value =
      error.response?.data?.message ||
      'Failed to load filter options. Please refresh the page and try again.'
  }
}

const selectedSession = computed(() =>
  academicSessions.value.find((item) => String(item.id) === String(filters.academic_session_id)),
)

const selectedClass = computed(() =>
  classes.value.find((item) => String(item.id) === String(filters.class_id)),
)

const selectedSection = computed(() =>
  sections.value.find((item) => String(item.id) === String(filters.section_id)),
)

const selectedGroup = computed(() =>
  classGroups.value.find((item) => String(item.id) === String(filters.class_group_id)),
)

const selectedShift = computed(() =>
  shifts.value.find((item) => String(item.id) === String(filters.shift_id)),
)

const selectedSessionName = computed(() => selectedSession.value?.name || '-')

const selectedClassName = computed(
  () => selectedClass.value?.class_name || selectedClass.value?.name || '-',
)

const selectedSectionName = computed(
  () => selectedSection.value?.section_name || selectedSection.value?.name || '-',
)

const selectedGroupName = computed(
  () =>
    selectedGroup.value?.class_group_name ||
    selectedGroup.value?.group_name ||
    selectedGroup.value?.name ||
    'No Group',
)

const selectedShiftName = computed(
  () => selectedShift.value?.shift_name || selectedShift.value?.name || '-',
)

const generatedDate = computed(() =>
  new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }),
)

const formatMarks = (value) => {
  const number = Number(value)
  return Number.isFinite(number) ? number.toFixed(2) : '0.00'
}

const ordinalRank = (rank) => {
  if (rank === null || rank === undefined || rank === '') return '-'

  const number = Number(rank)
  if (!Number.isFinite(number)) return '-'

  const remainder100 = number % 100

  if (remainder100 >= 11 && remainder100 <= 13) {
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

const rankClass = (rank) => {
  switch (Number(rank)) {
    case 1:
      return 'rank-first'
    case 2:
      return 'rank-second'
    case 3:
      return 'rank-third'
    default:
      return 'rank-normal'
  }
}

const handleSessionChange = () => {
  results.value = []
  hasSearched.value = false
  errorMessage.value = ''
}

const showResult = async () => {
  errorMessage.value = ''

  if (
    !filters.academic_session_id ||
    !filters.class_id ||
    !filters.section_id ||
    !filters.shift_id
  ) {
    errorMessage.value = 'Please select Academic Session, Class, Section and Shift.'
    return
  }

  loading.value = true

  try {
    const response = await api.get('/final-results/average-merit-list', {
      params: {
        academic_session_id: filters.academic_session_id,
        class_id: filters.class_id,
        section_id: filters.section_id,
        shift_id: filters.shift_id,
        class_group_id: filters.class_group_id || '',
      },
    })

    if (response.data?.status !== true) {
      throw new Error(response.data?.message || 'Failed to load Average Result Merit List.')
    }

    results.value = Array.isArray(response.data.results) ? response.data.results : []

    hasSearched.value = true
  } catch (error) {
    console.error('Failed to load Average Result Merit List:', error)

    results.value = []
    hasSearched.value = false

    errorMessage.value =
      error.response?.data?.message || error.message || 'Failed to load Average Result Merit List.'
  } finally {
    loading.value = false
  }
}

const resetFilters = () => {
  filters.academic_session_id = ''
  filters.class_id = ''
  filters.section_id = ''
  filters.class_group_id = ''
  filters.shift_id = ''

  results.value = []
  hasSearched.value = false
  errorMessage.value = ''
}

const downloadPdf = () => {
  window.print()
}

onMounted(loadFilterOptions)
</script>

<style scoped>
.average-result-page {
  width: 86%;
  margin-left: 259px;
  min-height: 100vh;
  padding-right: 20px;
  padding-left: 20px;
  background: #f8f9fa;
}

.page-header h3 {
  color: #212529;
}

.filter-card,
.result-card {
  border-radius: 10px;
}

.form-label {
  font-weight: 600;
  color: #343a40;
}

.form-select {
  min-height: 42px;
}

.result-summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px 20px;
  padding: 14px;
  background: #f8f9fa;
  border-radius: 8px;
  font-size: 14px;
}

.result-table {
  margin-bottom: 0;
  background: #fff;
}

.result-table thead th {
  background: #2563eb;
  color: #fff;
  white-space: nowrap;
  vertical-align: middle;
}

.result-table td,
.result-table th {
  padding: 10px;
}

.rank-badge {
  display: inline-block;
  min-width: 48px;
  padding: 5px 9px;
  border-radius: 20px;
  font-weight: 700;
}

.rank-first {
  background: #fff0b3;
  color: #795600;
}

.rank-second {
  background: #e9ecef;
  color: #343a40;
}

.rank-third {
  background: #f5dfd0;
  color: #854d27;
}

.rank-normal {
  background: #e7f1ff;
  color: #164e9c;
}

.pdf-print-area {
  display: none;
}

@media (max-width: 991px) {
  .average-result-page {
    width: 100%;
    margin-left: 0;
    padding-right: 12px;
    padding-left: 12px;
  }

  .result-summary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 576px) {
  .page-header {
    align-items: flex-start !important;
    flex-direction: column;
    gap: 12px;
  }

  .result-summary {
    grid-template-columns: 1fr;
  }
}

@media print {
  @page {
    size: A4 portrait;
    margin: 10mm;
  }

  :global(body *) {
    visibility: hidden !important;
  }

  .average-result-page {
    width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    background: #fff !important;
  }

  .pdf-print-area,
  .pdf-print-area * {
    visibility: visible !important;
  }

  .pdf-print-area {
    display: block !important;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    color: #000;
    background: #fff;
    font-family: Arial, sans-serif;
  }

  .pdf-institute-header {
    text-align: center;
    border-bottom: 2px solid #222;
    padding-bottom: 10px;
    margin-bottom: 15px;
  }

  .pdf-institute-header h2 {
    margin: 0 0 5px;
    font-size: 22px;
    font-weight: 700;
  }

  .pdf-institute-header p {
    margin: 2px 0;
    font-size: 11px;
  }

  .pdf-institute-header h3 {
    margin: 10px 0 0;
    font-size: 16px;
    font-weight: 700;
  }

  .pdf-details {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 7px 15px;
    margin-bottom: 15px;
    font-size: 11px;
  }

  .pdf-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 10px;
  }

  .pdf-table th,
  .pdf-table td {
    border: 1px solid #555;
    padding: 6px 5px;
    text-align: left;
  }

  .pdf-table thead {
    display: table-header-group;
  }

  .pdf-table th {
    background: #e9ecef !important;
    color: #000 !important;
    font-weight: 700;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .pdf-table td:nth-child(1),
  .pdf-table td:nth-child(4),
  .pdf-table td:nth-child(5),
  .pdf-table td:nth-child(6),
  .pdf-table td:nth-child(7) {
    text-align: center;
  }

  .pdf-table tr {
    page-break-inside: avoid;
  }

  .pdf-footer {
    margin-top: 15px;
    text-align: right;
    font-size: 10px;
  }
}
</style>
