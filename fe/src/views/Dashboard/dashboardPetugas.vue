<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />

    <div class="min-h-screen space-y-8 p-4 xl:p-10">
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <!-- Current Task Status -->
        <div
          :class="[
            'relative overflow-hidden rounded-2xl p-6 shadow-lg transition-transform hover:scale-[1.02]',
            currentTicket
              ? 'bg-gradient-to-br from-brand-600 to-brand-700 text-white'
              : 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 text-gray-600 dark:text-gray-300',
          ]"
        >
          <div class="relative z-10">
            <div class="flex items-center justify-between mb-3">
              <p
                :class="[
                  'text-xs font-semibold uppercase tracking-wider',
                  currentTicket ? 'text-brand-100' : 'text-gray-500 dark:text-gray-400',
                ]"
              >
                Status Tugas
              </p>
              <div
                :class="[
                  'h-3 w-3 rounded-full',
                  currentTicket ? 'bg-green-400 animate-pulse' : 'bg-gray-400',
                ]"
              ></div>
            </div>
            <h4 class="text-3xl font-bold">
              {{ currentTicket ? '1 Tiket' : 'Siap' }}
            </h4>
            <p
              :class="[
                'mt-1 text-sm',
                currentTicket ? 'text-brand-100/80' : 'text-gray-500 dark:text-gray-400',
              ]"
            >
              {{ currentTicket ? 'Sedang Dikerjakan' : 'Tidak Ada Tugas' }}
            </p>
            <button
              v-if="currentTicket"
              @click="$router.push(`detail-ticket/${currentTicket.id}`)"
              class="mt-3 text-xs font-bold uppercase tracking-wider hover:underline"
            >
              Lihat Detail →
            </button>
          </div>
          <div
            class="absolute -right-6 -bottom-6 h-32 w-32 rounded-full bg-white/10 blur-2xl"
          ></div>
        </div>

        <div
          class="flex items-center rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
        >
          <div
            class="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
          >
            <svg class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <div class="ml-5">
            <h4 class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ loading.stats ? '...' : stats.on_progress }}
            </h4>
            <p class="text-sm text-gray-500 dark:text-gray-400">Dikerjakan</p>
          </div>
        </div>

        <div
          class="flex items-center rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
        >
          <div
            class="flex h-14 w-14 items-center justify-center rounded-xl bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400"
          >
            <svg class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div class="ml-5">
            <h4 class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ loading.stats ? '...' : stats.completed }}
            </h4>
            <p class="text-sm text-gray-500 dark:text-gray-400">Selesai</p>
          </div>
        </div>

        <div
          class="flex items-center rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
        >
          <div
            class="flex h-14 w-14 items-center justify-center rounded-xl bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400"
          >
            <svg class="h-7 w-7" fill="currentColor" viewBox="0 0 20 20">
              <path
                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
              />
            </svg>
          </div>
          <div class="ml-5">
            <h4 class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ loading.stats ? '...' : averageRating }}
            </h4>
            <p class="text-sm text-gray-500 dark:text-gray-400">Rating Rata-rata</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <!-- Current Ticket Detail -->
        <div class="lg:col-span-2">
          <div
            class="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900"
          >
            <div
              class="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-800"
            >
              <h3 class="text-lg font-bold text-gray-900 dark:text-white">Tiket Saya Saat Ini</h3>
              <router-link
                to="/petugas/tickets"
                class="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
              >
                Lihat Riwayat →
              </router-link>
            </div>

            <!-- No Current Ticket -->
            <div v-if="!currentTicket" class="p-10 text-center">
              <div
                class="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/20"
              >
                <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h4 class="text-lg font-semibold text-gray-900 dark:text-white">
                Tidak Ada Tugas Aktif
              </h4>
              <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Anda sedang tidak menangani tiket apapun. Tunggu admin untuk menugaskan tiket baru.
              </p>
            </div>

            <!-- Current Ticket Card -->
            <div v-else class="p-6">
              <div
                class="rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-6 dark:border-gray-700 dark:from-gray-800 dark:to-gray-900"
              >
                <!-- Header -->
                <div class="flex items-start justify-between mb-4">
                  <div>
                    <span class="text-sm font-bold text-brand-600 dark:text-brand-400">
                      {{ currentTicket.ticket_number }}
                    </span>
                    <h4 class="mt-1 text-xl font-bold text-gray-900 dark:text-white">
                      {{ currentTicket.judul_permohonan }}
                    </h4>
                  </div>
                  <div class="flex gap-2">
                    <span :class="statusBadgeClass(currentTicket.status)">
                      {{ currentTicket.status }}
                    </span>
                    <span :class="priorityBadgeClass(currentTicket.priority)">
                      {{ currentTicket.priority }}
                    </span>
                  </div>
                </div>

                <!-- Description -->
                <p class="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mb-4">
                  {{ currentTicket.deskripsi }}
                </p>

                <!-- Info Grid -->
                <div class="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Pelapor</p>
                    <p class="mt-1 font-medium text-gray-900 dark:text-white">
                      {{ currentTicket.requester?.nama }}
                    </p>
                  </div>
                  <div>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Layanan</p>
                    <p class="mt-1 font-medium text-gray-900 dark:text-white">
                      {{ currentTicket.service?.nama_layanan }}
                    </p>
                  </div>
                  <div>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Response Deadline</p>
                    <p class="mt-1 font-medium text-gray-900 dark:text-white">
                      {{ formatDate(currentTicket.response_deadline) }}
                    </p>
                  </div>
                  <div>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Resolution Deadline</p>
                    <p
                      :class="[
                        'mt-1 font-medium',
                        isSLAMissed(currentTicket.resolution_deadline)
                          ? 'text-red-600'
                          : 'text-gray-900 dark:text-white',
                      ]"
                    >
                      {{ formatDate(currentTicket.resolution_deadline) }}
                      <span v-if="isSLAMissed(currentTicket.resolution_deadline)" class="text-xs"
                        >⚠️</span
                      >
                    </p>
                  </div>
                </div>

                <!-- Actions -->
                <div class="flex gap-3">
                  <button
                    @click="$router.push(`/detail-ticket/${currentTicket.id}`)"
                    class="flex-1 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
                  >
                    Kerjakan Tiket
                  </button>
                  <!-- <button
                    @click="openEscalateModal(currentTicket)"
                    class="rounded-lg border border-red-300 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 hover:bg-red-100 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
                  >
                    Eskalasi
                  </button> -->
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Feedbacks -->
        <div>
          <div
            class="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900"
          >
            <div
              class="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-800"
            >
              <div>
                <h3 class="text-lg font-bold text-gray-900 dark:text-white">Feedback Terbaru</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">Review dari pengguna</p>
              </div>
              <!-- <router-link
                to="/petugas/feedbacks"
                class="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
              >
                Lihat Semua →
              </router-link> -->
            </div>

            <div class="divide-y divide-gray-200 dark:divide-gray-700">
              <div v-if="loading.feedbacks" class="p-6 text-center text-sm text-gray-500">
                Memuat feedback...
              </div>
              <div
                v-else-if="recentFeedbacks.length === 0"
                class="p-6 text-center text-sm text-gray-500 dark:text-gray-400"
              >
                <svg
                  class="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
                <p class="mt-2">Belum ada feedback</p>
              </div>
              <div v-else v-for="feedback in recentFeedbacks" :key="feedback.id" class="p-4">
                <div class="flex items-center gap-1 mb-2">
                  <svg
                    v-for="star in 5"
                    :key="star"
                    :class="[
                      'h-4 w-4',
                      star <= feedback.rating
                        ? 'text-yellow-400'
                        : 'text-gray-300 dark:text-gray-600',
                    ]"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                    />
                  </svg>
                  <span class="ml-1 text-sm font-bold text-gray-900 dark:text-white">
                    {{ feedback.rating }}/5
                  </span>
                </div>
                <p class="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                  {{ feedback.review || 'Tidak ada review' }}
                </p>
                <div class="mt-2 flex items-center justify-between">
                  <span class="text-xs text-gray-500">
                    {{ feedback.ticket?.ticket_number }}
                  </span>
                  <span class="text-xs text-gray-500 dark:text-gray-400">
                    {{ formatDate(feedback.created_at) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AdminLayout from '../../components/layout/AdminLayout.vue'
import PageBreadcrumb from '../../components/common/PageBreadcrumb.vue'
import api from '../../services/api'
import type { Ticket, Feedback } from '../../types'

// Hapus interface lokal karena sudah ada di types/index.ts
const router = useRouter()
const currentPageTitle = ref('Dashboard Petugas')

const userId = ref<number | null>(null)
const myTickets = ref<Ticket[]>([])
const recentFeedbacks = ref<Feedback[]>([])
const allMyFeedbacks = ref<Feedback[]>([])

const loading = reactive({
  stats: false,
  tickets: false,
  feedbacks: false,
})

const stats = reactive({
  total: 0,
  on_progress: 0,
  completed: 0,
  average_rating: '0.0', // String untuk konsistensi dengan toFixed()
})

const currentTicket = computed(() => {
  return myTickets.value.find((t) => t.status === 'on_progress' || t.status === 'pending') || null
})

const averageRating = computed(() => {
  if (allMyFeedbacks.value.length === 0) return '0.0'
  const sum = allMyFeedbacks.value.reduce((acc, f) => acc + f.rating, 0)
  return (sum / allMyFeedbacks.value.length).toFixed(1)
})

// API Actions
const fetchMyTickets = async () => {
  loading.tickets = true
  try {
    const profileRes = await api.get('/users/profile')
    if (profileRes.data.success) {
      userId.value = profileRes.data.data.id
    }

    const res = await api.get('/tickets')
    if (res.data.success) {
      const allMyTickets = res.data.data.filter((t: any) => t.assigned_to_id === userId.value)

      myTickets.value = allMyTickets

      stats.total = allMyTickets.length
      stats.on_progress = allMyTickets.filter((t: any) => t.status === 'on_progress').length
      stats.completed = allMyTickets.filter((t: any) =>
        ['selesai', 'closed'].includes(t.status),
      ).length
    }
  } catch (err) {
    console.error('Gagal load tickets', err)
  } finally {
    loading.tickets = false
  }
}

const fetchMyFeedbacks = async () => {
  loading.feedbacks = true
  try {
    const res = await api.get('/feedbacks')
    if (res.data.success) {
      const myTicketIds = myTickets.value.map((t) => t.id)

      const myFeedbacks = res.data.data.filter((f: any) => myTicketIds.includes(f.ticket_id))

      console.log('Feedback milik tiket petugas:', myFeedbacks)
      allMyFeedbacks.value = myFeedbacks
      recentFeedbacks.value = myFeedbacks.slice(0, 3)

      if (myFeedbacks.length > 0) {
        const total = myFeedbacks.reduce((sum: number, f: any) => sum + f.rating, 0)
        stats.average_rating = (total / myFeedbacks.length).toFixed(1)
      }
    }
  } catch (err) {
    console.error('Gagal load feedbacks', err)
  } finally {
    loading.feedbacks = false
  }
}

// Handlers
const goToTicketDetail = (ticketId: number) => {
  router.push(`/petugas/tickets/${ticketId}`)
}

const openEscalateModal = (ticket: Ticket) => {
  // TODO: Implement escalate modal
  alert('Fitur eskalasi akan segera dibuat')
}

const isSLAMissed = (deadline: string) => {
  if (!deadline) return false
  return new Date() > new Date(deadline)
}

// Helpers
const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const statusBadgeClass = (status: string) => {
  const s = status?.toLowerCase()
  if (s === 'selesai' || s === 'closed')
    return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-full text-xs font-bold uppercase'
  if (s === 'pending')
    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 px-2 py-1 rounded-full text-xs font-bold uppercase'
  if (s === 'on_progress')
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded-full text-xs font-bold uppercase'
  if (s === 'eskalasi')
    return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 px-2 py-1 rounded-full text-xs font-bold uppercase'
  if (s === 'on_hold')
    return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 px-2 py-1 rounded-full text-xs font-bold uppercase'
  return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 px-2 py-1 rounded-full text-xs font-bold uppercase'
}

const priorityBadgeClass = (priority: string) => {
  const p = priority?.toLowerCase()
  if (p === 'high' || p === 'urgent')
    return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 px-2 py-1 rounded-full text-xs font-bold uppercase'
  if (p === 'medium')
    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 px-2 py-1 rounded-full text-xs font-bold uppercase'
  if (p === 'low')
    return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-full text-xs font-bold uppercase'
  return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 px-2 py-1 rounded-full text-xs font-bold uppercase'
}

onMounted(async () => {
  loading.stats = true
  await fetchMyTickets()
  await fetchMyFeedbacks()
  loading.stats = false
})
</script>

<style scoped>
/* No additional styles needed */
</style>
