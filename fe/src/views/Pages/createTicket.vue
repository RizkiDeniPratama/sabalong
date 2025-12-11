<template>
  <AdminLayout>
    <div class="mx-auto max-w-3xl p-4 md:p-10">
      <div class="mb-6">
        <button
          @click="$router.back()"
          class="mb-4 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Batal & Kembali
        </button>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Buat Tiket Baru</h1>
        <p class="text-gray-500 dark:text-gray-400">
          Jelaskan kendala Anda, kami akan segera menanganinya.
        </p>
      </div>

      <div
        class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
      >
        <form @submit.prevent="submitTicket" class="space-y-6">
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
              >Layanan <span class="text-red-500">*</span></label
            >
            <select
              v-model="form.service_id"
              required
              class="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-sm focus:border-brand-500 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            >
              <option value="" disabled>-- Pilih Layanan --</option>
              <option v-for="service in services" :key="service.id" :value="service.id">
                {{ service.nama_layanan }} ({{ service.kategori }})
              </option>
            </select>
            <p
              v-if="selectedServiceDesc"
              class="mt-2 text-xs text-gray-500 bg-blue-50 p-2 rounded border border-blue-100 dark:bg-blue-900/20 dark:border-blue-800 dark:text-gray-400"
            >
              {{ selectedServiceDesc }}
            </p>
          </div>

          <div>
            <label class="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
              >Judul Permohonan <span class="text-red-500">*</span></label
            >
            <input
              v-model="form.judul_permohonan"
              type="text"
              required
              placeholder="Contoh: Internet mati di ruang rapat"
              class="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-sm focus:border-brand-500 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label class="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
              >Deskripsi Detail <span class="text-red-500">*</span></label
            >
            <textarea
              v-model="form.deskripsi"
              rows="4"
              required
              placeholder="Jelaskan detail masalah, lokasi, dan waktu kejadian..."
              class="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-sm focus:border-brand-500 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            ></textarea>
          </div>

          <div>
            <label class="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
              >Lampiran (Opsional)</label
            >

            <div class="flex gap-4 border-b border-gray-200 dark:border-gray-700 mb-4">
              <button
                type="button"
                @click="attachmentMode = 'file'"
                :class="[
                  'pb-2 text-sm font-medium transition-colors',
                  attachmentMode === 'file'
                    ? 'border-b-2 border-brand-600 text-brand-600 dark:text-brand-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400',
                ]"
              >
                Upload File
              </button>
              <button
                type="button"
                @click="attachmentMode = 'link'"
                :class="[
                  'pb-2 text-sm font-medium transition-colors',
                  attachmentMode === 'link'
                    ? 'border-b-2 border-brand-600 text-brand-600 dark:text-brand-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400',
                ]"
              >
                Tautan Link
              </button>
            </div>

            <div v-if="attachmentMode === 'file'">
              <div class="flex items-center justify-center w-full">
                <label
                  for="dropzone-file"
                  class="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500"
                >
                  <div class="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg
                      v-if="!selectedFile"
                      class="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 20 16"
                    >
                      <path
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                      />
                    </svg>
                    <p v-if="!selectedFile" class="mb-2 text-sm text-gray-500 dark:text-gray-400">
                      <span class="font-semibold">Klik untuk upload</span> atau drag and drop
                    </p>
                    <p v-if="!selectedFile" class="text-xs text-gray-500 dark:text-gray-400">
                      SVG, PNG, JPG or PDF (MAX. 5MB)
                    </p>

                    <div v-else class="text-center">
                      <p class="text-sm font-bold text-brand-600 dark:text-brand-400">
                        {{ selectedFile.name }}
                      </p>
                      <p class="text-xs text-gray-500">
                        {{ (selectedFile.size / 1024 / 1024).toFixed(2) }} MB
                      </p>
                    </div>
                  </div>
                  <input
                    id="dropzone-file"
                    type="file"
                    class="hidden"
                    @change="handleFileChange"
                    accept="image/*,.pdf"
                  />
                </label>
              </div>
            </div>

            <div v-if="attachmentMode === 'link'">
              <input
                v-model="form.attachmentLink"
                type="url"
                placeholder="https://drive.google.com/..."
                class="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-sm focus:border-brand-500 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
              <p class="mt-1 text-xs text-gray-400">
                Masukkan link Google Drive, Dropbox, atau OneDrive.
              </p>
            </div>
          </div>

          <div
            class="pt-4 flex items-center justify-end gap-4 border-t border-gray-100 dark:border-gray-800"
          >
            <button
              type="button"
              @click="$router.back()"
              class="rounded-lg px-6 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50 transition-all shadow-lg hover:shadow-brand-500/30"
            >
              <svg v-if="loading" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>Kirim Tiket</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AdminLayout from '../../components/layout/AdminLayout.vue'
import api from '@/services/api'

const router = useRouter()
const route = useRoute()

const services = ref<any[]>([])
const loading = ref(false)
const attachmentMode = ref<'file' | 'link'>('file')
const selectedFile = ref<File | null>(null)

const form = reactive({
  service_id: '',
  judul_permohonan: '',
  deskripsi: '',
  attachmentLink: '',
})

const selectedServiceDesc = computed(() => {
  const s = services.value.find((svc: any) => svc.id === form.service_id)
  return s ? s.deskripsi : ''
})

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0]
  }
}

const fetchServices = async () => {
  try {
    const res = await api.get('/services')
    if (res.data.success) {
      services.value = res.data.data.filter((s: any) => s.is_active)

      if (route.query.service_id) {
        const targetId = Number(route.query.service_id)
        if (services.value.some((s: any) => s.id === targetId)) {
          form.service_id = targetId as any
        }
      }
    }
  } catch (e) {
    console.error(e)
  }
}

// Submit Logic (Smart Handler)
// const submitTicket = async () => {
//   loading.value = true

//   try {
//     let payload: any
//     let headers = {}

//     // LOGIKA: Jika Mode File & Ada File -> Pakai FormData
//     if (attachmentMode.value === 'file' && selectedFile.value) {
//       const formData = new FormData()
//       formData.append('service_id', form.service_id)
//       formData.append('judul_permohonan', form.judul_permohonan)
//       formData.append('deskripsi', form.deskripsi)
//       formData.append('attachment', selectedFile.value) // Backend harus handle 'attachment' sebagai file

//       payload = formData
//       headers = { 'Content-Type': 'multipart/form-data' }
//     }
//     // LOGIKA: Jika Mode Link atau Tidak Ada Lampiran -> Pakai JSON biasa
//     else {
//       payload = {
//         service_id: form.service_id,
//         judul_permohonan: form.judul_permohonan,
//         deskripsi: form.deskripsi,
//         attachment: attachmentMode.value === 'link' ? form.attachmentLink : null,
//       }
//       // Headers default axios biasanya sudah application/json
//     }

//     // Kirim Request
//     const res = await api.post('/tickets', payload, { headers })

//     if (res.data.success) {
//       router.push(`/tickets/${res.data.data.id}`)
//     }
//   } catch (err: any) {
//     console.error('ini adalah error', err)
//     const msg = err.response?.data?.message || 'Gagal membuat tiket'
//     alert(msg)
//   } finally {
//     loading.value = false
//   }
// }
// Perbaikan pada fungsi submitTicket
const submitTicket = async () => {
  loading.value = true

  try {
    let payload: any
    let config = {}

    if (attachmentMode.value === 'file' && selectedFile.value) {
      const formData = new FormData()

      formData.append('service_id', String(form.service_id))
      formData.append('judul_permohonan', form.judul_permohonan)
      formData.append('deskripsi', form.deskripsi)
      formData.append('attachment', selectedFile.value)

      payload = formData
    } else {
      payload = {
        service_id: form.service_id,
        judul_permohonan: form.judul_permohonan,
        deskripsi: form.deskripsi,
        attachment:
          attachmentMode.value === 'link' && form.attachmentLink ? form.attachmentLink : null,
      }
    }

    console.log('Mengirim Payload:', payload)

    const res = await api.post('/tickets', payload, config)

    if (res.data.success) {
      alert('Tiket berhasil dibuat!')
      router.push(`/detail-ticket/${res.data.data.id}`)
    }
  } catch (err: any) {
    console.group('DEBUG ERROR TIKET')
    console.error('Error Object:', err)
    console.error('Response Server:', err.response)
    console.error('Data Response:', err.response?.data)
    console.groupEnd()

    const serverMessage = err.response?.data?.message || err.response?.data?.error || err.message
    console.log(serverMessage)

    alert(`Gagal membuat tiket: ${serverMessage}`)
  } finally {
    loading.value = false
  }
}

onMounted(() => fetchServices())
</script>
