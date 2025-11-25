<template>
  <div class="p-5 mb-6 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
    <div class="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
      <div class="w-full">
        <h4 class="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
          Informasi Pribadi
        </h4>

        <div class="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
          <div>
            <p class="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">Nama Lengkap</p>
            <p class="text-sm font-medium text-gray-800 dark:text-white/90">{{ user.nama }}</p>
          </div>

          <div>
            <p class="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">Email</p>
            <p class="text-sm font-medium text-gray-800 dark:text-white/90">{{ user.email }}</p>
          </div>

          <div>
            <p class="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">Role</p>
            <p class="text-sm font-medium text-gray-800 dark:text-white/90 capitalize">
              {{ user.role?.role_name || '-' }}
            </p>
          </div>

          <div>
            <p class="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
              Instansi / Departemen
            </p>
            <p class="text-sm font-medium text-gray-800 dark:text-white/90">
              {{ user.instansi || '-' }}
            </p>
          </div>

          <div v-if="user.skills && user.skills.length > 0" class="col-span-1 lg:col-span-2">
            <p class="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
              Keahlian (Skills)
            </p>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="s in user.skills"
                :key="s.id"
                class="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded border border-blue-100"
              >
                {{ s.skill.skill_name }} ({{ s.level }})
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  user: {
    type: Object,
    default: () => ({}),
  },
})
</script>
