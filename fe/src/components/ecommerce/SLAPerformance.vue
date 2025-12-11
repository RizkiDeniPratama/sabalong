<template>
  <div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
    <div class="flex items-center justify-between mb-5">
      <h3 class="text-lg font-semibold text-gray-800 dark:text-white">SLA Performance (Bulan Ini)</h3>
      <div class="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-xl dark:bg-blue-900/30">
        <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4 mb-5">
      <div class="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
        <p class="text-2xl font-bold text-gray-800 dark:text-white">{{ slaData?.avg_sla_percentage || 0 }}%</p>
        <p class="text-sm text-gray-500 dark:text-gray-400">Avg SLA</p>
      </div>
      <div class="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
        <p class="text-2xl font-bold text-gray-800 dark:text-white">{{ slaData?.on_time_rate || 0 }}%</p>
        <p class="text-sm text-gray-500 dark:text-gray-400">On Time Rate</p>
      </div>
    </div>

    <div class="flex justify-between text-sm">
      <div class="flex items-center gap-2">
        <span class="w-3 h-3 bg-green-500 rounded-full"></span>
        <span class="text-gray-600 dark:text-gray-300">On Time: {{ slaData?.tickets_on_time || 0 }}</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="w-3 h-3 bg-red-500 rounded-full"></span>
        <span class="text-gray-600 dark:text-gray-300">Late: {{ slaData?.tickets_late || 0 }}</span>
      </div>
    </div>

    <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Total Completed: <span class="font-semibold text-gray-800 dark:text-white">{{ slaData?.total_completed_tickets || 0 }}</span> tickets
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface SLAData {
  total_completed_tickets: number
  avg_sla_percentage: number
  tickets_on_time: number
  tickets_late: number
  on_time_rate: number
}

defineProps<{
  slaData?: SLAData
}>()
</script>
