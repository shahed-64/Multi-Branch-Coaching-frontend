<template>
  <RouterView />

  <!-- Existing Sidebar -->
  <dashPageView />

  <div class="container-fluid py-4 student-migration-page">
    <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
      <div>
        <h4 class="fw-bold mb-1">Student Migration</h4>
        <p class="text-muted mb-0">Manage individual student session and class information</p>
      </div>

      <span class="badge bg-primary px-3 py-2">
        <i class="bi bi-arrow-left-right me-1"></i>
        Single Student Migration
      </span>
    </div>

    <div v-if="errorMessage" class="alert alert-danger">
      {{ errorMessage }}
    </div>

    <div v-if="successMessage" class="alert alert-success">
      {{ successMessage }}
    </div>

    <div class="row g-4">
      <!-- LEFT: SELECT STUDENT AND CURRENT INFORMATION -->
      <div class="col-12 col-xl-5">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-header bg-white py-3">
            <h5 class="fw-bold mb-0">
              <i class="bi bi-person-search text-primary me-2"></i>
              Select a Student
            </h5>
          </div>

          <div class="card-body">
            <label class="form-label fw-semibold"> Search by Student ID or Name </label>

            <div class="input-group mb-3">
              <span class="input-group-text bg-white">
                <i class="bi bi-search"></i>
              </span>

              <input
                v-model="searchStudent"
                type="text"
                class="form-control"
                placeholder="Enter student ID or name..."
                autocomplete="off"
              />

              <button
                v-if="searchStudent"
                class="btn btn-outline-secondary"
                type="button"
                @click="searchStudent = ''"
                title="Clear search"
              >
                <i class="bi bi-x-lg"></i>
              </button>
            </div>

            <label class="form-label fw-semibold"> Select Student </label>

            <select v-model="selectedStudentId" class="form-select mb-4" @change="selectStudent">
              <option value="">-- Select a Student --</option>

              <option
                v-for="student in filteredStudents"
                :key="student.id"
                :value="String(student.id)"
              >
                {{ student.student_id || student.id }} -
                {{ student.full_name }}
              </option>
            </select>

            <div v-if="loadingStudents" class="text-center py-4 text-muted">
              <div class="spinner-border spinner-border-sm text-primary me-2"></div>
              Loading students...
            </div>

            <div v-else-if="!selectedStudent" class="text-center py-5 border rounded bg-light">
              <i class="bi bi-person-lines-fill text-secondary" style="font-size: 42px"></i>

              <h6 class="mt-3 fw-semibold">No Student Selected</h6>

              <p class="text-muted small mb-0">Search by ID or name and select a student.</p>
            </div>

            <template v-else>
              <div class="d-flex align-items-center gap-3 p-3 rounded bg-light mb-4">
                <div class="student-avatar">
                  <i class="bi bi-person-fill"></i>
                </div>

                <div class="flex-grow-1 min-width-0">
                  <h6 class="fw-bold mb-1">
                    {{ selectedStudent.full_name }}
                  </h6>

                  <div class="small text-muted">
                    Student ID:
                    {{ selectedStudent.student_id || selectedStudent.id }}
                  </div>

                  <div class="small text-muted">Phone: {{ selectedStudent.phone || 'N/A' }}</div>
                </div>

                <span class="badge bg-success">Selected</span>
              </div>

              <h6 class="fw-bold mb-3">
                <i class="bi bi-info-circle text-primary me-2"></i>
                Current Session Information
              </h6>

              <div v-if="!currentEnrollment" class="alert alert-warning mb-0">
                এই Student-এর কোনো Session Enrollment পাওয়া যায়নি।
              </div>

              <template v-else>
                <div class="info-row">
                  <span>Academic Session</span>
                  <strong>
                    {{ sessionName(currentEnrollment) }}
                  </strong>
                </div>

                <div class="info-row">
                  <span>Class</span>
                  <strong>
                    {{ relationName(currentEnrollment.class_info) }}
                  </strong>
                </div>

                <div class="info-row">
                  <span>Class Group</span>
                  <strong>
                    {{ relationName(currentEnrollment.class_group) }}
                  </strong>
                </div>

                <div class="info-row">
                  <span>Section</span>
                  <strong>
                    {{ relationName(currentEnrollment.section) }}
                  </strong>
                </div>

                <div class="info-row">
                  <span>Shift</span>
                  <strong>
                    {{ relationName(currentEnrollment.shift) }}
                  </strong>
                </div>

                <div class="info-row">
                  <span>Monthly Fee</span>
                  <strong> ৳{{ formatMoney(currentEnrollment.monthly_fee) }} </strong>
                </div>
              </template>
            </template>
          </div>
        </div>
      </div>

      <!-- RIGHT: TO / MIGRATION FORM -->
      <div class="col-12 col-xl-7">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-header bg-white py-3 d-flex align-items-center justify-content-between">
            <h5 class="fw-bold mb-0">
              <i class="bi bi-arrow-right-circle text-primary me-2"></i>
              To — Migration Information
            </h5>

            <span class="badge bg-light text-dark border"> Destination </span>
          </div>

          <div class="card-body">
            <div v-if="!selectedStudent" class="text-center py-5 text-muted">
              <i class="bi bi-arrow-left-right" style="font-size: 42px"></i>

              <p class="mt-3 mb-0">প্রথমে বাম পাশ থেকে একজন Student নির্বাচন করো।</p>
            </div>

            <template v-else>
              <div class="alert alert-info small">
                <i class="bi bi-info-circle me-2"></i>
                একই Academic Session-এও Class, Group, Section, Shift অথবা Monthly Fee পরিবর্তন করা
                যাবে।
              </div>

              <form @submit.prevent="saveMigration">
                <div class="mb-3">
                  <label class="form-label fw-semibold">
                    To Academic Session
                    <span class="text-danger">*</span>
                  </label>

                  <select
                    v-model="form.academic_session_id"
                    class="form-select"
                    required
                    @change="onTargetSessionChange"
                  >
                    <option value="">-- Select Academic Session --</option>

                    <option
                      v-for="session in academicSessions"
                      :key="session.id"
                      :value="String(session.id)"
                    >
                      {{ session.name || session.session_name || session.year || session.id }}
                    </option>
                  </select>

                  <small class="text-muted">
                    একই Session নির্বাচন করেও placement পরিবর্তন করতে পারবে।
                  </small>
                </div>

                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label fw-semibold">
                      To Class <span class="text-danger">*</span>
                    </label>

                    <select v-model="form.class_id" class="form-select" required>
                      <option value="">-- Select Class --</option>

                      <option v-for="item in classes" :key="item.id" :value="String(item.id)">
                        {{ item.name || item.class_name }}
                      </option>
                    </select>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label fw-semibold"> To Class Group </label>

                    <select v-model="form.class_group_id" class="form-select">
                      <option value="">-- Select Group --</option>

                      <option v-for="item in classGroups" :key="item.id" :value="String(item.id)">
                        {{ item.name || item.group_name }}
                      </option>
                    </select>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label fw-semibold">
                      To Section <span class="text-danger">*</span>
                    </label>

                    <select v-model="form.section_id" class="form-select" required>
                      <option value="">-- Select Section --</option>

                      <option v-for="item in sections" :key="item.id" :value="String(item.id)">
                        {{ item.name || item.section_name }}
                      </option>
                    </select>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label fw-semibold"> To Shift </label>

                    <select v-model="form.shift_id" class="form-select">
                      <option value="">-- Select Shift --</option>

                      <option v-for="item in shifts" :key="item.id" :value="String(item.id)">
                        {{ item.name || item.shift_name }}
                      </option>
                    </select>
                  </div>

                  <div class="col-12">
                    <label class="form-label fw-semibold">
                      To Monthly Fee (৳)
                      <span class="text-danger">*</span>
                    </label>

                    <input
                      v-model="form.monthly_fee"
                      type="number"
                      min="0"
                      step="0.01"
                      class="form-control"
                      placeholder="Enter monthly fee"
                      required
                    />
                  </div>
                </div>

                <hr class="my-4" />

                <div class="d-flex flex-wrap justify-content-between align-items-center gap-2">
                  <button
                    type="button"
                    class="btn btn-outline-secondary"
                    @click="resetForm"
                    :disabled="saving"
                  >
                    <i class="bi bi-arrow-counterclockwise me-1"></i>
                    Reset
                  </button>

                  <button
                    type="submit"
                    class="btn btn-primary px-4"
                    :disabled="saving || !currentEnrollment"
                  >
                    <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>

                    <i v-else class="bi bi-check-circle me-2"></i>

                    {{ saving ? 'Saving...' : 'Save Migration' }}
                  </button>
                </div>
              </form>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterView } from 'vue-router'
import api from '@/services/api'
import dashPageView from './dashPageView.vue'

const students = ref([])
const academicSessions = ref([])
const classes = ref([])
const classGroups = ref([])
const sections = ref([])
const shifts = ref([])

const searchStudent = ref('')
const selectedStudentId = ref('')
const selectedStudent = ref(null)
const currentEnrollment = ref(null)

const loadingStudents = ref(false)
const saving = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const form = ref({
  academic_session_id: '',
  class_id: '',
  class_group_id: '',
  section_id: '',
  shift_id: '',
  monthly_fee: '',
})

function responseList(response) {
  const data = response?.data

  if (Array.isArray(data)) {
    return data
  }

  if (Array.isArray(data?.data)) {
    return data.data
  }

  const keys = ['students', 'academic_sessions', 'classes', 'class_groups', 'sections', 'shifts']

  for (const key of keys) {
    if (Array.isArray(data?.[key])) {
      return data[key]
    }
  }

  return []
}
function relationName(relation) {
  if (!relation) return 'N/A'

  return (
    relation.name ||
    relation.class_name ||
    relation.group_name ||
    relation.section_name ||
    relation.shift_name ||
    'N/A'
  )
}

function sessionName(enrollment) {
  const session = enrollment?.academic_session

  return (
    session?.name ||
    session?.session_name ||
    session?.year ||
    enrollment?.academic_session_id ||
    'N/A'
  )
}

function formatMoney(value) {
  return Number(value || 0).toLocaleString('en-BD', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function getEnrollment(student, sessionId) {
  return (student?.student_sessions || []).find(
    (item) => Number(item.academic_session_id) === Number(sessionId),
  )
}

function getLatestEnrollment(student) {
  const enrollments = [...(student?.student_sessions || [])]

  enrollments.sort(
    (a, b) => Number(b.academic_session_id || 0) - Number(a.academic_session_id || 0),
  )

  return enrollments[0] || null
}

const filteredStudents = computed(() => {
  const query = searchStudent.value.trim().toLowerCase()

  if (!query) return students.value

  return students.value.filter((student) => {
    const id = String(student.student_id || student.id || '').toLowerCase()
    const name = String(student.full_name || '').toLowerCase()

    return id.includes(query) || name.includes(query)
  })
})

function fillFormFromEnrollment(enrollment) {
  if (!enrollment) return

  form.value.class_id = String(enrollment.class_id ?? '')
  form.value.class_group_id = String(enrollment.class_group_id ?? '')
  form.value.section_id = String(enrollment.section_id ?? '')
  form.value.shift_id = enrollment.shift_id ? String(enrollment.shift_id) : ''
  form.value.monthly_fee = enrollment.monthly_fee ?? ''
}

function selectStudent() {
  errorMessage.value = ''
  successMessage.value = ''

  selectedStudent.value =
    students.value.find((student) => String(student.id) === selectedStudentId.value) || null

  currentEnrollment.value = getLatestEnrollment(selectedStudent.value)

  form.value = {
    academic_session_id: currentEnrollment.value
      ? String(currentEnrollment.value.academic_session_id)
      : '',
    class_id: '',
    class_group_id: '',
    section_id: '',
    shift_id: '',
    monthly_fee: '',
  }

  fillFormFromEnrollment(currentEnrollment.value)
}

function onTargetSessionChange() {
  errorMessage.value = ''
  successMessage.value = ''

  const targetEnrollment = getEnrollment(selectedStudent.value, form.value.academic_session_id)

  // If the destination session already has an enrollment,
  // load its values. Otherwise copy the current placement as defaults.
  fillFormFromEnrollment(targetEnrollment || currentEnrollment.value)
}

function resetForm() {
  errorMessage.value = ''
  successMessage.value = ''

  form.value = {
    academic_session_id: currentEnrollment.value
      ? String(currentEnrollment.value.academic_session_id)
      : '',
    class_id: '',
    class_group_id: '',
    section_id: '',
    shift_id: '',
    monthly_fee: '',
  }

  fillFormFromEnrollment(currentEnrollment.value)
}

async function loadData() {
  loadingStudents.value = true
  errorMessage.value = ''

  try {
    const [
      studentResponse,
      sessionResponse,
      classResponse,
      groupResponse,
      sectionResponse,
      shiftResponse,
    ] = await Promise.all([
      api.get('/students'),
      api.get('/academic-sessions'),
      api.get('/classes'),
      api.get('/class-groups'),
      api.get('/sections'),
      api.get('/shifts'),
    ])

    students.value = responseList(studentResponse)
    academicSessions.value = responseList(sessionResponse)
    classes.value = responseList(classResponse)
    classGroups.value = responseList(groupResponse)
    sections.value = responseList(sectionResponse)
    shifts.value = responseList(shiftResponse)
  } catch (error) {
    errorMessage.value =
      error.response?.data?.message || 'Data load করা যায়নি। API এবং permission চেক করো।'
  } finally {
    loadingStudents.value = false
  }
}

async function saveMigration() {
  errorMessage.value = ''
  successMessage.value = ''

  if (!selectedStudent.value) {
    errorMessage.value = 'প্রথমে একজন Student নির্বাচন করো।'
    return
  }

  if (!currentEnrollment.value) {
    errorMessage.value = 'এই Student-এর Session Enrollment পাওয়া যায়নি।'
    return
  }

  if (
    !form.value.academic_session_id ||
    !form.value.class_id ||
    !form.value.section_id ||
    form.value.monthly_fee === ''
  ) {
    errorMessage.value = 'Academic Session, Class, Section এবং Monthly Fee পূরণ করো।'
    return
  }

  if (Number(form.value.monthly_fee) < 0) {
    errorMessage.value = 'Monthly Fee ঋণাত্মক হতে পারবে না।'
    return
  }

  saving.value = true

  try {
    const payload = {
      student_session_id: Number(currentEnrollment.value.id),
      from_session_id: Number(currentEnrollment.value.academic_session_id),
      to_session_id: Number(form.value.academic_session_id),
      to_class_id: Number(form.value.class_id),
      to_group_id: form.value.class_group_id ? Number(form.value.class_group_id) : null,
      to_section_id: Number(form.value.section_id),
      to_shift_id: form.value.shift_id ? Number(form.value.shift_id) : null,
      to_monthly_fee: Number(form.value.monthly_fee),
    }

    await api.post('/student-migration/migrate', payload)

    successMessage.value = 'Student Session Migration সফল হয়েছে।'

    const savedStudentId = selectedStudentId.value
    const targetSessionId = String(payload.to_session_id)

    await loadData()

    selectedStudentId.value = savedStudentId

    selectedStudent.value =
      students.value.find((student) => String(student.id) === savedStudentId) || null

    currentEnrollment.value = getLatestEnrollment(selectedStudent.value)

    form.value.academic_session_id = targetSessionId

    const targetEnrollment = getEnrollment(selectedStudent.value, targetSessionId)

    if (targetEnrollment) {
      fillFormFromEnrollment(targetEnrollment)
    }
  } catch (error) {
    errorMessage.value =
      error.response?.data?.message ||
      'Migration save করা যায়নি। Backend API এবং validation চেক করো।'
  } finally {
    saving.value = false
  }
}

onMounted(loadData)
</script>

<style scoped>
.student-migration-page {
  background-color: #f8f9fc;
  min-height: 80vh;

  /* Sidebar-এর জন্য জায়গা রাখা */
  margin-left: 260px;
  width: calc(100% - 260px);
  padding: 24px;
  box-sizing: border-box;
}

.student-migration-page .card {
  border-radius: 12px;
  overflow: hidden;
}

.student-migration-page .card-header {
  border-bottom: 1px solid #edf0f4;
}

.student-migration-page .student-avatar {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background: #e8efff;
  color: #2563eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  flex-shrink: 0;
}

.student-migration-page .info-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #edf0f4;
  font-size: 14px;
}

.student-migration-page .info-row:last-child {
  border-bottom: none;
}

.student-migration-page .info-row > span {
  color: #6c757d;
}

.student-migration-page .info-row > strong {
  text-align: right;
  overflow-wrap: anywhere;
}

.student-migration-page .min-width-0 {
  min-width: 0;
}

.student-migration-page .form-label {
  font-size: 14px;
}

.student-migration-page .form-control,
.student-migration-page .form-select,
.student-migration-page .input-group-text,
.student-migration-page .btn {
  border-radius: 7px;
}

/* Tablet ও mobile responsive */
@media (max-width: 991.98px) {
  .student-migration-page {
    margin-left: 0;
    width: 100%;
    padding: 16px;
  }
}

@media (max-width: 575.98px) {
  .student-migration-page {
    padding: 12px;
  }

  .student-migration-page .info-row {
    font-size: 13px;
    gap: 8px;
  }

  .student-migration-page .student-avatar {
    width: 44px;
    height: 44px;
    font-size: 24px;
  }

  .student-migration-page h4 {
    font-size: 19px;
  }

  .student-migration-page h5 {
    font-size: 16px;
  }

  .student-migration-page .card-body {
    padding: 14px;
  }
}
</style>
