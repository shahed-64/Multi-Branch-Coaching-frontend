<template>
  <div class="dashboard-container">
    <StudentsDashboardMenueView />

    <div class="main-wrapper p-3 p-md-4">
      <!-- Header -->
      <header
        class="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-3 border-bottom"
      >
        <h3 class="fw-bold text-dark mb-2 mb-md-0">Class Members</h3>

        <div class="d-flex align-items-center gap-3">
          <div
            class="position-relative bg-white p-2 rounded-circle shadow-sm d-flex align-items-center justify-content-center"
            style="width: 40px; height: 40px"
          >
            <i class="bi bi-bell fs-6 text-dark"></i>
          </div>

          <div class="d-flex align-items-center gap-2 bg-white px-3 py-2 rounded-pill shadow-sm">
            <div
              class="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center fw-bold"
              style="width: 36px; height: 36px"
            >
              {{ initials(studentProfile.name) }}
            </div>

            <div class="d-none d-sm-block text-start lh-sm">
              <div class="fw-bold fs-sm text-dark">
                {{ studentProfile.name || 'Student' }}
              </div>
              <small class="text-muted fs-xs"> ID: {{ studentProfile.student_id || '—' }} </small>
            </div>
          </div>
        </div>
      </header>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="text-muted mt-3 mb-0">Loading class members...</p>
      </div>

      <!-- Error -->
      <div v-else-if="errorMessage" class="alert alert-danger rounded-4" role="alert">
        {{ errorMessage }}
        <button type="button" class="btn btn-sm btn-outline-danger ms-2" @click="loadClassMembers">
          Retry
        </button>
      </div>

      <template v-else>
        <!-- Class Summary -->
        <div class="row g-3 mb-4">
          <div class="col-12 col-md-4">
            <div class="card h-100 border-0 shadow-sm rounded-4 p-3 bg-gradient-blue text-white">
              <h6 class="fw-medium mb-1 fs-sm">Class & Section</h6>

              <div class="h3 fw-bold my-1">
                {{ classInfo.class_name || 'Not assigned' }}
                <span v-if="classInfo.section_name"> ({{ classInfo.section_name }}) </span>
              </div>

              <small class="opacity-75 fs-xs">
                Shift: {{ classInfo.shift_name || '—' }} · Academic Session:
                {{ classInfo.academic_session || '—' }}
              </small>
            </div>
          </div>

          <div class="col-12 col-md-4">
            <div
              class="card h-100 border-0 shadow-sm rounded-4 p-3 bg-white border-start border-4 border-primary"
            >
              <h6 class="fw-bold text-dark mb-3 fs-sm">
                <i class="bi bi-person-badge text-primary me-2"></i>
                Class Teacher
              </h6>

              <div class="d-flex align-items-center gap-3">
                <div
                  class="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center"
                  style="width: 45px; height: 45px"
                >
                  <i class="bi bi-person-fill fs-4"></i>
                </div>

                <div>
                  <h6 class="fw-bold text-dark mb-1 fs-sm">
                    {{ classInfo.teacher_name || 'Not assigned' }}
                  </h6>
                  <small class="text-muted fs-xs">
                    {{ classInfo.teacher_designation || 'Class Teacher' }}
                  </small>
                </div>
              </div>
            </div>
          </div>

          <div class="col-12 col-md-4">
            <div
              class="card h-100 border-0 shadow-sm rounded-4 p-3 bg-white d-flex flex-column justify-content-between"
            >
              <h6 class="fw-bold text-dark mb-1 fs-sm">Total Classmates</h6>

              <div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
                <span class="h3 fw-bold text-primary mb-0"> {{ summary.total }} Students </span>

                <span class="badge bg-success-subtle text-success fs-xs">
                  {{ summary.boys }} Boys · {{ summary.girls }} Girls
                </span>
              </div>

              <small class="text-muted fs-xs">Active Enrollment</small>
            </div>
          </div>
        </div>

        <!-- Search & Filter -->
        <div class="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-white">
          <div class="row g-3 align-items-center justify-content-between">
            <div class="col-12 col-md-6">
              <div class="input-group">
                <span class="input-group-text bg-light border-0 ps-3">
                  <i class="bi bi-search text-muted"></i>
                </span>

                <input
                  v-model="searchQuery"
                  type="text"
                  class="form-control bg-light border-0 shadow-none fs-sm"
                  placeholder="Search by name, student ID or group..."
                />
              </div>
            </div>

            <div class="col-12 col-md-auto">
              <select
                v-model="selectedGroup"
                class="form-select bg-light border-0 shadow-none fs-sm fw-semibold"
              >
                <option value="All">All Groups</option>
                <option v-for="group in availableGroups" :key="group" :value="group">
                  {{ group }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Class Members -->
        <div v-if="filteredStudents.length" class="row g-3">
          <div
            v-for="student in filteredStudents"
            :key="student.id"
            class="col-12 col-sm-6 col-md-4 col-lg-3"
          >
            <div
              class="card border-0 shadow-sm rounded-4 p-3 text-center h-100 member-card bg-white d-flex flex-column justify-content-between"
            >
              <div>
                <div class="position-relative d-inline-block mb-3 mt-2">
                  <div
                    class="rounded-circle border border-3 border-light shadow-sm bg-primary-subtle text-primary d-flex align-items-center justify-content-center fw-bold"
                    style="width: 75px; height: 75px; font-size: 1.3rem"
                  >
                    {{ initials(student.name) }}
                  </div>

                  <span
                    class="position-absolute bottom-0 end-0 p-1 rounded-circle border border-white"
                    :class="student.status === 'Active' ? 'bg-success' : 'bg-secondary'"
                    style="width: 14px; height: 14px"
                  ></span>
                </div>

                <h6 class="fw-bold text-dark mb-1">
                  {{ student.name }}
                </h6>

                <small class="text-muted fs-xs d-block mb-2">
                  ID: {{ student.student_id || '—' }}
                </small>

                <div class="d-flex justify-content-center gap-1 mb-3 flex-wrap">
                  <span class="badge bg-primary-subtle text-primary fs-xs px-2 py-1">
                    {{ student.group || 'General' }}
                  </span>

                  <span class="badge bg-light text-dark border fs-xs px-2 py-1">
                    Roll: {{ student.roll || '—' }}
                  </span>
                </div>
              </div>

              <div class="border-top pt-2 mt-2 d-flex gap-2">
                <button
                  type="button"
                  class="btn btn-outline-primary btn-sm w-100 rounded-3 fs-xs fw-semibold shadow-none"
                  @click="viewProfile(student)"
                >
                  <i class="bi bi-person-fill me-1"></i>
                  Profile
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
          <i class="bi bi-people fs-1 text-muted mb-3"></i>
          <h5 class="fw-bold text-dark">No Class Members Found</h5>
          <p class="text-muted mb-0">No students match your search or selected group.</p>
        </div>
      </template>
    </div>

    <!-- Student Profile Modal -->
    <div v-if="selectedStudent" class="profile-overlay" @click.self="selectedStudent = null">
      <div class="profile-modal card border-0 shadow-lg rounded-4 p-4">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="fw-bold mb-0">Student Profile</h5>
          <button
            type="button"
            class="btn-close"
            aria-label="Close"
            @click="selectedStudent = null"
          ></button>
        </div>

        <div class="text-center mb-3">
          <div
            class="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center fw-bold mx-auto mb-3"
            style="width: 76px; height: 76px; font-size: 1.4rem"
          >
            {{ initials(selectedStudent.name) }}
          </div>
          <h5 class="fw-bold mb-1">{{ selectedStudent.name }}</h5>
          <span class="badge bg-success-subtle text-success">
            {{ selectedStudent.status }}
          </span>
        </div>

        <div class="profile-detail">
          <span>Student ID</span>
          <strong>{{ selectedStudent.student_id || '—' }}</strong>
        </div>

        <div class="profile-detail">
          <span>Roll</span>
          <strong>{{ selectedStudent.roll || '—' }}</strong>
        </div>

        <div class="profile-detail">
          <span>Group</span>
          <strong>{{ selectedStudent.group || 'General' }}</strong>
        </div>

        <div class="profile-detail">
          <span>Class</span>
          <strong>{{ classInfo.class_name || '—' }}</strong>
        </div>

        <div class="profile-detail">
          <span>Section</span>
          <strong>{{ classInfo.section_name || '—' }}</strong>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'
import StudentsDashboardMenueView from './StudentsDashboardMenueView.vue'

const loading = ref(true)
const errorMessage = ref('')
const searchQuery = ref('')
const selectedGroup = ref('All')
const selectedStudent = ref(null)

const studentProfile = ref({
  name: '',
  student_id: '',
})

const classInfo = ref({
  class_name: '',
  section_name: '',
  shift_name: '',
  academic_session: '',
  teacher_name: '',
  teacher_designation: '',
})

const summary = ref({
  total: 0,
  boys: 0,
  girls: 0,
})

const studentsList = ref([])

const availableGroups = computed(() => {
  return [...new Set(studentsList.value.map((student) => student.group).filter(Boolean))]
})

const filteredStudents = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  return studentsList.value.filter((student) => {
    const matchesSearch =
      !query ||
      String(student.name || '')
        .toLowerCase()
        .includes(query) ||
      String(student.student_id || '')
        .toLowerCase()
        .includes(query) ||
      String(student.group || '')
        .toLowerCase()
        .includes(query) ||
      String(student.roll || '')
        .toLowerCase()
        .includes(query)

    const matchesGroup = selectedGroup.value === 'All' || student.group === selectedGroup.value

    return matchesSearch && matchesGroup
  })
})

function initials(name) {
  return String(name || 'Student')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
}

function viewProfile(student) {
  selectedStudent.value = student
}

function normalizeStudent(student) {
  return {
    id: student.id,
    student_id: student.student_id ?? student.admission_no ?? student.student_code ?? '',
    name:
      student.name ??
      student.student_name ??
      [student.first_name, student.last_name].filter(Boolean).join(' ') ??
      'Student',
    group:
      student.group ??
      student.class_group?.name ??
      student.classGroup?.name ??
      student.class_group_name ??
      'General',
    roll: student.roll ?? student.roll_number ?? '',
    status: student.status === 'active' || student.status === 'Active' ? 'Active' : 'Inactive',
  }
}

async function loadClassMembers() {
  loading.value = true
  errorMessage.value = ''

  try {
    /*
     * Backend endpoint must return the authenticated student's
     * own class/session and classmates only.
     */
    const response = await api.get('/student/class-members')
    const data = response.data?.data ?? response.data

    const profile = data.profile ?? data.student ?? {}

    studentProfile.value = {
      name:
        profile.name ??
        profile.student_name ??
        [profile.first_name, profile.last_name].filter(Boolean).join(' ') ??
        '',
      student_id: profile.student_id ?? profile.admission_no ?? profile.student_code ?? '',
    }

    const classData = data.class_info ?? data.classInfo ?? {}

    classInfo.value = {
      class_name:
        classData.class_name ??
        classData.class_info?.name ??
        classData.classInfo?.name ??
        classData.class_name_value ??
        '',
      section_name: classData.section_name ?? classData.section?.name ?? '',
      shift_name: classData.shift_name ?? classData.shift?.name ?? '',
      academic_session:
        classData.academic_session ??
        classData.academicSession?.name ??
        classData.academicSession?.session_name ??
        '',
      teacher_name: classData.teacher_name ?? classData.class_teacher?.name ?? '',
      teacher_designation:
        classData.teacher_designation ?? classData.class_teacher?.designation ?? '',
    }

    const members = data.classmates ?? data.students ?? data.members ?? []

    studentsList.value = Array.isArray(members) ? members.map(normalizeStudent) : []

    const counts = data.summary ?? {}

    summary.value = {
      total: counts.total ?? studentsList.value.length,
      boys: counts.boys ?? 0,
      girls: counts.girls ?? 0,
    }
  } catch (error) {
    console.error('Failed to load class members:', error)

    errorMessage.value =
      error.response?.data?.message || 'Unable to load class members. Please try again.'
  } finally {
    loading.value = false
  }
}

onMounted(loadClassMembers)
</script>

<style scoped>
.dashboard-container {
  display: flex;
  min-height: 100vh;
  background-color: #f4f6f9;
}

.main-wrapper {
  margin-left: 260px;
  flex-grow: 1;
  width: calc(100% - 260px);
  min-width: 0;
}

.bg-gradient-blue {
  background: linear-gradient(135deg, #1e63e9 0%, #0d47a1 100%);
}

.fs-xs {
  font-size: 0.75rem;
}

.fs-sm {
  font-size: 0.85rem;
}

.member-card {
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.member-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.08) !important;
}

.profile-overlay {
  position: fixed;
  inset: 0;
  z-index: 1050;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.profile-modal {
  width: 100%;
  max-width: 440px;
  max-height: 90vh;
  overflow-y: auto;
}

.profile-detail {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid #edf0f4;
  font-size: 0.9rem;
}

.profile-detail span {
  color: #6c757d;
}

.profile-detail strong {
  text-align: right;
  overflow-wrap: anywhere;
}

@media (max-width: 992px) {
  .main-wrapper {
    margin-left: 0;
    width: 100%;
  }
}
</style>
