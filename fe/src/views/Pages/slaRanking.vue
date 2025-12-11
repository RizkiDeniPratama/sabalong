<template>
  <AdminLayout>
    <div class="p-4 md:p-6 2xl:p-10">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white">SLA Performance Ranking</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Ranking performa petugas berdasarkan SLA
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p class="mt-4 text-gray-500">Memuat data ranking...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="p-4 bg-red-100 text-red-700 rounded-xl">
        <p><b>Error:</b> {{ error }}</p>
      </div>

      <!-- Content -->
      <div v-else-if="rankingData" class="space-y-6">
        <!-- Period Filter -->
        <div class="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div class="flex flex-wrap gap-4 items-end">
            <div class="flex-1 min-w-[200px]">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Date
              </label>
              <input
                v-model="filters.start_date"
                type="date"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              />
            </div>
            <div class="flex-1 min-w-[200px]">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Date
              </label>
              <input
                v-model="filters.end_date"
                type="date"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              />
            </div>
            <button
              @click="applyFilter"
              class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Apply Filter
            </button>
            <button
              @click="resetFilter"
              class="px-6 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg font-medium transition-colors"
            >
              Reset
            </button>
          </div>
        </div>

        <!-- Summary -->
        <div class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="text-center">
              <p class="text-sm text-gray-500 dark:text-gray-400">Total Petugas</p>
              <p class="text-2xl font-bold text-gray-800 dark:text-white mt-1">
                {{ rankingData.total_petugas }}
              </p>
            </div>
            <div class="text-center">
              <p class="text-sm text-gray-500 dark:text-gray-400">Period</p>
              <p class="text-sm font-medium text-gray-800 dark:text-white mt-1">
                {{ rankingData.period.start }} - {{ rankingData.period.end }}
              </p>
            </div>
            <div class="text-center">
              <p class="text-sm text-gray-500 dark:text-gray-400">Active Petugas</p>
              <p class="text-2xl font-bold text-gray-800 dark:text-white mt-1">
                {{ rankingData.ranking.filter((p: any) => p.total_tickets > 0).length }}
              </p>
            </div>
          </div>
        </div>

        <!-- Ranking Table -->
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div class="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 class="text-lg font-semibold text-gray-800 dark:text-white">Performance Ranking</h2>
          </div>
          
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Rank
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Petugas
                  </th>
                  <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Total Tickets
                  </th>
                  <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Avg SLA
                  </th>
                  <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    On Time
                  </th>
                  <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Late
                  </th>
                  <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    On Time %
                  </th>
                  <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                <tr
                  v-for="item in rankingData.ranking"
                  :key="item.petugas.id"
                  class="hover:bg-gray-50 dark:hover:bg-gray-900/30"
                  :class="getRankRowClass(item.rank)"
                >
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center gap-2">
                      <span
                        class="flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm"
                        :class="getRankBadgeClass(item.rank)"
                      >
                        {{ item.rank }}
                      </span>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <div>
                      <p class="font-medium text-gray-800 dark:text-white">{{ item.petugas.nama }}</p>
                      <p class="text-xs text-gray-500 dark:text-gray-400">{{ item.petugas.email }}</p>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-300">
                    {{ item.total_tickets }}
                  </td>
                  <td class="px-6 py-4 text-center">
                    <span class="text-lg font-bold" :class="getSLAColor(item.avg_sla)">
                      {{ item.avg_sla }}%
                    </span>
                  </td>
                  <td class="px-6 py-4 text-center text-sm font-medium text-green-600 dark:text-green-400">
                    {{ item.tickets_on_time }}
                  </td>
                  <td class="px-6 py-4 text-center text-sm font-medium text-red-600 dark:text-red-400">
                    {{ item.tickets_late }}
                  </td>
                  <td class="px-6 py-4 text-center">
                    <span
                      class="px-2 py-1 text-xs font-medium rounded-full"
                      :class="getPercentageClass(item.on_time_percentage)"
                    >
                      {{ item.on_time_percentage }}%
                    </span>
                  </td>
                  <td class="px-6 py-4 text-center">
                    <router-link
                      :to="`/admin/petugas/${item.petugas.id}/performance`"
                      class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm"
                    >
                      View Details
                    </router-link>
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
import { ref, onMounted } from 'vue'
import AdminLayout from '../../components/layout/AdminLayout.vue'
import api from '../../services/api'

interface RankingData {
  period: {
    start: string
    end: string
  }
  total_petugas: number
  ranking: Array<{
    rank: number
    petugas: {
      id: number
      nama: string
      email: string
    }
    total_tickets: number
    avg_sla: number
    tickets_on_time: number
    tickets_late: number
    on_time_percentage: number
  }>
}

const rankingData = ref<RankingData | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

const filters = ref({
  start_date: '',
  end_date: '',
})

const fetchRanking = async () => {
  try {
    loading.value = true
    error.value = null

    let url = '/slas/ranking'
    const params = new URLSearchParams()
    
    if (filters.value.start_date) params.append('start_date', filters.value.start_date)
    if (filters.value.end_date) params.append('end_date', filters.value.end_date)
    
    if (params.toString()) url += `?${params.toString()}`

    const response = await api.get(url)
    
    if (response.data.success) {
      rankingData.value = response.data.data
    } else {
      error.value = response.data.message || 'Gagal mengambil data'
    }
  } catch (err: any) {
    console.error('Error fetching ranking:', err)
    error.value = err.response?.data?.message || err.message || 'Terjadi kesalahan'
  } finally {
    loading.value = false
  }
}

const applyFilter = () => {
  fetchRanking()
}

const resetFilter = () => {
  filters.value.start_date = ''
  filters.value.end_date = ''
  fetchRanking()
}

const getRankBadgeClass = (rank: number) => {
  if (rank === 1) return 'bg-yellow-500 text-white'
  if (rank === 2) return 'bg-gray-400 text-white'
  if (rank === 3) return 'bg-amber-600 text-white'
  return 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
}

const getRankRowClass = (rank: number) => {
  if (rank === 1) return 'bg-yellow-50 dark:bg-yellow-900/10'
  if (rank === 2) return 'bg-gray-50 dark:bg-gray-800/30'
  if (rank === 3) return 'bg-amber-50 dark:bg-amber-900/10'
  return ''
}

const getSLAColor = (sla: number) => {
  if (sla >= 90) return 'text-green-600 dark:text-green-400'
  if (sla >= 70) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-red-600 dark:text-red-400'
}

const getPercentageClass = (percentage: number) => {
  if (percentage >= 90) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
  if (percentage >= 70) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
  return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
}

onMounted(() => {
  fetchRanking()
})
</script>
