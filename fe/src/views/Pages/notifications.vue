<template>
  <AdminLayout>
    <div class="mb-6 flex items-center justify-between px-4 xl:px-10 mt-6">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Semua Notifikasi</h2>
      <button
        @click="markAllRead"
        v-if="unreadCount > 0"
        class="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
      >
        Tandai Semua Dibaca
      </button>
    </div>

    <div class="px-4 xl:px-10 pb-10">
      <div
        class="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 overflow-hidden"
      >
        <div v-if="loading" class="p-10 text-center text-gray-500">Memuat notifikasi...</div>

        <div
          v-else-if="notifications.length === 0"
          class="p-10 text-center flex flex-col items-center"
        >
          <div
            class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-2xl mb-4 dark:bg-gray-800"
          >
            🔕
          </div>
          <p class="text-gray-500 dark:text-gray-400">Tidak ada notifikasi saat ini.</p>
        </div>

        <ul v-else class="divide-y divide-gray-100 dark:divide-gray-800">
          <li
            v-for="notif in notifications"
            :key="notif.id"
            @click="handleItemClick(notif)"
            :class="[
              'p-4 hover:bg-gray-50 cursor-pointer transition dark:hover:bg-gray-800',
              !notif.is_read ? 'bg-blue-50/40 dark:bg-blue-900/10' : '',
            ]"
          >
            <div class="flex gap-4">
              <div
                class="flex-shrink-0 w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-2xl"
              >
                {{ getIcon(notif.type) }}
              </div>

              <div class="flex-1">
                <div class="flex justify-between items-start">
                  <h4
                    :class="[
                      'text-sm font-bold',
                      !notif.is_read
                        ? 'text-gray-900 dark:text-white'
                        : 'text-gray-600 dark:text-gray-400',
                    ]"
                  >
                    {{ notif.title }}
                  </h4>
                  <span class="text-xs text-gray-400 whitespace-nowrap ml-2">{{
                    formatDate(notif.created_at)
                  }}</span>
                </div>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ notif.message }}</p>
              </div>

              <div v-if="!notif.is_read" class="self-center">
                <div class="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
              </div>
            </div>
          </li>
        </ul>

        <div
          v-if="notifications.length > 0"
          class="p-4 border-t border-gray-100 dark:border-gray-800 text-center"
        >
          <p class="text-xs text-gray-400">
            Menampilkan {{ notifications.length }} notifikasi terakhir
          </p>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import api from '@/services/api'

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
const notifications = ref<Notification[]>([])
const loading = ref(true)

const unreadCount = computed(() => notifications.value.filter((n) => !n.is_read).length)

const fetchNotifications = async () => {
  loading.value = true
  try {
    const res = await api.get('/notifications')
    if (res.data.success) notifications.value = res.data.data
  } finally {
    loading.value = false
  }
}

const markAllRead = async () => {
  if (!confirm('Tandai semua sebagai sudah dibaca?')) return
  try {
    await api.put('/notifications/read-all')
    notifications.value.forEach((n) => (n.is_read = true))
  } catch (e) {
    alert('Gagal update status')
  }
}

const handleItemClick = async (notif: Notification) => {
  if (!notif.is_read) {
    try {
      await api.put(`/notifications/${notif.id}/read`)
      notif.is_read = true
    } catch (e) {}
  }
  if (notif.ticket_id) router.push(`/detail-tickets/${notif.ticket_id}`)
}

const getIcon = (type: string) => {
  const icons: any = {
    new_ticket: '🎫',
    assigned: '👤',
    status_update: '🔄',
    new_comment: '💬',
    escalation: '⚠️',
  }
  return icons[type] || '📢'
}

const formatDate = (d: string) =>
  new Date(d).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })

onMounted(() => fetchNotifications())
</script>
