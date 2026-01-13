import { defineStore } from 'pinia'
import api from '../services/api'
import router from '../router'
import { validateToken, isTokenExpired } from '../utils/tokenUtils'

interface User {
  id: number
  nama: string
  email: string
  role: string
}

const storedUser: User | null = JSON.parse(localStorage.getItem('user') || 'null')
const storedToken: string | null = localStorage.getItem('token')

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: storedToken as string | null,
    user: storedUser as User | null,
    intendedUrl: null as string | null,
  }),

  getters: {
    isAuthenticated: (state): boolean => {
      if (!state.token || !state.user) return false
      
      // Validasi token dengan utility function
      const validation = validateToken(state.token)
      if (!validation.valid) {
        console.warn('Token validation failed:', validation.reason)
        // Auto logout jika token tidak valid
        const store = useAuthStore()
        store.logout()
        return false
      }
      
      return true
    },
    userRole: (state): string | null => state.user?.role || null,
  },

  actions: {
    async login(credentials: any) {
      try {
        const response = await api.post('/auth/login', credentials)
        const token = response.data.data.access_token
        const user = response.data.data.user
        
        // Validasi token sebelum menyimpan
        const validation = validateToken(token)
        if (!validation.valid) {
          throw new Error(`Token tidak valid: ${validation.reason}`)
        }
        
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        this.token = token
        this.user = user
        console.log('Login BERHASIL, user:', user.role)
        return true
      } catch (error) {
        this.logout()
        throw error
      }
    },

    logout() {
      console.log('Logout: Clearing all auth data')
      this.token = null
      this.user = null
      this.intendedUrl = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      
      // Clear any other auth-related data
      localStorage.removeItem('refreshToken')
      
      // Redirect ke landing page
      if (router.currentRoute.value.name !== 'LandingPage') {
        router.push({ name: 'LandingPage' })
      }
    },

    /**
     * Cek validitas token secara manual
     * Berguna untuk dipanggil di landing page atau komponen lain
     */
    checkTokenValidity(): boolean {
      if (!this.token) return false
      
      const validation = validateToken(this.token)
      if (!validation.valid) {
        console.warn('Token check failed:', validation.reason)
        this.logout()
        return false
      }
      
      return true
    },

    /**
     * Force refresh auth state dari localStorage
     * Berguna setelah logout untuk memastikan state bersih
     */
    refreshAuthState() {
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')
      
      if (token && user) {
        const validation = validateToken(token)
        if (validation.valid) {
          this.token = token
          this.user = JSON.parse(user)
        } else {
          this.logout()
        }
      } else {
        this.token = null
        this.user = null
      }
    },

    setIntendedUrl(url: string) {
      this.intendedUrl = url
      console.log('Intended URL set:', url)
    },

    getAndClearIntendedUrl(): string | null {
      const url = this.intendedUrl
      this.intendedUrl = null
      console.log('Getting and clearing intended URL:', url)
      return url
    },
  },
})
