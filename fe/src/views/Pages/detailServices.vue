<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '@/services/api'
import NavbarPage from '@/components/layout/navbarPage.vue'
import { useAuthStore } from '@/store/auth'

// ============= INTERFACES =============
interface SLA {
  id: number
  sla_name: string
  response_hours: number
  resolution_hours: number
  description: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface Skill {
  id: number
  skill_name: string
  skill_description: string
  kategori: string
  created_at: string
}

interface ServiceSkill {
  id: number
  service_id: number
  skill_id: number
  skill: Skill
}

interface ServiceDetail {
  id: number
  nama_layanan: string
  deskripsi: string
  kategori: string
  sla_id: number
  default_priority: string
  is_active: boolean
  icon: string | null
  sop: string | null
  flowchart: string | null
  created_at: string
  updated_at: string
  sla: SLA
  skills: ServiceSkill[]
}

// ============= STATE =============
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const service = ref<ServiceDetail | null>(null)
const loading = ref(true)
const error = ref('')
const showFlowchartModal = ref(false)
const showBottomBar = ref(false)
const isAuthenticated = ref(false)
const userToken = ref<string | null>(null)

// ============= COMPUTED =============
const serviceId = computed(() => route.params.id as string)

const hasSOP = computed(() => {
  return (
    service.value?.sop !== null && service.value?.sop !== '' && service.value?.sop?.trim() !== ''
  )
})

const hasFlowchart = computed(() => {
  return (
    service.value?.flowchart !== null &&
    service.value?.flowchart !== '' &&
    service.value?.flowchart?.trim() !== ''
  )
})

const priorityConfig = computed(() => {
  const priority = service.value?.default_priority || 'medium'
  const configs: Record<string, { color: string; label: string; icon: string }> = {
    low: {
      color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      label: 'Rendah',
      icon: '🟢',
    },
    medium: {
      color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      label: 'Sedang',
      icon: '🟡',
    },
    high: {
      color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      label: 'Tinggi',
      icon: '🟠',
    },
    urgent: {
      color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      label: 'Mendesak',
      icon: '🔴',
    },
  }
  return configs[priority] || configs.medium
})

const categoryIcon = computed(() => {
  const icons: Record<string, string> = {
    Development: '💻',
    Infrastructure: '🏗️',
    Support: '🛟',
    Design: '🎨',
    Network: '🌐',
    Security: '🔒',
    Data: '📊',
  }
  return icons[service.value?.kategori || ''] || '🛠️'
})

// Computed untuk CTA button text & state
const ctaButtonText = computed(() => {
  if (!service.value?.is_active) return 'Layanan Tidak Aktif'
  if (!isAuthenticated.value) return 'Login untuk Ajukan Layanan'
  return 'Ajukan Layanan Ini'
})

const ctaButtonDisabled = computed(() => {
  return !service.value?.is_active
})

const ctaHelperText = computed(() => {
  if (!service.value?.is_active) return 'Layanan ini sedang tidak tersedia'
  if (!isAuthenticated.value) return 'Silakan login terlebih dahulu untuk membuat tiket'
  return 'Klik untuk membuat tiket layanan baru'
})
// ============= METHODS =============
const fetchServiceDetail = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await api.get(`/services/${serviceId.value}`)

    if (response.data.success) {
      service.value = response.data.data
    } else {
      error.value = 'Layanan tidak ditemukan'
    }
  } catch (err: any) {
    console.error('Error fetching service detail:', err)

    // Enhanced error handling
    if (err.response?.status === 404) {
      error.value = 'Layanan tidak ditemukan'
    } else if (err.response?.status === 401) {
      error.value = 'Sesi Anda telah berakhir. Silakan login kembali.'
      setTimeout(() => router.push('/signin'), 2000)
    } else if (err.response?.status === 500) {
      error.value = 'Terjadi kesalahan server. Silakan coba beberapa saat lagi.'
    } else if (!navigator.onLine) {
      error.value = 'Tidak ada koneksi internet. Periksa koneksi Anda.'
    } else {
      error.value = err.response?.data?.message || 'Gagal memuat detail layanan'
    }
  } finally {
    loading.value = false
  }
}

const getFileUrl = (path: string | null) => {
  if (!path) return ''
  return path.startsWith('http')
    ? path
    : `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${path}`
}

const openFlowchartModal = () => {
  if (hasFlowchart.value) {
    showFlowchartModal.value = true
    document.body.style.overflow = 'hidden'
  }
}

const closeFlowchartModal = () => {
  showFlowchartModal.value = false
  document.body.style.overflow = 'auto'
}

const downloadFile = (type: 'sop' | 'flowchart') => {
  const url = type === 'sop' ? service.value?.sop : service.value?.flowchart
  if (url) {
    window.open(getFileUrl(url), '_blank')
  }
}

const handleScroll = () => {
  // Show bottom bar after scrolling 600px
  showBottomBar.value = window.scrollY > 600
}

const goBack = () => {
  router.push('/')
}

const handleIconError = (event: Event) => {
  const target = event.target as HTMLImageElement
  // Instead of hiding, show fallback icon
  const parent = target.parentElement
  if (parent) {
    target.style.display = 'none'
    // The emoji icon will show as fallback
  }
}

// const goToCreateTicket = () => {
//   if (!service.value?.is_active) {
//     // Service is not active
//     return
//   }

const goToCreateTicket = () => {
  if (authStore.isAuthenticated) {
    router.push(`/user/tickets/create?service_id=${serviceId.value}`)
  } else {
    authStore.setIntendedUrl(`/user/tickets/create?service_id=${serviceId.value}`)
    router.push('/signin')
  }
}

const checkAuth = () => {
  const token = localStorage.getItem('token')

  if (token) {
    isAuthenticated.value = true
    userToken.value = token
  } else {
    isAuthenticated.value = false
    userToken.value = null
  }
}

const handleEscapeKey = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && showFlowchartModal.value) {
    closeFlowchartModal()
  }
}

// ============= LIFECYCLE =============
onMounted(async () => {
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' })

  // Check authentication first
  checkAuth()

  // Fetch service detail
  await fetchServiceDetail()

  // Add event listeners
  window.addEventListener('scroll', handleScroll)
  window.addEventListener('keydown', handleEscapeKey)
})

onUnmounted(() => {
  // Cleanup event listeners
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('keydown', handleEscapeKey)

  // Restore body overflow in case modal was open
  document.body.style.overflow = 'auto'
})
</script>
<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- ========== NAVBAR ========== -->
    <NavbarPage />

    <!-- ========== LOADING STATE ========== -->
    <div v-if="loading" class="max-w-7xl mx-auto px-4 pt-28 pb-12">
      <!-- Loading Indicator -->
      <div class="text-center mb-8 animate-fade-in">
        <div
          class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-brand-200 border-t-brand-600 dark:border-gray-700 dark:border-t-brand-500"
        ></div>
        <p class="mt-4 text-gray-600 dark:text-gray-400 font-medium">Memuat detail layanan...</p>
      </div>

      <div class="animate-pulse space-y-6">
        <!-- Breadcrumb Skeleton -->
        <div class="h-5 bg-gray-200 dark:bg-gray-800 rounded w-80"></div>

        <!-- Hero Skeleton -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl p-8 space-y-6">
          <div class="flex gap-6">
            <div class="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
            <div class="flex-1 space-y-3">
              <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              <div class="flex gap-2">
                <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-24"></div>
                <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-32"></div>
                <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-20"></div>
              </div>
            </div>
          </div>

          <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-4"></div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
              <div class="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            </div>
          </div>
        </div>

        <!-- Content Skeleton -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 h-96 bg-white dark:bg-gray-800 rounded-2xl"></div>
          <div class="h-80 bg-white dark:bg-gray-800 rounded-2xl"></div>
        </div>
      </div>
    </div>

    <!-- ========== ERROR STATE ========== -->
    <div v-else-if="error" class="max-w-7xl mx-auto px-4 pt-28 pb-20">
      <div class="text-center animate-fade-in-up">
        <div
          class="w-24 h-24 mx-auto mb-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center"
        >
          <svg
            class="w-12 h-12 text-red-600 dark:text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Oops! Terjadi Kesalahan
        </h2>
        <p class="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">{{ error }}</p>
        <button
          @click="goBack"
          class="px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition-all hover:scale-105 shadow-lg inline-flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Kembali ke Beranda
        </button>
      </div>
    </div>

    <!-- ========== MAIN CONTENT ========== -->
    <div v-else-if="service" class="max-w-7xl mx-auto px-4 pt-24 sm:pt-28 pb-48 sm:pb-56">
      <!-- Breadcrumb -->
      <nav class="flex items-center gap-2 text-sm mb-6 animate-fade-in">
        <button
          @click="goBack"
          class="text-gray-500 hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-400 transition-colors font-medium"
        >
          Beranda
        </button>
        <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
        <button
          @click="goBack"
          class="text-gray-500 hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-400 transition-colors font-medium"
        >
          Layanan
        </button>
        <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
        <span class="text-gray-900 dark:text-white font-semibold truncate">{{
          service.nama_layanan
        }}</span>
      </nav>

      <!-- ========== HERO SECTION ========== -->
      <div
        class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden mb-6 sm:mb-8 animate-fade-in-up"
      >
        <div class="p-6 sm:p-8 md:p-10">
          <!-- Top Section: Icon, Title, Description -->
          <div class="flex flex-col sm:flex-row gap-6 mb-8">
            <!-- Icon -->
            <div
              class="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-50 to-blue-50 dark:from-brand-900/30 dark:to-blue-900/30 shadow-lg border-4 border-white dark:border-gray-800 flex items-center justify-center flex-shrink-0"
            >
              <img
                v-if="service.icon"
                :src="getFileUrl(service.icon)"
                :alt="service.nama_layanan"
                class="w-12 h-12 object-contain"
                loading="lazy"
                decoding="async"
                @error="handleIconError"
              />
              <span v-else class="text-4xl">{{ categoryIcon }}</span>
            </div>

            <!-- Title & Description -->
            <div class="flex-1 min-w-0">
              <h1
                class="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 leading-tight"
              >
                {{ service.nama_layanan }}
              </h1>
              <p class="text-base md:text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                {{ service.deskripsi }}
              </p>

              <!-- Badges -->
              <div class="flex flex-wrap gap-2">
                <!-- Category Badge -->
                <span
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-semibold"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                  {{ service.kategori }}
                </span>

                <!-- Priority Badge -->
                <span
                  :class="[
                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold',
                    priorityConfig.color,
                  ]"
                >
                  <span>{{ priorityConfig.icon }}</span>
                  Prioritas: {{ priorityConfig.label }}
                </span>

                <!-- Status Badge -->
                <span
                  v-if="service.is_active"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-semibold"
                >
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  Aktif
                </span>
                <span
                  v-else
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 text-sm font-semibold"
                >
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  Tidak Aktif
                </span>
              </div>
            </div>
          </div>

          <!-- Divider -->
          <div class="border-t border-gray-200 dark:border-gray-700 my-6"></div>

          <!-- SLA Metrics Section -->
          <div>
            <div class="flex items-center gap-2 mb-4">
              <svg
                class="w-5 h-5 text-brand-600 dark:text-brand-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 class="text-lg font-bold text-gray-900 dark:text-white">
                Jaminan Layanan (SLA: {{ service.sla.sla_name }})
              </h3>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- Response Time Card -->
              <div
                class="group relative overflow-hidden rounded-xl bg-gradient-to-br from-brand-50 to-brand-100 dark:from-brand-900/20 dark:to-brand-800/20 p-6 border-2 border-brand-200 dark:border-brand-800 hover:border-brand-300 dark:hover:border-brand-700 transition-all"
              >
                <div class="flex items-start justify-between mb-3">
                  <div
                    class="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-lg"
                  >
                    <svg
                      class="w-6 h-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <span
                    class="px-3 py-1 rounded-full bg-brand-200 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300 text-xs font-bold uppercase tracking-wide"
                  >
                    Respon
                  </span>
                </div>
                <div class="flex items-baseline gap-2 mb-2">
                  <span class="text-4xl font-extrabold text-brand-600 dark:text-brand-400">
                    {{ service.sla.response_hours }}
                  </span>
                  <span class="text-xl font-semibold text-brand-700 dark:text-brand-500">jam</span>
                </div>
                <p class="text-sm text-gray-700 dark:text-gray-300 font-medium">
                  Maksimal waktu untuk respon pertama
                </p>
              </div>

              <!-- Resolution Time Card -->
              <div
                class="group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 border-2 border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all"
              >
                <div class="flex items-start justify-between mb-3">
                  <div
                    class="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg"
                  >
                    <svg
                      class="w-6 h-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <span
                    class="px-3 py-1 rounded-full bg-blue-200 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wide"
                  >
                    Selesai
                  </span>
                </div>
                <div class="flex items-baseline gap-2 mb-2">
                  <span class="text-4xl font-extrabold text-blue-600 dark:text-blue-400">
                    {{ service.sla.resolution_hours }}
                  </span>
                  <span class="text-xl font-semibold text-blue-700 dark:text-blue-500">jam</span>
                </div>
                <p class="text-sm text-gray-700 dark:text-gray-300 font-medium">
                  Target waktu penyelesaian layanan
                </p>
              </div>
            </div>

            <!-- Info Box -->
            <div
              class="mt-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
            >
              <div class="flex gap-3">
                <svg
                  class="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div class="text-sm text-blue-800 dark:text-blue-300">
                  <p class="font-semibold mb-1">💡 Informasi Penting</p>
                  <ul class="space-y-1 list-disc list-inside">
                    <li>
                      Tiket akan direspons maksimal dalam {{ service.sla.response_hours }} jam kerja
                    </li>
                    <li>
                      Pengerjaan diselesaikan dalam {{ service.sla.resolution_hours }} jam kerja ({{
                        Math.ceil(service.sla.resolution_hours / 24)
                      }}
                      hari kerja)
                    </li>
                    <li>Status pengerjaan dapat dipantau melalui dashboard tiket Anda</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ========== FLOWCHART & SOP SECTION ========== -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <!-- Main Content: Flowchart (2/3 width) -->
        <div class="lg:col-span-2">
          <div
            class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden animate-fade-in-up"
            style="animation-delay: 0.1s"
          >
            <!-- Header -->
            <div class="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <div
                class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0"
                  >
                    <svg
                      class="w-6 h-6 text-purple-600 dark:text-purple-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 class="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                      Flowchart Proses Layanan
                    </h2>
                    <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      Diagram alur proses pengerjaan layanan
                    </p>
                  </div>
                </div>

                <!-- Download Button (if flowchart exists) -->
                <button
                  v-if="hasFlowchart"
                  @click="downloadFile('flowchart')"
                  class="flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-800/50 text-purple-700 dark:text-purple-400 rounded-lg font-semibold transition-all text-sm"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Download
                </button>
              </div>
            </div>

            <!-- Content -->
            <div class="p-4 sm:p-6">
              <!-- Flowchart Available -->
              <div v-if="hasFlowchart">
                <div
                  @click="openFlowchartModal"
                  class="group relative cursor-pointer rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 hover:border-brand-400 dark:hover:border-brand-600 transition-all"
                  role="button"
                  tabindex="0"
                  @keydown.enter="openFlowchartModal"
                  @keydown.space.prevent="openFlowchartModal"
                  aria-label="Klik untuk memperbesar flowchart"
                >
                  <!-- Flowchart Image -->
                  <img
                    :src="getFileUrl(service.flowchart)"
                    :alt="`Flowchart ${service.nama_layanan}`"
                    class="w-full h-auto object-contain max-h-[500px] transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                  />

                  <!-- Overlay on Hover -->
                  <div
                    class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                  >
                    <div class="text-center text-white">
                      <svg
                        class="w-16 h-16 mx-auto mb-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                        />
                      </svg>
                      <p class="text-lg font-semibold">Klik untuk memperbesar</p>
                    </div>
                  </div>
                </div>

                <!-- Helper Text -->
                <div class="mt-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <svg
                    class="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  <span>Klik gambar untuk melihat dalam ukuran penuh</span>
                </div>
              </div>

              <!-- Flowchart Not Available -->
              <div v-else class="text-center py-12 sm:py-16">
                <!-- Icon -->
                <div
                  class="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center"
                >
                  <svg
                    class="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 dark:text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>

                <!-- Text -->
                <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  Flowchart Belum Tersedia
                </h3>
                <p class="text-gray-600 dark:text-gray-400 max-w-md mx-auto leading-relaxed px-4">
                  Diagram alur proses layanan ini sedang dalam tahap penyusunan. Untuk informasi
                  lebih detail tentang tahapan pengerjaan, silakan hubungi kami setelah membuat
                  tiket layanan.
                </p>

                <!-- Info Box -->
                <div
                  class="mt-6 inline-flex items-start gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-left max-w-md"
                >
                  <svg
                    class="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div class="text-sm text-blue-800 dark:text-blue-300">
                    <p class="font-semibold mb-1">Prosedur akan dijelaskan</p>
                    <p>
                      Tim kami akan menjelaskan tahapan pengerjaan secara detail setelah tiket Anda
                      dibuat.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar: SOP Section (1/3 width) -->
        <div class="lg:col-span-1">
          <div
            class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden animate-fade-in-up lg:sticky lg:top-20"
            style="animation-delay: 0.2s"
          >
            <!-- Header -->
            <div class="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0"
                >
                  <svg
                    class="w-6 h-6 text-green-600 dark:text-green-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 class="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                    Dokumen SOP
                  </h2>
                  <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    Standard Operating Procedure
                  </p>
                </div>
              </div>
            </div>

            <!-- Content -->
            <div class="p-4 sm:p-6">
              <!-- SOP Available -->
              <div v-if="hasSOP">
                <!-- SOP Icon/Preview -->
                <div
                  class="mb-6 p-6 sm:p-8 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800 flex flex-col items-center justify-center"
                >
                  <div
                    class="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg mb-4"
                  >
                    <svg
                      class="w-8 h-8 sm:w-10 sm:h-10 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <p class="text-center text-sm font-semibold text-green-700 dark:text-green-400">
                    Dokumen SOP Tersedia
                  </p>
                  <p class="text-center text-xs text-green-600 dark:text-green-500 mt-1">
                    Prosedur standar layanan
                  </p>
                </div>

                <!-- Download Button -->
                <button
                  @click="downloadFile('sop')"
                  class="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center gap-3 group"
                >
                  <svg
                    class="w-5 h-5 group-hover:animate-bounce"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  <span>Download SOP</span>
                </button>

                <!-- Info Text -->
                <div class="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
                  <p>📄 File format: PDF/Document</p>
                  <p class="mt-1">Berisi panduan lengkap prosedur layanan</p>
                </div>
              </div>

              <!-- SOP Not Available -->
              <div v-else class="text-center py-6">
                <!-- Icon -->
                <div
                  class="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center"
                >
                  <svg
                    class="w-8 h-8 sm:w-10 sm:h-10 text-gray-400 dark:text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>

                <!-- Text -->
                <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  SOP Belum Tersedia
                </h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4 px-4">
                  Dokumen SOP untuk layanan ini sedang dalam tahap finalisasi.
                </p>

                <!-- Info Box -->
                <div
                  class="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-left"
                >
                  <div class="flex items-start gap-2">
                    <svg
                      class="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div class="text-xs text-blue-800 dark:text-blue-300">
                      <p class="font-semibold mb-1">Informasi Prosedur</p>
                      <p>
                        Prosedur lengkap akan dijelaskan oleh tim kami setelah tiket Anda dibuat.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Divider -->
              <div v-if="hasSOP" class="my-6 border-t border-gray-200 dark:border-gray-700"></div>

              <!-- Additional Info (Always Show) -->
              <div
                class="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 border border-gray-200 dark:border-gray-700"
              >
                <div class="flex items-start gap-3">
                  <svg
                    class="w-5 h-5 text-brand-600 dark:text-brand-400 flex-shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                  <div class="text-xs text-gray-700 dark:text-gray-300">
                    <p class="font-semibold mb-2">💡 Tips Pengajuan Layanan</p>
                    <ul class="space-y-1.5 list-disc list-inside">
                      <li>Siapkan detail kebutuhan Anda</li>
                      <li>Lampirkan dokumen pendukung jika ada</li>
                      <li>Jelaskan timeline yang diharapkan</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ========== FLOWCHART MODAL ========== -->
      <transition name="modal-fade">
        <div
          v-if="showFlowchartModal && hasFlowchart"
          @click.self="closeFlowchartModal"
          class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
        >
          <div
            class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden animate-modal-pop"
          >
            <!-- Modal Header -->
            <div
              class="sticky top-0 z-10 flex items-center justify-between p-4 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700"
            >
              <h3
                class="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2"
              >
                <svg
                  class="w-5 h-5 text-purple-600 dark:text-purple-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <span class="truncate">Flowchart - {{ service.nama_layanan }}</span>
              </h3>
              <div class="flex items-center gap-2">
                <button
                  @click="downloadFile('flowchart')"
                  class="px-3 sm:px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all text-sm flex items-center gap-2"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  <span class="hidden sm:inline">Download</span>
                </button>
                <button
                  @click="closeFlowchartModal"
                  class="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center transition-all"
                  aria-label="Tutup modal"
                >
                  <svg
                    class="w-5 h-5 text-gray-600 dark:text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Modal Body -->
            <div class="p-4 sm:p-6 overflow-y-auto max-h-[calc(95vh-80px)]">
              <div
                class="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 flex items-center justify-center"
              >
                <img
                  :src="getFileUrl(service.flowchart)"
                  :alt="`Flowchart ${service.nama_layanan}`"
                  class="max-w-full h-auto rounded-lg"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>
          </div>
        </div>
      </transition>

      <!-- ========== STICKY BOTTOM CTA BAR ========== -->
      <transition name="slide-up">
        <div
          v-show="showBottomBar && !loading && service"
          class="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 shadow-2xl"
        >
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
            <div class="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
              <!-- Left: Service Info -->
              <div class="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                <!-- Icon -->
                <div
                  class="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-50 to-blue-50 dark:from-brand-900/30 dark:to-blue-900/30 shadow-md border-2 border-white dark:border-gray-800 flex items-center justify-center flex-shrink-0"
                >
                  <img
                    v-if="service.icon"
                    :src="getFileUrl(service.icon)"
                    :alt="service.nama_layanan"
                    class="w-7 h-7 object-contain"
                    loading="lazy"
                    decoding="async"
                    @error="handleIconError"
                  />
                  <span v-else class="text-2xl">{{ categoryIcon }}</span>
                </div>

                <!-- Text -->
                <div class="flex-1 min-w-0">
                  <h3 class="text-sm font-bold text-gray-900 dark:text-white truncate">
                    {{ service.nama_layanan }}
                  </h3>
                  <div class="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <span class="flex items-center gap-1">
                      <svg
                        class="w-3.5 h-3.5 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                      <span class="hidden sm:inline">Respon {{ service.sla.response_hours }}j</span>
                      <span class="sm:hidden">{{ service.sla.response_hours }}j</span>
                    </span>
                    <span class="text-gray-400 dark:text-gray-600">•</span>
                    <span class="flex items-center gap-1">
                      <svg
                        class="w-3.5 h-3.5 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span class="hidden sm:inline"
                        >Selesai {{ service.sla.resolution_hours }}j</span
                      >
                      <span class="sm:hidden">{{ service.sla.resolution_hours }}j</span>
                    </span>
                  </div>
                </div>
              </div>

              <!-- Right: CTA Button -->
              <div class="w-full sm:w-auto">
                <button
                  @click="goToCreateTicket"
                  :disabled="ctaButtonDisabled"
                  :class="[
                    'group relative w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl font-bold text-sm shadow-lg transition-all duration-300 flex items-center justify-center gap-2',
                    !ctaButtonDisabled
                      ? 'bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white shadow-brand-600/30 hover:shadow-xl hover:scale-105 cursor-pointer'
                      : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed',
                  ]"
                  :title="ctaHelperText"
                >
                  <!-- Icon Login (if not authenticated) -->
                  <svg
                    v-if="!isAuthenticated && service.is_active"
                    class="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                    />
                  </svg>
                  <!-- Icon Plus (if authenticated) -->
                  <svg
                    v-else-if="isAuthenticated && service.is_active"
                    class="w-5 h-5 group-hover:rotate-90 transition-transform duration-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <!-- Icon Disabled -->
                  <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                    />
                  </svg>

                  <span class="truncate">{{ ctaButtonText }}</span>

                  <svg
                    v-if="!ctaButtonDisabled"
                    class="w-4 h-4 group-hover:translate-x-1 transition-transform flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </button>

                <!-- Helper Text -->
                <p class="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
                  {{ ctaHelperText }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<style scoped>
/* Slide Up Animation for Bottom Bar */
.slide-up-enter-active {
  transition: all 0.3s ease-out;
}

.slide-up-leave-active {
  transition: all 0.2s ease-in;
}

.slide-up-enter-from {
  transform: translateY(100%);
  opacity: 0;
}

.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

/* Fade In Animations */
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes modal-pop {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-fade-in {
  animation: fade-in 0.5s ease-out;
}

.animate-fade-in-up {
  animation: fade-in-up 0.6s ease-out;
}

.animate-modal-pop {
  animation: modal-pop 0.3s ease-out;
}

/* Modal Fade Transitions */
.modal-fade-enter-active {
  transition: all 0.3s ease-out;
}

.modal-fade-leave-active {
  transition: all 0.2s ease-in;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .animate-modal-pop,
.modal-fade-leave-to .animate-modal-pop {
  transform: scale(0.95);
}

/* Smooth Scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}

.dark ::-webkit-scrollbar-thumb {
  background: #4a5568;
}

.dark ::-webkit-scrollbar-thumb:hover {
  background: #718096;
}
</style>
