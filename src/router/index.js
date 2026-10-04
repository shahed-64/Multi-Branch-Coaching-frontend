import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    {
      path: '/',
      redirect: '/login',
    },

    {
      path: '/login',
      name: 'loginView',
      component: () => import('../views/loginView.vue'),
      meta: { guest: true },
    },

    {
      path: '/dashboard',
      name: 'dashboardView',
      component: () => import('../views/dashboardView.vue'),
      meta: {
        requiresAuth: true,
        role: ['Admin', 'Manager', 'Branch Manager'],
      },
    },

    {
      path: '/branch',
      name: 'BranchesdView',
      component: () => import('../views/BranchesView.vue'),
      meta: {
        requiresAuth: true,
        role: ['Admin', 'Manager', 'Branch Manager'],
      },
    },

    {
      path: '/Institure-Info',
      name: 'InstututeInfo',
      component: () => import('../views/InstituteInformationView.vue'),
      meta: {
        requiresAuth: true,
        role: ['Admin', 'Manager', 'Branch Manager'],
      },
    },

    {
      path: '/shift',
      name: 'shiftView',
      component: () => import('../views/ShifPagetView.vue'),
      meta: {
        requiresAuth: true,
        role: ['Admin', 'Manager', 'Branch Manager'],
      },
    },

    {
      path: '/section',
      name: 'SectionView',
      component: () => import('../views/SectionView.vue'),
      meta: {
        requiresAuth: true,
        role: ['Admin', 'Manager', 'Branch Manager'],
      },
    },

    {
      path: '/class',
      name: 'ClassView',
      component: () => import('../views/ClassView.vue'),
      meta: {
        requiresAuth: true,
        role: ['Admin', 'Manager', 'Branch Manager'],
      },
    },

    {
      path: '/exam',
      name: 'ExaminationView',
      component: () => import('../views/ExaminationView.vue'),
      meta: {
        requiresAuth: true,
        role: ['Admin', 'Manager', 'Branch Manager'],
      },
    },

    {
      path: '/resultShow',
      name: 'ResultPage',
      component: () => import('../views/ResultPageView.vue'),
      meta: {
        requiresAuth: true,
        role: ['Admin', 'Manager', 'Branch Manager'],
      },
    },

    {
      path: '/result',
      name: 'Result',
      component: () => import('../views/ResultView.vue'),
      meta: {
        requiresAuth: true,
        role: ['Admin', 'Manager', 'Branch Manager'],
      },
    },

    {
      path: '/resultGrade',
      name: 'ResultGrade',
      component: () => import('../views/ResultGradeView.vue'),
      meta: {
        requiresAuth: true,
        role: ['Admin', 'Manager', 'Branch Manager'],
      },
    },

    {
      path: '/finalAvrageResult',
      name: 'FinalAvrageResult',
      component: () => import('../views/finalAvrageResultView.vue'),
      meta: {
        requiresAuth: true,
        role: ['Admin', 'Manager', 'Branch Manager'],
      },
    },

    {
      path: '/finalAvragePdfView',
      name: 'FinalAvragePdf',
      component: () => import('../views/finalAvragePdfView.vue'),
      meta: {
        requiresAuth: true,
        role: ['Admin', 'Manager', 'Branch Manager'],
      },
    },

    {
      path: '/SingularStudentFinalResultView',
      name: 'SingularStudentFinalResul',
      component: () => import('../views/SingularStudentFinalResultView.vue'),
      meta: {
        requiresAuth: true,
        role: ['Admin', 'Manager', 'Branch Manager'],
      },
    },

    {
      path: '/student',
      name: 'studentView',
      component: () => import('../views/studentView.vue'),
      meta: {
        requiresAuth: true,
        role: ['Admin', 'Manager', 'Branch Manager'],
      },
    },
    {
      path: '/student-attendance-overview',
      name: 'StudentAttendanceOverView',
      component: () => import('../views/StudentAttendanceOverView.vue'),
      meta: {
        requiresAuth: true,
        role: ['Admin', 'Manager', 'Branch Manager'],
      },
    },
    {
      path: '/student-attendance',
      name: 'StudentAttendanceView',
      component: () => import('../views/StudentAttendanceView.vue'),
      meta: {
        requiresAuth: true,
        role: ['Admin', 'Manager', 'Branch Manager'],
      },
    },

    {
      path: '/subject',
      name: 'subjectView',
      component: () => import('../views/SubjectView.vue'),
      meta: {
        requiresAuth: true,
        role: ['Admin', 'Manager', 'Branch Manager'],
      },
    },

    {
      path: '/staff',
      name: 'staffView',
      component: () => import('../views/staffView.vue'),
      meta: {
        requiresAuth: true,
        role: ['Admin', 'Manager', 'Branch Manager'],
      },
    },

    {
      path: '/staffAttendance',
      name: 'StaffAttendanceView',
      component: () => import('../views/StaffAttendanceView.vue'),
      meta: {
        requiresAuth: true,
        role: ['Admin', 'Manager', 'Branch Manager'],
      },
    },

    {
      path: '/account/dashboard',
      name: 'AccountDashboard',
      component: () => import('@/views/account/AccountDeshboardView.vue'),
      meta: {
        requiresAuth: true,
        role: ['Accountant', 'Manager', 'Branch Manager'],
      },
    },

    {
      path: '/payment/history',
      name: 'PaymentHistory',
      component: () => import('@/views/account/PaymentHistoryView.vue'),
      meta: {
        requiresAuth: true,
        role: ['Accountant', 'Manager', 'Branch Manager'],
      },
    },

    {
      path: '/paymentPDF/:id',
      name: 'paymentPDF',
      component: () => import('@/views/account/PaymentPdfView.vue'),
      meta: {
        requiresAuth: true,
        role: ['Accountant', 'Manager', 'Branch Manager'],
      },
    },

    {
      path: '/singlePayment/:id',
      name: 'singlePayment',
      component: () => import('@/views/account/SinglePaymentPdfView.vue'),
      meta: {
        requiresAuth: true,
        role: ['Accountant', 'Manager', 'Branch Manager'],
      },
    },

    {
      path: '/payment/single',
      name: 'singleStudentPayment',
      component: () => import('@/views/account/SingleStudentPaymentView.vue'),
      meta: {
        requiresAuth: true,
        role: ['Accountant', 'Manager', 'Branch Manager'],
      },
    },

    {
      path: '/student/payment',
      name: 'StudentPayment',
      component: () => import('@/views/account/StudentPaymentView.vue'),
      meta: {
        requiresAuth: true,
        role: ['Accountant', 'Manager', 'Branch Manager'],
      },
    },

    {
      path: '/dash-page',
      name: 'dashPageView',
      component: () => import('../views/dashPageView.vue'),
      meta: {
        requiresAuth: true,
      },
    },

    {
      path: '/ClassGroup',
      name: 'ClassGroup',
      component: () => import('../views/ClassGroupView.vue'),
      meta: {
        requiresAuth: true,
      },
    },

    {
      path: '/others-payment',
      name: 'othersPayment',
      component: () => import('@/views/account/OthersPaymentView.vue'),
      meta: {
        requiresAuth: true,
      },
    },

    {
      path: '/expense',
      name: 'expense',
      component: () => import('@/views/account/ExpenseDashboardView.vue'),
      meta: {
        requiresAuth: true,
      },
    },

    {
      path: '/teacherView',
      name: 'teacher',
      component: () => import('../views/TeachersView.vue'),
      meta: {
        requiresAuth: true,
        role: ['Admin', 'Manager', 'Branch Manager'],
      },
    },

    {
      path: '/teachers',
      name: 'teachersView',
      component: () => import('../views/TeachersView.vue'),
      meta: {
        requiresAuth: true,
        role: ['Admin', 'Manager', 'Branch Manager'],
      },
    },

    {
      path: '/teacherattendance',
      name: 'teacherAttendence',
      component: () => import('../views/TeacherAttendanceView.vue'),
      meta: {
        requiresAuth: true,
        role: ['Admin', 'Manager', 'Branch Manager'],
      },
    },

    {
      path: '/AttendanceHistry',
      name: 'teacherAttendanceHistryView',
      component: () => import('../views/AttendanceHistryView.vue'),
      meta: {
        requiresAuth: true,
        role: ['Admin', 'Manager', 'Branch Manager'],
      },
    },

    {
      path: '/StaffAttendanceHistry',
      name: 'StaffAttendanceHistryView',
      component: () => import('../views/StaffAttendanceHistryView.vue'),
      meta: {
        requiresAuth: true,
        role: ['Admin', 'Manager', 'Branch Manager'],
      },
    },

    {
      path: '/AttendancOverview',
      name: 'teacherAttendanceOverview',
      component: () => import('../views/AttendanceOverviewView.vue'),
      meta: {
        requiresAuth: true,
        role: ['Admin', 'Manager', 'Branch Manager'],
      },
    },

    {
      path: '/StaffAttendancOverview',
      name: 'StaffAttendanceOverview',
      component: () => import('../views/StaffAttendanceOverviewView.vue'),
      meta: {
        requiresAuth: true,
        role: ['Admin', 'Manager', 'Branch Manager'],
      },
    },

    {
      path: '/holiday',
      name: 'HOlidaysView',
      component: () => import('../views/HolidaysView.vue'),
      meta: {
        requiresAuth: true,
        role: ['Admin', 'Manager', 'Branch Manager'],
      },
    },

    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('../views/NotFoundView.vue'),
    },
  ],
})

/* 🔥 SAFE & INFINITE-LOOP-FREE GLOBAL GUARD */

router.beforeEach((to) => {
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')

  // 1. Check if authentication is required
  if (to.meta.requiresAuth && !token) {
    return { name: 'loginView' }
  }

  // 2. Check if already logged in and trying to access guest routes
  if (to.meta.guest && token) {
    if (to.name === 'loginView') {
      return role === 'Accountant' ? { name: 'AccountDashboard' } : { name: 'dashboardView' }
    }
  }

  // 3. Check role permissions safely
  if (to.meta.role && token) {
    if (!to.meta.role.includes(role)) {
      const targetRoute = role === 'Accountant' ? 'AccountDashboard' : 'dashboardView'

      // Prevent infinite redirection
      if (to.name !== targetRoute) {
        return { name: targetRoute }
      }
    }
  }

  return true
})

export default router
