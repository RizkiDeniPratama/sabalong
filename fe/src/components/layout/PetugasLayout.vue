<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950">
    <!-- Sidebar -->
    <aside
      :class="[
        'fixed left-0 top-0 z-40 h-screen w-64 transition-transform',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      ]"
    >
      <div
        class="flex h-full flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
      >
        <!-- Logo -->
        <div
          class="flex h-16 items-center justify-between border-b border-gray-200 px-6 dark:border-gray-800"
        >
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600">
              <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div>
              <h2 class="text-sm font-bold text-gray-900 dark:text-white">Sabalong</h2>
              <p class="text-xs text-gray-500 dark:text-gray-400">Petugas</p>
            </div>
          </div>
          <button @click="sidebarOpen = false" class="lg:hidden text-gray-500 hover:text-gray-700">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 space-y-1 overflow-y-auto p-4">
          <router-link
            v-for="item in menuItems"
            :key="item.path"
            :to="item.path"
            :class="[
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              isActive(item.path)
                ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800',
            ]"
          >
            <component :is="item.icon" class="h-5 w-5" />
            {{ item.label }}
            <span
              v-if="item.badge"
              class="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white"
            >
              {{ item.badge }}
            </span>
          </router-link>
        </nav>

        <!-- User Info -->
        <div class="border-t border-gray-200 p-4 dark:border-gray-800">
          <div class="flex items-center gap-3">
            <div
              class="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400"
            >
              {{ userInitial }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="truncate text-sm font-medium text-gray-900 dark:text-white">
                {{ user?.nama || 'Petugas' }}
              </p>
              <p class="truncate text-xs text-gray-500 dark:text-gray-400">{{ user?.email }}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="lg:pl-64">
      <!-- Top Bar -->
      <header
        class="sticky top-0 z-30 border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
      >
        <div class="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <button
            @click="sidebarOpen = !sidebarOpen"
            class="text-gray-500 hover:text-gray-700 lg:hidden dark:text-gray-400"
          >
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <div class="flex items-center gap-4">
            <!-- Dark Mode Toggle -->
            <button
              @click="toggleDarkMode"
              class="rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
              title="Toggle Dark Mode"
            >
              <svg
                v-if="isDarkMode"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              <svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            </button>

            <!-- Notifications -->
            <!-- <NotificationBadge /> -->

            <!-- User Dropdown -->
            <div class="relative">
              <button
                @click="showUserMenu = !showUserMenu"
                class="flex items-center gap-2 rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <div
                  class="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 dark:bg-brand-900/30 dark:text-brand-400"
                >
                  {{ userInitial }}
                </div>
                <svg
                  class="h-4 w-4 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              <!-- Dropdown Menu -->
              <Transition name="dropdown">
                <div
                  v-if="showUserMenu"
                  v-click-outside="() => (showUserMenu = false)"
                  class="absolute right-0 mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
                >
                  <div class="p-3 border-b border-gray-200 dark:border-gray-700">
                    <p class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ user?.nama }}
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">{{ user?.email }}</p>
                  </div>
                  <div class="p-2">
                    <router-link
                      to="/profile"
                      class="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      Profil
                    </router-link>
                    <button
                      @click="handleLogout"
                      class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      Logout
                    </button>
                  </div>
                </div>
              </Transition>
            </div>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main>
        <slot />
      </main>
    </div>

    <!-- Sidebar Backdrop (Mobile) -->
    <Transition name="fade">
      <div
        v-if="sidebarOpen"
        @click="sidebarOpen = false"
        class="fixed inset-0 z-30 bg-gray-900/50 lg:hidden"
      ></div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../store/auth'
// import NotificationBadge from '../NotificationBadge.vue'
import api from '../../services/api'

const route = useRoute()
const router = useRouter()

const sidebarOpen = ref(false)
const showUserMenu = ref(false)
const isDarkMode = ref(false)
const user = ref<any>(null)

// Type definition untuk menu items
interface MenuItem {
  label: string
  path: string
  icon: string
  badge?: number | string // Optional badge
}

const menuItems: MenuItem[] = [
  {
    label: 'Dashboard',
    path: '/petugas/dashboard',
    icon: 'IconHome',
  },
  {
    label: 'Tiket Saya',
    path: '/petugas/tickets',
    icon: 'IconTicket',
  },
  {
    label: 'Feedback',
    path: '/petugas/feedbacks',
    icon: 'IconStar',
  },
  {
    label: 'Notifikasi',
    path: '/notifications',
    icon: 'IconBell',
  },
]

// Icons as inline components
const IconHome = {
  template: `
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  `,
}

const IconTicket = {
  template: `
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  `,
}

const IconStar = {
  template: `
    <svg fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  `,
}

const IconBell = {
  template: `
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  `,
}

const userInitial = computed(() => {
  return user.value?.nama?.charAt(0).toUpperCase() || 'P'
})

// Custom directive for click outside
const vClickOutside = {
  mounted(el: any, binding: any) {
    el.clickOutsideEvent = (event: Event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value()
      }
    }
    document.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted(el: any) {
    document.removeEventListener('click', el.clickOutsideEvent)
  },
}

const isActive = (path: string) => {
  return route.path === path || route.path.startsWith(path + '/')
}

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
}

const handleLogout = async () => {
  if (!confirm('Yakin ingin logout?')) return
  
  // Gunakan auth store yang sudah ada (lebih aman dan konsisten)
  const authStore = useAuthStore()
  
  try {
    await api.post('/auth/logout')
    // Gunakan method logout dari store (otomatis hapus token dan user data)
    authStore.logout()
  } catch (err) {
    console.error('Logout error:', err)
    // Force logout even if API fails - tetap gunakan store
    authStore.logout()
  }
}


const fetchUserProfile = async () => {
  try {
    const res = await api.get('/users/profile')
    if (res.data.success) {
      user.value = res.data.data
    }
  } catch (err) {
    console.error('Failed to fetch user profile', err)
  }
}

onMounted(() => {
  // Check dark mode preference
  const savedTheme = localStorage.getItem('theme')
  if (
    savedTheme === 'dark' ||
    (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)
  ) {
    isDarkMode.value = true
    document.documentElement.classList.add('dark')
  }

  fetchUserProfile()
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}
.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
