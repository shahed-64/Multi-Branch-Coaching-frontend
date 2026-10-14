<template>
  <div class="dashboard-layout bg-light min-vh-100 d-flex">
    <aside class="sidebar-wrapper">
      <dashPageView />
    </aside>

    <main class="main-wrapper flex-grow-1 min-vh-100 d-flex flex-column">
      <RouterView />

      <div class="attendance-section py-3 py-md-4 px-2 px-md-3">
        <div class="attendance-container bg-white rounded-3 shadow-sm p-3 p-md-4">
          <!-- Holiday Banner -->
          <div
            v-if="holidayInfo"
            class="alert alert-info d-flex align-items-center gap-3 mb-4 shadow-sm border-0 bg-info bg-opacity-10 text-info"
          >
            <i class="bi bi-calendar-event-fill fs-4"></i>
            <div>
              <h5 class="alert-heading fw-bold mb-1">Today is a Holiday!</h5>
              <p class="mb-0 small">
                Reason / Occasion:
                <strong>{{ holidayInfo.title || holidayInfo.name || 'Public Holiday' }}</strong>
              </p>
            </div>
          </div>

          <!-- Title & Actions -->
          <div
            class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4"
          >
            <div>
              <h2 class="h4 h3-md mb-0 fw-bold text-dark">Student Attendance</h2>
              <p class="text-muted mb-0 small">
                Manage daily student attendance by academic session, class, group, section and shift
              </p>
            </div>

            <div class="d-flex flex-wrap align-items-center gap-2 gap-md-3">
              <div
                v-if="isSyncing"
                class="d-flex align-items-center text-primary small fw-semibold"
              >
                <div class="spinner-border spinner-border-sm me-2" role="status"></div>
                Saving...
              </div>

              <div v-else-if="saveSuccess" class="text-success small fw-semibold">
                <i class="bi bi-check-circle-fill me-1"></i> Saved!
              </div>

              <div
                class="date-select-wrapper px-3 py-1 py-md-2 bg-light border rounded d-flex align-items-center gap-2 shadow-sm flex-grow-1 flex-md-grow-0"
              >
                <label for="date-select" class="form-label mb-0 fw-semibold text-secondary small">
                  Date:
                </label>
                <input
                  id="date-select"
                  v-model="selectedDate"
                  type="date"
                  class="form-control form-control-sm border-0 bg-transparent p-0 w-auto flex-grow-1"
                  @change="fetchAttendanceData"
                />
              </div>

              <button
                class="btn btn-primary btn-sm btn-md-md d-flex align-items-center justify-content-center gap-2 fw-semibold shadow-sm flex-grow-1 flex-md-grow-0"
                :disabled="
                  holidayInfo ||
                  loading ||
                  !selectedAcademicSessionId ||
                  filteredStudents.length === 0
                "
                @click="markAllPresent"
              >
                <i class="bi bi-person-check-fill"></i>
                <span>Mark All Present</span>
              </button>

              <button
                type="button"
                class="btn btn-success btn-sm btn-md-md d-flex align-items-center justify-content-center gap-2 fw-semibold shadow-sm flex-grow-1 flex-md-grow-0"
                :disabled="
                  holidayInfo ||
                  loading ||
                  !selectedAcademicSessionId ||
                  filteredStudents.length === 0
                "
                @click="openQrScanner"
              >
                <i class="bi bi-qr-code-scan"></i>
                <span>Scan QR</span>
              </button>
            </div>
          </div>

          <!-- Filters -->
          <div class="d-flex flex-column gap-2 mb-3 bg-light p-2 rounded border">
            <!-- Academic Session -->
            <div class="row g-2">
              <div class="col-12 col-md-4">
                <label for="academic-session" class="form-label small fw-semibold mb-1">
                  Academic Session
                </label>
                <select
                  id="academic-session"
                  v-model="selectedAcademicSessionId"
                  class="form-select form-select-sm"
                  :disabled="loading || academicSessions.length === 0"
                  @change="changeAcademicSession"
                >
                  <option value="" disabled>Select Academic Session</option>
                  <option
                    v-for="session in academicSessions"
                    :key="session.id"
                    :value="String(session.id)"
                  >
                    {{ session.name }}{{ session.is_active ? ' (Active)' : '' }}
                  </option>
                </select>
                <small v-if="sessionError" class="text-danger d-block mt-1">
                  {{ sessionError }}
                </small>
              </div>
            </div>

            <!-- Shift Filter -->
            <div class="d-flex flex-wrap align-items-center justify-content-between gap-2">
              <div class="btn-group btn-group-sm" role="group">
                <button
                  type="button"
                  class="btn"
                  :class="selectedShift === '' ? 'btn-primary' : 'btn-outline-primary'"
                  @click="changeShift('')"
                >
                  All Shifts
                </button>

                <button
                  v-for="shift in availableShifts"
                  :key="shift.id"
                  type="button"
                  class="btn"
                  :class="
                    String(selectedShift) === String(shift.id)
                      ? 'btn-primary'
                      : 'btn-outline-primary'
                  "
                  @click="changeShift(shift.id)"
                >
                  {{ shift.name }}
                </button>
              </div>

              <div class="text-muted small">
                Filtering Shift:
                <strong class="text-uppercase text-dark">
                  {{ selectedShiftName || 'All Shifts' }}
                </strong>
              </div>
            </div>

            <!-- Class / Group / Section -->
            <div class="row g-2 mt-1">
              <div class="col-12 col-md-4">
                <select
                  v-model="selectedClass"
                  class="form-select form-select-sm"
                  @change="fetchAttendanceData"
                >
                  <option value="">All Classes</option>
                  <option v-for="item in classOptions" :key="item.id" :value="String(item.id)">
                    {{ item.name }}
                  </option>
                </select>
              </div>

              <div class="col-12 col-md-4">
                <select
                  v-model="selectedGroup"
                  class="form-select form-select-sm"
                  @change="fetchAttendanceData"
                >
                  <option value="">All Groups</option>
                  <option v-for="item in groupOptions" :key="item.id" :value="String(item.id)">
                    {{ item.name }}
                  </option>
                </select>
              </div>

              <div class="col-12 col-md-4">
                <select
                  v-model="selectedSection"
                  class="form-select form-select-sm"
                  @change="fetchAttendanceData"
                >
                  <option value="">All Sections</option>
                  <option v-for="item in sectionOptions" :key="item.id" :value="String(item.id)">
                    {{ item.name }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- Search & Summary -->
          <div
            class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-3"
          >
            <div class="search-box-wrapper w-100" style="max-width: 350px">
              <div class="input-group input-group-sm">
                <span class="input-group-text bg-white border-end-0 text-muted ps-3">
                  <i class="bi bi-search"></i>
                </span>
                <input
                  v-model="searchQuery"
                  type="text"
                  class="form-control border-start-0 ps-0 shadow-none"
                  placeholder="Search Student ID or Name..."
                />
              </div>
            </div>

            <div class="text-muted small align-self-start align-self-sm-center">
              <span class="badge bg-light text-secondary border px-3 py-2 rounded-pill shadow-sm">
                Total Records: <strong>{{ filteredStudents.length }}</strong>
              </span>
            </div>
          </div>

          <!-- Attendance Table -->
          <div class="card border-0 shadow-sm">
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-hover align-middle mb-0 attendance-table">
                  <thead class="table-light">
                    <tr class="fw-semibold text-secondary small">
                      <th class="ps-3 ps-md-4">STUDENT ID</th>
                      <th>STUDENT NAME</th>
                      <th>CLASS</th>
                      <th>GROUP</th>
                      <th>SECTION</th>
                      <th>SHIFT</th>
                      <th class="text-center">
                        <div class="d-flex align-items-center justify-content-center gap-1">
                          <input
                            class="form-check-input custom-checkbox"
                            type="checkbox"
                            :checked="isAllPresent"
                            :disabled="holidayInfo || loading || filteredStudents.length === 0"
                            @change="toggleSelectAll"
                          />
                          <span class="ms-1 d-none d-sm-inline">PRESENT</span>
                        </div>
                      </th>
                      <th class="text-center">LATE</th>
                      <th class="text-center">EDIT</th>
                      <th class="text-end pe-3 pe-md-4">ACTION</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr v-if="loading">
                      <td colspan="10" class="text-center py-4 text-muted">
                        <div class="spinner-border spinner-border-sm me-2" role="status"></div>
                        Loading student attendance...
                      </td>
                    </tr>

                    <tr
                      v-else
                      v-for="student in filteredStudents"
                      :key="student.id"
                      class="attendance-row"
                      :class="{
                        'present-row': !holidayInfo && student.status === 'present',
                        'absent-row': !holidayInfo && student.status === 'absent',
                        'late-row': !holidayInfo && student.status === 'late',
                        'leave-row': !holidayInfo && student.status === 'leave',
                        'holiday-row': holidayInfo,
                      }"
                    >
                      <td class="ps-3 ps-md-4">
                        <div class="fw-semibold text-dark text-uppercase small">
                          {{ student.student_code }}
                        </div>
                      </td>

                      <td>
                        <div class="d-flex align-items-center gap-2 gap-md-3">
                          <img
                            :src="student.image || getStudentPhoto()"
                            class="rounded-circle student-photo-placeholder flex-shrink-0 object-fit-cover"
                            alt="Student"
                          />
                          <div>
                            <div class="fw-bold text-dark text-uppercase small text-nowrap">
                              {{ student.name }}
                            </div>
                            <small class="text-muted text-uppercase small d-block">
                              {{ student.phone || 'N/A' }}
                            </small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span class="badge bg-primary text-white w-fit">{{
                          student.class_name
                        }}</span>
                      </td>
                      <td>
                        <span class="badge bg-secondary text-white w-fit">{{
                          student.group_name
                        }}</span>
                      </td>
                      <td>
                        <span class="badge bg-light text-dark border w-fit">{{
                          student.section_name
                        }}</span>
                      </td>
                      <td>
                        <span class="badge bg-secondary text-white w-fit">{{
                          student.shift_name
                        }}</span>
                      </td>

                      <td class="text-center">
                        <div class="form-check d-flex justify-content-center m-0">
                          <input
                            v-model="student.isPresent"
                            class="form-check-input custom-checkbox"
                            type="checkbox"
                            :disabled="holidayInfo || savingIds.includes(student.id)"
                            @change="onCheckboxChange(student)"
                          />
                        </div>
                      </td>

                      <td class="text-center text-nowrap">
                        <span
                          v-if="!holidayInfo && student.status === 'late'"
                          class="badge bg-danger rounded-pill fw-bold text-uppercase fs-8 px-2 px-md-3 py-1"
                          >LATE</span
                        >
                        <span
                          v-else-if="!holidayInfo && student.status === 'present'"
                          class="badge bg-success rounded-pill fw-bold text-uppercase fs-8 px-2 px-md-3 py-1"
                          >ON TIME</span
                        >
                        <span
                          v-else-if="!holidayInfo && student.status === 'leave'"
                          class="badge bg-warning text-dark rounded-pill fw-bold text-uppercase fs-8 px-2 px-md-3 py-1"
                          >LEAVE</span
                        >
                        <span v-else class="text-muted fs-8">-</span>
                      </td>

                      <td class="text-center">
                        <button
                          class="btn btn-outline-primary btn-sm px-2 py-1"
                          :disabled="holidayInfo || savingIds.includes(student.id)"
                          title="Edit Attendance"
                          @click="openEditModal(student)"
                        >
                          <i class="bi bi-pencil-square"></i>
                        </button>
                      </td>

                      <td class="text-end pe-3 pe-md-4">
                        <span
                          class="badge rounded-pill px-2 px-md-3 py-1 py-md-2 text-uppercase fs-8 fw-bold pill-status"
                          :class="
                            holidayInfo
                              ? 'status-holiday'
                              : student.status === 'late'
                                ? 'status-late'
                                : student.status === 'leave'
                                  ? 'status-leave'
                                  : student.status === 'present'
                                    ? 'status-present'
                                    : 'status-absent'
                          "
                        >
                          {{
                            holidayInfo
                              ? 'Holiday'
                              : student.status === 'late'
                                ? 'Late'
                                : student.status === 'leave'
                                  ? 'Leave'
                                  : student.status === 'present'
                                    ? 'Present'
                                    : 'Absent'
                          }}
                        </span>
                      </td>
                    </tr>

                    <tr v-if="!loading && filteredStudents.length === 0">
                      <td colspan="10" class="text-center py-4 text-muted">
                        {{
                          !selectedAcademicSessionId
                            ? 'Please select an academic session.'
                            : 'No students found matching your criteria.'
                        }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div
            class="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 mt-3 text-muted small"
          >
            <div>Showing {{ filteredStudents.length }} of {{ studentList.length }} entries</div>
            <nav aria-label="Page navigation">
              <ul class="pagination pagination-sm m-0">
                <li class="page-item disabled">
                  <a class="page-link" href="#" tabindex="-1" aria-disabled="true">Previous</a>
                </li>
                <li class="page-item active" aria-current="page">
                  <a class="page-link" href="#">1</a>
                </li>
                <li class="page-item">
                  <a class="page-link" href="#">Next</a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </main>

    <!-- Edit Attendance Modal -->
    <div
      id="editStudentAttendanceModal"
      class="modal fade"
      tabindex="-1"
      aria-labelledby="editStudentAttendanceModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header bg-light">
            <h5 id="editStudentAttendanceModalLabel" class="modal-title fw-bold text-dark fs-6">
              Edit Attendance - {{ editingStudent?.name }}
            </h5>
            <button
              type="button"
              class="btn-close shadow-none"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>

          <div v-if="editingStudent" class="modal-body p-4">
            <div class="d-flex align-items-center gap-3 mb-4">
              <img
                :src="editingStudent.image || getStudentPhoto()"
                class="rounded-circle student-modal-photo object-fit-cover"
                alt="Student"
              />
              <div>
                <div class="fw-bold text-dark">{{ editingStudent.name }}</div>
                <small class="text-muted d-block">ID: {{ editingStudent.student_code }}</small>
                <small class="text-muted d-block">
                  {{ editingStudent.class_name }}
                  <span v-if="editingStudent.group_name !== 'N/A'">
                    · {{ editingStudent.group_name }}
                  </span>
                </small>
              </div>
            </div>

            <div class="mb-3">
              <label for="editStatus" class="form-label fw-semibold small">Attendance Status</label>
              <select
                id="editStatus"
                v-model="editingStudent.tempStatus"
                class="form-select"
                :disabled="holidayInfo"
              >
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
                <option value="leave">Leave</option>
              </select>
            </div>

            <div class="mb-3">
              <label for="editRemarks" class="form-label fw-semibold small">Remarks</label>
              <textarea
                id="editRemarks"
                v-model="editingStudent.tempRemarks"
                class="form-control"
                rows="3"
                placeholder="Optional remarks..."
                :disabled="holidayInfo"
              ></textarea>
            </div>
          </div>

          <div class="modal-footer bg-light border-0">
            <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">
              Cancel
            </button>
            <button
              type="button"
              class="btn btn-primary btn-sm"
              :disabled="!editingStudent || holidayInfo || isSyncing"
              @click="saveModalAttendance"
            >
              <span v-if="isSyncing" class="spinner-border spinner-border-sm me-1"></span>
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Holiday Notice Modal -->
    <div
      id="holidayNoticeModal"
      class="modal fade"
      tabindex="-1"
      aria-labelledby="holidayNoticeModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4 p-3 text-center">
          <div class="modal-body">
            <div class="mb-3">
              <div
                class="d-inline-flex align-items-center justify-content-center bg-warning bg-opacity-10 text-warning rounded-circle p-3"
                style="width: 70px; height: 70px"
              >
                <i class="bi bi-calendar-event fs-2"></i>
              </div>
            </div>

            <span
              class="badge bg-warning text-dark fw-bold px-3 py-1 rounded-pill mb-2 text-uppercase"
              style="letter-spacing: 0.5px"
              >Holiday Notice</span
            >

            <h4 class="fw-bold text-dark mb-2">
              {{ holidayInfo?.title || holidayInfo?.name || 'Public Holiday' }}
            </h4>

            <p class="text-muted small mb-3">
              <i class="bi bi-clock-history me-1"></i>
              Duration: <strong>{{ holidayInfo?.date || selectedDate }}</strong>
            </p>

            <div class="bg-light border rounded-3 p-3 text-start mb-3">
              <label class="form-label fw-semibold text-secondary fs-8 text-uppercase mb-1">
                Description / Notes:
              </label>
              <p class="mb-0 text-dark small">
                {{ holidayInfo?.description || holidayInfo?.note || 'No description provided.' }}
              </p>
            </div>

            <div
              class="text-danger small fw-semibold d-flex align-items-center justify-content-center gap-1"
            >
              <i class="bi bi-exclamation-circle-fill"></i>
              <span>System is locked for attendance tracking today.</span>
            </div>
          </div>

          <div class="modal-footer border-0 justify-content-center pt-0">
            <button
              type="button"
              class="btn btn-dark btn-sm px-4 rounded-pill"
              data-bs-dismiss="modal"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- QR Scanner Modal -->
    <div
      id="qrScannerModal"
      class="modal fade"
      tabindex="-1"
      aria-labelledby="qrScannerModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4">
          <div class="modal-header bg-light">
            <h5 id="qrScannerModalLabel" class="modal-title fw-bold text-dark">
              <i class="bi bi-qr-code-scan me-2 text-success"></i>
              Scan Student QR
            </h5>
            <button
              type="button"
              class="btn-close shadow-none"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>

          <div class="modal-body p-3">
            <div
              id="studentQrReader"
              class="qr-reader-container rounded-3 overflow-hidden border"
            ></div>

            <div
              v-if="qrScanMessage"
              class="alert mt-3 mb-0 py-2 small text-center"
              :class="{
                'alert-info': qrScanMessageType === 'info',
                'alert-success': qrScanMessageType === 'success',
                'alert-danger': qrScanMessageType === 'danger',
                'alert-warning': qrScanMessageType === 'warning',
              }"
            >
              {{ qrScanMessage }}
            </div>

            <div class="text-center text-muted small mt-3">
              <i class="bi bi-camera me-1"></i>
              Point the camera at the student's QR code
            </div>
          </div>

          <div class="modal-footer bg-light border-0 justify-content-center">
            <button type="button" class="btn btn-secondary btn-sm px-4" data-bs-dismiss="modal">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { Html5Qrcode } from 'html5-qrcode'
import dashPageView from './dashPageView.vue'
import api from '@/services/api'
import 'bootstrap/js/dist/modal.js'
import * as bootstrap from 'bootstrap'

/* STATES */

const today = new Date().toISOString().split('T')[0]

const selectedDate = ref(today)
const selectedAcademicSessionId = ref('')
const academicSessions = ref([])
const sessionError = ref('')

const searchQuery = ref('')
const selectedShift = ref('')
const selectedClass = ref('')
const selectedGroup = ref('')
const selectedSection = ref('')

const studentList = ref([])
const loading = ref(false)
const isSyncing = ref(false)
const saveSuccess = ref(false)

const editingStudent = ref(null)
const holidayInfo = ref(null)

const classOptions = ref([])
const groupOptions = ref([])
const sectionOptions = ref([])
const shiftOptions = ref([])
const savingIds = ref([])

let modalInstance = null
let holidayModalInstance = null

/* QR SCANNER STATES */

const qrScannerVisible = ref(false)
const qrScannerRunning = ref(false)
const qrScanMessage = ref('')
const qrScanMessageType = ref('info')
const qrProcessing = ref(false)

let html5QrCode = null
let qrScannerModalInstance = null
let qrScannerModalElement = null

/* FETCH ACADEMIC SESSIONS */

const fetchAcademicSessions = async () => {
  sessionError.value = ''

  try {
    const response = await api.get('/academic-sessions')
    const result = response.data

    // Laravel paginate() returns { data: [...], current_page: ... }.
    const sessions = Array.isArray(result)
      ? result
      : Array.isArray(result?.data)
        ? result.data
        : Array.isArray(result?.academic_sessions)
          ? result.academic_sessions
          : Array.isArray(result?.sessions)
            ? result.sessions
            : []

    academicSessions.value = sessions

    if (sessions.length === 0) {
      selectedAcademicSessionId.value = ''
      studentList.value = []
      sessionError.value = 'No academic sessions are available for this branch.'
      return
    }

    const selectionStillExists = sessions.some(
      (session) => String(session.id) === String(selectedAcademicSessionId.value),
    )

    if (!selectionStillExists) {
      const activeSession = sessions.find(
        (session) =>
          session.is_active === true || session.is_active === 1 || session.is_active === '1',
      )

      selectedAcademicSessionId.value = String((activeSession || sessions[0]).id)
    }
  } catch (error) {
    console.error('Academic sessions could not be loaded:', error.response?.data || error)
    academicSessions.value = []
    selectedAcademicSessionId.value = ''
    studentList.value = []
    sessionError.value = error.response?.data?.message || 'Could not load academic sessions.'
  }
}

/* CHANGE ACADEMIC SESSION */

const changeAcademicSession = async () => {
  selectedClass.value = ''
  selectedGroup.value = ''
  selectedSection.value = ''
  selectedShift.value = ''

  studentList.value = []
  classOptions.value = []
  groupOptions.value = []
  sectionOptions.value = []
  shiftOptions.value = []

  await fetchAttendanceData()
}

/* FETCH ATTENDANCE DATA */

const fetchAttendanceData = async () => {
  if (!selectedAcademicSessionId.value) {
    studentList.value = []
    return
  }

  loading.value = true

  try {
    /* HOLIDAYS */

    try {
      const holidayRes = await api.get('/holidays', {
        params: {
          date: selectedDate.value,
        },
      })

      const holidays = Array.isArray(holidayRes.data)
        ? holidayRes.data
        : holidayRes.data?.data || holidayRes.data?.holidays || []

      holidayInfo.value =
        holidays.find((holiday) => {
          if (holiday.date === selectedDate.value) {
            return true
          }

          if (holiday.start_date && holiday.end_date) {
            return (
              selectedDate.value >= holiday.start_date && selectedDate.value <= holiday.end_date
            )
          }

          return holiday.start_date === selectedDate.value
        }) || null

      if (holidayInfo.value) {
        setTimeout(() => {
          const modalElement = document.getElementById('holidayNoticeModal')

          if (modalElement) {
            holidayModalInstance = bootstrap.Modal.getOrCreateInstance(modalElement)

            holidayModalInstance.show()
          }
        }, 100)
      }
    } catch (error) {
      console.warn('Holiday data could not be loaded:', error)
      holidayInfo.value = null
    }

    /* SESSION-WISE ATTENDANCE */

    const response = await api.get('/student-attendance', {
      params: {
        academic_session_id: selectedAcademicSessionId.value,
        date: selectedDate.value,
        class_id: selectedClass.value || undefined,
        class_group_id: selectedGroup.value || undefined,
        section_id: selectedSection.value || undefined,
        shift_id: selectedShift.value || undefined,
      },
    })

    const rawStudents = Array.isArray(response.data?.students) ? response.data.students : []

    buildFilterOptions(rawStudents)

    studentList.value = rawStudents.map((student) => {
      const classInfo = student.class_info || student.classInfo || null
      const classGroup = student.class_group || student.classGroup || null
      const section = student.section || null
      const shift = student.shift || null
      const attendance = student.attendance || null

      const status = student.attendance_status || attendance?.status || 'absent'

      return {
        id: student.id,

        student_session_id: student.student_session_id || null,

        academic_session_id: student.academic_session_id || selectedAcademicSessionId.value,

        student_code: student.student_id || `STD-${student.id}`,
        name: student.full_name || 'Unknown',
        phone: student.phone || '',

        image: student.image_url || (student.image ? `/storage/${student.image}` : null),

        // Prefer enrollment-specific relations.
        class_id: classInfo?.id ?? student.class_id ?? null,
        class_name: classInfo?.class_name || classInfo?.name || 'N/A',

        group_id: classGroup?.id ?? student.class_group_id ?? null,
        group_name: classGroup?.group_name || classGroup?.name || 'N/A',

        section_id: section?.id ?? student.section_id ?? null,
        section_name: section?.section_name || section?.name || 'N/A',

        shift_id: shift?.id ?? student.shift_id ?? null,
        shift_name: shift?.name || 'N/A',

        branch_id: student.branch_id || null,

        attendance_id: student.attendance_id || attendance?.id || null,
        status,
        remarks: student.attendance_remarks || attendance?.remarks || '',

        isPresent: status === 'present' || status === 'late',
      }
    })
  } catch (error) {
    console.error('Error fetching student attendance:', error.response?.data || error)
    studentList.value = []
  } finally {
    loading.value = false
  }
}

/* BUILD FILTER OPTIONS */

const buildFilterOptions = (students) => {
  const classes = new Map()
  const groups = new Map()
  const sections = new Map()
  const shifts = new Map()

  students.forEach((student) => {
    const classInfo = student.class_info || student.classInfo || null
    const group = student.class_group || student.classGroup || null
    const section = student.section || null
    const shift = student.shift || null

    const classId = classInfo?.id ?? student.class_id
    const className = classInfo?.class_name || classInfo?.name

    if (classId && className) {
      classes.set(String(classId), { id: classId, name: className })
    }

    const groupId = group?.id ?? student.class_group_id
    const groupName = group?.group_name || group?.name

    if (groupId && groupName) {
      groups.set(String(groupId), { id: groupId, name: groupName })
    }

    const sectionId = section?.id ?? student.section_id
    const sectionName = section?.section_name || section?.name

    if (sectionId && sectionName) {
      sections.set(String(sectionId), { id: sectionId, name: sectionName })
    }

    const shiftId = shift?.id ?? student.shift_id
    const shiftName = shift?.name

    if (shiftId && shiftName) {
      shifts.set(String(shiftId), { id: shiftId, name: shiftName })
    }
  })

  const sorted = (map) =>
    Array.from(map.values()).sort((a, b) => String(a.name).localeCompare(String(b.name)))

  classOptions.value = sorted(classes)
  groupOptions.value = sorted(groups)
  sectionOptions.value = sorted(sections)
  shiftOptions.value = sorted(shifts)
}

/* SHIFT CHANGE */

const changeShift = (shiftId) => {
  selectedShift.value = shiftId === '' ? '' : String(shiftId)
  fetchAttendanceData()
}

/* CHECKBOX CHANGE */

const onCheckboxChange = async (student) => {
  if (holidayInfo.value) return

  student.status = student.isPresent ? 'present' : 'absent'
  await autoSaveSingleStudent(student)
}

/* SAVE SINGLE STUDENT */

const autoSaveSingleStudent = async (student) => {
  if (holidayInfo.value || !selectedAcademicSessionId.value) {
    return false
  }

  if (savingIds.value.includes(student.id)) {
    return false
  }

  savingIds.value.push(student.id)
  isSyncing.value = true
  saveSuccess.value = false

  try {
    const response = await api.post('/student-attendance', {
      student_id: student.id,
      academic_session_id: selectedAcademicSessionId.value,
      date: selectedDate.value,
      status: student.status,
      remarks: student.remarks || null,
    })

    if (response.data?.attendance?.id) {
      student.attendance_id = response.data.attendance.id
    }

    saveSuccess.value = true

    setTimeout(() => {
      saveSuccess.value = false
    }, 2000)

    return true
  } catch (error) {
    console.error('Student attendance save error:', error.response?.data || error)
    await fetchAttendanceData()
    return false
  } finally {
    savingIds.value = savingIds.value.filter((id) => id !== student.id)
    isSyncing.value = false
  }
}

/* MARK ALL PRESENT */

const markAllPresent = async () => {
  if (
    holidayInfo.value ||
    !selectedAcademicSessionId.value ||
    filteredStudents.value.length === 0
  ) {
    return
  }

  isSyncing.value = true
  saveSuccess.value = false

  try {
    for (const student of filteredStudents.value) {
      student.status = 'present'
      student.isPresent = true

      await api.post('/student-attendance', {
        student_id: student.id,
        academic_session_id: selectedAcademicSessionId.value,
        date: selectedDate.value,
        status: 'present',
        remarks: student.remarks || null,
      })
    }

    saveSuccess.value = true

    setTimeout(() => {
      saveSuccess.value = false
    }, 2000)
  } catch (error) {
    console.error('Mark all present error:', error.response?.data || error)
    await fetchAttendanceData()
  } finally {
    isSyncing.value = false
  }
}

/* SELECT ALL PRESENT / ABSENT */

const toggleSelectAll = async (event) => {
  if (holidayInfo.value || !selectedAcademicSessionId.value) return

  const checked = event.target.checked

  isSyncing.value = true
  saveSuccess.value = false

  try {
    for (const student of filteredStudents.value) {
      student.isPresent = checked
      student.status = checked ? 'present' : 'absent'

      await api.post('/student-attendance', {
        student_id: student.id,
        academic_session_id: selectedAcademicSessionId.value,
        date: selectedDate.value,
        status: student.status,
        remarks: student.remarks || null,
      })
    }

    saveSuccess.value = true

    setTimeout(() => {
      saveSuccess.value = false
    }, 2000)
  } catch (error) {
    console.error('Toggle select all error:', error.response?.data || error)
    await fetchAttendanceData()
  } finally {
    isSyncing.value = false
  }
}

/* OPEN EDIT MODAL */

const openEditModal = (student) => {
  if (holidayInfo.value) return

  editingStudent.value = {
    ...student,
    tempStatus: student.status || 'absent',
    tempRemarks: student.remarks || '',
  }

  const element = document.getElementById('editStudentAttendanceModal')

  if (!element) return

  modalInstance = bootstrap.Modal.getOrCreateInstance(element)
  modalInstance.show()
}

/* SAVE EDIT MODAL */

const saveModalAttendance = async () => {
  if (holidayInfo.value || !editingStudent.value || !selectedAcademicSessionId.value) {
    return
  }

  const student = studentList.value.find((item) => item.id === editingStudent.value.id)

  if (!student) return

  isSyncing.value = true
  saveSuccess.value = false

  try {
    const response = await api.post('/student-attendance', {
      student_id: student.id,
      academic_session_id: selectedAcademicSessionId.value,
      date: selectedDate.value,
      status: editingStudent.value.tempStatus,
      remarks: editingStudent.value.tempRemarks || null,
    })

    student.status = editingStudent.value.tempStatus
    student.isPresent = student.status === 'present' || student.status === 'late'
    student.remarks = editingStudent.value.tempRemarks || ''

    if (response.data?.attendance?.id) {
      student.attendance_id = response.data.attendance.id
    }

    modalInstance?.hide()

    saveSuccess.value = true

    setTimeout(() => {
      saveSuccess.value = false
    }, 2000)
  } catch (error) {
    console.error('Edit attendance error:', error.response?.data || error)
  } finally {
    isSyncing.value = false
  }
}

/* QR SCANNER */

const openQrScanner = () => {
  if (
    holidayInfo.value ||
    loading.value ||
    !selectedAcademicSessionId.value ||
    filteredStudents.value.length === 0
  ) {
    return
  }

  qrScanMessage.value = 'Starting camera...'
  qrScanMessageType.value = 'info'
  qrScannerVisible.value = true
  qrProcessing.value = false

  const element = document.getElementById('qrScannerModal')

  if (!element) {
    console.error('QR Scanner modal not found.')
    return
  }

  qrScannerModalElement = element

  if (!qrScannerModalInstance) {
    qrScannerModalInstance = bootstrap.Modal.getOrCreateInstance(element)
  }

  element.addEventListener('shown.bs.modal', startQrScanner, { once: true })
  qrScannerModalInstance.show()
}

/* START QR SCANNER */

const startQrScanner = async () => {
  if (holidayInfo.value || qrScannerRunning.value) return

  try {
    if (html5QrCode) {
      await stopQrScanner()
    }

    const reader = document.getElementById('studentQrReader')

    if (!reader) {
      qrScanMessage.value = 'QR scanner area could not be found.'
      qrScanMessageType.value = 'danger'
      return
    }

    reader.innerHTML = ''
    html5QrCode = new Html5Qrcode('studentQrReader')

    qrScanMessage.value = 'Camera is starting...'
    qrScanMessageType.value = 'info'

    await html5QrCode.start(
      { facingMode: 'environment' },
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      },
      async (decodedText) => {
        await handleQrScan(decodedText)
      },
      () => {},
    )

    qrScannerRunning.value = true
    qrScanMessage.value = 'Camera is ready. Scan the student QR code.'
    qrScanMessageType.value = 'info'
  } catch (error) {
    console.error('QR scanner start error:', error)

    qrScannerRunning.value = false
    qrScanMessage.value =
      'Camera could not be started. Please allow camera permission and try again.'
    qrScanMessageType.value = 'danger'
  }
}

/* HANDLE QR SCAN */

const handleQrScan = async (decodedText) => {
  if (qrProcessing.value || holidayInfo.value) return

  qrProcessing.value = true

  try {
    const scannedCode = String(decodedText || '').trim()

    if (!scannedCode) {
      qrScanMessage.value = 'Invalid QR code.'
      qrScanMessageType.value = 'warning'
      return
    }

    const student = studentList.value.find(
      (item) =>
        String(item.student_code || '')
          .trim()
          .toLowerCase() === scannedCode.toLowerCase(),
    )

    if (!student) {
      qrScanMessage.value = `Student not found in the selected academic session: ${scannedCode}`
      qrScanMessageType.value = 'danger'
      return
    }

    if (student.status === 'present' || student.status === 'late') {
      qrScanMessage.value = `${student.name} is already marked ${student.status}.`
      qrScanMessageType.value = 'warning'
      return
    }

    student.status = 'present'
    student.isPresent = true

    qrScanMessage.value = `${student.name} marked Present. Saving...`
    qrScanMessageType.value = 'info'

    const saved = await autoSaveSingleStudent(student)

    if (saved) {
      qrScanMessage.value = `${student.name} marked Present successfully.`
      qrScanMessageType.value = 'success'
    } else {
      qrScanMessage.value = `Could not save attendance for ${student.name}.`
      qrScanMessageType.value = 'danger'
    }
  } catch (error) {
    console.error('QR attendance error:', error)
    qrScanMessage.value = 'Could not process this QR code. Please try again.'
    qrScanMessageType.value = 'danger'
  } finally {
    qrProcessing.value = false
  }
}

/* STOP QR SCANNER */

const stopQrScanner = async () => {
  try {
    if (html5QrCode) {
      if (qrScannerRunning.value) {
        try {
          await html5QrCode.stop()
        } catch (error) {
          console.warn('QR scanner stop warning:', error)
        }
      }

      try {
        await html5QrCode.clear()
      } catch (error) {
        console.warn('QR scanner clear warning:', error)
      }

      html5QrCode = null
    }
  } catch (error) {
    console.warn('QR scanner cleanup error:', error)
  } finally {
    qrScannerRunning.value = false
    qrScannerVisible.value = false
    qrProcessing.value = false
  }
}

/* COMPUTED */

const availableShifts = computed(() => shiftOptions.value)

const selectedShiftName = computed(() => {
  if (!selectedShift.value) return ''

  const shift = shiftOptions.value.find((item) => String(item.id) === String(selectedShift.value))

  return shift?.name || ''
})

const filteredStudents = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()

  return studentList.value.filter((student) => {
    return (
      !query ||
      String(student.student_code).toLowerCase().includes(query) ||
      String(student.name).toLowerCase().includes(query)
    )
  })
})

const isAllPresent = computed(() => {
  return (
    filteredStudents.value.length > 0 &&
    filteredStudents.value.every(
      (student) => student.status === 'present' || student.status === 'late',
    )
  )
})

const getStudentPhoto = () => {
  return 'https://via.placeholder.com/32?text=S'
}

/* MOUNT */

onMounted(async () => {
  await fetchAcademicSessions()

  if (selectedAcademicSessionId.value) {
    await fetchAttendanceData()
  }

  qrScannerModalElement = document.getElementById('qrScannerModal')

  if (qrScannerModalElement) {
    qrScannerModalElement.addEventListener('hidden.bs.modal', stopQrScanner)
  }
})

/* CLEANUP */

onBeforeUnmount(async () => {
  if (qrScannerModalElement) {
    qrScannerModalElement.removeEventListener('hidden.bs.modal', stopQrScanner)
  }

  await stopQrScanner()
})
</script>

<style scoped>
.dashboard-layout {
  display: flex;
  width: 100%;
  overflow-x: hidden;
}

.sidebar-wrapper {
  flex-shrink: 0;
  min-width: 250px;
  z-index: 1000;
}

.main-wrapper {
  flex-grow: 1;
  width: calc(100% - 250px);
  overflow-y: auto;
}

@media (max-width: 768px) {
  .dashboard-layout {
    flex-direction: column;
  }

  .sidebar-wrapper {
    width: 100%;
    min-width: 100%;
  }

  .main-wrapper {
    width: 100%;
  }
}

.search-box-wrapper .input-group-text,
.search-box-wrapper .form-control {
  border-color: #e2e8f0;
  border-radius: 6px;
}

.search-box-wrapper .form-control:focus {
  border-color: #cbd5e1;
}

.attendance-table {
  border-collapse: separate;
  border-spacing: 0;
}

.attendance-table thead th {
  border-bottom: 2px solid #e2e8f0 !important;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  padding-top: 0.85rem;
  padding-bottom: 0.85rem;
  white-space: nowrap;
}

.attendance-table tbody td {
  white-space: nowrap;
}

.attendance-row {
  border-bottom: 1px solid #e2e8f0;
}

.pill-status {
  letter-spacing: 0.05em;
  border: 1px solid transparent;
}

.status-present {
  background-color: rgba(25, 135, 84, 0.1) !important;
  color: #198754 !important;
  border-color: rgba(25, 135, 84, 0.2) !important;
}

.status-absent {
  background-color: rgba(220, 53, 69, 0.1) !important;
  color: #dc3545 !important;
  border-color: rgba(220, 53, 69, 0.2) !important;
}

.status-late {
  background-color: rgba(255, 193, 7, 0.15) !important;
  color: #997404 !important;
  border-color: rgba(255, 193, 7, 0.3) !important;
}

.status-leave {
  background-color: rgba(245, 158, 11, 0.12) !important;
  color: #b45309 !important;
  border-color: rgba(245, 158, 11, 0.25) !important;
}

.status-holiday {
  background-color: rgba(13, 202, 240, 0.1) !important;
  color: #0dcaf0 !important;
  border-color: rgba(13, 202, 240, 0.2) !important;
}

.custom-checkbox {
  width: 1.25rem;
  height: 1.25rem;
  cursor: pointer;
  border-radius: 4px;
}

.custom-checkbox:checked {
  background-color: #198754;
  border-color: #198754;
}

.student-photo-placeholder {
  width: 32px;
  height: 32px;
  background-color: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.student-modal-photo {
  width: 55px;
  height: 55px;
  background-color: #e2e8f0;
}

.fs-8 {
  font-size: 0.7rem;
}

.w-fit {
  width: fit-content;
}

@media (max-width: 576px) {
  .attendance-table th,
  .attendance-table td {
    padding-left: 0.5rem !important;
    padding-right: 0.5rem !important;
  }
}

.holiday-row {
  background-color: rgba(13, 202, 240, 0.06) !important;
}

.holiday-row td {
  color: #6c757d;
}

.present-row {
  background-color: rgba(25, 135, 84, 0.025);
}

.absent-row {
  background-color: rgba(220, 53, 69, 0.02);
}

.late-row {
  background-color: rgba(255, 193, 7, 0.025);
}

.leave-row {
  background-color: rgba(245, 158, 11, 0.025);
}

.qr-reader-container {
  width: 100%;
  min-height: 280px;
  background: #000;
}

.qr-reader-container :deep(video) {
  width: 100% !important;
  height: auto !important;
  border-radius: 10px;
}

.qr-reader-container :deep(#studentQrReader__scan_region) {
  min-height: 250px;
}

.qr-reader-container :deep(#studentQrReader__dashboard) {
  padding: 10px !important;
}

.qr-reader-container :deep(#studentQrReader__dashboard_section) {
  padding: 5px !important;
}

.qr-reader-container :deep(button) {
  border: 1px solid #dee2e6;
  background: #fff;
  border-radius: 6px;
  padding: 5px 12px;
}
</style>
