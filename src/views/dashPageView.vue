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
        <span class="logo-subtitle">Management System</span>
      </div>
    </div>

    <!-- ================= MANAGER BRANCH SWITCH ================= -->
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

    <!-- ================= MENU LIST ================= -->
    <nav class="sidebar-menu">
      <!-- DASHBOARD -->
      <router-link
        to="/dashboard"
        class="menu-link"
        active-class="active-menu"
        @click="closeSidebar"
      >
        <i class="fa-solid fa-gauge-high menu-icon"></i>
        <span>Dashboard</span>
      </router-link>

      <!-- INSTITUTE SETUP DROPDOWN -->
      <div class="menu-item-has-children" :class="{ open: openMenus.institute }">
        <button class="menu-btn-toggle" @click="toggleMenu('institute')">
          <span class="btn-text">
            <i class="fa-solid fa-building-columns menu-icon"></i>
            <span>Institute Setup</span>
          </span>
          <i class="fa-solid fa-chevron-right chevron-icon"></i>
        </button>

        <div class="submenu-container">
          <router-link
            to="/Institure-Info"
            class="submenu-link"
            active-class="active-submenu"
            @click="closeSidebar"
          >
            <i class="fa-solid fa-circle-info"></i>
            <span>Institute Info</span>
          </router-link>
          <router-link
            to="/branch"
            class="submenu-link"
            active-class="active-submenu"
            @click="closeSidebar"
          >
            <i class="fa-solid fa-code-branch"></i>
            <span>Branches</span>
          </router-link>
          <router-link
            to="/Institure-Session"
            class="submenu-link"
            active-class="active-submenu"
            @click="closeSidebar"
          >
            <i class="fa-solid fa-calendar-days"></i>
            <span>Institute Session</span>
          </router-link>
          <router-link
            to="/migration"
            class="submenu-link"
            active-class="active-submenu"
            @click="closeSidebar"
          >
            <i class="fa-solid fa-arrows-split-up-and-left"></i>
            <span>Migration</span>
          </router-link>
          <router-link
            to="/single_student_migration"
            class="submenu-link"
            active-class="active-submenu"
            @click="closeSidebar"
          >
            <i class="fa-solid fa-user-gear"></i>
            <span>Single Migration</span>
          </router-link>
        </div>
      </div>

      <!-- STUDENTS DROPDOWN -->
      <div class="menu-item-has-children" :class="{ open: openMenus.students }">
        <button class="menu-btn-toggle" @click="toggleMenu('students')">
          <span class="btn-text">
            <i class="fa-solid fa-user-graduate menu-icon"></i>
            <span>Students</span>
          </span>
          <i class="fa-solid fa-chevron-right chevron-icon"></i>
        </button>

        <div class="submenu-container">
          <router-link
            to="/student"
            class="submenu-link"
            active-class="active-submenu"
            @click="closeSidebar"
          >
            <i class="fa-solid fa-users"></i>
            <span>All Students</span>
          </router-link>
          <router-link
            to="/student-attendance"
            class="submenu-link"
            active-class="active-submenu"
            @click="closeSidebar"
          >
            <i class="fa-solid fa-clipboard-user"></i>
            <span>Student Attendance</span>
          </router-link>
          <router-link
            to="/student-attendance-overview"
            class="submenu-link"
            active-class="active-submenu"
            @click="closeSidebar"
          >
            <i class="fa-solid fa-chart-pie"></i>
            <span>Attendance Overview</span>
          </router-link>
          <button
            type="button"
            class="submenu-link text-start border-0 bg-transparent"
            data-bs-toggle="modal"
            data-bs-target="#addModal"
          >
            <i class="fa-solid fa-user-plus"></i>
            <span>Add Student</span>
          </button>
        </div>
      </div>

      <!-- TEACHERS DROPDOWN -->
      <div class="menu-item-has-children" :class="{ open: openMenus.teachers }">
        <button class="menu-btn-toggle" @click="toggleMenu('teachers')">
          <span class="btn-text">
            <i class="fa-solid fa-chalkboard-user menu-icon"></i>
            <span>Teachers</span>
          </span>
          <i class="fa-solid fa-chevron-right chevron-icon"></i>
        </button>

        <div class="submenu-container">
          <router-link
            to="/teacherView"
            class="submenu-link"
            active-class="active-submenu"
            @click="closeSidebar"
          >
            <i class="fa-solid fa-id-badge"></i>
            <span>All Teachers</span>
          </router-link>
          <router-link
            to="/teacherattendance"
            class="submenu-link"
            active-class="active-submenu"
            @click="closeSidebar"
          >
            <i class="fa-solid fa-calendar-check"></i>
            <span>Teacher Attendance</span>
          </router-link>
          <router-link
            to="/AttendancOverview"
            class="submenu-link"
            active-class="active-submenu"
            @click="closeSidebar"
          >
            <i class="fa-solid fa-chart-column"></i>
            <span>Attendance Summary</span>
          </router-link>
          <router-link
            to="/AttendanceHistry"
            class="submenu-link"
            active-class="active-submenu"
            @click="closeSidebar"
          >
            <i class="fa-solid fa-clock-rotate-left"></i>
            <span>Attendance History</span>
          </router-link>
        </div>
      </div>

      <!-- STAFF DROPDOWN -->
      <div class="menu-item-has-children" :class="{ open: openMenus.staff }">
        <button class="menu-btn-toggle" @click="toggleMenu('staff')">
          <span class="btn-text">
            <i class="fa-solid fa-user-tie menu-icon"></i>
            <span>Staff</span>
          </span>
          <i class="fa-solid fa-chevron-right chevron-icon"></i>
        </button>

        <div class="submenu-container">
          <router-link
            v-if="role === 'Manager' || role === 'Branch Manager' || role === 'Admin'"
            to="/staff"
            class="submenu-link"
            active-class="active-submenu"
            @click="closeSidebar"
          >
            <i class="fa-solid fa-address-book"></i>
            <span>All Staff</span>
          </router-link>
          <router-link
            to="/staffAttendance"
            class="submenu-link"
            active-class="active-submenu"
            @click="closeSidebar"
          >
            <i class="fa-solid fa-calendar-check"></i>
            <span>Staff Attendance</span>
          </router-link>
          <router-link
            to="/StaffAttendancOverview"
            class="submenu-link"
            active-class="active-submenu"
            @click="closeSidebar"
          >
            <i class="fa-solid fa-chart-column"></i>
            <span>Attendance Summary</span>
          </router-link>
          <router-link
            to="/StaffAttendanceHistry"
            class="submenu-link"
            active-class="active-submenu"
            @click="closeSidebar"
          >
            <i class="fa-solid fa-clock-rotate-left"></i>
            <span>Attendance History</span>
          </router-link>
        </div>
      </div>

      <!-- ================= ACADEMIC SECTION ================= -->
      <div class="menu-section-title">Academic</div>

      <!-- CLASS INFO DROPDOWN -->
      <div class="menu-item-has-children" :class="{ open: openMenus.classInfo }">
        <button class="menu-btn-toggle" @click="toggleMenu('classInfo')">
          <span class="btn-text">
            <i class="fa-solid fa-school-flag menu-icon"></i>
            <span>Class Info</span>
          </span>
          <i class="fa-solid fa-chevron-right chevron-icon"></i>
        </button>

        <div class="submenu-container">
          <router-link
            to="/class"
            class="submenu-link"
            active-class="active-submenu"
            @click="closeSidebar"
          >
            <i class="fa-solid fa-school"></i>
            <span>Class</span>
          </router-link>
          <router-link
            to="/ClassGroup"
            class="submenu-link"
            active-class="active-submenu"
            @click="closeSidebar"
          >
            <i class="fa-solid fa-layer-group"></i>
            <span>Class Group</span>
          </router-link>
          <router-link
            to="/section"
            class="submenu-link"
            active-class="active-submenu"
            @click="closeSidebar"
          >
            <i class="fa-solid fa-object-group"></i>
            <span>Sections</span>
          </router-link>
        </div>
      </div>

      <!-- SHIFT & SUBJECT -->
      <router-link to="/shift" class="menu-link" active-class="active-menu" @click="closeSidebar">
        <i class="fa-solid fa-clock menu-icon"></i>
        <span>Shift</span>
      </router-link>

      <router-link to="/subject" class="menu-link" active-class="active-menu" @click="closeSidebar">
        <i class="fa-solid fa-book-open menu-icon"></i>
        <span>Subjects</span>
      </router-link>

      <!-- EXAMINATION & RESULT DROPDOWN -->
      <div class="menu-item-has-children" :class="{ open: openMenus.exam }">
        <button class="menu-btn-toggle" @click="toggleMenu('exam')">
          <span class="btn-text">
            <i class="fa-solid fa-square-poll-vertical menu-icon"></i>
            <span>Examination & Result</span>
          </span>
          <i class="fa-solid fa-chevron-right chevron-icon"></i>
        </button>

        <div class="submenu-container">
          <router-link
            to="/exam"
            class="submenu-link"
            active-class="active-submenu"
            @click="closeSidebar"
          >
            <i class="fa-solid fa-file-pen"></i>
            <span>Examination</span>
          </router-link>
          <router-link
            to="/result"
            class="submenu-link"
            active-class="active-submenu"
            @click="closeSidebar"
          >
            <i class="fa-solid fa-square-poll-vertical"></i>
            <span>Result</span>
          </router-link>
          <router-link
            to="/resultGrade"
            class="submenu-link"
            active-class="active-submenu"
            @click="closeSidebar"
          >
            <i class="fa-solid fa-award"></i>
            <span>Result Grading</span>
          </router-link>

          <!-- NESTED INSTITUTE RESULT -->
          <div class="nested-menu-item" :class="{ open: openMenus.instituteResult }">
            <button
              class="submenu-link nested-btn-toggle"
              @click.stop="toggleMenu('instituteResult')"
            >
              <span class="d-flex align-items-center gap-2">
                <i class="fa-solid fa-building-columns"></i>
                <span>Institute Result</span>
              </span>
              <i class="fa-solid fa-chevron-right chevron-icon-sm"></i>
            </button>

            <div class="nested-submenu-container">
              <router-link
                to="/instituteresult"
                class="nested-submenu-link"
                active-class="active-nested-submenu"
                @click="closeSidebar"
              >
                <i class="fa-solid fa-list-ol"></i>
                <span>Single Exam Merit List</span>
              </router-link>
              <router-link
                to="/finalAvrageResultMerit"
                class="nested-submenu-link"
                active-class="active-nested-submenu"
                @click="closeSidebar"
              >
                <i class="fa-solid fa-chart-line"></i>
                <span>Final Average Merit List</span>
              </router-link>
            </div>
          </div>

          <router-link
            to="/finalAvrageResult"
            class="submenu-link"
            active-class="active-submenu"
            @click="closeSidebar"
          >
            <i class="fa-solid fa-chart-line"></i>
            <span>Final Average Result</span>
          </router-link>
        </div>
      </div>

      <router-link to="/holiday" class="menu-link" active-class="active-menu" @click="closeSidebar">
        <i class="fa-solid fa-calendar-days menu-icon"></i>
        <span>Holidays</span>
      </router-link>

      <!-- ================= ACCOUNT SECTION ================= -->
      <div v-if="role === 'Manager' || role === 'Branch Manager'" class="menu-section-title">
        Account
      </div>

      <router-link
        v-if="role === 'Manager' || role === 'Branch Manager'"
        to="/account/dashboard"
        class="menu-link"
        active-class="active-menu"
        @click="closeSidebar"
      >
        <i class="fa-solid fa-wallet menu-icon"></i>
        <span>Account Dashboard</span>
      </router-link>

      <router-link
        to="/settings"
        class="menu-link"
        active-class="active-menu"
        @click="closeSidebar"
      >
        <i class="fa-solid fa-gear menu-icon"></i>
        <span>Settings</span>
      </router-link>
    </nav>

    <!-- BACKUP SECTION -->
    <div class="backup-section">
      <button type="button" @click="runBackup" :disabled="loading" class="backup-btn">
        <span v-if="loading"> <i class="fa-solid fa-spinner fa-spin me-2"></i> Backing up... </span>
        <span v-else> <i class="fa-solid fa-database me-2"></i> Database Backup </span>
      </button>

      <p v-if="message" class="backup-message" :class="isError ? 'text-danger' : 'text-success'">
        {{ message }}
      </p>
    </div>

    <!-- LOGOUT -->
    <button type="button" @click="logout" class="logout-btn">
      <i class="fa-solid fa-right-from-bracket"></i>
      <span>Logout</span>
    </button>
  </aside>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '../services/api'

const router = useRouter()
const route = useRoute()

const isSidebarOpen = ref(false)
const role = localStorage.getItem('role')

const loading = ref(false)
const message = ref('')
const isError = ref(false)
const institute = ref(null)

// Menu Open States
const openMenus = reactive({
  institute: false,
  students: false,
  teachers: false,
  staff: false,
  classInfo: false,
  exam: false,
  instituteResult: false,
})

// Current Route অনুসার ড্রপডাউন অটো-ওপেন লজিক
const autoOpenMenuByRoute = () => {
  const path = route.path

  if (
    [
      '/Institure-Info',
      '/branch',
      '/Institure-Session',
      '/migration',
      '/single_student_migration',
    ].includes(path)
  ) {
    openMenus.institute = true
  } else if (['/student', '/student-attendance', '/student-attendance-overview'].includes(path)) {
    openMenus.students = true
  } else if (
    ['/teacherView', '/teacherattendance', '/AttendancOverview', '/AttendanceHistry'].includes(path)
  ) {
    openMenus.teachers = true
  } else if (
    ['/staff', '/staffAttendance', '/StaffAttendancOverview', '/StaffAttendanceHistry'].includes(
      path,
    )
  ) {
    openMenus.staff = true
  } else if (['/class', '/ClassGroup', '/section'].includes(path)) {
    openMenus.classInfo = true
  } else if (
    ['/exam', '/result', '/resultGrade', '/instituteresult', '/finalAvrageResult'].includes(path)
  ) {
    openMenus.exam = true
    if (path === '/instituteresult') {
      openMenus.instituteResult = true
    }
  }
}

// Watchers for Route Change
watch(
  () => route.path,
  () => {
    autoOpenMenuByRoute()
  },
)

const toggleMenu = (menuKey) => {
  if (menuKey === 'instituteResult') {
    openMenus.instituteResult = !openMenus.instituteResult
    return
  }

  Object.keys(openMenus).forEach((key) => {
    if (key !== menuKey && key !== 'instituteResult') {
      openMenus[key] = false
    }
  })
  openMenus[menuKey] = !openMenus[menuKey]
}

// Manager Branch Switch Variables
const branches = ref([])
const branchLoading = ref(false)
const selectedBranchId = ref(localStorage.getItem('selected_branch_id') || '')

const getLogoUrl = (logo) => {
  if (!logo) return ''
  if (logo.startsWith('http://') || logo.startsWith('https://') || logo.startsWith('data:image'))
    return logo
  if (logo.startsWith('/storage/')) return logo
  if (logo.startsWith('storage/')) return `/${logo}`
  return `/storage/${logo}`
}

const fetchInstitute = async () => {
  try {
    const response = await api.get('/institute-info')
    institute.value = response.data.data || null
  } catch (error) {
    console.error('Institute info failed:', error)
    institute.value = null
  }
}

const fetchBranches = async () => {
  if (role !== 'Manager') return
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

const changeBranch = () => {
  if (selectedBranchId.value) {
    localStorage.setItem('selected_branch_id', selectedBranchId.value)
  } else {
    localStorage.removeItem('selected_branch_id')
  }
  window.location.reload()
}

const runBackup = async () => {
  loading.value = true
  message.value = ''
  isError.value = false
  try {
    const token = localStorage.getItem('token')
    const response = await api.post(
      '/backup',
      {},
      {
        responseType: 'blob',
        headers: { Authorization: `Bearer ${token}` },
      },
    )

    const blob = new Blob([response.data], { type: 'application/sql' })
    let fileName = 'backup.sql'
    const contentDisposition = response.headers['content-disposition']
    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/)
      if (fileNameMatch && fileNameMatch[1]) fileName = fileNameMatch[1]
    }

    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)

    message.value = 'Backup downloaded successfully.'
  } catch (error) {
    console.error('Backup failed:', error)
    isError.value = true
    message.value = 'Backup failed. Please try again.'
  } finally {
    loading.value = false
  }
}

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('role')
  localStorage.removeItem('selected_branch_id')
  router.push('/login')
}

const closeSidebar = () => {
  isSidebarOpen.value = false
}

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

onMounted(() => {
  fetchInstitute()
  fetchBranches()
  autoOpenMenuByRoute() // Page Load হলে অটো ওপেন করার জন্য
})
</script>

<style scoped>
/* =========================================================
    SIDEBAR CORE
========================================================= */
.sidebar {
  width: 260px;
  min-height: 100vh;
  background: #111827;
  padding: 18px 14px;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  overflow-y: auto;
  z-index: 999;
  transition: all 0.3s ease;
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.25);
  box-sizing: border-box;
}

/* LOGO */
.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 16px;
  margin-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.logo-icon {
  width: 44px;
  height: 44px;
  flex: 0 0 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(37, 99, 235, 0.15);
  color: #3b82f6;
  border-radius: 12px;
  font-size: 20px;
  overflow: hidden;
}

.institute-logo {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 2px;
}

.logo-title {
  margin: 0;
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  line-height: 1.2;
}

.logo-subtitle {
  color: #94a3b8;
  font-size: 11px;
}

/* SECTION TITLE */
.menu-section-title {
  color: #475569;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 18px 12px 8px;
}

/* =========================================================
    ACCORDION MENU & SUBMENU
========================================================= */
.sidebar-menu {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* SINGLE MENU LINK */
.menu-link {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #9ca3af;
  text-decoration: none;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13.5px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.menu-link:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #f3f4f6;
}

.menu-icon {
  width: 20px;
  text-align: center;
  font-size: 15px;
  color: #6b7280;
  transition: color 0.2s ease;
}

.menu-link:hover .menu-icon {
  color: #3b82f6;
}

/* TOGGLE BUTTONS (ACCORDION PARENT) */
.menu-btn-toggle {
  width: 100%;
  background: transparent;
  border: none;
  outline: none;
  color: #9ca3af;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13.5px;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
}

.btn-text {
  display: flex;
  align-items: center;
  gap: 12px;
}

.menu-btn-toggle:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #f3f4f6;
}

.menu-btn-toggle:hover .menu-icon {
  color: #3b82f6;
}

.chevron-icon {
  font-size: 11px;
  color: #6b7280;
  transition:
    transform 0.25s ease,
    color 0.25s ease;
}

/* OPEN ACCORDION STATE */
.menu-item-has-children.open > .menu-btn-toggle {
  background: rgba(255, 255, 255, 0.03);
  color: #fff;
}

.menu-item-has-children.open > .menu-btn-toggle .chevron-icon {
  transform: rotate(90deg);
  color: #3b82f6;
}

/* SUBMENU CONTAINER */
.submenu-container {
  display: none;
  flex-direction: column;
  gap: 2px;
  padding-left: 12px;
  margin-top: 2px;
  margin-left: 14px;
  border-left: 2px solid rgba(255, 255, 255, 0.07);
}

.menu-item-has-children.open > .submenu-container {
  display: flex;
}

/* SUBMENU LINKS */
.submenu-link {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #9ca3af;
  text-decoration: none;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
  transition: all 0.2s ease;
}

.submenu-link:hover {
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
}

.submenu-link i {
  font-size: 12px;
  width: 16px;
  text-align: center;
}

/* NESTED SUBMENU */
.nested-btn-toggle {
  justify-content: space-between;
  width: 100%;
  cursor: pointer;
  background: transparent;
  border: none;
}

.nested-menu-item.open > .nested-btn-toggle .chevron-icon-sm {
  transform: rotate(90deg);
  color: #0d9488;
}

.chevron-icon-sm {
  font-size: 10px;
  transition: transform 0.25s ease;
}

.nested-submenu-container {
  display: none;
  padding-left: 10px;
  margin-top: 2px;
  border-left: 2px solid rgba(13, 148, 136, 0.3);
}

.nested-menu-item.open > .nested-submenu-container {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nested-submenu-link {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #9ca3af;
  text-decoration: none;
  padding: 7px 10px;
  border-radius: 6px;
  font-size: 12.5px;
  transition: all 0.2s ease;
}

.nested-submenu-link:hover {
  background: rgba(13, 148, 136, 0.15);
  color: #2dd4bf;
}

/* =========================================================
    ACTIVE STATES & FOCUS COLORS
========================================================= */
/* Main Active Link */
.active-menu {
  background: #2563eb !important;
  color: #ffffff !important;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.active-menu .menu-icon {
  color: #ffffff !important;
}

/* Active Submenu Link */
.active-submenu {
  background: rgba(37, 99, 235, 0.2) !important;
  color: #60a5fa !important;
  font-weight: 600;
}

.active-submenu i {
  color: #60a5fa !important;
}

/* Active Nested Submenu (Teal Special Color) */
.active-nested-submenu {
  background: #0d9488 !important;
  color: #ffffff !important;
  font-weight: 600;
  box-shadow: 0 4px 10px rgba(13, 148, 136, 0.3);
}

/* =========================================================
    MANAGER BRANCH & UTILITIES
========================================================= */
.manager-branch-switch {
  margin-bottom: 12px;
  padding: 10px 12px;
  background: rgba(37, 99, 235, 0.08);
  border: 1px solid rgba(96, 165, 250, 0.15);
  border-radius: 10px;
}

.branch-switch-label {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #cbd5e1;
  font-size: 10px;
  font-weight: 700;
  margin-bottom: 6px;
  text-transform: uppercase;
}

.branch-switch-select {
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 7px 8px;
  background: #1f2937;
  color: #fff;
  font-size: 12px;
  outline: none;
}

.backup-section {
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.backup-btn {
  width: 100%;
  border: none;
  border-radius: 8px;
  padding: 9px 12px;
  background: #2563eb;
  color: #fff;
  font-size: 12.5px;
  font-weight: 600;
  transition: background 0.2s ease;
}

.backup-btn:hover {
  background: #1d4ed8;
}

.logout-btn {
  width: 100%;
  border: none;
  border-radius: 8px;
  padding: 10px;
  margin-top: 10px;
  background: #dc2626;
  color: #fff;
  font-weight: 600;
  font-size: 13px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  transition: background 0.2s ease;
}

.logout-btn:hover {
  background: #b91c1c;
}

/* MOBILE RESPONSIVE */
.mobile-header {
  position: sticky;
  top: 0;
  z-index: 998;
  background: #111827;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 14px;
}

.menu-btn {
  border: none;
  background: transparent;
  color: #fff;
  font-size: 22px;
}

.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  visibility: hidden;
  opacity: 0;
  transition: all 0.3s ease;
  z-index: 997;
}

.sidebar-overlay.active {
  visibility: visible;
  opacity: 1;
}

@media (max-width: 768px) {
  .sidebar {
    left: -100%;
  }
  .sidebar.active {
    left: 0;
  }
}

@media (min-width: 769px) {
  .mobile-header {
    display: none !important;
  }
}
</style>
