// src/stores/auth.ts
import { defineStore } from 'pinia'
import api from '../services/api' // "Kurir" kita (dibuat di langkah 4)
import router from '../router'

// Tentukan "tipe" data untuk User kita (ini manfaat TS)
interface User {
  id: number
  nama: string
  email: string
  role: string
}

// Ambil data dari localStorage
const storedUser: User | null = JSON.parse(localStorage.getItem('user') || 'null')
const storedToken: string | null = localStorage.getItem('token')

export const useAuthStore = defineStore('auth', {
  // 1. STATE (Data)
  state: () => ({
    token: storedToken as string | null,
    user: storedUser as User | null,
  }),

  // 2. GETTERS (Membaca data)
  getters: {
    isAuthenticated: (state): boolean => !!state.token && !!state.user,
    userRole: (state): string | null => state.user?.role || null,
  },

  // 3. ACTIONS (Mengubah data)
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
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      router.push({ name: 'LandingPage' })
    },
  },
})
