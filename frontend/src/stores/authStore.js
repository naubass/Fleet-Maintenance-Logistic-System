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

  // Fungsi untuk mengambil profil terbaru dari server backend
  const fetchUserProfile = async () => {
    if (!token.value) return

    try {
      const res = await fetch('http://localhost:5000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token.value}`
        }
      })
      const data = await res.json()

      if (res.ok && data.success && data.user) {
        user.value = data.user
        localStorage.setItem('user', JSON.stringify(data.user))
      }
    } catch (err) {
      console.error('Error fetching user profile:', err)
    }
  }

  // Fungsi helper untuk meng-update state user secara lokal saat diedit
  const updateUserData = (updatedFields) => {
    if (user.value) {
      user.value = { ...user.value, ...updatedFields }
      localStorage.setItem('user', JSON.stringify(user.value))
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

  // EKSPOR SEMUA FUNGSI TERMASUK fetchUserProfile DAN updateUserData
  return { 
    user, 
    token, 
    initAuth, 
    fetchUserProfile, 
    updateUserData, 
    login, 
    logout 
  }
})