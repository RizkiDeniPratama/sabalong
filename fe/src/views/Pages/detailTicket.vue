<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />

    <div class="min-h-screen space-y-6 p-4 xl:p-10">
      <div v-if="loading.ticket" class="flex items-center justify-center py-20">
        <div class="text-center">
          <div
            class="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-brand-600"
          ></div>
          <p class="mt-4 text-sm text-gray-500">Memuat detail tiket...</p>
        </div>
      </div>

      <div
        v-else-if="error"
        class="rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:bg-red-900/20 dark:border-red-800"
      >
        <p class="text-red-600 dark:text-red-400">{{ error }}</p>
        <button
          @click="goBack"
          class="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 transition"
        >
          Kembali
        </button>
      </div>

      <template v-else-if="ticket">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <button
            @click="goBack"
            class="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-400 transition"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Kembali
          </button>

          <div class="flex gap-2">
            <button
              v-if="canRate"
              @click="showFeedbackModal = true"
              class="flex items-center gap-2 rounded-lg bg-yellow-500 px-4 py-2 text-sm font-bold text-white hover:bg-yellow-600 shadow-md transition transform hover:-translate-y-0.5"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                />
              </svg>
              Beri Ulasan
            </button>

            <button
              v-if="canEscalate"
              @click="handleEscalate"
              class="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
              Eskalasi
            </button>

            <button
              v-if="isAdmin && !isTicketClosed"
              @click="openAssignModal"
              class="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              {{ ticket.assignee ? 'Ganti Petugas' : 'Assign Petugas' }}
            </button>

            <button
              v-if="canCompleteTicket && !isTicketClosed"
              @click="quickComplete"
              class="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 shadow-sm transition"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Tandai Selesai
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div class="space-y-6 lg:col-span-2">
            <div
              class="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 overflow-hidden"
            >
              <div
                class="border-b border-gray-100 p-6 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/50"
              >
                <div class="flex flex-wrap items-center justify-between gap-4 mb-3">
                  <div class="flex items-center gap-3">
                    <h2 class="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                      {{ ticket.ticket_number }}
                    </h2>
                    <span :class="statusBadgeClass(ticket.status)">{{ ticket.status }}</span>
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    Dibuat: {{ formatDate(ticket.created_at) }}
                  </div>
                </div>
                <h1 class="text-lg font-semibold text-gray-800 dark:text-white leading-snug">
                  {{ ticket.judul_permohonan }}
                </h1>
              </div>

              <div class="p-6 space-y-6">
                <div>
                  <h3
                    class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2"
                  >
                    Deskripsi Masalah
                  </h3>
                  <div
                    class="prose prose-sm max-w-none text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700"
                  >
                    <p class="whitespace-pre-wrap leading-relaxed">{{ ticket.deskripsi }}</p>
                  </div>
                </div>

                <div v-if="ticket.attachment">
                  <h3
                    class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2"
                  >
                    Lampiran
                  </h3>
                  <a
                    :href="getAttachmentUrl(ticket.attachment)"
                    target="_blank"
                    class="group flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-white hover:border-brand-300 hover:shadow-sm transition dark:bg-gray-800 dark:border-gray-700 dark:hover:border-brand-600"
                  >
                    <div class="p-2 bg-blue-50 text-blue-500 rounded-lg dark:bg-blue-900/20">
                      <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                        />
                      </svg>
                    </div>
                    <div>
                      <p
                        class="text-sm font-medium text-gray-900 dark:text-white group-hover:text-brand-600 transition"
                      >
                        Lihat Lampiran
                      </p>
                      <p class="text-xs text-gray-500 truncate max-w-[200px]">
                        {{ ticket.attachment }}
                      </p>
                    </div>
                  </a>
                </div>
              </div>
            </div>

            <div
              class="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 flex flex-col overflow-hidden"
            >
              <div
                class="border-b border-gray-200 p-4 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/80"
              >
                <h3 class="font-bold text-gray-800 dark:text-white">Aktivitas & Diskusi</h3>
              </div>

              <div
                class="p-6 max-h-[500px] overflow-y-auto space-y-6 bg-white dark:bg-gray-900"
                ref="logsContainer"
              >
                <div v-if="!ticket.logs || ticket.logs.length === 0" class="text-center py-8">
                  <p class="text-gray-500 dark:text-gray-400 text-sm">Belum ada percakapan.</p>
                </div>

                <div v-for="log in ticket.logs" :key="log.id">
                  <div
                    v-if="log.action_type !== 'commented'"
                    class="flex flex-col items-center gap-1 my-2"
                  >
                    <span
                      class="px-3 py-1 rounded-full bg-gray-100 border border-gray-200 text-[11px] font-medium text-gray-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 shadow-sm"
                    >
                      <span class="font-bold text-gray-700 dark:text-gray-300">{{
                        log.user?.nama || 'System'
                      }}</span>
                      {{ formatActionText(log) }}
                    </span>
                    <span class="text-[10px] text-gray-400">{{
                      formatDateShort(log.created_at)
                    }}</span>
                  </div>
                  <div
                    v-else
                    :class="['flex gap-3 group', isMe(log.user?.id) ? 'flex-row-reverse' : '']"
                  >
                    <div class="flex-shrink-0 mt-1">
                      <div
                        class="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 dark:bg-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
                      >
                        {{ log.user?.nama?.charAt(0) || '?' }}
                      </div>
                    </div>
                    <div
                      :class="[
                        'max-w-[85%] rounded-2xl p-3.5 shadow-sm text-sm leading-relaxed relative',
                        isMe(log.user?.id)
                          ? 'bg-brand-600 text-white rounded-tr-none'
                          : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200',
                      ]"
                    >
                      <div
                        class="flex justify-between items-baseline gap-4 mb-1 border-b border-white/20 pb-1"
                        :class="
                          isMe(log.user?.id)
                            ? 'border-white/20'
                            : 'border-gray-100 dark:border-gray-700'
                        "
                      >
                        <span class="font-bold text-xs opacity-90">{{ log.user?.nama }}</span>
                        <span class="text-[10px] opacity-75 font-mono">{{
                          formatDateShort(log.created_at)
                        }}</span>
                      </div>
                      <p class="whitespace-pre-wrap">{{ log.notes }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div
                v-if="!isTicketClosed && canComment"
                class="p-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl dark:bg-gray-800/50 dark:border-gray-700"
              >
                <div class="relative">
                  <textarea
                    v-model="newComment"
                    rows="2"
                    placeholder="Tulis pesan... (Ctrl+Enter untuk kirim)"
                    class="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pr-14 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 resize-none shadow-sm transition dark:bg-gray-900 dark:border-gray-600 dark:text-white dark:placeholder-gray-500"
                    @keydown.enter.ctrl="submitComment"
                  ></textarea>
                  <button
                    @click="submitComment"
                    :disabled="!newComment.trim() || loading.comment"
                    class="absolute bottom-2.5 right-2.5 rounded-lg bg-brand-600 p-2 text-white hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                  >
                    <svg
                      v-if="loading.comment"
                      class="h-5 w-5 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
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
                    <svg
                      v-else
                      class="h-5 w-5 transform rotate-90"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <div
                v-else
                class="p-6 text-center bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 rounded-b-2xl"
              >
                <p class="font-medium text-gray-900 dark:text-white">
                  {{
                    isTicketClosed
                      ? 'Tiket ini telah selesai.'
                      : 'Anda tidak memiliki akses untuk membalas tiket ini.'
                  }}
                </p>
              </div>
            </div>
          </div>

          <div class="space-y-6">
            <div
              v-if="ticket.feedback"
              class="rounded-2xl border border-yellow-200 bg-yellow-50 p-5 dark:border-yellow-900/30 dark:bg-yellow-900/10"
            >
              <h4 class="text-xs font-bold text-yellow-700 uppercase tracking-wider mb-2">
                Ulasan Pengguna
              </h4>
              <div class="flex text-yellow-500 mb-2 text-lg">
                <span v-for="n in 5" :key="n">
                  <svg
                    v-if="n <= ticket.feedback.rating"
                    class="w-5 h-5 fill-current"
                    viewBox="0 0 20 20"
                  >
                    <path
                      d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                    />
                  </svg>
                  <svg
                    v-else
                    class="w-5 h-5 text-yellow-200 dark:text-yellow-900 fill-current"
                    viewBox="0 0 20 20"
                  >
                    <path
                      d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                    />
                  </svg>
                </span>
              </div>
              <p class="text-sm text-yellow-800 dark:text-yellow-200 italic">
                "{{ ticket.feedback.review }}"
              </p>
            </div>

            <div
              class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900"
            >
              <h4
                class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 dark:border-gray-700 pb-2"
              >
                Detail Layanan
              </h4>
              <div class="mb-4">
                <span class="text-xs text-gray-500 dark:text-gray-400 block mb-1">Prioritas</span>
                <span
                  :class="[
                    'inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase shadow-sm',
                    priorityBadgeClass(ticket.priority),
                  ]"
                >
                  {{ ticket.priority || 'Normal' }}
                </span>
              </div>
              <div
                v-if="ticket.resolution_deadline"
                class="rounded-xl bg-blue-50/50 p-3 border border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/30"
              >
                <span class="text-xs font-semibold text-blue-700 dark:text-blue-300 block mb-2"
                  >Target Penyelesaian</span
                >
                <div class="flex items-center gap-2">
                  <svg
                    class="w-4 h-4 text-blue-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <p
                      :class="[
                        'text-sm font-bold',
                        isMissed(ticket.resolution_deadline)
                          ? 'text-red-600'
                          : 'text-gray-800 dark:text-white',
                      ]"
                    >
                      {{ formatDateShort(ticket.resolution_deadline) }}
                    </p>
                    <p
                      v-if="isMissed(ticket.resolution_deadline)"
                      class="text-[10px] text-red-500 font-medium mt-0.5"
                    >
                      ⚠️ SLA Terlampaui
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div
              class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900"
            >
              <h4
                class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 dark:border-gray-700 pb-2"
              >
                Pelapor
              </h4>
              <div class="flex items-center gap-3 mb-3">
                <div
                  class="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-bold text-gray-500 border border-gray-200 dark:border-gray-700"
                >
                  {{ ticket.requester?.nama?.charAt(0) }}
                </div>
                <div class="overflow-hidden">
                  <p
                    class="font-bold text-sm text-gray-900 dark:text-white truncate"
                    :title="ticket.requester?.nama"
                  >
                    {{ ticket.requester?.nama }}
                  </p>
                  <p class="text-xs text-gray-500 truncate" :title="ticket.requester?.email">
                    {{ ticket.requester?.email }}
                  </p>
                </div>
              </div>
              <div
                class="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 text-sm flex justify-between"
              >
                <span class="text-gray-500">Instansi</span>
                <span class="font-medium text-gray-900 dark:text-gray-200">{{
                  ticket.requester?.instansi || '-'
                }}</span>
              </div>
            </div>

            <div
              class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900"
            >
              <div
                class="flex justify-between items-center mb-4 border-b border-gray-100 dark:border-gray-700 pb-2"
              >
                <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider">Petugas</h4>
                <button
                  v-if="isAdmin && !isTicketClosed"
                  @click="openAssignModal"
                  class="text-xs text-brand-600 font-bold hover:underline dark:text-brand-400"
                >
                  UBAH
                </button>
              </div>
              <div v-if="ticket.assignee" class="flex items-center gap-3">
                <div
                  class="h-10 w-10 rounded-full bg-brand-50 flex items-center justify-center font-bold text-brand-600 dark:bg-brand-900/30 dark:text-brand-400"
                >
                  {{ ticket.assignee.nama.charAt(0) }}
                </div>
                <div>
                  <p class="font-bold text-sm text-gray-900 dark:text-white">
                    {{ ticket.assignee.nama }}
                  </p>
                  <p class="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                    <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span> Assigned
                  </p>
                </div>
              </div>
              <div
                v-else
                class="text-center py-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700"
              >
                <p class="text-xs text-gray-500 mb-2">Belum ada petugas.</p>
                <button
                  v-if="isAdmin && !isTicketClosed"
                  @click="openAssignModal"
                  class="text-xs font-bold text-brand-600 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 px-3 py-1.5 rounded shadow-sm hover:bg-gray-50 transition"
                >
                  Assign Sekarang
                </button>
              </div>
            </div>

            <div
              v-if="!isTicketClosed && (isAdmin || isTicketOwner)"
              class="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900"
            >
              <div class="border-b border-gray-200 p-4 dark:border-gray-800">
                <h3 class="font-bold text-sm text-gray-900 dark:text-white">
                  Update Status Manual
                </h3>
              </div>
              <div class="p-4 space-y-3">
                <select
                  v-model="newStatus"
                  class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-brand-500/20"
                >
                  <option value="">-- Pilih Status --</option>
                  <option value="on_progress">On Progress</option>
                  <option value="pending">Pending (Hold)</option>
                  <option value="selesai">Selesai</option>
                  <option value="closed" v-if="isAdmin">Closed (Arsip)</option>
                </select>
                <textarea
                  v-model="statusNotes"
                  rows="2"
                  placeholder="Catatan (Opsional)..."
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white resize-none"
                ></textarea>
                <button
                  @click="submitStatusUpdate"
                  :disabled="!newStatus || loading.status"
                  class="w-full rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:opacity-50 transition"
                >
                  {{ loading.status ? 'Menyimpan...' : 'Update Status' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showAssignModal"
          class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm"
          @click.self="closeAssignModal"
        >
          <div
            class="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-xl overflow-hidden"
          >
            <div class="p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              <h3 class="font-bold text-gray-900 dark:text-white">Pilih Petugas</h3>
            </div>
            <div class="p-4 max-h-[300px] overflow-y-auto space-y-2">
              <div v-if="loading.technicians" class="text-center text-gray-500 text-sm">
                Loading...
              </div>
              <div
                v-for="tech in technicians"
                :key="tech.id"
                @click="selectedTechnicianId = tech.id"
                :class="[
                  'p-3 rounded-lg border cursor-pointer flex justify-between items-center transition',
                  selectedTechnicianId === tech.id
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                    : 'border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700',
                ]"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs font-bold dark:text-white"
                  >
                    {{ tech.nama.charAt(0) }}
                  </div>
                  <span class="text-sm font-medium text-gray-900 dark:text-white">{{
                    tech.nama
                  }}</span>
                </div>
                <span v-if="selectedTechnicianId === tech.id" class="text-brand-600 font-bold"
                  >✓</span
                >
              </div>
            </div>
            <div
              class="p-4 border-t flex justify-end gap-2 bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700"
            >
              <button
                @click="closeAssignModal"
                class="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-lg dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Batal
              </button>
              <button
                @click="submitAssignment"
                :disabled="!selectedTechnicianId || loading.assigning"
                class="px-4 py-2 text-sm bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showFeedbackModal"
          class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm"
          @click.self="showFeedbackModal = false"
        >
          <div
            class="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl p-8 text-center transform transition-all"
          >
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Beri Ulasan Layanan
            </h3>
            <p class="text-sm text-gray-500 mb-6">
              Seberapa puas Anda dengan penanganan tiket ini?
            </p>
            <div class="flex justify-center gap-2 mb-6">
              <button
                v-for="star in 5"
                :key="star"
                @click="feedbackForm.rating = star"
                type="button"
                class="text-4xl transition-transform hover:scale-110 focus:outline-none"
              >
                <span
                  :class="
                    star <= feedbackForm.rating
                      ? 'text-yellow-400'
                      : 'text-gray-200 dark:text-gray-600'
                  "
                  >★</span
                >
              </button>
            </div>
            <textarea
              v-model="feedbackForm.review"
              rows="3"
              placeholder="Tulis pengalaman Anda (opsional)..."
              class="w-full mb-6 p-4 border border-gray-200 rounded-xl text-sm focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 outline-none resize-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            ></textarea>
            <div class="flex gap-3">
              <button
                @click="showFeedbackModal = false"
                class="flex-1 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
              >
                Batal
              </button>
              <button
                @click="submitFeedback"
                :disabled="!feedbackForm.rating || loading.feedback"
                class="flex-1 py-2.5 text-sm font-bold text-white bg-yellow-500 rounded-xl hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-yellow-500/30"
              >
                {{ loading.feedback ? 'Mengirim...' : 'Kirim Ulasan' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AdminLayout from '../../components/layout/AdminLayout.vue'
import PageBreadcrumb from '../../components/common/PageBreadcrumb.vue'
import api from '@/services/api'

interface User {
  id: number
  nama: string
  email?: string
  instansi?: string
  role?: string
}
interface TicketLog {
  id: number
  action_type: string
  notes?: string
  created_at: string
  user?: User
  old_value?: string
  new_value?: string
}
interface Feedback {
  id: number
  rating: number
  review: string
  created_at: string
}
interface Ticket {
  id: number
  ticket_number: string
  judul_permohonan: string
  deskripsi: string
  status: string
  priority: string
  attachment?: string
  created_at: string
  response_deadline: string
  resolution_deadline: string
  user_id: number
  assigned_to_id: number
  requester: User
  assignee?: User
  service: { nama_layanan: string }
  logs: TicketLog[]
  feedback?: Feedback
}

const route = useRoute()
const router = useRouter()
const currentPageTitle = ref('Detail Tiket')
const ticket = ref<Ticket | null>(null)
const technicians = ref<User[]>([])
const error = ref('')
const logsContainer = ref<HTMLElement | null>(null)
const newComment = ref('')
const newStatus = ref('')
const statusNotes = ref('')
const showAssignModal = ref(false)
const showFeedbackModal = ref(false)
const selectedTechnicianId = ref<number | null>(null)
const feedbackForm = reactive({ rating: 0, review: '' })
const loading = reactive({
  ticket: true,
  comment: false,
  status: false,
  technicians: false,
  assigning: false,
  feedback: false,
})

const authUser = ref<any>(null)

onMounted(() => {
  const storedUser = localStorage.getItem('user')
  if (storedUser) {
    try {
      authUser.value = JSON.parse(storedUser)
    } catch (e) {
      console.error(e)
    }
  }
  fetchTicketDetail()
})

const isAdmin = computed(() => authUser.value?.role === 'admin')
const isPetugas = computed(() => authUser.value?.role === 'petugas')
const isUser = computed(() => authUser.value?.role === 'user')

const isTicketOwner = computed(() => {
  if (!ticket.value || !authUser.value) return false
  return ticket.value.assigned_to_id === authUser.value.id
})

const isTicketClosed = computed(() =>
  ['selesai', 'closed'].includes(ticket.value?.status?.toLowerCase() || ''),
)
const isMe = (uid?: number) => uid === authUser.value?.id
const canRate = computed(
  () => isUser.value && ticket.value?.status === 'selesai' && !ticket.value?.feedback,
)

const canComment = computed(() => {
  if (isTicketClosed.value) return false
  if (isAdmin.value) return true
  if (ticket.value?.user_id === authUser.value?.id) return true
  if (isTicketOwner.value) return true
  return false
})

const canCompleteTicket = computed(() => isAdmin.value || isTicketOwner.value)
const canEscalate = computed(
  () => isPetugas.value && isTicketOwner.value && ticket.value?.status === 'on_progress',
)

const goBack = () => {
  if (isUser.value) router.push('/user/dashboard')
  else if (isPetugas.value) router.push('/petugas/dashboard')
  else router.push('/admin/tickets')
}

const fetchTicketDetail = async () => {
  loading.ticket = true
  error.value = ''
  try {
    const res = await api.get(`/tickets/${route.params.id}`)
    if (res.data.success) {
      ticket.value = res.data.data
      scrollToBottom()
    }
  } catch (err: any) {
    error.value = 'Gagal memuat tiket.'
  } finally {
    loading.ticket = false
  }
}

const submitComment = async () => {
  if (!newComment.value.trim() || !ticket.value) return
  loading.comment = true
  try {
    await api.post(`/tickets/${ticket.value.id}/logs`, { notes: newComment.value })
    await fetchTicketDetail()
    newComment.value = ''
  } catch {
    alert('Gagal kirim pesan')
  } finally {
    loading.comment = false
  }
}

const submitStatusUpdate = async () => {
  if (!newStatus.value || !ticket.value) return
  loading.status = true
  try {
    await api.put(`/tickets/${ticket.value.id}/status`, {
      status: newStatus.value,
      notes: statusNotes.value,
    })
    await fetchTicketDetail()
    newStatus.value = ''
    statusNotes.value = ''
    alert('Status diperbarui!')
  } catch {
    alert('Gagal update status')
  } finally {
    loading.status = false
  }
}

const quickComplete = async () => {
  if (confirm('Tandai tiket ini sebagai Selesai?')) {
    newStatus.value = 'selesai'
    await submitStatusUpdate()
  }
}

const handleEscalate = async () => {
  const reason = prompt('Alasan eskalasi:')
  if (!reason || !ticket.value) return
  try {
    await api.put(`/tickets/${ticket.value.id}/escalate`, { eskalasi_reason: reason })
    alert('Tiket berhasil dieskalasi.')
    fetchTicketDetail()
  } catch (e) {
    alert('Gagal eskalasi.')
  }
}

const submitFeedback = async () => {
  if (!feedbackForm.rating || !ticket.value) return
  loading.feedback = true
  try {
    await api.post('/feedbacks', {
      ticket_id: ticket.value.id,
      rating: feedbackForm.rating,
      review: feedbackForm.review,
    })
    showFeedbackModal.value = false
    await fetchTicketDetail()
    alert('Ulasan terkirim!')
  } catch (e) {
    alert('Gagal kirim ulasan')
  } finally {
    loading.feedback = false
  }
}

const fetchTechnicians = async () => {
  loading.technicians = true
  try {
    const res = await api.get('/users', { params: { role: 'petugas' } })
    technicians.value = res.data.data
  } finally {
    loading.technicians = false
  }
}
const openAssignModal = () => {
  if (!isAdmin.value) return
  showAssignModal.value = true
  selectedTechnicianId.value = ticket.value?.assignee?.id || ticket.value?.assigned_to_id || null
  if (technicians.value.length === 0) fetchTechnicians()
}
const closeAssignModal = () => {
  showAssignModal.value = false
  selectedTechnicianId.value = null
}
const submitAssignment = async () => {
  if (!ticket.value) return
  loading.assigning = true
  try {
    await api.put(`/tickets/${ticket.value.id}/assign`, { petugas_id: selectedTechnicianId.value })
    await fetchTicketDetail()
    closeAssignModal()
    alert('Berhasil assign!')
  } catch {
    alert('Gagal')
  } finally {
    loading.assigning = false
  }
}

const isMissed = (d: string, a?: string) =>
  d ? (a ? new Date(a).getTime() : new Date().getTime()) > new Date(d).getTime() : false
const formatDate = (d: string) =>
  d
    ? new Date(d).toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '-'
const formatDateShort = (d: string) =>
  d ? new Date(d).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : ''
const formatActionText = (log: any) => {
  const map: any = {
    created: 'membuat tiket',
    assigned: 'menugaskan',
    status_changed: 'ubah status',
    escalated: 'eskalasi',
  }
  return map[log.action_type] || log.action_type
}
const statusBadgeClass = (s: string) => {
  const map: any = {
    selesai: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    on_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    eskalasi: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    closed: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  }
  return `px-3 py-1 rounded-full text-xs font-bold uppercase ${map[s?.toLowerCase()] || 'bg-gray-100'}`
}
const priorityBadgeClass = (p: string) => {
  const map: any = {
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  }
  return `px-2 py-0.5 rounded text-xs font-bold uppercase ${map[p?.toLowerCase()] || 'bg-gray-100'}`
}
const getAttachmentUrl = (path: string) => {
  if (!path) return '#'
  if (path.startsWith('http') || path.startsWith('https')) return path
  const BASE_API_URL = 'http://localhost:3000'
  return `${BASE_API_URL}${path}`
}
const scrollToBottom = () =>
  nextTick(() => {
    if (logsContainer.value) logsContainer.value.scrollTop = logsContainer.value.scrollHeight
  })
</script>

<style scoped>
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}
.dark ::-webkit-scrollbar-thumb {
  background: #4b5563;
}
</style>
