/**
 * Composable untuk pengecekan authentication
 * Digunakan di landing page dan komponen lain yang perlu validasi token
 */

import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/store/auth'
import { validateToken, isTokenExpiringSoon } from '@/utils/tokenUtils'

export const useAuthCheck = () => {
  const authStore = useAuthStore()
  const isCheckingAuth = ref(false)
  const tokenCheckInterval = ref<NodeJS.Timeout | null>(null)

  /**
   * Cek validitas token secara manual
   */
  const checkTokenValidity = (): boolean => {
    isCheckingAuth.value = true
    
    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        console.log('No token found in localStorage')
        authStore.logout()
        return false
      }
      
      const validation = validateToken(token)
      if (!validation.valid) {
        console.warn('Token validation failed:', validation.reason)
        authStore.logout()
        return false
      }
      
      // Cek apakah token akan expired dalam 5 menit
      if (isTokenExpiringSoon(token, 5)) {
        console.warn('Token akan expired dalam 5 menit')
        // Bisa ditambahkan logic untuk refresh token di sini
      }
      
      return true
    } catch (error) {
      console.error('Error checking token validity:', error)
      authStore.logout()
      return false
    } finally {
      isCheckingAuth.value = false
    }
  }

  /**
   * Setup periodic token check (setiap 1 menit)
   */
  const startTokenCheck = () => {
    // Cek langsung saat start
    checkTokenValidity()
    
    // Setup interval check setiap 1 menit
    tokenCheckInterval.value = setInterval(() => {
      if (authStore.token) {
        checkTokenValidity()
      }
    }, 60000) // 1 menit
  }

  /**
   * Stop periodic token check
   */
  const stopTokenCheck = () => {
    if (tokenCheckInterval.value) {
      clearInterval(tokenCheckInterval.value)
      tokenCheckInterval.value = null
    }
  }

  /**
   * Force refresh auth state dari localStorage
   */
  const refreshAuthState = () => {
    authStore.refreshAuthState()
  }

  /**
   * Setup lifecycle hooks
   */
  onMounted(() => {
    startTokenCheck()
  })

  onUnmounted(() => {
    stopTokenCheck()
  })

  return {
    isCheckingAuth,
    checkTokenValidity,
    startTokenCheck,
    stopTokenCheck,
    refreshAuthState,
  }
}