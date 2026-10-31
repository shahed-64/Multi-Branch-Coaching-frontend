<template>
  <div class="dashboard-container">
    <!-- Sidebar Component -->
    <StudentsDashboardMenueView />

    <!-- Main Dashboard Wrapper -->
    <div class="main-wrapper p-3 p-md-4">
      <!-- Top Modern Header -->
      <header
        class="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-3 border-bottom"
      >
        <div>
          <h3 class="fw-bold text-dark mb-1">Notifications</h3>
          <p class="text-muted fs-sm mb-0">
            Stay updated with your latest academic alerts, payments, and notices.
          </p>
        </div>

        <div class="d-flex align-items-center gap-2">
          <button
            @click="markAllAsRead"
            class="btn btn-light border bg-white btn-sm fw-semibold px-3 py-2 rounded-3 shadow-sm fs-xs text-primary"
            :disabled="unreadCount === 0"
          >
            <i class="bi bi-check2-all me-1"></i> Mark All as Read
          </button>
          <button
            @click="clearAll"
            class="btn btn-light border bg-white btn-sm fw-semibold px-3 py-2 rounded-3 shadow-sm fs-xs text-danger"
          >
            <i class="bi bi-trash me-1"></i> Clear All
          </button>
        </div>
      </header>

      <!-- Main Notification Box Container -->
      <div class="card border-0 shadow-sm rounded-4 p-4 bg-white">
        <!-- Filter Tabs & Counter -->
        <div
          class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4 pb-3 border-bottom"
        >
          <div class="d-flex flex-wrap gap-2">
            <button
              v-for="tab in ['All', 'Unread', 'Exam', 'Payment', 'Academic']"
              :key="tab"
              @click="activeTab = tab"
              class="btn btn-sm rounded-pill px-3 fs-xs fw-semibold transition-all"
              :class="activeTab === tab ? 'btn-primary shadow-sm' : 'btn-light border text-dark'"
            >
              {{ tab }}
              <span
                v-if="tab === 'Unread' && unreadCount > 0"
                class="badge bg-white text-primary ms-1 px-1.5 rounded-circle"
                >{{ unreadCount }}</span
              >
            </button>
          </div>

          <div class="badge bg-light text-muted border px-3 py-2 rounded-pill fs-xs">
            Total Unread: <strong class="text-primary">{{ unreadCount }}</strong>
          </div>
        </div>

        <!-- Notification List -->
        <div v-if="filteredNotifications.length > 0" class="d-flex flex-column gap-3">
          <div
            v-for="item in filteredNotifications"
            :key="item.id"
            class="notification-card p-3.5 rounded-4 border transition-all cursor-pointer d-flex align-items-start gap-3 position-relative"
            :class="item.isRead ? 'bg-white border-light' : 'unread-highlight'"
            @click="markAsRead(item)"
          >
            <!-- Category Icon Box -->
            <div
              class="icon-box rounded-3 d-flex align-items-center justify-content-center flex-shrink-0 shadow-2xs"
              :class="item.iconBgClass"
              style="width: 48px; height: 48px"
            >
              <i :class="[item.icon, item.iconColorClass]" class="fs-5"></i>
            </div>

            <!-- Content Details -->
            <div class="flex-grow-1">
              <div class="d-flex flex-wrap justify-content-between align-items-center gap-1 mb-1">
                <div class="d-flex align-items-center gap-2">
                  <h6 class="fw-bold text-dark mb-0 fs-sm">{{ item.title }}</h6>
                  <span
                    v-if="!item.isRead"
                    class="badge bg-primary bg-opacity-10 text-primary fs-2xs px-2 py-0.5 rounded-pill"
                    >New</span
                  >
                </div>
                <small class="text-muted fs-xs"
                  ><i class="bi bi-clock me-1"></i>{{ item.time }}</small
                >
              </div>
              <p class="text-secondary fs-xs mb-0 lh-relaxed">{{ item.message }}</p>
            </div>

            <!-- Delete Single Notification Button -->
            <button
              @click.stop="deleteNotification(item.id)"
              class="btn btn-link text-muted p-1 border-0 shadow-none hover-danger"
              title="Remove"
            >
              <i class="bi bi-x-lg fs-6"></i>
            </button>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-5">
          <div class="mb-3">
            <i class="bi bi-bell-slash fs-1 text-muted opacity-50"></i>
          </div>
          <h6 class="fw-bold text-dark">No Notifications Available</h6>
          <p class="text-muted fs-xs mb-0">You're completely caught up with all your updates!</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import StudentsDashboardMenueView from './StudentsDashboardMenueView.vue'

const activeTab = ref('All')

// Mock Notification Data
const notifications = ref([
  {
    id: 1,
    title: 'Midterm Exam Routine Published',
    message:
      'The midterm examination schedule for Fall 2026 has been published. Please check your exam portal for details.',
    category: 'Exam',
    time: '10 mins ago',
    isRead: false,
    icon: 'bi-file-earmark-spreadsheet-fill',
    iconBgClass: 'bg-danger-subtle',
    iconColorClass: 'text-danger',
  },
  {
    id: 2,
    title: 'Payment Confirmed Successfully',
    message:
      'Your payment of ৳1,500 via bKash for Semester Fee has been verified successfully (TrxID: TRX893247923).',
    category: 'Payment',
    time: '2 hours ago',
    isRead: false,
    icon: 'bi-check-circle-fill',
    iconBgClass: 'bg-success-subtle',
    iconColorClass: 'text-success',
  },
  {
    id: 3,
    title: 'New Assignment Assigned',
    message:
      'Mr. Tanvir Ahmed uploaded a new task: "Data Structures Implementation". Due Date: 28 Oct 2026.',
    category: 'Academic',
    time: '1 day ago',
    isRead: true,
    icon: 'bi-journal-text',
    iconBgClass: 'bg-primary-subtle',
    iconColorClass: 'text-primary',
  },
  {
    id: 4,
    title: 'Class Attendance Updated',
    message: 'Your attendance for Physics (PH105) on 24 Oct 2026 has been marked as Present.',
    category: 'Academic',
    time: '2 days ago',
    isRead: true,
    icon: 'bi-person-check-fill',
    iconBgClass: 'bg-info-subtle',
    iconColorClass: 'text-info',
  },
])

// Computed property for filtering notifications
const filteredNotifications = computed(() => {
  if (activeTab.value === 'All') return notifications.value
  if (activeTab.value === 'Unread') return notifications.value.filter((n) => !n.isRead)
  return notifications.value.filter((n) => n.category === activeTab.value)
})

// Unread Count
const unreadCount = computed(() => {
  return notifications.value.filter((n) => !n.isRead).length
})

// Methods
const markAsRead = (item) => {
  item.isRead = true
}

const markAllAsRead = () => {
  notifications.value.forEach((n) => (n.isRead = true))
}

const deleteNotification = (id) => {
  notifications.value = notifications.value.filter((n) => n.id !== id)
}

const clearAll = () => {
  if (confirm('Are you sure you want to clear all notifications?')) {
    notifications.value = []
  }
}
</script>

<style scoped>
/* Layout styling */
.dashboard-container {
  display: flex;
  min-height: 100vh;
  background-color: #f4f6f9;
}

.main-wrapper {
  margin-left: 260px;
  flex-grow: 1;
  width: calc(100% - 260px);
}

@media (max-width: 992px) {
  .main-wrapper {
    margin-left: 0;
    width: 100%;
  }
}

/* Notification Card Special Styling */
.notification-card {
  transition: all 0.25s ease-in-out;
  border-left: 4px solid transparent !important;
}

.unread-highlight {
  background-color: #f0f4ff !important;
  border-color: #d0e1fd !important;
  border-left: 4px solid #1e63e9 !important;
  box-shadow: 0 2px 8px rgba(30, 99, 233, 0.05);
}

.notification-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.05) !important;
}

.hover-danger:hover {
  color: #dc3545 !important;
}

.fs-2xs {
  font-size: 0.65rem;
}

.fs-xs {
  font-size: 0.75rem;
}

.fs-sm {
  font-size: 0.85rem;
}

.cursor-pointer {
  cursor: pointer;
}

.transition-all {
  transition: all 0.2s ease-in-out;
}
</style>
