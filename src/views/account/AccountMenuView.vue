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
          <!-- Dynamic Institute Logo -->
          <img
            v-if="institute?.logo"
            :src="getLogoUrl(institute.logo)"
            :alt="institute?.institute_name || 'Institute Logo'"
            class="institute-logo"
          />

          <!-- Default Logo -->
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
        <!-- ================= DASHBOARD ================= -->

        <router-link
          to="/account/dashboard"
          class="menu-item"
          active-class="active-menu"
          @click="closeMenu"
        >
          <i class="fa-solid fa-chart-line"></i>
          <span>Dashboard</span>
        </router-link>

        <!-- ================= STUDENT PAYMENT ================= -->

        <router-link
          to="/student/payment"
          class="menu-item"
          active-class="active-menu"
          @click="closeMenu"
        >
          <i class="fa-solid fa-money-bill-wave"></i>
          <span>Student Payment</span>
        </router-link>

        <!-- ================= OTHERS PAYMENT ================= -->

        <router-link
          to="/others-payment"
          class="menu-item"
          active-class="active-menu"
          @click="closeMenu"
        >
          <i class="fa-solid fa-wallet"></i>
          <span>Others Payment</span>
        </router-link>

        <!-- ================= PAYMENT HISTORY ================= -->

        <router-link
          to="/payment/history"
          class="menu-item"
          active-class="active-menu"
          @click="closeMenu"
        >
          <i class="fa-solid fa-clock-rotate-left"></i>
          <span>Payment History</span>
        </router-link>

        <!-- ================= SINGLE STUDENT PAYMENT ================= -->

        <router-link
          to="/payment/single"
          class="menu-item"
          active-class="active-menu"
          @click="closeMenu"
        >
          <i class="fa-solid fa-user-check"></i>
          <span>Single Student Payment</span>
        </router-link>

        <!-- ================= EXPENSE ================= -->

        <router-link to="/expense" class="menu-item" active-class="active-menu" @click="closeMenu">
          <i class="fa-solid fa-money-check-dollar"></i>
          <span>Expense</span>
        </router-link>

        <!-- ================= MAIN DASHBOARD ================= -->

        <!-- ================= MAIN DASHBOARD ================= -->
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'

// ============================================================
// ROUTER
// ============================================================

const router = useRouter()

// ============================================================
// SIDEBAR
// ============================================================

const isOpen = ref(false)

// ============================================================
// USER ROLE
// ============================================================

const role = localStorage.getItem('role')

// ============================================================
// INSTITUTE
// ============================================================

const institute = ref(null)

// ============================================================
// FETCH INSTITUTE INFORMATION
// ============================================================

const fetchInstitute = async () => {
  console.log('🔥 FETCH INSTITUTE API RUNNING')

  try {
    console.time('api-fetch-institute')

    const response = await api.get('/institute-info')

    console.timeEnd('api-fetch-institute')

    console.log('INSTITUTE API STATUS:', response.status)
    console.log('INSTITUTE API DATA:', response.data)

    institute.value = response.data.data || null
  } catch (error) {
    console.error('Institute API failed:', error)

    if (error.response) {
      console.error('API STATUS:', error.response.status)
      console.error('API DATA:', error.response.data)
    }

    institute.value = null
  }
}

// ============================================================
// LOGO URL
// ============================================================

const getLogoUrl = (logo) => {
  if (!logo) {
    return ''
  }

  // ----------------------------------------------------------
  // Data URL
  // ----------------------------------------------------------

  if (logo.startsWith('data:image')) {
    return logo
  }

  // ----------------------------------------------------------
  // Find API base URL
  // ----------------------------------------------------------

  const apiBaseUrl = api.defaults.baseURL || ''

  // Example:
  //
  // VITE_API_URL =
  // https://icon.shahedislam.xyz/public/api
  //
  // We need:
  //
  // https://icon.shahedislam.xyz/public
  //
  // because storage is outside /api.
  //

  const storageBaseUrl = apiBaseUrl.replace(/\/api\/?$/, '')

  // ----------------------------------------------------------
  // Already full URL
  // ----------------------------------------------------------

  if (logo.startsWith('http://') || logo.startsWith('https://')) {
    try {
      const logoUrl = new URL(logo)

      // If backend accidentally sends local URL
      // replace it with current API server.

      if (logoUrl.hostname === '127.0.0.1' || logoUrl.hostname === 'localhost') {
        const cleanPath = logoUrl.pathname.replace(/^\/+/, '')

        return `${storageBaseUrl}/${cleanPath}`
      }

      // Production/external full URL
      return logo
    } catch (error) {
      console.error('Invalid logo URL:', logo)

      return ''
    }
  }

  // ----------------------------------------------------------
  // /storage/...
  // ----------------------------------------------------------

  if (logo.startsWith('/storage/')) {
    return `${storageBaseUrl}${logo}`
  }

  // ----------------------------------------------------------
  // storage/...
  // ----------------------------------------------------------

  if (logo.startsWith('storage/')) {
    return `${storageBaseUrl}/${logo}`
  }

  // ----------------------------------------------------------
  // institute/...
  // ----------------------------------------------------------

  return `${storageBaseUrl}/storage/${logo}`
}

// ============================================================
// TOGGLE SIDEBAR
// ============================================================

const toggleMenu = () => {
  isOpen.value = !isOpen.value
}

// ============================================================
// CLOSE SIDEBAR
// ============================================================

const closeMenu = () => {
  isOpen.value = false
}

// ============================================================
// LOGOUT
// ============================================================

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('role')

  isOpen.value = false

  router.push('/login')
}

// ============================================================
// MOUNT
// ============================================================

onMounted(() => {
  fetchInstitute()
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

/* =========================================================
   SIDEBAR LOGO
========================================================= */

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 14px;
  padding-bottom: 22px;
  margin-bottom: 22px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

/* =========================================================
   LOGO BOX
========================================================= */

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

/* =========================================================
   INSTITUTE LOGO
========================================================= */

.institute-logo {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 5px;
  border-radius: 12px;
  display: block;
}

/* =========================================================
   LOGO TEXT
========================================================= */

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

/* =========================================================
   MENU WRAPPER
========================================================= */

.sidebar-menu {
  flex: 1;
}

/* =========================================================
   MOBILE HEADER
========================================================= */

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

/* =========================================================
   MENU ITEM
========================================================= */

.menu-item {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 13px 16px;
  margin-bottom: 8px;
  border-radius: 12px;
  text-decoration: none;
  color: #d1d5db;
  font-size: 15px;
  font-weight: 500;
  transition: 0.25s ease;
}

.menu-item i {
  width: 20px;
  text-align: center;
  font-size: 16px;
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

/* =========================================================
   ACTIVE MENU
========================================================= */

.active-menu {
  background: #2563eb !important;
  color: #fff !important;
  box-shadow: 0 8px 18px rgba(37, 99, 235, 0.35);
}

.active-menu i {
  color: #fff !important;
}

/* =========================================================
   SIDEBAR FOOTER
========================================================= */

.logout-section {
  margin-top: auto;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

/* =========================================================
   LOGOUT BUTTON
========================================================= */

.logout-btn {
  width: 100%;
  border: none;
  outline: none;
  background: #ef4444;
  color: #fff;
  padding: 13px 16px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.25s;
}

.logout-btn:hover {
  background: #dc2626;
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(239, 68, 68, 0.35);
}

/* =========================================================
   SCROLLBAR
========================================================= */

.sidebar::-webkit-scrollbar {
  width: 6px;
}

.sidebar::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar::-webkit-scrollbar-thumb {
  background: #334155;
  border-radius: 20px;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background: #475569;
}

/* =========================================================
   OVERLAY
========================================================= */

.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(2px);
  z-index: 999;
}

/* =========================================================
   MOBILE
========================================================= */

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

/* =========================================================
   DESKTOP
========================================================= */

@media (min-width: 768px) {
  .sidebar {
    left: 0;
  }
}

/* =========================================================
   SMALL MOBILE
========================================================= */

@media (max-width: 400px) {
  .mobile-topbar {
    padding: 12px 14px;
  }

  .mobile-brand h5 {
    font-size: 16px;
    max-width: 210px;
  }

  .logo-box {
    width: 46px;
    height: 46px;
  }

  .logo-text h4 {
    font-size: 15px;
  }

  .logo-text span {
    font-size: 11px;
  }
}

/* =========================================================
   BOX SIZING
========================================================= */

.sidebar * {
  box-sizing: border-box;
}

/* =========================================================
   ACTIVE / CLICK EFFECT
========================================================= */

.menu-item:active,
.logout-btn:active {
  transform: scale(0.98);
}
</style>
