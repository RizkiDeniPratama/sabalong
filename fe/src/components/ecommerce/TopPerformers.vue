<template>
  <div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
    <div class="flex items-center justify-between mb-5">
      <h3 class="text-lg font-semibold text-gray-800 dark:text-white">Top Performers (Bulan Ini)</h3>
      <div class="flex items-center justify-center w-10 h-10 bg-yellow-100 rounded-xl dark:bg-yellow-900/30">
        <svg class="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      </div>
    </div>

    <div v-if="performers && performers.length > 0" class="space-y-4">
      <div
        v-for="(petugas, index) in performers"
        :key="petugas.petugas_id"
        @click="goToDetail(petugas.petugas_id)"
        class="flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all hover:shadow-md"
        :class="getRankBgClass(index)"
      >
        <div
          class="flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm"
          :class="getRankClass(index)"
        >
          {{ index + 1 }}
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-medium text-gray-800 dark:text-white truncate">{{ petugas.nama }}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            {{ petugas.total_tickets }} tickets · {{ petugas.tickets_on_time }} on time
          </p>
        </div>
        <div class="text-right">
          <p class="font-bold text-lg" :class="getSLAColorClass(petugas.avg_sla)">
            {{ petugas.avg_sla }}%
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400">SLA</p>
        </div>
        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>

    <div v-else class="text-center py-8 text-gray-500 dark:text-gray-400">
      <svg class="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p>Belum ada data performa bulan ini</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

interface Performer {
  petugas_id: number
  nama: string
  total_tickets: number
  avg_sla: number
  tickets_on_time: number
}

defineProps<{
  performers?: Performer[]
}>()

const router = useRouter()

const goToDetail = (petugasId: number) => {
  router.push(`/admin/petugas/${petugasId}/performance`)
}

const getRankClass = (index: number) => {
  const classes = [
    'bg-yellow-500 text-white',
    'bg-gray-400 text-white',
    'bg-amber-600 text-white',
  ]
  return classes[index] || 'bg-gray-200 text-gray-600'
}

const getRankBgClass = (index: number) => {
  const classes = [
    'bg-yellow-50 dark:bg-yellow-900/10',
    'bg-gray-50 dark:bg-gray-800/30',
    'bg-amber-50 dark:bg-amber-900/10',
  ]
  return classes[index] || 'bg-gray-50 dark:bg-gray-800/30'
}

const getSLAColorClass = (sla: number) => {
  if (sla >= 90) return 'text-green-600 dark:text-green-400'
  if (sla >= 70) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-red-600 dark:text-red-400'
}
</script>
