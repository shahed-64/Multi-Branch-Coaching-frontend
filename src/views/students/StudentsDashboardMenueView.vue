<template>
  <!-- MOBILE HEADER -->
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

  <!-- OVERLAY -->
  <div class="sidebar-overlay" :class="{ active: isSidebarOpen }" @click="closeSidebar"></div>

  <!-- SIDEBAR -->
  <aside class="sidebar" :class="{ active: isSidebarOpen, 'result-entry-sidebar': isResultEntry }">
    <!-- LOGO -->
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

    <!-- MENU LIST -->
    <!-- MENU LIST -->
    <nav class="sidebar-menu">
      <!-- DASHBOARD -->
      <router-link
        to="/student/dashboard"
        class="menu-link"
        active-class="active-menu"
        :tabindex="isResultEntry ? -1 : 0"
        :aria-disabled="isResultEntry"
        @click="handleMenuClick($event)"
      >
        <i class="fa-solid fa-gauge-high menu-icon"></i>
        <span>Dashboard</span>
      </router-link>
      <router-link
        to="/students/studentResult"
        class="menu-link"
        active-class="active-menu"
        :tabindex="isResultEntry ? -1 : 0"
        :aria-disabled="isResultEntry"
        @click="handleMenuClick($event)"
      >
        <i class="fa-solid fa-square-poll-vertical menu-icon"></i>
        <span>Results</span>
      </router-link>
      <router-link
        to="/students/payFees"
        class="menu-link"
        active-class="active-menu"
        :tabindex="isResultEntry ? -1 : 0"
        :aria-disabled="isResultEntry"
        @click="handleMenuClick($event)"
      >
        <i class="fa-solid fa-credit-card menu-icon"></i>
        <span>Pay Fees Online</span>
      </router-link>
      <router-link
        to="/students/paymentHistory"
        class="menu-link"
        active-class="active-menu"
        :tabindex="isResultEntry ? -1 : 0"
        :aria-disabled="isResultEntry"
        @click="handleMenuClick($event)"
      >
        <i class="fa-solid fa-file-invoice-dollar menu-icon"></i>
        <span>Payment History</span>
      </router-link>
      <router-link
        to="/students/assignmints"
        class="menu-link"
        active-class="active-menu"
        :tabindex="isResultEntry ? -1 : 0"
        :aria-disabled="isResultEntry"
        @click="handleMenuClick($event)"
      >
        <i class="fa-solid fa-book-open-reader menu-icon"></i>
        <span>Assignments</span>
      </router-link>

      <router-link
        to="/students/classMembers"
        class="menu-link"
        active-class="active-menu"
        :tabindex="isResultEntry ? -1 : 0"
        :aria-disabled="isResultEntry"
        @click="handleMenuClick($event)"
      >
        <i class="fa-solid fa-user-group menu-icon"></i>
        <span>Class Members</span>
      </router-link>
      <router-link
        to="/students/profile"
        class="menu-link"
        active-class="active-menu"
        :tabindex="isResultEntry ? -1 : 0"
        :aria-disabled="isResultEntry"
        @click="handleMenuClick($event)"
      >
        <i class="fa-solid fa-user-gear menu-icon"></i>
        <span>My Profile</span>
      </router-link>
      <router-link
        to="/students/notifications"
        class="menu-link"
        active-class="active-menu"
        :tabindex="isResultEntry ? -1 : 0"
        :aria-disabled="isResultEntry"
        @click="handleMenuClick($event)"
      >
        <i class="fa-solid fa-bell menu-icon"></i>
        <span>Notifications </span>
      </router-link>
    </nav>
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

const router = useRouter()
const route = useRoute()

const isSidebarOpen = ref(false)
const role = localStorage.getItem('role')
const isResultEntry = role === 'Result Entry'

const loading = ref(false)
const message = ref('')
const isError = ref(false)
const institute = ref(null)

const branches = ref([])
const branchLoading = ref(false)
const selectedBranchId = ref(localStorage.getItem('selected_branch_id') || '')

const openMenus = reactive({
  institute: false,
  students: false,
  teachers: false,
  staff: false,
  classInfo: false,
  exam: false,
  instituteResult: false,
  smsNotification: false,
})

const instituteItems = [
  { path: '/Institure-Info', label: 'Institute Info', icon: 'fa-solid fa-circle-info' },
  { path: '/branch', label: 'Branches', icon: 'fa-solid fa-code-branch' },
  { path: '/Institure-Session', label: 'Institute Session', icon: 'fa-solid fa-calendar-days' },
  { path: '/migration', label: 'Migration', icon: 'fa-solid fa-arrows-split-up-and-left' },
  { path: '/single_student_migration', label: 'Single Migration', icon: 'fa-solid fa-user-gear' },
]

const studentItems = [
  { path: '/student', label: 'All Students', icon: 'fa-solid fa-users' },
  { path: '/student-attendance', label: 'Student Attendance', icon: 'fa-solid fa-clipboard-user' },
  {
    path: '/student-attendance-overview',
    label: 'Attendance Overview',
    icon: 'fa-solid fa-chart-pie',
  },
]

const teacherItems = [
  { path: '/teacherView', label: 'All Teachers', icon: 'fa-solid fa-id-badge' },
  { path: '/teacherattendance', label: 'Teacher Attendance', icon: 'fa-solid fa-calendar-check' },
  { path: '/AttendancOverview', label: 'Attendance Summary', icon: 'fa-solid fa-chart-column' },
  { path: '/AttendanceHistry', label: 'Attendance History', icon: 'fa-solid fa-clock-rotate-left' },
]

const staffItems = [
  { path: '/staffAttendance', label: 'Staff Attendance', icon: 'fa-solid fa-calendar-check' },
  {
    path: '/StaffAttendancOverview',
    label: 'Attendance Summary',
    icon: 'fa-solid fa-chart-column',
  },
  {
    path: '/StaffAttendanceHistry',
    label: 'Attendance History',
    icon: 'fa-solid fa-clock-rotate-left',
  },
]

const classItems = [
  { path: '/class', label: 'Class', icon: 'fa-solid fa-school' },
  { path: '/ClassGroup', label: 'Class Group', icon: 'fa-solid fa-layer-group' },
  { path: '/section', label: 'Sections', icon: 'fa-solid fa-object-group' },
]

const closeSidebar = () => {
  isSidebarOpen.value = false
}

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

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
    [
      '/exam',
      '/result',
      '/resultGrade',
      '/instituteresult',
      '/finalAvrageResult',
      '/finalAvrageResultMerit',
    ].includes(path)
  ) {
    openMenus.exam = true

    if (['/instituteresult', '/finalAvrageResultMerit'].includes(path)) {
      openMenus.instituteResult = true
    }
  } else if (
    ['/smsNotification', '/sms/send-new', '/sms/due-reminder', '/sms/attendance'].includes(path)
  ) {
    openMenus.smsNotification = true
  }
}

watch(
  () => route.path,
  () => {
    if (isResultEntry) {
      openMenus.exam = true
      openMenus.instituteResult = false
    } else {
      autoOpenMenuByRoute()
    }
  },
)

const toggleMenu = (menuKey) => {
  if (isResultEntry) return

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

// Sidebar SMS action navigation.
// SmsNotificationView.vue must read the action query to open the matching UI.
const openSmsAction = (action) => {
  if (isResultEntry) return

  const allowedActions = ['Send New SMS', 'Due Reminder', 'Attendance SMS']

  if (!allowedActions.includes(action)) return

  closeSidebar()

  router.push({
    path: '/smsNotification',
    query: { action },
  })
}

const getLogoUrl = (logo) => {
  if (!logo) return ''

  if (logo.startsWith('http://') || logo.startsWith('https://') || logo.startsWith('data:image')) {
    return logo
  }

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
  if (isResultEntry) return

  if (selectedBranchId.value) {
    localStorage.setItem('selected_branch_id', selectedBranchId.value)
  } else {
    localStorage.removeItem('selected_branch_id')
  }

  window.location.reload()
}

const runBackup = async () => {
  if (isResultEntry) return

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
      if (fileNameMatch?.[1]) fileName = fileNameMatch[1]
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

const handleMenuClick = (event) => {
  if (isResultEntry) {
    event.preventDefault()
    event.stopPropagation()
    return
  }

  closeSidebar()
}

const logout = async () => {
  try {
    await fetch(`${import.meta.env.VITE_API_URL}/student/logout`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${localStorage.getItem('student_token')}`,
      },
    })
  } catch (error) {
    console.error('Student logout error:', error)
  } finally {
    localStorage.removeItem('student_token')
    localStorage.removeItem('student_data')

    await router.push('/student/login')
  }
}

onMounted(() => {
  if (!isResultEntry) {
    fetchInstitute()
    fetchBranches()
    autoOpenMenuByRoute()
  } else {
    openMenus.exam = true
  }
})
</script>

<style scoped>
/* আপনার আগের সমস্ত CSS স্টাইলগুলো এখানে অপরিবর্তিত থাকবে */
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
  display: flex;
  flex-direction: column;
}

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

.menu-section-title {
  color: #475569;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 18px 12px 8px;
}

.sidebar-menu {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 4px;
}

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

.menu-item-has-children.open > .menu-btn-toggle {
  background: rgba(255, 255, 255, 0.03);
  color: #fff;
}

.menu-item-has-children.open > .menu-btn-toggle .chevron-icon {
  transform: rotate(90deg);
  color: #3b82f6;
}

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

.active-menu {
  background: #2563eb !important;
  color: #fff !important;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.active-menu .menu-icon {
  color: #fff !important;
}

.active-submenu {
  background: rgba(37, 99, 235, 0.2) !important;
  color: #60a5fa !important;
  font-weight: 600;
}

.active-submenu i {
  color: #60a5fa !important;
}

.active-nested-submenu {
  background: #0d9488 !important;
  color: #fff !important;
  font-weight: 600;
  box-shadow: 0 4px 10px rgba(13, 148, 136, 0.3);
}

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
  margin-top: auto;
  flex-shrink: 0;
}

.logout-btn:hover {
  background: #b91c1c;
}

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

.result-entry-disabled {
  pointer-events: none;
  opacity: 0.5;
  cursor: not-allowed;
}

.result-entry-sidebar .sidebar-menu > .menu-link,
.result-entry-sidebar .sidebar-menu > .menu-item-has-children > .menu-btn-toggle,
.result-entry-sidebar .sidebar-menu > .menu-item-has-children > .submenu-container,
.result-entry-sidebar .backup-section {
  pointer-events: none;
  opacity: 0.5;
}

.result-entry-sidebar .sidebar-menu > .menu-item-has-children.open > .submenu-container {
  pointer-events: none;
}

.result-entry-sidebar
  .sidebar-menu
  > .menu-item-has-children.open
  > .submenu-container
  a[href='/result'] {
  pointer-events: auto;
  opacity: 1;
}

.result-entry-sidebar .logout-btn {
  pointer-events: auto;
  opacity: 1;
}
</style>
