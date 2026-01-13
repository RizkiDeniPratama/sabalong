import axios from 'axios'
import { useAuthStore } from '../store/auth'
import { API_CONFIG } from '../config/api'
import { validateToken } from '../utils/tokenUtils'

const api = axios.create(API_CONFIG)

api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    
    if (authStore.token) {
      // Validasi token sebelum mengirim request
      const validation = validateToken(authStore.token)
      if (!validation.valid) {
        console.warn('Token invalid saat request:', validation.reason)
        authStore.logout()
        return Promise.reject(new Error('Token expired atau tidak valid'))
      }
      
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
      console.error('AUTENTIKASI GAGAL (401)', error.response.data?.message || 'Unauthorized')

      const authStore = useAuthStore()
      
      // Pastikan logout dipanggil
      authStore.logout()

      // Redirect ke signin jika tidak di landing page
      const currentPath = window.location.pathname
      if (currentPath !== '/' && currentPath !== '/signin') {
        window.location.href = '/signin'
      }
    }

    return Promise.reject(error)
  },
)

export default api
