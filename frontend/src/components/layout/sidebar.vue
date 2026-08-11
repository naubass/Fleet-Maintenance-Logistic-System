<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  isOpen: Boolean
})

const emit = defineEmits(['close'])

const closeSidebar = () => {
  emit('close')
}

// Tutup sidebar otomatis HANYA jika berada di layar mobile (<= 768px)
const handleNavClick = () => {
  if (window.innerWidth <= 768) {
    closeSidebar()
  }
}
</script>

<template>
  <!-- Overlay Backdrop Khusus Mobile -->
  <div 
    v-if="isOpen" 
    class="sidebar-overlay" 
    @click="closeSidebar"
  ></div>

  <aside :class="['sidebar', { 'is-closed': !isOpen }]">
    <div class="sidebar-brand">
      <div class="brand-logo">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M19 17.5V14M19 14C20.1046 14 21 13.1046 21 12V6C21 4.89543 20.1046 4 19 4H5C3.89543 4 3 4.89543 3 6V18C3 19.1046 3.89543 20 5 20H13.5M19 14H15.5M13 10V6M9 10V6M5 10V6M5 10C5 11.1046 5.89543 12 7 12H9C10.1046 12 11 11.1046 11 10M11 10C11 11.8954 12 13 13 12H15C16.1046 12 17 11.1046 17 10V6M19 17.5L21.5 20M19 17.5L16.5 20"/>
        </svg>
      </div>
      <h2 class="brand-title">FleetRepair</h2>
      <button @click="closeSidebar" class="btn-close-mobile">&times;</button>
    </div>

    <nav class="sidebar-nav">
      <router-link to="/admin/dashboard" class="nav-item" @click="handleNavClick">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
        <span>Dashboard</span>
      </router-link>

      <router-link to="/admin/vehicles" class="nav-item" @click="handleNavClick">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/><path d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1h2m4 0h1a1 1 0 001-1v-4a1 1 0 00-.293-.707l-3-3A1 1 0 0016.586 7H13"/></svg>
        <span>Armada (Vehicles)</span>
      </router-link>

      <router-link to="/admin/schedules" class="nav-item" @click="handleNavClick">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
        <span>Jadwal Servis</span>
      </router-link>

      <router-link to="/admin/maintenance-records" class="nav-item" @click="handleNavClick">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 5v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2z"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
        <span>Rekaman Perawatan</span>
      </router-link>

      <router-link to="/admin/spareparts" class="nav-item" @click="handleNavClick">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
        </svg>
        <span>Suku Cadang</span>
      </router-link>

      <router-link to="/admin/users" class="nav-item" @click="handleNavClick">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
        <span>Kelola Pengguna</span>
      </router-link>
    </nav>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 260px;
  background: #ffffff;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 40;
  flex-shrink: 0;
}

.sidebar.is-closed {
  margin-left: -260px;
}

.sidebar-brand {
  height: 75px;
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0 1.5rem;
  border-bottom: 1px solid #f1f5f9;
}

.brand-logo {
  width: 38px;
  height: 38px;
  background: #2563eb;
  color: white;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.brand-logo svg { width: 22px; height: 22px; }
.brand-title { font-size: 1.25rem; font-weight: 700; color: #0f172a; }

.btn-close-mobile {
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #64748b;
  cursor: pointer;
  margin-left: auto;
}

.sidebar-nav {
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: #64748b;
  font-weight: 600;
  font-size: 0.9rem;
  border-radius: 10px;
  text-decoration: none;
  transition: all 0.2s;
}
.nav-item svg { width: 20px; height: 20px; }
.nav-item:hover { background: #f1f5f9; color: #0f172a; }
.nav-item.router-link-active { background: #eff6ff; color: #2563eb; }

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    margin-left: 0;
    transform: translateX(-100%);
    box-shadow: 10px 0 25px rgba(0,0,0,0.1);
  }
  .sidebar:not(.is-closed) {
    transform: translateX(0);
  }
  .sidebar-overlay {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.4);
    backdrop-filter: blur(4px);
    z-index: 30;
  }
  .btn-close-mobile { display: block; }
}
</style>