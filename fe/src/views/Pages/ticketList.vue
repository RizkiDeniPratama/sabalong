<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />

    <div class="min-h-screen space-y-6 p-4 xl:p-10">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 class="text-lg font-bold text-gray-900 dark:text-white">Riwayat Tiket</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Pantau status dan progres laporan Anda.
          </p>
        </div>
        <router-link
          to="/user/tickets/create"
          class="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700 shadow-md"
        >
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          Buat Tiket Baru
        </router-link>
      </div>

      <div
        class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900"
      >
        <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div class="flex gap-1 overflow-x-auto pb-2 md:pb-0">
            <button
              v-for="filter in ['all', 'on_progress', 'selesai']"
              :key="filter"
              @click="statusFilter = filter"
              :class="[
                'rounded-lg px-4 py-2 text-sm font-medium capitalize transition whitespace-nowrap',
                statusFilter === filter
                  ? 'bg-gray-100 text-brand-600 dark:bg-gray-800 dark:text-brand-400'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800',
              ]"
            >
              {{ filter.replace('_', ' ') }}
            </button>
          </div>

          <div class="relative w-full md:w-64">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Cari ID atau Judul..."
              class="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
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
      </div>

      <div
        class="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 overflow-hidden"
      >
        <div v-if="loading" class="p-12 text-center">
          <div
            class="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-brand-600"
          ></div>
          <p class="mt-4 text-sm text-gray-500">Memuat tiket...</p>
        </div>

        <div v-else-if="paginatedTickets.length === 0" class="p-12 text-center">
          <div
            class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400"
          >
            <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">
            Tidak ada tiket ditemukan
          </h3>
          <p class="text-sm text-gray-500 mt-1">Coba ubah filter pencarian atau buat tiket baru.</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead
              class="border-b border-gray-200 bg-gray-50/50 text-gray-500 uppercase dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-400"
            >
              <tr>
                <th class="px-6 py-4 font-medium">ID Tiket</th>
                <th class="px-6 py-4 font-medium">Judul & Layanan</th>
                <th class="px-6 py-4 font-medium">Tanggal Dibuat</th>
                <th class="px-6 py-4 font-medium">Status</th>
                <th class="px-6 py-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr
                v-for="ticket in paginatedTickets"
                :key="ticket.id"
                class="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition cursor-pointer"
                @click="goToDetail(ticket.id)"
              >
                <td class="px-6 py-4 font-bold text-brand-600 dark:text-brand-400">
                  {{ ticket.ticket_number }}
                </td>
                <td class="px-6 py-4">
                  <div>
                    <p class="font-medium text-gray-900 dark:text-white line-clamp-1 max-w-[250px]">
                      {{ ticket.judul_permohonan }}
                    </p>
                    <p class="text-xs text-gray-500 mt-0.5">{{ ticket.service?.nama_layanan }}</p>
                  </div>
                </td>
                <td class="px-6 py-4 text-gray-600 dark:text-gray-300">
                  {{ formatDate(ticket.created_at) }}
                </td>
                <td class="px-6 py-4">
                  <span :class="statusBadgeClass(ticket.status)">
                    {{ ticket.status }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right">
                  <button
                    class="text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition"
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
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          class="flex items-center justify-between border-t border-gray-200 px-6 py-4 dark:border-gray-800"
        >
          <span class="text-sm text-gray-500"> Hal {{ currentPage }} dari {{ totalPages }} </span>
          <div class="flex gap-2">
            <button
              @click="currentPage--"
              :disabled="currentPage === 1"
              class="rounded-lg border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:hover:bg-gray-800"
            >
              Prev
            </button>
            <button
              @click="currentPage++"
              :disabled="currentPage === totalPages"
              class="rounded-lg border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:hover:bg-gray-800"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import AdminLayout from '../../components/layout/AdminLayout.vue'
import PageBreadcrumb from '../../components/common/PageBreadcrumb.vue'
import api from '@/services/api'

// Interface
interface Ticket {
  id: number
  ticket_number: string
  judul_permohonan: string
  status: string
  created_at: string
  service?: { nama_layanan: string }
}

const router = useRouter()
const currentPageTitle = ref('Tiket Saya')
const tickets = ref<Ticket[]>([])
const loading = ref(true)
const searchQuery = ref('')
const statusFilter = ref('all')
const currentPage = ref(1)
const perPage = 10

// API Action
const fetchTickets = async () => {
  loading.value = true
  try {
    // GET /tickets (User role automatically filters own tickets in backend)
    const res = await api.get('/tickets')
    if (res.data.success) {
      tickets.value = res.data.data
    }
  } catch (err) {
    console.error('Gagal load tiket user', err)
  } finally {
    loading.value = false
  }
}

// Computed Logic
const filteredTickets = computed(() => {
  let result = tickets.value

  // Filter Status
  if (statusFilter.value !== 'all') {
    if (statusFilter.value === 'selesai') {
      // Gabungkan selesai & closed
      result = result.filter((t) => ['selesai', 'closed'].includes(t.status.toLowerCase()))
    } else if (statusFilter.value === 'on_progress') {
      // Gabungkan on_progress & pending (aktif)
      result = result.filter((t) =>
        ['on_progress', 'pending', 'eskalasi'].includes(t.status.toLowerCase()),
      )
    } else {
      result = result.filter((t) => t.status.toLowerCase() === statusFilter.value)
    }
  }

  // Search
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(
      (t) =>
        t.ticket_number.toLowerCase().includes(q) || t.judul_permohonan.toLowerCase().includes(q),
    )
  }

  // Sort by Date Descending (Terbaru di atas)
  return result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
})

// Pagination
const totalPages = computed(() => Math.ceil(filteredTickets.value.length / perPage))
const paginatedTickets = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return filteredTickets.value.slice(start, start + perPage)
})

// Navigation
const goToDetail = (id: number) => {
  router.push(`/detail-ticket/${id}`)
}

// Utils
const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

const statusBadgeClass = (s: string) => {
  const map: any = {
    selesai: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    on_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    eskalasi: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    closed: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  }
  return `px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${map[s?.toLowerCase()] || 'bg-gray-100'}`
}

// Reset page on filter change
watch([searchQuery, statusFilter], () => (currentPage.value = 1))

onMounted(() => fetchTickets())
</script>
