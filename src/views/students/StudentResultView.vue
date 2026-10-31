<template>
  <div class="academic-results-page">
    <StudentsDashboardMenueView />

    <main class="results-main">
      <!-- PAGE HEADER -->
      <div class="page-header">
        <div>
          <h2>Academic Results</h2>
          <p>View your examination results and academic performance.</p>
        </div>
      </div>

      <!-- SUMMARY CARDS -->
      <div class="summary-grid">
        <div class="summary-card card-gpa">
          <div class="summary-icon">
            <i class="fas fa-graduation-cap"></i>
          </div>
          <div>
            <p>Average GPA</p>
            <h3>{{ averageGpa.toFixed(2) }} <small>/ 5.00</small></h3>
          </div>
        </div>

        <div class="summary-card card-exams">
          <div class="summary-icon">
            <i class="fas fa-book-open"></i>
          </div>
          <div>
            <p>Total Examinations</p>
            <h3>{{ results.length }}</h3>
          </div>
        </div>

        <div class="summary-card card-percentage">
          <div class="summary-icon">
            <i class="fas fa-chart-line"></i>
          </div>
          <div>
            <p>Overall Percentage</p>
            <h3>{{ overallPercentage.toFixed(2) }}%</h3>
          </div>
        </div>

        <div class="summary-card card-pass">
          <div class="summary-icon">
            <i class="fas fa-award"></i>
          </div>
          <div>
            <p>Passed Examinations</p>
            <h3>
              {{ passedCount }}
              <small>/ {{ results.length }}</small>
            </h3>
          </div>
        </div>
      </div>

      <!-- RESULTS SECTION -->
      <section class="results-card">
        <div class="results-card-header">
          <div>
            <h4>Examination History</h4>
            <p>All available examination results</p>
          </div>

          <button type="button" class="btn-refresh" @click="fetchResults" :disabled="loading">
            <i class="fas" :class="loading ? 'fa-spinner fa-spin' : 'fa-sync-alt'"></i>
            Refresh
          </button>
        </div>

        <!-- SEARCH AND FILTERS -->
        <div class="filter-area">
          <div class="search-box">
            <i class="fas fa-search"></i>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search exam, year or session..."
            />
          </div>

          <select v-model="selectedYear" class="filter-select">
            <option value="">All Years</option>
            <option v-for="year in availableYears" :key="year" :value="String(year)">
              {{ year }}
            </option>
          </select>

          <select v-model="selectedExam" class="filter-select">
            <option value="">All Examinations</option>
            <option v-for="exam in availableExams" :key="exam" :value="exam">
              {{ exam }}
            </option>
          </select>

          <button type="button" class="btn-reset" @click="resetFilters">Reset</button>
        </div>

        <!-- LOADING -->
        <div v-if="loading" class="state-message">
          <i class="fas fa-spinner fa-spin"></i>
          <p>Loading examination results...</p>
        </div>

        <!-- ERROR -->
        <div v-else-if="errorMessage" class="state-message error-state">
          <i class="fas fa-exclamation-circle"></i>
          <p>{{ errorMessage }}</p>
          <button class="btn-refresh" @click="fetchResults">Try Again</button>
        </div>

        <!-- EMPTY -->
        <div v-else-if="filteredResults.length === 0" class="state-message">
          <i class="fas fa-folder-open"></i>
          <p>
            {{
              results.length
                ? 'No results match your search or filters.'
                : 'No examination results are available yet.'
            }}
          </p>
        </div>

        <!-- RESULTS TABLE -->
        <div v-else class="table-responsive">
          <table class="results-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Examination</th>
                <th>Year</th>
                <th>Academic Session</th>
                <th>Obtained Marks</th>
                <th>Total Marks</th>
                <th>Percentage</th>
                <th>GPA</th>
                <th>Status</th>
                <th>Marksheet</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="(result, index) in paginatedResults" :key="result.id">
                <td>{{ (currentPage - 1) * perPage + index + 1 }}</td>

                <td>
                  <div class="exam-name">
                    <span class="exam-icon">
                      <i class="fas fa-file-alt"></i>
                    </span>
                    <div>
                      <strong>{{ result.exam_type || 'Examination' }}</strong>
                      <small v-if="result.class_name">
                        {{ result.class_name }}
                      </small>
                    </div>
                  </div>
                </td>

                <td>{{ result.exam_year || '—' }}</td>

                <td>{{ result.academic_session || '—' }}</td>

                <td class="numeric-cell">
                  {{ formatNumber(result.obtained_marks) }}
                </td>

                <td class="numeric-cell">
                  {{ formatNumber(result.total_marks) }}
                </td>

                <td>
                  <div class="percentage-cell">
                    <span>{{ formatNumber(result.percentage) }}%</span>
                    <div class="progress-track">
                      <div
                        class="progress-fill"
                        :style="{
                          width: `${Math.min(100, Math.max(0, Number(result.percentage) || 0))}%`,
                        }"
                      ></div>
                    </div>
                  </div>
                </td>

                <td>
                  <span class="gpa-value">
                    {{ formatNumber(result.gpa) }}
                  </span>
                </td>

                <td>
                  <span
                    class="status-badge"
                    :class="
                      String(result.status).toLowerCase() === 'pass' ? 'status-pass' : 'status-fail'
                    "
                  >
                    {{ result.status || '—' }}
                  </span>
                </td>

                <td>
                  <a
                    class="btn-pdf"
                    :href="`/resultShow?id=${encodeURIComponent(result.id)}`"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="View and print marksheet"
                  >
                    <i class="fas fa-file-pdf"></i>
                    PDF
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- PAGINATION -->
        <div v-if="!loading && !errorMessage && filteredResults.length" class="pagination-area">
          <p>
            Showing
            <strong>{{ firstItem }}</strong>
            to
            <strong>{{ lastItem }}</strong>
            of
            <strong>{{ filteredResults.length }}</strong>
            results
          </p>

          <div class="pagination-buttons">
            <button type="button" :disabled="currentPage === 1" @click="currentPage--">
              <i class="fas fa-chevron-left"></i>
            </button>

            <button
              v-for="page in visiblePages"
              :key="page"
              type="button"
              :class="{ active: currentPage === page }"
              @click="currentPage = page"
            >
              {{ page }}
            </button>

            <button type="button" :disabled="currentPage === totalPages" @click="currentPage++">
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </section>

      <div class="results-footer">
        <span>
          <i class="fas fa-shield-alt"></i>
          Your academic results are private.
        </span>
        <span>Academic Results</span>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import api from '@/services/api'
import StudentsDashboardMenueView from './StudentsDashboardMenueView.vue'

const results = ref([])
const loading = ref(false)
const errorMessage = ref('')

const searchQuery = ref('')
const selectedYear = ref('')
const selectedExam = ref('')

const currentPage = ref(1)
const perPage = 10

const formatNumber = (value) => {
  const number = Number(value)
  return Number.isFinite(number) ? number.toFixed(2) : '0.00'
}

const fetchResults = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await api.get('/student/results')

    const responseData = response?.data ?? {}
    const resultData = responseData.results

    results.value = Array.isArray(resultData)
      ? resultData
      : Array.isArray(resultData?.data)
        ? resultData.data
        : []

    results.value = [...results.value].sort((a, b) => {
      const yearDifference = (Number(b.exam_year) || 0) - (Number(a.exam_year) || 0)

      return yearDifference || (Number(b.id) || 0) - (Number(a.id) || 0)
    })
  } catch (error) {
    console.error('Failed to load student results:', error)

    results.value = []
    errorMessage.value =
      error?.response?.data?.message || 'Unable to load examination results. Please try again.'
  } finally {
    loading.value = false
  }
}

const availableYears = computed(() => {
  return [
    ...new Set(
      results.value
        .map((result) => result.exam_year)
        .filter((year) => year !== null && year !== undefined && year !== '')
        .map(String),
    ),
  ].sort((a, b) => Number(b) - Number(a))
})

const availableExams = computed(() => {
  return [
    ...new Set(results.value.map((result) => result.exam_type).filter((exam) => Boolean(exam))),
  ].sort((a, b) => String(a).localeCompare(String(b)))
})

const filteredResults = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  return results.value.filter((result) => {
    const matchesSearch =
      !query ||
      [
        result.exam_type,
        result.exam_year,
        result.academic_session,
        result.class_name,
        result.section_name,
        result.shift_name,
        result.class_group_name,
      ].some((value) =>
        String(value ?? '')
          .toLowerCase()
          .includes(query),
      )

    const matchesYear = !selectedYear.value || String(result.exam_year) === selectedYear.value

    const matchesExam = !selectedExam.value || result.exam_type === selectedExam.value

    return matchesSearch && matchesYear && matchesExam
  })
})

const averageGpa = computed(() => {
  if (!results.value.length) return 0

  const total = results.value.reduce((sum, result) => sum + (Number(result.gpa) || 0), 0)

  return total / results.value.length
})

const overallPercentage = computed(() => {
  const totalObtained = results.value.reduce(
    (sum, result) => sum + (Number(result.obtained_marks) || 0),
    0,
  )

  const totalMarks = results.value.reduce(
    (sum, result) => sum + (Number(result.total_marks) || 0),
    0,
  )

  return totalMarks > 0 ? (totalObtained / totalMarks) * 100 : 0
})

const passedCount = computed(() => {
  return results.value.filter((result) => String(result.status).toLowerCase() === 'pass').length
})

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(filteredResults.value.length / perPage))
})

const paginatedResults = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return filteredResults.value.slice(start, start + perPage)
})

const firstItem = computed(() => {
  return filteredResults.value.length ? (currentPage.value - 1) * perPage + 1 : 0
})

const lastItem = computed(() => {
  return Math.min(currentPage.value * perPage, filteredResults.value.length)
})

const visiblePages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  const start = Math.max(1, Math.min(current - 2, total - 4))
  const end = Math.min(total, start + 4)

  return Array.from({ length: end - start + 1 }, (_, index) => start + index)
})

const resetFilters = () => {
  searchQuery.value = ''
  selectedYear.value = ''
  selectedExam.value = ''
  currentPage.value = 1
}

watch([searchQuery, selectedYear, selectedExam], () => {
  currentPage.value = 1
})

watch(totalPages, (total) => {
  if (currentPage.value > total) currentPage.value = total
})

onMounted(fetchResults)
</script>

<style scoped>
.academic-results-page {
  min-height: 100vh;
  background: #f5f7fb;
  color: #263247;
}

.results-main {
  margin-left: 260px;
  padding: 30px;
  min-width: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 26px;
}

.page-header h2 {
  margin: 0 0 7px;
  font-size: 27px;
  font-weight: 750;
  color: #1d2939;
}

.page-header p {
  margin: 0;
  font-size: 14px;
  color: #7b8798;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
  margin-bottom: 25px;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 15px;
  min-height: 125px;
  padding: 22px 20px;
  border-radius: 15px;
  color: #fff;
  box-shadow: 0 8px 22px rgba(30, 50, 90, 0.08);
}

.card-gpa {
  background: linear-gradient(135deg, #5669e8, #7585f6);
}

.card-exams {
  background: linear-gradient(135deg, #159d9a, #36c5b3);
}

.card-percentage {
  background: linear-gradient(135deg, #e58b35, #f4b85d);
}

.card-pass {
  background: linear-gradient(135deg, #269c68, #4bc58b);
}

.summary-icon {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 13px;
  background: rgba(255, 255, 255, 0.2);
  font-size: 21px;
}

.summary-card p {
  margin: 0 0 9px;
  font-size: 13px;
  opacity: 0.92;
}

.summary-card h3 {
  margin: 0;
  font-size: 27px;
  font-weight: 750;
  line-height: 1.2;
}

.summary-card h3 small {
  font-size: 13px;
  font-weight: 500;
}

.results-card {
  overflow: hidden;
  border: 1px solid #e9edf4;
  border-radius: 15px;
  background: #fff;
  box-shadow: 0 5px 20px rgba(25, 42, 70, 0.035);
}

.results-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  padding: 23px 24px;
  border-bottom: 1px solid #edf0f5;
}

.results-card-header h4 {
  margin: 0 0 6px;
  font-size: 17px;
  font-weight: 750;
  color: #263247;
}

.results-card-header p {
  margin: 0;
  color: #8792a2;
  font-size: 13px;
}

.btn-refresh,
.btn-reset {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 9px 13px;
  border: 1px solid #dce3ee;
  border-radius: 8px;
  background: #fff;
  color: #44536a;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.btn-refresh:disabled {
  opacity: 0.65;
  cursor: wait;
}

.filter-area {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  padding: 18px 24px;
  border-bottom: 1px solid #edf0f5;
}

.search-box {
  position: relative;
  flex: 1 1 250px;
  min-width: 180px;
}

.search-box i {
  position: absolute;
  left: 13px;
  top: 50%;
  transform: translateY(-50%);
  color: #98a3b3;
  font-size: 13px;
}

.search-box input,
.filter-select {
  width: 100%;
  height: 40px;
  padding: 0 12px;
  outline: none;
  border: 1px solid #e0e6ef;
  border-radius: 8px;
  background: #fff;
  color: #36445a;
  font-size: 13px;
}

.search-box input {
  padding-left: 36px;
}

.search-box input:focus,
.filter-select:focus {
  border-color: #7182f2;
  box-shadow: 0 0 0 3px rgba(91, 110, 225, 0.09);
}

.filter-select {
  flex: 0 1 175px;
}

.btn-reset {
  height: 40px;
}

.table-responsive {
  width: 100%;
  overflow-x: auto;
}

.results-table {
  width: 100%;
  min-width: 1120px;
  border-collapse: separate;
  border-spacing: 0;
}

.results-table thead th {
  padding: 15px 13px;
  border-bottom: 1px solid #e9edf4;
  background: #f9faff;
  color: #758196;
  text-align: left;
  white-space: nowrap;
  font-size: 11px;
  font-weight: 750;
  text-transform: uppercase;
  letter-spacing: 0.35px;
}

.results-table tbody td {
  padding: 16px 13px;
  border-bottom: 1px solid #edf0f5;
  color: #4c596d;
  vertical-align: middle;
  font-size: 13px;
}

.results-table tbody tr:last-child td {
  border-bottom: none;
}

.results-table tbody tr:hover {
  background: #fbfcff;
}

.exam-name {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 150px;
}

.exam-icon {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 9px;
  background: #eef0ff;
  color: #6474e8;
}

.exam-name strong {
  display: block;
  color: #2c374a;
  font-size: 13px;
  font-weight: 700;
}

.exam-name small {
  display: block;
  margin-top: 4px;
  color: #909bad;
  font-size: 11px;
}

.numeric-cell {
  font-variant-numeric: tabular-nums;
  font-weight: 600;
}

.percentage-cell {
  min-width: 90px;
  font-weight: 650;
  color: #344258;
}

.progress-track {
  width: 75px;
  height: 5px;
  margin-top: 7px;
  overflow: hidden;
  border-radius: 10px;
  background: #e9edf5;
}

.progress-fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #6577ed, #40bda6);
}

.gpa-value {
  display: inline-block;
  min-width: 44px;
  padding: 5px 8px;
  border-radius: 6px;
  background: #f0f2ff;
  color: #5d6dde;
  text-align: center;
  font-weight: 750;
}

.status-badge {
  display: inline-block;
  padding: 6px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 750;
  text-transform: capitalize;
}

.status-pass {
  background: #e7f8ef;
  color: #218653;
}

.status-fail {
  background: #fff0f0;
  color: #d34b55;
}

.btn-pdf {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 11px;
  border: 1px solid #dfe4ff;
  border-radius: 7px;
  background: #f0f2ff;
  color: #586be0;
  text-decoration: none;
  white-space: nowrap;
  font-size: 12px;
  font-weight: 750;
  transition: 0.2s ease;
}

.btn-pdf:hover {
  border-color: #5f72e8;
  background: #5f72e8;
  color: #fff;
}

.state-message {
  display: flex;
  min-height: 220px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 25px;
  color: #8591a4;
  text-align: center;
}

.state-message > i {
  color: #7888ed;
  font-size: 30px;
}

.state-message p {
  margin: 0;
  font-size: 14px;
}

.error-state > i {
  color: #d9534f;
}

.pagination-area {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  padding: 18px 24px;
  border-top: 1px solid #edf0f5;
}

.pagination-area p {
  margin: 0;
  color: #8792a2;
  font-size: 12px;
}

.pagination-area p strong {
  color: #4a576b;
}

.pagination-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.pagination-buttons button {
  display: grid;
  place-items: center;
  min-width: 32px;
  height: 32px;
  padding: 0 8px;
  border: 1px solid #e0e6ef;
  border-radius: 7px;
  background: #fff;
  color: #66748a;
  font-size: 12px;
  cursor: pointer;
}

.pagination-buttons button.active {
  border-color: #6576e9;
  background: #6576e9;
  color: #fff;
}

.pagination-buttons button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.results-footer {
  display: flex;
  justify-content: space-between;
  gap: 15px;
  padding: 20px 3px;
  color: #98a2b1;
  font-size: 12px;
}

.results-footer i {
  margin-right: 5px;
  color: #38a878;
}

@media (max-width: 1200px) {
  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .results-main {
    padding: 24px;
  }
}

@media (max-width: 768px) {
  .results-main {
    margin-left: 0;
    padding: 18px 12px;
  }

  .page-header h2 {
    font-size: 23px;
  }

  .summary-grid {
    gap: 12px;
  }

  .summary-card {
    min-height: 105px;
    gap: 10px;
    padding: 15px 12px;
  }

  .summary-icon {
    width: 38px;
    height: 38px;
    font-size: 17px;
  }

  .summary-card p {
    font-size: 11px;
  }

  .summary-card h3 {
    font-size: 22px;
  }

  .results-card-header {
    padding: 18px 15px;
  }

  .filter-area {
    padding: 15px;
  }

  .search-box {
    flex-basis: 100%;
  }

  .filter-select {
    flex: 1 1 130px;
  }

  .pagination-area {
    align-items: flex-start;
    flex-direction: column;
    padding: 16px;
  }

  .results-footer {
    flex-direction: column;
  }
}

@media (max-width: 420px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>
