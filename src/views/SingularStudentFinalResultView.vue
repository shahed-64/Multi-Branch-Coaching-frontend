<template>
  <RouterView />

  <dashPageView />

  <div class="content">
    <!-- HEADER -->
    <div class="page-header">
      <div>
        <h2>Final Result</h2>
        <p>
          Select a student to view the final result
          <span v-if="selectedYear"> for {{ selectedYear }} </span>
        </p>
      </div>

      <div class="year-badge" v-if="selectedYear">
        <i class="bi bi-calendar3 me-2"></i>
        {{ selectedYear }}
      </div>
    </div>

    <!-- MAIN CARD -->
    <div class="result-selection-card">
      <div class="card-header-custom">
        <div>
          <h4>
            <i class="bi bi-person-vcard-fill me-2"></i>
            Student Selection
          </h4>
          <p>Select class, group, section and student to view the final result.</p>
        </div>
      </div>

      <div class="card-body-custom">
        <div class="row g-4">
          <!-- CLASS -->
          <div class="col-md-6">
            <label class="form-label">Select Class</label>

            <select
              v-model="selectedClass"
              class="form-select form-select-lg"
              @change="resetAfterClass"
            >
              <option value="">Select Class</option>

              <option v-for="cls in classes" :key="cls.id" :value="String(cls.id)">
                {{ cls.class_name }}
              </option>
            </select>
          </div>

          <!-- GROUP -->
          <div class="col-md-6">
            <label class="form-label">Select Group</label>

            <select
              v-model="selectedGroup"
              class="form-select form-select-lg"
              @change="resetAfterGroup"
            >
              <option value="">Select Group</option>

              <option v-for="group in filteredGroups" :key="group.id" :value="String(group.id)">
                {{ group.group_name }}
              </option>
            </select>
          </div>

          <!-- SECTION -->
          <div class="col-md-6">
            <label class="form-label">Select Section</label>

            <select
              v-model="selectedSection"
              class="form-select form-select-lg"
              @change="resetStudent"
            >
              <option value="">Select Section</option>

              <option
                v-for="section in filteredSections"
                :key="section.id"
                :value="String(section.id)"
              >
                {{ section.section_name }}
              </option>
            </select>
          </div>

          <!-- STUDENT -->
          <div class="col-md-6">
            <label class="form-label">Select Student</label>

            <select
              v-model="selectedStudent"
              class="form-select form-select-lg"
              :disabled="!selectedClass"
            >
              <option value="">Select Student</option>

              <option
                v-for="student in filteredStudents"
                :key="student.id"
                :value="String(student.id)"
              >
                {{ student.full_name }}
                {{ student.student_id ? ' - ' + student.student_id : '' }}
              </option>
            </select>
          </div>
        </div>

        <!-- SELECTED STUDENT PREVIEW -->
        <div v-if="selectedStudentData" class="selected-student-box mt-4">
          <div class="student-info">
            <img
              :src="getImageUrl(selectedStudentData)"
              alt="Student Photo"
              class="student-avatar"
            />

            <div class="student-details">
              <h5>{{ selectedStudentData.full_name }}</h5>

              <div class="student-meta">
                <span>
                  <strong>ID:</strong>
                  {{ selectedStudentData.student_id || 'N/A' }}
                </span>

                <span>
                  <strong>Class:</strong>
                  {{
                    selectedSession?.class_info?.class_name ||
                    selectedSession?.classInfo?.class_name ||
                    selectedStudentData.class_info?.class_name ||
                    'N/A'
                  }}
                </span>

                <span>
                  <strong>Group:</strong>
                  {{
                    selectedSession?.class_group?.group_name ||
                    selectedSession?.classGroup?.group_name ||
                    selectedStudentData.class_group?.group_name ||
                    'N/A'
                  }}
                </span>

                <span>
                  <strong>Section:</strong>
                  {{
                    selectedSession?.section?.section_name ||
                    selectedStudentData.section?.section_name ||
                    'N/A'
                  }}
                </span>

                <span v-if="selectedSession">
                  <strong>Session:</strong>
                  {{ getSessionLabel(selectedSession) }}
                </span>
              </div>
            </div>
          </div>

          <button
            class="btn btn-primary view-result-btn"
            :disabled="!selectedStudent || !selectedSessionId"
            @click="viewResult"
          >
            <i class="bi bi-file-earmark-text me-2"></i>
            View Final Result
          </button>
        </div>

        <!-- EMPTY STUDENT -->
        <div v-if="selectedClass && filteredStudents.length === 0" class="empty-state">
          <i class="bi bi-person-x"></i>
          <h5>No Student Found</h5>
          <p>No student matches the selected Class, Group and Section.</p>
        </div>

        <!-- SESSION WARNING -->
        <div
          v-if="selectedStudentData && !selectedSessionId"
          class="alert alert-warning mt-3"
          role="alert"
        >
          This student's session information is unavailable for the selected class. Please check the
          Student API response and session enrollment.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import dashPageView from './dashPageView.vue'
import api from '@/services/api'
import { getImageUrl } from '@/utils/img'

const route = useRoute()
const router = useRouter()

// YEAR
const selectedYear = computed(() => route.query.year || '')

// DATA
const students = ref([])
const classes = ref([])
const classGroups = ref([])
const sections = ref([])

const selectedClass = ref('')
const selectedGroup = ref('')
const selectedSection = ref('')
const selectedStudent = ref('')

const loading = ref(false)

// HELPERS
const getStudentSessions = (student) => {
  const sessions = student?.student_sessions ?? student?.studentSessions ?? student?.sessions ?? []

  return Array.isArray(sessions) ? sessions : []
}

const getSessionClassId = (session) =>
  session?.class_id ?? session?.classInfo?.id ?? session?.class_info?.id

const getSessionGroupId = (session) =>
  session?.class_group_id ?? session?.classGroup?.id ?? session?.class_group?.id

const getSessionSectionId = (session) => session?.section_id ?? session?.section?.id

const getSessionLabel = (session) => {
  const academicSession =
    session?.academic_session ?? session?.academicSession ?? session?.academic_session_info

  return (
    academicSession?.name ??
    academicSession?.year ??
    academicSession?.session_name ??
    session?.academic_session_id ??
    'N/A'
  )
}

// GET STUDENTS
const getStudents = async () => {
  try {
    loading.value = true

    const res = await api.get('/students')

    const data = res.data.students ?? res.data.data ?? res.data

    students.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Error fetching students:', error.response?.data || error)
  } finally {
    loading.value = false
  }
}

// GET CLASSES
const getClasses = async () => {
  try {
    const res = await api.get('/classes')

    const data = res.data.classes ?? res.data.data ?? res.data

    classes.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Error fetching classes:', error.response?.data || error)
  }
}

// GET CLASS GROUPS
const getClassGroups = async () => {
  try {
    const res = await api.get('/class-groups')

    const data = res.data.classGroups ?? res.data.groups ?? res.data.data ?? res.data

    classGroups.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Error fetching class groups:', error.response?.data || error)
  }
}

// GET SECTIONS
const getSections = async () => {
  try {
    const res = await api.get('/sections')

    const data = res.data.sections ?? res.data.data ?? res.data

    sections.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Error fetching sections:', error.response?.data || error)
  }
}

// FILTER GROUPS
const filteredGroups = computed(() => {
  if (!selectedClass.value) {
    return classGroups.value
  }

  return classGroups.value
})

// FILTER SECTIONS
const filteredSections = computed(() => {
  if (!selectedClass.value) {
    return sections.value
  }

  return sections.value
})

// FILTER STUDENTS
// Prefer the selected class/group/section from the student's session.
// Fall back to current student fields for older API responses.

// FILTER STUDENTS
const filteredStudents = computed(() => {
  return students.value.filter((student) => {
    const sessions = getStudentSessions(student)

    const hasSessionData = sessions.length > 0

    const matchingSessions = sessions.filter((session) => {
      const classId = getSessionClassId(session)
      const groupId = getSessionGroupId(session)
      const sectionId = getSessionSectionId(session)

      return (
        (!selectedClass.value || String(classId ?? '') === String(selectedClass.value)) &&
        (!selectedGroup.value || String(groupId ?? '') === String(selectedGroup.value)) &&
        (!selectedSection.value || String(sectionId ?? '') === String(selectedSection.value))
      )
    })

    if (hasSessionData) {
      return matchingSessions.length > 0
    }

    return (
      (!selectedClass.value || String(student.class_id ?? '') === String(selectedClass.value)) &&
      (!selectedGroup.value ||
        String(student.class_group_id ?? '') === String(selectedGroup.value)) &&
      (!selectedSection.value || String(student.section_id ?? '') === String(selectedSection.value))
    )
  })
})

// SELECTED STUDENT
const selectedStudentData = computed(() => {
  if (!selectedStudent.value) {
    return null
  }

  return (
    filteredStudents.value.find(
      (student) => String(student.id) === String(selectedStudent.value),
    ) || null
  )
})

// FIND THE ENROLLMENT FOR THE SELECTED CLASS/GROUP/SECTION
const selectedSession = computed(() => {
  const student = selectedStudentData.value

  if (!student) {
    return null
  }

  const sessions = getStudentSessions(student)

  return (
    sessions.find((session) => {
      return (
        String(getSessionClassId(session) ?? '') === String(selectedClass.value) &&
        (!selectedGroup.value ||
          String(getSessionGroupId(session) ?? '') === String(selectedGroup.value)) &&
        (!selectedSection.value ||
          String(getSessionSectionId(session) ?? '') === String(selectedSection.value))
      )
    }) || null
  )
})

// SUPPORT COMMON ID FIELD NAMES
const selectedSessionId = computed(() => {
  const session = selectedSession.value

  if (!session) {
    return ''
  }

  const id = session.student_session_id ?? session.studentSessionId ?? session.id

  return id == null ? '' : String(id)
})

// RESET AFTER CLASS
const resetAfterClass = () => {
  selectedGroup.value = ''
  selectedSection.value = ''
  selectedStudent.value = ''
}

// RESET AFTER GROUP
const resetAfterGroup = () => {
  selectedSection.value = ''
  selectedStudent.value = ''
}

// RESET STUDENT
const resetStudent = () => {
  selectedStudent.value = ''
}

// VIEW RESULT
const viewResult = () => {
  if (!selectedStudent.value) {
    alert('Please select a student first.')
    return
  }

  if (!selectedYear.value) {
    alert('Academic year is missing. Please select the result year first.')
    return
  }

  if (!selectedSessionId.value) {
    alert('Student session information is missing. Please verify the student enrollment data.')
    return
  }

  router.push({
    path: '/finalAvragePdfView',
    query: {
      year: String(selectedYear.value),
      student_id: String(selectedStudent.value),
      student_session_id: selectedSessionId.value,
    },
  })
}

// ON MOUNTED
onMounted(() => {
  getStudents()
  getClasses()
  getClassGroups()
  getSections()
})
</script>

<style scoped>
.content {
  padding: 30px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.page-header h2 {
  margin: 0;
  font-weight: 700;
  color: #1e293b;
}

.page-header p {
  margin: 6px 0 0;
  color: #64748b;
}

.year-badge {
  background: #eef2ff;
  color: #4f46e5;
  padding: 10px 18px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 15px;
}

.result-selection-card {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(15, 23, 42, 0.08);
  overflow: hidden;
}

.card-header-custom {
  padding: 24px 28px;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

.card-header-custom h4 {
  margin: 0;
  color: #1e293b;
  font-weight: 700;
}

.card-header-custom p {
  margin: 6px 0 0;
  color: #64748b;
}

.card-body-custom {
  padding: 30px;
}

.form-label {
  font-weight: 600;
  color: #334155;
  margin-bottom: 8px;
}

.form-select {
  border-radius: 10px;
  border: 1px solid #cbd5e1;
}

.form-select:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 0.2rem rgba(99, 102, 241, 0.12);
}

.selected-student-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 20px;
  border: 1px solid #dbeafe;
  background: #f8fbff;
  border-radius: 14px;
}

.student-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.student-avatar {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #ffffff;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.12);
}

.student-details h5 {
  margin: 0 0 8px;
  font-weight: 700;
  color: #1e293b;
}

.student-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 18px;
  color: #64748b;
  font-size: 14px;
}

.student-meta strong {
  color: #334155;
}

.view-result-btn {
  min-width: 180px;
  border-radius: 10px;
  padding: 11px 18px;
  font-weight: 600;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #64748b;
}

.empty-state i {
  font-size: 42px;
  display: block;
  margin-bottom: 10px;
  color: #94a3b8;
}

.empty-state h5 {
  color: #475569;
  margin-bottom: 5px;
}

@media (max-width: 768px) {
  .content {
    padding: 20px 15px;
  }

  .page-header {
    align-items: flex-start;
    gap: 15px;
    flex-direction: column;
  }

  .selected-student-box {
    align-items: flex-start;
    flex-direction: column;
  }

  .view-result-btn {
    width: 100%;
  }
}
</style>
