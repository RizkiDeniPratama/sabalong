<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import api from '@/services/api'

// ============= PROPS =============
interface Props {
  showBackButton?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showBackButton: false,
})

// ============= STATE =============
const router = useRouter()
const authStore = useAuthStore()

const showUserMenu = ref(false)
const isDark = ref(false)
const scrolled = ref(false)

// ============= COMPUTED =============
const userInitials = computed(() => {
  if (!authStore.user?.nama) return 'U'
  const nameParts = authStore.user.nama.split(' ')
  if (nameParts.length >= 2) {
    return (nameParts[0][0] + nameParts[1][0]).toUpperCase()
  }
  return authStore.user.nama.substring(0, 2).toUpperCase()
})

const avatarColor = computed(() => {
  const colors = [
    'from-blue-500 to-blue-600',
    'from-purple-500 to-purple-600',
    'from-pink-500 to-pink-600',
    'from-green-500 to-green-600',
    'from-orange-500 to-orange-600',
    'from-red-500 to-red-600',
  ]
  const nameLength = authStore.user?.nama.length || 0
  return colors[nameLength % colors.length]
})

const goBack = () => {
  router.back()
}

const goToDashboard = () => {
  const userRole = authStore.userRole
  if (userRole === 'admin') {
    router.push({ name: 'Analytic' })
  } else if (userRole === 'petugas') {
    router.push({ name: 'PetugasDashboard' })
  } else if (userRole === 'user') {
    router.push({ name: 'UserDashboard' })
  } else {
    // Fallback for any other roles or if role is null
    router.push({ name: 'LandingPage' })
  }
  showUserMenu.value = false
}

const goToCreateTicket = () => {
  if (authStore.isAuthenticated) {
    router.push('/user/tickets/create')
  } else {
    authStore.setIntendedUrl('/user/tickets/create')
    router.push('/signin')
  }
}

const handleLogout = async () => {
  try {
    // Coba hit API logout jika masih ada token valid
    if (authStore.token) {
      try {
        await api.post('/auth/logout')
        console.log('API logout successful')
      } catch (error) {
        console.warn('API logout failed, proceeding with local logout:', error)
      }
    }
  } catch (error) {
    console.warn('Logout API call failed:', error)
  } finally {
    // Selalu lakukan local logout
    authStore.logout()
    showUserMenu.value = false
    
    // Force redirect ke landing page
    if (router.currentRoute.value.name !== 'LandingPage') {
      router.push({ name: 'LandingPage' })
    }
  }
}

const handleScroll = () => {
  scrolled.value = window.scrollY > 50
}

const toggleDarkMode = () => {
  isDark.value = !isDark.value
  if (isDark.value) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
}

const closeUserMenu = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.user-menu-container')) {
    showUserMenu.value = false
  }
}

// ============= LIFECYCLE =============
onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  const savedTheme = localStorage.getItem('theme')
  if (
    savedTheme === 'dark' ||
    (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)
  ) {
    isDark.value = true
    document.documentElement.classList.add('dark')
  }

  document.addEventListener('click', closeUserMenu)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.removeEventListener('click', closeUserMenu)
})
</script>

<template>
  <nav
    :class="[
      scrolled
        ? 'bg-white/80 backdrop-blur-xl shadow-lg shadow-gray-900/5 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800'
        : 'bg-transparent py-4 border-b border-transparent',
      'fixed w-full top-0 z-50 transition-all duration-500',
    ]"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Left: Logo (with optional back button) -->
        <div class="flex items-center gap-3">
          <button
            v-if="showBackButton"
            @click="goBack"
            class="group flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            aria-label="Kembali"
          >
            <svg
              class="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span
              class="hidden sm:inline text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-brand-600 dark:group-hover:text-brand-400"
            >
              Kembali
            </span>
          </button>

          <div v-if="showBackButton" class="h-8 w-px bg-gray-300 dark:bg-gray-700"></div>

          <!-- Logo -->
          <router-link
            :to="{ name: 'LandingPage' }"
            class="flex items-center gap-3 group cursor-pointe"
          >
            <div class="relative">
              <div
                class="relative w-10 h-10 rounded-lg flex items-center justify-center text-xl transform group-hover:scale-110 transition-transform"
              >
                <img
                  src="../../../images/logo/sabalong.png"
                  alt="sabalong"
                  class="w-full h-full object-contain shadow-none drop-shadow-none filter-none"
                />
              </div>
            </div>

            <span
              class="text-xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent dark:from-white dark:to-gray-300"
            >
              SABALONG
            </span>
          </router-link>
        </div>

        <!-- Right: Actions -->
        <div class="flex items-center gap-3">
          <!-- Dark Mode Toggle -->
          <button
            @click="toggleDarkMode"
            class="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-all"
            aria-label="Toggle dark mode"
          >
            <svg
              v-if="isDark"
              class="w-5 h-5 text-yellow-500"
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
            <svg
              v-else
              class="w-5 h-5 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          </button>

          <!-- NOT LOGGED IN -->
          <template v-if="!authStore.isAuthenticated">
            <router-link
              :to="{ name: 'Signin' }"
              class="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                />
              </svg>
              Login
            </router-link>

            <router-link
              :to="{ name: 'Signin' }"
              class="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all text-sm"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span class="hidden sm:inline">Buat Tiket</span>
            </router-link>
          </template>

          <!-- LOGGED IN -->
          <template v-else>
            <!-- Dashboard Button (Desktop only) -->
            <!-- <button
              @click="goToDashboard"
              class="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Dashboard
            </button> -->

            <!-- Create Ticket Button -->
            <button
              v-if="authStore.userRole === 'user'"
              @click="goToCreateTicket"
              class="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all text-sm"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span class="hidden sm:inline">Buat Tiket</span>
            </button>

            <!-- User Menu -->
            <div class="relative user-menu-container">
              <button
                @click="showUserMenu = !showUserMenu"
                :class="[
                  'w-9 h-9 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold text-xs shadow-md hover:shadow-lg transition-all',
                  avatarColor,
                ]"
                aria-label="User menu"
              >
                {{ userInitials }}
              </button>

              <!-- Dropdown Menu -->
              <transition name="dropdown">
                <div
                  v-if="showUserMenu"
                  class="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50"
                >
                  <!-- User Info -->
                  <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <p class="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {{ authStore.user?.nama }}
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {{ authStore.user?.email }}
                    </p>
                    <span
                      class="inline-block mt-2 px-2 py-1 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 text-xs font-semibold rounded"
                    >
                      {{ authStore.user?.role }}
                    </span>
                  </div>

                  <!-- Menu Items -->
                  <div class="py-2">
                    <button
                      @click="goToDashboard"
                      class="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                        />
                      </svg>
                      Dashboard
                    </button>

                    <button
                      v-if="authStore.userRole === 'user'"
                      @click="goToCreateTicket"
                      class="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                        />
                      </svg>
                      Buat Tiket
                    </button>
                  </div>

                  <!-- Logout -->
                  <div class="border-t border-gray-200 dark:border-gray-700 pt-2">
                    <button
                      @click="handleLogout"
                      class="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              </transition>
            </div>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
/* Dropdown Animation */
.dropdown-enter-active {
  transition: all 0.2s ease-out;
}

.dropdown-leave-active {
  transition: all 0.15s ease-in;
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
