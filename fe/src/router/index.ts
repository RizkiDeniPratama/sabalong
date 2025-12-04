import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../store/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { left: 0, top: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'LandingPage',
      component: () => import('../views/landingPage.vue'),
      meta: {
        title: 'Diskominfotik Sumbawa',
        requiresAuth: false,
      },
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

    // --- 3. ROLE: ADMIN ---
    {
      path: '/admin/dashboard', // Saya ubah jadi /admin/dashboard agar rapi
      name: 'Analytic', // Nama route tetap Analytic agar tidak merusak kodingan lain
      component: () => import('../views/Dashboard/dashboardAnalytic.vue'),
      meta: { title: 'Dashboard Admin', requiresAuth: true, role: 'admin' },
    },
    {
      path: '/manage-users',
      name: 'Manage User',
      component: () => import('../views/Pages/manageUsers.vue'),
      meta: { title: 'Manage Users', requiresAuth: true, role: 'admin' },
    },
    {
      path: '/manage-services',
      name: 'Manage Services',
      component: () => import('../views/Pages/manageServices.vue'),
      meta: { title: 'Manage Services', requiresAuth: true, role: 'admin' },
    },
    {
      path: '/admin/tickets',
      name: 'Manage Tickets',
      component: () => import('../views/Pages/manageTickets.vue'),
      meta: { title: 'Manage Tickets', requiresAuth: true, role: 'admin' },
    },
    {
      path: '/admin/feedbacks',
      name: 'Feedbacks',
      component: () => import('../views/Pages/feedback.vue'),
      meta: { title: 'Feedbacks', requiresAuth: true, role: 'admin' },
    },
    // ... Tambahkan manage-roles, manage-sla, manage-skills disini jika perlu ...

    // --- 4. ROLE: PETUGAS ---
    {
      path: '/petugas/dashboard',
      name: 'PetugasDashboard',
      component: () => import('../views/Dashboard/dashboardPetugas.vue'),
      meta: { title: 'Dashboard Petugas', requiresAuth: true, role: 'petugas' },
    },
    {
      path: '/petugas/tickets',
      name: 'TiketPetugas',
      component: () => import('../views/Pages/myTicketList.vue'),
      meta: { title: 'Tugas Saya', requiresAuth: true, role: 'petugas' },
    },
    {
      path: '/petugas/feedbacks',
      name: 'PetugasFeedbacks',
      component: () => import('../views/Pages/feedback.vue'), // Re-use komponen feedback
      meta: { title: 'Feedback Saya', requiresAuth: true, role: 'petugas' },
    },

    // --- 5. ROLE: USER ---
    {
      path: '/user/dashboard',
      name: 'UserDashboard',
      component: () => import('../views/Dashboard/dashboardUser.vue'),
      meta: { title: 'Dashboard User', requiresAuth: true, role: 'user' },
    },
    {
      path: '/user/tickets/create',
      name: 'CreateTicket',
      component: () => import('../views/Pages/createTicket.vue'),
      meta: { title: 'Buat Tiket', requiresAuth: true, role: 'user' },
    },
    {
      path: '/user/tickets',
      name: 'UserTicketList',
      component: () => import('../views/Pages/myTicketList.vue'), // Bisa reuse atau buat file baru UserTicketList.vue
      meta: { title: 'Riwayat Tiket', requiresAuth: true, role: 'user' },
    },
    {
      path: '/user/detailService/:id',
      name: 'ServiceDetail',
      component: () => import('../views/Pages/detailTicket.vue'),
      meta: { title: 'Detail Layanan', requiresAuth: false },
    },
    // --- 6. SHARED / UNIVERSAL ROUTES ---
    {
      path: '/detail-ticket/:id',
      name: 'TicketDetail',
      component: () => import('../views/Pages/detailTicket.vue'), // Pastikan path file ini BENAR
      meta: { title: 'Detail Tiket', requiresAuth: true },
    },
    {
      path: '/notifications',
      name: 'Notifications',
      component: () => import('../views/Pages/notifications.vue'),
      meta: { title: 'Notifications', requiresAuth: true },
    },
    {
      path: '/profile',
      name: 'Profile',
      component: () => import('../views/Others/UserProfile.vue'),
      meta: { title: 'Profile', requiresAuth: true },
    },

    // --- ERROR PAGES ---
    {
      path: '/:pathMatch(.*)*',
      name: '404 Error',
      component: () => import('../views/Errors/FourZeroFour.vue'),
      meta: { title: '404 Not Found' },
    },
  ],
})

// --- SATPAM (NAVIGATION GUARD) ---
router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title} | SABALONG`

  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated
  const userRole = authStore.userRole // pastikan di store tersimpan sebagai 'admin', 'petugas', 'user'

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'Signin', query: { redirect: to.fullPath } })
  } else if (to.meta.requiresGuest && isAuthenticated) {
    // Redirect ke Dashboard sesuai Role
    if (userRole === 'admin' || userRole === 'pimpinan') {
      next({ name: 'Analytic' })
    } else if (userRole === 'petugas') {
      next({ name: 'PetugasDashboard' })
    } else if (userRole === 'user') {
      next({ name: 'UserDashboard' })
    } else {
      next() // Fallback
    }
  } else if (to.meta.role && to.meta.role !== userRole && userRole !== 'admin') {
    next({ name: '404 Error' })
  }

  // 4. Boleh lewat
  else {
    next()
  }
})

export default router
