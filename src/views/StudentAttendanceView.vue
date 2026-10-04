<template>
  <!-- Main Dashboard Wrapper -->
  <div class="dashboard-layout bg-light min-vh-100 d-flex">
    <!-- Left Sidebar -->
    <aside class="sidebar-wrapper">
      <dashPageView />
    </aside>

    <!-- Right Main Content -->
    <main class="main-wrapper flex-grow-1 min-vh-100 d-flex flex-column">
      <!-- Dynamic Router View -->
      <RouterView />

      <!-- Student Attendance Main Section -->
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
                <strong>
                  {{ holidayInfo.title || holidayInfo.name || 'Public Holiday' }}
                </strong>
              </p>
            </div>
          </div>

          <!-- Title & Action -->
          <div
            class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4"
          >
            <div>
              <h2 class="h4 h3-md mb-0 fw-bold text-dark">Student Attendance</h2>

              <p class="text-muted mb-0 small">
                Manage daily student attendance by class, group, section and shift
              </p>
            </div>

            <div class="d-flex flex-wrap align-items-center gap-2 gap-md-3">
              <!-- Saving Indicator -->
              <div
                v-if="isSyncing"
                class="d-flex align-items-center text-primary small fw-semibold"
              >
                <div class="spinner-border spinner-border-sm me-2" role="status"></div>
                Saving...
              </div>

              <div v-else-if="saveSuccess" class="text-success small fw-semibold">
                <i class="bi bi-check-circle-fill me-1"></i>
                Saved!
              </div>

              <!-- Date -->
              <div
                class="date-select-wrapper px-3 py-1 py-md-2 bg-light border rounded d-flex align-items-center gap-2 shadow-sm flex-grow-1 flex-md-grow-0"
              >
                <label for="date-select" class="form-label mb-0 fw-semibold text-secondary small">
                  Date:
                </label>

                <input
                  type="date"
                  id="date-select"
                  v-model="selectedDate"
                  @change="fetchAttendanceData"
                  class="form-control form-control-sm border-0 bg-transparent p-0 w-auto flex-grow-1"
                />
              </div>

              <!-- Mark All Present -->
              <button
                class="btn btn-primary btn-sm btn-md-md d-flex align-items-center justify-content-center gap-2 fw-semibold shadow-sm flex-grow-1 flex-md-grow-0"
                @click="markAllPresent"
                :disabled="holidayInfo || loading || filteredStudents.length === 0"
              >
                <i class="bi bi-person-check-fill"></i>
                <span>Mark All Present</span>
              </button>

              <!-- Scan QR -->
              <button
                type="button"
                class="btn btn-success btn-sm btn-md-md d-flex align-items-center justify-content-center gap-2 fw-semibold shadow-sm flex-grow-1 flex-md-grow-0"
                @click="openQrScanner"
                :disabled="holidayInfo || loading || filteredStudents.length === 0"
              >
                <i class="bi bi-qr-code-scan"></i>
                <span>Scan QR</span>
              </button>
            </div>
          </div>

          <!-- Filter Buttons -->
          <div class="d-flex flex-column gap-2 mb-3 bg-light p-2 rounded border">
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

            <!-- Class / Group / Section Filters -->
            <div class="row g-2 mt-1">
              <!-- Class -->
              <div class="col-12 col-md-4">
                <select
                  v-model="selectedClass"
                  @change="fetchAttendanceData"
                  class="form-select form-select-sm"
                >
                  <option value="">All Classes</option>

                  <option v-for="item in classOptions" :key="item.id" :value="String(item.id)">
                    {{ item.name }}
                  </option>
                </select>
              </div>

              <!-- Group -->
              <div class="col-12 col-md-4">
                <select
                  v-model="selectedGroup"
                  @change="fetchAttendanceData"
                  class="form-select form-select-sm"
                >
                  <option value="">All Groups</option>

                  <option v-for="item in groupOptions" :key="item.id" :value="String(item.id)">
                    {{ item.name }}
                  </option>
                </select>
              </div>

              <!-- Section -->
              <div class="col-12 col-md-4">
                <select
                  v-model="selectedSection"
                  @change="fetchAttendanceData"
                  class="form-select form-select-sm"
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
                  type="text"
                  v-model="searchQuery"
                  class="form-control border-start-0 ps-0 shadow-none"
                  placeholder="Search Student ID or Name..."
                />
              </div>
            </div>

            <div class="text-muted small align-self-start align-self-sm-center">
              <span class="badge bg-light text-secondary border px-3 py-2 rounded-pill shadow-sm">
                Total Records:
                <strong>{{ filteredStudents.length }}</strong>
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
                      <th scope="col" class="ps-3 ps-md-4">STUDENT ID</th>

                      <th scope="col">STUDENT NAME</th>

                      <th scope="col">CLASS</th>

                      <th scope="col">GROUP</th>

                      <th scope="col">SECTION</th>

                      <th scope="col">SHIFT</th>

                      <!-- PRESENT -->
                      <th scope="col" class="text-center">
                        <div class="d-flex align-items-center justify-content-center gap-1">
                          <input
                            class="form-check-input custom-checkbox"
                            type="checkbox"
                            :checked="isAllPresent"
                            @change="toggleSelectAll"
                            :disabled="holidayInfo || filteredStudents.length === 0"
                          />

                          <span class="ms-1 d-none d-sm-inline"> PRESENT </span>
                        </div>
                      </th>

                      <!-- LATE -->
                      <th scope="col" class="text-center">LATE</th>

                      <!-- EDIT -->
                      <th scope="col" class="text-center">EDIT</th>

                      <!-- ACTION -->
                      <th scope="col" class="text-end pe-3 pe-md-4">ACTION</th>
                    </tr>
                  </thead>

                  <tbody>
                    <!-- Loading -->
                    <tr v-if="loading">
                      <td colspan="10" class="text-center py-4 text-muted">
                        <div class="spinner-border spinner-border-sm me-2" role="status"></div>

                        Loading student attendance...
                      </td>
                    </tr>

                    <!-- Student Rows -->
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
                      <!-- STUDENT ID -->
                      <td class="ps-3 ps-md-4">
                        <div class="fw-semibold text-dark text-uppercase small">
                          {{ student.student_code }}
                        </div>
                      </td>

                      <!-- STUDENT NAME -->
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

                      <!-- CLASS -->
                      <td>
                        <span class="badge bg-primary text-white w-fit">
                          {{ student.class_name }}
                        </span>
                      </td>

                      <!-- GROUP -->
                      <td>
                        <span class="badge bg-secondary text-white w-fit">
                          {{ student.group_name }}
                        </span>
                      </td>

                      <!-- SECTION -->
                      <td>
                        <span class="badge bg-light text-dark border w-fit">
                          {{ student.section_name }}
                        </span>
                      </td>

                      <!-- SHIFT -->
                      <td>
                        <span class="badge bg-secondary text-white w-fit">
                          {{ student.shift_name }}
                        </span>
                      </td>

                      <!-- PRESENT -->
                      <td class="text-center">
                        <div class="form-check d-flex justify-content-center m-0">
                          <input
                            class="form-check-input custom-checkbox"
                            type="checkbox"
                            v-model="student.isPresent"
                            :disabled="holidayInfo || savingIds.includes(student.id)"
                            @change="onCheckboxChange(student)"
                          />
                        </div>
                      </td>

                      <!-- LATE -->
                      <td class="text-center text-nowrap">
                        <span
                          v-if="!holidayInfo && student.status === 'late'"
                          class="badge bg-danger rounded-pill fw-bold text-uppercase fs-8 px-2 px-md-3 py-1"
                        >
                          LATE
                        </span>

                        <span
                          v-else-if="!holidayInfo && student.status === 'present'"
                          class="badge bg-success rounded-pill fw-bold text-uppercase fs-8 px-2 px-md-3 py-1"
                        >
                          ON TIME
                        </span>

                        <span
                          v-else-if="!holidayInfo && student.status === 'leave'"
                          class="badge bg-warning text-dark rounded-pill fw-bold text-uppercase fs-8 px-2 px-md-3 py-1"
                        >
                          LEAVE
                        </span>

                        <span v-else class="text-muted fs-8"> - </span>
                      </td>

                      <!-- EDIT -->
                      <td class="text-center">
                        <div class="form-check d-flex justify-content-center m-0">
                          <button
                            class="btn btn-outline-primary btn-sm px-2 py-1"
                            @click="openEditModal(student)"
                            :disabled="holidayInfo || savingIds.includes(student.id)"
                            title="Edit Attendance"
                          >
                            <i class="bi bi-pencil-square"></i>
                          </button>
                        </div>
                      </td>

                      <!-- ACTION / STATUS -->
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

                    <!-- No Students -->
                    <tr v-if="!loading && filteredStudents.length === 0">
                      <td colspan="10" class="text-center py-4 text-muted">
                        No students found matching your criteria.
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
            <div>
              Showing
              {{ filteredStudents.length }}
              of
              {{ studentList.length }}
              entries
            </div>

            <nav aria-label="Page navigation">
              <ul class="pagination pagination-sm m-0">
                <li class="page-item disabled">
                  <a class="page-link" href="#" tabindex="-1" aria-disabled="true"> Previous </a>
                </li>

                <li class="page-item active" aria-current="page">
                  <a class="page-link" href="#"> 1 </a>
                </li>

                <li class="page-item">
                  <a class="page-link" href="#"> Next </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </main>

    <!-- Edit Attendance Modal -->
    <div
      class="modal fade"
      id="editStudentAttendanceModal"
      tabindex="-1"
      aria-labelledby="editStudentAttendanceModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header bg-light">
            <h5 class="modal-title fw-bold text-dark fs-6" id="editStudentAttendanceModalLabel">
              Edit Attendance -
              {{ editingStudent?.name }}
            </h5>

            <button
              type="button"
              class="btn-close shadow-none"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>

          <div class="modal-body p-4" v-if="editingStudent">
            <!-- Student Info -->
            <div class="d-flex align-items-center gap-3 mb-4">
              <img
                :src="editingStudent.image || getStudentPhoto()"
                class="rounded-circle student-modal-photo object-fit-cover"
                alt="Student"
              />

              <div>
                <div class="fw-bold text-dark">
                  {{ editingStudent.name }}
                </div>

                <small class="text-muted d-block">
                  ID:
                  {{ editingStudent.student_code }}
                </small>

                <small class="text-muted d-block">
                  {{ editingStudent.class_name }}

                  <span v-if="editingStudent.group_name !== 'N/A'">
                    ·
                    {{ editingStudent.group_name }}
                  </span>
                </small>
              </div>
            </div>

            <!-- Status -->
            <div class="mb-3">
              <label for="editStatus" class="form-label fw-semibold small">
                Attendance Status
              </label>

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

            <!-- Remarks -->
            <div class="mb-3">
              <label for="editRemarks" class="form-label fw-semibold small"> Remarks </label>

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
              @click="saveModalAttendance"
              :disabled="!editingStudent || holidayInfo || isSyncing"
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
      class="modal fade"
      id="holidayNoticeModal"
      tabindex="-1"
      aria-labelledby="holidayNoticeModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4 p-3 text-center">
          <div class="modal-body">
            <!-- Icon -->
            <div class="mb-3">
              <div
                class="d-inline-flex align-items-center justify-content-center bg-warning bg-opacity-10 text-warning rounded-circle p-3"
                style="width: 70px; height: 70px"
              >
                <i class="bi bi-calendar-event fs-2"></i>
              </div>
            </div>

            <!-- Badge -->
            <span
              class="badge bg-warning text-dark fw-bold px-3 py-1 rounded-pill mb-2 text-uppercase"
              style="letter-spacing: 0.5px"
            >
              Holiday Notice
            </span>

            <!-- Holiday Title -->
            <h4 class="fw-bold text-dark mb-2">
              {{ holidayInfo?.title || holidayInfo?.name || 'Public Holiday' }}
            </h4>

            <!-- Duration -->
            <p class="text-muted small mb-3">
              <i class="bi bi-clock-history me-1"></i>

              Duration:

              <strong>
                {{ holidayInfo?.date || selectedDate }}
              </strong>
            </p>

            <!-- Description -->
            <div class="bg-light border rounded-3 p-3 text-start mb-3">
              <label class="form-label fw-semibold text-secondary fs-8 text-uppercase mb-1">
                Description / Notes:
              </label>

              <p class="mb-0 text-dark small">
                {{ holidayInfo?.description || holidayInfo?.note || 'No description provided.' }}
              </p>
            </div>

            <!-- Lock Warning -->
            <div
              class="text-danger small fw-semibold d-flex align-items-center justify-content-center gap-1"
            >
              <i class="bi bi-exclamation-circle-fill"></i>

              <span> System is locked for attendance tracking today. </span>
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

    <!-- QR SCANNER MODAL -->
    <div
      class="modal fade"
      id="qrScannerModal"
      tabindex="-1"
      aria-labelledby="qrScannerModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4">
          <!-- Header -->
          <div class="modal-header bg-light">
            <h5 class="modal-title fw-bold text-dark" id="qrScannerModalLabel">
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

          <!-- Body -->
          <div class="modal-body p-3">
            <!-- QR Reader -->
            <div
              id="studentQrReader"
              class="qr-reader-container rounded-3 overflow-hidden border"
            ></div>

            <!-- Scanner Message -->
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

            <!-- Instruction -->
            <div class="text-center text-muted small mt-3">
              <i class="bi bi-camera me-1"></i>

              Point the camera at the student's QR code
            </div>
          </div>

          <!-- Footer -->
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

/**
 * |--------------------------------------------------------------------------
 * | STATES
 * |--------------------------------------------------------------------------
 */

const today = new Date().toISOString().split('T')[0]

const selectedDate = ref(today)
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

/**
 * |--------------------------------------------------------------------------
 * | QR SCANNER STATES
 * |--------------------------------------------------------------------------
 */

const qrScannerVisible = ref(false)
const qrScannerRunning = ref(false)
const qrScanMessage = ref('')
const qrScanMessageType = ref('info')
const qrProcessing = ref(false)

let html5QrCode = null
let qrScannerModalInstance = null
let qrScannerModalElement = null

/**
 * |--------------------------------------------------------------------------
 * | FETCH ATTENDANCE DATA
 * |--------------------------------------------------------------------------
 */

const fetchAttendanceData = async () => {
  loading.value = true

  try {
    /**
     * |--------------------------------------------------------------------------
     * | FETCH HOLIDAYS
     * |--------------------------------------------------------------------------
     */

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

          if (holiday.start_date === selectedDate.value) {
            return true
          }

          return false
        }) || null

      /**
       * |--------------------------------------------------------------------------
       * | SHOW HOLIDAY MODAL
       * |--------------------------------------------------------------------------
       */

      if (holidayInfo.value) {
        setTimeout(() => {
          const modalElement = document.getElementById('holidayNoticeModal')

          if (modalElement) {
            if (!holidayModalInstance) {
              holidayModalInstance = new bootstrap.Modal(modalElement)
            }

            holidayModalInstance.show()
          }
        }, 100)
      }
    } catch (error) {
      console.warn('Holiday data could not be loaded.')
      holidayInfo.value = null
    }

    /**
     * |--------------------------------------------------------------------------
     * | FETCH STUDENT ATTENDANCE
     * |--------------------------------------------------------------------------
     */

    const attendanceRes = await api.get('/student-attendance', {
      params: {
        date: selectedDate.value,
        class_id: selectedClass.value || undefined,
        class_group_id: selectedGroup.value || undefined,
        section_id: selectedSection.value || undefined,
        shift_id: selectedShift.value || undefined,
      },
    })

    /**
     * |--------------------------------------------------------------------------
     * | API RESPONSE
     * |--------------------------------------------------------------------------
     */

    const rawStudents = Array.isArray(attendanceRes.data?.students)
      ? attendanceRes.data.students
      : []

    /**
     * |--------------------------------------------------------------------------
     * | BUILD FILTER OPTIONS
     * |--------------------------------------------------------------------------
     */

    if (
      !selectedClass.value &&
      !selectedGroup.value &&
      !selectedSection.value &&
      !selectedShift.value
    ) {
      buildFilterOptions(rawStudents)
    }

    /**
     * |--------------------------------------------------------------------------
     * | NORMALIZE STUDENT DATA
     * |--------------------------------------------------------------------------
     */

    studentList.value = rawStudents.map((student) => {
      const classInfo = student.class_info || student.classInfo || null
      const classGroup = student.class_group || student.classGroup || null
      const section = student.section || null
      const shift = student.shift || null
      const attendance = student.attendance || null

      /**
       * Attendance Status
       */

      const status = student.attendance_status || attendance?.status || 'absent'

      return {
        id: student.id,

        student_code: student.student_id || `STD-${student.id}`,

        name: student.full_name || 'Unknown',

        phone: student.phone || '',

        image: student.image_url || (student.image ? `/storage/${student.image}` : null),

        /**
         * CLASS
         */

        class_id: student.class_id || classInfo?.id || null,

        class_name: classInfo?.class_name || 'N/A',

        /**
         * GROUP
         */

        group_id: student.class_group_id || classGroup?.id || null,

        group_name: classGroup?.group_name || 'N/A',

        /**
         * SECTION
         */

        section_id: student.section_id || section?.id || null,

        section_name: section?.section_name || 'N/A',

        /**
         * SHIFT
         */

        shift_id: student.shift_id || shift?.id || null,

        shift_name: shift?.name || 'N/A',

        /**
         * BRANCH
         */

        branch_id: student.branch_id || null,

        /**
         * ATTENDANCE
         */

        attendance_id: student.attendance_id || attendance?.id || null,

        status: status,

        remarks: student.attendance_remarks || attendance?.remarks || '',

        /**
         * PRESENT CHECKBOX
         *
         * Present + Late = checked
         * Leave + Absent = unchecked
         */

        isPresent: status === 'present' || status === 'late',
      }
    })
  } catch (error) {
    console.error('Error fetching student attendance:', error)

    studentList.value = []
  } finally {
    loading.value = false
  }
}

/**
 * |--------------------------------------------------------------------------
 * | BUILD FILTER OPTIONS
 * |--------------------------------------------------------------------------
 */

const buildFilterOptions = (students) => {
  /**
   * CLASSES
   */

  const classMap = new Map()

  students.forEach((student) => {
    const classInfo = student.class_info || student.classInfo || null

    const id = student.class_id || classInfo?.id

    const name = classInfo?.class_name

    if (id && name) {
      classMap.set(String(id), {
        id,
        name,
      })
    }
  })

  classOptions.value = Array.from(classMap.values()).sort((a, b) =>
    String(a.name).localeCompare(String(b.name)),
  )

  /**
   * GROUPS
   */

  const groupMap = new Map()

  students.forEach((student) => {
    const group = student.class_group || student.classGroup || null

    const id = student.class_group_id || group?.id

    const name = group?.group_name

    if (id && name) {
      groupMap.set(String(id), {
        id,
        name,
      })
    }
  })

  groupOptions.value = Array.from(groupMap.values()).sort((a, b) =>
    String(a.name).localeCompare(String(b.name)),
  )

  /**
   * SECTIONS
   */

  const sectionMap = new Map()

  students.forEach((student) => {
    const section = student.section || null

    const id = student.section_id || section?.id

    const name = section?.section_name

    if (id && name) {
      sectionMap.set(String(id), {
        id,
        name,
      })
    }
  })

  sectionOptions.value = Array.from(sectionMap.values()).sort((a, b) =>
    String(a.name).localeCompare(String(b.name)),
  )

  /**
   * SHIFTS
   */

  const shiftMap = new Map()

  students.forEach((student) => {
    const shift = student.shift || null

    const id = student.shift_id || shift?.id

    const name = shift?.name

    if (id && name) {
      shiftMap.set(String(id), {
        id,
        name,
      })
    }
  })

  shiftOptions.value = Array.from(shiftMap.values()).sort((a, b) =>
    String(a.name).localeCompare(String(b.name)),
  )
}

/**
 * |--------------------------------------------------------------------------
 * | SHIFT CHANGE
 * |--------------------------------------------------------------------------
 */

const changeShift = (shiftId) => {
  selectedShift.value = shiftId === '' ? '' : String(shiftId)

  fetchAttendanceData()
}

/**
 * |--------------------------------------------------------------------------
 * | CHECKBOX CHANGE
 * |--------------------------------------------------------------------------
 */

const onCheckboxChange = async (student) => {
  if (holidayInfo.value) {
    return
  }

  /**
   * Checked = Present
   * Unchecked = Absent
   */

  student.status = student.isPresent ? 'present' : 'absent'

  await autoSaveSingleStudent(student)
}

/**
 * |--------------------------------------------------------------------------
 * | SAVE SINGLE STUDENT
 * |--------------------------------------------------------------------------
 */

const autoSaveSingleStudent = async (student) => {
  if (holidayInfo.value) {
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
      date: selectedDate.value,
      status: student.status,
      remarks: student.remarks || null,
    })

    /**
     * Update Attendance ID
     */

    if (response.data?.attendance?.id) {
      student.attendance_id = response.data.attendance.id
    }

    saveSuccess.value = true

    setTimeout(() => {
      saveSuccess.value = false
    }, 2000)

    return true
  } catch (error) {
    console.error('Student attendance save error:', error)

    /**
     * Reload Database State
     */

    await fetchAttendanceData()

    return false
  } finally {
    savingIds.value = savingIds.value.filter((id) => id !== student.id)

    isSyncing.value = false
  }
}

/**
 * |--------------------------------------------------------------------------
 * | MARK ALL PRESENT
 * |--------------------------------------------------------------------------
 */

const markAllPresent = async () => {
  if (holidayInfo.value || filteredStudents.value.length === 0) {
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
    console.error('Mark all present error:', error)

    await fetchAttendanceData()
  } finally {
    isSyncing.value = false
  }
}

/**
 * |--------------------------------------------------------------------------
 * | SELECT ALL PRESENT / ABSENT
 * |--------------------------------------------------------------------------
 */

const toggleSelectAll = async (event) => {
  if (holidayInfo.value) {
    return
  }

  const checked = event.target.checked

  isSyncing.value = true
  saveSuccess.value = false

  try {
    for (const student of filteredStudents.value) {
      student.isPresent = checked

      student.status = checked ? 'present' : 'absent'

      await api.post('/student-attendance', {
        student_id: student.id,
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
    console.error('Toggle select all error:', error)

    await fetchAttendanceData()
  } finally {
    isSyncing.value = false
  }
}

/**
 * |--------------------------------------------------------------------------
 * | OPEN EDIT MODAL
 * |--------------------------------------------------------------------------
 */

const openEditModal = (student) => {
  if (holidayInfo.value) {
    return
  }

  editingStudent.value = {
    ...student,

    tempStatus: student.status || 'absent',

    tempRemarks: student.remarks || '',
  }

  const modalElement = document.getElementById('editStudentAttendanceModal')

  if (!modalElement) {
    return
  }

  modalInstance = new bootstrap.Modal(modalElement)

  modalInstance.show()
}

/**
 * |--------------------------------------------------------------------------
 * | SAVE EDIT MODAL
 * |--------------------------------------------------------------------------
 */

const saveModalAttendance = async () => {
  if (holidayInfo.value || !editingStudent.value) {
    return
  }

  const student = studentList.value.find((item) => item.id === editingStudent.value.id)

  if (!student) {
    return
  }

  isSyncing.value = true
  saveSuccess.value = false

  try {
    const response = await api.post('/student-attendance', {
      student_id: student.id,
      date: selectedDate.value,
      status: editingStudent.value.tempStatus,
      remarks: editingStudent.value.tempRemarks || null,
    })

    /**
     * Update Local Student
     */

    student.status = editingStudent.value.tempStatus

    /**
     * Present Checkbox
     *
     * Present + Late = checked
     * Leave + Absent = unchecked
     */

    student.isPresent = student.status === 'present' || student.status === 'late'

    student.remarks = editingStudent.value.tempRemarks || ''

    if (response.data?.attendance?.id) {
      student.attendance_id = response.data.attendance.id
    }

    if (modalInstance) {
      modalInstance.hide()
    }

    saveSuccess.value = true

    setTimeout(() => {
      saveSuccess.value = false
    }, 2000)
  } catch (error) {
    console.error('Edit attendance error:', error)
  } finally {
    isSyncing.value = false
  }
}

/**
 * |--------------------------------------------------------------------------
 * | QR SCANNER
 * |--------------------------------------------------------------------------
 */

/**
 * OPEN QR SCANNER
 */

const openQrScanner = () => {
  if (holidayInfo.value) {
    return
  }

  if (loading.value) {
    return
  }

  if (filteredStudents.value.length === 0) {
    return
  }

  qrScanMessage.value = 'Starting camera...'

  qrScanMessageType.value = 'info'

  qrScannerVisible.value = true
  qrProcessing.value = false

  const modalElement = document.getElementById('qrScannerModal')

  if (!modalElement) {
    console.error('QR Scanner modal not found.')

    return
  }

  qrScannerModalElement = modalElement

  if (!qrScannerModalInstance) {
    qrScannerModalInstance = bootstrap.Modal.getOrCreateInstance(modalElement)
  }

  /**
   * Start camera after modal
   * has completely opened.
   */

  modalElement.addEventListener('shown.bs.modal', startQrScanner, {
    once: true,
  })

  qrScannerModalInstance.show()
}

/**
 * START QR SCANNER
 */

const startQrScanner = async () => {
  if (holidayInfo.value) {
    return
  }

  if (qrScannerRunning.value) {
    return
  }

  try {
    /**
     * Cleanup previous scanner
     * if any.
     */

    if (html5QrCode) {
      await stopQrScanner()
    }

    const readerElement = document.getElementById('studentQrReader')

    if (!readerElement) {
      qrScanMessage.value = 'QR scanner area could not be found.'

      qrScanMessageType.value = 'danger'

      return
    }

    /**
     * Clear old reader HTML
     */

    readerElement.innerHTML = ''

    html5QrCode = new Html5Qrcode('studentQrReader')

    qrScanMessage.value = 'Camera is starting...'

    qrScanMessageType.value = 'info'

    await html5QrCode.start(
      {
        facingMode: 'environment',
      },
      {
        fps: 10,

        qrbox: {
          width: 250,
          height: 250,
        },

        aspectRatio: 1.0,
      },

      /**
       * QR SUCCESS CALLBACK
       *
       * IMPORTANT:
       * Do NOT stop scanner here.
       */

      async (decodedText) => {
        await handleQrScan(decodedText)
      },

      /**
       * QR frame errors
       * are ignored.
       */

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

/**
 * |--------------------------------------------------------------------------
 * | HANDLE QR SCAN
 * |--------------------------------------------------------------------------
 */

const handleQrScan = async (decodedText) => {
  /**
   * Prevent multiple callbacks
   * from processing at the same time.
   */

  if (qrProcessing.value) {
    return
  }

  if (holidayInfo.value) {
    return
  }

  qrProcessing.value = true

  try {
    const scannedCode = String(decodedText || '').trim()

    if (!scannedCode) {
      qrScanMessage.value = 'Invalid QR code.'

      qrScanMessageType.value = 'warning'

      return
    }

    /**
     * |--------------------------------------------------------------------------
     * | FIND STUDENT
     * |--------------------------------------------------------------------------
     *
     * QR value must match student_code.
     */

    const student = studentList.value.find(
      (item) =>
        String(item.student_code || '')
          .trim()
          .toLowerCase() === scannedCode.toLowerCase(),
    )

    /**
     * |--------------------------------------------------------------------------
     * | STUDENT NOT FOUND
     * |--------------------------------------------------------------------------
     *
     * IMPORTANT:
     * Scanner remains running.
     */

    if (!student) {
      qrScanMessage.value = `Student not found: ${scannedCode}`

      qrScanMessageType.value = 'danger'

      return
    }

    /**
     * |--------------------------------------------------------------------------
     * | ALREADY PRESENT
     * |--------------------------------------------------------------------------
     *
     * IMPORTANT:
     * DO NOT stop scanner.
     */

    if (student.status === 'present' || student.status === 'late') {
      qrScanMessage.value = `${student.name} is already marked ${student.status}.`

      qrScanMessageType.value = 'warning'

      return
    }

    /**
     * |--------------------------------------------------------------------------
     * | MARK PRESENT
     * |--------------------------------------------------------------------------
     */

    student.status = 'present'

    student.isPresent = true

    qrScanMessage.value = `${student.name} marked Present. Saving...`

    qrScanMessageType.value = 'info'

    /**
     * |--------------------------------------------------------------------------
     * | SAVE ATTENDANCE
     * |--------------------------------------------------------------------------
     */

    const saved = await autoSaveSingleStudent(student)

    if (saved) {
      qrScanMessage.value = `${student.name} marked Present successfully.`

      qrScanMessageType.value = 'success'
    } else {
      qrScanMessage.value = `Could not save attendance for ${student.name}.`

      qrScanMessageType.value = 'danger'
    }

    /**
     * IMPORTANT:
     *
     * DO NOT call:
     *
     * await stopQrScanner()
     *
     * Camera remains active for
     * the next student.
     */
  } catch (error) {
    console.error('QR attendance error:', error)

    qrScanMessage.value = 'Could not process this QR code. Please try again.'

    qrScanMessageType.value = 'danger'
  } finally {
    /**
     * Unlock scanner for next QR.
     */

    qrProcessing.value = false
  }
}

/**
 * |--------------------------------------------------------------------------
 * | STOP QR SCANNER
 * |--------------------------------------------------------------------------
 *
 * This is called ONLY when:
 *
 * 1. User closes the modal
 * 2. Component is unmounted
 * 3. Scanner needs to be restarted
 */

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

/**
 * |--------------------------------------------------------------------------
 * | AVAILABLE SHIFTS
 * |--------------------------------------------------------------------------
 */

const availableShifts = computed(() => {
  return shiftOptions.value
})

/**
 * |--------------------------------------------------------------------------
 * | SELECTED SHIFT NAME
 * |--------------------------------------------------------------------------
 */

const selectedShiftName = computed(() => {
  if (!selectedShift.value) {
    return ''
  }

  const shift = shiftOptions.value.find((item) => String(item.id) === String(selectedShift.value))

  return shift?.name || ''
})

/**
 * |--------------------------------------------------------------------------
 * | FILTERED STUDENTS
 * |--------------------------------------------------------------------------
 */

const filteredStudents = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()

  return studentList.value.filter((student) => {
    const matchesSearch =
      !query ||
      String(student.student_code).toLowerCase().includes(query) ||
      String(student.name).toLowerCase().includes(query)

    return matchesSearch
  })
})

/**
 * |--------------------------------------------------------------------------
 * | CHECK WHETHER ALL STUDENTS ARE PRESENT
 * |--------------------------------------------------------------------------
 */

const isAllPresent = computed(() => {
  return (
    filteredStudents.value.length > 0 &&
    filteredStudents.value.every(
      (student) => student.status === 'present' || student.status === 'late',
    )
  )
})

/**
 * |--------------------------------------------------------------------------
 * | DEFAULT STUDENT PHOTO
 * |--------------------------------------------------------------------------
 */

const getStudentPhoto = () => {
  return 'https://via.placeholder.com/32?text=S'
}

/**
 * |--------------------------------------------------------------------------
 * | ON MOUNTED
 * |--------------------------------------------------------------------------
 */

onMounted(() => {
  fetchAttendanceData()

  /**
   * Keep a stable reference
   * to the QR modal.
   */

  qrScannerModalElement = document.getElementById('qrScannerModal')

  /**
   * When user closes QR modal,
   * camera MUST stop.
   */

  if (qrScannerModalElement) {
    qrScannerModalElement.addEventListener('hidden.bs.modal', stopQrScanner)
  }
})

/**
 * |--------------------------------------------------------------------------
 * | CLEANUP WHEN COMPONENT UNMOUNTS
 * |--------------------------------------------------------------------------
 */

onBeforeUnmount(async () => {
  if (qrScannerModalElement) {
    qrScannerModalElement.removeEventListener('hidden.bs.modal', stopQrScanner)
  }

  await stopQrScanner()
})
</script>
<style scoped>
/* Main Layout Container */
.dashboard-layout {
  display: flex;
  width: 100%;
  overflow-x: hidden;
}

/* Sidebar Area Wrapper */
.sidebar-wrapper {
  flex-shrink: 0;
  min-width: 250px;
  z-index: 1000;
}

/* Main Content Right Wrapper */
.main-wrapper {
  flex-grow: 1;
  width: calc(100% - 250px);
  overflow-y: auto;
}

/* Responsive Handling */
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

/* Leave Status */
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

.status-holiday {
  background-color: #0dcaf0 !important;
  color: #fff !important;
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

/* Leave Row */
.leave-row {
  background-color: rgba(245, 158, 11, 0.025);
}

/* =========================================================
   QR SCANNER
   ========================================================= */

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
