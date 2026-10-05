<template>
  <div class="marksheet-wrapper py-5" v-if="resultData">
    <div class="container">
      <div class="marksheet-container position-relative bg-white p-4 p-md-5 mx-auto">
        <!-- ===================================================== -->
        <!-- LOGO WATERMARK -->
        <!-- ===================================================== -->
        <div v-if="institute?.logo" class="logo-watermark">
          <img
            :src="getLogoUrl(institute.logo)"
            :alt="institute?.institute_name || 'Institute Logo'"
          />
        </div>

        <!-- ===================================================== -->
        <!-- TOP HEADER -->
        <!-- ===================================================== -->
        <div class="text-center mb-4 position-relative z-1">
          <h3 class="header-title mb-1">
            {{ institute?.institute_name || 'Institute Name' }}
          </h3>

          <p class="text-muted mb-2">
            {{ institute?.location || 'DHAKA, BANGLADESH' }}
          </p>

          <h4 class="fw-bold text-dark border-bottom pb-2 d-inline-block px-4">
            {{ examType }} EXAMINATION -
            {{ examYear }}
          </h4>

          <h5 class="text-secondary mt-1">ACADEMIC TRANSCRIPT</h5>
        </div>

        <!-- ===================================================== -->
        <!-- STUDENT INFORMATION -->
        <!-- ===================================================== -->
        <table class="info-table mb-4 position-relative z-1">
          <tr>
            <!-- LEFT SIDE -->
            <td style="width: 55%; vertical-align: top">
              <table class="table table-sm table-borderless mb-0">
                <tr>
                  <td class="fw-bold" style="width: 140px">Student's Name</td>
                  <td>: {{ studentName }}</td>
                </tr>

                <tr>
                  <td class="fw-bold">Father's Name</td>
                  <td>: {{ fatherName }}</td>
                </tr>

                <tr>
                  <td class="fw-bold">Mother's Name</td>
                  <td>: {{ motherName }}</td>
                </tr>

                <tr>
                  <td class="fw-bold">Class / Batch</td>
                  <td>: {{ className }}</td>
                </tr>

                <!-- VERSION -->
                <tr>
                  <td class="fw-bold">Version</td>
                  <td>: {{ versionName }}</td>
                </tr>
              </table>
            </td>

            <!-- RIGHT SIDE -->
            <td style="width: 45%; vertical-align: top">
              <table class="table table-sm table-borderless mb-0">
                <tr>
                  <td class="fw-bold" style="width: 110px">Student ID.</td>
                  <td>: {{ studentId }}</td>
                </tr>

                <!-- GROUP / SECTION -->
                <tr>
                  <td class="fw-bold">
                    {{ isJuniorClass(className) ? 'Section' : 'Group' }}
                  </td>

                  <td>
                    :
                    {{ isJuniorClass(className) ? sectionName : groupName }}
                  </td>
                </tr>

                <tr>
                  <td class="fw-bold">Type</td>
                  <td>: {{ examType }}</td>
                </tr>

                <tr>
                  <td class="fw-bold">GPA</td>

                  <td>
                    :
                    <span class="badge bg-success fs-6">
                      {{ gpaWithAdditional }}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- ===================================================== -->
        <!-- MARKS / GRADES TABLE -->
        <!-- ===================================================== -->
        <div class="table-responsive position-relative z-1 mb-4">
          <table class="table table-bordered text-center align-middle">
            <thead class="table-success text-dark">
              <tr>
                <th style="width: 7%">Sl. No.</th>

                <th style="width: 38%; text-align: left; padding-left: 15px">Name of Subjects</th>

                <th style="width: 13%">Marks</th>

                <th style="width: 14%">Letter Grade</th>

                <th style="width: 14%">Grade Point</th>

                <th style="width: 14%">GPA (without additional)</th>
              </tr>
            </thead>

            <tbody>
              <!-- ================================================= -->
              <!-- MAIN SUBJECTS -->
              <!-- ================================================= -->
              <tr v-for="(subject, index) in mainSubjects" :key="subject.id || index">
                <td>{{ index + 1 }}.</td>

                <td class="text-start ps-3">
                  {{ getSubjectName(subject) }}
                </td>

                <!-- Marks -->
                <td>
                  {{ subject.marks ?? '-' }}
                </td>

                <!-- Grade -->
                <td>
                  {{ calculateGrade(subject.marks, subject.full_mark).grade }}
                </td>

                <!-- Point -->
                <td>
                  {{ calculateGrade(subject.marks, subject.full_mark).point }}
                </td>

                <!-- GPA Without Additional -->
                <td
                  v-if="index === 0"
                  :rowspan="mainSubjects.length"
                  class="fw-bold bg-light align-middle"
                >
                  {{ gpaWithoutAdditional }}
                </td>
              </tr>

              <!-- ================================================= -->
              <!-- ADDITIONAL SUBJECTS -->
              <!-- ================================================= -->
              <template
                v-for="(subject, index) in additionalSubjects"
                :key="'additional-' + (subject.id || index)"
              >
                <tr class="table-light additional-row">
                  <td>{{ mainSubjects.length + index + 1 }}.</td>

                  <td class="text-start ps-3 fw-bold">
                    {{ getSubjectName(subject) }}

                    <span class="badge bg-warning text-dark ms-2"> Additional </span>
                  </td>

                  <td>
                    {{ subject.marks ?? '-' }}
                  </td>

                  <td>
                    {{ calculateAdditionalGrade(subject.marks, subject.full_mark).grade }}
                  </td>

                  <td>
                    {{ calculateAdditionalGrade(subject.marks, subject.full_mark).point }}

                    <br />

                    <small class="text-muted"> (Additional) </small>
                  </td>

                  <td>-</td>
                </tr>
              </template>

              <!-- ================================================= -->
              <!-- NO SUBJECT -->
              <!-- ================================================= -->
              <tr v-if="mainSubjects.length === 0 && additionalSubjects.length === 0">
                <td colspan="6" class="text-center text-muted py-4">No subject result found.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- ===================================================== -->
        <!-- GRADING SYSTEM -->
        <!-- ===================================================== -->
        <div class="row position-relative z-1 mb-5">
          <!-- Grading Table -->
          <div class="col-7">
            <table class="table table-bordered grade-table text-center mb-0">
              <tr class="table-secondary">
                <th>Interval (%)</th>

                <th>Letter Grade</th>

                <th>Grade Point</th>
              </tr>

              <!-- Dynamic Grading System -->
              <tr v-for="grading in sortedGradingSystems" :key="grading.id">
                <td>
                  {{ getGradeRange(grading) }}
                </td>

                <td>
                  {{ grading.grade }}
                </td>

                <td>
                  {{ Number(grading.grade_point).toFixed(2) }}
                </td>
              </tr>

              <!-- No Grading System -->
              <tr v-if="sortedGradingSystems.length === 0">
                <td colspan="3" class="text-muted py-3">No grading system found.</td>
              </tr>
            </table>
          </div>

          <!-- Publication Date -->
          <div class="col-5 d-flex flex-column justify-content-center">
            <div class="p-3 border bg-light rounded text-center">
              <p class="mb-1 text-muted small">Date of Publication of Results</p>

              <p class="fw-bold mb-0">
                {{ resultData.publication_date || 'N/A' }}
              </p>
            </div>
          </div>
        </div>

        <!-- ===================================================== -->
        <!-- ADDITIONAL SUBJECT INFORMATION -->
        <!-- ===================================================== -->
        <div v-if="additionalSubjects.length" class="alert alert-info position-relative z-1 mb-4">
          <strong> Additional Subject: </strong>

          <span
            v-for="(subject, index) in additionalSubjects"
            :key="'info-' + (subject.id || index)"
          >
            {{ getSubjectName(subject) }}

            <span v-if="index < additionalSubjects.length - 1"> , </span>
          </span>

          <div class="small mt-1">
            Additional subject is shown separately from the main GPA calculation.
          </div>
        </div>

        <!-- ===================================================== -->
        <!-- SIGNATURES -->
        <!-- ===================================================== -->
        <div class="row text-center mt-5 position-relative z-1 pt-4">
          <div class="col-4">
            <div class="border-top border-dark pt-2 mx-auto" style="width: 80%">Prepared by</div>
          </div>

          <div class="col-4">
            <div class="border-top border-dark pt-2 mx-auto" style="width: 80%">Verified by</div>
          </div>

          <div class="col-4">
            <div class="border-top border-dark pt-2 mx-auto" style="width: 80%">
              Controller of Examinations
            </div>
          </div>
        </div>
      </div>

      <!-- ===================================================== -->
      <!-- BUTTONS -->
      <!-- ===================================================== -->
      <div class="text-center mb-5 no-print mt-4">
        <button @click="printMarksheet" class="btn btn-success px-4 py-2 fw-bold shadow-sm">
          🖨️ Print / Save A4 Marksheet
        </button>

        <router-link to="/result" class="btn btn-info px-4 py-2 fw-bold shadow-sm ms-2">
          <span> Back </span>
        </router-link>
      </div>
    </div>
  </div>

  <!-- ========================================================= -->
  <!-- LOADING -->
  <!-- ========================================================= -->
  <div v-else class="text-center py-5">
    <p class="fs-5 text-muted">Loading Result...</p>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'

// ============================================================
// ROUTE
// ============================================================
const route = useRoute()

// ============================================================
// RESULT DATA
// ============================================================
const resultData = ref(null)

// ============================================================
// INSTITUTE DATA
// ============================================================
const institute = ref(null)

// ============================================================
// GRADING SYSTEM DATA
// ============================================================
const gradingSystems = ref([])

// ============================================================
// FETCH INSTITUTE INFORMATION
// ============================================================
const fetchInstitute = async () => {
  try {
    const response = await api.get('/institute-info')

    institute.value = response.data?.data || null
  } catch (error) {
    console.error('Failed to fetch institute information:', error)
  }
}

// ============================================================
// FETCH GRADING SYSTEM
// ============================================================
const fetchGradingSystems = async () => {
  try {
    const response = await api.get('/grading-systems')

    gradingSystems.value = Array.isArray(response.data?.data) ? response.data.data : []
  } catch (error) {
    console.error('Failed to fetch grading systems:', error)

    gradingSystems.value = []
  }
}

// ============================================================
// SORTED GRADING SYSTEM
// ============================================================
const sortedGradingSystems = computed(() => {
  return [...gradingSystems.value].sort(
    (a, b) => Number(b.min_percentage) - Number(a.min_percentage),
  )
})

// ============================================================
// GRADE RANGE
// ============================================================
const getGradeRange = (grading) => {
  const sorted = sortedGradingSystems.value

  const index = sorted.findIndex((item) => item.id === grading.id)

  const min = Number(grading.min_percentage)

  // Highest grade
  if (index === 0) {
    return `${min}% - 100%`
  }

  const previous = sorted[index - 1]

  if (!previous) {
    return `${min}%+`
  }

  const upperLimit = Number(previous.min_percentage) - 0.01

  return `${min}% - ${upperLimit.toFixed(2)}%`
}

// ============================================================
// LOGO URL
// ============================================================
const getLogoUrl = (logo) => {
  if (!logo) {
    return ''
  }

  // If backend already returns complete URL
  if (logo.startsWith('http://') || logo.startsWith('https://')) {
    return logo
  }

  // Laravel storage path
  return `/storage/${logo}`
}

// ============================================================
// FETCH SINGLE RESULT
// ============================================================
const fetchSingleResult = async () => {
  const resultId = route.query.id

  if (!resultId) {
    console.error('No result ID provided in query params.')
    return
  }

  try {
    const response = await api.get(`/results/${resultId}`)

    console.log('RESULT SHOW RESPONSE:', response.data)

    // ========================================================
    // SUPPORT BOTH:
    // response.data.data
    // response.data.result
    // response.data
    // ========================================================
    const data = response.data?.data || response.data?.result || response.data

    resultData.value = data

    console.log('FINAL RESULT DATA:', resultData.value)
  } catch (error) {
    console.error('Error fetching result details:', error)

    resultData.value = null
  }
}

// ============================================================
// STUDENT NAME
// ============================================================
const studentName = computed(() => {
  return (
    resultData.value?.student_name ||
    resultData.value?.student?.full_name ||
    resultData.value?.student?.name ||
    'N/A'
  )
})

// ============================================================
// FATHER NAME
// ============================================================
const fatherName = computed(() => {
  return (
    resultData.value?.father_name ||
    resultData.value?.fatherName ||
    resultData.value?.student?.fathers_name ||
    resultData.value?.student?.father_name ||
    resultData.value?.student?.father ||
    'N/A'
  )
})

// ============================================================
// MOTHER NAME
// ============================================================
const motherName = computed(() => {
  return (
    resultData.value?.mother_name ||
    resultData.value?.motherName ||
    resultData.value?.student?.mothers_name ||
    resultData.value?.student?.mother_name ||
    resultData.value?.student?.mother ||
    'N/A'
  )
})

// ============================================================
// STUDENT ID
// ============================================================
const studentId = computed(() => {
  return (
    resultData.value?.student_id ||
    resultData.value?.roll ||
    resultData.value?.student?.student_id ||
    resultData.value?.student?.roll ||
    'N/A'
  )
})

// ============================================================
// CLASS NAME
// ============================================================
const className = computed(() => {
  return (
    resultData.value?.class_name ||
    resultData.value?.className ||
    resultData.value?.student?.class_info?.class_name ||
    resultData.value?.student?.class_info?.name ||
    resultData.value?.student?.classInfo?.class_name ||
    resultData.value?.student?.classInfo?.name ||
    resultData.value?.student?.class?.class_name ||
    resultData.value?.student?.class?.name ||
    'N/A'
  )
})

// ============================================================
// VERSION
// ============================================================
const versionName = computed(() => {
  return (
    resultData.value?.version ||
    resultData.value?.version_name ||
    resultData.value?.student?.version ||
    resultData.value?.student?.version_name ||
    'N/A'
  )
})

// ============================================================
// GROUP NAME
// ============================================================
const groupName = computed(() => {
  return (
    resultData.value?.group_name ||
    resultData.value?.student?.class_group?.group_name ||
    resultData.value?.student?.class_group?.name ||
    resultData.value?.student?.classGroup?.group_name ||
    resultData.value?.student?.classGroup?.name ||
    resultData.value?.student?.group?.group_name ||
    resultData.value?.student?.group?.name ||
    'N/A'
  )
})

// ============================================================
// SECTION NAME
// ============================================================
const sectionName = computed(() => {
  return (
    resultData.value?.section_name ||
    resultData.value?.student?.section?.section_name ||
    resultData.value?.student?.section?.name ||
    'N/A'
  )
})

// ============================================================
// EXAM TYPE
// ============================================================
const examType = computed(() => {
  return (
    resultData.value?.type ||
    resultData.value?.exam_type ||
    resultData.value?.exam?.examination_type ||
    resultData.value?.examination?.examination_type ||
    'N/A'
  )
})

// ============================================================
// EXAM YEAR
// ============================================================
const examYear = computed(() => {
  return (
    resultData.value?.year ||
    resultData.value?.exam_year ||
    resultData.value?.exam?.examination_year ||
    resultData.value?.examination?.examination_year ||
    'N/A'
  )
})

// ============================================================
// SUBJECT NAME
// ============================================================
// Backend subject object-এ name আছে.
// Fallback হিসেবে subject_name-ও রাখা হলো.
const getSubjectName = (subject) => {
  return (
    subject?.name ||
    subject?.subject_name ||
    subject?.subject?.name ||
    subject?.subject?.subject_name ||
    'N/A'
  )
}

// ============================================================
// CHECK ADDITIONAL SUBJECT
// ============================================================
const isAdditionalSubject = (subject) => {
  return (
    subject?.is_additional === true ||
    subject?.is_additional === 1 ||
    subject?.is_additional === '1'
  )
}

// ============================================================
// MAIN SUBJECTS
// ============================================================
const mainSubjects = computed(() => {
  if (!resultData.value || !Array.isArray(resultData.value.subjects)) {
    return []
  }

  return resultData.value.subjects.filter((subject) => !isAdditionalSubject(subject))
})

// ============================================================
// ADDITIONAL SUBJECTS
// ============================================================
const additionalSubjects = computed(() => {
  if (!resultData.value) {
    return []
  }

  // Backend থেকে সরাসরি additional_subject
  if (Array.isArray(resultData.value.additional_subject)) {
    return resultData.value.additional_subject
  }

  // Fallback: subjects থেকে বের করা
  if (Array.isArray(resultData.value.subjects)) {
    return resultData.value.subjects.filter((subject) => isAdditionalSubject(subject))
  }

  return []
})

// ============================================================
// NORMAL GRADE CALCULATOR
// ============================================================
const calculateGrade = (marks, fullMark = 100) => {
  if (marks === null || marks === undefined || marks === '') {
    return {
      grade: '-',
      point: '-',
    }
  }

  const obtainedMarks = Number(marks)

  const maximumMarks = Number(fullMark) || 100

  if (isNaN(obtainedMarks) || maximumMarks <= 0) {
    return {
      grade: '-',
      point: '-',
    }
  }

  // Percentage calculation
  const percentage = (obtainedMarks / maximumMarks) * 100

  // Dynamic grading system
  const grading = sortedGradingSystems.value.find(
    (item) => percentage >= Number(item.min_percentage),
  )

  if (!grading) {
    return {
      grade: '-',
      point: '-',
    }
  }

  return {
    grade: grading.grade,
    point: Number(grading.grade_point).toFixed(2),
  }
}

// ============================================================
// ADDITIONAL SUBJECT GRADE
// ============================================================
const calculateAdditionalGrade = (marks, fullMark = 100) => {
  return calculateGrade(marks, fullMark)
}

// ============================================================
// GPA WITHOUT ADDITIONAL SUBJECT
// ============================================================
const gpaWithoutAdditional = computed(() => {
  const main = mainSubjects.value

  if (!main.length) {
    return '-'
  }

  let totalPoint = 0
  let validSubjects = 0

  main.forEach((subject) => {
    const grade = calculateGrade(subject.marks, subject.full_mark)

    if (grade.point !== '-') {
      totalPoint += Number(grade.point)
      validSubjects++
    }
  })

  if (validSubjects === 0) {
    return '-'
  }

  const gpa = totalPoint / validSubjects

  return Math.min(gpa, 5).toFixed(2)
})

// ============================================================
// GPA WITH ADDITIONAL SUBJECT
// ============================================================
const gpaWithAdditional = computed(() => {
  if (!resultData.value) {
    return '-'
  }

  const main = mainSubjects.value
  const additional = additionalSubjects.value

  if (!main.length) {
    return '-'
  }

  let mainPointTotal = 0
  let validMainSubjects = 0

  // Main subjects GPA
  main.forEach((subject) => {
    const grade = calculateGrade(subject.marks, subject.full_mark)

    if (grade.point !== '-') {
      mainPointTotal += Number(grade.point)

      validMainSubjects++
    }
  })

  if (validMainSubjects === 0) {
    return '-'
  }

  // Additional subject bonus
  let additionalBonus = 0

  additional.forEach((subject) => {
    const grade = calculateAdditionalGrade(subject.marks, subject.full_mark)

    if (grade.point !== '-') {
      const point = Number(grade.point)

      // Additional GP থেকে 2 বাদ দিয়ে bonus
      if (point > 2) {
        additionalBonus += point - 2
      }
    }
  })

  // Final GPA
  const finalGpa = (mainPointTotal + additionalBonus) / validMainSubjects

  // Maximum GPA 5.00
  return Math.min(finalGpa, 5).toFixed(2)
})

// ============================================================
// JUNIOR CLASS CHECK
// ============================================================
const isJuniorClass = (classNameValue) => {
  if (!classNameValue) {
    return false
  }

  const numericClass = parseInt(classNameValue.toString().replace(/\D/g, ''), 10)

  if (!isNaN(numericClass)) {
    return numericClass >= 1 && numericClass <= 8
  }

  const juniorClasses = [
    'one',
    'two',
    'three',
    'four',
    'five',
    'six',
    'seven',
    'eight',
    'class 1',
    'class 2',
    'class 3',
    'class 4',
    'class 5',
    'class 6',
    'class 7',
    'class 8',
  ]

  return juniorClasses.some((c) => classNameValue.toString().toLowerCase().includes(c))
}

// ============================================================
// PRINT
// ============================================================
const printMarksheet = () => {
  window.print()
}

// ============================================================
// MOUNT
// ============================================================
onMounted(() => {
  fetchInstitute()
  fetchGradingSystems()
  fetchSingleResult()
})
</script>

<style scoped>
/* =========================================================
   MARKSHEET WRAPPER
========================================================= */
.marksheet-wrapper {
  background-color: #f2f4f7;
  font-family: 'Arial', sans-serif;
  min-height: 100vh;
}

/* =========================================================
   MARKSHEET CONTAINER
========================================================= */
.marksheet-container {
  max-width: 850px;
  border: 5px solid #198754;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

/* =========================================================
   LOGO WATERMARK
========================================================= */
.logo-watermark {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 430px;
  height: 430px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 0;
  pointer-events: none;
  user-select: none;
}

/* =========================================================
   WATERMARK IMAGE
========================================================= */
.logo-watermark img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  opacity: 0.055;
  filter: grayscale(100%);
}

/* =========================================================
   HEADER
========================================================= */
.header-title {
  color: #198754;
  font-weight: bold;
}

/* =========================================================
   INFORMATION TABLE
========================================================= */
.info-table {
  width: 100%;
  border-collapse: collapse;
}

/* =========================================================
   TABLE
========================================================= */
.table-bordered th,
.table-bordered td {
  border-color: #dee2e6 !important;
  vertical-align: middle;
}

/* =========================================================
   GRADING TABLE
========================================================= */
.grade-table th,
.grade-table td {
  font-size: 0.85rem;
  padding: 4px;
}

/* =========================================================
   ADDITIONAL SUBJECT
========================================================= */
.additional-row {
  border-top: 2px solid #ffc107 !important;
}

/* =========================================================
   PRINT
========================================================= */
@media print {
  @page {
    size: A4 portrait;
    margin: 10mm;
  }

  body {
    background-color: #fff;
  }

  .marksheet-wrapper {
    background-color: #fff;
    padding: 0 !important;
  }

  .marksheet-container {
    border: 3px solid #000;
    box-shadow: none;
    margin: 0;
    padding: 15px !important;
    width: 100%;
    max-width: 100%;
    overflow: hidden;
  }

  /* Keep logo watermark in print */
  .logo-watermark {
    display: flex !important;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .logo-watermark img {
    opacity: 0.055;
  }

  .no-print {
    display: none !important;
  }
}

/* =========================================================
   MOBILE
========================================================= */
@media (max-width: 576px) {
  .marksheet-container {
    border-width: 3px;
    padding: 15px !important;
  }

  .logo-watermark {
    width: 300px;
    height: 300px;
  }

  .header-title {
    font-size: 20px;
  }
}
</style>
