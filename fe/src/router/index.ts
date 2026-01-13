import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '../store/auth'
import { validateToken } from '../utils/tokenUtils'

declare module 'vue-router' {
  interface RouteMeta {
    title: string
    requiresAuth?: boolean
    requiresGuest?: boolean
    roles?: string[]
  }
}

const routes: Array<RouteRecordRaw> = [
  // --- 1. PUBLIC ROUTES ---
  {
    path: '/',
    name: 'LandingPage',
    component: () => import('../views/landingPage.vue'),
    meta: {
      title: 'Diskominfotik Sumbawa',
      requiresAuth: false,
    },
  },
  {
    path: '/user/detailService/:id',
    name: 'ServiceDetail',
    component: () => import('../views/Pages/detailServices.vue'),
    meta: { title: 'Detail Layanan', requiresAuth: false },
  },

  // --- 2. AUTHENTICATION ---
  {
    path: '/signin',
    name: 'Signin',
    component: () => import('../views/Auth/SigninPage.vue'),
    meta: {
      title: 'Signin',
      requiresGuest: true,
    },
  },
  {
    path: '/signup',
    name: 'Signup',
    component: () => import('../views/Auth/Signup.vue'),
    meta: {
      title: 'Signup',
      requiresGuest: true,
    },
  },

  // --- 3. ROLE: ADMIN & PIMPINAN ---
  {
    path: '/admin/dashboard',
    name: 'Analytic',
    component: () => import('../views/Dashboard/dashboardAnalytic.vue'),
    meta: { title: 'Dashboard Analitik', requiresAuth: true, roles: ['admin', 'pimpinan'] },
  },
  {
    path: '/manage-users',
    name: 'Manage User',
    component: () => import('../views/Pages/manageUsers.vue'),
    meta: { title: 'Manage Users', requiresAuth: true, roles: ['admin'] },
  },
  {
    path: '/manage-services',
    name: 'Manage Services',
    component: () => import('../views/Pages/manageServices.vue'),
    meta: { title: 'Manage Services', requiresAuth: true, roles: ['admin'] },
  },
  {
    path: '/admin/tickets',
    name: 'Manage Tickets',
    component: () => import('../views/Pages/manageTickets.vue'),
    meta: { title: 'Manage Tickets', requiresAuth: true, roles: ['admin'] },
  },
  {
    path: '/admin/feedbacks',
    name: 'Feedbacks',
    component: () => import('../views/Pages/feedback.vue'),
    meta: { title: 'Feedbacks', requiresAuth: true, roles: ['admin'] },
  },
  {
    path: '/admin/petugas/:id/performance',
    name: 'PetugasPerformance',
    component: () => import('../views/Pages/petugasPerformance.vue'),
    meta: { title: 'Petugas Performance', requiresAuth: true, roles: ['admin', 'pimpinan'] },
  },
  {
    path: '/admin/sla-ranking',
    name: 'SLARanking',
    component: () => import('../views/Pages/slaRanking.vue'),
    meta: { title: 'SLA Ranking', requiresAuth: true, roles: ['admin', 'pimpinan'] },
  },

  {
    path: '/admin/manage-sla',
    name: 'ManageSLA',
    component: () => import('../views/Pages/manageSLA.vue'),
    meta: { title: 'Manage SLA', requiresAuth: true, roles: ['admin'] },
  },
  {
    path: '/admin/manage-skills',
    name: 'ManageSkills',
    component: () => import('../views/Pages/manageSkills.vue'),
    meta: { title: 'Manage Skills', requiresAuth: true, roles: ['admin'] },
  },
  {
    path: '/admin/manage-roles',
    name: 'ManageRoles',
    component: () => import('../views/Pages/manageRoles.vue'),
    meta: { title: 'Manage Roles', requiresAuth: true, roles: ['admin'] },
  },

  // --- 4. ROLE: PETUGAS ---
  {
    path: '/petugas/dashboard',
    name: 'PetugasDashboard',
    component: () => import('../views/Dashboard/dashboardPetugas.vue'),
    meta: { title: 'Dashboard Petugas', requiresAuth: true, roles: ['petugas', 'admin'] }, // Admin bisa lihat
  },
  {
    path: '/petugas/tickets',
    name: 'TiketPetugas',
    component: () => import('../views/Pages/myTicketList.vue'),
    meta: { title: 'Tugas Saya', requiresAuth: true, roles: ['petugas', 'admin'] }, // Admin bisa lihat
  },
  {
    path: '/petugas/feedbacks',
    name: 'PetugasFeedbacks',
    component: () => import('../views/Pages/feedback.vue'),
    meta: { title: 'Feedback Petugas', requiresAuth: true, roles: ['petugas', 'admin'] },
  },

  // --- 5. ROLE: USER ---
  {
    path: '/user/dashboard',
    name: 'UserDashboard',
    component: () => import('../views/Dashboard/dashboardUser.vue'),
    meta: { title: 'Dashboard User', requiresAuth: true, roles: ['user', 'admin'] },
  },
  {
    path: '/user/tickets/create',
    name: 'CreateTicket',
    component: () => import('../views/Pages/createTicket.vue'),
    meta: { title: 'Buat Tiket', requiresAuth: true, roles: ['user'] },
  },
  {
    path: '/user/tickets',
    name: 'UserTicketList',
    component: () => import('../views/Pages/myTicketList.vue'),
    meta: { title: 'Riwayat Tiket', requiresAuth: true, roles: ['user', 'admin'] },
  },
  {
    path: '/user/services',
    name: 'UserServices',
    component: () => import('../views/Dashboard/servicesPage.vue'),
    meta: { title: 'Katalog Layanan', requiresAuth: true, roles: ['user', 'admin'] },
  },

  // --- 6. SHARED / UNIVERSAL AUTHENTICATED ROUTES ---
  {
    path: '/detail-ticket/:id',
    name: 'TicketDetail',
    component: () => import('../views/Pages/detailTicket.vue'),
    meta: {
      title: 'Detail Tiket',
      requiresAuth: true,
      roles: ['admin', 'petugas', 'user'],
    },
  },
  {
    path: '/notifications',
    name: 'Notifications',
    component: () => import('../views/Pages/notifications.vue'),
    meta: {
      title: 'Notifications',
      requiresAuth: true,
      roles: ['admin', 'petugas', 'user'],
    },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Others/UserProfile.vue'),
    meta: {
      title: 'Profile',
      requiresAuth: true,
      roles: ['admin', 'petugas', 'user'],
    },
  },

  // --- ERROR PAGES ---
  {
    path: '/:pathMatch(.*)*',
    name: '404 Error',
    component: () => import('../views/Errors/FourZeroFour.vue'),
    meta: { title: '404 Not Found' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { left: 0, top: 0 }
  },
  routes,
})

router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title} | SABALONG`

  const authStore = useAuthStore()
  
  // Enhanced authentication check dengan token validation
  let isAuthenticated = false
  const token = localStorage.getItem('token')
  
  if (token && authStore.user) {
    const validation = validateToken(token)
    if (validation.valid) {
      isAuthenticated = true
    } else {
      console.warn('Token validation failed in router:', validation.reason)
      // Auto logout jika token tidak valid
      authStore.logout()
      isAuthenticated = false
    }
  }
  
  const userRole = authStore.userRole
  const requiredRoles = to.meta.roles

  console.log('Navigating to:', to.name, to.path)
  console.log('Route meta:', to.meta)
  console.log('Is authenticated:', isAuthenticated)
  console.log('Token validation:', token ? 'Token exists' : 'No token')

  // --- Guest Protection ---
  if (to.meta.requiresGuest && isAuthenticated) {
    if (userRole === 'admin' || userRole === 'pimpinan') return next({ name: 'Analytic' })
    if (userRole === 'petugas') return next({ name: 'PetugasDashboard' })
    if (userRole === 'user') return next({ name: 'UserDashboard' })
    return next({ name: 'LandingPage' })
  }

  // --- Auth Protection ---
  if (to.meta.requiresAuth && !isAuthenticated) {
    // Store intended URL untuk redirect setelah login
    authStore.setIntendedUrl(to.fullPath)
    return next({ name: 'Signin', query: { redirect: to.fullPath } })
  }

  // --- Role Protection ---
  if (requiredRoles && requiredRoles.length > 0 && isAuthenticated) {
    if (userRole && requiredRoles.includes(userRole)) {
      return next()
    } else {
      // Role tidak cocok, lempar ke halaman not found/unauthorized
      console.warn('Access denied: insufficient role', { userRole, requiredRoles })
      return next({ name: '404 Error' })
    }
  }

  next()
})

export default router
