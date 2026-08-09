import { defineStore } from 'pinia'
import api from '../services/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    userRole: (state) => state.user?.profile?.role || 'mechanic',
    userName: (state) => state.user?.profile?.full_name || 'User'
  },

  actions: {
    async login(email, password) {
      this.loading = true
      this.error = null

      try {
        const response = await api.post('/auth/login', { email, password })
        const { token, user } = response.data

        this.token = token
        this.user = user

        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))

        api.defaults.headers.common['Authorization'] = `Bearer ${token}`

        return { success: true }
      } catch (err) {
        this.error = err.response?.data?.message || 'Login gagal. Periksa kembali email dan password Anda.'
        return { success: false, message: this.error }
      } finally {
        this.loading = false
      }
    },

    logout() {
      this.user = null
      this.token = null
      this.error = null

      localStorage.removeItem('token')
      localStorage.removeItem('user')

      delete api.defaults.headers.common['Authorization']
    },

    initAuth() {
      if (this.token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
      }
    }
  }
})