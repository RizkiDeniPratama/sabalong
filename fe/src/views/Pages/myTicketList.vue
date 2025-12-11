<template>
  <AdminLayout>
    <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-6 py-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ roleConfig.title }}
        </h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          {{ roleConfig.description }}
        </p>
      </div>

      <div class="relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari tiket..."
          class="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white sm:w-64"
        />
        <svg
          class="absolute left-3 top-2.5 h-4 w-4 text-gray-400"
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
      </div>
    </div>

    <div class="px-6 pb-10">
      <!-- Tabs: Dynamic based on role -->
      <div class="mb-6 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div class="flex space-x-1 rounded-xl bg-gray-100 p-1 dark:bg-gray-800 w-fit">
          <button
            v-for="tab in roleConfig.tabs"
            :key="tab.value"
            @click="activeTab = tab.value"
            :class="[
              'rounded-lg px-4 py-2 text-sm font-medium leading-5 transition',
              activeTab === tab.value
                ? 'bg-white text-brand-700 shadow dark:bg-gray-700 dark:text-white'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
            ]"
          >
            {{ tab.label }} ({{ getTabCount(tab.value) }})
          </button>
        </div>

        <!-- Filter Status (Only for User on Active Tab) -->
        <div v-if="!isStaff && activeTab === 'active'" class="flex items-center gap-2">
          <span class="text-sm text-gray-600 dark:text-gray-400">Filter Status:</span>
          <select
            v-model="statusFilter"
            class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            <option value="all">Semua</option>
            <option value="pending">Pending</option>
            <option value="on_progress">On Progress</option>
          </select>
        </div>
      </div>

      <div
        class="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 overflow-hidden"
      >
        <!-- Loading State -->
        <div v-if="loading" class="p-12 text-center">
          <div
            class="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-brand-600"
          ></div>
          <p class="mt-4 text-sm text-gray-500">Memuat tiket...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="currentList.length === 0" class="p-12 text-center">
          <div
            class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800"
          >
            <svg
              class="h-8 w-8 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                :d="
                  activeTab === 'history'
                    ? 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                    : 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                "
              />
            </svg>
          </div>
          <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white">Tidak ada tiket</h3>
          <p class="text-gray-500 text-sm">
            {{ getEmptyMessage() }}
          </p>
        </div>

        <!-- Table -->
        <div v-else class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead
              class="border-b border-gray-200 bg-gray-50/50 uppercase text-gray-500 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-400"
            >
              <tr>
                <th class="px-6 py-4 font-semibold">Tiket</th>
                <th v-if="isStaff" class="px-6 py-4 font-semibold">Pelapor</th>
                <th class="px-6 py-4 font-semibold">Layanan</th>
                <th class="px-6 py-4 font-semibold">
                  {{ isStaff ? 'SLA Deadline' : 'Tanggal Dibuat' }}
                </th>
                <th class="px-6 py-4 font-semibold text-center">Status</th>
                <th v-if="activeTab === 'history'" class="px-6 py-4 font-semibold text-center">
                  Rating
                </th>
                <th class="px-6 py-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr
                v-for="ticket in currentList"
                :key="ticket.id"
                class="group transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <!-- Kolom Tiket -->
                <td class="px-6 py-4">
                  <div class="flex flex-col">
                    <span class="font-bold text-brand-600 dark:text-brand-400">
                      {{ ticket.ticket_number }}
                    </span>
                    <span
                      class="font-medium text-gray-900 dark:text-white truncate max-w-[200px]"
                      :title="ticket.judul_permohonan"
                    >
                      {{ ticket.judul_permohonan }}
                    </span>
                    <span class="text-xs text-gray-500">
                      {{ formatDate(ticket.created_at) }}
                    </span>
                  </div>
                </td>

                <!-- Kolom Pelapor (Hanya untuk Staff) -->
                <td v-if="isStaff" class="px-6 py-4">
                  <div class="flex flex-col">
                    <span class="text-gray-900 dark:text-white font-medium">
                      {{ ticket.requester?.nama }}
                    </span>
                    <span class="text-xs text-gray-500">{{ ticket.requester?.instansi }}</span>
                  </div>
                </td>

                <!-- Kolom Layanan -->
                <td class="px-6 py-4 text-gray-700 dark:text-gray-300">
                  {{ ticket.service?.nama_layanan }}
                  <div class="mt-1">
                    <span :class="priorityBadgeClass(ticket.priority)">
                      {{ ticket.priority }}
                    </span>
                  </div>
                </td>

                <!-- Kolom Deadline/Tanggal -->
                <td class="px-6 py-4">
                  <!-- Untuk Staff: Tampilkan SLA Deadline -->
                  <div v-if="isStaff">
                    <div v-if="ticket.status !== 'selesai' && ticket.status !== 'closed'">
                      <div
                        v-if="isOverdue(ticket.resolution_deadline)"
                        class="flex items-center gap-1 text-red-600 font-bold text-xs"
                      >
                        <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Overdue
                      </div>
                      <span v-else class="text-gray-600 dark:text-gray-400">
                        {{ formatDate(ticket.resolution_deadline) }}
                      </span>
                    </div>
                    <span v-else class="text-gray-400 text-xs">-</span>
                  </div>

                  <!-- Untuk User: Tampilkan Tanggal Dibuat -->
                  <div v-else>
                    <span class="text-gray-600 dark:text-gray-400">
                      {{ formatDate(ticket.created_at) }}
                    </span>
                  </div>
                </td>

                <!-- Kolom Status -->
                <td class="px-6 py-4 text-center">
                  <span :class="statusBadgeClass(ticket.status)">
                    {{ formatStatusLabel(ticket.status) }}
                  </span>
                </td>

                <!-- Kolom Rating (Hanya di History) -->
                <td v-if="activeTab === 'history'" class="px-6 py-4 text-center">
                  <div
                    v-if="ticket.feedback"
                    class="flex justify-center items-center gap-1 text-yellow-400"
                  >
                    <span class="font-bold text-gray-700 dark:text-gray-200 mr-1">
                      {{ ticket.feedback.rating }}
                    </span>
                    <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20">
                      <path
                        d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                      />
                    </svg>
                  </div>
                  <span v-else class="text-xs text-gray-400 italic">Belum dinilai</span>
                </td>

                <!-- Kolom Aksi -->
                <td class="px-6 py-4 text-right">
                  <button
                    @click="goToDetail(ticket.id)"
                    class="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                  >
                    {{ getActionButtonText(ticket) }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AdminLayout from '../../components/layout/AdminLayout.vue'
import api from '@/services/api'

// ============================================
// INTERFACES
// ============================================
interface Ticket {
  id: number
  ticket_number: string
  judul_permohonan: string
  status: string
  priority: string
  created_at: string
  resolution_deadline: string
  user_id: number
  assigned_to_id: number | null
  requester: { nama: string; instansi: string }
  service: { nama_layanan: string }
  feedback?: { rating: number; review: string }
}

interface UserProfile {
  id: number
  role: string
  nama: string
}

// ============================================
// STATE
// ============================================
const router = useRouter()
const loading = ref(true)
const searchQuery = ref('')
const activeTab = ref<'active' | 'history'>('active')
const statusFilter = ref<'all' | 'pending' | 'on_progress'>('all')
const allTickets = ref<Ticket[]>([])
const currentUser = ref<UserProfile | null>(null)

// ============================================
// ROLE CONFIG
// ============================================
const isStaff = computed(() => ['admin', 'petugas'].includes(currentUser.value?.role || ''))

const roleConfig = computed(() => {
  if (isStaff.value) {
    return {
      title: 'Tugas Saya',
      description: 'Daftar tiket yang ditugaskan kepada Anda.',
      tabs: [
        { value: 'active', label: 'Sedang Dikerjakan' },
        { value: 'history', label: 'Riwayat Selesai' },
      ],
    }
  } else {
    return {
      title: 'Tiket Saya',
      description: 'Daftar tiket yang Anda ajukan ke help desk.',
      tabs: [
        { value: 'active', label: 'Tiket Aktif' },
        { value: 'history', label: 'Riwayat' },
      ],
    }
  }
})

// ============================================
// FETCH DATA
// ============================================
const initData = async () => {
  loading.value = true
  try {
    // 1. Ambil profil user login
    const profileRes = await api.get('/users/profile')
    if (profileRes.data.success) {
      currentUser.value = profileRes.data.data
    }

    // 2. Ambil semua tiket dari API
    const ticketsRes = await api.get('/tickets')
    if (ticketsRes.data.success) {
      allTickets.value = ticketsRes.data.data
    }

    // 3. Set tab default
    activeTab.value = 'active'
  } catch (err) {
    console.error('Gagal memuat data', err)
  } finally {
    loading.value = false
  }
}

// ============================================
// COMPUTED - FILTER TICKETS
// ============================================
const myTickets = computed(() => {
  if (!currentUser.value) return []

  if (isStaff.value) {
    // Petugas: hanya tiket yang di-assign ke dia
    return allTickets.value.filter((t) => t.assigned_to_id === currentUser.value!.id)
  } else {
    // User: hanya tiket yang dia buat
    return allTickets.value.filter((t) => t.user_id === currentUser.value!.id)
  }
})

const filteredTickets = computed(() => {
  if (!searchQuery.value) return myTickets.value
  const q = searchQuery.value.toLowerCase()
  return myTickets.value.filter(
    (t) =>
      t.ticket_number.toLowerCase().includes(q) ||
      t.judul_permohonan.toLowerCase().includes(q) ||
      t.requester?.nama.toLowerCase().includes(q),
  )
})

const activeTickets = computed(() => {
  const active = filteredTickets.value.filter(
    (t) => !['selesai', 'closed'].includes(t.status.toLowerCase()),
  )

  // Apply status filter for users
  if (!isStaff.value && statusFilter.value !== 'all') {
    return active.filter((t) => t.status.toLowerCase() === statusFilter.value)
  }

  return active
})

const completedTickets = computed(() => {
  return filteredTickets.value.filter((t) => ['selesai', 'closed'].includes(t.status.toLowerCase()))
})

const currentList = computed(() => {
  return activeTab.value === 'active' ? activeTickets.value : completedTickets.value
})

// ============================================
// HELPER FUNCTIONS
// ============================================
const getTabCount = (tab: string) => {
  if (tab === 'active') {
    // For active tab, count all non-completed tickets without status filter
    const active = filteredTickets.value.filter(
      (t) => !['selesai', 'closed'].includes(t.status.toLowerCase()),
    )
    return active.length
  } else {
    return completedTickets.value.length
  }
}

const getEmptyMessage = () => {
  if (activeTab.value === 'history') {
    return isStaff.value ? 'Belum ada riwayat penyelesaian.' : 'Belum ada riwayat tiket.'
  }

  if (!isStaff.value && statusFilter.value !== 'all') {
    return `Tidak ada tiket dengan status ${statusFilter.value === 'pending' ? 'Pending' : 'On Progress'}.`
  }

  return isStaff.value ? 'Hore! Semua pekerjaan sudah beres.' : 'Belum ada tiket aktif.'
}

const getActionButtonText = (ticket: Ticket) => {
  if (isStaff.value) {
    return activeTab.value === 'history' ? 'Lihat Detail' : 'Update Progress'
  } else {
    return 'Lihat Detail'
  }
}

const goToDetail = (id: number) => {
  router.push(`/detail-ticket/${id}`)
}

const formatDate = (d: string) => {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const isOverdue = (deadline: string) => {
  if (!deadline) return false
  return new Date().getTime() > new Date(deadline).getTime()
}

const formatStatusLabel = (status: string) => {
  const labelMap: Record<string, string> = {
    pending: 'Pending',
    on_progress: 'On Progress',
    selesai: 'Selesai',
    closed: 'Closed',
    eskalasi: 'Eskalasi',
  }
  return labelMap[status.toLowerCase()] || status
}

const statusBadgeClass = (s: string) => {
  const map: Record<string, string> = {
    selesai: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    on_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    eskalasi: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    closed: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  }
  return `px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${map[s?.toLowerCase()] || 'bg-gray-100 text-gray-800'}`
}

const priorityBadgeClass = (p: string) => {
  const map: Record<string, string> = {
    high: 'text-orange-600 bg-orange-50 border-orange-200',
    critical: 'text-red-600 bg-red-50 border-red-200',
    medium: 'text-blue-600 bg-blue-50 border-blue-200',
    low: 'text-gray-600 bg-gray-50 border-gray-200',
  }
  return `text-[10px] px-2 py-0.5 border rounded capitalize ${map[p?.toLowerCase()] || 'text-gray-600 bg-gray-50 border-gray-200'}`
}

onMounted(() => initData())
</script>
