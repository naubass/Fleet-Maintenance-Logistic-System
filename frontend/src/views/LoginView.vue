<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const email = ref('')
const password = ref('')
const authStore = useAuthStore()
const router = useRouter()

const handleLogin = async () => {
  const result = await authStore.login(email.value, password.value)
  if (result.success) {
    router.push('/')
  }
}
</script>

<template>
  <div class="login-page">
    <div class="split-container">
      
      <!-- Sisi Kiri: Form Login -->
      <div class="form-section">
        <div class="brand-header">
          <div class="brand-logo">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
              <path d="M15 18H9"/>
              <path d="M19 18h2a1 1 0 0 0 1-1v-3.28a1 1 0 0 0-.684-.948l-1.923-.641a1 1 0 0 1-.578-.502l-1.531-3.062A1 1 0 0 0 16.382 9H14"/>
              <circle cx="7.5" cy="18.5" r="2.5"/>
              <circle cx="16.5" cy="18.5" r="2.5"/>
            </svg>
            <span>FleetRepair</span>
          </div>
          <h3>Masuk ke Akun</h3>
          <p class="subtitle">Kelola pemeliharaan & operasional armada Anda</p>
        </div>

        <!-- Alert Error -->
        <div v-if="authStore.error" class="alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span>{{ authStore.error }}</span>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="email">Email Address</label>
            <div class="input-wrapper">
              <input
                id="email"
                v-model="email"
                type="email"
                placeholder="nama@perusahaan.com"
                required
                :disabled="authStore.loading"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <div class="input-wrapper">
              <input
                id="password"
                v-model="password"
                type="password"
                placeholder="••••••••"
                required
                :disabled="authStore.loading"
              />
            </div>
          </div>

          <button type="submit" class="btn-submit" :disabled="authStore.loading">
            <span v-if="authStore.loading" class="spinner"></span>
            <span>{{ authStore.loading ? 'Memproses...' : 'Masuk ke Aplikasi' }}</span>
          </button>
        </form>

        <footer class="form-footer">
          <p>© 2026 Fleet Maintenance System • All Rights Reserved</p>
        </footer>
      </div>

      <!-- Sisi Kanan: Visual Hero Banner -->
      <div class="visual-section">
        <div class="visual-content">
          <div class="illustration-box">
            <!-- Vector Graphic Asset -->
            <svg class="hero-illustration" viewBox="0 0 500 400" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="250" cy="200" r="150" fill="url(#grad1)" opacity="0.15"/>
              <rect x="120" y="240" width="260" height="12" rx="6" fill="#3b82f6" opacity="0.3"/>
              
              <!-- Fleet Truck Graphic -->
              <path d="M140 230 V160 H280 V230 Z" fill="#2563eb"/>
              <path d="M280 180 H330 L360 210 V230 H280 Z" fill="#3b82f6"/>
              <rect x="290" y="188" width="30" height="20" rx="3" fill="#60a5fa"/>
              <circle cx="180" cy="235" r="22" fill="#0f172a"/>
              <circle cx="180" cy="235" r="10" fill="#94a3b8"/>
              <circle cx="320" cy="235" r="22" fill="#0f172a"/>
              <circle cx="320" cy="235" r="10" fill="#94a3b8"/>

              <!-- Maintenance Wrench Tool Graphic -->
              <g transform="translate(310, 100) rotate(25)">
                <rect x="0" y="0" width="16" height="70" rx="8" fill="#f59e0b"/>
                <circle cx="8" cy="8" r="16" fill="#f59e0b"/>
                <circle cx="8" cy="8" r="8" fill="#1e1b4b"/>
              </g>

              <defs>
                <linearGradient id="grad1" x1="100" y1="50" x2="400" y2="350" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#60a5fa"/>
                  <stop offset="1" stop-color="#a855f7"/>
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div class="visual-text">
            <h2>Optimalkan Perbaikan & Servis Armada</h2>
            <p>Pantau jadwal perawatan, ketersediaan sparepart, dan efisiensi kerja mekanik secara real-time.</p>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f1f5f9;
  padding: 1.5rem;
}

.split-container {
  display: grid;
  grid-template-columns: 1fr;
  width: 100%;
  max-width: 960px;
  min-height: 580px;
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 20px 40px -15px rgba(15, 23, 42, 0.12);
  overflow: hidden;
}

@media (min-width: 768px) {
  .split-container {
    grid-template-columns: 1fr 1.1fr;
  }
}

/* Sisi Kiri - Form Section */
.form-section {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 3rem 2.5rem;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 1.25rem;
  font-weight: 800;
  color: #2563eb;
  margin-bottom: 1.5rem;
}

.brand-header h3 {
  font-size: 1.6rem;
  font-weight: 700;
  color: #0f172a;
}

.brand-header .subtitle {
  font-size: 0.875rem;
  color: #64748b;
  margin-top: 0.35rem;
  margin-bottom: 1.75rem;
}

.alert-error {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.85rem;
  margin-bottom: 1.25rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  font-size: 0.825rem;
  font-weight: 600;
  color: #334155;
  margin-bottom: 0.5rem;
}

.form-group input {
  width: 100%;
  padding: 0.8rem 1rem;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.12);
}

.btn-submit {
  width: 100%;
  padding: 0.85rem 1rem;
  background-color: #2563eb;
  color: #ffffff;
  font-weight: 600;
  font-size: 0.925rem;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.2s ease, transform 0.1s ease;
  margin-top: 0.5rem;
}

.btn-submit:hover:not(:disabled) {
  background-color: #1d4ed8;
}

.btn-submit:active:not(:disabled) {
  transform: scale(0.99);
}

.btn-submit:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.form-footer {
  margin-top: 2rem;
  text-align: center;
  font-size: 0.75rem;
  color: #94a3b8;
}

/* Sisi Kanan - Visual Hero Section */
.visual-section {
  display: none;
  background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
  padding: 3rem;
  color: #ffffff;
}

@media (min-width: 768px) {
  .visual-section {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
}

.visual-content {
  text-align: center;
  max-width: 360px;
}

.hero-illustration {
  width: 100%;
  max-width: 280px;
  height: auto;
  margin-bottom: 1.5rem;
}

.visual-text h2 {
  font-size: 1.4rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
  line-height: 1.35;
  color: #f8fafc;
}

.visual-text p {
  font-size: 0.85rem;
  color: #94a3b8;
  line-height: 1.5;
}

/* Loading Spinner */
.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #ffffff;
  border-bottom-color: transparent;
  border-radius: 50%;
  display: inline-block;
  animation: rotation 1s linear infinite;
}

@keyframes rotation {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>