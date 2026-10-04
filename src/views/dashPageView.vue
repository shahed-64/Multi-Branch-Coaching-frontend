<template>
  <!-- ================= MOBILE HEADER ================= -->
  <div class="mobile-header d-md-none">
    <button type="button" class="menu-btn" @click="toggleSidebar">
      <i class="fa-solid fa-bars"></i>
    </button>

    <div class="mobile-header-title">
      <h5 class="mb-0 text-white">
        {{ institute?.institute_name || 'Admin Panel' }}
      </h5>
    </div>
  </div>

  <!-- ================= OVERLAY ================= -->
  <div class="sidebar-overlay" :class="{ active: isSidebarOpen }" @click="closeSidebar"></div>

  <!-- ================= SIDEBAR ================= -->
  <aside class="sidebar" :class="{ active: isSidebarOpen }">
    <!-- ================= INSTITUTE LOGO ================= -->
    <div class="sidebar-logo">
      <div class="logo-icon">
        <img
          v-if="institute?.logo"
          :src="getLogoUrl(institute.logo)"
          :alt="institute?.institute_name || 'Institute Logo'"
          class="institute-logo"
        />

        <i v-else class="fa-solid fa-graduation-cap"></i>
      </div>

      <div class="logo-content">
        <h5 class="logo-title">
          {{ institute?.institute_name || 'Coaching MS' }}
        </h5>

        <span class="logo-subtitle"> Management System </span>
      </div>
    </div>

    <!-- ================================================= -->
    <!-- ================= MANAGER BRANCH SWITCH ========= -->
    <!-- ================================================= -->
    <!-- শুধুমাত্র Manager দেখতে পারবে -->
    <!-- Dashboard-এর আগে রাখা হয়েছে কারণ Dashboard -->
    <!-- selected branch অনুযায়ী দেখানো হবে -->
    <!-- ================================================= -->

    <div v-if="role === 'Manager'" class="manager-branch-switch">
      <div class="branch-switch-label">
        <i class="fa-solid fa-code-branch"></i>
        <span>Current Branch</span>
      </div>

      <select
        v-model="selectedBranchId"
        class="branch-switch-select"
        :disabled="branchLoading"
        @change="changeBranch"
      >
        <option value="">All Branches</option>

        <option v-for="branch in branches" :key="branch.id" :value="String(branch.id)">
          {{ branch.name }}
        </option>
      </select>

      <div v-if="branchLoading" class="branch-loading">
        <i class="fa-solid fa-spinner fa-spin"></i>
        Loading branches...
      </div>
    </div>

    <!-- ================= DASHBOARD ================= -->
    <router-link to="/dashboard" active-class="active-menu" @click="closeSidebar">
      <i class="fa-solid fa-gauge-high"></i>
      <span>Dashboard</span>
    </router-link>

    <!-- ================= BRANCHES ================= -->
    <router-link to="/branch" active-class="active-menu" @click="closeSidebar">
      <i class="fa-solid fa-code-branch"></i>
      <span>Branches</span>
    </router-link>

    <!-- ================= INSTITUTE ================= -->
    <router-link to="/Institure-Info" active-class="active-menu" @click="closeSidebar">
      <i class="fa-solid fa-building"></i>
      <span>Institute Information</span>
    </router-link>

    <!-- ================= STUDENTS ================= -->
    <div class="dropdown sidebar-dropdown">
      <button class="student-btn dropdown-toggle" type="button" data-bs-toggle="dropdown">
        <span>
          <i class="fa-solid fa-user-graduate"></i>
          Students
        </span>
      </button>

      <ul class="dropdown-menu">
        <li>
          <router-link
            class="dropdown-item"
            to="/student"
            active-class="active-menu"
            @click="closeSidebar"
          >
            <i class="fa-solid fa-users"></i>
            All Students
          </router-link>
          <router-link
            class="dropdown-item"
            to="/student-attendance"
            active-class="active-menu"
            @click="closeSidebar"
          >
            <i class="fa-solid fa-users"></i>
            Student Attendance
          </router-link>
          <router-link
            class="dropdown-item"
            to="/student-attendance-overview"
            active-class="active-menu"
            @click="closeSidebar"
          >
            <i class="fa-solid fa-users"></i>
            Attendance Overview
          </router-link>
        </li>

        <li>
          <button
            type="button"
            class="dropdown-item"
            data-bs-toggle="modal"
            data-bs-target="#addModal"
          >
            <i class="fa-solid fa-user-plus"></i>
            Add Student
          </button>
        </li>
      </ul>
    </div>

    <!-- ================= TEACHERS ================= -->
    <div class="dropdown sidebar-dropdown">
      <button class="student-btn dropdown-toggle" type="button" data-bs-toggle="dropdown">
        <span>
          <i class="fa-solid fa-chalkboard-user"></i>
          Teachers
        </span>
      </button>

      <ul class="dropdown-menu">
        <li>
          <router-link
            class="dropdown-item"
            to="/teacherView"
            active-class="active-menu"
            @click="closeSidebar"
          >
            <i class="fa-solid fa-users"></i>
            All Teachers
          </router-link>
        </li>

        <li>
          <router-link
            class="dropdown-item"
            to="/teacherattendance"
            active-class="active-menu"
            @click="closeSidebar"
          >
            <i class="fa-solid fa-calendar-check"></i>
            Teacher Attendance
          </router-link>
        </li>

        <li>
          <router-link
            class="dropdown-item"
            to="/AttendancOverview"
            active-class="active-menu"
            @click="closeSidebar"
          >
            <i class="fa-solid fa-chart-column"></i>
            Attendance Summary
          </router-link>
        </li>

        <li>
          <router-link
            class="dropdown-item"
            to="/AttendanceHistry"
            active-class="active-menu"
            @click="closeSidebar"
          >
            <i class="fa-solid fa-clock-rotate-left"></i>
            Attendance History
          </router-link>
        </li>
      </ul>
    </div>

    <!-- ================= STAFF ================= -->
    <div class="dropdown sidebar-dropdown">
      <button class="student-btn dropdown-toggle" type="button" data-bs-toggle="dropdown">
        <span>
          <i class="fa-solid fa-user-tie"></i>
          Staff
        </span>
      </button>

      <ul class="dropdown-menu">
        <li v-if="role === 'Manager' || role === 'Branch Manager' || role === 'Admin'">
          <router-link
            class="dropdown-item"
            to="/staff"
            active-class="active-menu"
            @click="closeSidebar"
          >
            <i class="fa-solid fa-users"></i>
            All Staff
          </router-link>
        </li>

        <li>
          <router-link
            class="dropdown-item"
            to="/staffAttendance"
            active-class="active-menu"
            @click="closeSidebar"
          >
            <i class="fa-solid fa-calendar-check"></i>
            Staff Attendance
          </router-link>
        </li>

        <li>
          <router-link
            class="dropdown-item"
            to="/StaffAttendancOverview"
            active-class="active-menu"
            @click="closeSidebar"
          >
            <i class="fa-solid fa-chart-column"></i>
            Attendance Summary
          </router-link>
        </li>

        <li>
          <router-link
            class="dropdown-item"
            to="/StaffAttendanceHistry"
            active-class="active-menu"
            @click="closeSidebar"
          >
            <i class="fa-solid fa-clock-rotate-left"></i>
            Attendance History
          </router-link>
        </li>
      </ul>
    </div>

    <!-- ================================================= -->
    <!-- ================= ACADEMIC SECTION ============== -->
    <!-- ================================================= -->

    <div class="menu-section-title">Academic</div>

    <!-- ================= CLASS ================= -->
    <router-link to="/class" active-class="active-menu" @click="closeSidebar">
      <i class="fa-solid fa-school"></i>
      <span>Class</span>
    </router-link>

    <!-- ================= CLASS GROUP ================= -->
    <router-link to="/ClassGroup" active-class="active-menu" @click="closeSidebar">
      <i class="fa-solid fa-layer-group"></i>
      <span>Class Group</span>
    </router-link>

    <!-- ================= SECTION ================= -->
    <router-link to="/section" active-class="active-menu" @click="closeSidebar">
      <i class="fa-solid fa-table-columns"></i>
      <span>Sections</span>
    </router-link>

    <!-- ================= SUBJECT ================= -->
    <router-link to="/subject" active-class="active-menu" @click="closeSidebar">
      <i class="fa-solid fa-book-open"></i>
      <span>Subjects</span>
    </router-link>

    <!-- ================= EXAMINATION ================= -->
    <router-link to="/exam" active-class="active-menu" @click="closeSidebar">
      <i class="fa-solid fa-file-pen"></i>
      <span>Examination</span>
    </router-link>

    <!-- ================= RESULT ================= -->
    <router-link to="/result" active-class="active-menu" @click="closeSidebar">
      <i class="fa-solid fa-square-poll-vertical"></i>
      <span>Result</span>
    </router-link>

    <!-- ================= RESULT GRADING ================= -->
    <router-link to="/resultGrade" active-class="active-menu" @click="closeSidebar">
      <i class="fa-solid fa-square-poll-vertical"></i>
      <span>Result Grading</span>
    </router-link>

    <!-- ================= FINAL AVERAGE RESULT ================= -->
    <router-link to="/finalAvrageResult" active-class="active-menu" @click="closeSidebar">
      <i class="fa-solid fa-square-poll-vertical"></i>
      <span>Final Avrage Result</span>
    </router-link>

    <!-- ================= SHIFT ================= -->
    <router-link to="/shift" active-class="active-menu" @click="closeSidebar">
      <i class="fa-solid fa-clock"></i>
      <span>Shift</span>
    </router-link>

    <!-- ================= HOLIDAY ================= -->
    <router-link to="/holiday" active-class="active-menu" @click="closeSidebar">
      <i class="fa-solid fa-calendar-days"></i>
      <span>Holidays</span>
    </router-link>

    <!-- ================================================= -->
    <!-- ================= ACCOUNT SECTION ================ -->
    <!-- ================================================= -->

    <div
      v-if="role === 'Manager' || role === 'Branch Manager'"
      class="menu-section-title account-section-title"
    >
      Account
    </div>

    <!-- ================= ACCOUNT DASHBOARD ================= -->
    <router-link
      v-if="role === 'Manager' || role === 'Branch Manager'"
      to="/account/dashboard"
      active-class="active-menu"
      @click="closeSidebar"
    >
      <i class="fa-solid fa-wallet"></i>
      <span>Account Dashboard</span>
    </router-link>

    <!-- ================= SETTINGS ================= -->
    <router-link to="/settings" active-class="active-menu" @click="closeSidebar">
      <i class="fa-solid fa-gear"></i>
      <span>Settings</span>
    </router-link>

    <!-- ================= BACKUP ================= -->
    <div class="backup-section">
      <button type="button" @click="runBackup" :disabled="loading" class="backup-btn">
        <span v-if="loading">
          <i class="fa-solid fa-spinner fa-spin me-2"></i>
          Backing up...
        </span>

        <span v-else>
          <i class="fa-solid fa-database me-2"></i>
          Take Database Backup
        </span>
      </button>

      <p v-if="message" class="backup-message" :class="isError ? 'text-danger' : 'text-success'">
        {{ message }}
      </p>
    </div>

    <!-- ================= LOGOUT ================= -->
    <button type="button" @click="logout" class="logout-btn">
      <i class="fa-solid fa-right-from-bracket"></i>
      <span>Logout</span>
    </button>
  </aside>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'

const router = useRouter()

const isSidebarOpen = ref(false)
const role = localStorage.getItem('role')

const loading = ref(false)
const message = ref('')
const isError = ref(false)

const institute = ref(null)

// =====================================================
// MANAGER BRANCH SWITCH
// =====================================================

const branches = ref([])
const branchLoading = ref(false)

const selectedBranchId = ref(localStorage.getItem('selected_branch_id') || '')

// =====================================================
// LOGO URL
// =====================================================

const getLogoUrl = (logo) => {
  if (!logo) return ''

  if (logo.startsWith('http://') || logo.startsWith('https://') || logo.startsWith('data:image')) {
    return logo
  }

  if (logo.startsWith('/storage/')) {
    return logo
  }

  if (logo.startsWith('storage/')) {
    return `/${logo}`
  }

  return `/storage/${logo}`
}

// =====================================================
// FETCH INSTITUTE INFORMATION
// =====================================================

const fetchInstitute = async () => {
  try {
    const response = await api.get('/institute-info')

    console.log('INSTITUTE INFO:', response.data)

    institute.value = response.data.data || null
  } catch (error) {
    console.error('Institute info failed:', error)

    institute.value = null
  }
}

// =====================================================
// FETCH BRANCHES
// শুধুমাত্র Manager-এর জন্য
// =====================================================

const fetchBranches = async () => {
  if (role !== 'Manager') {
    return
  }

  branchLoading.value = true

  try {
    const response = await api.get('/branches')

    branches.value = response.data.branches || []
  } catch (error) {
    console.error('Fetch branches error:', error)

    branches.value = []
  } finally {
    branchLoading.value = false
  }
}

// =====================================================
// CHANGE CURRENT BRANCH
// =====================================================

const changeBranch = () => {
  if (selectedBranchId.value) {
    localStorage.setItem('selected_branch_id', selectedBranchId.value)
  } else {
    localStorage.removeItem('selected_branch_id')
  }

  /*
   * পুরো application নতুন branch context নিয়ে
   * কাজ করার জন্য reload করা হচ্ছে।
   */

  window.location.reload()
}

// =====================================================
// BACKUP
// =====================================================

const runBackup = async () => {
  loading.value = true
  message.value = ''
  isError.value = false

  try {
    const token = localStorage.getItem('token')

    const response = await api.post(
      '/run-backup',
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )

    message.value = response.data.message || 'Backup completed successfully.'
  } catch (error) {
    console.error('Backup failed:', error)

    isError.value = true

    message.value = error.response?.data?.message || 'Backup failed. Please try again.'
  } finally {
    loading.value = false
  }
}

// =====================================================
// LOGOUT
// =====================================================

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('role')
  localStorage.removeItem('selected_branch_id')

  router.push('/login')
}

// =====================================================
// SIDEBAR
// =====================================================

const closeSidebar = () => {
  isSidebarOpen.value = false
}

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

// =====================================================
// INITIAL LOAD
// =====================================================

onMounted(() => {
  fetchInstitute()
  fetchBranches()
})
</script>

<style scoped>
/* =========================================================
   DESKTOP SIDEBAR
========================================================= */

.sidebar {
  width: 260px;
  min-height: 100vh;
  background: #111827;
  padding: 20px;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  overflow-y: auto;
  z-index: 999;
  transition: all 0.3s ease;
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 6px 0 18px rgba(0, 0, 0, 0.18);
  box-sizing: border-box;
}

/* =========================================================
   SIDEBAR LOGO
========================================================= */

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 14px;
  padding-bottom: 20px;
  margin-bottom: 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

/* =========================================================
   LOGO ICON CONTAINER
========================================================= */

.logo-icon {
  width: 52px;
  height: 52px;
  flex: 0 0 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent !important;
  color: #fff;
  border-radius: 14px;
  font-size: 22px;
  overflow: hidden;
}

/* =========================================================
   INSTITUTE LOGO
========================================================= */

.institute-logo {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 5px;
  border-radius: 10px;
  display: block;
}

/* =========================================================
   LOGO CONTENT
========================================================= */

.logo-content {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.logo-title {
  margin: 0;
  color: #fff;
  font-size: 17px;
  font-weight: 700;
  line-height: 1.3;
  word-break: break-word;
}

.logo-subtitle {
  color: #94a3b8;
  font-size: 11px;
  letter-spacing: 0.4px;
  margin-top: 2px;
}

/* =========================================================
   MENU LINKS
========================================================= */

.sidebar > a {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #e5e7eb;
  text-decoration: none;
  padding: 11px 14px;
  margin-bottom: 6px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.25s ease;
}

.sidebar > a:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  transform: translateX(3px);
}

.sidebar > a i {
  width: 22px;
  text-align: center;
  font-size: 15px;
  flex-shrink: 0;
}

/* =========================================================
   ACTIVE MENU
========================================================= */

.active-menu {
  background: #2563eb !important;
  color: #fff !important;
  box-shadow: 0 8px 18px rgba(37, 99, 235, 0.3);
}

/* =========================================================
   MANAGER BRANCH SWITCH
========================================================= */

.manager-branch-switch {
  margin-bottom: 12px;
  padding: 12px;
  background: rgba(37, 99, 235, 0.1);
  border: 1px solid rgba(96, 165, 250, 0.18);
  border-radius: 12px;
}

.branch-switch-label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #cbd5e1;
  font-size: 11px;
  font-weight: 600;
  margin-bottom: 7px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.branch-switch-label i {
  color: #60a5fa;
  font-size: 13px;
}

.branch-switch-select {
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  padding: 9px 10px;
  background: #1f2937;
  color: #fff;
  font-size: 13px;
  outline: none;
  cursor: pointer;
}

.branch-switch-select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15);
}

.branch-switch-select:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.branch-switch-select option {
  background: #1f2937;
  color: #fff;
}

.branch-loading {
  margin-top: 6px;
  color: #94a3b8;
  font-size: 10px;
}

/* =========================================================
   SECTION TITLE
========================================================= */

.menu-section-title {
  color: #64748b;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 15px 14px 6px;
}

/* Account section একটু আলাদা spacing */

.account-section-title {
  margin-top: 4px;
}

/* =========================================================
   DROPDOWN
========================================================= */

.sidebar-dropdown {
  width: 100%;
  margin-bottom: 4px;
}

.student-btn {
  width: 100%;
  background: transparent !important;
  border: none !important;
  outline: none;
  color: #e5e7eb !important;
  text-align: left;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 11px 14px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.25s ease;
}

.student-btn > span {
  display: flex;
  align-items: center;
  gap: 12px;
}

.student-btn:hover {
  background: rgba(255, 255, 255, 0.08) !important;
  color: #fff !important;
}

.student-btn > span > i {
  width: 22px;
  text-align: center;
  font-size: 15px;
}

/* =========================================================
   DROPDOWN MENU
========================================================= */

.dropdown-menu {
  width: 100%;
  background: #1f2937 !important;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 6px;
  margin-top: 4px !important;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #e5e7eb !important;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 13px;
  transition: all 0.25s ease;
}

.dropdown-item:hover {
  background: #2563eb !important;
  color: #fff !important;
  transform: translateX(3px);
}

.dropdown-item i {
  width: 19px;
  text-align: center;
}

/* =========================================================
   BACKUP
========================================================= */

.backup-section {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.backup-btn {
  width: 100%;
  border: none;
  border-radius: 9px;
  padding: 11px 12px;
  background: #2563eb;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.25s ease;
}

.backup-btn:hover:not(:disabled) {
  background: #1d4ed8;
  transform: translateY(-1px);
}

.backup-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.backup-message {
  font-size: 11px;
  margin: 8px 2px 0;
  word-break: break-word;
}

/* =========================================================
   LOGOUT
========================================================= */

.logout-btn {
  width: 100%;
  border: none;
  border-radius: 10px;
  padding: 12px 15px;
  margin-top: 12px;
  margin-bottom: 5px;
  background: #dc2626;
  color: #fff;
  font-weight: 600;
  font-size: 14px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  transition: all 0.25s ease;
}

.logout-btn:hover {
  background: #b91c1c;
  transform: translateY(-2px);
}

/* =========================================================
   MOBILE HEADER
========================================================= */

.mobile-header {
  position: sticky;
  top: 0;
  z-index: 998;
  background: #111827;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
}

.menu-btn {
  border: none;
  background: transparent;
  color: #fff;
  font-size: 27px;
  line-height: 1;
  padding: 0;
}

.mobile-header-title {
  min-width: 0;
}

.mobile-header-title h5 {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 250px;
}

/* =========================================================
   OVERLAY
========================================================= */

.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  visibility: hidden;
  opacity: 0;
  transition: all 0.3s ease;
  z-index: 997;
  backdrop-filter: blur(2px);
}

.sidebar-overlay.active {
  visibility: visible;
  opacity: 1;
}

/* =========================================================
   SCROLLBAR
========================================================= */

.sidebar::-webkit-scrollbar {
  width: 6px;
}

.sidebar::-webkit-scrollbar-thumb {
  background: #334155;
  border-radius: 20px;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background: #475569;
}

/* =========================================================
   MOBILE
========================================================= */

@media (max-width: 768px) {
  .sidebar {
    left: -100%;
    width: 260px;
    box-shadow: 8px 0 25px rgba(0, 0, 0, 0.25);
  }

  .sidebar.active {
    left: 0;
  }
}

/* =========================================================
   DESKTOP
========================================================= */

@media (min-width: 769px) {
  .mobile-header {
    display: none !important;
  }
}

/* =========================================================
   SMALL MOBILE
========================================================= */

@media (max-width: 400px) {
  .sidebar {
    width: 250px;
  }

  .mobile-header {
    padding: 11px 13px;
  }

  .mobile-header-title h5 {
    font-size: 15px;
    max-width: 210px;
  }

  .logo-icon {
    width: 46px;
    height: 46px;
    flex-basis: 46px;
  }

  .logo-title {
    font-size: 15px;
  }
}
</style>
