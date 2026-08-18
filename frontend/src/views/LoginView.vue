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
    const userRole = (authStore.user?.role || res.user?.role || '').toLowerCase()
    
    if (userRole === 'manager') {
      router.push('/manager/dashboard')
    } else if (userRole === 'mechanic') {
      router.push('/mechanic/dashboard')
    } else if (userRole === 'admin') {
      router.push('/admin/dashboard')
    } else {
      errorMessage.value = 'Peran akun tidak dikenali di sistem.'
    }
  } else {
    errorMessage.value = res.message || 'Gagal masuk ke akun.'
  }
}
</script>

<template>
  <div class="login-wrapper">
    <div class="login-card">
      <div class="form-section">
        <div class="brand">
          <div class="brand-logo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M19 17.5V14M19 14C20.1046 14 21 13.1046 21 12V6C21 4.89543 20.1046 4 19 4H5C3.89543 4 3 4.89543 3 6V18C3 19.1046 3.89543 20 5 20H13.5M19 14H15.5M13 10V6M9 10V6M5 10V6M5 10C5 11.1046 5.89543 12 7 12H9C10.1046 12 11 11.1046 11 10M11 10C11 11.8954 12 13 13 12H15C16.1046 12 17 11.1046 17 10V6M19 17.5L21.5 20M19 17.5L16.5 20"/>
            </svg>
          </div>
          <h2>RawatArmada</h2>
        </div>

        <h1>Masuk ke Akun</h1>
        <p class="subtitle">Kelola pemeliharaan &amp; operasional armada Anda</p>

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
        <!-- Dekorasi lingkaran halus -->
        <div class="glow glow-a"></div>
        <div class="glow glow-b"></div>

        <div class="banner-content">
          <h2>Optimalkan Perbaikan &amp; Servis Armada</h2>
          <p>Pantau jadwal perawatan, ketersediaan sparepart, dan efisiensi kerja mekanik secara real-time.</p>
        </div>

        <!-- Ilustrasi Armada -->
        <div class="illustration">
          <svg viewBox="0 0 420 260" xmlns="http://www.w3.org/2000/svg">
            <!-- Jalan -->
            <rect x="0" y="205" width="420" height="55" fill="#0a2e22" />
            <line x1="0" y1="205" x2="420" y2="205" stroke="rgba(255,255,255,0.12)" stroke-width="2"/>
            <g stroke="rgba(255,255,255,0.18)" stroke-width="3" stroke-dasharray="14 12">
              <line x1="0" y1="232" x2="420" y2="232"/>
            </g>

            <!-- Bayangan truk -->
            <ellipse cx="205" cy="207" rx="150" ry="8" fill="rgba(0,0,0,0.25)" />

            <!-- Box kontainer -->
            <rect x="70" y="90" width="150" height="100" rx="6" fill="#f0fdf4" />
            <rect x="70" y="90" width="150" height="100" rx="6" fill="none" stroke="#d1fae5" stroke-width="1.5" />
            <line x1="70" y1="118" x2="220" y2="118" stroke="#bbf7d0" stroke-width="1.5"/>
            <line x1="70" y1="146" x2="220" y2="146" stroke="#bbf7d0" stroke-width="1.5"/>
            <line x1="70" y1="174" x2="220" y2="174" stroke="#bbf7d0" stroke-width="1.5"/>
            <!-- Logo daun di box -->
            <circle cx="145" cy="140" r="22" fill="#22c55e"/>
            <path d="M145 128c8 0 14 6 14 14 0 6-4 10-9 12-2-6-5-9-5-9s3 4 4 8c-8-1-13-8-13-15 0-5 4-10 9-10z" fill="#0a2e22"/>

            <!-- Kabin -->
            <path d="M220 130h48l24 30v30h-72z" fill="#dcfce7"/>
            <path d="M220 130h48l24 30h-72z" fill="#ffffff"/>
            <!-- jendela -->
            <path d="M232 138h30l16 20h-46z" fill="#0e3a2c"/>
            <!-- lampu -->
            <rect x="284" y="176" width="10" height="8" rx="2" fill="#fde68a"/>

            <!-- Roda -->
            <circle cx="118" cy="196" r="20" fill="#0a2e22"/>
            <circle cx="118" cy="196" r="9" fill="#94a3b8"/>
            <circle cx="255" cy="196" r="20" fill="#0a2e22"/>
            <circle cx="255" cy="196" r="9" fill="#94a3b8"/>

            <!-- Elemen dekor bawah: kotak sparepart kecil -->
            <rect x="330" y="170" width="34" height="30" rx="4" fill="#15803d" opacity="0.85"/>
            <path d="M338 182l6 6 12-12" stroke="#f0fdf4" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>

            <!-- Titik-titik dekor -->
            <circle cx="40" cy="60" r="3" fill="#4ade80" opacity="0.5"/>
            <circle cx="380" cy="50" r="4" fill="#4ade80" opacity="0.4"/>
            <circle cx="355" cy="120" r="3" fill="#4ade80" opacity="0.5"/>
          </svg>
        </div>

        <!-- Kartu statistik mengambang -->
        <div class="float-card float-card--top">
          <span class="float-icon float-icon--check">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
          </span>
          <div>
            <strong>24 Unit</strong>
            <small>Armada Siap Pakai</small>
          </div>
        </div>

        <div class="float-card float-card--bottom">
          <span class="float-icon float-icon--wrench">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
          </span>
          <div>
            <strong>8 Jadwal</strong>
            <small>Servis Bulan Ini</small>
          </div>
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
  background:
    radial-gradient(circle at 15% 20%, rgba(34, 197, 94, 0.10) 0%, transparent 45%),
    radial-gradient(circle at 85% 80%, rgba(34, 197, 94, 0.10) 0%, transparent 45%),
    #f4faf6;
  padding: 1.5rem;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.login-card {
  display: flex;
  width: 100%;
  max-width: 940px;
  background: #ffffff;
  border-radius: 22px;
  box-shadow: 0 25px 50px -12px rgba(14, 58, 44, 0.18);
  overflow: hidden;
}

.form-section {
  flex: 1 1 50%;
  min-width: 0;
  padding: 3rem 2.5rem;
  display: flex;
  flex-direction: column;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
}
.brand-logo {
  width: 38px;
  height: 38px;
  background: #16a34a;
  color: #ffffff;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.brand-logo svg { width: 22px; height: 22px; }
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
.form-group input:focus { border-color: #16a34a; box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.12); }

.btn-login {
  height: 44px;
  background: #16a34a;
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  margin-top: 0.5rem;
  transition: background 0.2s;
}
.btn-login:hover { background: #15803d; }
.btn-login:disabled { opacity: 0.6; cursor: not-allowed; }

.footer-text { margin-top: auto; padding-top: 2rem; font-size: 0.75rem; color: #94a3b8; text-align: center; }

/* ================= BANNER / ILUSTRASI ================= */
.banner-section {
  flex: 1 1 50%;
  min-width: 0;
  position: relative;
  background: linear-gradient(160deg, #0e3a2c 0%, #0a2e22 100%);
  color: #ffffff;
  padding: 2.75rem 2.5rem 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(40px);
  pointer-events: none;
}
.glow-a {
  width: 220px; height: 220px;
  top: -60px; right: -60px;
  background: rgba(34, 197, 94, 0.25);
}
.glow-b {
  width: 180px; height: 180px;
  bottom: 20px; left: -60px;
  background: rgba(74, 222, 128, 0.15);
}

.banner-content {
  position: relative;
  z-index: 2;
  text-align: left;
}
.banner-content h2 { font-size: 1.4rem; font-weight: 700; margin-bottom: 0.6rem; line-height: 1.35; max-width: 320px; }
.banner-content p { font-size: 0.85rem; color: rgba(255, 255, 255, 0.72); line-height: 1.6; max-width: 300px; }

.illustration {
  position: relative;
  z-index: 1;
  margin-top: auto;
}
.illustration svg { width: 100%; height: auto; display: block; }

.float-card {
  position: absolute;
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 0.625rem;
  background: rgba(255, 255, 255, 0.97);
  color: #0f172a;
  padding: 0.6rem 0.875rem;
  border-radius: 12px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.18);
  backdrop-filter: blur(6px);
}
.float-card strong { display: block; font-size: 0.85rem; font-weight: 700; }
.float-card small { font-size: 0.7rem; color: #64748b; }
.float-icon {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.float-icon svg { width: 16px; height: 16px; }
.float-icon--check { background: #dcfce7; color: #16a34a; }
.float-icon--wrench { background: #fef3c7; color: #d97706; }

.float-card--top { top: 2.75rem; right: 1.75rem; }
.float-card--bottom { bottom: 1.5rem; left: 1.75rem; }

@media (max-width: 768px) {
  .login-card { flex-direction: column; }
  .banner-section { display: none; }
}
</style>