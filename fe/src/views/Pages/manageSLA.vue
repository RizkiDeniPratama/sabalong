<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />

    <div class="min-h-screen space-y-6 p-4 xl:p-10">
      <div
        class="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900"
      >
        <div
          class="flex flex-col gap-4 border-b border-gray-200 p-6 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h3 class="text-lg font-bold text-gray-900 dark:text-white">Daftar SLA</h3>
            <p class="text-sm text-gray-500">Service Level Agreement untuk tiket</p>
          </div>
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Cari SLA..."
              class="w-full rounded-lg border border-gray-300 bg-white py-2 pl-4 pr-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white sm:w-64"
            />
            <button
              @click="openCreateModal"
              class="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Tambah SLA
            </button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead
              class="border-b border-gray-200 bg-gray-50/50 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-400"
            >
              <tr>
                <th class="px-6 py-4">Nama SLA</th>
                <th class="px-6 py-4">Response Time</th>
                <th class="px-6 py-4">Resolution Time</th>
                <th class="px-6 py-4">Deskripsi</th>
                <th class="px-6 py-4">Status</th>
                <th class="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-if="loading">
                <td colspan="6" class="px-6 py-12 text-center text-gray-500">Memuat data...</td>
              </tr>
              <tr v-else-if="filteredSLAs.length === 0">
                <td colspan="6" class="px-6 py-12 text-center text-gray-500">
                  Tidak ada data ditemukan
                </td>
              </tr>
              <tr
                v-else
                v-for="sla in filteredSLAs"
                :key="sla.id"
                class="group transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <td class="px-6 py-4">
                  <span class="font-medium text-gray-900 dark:text-white">{{ sla.sla_name }}</span>
                </td>
                <td class="px-6 py-4">
                  <span class="text-sm text-gray-700 dark:text-gray-300"
                    >{{ sla.response_hours }} jam</span
                  >
                </td>
                <td class="px-6 py-4">
                  <span class="text-sm text-gray-700 dark:text-gray-300"
                    >{{ sla.resolution_hours }} jam</span
                  >
                </td>
                <td class="px-6 py-4">
                  <span class="line-clamp-1 max-w-xs text-sm text-gray-600 dark:text-gray-400">
                    {{ sla.description || '-' }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <span
                    :class="[
                      'rounded-full px-2 py-1 text-xs font-bold',
                      sla.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800',
                    ]"
                  >
                    {{ sla.is_active ? 'Aktif' : 'Nonaktif' }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center justify-center gap-2">
                    <button
                      @click="openDetailModal(sla)"
                      class="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-blue-600"
                      title="Detail"
                    >
                      <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                    <button
                      @click="openEditModal(sla)"
                      class="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-brand-600"
                      title="Edit"
                    >
                      <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      @click="confirmDelete(sla)"
                      class="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-red-600"
                      title="Hapus"
                    >
                      <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal Create/Edit -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showModal"
          class="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          @click.self="closeModal"
        >
          <div class="absolute inset-0 bg-gray-900/30 backdrop-blur-sm"></div>
          <div
            class="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-800"
          >
            <div
              class="border-b border-gray-100 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-700/50"
            >
              <h3 class="text-lg font-bold text-gray-900 dark:text-white">
                {{ modalMode === 'create' ? 'Tambah SLA Baru' : 'Edit SLA' }}
              </h3>
            </div>
            <div class="p-6 space-y-4">
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nama SLA <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.sla_name"
                  type="text"
                  placeholder="Contoh: High Priority"
                  class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Response Time (jam) <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model.number="form.response_hours"
                    type="number"
                    min="1"
                    placeholder="Contoh: 2"
                    class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Resolution Time (jam) <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model.number="form.resolution_hours"
                    type="number"
                    min="1"
                    placeholder="Contoh: 8"
                    class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Deskripsi
                </label>
                <textarea
                  v-model="form.description"
                  rows="3"
                  placeholder="Jelaskan tingkat prioritas SLA ini..."
                  class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                ></textarea>
              </div>

              <div class="flex items-center gap-2">
                <input
                  v-model="form.is_active"
                  type="checkbox"
                  id="is_active"
                  class="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                />
                <label for="is_active" class="text-sm font-medium text-gray-700 dark:text-gray-300">
                  SLA Aktif
                </label>
              </div>
            </div>
            <div class="flex justify-end gap-3 border-t border-gray-100 bg-gray-50 p-4">
              <button
                @click="closeModal"
                class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                @click="submitForm"
                :disabled="submitting"
                class="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
              >
                {{ submitting ? 'Menyimpan...' : 'Simpan' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Modal Detail -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showDetailModal && selectedSLA"
          class="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          @click.self="closeDetailModal"
        >
          <div class="absolute inset-0 bg-gray-900/30 backdrop-blur-sm"></div>
          <div
            class="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-800"
          >
            <div
              class="border-b border-gray-100 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-700/50"
            >
              <h3 class="text-lg font-bold text-gray-900 dark:text-white">Detail SLA</h3>
            </div>
            <div class="p-6 space-y-4">
              <div>
                <p class="text-sm font-medium text-gray-500">Nama SLA</p>
                <p class="mt-1 text-gray-900 dark:text-white font-medium">
                  {{ selectedSLA.sla_name }}
                </p>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-sm font-medium text-gray-500">Response Time</p>
                  <p class="mt-1 text-gray-900 dark:text-white">
                    {{ selectedSLA.response_hours }} jam
                  </p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-500">Resolution Time</p>
                  <p class="mt-1 text-gray-900 dark:text-white">
                    {{ selectedSLA.resolution_hours }} jam
                  </p>
                </div>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-500">Deskripsi</p>
                <p class="mt-1 text-gray-700 dark:text-gray-300">
                  {{ selectedSLA.description || '-' }}
                </p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-500">Status</p>
                <span
                  :class="[
                    'mt-1 inline-block rounded-full px-3 py-1 text-xs font-bold',
                    selectedSLA.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800',
                  ]"
                >
                  {{ selectedSLA.is_active ? 'Aktif' : 'Nonaktif' }}
                </span>
              </div>
            </div>
            <div class="flex justify-end border-t border-gray-100 bg-gray-50 p-4">
              <button
                @click="closeDetailModal"
                class="rounded-lg bg-brand-600 px-6 py-2 text-sm font-medium text-white hover:bg-brand-700"
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
import { ref, computed, reactive, onMounted } from 'vue'
import AdminLayout from '../../components/layout/AdminLayout.vue'
import PageBreadcrumb from '../../components/common/PageBreadcrumb.vue'
import api from '../../services/api'

interface SLA {
  id: number
  sla_name: string
  response_hours: number
  resolution_hours: number
  description?: string
  is_active: boolean
  created_at?: string
}

const currentPageTitle = ref('Manajemen SLA')
const slas = ref<SLA[]>([])
const loading = ref(false)
const submitting = ref(false)
const searchQuery = ref('')

const showModal = ref(false)
const showDetailModal = ref(false)
const modalMode = ref<'create' | 'edit'>('create')
const selectedSLA = ref<SLA | null>(null)

const form = reactive({
  sla_name: '',
  response_hours: 1,
  resolution_hours: 4,
  description: '',
  is_active: true,
})

// Computed
const filteredSLAs = computed(() => {
  if (!searchQuery.value) return slas.value
  const q = searchQuery.value.toLowerCase()
  return slas.value.filter((s) => s.sla_name.toLowerCase().includes(q))
})

// API Actions
const fetchSLAs = async () => {
  loading.value = true
  try {
    const res = await api.get('/slas')
    if (res.data.success) {
      slas.value = res.data.data
    }
  } catch (err) {
    console.error('Gagal load SLAs', err)
    alert('Gagal memuat data SLA')
  } finally {
    loading.value = false
  }
}

const submitForm = async () => {
  if (!form.sla_name || !form.response_hours || !form.resolution_hours) {
    alert('Nama SLA dan waktu harus diisi!')
    return
  }

  submitting.value = true
  try {
    if (modalMode.value === 'create') {
      const res = await api.post('/slas', form)
      if (res.data.success) {
        alert('SLA berhasil ditambahkan!')
        await fetchSLAs()
        closeModal()
      }
    } else {
      const res = await api.put(`/slas/${selectedSLA.value?.id}`, form)
      if (res.data.success) {
        alert('SLA berhasil diperbarui!')
        await fetchSLAs()
        closeModal()
      }
    }
  } catch (err: any) {
    alert(err.response?.data?.message || 'Gagal menyimpan data')
  } finally {
    submitting.value = false
  }
}

const confirmDelete = async (sla: SLA) => {
  if (!confirm(`Yakin ingin menghapus SLA "${sla.sla_name}"?`)) return

  try {
    const res = await api.delete(`/slas/${sla.id}`)
    if (res.data.success) {
      alert('SLA berhasil dihapus!')
      await fetchSLAs()
    }
  } catch (err: any) {
    alert(err.response?.data?.message || 'Gagal menghapus SLA')
  }
}

// Modal Handlers
const openCreateModal = () => {
  modalMode.value = 'create'
  resetForm()
  showModal.value = true
}

const openEditModal = (sla: SLA) => {
  modalMode.value = 'edit'
  selectedSLA.value = sla
  form.sla_name = sla.sla_name
  form.response_hours = sla.response_hours
  form.resolution_hours = sla.resolution_hours
  form.description = sla.description || ''
  form.is_active = sla.is_active
  showModal.value = true
}

const openDetailModal = (sla: SLA) => {
  selectedSLA.value = sla
  showDetailModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedSLA.value = null
  resetForm()
}

const closeDetailModal = () => {
  showDetailModal.value = false
  selectedSLA.value = null
}

const resetForm = () => {
  form.sla_name = ''
  form.response_hours = 1
  form.resolution_hours = 4
  form.description = ''
  form.is_active = true
}

onMounted(() => {
  fetchSLAs()
})
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
