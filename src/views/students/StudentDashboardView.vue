<template>
  <div class="dashboard-container">
    <StudentsDashboardMenueView />

    <main class="main-wrapper">
      <header class="topbar">
        <h3>Student Dashboard</h3>

        <div class="top-actions">
          <label class="search">
            <i class="bi bi-search"></i>
            <input v-model="searchText" placeholder="Search results..." />
          </label>

          <button class="bell" title="Notifications">
            <i class="bi bi-bell"></i>
            <span>3</span>
          </button>

          <div class="user-chip">
            <img v-if="student.image_url" :src="student.image_url" alt="Student" />
            <span v-else class="avatar">
              <i class="bi bi-person"></i>
            </span>

            <div>
              <b>{{ student.full_name || 'Student' }}</b>
              <small>{{ student.student_id || 'Student ID unavailable' }}</small>
            </div>
          </div>
        </div>
      </header>

      <div class="content">
        <div v-if="loading" class="alert alert-info">
          <span class="spinner-border spinner-border-sm me-2"></span>
          Loading your dashboard...
        </div>

        <div
          v-if="pageError"
          class="alert alert-warning d-flex justify-content-between align-items-center"
        >
          {{ pageError }}
          <button class="btn btn-sm btn-outline-primary" @click="loadDashboard">Retry</button>
        </div>

        <section class="welcome">
          <div>
            <h1>Good {{ greeting }}, {{ firstName }}!</h1>
            <p>Welcome to your student dashboard. Here's your academic overview.</p>
          </div>

          <div class="badges">
            <span>
              <i class="bi bi-mortarboard"></i>
              Academic Session: <b>{{ sessionName }}</b>
            </span>
            <span>
              <i class="bi bi-people"></i>
              Class: <b>{{ className }}</b>
            </span>
            <span>
              <i class="bi bi-person"></i>
              Section: <b>{{ sectionName }}</b>
            </span>
            <span>
              <i class="bi bi-clock"></i>
              Shift: <b>{{ shiftName }}</b>
            </span>
          </div>
        </section>

        <!-- SUMMARY CARDS -->
        <section class="summary-grid">
          <article class="profile-card">
            <div class="profile-head">
              <img v-if="student.image_url" :src="student.image_url" alt="Student" />

              <span v-else class="profile-avatar">
                <i class="bi bi-person"></i>
              </span>

              <div>
                <h2>{{ student.full_name || 'Student' }}</h2>
                <small>Student ID: {{ student.student_id || '—' }}</small>
              </div>
            </div>

            <div class="line">
              <span>Group:</span>
              <b>{{ groupName }}</b>
            </div>

            <div class="line">
              <span>Branch:</span>
              <b>{{ branchName }}</b>
            </div>

            <div class="line">
              <span>Student Status:</span>
              <b class="status">{{ student.status || '—' }}</b>
            </div>

            <button class="primary full" @click="showProfile = !showProfile">
              {{ showProfile ? 'Hide Profile Details' : 'View Full Profile' }}
            </button>
          </article>

          <article class="blue-card">
            <h3>Attendance</h3>

            <div class="gauge">
              <svg viewBox="0 0 150 90">
                <path d="M 18 75 A 57 57 0 0 1 132 75" class="track" />
                <path
                  d="M 18 75 A 57 57 0 0 1 132 75"
                  class="gauge-line"
                  :style="{
                    strokeDasharray: `${Math.min(100, attendancePercentage) * 1.79} 180`,
                  }"
                />
              </svg>

              <strong>{{ attendancePercentage }}%</strong>
              <small>(This Month)</small>
            </div>

            <div class="mini-summary">
              <span>Present</span>
              <b>{{ attendanceSummary.present || 0 }}</b>
              <span>Absent</span>
              <b>{{ attendanceSummary.absent || 0 }}</b>
            </div>

            <button class="light" @click="showAttendance = !showAttendance">
              {{ showAttendance ? 'Hide Attendance' : 'View Attendance' }}
            </button>
          </article>

          <article class="blue-card">
            <h3>Latest Examination Result</h3>

            <div class="big">
              {{ latestResult?.exam_type || '—' }}
            </div>

            <p>{{ latestResult?.exam_year || 'No result available' }}</p>

            <div class="bottom-metric">
              <span>Subjects recorded</span>
              <b>{{ latestResult?.result_subjects?.length || 0 }}</b>
            </div>

            <button class="light" @click="showResults = !showResults">
              {{ showResults ? 'Hide Results' : 'View Result' }}
            </button>
          </article>

          <article class="blue-card">
            <h3>Outstanding Fees</h3>

            <div class="big">{{ money(paymentSummary.total_due) }}</div>

            <p>Recorded outstanding amount</p>

            <div class="bottom-metric">
              <span>Total Paid</span>
              <b>{{ money(paymentSummary.total_paid) }}</b>
            </div>

            <button class="light" @click="showPayments = !showPayments">
              {{ showPayments ? 'Hide History' : 'View Payment History' }}
            </button>
          </article>

          <article class="blue-card">
            <h3>Upcoming Examination</h3>

            <div class="big">{{ sampleExams[0].subject }}</div>

            <p>{{ sampleExams[0].date }}</p>

            <small class="static-note">
              Sample schedule — examination schedule API not connected.
            </small>
          </article>
        </section>

        <!-- PROFILE DETAILS -->
        <section v-if="showProfile" class="panel profile-details">
          <h2>My Profile</h2>

          <div class="profile-grid">
            <div v-for="item in profileItems" :key="item.label" class="detail">
              <span>{{ item.label }}</span>
              <b>{{ item.value || '—' }}</b>
            </div>
          </div>
        </section>

        <!-- ATTENDANCE RECORDS -->
        <section v-if="showAttendance" class="panel">
          <div class="panel-title">
            <h2>My Attendance</h2>
            <span>Current month</span>
          </div>

          <div v-if="attendanceError" class="alert alert-warning">
            {{ attendanceError }}
          </div>

          <div class="table-responsive">
            <table class="table align-middle">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Class</th>
                  <th>Status</th>
                  <th>Remarks</th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="(record, index) in attendanceRecords" :key="record.id || index">
                  <td>{{ formatDate(record.date) }}</td>
                  <td>
                    {{ record.student_session?.class_info?.name || className }}
                  </td>
                  <td>
                    <span class="badge" :class="statusClass(record.status)">
                      {{ record.status || '—' }}
                    </span>
                  </td>
                  <td>{{ record.remarks || '—' }}</td>
                </tr>

                <tr v-if="!attendanceRecords.length">
                  <td colspan="4" class="empty">No attendance records found for this month.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- EXAMINATION RESULTS -->
        <section v-if="showResults" class="panel">
          <div class="panel-title">
            <h2>My Examination Results</h2>
            <span>{{ filteredResults.length }} result(s)</span>
          </div>

          <div v-if="resultsError" class="alert alert-warning">
            {{ resultsError }}
          </div>

          <div v-for="result in filteredResults" :key="result.id" class="result-block">
            <h3>
              {{ result.exam_type || 'Examination' }}
              <small>({{ result.exam_year || '—' }})</small>
            </h3>

            <div class="table-responsive">
              <table class="table align-middle">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Marks</th>
                  </tr>
                </thead>

                <tbody>
                  <tr v-for="(item, index) in result.result_subjects || []" :key="item.id || index">
                    <td>{{ subjectName(item, index) }}</td>
                    <td class="fw-bold">{{ item.marks ?? '—' }}</td>
                  </tr>

                  <tr v-if="!result.result_subjects?.length">
                    <td colspan="2" class="empty">No subject marks available.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <p v-if="!filteredResults.length" class="empty">
            No examination results are available yet.
          </p>
        </section>

        <!-- ATTENDANCE OVERVIEW + RECENT RESULTS -->
        <section class="middle-grid">
          <article class="panel">
            <div class="panel-title">
              <h2>Attendance Overview</h2>
              <span>Current month</span>
            </div>

            <div class="attendance-overview">
              <div class="chart-wrap">
                <div class="chart-heading">
                  <div>
                    <strong>{{ currentMonthName }}</strong>
                    <small>Daily attendance activity</small>
                  </div>
                  <span class="chart-badge"> {{ chartDays }} days </span>
                </div>

                <div class="chart-canvas">
                  <div class="y-labels">
                    <span>Recorded</span>
                    <span>—</span>
                    <span>None</span>
                  </div>

                  <svg
                    class="attendance-chart"
                    :viewBox="`0 0 ${chartWidth} 180`"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient id="presentGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#16a36a" stop-opacity=".22" />
                        <stop offset="100%" stop-color="#16a36a" stop-opacity="0" />
                      </linearGradient>

                      <linearGradient id="absentGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#ef4444" stop-opacity=".15" />
                        <stop offset="100%" stop-color="#ef4444" stop-opacity="0" />
                      </linearGradient>
                    </defs>

                    <line
                      v-for="y in [15, 52, 89, 126, 163]"
                      :key="y"
                      x1="0"
                      :y1="y"
                      :x2="chartWidth"
                      :y2="y"
                      class="grid-line"
                    />

                    <path v-if="presentArea" :d="presentArea" fill="url(#presentGradient)" />

                    <path v-if="absentArea" :d="absentArea" fill="url(#absentGradient)" />

                    <path :d="presentPath" class="chart-line present-line" />
                    <path :d="absentPath" class="chart-line absent-line" />
                    <path :d="latePath" class="chart-line late-line" />
                    <path :d="leavePath" class="chart-line leave-line" />

                    <circle
                      v-for="point in presentPoints"
                      :key="`p-${point.day}`"
                      :cx="point.x"
                      :cy="point.y"
                      r="3"
                      class="chart-dot present-dot"
                    />
                    <circle
                      v-for="point in absentPoints"
                      :key="`a-${point.day}`"
                      :cx="point.x"
                      :cy="point.y"
                      r="3"
                      class="chart-dot absent-dot"
                    />
                    <circle
                      v-for="point in latePoints"
                      :key="`l-${point.day}`"
                      :cx="point.x"
                      :cy="point.y"
                      r="3"
                      class="chart-dot late-dot"
                    />
                    <circle
                      v-for="point in leavePoints"
                      :key="`v-${point.day}`"
                      :cx="point.x"
                      :cy="point.y"
                      r="3"
                      class="chart-dot leave-dot"
                    />
                  </svg>
                </div>

                <div class="day-labels">
                  <span v-for="day in chartDayLabels" :key="day">
                    {{ day }}
                  </span>
                </div>
              </div>

              <div class="legend">
                <div class="legend-item">
                  <i class="legend-dot green"></i>
                  <div class="legend-content">
                    <div class="legend-info">
                      <span>Present</span>
                      <b>{{ attendanceSummary.present || 0 }}</b>
                    </div>
                    <div class="legend-progress">
                      <div
                        class="legend-progress-fill green"
                        :style="{
                          width: attendanceStatusPercentage(attendanceSummary.present) + '%',
                        }"
                      ></div>
                    </div>
                    <small
                      >{{
                        attendanceStatusPercentage(attendanceSummary.present).toFixed(2)
                      }}%</small
                    >
                  </div>
                </div>

                <div class="legend-item">
                  <i class="legend-dot red"></i>
                  <div class="legend-content">
                    <div class="legend-info">
                      <span>Absent</span>
                      <b>{{ attendanceSummary.absent || 0 }}</b>
                    </div>
                    <div class="legend-progress">
                      <div
                        class="legend-progress-fill red"
                        :style="{
                          width: attendanceStatusPercentage(attendanceSummary.absent) + '%',
                        }"
                      ></div>
                    </div>
                    <small
                      >{{ attendanceStatusPercentage(attendanceSummary.absent).toFixed(2) }}%</small
                    >
                  </div>
                </div>

                <div class="legend-item">
                  <i class="legend-dot orange"></i>
                  <div class="legend-content">
                    <div class="legend-info">
                      <span>Late</span>
                      <b>{{ attendanceSummary.late || 0 }}</b>
                    </div>
                    <div class="legend-progress">
                      <div
                        class="legend-progress-fill orange"
                        :style="{ width: attendanceStatusPercentage(attendanceSummary.late) + '%' }"
                      ></div>
                    </div>
                    <small
                      >{{ attendanceStatusPercentage(attendanceSummary.late).toFixed(2) }}%</small
                    >
                  </div>
                </div>

                <div class="legend-item">
                  <i class="legend-dot purple"></i>
                  <div class="legend-content">
                    <div class="legend-info">
                      <span>Leave</span>
                      <b>{{ attendanceSummary.leave || 0 }}</b>
                    </div>
                    <div class="legend-progress">
                      <div
                        class="legend-progress-fill purple"
                        :style="{
                          width: attendanceStatusPercentage(attendanceSummary.leave) + '%',
                        }"
                      ></div>
                    </div>
                    <small
                      >{{ attendanceStatusPercentage(attendanceSummary.leave).toFixed(2) }}%</small
                    >
                  </div>
                </div>
              </div>
            </div>
          </article>

          <article class="panel">
            <div class="panel-title">
              <h2>Recent Examination Results</h2>

              <button class="text-link" @click="showResults = !showResults">View all</button>
            </div>

            <div class="table-responsive">
              <table class="table align-middle compact">
                <thead>
                  <tr>
                    <th>Examination</th>
                    <th>Year</th>
                    <th>Subjects</th>
                  </tr>
                </thead>

                <tbody>
                  <tr v-for="result in filteredResults.slice(0, 5)" :key="result.id">
                    <td>{{ result.exam_type || 'Examination' }}</td>
                    <td>{{ result.exam_year || '—' }}</td>
                    <td>{{ result.result_subjects?.length || 0 }}</td>
                  </tr>

                  <tr v-if="!filteredResults.length">
                    <td colspan="3" class="empty">No results available.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </article>
        </section>

        <!-- LOWER DASHBOARD CARDS -->
        <section class="bottom-grid">
          <article class="panel">
            <div class="panel-title">
              <h2>Notice Board</h2>
              <span class="sample-tag">Sample</span>
            </div>

            <div v-for="notice in sampleNotices" :key="notice.title" class="list-item">
              <span class="tile-icon">
                <i class="bi bi-calendar-event"></i>
              </span>

              <div>
                <b>{{ notice.title }}</b>
                <small>{{ notice.date }}</small>
              </div>
            </div>

            <p class="static-note">Sample notices. Live notices need an API.</p>
          </article>

          <article class="panel">
            <div class="panel-title">
              <h2>Upcoming Class Schedule</h2>
              <span class="sample-tag">Sample</span>
            </div>

            <div class="routine">
              <div></div>

              <b v-for="day in routineDays" :key="day">
                {{ day }}
              </b>

              <template v-for="(day, row) in routineRows" :key="day">
                <strong>{{ day }}</strong>

                <span v-for="col in 5" :key="col" :class="{ active: (row + col) % 4 === 0 }"></span>
              </template>
            </div>

            <p class="static-note">Illustrative routine only; no routine API connected.</p>
          </article>

          <article class="panel">
            <div class="panel-title">
              <h2>Upcoming Examinations</h2>
              <span class="sample-tag">Sample</span>
            </div>

            <div v-for="exam in sampleExams" :key="exam.subject" class="list-item">
              <span class="tile-icon">
                <i class="bi bi-journal-text"></i>
              </span>

              <div class="list-grow">
                <b>{{ exam.subject }}</b>
                <small>{{ exam.date }} · {{ exam.time }}</small>
              </div>

              <span class="days">{{ exam.left }}</span>
            </div>

            <p class="static-note">Sample schedule, not database data.</p>
          </article>

          <article class="panel">
            <div class="panel-title">
              <h2>Payment Summary</h2>
            </div>

            <div class="payment-stats">
              <div>
                <span>Total Fees</span>
                <b>{{ money(paymentSummary.total_amount) }}</b>
              </div>

              <div>
                <span>Total Paid</span>
                <b class="text-success">{{ money(paymentSummary.total_paid) }}</b>
              </div>

              <div>
                <span>Outstanding</span>
                <b class="text-danger">{{ money(paymentSummary.total_due) }}</b>
              </div>
            </div>

            <hr />

            <h3 class="subheading">Recent Payment History</h3>

            <div v-for="payment in payments.slice(0, 3)" :key="payment.id" class="list-item">
              <span class="tile-icon">
                <i class="bi bi-credit-card"></i>
              </span>

              <div class="list-grow">
                <b>{{ payment.month || payment.due_month || 'Payment' }}</b>
                <small>{{ formatDate(payment.payment_date) }}</small>
              </div>

              <strong>{{ money(payment.paid_amount) }}</strong>
            </div>

            <p v-if="!payments.length" class="empty">No payment records available.</p>

            <button class="primary full mt-3" @click="showPayments = !showPayments">
              {{ showPayments ? 'Hide Payment History' : 'View Payment History' }}
            </button>
          </article>
        </section>

        <!-- PAYMENT HISTORY -->
        <section v-if="showPayments" class="panel payment-history">
          <div class="panel-title">
            <h2>My Payment History</h2>
            <span>{{ payments.length }} record(s)</span>
          </div>

          <div v-if="paymentsError" class="alert alert-warning">
            {{ paymentsError }}
          </div>

          <div class="payment-stats wide">
            <div>
              <span>Total Fees Recorded</span>
              <b>{{ money(paymentSummary.total_amount) }}</b>
            </div>

            <div>
              <span>Total Paid</span>
              <b class="text-success">{{ money(paymentSummary.total_paid) }}</b>
            </div>

            <div>
              <span>Total Due</span>
              <b class="text-danger">{{ money(paymentSummary.total_due) }}</b>
            </div>
          </div>

          <div class="table-responsive mt-3">
            <table class="table align-middle">
              <thead>
                <tr>
                  <th>Payment Date</th>
                  <th>Month</th>
                  <th>Amount</th>
                  <th>Paid</th>
                  <th>Due</th>
                  <th>Method</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="payment in payments" :key="payment.id">
                  <td>{{ formatDate(payment.payment_date) }}</td>
                  <td>{{ payment.month || payment.due_month || '—' }}</td>
                  <td>{{ money(payment.amount) }}</td>
                  <td class="text-success">{{ money(payment.paid_amount) }}</td>
                  <td class="text-danger">{{ money(payment.due_amount) }}</td>
                  <td>{{ payment.payment_method || '—' }}</td>
                  <td>{{ payment.status || '—' }}</td>
                </tr>

                <tr v-if="!payments.length">
                  <td colspan="7" class="empty">No payment records found.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'
import StudentsDashboardMenueView from './StudentsDashboardMenueView.vue'

const student = ref({})
const sessions = ref([])
const results = ref([])
const attendanceRecords = ref([])

const attendanceSummary = ref({
  total: 0,
  present: 0,
  absent: 0,
  late: 0,
  leave: 0,
})

const attendanceStatusTotal = computed(() => {
  const summary = attendanceSummary.value

  return (
    Number(summary.present || 0) +
    Number(summary.absent || 0) +
    Number(summary.late || 0) +
    Number(summary.leave || 0)
  )
})

function attendanceStatusPercentage(value) {
  const total = attendanceStatusTotal.value

  return total > 0 ? (Number(value || 0) / total) * 100 : 0
}

const payments = ref([])

const paymentSummary = ref({
  total_payments: 0,
  total_amount: 0,
  total_paid: 0,
  total_due: 0,
})

const loading = ref(false)
const pageError = ref('')
const attendanceError = ref('')
const resultsError = ref('')
const paymentsError = ref('')
const searchText = ref('')

const showProfile = ref(false)
const showAttendance = ref(false)
const showResults = ref(false)
const showPayments = ref(false)

// Sample data: এখনো database/API থেকে আসছে না।
const sampleNotices = [
  {
    title: 'Half-Yearly Examination Routine Published',
    date: 'Sample notice',
  },
  {
    title: 'Please check your examination schedule',
    date: 'Sample notice',
  },
  {
    title: 'Monthly fee payment reminder',
    date: 'Sample notice',
  },
]

const sampleExams = [
  {
    subject: 'English',
    date: '28 October 2026',
    time: '1:00pm',
    left: 'Sample',
  },
  {
    subject: 'Bangla',
    date: '30 October 2026',
    time: '1:00pm',
    left: 'Sample',
  },
  {
    subject: 'Mathematics',
    date: '02 November 2026',
    time: '1:00pm',
    left: 'Sample',
  },
]

const routineDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
const routineRows = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri']

// Current academic session
const currentSession = computed(() => {
  return sessions.value.find((session) => session.status === 'active') || sessions.value[0] || {}
})

// Student's first name
const firstName = computed(() => {
  return String(student.value.full_name || 'Student')
    .trim()
    .split(/\s+/)[0]
})

// Greeting based on local time
const greeting = computed(() => {
  const hour = new Date().getHours()

  if (hour < 12) return 'Morning'
  if (hour < 17) return 'Afternoon'

  return 'Evening'
})

// Academic session
const sessionName = computed(() => {
  const session = currentSession.value

  return (
    session.academicSession?.name ||
    session.academicSession?.session_name ||
    session.academicSession?.year ||
    session.academic_session?.name ||
    session.academic_session?.session_name ||
    session.academic_session?.year ||
    session.academic_session_id ||
    '—'
  )
})

// Class
const className = computed(() => {
  const session = currentSession.value

  return (
    session.class_info?.name ||
    session.class_info?.class_name ||
    session.classInfo?.name ||
    session.classInfo?.class_name ||
    session.class?.name ||
    session.class?.class_name ||
    student.value.class_info?.name ||
    student.value.classInfo?.name ||
    student.value.class?.name ||
    '—'
  )
})

// Section
const sectionName = computed(() => {
  const session = currentSession.value

  return (
    session.section?.name ||
    session.section?.section_name ||
    student.value.section?.name ||
    student.value.section?.section_name ||
    '—'
  )
})

// Shift
const shiftName = computed(() => {
  const session = currentSession.value

  return (
    session.shift?.name ||
    session.shift?.shift_name ||
    student.value.shift?.name ||
    student.value.shift?.shift_name ||
    '—'
  )
})

// Group
const groupName = computed(() => {
  const session = currentSession.value

  return (
    session.class_group?.name ||
    session.class_group?.group_name ||
    session.classGroup?.name ||
    session.classGroup?.group_name ||
    student.value.class_group?.name ||
    student.value.class_group?.group_name ||
    student.value.classGroup?.name ||
    student.value.classGroup?.group_name ||
    '—'
  )
})

// Branch
const branchName = computed(() => {
  const session = currentSession.value

  return (
    session.branch?.name ||
    session.branch?.branch_name ||
    student.value.branch?.name ||
    student.value.branch?.branch_name ||
    '—'
  )
})

// Monthly attendance percentage
const attendancePercentage = computed(() => {
  const total = Number(attendanceSummary.value.total || 0)
  const present = Number(attendanceSummary.value.present || 0)

  return total > 0 ? Math.round((present / total) * 100) : 0
})

// Latest examination result
const latestResult = computed(() => {
  return results.value[0] || null
})

// Search examination name, year and subjects
const filteredResults = computed(() => {
  const search = searchText.value.trim().toLowerCase()

  if (!search) {
    return results.value
  }

  return results.value.filter((result) => {
    const examText = `${result.exam_type || ''} ${result.exam_year || ''}`.toLowerCase()

    const subjectMatches = (result.result_subjects || []).some((item, index) =>
      subjectName(item, index).toLowerCase().includes(search),
    )

    return examText.includes(search) || subjectMatches
  })
})

// Student profile details
const profileItems = computed(() => [
  {
    label: 'Full Name',
    value: student.value.full_name,
  },
  {
    label: 'Student ID',
    value: student.value.student_id,
  },
  {
    label: "Father's Name",
    value: student.value.fathers_name,
  },
  {
    label: "Mother's Name",
    value: student.value.mothers_name,
  },
  {
    label: 'Phone',
    value: student.value.phone,
  },
  {
    label: 'Email',
    value: student.value.email,
  },
  {
    label: 'Admission Date',
    value: formatDate(student.value.admission_date),
  },
  {
    label: 'Student Status',
    value: student.value.status,
  },
  {
    label: 'Class',
    value: className.value,
  },
  {
    label: 'Section',
    value: sectionName.value,
  },
  {
    label: 'Shift',
    value: shiftName.value,
  },
  {
    label: 'Group',
    value: groupName.value,
  },
])

// ============================================
// MONTHLY ATTENDANCE CHART
// ============================================

const chartWidth = 440
const chartTop = 15
const chartBottom = 163

const currentMonthName = computed(() => {
  return new Date().toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
})

// Number of days in the current month
const chartDays = computed(() => {
  const now = new Date()

  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
})

// X-axis labels: 1, 5, 10, 15 ... last day
const chartDayLabels = computed(() => {
  const days = chartDays.value
  const labels = []

  for (let day = 1; day <= days; day += 5) {
    labels.push(day)
  }

  if (labels[labels.length - 1] !== days) {
    labels.push(days)
  }

  return labels
})

// Map attendance status to each date in current month.
// Records outside the current month are ignored.
const dailyAttendance = computed(() => {
  const now = new Date()
  const map = new Map()

  for (let day = 1; day <= chartDays.value; day++) {
    const date = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(day).padStart(2, '0'),
    ].join('-')

    map.set(date, '')
  }

  attendanceRecords.value.forEach((record) => {
    const date = String(record.date || record.attendance_date || '').slice(0, 10)

    if (!map.has(date)) return

    map.set(
      date,
      String(record.status || '')
        .trim()
        .toLowerCase(),
    )
  })

  return map
})

// Return one chart point for each day.
// A status is plotted only on dates where it was recorded.
const getStatusPoints = (status) => {
  const now = new Date()
  const days = chartDays.value
  const points = []

  for (let day = 1; day <= days; day++) {
    const x = ((day - 1) / Math.max(days - 1, 1)) * chartWidth

    const date = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(day).padStart(2, '0'),
    ].join('-')

    const recordedStatus = dailyAttendance.value.get(date)
    const active = recordedStatus === status

    points.push({
      day,
      x,
      y: active ? chartTop : chartBottom,
      active,
    })
  }

  return points
}

// Smooth SVG line generator
const makeSmoothPath = (points) => {
  if (!points.length) return ''

  let path = `M ${points[0].x} ${points[0].y}`

  for (let i = 1; i < points.length; i++) {
    const previous = points[i - 1]
    const current = points[i]
    const middleX = (previous.x + current.x) / 2

    path +=
      ` C ${middleX} ${previous.y},` + ` ${middleX} ${current.y},` + ` ${current.x} ${current.y}`
  }

  return path
}

// Area below a status line
const makeAreaPath = (points) => {
  const activePoints = points.filter((point) => point.active)

  if (!activePoints.length) return ''

  const line = makeSmoothPath(activePoints)
  const first = activePoints[0]
  const last = activePoints[activePoints.length - 1]

  return `${line} L ${last.x} ${chartBottom}` + ` L ${first.x} ${chartBottom} Z`
}

// Individual status points
const presentPoints = computed(() => getStatusPoints('present'))
const absentPoints = computed(() => getStatusPoints('absent'))
const latePoints = computed(() => getStatusPoints('late'))
const leavePoints = computed(() => getStatusPoints('leave'))

// Individual status lines
const presentPath = computed(() => makeSmoothPath(presentPoints.value))
const absentPath = computed(() => makeSmoothPath(absentPoints.value))
const latePath = computed(() => makeSmoothPath(latePoints.value))
const leavePath = computed(() => makeSmoothPath(leavePoints.value))

// Gradient areas for the two main status lines
const presentArea = computed(() => makeAreaPath(presentPoints.value))
const absentArea = computed(() => makeAreaPath(absentPoints.value))

// ============================================
// FORMATTERS
// ============================================

// Currency formatter
function money(value) {
  const amount = Number(value || 0)

  return `৳${amount.toLocaleString('en-BD', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`
}

// Date formatter
function formatDate(value) {
  if (!value) return '—'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return String(value)
  }

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

// Subject name
function subjectName(item, index) {
  return String(
    item.subject?.name ||
      item.subject?.subject_name ||
      item.subject?.title ||
      `Subject ${index + 1}`,
  )
}

// Attendance badge color
function statusClass(status) {
  const value = String(status || '').toLowerCase()

  if (value === 'present') return 'bg-success'
  if (value === 'absent') return 'bg-danger'
  if (value === 'late') return 'bg-warning text-dark'
  if (value === 'leave') return 'bg-primary'

  return 'bg-secondary'
}

// ============================================
// API FUNCTIONS
// ============================================

// Current month's date range
function getCurrentMonthRange() {
  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)

  const format = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
  }

  return {
    date_from: format(firstDay),
    date_to: format(now),
  }
}

// Load logged-in student's profile
async function loadProfile() {
  const response = await api.get('/student/profile')
  const data = response.data || {}

  student.value = data.student || {}

  sessions.value = student.value.student_sessions || student.value.studentSessions || []
}

// Load examination results
async function loadResults() {
  try {
    const response = await api.get('/student/results')

    results.value = response.data?.results || []
  } catch (error) {
    resultsError.value = error.response?.data?.message || 'Could not load examination results.'

    throw error
  }
}

// Load current month's attendance records
async function loadAttendance() {
  try {
    const response = await api.get('/student/attendance', {
      params: getCurrentMonthRange(),
    })

    attendanceRecords.value = response.data?.attendances || []

    attendanceSummary.value = {
      ...attendanceSummary.value,
      ...response.data?.summary,
    }
  } catch (error) {
    attendanceError.value = error.response?.data?.message || 'Could not load attendance records.'

    throw error
  }
}

// Load payment history and summary
async function loadPayments() {
  try {
    const response = await api.get('/student/payments')

    payments.value = response.data?.payments || []

    paymentSummary.value = {
      ...paymentSummary.value,
      ...response.data?.summary,
    }
  } catch (error) {
    paymentsError.value = error.response?.data?.message || 'Could not load payment records.'

    throw error
  }
}

// Load all dashboard data
async function loadDashboard() {
  loading.value = true

  pageError.value = ''
  attendanceError.value = ''
  resultsError.value = ''
  paymentsError.value = ''

  try {
    const outcomes = await Promise.allSettled([
      loadProfile(),
      loadResults(),
      loadAttendance(),
      loadPayments(),
    ])

    if (outcomes.some((outcome) => outcome.status === 'rejected')) {
      pageError.value = 'Some dashboard information could not be loaded. Please retry.'
    }
  } finally {
    loading.value = false
  }
}

onMounted(loadDashboard)
</script>
<style scoped>
/* ==============================
   MAIN LAYOUT
============================== */
.dashboard-container {
  display: flex;
  width: 100%;
  min-height: 100vh;
  overflow-x: hidden;
  background: #f2f5fa;
  color: #101828;
}

.main-wrapper {
  flex: 1;
  min-width: 0;
  width: auto;
  margin-left: 0;
  padding: 24px;
  box-sizing: border-box;
  overflow-x: hidden;
}

/* ==============================
   TOP HEADER
============================== */
.topbar {
  min-height: 80px;
  background: #fff;
  border: 1px solid #e8edf4;
  border-radius: 14px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 22px;
}

.topbar h3 {
  font-size: 22px;
  font-weight: 750;
  margin: 0;
  white-space: nowrap;
}

.top-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.search {
  display: flex;
  align-items: center;
  gap: 9px;
  background: #f8fafc;
  border: 1px solid #dfe4ec;
  border-radius: 12px;
  padding: 0 13px;
  height: 42px;
  width: 250px;
  color: #788397;
  margin: 0;
}

.search input {
  border: 0;
  outline: 0;
  background: transparent;
  width: 100%;
  min-width: 0;
  font-size: 13px;
  color: #101828;
}

.bell {
  position: relative;
  border: 0;
  background: #fff;
  font-size: 20px;
  color: #344054;
  padding: 7px;
  flex-shrink: 0;
}

.bell span {
  position: absolute;
  right: -2px;
  top: 0;
  background: #dc3545;
  color: #fff;
  border-radius: 50%;
  width: 17px;
  height: 17px;
  font-size: 10px;
  display: grid;
  place-items: center;
}

.user-chip {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
}

.user-chip img,
.avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.avatar {
  display: grid;
  place-items: center;
  background: #e7efff;
  color: #1d5fd0;
  font-size: 20px;
}

.user-chip b,
.user-chip small {
  display: block;
}

.user-chip b {
  font-size: 13px;
  overflow-wrap: anywhere;
}

.user-chip small {
  font-size: 11px;
  color: #667085;
  margin-top: 3px;
}

/* ==============================
   CONTENT & WELCOME
============================== */
.content {
  padding: 0;
}

.welcome {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 18px;
  margin-bottom: 23px;
}

.welcome h1 {
  font-size: 26px;
  font-weight: 800;
  margin: 0 0 5px;
  color: #101828;
}

.welcome p {
  font-size: 13px;
  color: #667085;
  margin: 0;
}

.badges {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  flex-wrap: wrap;
}

.badges span {
  display: flex;
  gap: 6px;
  align-items: center;
  background: #e8edf5;
  border-radius: 10px;
  padding: 9px 11px;
  font-size: 11px;
  color: #344054;
  white-space: nowrap;
}

.badges i {
  color: #2563d9;
}

/* ==============================
   SUMMARY CARDS
============================== */
.summary-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 16px;
}

.profile-card,
.blue-card,
.panel {
  border: 1px solid #e0e5ed;
  border-radius: 14px;
  box-shadow: 0 3px 10px rgb(16 24 40 / 4%);
  min-width: 0;
}

.profile-card {
  background: #fff;
  padding: 17px 15px;
  min-height: 235px;
  display: flex;
  flex-direction: column;
}

.profile-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 17px;
  min-width: 0;
}

.profile-head img,
.profile-avatar {
  width: 54px;
  height: 54px;
  object-fit: cover;
  border-radius: 50%;
  flex-shrink: 0;
}

.profile-avatar {
  display: grid;
  place-items: center;
  background: #e7efff;
  color: #1d5fd0;
  font-size: 26px;
}

.profile-head > div {
  min-width: 0;
}

.profile-head h2 {
  font-size: 15px;
  font-weight: 750;
  margin: 0 0 4px;
  overflow-wrap: anywhere;
}

.profile-head small {
  font-size: 10px;
  color: #667085;
  overflow-wrap: anywhere;
}

.line {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  font-size: 12px;
  margin-bottom: 12px;
}

.line span {
  color: #344054;
}

.line b {
  text-align: right;
  overflow-wrap: anywhere;
}

.status {
  background: #dcfce7;
  color: #15803d;
  padding: 3px 7px;
  border-radius: 7px;
  font-size: 10px;
}

/* ==============================
   BLUE CARDS
============================== */
.blue-card {
  background: linear-gradient(135deg, #2767df, #1552bb);
  color: #fff;
  padding: 17px 15px;
  display: flex;
  flex-direction: column;
  min-height: 235px;
  overflow: hidden;
}

.blue-card h3 {
  font-size: 13px;
  font-weight: 600;
  margin: 0 0 13px;
  line-height: 1.5;
}

.blue-card p {
  font-size: 12px;
  color: #e2eaff;
  margin: 7px 0 14px;
}

.big {
  font-size: 24px;
  font-weight: 800;
  line-height: 1.3;
  overflow-wrap: anywhere;
}

.bottom-metric {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 5px;
}

.bottom-metric span {
  font-size: 11px;
  color: #e0eaff;
}

.bottom-metric b {
  font-size: 21px;
}

.primary {
  border: 0;
  border-radius: 8px;
  background: #2463dc;
  color: #fff;
  padding: 9px 12px;
  font-size: 12px;
  font-weight: 650;
  transition: background 0.2s ease;
}

.primary:hover {
  background: #174db7;
}

.full {
  width: 100%;
}

.profile-card .primary {
  margin-top: auto;
}

.light {
  border: 0;
  border-radius: 7px;
  background: #fff;
  color: #174b9a;
  padding: 9px 10px;
  font-size: 11px;
  font-weight: 700;
  align-self: flex-start;
  margin-top: 12px;
  transition: background 0.2s ease;
}

.light:hover {
  background: #eaf1ff;
}

/* ==============================
   ATTENDANCE GAUGE
============================== */
.gauge {
  position: relative;
  display: flex;
  flex: 1;
  min-height: 100px;
  align-items: center;
  flex-direction: column;
}

.gauge svg {
  width: 150px;
  max-width: 100%;
  height: 90px;
  overflow: visible;
}

.gauge path {
  fill: none;
  stroke-width: 9;
  stroke-linecap: round;
}

.track {
  stroke: rgb(255 255 255 / 35%);
}

.gauge-line {
  stroke: #fff;
}

.gauge strong {
  position: absolute;
  top: 43px;
  font-size: 24px;
  font-weight: 800;
}

.gauge small {
  position: absolute;
  top: 71px;
  font-size: 11px;
  color: #e2eaff;
}

.mini-summary {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 5px;
  font-size: 11px;
  margin-top: 6px;
}

/* ==============================
   PANELS
============================== */
.panel {
  background: #fff;
  padding: 18px;
}

.panel h2 {
  font-size: 15px;
  font-weight: 750;
  margin: 0;
  color: #101828;
}

.panel-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.panel-title > span {
  font-size: 11px;
  color: #667085;
  flex-shrink: 0;
}

.middle-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 15px;
  margin-bottom: 16px;
}

/* ==============================
   MODERN MONTHLY ATTENDANCE CHART
============================== */
.attendance-overview {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 115px;
  gap: 18px;
  align-items: center;
  padding-top: 5px;
}

.chart-wrap {
  min-width: 0;
  padding: 13px;
  border: 1px solid #edf0f5;
  border-radius: 14px;
  background: linear-gradient(180deg, #fbfdff 0%, #fff 100%);
}

.chart-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.chart-heading strong,
.chart-heading small {
  display: block;
}

.chart-heading strong {
  font-size: 14px;
  color: #172b4d;
  font-weight: 750;
}

.chart-heading small {
  font-size: 11px;
  color: #8490a3;
  margin-top: 3px;
}

.chart-badge {
  white-space: nowrap;
  background: #eaf2ff;
  color: #245fc7;
  border-radius: 20px;
  padding: 6px 9px;
  font-size: 10px;
  font-weight: 700;
}

.chart-canvas {
  position: relative;
  padding-left: 51px;
}

.chart-wrap .y-labels {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  font-size: 9px;
  color: #8a94a6;
  padding: 2px 0;
}

.attendance-chart {
  width: 100%;
  height: 180px;
  display: block;
  overflow: visible;
}

.grid-line {
  stroke: #e8edf4;
  stroke-width: 1;
  stroke-dasharray: 4 5;
}

.chart-line {
  fill: none;
  stroke-width: 2.8;
  stroke-linejoin: round;
  stroke-linecap: round;
  vector-effect: non-scaling-stroke;
}

.present-line {
  stroke: #16a36a;
}

.absent-line {
  stroke: #ef4444;
}

.late-line {
  stroke: #f59e0b;
}

.leave-line {
  stroke: #6366f1;
}

.chart-dot {
  stroke: #fff;
  stroke-width: 1.5;
  vector-effect: non-scaling-stroke;
}

.present-dot {
  fill: #16a36a;
}

.absent-dot {
  fill: #ef4444;
}

.late-dot {
  fill: #f59e0b;
}

.leave-dot {
  fill: #6366f1;
}

.day-labels {
  display: flex;
  justify-content: space-between;
  gap: 4px;
  margin: 8px 0 0 51px;
  font-size: 9px;
  color: #8490a3;
}

.legend {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.legend-item {
  display: grid;
  grid-template-columns: 9px 1fr;
  align-items: center;
  gap: 5px 8px;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  grid-row: span 2;
}

.legend-item span {
  font-size: 11px;
  color: #667085;
}

.legend-item b {
  font-size: 15px;
  color: #101828;
}

.green {
  background: #16a36a;
}

.red {
  background: #ef4444;
}

.orange {
  background: #f59e0b;
}

.purple {
  background: #6366f1;
}

/* ==============================
   TABLES
============================== */
.table {
  margin: 0;
  width: 100%;
}

.table thead th {
  font-size: 11px;
  color: #475467;
  background: #f6f8fb;
  border-bottom: 1px solid #e5e9f0;
  white-space: nowrap;
  padding: 11px 10px;
}

.table td {
  font-size: 12px;
  color: #344054;
  padding: 11px 10px;
  vertical-align: middle;
}

.table tbody tr:last-child td {
  border-bottom: 0;
}

.compact td,
.compact th {
  padding: 9px 8px;
}

.empty {
  text-align: center !important;
  color: #98a2b3 !important;
  padding: 20px !important;
  font-size: 12px;
}

.text-link {
  background: none;
  border: 0;
  color: #215fd1;
  font-size: 12px;
  font-weight: 650;
  padding: 4px;
}

.text-link:hover {
  text-decoration: underline;
}

/* ==============================
   LOWER DASHBOARD CARDS
============================== */
.bottom-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 15px;
  align-items: stretch;
}

.sample-tag {
  background: #fff2cc;
  color: #8a5a00 !important;
  border-radius: 5px;
  padding: 4px 6px;
  font-size: 10px !important;
}

.list-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 11px 0;
  border-bottom: 1px solid #edf0f5;
  min-width: 0;
}

.list-item:last-of-type {
  border-bottom: 0;
}

.tile-icon {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  background: #edf3ff;
  color: #215fd1;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.list-item > div {
  min-width: 0;
}

.list-item b {
  display: block;
  font-size: 10px;
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.list-item small {
  display: block;
  color: #667085;
  font-size: 9px;
  margin-top: 3px;
}

.list-grow {
  flex: 1;
}

.static-note {
  font-size: 10px;
  color: #98a2b3;
  margin: 10px 0 0;
  line-height: 1.5;
}

/* ==============================
   CLASS ROUTINE
============================== */
.routine {
  display: grid;
  grid-template-columns: 27px repeat(5, minmax(0, 1fr));
  gap: 4px;
  align-items: center;
  text-align: center;
  margin-top: 10px;
}

.routine > b {
  font-size: 9px;
  color: #667085;
  padding: 4px 0;
}

.routine > strong {
  font-size: 9px;
  color: #667085;
  text-align: left;
}

.routine > span {
  height: 22px;
  border-radius: 4px;
  background: #e8effc;
}

.routine > span.active {
  background: #c9dafb;
}

/* ==============================
   PAYMENT SUMMARY
============================== */
.payment-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 7px;
}

.payment-stats > div {
  min-width: 0;
  border-right: 1px solid #e8ebf0;
  padding-right: 5px;
}

.payment-stats > div:last-child {
  border-right: 0;
}

.payment-stats span {
  display: block;
  font-size: 9px;
  color: #667085;
  margin-bottom: 5px;
}

.payment-stats b {
  font-size: 12px;
  display: block;
  overflow-wrap: anywhere;
}

.subheading {
  font-size: 12px;
  font-weight: 750;
  margin: 0 0 5px;
  color: #101828;
}

.payment-history {
  margin-top: 16px;
}

.wide {
  margin-top: 8px;
}

/* ==============================
   PROFILE & RESULT DETAILS
============================== */
.profile-details {
  margin-bottom: 16px;
}

.profile-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.detail {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 10px;
  border-bottom: 1px solid #edf0f5;
  font-size: 12px;
  min-width: 0;
}

.detail span {
  color: #667085;
}

.detail b {
  text-align: right;
  overflow-wrap: anywhere;
}

.result-block {
  margin-top: 16px;
}

.result-block h3 {
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 12px;
}

.result-block h3 small {
  font-size: 12px;
  color: #667085;
}

/* ==============================
   BUTTONS & FEEDBACK
============================== */
button {
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

button:focus-visible,
input:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}

.alert {
  font-size: 13px;
}

/* ==============================
   RESPONSIVE: SMALL DESKTOP
============================== */
@media (max-width: 1450px) {
  .summary-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .bottom-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .welcome {
    align-items: flex-start;
    flex-direction: column;
  }

  .badges {
    justify-content: flex-start;
  }
}

/* ==============================
   RESPONSIVE: TABLET
============================== */
@media (max-width: 992px) {
  .main-wrapper {
    padding: 18px;
    width: 100%;
  }

  .topbar {
    padding: 16px;
  }

  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .middle-grid {
    grid-template-columns: 1fr;
  }

  .profile-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

/* ==============================
   RESPONSIVE: MOBILE
============================== */
@media (max-width: 600px) {
  .main-wrapper {
    padding: 12px;
  }

  .topbar {
    min-height: 70px;
    flex-wrap: wrap;
    padding: 14px;
    margin-bottom: 16px;
  }

  .topbar h3 {
    font-size: 19px;
  }

  .top-actions {
    width: 100%;
    gap: 8px;
    justify-content: space-between;
  }

  .search {
    width: auto;
    flex: 1;
    min-width: 0;
  }

  .user-chip > div {
    display: none;
  }

  .welcome h1 {
    font-size: 22px;
  }

  .welcome p {
    line-height: 1.6;
  }

  .badges {
    width: 100%;
    gap: 7px;
  }

  .badges span {
    white-space: normal;
    font-size: 10px;
    padding: 8px 9px;
  }

  .summary-grid,
  .bottom-grid {
    grid-template-columns: 1fr;
  }

  .middle-grid {
    grid-template-columns: 1fr;
  }

  .attendance-overview {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .chart-wrap {
    padding: 10px;
  }

  .chart-canvas {
    padding-left: 43px;
  }

  .attendance-chart {
    height: 150px;
  }

  .day-labels {
    margin-left: 43px;
  }

  .legend {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .profile-grid {
    grid-template-columns: 1fr;
  }

  .profile-card,
  .blue-card,
  .panel {
    border-radius: 12px;
  }

  .panel {
    padding: 14px 12px;
  }

  .payment-stats {
    gap: 5px;
  }

  .payment-stats span {
    font-size: 9px;
  }

  .payment-stats b {
    font-size: 11px;
  }

  .table td,
  .table thead th {
    padding: 9px 8px;
    font-size: 11px;
  }
}
.legend-item {
  display: grid;
  grid-template-columns: 9px minmax(0, 1fr);
  align-items: start;
  gap: 10px;
  margin-bottom: 14px;
}

.legend-content {
  min-width: 0;
}

.legend-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 6px;
}

.legend-info span {
  font-size: 13px;
  color: #64748b;
}

.legend-info b {
  font-size: 13px;
  color: #1e293b;
}

.legend-content small {
  display: block;
  margin-top: 4px;
  text-align: right;
  font-size: 11px;
  color: #64748b;
}

.legend-progress {
  height: 5px;
  width: 100%;
  overflow: hidden;
  background: #e9edf3;
  border-radius: 10px;
}

.legend-progress-fill {
  height: 100%;
  border-radius: 10px;
  transition: width 0.3s ease;
}

.legend-progress-fill.green {
  background: #22c55e;
}

.legend-progress-fill.red {
  background: #ef4444;
}

.legend-progress-fill.orange {
  background: #f59e0b;
}

.legend-progress-fill.purple {
  background: #8b5cf6;
}
.chart-wrap {
  width: 573px;
}
.legend {
  width: 125px;
  margin-left: -38px;
}
.topbar {
  width: 87% !important;
  margin-left: auto !important;
}
</style>
