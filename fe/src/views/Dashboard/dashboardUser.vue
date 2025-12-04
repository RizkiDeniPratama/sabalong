<template>
  <AdminLayout>
    <div class="min-h-screen p-4 md:p-6 2xl:p-10 space-y-8">
      <!-- <div
        class="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-600 to-blue-600 p-8 text-white shadow-lg dark:from-brand-800 dark:to-blue-900"
      >
        <div class="relative z-10 max-w-2xl">
          <h1 class="text-3xl font-bold mb-2">Halo, {{ user.nama }} 👋</h1>
          <p class="text-brand-100 mb-6 text-lg">Apa yang bisa kami bantu hari ini?</p>

          <div class="relative">
            <input
              v-model="serviceSearch"
              type="text"
              placeholder="Cari layanan (misal: Internet, Printer, Cuti)..."
              class="w-full rounded-xl border-0 py-4 pl-12 pr-4 text-gray-800 placeholder-gray-400 shadow-lg focus:ring-2 focus:ring-brand-300"
            />
            <svg
              class="absolute left-4 top-4 h-6 w-6 text-gray-400"
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
        <div
          class="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white/10 blur-3xl"
        ></div>
        <div
          class="absolute bottom-0 right-20 h-40 w-40 rounded-full bg-blue-400/20 blur-2xl"
        ></div>
      </div> -->

      <div>
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold text-gray-900 dark:text-white">Katalog Layanan</h3>
          <span class="text-sm text-gray-500">{{ filteredServices.length }} layanan tersedia</span>
        </div>

        <div v-if="loading.services" class="py-20 text-center">
          <div
            class="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-brand-600"
          ></div>
        </div>

        <div
          v-else-if="filteredServices.length === 0"
          class="p-10 text-center bg-white rounded-2xl border border-dashed border-gray-300 dark:bg-gray-900 dark:border-gray-700"
        >
          <p class="text-gray-500">Layanan yang Anda cari tidak ditemukan.</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div
            v-for="service in filteredServices"
            :key="service.id"
            @click="goToCreateTicket(service.id)"
            class="group cursor-pointer rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md hover:border-brand-300 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-brand-700"
          >
            <div class="flex justify-between items-start mb-4">
              <div
                class="h-12 w-12 flex items-center justify-center rounded-xl bg-brand-50 text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-colors dark:bg-brand-900/20 dark:text-brand-400"
              >
                <img v-if="service.icon" :src="service.icon" class="h-6 w-6" />
                <svg v-else class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <span
                class="px-2.5 py-1 rounded-lg bg-gray-100 text-[10px] font-bold uppercase tracking-wide text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                >{{ service.kategori }}</span
              >
            </div>

            <h4
              class="text-lg font-bold text-gray-900 mb-2 group-hover:text-brand-600 dark:text-white transition-colors"
            >
              {{ service.nama_layanan }}
            </h4>
            <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 h-10">
              {{ service.deskripsi }}
            </p>

            <div
              class="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between"
            >
              <span class="text-xs text-gray-400 flex items-center gap-1">
                <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {{ service.sla?.resolution_hours || 24 }} Jam
              </span>
              <!-- <span
                class="text-xs font-bold text-brand-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform"
              >
                Buat Tiket
                <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </span> -->
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div
          class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
        >
          <h4 class="font-bold text-gray-900 dark:text-white mb-4">Ringkasan Saya</h4>
          <div class="space-y-4">
            <div
              class="flex items-center justify-between p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20"
            >
              <div class="flex items-center gap-3">
                <div
                  class="p-2 bg-blue-100 rounded-lg text-blue-600 dark:bg-blue-800 dark:text-blue-300"
                >
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >Tiket Aktif</span
                >
              </div>
              <span class="text-xl font-bold text-blue-600">{{ stats.active }}</span>
            </div>
            <div
              class="flex items-center justify-between p-3 rounded-xl bg-green-50 dark:bg-green-900/20"
            >
              <div class="flex items-center gap-3">
                <div
                  class="p-2 bg-green-100 rounded-lg text-green-600 dark:bg-green-800 dark:text-green-300"
                >
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Selesai</span>
              </div>
              <span class="text-xl font-bold text-green-600">{{ stats.completed }}</span>
            </div>
          </div>
        </div>

        <div
          class="lg:col-span-2 rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 overflow-hidden"
        >
          <div
            class="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center"
          >
            <h4 class="font-bold text-gray-900 dark:text-white">Tiket Terakhir</h4>
            <router-link to="/user/tickets" class="text-sm text-brand-600 hover:underline"
              >Lihat Semua</router-link
            >
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm text-left">
              <thead class="bg-gray-50 dark:bg-gray-800 text-gray-500">
                <tr>
                  <th class="px-6 py-3 font-medium">Tiket</th>
                  <th class="px-6 py-3 font-medium">Layanan</th>
                  <th class="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
                <tr
                  v-for="ticket in recentTickets"
                  :key="ticket.id"
                  class="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                  @click="$router.push(`/detail-ticket/${ticket.id}`)"
                >
                  <td class="px-6 py-3">
                    <span class="font-bold text-gray-900 dark:text-white block">{{
                      ticket.ticket_number
                    }}</span>
                    <span class="text-xs text-gray-500">{{ formatDate(ticket.created_at) }}</span>
                  </td>
                  <td class="px-6 py-3 text-gray-700 dark:text-gray-300">
                    {{ ticket.service?.nama_layanan }}
                  </td>
                  <td class="px-6 py-3">
                    <span :class="statusBadgeClass(ticket.status)">{{ ticket.status }}</span>
                  </td>
                </tr>
                <tr v-if="recentTickets.length === 0">
                  <td colspan="3" class="px-6 py-8 text-center text-gray-500">
                    Belum ada riwayat.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import AdminLayout from '../../components/layout/AdminLayout.vue'
import api from '@/services/api'

// State
const router = useRouter()
const user = ref<any>({})
const services = ref<any[]>([])
const recentTickets = ref<any[]>([])
const serviceSearch = ref('')
const loading = reactive({ services: true, user: true })
const stats = reactive({ active: 0, completed: 0 })

// API
const initData = async () => {
  try {
    // 1. Profile
    const profileRes = await api.get('/users/profile')
    if (profileRes.data.success) user.value = profileRes.data.data
    loading.user = false

    // 2. Services (Katalog)
    const serviceRes = await api.get('/services')
    if (serviceRes.data.success)
      services.value = serviceRes.data.data.filter((s: any) => s.is_active) // Hanya yg aktif
    loading.services = false

    // 3. Tickets (Untuk Stats & Recent)
    const ticketRes = await api.get('/tickets')
    if (ticketRes.data.success) {
      const all = ticketRes.data.data
      stats.active = all.filter(
        (t: any) => !['selesai', 'closed'].includes(t.status.toLowerCase()),
      ).length
      stats.completed = all.filter((t: any) =>
        ['selesai', 'closed'].includes(t.status.toLowerCase()),
      ).length
      recentTickets.value = all.slice(0, 3)
    }
  } catch (e) {
    console.error(e)
  }
}

// Logic
const filteredServices = computed(() => {
  if (!serviceSearch.value) return services.value
  const q = serviceSearch.value.toLowerCase()
  return services.value.filter(
    (s) => s.nama_layanan.toLowerCase().includes(q) || s.kategori.toLowerCase().includes(q),
  )
})

const goToCreateTicket = (serviceId: number) => {
  router.push({ path: '/user/tickets/create', query: { service_id: serviceId } })
}

// Utils
const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
const statusBadgeClass = (s: string) => {
  const map: any = {
    selesai: 'text-green-600 bg-green-100',
    pending: 'text-yellow-600 bg-yellow-100',
    on_progress: 'text-blue-600 bg-blue-100',
  }
  return `text-[10px] px-2 py-0.5 rounded font-bold uppercase ${map[s?.toLowerCase()] || 'bg-gray-100'}`
}

onMounted(() => initData())
</script>
