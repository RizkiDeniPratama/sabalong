import axios from 'axios'
import { useAuthStore } from '../store/auth'

const api = axios.create({
  baseURL: 'http://localhost:3000/sabalong',
})

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

api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error('AUTENTIKASI GAGAL (401)', error.response.data.message)

      const authStore = useAuthStore()

      // Jalankan fungsi logout
      authStore.logout()

      window.location.href = '/signin'
    }

    return Promise.reject(error)
  },
)

export default api
