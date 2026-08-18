<script setup>
import { computed, onMounted, defineEmits } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'

const emit = defineEmits(['toggle-sidebar'])
const authStore = useAuthStore()
const router = useRouter()

const user = computed(() => authStore.user || {})

const userInitials = computed(() => {
  const name = user.value.full_name
  if (!name) return 'MG'
  
  const parts = name.trim().split(' ').filter(Boolean)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
})

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

onMounted(async () => {
  if (authStore.fetchUserProfile) {
    await authStore.fetchUserProfile()
  }
})
</script>

<template>
  <header class="navbar-modern">
    <div class="navbar-left">
      <button @click="emit('toggle-sidebar')" class="btn-toggle" title="Toggle Sidebar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      </button>
      <div class="executive-badge">
        <span class="badge-dot"></span>
        <span>Executive Mode</span>
      </div>
    </div>

    <div class="navbar-right">
      <div class="user-profile">
        <div class="avatar">
          {{ userInitials }}
        </div>
        <div class="user-info">
          <span class="user-name">{{ user.full_name || 'Manager User' }}</span>
          <span class="user-role">{{ user.role || 'Manager' }}</span>
        </div>
      </div>

      <button @click="handleLogout" class="btn-logout" title="Logout">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
        </svg>
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

.navbar-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn-toggle {
  width: 38px;
  height: 38px;
  border-radius: 8px;
  border: 1px solid #d1e7dd;
  background: #f0fdf6;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #0f3d2e;
  transition: all 0.2s;
}
.btn-toggle svg { width: 20px; height: 20px; }
.btn-toggle:hover { background: #dcfce7; color: #15803d; }

.executive-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #166534;
  padding: 0.25rem 0.65rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
}

.badge-dot {
  width: 6px;
  height: 6px;
  background-color: #22c55e;
  border-radius: 50%;
}

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
  background: #dcfce7;
  color: #166534;
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
  .user-info, .logout-text, .executive-badge { display: none; }
  .navbar-modern { padding: 0 1rem; }
}
</style>