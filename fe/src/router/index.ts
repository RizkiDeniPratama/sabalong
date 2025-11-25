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
      name: 'Analytic',
      component: () => import('../views/Dashboard/dashboardAnalytic.vue'),
      meta: {
        title: 'Analytic Dashboard',
        requiresAuth: true,
      },
    },
    {
      path: '/petugas',
      name: 'PetugasDashboard',
      component: () => import('../views/Dashboard/dashboardPetugas.vue'),
      meta: {
        title: 'Dashboard Petugas',
        requiresAuth: true,
      },
    },
    {
      path: '/user',
      name: 'UserDashboard',
      component: () => import('../views/Dashboard/dashboardUser.vue'),
      meta: {
        title: 'Dashboard User',
        requiresAuth: true,
      },
    },
    {
      path: '/manage-users',
      name: 'Manage User',
      component: () => import('../views/Pages/manageUsers.vue'),
      meta: {
        title: 'Manage Users',
        requiresAuth: true,
      },
    },
    {
      path: '/create-tickets',
      name: 'Create Tickets',
      component: () => import('../views/Pages/createTicket.vue'),
      meta: {
        title: 'Create Tickets',
        requiresAuth: true,
      },
    },
    {
      path: '/ticket-list',
      name: 'My Tickets List',
      component: () => import('../views/Pages/ticketList.vue'),
      meta: {
        title: 'My Tickets List',
        requiresAuth: true,
      },
    },
    {
      path: '/manage-tickets',
      name: 'Manage Tickets',
      component: () => import('../views/Pages/manageTickets.vue'),
      meta: {
        title: 'Manage Tickets',
        requiresAuth: true,
      },
    },
    {
      path: '/detail-ticket/:id',
      name: 'Ticket Detail',
      component: () => import('../views/Pages/detailTicket.vue'),
      meta: {
        title: 'Ticket Detail',
        requiresAuth: true,
      },
    },
    {
      path: '/manage-services',
      name: 'Manage Services',
      component: () => import('../views/Pages/manageServices.vue'),
      meta: {
        title: 'Manage Services',
        requiresAuth: true,
      },
    },
    {
      path: '/feedbacks',
      name: 'Feedbacks',
      component: () => import('../views/Pages/feedback.vue'),
      meta: {
        title: 'Feedbacks',
        requiresAuth: true,
      },
    },
    {
      path: '/manage-sla',
      name: 'Manage SLA',
      component: () => import('../views/Pages/manageSLA.vue'),
      meta: {
        title: 'Manage SLA',
        requiresAuth: true,
      },
    },
    {
      path: '/manage-roles',
      name: 'Manage Roles',
      component: () => import('../views/Pages/manageRoles.vue'),
      meta: {
        title: 'Manage Roles',
        requiresAuth: true,
      },
    },
    {
      path: '/manage-skills',
      name: 'Manage Skills',
      component: () => import('../views/Pages/manageSkills.vue'),
      meta: {
        title: 'Manage Skills',
        requiresAuth: true,
      },
    },
    {
      path: '/notifications',
      name: 'Notifications',
      component: () => import('../views/Pages/notifications.vue'),
      meta: {
        title: 'Notifications',
        requiresAuth: true,
      },
    },
    {
      path: '/petugas/tickets',
      name: 'TiketPetugas',
      component: () => import('../views/Pages/myTicketList.vue'),
      meta: {
        title: 'My Tickets',
        requiresAuth: true,
      },
    },
    {
      path: '/calendar',
      name: 'Calendar',
      component: () => import('../views/Others/Calendar.vue'),
      meta: {
        title: 'Calendar',
        requiresAuth: true,
      },
    },
    {
      path: '/profile',
      name: 'Profile',
      component: () => import('../views/Others/UserProfile.vue'),
      meta: {
        title: 'Profile',
        requiresAuth: true,
      },
    },
    {
      path: '/form-elements',
      name: 'Form Elements',
      component: () => import('../views/Forms/FormElements.vue'),
      meta: {
        title: 'Form Elements',
        requiresAuth: true,
      },
    },
    {
      path: '/basic-tables',
      name: 'Basic Tables',
      component: () => import('../views/Tables/BasicTables.vue'),
      meta: {
        title: 'Basic Tables',
        requiresAuth: true,
      },
    },
    {
      path: '/line-chart',
      name: 'Line Chart',
      component: () => import('../views/Chart/LineChart/LineChart.vue'),
    },
    {
      path: '/bar-chart',
      name: 'Bar Chart',
      component: () => import('../views/Chart/BarChart/BarChart.vue'),
    },
    {
      path: '/alerts',
      name: 'Alerts',
      component: () => import('../views/UiElements/Alerts.vue'),
      meta: {
        title: 'Alerts',
      },
    },
    {
      path: '/avatars',
      name: 'Avatars',
      component: () => import('../views/UiElements/Avatars.vue'),
      meta: {
        title: 'Avatars',
        requiresAuth: true,
      },
    },
    {
      path: '/badge',
      name: 'Badge',
      component: () => import('../views/UiElements/Badges.vue'),
      meta: {
        title: 'Badge',
        requiresAuth: true,
      },
    },

    {
      path: '/buttons',
      name: 'Buttons',
      component: () => import('../views/UiElements/Buttons.vue'),
      meta: {
        title: 'Buttons',
        requiresAuth: true,
      },
    },

    {
      path: '/images',
      name: 'Images',
      component: () => import('../views/UiElements/Images.vue'),
      meta: {
        title: 'Images',
      },
    },
    {
      path: '/videos',
      name: 'Videos',
      component: () => import('../views/UiElements/Videos.vue'),
      meta: {
        title: 'Videos',
      },
    },
    {
      path: '/blank',
      name: 'Blank',
      component: () => import('../views/Pages/BlankPage.vue'),
      meta: {
        title: 'Blank',
      },
    },

    {
      path: '/error-404',
      name: '404 Error',
      component: () => import('../views/Errors/FourZeroFour.vue'),
      meta: {
        title: '404 Error',
      },
    },

    {
      path: '/signin',
      name: 'Signin',
      component: () => import('../views/Auth/SigninPage.vue'),
      meta: {
        title: 'Signin',
        requireGuest: true,
      },
    },
    {
      path: '/signup',
      name: 'Signup',
      component: () => import('../views/Auth/Signup.vue'),
      meta: {
        title: 'Signup',
      },
    },
  ],
})

router.beforeEach((to, from, next) => {
  document.title = ` ${to.meta.title} | SABALONG`
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'Signin' })
  } else if (to.meta.requireGuest && isAuthenticated) {
    next({ name: 'Analytic' })
  } else {
    next()
  }
})
export default router
