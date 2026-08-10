<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const isLoading = ref(false)

const handleLogin = async () => {
  errorMessage.value = ''
  isLoading.value = true

  const res = await authStore.login(email.value, password.value)
  isLoading.value = false

  if (res.success) {
    // ARAHKAN TEPAT KE ROUTE ADMIN DASHBOARD
    router.push('/admin/dashboard')
  } else {
    errorMessage.value = res.message
  }
}
</script>

<template>
  <div class="login-wrapper">
    <div class="login-card">
      <div class="form-section">
        <div class="brand">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M19 17.5V14M19 14C20.1046 14 21 13.1046 21 12V6C21 4.89543 20.1046 4 19 4H5C3.89543 4 3 4.89543 3 6V18C3 19.1046 3.89543 20 5 20H13.5M19 14H15.5M13 10V6M9 10V6M5 10V6M5 10C5 11.1046 5.89543 12 7 12H9C10.1046 12 11 11.1046 11 10M11 10C11 11.8954 12 13 13 12H15C16.1046 12 17 11.1046 17 10V6M19 17.5L21.5 20M19 17.5L16.5 20"/>
          </svg>
          <h2>FleetRepair</h2>
        </div>

        <h1>Masuk ke Akun</h1>
        <p class="subtitle">Kelola pemeliharaan & operasional armada Anda</p>

        <div v-if="errorMessage" class="error-alert">
          {{ errorMessage }}
        </div>

        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <label>Email Address</label>
            <input v-model="email" type="email" required placeholder="admin@fleet.com" />
          </div>

          <div class="form-group">
            <label>Password</label>
            <input v-model="password" type="password" required placeholder="••••••••" />
          </div>

          <button type="submit" class="btn-login" :disabled="isLoading">
            {{ isLoading ? 'Memproses...' : 'Masuk ke Aplikasi' }}
          </button>
        </form>

        <p class="footer-text">&copy; 2026 Fleet Maintenance System &bull; All Rights Reserved</p>
      </div>

      <div class="banner-section">
        <div class="banner-content">
          <div class="illustration-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M19 17.5V14M19 14C20.1046 14 21 13.1046 21 12V6C21 4.89543 20.1046 4 19 4H5C3.89543 4 3 4.89543 3 6V18C3 19.1046 3.89543 20 5 20H13.5"/>
            </svg>
          </div>
          <h2>Optimalkan Perbaikan & Servis Armada</h2>
          <p>Pantau jadwal perawatan, ketersediaan sparepart, dan efisiensi kerja mekanik secara real-time.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  padding: 1.5rem;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.login-card {
  display: grid;
  grid-template-columns: 1fr 1fr;
  width: 100%;
  max-width: 900px;
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
  overflow: hidden;
}

.form-section {
  padding: 3rem 2.5rem;
  display: flex;
  flex-direction: column;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  color: #2563eb;
  margin-bottom: 2rem;
}
.brand svg { width: 28px; height: 28px; }
.brand h2 { font-size: 1.25rem; font-weight: 700; color: #0f172a; }

.form-section h1 { font-size: 1.65rem; font-weight: 700; color: #0f172a; margin-bottom: 0.25rem; }
.subtitle { font-size: 0.875rem; color: #64748b; margin-bottom: 1.75rem; }

.error-alert {
  background: #fef2f2;
  color: #dc2626;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.85rem;
  margin-bottom: 1rem;
  border: 1px solid #fecaca;
}

form { display: flex; flex-direction: column; gap: 1.25rem; }
.form-group { display: flex; flex-direction: column; gap: 0.375rem; }
.form-group label { font-size: 0.8rem; font-weight: 600; color: #475569; }
.form-group input {
  height: 44px;
  padding: 0 1rem;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  font-size: 0.9rem;
  outline: none;
  transition: all 0.2s;
}
.form-group input:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }

.btn-login {
  height: 44px;
  background: #2563eb;
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  margin-top: 0.5rem;
  transition: background 0.2s;
}
.btn-login:hover { background: #1d4ed8; }
.btn-login:disabled { opacity: 0.6; cursor: not-allowed; }

.footer-text { margin-top: auto; padding-top: 2rem; font-size: 0.75rem; color: #94a3b8; text-align: center; }

.banner-section {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: #ffffff;
  padding: 3rem 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.banner-content { max-width: 320px; }
.illustration-box {
  width: 120px;
  height: 120px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.illustration-box svg { width: 54px; height: 54px; color: #38bdf8; }
.banner-content h2 { font-size: 1.35rem; font-weight: 700; margin-bottom: 0.75rem; line-height: 1.3; }
.banner-content p { font-size: 0.85rem; color: #94a3b8; line-height: 1.6; }

@media (max-width: 768px) {
  .login-card { grid-template-columns: 1fr; }
  .banner-section { display: none; }
}
</style>