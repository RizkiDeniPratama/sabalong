<template>
  <AdminLayout>
    <div class="min-h-screen p-4 md:p-6 2xl:p-10 space-y-8">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Katalog Layanan</h1>
          <p class="text-gray-600 dark:text-gray-400 mt-2">Pilih layanan yang Anda butuhkan</p>
        </div>
        <router-link
          to="/user/dashboard"
          class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Kembali ke Dashboard
        </router-link>
      </div>

      <!-- Search -->
      <div class="relative max-w-md">
        <input
          v-model="serviceSearch"
          type="text"
          placeholder="Cari layanan (misal: Internet, Printer, Cuti)..."
          class="w-full rounded-xl border border-gray-300 py-3 pl-12 pr-4 text-gray-900 placeholder-gray-500 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
        />
        <svg
          class="absolute left-4 top-3.5 h-5 w-5 text-gray-400"
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

      <!-- Services Grid -->
      <div>
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold text-gray-900 dark:text-white">Semua Layanan</h3>
          <span class="text-sm text-gray-500">{{ filteredServices.length }} layanan tersedia</span>
        </div>

        <div v-if="loading.services" class="py-20 text-center">
          <div
            class="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-brand-600"
          ></div>
        </div>

        <div
          v-else-if="filteredServices.length === 0"
          class="p-10 text-center bg-white rounded-2xl border border-dashed border-gray-300 dark:bg-gray-900 dark:border-gray-700"
        >
          <div class="mx-auto h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
            <svg class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p class="text-gray-500">Layanan yang Anda cari tidak ditemukan.</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div
            v-for="service in filteredServices"
            :key="service.id"
            @click="goToCreateTicket(service.id)"
            class="group cursor-pointer rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg hover:border-brand-300 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-brand-700"
          >
            <div class="flex justify-between items-start mb-4">
              <div
                class="h-12 w-12 flex items-center justify-center rounded-xl bg-brand-50 text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-colors dark:bg-brand-900/20 dark:text-brand-400"
              >
                <img v-if="service.icon" :src="service.icon" class="h-6 w-6" />
                <svg v-else class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <span
                class="px-2.5 py-1 rounded-lg bg-gray-100 text-[10px] font-bold uppercase tracking-wide text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                >{{ service.kategori }}</span
              >
            </div>

            <h4
              class="text-lg font-bold text-gray-900 mb-2 group-hover:text-brand-600 dark:text-white transition-colors"
            >
              {{ service.nama_layanan }}
            </h4>
            <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 mb-4">
              {{ service.deskripsi }}
            </p>

            <div
              class="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between"
            >
              <span class="text-xs text-gray-400 flex items-center gap-1">
                <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {{ service.sla?.resolution_hours || 24 }} Jam
              </span>
              <span
                class="text-xs font-bold text-brand-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform"
              >
                Buat Tiket
                <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </span>
            </div>
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
const services = ref<any[]>([])
const serviceSearch = ref('')
const loading = reactive({ services: true })

// API
const loadServices = async () => {
  try {
    const serviceRes = await api.get('/services')
    if (serviceRes.data.success) {
      services.value = serviceRes.data.data.filter((s: any) => s.is_active)
    }
    loading.services = false
  } catch (e) {
    console.error(e)
    loading.services = false
  }
}

// Logic
const filteredServices = computed(() => {
  if (!serviceSearch.value) return services.value
  const q = serviceSearch.value.toLowerCase()
  return services.value.filter(
    (s) => s.nama_layanan.toLowerCase().includes(q) || s.kategori.toLowerCase().includes(q),
  )
})

const goToCreateTicket = (serviceId: number) => {
  router.push({ path: '/user/tickets/create', query: { service_id: serviceId } })
}

onMounted(() => loadServices())
</script>