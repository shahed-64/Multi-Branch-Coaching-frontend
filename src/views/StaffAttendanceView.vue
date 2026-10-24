<template>
  <!-- Main Dashboard Wrapper for Flex Layout -->

  <div class="dashboard-layout bg-light min-vh-100 d-flex">
    <!-- Left Sidebar Component -->

    <aside class="sidebar-wrapper">
      <dashPageView />
    </aside>

    <!-- Right Main Content Area -->

    <main class="main-wrapper flex-grow-1 min-vh-100 d-flex flex-column">
      <!-- Dynamic Router View -->

      <RouterView />

      <!-- Staff Attendance Main Section -->

      <div class="attendance-section py-3 py-md-4 px-2 px-md-3">
        <div class="attendance-container bg-white rounded-3 shadow-sm p-3 p-md-4">
          <!-- Holiday Banner (যদি আজ ছুটি থাকে) -->

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

          <!-- Title & Action Section -->

          <div
            class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4"
          >
            <div>
              <h2 class="h4 h3-md mb-0 fw-bold text-dark">Staff Attendance</h2>

              <p class="text-muted mb-0 small">
                Manage daily staff attendance, check-in, check-out and working hours
              </p>
            </div>

            <div class="d-flex flex-wrap align-items-center gap-2 gap-md-3">
              <!-- Syncing / Saving Status Indicator -->

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

              <!-- Date Selector -->

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

              <!-- Bulk Attendance Button -->

              <button
                class="btn btn-primary btn-sm btn-md-md d-flex align-items-center justify-content-center gap-2 fw-semibold shadow-sm flex-grow-1 flex-md-grow-0"
                @click="markAllPresent"
                :disabled="holidayInfo"
              >
                <i class="bi bi-person-check-fill"></i>

                <span>Mark All Present</span>
              </button>
            </div>
          </div>

          <!-- Shift Filter Buttons -->

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

          <!-- Search Bar & Summary Row -->

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
                  placeholder="Search Staff ID or Name..."
                />
              </div>
            </div>

            <div class="text-muted small align-self-start align-self-sm-center">
              <span class="badge bg-light text-secondary border px-3 py-2 rounded-pill shadow-sm">
                Total Records:

                <strong>{{ filteredStaffs.length }}</strong>
              </span>
            </div>
          </div>

          <!-- Attendance Table Card -->

          <div class="card border-0 shadow-sm">
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-hover align-middle mb-0 attendance-table">
                  <thead class="table-light">
                    <tr class="fw-semibold text-secondary small">
                      <th scope="col" class="ps-3 ps-md-4">STAFF ID</th>

                      <th scope="col">STAFF NAME</th>

                      <th scope="col">SHIFT & START TIME</th>

                      <!-- PRESENT -->

                      <th scope="col" class="text-center">
                        <div class="d-flex align-items-center justify-content-center gap-1">
                          <input
                            class="form-check-input custom-checkbox"
                            type="checkbox"
                            :checked="isAllSelected"
                            @change="toggleSelectAll"
                            :disabled="holidayInfo"
                          />

                          <span class="ms-1 d-none d-sm-inline"> PRESENT </span>
                        </div>
                      </th>

                      <th scope="col" class="text-center">CHECK IN</th>

                      <th scope="col" class="text-center">CHECK OUT</th>

                      <th scope="col" class="text-center">WORKING TIME</th>

                      <th scope="col" class="text-center">LATE</th>

                      <th scope="col" class="text-center">EDIT</th>

                      <th scope="col" class="text-end pe-3 pe-md-4">ACTION</th>

                      <!-- LEAVE -->

                      <th scope="col" class="text-center">
                        <div class="d-flex align-items-center justify-content-center gap-1">
                          <span class="d-none d-sm-inline"> LEAVE </span>
                        </div>
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    <!-- Loading -->

                    <tr v-if="loading">
                      <td colspan="11" class="text-center py-4 text-muted">
                        <div class="spinner-border spinner-border-sm me-2" role="status"></div>

                        Loading staff attendance...
                      </td>
                    </tr>

                    <!-- Staff Rows -->

                    <tr
                      v-else
                      v-for="staffMember in paginatedStaffs"
                      :key="staffMember.uniqueKey"
                      class="attendance-row"
                      :class="{
                        'present-row':
                          !holidayInfo && staffMember.isPresent && !staffMember.isLeave,

                        'absent-row':
                          !holidayInfo && !staffMember.isPresent && !staffMember.isLeave,

                        'leave-row': !holidayInfo && staffMember.isLeave,

                        'holiday-row': holidayInfo,
                      }"
                    >
                      <!-- STAFF ID -->

                      <td class="ps-3 ps-md-4">
                        <div class="fw-semibold text-dark text-uppercase small">
                          {{ staffMember.staff_code }}
                        </div>
                      </td>

                      <!-- STAFF NAME -->

                      <td>
                        <div class="d-flex align-items-center gap-2 gap-md-3">
                          <img
                            :src="staffMember.image || getStaffPhoto()"
                            class="rounded-circle staff-photo-placeholder flex-shrink-0 object-fit-cover"
                            alt="Staff"
                          />

                          <div>
                            <div class="fw-bold text-dark text-uppercase small text-nowrap">
                              {{ staffMember.name }}
                            </div>

                            <small class="text-muted text-uppercase small d-block">
                              {{ staffMember.skill || 'N/A' }}
                            </small>
                          </div>
                        </div>
                      </td>

                      <!-- SHIFT -->

                      <td>
                        <div class="d-flex flex-column">
                          <span class="badge bg-secondary text-white w-fit mb-1">
                            {{ staffMember.shift_name }}
                          </span>
                        </div>
                      </td>

                      <!-- PRESENT -->

                      <td class="text-center">
                        <div class="form-check d-flex justify-content-center m-0">
                          <input
                            class="form-check-input custom-checkbox"
                            type="checkbox"
                            v-model="staffMember.isPresent"
                            :disabled="staffMember.isLeave || holidayInfo"
                            @change="onCheckboxChange(staffMember)"
                          />
                        </div>
                      </td>

                      <!-- CHECK IN -->

                      <td class="text-center font-monospace small text-nowrap">
                        <span
                          v-if="!holidayInfo && staffMember.checkInTime && !staffMember.isLeave"
                          class="fw-semibold text-dark"
                        >
                          {{ staffMember.checkInTime }}
                        </span>

                        <span v-else class="text-muted"> - </span>
                      </td>

                      <!-- CHECK OUT -->

                      <td class="text-center font-monospace small text-nowrap">
                        <div
                          class="d-flex align-items-center justify-content-center gap-2"
                          v-if="!holidayInfo && staffMember.isPresent && !staffMember.isLeave"
                        >
                          <input
                            class="form-check-input custom-checkbox"
                            type="checkbox"
                            :checked="staffMember.rawOutTime ? true : false"
                            @change="toggleOutTime(staffMember, $event)"
                            :disabled="holidayInfo"
                          />

                          <span v-if="staffMember.rawOutTime" class="fw-semibold text-dark">
                            {{ formatTimeTo12Hr(staffMember.rawOutTime) }}
                          </span>

                          <span v-else class="text-muted small"> Checkout </span>
                        </div>

                        <span v-else class="text-muted"> - </span>
                      </td>

                      <!-- WORKING TIME -->

                      <td class="text-center font-monospace small text-nowrap">
                        <span
                          v-if="!holidayInfo && staffMember.workingHours && !staffMember.isLeave"
                          class="badge bg-info bg-opacity-10 text-info fw-semibold border border-info border-opacity-25 px-2 py-1"
                        >
                          {{ staffMember.workingHours }}
                        </span>

                        <span v-else class="text-muted"> - </span>
                      </td>

                      <!-- LATE -->

                      <td class="text-center text-nowrap">
                        <span
                          v-if="!holidayInfo && !staffMember.isLeave && staffMember.lateMinutes > 0"
                          class="badge bg-danger rounded-pill fw-bold text-uppercase fs-8 px-2 px-md-3 py-1"
                        >
                          LATE: {{ staffMember.lateMinutes }} MIN
                        </span>

                        <span
                          v-else-if="!holidayInfo && !staffMember.isLeave && staffMember.isPresent"
                          class="badge bg-success rounded-pill fw-bold text-uppercase fs-8 px-2 px-md-3 py-1"
                        >
                          ON TIME
                        </span>

                        <span v-else class="text-muted fs-8"> - </span>
                      </td>

                      <!-- EDIT -->

                      <td class="text-center">
                        <div class="form-check d-flex justify-content-center m-0">
                          <button
                            class="btn btn-outline-primary btn-sm px-2 py-1"
                            @click="openEditModal(staffMember)"
                            :disabled="!staffMember.isPresent || staffMember.isLeave || holidayInfo"
                            title="Edit In/Out Time via Modal"
                          >
                            <i class="bi bi-pencil-square"></i>
                          </button>
                        </div>
                      </td>

                      <!-- LEAVE -->

                      <td class="text-center">
                        <div class="form-check d-flex justify-content-center m-0">
                          <input
                            class="form-check-input custom-checkbox"
                            type="checkbox"
                            v-model="staffMember.isLeave"
                            :disabled="holidayInfo"
                            @change="onLeaveChange(staffMember)"
                          />
                        </div>
                      </td>

                      <!-- ACTION / STATUS -->

                      <td class="text-end pe-3 pe-md-4">
                        <span
                          class="badge rounded-pill px-2 px-md-3 py-1 py-md-2 text-uppercase fs-8 fw-bold pill-status"
                          :class="
                            holidayInfo
                              ? 'status-holiday'
                              : staffMember.isLeave
                                ? 'status-leave'
                                : staffMember.isPresent
                                  ? 'status-present'
                                  : 'status-absent'
                          "
                        >
                          {{
                            holidayInfo
                              ? 'Holiday'
                              : staffMember.isLeave
                                ? 'Leave'
                                : staffMember.isPresent
                                  ? 'Present'
                                  : 'Absent'
                          }}
                        </span>
                      </td>
                    </tr>

                    <!-- No Staff -->

                    <tr v-if="!loading && filteredStaffs.length === 0">
                      <td colspan="11" class="text-center py-4 text-muted">
                        No staff found matching your criteria.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Footer / Pagination -->

          <div
            class="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 mt-3 text-muted small"
          >
            <div>
              Showing {{ startEntry }}–{{ endEntry }} of {{ filteredStaffs.length }} entries
            </div>
            <nav aria-label="Page navigation">
              <ul class="pagination pagination-sm m-0">
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <a
                    class="page-link"
                    href="#"
                    :aria-disabled="currentPage === 1"
                    @click.prevent="goToPage(currentPage - 1)"
                    >Previous</a
                  >
                </li>
                <li
                  v-for="page in totalPages"
                  :key="page"
                  class="page-item"
                  :class="{ active: currentPage === page }"
                  :aria-current="currentPage === page ? 'page' : null"
                >
                  <a class="page-link" href="#" @click.prevent="goToPage(page)">
                    {{ page }}
                  </a>
                </li>
                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                  <a
                    class="page-link"
                    href="#"
                    :aria-disabled="currentPage === totalPages"
                    @click.prevent="goToPage(currentPage + 1)"
                    >Next</a
                  >
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </main>

    <!-- Edit Time Modal -->

    <div
      class="modal fade"
      id="editStaffTimeModal"
      tabindex="-1"
      aria-labelledby="editStaffTimeModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header bg-light">
            <h5 class="modal-title fw-bold text-dark fs-6" id="editStaffTimeModalLabel">
              Edit Attendance Time - {{ editingStaff?.name }}
            </h5>

            <button
              type="button"
              class="btn-close shadow-none"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>

          <div class="modal-body p-4" v-if="editingStaff">
            <!-- Check In -->

            <div class="mb-3">
              <label for="editInTime" class="form-label fw-semibold small">
                Check-in Time (Entry)
              </label>

              <input
                type="time"
                id="editInTime"
                :disabled="!editingStaff.isPresent || editingStaff.isLeave"
                v-model="editingStaff.tempInTime"
                class="form-control font-monospace"
              />
            </div>

            <!-- Check Out -->

            <div class="mb-3">
              <label for="editOutTime" class="form-label fw-semibold small">
                Check-out Time (Exit)
              </label>

              <input
                type="time"
                id="editOutTime"
                :disabled="!editingStaff.isPresent || editingStaff.isLeave"
                v-model="editingStaff.tempOutTime"
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
              :disabled="!editingStaff || editingStaff.isLeave"
            >
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
              <i class="bi bi-clock-history me-1"></i> Duration:

              <strong>{{ holidayInfo?.date || selectedDate }}</strong>
            </p>

            <!-- Description Box -->

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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

import dashPageView from './dashPageView.vue'

import api from '@/services/api'

import 'bootstrap/js/dist/modal.js'

import * as bootstrap from 'bootstrap'

// =====================================================

// STATES

// =====================================================

const today = new Date().toISOString().split('T')[0]

const selectedDate = ref(today)

const searchQuery = ref('')

const selectedShift = ref('')

const staffList = ref([])

const loading = ref(false)

const isSyncing = ref(false)

const saveSuccess = ref(false)

const editingStaff = ref(null)

const holidayInfo = ref(null)

const currentPage = ref(1)

const perPage = ref(10)

let modalInstance = null

let holidayModalInstance = null

// =====================================================

// FETCH STAFF, ATTENDANCE & HOLIDAY DATA

// =====================================================

const fetchAttendanceData = async () => {
  loading.value = true

  try {
    // ===================================================

    // FETCH HOLIDAYS

    // ===================================================

    try {
      const holidayRes = await api.get('/holidays', {
        params: {
          date: selectedDate.value,
        },
      })

      const holidays = Array.isArray(holidayRes.data)
        ? holidayRes.data
        : holidayRes.data?.data || []

      /* Holiday detect: exact date first, then start_date/end_date range. */

      holidayInfo.value =
        holidays.find((h) => {
          // যদি API থেকে date সরাসরি আসে

          if (h.date === selectedDate.value) {
            return true
          }

          // start_date + end_date দিয়ে Holiday check

          if (h.start_date && h.end_date) {
            return selectedDate.value >= h.start_date && selectedDate.value <= h.end_date
          }

          // Single day holiday হলে start_date check

          if (h.start_date === selectedDate.value) {
            return true
          }

          return false
        }) || null

      // =================================================

      // HOLIDAY MODAL

      // =================================================

      if (holidayInfo.value) {
        setTimeout(() => {
          const modalEl = document.getElementById('holidayNoticeModal')

          if (modalEl) {
            if (!holidayModalInstance) {
              holidayModalInstance = new bootstrap.Modal(modalEl)
            }

            holidayModalInstance.show()
          }
        }, 100)
      }
    } catch (e) {
      console.warn('Holiday data could not be loaded.')

      holidayInfo.value = null
    }

    // ===================================================

    // FETCH STAFFS

    // ===================================================

    const staffRes = await api.get('/staff')

    console.log('Staff API Response:', staffRes.data)

    const rawStaffs = Array.isArray(staffRes.data)
      ? staffRes.data
      : Array.isArray(staffRes.data?.staff)
        ? staffRes.data.staff
        : Array.isArray(staffRes.data?.data)
          ? staffRes.data.data
          : []

    console.log('Total staff received:', rawStaffs.length)

    // ===================================================

    // FETCH ATTENDANCE

    // ===================================================

    let rawAttendance = []

    try {
      const attendanceRes = await api.get('/staff-attendances', {
        params: {
          date: selectedDate.value,
        },
      })

      rawAttendance = Array.isArray(attendanceRes.data)
        ? attendanceRes.data
        : attendanceRes.data?.data || []
    } catch (e) {
      console.warn('No attendance recorded yet for this date.')
    }

    // ===================================================

    // EXPAND STAFFS

    // ===================================================

    const expandedStaffs = []

    rawStaffs.forEach((s) => {
      const staffId = s.id

      const staffShifts = s.shift
        ? [s.shift]
        : [
            {
              id: 'default',

              name: 'General Shift',

              start_time: '09:00:00',
            },
          ]

      staffShifts.forEach((shift) => {
        const shiftId = shift.id

        const shiftName = shift.name || 'General Shift'

        const shiftStartTime = shift.start_time || '09:00:00'
        const shiftEndTime = shift.end_time || null

        // =================================================

        // FIND ATTENDANCE RECORD

        // =================================================

        const record = rawAttendance.find(
          (att) =>
            String(att.staff_id) === String(staffId) &&
            att.shift_name?.toLowerCase() === shiftName.toLowerCase(),
        )

        // =================================================

        // DEFAULT VALUES

        // =================================================

        let isPresent = false

        let isLeave = false

        let isHoliday = !!holidayInfo.value

        let checkInTime = null

        let rawInTime = null

        let rawOutTime = null

        let lateMinutes = 0

        let workingHours = null

        let attendanceId = null

        // =================================================

        // ATTENDANCE RECORD EXISTS

        // =================================================

        if (record) {
          /* Leave check */

          isLeave =
            record.leave === true ||
            record.leave === 1 ||
            record.leave === '1' ||
            record.status === 'Leave'

          /* Holiday / Off Day check; backend Off Day is treated as a holiday. */

          const isOffDay = record.status === 'Off Day'

          if (isOffDay) {
            isHoliday = true
          }

          /* Present check; Leave and Off Day are not Present. */

          isPresent =
            !isLeave && !isOffDay && (record.status === 'Present' || record.status === 'Late')

          rawInTime = record.in_time || null

          rawOutTime = record.out_time || null

          checkInTime = rawInTime ? formatTimeTo12Hr(rawInTime) : null

          lateMinutes = !isLeave && !isOffDay ? calculateLateMinutes(rawInTime, shiftStartTime) : 0

          workingHours =
            !isLeave && !isOffDay
              ? calculateWorkingHours(rawInTime, rawOutTime, shiftEndTime)
              : null

          attendanceId = record.id

          /* Clear times when on leave. */

          if (isLeave) {
            rawInTime = null

            rawOutTime = null

            checkInTime = null

            lateMinutes = 0

            workingHours = null
          }

          /* Clear times on an off day. */

          if (isOffDay) {
            rawInTime = null

            rawOutTime = null

            checkInTime = null

            lateMinutes = 0

            workingHours = null

            isPresent = false

            isLeave = false
          }
        }

        // =================================================

        // HOLIDAY SELECTED DATE

        // =================================================

        if (holidayInfo.value) {
          isHoliday = true

          isPresent = false

          isLeave = false

          rawInTime = null

          rawOutTime = null

          checkInTime = null

          lateMinutes = 0

          workingHours = null
        }

        // =================================================

        // PUSH STAFF OBJECT

        // =================================================

        expandedStaffs.push({
          uniqueKey: `${staffId}_${shiftId}`,

          id: staffId,

          attendance_id: attendanceId,

          shift_id: shiftId,

          shift_name: shiftName,

          shiftStartTime: shiftStartTime,
          shiftEndTime: shiftEndTime,

          staff_code: s.user_name ? `STF-${s.id}` : `STF-${staffId}`,

          name: s.name || 'Unknown',

          skill: s.skill || s.role || 'N/A',

          image: s.image ? `/storage/${s.image}` : null,

          isPresent: isPresent,

          isLeave: isLeave,

          isHoliday: isHoliday,

          checkInTime: checkInTime,

          rawInTime: rawInTime,

          rawOutTime: rawOutTime,

          workingHours: workingHours,

          lateMinutes: lateMinutes,
        })
      })
    })

    staffList.value = expandedStaffs
  } catch (error) {
    console.error('Error fetching staff attendance:', error)
  } finally {
    loading.value = false
  }
}

// =====================================================

// PRESENT CHECKBOX CHANGE

// =====================================================

const onCheckboxChange = (staffMember) => {
  if (holidayInfo.value) {
    return
  }

  if (staffMember.isPresent) {
    staffMember.isLeave = false

    staffMember.rawInTime = getCurrent24HrTime()

    staffMember.checkInTime = formatTimeTo12Hr(staffMember.rawInTime)

    staffMember.lateMinutes = calculateLateMinutes(
      staffMember.rawInTime,

      staffMember.shiftStartTime,
    )

    staffMember.workingHours = calculateWorkingHours(
      staffMember.rawInTime,
      staffMember.rawOutTime,
      staffMember.shiftEndTime,
    )
  } else {
    staffMember.checkInTime = null

    staffMember.rawInTime = null

    staffMember.rawOutTime = null

    staffMember.workingHours = null

    staffMember.lateMinutes = 0
  }

  autoSaveSingleStaff(staffMember)
}

// =====================================================

// LEAVE CHECKBOX CHANGE

// =====================================================

const onLeaveChange = (staffMember) => {
  if (holidayInfo.value) {
    return
  }

  if (staffMember.isLeave) {
    staffMember.isPresent = false

    staffMember.checkInTime = null

    staffMember.rawInTime = null

    staffMember.rawOutTime = null

    staffMember.workingHours = null

    staffMember.lateMinutes = 0
  } else {
    staffMember.isPresent = false

    staffMember.checkInTime = null

    staffMember.rawInTime = null

    staffMember.rawOutTime = null

    staffMember.workingHours = null

    staffMember.lateMinutes = 0
  }

  autoSaveSingleStaff(staffMember)
}

// =====================================================

// CHECK-OUT CHECKBOX

// =====================================================

const toggleOutTime = (staffMember, event) => {
  if (holidayInfo.value || staffMember.isLeave) {
    event.target.checked = false

    return
  }

  const isChecked = event.target.checked

  if (isChecked) {
    staffMember.rawOutTime = getCurrent24HrTime()
  } else {
    staffMember.rawOutTime = null
  }

  staffMember.workingHours = calculateWorkingHours(
    staffMember.rawInTime,
    staffMember.rawOutTime,
    staffMember.shiftEndTime,
  )

  autoSaveSingleStaff(staffMember)
}

// =====================================================

// OPEN EDIT MODAL

// =====================================================

const openEditModal = (staffMember) => {
  if (holidayInfo.value || staffMember.isHoliday || !staffMember.isPresent || staffMember.isLeave) {
    return
  }

  editingStaff.value = {
    ...staffMember,

    tempInTime: staffMember.rawInTime || '',

    tempOutTime: staffMember.rawOutTime || '',
  }

  const modalElement = document.getElementById('editStaffTimeModal')

  if (!modalElement) {
    return
  }

  modalInstance = new bootstrap.Modal(modalElement)

  modalInstance.show()
}

// =====================================================

// SAVE MODAL TIMES

// =====================================================

const saveModalTimes = async () => {
  if (holidayInfo.value || !editingStaff.value || editingStaff.value.isLeave) {
    return
  }

  const staffMember = staffList.value.find((s) => s.uniqueKey === editingStaff.value.uniqueKey)

  if (staffMember) {
    staffMember.rawInTime = editingStaff.value.tempInTime || null

    staffMember.rawOutTime = editingStaff.value.tempOutTime || null

    staffMember.checkInTime = staffMember.rawInTime ? formatTimeTo12Hr(staffMember.rawInTime) : null

    staffMember.lateMinutes = calculateLateMinutes(
      staffMember.rawInTime,

      staffMember.shiftStartTime,
    )

    staffMember.workingHours = calculateWorkingHours(
      staffMember.rawInTime,
      staffMember.rawOutTime,
      staffMember.shiftEndTime,
    )

    await autoSaveSingleStaff(staffMember)
  }

  if (modalInstance) {
    modalInstance.hide()
  }
}

// =====================================================

// SMART SAVE / UPDATE

// =====================================================

const autoSaveSingleStaff = async (staffMember) => {
  /* Do not save from frontend on a holiday; backend also protects this. */

  if (holidayInfo.value) {
    return
  }

  if (staffMember.isHoliday) {
    return
  }

  isSyncing.value = true

  saveSuccess.value = false

  try {
    // =================================================

    // LEAVE

    // =================================================

    if (staffMember.isLeave) {
      const payload = {
        status: 'Leave',

        leave: true,

        in_time: null,

        out_time: null,

        note: 'Staff is on leave',
      }

      if (staffMember.attendance_id) {
        const response = await api.put(`/staff-attendances/${staffMember.attendance_id}`, payload)

        if (response.data && response.data.data) {
          staffMember.attendance_id = response.data.data.id
        }
      } else {
        const createPayload = {
          date: selectedDate.value,

          attendances: [
            {
              staff_id: staffMember.id,

              shift_name: staffMember.shift_name,

              ...payload,
            },
          ],
        }

        const response = await api.post('/staff-attendances', createPayload)

        if (response.data && response.data.data && response.data.data.length > 0) {
          staffMember.attendance_id = response.data.data[0].id
        }
      }
    }

    // =================================================

    // NORMAL ATTENDANCE

    // =================================================
    else {
      const payload = {
        status: staffMember.isPresent
          ? staffMember.lateMinutes > 0
            ? 'Late'
            : 'Present'
          : 'Absent',

        leave: false,

        in_time: staffMember.isPresent ? staffMember.rawInTime || getCurrent24HrTime() : null,

        out_time: staffMember.isPresent ? staffMember.rawOutTime || null : null,

        note:
          staffMember.isPresent && staffMember.lateMinutes > 0
            ? `Late by ${staffMember.lateMinutes} mins`
            : null,
      }

      if (staffMember.attendance_id) {
        const response = await api.put(`/staff-attendances/${staffMember.attendance_id}`, payload)

        if (response.data && response.data.data) {
          staffMember.attendance_id = response.data.data.id
        }
      } else {
        const createPayload = {
          date: selectedDate.value,

          attendances: [
            {
              staff_id: staffMember.id,

              shift_name: staffMember.shift_name,

              ...payload,
            },
          ],
        }

        const response = await api.post('/staff-attendances', createPayload)

        if (response.data && response.data.data && response.data.data.length > 0) {
          staffMember.attendance_id = response.data.data[0].id
        }
      }
    }

    // =================================================

    // SUCCESS

    // =================================================

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

// =====================================================

// UTILITIES - TIME

// =====================================================

const getCurrent24HrTime = () => {
  const now = new Date()

  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

const formatTimeTo12Hr = (time24) => {
  if (!time24) {
    return null
  }

  const [h, m] = time24.split(':')

  let hours = parseInt(h)

  const ampm = hours >= 12 ? 'PM' : 'AM'

  hours = hours % 12 || 12

  return `${String(hours).padStart(2, '0')}:${m} ${ampm}`
}

const calculateLateMinutes = (checkInTime24, shiftStartTime) => {
  if (!checkInTime24 || !shiftStartTime) {
    return 0
  }

  const [shiftHours, shiftMinutes] = shiftStartTime.split(':').map(Number)

  const [checkInHours, checkInMinutes] = checkInTime24.split(':').map(Number)

  const scheduledTotalMinutes = shiftHours * 60 + shiftMinutes

  const checkInTotalMinutes = checkInHours * 60 + checkInMinutes

  if (checkInTotalMinutes > scheduledTotalMinutes) {
    return checkInTotalMinutes - scheduledTotalMinutes
  }

  return 0
}

const calculateWorkingHours = (inTime24, outTime24, shiftEndTime = null) => {
  // Checkout থাকলে actual checkout time, না থাকলে shift end time
  const effectiveOutTime = outTime24 || shiftEndTime

  if (!inTime24 || !effectiveOutTime) {
    return null
  }

  const [inH, inM] = inTime24.split(':').map(Number)
  const [outH, outM] = effectiveOutTime.split(':').map(Number)

  const inTotalMins = inH * 60 + inM
  const outTotalMins = outH * 60 + outM

  if (outTotalMins <= inTotalMins) {
    return '0h 0m'
  }

  const diffMins = outTotalMins - inTotalMins
  const hours = Math.floor(diffMins / 60)
  const minutes = diffMins % 60

  return `${hours}h ${minutes}m`
}

// =====================================================

// BULK ACTIONS

// =====================================================

const markAllPresent = async () => {
  if (holidayInfo.value) {
    return
  }

  filteredStaffs.value.forEach((staffMember) => {
    staffMember.isLeave = false

    staffMember.isPresent = true

    staffMember.rawInTime = getCurrent24HrTime()

    staffMember.checkInTime = formatTimeTo12Hr(staffMember.rawInTime)

    staffMember.lateMinutes = calculateLateMinutes(
      staffMember.rawInTime,

      staffMember.shiftStartTime,
    )

    staffMember.workingHours = calculateWorkingHours(
      staffMember.rawInTime,
      staffMember.rawOutTime,
      staffMember.shiftEndTime,
    )
  })

  for (const staffMember of filteredStaffs.value) {
    await autoSaveSingleStaff(staffMember)
  }
}

const toggleSelectAll = async (event) => {
  if (holidayInfo.value) {
    return
  }

  const checkState = event.target.checked

  filteredStaffs.value.forEach((staffMember) => {
    if (checkState) {
      staffMember.isLeave = false

      staffMember.isPresent = true

      staffMember.rawInTime = getCurrent24HrTime()

      staffMember.checkInTime = formatTimeTo12Hr(staffMember.rawInTime)

      staffMember.lateMinutes = calculateLateMinutes(
        staffMember.rawInTime,

        staffMember.shiftStartTime,
      )

      staffMember.workingHours = calculateWorkingHours(
        staffMember.rawInTime,

        staffMember.rawOutTime,
      )
    } else {
      staffMember.isPresent = false

      staffMember.isLeave = false

      staffMember.checkInTime = null

      staffMember.rawInTime = null

      staffMember.rawOutTime = null

      staffMember.workingHours = null

      staffMember.lateMinutes = 0
    }
  })

  for (const staffMember of filteredStaffs.value) {
    await autoSaveSingleStaff(staffMember)
  }
}

// =====================================================

// COMPUTED PROPERTIES

// =====================================================

const availableShifts = computed(() => {
  const allShiftNames = []

  staffList.value.forEach((s) => {
    if (s.shift_name) {
      allShiftNames.push(s.shift_name)
    }
  })

  return [...new Set(allShiftNames)]
})

const filteredStaffs = computed(() => {
  return staffList.value.filter((s) => {
    const matchesShift =
      !selectedShift.value || s.shift_name.toLowerCase() === selectedShift.value.toLowerCase()

    const query = searchQuery.value.toLowerCase().trim()

    const matchesSearch =
      !query ||
      s.name.toLowerCase().includes(query) ||
      String(s.staff_code).toLowerCase().includes(query) ||
      s.skill.toLowerCase().includes(query)

    return matchesShift && matchesSearch
  })
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredStaffs.value.length / perPage.value)),
)

const paginatedStaffs = computed(() => {
  const start = (currentPage.value - 1) * perPage.value

  return filteredStaffs.value.slice(start, start + perPage.value)
})

const startEntry = computed(() =>
  filteredStaffs.value.length === 0 ? 0 : (currentPage.value - 1) * perPage.value + 1,
)

const endEntry = computed(() =>
  Math.min(currentPage.value * perPage.value, filteredStaffs.value.length),
)

function goToPage(page) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

watch(filteredStaffs, () => {
  currentPage.value = 1
})

const isAllSelected = computed(() => {
  return (
    filteredStaffs.value.length > 0 &&
    filteredStaffs.value.every((s) => s.isPresent && !s.isLeave && !s.isHoliday)
  )
})

const getStaffPhoto = () => {
  return 'https://via.placeholder.com/32?text=S'
}

// =====================================================

// ON MOUNTED

// =====================================================

onMounted(() => {
  fetchAttendanceData()
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

/* Responsive Handling for Mobile & Tablet */
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

.staff-photo-placeholder {
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
</style>
