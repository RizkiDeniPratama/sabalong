<template>
  <div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
    <div class="flex items-center justify-between mb-5">
      <h3 class="text-lg font-semibold text-gray-800 dark:text-white">Urgent Alerts</h3>
      <div
        v-if="alertCount > 0"
        class="flex items-center justify-center px-3 py-1 bg-red-100 dark:bg-red-900/30 rounded-full"
      >
        <span class="text-sm font-semibold text-red-600 dark:text-red-400">{{ alertCount }}</span>
      </div>
    </div>

    <div v-if="tickets && tickets.length > 0" class="space-y-3">
      <div
        v-for="ticket in tickets"
        :key="ticket.ticket_number"
        class="flex items-center gap-3 p-3 rounded-xl border"
        :class="getUrgencyClass(ticket.time_remaining_minutes)"
      >
        <div class="flex-shrink-0">
          <svg
            class="w-5 h-5"
            :class="getIconClass(ticket.time_remaining_minutes)"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-medium text-gray-800 dark:text-white text-sm">{{ ticket.ticket_number }}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Priority: <span class="font-medium" :class="getPriorityClass(ticket.priority)">{{ ticket.priority }}</span>
          </p>
        </div>
        <div class="text-right">
          <p class="font-semibold text-sm" :class="getTimeClass(ticket.time_remaining_minutes)">
            {{ formatTimeRemaining(ticket.time_remaining_minutes) }}
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400">remaining</p>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-8">
      <div class="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-green-100 dark:bg-green-900/30 rounded-full">
        <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <p class="text-gray-500 dark:text-gray-400">Tidak ada tiket urgent</p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface UrgentTicket {
  ticket_number: string
  deadline: string
  priority: string
  time_remaining_minutes: number
}

const props = defineProps<{
  tickets?: UrgentTicket[]
  alertCount?: number
}>()

const formatTimeRemaining = (minutes: number) => {
  if (minutes <= 0) return 'Overdue!'
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

const getUrgencyClass = (minutes: number) => {
  if (minutes <= 0) return 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
  if (minutes <= 30) return 'border-orange-300 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20'
  return 'border-yellow-300 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20'
}

const getIconClass = (minutes: number) => {
  if (minutes <= 0) return 'text-red-500'
  if (minutes <= 30) return 'text-orange-500'
  return 'text-yellow-500'
}

const getTimeClass = (minutes: number) => {
  if (minutes <= 0) return 'text-red-600 dark:text-red-400'
  if (minutes <= 30) return 'text-orange-600 dark:text-orange-400'
  return 'text-yellow-600 dark:text-yellow-400'
}

const getPriorityClass = (priority: string) => {
  const classes: Record<string, string> = {
    high: 'text-red-600 dark:text-red-400',
    medium: 'text-yellow-600 dark:text-yellow-400',
    low: 'text-green-600 dark:text-green-400',
  }
  return classes[priority] || 'text-gray-600 dark:text-gray-400'
}
</script>
