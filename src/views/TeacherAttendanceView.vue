<template>
  <div class="dashboard-layout bg-light min-vh-100 d-flex">
    <aside class="sidebar-wrapper">
      <dashPageView />
    </aside>

    <div class="main-wrapper flex-grow-1 min-vh-100 d-flex flex-column">
      <RouterView />

      <main class="attendance-section py-3 py-md-4 px-2 px-md-3">
        <div class="attendance-container bg-white rounded-3 shadow-sm p-3 p-md-4 position-relative">
          <!-- Holiday Notice -->
          <div
            v-if="activeHoliday"
            class="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
            style="background-color: rgba(0, 0, 0, 0.3); z-index: 1050; pointer-events: none"
          >
            <div
              class="card border-0 shadow-lg rounded-4 overflow-hidden bg-white text-center p-4 p-md-5 border-top border-warning border-5"
              style="max-width: 480px; width: 100%; pointer-events: auto"
            >
              <div class="mb-3">
                <div
                  class="d-inline-flex align-items-center justify-content-center bg-warning bg-opacity-10 text-warning rounded-circle p-3 shadow-sm"
                  style="width: 70px; height: 70px"
                >
                  <i class="bi bi-calendar-event-fill fs-2"></i>
                </div>
              </div>

              <div
                class="badge bg-warning text-dark px-3 py-2 rounded-pill fw-bold text-uppercase mb-2 shadow-sm d-inline-block mx-auto"
              >
                Holiday Notice
              </div>

              <h3 class="fw-bold text-dark mb-2 fs-4">
                {{ activeHoliday.title }}
              </h3>

              <p class="text-muted small mb-3 fw-semibold">
                <i class="bi bi-clock-history me-1 text-warning"></i>
                Duration: <span class="text-dark">{{ activeHoliday.start_date }}</span> to
                <span class="text-dark">{{ activeHoliday.end_date }}</span>
              </p>

              <div class="bg-light p-3 rounded-3 border mb-4 text-start">
                <h6 class="fw-semibold text-secondary small text-uppercase mb-1">
                  Description / Notes:
                </h6>
                <p class="mb-0 text-dark small" style="white-space: pre-line">
                  {{
                    activeHoliday.description ||
                    'Attendance tracking is automatically disabled for this holiday period.'
                  }}
                </p>
              </div>

              <div
                class="text-muted small border-top pt-3 d-flex align-items-center justify-content-center gap-1"
              >
                <i class="bi bi-shield-lock-fill text-danger"></i>
                <span>System is locked for attendance tracking today.</span>
              </div>
            </div>
          </div>

          <!-- Title & Actions -->
          <div
            class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4"
          >
            <div>
              <h2 class="h4 h3-md mb-0 fw-bold text-dark">Teacher Attendance</h2>
              <p class="text-muted mb-0 small">
                Manage daily teacher attendance, check-in, check-out and working hours
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
                <i class="bi bi-check-circle-fill me-1"></i>
                Saved!
              </div>

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

              <button
                class="btn btn-primary btn-sm btn-md-md d-flex align-items-center justify-content-center gap-2 fw-semibold shadow-sm flex-grow-1 flex-md-grow-0"
                @click="markAllPresent"
                :disabled="activeHoliday"
              >
                <i class="bi bi-person-check-fill"></i>
                <span>Mark All Present</span>
              </button>
            </div>
          </div>

          <!-- Shift Filters -->
          <div
            class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3 bg-light p-2 rounded border"
          >
            <div class="btn-group btn-group-sm" role="group">
              <button
                type="button"
                class="btn"
                :class="selectedShift === '' ? 'btn-primary' : 'btn-outline-primary'"
                @click="selectedShift = ''"
              >
                All Shifts
              </button>

              <button
                v-for="shiftName in availableShifts"
                :key="shiftName"
                type="button"
                class="btn"
                :class="selectedShift === shiftName ? 'btn-primary' : 'btn-outline-primary'"
                @click="selectedShift = shiftName"
              >
                {{ shiftName }}
              </button>
            </div>

            <div class="text-muted small">
              Filtering Shift:
              <strong class="text-uppercase text-dark">
                {{ selectedShift || 'All Shifts' }}
              </strong>
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
                  placeholder="Search Teacher ID or Name..."
                />
              </div>
            </div>

            <div class="text-muted small align-self-start align-self-sm-center">
              <span class="badge bg-light text-secondary border px-3 py-2 rounded-pill shadow-sm">
                Total Records:
                <strong>{{ filteredTeachers.length }}</strong>
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
                      <th scope="col" class="ps-3 ps-md-4">TEACHER ID</th>
                      <th scope="col">TEACHER NAME</th>
                      <th scope="col">SHIFT & START TIME</th>

                      <th scope="col" class="text-center">
                        <div class="d-flex align-items-center justify-content-center gap-1">
                          <input
                            class="form-check-input custom-checkbox"
                            type="checkbox"
                            :checked="isAllSelected"
                            @change="toggleSelectAll"
                            :disabled="activeHoliday"
                          />
                          <span class="ms-1 d-none d-sm-inline">PRESENT</span>
                        </div>
                      </th>

                      <th scope="col" class="text-center">CHECK IN</th>
                      <th scope="col" class="text-center">CHECK OUT</th>
                      <th scope="col" class="text-center">WORKING TIME</th>
                      <th scope="col" class="text-center">LATE</th>
                      <th scope="col" class="text-center">EDIT</th>
                      <th scope="col" class="text-end pe-3 pe-md-4">ACTION</th>

                      <th scope="col" class="text-center">
                        <div class="d-flex align-items-center justify-content-center gap-1">
                          <span class="d-none d-sm-inline">LEAVE</span>
                        </div>
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr v-if="loading">
                      <td colspan="11" class="text-center py-4 text-muted">
                        <div class="spinner-border spinner-border-sm me-2" role="status"></div>
                        Loading teacher attendance...
                      </td>
                    </tr>

                    <tr
                      v-else
                      v-for="teacherMember in paginatedTeachers"
                      :key="teacherMember.uniqueKey"
                      class="attendance-row"
                      :class="{
                        'present-row':
                          teacherMember.isPresent && !teacherMember.isLeave && !activeHoliday,
                        'absent-row':
                          !teacherMember.isPresent && !teacherMember.isLeave && !activeHoliday,
                        'leave-row': teacherMember.isLeave,
                        'table-warning': activeHoliday,
                      }"
                    >
                      <td class="ps-3 ps-md-4">
                        <div class="fw-semibold text-dark text-uppercase small">
                          {{ teacherMember.teacher_code }}
                        </div>
                      </td>

                      <td>
                        <div class="d-flex align-items-center gap-2 gap-md-3">
                          <img
                            :src="teacherMember.image || getTeacherPhoto(teacherMember.gender)"
                            class="rounded-circle staff-photo-placeholder flex-shrink-0 object-fit-cover"
                            alt="Teacher"
                            style="width: 32px; height: 32px"
                          />
                          <div>
                            <div class="fw-bold text-dark text-uppercase small text-nowrap">
                              {{ teacherMember.name }}
                            </div>
                            <small class="text-muted text-uppercase small d-block">
                              {{ teacherMember.subject || 'N/A' }}
                            </small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div class="d-flex flex-column">
                          <span class="badge bg-secondary text-white w-fit mb-1">
                            {{ teacherMember.shift_name }}
                          </span>
                        </div>
                      </td>

                      <td class="text-center">
                        <div class="form-check d-flex justify-content-center m-0">
                          <input
                            class="form-check-input custom-checkbox"
                            type="checkbox"
                            v-model="teacherMember.isPresent"
                            :disabled="teacherMember.isLeave || activeHoliday"
                            @change="onCheckboxChange(teacherMember)"
                          />
                        </div>
                      </td>

                      <td class="text-center font-monospace small text-nowrap">
                        <span
                          v-if="
                            teacherMember.checkInTime && !teacherMember.isLeave && !activeHoliday
                          "
                          class="fw-semibold text-dark"
                        >
                          {{ teacherMember.checkInTime }}
                        </span>
                        <span v-else class="text-muted">-</span>
                      </td>

                      <td class="text-center font-monospace small text-nowrap">
                        <div
                          class="d-flex align-items-center justify-content-center gap-2"
                          v-if="teacherMember.isPresent && !teacherMember.isLeave && !activeHoliday"
                        >
                          <input
                            class="form-check-input custom-checkbox"
                            type="checkbox"
                            :checked="teacherMember.rawOutTime ? true : false"
                            @change="toggleOutTime(teacherMember, $event)"
                          />
                          <span v-if="teacherMember.rawOutTime" class="fw-semibold text-dark">
                            {{ formatTimeTo12Hr(teacherMember.rawOutTime) }}
                          </span>
                          <span v-else class="text-muted small">Checkout</span>
                        </div>
                        <span v-else class="text-muted">-</span>
                      </td>

                      <td class="text-center font-monospace small text-nowrap">
                        <span
                          v-if="
                            teacherMember.workingHours && !teacherMember.isLeave && !activeHoliday
                          "
                          class="badge bg-info bg-opacity-10 text-info fw-semibold border border-info border-opacity-25 px-2 py-1"
                        >
                          {{ teacherMember.workingHours }}
                        </span>
                        <span v-else class="text-muted">-</span>
                      </td>

                      <td class="text-center text-nowrap">
                        <span
                          v-if="
                            !activeHoliday &&
                            !teacherMember.isLeave &&
                            teacherMember.lateMinutes > 0
                          "
                          class="badge bg-danger rounded-pill fw-bold text-uppercase fs-8 px-2 px-md-3 py-1"
                        >
                          LATE: {{ teacherMember.lateMinutes }} MIN
                        </span>
                        <span
                          v-else-if="
                            !activeHoliday && !teacherMember.isLeave && teacherMember.isPresent
                          "
                          class="badge bg-success rounded-pill fw-bold text-uppercase fs-8 px-2 px-md-3 py-1"
                        >
                          ON TIME
                        </span>
                        <span v-else class="text-muted fs-8">-</span>
                      </td>

                      <td class="text-center">
                        <div class="form-check d-flex justify-content-center m-0">
                          <button
                            class="btn btn-outline-primary btn-sm px-2 py-1"
                            @click="openEditModal(teacherMember)"
                            :disabled="
                              !teacherMember.isPresent || teacherMember.isLeave || activeHoliday
                            "
                            title="Edit In/Out Time via Modal"
                          >
                            <i class="bi bi-pencil-square"></i>
                          </button>
                        </div>
                      </td>

                      <td class="text-end pe-3 pe-md-4">
                        <span
                          class="badge rounded-pill px-2 px-md-3 py-1 py-md-2 text-uppercase fs-8 fw-bold pill-status"
                          :class="
                            activeHoliday
                              ? 'bg-warning text-dark'
                              : teacherMember.isLeave
                                ? 'status-leave'
                                : teacherMember.isPresent
                                  ? 'status-present'
                                  : 'status-absent'
                          "
                        >
                          {{
                            activeHoliday
                              ? 'Holiday'
                              : teacherMember.isLeave
                                ? 'Leave'
                                : teacherMember.isPresent
                                  ? 'Present'
                                  : 'Absent'
                          }}
                        </span>
                      </td>

                      <td class="text-center">
                        <div class="form-check d-flex justify-content-center m-0">
                          <input
                            class="form-check-input custom-checkbox"
                            type="checkbox"
                            v-model="teacherMember.isLeave"
                            :disabled="activeHoliday"
                            @change="onLeaveChange(teacherMember)"
                          />
                        </div>
                      </td>
                    </tr>

                    <tr v-if="!loading && filteredTeachers.length === 0">
                      <td colspan="11" class="text-center py-4 text-muted">
                        No teacher found matching your criteria.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <div
            class="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 mt-3 text-muted small"
          >
            <div>
              Showing
              {{ filteredTeachers.length ? (currentPage - 1) * perPage + 1 : 0 }}
              to
              {{ Math.min(currentPage * perPage, filteredTeachers.length) }}
              of {{ filteredTeachers.length }} entries
            </div>

            <nav aria-label="Page navigation">
              <ul class="pagination pagination-sm m-0">
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <button
                    type="button"
                    class="page-link"
                    :disabled="currentPage === 1"
                    @click="goToPage(currentPage - 1)"
                  >
                    Previous
                  </button>
                </li>

                <li
                  v-for="page in totalPages"
                  :key="page"
                  class="page-item"
                  :class="{ active: currentPage === page }"
                >
                  <button type="button" class="page-link" @click="goToPage(page)">
                    {{ page }}
                  </button>
                </li>

                <li
                  class="page-item"
                  :class="{ disabled: currentPage === totalPages || totalPages === 0 }"
                >
                  <button
                    type="button"
                    class="page-link"
                    :disabled="currentPage === totalPages || totalPages === 0"
                    @click="goToPage(currentPage + 1)"
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </main>
    </div>

    <!-- Edit Time Modal -->
    <div
      class="modal fade"
      id="editTeacherTimeModal"
      tabindex="-1"
      aria-labelledby="editTeacherTimeModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header bg-light">
            <h5 class="modal-title fw-bold text-dark fs-6" id="editTeacherTimeModalLabel">
              Edit Attendance Time - {{ editingTeacher?.name }}
            </h5>
            <button
              type="button"
              class="btn-close shadow-none"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>

          <div class="modal-body p-4" v-if="editingTeacher">
            <div class="mb-3">
              <label for="editInTime" class="form-label fw-semibold small">
                Check-in Time (Entry)
              </label>
              <input
                type="time"
                id="editInTime"
                :disabled="!editingTeacher.isPresent || editingTeacher.isLeave || activeHoliday"
                v-model="editingTeacher.tempInTime"
                class="form-control font-monospace"
              />
            </div>

            <div class="mb-3">
              <label for="editOutTime" class="form-label fw-semibold small">
                Check-out Time (Exit)
              </label>
              <input
                type="time"
                id="editOutTime"
                :disabled="!editingTeacher.isPresent || editingTeacher.isLeave || activeHoliday"
                v-model="editingTeacher.tempOutTime"
                class="form-control font-monospace"
              />
            </div>
          </div>

          <div class="modal-footer bg-light border-0">
            <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">
              Cancel
            </button>
            <button
              type="button"
              class="btn btn-primary btn-sm"
              @click="saveModalTimes"
              :disabled="!editingTeacher || editingTeacher.isLeave || activeHoliday"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import dashPageView from './dashPageView.vue'
import api from '@/services/api'
import 'bootstrap/js/dist/modal.js'
import * as bootstrap from 'bootstrap'

const today = new Date().toISOString().split('T')[0]
const selectedDate = ref(today)
const searchQuery = ref('')
const selectedShift = ref('')
const teachers = ref([])
const loading = ref(false)
const isSyncing = ref(false)
const saveSuccess = ref(false)
const editingTeacher = ref(null)
let modalInstance = null
const holidays = ref([])

const fetchHolidays = async () => {
  try {
    const response = await api.get('/holidays')
    holidays.value = response.data.data || response.data || []
  } catch (error) {
    console.error('Error fetching holidays for attendance:', error)
  }
}

const activeHoliday = computed(() => {
  if (!holidays.value || !Array.isArray(holidays.value)) return null

  return holidays.value.find((holiday) => {
    return selectedDate.value >= holiday.start_date && selectedDate.value <= holiday.end_date
  })
})

const getCurrent24HrTime = () => {
  const now = new Date()
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

const formatTimeTo12Hr = (time24) => {
  if (!time24) return null

  const [h, m] = time24.split(':')
  let hours = parseInt(h)
  const ampm = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12 || 12

  return `${String(hours).padStart(2, '0')}:${m} ${ampm}`
}

const calculateLateMinutes = (checkInTime24, shiftStartTime) => {
  if (!checkInTime24 || !shiftStartTime) return 0

  const [shiftHours, shiftMinutes] = shiftStartTime.split(':').map(Number)
  const [checkInHours, checkInMinutes] = checkInTime24.split(':').map(Number)

  const scheduledTotalMinutes = shiftHours * 60 + shiftMinutes
  const checkInTotalMinutes = checkInHours * 60 + checkInMinutes

  if (checkInTotalMinutes > scheduledTotalMinutes) {
    return checkInTotalMinutes - scheduledTotalMinutes
  }

  return 0
}

// Checkout থাকলে actual checkout, না থাকলে shift-এর end_time ব্যবহার হবে।
const calculateWorkingHours = (inTime24, outTime24, shiftEndTime = null) => {
  const effectiveOutTime = outTime24 || shiftEndTime

  if (!inTime24 || !effectiveOutTime) return null

  const [inH, inM] = inTime24.split(':').map(Number)
  const [outH, outM] = effectiveOutTime.split(':').map(Number)

  const inTotalMins = inH * 60 + inM
  const outTotalMins = outH * 60 + outM

  if (outTotalMins <= inTotalMins) return '0h 0m'

  const diffMins = outTotalMins - inTotalMins
  const hours = Math.floor(diffMins / 60)
  const minutes = diffMins % 60

  return `${hours}h ${minutes}m`
}

const fetchAttendanceData = async () => {
  loading.value = true

  try {
    const teachersRes = await api.get('/teachers', {
      params: { per_page: 100 },
    })

    console.log('Raw Teachers Response:', teachersRes.data)

    let rawTeachers = []

    if (Array.isArray(teachersRes.data)) {
      rawTeachers = teachersRes.data
    } else if (teachersRes.data && Array.isArray(teachersRes.data.data)) {
      rawTeachers = teachersRes.data.data
    }

    let rawAttendance = []

    try {
      const attendanceRes = await api.get('/teacher-attendances', {
        params: { date: selectedDate.value },
      })

      console.log('Raw Attendance Response:', attendanceRes.data)

      if (Array.isArray(attendanceRes.data)) {
        rawAttendance = attendanceRes.data
      } else if (attendanceRes.data && Array.isArray(attendanceRes.data.data)) {
        rawAttendance = attendanceRes.data.data
      }
    } catch (e) {
      console.warn('No attendance recorded yet for this date.')
    }

    const expandedTeachers = []

    rawTeachers.forEach((t) => {
      const teacherId = t.id

      const teacherShifts =
        t.shifts && Array.isArray(t.shifts) && t.shifts.length > 0
          ? t.shifts
          : [{ id: 'default', name: 'General Shift', start_time: '09:00:00', end_time: null }]

      teacherShifts.forEach((shift) => {
        const shiftId = shift.id || 'default'
        const shiftName = shift.name || 'General Shift'
        const shiftStartTime = shift.start_time || '09:00:00'
        const shiftEndTime = shift.end_time || null

        const record = rawAttendance.find(
          (att) =>
            att &&
            String(att.teacher_id) === String(teacherId) &&
            att.shift_name?.toLowerCase() === shiftName.toLowerCase(),
        )

        let isPresent = false
        let isLeave = false
        let checkInTime = null
        let rawInTime = null
        let rawOutTime = null
        let lateMinutes = 0
        let workingHours = null
        let attendanceId = null

        if (record) {
          isLeave = record.status === 'Leave'
          isPresent = record.status === 'Present' || record.status === 'Late'
          rawInTime = record.in_time || null
          rawOutTime = record.out_time || null
          checkInTime = rawInTime ? formatTimeTo12Hr(rawInTime) : null
          lateMinutes = calculateLateMinutes(rawInTime, shiftStartTime)

          workingHours = !isLeave
            ? calculateWorkingHours(rawInTime, rawOutTime, shiftEndTime)
            : null

          attendanceId = record.id
        }

        expandedTeachers.push({
          uniqueKey: `${teacherId}_${shiftId}`,
          id: teacherId,
          attendance_id: attendanceId,
          shift_id: shiftId,
          shift_name: shiftName,
          shiftStartTime,
          shiftEndTime,
          teacher_code: t.teacher_code || t.teacher_id || `TCH-${teacherId}`,
          name: t.full_name || t.name || 'Unknown',
          subject: t.department || t.subject || 'N/A',
          image: t.image || null,
          gender: (t.gender || 'male').toLowerCase(),
          isPresent,
          isLeave,
          checkInTime,
          rawInTime,
          rawOutTime,
          workingHours,
          lateMinutes,
        })
      })
    })

    teachers.value = expandedTeachers
  } catch (error) {
    console.error('Error fetching teachers:', error)
  } finally {
    loading.value = false
  }
}

const onCheckboxChange = (teacher) => {
  if (activeHoliday.value) return

  if (teacher.isPresent) {
    teacher.isLeave = false
    teacher.rawInTime = getCurrent24HrTime()
    teacher.checkInTime = formatTimeTo12Hr(teacher.rawInTime)
    teacher.lateMinutes = calculateLateMinutes(teacher.rawInTime, teacher.shiftStartTime)
    teacher.workingHours = calculateWorkingHours(
      teacher.rawInTime,
      teacher.rawOutTime,
      teacher.shiftEndTime,
    )
  } else {
    teacher.checkInTime = null
    teacher.rawInTime = null
    teacher.rawOutTime = null
    teacher.workingHours = null
    teacher.lateMinutes = 0
  }

  autoSaveSingleTeacher(teacher)
}

const onLeaveChange = (teacher) => {
  if (activeHoliday.value) return

  if (teacher.isLeave) {
    teacher.isPresent = false
    teacher.checkInTime = null
    teacher.rawInTime = null
    teacher.rawOutTime = null
    teacher.workingHours = null
    teacher.lateMinutes = 0
  }

  autoSaveSingleTeacher(teacher)
}

const toggleOutTime = (teacher, event) => {
  if (activeHoliday.value) return

  const isChecked = event.target.checked
  teacher.rawOutTime = isChecked ? getCurrent24HrTime() : null

  teacher.workingHours = calculateWorkingHours(
    teacher.rawInTime,
    teacher.rawOutTime,
    teacher.shiftEndTime,
  )

  autoSaveSingleTeacher(teacher)
}

const openEditModal = (teacher) => {
  if (activeHoliday.value) return

  editingTeacher.value = {
    ...teacher,
    tempInTime: teacher.rawInTime || '',
    tempOutTime: teacher.rawOutTime || '',
  }

  const modalElement = document.getElementById('editTeacherTimeModal')
  modalInstance = new bootstrap.Modal(modalElement)
  modalInstance.show()
}

const saveModalTimes = async () => {
  if (!editingTeacher.value || activeHoliday.value) return

  const teacher = teachers.value.find((t) => t.uniqueKey === editingTeacher.value.uniqueKey)

  if (teacher) {
    teacher.rawInTime = editingTeacher.value.tempInTime || null
    teacher.rawOutTime = editingTeacher.value.tempOutTime || null
    teacher.checkInTime = teacher.rawInTime ? formatTimeTo12Hr(teacher.rawInTime) : null
    teacher.lateMinutes = calculateLateMinutes(teacher.rawInTime, teacher.shiftStartTime)

    teacher.workingHours = calculateWorkingHours(
      teacher.rawInTime,
      teacher.rawOutTime,
      teacher.shiftEndTime,
    )

    await autoSaveSingleTeacher(teacher)
  }

  if (modalInstance) modalInstance.hide()
}

const autoSaveSingleTeacher = async (teacher) => {
  if (activeHoliday.value) return

  isSyncing.value = true
  saveSuccess.value = false

  try {
    let status = 'Absent'

    if (teacher.isLeave) {
      status = 'Leave'
    } else if (teacher.isPresent) {
      status = teacher.lateMinutes > 0 ? 'Late' : 'Present'
    }

    const payload = {
      status,
      in_time: teacher.isPresent ? teacher.rawInTime || getCurrent24HrTime() : null,
      out_time: teacher.isPresent ? teacher.rawOutTime || null : null,
      note: teacher.lateMinutes > 0 ? `Late by ${teacher.lateMinutes} mins` : null,
    }

    if (teacher.attendance_id) {
      const response = await api.put(`/teacher-attendances/${teacher.attendance_id}`, payload)

      if (response.data && response.data.data) {
        teacher.attendance_id = response.data.data.id
      }
    } else {
      const createPayload = {
        date: selectedDate.value,
        attendances: [
          {
            teacher_id: teacher.id,
            shift_name: teacher.shift_name,
            ...payload,
          },
        ],
      }

      const response = await api.post('/teacher-attendances', createPayload)

      if (response.data && response.data.data && response.data.data.length > 0) {
        teacher.attendance_id = response.data.data[0].id
      }
    }

    saveSuccess.value = true

    setTimeout(() => {
      saveSuccess.value = false
    }, 2000)
  } catch (error) {
    console.error('Save/Update error:', error)
  } finally {
    isSyncing.value = false
  }
}

const markAllPresent = async () => {
  if (activeHoliday.value) return

  filteredTeachers.value.forEach((teacher) => {
    teacher.isPresent = true
    teacher.isLeave = false
    teacher.rawInTime = getCurrent24HrTime()
    teacher.checkInTime = formatTimeTo12Hr(teacher.rawInTime)
    teacher.lateMinutes = calculateLateMinutes(teacher.rawInTime, teacher.shiftStartTime)

    teacher.workingHours = calculateWorkingHours(
      teacher.rawInTime,
      teacher.rawOutTime,
      teacher.shiftEndTime,
    )
  })

  for (const teacher of filteredTeachers.value) {
    await autoSaveSingleTeacher(teacher)
  }
}

const toggleSelectAll = async (event) => {
  if (activeHoliday.value) return

  const checkState = event.target.checked

  filteredTeachers.value.forEach((teacher) => {
    teacher.isPresent = checkState

    if (checkState) {
      teacher.isLeave = false
      teacher.rawInTime = getCurrent24HrTime()
      teacher.checkInTime = formatTimeTo12Hr(teacher.rawInTime)
      teacher.lateMinutes = calculateLateMinutes(teacher.rawInTime, teacher.shiftStartTime)

      teacher.workingHours = calculateWorkingHours(
        teacher.rawInTime,
        teacher.rawOutTime,
        teacher.shiftEndTime,
      )
    } else {
      teacher.checkInTime = null
      teacher.rawInTime = null
      teacher.rawOutTime = null
      teacher.workingHours = null
      teacher.lateMinutes = 0
    }
  })

  for (const teacher of filteredTeachers.value) {
    await autoSaveSingleTeacher(teacher)
  }
}

const availableShifts = computed(() => {
  if (!teachers.value || !Array.isArray(teachers.value)) return []

  const allShiftNames = []

  teachers.value.forEach((t) => {
    if (t && t.shift_name && !allShiftNames.includes(t.shift_name)) {
      allShiftNames.push(t.shift_name)
    }
  })

  return allShiftNames
})

const filteredTeachers = computed(() => {
  if (!teachers.value || !Array.isArray(teachers.value)) return []

  return teachers.value.filter((t) => {
    if (!t) return false

    const matchesShift =
      !selectedShift.value ||
      (t.shift_name && t.shift_name.toLowerCase() === selectedShift.value.toLowerCase())

    const query = searchQuery.value ? searchQuery.value.toLowerCase().trim() : ''

    const matchesSearch =
      !query ||
      (t.name && t.name.toLowerCase().includes(query)) ||
      (t.teacher_code && String(t.teacher_code).toLowerCase().includes(query)) ||
      (t.subject && t.subject.toLowerCase().includes(query))

    return matchesShift && matchesSearch
  })
})

const currentPage = ref(1)
const perPage = ref(10)

const totalPages = computed(() => Math.ceil(filteredTeachers.value.length / perPage.value))

const paginatedTeachers = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return filteredTeachers.value.slice(start, start + perPage.value)
})

const goToPage = (page) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
}

watch([searchQuery, selectedShift], () => {
  currentPage.value = 1
})

const isAllSelected = computed(() => {
  return filteredTeachers.value.length > 0 && filteredTeachers.value.every((t) => t.isPresent)
})

const getTeacherPhoto = (gender) => {
  return gender === 'male' || gender === 'm'
    ? 'https://via.placeholder.com/32?text=M'
    : 'https://via.placeholder.com/32?text=F'
}

onMounted(async () => {
  await fetchHolidays()
  fetchAttendanceData()
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

.teacher-photo-placeholder {
  width: 32px;
  height: 32px;
  background-color: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fs-8 {
  font-size: 0.7rem;
}

@media (max-width: 576px) {
  .attendance-table th,
  .attendance-table td {
    padding-left: 0.5rem !important;
    padding-right: 0.5rem !important;
  }
}
</style>
