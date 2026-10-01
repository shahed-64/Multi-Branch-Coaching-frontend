<template>
  <RouterView />

  <!-- Existing Sidebar -->
  <dashPageView />

  <!-- ================= MAIN DASHBOARD ================= -->
  <div class="dashboard-layout">
    <!-- ================= TOP NAVBAR ================= -->
    <div class="dashboard-topbar">
      <div>
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
      <!-- ================= STUDENT OVERVIEW ================= -->
      <div class="dashboard-card student-overview-card">
        <div class="card-header">
          <div>
            <h5>Students Overview</h5>

            <p>Student enrollment overview</p>
          </div>

          <div class="overview-filter">
            <select v-model="selectedYear">
              <option>2026</option>
              <option>2025</option>
              <option>2024</option>
            </select>

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

        <!-- Current Student Summary -->
        <div class="student-summary">
          <div>
            <span class="summary-label"> Current Students </span>

            <strong>
              {{ totalStudents }}
            </strong>
          </div>

          <div class="summary-growth">
            <i class="fa-solid fa-arrow-trend-up"></i>

            <span> Enrollment Overview </span>
          </div>
        </div>

        <!-- Chart -->
        <div class="enrollment-chart">
          <div class="chart-y-axis">
            <span>1000</span>
            <span>750</span>
            <span>500</span>
            <span>250</span>
            <span>0</span>
          </div>

          <div class="chart-area">
            <!-- Grid -->
            <div class="chart-grid-line line-1"></div>
            <div class="chart-grid-line line-2"></div>
            <div class="chart-grid-line line-3"></div>
            <div class="chart-grid-line line-4"></div>
            <div class="chart-grid-line line-5"></div>

            <!-- Decorative static enrollment chart -->
            <svg viewBox="0 0 700 250" preserveAspectRatio="none" class="enrollment-svg">
              <defs>
                <linearGradient id="studentGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stop-opacity="0.28" />

                  <stop offset="100%" stop-opacity="0" />
                </linearGradient>
              </defs>

              <path
                class="chart-area-fill"
                d="
                  M0,190
                  C70,170 100,180 140,145
                  C190,105 220,135 270,120
                  C320,105 350,80 400,95
                  C450,110 470,65 520,75
                  C575,85 600,45 650,55
                  C680,60 690,45 700,40
                  L700,250
                  L0,250
                  Z
                "
              />

              <path
                class="chart-line"
                d="
                  M0,190
                  C70,170 100,180 140,145
                  C190,105 220,135 270,120
                  C320,105 350,80 400,95
                  C450,110 470,65 520,75
                  C575,85 600,45 650,55
                  C680,60 690,45 700,40
                "
              />

              <!-- Points -->
              <circle cx="140" cy="145" r="5" />
              <circle cx="270" cy="120" r="5" />
              <circle cx="400" cy="95" r="5" />
              <circle cx="520" cy="75" r="5" />
              <circle cx="650" cy="55" r="5" />
            </svg>

            <div class="chart-months">
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
              <span>Jul</span>
              <span>Aug</span>
              <span>Sep</span>
              <span>Oct</span>
              <span>Nov</span>
              <span>Dec</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ================= UPCOMING HOLIDAYS ================= -->
      <div class="dashboard-card holidays-card">
        <div class="card-header">
          <div>
            <h5>Upcoming Holidays</h5>

            <p>Upcoming holidays</p>
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
        </div>
      </div>
    </div>

    <!-- ================= BOTTOM GRID ================= -->
    <div class="bottom-dashboard-grid">
      <!-- ================= NOTIFICATIONS ================= -->
      <div class="dashboard-card notifications-card">
        <div class="card-header">
          <div>
            <h5>Recent Notifications</h5>

            <p>Latest updates</p>
          </div>

          <div class="header-icon notification-icon">
            <i class="fa-solid fa-bell"></i>
          </div>
        </div>

        <div class="notification-list">
          <div
            v-for="(notification, index) in notifications"
            :key="index"
            class="notification-item"
          >
            <div class="notification-dot" :class="notification.type"></div>

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
        </div>
      </div>

      <!-- ================= CURRENT ATTENDANCE ================= -->
      <div class="dashboard-card attendance-summary-card">
        <div class="card-header">
          <div>
            <h5>Current Attendance Summary</h5>

            <p>Today's attendance overview</p>
          </div>

          <div class="header-icon attendance-icon">
            <i class="fa-solid fa-calendar-check"></i>
          </div>
        </div>

        <div class="attendance-columns">
          <!-- Teachers -->
          <div class="attendance-column teacher-attendance">
            <div class="attendance-column-icon">
              <i class="fa-solid fa-chalkboard-user"></i>
            </div>

            <div class="attendance-column-title">Teachers</div>

            <div class="attendance-number">92%</div>

            <div class="attendance-progress">
              <div class="attendance-progress-fill teacher-progress" style="width: 92%"></div>
            </div>

            <div class="attendance-status">Present today</div>
          </div>

          <!-- Staff -->
          <div class="attendance-column staff-attendance">
            <div class="attendance-column-icon">
              <i class="fa-solid fa-users"></i>
            </div>

            <div class="attendance-column-title">Staff</div>

            <div class="attendance-number">88%</div>

            <div class="attendance-progress">
              <div class="attendance-progress-fill staff-progress" style="width: 88%"></div>
            </div>

            <div class="attendance-status">Present today</div>
          </div>
        </div>
      </div>

      <!-- ================= MONTHLY ATTENDANCE ================= -->
      <div class="dashboard-card monthly-attendance-card">
        <div class="card-header">
          <div>
            <h5>Monthly Attendance</h5>

            <p>Current attendance summary</p>
          </div>

          <div class="header-icon monthly-icon">
            <i class="fa-solid fa-chart-pie"></i>
          </div>
        </div>

        <div class="monthly-attendance-content">
          <div class="attendance-pie">
            <div class="pie-inner">
              <strong>91%</strong>
              <span>Present</span>
            </div>
          </div>

          <div class="attendance-legend">
            <div class="legend-item">
              <span class="legend-dot present-dot"></span>

              <div>
                <strong>Present</strong>
                <span>91%</span>
              </div>
            </div>

            <div class="legend-item">
              <span class="legend-dot absent-dot"></span>

              <div>
                <strong>Absent</strong>
                <span>6%</span>
              </div>
            </div>

            <div class="legend-item">
              <span class="legend-dot leave-dot"></span>

              <div>
                <strong>Leave</strong>
                <span>3%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'
import dashPageView from './dashPageView.vue'

/* =========================
   DYNAMIC DATA
========================= */

const totalStudents = ref(0)
const totalTeachers = ref(0)
const totalShifts = ref(0)

const currentUser = ref({
  name: '',
  role: '',
  designation: '',
  image: '',
})

/* =========================
   STATIC DASHBOARD DATA
   (Until backend APIs are ready)
========================= */

const selectedYear = ref('2026')
const selectedGrade = ref('All Grades')

const upcomingHolidays = ref([
  {
    day: '01',
    month: 'JAN',
    title: 'New Year Holiday',
    description: 'Institute closed',
  },
  {
    day: '21',
    month: 'FEB',
    title: 'International Mother Language Day',
    description: 'Public holiday',
  },
  {
    day: '26',
    month: 'MAR',
    title: 'Independence Day',
    description: 'Public holiday',
  },
  {
    day: '14',
    month: 'APR',
    title: 'Pohela Boishakh',
    description: 'Institute holiday',
  },
])

const notifications = ref([
  {
    title: 'Examination Schedule',
    text: 'Upcoming examination schedule should be reviewed.',
    time: 'Today',
    type: 'blue',
  },
  {
    title: 'Student Records',
    text: 'Student information is ready for review.',
    time: 'Yesterday',
    type: 'green',
  },
  {
    title: 'Staff Update',
    text: 'Staff information has been updated.',
    time: '2 days ago',
    type: 'orange',
  },
])

/* =========================
   GET DASHBOARD DATA
========================= */

const getDashboardData = async () => {
  try {
    /* -------------------------
       Local User
    ------------------------- */

    const storedUser = localStorage.getItem('user')

    if (storedUser) {
      const parsedUser = JSON.parse(storedUser)

      currentUser.value = {
        ...currentUser.value,
        ...parsedUser,
      }
    }

    /* -------------------------
       Dashboard API
    ------------------------- */

    const response = await api.get('/staff/dashboard')

    totalStudents.value = response.data.total_students || 0

    totalTeachers.value = response.data.total_teachers || 0

    /* -------------------------
       Current User
    ------------------------- */

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

/* =========================
   GET SHIFTS
========================= */

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

/* =========================
   HELPERS
========================= */

const getInitials = (name) => {
  if (!name) return '?'

  const parts = name.trim().split(' ').filter(Boolean)

  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase()
  }

  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

const getStaffImage = (image) => {
  if (!image) return ''

  if (image.startsWith('http://') || image.startsWith('https://')) {
    return image
  }

  return `${window.location.origin}/storage/${image}`
}

/* =========================
   LOAD
========================= */

onMounted(async () => {
  await Promise.all([getDashboardData(), getShiftCount()])
})
</script>

<style scoped>
/* =====================================================
   MAIN LAYOUT
===================================================== */

.dashboard-layout {
  margin-left: 250px;

  min-height: 100vh;

  background: #f6f8fc;

  padding: 24px 28px 40px;

  color: #1f2937;
}

/* =====================================================
   TOPBAR
===================================================== */

.dashboard-topbar {
  background: #ffffff;

  border-radius: 18px;

  padding: 18px 22px;

  display: flex;

  align-items: center;

  justify-content: space-between;

  margin-bottom: 22px;

  box-shadow: 0 4px 18px rgba(15, 23, 42, 0.05);
}

.welcome-text {
  font-size: 22px;

  font-weight: 700;

  color: #172033;
}

.welcome-subtitle {
  margin-top: 4px;

  font-size: 13px;

  color: #8992a3;
}

.topbar-profile {
  display: flex;

  align-items: center;

  gap: 12px;
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
  font-size: 12px;

  color: #8b95a7;

  margin-top: 2px;
}

.profile-image-wrapper {
  width: 45px;

  height: 45px;

  border-radius: 50%;

  overflow: hidden;
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

  background: #2563eb;

  color: white;

  font-weight: 700;
}

.profile-arrow {
  color: #8b95a7;

  font-size: 11px;
}

/* =====================================================
   STAT CARDS
===================================================== */

.stats-grid {
  display: grid;

  grid-template-columns: repeat(3, minmax(0, 1fr));

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

  box-shadow: 0 5px 20px rgba(15, 23, 42, 0.06);
}

.student-card {
  background: linear-gradient(135deg, #2563eb, #3b82f6);

  color: #ffffff;
}

.teacher-card {
  background: linear-gradient(135deg, #059669, #10b981);

  color: #ffffff;
}

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
  width: 50px;

  height: 50px;

  border-radius: 14px;

  background: rgba(255, 255, 255, 0.18);

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
}

.stat-description {
  font-size: 11px;

  opacity: 0.78;

  margin-top: 4px;
}

.stat-card-decoration {
  position: absolute;

  right: -15px;

  bottom: -20px;

  font-size: 100px;

  opacity: 0.08;
}

/* =====================================================
   COMMON CARD
===================================================== */

.dashboard-card {
  background: #ffffff;

  border-radius: 18px;

  padding: 22px;

  box-shadow: 0 4px 18px rgba(15, 23, 42, 0.05);
}

.card-header {
  display: flex;

  align-items: flex-start;

  justify-content: space-between;

  margin-bottom: 18px;
}

.card-header h5 {
  margin: 0;

  font-size: 16px;

  font-weight: 700;

  color: #172033;
}

.card-header p {
  margin: 5px 0 0;

  font-size: 12px;

  color: #929aaa;
}

.header-icon {
  width: 40px;

  height: 40px;

  border-radius: 11px;

  display: flex;

  align-items: center;

  justify-content: center;
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

/* =====================================================
   STUDENT OVERVIEW
===================================================== */

.student-overview-card {
  min-height: 390px;
}

.overview-filter {
  display: flex;

  gap: 8px;
}

.overview-filter select {
  border: 1px solid #e5e9f0;

  background: #f9fafc;

  border-radius: 8px;

  padding: 7px 10px;

  font-size: 12px;

  color: #667085;

  outline: none;
}

.student-summary {
  display: flex;

  align-items: center;

  justify-content: space-between;

  background: #f8faff;

  border-radius: 12px;

  padding: 12px 15px;

  margin-bottom: 15px;
}

.summary-label {
  display: block;

  font-size: 11px;

  color: #8b95a7;

  margin-bottom: 3px;
}

.student-summary strong {
  font-size: 21px;

  color: #2563eb;
}

.summary-growth {
  display: flex;

  align-items: center;

  gap: 7px;

  font-size: 11px;

  color: #64748b;
}

.summary-growth i {
  color: #10b981;
}

/* =====================================================
   ENROLLMENT CHART
===================================================== */

.enrollment-chart {
  display: flex;

  height: 245px;
}

.chart-y-axis {
  width: 42px;

  display: flex;

  flex-direction: column;

  justify-content: space-between;

  padding-bottom: 25px;

  color: #a0a8b6;

  font-size: 10px;
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

.line-1 {
  top: 0;
}

.line-2 {
  top: 25%;
}

.line-3 {
  top: 50%;
}

.line-4 {
  top: 75%;
}

.line-5 {
  top: calc(100% - 25px);
}

.enrollment-svg {
  position: absolute;

  left: 0;

  top: 0;

  width: 100%;

  height: calc(100% - 25px);

  overflow: visible;
}

.chart-line {
  fill: none;

  stroke: #2563eb;

  stroke-width: 3;

  vector-effect: non-scaling-stroke;
}

.chart-area-fill {
  fill: url(#studentGradient);
}

.enrollment-svg circle {
  fill: #ffffff;

  stroke: #2563eb;

  stroke-width: 3;
}

.chart-months {
  position: absolute;

  bottom: 0;

  left: 0;

  right: 0;

  display: flex;

  justify-content: space-between;

  color: #a0a8b6;

  font-size: 10px;
}

/* =====================================================
   HOLIDAYS
===================================================== */

.holidays-card {
  min-height: 390px;
}

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

  border-radius: 10px;

  background: #fff7ed;

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
}

.holiday-info span {
  display: block;

  font-size: 10px;

  color: #9aa2b1;

  margin-top: 3px;
}

.holiday-arrow {
  color: #b5bdc9;

  font-size: 10px;
}

/* =====================================================
   BOTTOM GRID
===================================================== */

.bottom-dashboard-grid {
  display: grid;

  grid-template-columns:
    1.1fr
    1fr
    1fr;

  gap: 20px;
}

/* =====================================================
   NOTIFICATIONS
===================================================== */

.notifications-card,
.attendance-summary-card,
.monthly-attendance-card {
  min-height: 280px;
}

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
  width: 9px;

  height: 9px;

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
}

.teacher-attendance {
  background: #eff6ff;
}

.staff-attendance {
  background: #ecfdf5;
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
    #2563eb 0deg 327.6deg,
    #f59e0b 327.6deg 349.2deg,
    #e5e7eb 349.2deg 360deg
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
  background: #2563eb;
}

.absent-dot {
  background: #f59e0b;
}

.leave-dot {
  background: #d1d5db;
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
   RESPONSIVE
===================================================== */

@media (max-width: 1200px) {
  .main-dashboard-grid {
    grid-template-columns: 1fr;
  }

  .bottom-dashboard-grid {
    grid-template-columns: 1fr 1fr;
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
}

@media (max-width: 600px) {
  .dashboard-layout {
    padding: 12px;
  }

  .dashboard-topbar {
    padding: 15px;
  }

  .welcome-text {
    font-size: 17px;
  }

  .welcome-subtitle {
    display: none;
  }

  .profile-info {
    display: none;
  }

  .main-dashboard-grid {
    gap: 14px;
  }

  .bottom-dashboard-grid {
    gap: 14px;
  }

  .dashboard-card {
    padding: 16px;

    border-radius: 15px;
  }

  .card-header {
    flex-wrap: wrap;

    gap: 10px;
  }

  .overview-filter {
    width: 100%;
  }

  .overview-filter select {
    flex: 1;
  }

  .monthly-attendance-content {
    gap: 15px;
  }
}
</style>
