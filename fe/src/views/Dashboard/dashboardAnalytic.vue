<template>
  <AdminLayout>
    <div class="p-4 md:p-6 2xl:p-10">
      <div v-if="loading" class="text-gray-500">Memuat data statistik...</div>

      <div v-else-if="error" class="p-4 bg-red-100 text-red-700 rounded">
        <p><b>Error:</b> {{ error }}</p>
        <p class="mt-2 text-sm">
          Silakan cek terminal backend (nodemon) Anda untuk melihat error detail dari server.
        </p>
      </div>

      <div v-else-if="stats" class="grid grid-cols-12 gap-4 md:gap-6">
        <!-- Row 1: Metrics -->
        <div class="col-span-12">
          <EcommerceMetrics
            :petugasStats="stats.petugas"
            :userStats="stats.users"
            :ticketPending="stats.tickets?.pending || 0"
            :ticketOnProgress="stats.tickets?.on_progress || 0"
          />
        </div>

        <!-- Row 2: SLA Performance + Response Performance -->
        <div class="col-span-12 xl:col-span-6">
          <SLAPerformance
            v-if="stats.sla_performance"
            :slaData="stats.sla_performance.this_month"
          />
        </div>

        <div class="col-span-12 xl:col-span-6">
          <ResponsePerformance
            v-if="stats.response_performance"
            :responseData="stats.response_performance"
          />
        </div>

        <!-- Row 3: Urgent Alerts -->
        <div class="col-span-12">
          <UrgentAlerts
            v-if="stats.urgent_alerts"
            :tickets="stats.urgent_alerts.tickets"
            :alertCount="stats.urgent_alerts.pending_tickets_near_deadline"
          />
        </div>

        <!-- Row 4: Top Performers + Feedback Rating -->
        <div class="col-span-12 xl:col-span-6">
          <div class="space-y-4">
            <TopPerformers
              v-if="stats.sla_performance"
              :performers="stats.sla_performance.top_performers"
            />
            <router-link
              to="/admin/sla-ranking"
              class="block text-center py-3 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors border border-gray-200 dark:border-gray-700"
            >
              View All Rankings →
            </router-link>
          </div>
        </div>

        <div class="col-span-12 xl:col-span-6">
          <MonthlyTarget v-if="stats.feedbacks" :rating="stats.feedbacks" />
        </div>

        <!-- Row 4: Recent Tickets -->
        <div class="col-span-12">
          <RecentOrders v-if="recentTickets" :tickets="recentTickets" />
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '../../services/api'

import AdminLayout from '../../components/layout/AdminLayout.vue'
import EcommerceMetrics from '../../components/ecommerce/EcommerceMetrics.vue'
import MonthlyTarget from '../../components/ecommerce/MonthlyTarget.vue'
import RecentOrders from '../../components/ecommerce/RecentOrders.vue'
import SLAPerformance from '../../components/ecommerce/SLAPerformance.vue'
import ResponsePerformance from '../../components/ecommerce/ResponsePerformance.vue'
import TopPerformers from '../../components/ecommerce/TopPerformers.vue'
import UrgentAlerts from '../../components/ecommerce/UrgentAlerts.vue'

const stats = ref<any>(null)
const recentTickets = ref<any>(null)
const loading = ref(true)
const error = ref<string | null>(null)

const fetchDashboardStats = async () => {
  try {
    loading.value = true
    const [statsResponse, ticketsResponse] = await Promise.all([
      api.get('/dashboard-analytics'),
      api.get('/tickets?limit=5'),
    ])

    stats.value = statsResponse.data.data
    recentTickets.value = ticketsResponse.data.data

    // Debug: Log data untuk memastikan SLA performance ada
    console.log('Dashboard Stats:', stats.value)
    console.log('SLA Performance:', stats.value?.sla_performance)
    console.log('Top Performers:', stats.value?.sla_performance?.top_performers)
    console.log('Urgent Alerts:', stats.value?.urgent_alerts)
  } catch (err: any) {
    console.error('Gagal mengambil statistik:', err)
    error.value = err.message || 'Terjadi kesalahan'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDashboardStats()
})
</script>
