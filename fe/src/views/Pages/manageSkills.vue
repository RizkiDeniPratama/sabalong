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
            <h3 class="text-lg font-bold text-gray-900 dark:text-white">Daftar Skills</h3>
            <p class="text-sm text-gray-500">Keahlian yang dimiliki petugas</p>
          </div>
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
            <select
              v-model="categoryFilter"
              class="rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="all">Semua Kategori</option>
              <option value="Development">Development</option>
              <option value="Design">Design</option>
              <option value="Network">Network</option>
              <option value="Hardware">Hardware</option>
              <option value="Other">Lainnya</option>
            </select>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Cari skill..."
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
              Tambah Skill
            </button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead
              class="border-b border-gray-200 bg-gray-50/50 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-400"
            >
              <tr>
                <th class="px-6 py-4">Nama Skill</th>
                <th class="px-6 py-4">Kategori</th>
                <th class="px-6 py-4">Deskripsi</th>
                <th class="px-6 py-4">Tanggal Dibuat</th>
                <th class="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-if="loading">
                <td colspan="5" class="px-6 py-12 text-center text-gray-500">Memuat data...</td>
              </tr>
              <tr v-else-if="filteredSkills.length === 0">
                <td colspan="5" class="px-6 py-12 text-center text-gray-500">
                  Tidak ada data ditemukan
                </td>
              </tr>
              <tr
                v-else
                v-for="skill in filteredSkills"
                :key="skill.id"
                class="group transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <td class="px-6 py-4">
                  <span class="font-medium text-gray-900 dark:text-white">
                    {{ skill.skill_name }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <span :class="getCategoryBadgeClass(skill.kategori)">
                    {{ skill.kategori }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <span class="line-clamp-2 max-w-md text-sm text-gray-700 dark:text-gray-300">
                    {{ skill.skill_description || '-' }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <span class="text-sm text-gray-600 dark:text-gray-400">
                    {{ formatDate(skill.created_at) }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center justify-center gap-2">
                    <button
                      @click="openDetailModal(skill)"
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
                      @click="openEditModal(skill)"
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
                      @click="confirmDelete(skill)"
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
                {{ modalMode === 'create' ? 'Tambah Skill Baru' : 'Edit Skill' }}
              </h3>
            </div>
            <div class="p-6 space-y-4">
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nama Skill <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.skill_name"
                  type="text"
                  placeholder="Contoh: Frontend Development"
                  class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Kategori <span class="text-red-500">*</span>
                </label>
                <select
                  v-model="form.kategori"
                  class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="">-- Pilih Kategori --</option>
                  <option value="Development">Development</option>
                  <option value="Design">Design</option>
                  <option value="Network">Network</option>
                  <option value="Hardware">Hardware</option>
                  <option value="Database">Database</option>
                  <option value="Security">Security</option>
                  <option value="Other">Lainnya</option>
                </select>
              </div>

              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Deskripsi <span class="text-red-500">*</span>
                </label>
                <textarea
                  v-model="form.skill_description"
                  rows="4"
                  placeholder="Jelaskan detail tentang skill ini..."
                  class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                ></textarea>
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
          v-if="showDetailModal && selectedSkill"
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
              <h3 class="text-lg font-bold text-gray-900 dark:text-white">Detail Skill</h3>
            </div>
            <div class="p-6 space-y-4">
              <div>
                <p class="text-sm font-medium text-gray-500">Nama Skill</p>
                <p class="mt-1 text-gray-900 dark:text-white font-medium">
                  {{ selectedSkill.skill_name }}
                </p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-500">Kategori</p>
                <span
                  :class="getCategoryBadgeClass(selectedSkill.kategori)"
                  class="mt-1 inline-block"
                >
                  {{ selectedSkill.kategori }}
                </span>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-500">Deskripsi</p>
                <p class="mt-1 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {{ selectedSkill.skill_description || '-' }}
                </p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-500">Tanggal Dibuat</p>
                <p class="mt-1 text-gray-700 dark:text-gray-300">
                  {{ formatDate(selectedSkill.created_at) }}
                </p>
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

interface Skill {
  id: number
  skill_name: string
  skill_description: string
  kategori: string
  created_at: string
}

const currentPageTitle = ref('Manajemen Skills')
const skills = ref<Skill[]>([])
const loading = ref(false)
const submitting = ref(false)
const searchQuery = ref('')
const categoryFilter = ref('all')

const showModal = ref(false)
const showDetailModal = ref(false)
const modalMode = ref<'create' | 'edit'>('create')
const selectedSkill = ref<Skill | null>(null)

const form = reactive({
  skill_name: '',
  skill_description: '',
  kategori: '',
})

// Computed
const filteredSkills = computed(() => {
  let result = skills.value

  // Filter by category
  if (categoryFilter.value !== 'all') {
    result = result.filter((s) => s.kategori === categoryFilter.value)
  }

  // Search
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(
      (s) =>
        s.skill_name.toLowerCase().includes(q) || s.skill_description.toLowerCase().includes(q),
    )
  }

  return result
})

// Helpers
const getCategoryBadgeClass = (category: string) => {
  const classes: Record<string, string> = {
    Development: 'bg-blue-100 text-blue-800',
    Design: 'bg-purple-100 text-purple-800',
    Network: 'bg-green-100 text-green-800',
    Hardware: 'bg-orange-100 text-orange-800',
    Database: 'bg-indigo-100 text-indigo-800',
    Security: 'bg-red-100 text-red-800',
    Other: 'bg-gray-100 text-gray-800',
  }
  return `${classes[category] || 'bg-gray-100 text-gray-800'} rounded-full px-3 py-1 text-xs font-bold`
}

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

// API Actions
const fetchSkills = async () => {
  loading.value = true
  try {
    const res = await api.get('/skills')
    if (res.data.success) {
      skills.value = res.data.data
    }
  } catch (err) {
    console.error('Gagal load skills', err)
    alert('Gagal memuat data skill')
  } finally {
    loading.value = false
  }
}

const submitForm = async () => {
  if (!form.skill_name || !form.skill_description || !form.kategori) {
    alert('Semua field harus diisi!')
    return
  }

  submitting.value = true
  try {
    if (modalMode.value === 'create') {
      const res = await api.post('/skills', form)
      if (res.data.success) {
        alert('Skill berhasil ditambahkan!')
        await fetchSkills()
        closeModal()
      }
    } else {
      const res = await api.put(`/skills/${selectedSkill.value?.id}`, form)
      if (res.data.success) {
        alert('Skill berhasil diperbarui!')
        await fetchSkills()
        closeModal()
      }
    }
  } catch (err: any) {
    alert(err.response?.data?.message || 'Gagal menyimpan data')
  } finally {
    submitting.value = false
  }
}

const confirmDelete = async (skill: Skill) => {
  if (!confirm(`Yakin ingin menghapus skill "${skill.skill_name}"?`)) return

  try {
    const res = await api.delete(`/skills/${skill.id}`)
    if (res.data.success) {
      alert('Skill berhasil dihapus!')
      await fetchSkills()
    }
  } catch (err: any) {
    alert(err.response?.data?.message || 'Gagal menghapus skill')
  }
}

// Modal Handlers
const openCreateModal = () => {
  modalMode.value = 'create'
  resetForm()
  showModal.value = true
}

const openEditModal = (skill: Skill) => {
  modalMode.value = 'edit'
  selectedSkill.value = skill
  form.skill_name = skill.skill_name
  form.skill_description = skill.skill_description
  form.kategori = skill.kategori
  showModal.value = true
}

const openDetailModal = (skill: Skill) => {
  selectedSkill.value = skill
  showDetailModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedSkill.value = null
  resetForm()
}

const closeDetailModal = () => {
  showDetailModal.value = false
  selectedSkill.value = null
}

const resetForm = () => {
  form.skill_name = ''
  form.skill_description = ''
  form.kategori = ''
}

onMounted(() => {
  fetchSkills()
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
