<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />

    <div class="min-h-screen space-y-8 p-4 xl:p-10">
      <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div
          class="flex items-center rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
        >
          <div
            class="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-blue-600"
          >
            <svg class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <div class="ml-5">
            <h4 class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ loading.dashboard ? '...' : totalTicketsCount }}
            </h4>
            <p class="text-sm text-gray-500">Total Semua Tiket</p>
          </div>
        </div>
        <div
          class="flex items-center rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
        >
          <div
            class="flex h-14 w-14 items-center justify-center rounded-xl bg-yellow-50 text-yellow-600"
          >
            <svg class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div class="ml-5">
            <h4 class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ loading.dashboard ? '...' : dashboardStats.pending }}
            </h4>
            <p class="text-sm text-gray-500">Tiket Pending</p>
          </div>
        </div>
        <div
          class="flex items-center rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
        >
          <div
            class="flex h-14 w-14 items-center justify-center rounded-xl bg-brand-50 text-brand-600"
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
              {{ loading.dashboard ? '...' : dashboardStats.on_progress }}
            </h4>
            <p class="text-sm text-gray-500">Sedang Dikerjakan</p>
          </div>
        </div>
      </div>

      <div
        class="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900"
      >
        <div
          class="flex flex-col gap-6 border-b border-gray-200 p-6 dark:border-gray-800 lg:flex-row lg:items-center lg:justify-between"
        >
          <div>
            <h3 class="text-lg font-bold text-gray-900 dark:text-white">Daftar Tiket Masuk</h3>
          </div>

          <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div class="flex rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
              <button
                v-for="status in ['all', 'pending', 'on_progress', 'selesai']"
                :key="status"
                @click="statusFilter = status"
                :class="[
                  'rounded-md px-4 py-2 text-sm font-medium capitalize transition-all',
                  statusFilter === status
                    ? 'bg-white text-brand-600 shadow-sm dark:bg-gray-700 dark:text-white'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400',
                ]"
              >
                {{ status.replace('_', ' ') }}
              </button>
            </div>

            <div class="relative">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Cari No Tiket..."
                class="w-full rounded-lg border border-gray-300 bg-white py-2 pl-4 pr-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white sm:w-64"
              />
            </div>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead
              class="border-b border-gray-200 bg-gray-50/50 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-400"
            >
              <tr>
                <th class="px-6 py-4">Tiket & SLA</th>
                <th class="px-6 py-4">Pelapor</th>
                <th class="px-6 py-4">Layanan</th>
                <th class="px-6 py-4">Prioritas</th>
                <th class="px-6 py-4">Petugas</th>
                <th class="px-6 py-4">Status</th>
                <th class="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-if="loading.tickets">
                <td colspan="7" class="px-6 py-12 text-center text-gray-500">
                  Memuat data tiket...
                </td>
              </tr>
              <tr
                v-else
                v-for="ticket in paginatedTickets"
                :key="ticket.id"
                class="group transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <td class="px-6 py-4">
                  <div class="flex flex-col gap-1">
                    <span class="font-bold text-brand-600 dark:text-brand-400">
                      {{ ticket.ticket_number }}
                    </span>
                    <span
                      class="line-clamp-1 max-w-xs text-sm font-medium text-gray-900 dark:text-white"
                      :title="ticket.judul_permohonan"
                    >
                      {{ ticket.judul_permohonan }}
                    </span>

                    <div
                      v-if="
                        ticket.status !== 'selesai' &&
                        ticket.status !== 'closed' &&
                        ticket.resolution_deadline
                      "
                      class="mt-1 flex items-center gap-1"
                    >
                      <span
                        :class="[
                          'flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded font-semibold border',
                          getSLAClass(ticket.resolution_deadline),
                        ]"
                      >
                        <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {{ getSLAText(ticket.resolution_deadline) }}
                      </span>
                    </div>
                    <div v-else class="text-xs text-gray-500">
                      {{ formatDate(ticket.created_at) }}
                    </div>
                  </div>
                </td>

                <td class="px-6 py-4">
                  <div class="flex flex-col">
                    <span class="font-medium text-gray-900 dark:text-white">{{
                      ticket.requester?.nama || 'Unknown'
                    }}</span>
                    <span class="text-xs text-gray-500 dark:text-gray-400">{{
                      ticket.requester?.instansi || '-'
                    }}</span>
                  </div>
                </td>

                <td class="px-6 py-4">
                  <span class="text-sm text-gray-700 dark:text-gray-300">{{
                    ticket.service?.nama_layanan || '-'
                  }}</span>
                </td>

                <td class="px-6 py-4">
                  <span
                    :class="[
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize',
                      getPriorityClass(ticket.priority),
                    ]"
                  >
                    <svg
                      v-if="ticket.priority === 'critical'"
                      class="w-3 h-3 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clip-rule="evenodd"
                      ></path>
                    </svg>
                    {{ ticket.priority || 'Low' }}
                  </span>
                </td>

                <td class="px-6 py-4">
                  <div v-if="ticket.status === 'selesai' || ticket.status === 'closed'">
                    <div v-if="ticket.assignee" class="flex items-center gap-2">
                      <div
                        class="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700"
                      >
                        ✓
                      </div>
                      <span class="text-sm font-medium text-gray-500 dark:text-gray-400">{{
                        ticket.assignee.nama
                      }}</span>
                    </div>
                    <span v-else class="text-xs italic text-gray-400">Tidak ada petugas</span>
                  </div>
                  <div v-else>
                    <div
                      v-if="ticket.assignee"
                      class="group/assign relative flex items-center gap-2"
                    >
                      <div
                        class="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700"
                      >
                        {{ ticket.assignee.nama.charAt(0) }}
                      </div>
                      <span
                        class="text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-[100px]"
                        >{{ ticket.assignee.nama }}</span
                      >
                      <button
                        @click="openAssignModal(ticket)"
                        class="absolute -right-6 hidden group-hover/assign:block text-gray-400 hover:text-brand-600"
                      >
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                          />
                        </svg>
                      </button>
                    </div>
                    <button
                      v-else
                      @click="openAssignModal(ticket)"
                      class="flex items-center gap-1 rounded-full border border-dashed border-gray-300 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-500 hover:border-brand-500 hover:bg-brand-50 hover:text-brand-600"
                    >
                      <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Assign
                    </button>
                  </div>
                </td>

                <td class="px-6 py-4">
                  <span :class="statusBadgeClass(ticket.status)">{{ ticket.status }}</span>
                </td>

                <td class="px-6 py-4">
                  <div class="flex items-center justify-center gap-2">
                    <button
                      @click="handleDetail(ticket)"
                      class="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-brand-600"
                      title="Detail"
                    >
                      <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          class="flex items-center justify-between border-t border-gray-200 px-6 py-4 dark:border-gray-800"
        >
          <span class="text-sm text-gray-500">
            Menampilkan {{ paginatedTickets.length ? startIndex + 1 : 0 }} -
            {{ Math.min(endIndex, filteredTickets.length) }} dari {{ filteredTickets.length }} data
          </span>
          <div class="flex gap-2">
            <button
              @click="currentPage--"
              :disabled="currentPage === 1"
              class="rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-700 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              Prev
            </button>
            <button
              @click="currentPage++"
              :disabled="currentPage === totalPages"
              class="rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-700 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showAssignModal"
          class="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          @click.self="closeAssignModal"
        >
          <div class="absolute inset-0 bg-gray-900/30 backdrop-blur-sm"></div>
          <div
            class="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-800"
          >
            <div
              class="border-b border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700/50"
            >
              <h3 class="text-lg font-bold text-gray-900 dark:text-white">Pilih Petugas</h3>
            </div>
            <div class="p-6">
              <div
                class="mb-4 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800"
              >
                <p class="text-xs text-blue-600 dark:text-blue-400 font-semibold">TIKET:</p>
                <p class="text-sm font-medium text-gray-800 dark:text-white truncate">
                  {{ selectedTicket?.ticket_number }} - {{ selectedTicket?.judul_permohonan }}
                </p>
              </div>
              <div class="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                <div v-if="loading.technicians" class="text-center text-sm text-gray-500 py-4">
                  Memuat daftar petugas...
                </div>
                <div
                  v-else-if="technicians.length === 0"
                  class="text-center text-sm text-red-500 py-4"
                >
                  Tidak ada petugas ditemukan.
                </div>
                <div
                  v-else
                  v-for="tech in technicians"
                  :key="tech.id"
                  @click="selectedTechnicianId = tech.id"
                  :class="[
                    'flex cursor-pointer items-center justify-between rounded-xl border p-3 transition-all',
                    selectedTechnicianId === tech.id
                      ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500 dark:bg-blue-900/20 dark:border-blue-700'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700',
                  ]"
                >
                  <div class="flex items-center gap-3">
                    <div
                      class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-600 dark:bg-gray-600 dark:text-gray-300"
                    >
                      {{ tech.nama.charAt(0) }}
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-900 dark:text-white">{{ tech.nama }}</p>
                    </div>
                  </div>
                  <div v-if="selectedTechnicianId === tech.id" class="text-blue-600 dark:text-blue-400">
                    ✓
                  </div>
                </div>
              </div>
            </div>
            <div
              class="flex justify-end gap-3 border-t border-gray-100 bg-gray-50 p-4 dark:bg-gray-800 dark:border-gray-700"
            >
              <button
                @click="closeAssignModal"
                class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
              >
                Batal
              </button>
              <button
                @click="submitAssignment"
                :disabled="!selectedTechnicianId || loading.assigning"
                class="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted, watch } from 'vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import api from '@/services/api'
import router from '@/router'

// --- INTERFACES ---
interface User {
  id: number
  nama: string
  instansi?: string
  email?: string
}

interface Ticket {
  id: number
  ticket_number: string
  judul_permohonan: string
  status: string
  priority?: string // 'low' | 'medium' | 'high' | 'critical'
  resolution_deadline?: string // ISO String dari backend
  created_at: string
  requester: User
  assignee?: User | null
  service?: { nama_layanan: string }
}

interface DashboardTicketStats {
  pending: number
  on_progress: number
  eskalasi: number
  selesai: number
  closed: number
}

const currentPageTitle = ref('Manajemen Tiket')
const tickets = ref<Ticket[]>([])
const technicians = ref<User[]>([])

const dashboardStats = ref<DashboardTicketStats>({
  pending: 0,
  on_progress: 0,
  eskalasi: 0,
  selesai: 0,
  closed: 0,
})

const searchQuery = ref('')
const statusFilter = ref('all')
const perPage = ref(10)
const currentPage = ref(1)

const showAssignModal = ref(false)
const selectedTicket = ref<Ticket | null>(null)
const selectedTechnicianId = ref<number | null>(null)

const loading = reactive({
  tickets: false,
  technicians: false,
  dashboard: false,
  assigning: false,
})

// --- API ACTIONS (Sama seperti sebelumnya) ---

const fetchDashboardStats = async () => {
  loading.dashboard = true
  try {
    const res = await api.get('/dashboard-analytics')
    if (res.data.success) {
      dashboardStats.value = res.data.data.tickets
    }
  } catch (err) {
    console.error('Gagal load dashboard stats', err)
  } finally {
    loading.dashboard = false
  }
}

const fetchTickets = async () => {
  loading.tickets = true
  try {
    const res = await api.get('/tickets')
    if (res.data.success) {
      tickets.value = res.data.data
    }
  } catch (err) {
    console.error('Gagal load tickets', err)
  } finally {
    loading.tickets = false
  }
}

const fetchTechnicians = async () => {
  loading.technicians = true
  try {
    const res = await api.get('/users', { params: { role: 'petugas' } })
    if (res.data.success) {
      technicians.value = res.data.data
    }
  } catch (err) {
    console.error('Gagal load petugas', err)
  } finally {
    loading.technicians = false
  }
}

const submitAssignment = async () => {
  if (!selectedTicket.value || !selectedTechnicianId.value) return
  loading.assigning = true
  try {
    const res = await api.put(`/tickets/${selectedTicket.value.id}/assign`, {
      petugas_id: selectedTechnicianId.value,
    })

    if (res.data.success) {
      const updatedTicket = res.data.data
      const index = tickets.value.findIndex((t) => t.id === selectedTicket.value?.id)
      if (index !== -1) {
        tickets.value[index] = updatedTicket
      }
      fetchDashboardStats()
      closeAssignModal()
      alert('Berhasil assign petugas!')
    }
  } catch (err) {
    alert('Gagal assign petugas')
  } finally {
    loading.assigning = false
  }
}

onMounted(() => {
  fetchDashboardStats()
  fetchTickets()
})

// --- COMPUTED & UTILS ---

const totalTicketsCount = computed(() => {
  const t = dashboardStats.value
  return t.pending + t.on_progress + t.eskalasi + t.selesai + t.closed
})

const filteredTickets = computed(() => {
  let result = tickets.value
  if (statusFilter.value !== 'all') {
    result = result.filter((t) => t.status.toLowerCase() === statusFilter.value.toLowerCase())
  }
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(
      (t) =>
        t.ticket_number.toLowerCase().includes(q) || t.requester?.nama.toLowerCase().includes(q),
    )
  }
  return result
})

const totalPages = computed(() => Math.ceil(filteredTickets.value.length / perPage.value))
const startIndex = computed(() => (currentPage.value - 1) * perPage.value)
const endIndex = computed(() => startIndex.value + perPage.value)
const paginatedTickets = computed(() =>
  filteredTickets.value.slice(startIndex.value, endIndex.value),
)

// --- LOGIC BARU: PRIORITY & SLA ---

const getPriorityClass = (priority?: string) => {
  const p = priority?.toLowerCase() || 'low'
  if (p === 'critical')
    return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
  if (p === 'high')
    return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
  if (p === 'medium')
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
  return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' // Low
}

// Logic untuk menghitung warna SLA
const getSLAClass = (deadlineStr?: string) => {
  if (!deadlineStr)
    return 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'

  const deadline = new Date(deadlineStr).getTime()
  const now = new Date().getTime()
  const diffHours = (deadline - now) / (1000 * 60 * 60)

  if (diffHours < 0)
    return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-900/50' // Telat (Breached)
  if (diffHours < 4)
    return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-900/50' // Warning (< 4 jam)
  return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-900/50' // Aman
}

// Logic untuk teks SLA
const getSLAText = (deadlineStr?: string) => {
  if (!deadlineStr) return 'No SLA'

  const deadline = new Date(deadlineStr).getTime()
  const now = new Date().getTime()
  const diff = deadline - now

  if (diff < 0) return 'Lewat Deadline'

  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days} Hari Lagi`
  if (hours > 0) return `${hours} Jam Lagi`
  return '< 1 Jam Lagi'
}

// --- HANDLERS LAINNYA ---
const openAssignModal = (ticket: Ticket) => {
  selectedTicket.value = ticket
  selectedTechnicianId.value = ticket.assignee?.id || null
  showAssignModal.value = true
  if (technicians.value.length === 0) fetchTechnicians()
}

const closeAssignModal = () => {
  showAssignModal.value = false
  selectedTicket.value = null
  selectedTechnicianId.value = null
}

const handleDetail = (ticket: Ticket) => {
  router.push(`/detail-ticket/${ticket.id}`)
}

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const statusBadgeClass = (status: string) => {
  const s = status?.toLowerCase()
  if (s === 'selesai' || s === 'closed')
    return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 px-2 py-1 rounded-full text-xs font-bold uppercase'
  if (s === 'pending')
    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 px-2 py-1 rounded-full text-xs font-bold uppercase'
  if (s === 'on_progress' || s === 'in_progress')
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-1 rounded-full text-xs font-bold uppercase'
  if (s === 'eskalasi')
    return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 px-2 py-1 rounded-full text-xs font-bold uppercase'
  return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
