<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const userInitials = computed(() => {
  const name = authStore.user?.full_name || 'Mechanic'
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()
})

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <header class="topbar">
    <div class="topbar-left">
      <div class="mode-badge">
        <span class="mode-dot"></span>
        <span>Workshop Mode</span>
      </div>
    </div>

    <div class="topbar-right">
      <div class="user-profile">
        <div class="avatar">{{ userInitials }}</div>
        <div class="user-meta">
          <strong class="user-name">{{ authStore.user?.full_name || 'Teknisi Mekanik' }}</strong>
          <small class="user-role">Mekanik</small>
        </div>
      </div>

      <button @click="handleLogout" class="btn-logout" title="Keluar dari sesi">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon-logout">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        <span>Logout</span>
      </button>
    </div>
  </header>
</template>

<style scoped>
.topbar {
  height: 70px;
  background: #ffffff;
  border-bottom: 1px solid #e6f4ea;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  position: sticky;
  top: 0;
  z-index: 10;
}

.mode-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.85rem;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #15803d;
  border-radius: 99px;
  font-size: 0.75rem;
  font-weight: 700;
}

.mode-dot {
  width: 7px;
  height: 7px;
  background: #22c55e;
  border-radius: 50%;
}

.topbar-right {
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
  background: #dcfce7;
  color: #15803d;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.85rem;
}

.user-meta {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 0.875rem;
  font-weight: 700;
  color: #0f172a;
}

.user-role {
  font-size: 0.72rem;
  color: #64748b;
}

.btn-logout {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0.85rem;
  background: #ffffff;
  border: 1px solid #fecaca;
  color: #dc2626;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-logout:hover {
  background: #fef2f2;
}

.icon-logout {
  width: 15px;
  height: 15px;
}

@media (max-width: 768px) {
  .topbar { padding: 0 1rem; }
}
</style>