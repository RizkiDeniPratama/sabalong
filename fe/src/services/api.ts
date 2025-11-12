import axios from 'axios'
import { useAuthStore } from '../store/auth'
// Kita tidak bisa impor router di sini karena akan menyebabkan circular dependency
// Jadi kita akan gunakan cara 'window.location'

const api = axios.create({
  baseURL: 'http://localhost:3000/sabalong', // Alamat Backend
})

// Interceptor 1: MENEMPELKAN TOKEN (Request)
// (Kode ini sudah Anda miliki)
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    if (authStore.token) {
      config.headers['Authorization'] = `Bearer ${authStore.token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// --- TAMBAHKAN BLOK BARU INI---
// Interceptor 2: MENANGANI ERROR (Response)
api.interceptors.response.use(
  (response) => {
    // Jika respons sukses (status 2xx), langsung kembalikan
    return response
  },
  (error) => {
    // Jika respons gagal
    if (error.response && error.response.status === 401) {
      // Ini adalah error "Token tidak valid atau expired"
      console.error('AUTENTIKASI GAGAL (401)', error.response.data.message)

      // Panggil "Otak" (Pinia)
      const authStore = useAuthStore()

      // Jalankan fungsi logout
      authStore.logout()

      // Paksa reload dan arahkan ke halaman login
      // Ini adalah cara teraman untuk 'reset' aplikasi
      window.location.href = '/signin'
    }

    // Kembalikan error agar blok .catch() di komponen (misal Dashboard)
    // tetap bisa menanganinya jika itu BUKAN error 401
    return Promise.reject(error)
  },
)
// --- BATAS BLOK BARU ---

export default api
