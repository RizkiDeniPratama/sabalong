<template>
  <div class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
    <div class="mb-4 flex items-center justify-between">
      <h3 class="text-lg font-bold text-gray-900 dark:text-white">Response Performance</h3>
      <div class="flex items-center gap-2">
        <div class="h-2 w-2 rounded-full bg-blue-500"></div>
        <span class="text-xs text-gray-500">Admin Response Time</span>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4 mb-6">
      <div class="text-center">
        <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
          {{ responseData.on_time_percentage }}%
        </div>
        <div class="text-xs text-gray-500">On Time Response</div>
      </div>
      <div class="text-center">
        <div class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ responseData.total_tickets }}
        </div>
        <div class="text-xs text-gray-500">Total Responses</div>
      </div>
    </div>

    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <span class="text-sm text-gray-600 dark:text-gray-400">On Time</span>
        <div class="flex items-center gap-2">
          <div class="h-2 w-16 bg-gray-200 rounded-full dark:bg-gray-700">
            <div 
              class="h-2 bg-green-500 rounded-full transition-all duration-500"
              :style="{ width: onTimePercentage + '%' }"
            ></div>
          </div>
          <span class="text-sm font-medium text-green-600">{{ responseData.tickets_on_time }}</span>
        </div>
      </div>

      <div class="flex items-center justify-between">
        <span class="text-sm text-gray-600 dark:text-gray-400">Late</span>
        <div class="flex items-center gap-2">
          <div class="h-2 w-16 bg-gray-200 rounded-full dark:bg-gray-700">
            <div 
              class="h-2 bg-red-500 rounded-full transition-all duration-500"
              :style="{ width: latePercentage + '%' }"
            ></div>
          </div>
          <span class="text-sm font-medium text-red-600">{{ responseData.tickets_late }}</span>
        </div>
      </div>
    </div>

    <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
      <div class="flex items-center justify-between text-xs text-gray-500">
        <span>Period: This Month</span>
        <span>Target: ≥ 95%</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface ResponseData {
  total_tickets: number
  tickets_on_time: number
  tickets_late: number
  on_time_percentage: number
}

const props = defineProps<{
  responseData: ResponseData
}>()

const onTimePercentage = computed(() => {
  if (props.responseData.total_tickets === 0) return 0
  return Math.round((props.responseData.tickets_on_time / props.responseData.total_tickets) * 100)
})

const latePercentage = computed(() => {
  if (props.responseData.total_tickets === 0) return 0
  return Math.round((props.responseData.tickets_late / props.responseData.total_tickets) * 100)
})
</script>