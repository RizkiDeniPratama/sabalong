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
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Cari layanan..."
                class="pl-4 pr-4 py-2 w-full md:w-64 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-brand-500"
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
                  class="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400"
                >
                  Icon
                </th>
                <th
                  class="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400"
                >
                  Nama Layanan
                </th>
                <th
                  class="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400"
                >
                  Kategori
                </th>
                <th
                  class="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400"
                >
                  SLA
                </th>
                <th
                  class="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400"
                >
                  Status
                </th>
                <th
                  class="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-500 dark:text-gray-400"
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
                <td class="px-4 py-4">
                  <div
                    class="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-600"
                  >
                    <img
                      v-if="service.icon"
                      :src="getFileUrl(service.icon)"
                      alt="Icon"
                      class="h-full w-full object-cover"
                    />
                    <span v-else class="text-xs text-gray-400">No Icon</span>
                  </div>
                </td>
                <td class="px-4 py-4 text-sm font-medium text-gray-900 dark:text-white">
                  {{ service.nama_layanan }}
                </td>
                <td class="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                  {{ service.kategori }}
                </td>
                <td class="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                  {{ service.sla?.sla_name || '-' }}
                </td>
                <td class="px-4 py-4">
                  <span
                    :class="[
                      'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
                      service.is_active
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                    ]"
                  >
                    {{ service.is_active ? 'Aktif' : 'Non-Aktif' }}
                  </span>
                </td>
                <td class="px-4 py-4 text-center">
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
            </tbody>
          </table>
        </div>

        <div
          class="px-4 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center"
        >
          <span class="text-sm text-gray-500 dark:text-gray-400"
            >Hal {{ currentPage }} dari {{ totalPages }}</span
          >
          <div class="flex gap-2">
            <button
              @click="previousPage"
              :disabled="currentPage === 1"
              class="px-3 py-1 border rounded text-sm hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-gray-300"
            >
              Prev
            </button>
            <button
              @click="nextPage"
              :disabled="currentPage === totalPages"
              class="px-3 py-1 border rounded text-sm hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-gray-300"
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
          v-if="showModal"
          class="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm"
          @click.self="closeModal"
        >
          <div
            class="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl"
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
              <button
                @click="closeModal"
                class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <div class="p-6 space-y-6">
              <div v-if="modalMode === 'detail' && selectedService" class="space-y-8">
                <div class="flex flex-col md:flex-row gap-6">
                  <div class="flex-shrink-0">
                    <div
                      class="w-24 h-24 rounded-2xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center overflow-hidden"
                    >
                      <img
                        v-if="selectedService.icon"
                        :src="getFileUrl(selectedService.icon)"
                        alt="Icon"
                        class="h-full w-full object-cover"
                      />
                      <div v-else class="text-center p-2">
                        <svg
                          class="w-8 h-8 text-gray-300 mx-auto"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span class="text-[10px] text-gray-400">No Icon</span>
                      </div>
                    </div>
                  </div>

                  <div class="flex-1 space-y-3">
                    <div>
                      <h3 class="text-lg font-bold text-gray-900 dark:text-white">
                        {{ selectedService.nama_layanan }}
                      </h3>
                      <span
                        class="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                      >
                        {{ selectedService.kategori }}
                      </span>
                    </div>

                    <p class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                      {{ selectedService.deskripsi || 'Tidak ada deskripsi.' }}
                    </p>

                    <div class="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <div class="flex items-center gap-1">
                        <span class="font-semibold text-gray-700 dark:text-gray-200"
                          >Prioritas:</span
                        >
                        <span class="uppercase">{{ selectedService.default_priority }}</span>
                      </div>
                      <div class="flex items-center gap-1">
                        <span class="font-semibold text-gray-700 dark:text-gray-200">Status:</span>
                        <span
                          :class="selectedService.is_active ? 'text-green-600' : 'text-red-600'"
                          >{{ selectedService.is_active ? 'Aktif' : 'Non-Aktif' }}</span
                        >
                      </div>
                    </div>
                  </div>
                </div>

                <hr class="border-gray-100 dark:border-gray-700" />

                <div>
                  <h4
                    class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-4"
                  >
                    Dokumen & Alur
                  </h4>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                      class="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/20"
                    >
                      <div class="flex justify-between items-start mb-2">
                        <span class="text-xs font-semibold text-gray-500 uppercase"
                          >Flowchart Alur</span
                        >
                        <a
                          v-if="selectedService.flowchart"
                          :href="getFileUrl(selectedService.flowchart)"
                          target="_blank"
                          class="text-xs text-blue-600 hover:underline"
                          >Lihat Full</a
                        >
                      </div>
                      <div
                        v-if="selectedService.flowchart"
                        class="h-32 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600 overflow-hidden flex items-center justify-center cursor-pointer group"
                      >
                        <img
                          :src="getFileUrl(selectedService.flowchart)"
                          class="h-full w-full object-contain group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div
                        v-else
                        class="h-32 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded border border-dashed border-gray-300 dark:border-gray-600 text-gray-400 text-xs"
                      >
                        Belum ada gambar alur
                      </div>
                    </div>

                    <div
                      class="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/20"
                    >
                      <span class="text-xs font-semibold text-gray-500 uppercase block mb-2"
                        >Standar Operasional (SOP)</span
                      >

                      <div
                        v-if="selectedService.sop && selectedService.sop.startsWith('/uploads')"
                        class="flex flex-col items-center justify-center h-32 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600"
                      >
                        <svg
                          class="w-10 h-10 text-red-500 mb-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                          />
                        </svg>
                        <span class="text-xs text-gray-600 dark:text-gray-300 mb-2 font-medium"
                          >Dokumen SOP Tersedia</span
                        >
                        <a
                          :href="getFileUrl(selectedService.sop)"
                          target="_blank"
                          class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition shadow-sm"
                          >Download PDF</a
                        >
                      </div>

                      <div
                        v-else-if="selectedService.sop"
                        class="h-32 overflow-y-auto bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line"
                      >
                        {{ selectedService.sop }}
                      </div>

                      <div
                        v-else
                        class="h-32 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded border border-dashed border-gray-300 dark:border-gray-600 text-gray-400 text-xs"
                      >
                        Belum ada SOP
                      </div>
                    </div>
                  </div>
                </div>

                <hr class="border-gray-100 dark:border-gray-700" />

                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4
                      class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-3"
                    >
                      Target SLA
                    </h4>
                    <div
                      class="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-4 rounded-xl"
                    >
                      <div class="flex justify-between items-center mb-2">
                        <span class="text-xs font-semibold text-blue-600 dark:text-blue-300"
                          >Paket SLA</span
                        >
                        <span class="text-sm font-bold text-gray-900 dark:text-white">{{
                          selectedService.sla?.sla_name || 'Default'
                        }}</span>
                      </div>
                      <div class="flex gap-4 text-sm">
                        <div
                          class="flex-1 bg-white dark:bg-gray-800 p-2 rounded border border-blue-100 dark:border-blue-800 text-center"
                        >
                          <span class="block text-xs text-gray-500">Respon</span>
                          <span class="font-bold text-gray-800 dark:text-white"
                            >{{ selectedService.sla?.response_hours || 0 }} Jam</span
                          >
                        </div>
                        <div
                          class="flex-1 bg-white dark:bg-gray-800 p-2 rounded border border-blue-100 dark:border-blue-800 text-center"
                        >
                          <span class="block text-xs text-gray-500">Penyelesaian</span>
                          <span class="font-bold text-gray-800 dark:text-white"
                            >{{ selectedService.sla?.resolution_hours || 0 }} Jam</span
                          >
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4
                      class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-3"
                    >
                      Keahlian Dibutuhkan
                    </h4>
                    <div
                      v-if="selectedService.skills && selectedService.skills.length > 0"
                      class="flex flex-wrap gap-2"
                    >
                      <span
                        v-for="s in selectedService.skills"
                        :key="s.id"
                        class="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-medium border border-gray-200 dark:border-gray-600"
                      >
                        {{ s.skill.skill_name }}
                      </span>
                    </div>
                    <p v-else class="text-sm text-gray-500 italic">Tidak ada skill khusus.</p>
                  </div>
                </div>
              </div>
              <form v-else @submit.prevent="saveChanges" class="space-y-6">
                <div
                  v-if="error.form"
                  class="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                >
                  {{ error.form }}
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
                      >Nama Layanan <span class="text-red-500">*</span></label
                    >
                    <input
                      v-model="formData.nama_layanan"
                      type="text"
                      required
                      class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="Contoh: Perbaikan Jaringan"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
                      >Kategori <span class="text-red-500">*</span></label
                    >
                    <input
                      v-model="formData.kategori"
                      type="text"
                      required
                      class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="Contoh: Infrastructure"
                    />
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
                    >Deskripsi</label
                  >
                  <textarea
                    v-model="formData.deskripsi"
                    rows="3"
                    class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white resize-none"
                    placeholder="Jelaskan detail layanan ini..."
                  ></textarea>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
                      >SLA (Standar Layanan) <span class="text-red-500">*</span></label
                    >
                    <select
                      v-model="formData.sla_id"
                      required
                      class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                      <option disabled value="">Pilih SLA</option>
                      <option v-for="sla in availableSLAs" :key="sla.id" :value="sla.id">
                        {{ sla.sla_name }} ({{ sla.response_hours }}h / {{ sla.resolution_hours }}h)
                      </option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
                      >Prioritas Default</label
                    >
                    <select
                      v-model="formData.default_priority"
                      class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div
                  class="p-4 bg-gray-50 rounded-xl border border-gray-200 dark:bg-gray-700/30 dark:border-gray-700"
                >
                  <h3
                    class="text-sm font-bold text-gray-700 dark:text-gray-200 mb-4 uppercase tracking-wide"
                  >
                    File Pendukung
                  </h3>

                  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label class="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400"
                        >Icon Layanan (Image)</label
                      >
                      <input
                        type="file"
                        @change="handleFileUpload($event, 'icon')"
                        accept="image/*"
                        class="block w-full cursor-pointer text-sm text-gray-500 file:mr-4 file:px-4 file:py-2 file:rounded-full file:border-0 file:bg-brand-50 file:text-xs file:font-semibold file:text-brand-700 hover:file:bg-brand-100 dark:file:bg-gray-600 dark:file:text-gray-300"
                      />
                      <p
                        v-if="selectedService?.icon"
                        class="text-[10px] text-blue-500 mt-1 truncate"
                      >
                        File saat ini: {{ getFileName(selectedService.icon) }}
                      </p>
                    </div>
                    <div>
                      <label class="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400"
                        >Flowchart Alur (Image)</label
                      >
                      <input
                        type="file"
                        @change="handleFileUpload($event, 'flowchart')"
                        accept="image/*"
                        class="block w-full cursor-pointer text-sm text-gray-500 file:mr-4 file:px-4 file:py-2 file:rounded-full file:border-0 file:bg-brand-50 file:text-xs file:font-semibold file:text-brand-700 hover:file:bg-brand-100 dark:file:bg-gray-600 dark:file:text-gray-300"
                      />
                      <p
                        v-if="selectedService?.flowchart"
                        class="text-[10px] text-blue-500 mt-1 truncate"
                      >
                        File saat ini: {{ getFileName(selectedService.flowchart) }}
                      </p>
                    </div>
                    <div>
                      <label class="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400"
                        >Dokumen SOP (PDF)</label
                      >
                      <input
                        type="file"
                        @change="handleFileUpload($event, 'sop_file')"
                        accept=".pdf"
                        class="block w-full cursor-pointer text-sm text-gray-500 file:mr-4 file:px-4 file:py-2 file:rounded-full file:border-0 file:bg-brand-50 file:text-xs file:font-semibold file:text-brand-700 hover:file:bg-brand-100 dark:file:bg-gray-600 dark:file:text-gray-300"
                      />
                      <p
                        v-if="selectedService?.sop && selectedService.sop.startsWith('/uploads')"
                        class="text-[10px] text-blue-500 mt-1 truncate"
                      >
                        File saat ini: {{ getFileName(selectedService.sop) }}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
                    >SOP (Teks Manual)</label
                  >
                  <textarea
                    v-model="formData.sop"
                    rows="3"
                    class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white resize-none"
                    placeholder="Atau tulis langkah-langkah SOP di sini jika tidak upload file PDF..."
                  ></textarea>
                </div>

                <div>
                  <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
                    >Skill yang Dibutuhkan <span class="text-red-500">*</span></label
                  >
                  <div
                    class="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-40 overflow-y-auto p-3 border rounded-lg bg-gray-50 dark:bg-gray-700/30 dark:border-gray-700"
                  >
                    <label
                      v-for="skill in availableSkills"
                      :key="skill.id"
                      class="flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded"
                    >
                      <input
                        type="checkbox"
                        :value="skill.id"
                        v-model="formData.skill_ids"
                        class="rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800"
                      />
                      <span class="text-sm text-gray-700 dark:text-gray-300">{{
                        skill.skill_name
                      }}</span>
                    </label>
                  </div>
                </div>

                <div
                  class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-700"
                >
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" v-model="formData.is_active" class="sr-only peer" />
                    <div
                      class="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-500"
                    ></div>
                    <span class="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300"
                      >Status Layanan Aktif</span
                    >
                  </label>
                </div>

                <div
                  class="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-700"
                >
                  <button
                    type="button"
                    @click="closeModal"
                    class="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    :disabled="loading.submit"
                    class="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-50"
                  >
                    {{ loading.submit ? 'Menyimpan...' : 'Simpan' }}
                  </button>
                </div>
              </form>
            </div>

            <div
              v-if="modalMode === 'detail'"
              class="sticky bottom-0 flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            >
              <button
                @click="closeModal"
                type="button"
                class="px-6 py-2.5 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg"
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
import { ref, reactive, onMounted, computed, watch } from 'vue'
import AdminLayout from '../../components/layout/AdminLayout.vue'
import api from '@/services/api'

// --- Interfaces ---
interface Service {
  id: number
  nama_layanan: string
  deskripsi: string
  kategori: string
  sla_id: number
  default_priority: string
  is_active: boolean
  icon: string | null
  flowchart: string | null
  sop: string | null
  sla?: any
  skills?: any[]
}

// --- State ---
const allServices = ref<Service[]>([])
const availableSkills = ref<any[]>([])
const availableSLAs = ref<any[]>([])
const searchQuery = ref('')
const perPage = ref(10)
const currentPage = ref(1)

const loading = reactive({ services: true, masters: true, submit: false })
const error = reactive({ services: '', form: '' })

// Modal State
const showModal = ref(false)
const modalMode = ref<'create' | 'edit' | 'detail'>('create')
const selectedService = ref<Service | null>(null)

// Form Data & Files
const formData = reactive({
  nama_layanan: '',
  deskripsi: '',
  kategori: '',
  sla_id: '' as string | number,
  default_priority: 'medium',
  is_active: true,
  sop: '',
  skill_ids: [] as number[],
})

const files = reactive({
  icon: null as File | null,
  flowchart: null as File | null,
  sop_file: null as File | null,
})

// --- API Actions ---
const fetchData = async () => {
  loading.services = true
  try {
    const [srv, skl, sla] = await Promise.all([
      api.get('/services'),
      api.get('/skills'),
      api.get('/slas'),
    ])
    if (srv.data.success) allServices.value = srv.data.data
    if (skl.data.success) availableSkills.value = skl.data.data
    if (sla.data.success) availableSLAs.value = sla.data.data
  } catch (e) {
    error.services = 'Gagal memuat data'
  } finally {
    loading.services = false
  }
}

// --- Handlers ---
const openModal = () => {
  modalMode.value = 'create'
  selectedService.value = null
  resetForm()
  showModal.value = true
}

const handleDetail = (service: Service) => {
  modalMode.value = 'detail'
  selectedService.value = service
  showModal.value = true
}

const handleEdit = (service: Service) => {
  modalMode.value = 'edit'
  selectedService.value = service

  // Populate Form
  formData.nama_layanan = service.nama_layanan
  formData.deskripsi = service.deskripsi
  formData.kategori = service.kategori
  formData.sla_id = service.sla_id
  formData.default_priority = service.default_priority
  formData.is_active = service.is_active
  // Cek apakah SOP itu text atau file path
  formData.sop = service.sop && !service.sop.startsWith('/uploads') ? service.sop : ''
  formData.skill_ids = service.skills?.map((s: any) => s.skill_id) || []

  // Reset files
  files.icon = null
  files.flowchart = null
  files.sop_file = null

  showModal.value = true
}

const handleFileUpload = (event: Event, type: 'icon' | 'flowchart' | 'sop_file') => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    files[type] = target.files[0]
  }
}

const saveChanges = async () => {
  loading.submit = true
  error.form = ''

  try {
    const fd = new FormData()
    fd.append('nama_layanan', formData.nama_layanan)
    fd.append('deskripsi', formData.deskripsi)
    fd.append('kategori', formData.kategori)
    fd.append('sla_id', String(formData.sla_id))
    fd.append('default_priority', formData.default_priority)
    fd.append('is_active', formData.is_active ? '1' : '0') // FIX
    fd.append('sop', formData.sop)
    fd.append('skill_ids', JSON.stringify(formData.skill_ids))

    // Hanya append file baru
    if (files.icon) fd.append('icon', files.icon)
    if (files.flowchart) fd.append('flowchart', files.flowchart)
    if (files.sop_file) fd.append('sop_file', files.sop_file)

    let res
    if (modalMode.value === 'create') {
      res = await api.post('/services', fd)
      allServices.value.unshift(res.data.data)
      currentPage.value = 1
      alert('Layanan berhasil dibuat!')
    } else {
      res = await api.put(`/services/${selectedService.value!.id}`, fd)
      const idx = allServices.value.findIndex((s) => s.id === selectedService.value!.id)
      if (idx !== -1) {
        allServices.value[idx] = res.data.data
      }
      alert('Layanan berhasil diupdate!')
    }

    closeModal()
  } catch (err: any) {
    console.error(err)
    error.form = err.response?.data?.message || 'Gagal menyimpan layanan.'
  } finally {
    loading.submit = false
  }
}

const handleDelete = async (service: Service) => {
  if (!confirm(`Hapus layanan "${service.nama_layanan}"?`)) return
  try {
    await api.delete(`/services/${service.id}`)
    allServices.value = allServices.value.filter((s) => s.id !== service.id)
    currentPage.value = 1
    alert('Layanan berhasil dihapus')
  } catch (err: any) {
    const msg = err.response?.data?.message
    alert(msg || 'Gagal menghapus layanan')
  }
}

// --- Utils ---
const closeModal = () => {
  showModal.value = false
  resetForm()
}
const resetForm = () => {
  Object.assign(formData, {
    nama_layanan: '',
    deskripsi: '',
    kategori: '',
    sla_id: '',
    default_priority: 'medium',
    is_active: true,
    sop: '',
    skill_ids: [],
  })
  Object.assign(files, { icon: null, flowchart: null, sop_file: null })
}
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
const getFileUrl = (path: string) => {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `${API_BASE}${path}`
}
const getFileName = (path: string) => path.split('/').pop()

// Pagination & Filter
const filteredServices = computed(() => {
  let services = allServices.value
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    services = services.filter(
      (s) => s.nama_layanan.toLowerCase().includes(q) || s.kategori.toLowerCase().includes(q),
    )
  }
  return services
})

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}
const previousPage = () => {
  if (currentPage.value > 1) currentPage.value--
}
const totalPages = computed(() => Math.ceil(filteredServices.value.length / perPage.value) || 1)
const paginatedServices = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return filteredServices.value.slice(start, start + perPage.value)
})

watch([perPage, searchQuery], () => (currentPage.value = 1))
onMounted(() => fetchData())
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
