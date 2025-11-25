<template>
  <div class="relative" ref="dropdownRef">
    <button
      class="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full hover:text-dark-900 h-11 w-11 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
      @click="toggleDropdown"
    >
      <span
        v-if="unreadCount > 0"
        class="absolute right-0 top-0.5 z-1 h-2 w-2 rounded-full bg-red-500"
      >
        <span
          class="absolute inline-flex w-full h-full bg-red-500 rounded-full opacity-75 -z-1 animate-ping"
        ></span>
      </span>

      <svg
        class="fill-current"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z"
          fill=""
        />
      </svg>
    </button>

    <div
      v-if="dropdownOpen"
      class="absolute -right-[240px] mt-[17px] flex h-[480px] w-[350px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark sm:w-[361px] lg:right-0"
    >
      <div
        class="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-gray-800"
      >
        <h5 class="text-lg font-semibold text-gray-800 dark:text-white/90">
          Notifikasi ({{ unreadCount }})
        </h5>
        <button
          @click="markAllAsRead"
          class="text-xs text-blue-600 hover:underline"
          v-if="unreadCount > 0"
        >
          Tandai semua dibaca
        </button>
      </div>

      <ul class="flex flex-col h-auto overflow-y-auto custom-scrollbar">
        <li v-if="loading" class="text-center py-4 text-sm text-gray-500">Memuat...</li>
        <li v-else-if="notifications.length === 0" class="text-center py-4 text-sm text-gray-500">
          Tidak ada notifikasi baru.
        </li>

        <li v-else v-for="notif in notifications.slice(0, 5)" :key="notif.id">
          <a
            class="flex gap-3 rounded-lg border-b border-gray-100 p-3 px-4.5 py-3 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5 cursor-pointer"
            :class="!notif.is_read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''"
            @click="handleItemClick(notif)"
          >
            <div
              class="relative flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 text-xl"
            >
              {{ getNotificationIcon(notif.type) }}
            </div>

            <span class="block flex-1">
              <span class="mb-1.5 block text-sm text-gray-500 dark:text-gray-400">
                <span class="font-medium text-gray-800 dark:text-white/90">{{ notif.title }}</span>
                <br />
                {{ notif.message }}
              </span>
              <span class="text-xs text-gray-400">{{ formatDate(notif.created_at) }}</span>
            </span>

            <span v-if="!notif.is_read" class="h-2 w-2 rounded-full bg-blue-600 mt-2"></span>
          </a>
        </li>
      </ul>

      <button
        class="mt-3 flex w-full justify-center rounded-lg border border-gray-300 bg-white p-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
        @click="handleViewAllClick"
      >
        Lihat Semua Notifikasi
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api' // Sesuaikan path

// Interface
interface Notification {
  id: number
  ticket_id?: number
  type: string
  title: string
  message: string
  is_read: boolean
  created_at: string
}

const router = useRouter()
const dropdownOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)
const notifications = ref<Notification[]>([])
const loading = ref(false)

const unreadCount = computed(() => notifications.value.filter((n) => !n.is_read).length)

// Fetch Data dari API
const fetchNotifications = async () => {
  loading.value = true
  try {
    const res = await api.get('/notifications') //
    if (res.data.success) {
      notifications.value = res.data.data
    }
  } catch (err) {
    console.error('Gagal load notif', err)
  } finally {
    loading.value = false
  }
}

// Actions
const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value
  if (dropdownOpen.value) fetchNotifications()
}

const closeDropdown = () => {
  dropdownOpen.value = false
}

const markAllAsRead = async () => {
  try {
    await api.put('/notifications/read-all') //
    notifications.value.forEach((n) => (n.is_read = true))
  } catch (err) {
    console.error(err)
  }
}

const handleItemClick = async (notif: Notification) => {
  if (!notif.is_read) {
    try {
      await api.put(`/notifications/${notif.id}/read`) //
      notif.is_read = true
    } catch (err) {
      console.error(err)
    }
  }
  closeDropdown()

  if (notif.ticket_id) {
    router.push(`/detail-ticket/${notif.ticket_id}`)
  }
}

const handleViewAllClick = () => {
  closeDropdown()
  // PERBAIKAN UTAMA: Gunakan name yang sesuai dengan router index.ts
  router.push({ name: 'Notifications' })
}

// Utils
const handleClickOutside = (event: any) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    closeDropdown()
  }
}

const getNotificationIcon = (type: string) => {
  const icons: any = {
    new_ticket: '🎫',
    assigned: '👤',
    status_update: '🔄',
    new_comment: '💬',
    escalation: '⚠️',
  }
  return icons[type] || '📢'
}

const formatDate = (date: string) => {
  const diff = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000)
  if (diff < 60) return 'Baru saja'
  if (diff < 3600) return `${Math.floor(diff / 60)}m lalu`
  if (diff < 86400) return `${Math.floor(diff / 3600)}j lalu`
  return `${Math.floor(diff / 86400)}h lalu`
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  fetchNotifications()
  // Poll setiap 60 detik
  setInterval(fetchNotifications, 60000)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
