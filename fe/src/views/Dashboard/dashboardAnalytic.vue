<template>
  <AdminLayout>
    <DefaultLayout>
      <div v-if="loading" class="p-4 text-gray-500">Memuat data statistik...</div>

      <div v-else-if="error" class="p-4 text-red-100 text-red-700 rounded">
        <p><b>Error:</b> {{ error }}</p>
        <p class="mt-2 text-sm">
          Silakan cek terminal backend (nodemon) Anda untuk melihat error detail dari server.
        </p>
      </div>

      <div v-else-if="stats" class="grid grid-cols-12 gap-4 md:gap-6">
        <div class="col-span-12">
          <EcommerceMetrics
            v-if="stats"
            :petugasStats="stats.petugas"
            :userStats="stats.users"
            :ticketPending="stats.tickets.pending"
            :ticketOnProgress="stats.tickets.on_progress"
          />
        </div>

        <div class="col-span-12 xl:col-span-4">
          <MonthlyTarget v-if="stats" :rating="stats.feedbacks" />
        </div>

        <div class="col-span-12 xl:col-span-8">
          <RecentOrders v-if="recentTickets" :tickets="recentTickets" />
        </div>
      </div>
    </DefaultLayout>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '../../services/api' // "Kurir" API kita

// Impor komponen "Manajer" dan "Staf"
import AdminLayout from '../../components/layout/AdminLayout.vue' // Ganti jika nama layout beda
import EcommerceMetrics from '../../components/ecommerce/EcommerceMetrics.vue'
import MonthlyTarget from '../../components/ecommerce/MonthlyTarget.vue'
import RecentOrders from '../../components/ecommerce/RecentOrders.vue'

interface TicketStats {
  pending: number
  on_progress: number
  eskalasi: number
  selesai: number
  closed: number
}
interface PetugasStats {
  total: number
  available: number
}
interface UserStats {
  total: number
}
interface FeedbackStats {
  average_rating_all_time: string
  average_rating_this_month: string
  average_rating_last_month: string
  total_feedback_this_month: number
}
interface DashboardStats {
  tickets: TicketStats
  feedbacks: FeedbackStats
  petugas: PetugasStats
  users: UserStats
}
interface TicketItem {
  id: number
  ticket_number: string
  status: string
  requester: {
    nama: string
  }
  assignee: {
    nama: string | null // Bisa jadi null jika belum ditugaskan
  }
  service: {
    nama_layanan: string
  }
}

// Siapkan "wadah" reaktif
const stats = ref<DashboardStats | null>(null)
const recentTickets = ref<TicketItem[] | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

// Buat fungsi untuk ambil data
const fetchDashboardStats = async () => {
  try {
    loading.value = true
    const [statsResponse, ticketsResponse] = await Promise.all([
      api.get('/dashboard-analytics'),
      api.get('/tickets?limit=5'),
    ])

    stats.value = statsResponse.data.data
    recentTickets.value = ticketsResponse.data.data
  } catch (err: any) {
    console.error('Gagal mengambil statistik:', err)
    error.value = err
  } finally {
    loading.value = false
  }
}

// Panggil fungsi saat halaman dibuka
onMounted(() => {
  fetchDashboardStats()
})
</script>
