<template>
  <div class="result-landscape-page py-4">
    <!-- ================= ACTION BUTTONS ================= -->
    <div
      v-if="resultData"
      class="container-fluid px-4 mb-3 action-buttons-wrapper"
      style="max-width: 1400px"
    >
      <div class="d-flex justify-content-end gap-2">
        <button type="button" class="btn btn-outline-secondary action-btn" @click="printResult">
          <i class="bi bi-printer me-2"></i>
          Print
        </button>

        <button
          type="button"
          class="btn btn-dark action-btn"
          :disabled="downloading"
          @click="downloadPdf"
        >
          <span
            v-if="downloading"
            class="spinner-border spinner-border-sm me-2"
            role="status"
          ></span>

          <i v-else class="bi bi-file-earmark-pdf me-2"></i>

          {{ downloading ? 'Generating PDF...' : 'Download PDF' }}
        </button>
      </div>
    </div>

    <!-- ================= PDF / PRINT AREA ================= -->
    <div ref="resultPdf" class="container-fluid width-fix px-4" style="max-width: 1400px">
      <!-- Loading -->
      <div v-if="loading" class="d-flex justify-content-center align-items-center py-5">
        <div class="text-center">
          <div class="spinner-border text-secondary mb-3" role="status"></div>
          <p class="text-muted small mb-0">Loading transcript...</p>
        </div>
      </div>

      <!-- Error -->
      <div v-else-if="errorMessage" class="alert alert-danger rounded-0">
        <i class="bi bi-exclamation-triangle me-2"></i>
        {{ errorMessage }}
      </div>

      <!-- Result Card -->
      <div v-else-if="resultData" class="card result-card border position-relative overflow-hidden">
        <!-- ================= WATERMARK ================= -->
        <div class="watermark-container">
          <img src="/icon.jpg" alt="Watermark" class="watermark-img" />
        </div>

        <!-- ===================================================== -->
        <!-- SCHOOL HEADER -->
        <!-- ===================================================== -->
        <div
          class="card-header school-header text-center py-3 bg-transparent border-bottom position-relative z-1"
        >
          <div class="row align-items-center">
            <div class="col-2 text-start ps-4"></div>

            <div class="col-8 font-size-institute">
              <h3 class="fw-bold font-size text-dark mb-1 tracking-normal font-sans">
                {{ instituteName }}
              </h3>

              <p v-if="instituteAddress" class="text-muted small mb-1">
                {{ instituteAddress }}
              </p>

              <p v-if="instituteContact" class="text-muted tiny mb-0">
                {{ instituteContact }}
              </p>
            </div>

            <div class="col-2 text-end pe-4">
              <span class="text-muted tiny d-block"> Publication Date: </span>

              <strong class="small text-dark font-monospace">
                {{ publicationDate }}
              </strong>
            </div>
          </div>

          <div class="mt-3">
            <h6
              class="fw-bold text-uppercase text-secondary tracking-wide d-inline-block border-bottom border-1 border-secondary pb-1 px-3 mb-0"
            >
              ACADEMIC TRANSCRIPT &mdash; {{ selectedYear }}
            </h6>
          </div>
        </div>

        <!-- ===================================================== -->
        <!-- CARD BODY -->
        <!-- ===================================================== -->
        <div class="card-body p-4 bg-transparent position-relative z-1">
          <!-- =================================================== -->
          <!-- STUDENT INFO BAR -->
          <!-- =================================================== -->
          <div class="student-info-bar p-3 mb-4 border shadow-sm">
            <div class="row align-items-center g-3">
              <!-- Student Photo -->
              <div class="col-auto">
                <div
                  class="student-photo-sm bg-white border d-flex align-items-center justify-content-center overflow-hidden"
                >
                  <img
                    v-if="student.image"
                    :src="getImageUrl(student)"
                    class="student-photo-image"
                    alt="Student Photo"
                  />

                  <div v-else class="text-center text-muted">
                    <i class="bi bi-person fs-4 text-secondary"></i>
                    <small class="tiny d-block">Photo</small>
                  </div>
                </div>
              </div>

              <!-- Student Information Details -->
              <div class="col">
                <div class="row row-cols-2 row-cols-lg-4 g-2 text-dark small">
                  <div>
                    <span class="text-muted">Name:</span>
                    <strong class="text-dark ms-1">
                      {{ student.name || '-' }}
                    </strong>
                  </div>

                  <div>
                    <span class="text-muted">Student ID:</span>
                    <span class="ms-1 font-monospace">
                      {{ student.studentId || '-' }}
                    </span>
                  </div>

                  <div>
                    <span class="text-muted">Shift:</span>
                    <span class="ms-1">
                      {{ student.shift || '-' }}
                    </span>
                  </div>

                  <div>
                    <span class="text-muted"></span>

                    {{ student.class || '-' }}
                  </div>

                  <div>
                    <span class="text-muted">Version:</span>
                    <span class="ms-1">
                      {{ student.version || '-' }}
                    </span>
                  </div>

                  <div>
                    <span class="text-muted">Group:</span>
                    <span class="ms-1">
                      {{ student.group || '-' }}
                    </span>
                  </div>

                  <div>
                    <span class="text-muted">Section:</span>
                    <span class="ms-1">
                      {{ student.section || '-' }}
                    </span>
                  </div>

                  <div>
                    <span class="text-muted">Roll:</span>
                    <span class="ms-1 font-monospace fw-semibold">
                      {{ student.roll || '-' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- =================================================== -->
          <!-- MARKS TABLE -->
          <!-- =================================================== -->
          <div v-if="processedSubjects.length" class="table-responsive mb-4">
            <table
              class="table table-bordered custom-result-table align-middle text-center mb-0 shadow-sm"
            >
              <!-- HEADER -->
              <thead>
                <tr class="table-light">
                  <th class="align-middle text-start ps-3 py-2 text-dark" style="width: 25%">
                    Subject Name
                  </th>

                  <th class="align-middle py-2 text-dark" style="width: 8%">Full Marks</th>

                  <th
                    v-for="exam in exams"
                    :key="exam.id"
                    class="py-2 text-dark"
                    style="width: 12%"
                  >
                    {{ exam.name }}<br />

                    <span class="tiny text-muted fw-normal">
                      ({{ formatPercentage(exam.percentage) }})
                    </span>
                  </th>

                  <th class="align-middle py-2 text-dark" style="width: 10%">Obtained Total</th>

                  <th class="align-middle py-2 text-dark" style="width: 10%">Letter Grade</th>

                  <th class="align-middle py-2 text-dark" style="width: 10%">Grade Point</th>
                </tr>
              </thead>

              <!-- BODY -->
              <tbody>
                <tr v-for="(subject, index) in processedSubjects" :key="subject.id || index">
                  <td class="text-start ps-3 fw-semibold text-dark py-2">
                    {{ subject.name }}
                  </td>

                  <td class="text-secondary py-2">
                    {{ displayFullMark(subject) }}
                  </td>

                  <td
                    v-for="exam in exams"
                    :key="`${subject.id}-${exam.id}`"
                    class="font-monospace py-2"
                  >
                    {{ getExamMarks(subject, exam.id) }}
                  </td>

                  <td class="fw-semibold text-dark font-monospace py-2">
                    {{ subject.obtainedTotal }}
                  </td>

                  <td class="py-2">
                    <span class="fw-semibold text-dark">
                      {{ subject.letterGrade }}
                    </span>
                  </td>

                  <td class="font-monospace py-2">
                    {{ subject.gradePoint }}
                  </td>
                </tr>
              </tbody>

              <!-- FOOTER / SUMMARY -->
              <tfoot>
                <tr class="table-light fw-bold">
                  <td :colspan="2 + exams.length" class="text-end ps-3 text-dark py-2.5">
                    Total Weighted Score:
                  </td>

                  <td colspan="3" class="text-start ps-3 text-dark fs-6 py-2.5">
                    <span class="font-monospace">
                      {{ totalObtainedMarks }}
                    </span>

                    <span class="text-muted fw-normal small ms-2">
                      (GPA:
                      <strong class="text-dark font-monospace"> {{ overallGPA }} </strong>)
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <!-- No Subjects -->
          <div v-else class="alert alert-light border text-center text-muted">
            <i class="bi bi-info-circle me-2"></i>
            No result subjects were found for this student.
          </div>

          <!-- =================================================== -->
          <!-- SIGNATURES -->
          <!-- =================================================== -->
          <div class="row text-center g-4 mt-4 pt-3 border-top">
            <div class="col-4">
              <div class="signature-area px-3">
                <div class="signature-space mb-2"></div>

                <div class="border-top border-secondary w-75 mx-auto pt-2">
                  <p class="fw-semibold mb-0 tiny text-dark text-uppercase tracking-wide">
                    Class Teacher's Signature
                  </p>
                </div>
              </div>
            </div>

            <div class="col-4">
              <div class="signature-area px-3">
                <div class="signature-space mb-2"></div>

                <div class="border-top border-secondary w-75 mx-auto pt-2">
                  <p class="fw-semibold mb-0 tiny text-dark text-uppercase tracking-wide">
                    Assistant Head Teacher
                  </p>

                  <small class="text-muted tiny"> Shift In-Charge </small>
                </div>
              </div>
            </div>

            <div class="col-4">
              <div class="signature-area px-3">
                <div class="signature-space mb-2"></div>

                <div class="border-top border-secondary w-75 mx-auto pt-2">
                  <p class="fw-semibold mb-0 tiny text-dark text-uppercase tracking-wide">
                    Principal / Headmaster
                  </p>

                  <small class="text-muted tiny"> Authorized Signature </small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ===================================================== -->
        <!-- CARD FOOTER -->
        <!-- ===================================================== -->
        <div
          class="card-footer bg-transparent text-muted d-flex justify-content-between align-items-center py-2 px-4 tiny border-top position-relative z-1"
        >
          <span> System: {{ softwareDeveloper }} </span>

          <span> Prepared by: {{ preparedBy }} </span>

          <span> Printed: {{ printDate }} </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/services/api'
import { getImageUrl } from '@/utils/img'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

const route = useRoute()

const loading = ref(true)
const errorMessage = ref('')
const resultData = ref(null)
const student = ref({})
const exams = ref([])
const subjects = ref([])
const resultPdf = ref(null)
const downloading = ref(false)

const selectedYear = computed(() => {
  return route.query.year || ''
})

const selectedStudentId = computed(() => {
  return route.query.student_id || ''
})

const instituteName = ref('Institute Name')
const instituteAddress = ref('')
const instituteContact = ref('')

const softwareDeveloper = ref('ADDIE Soft Ltd.')
const preparedBy = ref('IT Section')

const currentDate = new Date()

const formatDate = (date) => {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()

  return `${day}-${month}-${year}`
}

const publicationDate = computed(() => {
  return formatDate(currentDate)
})

const printDate = computed(() => {
  return formatDate(currentDate)
})

const loadInstituteInfo = async () => {
  try {
    const response = await api.get('/institute-info')

    if (!response.data?.success) {
      return
    }

    const data = response.data?.data

    if (!data) {
      return
    }

    instituteName.value = data.institute_name || 'Institute Name'
    instituteAddress.value = data.location || ''

    const contactParts = []

    if (data.contact) {
      contactParts.push(`Contact: ${data.contact}`)
    }

    if (data.email) {
      contactParts.push(`Email: ${data.email}`)
    }

    instituteContact.value = contactParts.join(' | ')
  } catch (error) {
    console.error('Institute information loading error:', error)
  }
}

const loadFinalResult = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    if (!selectedYear.value) {
      throw new Error('Examination year is missing.')
    }

    if (!selectedStudentId.value) {
      throw new Error('Student ID is missing.')
    }

    const response = await api.get(`/final-results/student/${selectedStudentId.value}`, {
      params: {
        year: selectedYear.value,
      },
    })

    if (!response.data?.status) {
      throw new Error(response.data?.message || 'Unable to load final result.')
    }

    resultData.value = response.data

    student.value = response.data.student || {}

    if (!student.value.studentId && student.value.student_id) {
      student.value.studentId = student.value.student_id
    }

    exams.value = response.data.exams || []
    subjects.value = response.data.subjects || []
  } catch (error) {
    console.error('Final result loading error:', error)

    errorMessage.value =
      error.response?.data?.message || error.message || 'Failed to load final result.'
  } finally {
    loading.value = false
  }
}

const processedSubjects = computed(() => {
  return subjects.value.map((subject) => {
    const obtainedTotal = Number(subject.obtained_total ?? 0)

    const gradeInfo = calculateGradeAndPoint(obtainedTotal)

    return {
      ...subject,

      obtainedTotal: obtainedTotal.toFixed(2),

      letterGrade: subject.letter_grade || gradeInfo.grade,

      gradePoint:
        subject.grade_point !== undefined
          ? Number(subject.grade_point).toFixed(2)
          : gradeInfo.point.toFixed(2),
    }
  })
})

const overallGPA = computed(() => {
  if (resultData.value?.overall_gpa !== undefined && resultData.value?.overall_gpa !== null) {
    return Number(resultData.value.overall_gpa).toFixed(2)
  }

  const validSubjects = processedSubjects.value.filter(
    (subject) => subject.gradePoint !== '-' && subject.letterGrade !== 'F',
  )

  if (!validSubjects.length) {
    return '0.00'
  }

  const totalPoint = validSubjects.reduce((sum, subject) => sum + Number(subject.gradePoint), 0)

  const gpa = totalPoint / validSubjects.length

  return Math.min(5, gpa).toFixed(2)
})

const totalObtainedMarks = computed(() => {
  const total = processedSubjects.value.reduce((sum, subject) => {
    const value = Number(subject.obtainedTotal)

    return sum + (Number.isFinite(value) ? value : 0)
  }, 0)

  return total.toFixed(2)
})

const displayFullMark = (subject) => {
  if (subject.full_mark !== undefined && subject.full_mark !== null) {
    return subject.full_mark
  }

  const marks = exams.value
    .map((exam) => {
      return subject.exams?.[exam.id]?.full_mark
    })
    .filter((value) => value !== null && value !== undefined)
    .map(Number)

  if (!marks.length) {
    return '-'
  }

  return Math.max(...marks)
}

const getExamMarks = (subject, examId) => {
  const examData = subject.exams?.[examId]

  if (!examData || examData.marks === null || examData.marks === undefined) {
    return '-'
  }

  return examData.marks
}

const formatPercentage = (percentage) => {
  const value = Number(percentage)

  if (!Number.isFinite(value)) {
    return '0%'
  }

  return `${value}%`
}

const calculateGradeAndPoint = (marks) => {
  const percentage = Number(marks)

  if (percentage >= 80) {
    return { grade: 'A+', point: 5.0 }
  }

  if (percentage >= 70) {
    return { grade: 'A', point: 4.0 }
  }

  if (percentage >= 60) {
    return { grade: 'A-', point: 3.5 }
  }

  if (percentage >= 50) {
    return { grade: 'B', point: 3.0 }
  }

  if (percentage >= 40) {
    return { grade: 'C', point: 2.0 }
  }

  if (percentage >= 33) {
    return { grade: 'D', point: 1.0 }
  }

  return { grade: 'F', point: 0.0 }
}

const printResult = () => {
  window.print()
}

const downloadPdf = async () => {
  if (!resultPdf.value) {
    return
  }

  downloading.value = true

  try {
    await new Promise((resolve) => {
      setTimeout(resolve, 300)
    })

    const element = resultPdf.value

    // =========================
    // WAIT FOR ALL IMAGES
    // =========================

    const images = element.querySelectorAll('img')

    await Promise.all(
      Array.from(images).map((img) => {
        return new Promise((resolve) => {
          if (img.complete && img.naturalWidth > 0) {
            resolve()
            return
          }

          img.onload = () => resolve()
          img.onerror = () => resolve()
        })
      }),
    )

    // =========================
    // HTML TO CANVAS
    // =========================

    const canvas = await html2canvas(element, {
      scale: 2,

      useCORS: true,
      allowTaint: false,

      backgroundColor: '#ffffff',
      logging: false,

      windowWidth: element.scrollWidth,

      onclone: (clonedDoc) => {
        // =========================
        // RESULT TABLE
        // =========================

        const resultTables = clonedDoc.querySelectorAll('.custom-result-table')

        resultTables.forEach((table) => {
          table.style.setProperty('width', '100%', 'important')

          table.style.setProperty('max-width', '100%', 'important')

          // Content অনুযায়ী column width
          table.style.setProperty('table-layout', 'auto', 'important')

          table.style.setProperty('border-collapse', 'collapse', 'important')

          table.style.setProperty('border-spacing', '0', 'important')
        })

        // =========================
        // TABLE HEADER
        // =========================

        const headers = clonedDoc.querySelectorAll('.custom-result-table thead th')

        headers.forEach((th) => {
          th.style.setProperty('background', 'transparent', 'important')

          th.style.setProperty('background-color', 'transparent', 'important')

          th.style.setProperty('color', '#000000', 'important')

          th.style.setProperty('border', '1.5px solid #000000', 'important')

          th.style.setProperty('padding', '7px 6px', 'important')

          th.style.setProperty('font-weight', '600', 'important')

          // Comfortable PDF font
          th.style.setProperty('font-size', '16px', 'important')

          th.style.setProperty('white-space', 'normal', 'important')
        })

        // =========================
        // HEADER ROW
        // =========================

        const headerRows = clonedDoc.querySelectorAll('.custom-result-table thead tr')

        headerRows.forEach((tr) => {
          tr.style.setProperty('background', 'transparent', 'important')

          tr.style.setProperty('background-color', 'transparent', 'important')
        })

        // =========================
        // TABLE CELLS
        // =========================

        const resultCells = clonedDoc.querySelectorAll(
          '.custom-result-table th, .custom-result-table td',
        )

        resultCells.forEach((cell) => {
          cell.style.setProperty('font-size', '16px', 'important')

          cell.style.setProperty('border', '1.5px solid #000000', 'important')

          cell.style.setProperty('background-color', 'transparent', 'important')

          cell.style.setProperty('vertical-align', 'middle', 'important')

          // Long subject/name can wrap naturally
          cell.style.setProperty('white-space', 'normal', 'important')

          cell.style.setProperty('word-break', 'normal', 'important')

          cell.style.setProperty('overflow-wrap', 'break-word', 'important')

          cell.style.setProperty('line-height', '1.25', 'important')
        })

        // =========================
        // FIRST COLUMN
        // =========================

        const firstColumnCells = clonedDoc.querySelectorAll(
          '.custom-result-table th:first-child, .custom-result-table td:first-child',
        )

        firstColumnCells.forEach((cell) => {
          cell.style.setProperty('min-width', '180px', 'important')

          cell.style.setProperty('white-space', 'normal', 'important')

          cell.style.setProperty('word-break', 'normal', 'important')
        })

        // =========================
        // STUDENT IMAGE
        // =========================

        const studentImages = clonedDoc.querySelectorAll('.student-photo-image')

        studentImages.forEach((img) => {
          img.style.display = 'block'
          img.style.visibility = 'visible'
          img.style.opacity = '1'
        })

        // =========================
        // TABLES
        // =========================

        const tables = clonedDoc.querySelectorAll('table')

        tables.forEach((table) => {
          table.style.borderCollapse = 'collapse'
        })
      },
    })

    // =========================
    // CANVAS → IMAGE
    // =========================

    const imageData = canvas.toDataURL('image/jpeg', 0.95)

    // =========================
    // A4 LANDSCAPE
    // =========================

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    })

    const pageWidth = pdf.internal.pageSize.getWidth()

    const pageHeight = pdf.internal.pageSize.getHeight()

    // =========================
    // FULL A4 PAGE
    // =========================

    // No margin
    // Full page width + height
    const sideCrop = 4

    pdf.addImage(imageData, 'JPEG', -sideCrop, 0, pageWidth + sideCrop * 2, pageHeight)

    // =========================
    // FILE NAME
    // =========================

    const safeStudentId = String(
      student.value.studentId || student.value.student_id || selectedStudentId.value || 'student',
    ).replace(/[^a-zA-Z0-9-_]/g, '-')

    const safeYear = String(selectedYear.value || 'year').replace(/[^a-zA-Z0-9-_]/g, '-')

    const fileName = `Result-${safeStudentId}-${safeYear}.pdf`

    // =========================
    // SAVE
    // =========================

    pdf.save(fileName)
  } catch (error) {
    console.error('PDF generation error:', error)

    alert('Unable to generate PDF. Please try again.')
  } finally {
    downloading.value = false
  }
}
onMounted(async () => {
  await Promise.all([loadInstituteInfo(), loadFinalResult()])
})
</script>

<style scoped>
.result-landscape-page {
  background-color: #fcfcfc;
  min-height: 100vh;
  font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
}

.result-card {
  background-image: url('/bgi.png');
  background-size: 100% 100%;
  background-repeat: no-repeat;
  background-position: center;
  border-radius: 0px;
  border: none !important;
  padding: 25px 35px;
  background-color: #ffffff;
}

/* কন্টেন্টটি সামান্য নিচে নামানোর জন্য margin-top বাড়িয়ে 110px করা হলো */
.school-header {
  min-height: 120px;
  margin-top: 120px; /* <--- এখানে মার্জিন বাড়িয়ে সমন্বয় করা হয়েছে */
}

.watermark-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 0;
}

.watermark-img {
  width: 900px;
  height: 780px;
  margin-top: 300px;
  object-fit: contain;
  opacity: 0.08;
}

.tiny {
  font-size: 0.72rem;
}

.student-info-bar {
  font-size: 23px !important;
  line-height: 1.5;
  background-color: transparent !important;
  border: 2px solid #000000 !important;
  border-radius: 4px;
  margin-top: 20px;
}

.student-photo-sm {
  width: 70px;
  height: 85px;
  border-radius: 2px;
  flex-shrink: 0;
}

.student-photo-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.custom-result-table {
  font-size: 1rem;
  border-color: #000000 !important;
}
.custom-result-table th,
.custom-result-table td {
  padding: 8px 6px;
  vertical-align: middle;
  border: 1.5px solid #000000 !important;
  background-color: transparent !important;
}

.signature-space {
  height: 35px;
}

.tracking-wide {
  letter-spacing: 0.05em;
}

.action-buttons-wrapper {
  position: relative;
  z-index: 10;
}

.action-btn {
  min-width: 110px;
  font-weight: 500;
  font-size: 0.875rem;
  border-radius: 4px;
}

@media print {
  .action-buttons-wrapper {
    display: none !important;
  }

  .result-landscape-page {
    background: #ffffff !important;
    padding: 0 !important;
  }

  .container-fluid {
    max-width: 100% !important;
    padding-left: 0 !important;
    padding-right: 0 !important;
  }

  .result-card {
    border: none !important;
    background-size: 100% 100% !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .watermark-img {
    opacity: 0.08 !important;
  }

  .table-responsive {
    overflow: visible !important;
  }

  .custom-result-table th,
  .custom-result-table td {
    padding: 5px 4px;
    border-color: #000000 !important;
    background-color: rgba(255, 255, 255, 0.9) !important;
  }

  @page {
    size: landscape;
    margin: 4mm;
  }
}

.width-fix[data-v-a4aa7a5c] {
  max-width: 100% !important;
}
.width-fix {
  max-width: 100% !important;
}
.font-size {
  font-size: 80px !important;
}
.font-size-institute {
  margin-top: -50px;
}
.font-size-institute p {
  font-size: 20px;
}
</style>
