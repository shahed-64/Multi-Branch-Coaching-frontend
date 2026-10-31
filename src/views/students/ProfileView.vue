<template>
  <StudentsDashboardMenueView />
  <div class="student-profile-wrapper">
    <!-- Main Card Container -->
    <div class="profile-card-container">
      <!-- Top Header Navigation -->
      <header class="app-header">
        <div class="brand-logo">
          <div class="logo-icon-wrap">
            <i class="fa-solid fa-graduation-cap"></i>
          </div>
          <span>{{ display(branchName, 'Student Portal') }}</span>
        </div>
        <nav class="nav-links">
          <a href="#" class="active">Overview</a>
          <button type="button" class="print-pill-btn" @click="windowPrint">
            <i class="fa-solid fa-print"></i> Print Card
          </button>
        </nav>
      </header>

      <!-- Loading State -->
      <div v-if="loading" class="state-card">
        <div class="loading-spinner"></div>
        <h5>Loading Profile...</h5>
      </div>

      <!-- Error State -->
      <div v-else-if="errorMessage" class="state-card error-state">
        <i class="fa-solid fa-circle-exclamation error-icon"></i>
        <h5>Unable to Load Profile</h5>
        <p>{{ errorMessage }}</p>
        <button type="button" class="btn-retry" @click="fetchProfile">
          <i class="fa-solid fa-rotate-right"></i> Try Again
        </button>
      </div>

      <!-- Main Content Area -->
      <div v-else-if="student" class="profile-main-layout">
        <!-- ================= LEFT GRADIENT SIDEBAR ================= -->
        <aside class="left-sidebar">
          <div class="sidebar-glow"></div>

          <div class="avatar-box">
            <img
              v-if="studentPhoto && !imageFailed"
              :src="studentPhoto"
              :alt="student.full_name"
              class="profile-img"
              @error="imageFailed = true"
            />
            <div v-else class="profile-img placeholder">
              {{ initials }}
            </div>
            <span class="status-indicator" :class="isActive ? 'active' : 'inactive'"></span>
          </div>

          <h2 class="user-name">{{ student.full_name || 'Student Name' }}</h2>
          <span class="user-id-badge"
            ><i class="fa-regular fa-id-card"></i> ID: {{ display(student.student_id) }}</span
          >

          <div class="sidebar-divider"></div>

          <!-- Student Information List -->
          <ul class="info-list">
            <li>
              <span class="label"><i class="fa-solid fa-hashtag"></i> Roll No</span>
              <span class="val">{{ display(student.student_roll) }}</span>
            </li>
            <li>
              <span class="label"><i class="fa-solid fa-book-open"></i> Class</span>
              <span class="val">{{ display(className) }}</span>
            </li>
            <li>
              <span class="label"><i class="fa-solid fa-layer-group"></i> Section</span>
              <span class="val">{{ display(sectionName) }}</span>
            </li>
            <li>
              <span class="label"><i class="fa-regular fa-clock"></i> Shift</span>
              <span class="val">{{ display(shiftName) }}</span>
            </li>
            <li>
              <span class="label"><i class="fa-solid fa-users"></i> Group</span>
              <span class="val">{{ display(groupName) }}</span>
            </li>

            <div class="sidebar-divider"></div>

            <li>
              <span class="label"><i class="fa-solid fa-phone"></i> Phone</span>
              <span class="val">{{ display(student.phone) }}</span>
            </li>
            <li>
              <span class="label"><i class="fa-regular fa-envelope"></i> Email</span>
              <span class="val email-text">{{ display(student.email) }}</span>
            </li>
          </ul>

          <div class="sidebar-footer-time">
            <i class="fa-regular fa-calendar-days"></i> Joined
            {{ formatDate(student.admission_date) }}
          </div>
        </aside>

        <!-- ================= RIGHT CONTENT DASHBOARD ================= -->
        <main class="right-content">
          <!-- Header Banner -->
          <div class="dashboard-banner">
            <div class="banner-text">
              <h3>Academic Dashboard</h3>
              <p>Monitor your active status, fees, and guardian information.</p>
            </div>
            <div class="account-status-pill" :class="isActive ? 'active' : 'inactive'">
              <span class="dot"></span> {{ isActive ? 'Active Account' : 'Inactive' }}
            </div>
          </div>

          <!-- Top Dash Grid: Circular Metrics & Parents Info -->
          <div class="top-dash-grid">
            <!-- Metric Cards -->
            <div class="metrics-cards-stack">
              <!-- Monthly Fee Card -->
              <div class="metric-glass-card">
                <div class="metric-info">
                  <span class="m-title">Monthly Tuition Fee</span>
                  <h4 class="m-value">৳{{ formatMoney(student.monthly_fee) }}</h4>
                  <span class="m-sub text-success"
                    ><i class="fa-solid fa-check-circle"></i> Regular Billing</span
                  >
                </div>
                <div class="mini-progress-circle fee-theme">
                  <i class="fa-solid fa-wallet"></i>
                </div>
              </div>

              <!-- Course / Version Card -->
              <div class="metric-glass-card">
                <div class="metric-info">
                  <span class="m-title">Medium / Course</span>
                  <h4 class="m-value font-sm">
                    {{ display(student.course_name || student.version, 'Bangla Version') }}
                  </h4>
                  <span class="m-sub"
                    ><i class="fa-solid fa-building-columns"></i> {{ display(branchName) }}</span
                  >
                </div>
                <div class="mini-progress-circle course-theme">
                  <i class="fa-solid fa-graduation-cap"></i>
                </div>
              </div>
            </div>

            <!-- Parents / Guardian Info Box -->
            <div class="family-card-box">
              <div class="box-header-title">
                <i class="fa-solid fa-people-roof"></i>
                <h4>Guardian Information</h4>
              </div>

              <div class="parents-list">
                <div class="parent-item">
                  <div class="icon-avatar father">
                    <i class="fa-solid fa-user-tie"></i>
                  </div>
                  <div class="parent-details">
                    <span class="relation">Father's Name</span>
                    <strong>{{ display(student.fathers_name) }}</strong>
                  </div>
                </div>

                <div class="parent-item">
                  <div class="icon-avatar mother">
                    <i class="fa-solid fa-user"></i>
                  </div>
                  <div class="parent-details">
                    <span class="relation">Mother's Name</span>
                    <strong>{{ display(student.mothers_name) }}</strong>
                  </div>
                </div>
              </div>

              <div class="box-action">
                <button type="button" @click="windowPrint" class="btn-invoice">
                  <i class="fa-solid fa-file-arrow-down"></i> Print / Download ID Card
                </button>
              </div>
            </div>
          </div>

          <!-- Quick Extra Details Strip -->
          <div class="extra-info-strip" v-if="student.second_phone">
            <div class="strip-item">
              <i class="fa-solid fa-phone-volume"></i>
              <span
                >Alternate Phone: <strong>{{ student.second_phone }}</strong></span
              >
            </div>
          </div>

          <!-- Footer Bottom Bar -->
          <div class="footer-bottom">
            <p>
              © {{ currentYear }} {{ display(branchName, 'School & Coaching Management System') }}.
              All rights reserved.
            </p>
            <div class="social-icons">
              <a href="#" title="Print" @click.prevent="windowPrint"
                ><i class="fa-solid fa-print"></i
              ></a>
              <a href="#" title="Help & Support"><i class="fa-solid fa-headset"></i></a>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'
import StudentsDashboardMenueView from './StudentsDashboardMenueView.vue'

const student = ref(null)
const loading = ref(true)
const errorMessage = ref('')
const imageFailed = ref(false)

const currentYear = new Date().getFullYear()

const display = (value, fallback = '—') => {
  if (value === null || value === undefined || value === '') {
    return fallback
  }
  return value
}

const relationName = (relation, keys = []) => {
  if (!relation || typeof relation !== 'object') return ''
  for (const key of keys) {
    if (relation[key] !== null && relation[key] !== undefined && relation[key] !== '') {
      return relation[key]
    }
  }
  return ''
}

const className = computed(() => {
  const data = student.value
  if (!data) return ''
  return (
    relationName(data.class_info ?? data.classInfo, ['class_name', 'name', 'title']) ||
    data.class_name ||
    ''
  )
})

const sectionName = computed(() => {
  const data = student.value
  if (!data) return ''
  return relationName(data.section, ['section_name', 'name', 'title']) || data.section_name || ''
})

const shiftName = computed(() => {
  const data = student.value
  if (!data) return ''
  return relationName(data.shift, ['shift_name', 'name', 'title']) || data.shift_name || ''
})

const groupName = computed(() => {
  const data = student.value
  if (!data) return ''
  return (
    relationName(data.class_group ?? data.classGroup, [
      'class_group_name',
      'group_name',
      'name',
      'title',
    ]) ||
    data.group_name ||
    ''
  )
})

const branchName = computed(() => {
  const data = student.value
  if (!data) return ''
  return (
    relationName(data.branch, ['branch_name', 'name', 'institute_name']) || data.branch_name || ''
  )
})

// ডাটাবেজের যেকোনো ছবি ফিল্ড (image, photo, avatar, image_url) ক্যাচ করার জন্য
const studentPhoto = computed(() => {
  const data = student.value
  if (!data) return ''
  return data.image || data.photo || data.avatar || data.image_url || data.profile_picture || ''
})

const initials = computed(() => {
  const name = String(student.value?.full_name || 'S').trim()
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
})

const isActive = computed(() => {
  const status = String(student.value?.status ?? '')
    .toLowerCase()
    .trim()
  return ['active', '1', 'true'].includes(status)
})

const formatDate = (value) => {
  if (!value) return 'Jan 2020'
  const date = new Date(`${value}`.slice(0, 10) + 'T00:00:00')
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('en-GB', { month: 'short', year: 'numeric' }).format(date)
}

const formatMoney = (value) => {
  if (value === null || value === undefined || value === '') return '0'
  const amount = Number(value)
  if (!Number.isFinite(amount)) return value
  return new Intl.NumberFormat('en-BD').format(amount)
}

const fetchProfile = async () => {
  loading.value = true
  errorMessage.value = ''
  imageFailed.value = false

  try {
    const response = await api.get('/student/profile')
    const data = response?.data?.student

    if (!data || typeof data !== 'object') {
      throw new Error('Student profile data was not found.')
    }
    student.value = data
  } catch (error) {
    student.value = null
    errorMessage.value =
      error?.response?.data?.message || error?.message || 'Failed to load student profile.'
  } finally {
    loading.value = false
  }
}

const windowPrint = () => {
  window.print()
}

onMounted(fetchProfile)
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

.student-profile-wrapper {
  min-height: 100vh;
  background: radial-gradient(circle at top left, #f0f4ff, #e2e8f0);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.profile-card-container {
  position: relative;
  width: 100%;
  max-width: 1020px;
  background: #ffffff;
  border-radius: 32px;
  overflow: hidden;
  box-shadow:
    0 25px 60px -15px rgba(30, 41, 59, 0.12),
    0 0 1px 1px rgba(226, 232, 240, 0.8);
  padding: 35px 45px;
}

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;
}
.brand-logo {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 12px;
}
.logo-icon-wrap {
  width: 42px;
  height: 42px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: #fff;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  box-shadow: 0 8px 16px rgba(59, 130, 246, 0.25);
}
.nav-links {
  display: flex;
  align-items: center;
  gap: 20px;
}
.nav-links a {
  text-decoration: none;
  color: #64748b;
  font-weight: 600;
  font-size: 14px;
}
.nav-links a.active {
  color: #2563eb;
}
.print-pill-btn {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #334155;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}
.print-pill-btn:hover {
  background: #2563eb;
  color: #fff;
  border-color: #2563eb;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
}

.profile-main-layout {
  display: grid;
  grid-template-columns: 290px 1fr;
  gap: 35px;
  align-items: start;
}

.left-sidebar {
  position: relative;
  background: linear-gradient(145deg, #1e40af, #2563eb, #1d4ed8);
  border-radius: 24px;
  padding: 30px 22px;
  color: #ffffff;
  box-shadow: 0 15px 30px rgba(37, 99, 235, 0.3);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.sidebar-glow {
  position: absolute;
  top: -50px;
  right: -50px;
  width: 150px;
  height: 150px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  pointer-events: none;
}

.avatar-box {
  position: relative;
  width: 115px;
  height: 115px;
  margin: 0 auto 15px;
  border-radius: 50%;
  border: 4px solid rgba(255, 255, 255, 0.8);
  overflow: hidden;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.profile-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-img.placeholder {
  background: #1e3a8a;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 34px;
  font-weight: 800;
  color: #ffffff;
}

.status-indicator {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 16px;
  height: 16px;
  border: 3px solid #1e40af;
  border-radius: 50%;
}
.status-indicator.active {
  background: #22c55e;
}
.status-indicator.inactive {
  background: #ef4444;
}

.user-name {
  font-size: 20px;
  font-weight: 700;
  text-align: center;
  margin: 5px 0 6px;
  word-break: break-word;
}

.user-id-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.15);
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  margin: 0 auto 15px;
  letter-spacing: 0.3px;
}

.sidebar-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.2);
  margin: 15px 0;
}

.info-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
}

.info-list .label {
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}
.info-list .label i {
  font-size: 12px;
  width: 14px;
  text-align: center;
}

.info-list .val {
  font-weight: 600;
  text-align: right;
  word-break: break-all;
}
.email-text {
  font-size: 11px;
}

.sidebar-footer-time {
  margin-top: 25px;
  padding-top: 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  font-size: 11px;
  color: rgba(255, 255, 255, 0.85);
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.right-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.dashboard-banner {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.banner-text h3 {
  margin: 0;
  font-size: 18px;
  color: #1e293b;
  font-weight: 700;
}
.banner-text p {
  margin: 4px 0 0;
  font-size: 12px;
  color: #64748b;
}

.account-status-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
}
.account-status-pill.active {
  background: #dcfce7;
  color: #15803d;
}
.account-status-pill.inactive {
  background: #fee2e2;
  color: #b91c1c;
}
.account-status-pill .dot {
  width: 8px;
  height: 8px;
  background: currentColor;
  border-radius: 50%;
}

.top-dash-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.metrics-cards-stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.metric-glass-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  padding: 18px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}
.metric-glass-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.04);
  border-color: #cbd5e1;
}

.metric-info .m-title {
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.metric-info .m-value {
  margin: 4px 0;
  font-size: 20px;
  font-weight: 800;
  color: #0f172a;
}
.metric-info .m-value.font-sm {
  font-size: 15px;
}
.metric-info .m-sub {
  font-size: 11px;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 4px;
}
.text-success {
  color: #16a34a !important;
  font-weight: 600;
}

.mini-progress-circle {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}
.fee-theme {
  background: #eff6ff;
  color: #2563eb;
}
.course-theme {
  background: #f5f3ff;
  color: #7c3aed;
}

.family-card-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.box-header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 15px;
  color: #1e293b;
  font-size: 14px;
  font-weight: 700;
}
.box-header-title i {
  color: #2563eb;
}
.box-header-title h4 {
  margin: 0;
}

.parents-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.parent-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #ffffff;
  padding: 10px 14px;
  border-radius: 12px;
  border: 1px solid #f1f5f9;
}

.icon-avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #eff6ff;
  color: #2563eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
}
.icon-avatar.mother {
  background: #fdf2f8;
  color: #db2777;
}

.parent-details {
  display: flex;
  flex-direction: column;
}
.parent-details .relation {
  font-size: 10px;
  color: #64748b;
  font-weight: 600;
}
.parent-details strong {
  font-size: 13px;
  color: #1e293b;
  font-weight: 700;
}

.box-action {
  margin-top: 15px;
}

.btn-invoice {
  width: 100%;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: #fff;
  border: none;
  padding: 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition:
    opacity 0.2s,
    box-shadow 0.2s;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
}
.btn-invoice:hover {
  opacity: 0.95;
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.35);
}

.extra-info-strip {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 12px 18px;
  font-size: 13px;
  color: #475569;
  display: flex;
  align-items: center;
  gap: 10px;
}
.strip-item i {
  color: #2563eb;
}

.footer-bottom {
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: #64748b;
  border-top: 1px solid #f1f5f9;
  padding-top: 15px;
}

.social-icons {
  display: flex;
  gap: 14px;
}
.social-icons a {
  color: #64748b;
  font-size: 16px;
  transition: color 0.2s;
}
.social-icons a:hover {
  color: #2563eb;
}

.state-card {
  text-align: center;
  padding: 60px 20px;
}
.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top: 3px solid #2563eb;
  border-radius: 50%;
  margin: 0 auto 15px;
  animation: spin 0.8s linear infinite;
}
.error-icon {
  font-size: 42px;
  color: #ef4444;
  margin-bottom: 12px;
}
.btn-retry {
  background: #2563eb;
  color: #fff;
  border: none;
  padding: 9px 18px;
  border-radius: 10px;
  cursor: pointer;
  margin-top: 15px;
  font-weight: 600;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 900px) {
  .profile-main-layout {
    grid-template-columns: 1fr;
  }
  .top-dash-grid {
    grid-template-columns: 1fr;
  }
  .profile-card-container {
    padding: 20px;
  }
}

@media print {
  .student-profile-wrapper {
    background: #fff;
    padding: 0;
  }
  .profile-card-container {
    box-shadow: none;
    max-width: 100%;
    border-radius: 0;
  }
  .app-header,
  .btn-invoice,
  .print-pill-btn {
    display: none !important;
  }
}
</style>
