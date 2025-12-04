<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import api from '@/services/api'
import { useRouter } from 'vue-router'
import navbarPage from '@/components/layout/navbarPage.vue'

// IMPORT AOS
import AOS from 'aos'
import 'aos/dist/aos.css'

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

interface Service {
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

interface User {
  nama: string
  instansi: string
}

interface Ticket {
  service: {
    nama_layanan: string
  }
}

interface Feedback {
  id: number
  ticket_id: number
  user_id: number
  rating: number
  review: string
  is_anonymous: boolean
  created_at: string
  user: User
  ticket: Ticket
}

interface TicketLog {
  action_type: string
  created_at: string
  notes: string
}

interface TrackingResult {
  ticket_number: string
  status: string
  created_at: string
  updated_at: string
  priority: string
  logs: TicketLog[]
}

// ============= STATE MANAGEMENT =============
const router = useRouter()
const scrolled = ref(false)
const services = ref<Service[]>([])
const feedbacks = ref<Feedback[]>([])
const ticketNumber = ref('')
const trackingResult = ref<TrackingResult | null>(null)

// Carousel state
const carouselIndex = ref(0)
const isAutoScrolling = ref(true)

const loading = reactive({
  services: true,
  feedbacks: true,
  tracking: false,
})

const error = reactive({
  tracking: '',
  services: '',
  feedbacks: '',
})

// ============= COMPUTED PROPERTIES =============
const currentStep = computed(() => {
  const s = trackingResult.value?.status?.toLowerCase()
  if (!s) return 1
  if (s === 'pending') return 2
  if (s === 'on_progress' || s === 'eskalasi') return 3
  if (s === 'selesai' || s === 'closed') return 4
  return 1
})

const isEscalated = computed(() => {
  return trackingResult.value?.status?.toLowerCase() === 'eskalasi'
})

const progressPercentage = computed(() => {
  switch (currentStep.value) {
    case 1:
      return '0%'
    case 2:
      return '33%'
    case 3:
      return '66%'
    case 4:
      return '100%'
    default:
      return '0%'
  }
})

const visibleFeedbacks = computed(() => {
  if (feedbacks.value.length === 0) return []
  return feedbacks.value.slice(carouselIndex.value, carouselIndex.value + 3)
})
// ============= API & DATA FETCHING =============
const fetchData = async () => {
  try {
    const [srvResponse, fbResponse] = await Promise.all([
      api.get('/public/services'),
      api.get('/public/feedbacks'),
    ])

    if (srvResponse.data.success) {
      services.value = srvResponse.data.data

      error.services = ''
    }

    if (fbResponse.data.success) {
      feedbacks.value = fbResponse.data.data
      error.feedbacks = ''
    }
  } catch (e: any) {
    console.error('Gagal load public data', e)
    error.services = 'Gagal memuat layanan'
    error.feedbacks = 'Gagal memuat ulasan'
  } finally {
    loading.services = false
    loading.feedbacks = false

    // Refresh AOS setelah data dimuat agar posisi elemen terhitung ulang
    setTimeout(() => {
      AOS.refresh()
    }, 500)
  }
}

const checkTicket = async () => {
  if (!ticketNumber.value.trim()) {
    error.tracking = 'Mohon masukkan nomor tiket'
    return
  }

  loading.tracking = true
  error.tracking = ''
  trackingResult.value = null

  try {
    const res = await api.get(`/public/tracking/${ticketNumber.value}`)
    if (res.data.success) {
      trackingResult.value = res.data.data
      // Smooth scroll to result
      setTimeout(() => {
        document.getElementById('tracking-result')?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
      }, 100)
    }
  } catch (err: any) {
    error.tracking =
      err.response?.data?.message || 'Tiket tidak ditemukan. Pastikan nomor tiket benar.'
  } finally {
    loading.tracking = false
  }
}

const resetTracking = () => {
  trackingResult.value = null
  ticketNumber.value = ''
  error.tracking = ''
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// ============= CAROUSEL CONTROLS =============
const nextSlide = () => {
  if (carouselIndex.value < feedbacks.value.length - 3) {
    carouselIndex.value++
  } else {
    carouselIndex.value = 0
  }
}

const prevSlide = () => {
  if (carouselIndex.value > 0) {
    carouselIndex.value--
  } else {
    carouselIndex.value = Math.max(0, feedbacks.value.length - 3)
  }
}

const goToSlide = (index: number) => {
  carouselIndex.value = index
}

// Auto-scroll carousel
let carouselInterval: any = null
const startAutoScroll = () => {
  if (carouselInterval) clearInterval(carouselInterval)
  carouselInterval = setInterval(() => {
    if (isAutoScrolling.value && feedbacks.value.length > 3) {
      nextSlide()
    }
  }, 5000)
}

const stopAutoScroll = () => {
  isAutoScrolling.value = false
  if (carouselInterval) clearInterval(carouselInterval)
}

// ============= NAVIGATION =============
const goToServiceDetail = (serviceId: number) => {
  router.push({ name: 'ServiceDetail', params: { id: serviceId } })
}

// ============= UTILS =============
const getFileUrl = (path: string) =>
  path
    ? path.startsWith('http')
      ? path
      : `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${path}`
    : ''

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

const handleScroll = () => {
  scrolled.value = window.scrollY > 50
}

const translateStatus = (s: string) => {
  const map: Record<string, string> = {
    pending: 'Menunggu',
    on_progress: 'Diproses',
    eskalasi: 'Dieskalasi',
    selesai: 'Selesai',
    closed: 'Selesai',
  }
  return map[s?.toLowerCase()] || s
}

const statusBadgeClass = (s: string) => {
  const map: Record<string, string> = {
    selesai: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    on_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    eskalasi: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    closed: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  }
  return map[s?.toLowerCase()] || 'bg-gray-100 text-gray-700'
}

const getServiceIcon = (kategori: string) => {
  const icons: Record<string, string> = {
    Development: '💻',
    Infrastructure: '🏗️',
    Support: '🛟',
    Design: '🎨',
    Network: '🌐',
    Security: '🔒',
  }
  return icons[kategori] || '🛠️'
}

// ============= LIFECYCLE =============
onMounted(() => {
  fetchData()
  window.addEventListener('scroll', handleScroll)
  startAutoScroll()

  AOS.init({
    duration: 800,
    once: true,
    offset: 50,
  })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  if (carouselInterval) clearInterval(carouselInterval)
  document.body.style.overflow = 'auto'
})
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-800 font-sans selection:bg-brand-200 dark:from-gray-900 dark:to-gray-800 dark:text-gray-100"
  >
    <navbar-page />
    <header class="relative pt-32 pb-24 lg:pt-40 lg:pb-32 overflow-hidden">
      <div class="absolute inset-0 -z-10">
        <div
          class="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-brand-50/30 via-blue-50/20 to-transparent dark:from-brand-950/20 dark:via-blue-950/10"
        ></div>
        <div
          class="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-brand-400/20 rounded-full blur-3xl animate-blob"
        ></div>
        <div
          class="absolute top-1/2 -left-24 w-72 h-72 bg-gradient-to-br from-brand-400/20 to-purple-400/20 rounded-full blur-3xl animate-blob animation-delay-2000"
        ></div>
        <div
          class="absolute bottom-0 right-1/3 w-80 h-80 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-blob animation-delay-4000"
        ></div>
      </div>

      <div class="max-w-5xl mx-auto px-4 text-center relative z-10">
        <div
          data-aos="fade-down"
          class="inline-flex items-center gap-2 py-2 px-4 rounded-full bg-white/80 backdrop-blur-sm border border-brand-200/50 text-brand-700 text-xs font-bold uppercase tracking-wider mb-8 shadow-lg shadow-brand-500/10 dark:bg-gray-800/80 dark:border-brand-800/50 dark:text-brand-300"
        >
          <span class="relative flex h-2 w-2">
            <span
              class="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"
            ></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
          </span>
          Sistem Layanan Digital Terpadu
        </div>

        <h1
          data-aos="fade-up"
          data-aos-delay="100"
          class="text-4xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-6 leading-tight dark:text-white"
        >
          Layanan IT
          <span
            class="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-blue-600 to-brand-700 animate-gradient"
            >Diskominfotiksandi</span
          >
          <br />
          <span class="text-3xl md:text-5xl lg:text-6xl text-gray-700 dark:text-gray-300"
            >Kabupaten Sumbawa</span
          >
        </h1>

        <p
          data-aos="fade-up"
          data-aos-delay="200"
          class="text-lg md:text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed dark:text-gray-400"
        >
          Lacak status permohonan layanan Anda dengan mudah. Masukkan
          <span class="font-semibold text-brand-600 dark:text-brand-400">Nomor Tiket</span> untuk
          melihat progres pengerjaan secara real-time.
        </p>

        <div data-aos="fade-up" data-aos-delay="300" class="max-w-2xl mx-auto">
          <div
            class="bg-white/80 backdrop-blur-xl p-2 rounded-2xl shadow-2xl shadow-gray-900/10 border border-gray-200/50 flex items-center gap-2 dark:bg-gray-800/80 dark:border-gray-700/50 transition-all duration-300 hover:shadow-3xl focus-within:ring-4 focus-within:ring-brand-500/20 focus-within:border-brand-300"
          >
            <div class="pl-4 text-gray-400 dark:text-gray-500">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              v-model="ticketNumber"
              @keyup.enter="checkTicket"
              type="text"
              placeholder="Contoh: TKT-176xxxxxx"
              class="flex-1 bg-transparent border-none focus:ring-0 text-gray-800 placeholder-gray-400 h-14 text-lg dark:text-white dark:placeholder-gray-500 font-medium"
            />
            <button
              @click="checkTicket"
              :disabled="loading.tracking || !ticketNumber"
              class="group px-8 h-14 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white font-bold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-brand-600/30 hover:shadow-xl hover:shadow-brand-600/40 hover:scale-105 active:scale-95"
            >
              <svg
                v-if="loading.tracking"
                class="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <svg
                v-else
                class="w-5 h-5 group-hover:translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <span>{{ loading.tracking ? 'Mencari...' : 'Cek Tiket' }}</span>
            </button>
          </div>

          <transition name="slide-fade">
            <div v-if="error.tracking" class="mt-4">
              <div
                class="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 text-red-600 border border-red-200 dark:bg-red-900/20 dark:border-red-800/50 dark:text-red-400 text-sm font-medium shadow-lg animate-shake"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {{ error.tracking }}
              </div>
            </div>
          </transition>
        </div>
      </div>
    </header>

    <transition name="scale-fade">
      <div
        v-if="trackingResult"
        id="tracking-result"
        class="max-w-4xl mx-auto px-4 pb-20 animate-fade-in-up"
      >
        <div
          class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden"
        >
          <div
            class="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-brand-50 to-blue-50 dark:from-brand-900/20 dark:to-blue-900/20 rounded-bl-full -mr-16 -mt-16 opacity-50"
          ></div>
          <div
            class="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-tr-full -ml-12 -mb-12 opacity-50"
          ></div>

          <div
            class="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 relative z-10 gap-4"
          >
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <span
                  class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 text-xs font-bold uppercase tracking-wider"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                    />
                  </svg>
                  Nomor Tiket
                </span>
              </div>
              <h3 class="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                {{ trackingResult.ticket_number }}
              </h3>
              <div class="flex items-center gap-2 mt-2 text-sm text-gray-500 dark:text-gray-400">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Dibuat: {{ formatDate(trackingResult.created_at) }}
              </div>
            </div>

            <div class="flex flex-col items-end gap-2">
              <span
                :class="[
                  'px-5 py-2 rounded-full text-sm font-bold uppercase tracking-wide shadow-lg',
                  statusBadgeClass(trackingResult.status),
                ]"
              >
                {{ translateStatus(trackingResult.status) }}
              </span>
              <div class="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
                Prioritas:
                <span class="font-semibold capitalize">{{ trackingResult.priority }}</span>
              </div>
            </div>
          </div>

          <div class="mt-10 mb-8 overflow-x-auto p-6 no-scrollbar">
            <div class="min-w-[600px] px-4 relative">
              <div
                class="absolute top-[1.4rem] left-8 right-8 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full -z-10"
              ></div>

              <div
                class="absolute top-[1.4rem] left-8 h-1.5 rounded-full -z-0 transition-all duration-1000 ease-out"
                :class="
                  isEscalated
                    ? 'bg-gradient-to-r from-orange-500 to-red-500'
                    : 'bg-gradient-to-r from-brand-500 to-blue-500'
                "
                :style="{ width: `calc(${progressPercentage} - 2rem)` }"
              ></div>

              <div class="flex justify-between w-full relative">
                <div class="flex flex-col items-center relative group w-1/4">
                  <div
                    class="w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-500 z-10 bg-white dark:bg-gray-800 shadow-lg relative"
                    :class="
                      currentStep >= 1
                        ? 'border-brand-500 text-brand-600 scale-110 shadow-brand-500/30'
                        : 'border-gray-200 text-gray-300 dark:border-gray-600'
                    "
                  >
                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span v-if="currentStep >= 1" class="absolute -top-1 -right-1 flex h-3 w-3">
                      <span
                        class="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"
                      ></span>
                      <span class="relative inline-flex rounded-full h-3 w-3 bg-brand-500"></span>
                    </span>
                  </div>
                  <p
                    class="mt-4 text-xs font-bold uppercase tracking-wider text-center transition-colors duration-300"
                    :class="
                      currentStep >= 1 ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400'
                    "
                  >
                    Diterima
                  </p>
                </div>

                <div class="flex flex-col items-center relative group w-1/4">
                  <div
                    class="w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-500 z-10 bg-white dark:bg-gray-800 shadow-lg relative"
                    :class="
                      currentStep >= 2
                        ? 'border-brand-500 text-brand-600 scale-110 shadow-brand-500/30'
                        : 'border-gray-200 text-gray-300 dark:border-gray-600'
                    "
                  >
                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span v-if="currentStep === 2" class="absolute -top-1 -right-1 flex h-3 w-3">
                      <span
                        class="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"
                      ></span>
                      <span class="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                    </span>
                  </div>
                  <p
                    class="mt-4 text-xs font-bold uppercase tracking-wider text-center transition-colors duration-300"
                    :class="
                      currentStep >= 2 ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400'
                    "
                  >
                    Menunggu
                  </p>
                </div>

                <div class="flex flex-col items-center relative group w-1/4">
                  <div
                    class="w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-500 z-10 bg-white dark:bg-gray-800 shadow-lg relative"
                    :class="
                      currentStep >= 3
                        ? isEscalated
                          ? 'border-orange-500 text-orange-600 animate-pulse scale-110 shadow-orange-500/30'
                          : 'border-brand-500 text-brand-600 scale-110 shadow-brand-500/30'
                        : 'border-gray-200 text-gray-300 dark:border-gray-600'
                    "
                  >
                    <svg
                      v-if="isEscalated"
                      class="w-6 h-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    <svg
                      v-else
                      class="w-6 h-6"
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
                    <span v-if="currentStep === 3" class="absolute -top-1 -right-1 flex h-3 w-3">
                      <span
                        class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                        :class="isEscalated ? 'bg-orange-400' : 'bg-blue-400'"
                      ></span>
                      <span
                        class="relative inline-flex rounded-full h-3 w-3"
                        :class="isEscalated ? 'bg-orange-500' : 'bg-blue-500'"
                      ></span>
                    </span>
                  </div>
                  <p
                    class="mt-4 text-xs font-bold uppercase tracking-wider text-center transition-colors duration-300"
                    :class="
                      currentStep >= 3
                        ? isEscalated
                          ? 'text-orange-600 dark:text-orange-400'
                          : 'text-brand-600 dark:text-brand-400'
                        : 'text-gray-400'
                    "
                  >
                    {{ isEscalated ? 'Dieskalasi' : 'Diproses' }}
                  </p>
                </div>

                <div class="flex flex-col items-center relative group w-1/4">
                  <div
                    class="w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-500 z-10 bg-white dark:bg-gray-800 shadow-lg relative"
                    :class="
                      currentStep >= 4
                        ? 'border-green-500 text-green-600 scale-110 shadow-green-500/30'
                        : 'border-gray-200 text-gray-300 dark:border-gray-600'
                    "
                  >
                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span v-if="currentStep >= 4" class="absolute -top-1 -right-1 flex h-3 w-3">
                      <span
                        class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"
                      ></span>
                      <span class="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                  </div>
                  <p
                    class="mt-4 text-xs font-bold uppercase tracking-wider text-center transition-colors duration-300"
                    :class="
                      currentStep >= 4 ? 'text-green-600 dark:text-green-400' : 'text-gray-400'
                    "
                  >
                    Selesai
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div
            class="bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-700/30 dark:to-gray-800/30 rounded-2xl p-6 border border-gray-200 dark:border-gray-600 shadow-inner"
          >
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
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p class="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Update Terakhir
              </p>
            </div>

            <div
              v-if="trackingResult.logs && trackingResult.logs.length > 0"
              class="flex gap-4 items-start"
            >
              <div class="mt-1.5 relative">
                <div
                  class="w-3 h-3 rounded-full animate-pulse"
                  :class="isEscalated ? 'bg-orange-500' : 'bg-brand-500'"
                ></div>
                <div
                  class="absolute inset-0 w-3 h-3 rounded-full animate-ping"
                  :class="isEscalated ? 'bg-orange-400' : 'bg-brand-400'"
                  style="animation-duration: 2s"
                ></div>
              </div>
              <div class="flex-1">
                <p class="text-base font-semibold text-gray-900 dark:text-white leading-relaxed">
                  {{ trackingResult.logs[trackingResult.logs.length - 1].notes }}
                </p>
                <div class="flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {{ formatDate(trackingResult.logs[trackingResult.logs.length - 1].created_at) }}
                </div>
              </div>
            </div>
            <div v-else class="flex items-center gap-3 text-gray-500 dark:text-gray-400">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <p class="text-sm italic">Belum ada riwayat aktivitas.</p>
            </div>
          </div>

          <button
            @click="resetTracking"
            class="mt-8 w-full py-3.5 text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group border border-gray-200 dark:border-gray-600"
          >
            <svg
              class="w-4 h-4 group-hover:rotate-180 transition-transform duration-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Cari Tiket Lain
          </button>
        </div>
      </div>
    </transition>

    <section
      class="py-24 px-4 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800"
    >
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-16">
          <span
            data-aos="fade-down"
            class="inline-block px-4 py-1.5 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 text-sm font-bold uppercase tracking-wider mb-4"
          >
            Katalog Layanan
          </span>
          <h2
            data-aos="fade-up"
            class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4"
          >
            Layanan
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-blue-600"
              >Unggulan Kami</span
            >
          </h2>
          <p
            data-aos="fade-up"
            data-aos-delay="100"
            class="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
          >
            Pilih layanan yang sesuai dengan kebutuhan Anda. Login untuk mulai membuat tiket
            permohonan.
          </p>
        </div>

        <div v-if="loading.services" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div
            v-for="i in 6"
            :key="i"
            class="h-80 bg-gray-100 dark:bg-gray-800 rounded-3xl animate-pulse relative overflow-hidden"
          >
            <div
              class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"
            ></div>
          </div>
        </div>

        <div
          v-else-if="services.length > 0"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <div
            v-for="(service, index) in services"
            :key="service.id"
            @click="goToServiceDetail(service.id)"
            data-aos="fade-up"
            :data-aos-delay="index * 100"
            class="group cursor-pointer p-8 rounded-3xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-brand-300 dark:hover:border-brand-600 hover:shadow-2xl hover:shadow-brand-500/10 hover:-translate-y-2 transition-all duration-500 relative overflow-hidden"
          >
            <div
              class="absolute inset-0 bg-gradient-to-br from-brand-50/0 to-blue-50/0 group-hover:from-brand-50/50 group-hover:to-blue-50/30 dark:group-hover:from-brand-900/20 dark:group-hover:to-blue-900/20 transition-all duration-500 rounded-3xl"
            ></div>

            <div class="relative z-10">
              <div
                class="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-50 to-blue-50 dark:from-brand-900/30 dark:to-blue-900/30 shadow-lg border border-brand-100 dark:border-brand-800 flex items-center justify-center mb-6 text-3xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500"
              >
                <img
                  v-if="service.icon"
                  :src="getFileUrl(service.icon)"
                  class="w-10 h-10 object-contain"
                />
                <span v-else>{{ getServiceIcon(service.kategori) }}</span>
              </div>

              <h3
                class="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors"
              >
                {{ service.nama_layanan }}
              </h3>

              <p class="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6 line-clamp-3">
                {{ service.deskripsi }}
              </p>

              <div
                class="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700"
              >
                <span
                  class="px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wide"
                >
                  {{ service.kategori }}
                </span>
                <div
                  class="flex items-center gap-2 text-brand-600 dark:text-brand-400 font-bold text-sm group-hover:gap-3 transition-all"
                >
                  <span>Detail</span>
                  <svg
                    class="w-4 h-4 group-hover:translate-x-1 transition-transform"
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
                </div>
              </div>

              <div
                v-if="service.sla"
                class="mt-4 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span
                  >SLA: {{ service.sla.response_hours }}j respon,
                  {{ service.sla.resolution_hours }}j selesai</span
                >
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-20">
          <div
            class="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
          >
            <svg
              class="w-10 h-10 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
          </div>
          <p class="text-gray-500 dark:text-gray-400 text-lg">Belum ada layanan tersedia</p>
        </div>
      </div>
    </section>

    <section
      class="py-24 px-4 overflow-hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800"
    >
      <div class="max-w-7xl mx-auto">
        <div class="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
          <div>
            <span
              class="inline-block px-4 py-1.5 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-sm font-bold uppercase tracking-wider mb-4"
            >
              Testimoni
            </span>
            <h2 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2">
              Suara
              <span
                class="text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-600"
                >Pengguna</span
              >
            </h2>
            <p class="text-lg text-gray-600 dark:text-gray-400">
              Apa kata mereka tentang layanan kami?
            </p>
          </div>

          <div v-if="feedbacks.length > 3" class="flex items-center gap-3">
            <button
              @click="(prevSlide(), stopAutoScroll())"
              class="w-12 h-12 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-brand-500 dark:hover:border-brand-500 text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <div class="flex gap-2">
              <button
                v-for="(_, index) in Math.max(1, feedbacks.length - 2)"
                :key="index"
                @click="(goToSlide(index), stopAutoScroll())"
                class="transition-all duration-300"
                :class="
                  carouselIndex === index
                    ? 'w-8 h-2 bg-brand-600 rounded-full'
                    : 'w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full hover:bg-brand-400'
                "
              ></button>
            </div>

            <button
              @click="(nextSlide(), stopAutoScroll())"
              class="w-12 h-12 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-brand-500 dark:hover:border-brand-500 text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>

        <div v-if="loading.feedbacks" class="text-center py-12">
          <div class="inline-flex items-center gap-3 text-gray-400">
            <svg
              class="animate-spin h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Memuat ulasan...
          </div>
        </div>

        <div v-else-if="feedbacks.length > 0" class="relative">
          <div class="overflow-hidden py-12 -my-12 px-4 -mx-4">
            <div
              class="flex transition-transform duration-700 ease-out gap-6"
              :style="{ transform: `translateX(-${carouselIndex * (100 / 3 + 2)}%)` }"
            >
              <div
                v-for="fb in feedbacks"
                :key="fb.id"
                class="flex-shrink-0 w-full md:w-[calc(33.333%-1rem)] p-8 rounded-2xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 border border-gray-200 dark:border-gray-600 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 h-full"
              >
                <div class="flex gap-1 text-yellow-400 mb-5">
                  <span v-for="n in 5" :key="n">
                    <svg
                      v-if="n <= fb.rating"
                      class="w-5 h-5 fill-current drop-shadow-sm"
                      viewBox="0 0 20 20"
                    >
                      <path
                        d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                      />
                    </svg>
                    <svg
                      v-else
                      class="w-5 h-5 text-gray-300 dark:text-gray-600 fill-current"
                      viewBox="0 0 20 20"
                    >
                      <path
                        d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                      />
                    </svg>
                  </span>
                </div>

                <div class="mb-4">
                  <svg
                    class="w-10 h-10 text-brand-200 dark:text-brand-900/50"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"
                    />
                  </svg>
                </div>

                <p
                  class="text-gray-700 dark:text-gray-300 italic mb-6 leading-relaxed line-clamp-4 min-h-[6rem]"
                >
                  "{{ fb.review }}"
                </p>

                <div
                  class="mb-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 text-xs font-semibold"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                  {{ fb.ticket?.service?.nama_layanan || 'Layanan Umum' }}
                </div>

                <div
                  class="flex items-center gap-4 pt-6 border-t border-gray-200 dark:border-gray-600"
                >
                  <div
                    class="w-12 h-12 rounded-full bg-gradient-to-br from-brand-400 to-blue-500 flex items-center justify-center font-bold text-white text-lg shadow-lg"
                  >
                    {{ fb.user?.nama?.charAt(0).toUpperCase() || '?' }}
                  </div>
                  <div>
                    <p class="text-sm font-bold text-gray-900 dark:text-white">
                      {{ fb.user?.nama || 'Pengguna' }}
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">
                      {{ fb.user?.instansi || 'User Umum' }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-20">
          <div
            class="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
          >
            <svg
              class="w-10 h-10 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
              />
            </svg>
          </div>
          <p class="text-gray-500 dark:text-gray-400 text-lg">Belum ada ulasan tersedia</p>
        </div>
      </div>
    </section>

    <footer class="bg-gray-900 dark:bg-black text-gray-400 py-16 border-t border-gray-800">
      <div class="max-w-7xl mx-auto px-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div>
            <div class="flex items-center gap-3 mb-4">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden">
                <img
                  src="../../images/logo/sabalong.png"
                  alt="Sabalong"
                  class="w-full h-full object-contain shadow-none drop-shadow-none filter-none"
                />
              </div>

              <span class="text-white font-bold text-2xl tracking-widest"> SABALONG </span>
            </div>

            <p class="text-sm leading-relaxed">
              Sistem Layanan Digital Terpadu Diskominfotiksandi Kabupaten Sumbawa untuk memberikan
              pelayanan IT yang cepat, transparan, dan terukur.
            </p>
          </div>

          <div>
            <h4 class="text-white font-bold mb-4">Tautan Cepat</h4>
            <ul class="space-y-2 text-sm">
              <li>
                <a href="#" class="hover:text-brand-400 transition-colors flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                  Tentang Kami
                </a>
              </li>
              <li>
                <a href="#" class="hover:text-brand-400 transition-colors flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                  Katalog Layanan
                </a>
              </li>
              <li>
                <router-link
                  to="/signin"
                  class="hover:text-brand-400 transition-colors flex items-center gap-2"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                  Login Pegawai
                </router-link>
              </li>
            </ul>
          </div>

          <div>
            <h4 class="text-white font-bold mb-4">Kontak</h4>
            <ul class="space-y-3 text-sm">
              <li class="flex items-start gap-3">
                <svg
                  class="w-5 h-5 text-brand-400 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span>Jln. Garuda No. 1 Sumbawa Besar, NTB</span>
              </li>
              <li class="flex items-center gap-3">
                <svg
                  class="w-5 h-5 text-brand-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span>diskominfotik@sumbawakab.go.id</span>
              </li>
              <li class="flex items-center gap-3">
                <svg
                  class="w-5 h-5 text-brand-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <span>( 0371 ) 21582</span>
              </li>
            </ul>
          </div>
        </div>

        <div
          class="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <p class="text-sm text-center md:text-left">
            © 2025 <span class="text-white font-semibold">Diskominfotiksandi</span> Kabupaten
            Sumbawa. All rights reserved.
          </p>
          <div class="flex gap-4">
            <a
              href="https://www.facebook.com/diskominfotik.sumbawa.9/"
              target="_blank"
              class="w-10 h-10 rounded-full bg-gray-800 hover:bg-brand-600 flex items-center justify-center transition-all hover:scale-110"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                />
              </svg>
            </a>
            <a
              href="https://www.instagram.com/kominfotik_channel/"
              class="w-10 h-10 rounded-full bg-gray-800 hover:bg-brand-600 flex items-center justify-center transition-all hover:scale-110"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* ============= ANIMATIONS ============= */
@keyframes blob {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  25% {
    transform: translate(20px, -20px) scale(1.1);
  }
  50% {
    transform: translate(-20px, 20px) scale(0.9);
  }
  75% {
    transform: translate(20px, 20px) scale(1.05);
  }
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

@keyframes gradient {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  10%,
  30%,
  50%,
  70%,
  90% {
    transform: translateX(-5px);
  }
  20%,
  40%,
  60%,
  80% {
    transform: translateX(5px);
  }
}

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
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fade-in-down {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes modal-pop {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-blob {
  animation: blob 7s infinite;
}

.animate-shimmer {
  animation: shimmer 2s infinite;
}

.animate-gradient {
  background-size: 200% 200%;
  animation: gradient 3s ease infinite;
}

.animate-shake {
  animation: shake 0.5s;
}

.animate-fade-in {
  animation: fade-in 0.6s ease-out;
}

.animate-fade-in-up {
  animation: fade-in-up 0.6s ease-out;
}

.animate-fade-in-down {
  animation: fade-in-down 0.6s ease-out;
}

.animate-modal-pop {
  animation: modal-pop 0.3s ease-out;
}

.animation-delay-200 {
  animation-delay: 0.2s;
}

.animation-delay-400 {
  animation-delay: 0.4s;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}

/* ============= TRANSITIONS ============= */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from {
  transform: translateY(-10px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}

.scale-fade-enter-active {
  transition: all 0.4s ease-out;
}

.scale-fade-leave-active {
  transition: all 0.3s ease-in;
}

.scale-fade-enter-from {
  transform: scale(0.95);
  opacity: 0;
}

.scale-fade-leave-to {
  transform: scale(0.95);
  opacity: 0;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .animate-modal-pop,
.modal-fade-leave-to .animate-modal-pop {
  transform: scale(0.9);
}

/* ============= UTILITIES ============= */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-4 {
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

input:focus {
  outline: none;
}
</style>
