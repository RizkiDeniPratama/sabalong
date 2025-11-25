<template>
  <admin-layout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />

    <div v-if="loading" class="py-20 text-center">
      <div
        class="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-brand-600"
      ></div>
      <p class="mt-4 text-gray-500">Memuat profil...</p>
    </div>

    <div
      v-else
      class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6"
    >
      <h3 class="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
        Profile Saya
      </h3>

      <profile-card :user="user" />
      <personal-info-card :user="user" />
    </div>
  </admin-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AdminLayout from '../../components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import ProfileCard from '../../components/profile/ProfileCard.vue'
import PersonalInfoCard from '../../components/profile/PersonalInfoCard.vue'
import api from '@/services/api'

const currentPageTitle = ref('User Profile')
const user = ref({})
const loading = ref(true)

const fetchProfile = async () => {
  loading.value = true
  try {
    // GET /users/profile
    const res = await api.get('/users/profile')
    if (res.data.success) {
      user.value = res.data.data
    }
  } catch (err) {
    console.error('Gagal load profile', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchProfile()
})
</script>
