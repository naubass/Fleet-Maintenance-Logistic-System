import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref('')

  // Fungsi untuk inisialisasi auth saat app pertama kali dibuka
  const initAuth = () => {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')

    if (savedToken && savedUser) {
      token.value = savedToken
      try {
        user.value = JSON.parse(savedUser)
      } catch (e) {
        user.value = null
      }
    }
  }

  const login = async (email, password) => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await res.json()

      if (res.ok && data.success) {
        token.value = data.token
        user.value = data.user

        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))

        return { success: true }
      } else {
        return { success: false, message: data.message || 'Login gagal.' }
      }
    } catch (err) {
      console.error('Login error:', err)
      return { success: false, message: 'Tidak dapat terhubung ke server backend.' }
    }
  }

  const logout = () => {
    token.value = ''
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  // PASTI KAN initAuth JUGA DIEKSPOR DI SINI
  return { user, token, initAuth, login, logout }
})