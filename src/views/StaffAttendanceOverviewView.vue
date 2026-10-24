<template>
  <dashPageView />

  <div class="dashboard-layout bg-light min-vh-100 d-flex">
    <aside class="sidebar-wrapper"></aside>

    <div class="main-wrapper flex-grow-1 min-vh-100 d-flex flex-column">
      <RouterView />

      <main class="attendance-summary-section py-3 py-md-4 px-2 px-md-3">
        <div class="container-fluid p-0">
          <div class="row mb-4">
            <div class="col-12 d-flex justify-content-between align-items-center gap-3">
              <div>
                <h2 class="h4 fw-bold text-dark mb-1">Staff Attendance Yearly Summary</h2>
                <p class="text-muted small mb-0">
                  Overview of staff attendance, shift-wise late time, and working hours
                </p>
              </div>

              <div>
                <select
                  v-model="selectedYear"
                  @change="fetchAllData"
                  class="form-select form-select-sm"
                >
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                </select>
              </div>
            </div>
          </div>

          <div class="card border-0 shadow-sm rounded-3">
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                  <thead class="table-light">
                    <tr class="small text-secondary fw-semibold">
                      <th class="ps-4 py-3">STAFF NAME</th>
                      <th class="py-3">SHIFT(S)</th>
                      <th class="text-center py-3 text-success">TOTAL PRESENT</th>
                      <th class="text-center py-3 text-warning">TOTAL LATE</th>
                      <th class="text-center py-3 text-danger">TOTAL LATE TIME</th>
                      <th class="text-center py-3 text-danger">TOTAL ABSENT</th>
                      <th class="text-center py-3 text-secondary">TOTAL LEAVE</th>
                      <th class="text-center py-3 text-info">TOTAL WORKING TIME</th>
                      <th class="text-end pe-4 py-3">ACTION</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr v-if="loading">
                      <td colspan="9" class="text-center py-4 text-muted">
                        <div class="spinner-border spinner-border-sm me-2" role="status"></div>
                        Calculating yearly reports...
                      </td>
                    </tr>

                    <tr v-else v-for="staff in computedStaffSummary" :key="staff.id">
                      <td class="ps-4">
                        <div class="fw-bold text-dark text-uppercase">
                          {{ staff.name }}
                        </div>
                        <small class="text-muted text-uppercase">
                          {{ staff.code }}
                        </small>
                      </td>

                      <td>
                        <div class="d-flex flex-wrap gap-1">
                          <span
                            v-for="shift in staff.shifts"
                            :key="shift"
                            class="badge bg-secondary"
                          >
                            {{ shift }}
                          </span>
                        </div>
                      </td>

                      <td class="text-center fw-bold text-success">
                        {{ staff.total_present }}
                      </td>

                      <td class="text-center fw-bold text-warning">
                        {{ staff.total_late }}
                      </td>

                      <td class="text-center font-monospace">
                        <span
                          class="badge bg-danger bg-opacity-10 text-danger fw-semibold border border-danger border-opacity-25 px-2 py-1"
                        >
                          {{ staff.totalLateTimeFormatted }}
                        </span>
                      </td>

                      <td class="text-center fw-bold text-danger">
                        {{ staff.total_absent }}
                      </td>

                      <td class="text-center fw-bold text-secondary">
                        {{ staff.total_leave }}
                      </td>

                      <td class="text-center font-monospace">
                        <span
                          class="badge bg-info bg-opacity-10 text-info fw-semibold border border-info border-opacity-25 px-2 py-1"
                        >
                          {{ staff.yearlyWorkingTime }}
                        </span>
                      </td>

                      <td class="text-end pe-4">
                        <button
                          class="btn btn-sm btn-outline-primary fw-semibold"
                          @click="viewStaffDetails(staff)"
                        >
                          👁️ View Report
                        </button>
                      </td>
                    </tr>

                    <tr v-if="!loading && computedStaffSummary.length === 0">
                      <td colspan="9" class="text-center py-4 text-muted">
                        No records found for this year.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Monthly Report Modal -->
    <div class="modal fade" id="staffReportModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-xl modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header bg-light">
            <h5 class="modal-title fw-bold">
              {{ selectedStaff?.name }} - Yearly Report ({{ selectedYear }})
            </h5>

            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>

          <div class="modal-body p-0">
            <div class="table-responsive">
              <table class="table table-bordered mb-0 align-middle">
                <thead class="table-dark text-white small">
                  <tr>
                    <th class="ps-3">MONTH</th>
                    <th class="text-center">PRESENT</th>
                    <th class="text-center">LATE</th>
                    <th class="text-center">LATE TIME</th>
                    <th class="text-center">ABSENT</th>
                    <th class="text-center">LEAVE</th>
                    <th class="text-center">TOTAL RECORDS</th>
                    <th class="text-center">MONTHLY WORKING TIME</th>
                  </tr>
                </thead>

                <tbody>
                  <tr v-for="month in selectedStaffMonthlyReports" :key="month.monthNumber">
                    <td class="ps-3 fw-bold text-primary">
                      {{ month.monthName }}
                    </td>

                    <td class="text-center text-success fw-semibold">
                      {{ month.present }}
                    </td>

                    <td class="text-center fw-semibold text-warning">
                      {{ month.late }}
                    </td>

                    <td class="text-center text-danger fw-bold font-monospace">
                      <span
                        class="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-2 py-1"
                      >
                        {{ month.totalLateTimeFormatted }}
                      </span>
                    </td>

                    <td class="text-center text-danger fw-semibold">
                      {{ month.absent }}
                    </td>

                    <td class="text-center text-secondary fw-semibold">
                      {{ month.leave }}
                    </td>

                    <td class="text-center">
                      {{ month.totalRecords }}
                    </td>

                    <td class="text-center font-monospace">
                      <span
                        class="badge bg-info bg-opacity-10 text-info fw-semibold border border-info border-opacity-25 px-2 py-1"
                      >
                        {{ month.monthlyWorkingTime }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="modal-footer bg-light">
            <button type="button" class="btn btn-sm btn-secondary" data-bs-dismiss="modal">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import * as bootstrap from 'bootstrap'
import dashPageView from './dashPageView.vue'
import api from '@/services/api'

const selectedYear = ref('2026')
const staffList = ref([])
const allAttendances = ref([])
const loading = ref(false)

const selectedStaff = ref(null)
const selectedStaffMonthlyReports = ref([])

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const normalizeStatus = (record) =>
  String(record?.status || '')
    .trim()
    .toLowerCase()

const getStaffId = (record) =>
  String(record?.staff_id ?? record?.employee_id ?? record?.staff?.id ?? record?.employee?.id ?? '')

const getRecordDate = (record) => {
  if (!record?.date) return ''
  return String(record.date).slice(0, 10)
}

const isHolidayOrOffDay = (record) => {
  const status = normalizeStatus(record)
  const type = String(record?.day_type ?? record?.type ?? record?.remarks ?? '')
    .trim()
    .toLowerCase()

  return (
    ['holiday', 'off day', 'off_day', 'offday'].includes(status) ||
    ['holiday', 'off day', 'off_day', 'offday'].includes(type)
  )
}

const isPresentStatus = (record) => {
  const status = normalizeStatus(record)
  return status === 'present' || status === 'late'
}

const isLeaveStatus = (record) => {
  return (
    normalizeStatus(record) === 'leave' ||
    record?.leave === true ||
    record?.leave === 1 ||
    record?.leave === '1'
  )
}

const isAbsentStatus = (record) => normalizeStatus(record) === 'absent'

const fetchAllData = async () => {
  loading.value = true

  try {
    const [staffRes, attendanceRes] = await Promise.all([
      api.get('/staff'),
      api.get('/staff-attendances', {
        params: { year: selectedYear.value },
      }),
    ])

    const staffData = staffRes.data
    const attendanceData = attendanceRes.data

    staffList.value = Array.isArray(staffData)
      ? staffData
      : staffData?.data || staffData?.staff || []

    const receivedAttendances = Array.isArray(attendanceData)
      ? attendanceData
      : attendanceData?.data || attendanceData?.attendances || []

    allAttendances.value = receivedAttendances.filter((record) => {
      const date = getRecordDate(record)
      return date && date.slice(0, 4) === String(selectedYear.value)
    })

    console.log('Staff attendance yearly summary:', {
      staffCount: staffList.value.length,
      attendanceCount: allAttendances.value.length,
      sampleStaff: staffList.value[0],
      sampleAttendance: allAttendances.value[0],
    })
  } catch (error) {
    console.error('Error fetching staff attendance data:', error)
    staffList.value = []
    allAttendances.value = []
  } finally {
    loading.value = false
  }
}

/*
 * Accepts time-only values and datetime strings such as:
 * 09:15:00, 09:15, 2026-03-01 09:15:00, 2026-03-01T09:15:00
 */
const extractTimeOnly = (value) => {
  if (!value) return null

  const text = String(value).trim()
  const match = text.match(/(?:T|\s)?(\d{1,2}):(\d{2})(?::\d{2})?/)

  if (!match) return null

  const hours = Number(match[1])
  const minutes = Number(match[2])

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null
  }

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

/*
 * IMPORTANT:
 * The Daily Attendance page uses staff.shift (singular).
 * This helper supports both staff.shift and staff.shifts (array),
 * plus shift relations carried by an attendance record.
 */
const getStaffShifts = (staff) => {
  const shifts = []

  if (Array.isArray(staff?.shifts)) {
    shifts.push(...staff.shifts)
  }

  if (staff?.shift && typeof staff.shift === 'object') {
    shifts.push(staff.shift)
  }

  if (staff?.pivot?.shift && typeof staff.pivot.shift === 'object') {
    shifts.push(staff.pivot.shift)
  }

  const seen = new Set()

  return shifts.filter((shift) => {
    if (!shift || typeof shift !== 'object') return false

    const key =
      shift.id != null
        ? `id:${shift.id}`
        : `name:${String(shift.name || shift.shift_name || shift.title || '').toLowerCase()}`

    if (seen.has(key)) return false

    seen.add(key)
    return true
  })
}

const getAttendanceShiftName = (attendance) =>
  String(
    attendance?.shift_name ||
      attendance?.shift?.name ||
      attendance?.shift?.shift_name ||
      attendance?.shift?.title ||
      '',
  )
    .trim()
    .toLowerCase()

const getAttendanceShiftId = (attendance) =>
  attendance?.shift_id ?? attendance?.shift?.id ?? attendance?.staff_shift_id ?? null

const getMatchedShift = (staff, attendance) => {
  const staffShifts = getStaffShifts(staff)
  const attendanceShiftName = getAttendanceShiftName(attendance)
  const attendanceShiftId = getAttendanceShiftId(attendance)

  // First match by shift ID when the attendance API supplies one.
  if (attendanceShiftId != null) {
    const matchedById = staffShifts.find(
      (shift) => shift.id != null && String(shift.id) === String(attendanceShiftId),
    )

    if (matchedById) return matchedById
  }

  // Next match by the saved shift name.
  if (attendanceShiftName) {
    const matchedByName = staffShifts.find((shift) => {
      const name = String(shift.name || shift.shift_name || shift.title || '')
        .trim()
        .toLowerCase()

      return name === attendanceShiftName
    })

    if (matchedByName) return matchedByName
  }

  // If only one shift is assigned, it is the best available match.
  if (staffShifts.length === 1) {
    return staffShifts[0]
  }

  return null
}

/*
 * Use the shift's actual end_time, not a hard-coded time.
 * Attendance relation is also checked in case it contains the assigned shift.
 */
const getShiftEndTime = (staff, attendance) => {
  const matchedShift = getMatchedShift(staff, attendance)

  const candidates = [
    attendance?.shift?.end_time,
    attendance?.shift_end_time,
    attendance?.end_time,
    matchedShift?.end_time,
    matchedShift?.pivot?.end_time,
    staff?.shift?.end_time,
    staff?.shift_end_time,
  ]

  for (const candidate of candidates) {
    const time = extractTimeOnly(candidate)
    if (time) return time
  }

  return null
}

const getShiftStartTime = (staff, attendance) => {
  const matchedShift = getMatchedShift(staff, attendance)

  const candidates = [
    attendance?.shift?.start_time,
    attendance?.shift_start_time,
    matchedShift?.start_time,
    matchedShift?.pivot?.start_time,
    staff?.shift?.start_time,
  ]

  for (const candidate of candidates) {
    const time = extractTimeOnly(candidate)
    if (time) return time
  }

  return '09:00'
}

/*
 * Actual out_time takes priority.
 * If out_time is missing, use the matched shift end_time.
 * Leave, absent, holiday and off-day records are excluded by the callers.
 */
const getMinutesBetweenTimes = (inTime, outTime, shiftEndTime = null) => {
  const cleanIn = extractTimeOnly(inTime)
  const cleanOut = extractTimeOnly(outTime) || extractTimeOnly(shiftEndTime)

  if (!cleanIn || !cleanOut) return 0

  const [inH, inM] = cleanIn.split(':').map(Number)
  const [outH, outM] = cleanOut.split(':').map(Number)

  const inMins = inH * 60 + inM
  const outMins = outH * 60 + outM

  // Same-day shift calculation. Invalid or overnight ranges are not counted.
  if (outMins <= inMins) return 0

  return outMins - inMins
}

const formatMinutes = (totalMins) => {
  if (!totalMins || totalMins <= 0) return '0h 0m'

  const hours = Math.floor(totalMins / 60)
  const minutes = totalMins % 60

  return `${hours}h ${minutes}m`
}

const calculateLateMinutes = (checkInTime, shiftStartTime) => {
  const cleanIn = extractTimeOnly(checkInTime)
  const cleanShift = extractTimeOnly(shiftStartTime)

  if (!cleanIn || !cleanShift) return 0

  const [shiftHours, shiftMinutes] = cleanShift.split(':').map(Number)
  const [checkInHours, checkInMinutes] = cleanIn.split(':').map(Number)

  const scheduledMinutes = shiftHours * 60 + shiftMinutes
  const checkInMinutesTotal = checkInHours * 60 + checkInMinutes

  return checkInMinutesTotal > scheduledMinutes ? checkInMinutesTotal - scheduledMinutes : 0
}

/*
 * Shared working-time calculation used by yearly and monthly reports.
 * Only present/late records with a check-in are counted.
 */
const calculateRecordsWorkingMinutes = (staff, records) => {
  return records.reduce((total, record) => {
    if (!isPresentStatus(record) || !record.in_time) return total
    if (isLeaveStatus(record) || isAbsentStatus(record) || isHolidayOrOffDay(record)) {
      return total
    }

    const shiftEnd = getShiftEndTime(staff, record)

    return total + getMinutesBetweenTimes(record.in_time, record.out_time, shiftEnd)
  }, 0)
}

const calculateRecordsLateMinutes = (staff, records) => {
  return records.reduce((total, record) => {
    if (!isPresentStatus(record) || isLeaveStatus(record) || isHolidayOrOffDay(record)) {
      return total
    }

    const shiftStart = getShiftStartTime(staff, record)
    return total + calculateLateMinutes(record.in_time, shiftStart)
  }, 0)
}

/*
 * Count a date only once for present/late/absent/leave totals.
 * Working time still sums the individual present attendance records,
 * which allows staff with multiple shifts to get their total hours.
 */
const getDateStatus = (records) => {
  if (records.some(isHolidayOrOffDay)) return 'off'
  if (records.some(isLeaveStatus)) return 'leave'
  if (records.some(isPresentStatus)) return 'present'
  if (records.some(isAbsentStatus)) return 'absent'
  return 'none'
}

const attendanceDays = computed(() => {
  const dates = new Set()

  allAttendances.value.forEach((record) => {
    const date = getRecordDate(record)
    if (!date || isHolidayOrOffDay(record)) return
    dates.add(date)
  })

  return dates
})

const computedStaffSummary = computed(() => {
  return staffList.value.map((stf) => {
    const staffId = String(stf.id)

    const staffRecords = allAttendances.value.filter(
      (record) =>
        getStaffId(record) === staffId &&
        getRecordDate(record).slice(0, 4) === String(selectedYear.value),
    )

    const recordsByDate = new Map()

    staffRecords.forEach((record) => {
      const date = getRecordDate(record)
      if (!date) return

      if (!recordsByDate.has(date)) recordsByDate.set(date, [])
      recordsByDate.get(date).push(record)
    })

    let presentCount = 0
    let lateCount = 0
    let absentCount = 0
    let leaveCount = 0
    let totalLateMins = 0

    const shiftsSet = new Set()

    staffRecords.forEach((record) => {
      const name = record.shift_name || record.shift?.name || record.shift?.shift_name || null

      if (name) shiftsSet.add(name)
    })

    getStaffShifts(stf).forEach((shift) => {
      const name = shift.name || shift.shift_name || shift.title
      if (name) shiftsSet.add(name)
    })

    if (shiftsSet.size === 0) shiftsSet.add('General Shift')

    recordsByDate.forEach((records) => {
      const dayStatus = getDateStatus(records)

      if (dayStatus === 'off' || dayStatus === 'none') return

      if (dayStatus === 'leave') {
        leaveCount++
        return
      }

      if (dayStatus === 'absent') {
        absentCount++
        return
      }

      if (dayStatus === 'present') {
        presentCount++

        // A date is counted as late once, but late minutes are taken
        // from each present shift record for that date.
        const presentRecords = records.filter(isPresentStatus)
        const wasLate = presentRecords.some((record) => {
          return (
            normalizeStatus(record) === 'late' ||
            calculateLateMinutes(record.in_time, getShiftStartTime(stf, record)) > 0
          )
        })

        if (wasLate) lateCount++

        totalLateMins += calculateRecordsLateMinutes(stf, presentRecords)
      }
    })

    // Dates where this staff member has no attendance record count as absent.
    attendanceDays.value.forEach((date) => {
      if (!recordsByDate.has(date)) absentCount++
    })

    const totalMins = calculateRecordsWorkingMinutes(stf, staffRecords)

    return {
      id: stf.id,
      name: stf.full_name || stf.name || 'Unknown',
      code: stf.staff_code || stf.employee_code || stf.user_name || stf.id,
      shifts: [...shiftsSet].filter(Boolean),
      total_present: presentCount,
      total_late: lateCount,
      totalLateTimeFormatted: formatMinutes(totalLateMins),
      total_absent: absentCount,
      total_leave: leaveCount,
      yearlyWorkingTime: formatMinutes(totalMins),
      records: staffRecords,
      rawStaff: stf,
    }
  })
})

const viewStaffDetails = (staff) => {
  selectedStaff.value = staff

  const rawStaff = staff.rawStaff || staff

  selectedStaffMonthlyReports.value = monthNames.map((name, index) => {
    const monthNum = String(index + 1).padStart(2, '0')

    const monthRecords = staff.records.filter((record) => {
      const date = getRecordDate(record)
      return date && date.slice(5, 7) === monthNum
    })

    const recordsByDate = new Map()

    monthRecords.forEach((record) => {
      const date = getRecordDate(record)
      if (!date) return

      if (!recordsByDate.has(date)) recordsByDate.set(date, [])
      recordsByDate.get(date).push(record)
    })

    let mPresent = 0
    let mLate = 0
    let mAbsent = 0
    let mLeave = 0

    recordsByDate.forEach((records) => {
      const dayStatus = getDateStatus(records)

      if (dayStatus === 'off' || dayStatus === 'none') return

      if (dayStatus === 'leave') {
        mLeave++
        return
      }

      if (dayStatus === 'absent') {
        mAbsent++
        return
      }

      if (dayStatus === 'present') {
        mPresent++

        const presentRecords = records.filter(isPresentStatus)

        const wasLate = presentRecords.some((record) => {
          return (
            normalizeStatus(record) === 'late' ||
            calculateLateMinutes(record.in_time, getShiftStartTime(rawStaff, record)) > 0
          )
        })

        if (wasLate) mLate++
      }
    })

    const monthDates = [...attendanceDays.value].filter((date) => date.slice(5, 7) === monthNum)

    monthDates.forEach((date) => {
      if (!recordsByDate.has(date)) mAbsent++
    })

    const monthlyMins = calculateRecordsWorkingMinutes(rawStaff, monthRecords)

    const monthlyLateMins = calculateRecordsLateMinutes(
      rawStaff,
      monthRecords.filter(isPresentStatus),
    )

    return {
      monthNumber: monthNum,
      monthName: name,
      present: mPresent,
      late: mLate,
      totalLateTimeFormatted: formatMinutes(monthlyLateMins),
      absent: mAbsent,
      leave: mLeave,
      totalRecords: monthRecords.length,
      monthlyWorkingTime: formatMinutes(monthlyMins),
    }
  })

  const modalElement = document.getElementById('staffReportModal')
  if (!modalElement) return

  bootstrap.Modal.getOrCreateInstance(modalElement).show()
}

onMounted(fetchAllData)
</script>

<style scoped>
.main-wrapper {
  margin-left: 260px;
  width: calc(100% - 260px);
  min-width: 0;
}

@media (max-width: 768px) {
  .main-wrapper {
    margin-left: 0;
    width: 100%;
  }
}
</style>
