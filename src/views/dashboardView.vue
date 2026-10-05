<template>
  <RouterView />

  <!-- Existing Sidebar -->
  <dashPageView />

  <!-- ================= MAIN DASHBOARD ================= -->
  <div class="dashboard-layout">
    <!-- ================= TOP NAVBAR ================= -->
    <div class="dashboard-topbar">
      <div class="welcome-section">
        <div class="welcome-text">Welcome, {{ currentUser.name || 'Admin' }}</div>

        <div class="welcome-subtitle">Here's what's happening in your institute today.</div>
      </div>

      <div class="topbar-profile">
        <div class="profile-info">
          <div class="profile-name">
            {{ currentUser.name || 'Admin' }}
          </div>

          <div class="profile-role">
            {{ currentUser.role || 'Admin' }}
          </div>
        </div>

        <div class="profile-image-wrapper">
          <img
            v-if="currentUser.image"
            :src="getStaffImage(currentUser.image)"
            alt="Profile"
            class="profile-image"
          />

          <div v-else class="profile-placeholder">
            {{ getInitials(currentUser.name) }}
          </div>
        </div>

        <i class="fa-solid fa-chevron-down profile-arrow"></i>
      </div>
    </div>

    <!-- ================= TOP STAT CARDS ================= -->
    <div class="stats-grid">
      <!-- Staff -->
      <div class="stat-card staff-card">
        <div class="stat-card-left">
          <div class="stat-icon">
            <i class="fa-solid fa-users"></i>
          </div>

          <div>
            <div class="stat-label">Total Staff</div>

            <div class="stat-value">
              {{ totalStaff }}
            </div>

            <div class="stat-description">Administrative staff</div>
          </div>
        </div>

        <div class="stat-card-decoration">
          <i class="fa-solid fa-users"></i>
        </div>
      </div>

      <!-- Students -->
      <div class="stat-card student-card">
        <div class="stat-card-left">
          <div class="stat-icon">
            <i class="fa-solid fa-user-graduate"></i>
          </div>

          <div>
            <div class="stat-label">Total Students</div>

            <div class="stat-value">
              {{ totalStudents }}
            </div>

            <div class="stat-description">Currently enrolled</div>
          </div>
        </div>

        <div class="stat-card-decoration">
          <i class="fa-solid fa-user-graduate"></i>
        </div>
      </div>

      <!-- Teachers -->
      <div class="stat-card teacher-card">
        <div class="stat-card-left">
          <div class="stat-icon">
            <i class="fa-solid fa-chalkboard-user"></i>
          </div>

          <div>
            <div class="stat-label">Total Teachers</div>

            <div class="stat-value">
              {{ totalTeachers }}
            </div>

            <div class="stat-description">Active teaching staff</div>
          </div>
        </div>

        <div class="stat-card-decoration">
          <i class="fa-solid fa-chalkboard-user"></i>
        </div>
      </div>

      <!-- Shifts -->
      <div class="stat-card shift-card">
        <div class="stat-card-left">
          <div class="stat-icon">
            <i class="fa-solid fa-clock"></i>
          </div>

          <div>
            <div class="stat-label">Total Shifts</div>

            <div class="stat-value">
              {{ totalShifts }}
            </div>

            <div class="stat-description">Available shifts</div>
          </div>
        </div>

        <div class="stat-card-decoration">
          <i class="fa-solid fa-clock"></i>
        </div>
      </div>
    </div>

    <!-- ================= MAIN CONTENT GRID ================= -->
    <div class="main-dashboard-grid">
      <!-- ================= ATTENDANCE TREND CHART ================= -->
      <div class="dashboard-card student-overview-card">
        <div class="card-header">
          <div>
            <div class="section-title-row">
              <div class="section-title-icon blue-soft">
                <i class="fa-solid fa-chart-line"></i>
              </div>

              <div>
                <h5>Attendance Trend Overview</h5>
                <p>Tracking Present, Absent, and Leave records cleanly</p>
              </div>
            </div>
          </div>

          <div class="overview-filter">
            <input type="date" v-model="selectedDate" class="date-picker-input" />

            <select v-model="selectedGrade">
              <option>All Grades</option>
              <option>Class 6</option>
              <option>Class 7</option>
              <option>Class 8</option>
              <option>Class 9</option>
              <option>Class 10</option>
            </select>
          </div>
        </div>

        <!-- ================= CLEAN ATTENDANCE SUMMARY ================= -->
        <div class="attendance-overview-summary">
          <!-- Overall -->
          <div class="attendance-summary-main">
            <span class="summary-label"> Attendance Status </span>

            <div class="attendance-summary-value text-present">
              {{ attendanceTrend.present_percentage }}%
            </div>

            <div class="summary-status">
              <span class="status-dot success"></span>
              Present attendance rate
            </div>
          </div>

          <!-- Present -->
          <div class="attendance-status-box present-status-box">
            <div class="status-box-icon">
              <i class="fa-solid fa-user-check"></i>
            </div>

            <div class="status-box-content">
              <small>Present</small>

              <strong> {{ attendanceTrend.present_percentage }}% </strong>

              <span> {{ attendanceTrend.present }} students </span>
            </div>
          </div>

          <!-- Absent -->
          <div class="attendance-status-box absent-status-box">
            <div class="status-box-icon">
              <i class="fa-solid fa-user-xmark"></i>
            </div>

            <div class="status-box-content">
              <small>Absent</small>

              <strong> {{ attendanceTrend.absent_percentage }}% </strong>

              <span> {{ attendanceTrend.absent }} students </span>
            </div>
          </div>

          <!-- Leave -->
          <div class="attendance-status-box leave-status-box">
            <div class="status-box-icon">
              <i class="fa-solid fa-person-walking-arrow-right"></i>
            </div>

            <div class="status-box-content">
              <small>Leave</small>

              <strong> {{ attendanceTrend.leave_percentage }}% </strong>

              <span> {{ attendanceTrend.leave }} students </span>
            </div>
          </div>
        </div>

        <!-- ================= MULTI-LINE TREND CHART ================= -->
        <div class="attendance-chart">
          <div class="chart-area">
            <!-- Grid Lines -->
            <div class="chart-grid-line" style="top: 0%"></div>
            <div class="chart-grid-line" style="top: 25%"></div>
            <div class="chart-grid-line" style="top: 50%"></div>
            <div class="chart-grid-line" style="top: 75%"></div>
            <div class="chart-grid-line" style="top: 100%"></div>

            <!-- SVG Multi-Line Chart -->
            <svg viewBox="0 0 880 250" class="attendance-trend-svg" preserveAspectRatio="none">
              <!-- Y Axis Grid -->
              <line x1="50" y1="15" x2="830" y2="15" class="chart-grid-line-svg" />

              <line x1="50" y1="64" x2="830" y2="64" class="chart-grid-line-svg" />

              <line x1="50" y1="113" x2="830" y2="113" class="chart-grid-line-svg" />

              <line x1="50" y1="161" x2="830" y2="161" class="chart-grid-line-svg" />

              <line x1="50" y1="210" x2="830" y2="210" class="chart-grid-line-svg" />

              <!-- Y Axis Labels -->
              <text x="42" y="19" text-anchor="end" class="chart-axis-label">100%</text>

              <text x="42" y="68" text-anchor="end" class="chart-axis-label">75%</text>

              <text x="42" y="117" text-anchor="end" class="chart-axis-label">50%</text>

              <text x="42" y="165" text-anchor="end" class="chart-axis-label">25%</text>

              <text x="42" y="214" text-anchor="end" class="chart-axis-label">0%</text>

              <!-- ================= PRESENT LINE ================= -->
              <path :d="presentChartPath" class="trend-line-present-clean" fill="none" />

              <!-- ================= ABSENT LINE ================= -->
              <path :d="absentChartPath" class="trend-line-absent-clean" fill="none" />

              <!-- ================= LEAVE LINE ================= -->
              <path :d="leaveChartPath" class="trend-line-leave-clean" fill="none" />

              <!-- ================= PRESENT POINTS ================= -->
              <g class="present-points-clean">
                <!-- Circle marker -->
                <circle
                  v-for="(point, index) in chartPoints.present"
                  :key="`present-${index}`"
                  :cx="point.x"
                  :cy="point.y"
                  r="4.5"
                />

                <!-- Label -->
                <text
                  v-for="(point, index) in chartPoints.present"
                  :key="`present-label-${index}`"
                  :x="point.x"
                  :y="point.labelY"
                  text-anchor="middle"
                  class="present-point-label"
                >
                  {{ point.value }}%
                </text>
              </g>

              <!-- ================= ABSENT POINTS ================= -->
              <g class="absent-points-clean">
                <!-- Square marker -->
                <rect
                  v-for="(point, index) in chartPoints.absent"
                  :key="`absent-${index}`"
                  :x="point.x - 4"
                  :y="point.y - 4"
                  width="8"
                  height="8"
                  rx="1"
                />

                <!-- Label -->
                <text
                  v-for="(point, index) in chartPoints.absent"
                  :key="`absent-label-${index}`"
                  :x="point.x"
                  :y="point.labelY"
                  text-anchor="middle"
                  class="absent-point-label"
                >
                  {{ point.value }}%
                </text>
              </g>

              <!-- ================= LEAVE POINTS ================= -->
              <g class="leave-points-clean">
                <!-- Diamond marker -->
                <polygon
                  v-for="(point, index) in chartPoints.leave"
                  :key="`leave-${index}`"
                  :points="getDiamondPoints(point)"
                />

                <!-- Label -->
                <text
                  v-for="(point, index) in chartPoints.leave"
                  :key="`leave-label-${index}`"
                  :x="point.x"
                  :y="point.labelY"
                  text-anchor="middle"
                  class="leave-point-label"
                >
                  {{ point.value }}%
                </text>
              </g>

              <!-- Date Labels -->
              <g class="chart-date-labels">
                <text
                  v-for="(item, index) in chartLabels"
                  :key="`date-${index}`"
                  :x="chartPoints.present[index] ? chartPoints.present[index].x : 0"
                  y="238"
                  text-anchor="middle"
                  class="chart-axis-label"
                >
                  {{ item.day }} {{ item.day_number }}
                </text>
              </g>
            </svg>

            <!-- Chart Legend -->
            <div class="attendance-chart-legend">
              <span class="chart-legend-item present-legend">
                <span class="chart-legend-line"></span>
                Present
              </span>

              <span class="chart-legend-item absent-legend">
                <span class="chart-legend-line"></span>
                Absent
              </span>

              <span class="chart-legend-item leave-legend">
                <span class="chart-legend-line"></span>
                Leave
              </span>
            </div>
          </div>
        </div>

        <!-- ================= FOOTER ================= -->
        <div class="chart-footer-legend-row">
          <div class="legend-items-group">
            <span class="legend-badge-item present-footer">
              <i class="fa-solid fa-circle"></i>
              Present
            </span>

            <span class="legend-badge-item absent-footer">
              <i class="fa-solid fa-square"></i>
              Absent
            </span>

            <span class="legend-badge-item leave-footer">
              <i class="fa-solid fa-diamond"></i>
              Leave
            </span>
          </div>

          <div class="academic-label-text">Status Metrics</div>
        </div>
      </div>

      <!-- ================= UPCOMING HOLIDAYS ================= -->
      <div class="dashboard-card holidays-card">
        <div class="card-header">
          <div class="section-title-row">
            <div class="section-title-icon orange-soft">
              <i class="fa-solid fa-calendar-days"></i>
            </div>

            <div>
              <h5>Upcoming Holidays</h5>
              <p>Upcoming holidays</p>
            </div>
          </div>

          <div class="header-icon holiday-header-icon">
            <i class="fa-solid fa-calendar-days"></i>
          </div>
        </div>

        <div class="holiday-list">
          <div v-for="(holiday, index) in upcomingHolidays" :key="index" class="holiday-item">
            <div class="holiday-date">
              <strong>
                {{ holiday.day }}
              </strong>

              <span>
                {{ holiday.month }}
              </span>
            </div>

            <div class="holiday-info">
              <strong>
                {{ holiday.title }}
              </strong>

              <span>
                {{ holiday.description }}
              </span>
            </div>

            <div class="holiday-arrow">
              <i class="fa-solid fa-chevron-right"></i>
            </div>
          </div>

          <div v-if="!upcomingHolidays.length" class="holiday-empty">No upcoming holidays.</div>
        </div>

        <div class="card-bottom-label">
          <i class="fa-regular fa-calendar"></i>
          Institute calendar
        </div>
      </div>
    </div>

    <!-- ================= BOTTOM GRID ================= -->
    <div class="bottom-dashboard-grid">
      <!-- ================= NOTIFICATIONS ================= -->
      <div class="dashboard-card notifications-card">
        <div class="card-header">
          <div class="section-title-row">
            <div class="section-title-icon blue-soft">
              <i class="fa-solid fa-bell"></i>
            </div>

            <div>
              <h5>Recent Notifications</h5>
              <p>Latest updates</p>
            </div>
          </div>

          <div class="header-icon notification-icon">
            <i class="fa-solid fa-bell"></i>
          </div>
        </div>

        <div class="notification-list">
          <!-- Dynamic Notifications -->
          <div
            v-for="(notification, index) in notifications"
            :key="
              notification.id ||
              notification.result_id ||
              notification.student_id ||
              notification.examination_id ||
              index
            "
            class="notification-item"
          >
            <div class="notification-dot" :class="notification.type || 'blue'"></div>

            <div class="notification-content">
              <strong>
                {{ notification.title }}
              </strong>

              <span>
                {{ notification.text }}
              </span>

              <small>
                {{ notification.time }}
              </small>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="!notifications.length" class="notification-empty">
            <i class="fa-regular fa-bell-slash"></i>
            <span>No recent notifications.</span>
          </div>
        </div>
      </div>

      <!-- ================= CURRENT ATTENDANCE ================= -->
      <div class="dashboard-card attendance-summary-card">
        <div class="card-header">
          <div class="section-title-row">
            <div class="section-title-icon green-soft">
              <i class="fa-solid fa-calendar-check"></i>
            </div>

            <div>
              <h5>Current Staff & Teachers Attendance</h5>

              <p>
                {{
                  currentStaffTeachersAttendance.is_holiday
                    ? 'Today is a holiday'
                    : "Today's attendance overview"
                }}
              </p>
            </div>
          </div>

          <div class="header-icon attendance-icon">
            <i class="fa-solid fa-calendar-check"></i>
          </div>
        </div>

        <div class="attendance-columns">
          <!-- ================= TEACHERS ================= -->
          <div class="attendance-column teacher-attendance">
            <div class="attendance-column-icon">
              <i class="fa-solid fa-chalkboard-user"></i>
            </div>

            <div class="attendance-column-title">Teachers</div>

            <div class="attendance-number">
              {{
                currentAttendanceLoading
                  ? '...'
                  : `${currentStaffTeachersAttendance.teachers.percentage}%`
              }}
            </div>

            <div class="attendance-progress">
              <div
                class="attendance-progress-fill teacher-progress"
                :style="{
                  width: `${Math.min(
                    Math.max(currentStaffTeachersAttendance.teachers.percentage, 0),
                    100,
                  )}%`,
                }"
              ></div>
            </div>

            <div class="attendance-status">
              {{
                currentStaffTeachersAttendance.is_holiday
                  ? 'Off Day'
                  : `${currentStaffTeachersAttendance.teachers.present} Present today`
              }}
            </div>
          </div>

          <!-- ================= STAFF ================= -->
          <div class="attendance-column staff-attendance">
            <div class="attendance-column-icon">
              <i class="fa-solid fa-users"></i>
            </div>

            <div class="attendance-column-title">Staff</div>

            <div class="attendance-number">
              {{
                currentAttendanceLoading
                  ? '...'
                  : `${currentStaffTeachersAttendance.staff.percentage}%`
              }}
            </div>

            <div class="attendance-progress">
              <div
                class="attendance-progress-fill staff-progress"
                :style="{
                  width: `${Math.min(
                    Math.max(currentStaffTeachersAttendance.staff.percentage, 0),
                    100,
                  )}%`,
                }"
              ></div>
            </div>

            <div class="attendance-status">
              {{
                currentStaffTeachersAttendance.is_holiday
                  ? 'Off Day'
                  : `${currentStaffTeachersAttendance.staff.present} Present today`
              }}
            </div>
          </div>
        </div>
      </div>

      <!-- ================= MONTHLY ATTENDANCE ================= -->
      <div class="dashboard-card monthly-attendance-card">
        <div class="card-header">
          <div class="section-title-row">
            <div class="section-title-icon purple-soft">
              <i class="fa-solid fa-chart-pie"></i>
            </div>

            <div>
              <h5>Monthly Attendance</h5>
              <p>Current attendance summary</p>
            </div>
          </div>

          <div class="header-icon monthly-icon">
            <i class="fa-solid fa-chart-pie"></i>
          </div>
        </div>

        <div class="monthly-attendance-content">
          <!-- Attendance Donut -->
          <div class="attendance-pie" :style="monthlyAttendancePieStyle">
            <div class="pie-inner">
              <strong> {{ monthlyAttendance.present_percentage }}% </strong>

              <span> Present </span>
            </div>
          </div>

          <!-- Attendance Legend -->
          <div class="attendance-legend">
            <!-- Present -->
            <div class="legend-item">
              <span class="legend-dot present-dot"></span>

              <div>
                <strong>Present</strong>
                <span> {{ monthlyAttendance.present_percentage }}% </span>
              </div>
            </div>

            <!-- Absent -->
            <div class="legend-item">
              <span class="legend-dot absent-dot"></span>

              <div>
                <strong>Absent</strong>
                <span> {{ monthlyAttendance.absent_percentage }}% </span>
              </div>
            </div>

            <!-- Leave -->
            <div class="legend-item">
              <span class="legend-dot leave-dot"></span>

              <div>
                <strong>Leave</strong>
                <span> {{ monthlyAttendance.leave_percentage }}% </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import api from '@/services/api'
import dashPageView from './dashPageView.vue'

/* =====================================================
   Dashboard Summary
===================================================== */

const totalStaff = ref(0)
const totalStudents = ref(0)
const totalTeachers = ref(0)
const totalShifts = ref(0)

const currentUser = ref({
  name: '',
  role: '',
  designation: '',
  image: '',
})

/* =====================================================
   Selected Date
===================================================== */

const getTodayDate = () => {
  const date = new Date()

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const selectedDate = ref(getTodayDate())
const selectedGrade = ref('All Grades')

/* =====================================================
   Existing Dashboard Data
===================================================== */

const upcomingHolidays = ref([])

/* =====================================================
   Dynamic Notifications
===================================================== */

const notifications = ref([])

/* =====================================================
   Notification Helpers
===================================================== */

const extractArray = (response) => {
  const root = response?.data

  if (Array.isArray(root)) {
    return root
  }

  if (Array.isArray(root?.data)) {
    return root.data
  }

  if (Array.isArray(root?.data?.data)) {
    return root.data.data
  }

  if (Array.isArray(root?.students)) {
    return root.students
  }

  if (Array.isArray(root?.results)) {
    return root.results
  }

  if (Array.isArray(root?.examinations)) {
    return root.examinations
  }

  return []
}

const getNotificationDate = (item, fields = []) => {
  for (const field of fields) {
    if (item?.[field]) {
      return item[field]
    }
  }

  return item?.created_at || null
}

const formatNotificationTime = (dateString) => {
  if (!dateString) {
    return 'Recently'
  }

  const date = new Date(dateString)

  if (Number.isNaN(date.getTime())) {
    return 'Recently'
  }

  const today = new Date()

  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())

  const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())

  const diffDays = Math.round((todayStart - dateStart) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return 'Today'
  }

  if (diffDays === 1) {
    return 'Yesterday'
  }

  if (diffDays > 1 && diffDays < 7) {
    return `${diffDays} days ago`
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  })
}

const getStudentClassName = (student) => {
  return (
    student?.class_info?.name ||
    student?.class_info?.class_name ||
    student?.classInfo?.name ||
    student?.classInfo?.class_name ||
    student?.class_name ||
    student?.className ||
    'the student’s class'
  )
}

/* =====================================================
   Get Dynamic Notifications
===================================================== */

const getNotifications = async () => {
  try {
    const [studentsResult, resultsResult, examinationsResult] = await Promise.allSettled([
      /* Latest Student / New Admission */
      api.get('/students', {
        params: {
          per_page: 1,
        },
      }),

      /* Latest Result */
      api.get('/results', {
        params: {
          per_page: 1,
        },
      }),

      /* Latest Examination */
      api.get('/examinations'),
    ])

    const newNotifications = []

    /* =================================================
       1. NEW ADMISSION
    ================================================= */

    if (studentsResult.status === 'fulfilled') {
      const students = extractArray(studentsResult.value)

      if (students.length > 0) {
        const student = students[0]

        const studentName = student?.full_name || student?.name || 'A new student'

        const className = getStudentClassName(student)

        const admissionDate = getNotificationDate(student, ['admission_date'])

        newNotifications.push({
          id: `admission-${student.id || 'latest'}`,
          title: 'New Admission',
          text: `${studentName} has been admitted to ${className}.`,
          time: formatNotificationTime(admissionDate),
          type: 'blue',
        })
      }
    }

    /* =================================================
       2. RECENT PUBLISHED RESULT
    ================================================= */

    if (resultsResult.status === 'fulfilled') {
      const results = extractArray(resultsResult.value)

      if (results.length > 0) {
        const result = results[0]

        const student = result?.student || {}

        const studentName = student?.full_name || student?.name || 'A student'

        const className = getStudentClassName(student)

        const examType = result?.exam_type || 'Examination'

        const resultDate = getNotificationDate(result, ['published_at', 'result_date'])

        newNotifications.push({
          id: `result-${result.id || 'latest'}`,
          title: 'Recent Published Result',
          text: `${studentName}'s ${className} ${examType} result has been published.`,
          time: formatNotificationTime(resultDate),
          type: 'green',
        })
      }
    }

    /* =================================================
       3. UPCOMING EXAMINATION
    ================================================= */

    if (examinationsResult.status === 'fulfilled') {
      const examinations = extractArray(examinationsResult.value)

      if (examinations.length > 0) {
        const examination = examinations[0]

        const examinationType = examination?.examination_type || 'Examination'

        const examinationYear = examination?.examination_year || ''

        const examinationDate = getNotificationDate(examination, ['examination_date', 'exam_date'])

        let examinationText = ''

        if (examinationDate) {
          examinationText =
            `${examinationType} examination for ${examinationYear} ` +
            `is scheduled for ${formatNotificationTime(examinationDate).toLowerCase()}.`
        } else {
          examinationText =
            `${examinationType} examination for ${examinationYear} ` +
            `has been added to the examination schedule.`
        }

        newNotifications.push({
          id: `exam-${examination.id || 'latest'}`,
          title: 'Recent Passed Examination',
          text: examinationText,
          time: examinationDate ? formatNotificationTime(examinationDate) : 'Recently added',
          type: 'orange',
        })
      }
    }

    /* =================================================
       Final Notifications
    ================================================= */

    notifications.value = newNotifications.slice(0, 3)

    console.log('Dashboard notifications:', notifications.value)
  } catch (error) {
    console.error('Error fetching notifications:', error)

    notifications.value = []
  }
}

/* =====================================================
   Attendance Trend
===================================================== */

const attendanceTrend = ref({
  total_students: 0,
  present: 0,
  absent: 0,
  late: 0,
  leave: 0,
  present_percentage: 0,
  absent_percentage: 0,
  late_percentage: 0,
  leave_percentage: 0,
  average_status: 0,
  trend: [],
})

const attendanceLoading = ref(false)

/* =====================================================
   Monthly Student Attendance
===================================================== */

const monthlyAttendance = ref({
  total_records: 0,
  present: 0,
  absent: 0,
  leave: 0,
  present_percentage: 0,
  absent_percentage: 0,
  leave_percentage: 0,
})

const monthlyAttendanceLoading = ref(false)

/* =====================================================
   Monthly Attendance API
===================================================== */

const getMonthlyAttendance = async () => {
  try {
    monthlyAttendanceLoading.value = true

    const today = new Date()

    const month = `${today.getFullYear()}-` + `${String(today.getMonth() + 1).padStart(2, '0')}`

    const response = await api.get('/student-attendance/monthly-summary', {
      params: {
        month,
      },
    })

    if (!response.data?.status) {
      return
    }

    monthlyAttendance.value = {
      total_records: Number(response.data.total_records) || 0,

      present: Number(response.data.present) || 0,

      absent: Number(response.data.absent) || 0,

      leave: Number(response.data.leave) || 0,

      present_percentage: Number(response.data.present_percentage) || 0,

      absent_percentage: Number(response.data.absent_percentage) || 0,

      leave_percentage: Number(response.data.leave_percentage) || 0,
    }
  } catch (error) {
    console.error('Error fetching monthly attendance:', error)
  } finally {
    monthlyAttendanceLoading.value = false
  }
}

/* =====================================================
   Monthly Attendance 3-Color Circle
===================================================== */

const monthlyAttendancePieStyle = computed(() => {
  const present = Number(monthlyAttendance.value.present_percentage) || 0

  const absent = Number(monthlyAttendance.value.absent_percentage) || 0

  const leave = Number(monthlyAttendance.value.leave_percentage) || 0

  const total = present + absent + leave

  if (total <= 0) {
    return {
      background: '#e5e7eb',
    }
  }

  const presentEnd = present
  const absentEnd = present + absent

  return {
    background: `conic-gradient(
      #10B981 0% ${presentEnd}%,
      #EF4444 ${presentEnd}% ${absentEnd}%,
      #F59E0B ${absentEnd}% 100%
    )`,
  }
})

/* =====================================================
   Current Staff & Teachers Attendance
===================================================== */

const currentStaffTeachersAttendance = ref({
  is_holiday: false,

  teachers: {
    total: 0,
    present: 0,
    absent: 0,
    leave: 0,
    off_day: 0,
    applicable: 0,
    percentage: 0,
  },

  staff: {
    total: 0,
    present: 0,
    absent: 0,
    leave: 0,
    off_day: 0,
    applicable: 0,
    percentage: 0,
  },
})

const currentAttendanceLoading = ref(false)

const getCurrentStaffTeachersAttendance = async () => {
  try {
    currentAttendanceLoading.value = true

    const response = await api.get('/staff/dashboard/current-attendance')

    if (!response.data?.status) {
      return
    }

    currentStaffTeachersAttendance.value = {
      is_holiday: Boolean(response.data.is_holiday),

      teachers: {
        total: Number(response.data.teachers?.total) || 0,

        present: Number(response.data.teachers?.present) || 0,

        absent: Number(response.data.teachers?.absent) || 0,

        leave: Number(response.data.teachers?.leave) || 0,

        off_day: Number(response.data.teachers?.off_day) || 0,

        applicable: Number(response.data.teachers?.applicable) || 0,

        percentage: Number(response.data.teachers?.percentage) || 0,
      },

      staff: {
        total: Number(response.data.staff?.total) || 0,

        present: Number(response.data.staff?.present) || 0,

        absent: Number(response.data.staff?.absent) || 0,

        leave: Number(response.data.staff?.leave) || 0,

        off_day: Number(response.data.staff?.off_day) || 0,

        applicable: Number(response.data.staff?.applicable) || 0,

        percentage: Number(response.data.staff?.percentage) || 0,
      },
    }
  } catch (error) {
    console.error('Error fetching current staff & teachers attendance:', error)
  } finally {
    currentAttendanceLoading.value = false
  }
}

/* =====================================================
   Dashboard Data
===================================================== */

const getDashboardData = async () => {
  try {
    const storedUser = localStorage.getItem('user')

    if (storedUser) {
      const parsedUser = JSON.parse(storedUser)

      currentUser.value = {
        ...currentUser.value,
        ...parsedUser,
      }
    }

    const response = await api.get('/staff/dashboard')

    /* =================================================
       Existing Dashboard Values
    ================================================= */

    totalStaff.value = Number(response.data.total_staff) || 0

    totalStudents.value = Number(response.data.total_students) || 0

    totalTeachers.value = Number(response.data.total_teachers) || 0

    /* =================================================
       Current User
    ================================================= */

    if (response.data.user) {
      currentUser.value = {
        name: response.data.user.name || '',

        role: response.data.user.role || 'Admin',

        designation: response.data.user.designation || response.data.user.role || 'Admin',

        image: response.data.user.image || response.data.user.avatar || '',
      }
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
  }
}

/* =====================================================
   Shift Count
===================================================== */

const getShiftCount = async () => {
  try {
    const response = await api.get('/shifts')

    let shifts = []

    if (Array.isArray(response.data)) {
      shifts = response.data
    } else if (Array.isArray(response.data.shifts)) {
      shifts = response.data.shifts
    } else if (Array.isArray(response.data.data)) {
      shifts = response.data.data
    }

    totalShifts.value = shifts.length
  } catch (error) {
    console.error('Error fetching shifts:', error)

    totalShifts.value = 0
  }
}

/* =====================================================
   Upcoming Holidays
===================================================== */

const getUpcomingHolidays = async () => {
  try {
    const response = await api.get('/holidays')

    const holidays = Array.isArray(response.data?.data) ? response.data.data : []

    const today = getTodayDate()

    upcomingHolidays.value = holidays
      .filter((holiday) => {
        const startDate = String(holiday.start_date || '').slice(0, 10)

        return startDate && startDate >= today
      })

      .sort((a, b) => {
        const aDate = String(a.start_date || '').slice(0, 10)

        const bDate = String(b.start_date || '').slice(0, 10)

        return aDate.localeCompare(bDate)
      })

      .slice(0, 4)

      .map((holiday) => {
        const dateString = String(holiday.start_date || '').slice(0, 10)

        const date = new Date(`${dateString}T00:00:00`)

        return {
          id: holiday.id,

          day: String(date.getDate()).padStart(2, '0'),

          month: date
            .toLocaleDateString('en-US', {
              month: 'short',
            })
            .toUpperCase(),

          title: holiday.title || 'Holiday',

          description: holiday.description || 'Institute holiday',
        }
      })
  } catch (error) {
    console.error('Error fetching upcoming holidays:', error)

    upcomingHolidays.value = []
  }
}

/* =====================================================
   Date Helpers
===================================================== */

const formatDate = (date) => {
  const year = date.getFullYear()

  const month = String(date.getMonth() + 1).padStart(2, '0')

  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const getDateBefore = (dateString, days) => {
  const date = new Date(`${dateString}T00:00:00`)

  date.setDate(date.getDate() - days)

  return formatDate(date)
}

const getDateAfter = (dateString, days) => {
  const date = new Date(`${dateString}T00:00:00`)

  date.setDate(date.getDate() + days)

  return formatDate(date)
}

/* =====================================================
   Day Label
===================================================== */

const getDayName = (dateString) => {
  const date = new Date(`${dateString}T00:00:00`)

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
  })
}

const getDayNumber = (dateString) => {
  const date = new Date(`${dateString}T00:00:00`)

  return String(date.getDate()).padStart(2, '0')
}

/* =====================================================
   Single Day Attendance API
===================================================== */

const getAttendanceByDate = async (date) => {
  try {
    const response = await api.get('/staff/dashboard/attendance-trend', {
      params: {
        date,
      },
    })

    if (!response.data?.status) {
      return null
    }

    return {
      date,

      total_students: Number(response.data.total_students) || 0,

      present: Number(response.data.present) || 0,

      absent: Number(response.data.absent) || 0,

      late: Number(response.data.late) || 0,

      leave: Number(response.data.leave) || 0,

      present_percentage: Number(response.data.present_percentage) || 0,

      absent_percentage: Number(response.data.absent_percentage) || 0,

      late_percentage: Number(response.data.late_percentage) || 0,

      leave_percentage: Number(response.data.leave_percentage) || 0,

      average_status: Number(response.data.average_status) || 0,

      day: getDayName(date),

      day_number: getDayNumber(date),
    }
  } catch (error) {
    console.error(`Error fetching attendance for ${date}:`, error)

    return null
  }
}

/* =====================================================
   Attendance Trend API
===================================================== */

const getAttendanceTrend = async () => {
  try {
    attendanceLoading.value = true

    const dates = []

    for (let i = -3; i <= 3; i++) {
      if (i < 0) {
        dates.push(getDateBefore(selectedDate.value, Math.abs(i)))
      } else if (i > 0) {
        dates.push(getDateAfter(selectedDate.value, i))
      } else {
        dates.push(selectedDate.value)
      }
    }

    const results = await Promise.all(dates.map((date) => getAttendanceByDate(date)))

    const validResults = results.filter(Boolean)

    /* =================================================
       Selected Date Summary
    ================================================= */

    const selectedDayData = validResults.find((item) => item.date === selectedDate.value) || {
      total_students: 0,
      present: 0,
      absent: 0,
      late: 0,
      leave: 0,
      present_percentage: 0,
      absent_percentage: 0,
      late_percentage: 0,
      leave_percentage: 0,
      average_status: 0,
    }

    /* =================================================
       Store Everything
    ================================================= */

    attendanceTrend.value = {
      total_students: selectedDayData.total_students,

      present: selectedDayData.present,

      absent: selectedDayData.absent,

      late: selectedDayData.late,

      leave: selectedDayData.leave,

      present_percentage: selectedDayData.present_percentage,

      absent_percentage: selectedDayData.absent_percentage,

      late_percentage: selectedDayData.late_percentage,

      leave_percentage: selectedDayData.leave_percentage,

      average_status: selectedDayData.average_status,

      trend: validResults,
    }
  } catch (error) {
    console.error('Error fetching attendance trend:', error)
  } finally {
    attendanceLoading.value = false
  }
}

/* =====================================================
   Dynamic Attendance Chart Points
===================================================== */

const chartPoints = computed(() => {
  const trend = attendanceTrend.value.trend || []

  if (!trend.length) {
    return {
      present: [],
      absent: [],
      leave: [],
    }
  }

  const maxValue = 100

  const left = 50
  const right = 830
  const top = 15
  const bottom = 210

  const step = trend.length > 1 ? (right - left) / (trend.length - 1) : 0

  const makePoints = (key, labelOffset) => {
    return trend.map((item, index) => {
      const value = Number(item[key] || 0)

      const x = left + index * step

      const y = bottom - (value / maxValue) * (bottom - top)

      return {
        x,
        y,
        value: Number(value.toFixed(2)),
        date: item.date,
        day: item.day,
        day_number: item.day_number,

        labelY: Math.max(top + 10, Math.min(bottom - 5, y + labelOffset)),
      }
    })
  }

  return {
    /* Present → label above */
    present: makePoints('present_percentage', -12),

    /* Absent → label below */
    absent: makePoints('absent_percentage', 18),

    /* Leave → label further above */
    leave: makePoints('leave_percentage', -27),
  }
})

/* =====================================================
   Diamond Marker
===================================================== */

const getDiamondPoints = (point) => {
  const size = 5

  return [
    `${point.x},${point.y - size}`,
    `${point.x + size},${point.y}`,
    `${point.x},${point.y + size}`,
    `${point.x - size},${point.y}`,
  ].join(' ')
}

/* =====================================================
   SVG Chart Paths
===================================================== */

const makeChartPath = (points) => {
  if (!points.length) {
    return ''
  }

  return points
    .map((point, index) => {
      return `${index === 0 ? 'M' : 'L'}${point.x},${point.y}`
    })
    .join(' ')
}

const presentChartPath = computed(() => makeChartPath(chartPoints.value.present))

const absentChartPath = computed(() => makeChartPath(chartPoints.value.absent))

const leaveChartPath = computed(() => makeChartPath(chartPoints.value.leave))

/* =====================================================
   Chart Labels
===================================================== */

const chartLabels = computed(() => {
  return (attendanceTrend.value.trend || []).map((item) => ({
    date: item.date,
    day: item.day,
    day_number: item.day_number,
  }))
})

/* =====================================================
   Helpers
===================================================== */

const getInitials = (name) => {
  if (!name) {
    return '?'
  }

  const parts = name.trim().split(' ').filter(Boolean)

  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase()
  }

  return parts[0].charAt(0).toUpperCase() + parts[parts.length - 1].charAt(0).toUpperCase()
}

const getStaffImage = (image) => {
  if (!image) {
    return ''
  }

  if (image.startsWith('http://') || image.startsWith('https://')) {
    return image
  }

  return `${window.location.origin}/storage/${image}`
}

/* =====================================================
   Selected Date Watch
===================================================== */

watch(selectedDate, () => {
  getAttendanceTrend()
})

/* =====================================================
   Initial Load
===================================================== */

onMounted(async () => {
  await Promise.all([
    getDashboardData(),
    getShiftCount(),
    getAttendanceTrend(),
    getUpcomingHolidays(),
    getCurrentStaffTeachersAttendance(),
    getMonthlyAttendance(),
    getNotifications(),
  ])
})
</script>

<style scoped>
/* =====================================================
   MAIN LAYOUT
===================================================== */

.dashboard-layout {
  margin-left: 250px;
  min-height: 100vh;
  background: linear-gradient(180deg, #f7f9fd 0%, #f4f7fb 100%);
  padding: 24px 28px 45px;
  color: #1f2937;
}

/* =====================================================
   TOPBAR
===================================================== */

.dashboard-topbar {
  background: #ffffff;
  border: 1px solid #edf0f5;
  border-radius: 18px;
  padding: 18px 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 22px;
  box-shadow: 0 6px 24px rgba(15, 23, 42, 0.045);
}

.welcome-text {
  font-size: 22px;
  font-weight: 750;
  color: #172033;
  letter-spacing: -0.3px;
}

.welcome-subtitle {
  margin-top: 5px;
  font-size: 13px;
  color: #8b95a7;
}

.topbar-profile {
  display: flex;
  align-items: center;
  gap: 11px;
}

.profile-info {
  text-align: right;
}

.profile-name {
  font-size: 14px;
  font-weight: 700;
  color: #1f2937;
}

.profile-role {
  font-size: 11px;
  color: #8b95a7;
  margin-top: 3px;
}

.profile-image-wrapper {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #eef4ff;
  box-shadow: 0 3px 10px rgba(37, 99, 235, 0.12);
}

.profile-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  color: white;
  font-weight: 700;
  font-size: 14px;
}

.profile-arrow {
  color: #9aa3b2;
  font-size: 10px;
}

/* =====================================================
   STAT CARDS
===================================================== */

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
  margin-bottom: 22px;
}

.stat-card {
  position: relative;
  overflow: hidden;
  border-radius: 18px;
  padding: 22px;
  min-height: 145px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 7px 25px rgba(15, 23, 42, 0.075);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.1);
}

/* Staff */
.staff-card {
  background: linear-gradient(135deg, #7c3aed, #8b5cf6);
  color: #ffffff;
}

/* Student */
.student-card {
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  color: #ffffff;
}

/* Teacher */
.teacher-card {
  background: linear-gradient(135deg, #059669, #10b981);
  color: #ffffff;
}

/* Shift */
.shift-card {
  background: linear-gradient(135deg, #f59e0b, #f97316);
  color: #ffffff;
}

.stat-card-left {
  display: flex;
  align-items: center;
  gap: 15px;
  position: relative;
  z-index: 2;
}

.stat-icon {
  width: 51px;
  height: 51px;
  border-radius: 15px;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.13);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 21px;
}

.stat-label {
  font-size: 13px;
  opacity: 0.9;
}

.stat-value {
  font-size: 30px;
  line-height: 1.2;
  font-weight: 800;
  margin-top: 4px;
  letter-spacing: -0.5px;
}

.stat-description {
  font-size: 11px;
  opacity: 0.78;
  margin-top: 4px;
}

.stat-card-decoration {
  position: absolute;
  right: -13px;
  bottom: -22px;
  font-size: 105px;
  opacity: 0.08;
}

/* =====================================================
   COMMON CARD
===================================================== */

.dashboard-card {
  background: #ffffff;
  border: 1px solid #edf0f5;
  border-radius: 18px;
  padding: 22px;
  box-shadow: 0 5px 22px rgba(15, 23, 42, 0.045);
}

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 18px;
  gap: 12px;
}

.card-header h5 {
  margin: 0;
  font-size: 15px;
  font-weight: 750;
  color: #172033;
}

.card-header p {
  margin: 5px 0 0;
  font-size: 11px;
  color: #929aaa;
}

.section-title-row {
  display: flex;
  align-items: center;
  gap: 11px;
}

.section-title-icon {
  width: 39px;
  height: 39px;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 15px;
}

.blue-soft {
  background: #eef4ff;
  color: #2563eb;
}

.green-soft {
  background: #ecfdf5;
  color: #059669;
}

.orange-soft {
  background: #fff7ed;
  color: #f97316;
}

.purple-soft {
  background: #f5f3ff;
  color: #7c3aed;
}

.header-icon {
  width: 38px;
  height: 38px;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.holiday-header-icon {
  background: #fff4e6;
  color: #f59e0b;
}

.notification-icon {
  background: #eef4ff;
  color: #2563eb;
}

.attendance-icon {
  background: #ecfdf5;
  color: #059669;
}

.monthly-icon {
  background: #f5f3ff;
  color: #7c3aed;
}

/* =====================================================
   MAIN GRID
===================================================== */

.main-dashboard-grid {
  display: grid;
  grid-template-columns:
    minmax(0, 1.75fr)
    minmax(300px, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.student-overview-card {
  min-height: 420px;
}

.holidays-card {
  min-height: 420px;
}

/* =====================================================
   FILTER
===================================================== */

.overview-filter {
  display: flex;
  gap: 7px;
}

.overview-filter select {
  border: 1px solid #e5e9f0;
  background: #f9fafc;
  border-radius: 9px;
  padding: 7px 10px;
  font-size: 11px;
  color: #667085;
  outline: none;
  cursor: pointer;
  transition: 0.2s ease;
}

.overview-filter select:focus {
  border-color: #b8cdfc;
  background: #ffffff;
}

/* Date input */
.date-picker-input {
  border: 1px solid #e5e9f0;
  background: #f9fafc;
  border-radius: 9px;
  padding: 7px 10px;
  font-size: 11px;
  color: #667085;
  outline: none;
  cursor: pointer;
  transition: 0.2s ease;
}

.date-picker-input:focus {
  border-color: #b8cdfc;
  background: #ffffff;
}

/* =====================================================
   CLEAN ATTENDANCE OVERVIEW SUMMARY
===================================================== */

.attendance-overview-summary {
  display: grid;
  grid-template-columns:
    minmax(120px, 1.15fr)
    repeat(3, minmax(110px, 1fr));
  align-items: stretch;
  gap: 10px;
  background: linear-gradient(135deg, #f8fafc, #fbfdff);
  border: 1px solid #edf2fa;
  border-radius: 13px;
  padding: 11px;
  margin-bottom: 15px;
}

.attendance-summary-main {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 4px 7px;
}

.summary-label {
  display: block;
  font-size: 10px;
  color: #8b95a7;
  margin-bottom: 2px;
}

.attendance-summary-value {
  font-size: 23px;
  font-weight: 800;
  line-height: 1.2;
}

.text-present {
  color: #059669;
}

.summary-status {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 9px;
  color: #64748b;
  margin-top: 3px;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.status-dot.success {
  background: #10b981;
}

.attendance-status-box {
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: 10px;
  padding: 8px 9px;
  border: 1px solid transparent;
  min-width: 0;
}

.present-status-box {
  background: #ecfdf5;
  border-color: #d1fae5;
}

.absent-status-box {
  background: #fef2f2;
  border-color: #fee2e2;
}

.leave-status-box {
  background: #fffbeb;
  border-color: #fef3c7;
}

.status-box-icon {
  width: 29px;
  height: 29px;
  flex-shrink: 0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.present-status-box .status-box-icon {
  background: #d1fae5;
  color: #059669;
}

.absent-status-box .status-box-icon {
  background: #fee2e2;
  color: #dc2626;
}

.leave-status-box .status-box-icon {
  background: #fef3c7;
  color: #d97706;
}

.status-box-content {
  min-width: 0;
}

.status-box-content small {
  display: block;
  font-size: 9px;
  font-weight: 600;
  color: #64748b;
}

.status-box-content strong {
  display: block;
  font-size: 14px;
  line-height: 1.15;
  margin-top: 1px;
}

.present-status-box .status-box-content strong {
  color: #059669;
}

.absent-status-box .status-box-content strong {
  color: #dc2626;
}

.leave-status-box .status-box-content strong {
  color: #d97706;
}

.status-box-content span {
  display: block;
  font-size: 8px;
  color: #94a3b8;
  margin-top: 2px;
}

/* =====================================================
   CLEAN ATTENDANCE TREND CHART
===================================================== */

.attendance-chart {
  display: flex;
  height: 250px;
  position: relative;
  margin-top: 10px;
}

.chart-area {
  position: relative;
  flex: 1;
  height: 100%;
}

.chart-grid-line {
  position: absolute;
  left: 0;
  right: 0;
  border-top: 1px dashed #e9edf3;
}

.attendance-trend-svg {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: calc(100% - 25px);
  overflow: visible;
}

.chart-grid-line-svg {
  stroke: #e2e8f0;
  stroke-width: 1;
  stroke-dasharray: 4 4;
}

.chart-axis-label {
  fill: #94a3b8;
  font-size: 8.5px;
  font-weight: 600;
}

/* =====================================================
   PRESENT LINE
===================================================== */

.trend-line-present-clean {
  stroke: #10b981;
  stroke-width: 2.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* =====================================================
   ABSENT LINE
===================================================== */

.trend-line-absent-clean {
  stroke: #ef4444;
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* =====================================================
   LEAVE LINE
===================================================== */

.trend-line-leave-clean {
  stroke: #f59e0b;
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 5 3;
}

/* =====================================================
   PRESENT POINTS
===================================================== */

.present-points-clean circle {
  fill: #ffffff;
  stroke: #10b981;
  stroke-width: 2.5;
}

.present-points-clean circle:hover {
  r: 6;
}

.present-point-label {
  fill: #059669;
  font-size: 8px;
  font-weight: 700;
}

/* =====================================================
   ABSENT POINTS
===================================================== */

.absent-points-clean circle {
  fill: #ffffff;
  stroke: #ef4444;
  stroke-width: 2.5;
}

.absent-points-clean circle:hover {
  r: 6;
}

.absent-point-label {
  fill: #dc2626;
  font-size: 8px;
  font-weight: 700;
}

/* =====================================================
   LEAVE POINTS
===================================================== */

.leave-points-clean circle {
  fill: #ffffff;
  stroke: #f59e0b;
  stroke-width: 2.5;
}

.leave-points-clean circle:hover {
  r: 6;
}

.leave-point-label {
  fill: #d97706;
  font-size: 8px;
  font-weight: 700;
}

/* =====================================================
   CHART LEGEND
===================================================== */

.attendance-chart-legend {
  position: absolute;
  top: -8px;
  right: 4px;
  display: flex;
  align-items: center;
  gap: 13px;
  background: rgba(255, 255, 255, 0.92);
  padding: 4px 7px;
  border-radius: 7px;
}

.chart-legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 9px;
  font-weight: 600;
}

.chart-legend-line {
  width: 17px;
  height: 2.5px;
  border-radius: 5px;
}

.present-legend {
  color: #059669;
}

.present-legend .chart-legend-line {
  background: #10b981;
}

.absent-legend {
  color: #dc2626;
}

.absent-legend .chart-legend-line {
  background: #ef4444;
}

.leave-legend {
  color: #d97706;
}

.leave-legend .chart-legend-line {
  background: #f59e0b;
}

/* =====================================================
   FOOTER LEGEND
===================================================== */

.chart-footer-legend-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid #f1f5f9;
  margin-top: 25px;
  padding-top: 10px;
  font-size: 10px;
}

.legend-items-group {
  display: flex;
  gap: 16px;
}

.legend-badge-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: 600;
}

.present-footer {
  color: #059669;
}

.present-footer i {
  color: #10b981;
}

.absent-footer {
  color: #dc2626;
}

.absent-footer i {
  color: #ef4444;
}

.leave-footer {
  color: #d97706;
}

.leave-footer i {
  color: #f59e0b;
}

.academic-label-text {
  font-weight: 700;
  color: #1e293b;
}

/* =====================================================
   HOLIDAYS
===================================================== */

.holiday-list {
  display: flex;
  flex-direction: column;
}

.holiday-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 13px 0;
  border-bottom: 1px solid #f0f2f5;
}

.holiday-item:last-child {
  border-bottom: none;
}

.holiday-date {
  width: 45px;
  height: 50px;
  flex-shrink: 0;
  border-radius: 11px;
  background: #fff7ed;
  border: 1px solid #ffedd5;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.holiday-date strong {
  font-size: 16px;
  line-height: 1;
  color: #f97316;
}

.holiday-date span {
  font-size: 8px;
  font-weight: 700;
  color: #fb923c;
  margin-top: 3px;
}

.holiday-info {
  flex: 1;
  min-width: 0;
}

.holiday-info strong {
  display: block;
  font-size: 12px;
  color: #273142;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.holiday-info span {
  display: block;
  font-size: 10px;
  color: #9aa2b1;
  margin-top: 3px;
}

.holiday-arrow {
  color: #b5bdc9;
  font-size: 9px;
}

.card-bottom-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 9px;
  color: #a0a8b6;
  border-top: 1px solid #f0f2f5;
  padding-top: 13px;
  margin-top: 8px;
}

/* =====================================================
   BOTTOM GRID
===================================================== */

.bottom-dashboard-grid {
  display: grid;
  grid-template-columns: 1.1fr 1fr 1fr;
  gap: 20px;
}

.notifications-card,
.attendance-summary-card,
.monthly-attendance-card {
  min-height: 280px;
}

/* =====================================================
   NOTIFICATIONS
===================================================== */

.notification-item {
  display: flex;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f2f5;
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 5px;
  flex-shrink: 0;
}

.notification-dot.blue {
  background: #2563eb;
}

.notification-dot.green {
  background: #10b981;
}

.notification-dot.orange {
  background: #f59e0b;
}

.notification-content {
  min-width: 0;
}

.notification-content strong {
  display: block;
  font-size: 12px;
  color: #273142;
}

.notification-content span {
  display: block;
  font-size: 10px;
  color: #8d96a6;
  margin-top: 4px;
  line-height: 1.5;
}

.notification-content small {
  display: block;
  font-size: 9px;
  color: #b0b7c3;
  margin-top: 4px;
}

/* =====================================================
   ATTENDANCE SUMMARY
===================================================== */

.attendance-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 25px;
}

.attendance-column {
  border-radius: 14px;
  padding: 17px 14px;
  text-align: center;
  border: 1px solid transparent;
}

.teacher-attendance {
  background: #eff6ff;
  border-color: #dbeafe;
}

.staff-attendance {
  background: #ecfdf5;
  border-color: #d1fae5;
}

.attendance-column-icon {
  width: 35px;
  height: 35px;
  margin: 0 auto 8px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.teacher-attendance .attendance-column-icon {
  background: #dbeafe;
  color: #2563eb;
}

.staff-attendance .attendance-column-icon {
  background: #d1fae5;
  color: #059669;
}

.attendance-column-title {
  font-size: 11px;
  font-weight: 600;
  color: #667085;
}

.attendance-number {
  font-size: 24px;
  font-weight: 800;
  color: #1f2937;
  margin: 5px 0 8px;
}

.attendance-progress {
  height: 5px;
  border-radius: 10px;
  background: #e5e7eb;
  overflow: hidden;
}

.attendance-progress-fill {
  height: 100%;
  border-radius: 10px;
}

.teacher-progress {
  background: #2563eb;
}

.staff-progress {
  background: #10b981;
}

.attendance-status {
  font-size: 9px;
  color: #8b95a7;
  margin-top: 7px;
}

/* =====================================================
   MONTHLY ATTENDANCE
===================================================== */

.monthly-attendance-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 25px;
  min-height: 175px;
}

.attendance-pie {
  width: 135px;
  height: 135px;
  flex-shrink: 0;
  border-radius: 50%;
  background: conic-gradient(
    #10b981 0deg 327.6deg,
    #ef4444 327.6deg 349.2deg,
    #f59e0b 349.2deg 360deg
  );
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.pie-inner {
  width: 92px;
  height: 92px;
  border-radius: 50%;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.pie-inner strong {
  font-size: 22px;
  color: #1f2937;
}

.pie-inner span {
  font-size: 9px;
  color: #8b95a7;
  margin-top: 2px;
}

.attendance-legend {
  display: flex;
  flex-direction: column;
  gap: 13px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.present-dot {
  background: #10b981;
}

.absent-dot {
  background: #ef4444;
}

.leave-dot {
  background: #f59e0b;
}

.legend-item div {
  display: flex;
  flex-direction: column;
}

.legend-item strong {
  font-size: 10px;
  color: #667085;
}

.legend-item span {
  font-size: 11px;
  font-weight: 700;
  color: #1f2937;
}

/* =====================================================
   RESPONSIVE DESIGN
===================================================== */

@media (max-width: 1300px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 1200px) {
  .main-dashboard-grid {
    grid-template-columns: 1fr;
  }

  .bottom-dashboard-grid {
    grid-template-columns: 1fr 1fr;
  }

  .student-overview-card,
  .holidays-card {
    min-height: auto;
  }

  .attendance-overview-summary {
    grid-template-columns:
      minmax(120px, 1fr)
      repeat(3, minmax(100px, 1fr));
  }
}

@media (max-width: 900px) {
  .dashboard-layout {
    margin-left: 0;
    padding: 18px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .bottom-dashboard-grid {
    grid-template-columns: 1fr;
  }

  .attendance-overview-summary {
    grid-template-columns: 1fr 1fr;
  }

  .attendance-summary-main {
    grid-column: 1 / -1;
  }
}

@media (max-width: 700px) {
  .dashboard-topbar {
    padding: 16px;
  }

  .welcome-text {
    font-size: 18px;
  }

  .attendance-overview-summary {
    grid-template-columns: 1fr;
  }

  .attendance-summary-main {
    grid-column: auto;
  }

  .attendance-status-box {
    min-height: 52px;
  }

  .attendance-chart {
    height: 235px;
  }

  .attendance-chart-legend {
    top: -5px;
    gap: 7px;
  }

  .chart-legend-item {
    font-size: 8px;
  }

  .chart-footer-legend-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .attendance-overview-summary {
    margin-bottom: 12px;
  }

  .overview-filter {
    width: 100%;
  }

  .overview-filter select,
  .date-picker-input {
    flex: 1;
  }
}

/* =====================================================
   Attendance Trend - Readability Fix
===================================================== */

.trend-line-present-clean {
  stroke: #10b981;
  stroke-width: 2.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.trend-line-absent-clean {
  stroke: #ef4444;
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 7 4;
}

.trend-line-leave-clean {
  stroke: #f59e0b;
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 2 5;
}

/* =====================================================
   Present Marker
===================================================== */

.present-points-clean circle {
  fill: #10b981;
  stroke: #ffffff;
  stroke-width: 2;
}

/* =====================================================
   Absent Marker
===================================================== */

.absent-points-clean rect {
  fill: #ef4444;
  stroke: #ffffff;
  stroke-width: 2;
}

/* =====================================================
   Leave Marker
===================================================== */

.leave-points-clean polygon {
  fill: #f59e0b;
  stroke: #ffffff;
  stroke-width: 2;
}

/* =====================================================
   Chart Labels
===================================================== */

.present-point-label {
  fill: #059669;
  font-size: 10px;
  font-weight: 700;
}

.absent-point-label {
  fill: #dc2626;
  font-size: 10px;
  font-weight: 700;
}

.leave-point-label {
  fill: #d97706;
  font-size: 10px;
  font-weight: 700;
}

/* =====================================================
   Chart Legend
===================================================== */

.present-legend .chart-legend-line {
  display: inline-block;
  width: 20px;
  height: 3px;
  background: #10b981;
  border-radius: 3px;
}

.absent-legend .chart-legend-line {
  display: inline-block;
  width: 20px;
  height: 3px;
  background: repeating-linear-gradient(
    to right,
    #ef4444 0,
    #ef4444 6px,
    transparent 6px,
    transparent 10px
  );
  border-radius: 3px;
}

.leave-legend .chart-legend-line {
  display: inline-block;
  width: 20px;
  height: 3px;
  background: repeating-linear-gradient(
    to right,
    #f59e0b 0,
    #f59e0b 2px,
    transparent 2px,
    transparent 6px
  );
  border-radius: 3px;
}

/* =====================================================
   Dynamic Notification Empty State
===================================================== */

.notification-empty {
  min-height: 140px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #9ca3af;
  font-size: 13px;
}

.notification-empty i {
  font-size: 22px;
  color: #cbd5e1;
}

/* =====================================================
   Holiday Empty State
===================================================== */

.holiday-empty {
  padding: 25px 15px;
  text-align: center;
  color: #9ca3af;
  font-size: 13px;
}
</style>
