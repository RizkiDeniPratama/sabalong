<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />

    <div class="min-h-screen space-y-6 p-4 xl:p-10">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 flex items-center justify-between"
        >
          <div>
            <p class="text-sm text-gray-500">Rata-rata Rating</p>
            <h3 class="text-3xl font-bold text-gray-900 dark:text-white mt-1">
              {{ averageRating }} <span class="text-sm text-gray-400 font-normal">/ 5.0</span>
            </h3>
          </div>
          <div class="p-3 bg-yellow-50 rounded-full text-yellow-500 dark:bg-yellow-900/20">
            <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path
                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
              />
            </svg>
          </div>
        </div>

        <div
          class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 flex items-center justify-between"
        >
          <div>
            <p class="text-sm text-gray-500">Total Ulasan</p>
            <h3 class="text-3xl font-bold text-gray-900 dark:text-white mt-1">
              {{ feedbacks.length }}
            </h3>
          </div>
          <div class="p-3 bg-blue-50 rounded-full text-blue-500 dark:bg-blue-900/20">
            <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
              />
            </svg>
          </div>
        </div>

        <div
          class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 flex items-center justify-between"
        >
          <div>
            <p class="text-sm text-gray-500">Puas (5★)</p>
            <h3 class="text-3xl font-bold text-gray-900 dark:text-white mt-1">
              {{ excellentCount }}
            </h3>
          </div>
          <div class="p-3 bg-green-50 rounded-full text-green-500 dark:bg-green-900/20">
            <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>

      <div
        class="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900"
      >
        <div
          class="border-b border-gray-200 p-4 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <h3 class="font-bold text-gray-900 dark:text-white">Daftar Ulasan Masuk</h3>

          <div class="flex items-center gap-2">
            <div class="flex bg-gray-100 rounded-lg p-1 dark:bg-gray-800">
              <button
                @click="selectedRating = 0"
                :class="[
                  'px-3 py-1 text-xs font-medium rounded-md transition',
                  selectedRating === 0
                    ? 'bg-white shadow text-gray-900 dark:bg-gray-700 dark:text-white'
                    : 'text-gray-500 hover:text-gray-700',
                ]"
              >
                All
              </button>
              <button
                v-for="i in 5"
                :key="i"
                @click="selectedRating = i"
                :class="[
                  'px-3 py-1 text-xs font-medium rounded-md transition flex items-center gap-1',
                  selectedRating === i
                    ? 'bg-white shadow text-yellow-600 dark:bg-gray-700 dark:text-yellow-400'
                    : 'text-gray-500 hover:text-gray-700',
                ]"
              >
                {{ i }}
                <svg class="w-3 h-3 fill-current" viewBox="0 0 20 20">
                  <path
                    d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                  />
                </svg>
              </button>
            </div>
            <div class="relative">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Cari..."
                class="w-full rounded-lg border border-gray-300 bg-white py-1.5 pl-3 pr-4 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white sm:w-40"
              />
            </div>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead
              class="bg-gray-50/50 text-gray-500 dark:bg-gray-800/50 dark:text-gray-400 uppercase"
            >
              <tr>
                <th class="px-6 py-4 font-medium">Rating</th>
                <th class="px-6 py-4 font-medium w-1/3">Ulasan</th>
                <th class="px-6 py-4 font-medium">Tiket</th>
                <th class="px-6 py-4 font-medium">Pelapor</th>
                <th class="px-6 py-4 font-medium">Tanggal</th>
                <th class="px-6 py-4 font-medium text-center">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-if="loading" class="text-center">
                <td colspan="6" class="py-10">Memuat data...</td>
              </tr>
              <tr v-else-if="paginatedFeedbacks.length === 0" class="text-center">
                <td colspan="6" class="py-10 text-gray-500">Tidak ada ulasan ditemukan.</td>
              </tr>

              <tr
                v-else
                v-for="item in paginatedFeedbacks"
                :key="item.id"
                class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
              >
                <td class="px-6 py-4">
                  <div class="flex text-yellow-400">
                    <span v-for="n in 5" :key="n">
                      <svg v-if="n <= item.rating" class="w-4 h-4 fill-current" viewBox="0 0 20 20">
                        <path
                          d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                        />
                      </svg>
                      <svg
                        v-else
                        class="w-4 h-4 text-gray-200 dark:text-gray-700 fill-current"
                        viewBox="0 0 20 20"
                      >
                        <path
                          d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                        />
                      </svg>
                    </span>
                  </div>
                </td>

                <td class="px-6 py-4">
                  <p class="text-gray-700 dark:text-gray-300 italic line-clamp-2">
                    "{{ item.review }}"
                  </p>
                </td>

                <td class="px-6 py-4">
                  <span class="font-bold text-brand-600 block">{{
                    item.ticket?.ticket_number
                  }}</span>
                  <span class="text-xs text-gray-500 truncate block max-w-[150px]">{{
                    item.ticket?.judul_permohonan
                  }}</span>
                </td>

                <td class="px-6 py-4">
                  <div class="flex flex-col">
                    <span class="font-medium text-gray-900 dark:text-white">{{
                      item.user?.nama
                    }}</span>
                    <span class="text-xs text-gray-500">{{ item.user?.instansi }}</span>
                  </div>
                </td>

                <td class="px-6 py-4 text-gray-500">
                  {{ formatDate(item.created_at) }}
                </td>

                <td class="px-6 py-4 text-center">
                  <button
                    @click="viewFeedbackDetail(item)"
                    class="text-gray-400 hover:text-brand-600"
                  >
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          class="flex items-center justify-between border-t border-gray-200 px-6 py-4 dark:border-gray-800"
        >
          <span class="text-sm text-gray-500">Hal {{ currentPage }} dari {{ totalPages }}</span>
          <div class="flex gap-2">
            <button
              @click="currentPage--"
              :disabled="currentPage === 1"
              class="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 text-sm"
            >
              Prev
            </button>
            <button
              @click="currentPage++"
              :disabled="currentPage === totalPages"
              class="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 text-sm"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showDetailModal && selectedFeedback"
          class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm"
          @click.self="showDetailModal = false"
        >
          <div class="bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl shadow-xl p-6">
            <h3 class="text-lg font-bold mb-4 dark:text-white">Detail Ulasan</h3>
            <div class="space-y-4">
              <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p class="text-xs text-gray-500 uppercase mb-1">Tiket Terkait</p>
                <p class="font-bold text-brand-600">{{ selectedFeedback.ticket?.ticket_number }}</p>
                <p class="text-sm text-gray-700 dark:text-gray-300">
                  {{ selectedFeedback.ticket?.judul_permohonan }}
                </p>
              </div>
              <div>
                <p class="text-xs text-gray-500 uppercase mb-1">Rating & Ulasan</p>
                <div class="flex text-yellow-400 text-xl mb-2">
                  <span v-for="n in 5" :key="n">{{
                    n <= selectedFeedback.rating ? '★' : '☆'
                  }}</span>
                </div>
                <p class="text-gray-800 dark:text-white italic">"{{ selectedFeedback.review }}"</p>
              </div>
            </div>
            <div class="mt-6 flex justify-end">
              <button
                @click="showDetailModal = false"
                class="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm text-gray-700 font-medium"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import AdminLayout from '../../components/layout/AdminLayout.vue'
import PageBreadcrumb from '../../components/common/PageBreadcrumb.vue'
import api from '@/services/api'

// Interface yang Diperbarui
interface User {
  id: number
  nama: string
  instansi?: string
  role?: { role_name: string } // Sesuai JSON Profile Anda
}

interface Ticket {
  id: number
  ticket_number: string
  judul_permohonan: string
  assigned_to_id?: number // Akan kita ambil dari fetch tiket terpisah
}

interface Feedback {
  id: number
  rating: number
  review: string
  created_at: string
  ticket?: Ticket
  user?: User
}

const currentPageTitle = ref('Ulasan Layanan')
const feedbacks = ref<Feedback[]>([])
const authUser = ref<User | null>(null)
const loading = ref(false)
const searchQuery = ref('')
const selectedRating = ref(0)
const currentPage = ref(1)
const perPage = 10
const showDetailModal = ref(false)
const selectedFeedback = ref<Feedback | null>(null)

// Filter Logic
const filteredFeedbacks = computed(() => {
  let res = feedbacks.value
  if (selectedRating.value !== 0) {
    if (selectedRating.value === 'poor') res = res.filter((f) => f.rating <= 2)
    else res = res.filter((f) => f.rating === Number(selectedRating.value))
  }
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    res = res.filter(
      (f) =>
        f.ticket?.ticket_number?.toLowerCase().includes(q) ||
        f.user?.nama?.toLowerCase().includes(q),
    )
  }
  return res
})

// Pagination
const totalPages = computed(() => Math.ceil(filteredFeedbacks.value.length / perPage))
const startIndex = computed(() => (currentPage.value - 1) * perPage)
const endIndex = computed(() => startIndex.value + perPage)
const paginatedFeedbacks = computed(() =>
  filteredFeedbacks.value.slice(startIndex.value, endIndex.value),
)

// Stats
const averageRating = computed(() => {
  if (feedbacks.value.length === 0) return '0.0'
  const sum = feedbacks.value.reduce((a, b) => a + b.rating, 0)
  return (sum / feedbacks.value.length).toFixed(1)
})
const excellentCount = computed(() => feedbacks.value.filter((f) => f.rating === 5).length)
const poorCount = computed(() => feedbacks.value.filter((f) => f.rating <= 2).length)

// MAIN LOGIC: Fetch & Filter
const initData = async () => {
  loading.value = true
  try {
    // 1. Ambil Profile untuk Role & ID
    const profileRes = await api.get('/users/profile')
    if (profileRes.data.success) {
      authUser.value = profileRes.data.data
    }

    // 2. Ambil Semua Feedback (Data Raw)
    const feedbackRes = await api.get('/feedbacks')
    const allFeedbacks = feedbackRes.data.data || []

    // 3. Logika Filter Role
    const roleName = authUser.value?.role?.role_name?.toLowerCase()

    if (roleName === 'petugas') {
      // --- WORKAROUND: Cross-Check dengan Data Tiket ---
      // Karena response feedback tidak ada assigned_to_id, kita ambil daftar tiket dulu
      const ticketRes = await api.get('/tickets')

      if (ticketRes.data.success) {
        const allTickets = ticketRes.data.data
        // Cari ID tiket yang di-assign ke petugas ini
        const myTicketIds = allTickets
          .filter((t: any) => t.assigned_to_id === authUser.value?.id)
          .map((t: any) => t.id)

        // Filter feedback yang ticket_id nya ada di daftar myTicketIds
        feedbacks.value = allFeedbacks.filter((f: any) => myTicketIds.includes(f.ticket?.id))

        currentPageTitle.value = 'Ulasan Kinerja Saya'
      }
    } else {
      // Admin / Pimpinan -> Lihat Semua
      feedbacks.value = allFeedbacks
    }
  } catch (e) {
    console.error('Error loading data', e)
  } finally {
    loading.value = false
  }
}

const viewFeedbackDetail = (f: Feedback) => {
  selectedFeedback.value = f
  showDetailModal.value = true
}
const closeDetailModal = () => {
  showDetailModal.value = false
  selectedFeedback.value = null
}
const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })

onMounted(() => initData())
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
