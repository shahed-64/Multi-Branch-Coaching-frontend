<template>
  <dashPageView />
  <div class="dashboard-layout bg-light min-vh-100 d-flex">
    <aside class="sidebar-wrapper"></aside>

    <div class="main-wrapper flex-grow-1 min-vh-100 d-flex flex-column">
      <RouterView />

      <main class="attendance-summary-section py-3 py-md-4 px-2 px-md-3">
        <div class="container-fluid p-0">
          <div class="row mb-4">
            <div class="col-12 d-flex justify-content-between align-items-center">
              <div>
                <h2 class="h4 fw-bold text-dark mb-1">Teacher Attendance Yearly Summary</h2>
                <p class="text-muted small mb-0">
                  Overview of teachers' attendance, shift-wise late time, and working hours
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
                      <th class="ps-4 py-3">TEACHER NAME</th>
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

                    <tr v-else v-for="teacher in computedTeachersSummary" :key="teacher.id">
                      <td class="ps-4">
                        <div class="fw-bold text-dark text-uppercase">
                          {{ teacher.name }}
                        </div>
                        <small class="text-muted text-uppercase">
                          {{ teacher.code }}
                        </small>
                      </td>

                      <td>
                        <div class="d-flex flex-wrap gap-1">
                          <span v-for="s in teacher.shifts" :key="s" class="badge bg-secondary">
                            {{ s }}
                          </span>
                        </div>
                      </td>

                      <td class="text-center fw-bold text-success">
                        {{ teacher.total_present }}
                      </td>

                      <td class="text-center fw-bold text-warning">
                        {{ teacher.total_late }}
                      </td>

                      <td class="text-center font-monospace">
                        <span
                          v-if="teacher.total_late_minutes > 0"
                          class="badge bg-danger bg-opacity-10 text-danger fw-semibold border border-danger border-opacity-25 px-2 py-1"
                        >
                          {{ formatMinutes(teacher.total_late_minutes) }}
                        </span>
                        <span v-else class="text-muted small">-</span>
                      </td>

                      <td class="text-center fw-bold text-danger">
                        {{ teacher.total_absent }}
                      </td>

                      <td class="text-center fw-bold text-secondary">
                        {{ teacher.total_leave }}
                      </td>

                      <td class="text-center font-monospace">
                        <span
                          class="badge bg-info bg-opacity-10 text-info fw-semibold border border-info border-opacity-25 px-2 py-1"
                        >
                          {{ teacher.yearlyWorkingTime }}
                        </span>
                      </td>

                      <td class="text-end pe-4">
                        <button
                          class="btn btn-sm btn-outline-primary fw-semibold"
                          @click="viewTeacherDetails(teacher)"
                        >
                          👁️ View Report
                        </button>
                      </td>
                    </tr>

                    <tr v-if="!loading && computedTeachersSummary.length === 0">
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

    <div class="modal fade" id="teacherReportModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-xl modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header bg-light">
            <h5 class="modal-title fw-bold">
              {{ selectedTeacher?.name }} - Yearly Report ({{ selectedYear }})
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
                  <tr v-for="month in selectedTeacherMonthlyReports" :key="month.monthNumber">
                    <td class="ps-3 fw-bold text-primary">
                      {{ month.monthName }}
                    </td>

                    <td class="text-center text-success fw-semibold">
                      {{ month.present }}
                    </td>

                    <td class="text-center text-warning fw-semibold">
                      {{ month.late }}
                    </td>

                    <td class="text-center font-monospace text-danger fw-semibold">
                      {{ formatMinutes(month.lateMinutes) }}
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
const teachersList = ref([])
const allAttendances = ref([])
const loading = ref(false)

const selectedTeacher = ref(null)
const selectedTeacherMonthlyReports = ref([])

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

const fetchAllData = async () => {
  loading.value = true

  try {
    const [teachersRes, attendanceRes] = await Promise.all([
      api.get('/teachers'),
      api.get('/teacher-attendances', {
        params: { year: selectedYear.value },
      }),
    ])

    teachersList.value = Array.isArray(teachersRes.data)
      ? teachersRes.data
      : attendanceDataArray(teachersRes.data)

    allAttendances.value = attendanceDataArray(attendanceRes.data).filter((attendance) => {
      if (!attendance.date) return false
      return attendance.date.substring(0, 4) === selectedYear.value
    })
  } catch (error) {
    console.error('Error fetching data:', error)
  } finally {
    loading.value = false
  }
}

const attendanceDataArray = (response) => {
  if (Array.isArray(response)) return response
  if (Array.isArray(response?.data)) return response.data
  return []
}

const normalizeDate = (date) => {
  if (!date) return ''
  return String(date).substring(0, 10)
}

const isHolidayOrOffDay = (attendance) => {
  const status = String(attendance?.status || '')
    .trim()
    .toLowerCase()

  return ['holiday', 'off day', 'off_day', 'offday'].includes(status)
}

/**
 * Leave, Absent, Holiday and Off Day records contribute
 * no working time.
 */
const shouldCountWorkingTime = (attendance) => {
  const status = String(attendance?.status || '')
    .trim()
    .toLowerCase()

  if (['leave', 'absent', 'holiday', 'off day', 'off_day', 'offday'].includes(status)) {
    return false
  }

  return Boolean(attendance?.in_time)
}

const attendanceDays = computed(() => {
  const days = new Set()

  allAttendances.value.forEach((attendance) => {
    const date = normalizeDate(attendance.date)

    if (!date || isHolidayOrOffDay(attendance)) return
    if (date.substring(0, 4) !== selectedYear.value) return

    days.add(date)
  })

  return days
})

const extractTimeOnly = (dateTimeStr) => {
  if (!dateTimeStr) return null

  let value = String(dateTimeStr)

  if (value.includes('T')) {
    value = value.split('T')[1]
  } else if (value.includes(' ')) {
    value = value.split(' ')[1]
  }

  return value.substring(0, 5)
}

/**
 * Find the matching shift by shift name.
 */
const getMatchedShift = (teacher, attendanceShiftName) => {
  const shifts = Array.isArray(teacher?.shifts) ? teacher.shifts : []
  const requestedName = String(attendanceShiftName || '')
    .trim()
    .toLowerCase()

  const matchedShift = shifts.find((shift) => {
    const shiftName = typeof shift === 'string' ? shift : shift?.name

    return (
      String(shiftName || '')
        .trim()
        .toLowerCase() === requestedName
    )
  })

  if (matchedShift && typeof matchedShift === 'object') {
    return matchedShift
  }

  // If a matching shift was not found, don't silently use a
  // different shift's end time.
  return null
}

const getShiftStartTime = (teacher, attendanceShiftName) => {
  const matchedShift = getMatchedShift(teacher, attendanceShiftName)

  if (matchedShift?.start_time) {
    return matchedShift.start_time
  }

  return '09:00:00'
}

const getShiftEndTime = (teacher, attendance) => {
  const shiftName = attendance?.shift_name || ''
  const matchedShift = getMatchedShift(teacher, shiftName)

  return matchedShift?.end_time || attendance?.shift?.end_time || attendance?.shift_end_time || null
}

const calculateLateMinutes = (checkInTime24, shiftStartTime) => {
  const cleanIn = extractTimeOnly(checkInTime24)
  const cleanShift = extractTimeOnly(shiftStartTime)

  if (!cleanIn || !cleanShift) return 0

  const [shiftHours, shiftMinutes] = cleanShift.split(':').map(Number)
  const [checkInHours, checkInMinutes] = cleanIn.split(':').map(Number)

  const scheduledTotalMinutes = shiftHours * 60 + shiftMinutes
  const checkInTotalMinutes = checkInHours * 60 + checkInMinutes

  return checkInTotalMinutes > scheduledTotalMinutes
    ? checkInTotalMinutes - scheduledTotalMinutes
    : 0
}

/**
 * Calculate working time from check-in to actual checkout.
 * If checkout is missing, use the matching shift's end time.
 */
const getMinutesBetweenTimes = (inTime, outTime, shiftEndTime = null) => {
  const cleanIn = extractTimeOnly(inTime)
  const cleanOut = extractTimeOnly(outTime || shiftEndTime)

  if (!cleanIn || !cleanOut) return 0

  const [inH, inM] = cleanIn.split(':').map(Number)
  const [outH, outM] = cleanOut.split(':').map(Number)

  const inMins = inH * 60 + inM
  const outMins = outH * 60 + outM

  return outMins > inMins ? outMins - inMins : 0
}

const formatMinutes = (totalMins) => {
  if (!totalMins || totalMins <= 0) return '0h 0m'

  const hours = Math.floor(totalMins / 60)
  const minutes = totalMins % 60

  return `${hours}h ${minutes}m`
}

const computedTeachersSummary = computed(() => {
  const activeAttendanceDays = attendanceDays.value

  return teachersList.value.map((t) => {
    const teacherId = String(t.id)

    const teacherRecords = allAttendances.value.filter((att) => {
      const attTeacherId = String(att.teacher_id || att.teacher?.id)
      const attDate = normalizeDate(att.date)

      return attTeacherId === teacherId && attDate.substring(0, 4) === selectedYear.value
    })

    let presentCount = 0
    let lateCount = 0
    let totalLateMins = 0
    let explicitAbsentCount = 0
    let leaveCount = 0
    let totalMins = 0

    const shiftsSet = new Set()
    const teacherAttendanceDates = new Set()

    teacherRecords.forEach((rec) => {
      const date = normalizeDate(rec.date)
      const status = String(rec.status || '')
        .trim()
        .toLowerCase()

      if (date && !isHolidayOrOffDay(rec)) {
        teacherAttendanceDates.add(date)
      }

      if (status === 'present') {
        presentCount++
      } else if (status === 'late') {
        presentCount++
        lateCount++
      } else if (status === 'absent') {
        explicitAbsentCount++
      } else if (status === 'leave') {
        leaveCount++
      }

      const recShiftName = rec.shift_name || 'General Shift'
      shiftsSet.add(recShiftName)

      const shiftStart = getShiftStartTime(t, recShiftName)
      const lateMins = calculateLateMinutes(rec.in_time, shiftStart)

      if (lateMins > 0) {
        totalLateMins += lateMins
      }

      if (shouldCountWorkingTime(rec)) {
        const shiftEnd = getShiftEndTime(t, rec)

        totalMins += getMinutesBetweenTimes(rec.in_time, rec.out_time, shiftEnd)
      }
    })

    let missingAbsentCount = 0

    activeAttendanceDays.forEach((date) => {
      if (!teacherAttendanceDates.has(date)) {
        missingAbsentCount++
      }
    })

    if (t.shifts && t.shifts.length > 0) {
      t.shifts.forEach((s) => shiftsSet.add(s.name || s))
    }

    if (shiftsSet.size === 0) {
      shiftsSet.add('General Shift')
    }

    return {
      id: t.id,
      name: t.full_name || t.name || 'Unknown',
      code: t.teacher_code || t.id,
      shifts: [...shiftsSet],
      total_present: presentCount,
      total_late: lateCount,
      total_late_minutes: totalLateMins,
      total_absent: explicitAbsentCount + missingAbsentCount,
      total_leave: leaveCount,
      yearlyWorkingTime: formatMinutes(totalMins),
      records: teacherRecords,
      rawTeacher: t,
    }
  })
})

const viewTeacherDetails = (teacherSummary) => {
  selectedTeacher.value = teacherSummary

  const activeAttendanceDays = attendanceDays.value

  selectedTeacherMonthlyReports.value = monthNames.map((name, index) => {
    const monthNum = String(index + 1).padStart(2, '0')

    const monthRecords = teacherSummary.records.filter((rec) => {
      if (!rec.date) return false

      const normalizedDate = normalizeDate(rec.date)
      const [, month] = normalizedDate.split('-')

      return month === monthNum
    })

    let mPresent = 0
    let mLate = 0
    let mLateMins = 0
    let explicitAbsentCount = 0
    let mLeave = 0
    let mMins = 0

    const teacherAttendanceDates = new Set()

    monthRecords.forEach((rec) => {
      const date = normalizeDate(rec.date)
      const status = String(rec.status || '')
        .trim()
        .toLowerCase()

      if (date && !isHolidayOrOffDay(rec)) {
        teacherAttendanceDates.add(date)
      }

      if (status === 'present') {
        mPresent++
      } else if (status === 'late') {
        mPresent++
        mLate++
      } else if (status === 'absent') {
        explicitAbsentCount++
      } else if (status === 'leave') {
        mLeave++
      }

      const recShiftName = rec.shift_name || 'General Shift'
      const shiftStart = getShiftStartTime(teacherSummary.rawTeacher, recShiftName)

      const lateMins = calculateLateMinutes(rec.in_time, shiftStart)

      if (lateMins > 0) {
        mLateMins += lateMins
      }

      if (shouldCountWorkingTime(rec)) {
        const shiftEnd = getShiftEndTime(teacherSummary.rawTeacher, rec)

        mMins += getMinutesBetweenTimes(rec.in_time, rec.out_time, shiftEnd)
      }
    })

    const monthAttendanceDays = [...activeAttendanceDays].filter(
      (date) => date.split('-')[1] === monthNum,
    )

    let missingAbsentCount = 0

    monthAttendanceDays.forEach((date) => {
      if (!teacherAttendanceDates.has(date)) {
        missingAbsentCount++
      }
    })

    return {
      monthNumber: monthNum,
      monthName: name,
      present: mPresent,
      late: mLate,
      lateMinutes: mLateMins,
      absent: explicitAbsentCount + missingAbsentCount,
      leave: mLeave,
      totalRecords: monthRecords.length + missingAbsentCount,
      monthlyWorkingTime: formatMinutes(mMins),
    }
  })

  const modalElement = document.getElementById('teacherReportModal')
  const modal = bootstrap.Modal.getOrCreateInstance(modalElement)

  modal.show()
}

onMounted(() => {
  fetchAllData()
})
</script>

<style scoped>
.main-wrapper {
  margin-left: 260px;
  width: calc(100% - 260px);
}

@media (max-width: 768px) {
  .main-wrapper {
    margin-left: 0;
    width: 100%;
  }
}
</style>
