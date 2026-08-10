<script setup>
import { defineEmits } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'

const emit = defineEmits(['toggle-sidebar'])
const authStore = useAuthStore()
const router = useRouter()

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <header class="navbar-modern">
    <div class="navbar-left">
      <!-- Tombol Hamburger Toggle Sidebar -->
      <button @click="emit('toggle-sidebar')" class="btn-toggle" title="Toggle Sidebar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      </button>
    </div>

    <div class="navbar-right">
      <div class="user-profile">
        <div class="avatar">
          {{ authStore.user?.full_name ? authStore.user.full_name.substring(0, 2).toUpperCase() : 'AD' }}
        </div>
        <div class="user-info">
          <span class="user-name">{{ authStore.user?.full_name || 'Naufal Admin' }}</span>
          <span class="user-role">{{ authStore.user?.role || 'Admin' }}</span>
        </div>
      </div>

      <button @click="handleLogout" class="btn-logout" title="Logout">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
        <span class="logout-text">Logout</span>
      </button>
    </div>
  </header>
</template>

<style scoped>
.navbar-modern {
  height: 75px;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
}

.btn-toggle {
  width: 38px;
  height: 38px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #334155;
  transition: all 0.2s;
}
.btn-toggle svg { width: 20px; height: 20px; }
.btn-toggle:hover { background: #f1f5f9; color: #2563eb; }

.navbar-right {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.avatar {
  width: 38px;
  height: 38px;
  background: #fef08a;
  color: #854d0e;
  font-weight: 700;
  font-size: 0.85rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name { font-size: 0.875rem; font-weight: 700; color: #0f172a; }
.user-role { font-size: 0.75rem; color: #64748b; text-transform: capitalize; }

.btn-logout {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.875rem;
  border: 1px solid #fecaca;
  background: #fef2f2;
  color: #dc2626;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.825rem;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-logout svg { width: 16px; height: 16px; }
.btn-logout:hover { background: #fee2e2; }

@media (max-width: 640px) {
  .user-info, .logout-text { display: none; }
  .navbar-modern { padding: 0 1rem; }
}
</style>