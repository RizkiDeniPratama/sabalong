<template>
  <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
    <h2 class="text-xl font-semibold text-gray-800 dark:text-white/90" x-text="pageTitle">
      {{ pageTitle }}
    </h2>
    <nav>
      <ol class="flex items-center gap-1.5">
        <li>
          <router-link
            class="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400"
            :to="homeRoute"
          >
            Home
            <svg
              class="stroke-current"
              width="17"
              height="16"
              viewBox="0 0 17 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6.0765 12.667L10.2432 8.50033L6.0765 4.33366"
                stroke=""
                stroke-width="1.2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </router-link>
        </li>
        <li class="text-sm text-gray-800 dark:text-white/90">
          {{ pageTitle }}
        </li>
      </ol>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/store/auth'

interface BreadcrumbProps {
  pageTitle: string
}

defineProps<BreadcrumbProps>()

const authStore = useAuthStore()

const homeRoute = computed(() => {
  if (!authStore.isAuthenticated) {
    return { name: 'LandingPage' }
  }
  switch (authStore.userRole) {
    case 'admin':
      return { name: 'Analytic' }
    case 'petugas':
      return { name: 'PetugasDashboard' }
    case 'user':
      return { name: 'UserDashboard' }
    default:
      return { name: 'LandingPage' }
  }
})
</script>
