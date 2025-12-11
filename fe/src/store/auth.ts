import { defineStore } from 'pinia'
import api from '../services/api'
import router from '../router'

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
    isAuthenticated: (state): boolean => !!state.token && !!state.user,
    userRole: (state): string | null => state.user?.role || null,
  },

  actions: {
    async login(credentials: any) {
      try {
        const response = await api.post('/auth/login', credentials)
        const token = response.data.data.access_token
        const user = response.data.data.user
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
      this.token = null
      this.user = null
      this.intendedUrl = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      router.push({ name: 'LandingPage' })
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
