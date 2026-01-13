<template>
  <aside
    :class="[
      'fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-99999 border-r border-gray-200',
      {
        'lg:w-[290px]': isExpanded || isMobileOpen || isHovered,
        'lg:w-[90px]': !isExpanded && !isHovered,
        'translate-x-0 w-[290px]': isMobileOpen,
        '-translate-x-full': !isMobileOpen,
        'lg:translate-x-0': true,
      },
    ]"
    @mouseenter="!isExpanded && (isHovered = true)"
    @mouseleave="isHovered = false"
  >
    <div :class="['py-8 flex', !isExpanded && !isHovered ? 'lg:justify-center' : 'justify-start']">
      <router-link to="/" class="flex items-center gap-3">
        <!-- Logo saat expanded -->
        <template v-if="isExpanded || isHovered || isMobileOpen">
          <!-- Light mode -->
          <img
            class="block dark:hidden"
            src="../../../images/logo/sabalong.png"
            alt="Logo"
            width="40"
            height="40"
          />
          <!-- Dark mode -->
          <img
            class="hidden dark:block"
            src="../../../images/logo/sabalong.png"
            alt="Logo"
            width="40"
            height="40"
          />

          <!-- Teks saat expanded -->
          <span class="text-xl font-semibold text-gray-800 dark:text-white"> SABALONG </span>
        </template>

        <!-- Logo saat collapsed -->
        <template v-else>
          <!-- Light mode -->
          <img
            class="block dark:hidden"
            src="../../../images/logo/sabalong.png"
            alt="Logo"
            width="32"
            height="32"
          />

          <!-- Dark mode -->
          <img
            class="hidden dark:block"
            src="../../../images/logo/sabalong.png"
            alt="Logo"
            width="32"
            height="32"
          />
        </template>
      </router-link>
    </div>
    <div class="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
      <nav class="mb-6">
        <div class="flex flex-col gap-4">
          <div v-for="(menuGroup, groupIndex) in roleBasedMenuGroups" :key="groupIndex">
            <h2
              :class="[
                'mb-4 text-xs uppercase flex leading-[20px] text-gray-400',
                !isExpanded && !isHovered ? 'lg:justify-center' : 'justify-start',
              ]"
            >
              <template v-if="isExpanded || isHovered || isMobileOpen">
                {{ menuGroup.title }}
              </template>
              <HorizontalDots v-else />
            </h2>
            <ul class="flex flex-col gap-4">
              <li v-for="(item, index) in menuGroup.items" :key="item.name">
                <button
                  v-if="item.subItems"
                  @click="toggleSubmenu(groupIndex, index)"
                  :class="[
                    'menu-item group w-full',
                    {
                      'menu-item-active': isSubmenuOpen(groupIndex, index),
                      'menu-item-inactive': !isSubmenuOpen(groupIndex, index),
                    },
                    !isExpanded && !isHovered ? 'lg:justify-center' : 'lg:justify-start',
                  ]"
                >
                  <span
                    :class="[
                      isSubmenuOpen(groupIndex, index)
                        ? 'menu-item-icon-active'
                        : 'menu-item-icon-inactive',
                    ]"
                  >
                    <component :is="item.icon" />
                  </span>
                  <span v-if="isExpanded || isHovered || isMobileOpen" class="menu-item-text">{{
                    item.name
                  }}</span>
                  <ChevronDownIcon
                    v-if="isExpanded || isHovered || isMobileOpen"
                    :class="[
                      'ml-auto w-5 h-5 transition-transform duration-200',
                      {
                        'rotate-180 text-brand-500': isSubmenuOpen(groupIndex, index),
                      },
                    ]"
                  />
                </button>
                <router-link
                  v-else-if="item.path"
                  :to="item.path"
                  :class="[
                    'menu-item group',
                    {
                      'menu-item-active': isActive(item.path),
                      'menu-item-inactive': !isActive(item.path),
                    },
                  ]"
                >
                  <span
                    :class="[
                      isActive(item.path) ? 'menu-item-icon-active' : 'menu-item-icon-inactive',
                    ]"
                  >
                    <component :is="item.icon" />
                  </span>
                  <span v-if="isExpanded || isHovered || isMobileOpen" class="menu-item-text">{{
                    item.name
                  }}</span>
                </router-link>
                <transition
                  @enter="startTransition"
                  @after-enter="endTransition"
                  @before-leave="startTransition"
                  @after-leave="endTransition"
                >
                  <div
                    v-show="
                      isSubmenuOpen(groupIndex, index) && (isExpanded || isHovered || isMobileOpen)
                    "
                  >
                    <ul class="mt-2 space-y-1 ml-9">
                      <li v-for="subItem in item.subItems" :key="subItem.name">
                        <router-link
                          :to="subItem.path"
                          :class="[
                            'menu-dropdown-item',
                            {
                              'menu-dropdown-item-active': isActive(subItem.path),
                              'menu-dropdown-item-inactive': !isActive(subItem.path),
                            },
                          ]"
                        >
                          {{ subItem.name }}
                          <span class="flex items-center gap-1 ml-auto">
                            <span
                              v-if="subItem.new"
                              :class="[
                                'menu-dropdown-badge',
                                {
                                  'menu-dropdown-badge-active': isActive(subItem.path),
                                  'menu-dropdown-badge-inactive': !isActive(subItem.path),
                                },
                              ]"
                            >
                              new
                            </span>
                            <span
                              v-if="subItem.pro"
                              :class="[
                                'menu-dropdown-badge',
                                {
                                  'menu-dropdown-badge-active': isActive(subItem.path),
                                  'menu-dropdown-badge-inactive': !isActive(subItem.path),
                                },
                              ]"
                            >
                              pro
                            </span>
                          </span>
                        </router-link>
                      </li>
                    </ul>
                  </div>
                </transition>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../../store/auth'

import {
  GridIcon,
  UserCircleIcon,
  ListIcon,
  TableIcon,
  PageIcon,
  PieChartIcon,
  BarChartIcon,
  ChevronDownIcon,
  HorizontalDots,
} from '../../icons'
import { useSidebar } from '@/composables/useSidebar'

const route = useRoute()
const { isExpanded, isMobileOpen, isHovered, openSubmenu } = useSidebar()
const authStore = useAuthStore()

const userRole = computed(() => authStore.userRole)

// --- DEFINISIKAN MENU UNTUK SETIAP ROLE ---
const userMenu = [
  {
    title: 'MENU',
    items: [
      { icon: GridIcon, name: 'Dashboard Saya', path: '/user/dashboard' },
      { icon: TableIcon, name: 'Tiket Saya', path: '/user/tickets' },
      { icon: ListIcon, name: 'Buat Tiket Baru', path: '/user/tickets/create' },
      { icon: UserCircleIcon, name: 'Profil Saya', path: '/profile' },
    ],
  },
]

const petugasMenu = [
  {
    title: 'MENU',
    items: [
      { icon: GridIcon, name: 'Dashboard Tugas', path: '/petugas/dashboard' },
      { icon: TableIcon, name: 'Riwayat Tiket Saya', path: '/petugas/tickets' },
      { icon: PageIcon, name: 'Laporan Feedback', path: '/petugas/feedbacks' },
      { icon: UserCircleIcon, name: 'Profil Saya', path: '/profile' },
    ],
  },
]

const adminMenu = [
  {
    title: 'Dashboard',
    items: [{ icon: PieChartIcon, name: 'Dashboard Analitik', path: '/admin/dashboard' }],
  },
  {
    title: 'MANAJEMEN',
    items: [
      { icon: UserCircleIcon, name: 'Manajemen Pengguna', path: '/manage-users' },
      { icon: TableIcon, name: 'Manajemen Tiket', path: '/admin/tickets' },
      { icon: ListIcon, name: 'Manajemen Layanan', path: '/manage-services' },
      { icon: PageIcon, name: 'Laporan Feedback', path: '/admin/feedbacks' },
      { icon: BarChartIcon, name: 'SLA Ranking', path: '/admin/sla-ranking' },
      {
        icon: GridIcon,
        name: 'Pengaturan Master',
        subItems: [
          { name: 'Kelola SLA', path: '/admin/manage-sla' },
          { name: 'Kelola Skills', path: '/admin/manage-skills' },
          { name: 'Kelola Roles', path: '/admin/manage-roles' },
        ],
      },
    ],
  },
  {
    title: 'AKUN',
    items: [{ icon: UserCircleIcon, name: 'Profil Saya', path: '/profile' }],
  },
]

const pimpinanMenu = [
  {
    title: 'MENU',
    items: [
      { icon: PieChartIcon, name: 'Dashboard Analitik', path: '/admin/dashboard' },
      { icon: TableIcon, name: 'Daftar Tiket', path: '/admin/tickets' },
      { icon: PageIcon, name: 'Laporan Feedback', path: '/admin/feedbacks' },
      { icon: BarChartIcon, name: 'SLA Ranking', path: '/admin/sla-ranking' },
      { icon: UserCircleIcon, name: 'Profil Saya', path: '/profile' },
    ],
  },
]

const roleBasedMenuGroups = computed(() => {
  switch (userRole.value) {
    case 'admin':
      return adminMenu
    case 'pimpinan':
      return pimpinanMenu
    case 'petugas':
      return petugasMenu
    case 'user':
      return userMenu
    default:
      return []
  }
})

const isActive = (path) => route.path === path

const toggleSubmenu = (groupIndex, itemIndex) => {
  const key = `${groupIndex}-${itemIndex}`
  openSubmenu.value = openSubmenu.value === key ? null : key
}

const isAnySubmenuRouteActive = computed(() => {
  return roleBasedMenuGroups.value.some((group) =>
    group.items.some(
      (item) => item.subItems && item.subItems.some((subItem) => isActive(subItem.path)),
    ),
  )
})

const isSubmenuOpen = (groupIndex, itemIndex) => {
  const key = `${groupIndex}-${itemIndex}`
  const items = roleBasedMenuGroups.value[groupIndex]?.items
  if (!items) return false

  return (
    openSubmenu.value === key ||
    (isAnySubmenuRouteActive.value &&
      items[itemIndex]?.subItems?.some((subItem) => isActive(subItem.path)))
  )
}

const startTransition = (el) => {
  el.style.height = 'auto'
  const height = el.scrollHeight
  el.style.height = '0px'
  el.offsetHeight // force reflow
  el.style.height = height + 'px'
}

const endTransition = (el) => {
  el.style.height = ''
}
</script>
