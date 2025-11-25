<template>
  <div
    class="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6"
  >
    <div class="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 class="text-lg font-semibold text-gray-800 dark:text-white/90">Recent Orders</h3>
      </div>

      <div class="flex items-center gap-3">
        <button
          class="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
        >
          See all
        </button>
      </div>
    </div>

    <div class="max-w-full overflow-x-auto custom-scrollbar">
      <table class="min-w-full">
        <thead>
          <tr class="border-t border-gray-100 dark:border-gray-800">
            <th class="py-3 text-left">
              <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Tickets</p>
            </th>
            <th class="py-3 text-left">
              <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Request</p>
            </th>
            <th class="py-3 text-left">
              <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Assigned</p>
            </th>
            <th class="py-3 text-left">
              <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Status</p>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="ticket in tickets"
            :key="ticket.id"
            class="border-t border-gray-100 dark:border-gray-800"
          >
            <td class="py-3 whitespace-nowrap">
              <div class="flex items-center gap-3">
                <div>
                  <p class="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                    {{ ticket.ticket_number }}
                  </p>
                  <span class="text-gray-500 text-theme-xs dark:text-gray-400">
                    {{ ticket.service.nama_layanan }}</span
                  >
                </div>
              </div>
            </td>
            <td class="py-3 whitespace-nowrap">
              <p class="text-gray-500 text-theme-sm dark:text-gray-400">
                {{ ticket.requester.nama }}
              </p>
            </td>
            <td class="py-3 whitespace-nowrap">
              <p class="text-gray-500 text-theme-sm dark:text-gray-400">
                {{ ticket.assignee?.nama || 'Belum Ditugaskan' }}
              </p>
            </td>
            <td class="py-3 whitespace-nowrap">
              <span :class="getStatusClass(ticket.status)">
                {{ ticket.status }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface TicketItems {
  id: number
  ticket_number: string
  status: string
  requester: {
    nama: string
  }
  assignee: {
    nama: string | null
  }
  service: {
    nama_layanan: string
  }
}
const props = defineProps<{
  tickets: {
    type: TicketItems[]
  }
}>()

const getStatusClass = (status: string) => {
  const baseClass = 'rounded-full px-2 py-0.5 text-theme-xs font-medium'
  switch (status) {
    case 'pending':
      return `${baseClass} bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-orange-400`
    case 'on_progress':
      return `${baseClass} bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400`
    case 'selesai':
      return `${baseClass} bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500`
    case 'eskalasi':
      return `${baseClass} bg-purple-100 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400`
    case 'closed':
      return `${baseClass} bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500`
    default:
      return `${baseClass} bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400`
  }
}
const products = ref([
  {
    name: 'Macbook pro 13"',
    variants: 2,
    image: '/images/product/product-01.jpg',
    category: 'Laptop',
    price: '$2399.00',
    status: 'Delivered',
  },
  {
    name: 'Apple Watch Ultra',
    variants: 1,
    image: '/images/product/product-02.jpg',
    category: 'Watch',
    price: '$879.00',
    status: 'Pending',
  },
  {
    name: 'iPhone 15 Pro Max',
    variants: 2,
    image: '/images/product/product-03.jpg',
    category: 'SmartPhone',
    price: '$1869.00',
    status: 'Delivered',
  },
  {
    name: 'iPad Pro 3rd Gen',
    variants: 2,
    image: '/images/product/product-04.jpg',
    category: 'Electronics',
    price: '$1699.00',
    status: 'Canceled',
  },
  {
    name: 'Airpods Pro 2nd Gen',
    variants: 1,
    image: '/images/product/product-05.jpg',
    category: 'Accessories',
    price: '$240.00',
    status: 'Delivered',
  },
])
</script>
