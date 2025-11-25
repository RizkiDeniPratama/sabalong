<template>
  <AdminLayout>
    <div class="p-4 md:p-6 2xl:p-10">
      <h1 class="text-2xl font-bold text-gray-800 dark:text-white mb-4">Manajemen Layanan</h1>

      <div class="mb-4">
        <button
          @click="openModal"
          class="px-4 py-2 font-medium text-white transition rounded-lg bg-brand-500 hover:bg-brand-600"
        >
          + Tambah Layanan Baru
        </button>
      </div>

      <div v-if="loading.services" class="text-center text-gray-500 dark:text-gray-400 py-10">
        Memuat data layanan...
      </div>
      <div
        v-if="error.services"
        class="p-4 mb-4 text-red-700 bg-red-100 rounded-lg dark:bg-red-900/20 dark:text-red-400"
      >
        <p><b>Error:</b> {{ error.services }}</p>
      </div>

      <div
        v-if="!loading.services && !error.services"
        class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
      >
        <div class="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-700 dark:text-gray-300">Show</span>
              <select
                v-model="perPage"
                class="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
              >
                <option :value="5">5</option>
                <option :value="10">10</option>
                <option :value="25">25</option>
                <option :value="50">50</option>
              </select>
              <span class="text-sm text-gray-700 dark:text-gray-300">entries</span>
            </div>

            <div class="relative">
              <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg
                  class="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Cari layanan atau kategori..."
                class="pl-10 pr-4 py-2 w-full md:w-64 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
              />
            </div>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full">
            <thead
              class="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700"
            >
              <tr>
                <th
                  class="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider"
                >
                  Nama Layanan
                </th>
                <th
                  class="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider"
                >
                  Kategori
                </th>
                <th
                  class="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider"
                >
                  SLA
                </th>
                <th
                  class="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider"
                >
                  Prioritas
                </th>
                <th
                  class="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  class="px-4 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider"
                >
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr
                v-for="service in paginatedServices"
                :key="service.id"
                class="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
              >
                <td class="px-4 py-4 text-sm font-medium text-gray-800 dark:text-white">
                  {{ service.nama_layanan }}
                </td>
                <td class="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                  <span
                    class="px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-xs border border-gray-200 dark:border-gray-600"
                  >
                    {{ service.kategori }}
                  </span>
                </td>
                <td class="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                  {{ service.sla ? service.sla.sla_name : '-' }}
                </td>
                <td class="px-4 py-4 text-sm">
                  <span :class="getPriorityBadgeClass(service.default_priority)">
                    {{ service.default_priority }}
                  </span>
                </td>
                <td class="px-4 py-4">
                  <span
                    :class="[
                      'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
                      service.is_active
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
                    ]"
                  >
                    {{ service.is_active ? 'Aktif' : 'Non-Aktif' }}
                  </span>
                </td>
                <td class="px-4 py-4">
                  <div class="flex items-center justify-center gap-2">
                    <button
                      @click="handleDetail(service)"
                      class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
                      title="Detail"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                      @click="handleEdit(service)"
                      class="p-2 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                      title="Edit"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      @click="handleDelete(service)"
                      class="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                      title="Hapus"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <tr v-if="paginatedServices.length === 0">
                <td colspan="6" class="px-4 py-12 text-center text-gray-500 dark:text-gray-400">
                  <p class="text-sm font-medium">Tidak ada layanan ditemukan</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div class="text-sm text-gray-600 dark:text-gray-400">
              Showing {{ startIndex + 1 }} to {{ Math.min(endIndex, filteredServices.length) }} of
              {{ filteredServices.length }} entries
            </div>
            <div class="flex items-center gap-1">
              <button
                @click="previousPage"
                :disabled="currentPage === 1"
                :class="[
                  'px-3 py-2 text-sm font-medium rounded-lg',
                  currentPage === 1
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700',
                ]"
              >
                Previous
              </button>
              <button
                v-for="page in visiblePages"
                :key="page"
                @click="goToPage(page)"
                :class="[
                  'px-3 py-2 text-sm font-medium rounded-lg',
                  currentPage === page
                    ? 'bg-brand-500 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700',
                ]"
              >
                {{ page }}
              </button>
              <button
                @click="nextPage"
                :disabled="currentPage === totalPages"
                :class="[
                  'px-3 py-2 text-sm font-medium rounded-lg',
                  currentPage === totalPages
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700',
                ]"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showModal"
          class="fixed inset-0 z-[999999] flex items-center justify-center p-4"
          @click.self="closeModal"
        >
          <div class="absolute inset-0 bg-gray-900/20 backdrop-blur-sm"></div>
          <div
            class="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl"
          >
            <div
              class="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            >
              <h2 class="text-xl font-semibold text-gray-800 dark:text-white">
                {{
                  modalMode === 'create'
                    ? 'Tambah Layanan Baru'
                    : modalMode === 'edit'
                      ? 'Edit Layanan'
                      : 'Detail Layanan'
                }}
              </h2>
              <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div class="p-6">
              <div v-if="modalMode === 'detail' && selectedService" class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Nama Layanan
                    </h3>
                    <p class="mt-1 text-lg font-semibold text-gray-800 dark:text-white">
                      {{ selectedService.nama_layanan }}
                    </p>
                  </div>
                  <div>
                    <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Kategori</h3>
                    <p class="mt-1 text-gray-800 dark:text-white">{{ selectedService.kategori }}</p>
                  </div>
                  <div class="col-span-1 md:col-span-2">
                    <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Deskripsi</h3>
                    <p class="mt-1 text-gray-800 dark:text-white whitespace-pre-line">
                      {{ selectedService.deskripsi }}
                    </p>
                  </div>
                  <div>
                    <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">
                      SLA (Service Level Agreement)
                    </h3>
                    <div
                      class="mt-1 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900/50"
                    >
                      <p class="font-medium text-blue-800 dark:text-blue-300">
                        {{ selectedService.sla?.sla_name }}
                      </p>
                      <p class="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        Response: {{ selectedService.sla?.response_hours }} jam | Resolution:
                        {{ selectedService.sla?.resolution_hours }} jam
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Prioritas Default
                    </h3>
                    <p class="mt-1 uppercase font-medium text-gray-800 dark:text-white">
                      {{ selectedService.default_priority }}
                    </p>
                  </div>
                </div>

                <div v-if="selectedService.skills && selectedService.skills.length > 0">
                  <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                    Skill yang Dibutuhkan
                  </h3>
                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="s in selectedService.skills"
                      :key="s.id"
                      class="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm border border-gray-200 dark:border-gray-600"
                    >
                      {{ s.skill.skill_name }}
                    </span>
                  </div>
                </div>
              </div>

              <form v-else @submit.prevent="saveChanges" class="space-y-5">
                <div v-if="error.form" class="p-4 text-sm text-red-700 bg-red-100 rounded-lg">
                  {{ error.form }}
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >Nama Layanan <span class="text-red-500">*</span></label
                    >
                    <input
                      v-model="formData.nama_layanan"
                      type="text"
                      required
                      class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="Contoh: Perbaikan Jaringan"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >Kategori <span class="text-red-500">*</span></label
                    >
                    <input
                      v-model="formData.kategori"
                      type="text"
                      required
                      class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="Contoh: Infrastructure"
                    />
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >Deskripsi</label
                  >
                  <textarea
                    v-model="formData.deskripsi"
                    rows="3"
                    class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Jelaskan detail layanan ini..."
                  ></textarea>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >SLA <span class="text-red-500">*</span></label
                    >
                    <select
                      v-model="formData.sla_id"
                      required
                      class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option disabled value="">Pilih SLA</option>
                      <option v-for="sla in availableSLAs" :key="sla.id" :value="sla.id">
                        {{ sla.sla_name }} ({{ sla.response_hours }}h / {{ sla.resolution_hours }}h)
                      </option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >Default Priority</label
                    >
                    <select
                      v-model="formData.default_priority"
                      class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div
                  class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >Status Aktif</label
                    >
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Layanan ini dapat dipilih oleh user
                    </p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input v-model="formData.is_active" type="checkbox" class="sr-only peer" />
                    <div
                      class="w-11 h-6 bg-gray-300 peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"
                    ></div>
                  </label>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3"
                    >Keahlian yang Dibutuhkan (Required Skills)</label
                  >
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div
                      v-for="skill in availableSkills"
                      :key="skill.id"
                      class="flex items-start gap-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                      @click="toggleSkill(skill.id)"
                    >
                      <input
                        type="checkbox"
                        :checked="formData.skill_ids.includes(skill.id)"
                        class="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <div>
                        <span class="block text-sm font-medium text-gray-800 dark:text-white">{{
                          skill.skill_name
                        }}</span>
                        <span class="text-xs text-gray-500">{{ skill.kategori }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <div
              class="sticky bottom-0 flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            >
              <button
                @click="closeModal"
                type="button"
                class="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
              >
                {{ modalMode === 'detail' ? 'Tutup' : 'Batal' }}
              </button>
              <button
                v-if="modalMode !== 'detail'"
                @click="saveChanges"
                :disabled="loading.submit"
                type="button"
                class="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm disabled:opacity-50"
              >
                {{
                  loading.submit
                    ? 'Menyimpan...'
                    : modalMode === 'create'
                      ? 'Tambah Layanan'
                      : 'Simpan Perubahan'
                }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, reactive } from 'vue'
import AdminLayout from '../../components/layout/AdminLayout.vue'
import api from '../../services/api'

// --- DATA TYPES ---
interface SLA {
  id: number
  sla_name: string
  response_hours: number
  resolution_hours: number
  description: string
}

interface Skill {
  id: number
  skill_name: string
  skill_description: string
  kategori: string
}

interface ServiceSkill {
  id: number
  service_id: number
  skill_id: number
  skill: Skill
}

interface Service {
  id: number
  nama_layanan: string
  deskripsi: string
  kategori: string
  sla_id: number
  default_priority: 'low' | 'medium' | 'high' | 'critical'
  is_active: boolean
  icon: string | null
  sla?: SLA
  skills?: ServiceSkill[]
}

interface FormData {
  nama_layanan: string
  deskripsi: string
  kategori: string
  sla_id: number | ''
  default_priority: string
  is_active: boolean
  skill_ids: number[]
}

// --- COMPONENT STATE ---
const allServices = ref<Service[]>([])
const availableSkills = ref<Skill[]>([])
const availableSLAs = ref<SLA[]>([])

const searchQuery = ref('')
const perPage = ref(10)
const currentPage = ref(1)

const loading = reactive({
  services: true,
  masters: true,
  submit: false,
})
const error = reactive<{ services: string | null; masters: string | null; form: any | null }>({
  services: null,
  masters: null,
  form: null,
})

const showModal = ref(false)
const modalMode = ref<'create' | 'edit' | 'detail'>('create')
const selectedService = ref<Service | null>(null)

// --- FORM ---
const createDefaultFormData = (): FormData => ({
  nama_layanan: '',
  deskripsi: '',
  kategori: '',
  sla_id: '',
  default_priority: 'medium',
  is_active: true,
  skill_ids: [],
})
const formData = ref<FormData>(createDefaultFormData())

// --- COMPUTED PROPERTIES ---
const filteredServices = computed(() => {
  let services = allServices.value
  if (!searchQuery.value) return services
  const query = searchQuery.value.toLowerCase()
  return services.filter(
    (svc) =>
      svc.nama_layanan.toLowerCase().includes(query) || svc.kategori.toLowerCase().includes(query),
  )
})

const totalPages = computed(() => Math.ceil(filteredServices.value.length / perPage.value))
const startIndex = computed(() => (currentPage.value - 1) * perPage.value)
const endIndex = computed(() => startIndex.value + perPage.value)
const paginatedServices = computed(() =>
  filteredServices.value.slice(startIndex.value, endIndex.value),
)

const visiblePages = computed(() => {
  const pages: (number | string)[] = []
  const maxVisible = 5
  if (totalPages.value <= maxVisible) {
    for (let i = 1; i <= totalPages.value; i++) pages.push(i)
  } else {
    pages.push(1)
    if (currentPage.value > 3) pages.push('...')
    let start = Math.max(2, currentPage.value - 1)
    let end = Math.min(totalPages.value - 1, currentPage.value + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    if (currentPage.value < totalPages.value - 2) pages.push('...')
    pages.push(totalPages.value)
  }
  return pages
})

const getPriorityBadgeClass = (priority: string) => {
  const classes = 'inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium capitalize '
  switch (priority.toLowerCase()) {
    case 'low':
      return classes + 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    case 'medium':
      return classes + 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
    case 'high':
      return classes + 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
    case 'critical':
      return classes + 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    default:
      return classes + 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  }
}

// --- API & DATA FETCHING ---
const fetchServices = async () => {
  loading.services = true
  error.services = null
  try {
    const response = await api.get('/services')
    allServices.value = response.data.data
  } catch (err) {
    error.services = 'Gagal memuat data layanan.'
  } finally {
    loading.services = false
  }
}

const fetchMasterData = async () => {
  loading.masters = true
  error.masters = null
  try {
    // Asumsi endpoint untuk SLA adalah /sla atau /slas
    const [slaRes, skillsRes] = await Promise.all([api.get('/slas'), api.get('/skills')])
    availableSLAs.value = slaRes.data.data
    availableSkills.value = skillsRes.data.data
  } catch (err) {
    error.masters = 'Gagal memuat data SLA & skills.'
    console.error(err)
  } finally {
    loading.masters = false
  }
}

onMounted(() => {
  fetchServices()
  fetchMasterData()
})

// --- MODAL & FORM ACTIONS ---
const openModal = () => {
  modalMode.value = 'create'
  formData.value = createDefaultFormData()
  error.form = null
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedService.value = null
}

const handleDetail = (service: Service) => {
  modalMode.value = 'detail'
  selectedService.value = service
  showModal.value = true
}

const handleEdit = (service: Service) => {
  modalMode.value = 'edit'
  selectedService.value = service
  error.form = null
  formData.value = {
    nama_layanan: service.nama_layanan,
    deskripsi: service.deskripsi,
    kategori: service.kategori,
    sla_id: service.sla_id,
    default_priority: service.default_priority,
    is_active: service.is_active,
    skill_ids: service.skills?.map((s) => s.skill_id) || [],
  }
  showModal.value = true
}

const toggleSkill = (skillId: number) => {
  const index = formData.value.skill_ids.indexOf(skillId)
  if (index > -1) {
    formData.value.skill_ids.splice(index, 1)
  } else {
    formData.value.skill_ids.push(skillId)
  }
}

// --- CRUD ACTIONS ---
const saveChanges = async () => {
  loading.submit = true
  error.form = null

  // Payload sesuai struktur backend
  const payload = {
    nama_layanan: formData.value.nama_layanan,
    deskripsi: formData.value.deskripsi,
    kategori: formData.value.kategori,
    sla_id: formData.value.sla_id,
    default_priority: formData.value.default_priority,
    is_active: formData.value.is_active,
    skill_ids: formData.value.skill_ids, // Array of numbers
  }

  try {
    if (modalMode.value === 'create') {
      const response = await api.post('/services', payload)
      alert('Berhasil! Layanan baru telah ditambahkan.')
      allServices.value.unshift(response.data.data)
    } else if (modalMode.value === 'edit' && selectedService.value) {
      const response = await api.put(`/services/${selectedService.value.id}`, payload)
      alert('Berhasil! Data layanan telah diperbarui.')
      // Update data di list local
      const index = allServices.value.findIndex((s) => s.id === selectedService.value!.id)
      if (index !== -1) {
        // Merge response data dengan SLA object yang mungkin tidak dikembalikan lengkap oleh PUT
        // Tips: Idealnya refresh list, tapi untuk cepat kita update manual jika strukturnya sama
        allServices.value[index] = response.data.data

        // Fetch ulang supaya relasi SLA tampil benar jika backend hanya return ID
        fetchServices()
      }
    }
    closeModal()
  } catch (err: any) {
    const message = err.response?.data?.message || 'Terjadi kesalahan pada server.'
    error.form = message
    console.error('Gagal menyimpan:', err)
  } finally {
    loading.submit = false
  }
}

const handleDelete = async (service: Service) => {
  if (confirm(`Apakah Anda yakin ingin menghapus layanan "${service.nama_layanan}"?`)) {
    try {
      await api.delete(`/services/${service.id}`)
      allServices.value = allServices.value.filter((s) => s.id !== service.id)
    } catch (err: any) {
      alert('Gagal menghapus: ' + (err.response?.data?.message || err.message))
    }
  }
}

// --- PAGINATION HELPERS ---
const previousPage = () => {
  if (currentPage.value > 1) currentPage.value--
}
const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}
const goToPage = (page: number | string) => {
  if (typeof page === 'number') currentPage.value = page
}

watch([perPage, searchQuery], () => (currentPage.value = 1))
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
