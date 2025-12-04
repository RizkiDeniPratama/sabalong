<template>
  <AdminLayout>
    <div class="p-4 md:p-6 2xl:p-10">
      <h1 class="text-2xl font-bold text-gray-800 dark:text-white mb-4">Manajemen Pengguna</h1>

      <!-- Tombol Tambah User -->
      <div class="mb-4">
        <button
          @click="openModal"
          class="px-4 py-2 font-medium text-white transition rounded-lg bg-brand-500 hover:bg-brand-600"
        >
          + Tambah Pengguna Baru
        </button>
      </div>

      <!-- Loading & Error State -->
      <div v-if="loading.users" class="text-center text-gray-500 dark:text-gray-400 py-10">
        Memuat data pengguna...
      </div>
      <div
        v-if="error.users"
        class="p-4 mb-4 text-red-700 bg-red-100 rounded-lg dark:bg-red-900/20 dark:text-red-400"
      >
        <p><b>Error:</b> {{ error.users }}</p>
      </div>

      <!-- Tabel Container -->
      <div
        v-if="!loading.users && !error.users"
        class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
      >
        <!-- Header Controls -->
        <div class="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <!-- Show Entries Dropdown -->
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

            <!-- Search Input -->
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
                placeholder="Search..."
                class="pl-10 pr-4 py-2 w-full md:w-64 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
              />
            </div>
          </div>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead
              class="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700"
            >
              <tr>
                <th
                  class="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider"
                >
                  Nama
                </th>
                <th
                  class="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider"
                >
                  Email
                </th>
                <th
                  class="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider"
                >
                  Instansi
                </th>
                <th
                  class="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider"
                >
                  Role
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
                v-for="user in paginatedUsers"
                :key="user.id"
                class="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
              >
                <td class="px-4 py-4 text-sm font-medium text-gray-800 dark:text-white">
                  {{ user.nama }}
                </td>
                <td class="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                  {{ user.email }}
                </td>
                <td class="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                  {{ user.instansi || '-' }}
                </td>
                <td class="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                  {{ user.role.role_name }}
                </td>
                <td class="px-4 py-4">
                  <span
                    :class="[
                      'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
                      user.is_active
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
                    ]"
                  >
                    {{ user.is_active ? 'Aktif' : 'Tidak Aktif' }}
                  </span>
                </td>
                <td class="px-4 py-4">
                  <div class="flex items-center justify-center gap-2">
                    <button
                      @click="handleDetail(user)"
                      class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
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
                      @click="handleEdit(user)"
                      class="p-2 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
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
                      @click="handleDelete(user)"
                      class="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
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
              <tr v-if="paginatedUsers.length === 0">
                <td colspan="6" class="px-4 py-12 text-center text-gray-500 dark:text-gray-400">
                  <svg
                    class="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                  <p class="text-sm font-medium">Tidak ada data ditemukan</p>
                  <p class="text-xs mt-1">Coba ubah kata kunci pencarian Anda.</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Footer with Pagination -->
        <div class="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div class="text-sm text-gray-600 dark:text-gray-400">
              Showing {{ startIndex + 1 }} to {{ Math.min(endIndex, filteredUsers.length) }} of
              {{ filteredUsers.length }} entries
            </div>
            <div class="flex items-center gap-1">
              <button
                @click="previousPage"
                :disabled="currentPage === 1"
                :class="[
                  'px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                  currentPage === 1
                    ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
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
                  'px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                  currentPage === page
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700',
                ]"
              >
                {{ page }}
              </button>
              <!-- <button
                v-if="showEllipsis"
                disabled
                class="px-3 py-2 text-sm text-gray-400 dark:text-gray-600"
              >
                ...
              </button> -->
              <button
                @click="nextPage"
                :disabled="currentPage === totalPages"
                :class="[
                  'px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                  currentPage === totalPages
                    ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
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

    <!-- Modal Overlay -->
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
                    ? 'Tambah Pengguna Baru'
                    : modalMode === 'edit'
                      ? 'Edit Pengguna'
                      : 'Detail Pengguna'
                }}
              </h2>
              <button
                @click="closeModal"
                class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
              >
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

            <!-- Modal Body -->
            <div class="p-6">
              <!-- Detail Mode -->
              <div v-if="modalMode === 'detail' && selectedUser" class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Nama</label>
                    <p class="mt-1 text-gray-800 dark:text-white">{{ selectedUser.nama }}</p>
                  </div>
                  <div>
                    <label class="text-sm font-medium text-gray-500 dark:text-gray-400"
                      >Email</label
                    >
                    <p class="mt-1 text-gray-800 dark:text-white">{{ selectedUser.email }}</p>
                  </div>
                  <div>
                    <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Role</label>
                    <p class="mt-1 text-gray-800 dark:text-white capitalize">
                      {{ selectedUser.role.role_name }}
                    </p>
                  </div>
                  <div>
                    <label class="text-sm font-medium text-gray-500 dark:text-gray-400"
                      >Instansi</label
                    >
                    <p class="mt-1 text-gray-800 dark:text-white">
                      {{ selectedUser.instansi || '-' }}
                    </p>
                  </div>
                  <div>
                    <label class="text-sm font-medium text-gray-500 dark:text-gray-400"
                      >No. Telepon</label
                    >
                    <p class="mt-1 text-gray-800 dark:text-white">
                      {{ selectedUser.no_telepon || '-' }}
                    </p>
                  </div>
                  <div>
                    <label class="text-sm font-medium text-gray-500 dark:text-gray-400"
                      >Status</label
                    >
                    <p class="mt-1">
                      <span
                        :class="[
                          'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
                          selectedUser.is_active
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
                        ]"
                      >
                        {{ selectedUser.is_active ? 'Aktif' : 'Tidak Aktif' }}
                      </span>
                    </p>
                  </div>
                </div>
                <div v-if="selectedUser.alamat">
                  <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Alamat</label>
                  <p class="mt-1 text-gray-800 dark:text-white">{{ selectedUser.alamat }}</p>
                </div>
                <div v-if="selectedUser.skills && selectedUser.skills.length > 0">
                  <label class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 block"
                    >Skills</label
                  >
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div
                      v-for="userSkill in selectedUser.skills"
                      :key="userSkill.id"
                      class="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                    >
                      <div class="flex items-center justify-between mb-2">
                        <p class="font-medium text-gray-800 dark:text-white">
                          {{ userSkill.skill.skill_name }}
                        </p>
                        <span
                          class="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 capitalize"
                          >{{ userSkill.level }}</span
                        >
                      </div>
                      <p class="text-sm text-gray-600 dark:text-gray-400">
                        {{ userSkill.skill.skill_description }}
                      </p>
                      <p class="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        Kategori: {{ userSkill.skill.kategori }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Create/Edit Mode -->
              <form v-else @submit.prevent="saveChanges" class="space-y-5">
                <div
                  v-if="error.form"
                  class="p-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-900/20 dark:text-red-400"
                  role="alert"
                >
                  {{ error.form }}
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >Nama <span class="text-red-500">*</span></label
                  >
                  <input
                    v-model="formData.nama"
                    type="text"
                    required
                    class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="Masukkan nama lengkap"
                  />
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >Email <span class="text-red-500">*</span></label
                    >
                    <input
                      v-model="formData.email"
                      type="email"
                      required
                      class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >Password <span v-if="modalMode === 'create'" class="text-red-500">*</span
                      ><span v-else class="text-xs text-gray-500"
                        >(kosongkan jika tidak diubah)</span
                      ></label
                    >
                    <input
                      v-model="formData.password"
                      type="password"
                      :required="modalMode === 'create'"
                      class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >Role <span class="text-red-500">*</span></label
                  >
                  <select
                    v-model="formData.role_id"
                    required
                    class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  >
                    <option disabled value="">Pilih Role</option>
                    <option v-for="role in availableRoles" :key="role.id" :value="role.id">
                      {{ role.role_name }}
                    </option>
                  </select>
                  <p v-if="loading.masters" class="text-xs text-blue-500 mt-1">
                    Memuat data roles/skills...
                  </p>
                  <p v-if="error.masters" class="text-xs text-red-500 mt-1">{{ error.masters }}</p>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >Instansi</label
                    ><input
                      v-model="formData.instansi"
                      type="text"
                      class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="Nama instansi"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >No. Telepon</label
                    ><input
                      v-model="formData.no_telepon"
                      type="tel"
                      class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="+62 xxx xxx xxx"
                    />
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >Alamat</label
                  >
                  <textarea
                    v-model="formData.alamat"
                    rows="2"
                    class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                    placeholder="Alamat lengkap"
                  ></textarea>
                </div>
                <div
                  v-if="modalMode === 'edit'"
                  class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 pb-2 border-y border-gray-200 dark:border-gray-700"
                >
                  <div
                    class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >Status Aktif</label
                      >
                      <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        User dapat login ke sistem
                      </p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer"
                      ><input v-model="formData.is_active" type="checkbox" class="sr-only peer" />
                      <div
                        class="w-11 h-6 bg-gray-300 peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"
                      ></div
                    ></label>
                  </div>
                  <div
                    class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >Status Tersedia</label
                      >
                      <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        User tersedia untuk tugas
                      </p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer"
                      ><input
                        v-model="formData.is_available"
                        type="checkbox"
                        class="sr-only peer" />
                      <div
                        class="w-11 h-6 bg-gray-300 peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"
                      ></div
                    ></label>
                  </div>
                </div>
                <div v-if="isPetugasRole" class="space-y-3">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >Skills <span class="text-red-500">*</span></label
                  >
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div
                      v-for="skill in availableSkills"
                      :key="skill.id"
                      class="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                    >
                      <div class="flex items-start gap-3">
                        <input
                          :id="`skill-${skill.id}`"
                          type="checkbox"
                          :checked="formData.skill_ids.includes(skill.id)"
                          @change="toggleSkill(skill.id)"
                          class="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <div class="flex-1 min-w-0">
                          <label
                            :for="`skill-${skill.id}`"
                            class="block font-medium text-gray-800 dark:text-white cursor-pointer"
                            >{{ skill.skill_name }}</label
                          >
                          <p class="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                            {{ skill.skill_description }}
                          </p>
                          <div v-if="formData.skill_ids.includes(skill.id)" class="mt-2">
                            <select
                              v-model="formData.level[skill.id]"
                              class="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            >
                              <option value="junior">Junior</option>
                              <option value="senior">Senior</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <!-- Modal Footer -->
            <div
              class="sticky bottom-0 flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            >
              <button
                @click="closeModal"
                type="button"
                class="px-6 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-all"
              >
                {{ modalMode === 'detail' ? 'Tutup' : 'Batal' }}
              </button>
              <button
                v-if="modalMode !== 'detail'"
                @click="saveChanges"
                :disabled="loading.submit"
                type="button"
                class="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-wait"
              >
                {{
                  loading.submit
                    ? 'Menyimpan...'
                    : modalMode === 'create'
                      ? 'Tambah Pengguna'
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
import iziToast from 'izitoast'
import 'izitoast/dist/css/iziToast.min.css'
import api from '../../services/api'

// --- DATA TYPES ---
interface Role {
  id: number
  role_name: string
}
interface Skill {
  id: number
  skill_name: string
  skill_description: string
  kategori: string
}
interface UserSkill {
  id: number
  skill_id: number
  level: string
  skill: Skill
}
interface User {
  id: number
  nama: string
  email: string
  instansi: string | null
  role: Role
  is_active: boolean
  alamat?: string | null
  no_telepon?: string | null
  is_available?: boolean
  skills?: UserSkill[]
}
interface FormData {
  nama: string
  email: string
  password: string
  role_id: number | ''
  instansi: string
  alamat: string
  no_telepon: string
  skill_ids: number[]
  level: { [key: number]: string }
  is_active?: boolean
  is_available?: boolean
}

// --- COMPONENT STATE ---
const allUsers = ref<User[]>([])
const availableSkills = ref<Skill[]>([])
const availableRoles = ref<Role[]>([])

const searchQuery = ref('')
const perPage = ref(10)
const currentPage = ref(1)

const loading = reactive({
  users: true,
  masters: true,
  submit: false,
})
const error = reactive<{ users: string | null; masters: string | null; form: any | null }>({
  users: null,
  masters: null,
  form: null,
})

const showModal = ref(false)
const modalMode = ref<'create' | 'edit' | 'detail'>('create')
const selectedUser = ref<User | null>(null)

// --- FORM ---
const createDefaultFormData = (): FormData => ({
  nama: '',
  email: '',
  password: '',
  role_id: '',
  instansi: '',
  alamat: '',
  no_telepon: '',
  skill_ids: [],
  level: {},
  is_active: true,
  is_available: true,
})
const formData = ref<FormData>(createDefaultFormData())

// --- COMPUTED PROPERTIES ---
const isPetugasRole = computed(() => {
  const role = availableRoles.value.find((r) => r.id === formData.value.role_id)
  return role?.role_name.toLowerCase() === 'petugas'
})

const filteredUsers = computed(() => {
  let users = allUsers.value
  if (!searchQuery.value) return users
  const query = searchQuery.value.toLowerCase()
  return users.filter(
    (user) =>
      user.nama.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.role.role_name.toLowerCase().includes(query),
  )
})

const totalPages = computed(() => Math.ceil(filteredUsers.value.length / perPage.value))
const startIndex = computed(() => (currentPage.value - 1) * perPage.value)
const endIndex = computed(() => startIndex.value + perPage.value)
const paginatedUsers = computed(() => filteredUsers.value.slice(startIndex.value, endIndex.value))

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

// --- API & DATA FETCHING ---
const fetchUsers = async () => {
  loading.users = true
  error.users = null
  try {
    const response = await api.get('/users')
    allUsers.value = response.data.data
  } catch (err) {
    error.users = 'Gagal memuat data pengguna.'
  } finally {
    loading.users = false
  }
}

const fetchMasterData = async () => {
  loading.masters = true
  error.masters = null
  try {
    const [rolesRes, skillsRes] = await Promise.all([api.get('/roles'), api.get('/skills')])
    availableRoles.value = rolesRes.data.data
    availableSkills.value = skillsRes.data.data
  } catch (err) {
    error.masters = 'Gagal memuat data roles & skills.'
  } finally {
    loading.masters = false
  }
}

onMounted(() => {
  fetchUsers()
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
  selectedUser.value = null
}

const handleDetail = (user: User) => {
  modalMode.value = 'detail'
  selectedUser.value = user
  showModal.value = true
}

const handleEdit = (user: User) => {
  modalMode.value = 'edit'
  selectedUser.value = user
  error.form = null
  formData.value = {
    nama: user.nama,
    email: user.email,
    password: '',
    role_id: user.role.id,
    instansi: user.instansi || '',
    alamat: user.alamat || '',
    no_telepon: user.no_telepon || '',
    skill_ids: user.skills?.map((s) => s.skill_id) || [],
    level: user.skills?.reduce((acc, s) => ({ ...acc, [s.skill_id]: s.level }), {}) || {},
    is_active: user.is_active,
    is_available: user.is_available ?? true,
  }
  showModal.value = true
}

const toggleSkill = (skillId: number) => {
  const index = formData.value.skill_ids.indexOf(skillId)
  if (index > -1) {
    formData.value.skill_ids.splice(index, 1)
    delete formData.value.level[skillId]
  } else {
    formData.value.skill_ids.push(skillId)
    formData.value.level[skillId] = 'junior'
  }
}

// --- CRUD ACTIONS ---
const saveChanges = async () => {
  loading.submit = true
  error.form = null

  const skillsPayload = formData.value.skill_ids.map((skillId) => {
    return {
      skill_id: skillId,
      level: formData.value.level[skillId] || 'junior',
    }
  })

  // Buat payload baru
  const payload = {
    nama: formData.value.nama,
    email: formData.value.email,
    password: formData.value.password,
    role_id: formData.value.role_id,
    instansi: formData.value.instansi,
    alamat: formData.value.alamat,
    no_telepon: formData.value.no_telepon,
    is_active: formData.value.is_active,
    is_available: formData.value.is_available,
    skills: skillsPayload, // <-- Kirim array of objects, BUKAN 'skill_ids' dan 'level'
  }

  // Jika mode 'edit' dan password kosong, hapus key password
  if (modalMode.value === 'edit' && !payload.password) {
    delete (payload as any).password
  }

  if (!isPetugasRole.value) {
    payload.skills = []
  }

  try {
    if (modalMode.value === 'create') {
      const response = await api.post('/users', payload)

      alert('Berhasil! Pengguna baru telah ditambahkan.')
      allUsers.value.unshift(response.data.data)
    } else if (modalMode.value === 'edit' && selectedUser.value) {
      // --- AKSI UPDATE ---
      const response = await api.put(`/users/${selectedUser.value.id}`, payload)
      iziToast.show({
        title: 'Yey!!',
        message: 'Berhasil! Data pengguna telah diperbarui.',
      })
      // alert('Berhasil! Data pengguna telah diperbarui.')

      const index = allUsers.value.findIndex((u) => u.id === selectedUser.value!.id)
      if (index !== -1) {
        allUsers.value[index] = response.data.data
      }
    }

    closeModal()
  } catch (err: any) {
    const message = err.response?.data?.message || 'Terjadi kesalahan pada server.'
    error.form = message
    alert('GAGAL: ' + message)
    console.error('Gagal menyimpan:', err)
  } finally {
    loading.submit = false
  }
}

// delete user
const handleDelete = async (user: User) => {
  if (confirm(`Apakah Anda yakin ingin menghapus pengguna ${user.nama}?`)) {
    try {
      await api.delete(`/users/${user.id}`)
      allUsers.value = allUsers.value.filter((u) => u.id !== user.id)
    } catch (err: any) {
      alert('Gagal menghapus: ' + (err.response?.data?.message || err.message))
    }
  }
}

// --- PAGINATION ---
const previousPage = () => {
  if (currentPage.value > 1) currentPage.value--
}
const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}
const goToPage = (page: number | string) => {
  if (typeof page === 'number') currentPage.value = page
}

// --- WATCHERS ---
watch([perPage, searchQuery], () => {
  currentPage.value = 1
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-active .relative,
.modal-leave-active .relative {
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
}
.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.95);
  opacity: 0;
}
</style>
