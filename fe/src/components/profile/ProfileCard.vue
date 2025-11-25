<template>
  <div class="p-5 mb-6 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
    <div class="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
      <div class="flex flex-col items-center w-full gap-6 xl:flex-row">
        <div
          class="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800 flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-2xl font-bold text-gray-500 dark:text-gray-300"
        >
          {{ getInitials(user.nama) }}
        </div>

        <div class="order-3 xl:order-2 text-center xl:text-left">
          <h4 class="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
            {{ user.nama || 'User Name' }}
          </h4>
          <div class="flex flex-col items-center gap-1 xl:flex-row xl:gap-3 xl:text-left">
            <p class="text-sm text-gray-500 dark:text-gray-400 capitalize">
              {{ user.role?.role_name || 'Role' }}
            </p>
            <div class="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
            <p class="text-sm text-gray-500 dark:text-gray-400">{{ user.instansi || '-' }}</p>
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

console.log('USER:', props.user.role.role_name)

const getInitials = (name) => {
  if (!name) return '?'
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}
</script>
