<template>
  <div>
    <!-- ================= MOBILE HEADER ================= -->
    <div class="mobile-topbar d-md-none">
      <button type="button" class="menu-btn" @click="toggleMenu">
        <i class="fa-solid fa-bars"></i>
      </button>

      <div class="mobile-brand">
        <h5>
          {{ institute?.institute_name || 'Coaching MS' }}
        </h5>
        <small>Management System</small>
      </div>
    </div>

    <!-- ================= SIDEBAR ================= -->
    <div :class="['sidebar', { open: isOpen }]">
      <!-- ================= INSTITUTE LOGO ================= -->
      <div class="sidebar-logo">
        <div class="logo-box">
          <img
            v-if="institute?.logo"
            :src="getLogoUrl(institute.logo)"
            :alt="institute?.institute_name || 'Institute Logo'"
            class="institute-logo"
          />
          <i v-else class="fa-solid fa-graduation-cap"></i>
        </div>

        <div class="logo-text">
          <h4>
            {{ institute?.institute_name || 'Coaching MS' }}
          </h4>
          <span>Management System</span>
        </div>
      </div>

      <!-- ================= MENU ================= -->
      <div class="sidebar-menu">
        <!-- DASHBOARD -->
        <router-link
          to="/account/dashboard"
          class="menu-item"
          active-class="active-menu"
          @click="closeMenu"
        >
          <i class="fa-solid fa-chart-line"></i>
          <span>Dashboard</span>
        </router-link>

        <!-- STUDENT PAYMENT -->
        <router-link
          to="/student/payment"
          class="menu-item"
          active-class="active-menu"
          @click="closeMenu"
        >
          <i class="fa-solid fa-money-bill-wave"></i>
          <span>Student Payment</span>
        </router-link>

        <!-- STUDENT DUE PAYMENT -->
        <router-link
          to="/student/due_payment"
          class="menu-item"
          active-class="active-menu"
          @click="closeMenu"
        >
          <i class="fa-solid fa-money-bill-wave"></i>
          <span>Student Due Payment</span>
        </router-link>

        <!-- OTHERS PAYMENT -->
        <router-link
          to="/others-payment"
          class="menu-item"
          active-class="active-menu"
          @click="closeMenu"
        >
          <i class="fa-solid fa-wallet"></i>
          <span>Others Payment</span>
        </router-link>

        <!-- PAYMENT HISTORY -->
        <router-link
          to="/payment/history"
          class="menu-item"
          active-class="active-menu"
          @click="closeMenu"
        >
          <i class="fa-solid fa-clock-rotate-left"></i>
          <span>Payment History</span>
        </router-link>

        <!-- SINGLE STUDENT PAYMENT -->
        <router-link
          to="/payment/single"
          class="menu-item"
          active-class="active-menu"
          @click="closeMenu"
        >
          <i class="fa-solid fa-user-check"></i>
          <span>Single Student Payment</span>
        </router-link>

        <!-- REGISTER & LEDGER ACCORDION DROPDOWN -->
        <div class="menu-item-has-children" :class="{ open: openMenus.registerLedger }">
          <button class="menu-btn-toggle" @click="toggleMenuAccordion('registerLedger')">
            <span class="btn-text">
              <i class="fa-solid fa-user-graduate menu-icon"></i>
              <span>Register & Ledger</span>
            </span>
            <i class="fa-solid fa-chevron-right chevron-icon"></i>
          </button>

          <div class="submenu-container">
            <router-link
              to="/registerKhata"
              class="submenu-link"
              active-class="active-submenu"
              @click="closeMenu"
            >
              <i class="fa-solid fa-users"></i>
              <span>All History Of Register</span>
            </router-link>
            <router-link
              to="/ledger"
              class="submenu-link"
              active-class="active-submenu"
              @click="closeMenu"
            >
              <i class="fa-solid fa-users"></i>
              <span>All History Of Ledger</span>
            </router-link>
            <button
              type="button"
              class="submenu-link text-start border-0 bg-transparent w-100"
              data-bs-toggle="modal"
              data-bs-target="#addModal"
            >
              <i class="fa-solid fa-user-plus"></i>
              <span>Add Student</span>
            </button>
          </div>
        </div>

        <!-- EXPENSE -->
        <router-link to="/expense" class="menu-item" active-class="active-menu" @click="closeMenu">
          <i class="fa-solid fa-money-check-dollar"></i>
          <span>Expense</span>
        </router-link>

        <!-- MAIN DASHBOARD -->
        <router-link
          v-if="role === 'Manager' || role === 'Branch Manager'"
          to="/dashboard"
          class="menu-item"
          active-class="active-menu"
          @click="closeMenu"
        >
          <i class="fa-solid fa-gauge-high"></i>
          <span>Main Dashboard</span>
        </router-link>
      </div>

      <!-- ================= FOOTER ================= -->
      <div class="logout-section">
        <button type="button" @click="logout" class="logout-btn">
          <i class="fa-solid fa-right-from-bracket"></i>
          <span>Logout</span>
        </button>
      </div>
    </div>

    <!-- ================= OVERLAY ================= -->
    <div v-if="isOpen" class="sidebar-overlay d-md-none" @click="closeMenu"></div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '@/services/api'

const router = useRouter()
const route = useRoute()

const isOpen = ref(false)
const role = localStorage.getItem('role')
const institute = ref(null)

// Accordion Toggle State
const openMenus = reactive({
  registerLedger: false,
})

// Auto open dropdown based on current route
const autoOpenMenuByRoute = () => {
  const path = route.path
  if (['/registerKhata', '/ledger'].includes(path)) {
    openMenus.registerLedger = true
  }
}

watch(
  () => route.path,
  () => {
    autoOpenMenuByRoute()
  },
)

const toggleMenuAccordion = (menuKey) => {
  openMenus[menuKey] = !openMenus[menuKey]
}

const fetchInstitute = async () => {
  try {
    const response = await api.get('/institute-info')
    institute.value = response.data.data || null
  } catch (error) {
    console.error('Institute API failed:', error)
    institute.value = null
  }
}

const getLogoUrl = (logo) => {
  if (!logo) return ''
  if (logo.startsWith('data:image')) return logo

  const apiBaseUrl = api.defaults.baseURL || ''
  const storageBaseUrl = apiBaseUrl.replace(/\/api\/?$/, '')

  if (logo.startsWith('http://') || logo.startsWith('https://')) {
    try {
      const logoUrl = new URL(logo)
      if (logoUrl.hostname === '127.0.0.1' || logoUrl.hostname === 'localhost') {
        const cleanPath = logoUrl.pathname.replace(/^\/+/, '')
        return `${storageBaseUrl}/${cleanPath}`
      }
      return logo
    } catch (error) {
      return ''
    }
  }

  if (logo.startsWith('/storage/')) return `${storageBaseUrl}${logo}`
  if (logo.startsWith('storage/')) return `${storageBaseUrl}/${logo}`
  return `${storageBaseUrl}/storage/${logo}`
}

const toggleMenu = () => {
  isOpen.value = !isOpen.value
}

const closeMenu = () => {
  isOpen.value = false
}

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('role')
  isOpen.value = false
  router.push('/login')
}

onMounted(() => {
  fetchInstitute()
  autoOpenMenuByRoute()
})
</script>

<style scoped>
/* =========================================================
    SIDEBAR
========================================================= */
.sidebar {
  width: 260px;
  min-height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  background: #111827;
  display: flex;
  flex-direction: column;
  padding: 22px 18px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.18);
  z-index: 1000;
  transition: 0.35s;
}

/* SIDEBAR LOGO */
.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 14px;
  padding-bottom: 22px;
  margin-bottom: 22px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.logo-box {
  width: 52px;
  height: 52px;
  background-color: transparent !important;
  border-radius: 14px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
  font-size: 24px;
  overflow: hidden;
  flex-shrink: 0;
}

.institute-logo {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 5px;
  border-radius: 12px;
  display: block;
}

.logo-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.logo-text h4 {
  color: #fff;
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.3;
  word-break: break-word;
}

.logo-text span {
  color: #94a3b8;
  font-size: 13px;
  margin-top: 2px;
}

.sidebar-menu {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* MOBILE HEADER */
.mobile-topbar {
  display: none;
  position: sticky;
  top: 0;
  background: #111827;
  color: #fff;
  padding: 14px 18px;
  align-items: center;
  gap: 14px;
  z-index: 999;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

.mobile-brand {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.mobile-brand h5 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 250px;
}

.mobile-brand small {
  color: #94a3b8;
}

.menu-btn {
  background: none;
  border: none;
  color: #fff;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
}

/* MENU ITEM */
.menu-item {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 11px 16px;
  border-radius: 10px;
  text-decoration: none;
  color: #d1d5db;
  font-size: 14.5px;
  font-weight: 500;
  transition: 0.25s ease;
}

.menu-item i {
  width: 20px;
  text-align: center;
  font-size: 15px;
  color: #9ca3af;
  transition: 0.25s;
}

.menu-item span {
  flex: 1;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  transform: translateX(4px);
}

.menu-item:hover i {
  color: #60a5fa;
}

/* ACTIVE MENU */
.active-menu {
  background: #2563eb !important;
  color: #fff !important;
  box-shadow: 0 8px 18px rgba(37, 99, 235, 0.35);
  font-weight: 600;
}

.active-menu i {
  color: #fff !important;
}

/* =========================================================
    ACCORDION DROPDOWN STYLING
========================================================= */
.menu-item-has-children {
  width: 100%;
}

.menu-btn-toggle {
  width: 100%;
  background: transparent;
  border: none;
  outline: none;
  color: #d1d5db;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 11px 16px;
  border-radius: 10px;
  font-size: 14.5px;
  font-weight: 500;
  transition: all 0.25s ease;
  cursor: pointer;
}

.btn-text {
  display: flex;
  align-items: center;
  gap: 14px;
}

.menu-btn-toggle:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.menu-btn-toggle:hover .menu-icon {
  color: #60a5fa;
}

.chevron-icon {
  font-size: 11px;
  color: #9ca3af;
  transition:
    transform 0.25s ease,
    color 0.25s ease;
}

.menu-item-has-children.open > .menu-btn-toggle {
  background: rgba(255, 255, 255, 0.04);
  color: #fff;
}

.menu-item-has-children.open > .menu-btn-toggle .chevron-icon {
  transform: rotate(90deg);
  color: #60a5fa;
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

.active-submenu {
  background: rgba(37, 99, 235, 0.2) !important;
  color: #60a5fa !important;
  font-weight: 600;
}

.active-submenu i {
  color: #60a5fa !important;
}

/* FOOTER */
.logout-section {
  margin-top: auto;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.logout-btn {
  width: 100%;
  border: none;
  outline: none;
  background: #ef4444;
  color: #fff;
  padding: 12px 16px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 14.5px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.25s;
}

.logout-btn:hover {
  background: #dc2626;
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(239, 68, 68, 0.35);
}

/* SCROLLBAR */
.sidebar::-webkit-scrollbar {
  width: 6px;
}
.sidebar::-webkit-scrollbar-thumb {
  background: #334155;
  border-radius: 20px;
}

/* OVERLAY */
.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(2px);
  z-index: 999;
}

@media (max-width: 767px) {
  .mobile-topbar {
    display: flex;
  }
  .sidebar {
    left: -280px;
    width: 260px;
    height: 100vh;
    overflow-y: auto;
  }
  .sidebar.open {
    left: 0;
  }
}

@media (min-width: 768px) {
  .sidebar {
    left: 0;
  }
}
</style>
