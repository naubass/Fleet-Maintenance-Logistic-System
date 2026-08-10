<script setup>
import { useAuthStore } from '../../stores/authStore'

const authStore = useAuthStore()
</script>

<template>
  <div class="dashboard-page">
    <div class="welcome-card">
      <div class="welcome-text">
        <h2>Selamat Datang Kembali, {{ authStore.userName || authStore.user?.full_name || 'Naufal Admin' }}!</h2>
        <p>Kelola perbaikan armada dan pantau performa operasional dengan efisien.</p>
        <div class="welcome-actions">
          <router-link to="/admin/vehicles" class="btn-primary">Lihat Armada</router-link>
          <router-link to="/admin/schedules" class="btn-secondary">Jadwal Perawatan</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.welcome-card {
  background-color: #ffffff;
  padding: 2.25rem;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.welcome-text h2 {
  font-size: 1.65rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 0.5rem;
  letter-spacing: -0.02em;
}

.welcome-text p {
  color: #64748b;
  font-size: 0.95rem;
  margin-bottom: 1.75rem;
}

.welcome-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  padding: 0.625rem 1.25rem;
  background-color: #2563eb;
  color: #ffffff;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.875rem;
  text-decoration: none;
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  padding: 0.625rem 1.25rem;
  background-color: #ffffff;
  color: #475569;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.875rem;
  border: 1px solid #cbd5e1;
  text-decoration: none;
}
</style>