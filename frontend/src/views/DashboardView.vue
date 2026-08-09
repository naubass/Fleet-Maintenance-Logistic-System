<template>
  <div class="dashboard-wrapper">
    <!-- Sidebar Navigation -->
    <aside class="sidebar">
      <div class="sidebar-brand">
        <svg class="icon-brand" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 17.5V14M19 14C20.1046 14 21 13.1046 21 12V6C21 4.89543 20.1046 4 19 4H5C3.89543 4 3 4.89543 3 6V18C3 19.1046 3.89543 20 5 20H13.5M19 14H15.5M13 10V6M9 10V6M5 10V6M5 10C5 11.1046 5.89543 12 7 12H9C10.1046 12 11 11.1046 11 10M11 10C11 11.1046 11.8954 12 13 12H15C16.1046 12 17 11.1046 17 10V6M19 17.5L21.5 20M19 17.5L16.5 20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <h2>FleetRepair</h2>
      </div>
      <nav class="sidebar-nav">
        <router-link to="/" class="nav-item active">
          <svg class="icon-nav" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 12L12 3L21 12M5 12V20H19V12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Dashboard
        </router-link>
        <router-link to="/vehicles" class="nav-item">
          <svg class="icon-nav" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" stroke="currentColor" stroke-width="2"/>
            <path d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1h2m4 0h1a1 1 0 001-1v-4a1 1 0 00-.293-.707l-3-3A1 1 0 0016.586 7H13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Armada (Vehicles)
        </router-link>
      </nav>
    </aside>

    <!-- Main Content Area -->
    <div class="main-area">
      <header class="navbar-modern">
        <div class="navbar-left">
          <span class="page-title">Dashboard</span>
        </div>
        <div class="navbar-right">
          <div class="user-profile">
            <img :src="`https://api.dicebear.com/8.x/initials/svg?seed=${authStore.userName || 'Admin'}`" alt="Avatar" class="user-avatar" />
            <div class="user-text">
              <span class="user-name">{{ authStore.userName }}</span>
              <span class="user-role">{{ authStore.userRole }}</span>
            </div>
          </div>
          <button @click="handleLogout" class="btn-logout-modern">
            <svg class="icon-logout" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Logout
          </button>
        </div>
      </header>

      <main class="content-modern">
        <div class="welcome-card">
          <div class="welcome-text">
            <h2>Selamat Datang Kembali, {{ authStore.userName }}!</h2>
            <p>Kelola perbaikan armada dan pantau performa operasional dengan efisien.</p>
            <div class="welcome-actions">
              <router-link to="/vehicles" class="btn-primary">Lihat Armada</router-link>
              <button class="btn-secondary">Jadwal Perawatan</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const authStore = useAuthStore()
const router = useRouter()

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.dashboard-wrapper {
  display: flex;
  min-height: 100vh;
  background-color: #f1f5f9;
  font-family: 'Inter', sans-serif;
}

/* Sidebar Styles */
.sidebar {
  width: 260px;
  background-color: #ffffff;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.sidebar-brand {
  height: 70px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  color: #2563eb;
}

.sidebar-brand h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
}

.icon-brand {
  width: 2rem;
  height: 2rem;
}

.sidebar-nav {
  flex: 1;
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: #475569;
  font-weight: 500;
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.2s;
}

.nav-item:hover {
  background-color: #eff6ff;
  color: #2563eb;
}

.nav-item.active {
  background-color: #2563eb;
  color: #ffffff;
}

.icon-nav {
  width: 1.25rem;
  height: 1.25rem;
}

/* Main Area Styles */
.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.navbar-modern {
  height: 70px;
  background-color: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
}

.page-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #0f172a;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 9999px;
  border: 2px solid #e2e8f0;
}

.user-text {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #0f172a;
}

.user-role {
  font-size: 0.75rem;
  color: #64748b;
  text-transform: capitalize;
}

.btn-logout-modern {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: transparent;
  color: #ef4444;
  border: 1px solid #fecaca;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-logout-modern:hover {
  background-color: #fef2f2;
}

.icon-logout {
  width: 1.125rem;
  height: 1.125rem;
}

.content-modern {
  padding: 2rem;
}

.welcome-card {
  background-color: #ffffff;
  padding: 2rem;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.welcome-text h2 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 0.5rem;
}

.welcome-text p {
  color: #475569;
  margin-bottom: 1.5rem;
}

.welcome-actions {
  display: flex;
  gap: 1rem;
}

.btn-primary {
  padding: 0.625rem 1.25rem;
  background-color: #2563eb;
  color: #ffffff;
  border-radius: 8px;
  font-weight: 500;
  text-decoration: none;
}

.btn-primary:hover {
  background-color: #1d4ed8;
}

.btn-secondary {
  padding: 0.625rem 1.25rem;
  background-color: #ffffff;
  color: #475569;
  border-radius: 8px;
  font-weight: 500;
  border: 1px solid #e2e8f0;
  cursor: pointer;
}

.btn-secondary:hover {
  background-color: #f1f5f9;
}
</style>