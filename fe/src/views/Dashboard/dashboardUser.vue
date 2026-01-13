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

      <!-- Quick Actions Section -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Buat Tiket Baru -->
        <div
          @click="$router.push('/user/tickets/create')"
          class="group cursor-pointer rounded-2xl border border-gray-200 bg-gradient-to-br from-brand-50 to-blue-50 p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg hover:border-brand-300 dark:from-brand-900/20 dark:to-blue-900/20 dark:border-gray-800 dark:hover:border-brand-700"
        >
          <div class="flex items-center gap-4">
            <div class="h-12 w-12 flex items-center justify-center rounded-xl bg-brand-600 text-white group-hover:scale-110 transition-transform">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <h4 class="font-bold text-gray-900 dark:text-white">Buat Tiket Baru</h4>
              <p class="text-sm text-gray-600 dark:text-gray-400">Laporkan masalah atau minta bantuan</p>
            </div>
          </div>
        </div>

        <!-- Lihat Semua Tiket -->
        <div
          @click="$router.push('/user/tickets')"
          class="group cursor-pointer rounded-2xl border border-gray-200 bg-gradient-to-br from-green-50 to-emerald-50 p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg hover:border-green-300 dark:from-green-900/20 dark:to-emerald-900/20 dark:border-gray-800 dark:hover:border-green-700"
        >
          <div class="flex items-center gap-4">
            <div class="h-12 w-12 flex items-center justify-center rounded-xl bg-green-600 text-white group-hover:scale-110 transition-transform">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h4 class="font-bold text-gray-900 dark:text-white">Kelola Tiket</h4>
              <p class="text-sm text-gray-600 dark:text-gray-400">Lihat dan kelola semua tiket Anda</p>
            </div>
          </div>
        </div>

        <!-- Browse Layanan -->
        <div
          @click="$router.push('/user/services')"
          class="group cursor-pointer rounded-2xl border border-gray-200 bg-gradient-to-br from-purple-50 to-indigo-50 p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg hover:border-purple-300 dark:from-purple-900/20 dark:to-indigo-900/20 dark:border-gray-800 dark:hover:border-purple-700"
        >
          <div class="flex items-center gap-4">
            <div class="h-12 w-12 flex items-center justify-center rounded-xl bg-purple-600 text-white group-hover:scale-110 transition-transform">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <h4 class="font-bold text-gray-900 dark:text-white">Katalog Layanan</h4>
              <p class="text-sm text-gray-600 dark:text-gray-400">Jelajahi semua layanan tersedia</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity Section -->
      <div class="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div class="p-6 border-b border-gray-200 dark:border-gray-800">
          <h3 class="text-xl font-bold text-gray-900 dark:text-white">Aktivitas Terbaru</h3>
          <p class="text-sm text-gray-500 mt-1">Timeline aktivitas tiket Anda</p>
        </div>
        
        <div v-if="loading.activities" class="py-12 text-center">
          <div class="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-brand-600"></div>
        </div>
        
        <div v-else-if="recentActivities.length === 0" class="p-8 text-center">
          <div class="mx-auto h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
            <svg class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p class="text-gray-500">Belum ada aktivitas terbaru</p>
        </div>
        
        <div v-else class="p-6">
          <div class="space-y-4">
            <div
              v-for="activity in recentActivities"
              :key="activity.id"
              class="flex gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              @click="$router.push(`/detail-ticket/${activity.ticket_id}`)"
            >
              <div class="flex-shrink-0">
                <div :class="getActivityIconClass(activity.type)" class="h-10 w-10 rounded-full flex items-center justify-center">
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path v-if="activity.type === 'status_change'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path v-else-if="activity.type === 'comment'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <p class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ activity.ticket_number }}
                  </p>
                  <span class="text-xs text-gray-500">{{ formatDate(activity.created_at) }}</span>
                </div>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ activity.description }}</p>
                <div class="flex items-center gap-2 mt-2">
                  <span class="text-xs text-gray-500">{{ activity.service_name }}</span>
                  <span class="text-xs text-gray-300">•</span>
                  <span :class="statusBadgeClass(activity.current_status)">{{ activity.current_status }}</span>
                </div>
              </div>
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
const recentTickets = ref<any[]>([])
const recentActivities = ref<any[]>([])
const loading = reactive({ user: true, activities: true })
const stats = reactive({ active: 0, completed: 0 })

// API
const initData = async () => {
  try {
    // 1. Profile
    const profileRes = await api.get('/users/profile')
    if (profileRes.data.success) user.value = profileRes.data.data
    loading.user = false

    // 2. Tickets (Untuk Stats & Recent)
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

    // 3. Recent Activities (Timeline aktivitas)
    await loadRecentActivities()
  } catch (e) {
    console.error(e)
  }
}

const loadRecentActivities = async () => {
  try {
    // Simulasi data aktivitas - nanti bisa diganti dengan API endpoint khusus
    const ticketRes = await api.get('/tickets')
    if (ticketRes.data.success) {
      const activities: any[] = []
      
      // Generate activities dari tickets
      ticketRes.data.data.slice(0, 5).forEach((ticket: any) => {
        // Status change activity
        activities.push({
          id: `status_${ticket.id}`,
          type: 'status_change',
          ticket_id: ticket.id,
          ticket_number: ticket.ticket_number,
          description: `Status tiket diubah menjadi "${ticket.status}"`,
          service_name: ticket.service?.nama_layanan || 'Unknown Service',
          current_status: ticket.status,
          created_at: ticket.updated_at || ticket.created_at
        })
        
        // Ticket creation activity
        activities.push({
          id: `create_${ticket.id}`,
          type: 'created',
          ticket_id: ticket.id,
          ticket_number: ticket.ticket_number,
          description: `Tiket baru dibuat untuk layanan ${ticket.service?.nama_layanan}`,
          service_name: ticket.service?.nama_layanan || 'Unknown Service',
          current_status: ticket.status,
          created_at: ticket.created_at
        })
      })
      
      // Sort by date and take latest 8
      recentActivities.value = activities
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 8)
    }
    loading.activities = false
  } catch (e) {
    console.error(e)
    loading.activities = false
  }
}

// Logic
const getActivityIconClass = (type: string) => {
  const classes = {
    status_change: 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    comment: 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400',
    created: 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400'
  }
  return classes[type as keyof typeof classes] || 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
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
