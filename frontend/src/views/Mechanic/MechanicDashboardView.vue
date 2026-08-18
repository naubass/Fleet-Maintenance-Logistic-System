<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../../stores/authStore'

const authStore = useAuthStore()
const activeTasks = ref([])
const loading = ref(true)

const fetchMyTasks = async () => {
  try {
    loading.value = true
    const res = await fetch("http://localhost:5000/api/maintenance-records?limit=50&status=in_progress", {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        "Content-Type": "application/json"
      }
    })
    const json = await res.json()
    if (json.success) {
      activeTasks.value = json.data
    }
  } catch (err) {
    console.error("Gagal mengambil antrean tugas:", err)
  } finally {
    loading.value = false
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

onMounted(() => {
  fetchMyTasks()
})
</script>

<template>
  <div class="mechanic-page">
    <!-- Header Banner Hijau Emerald -->
    <div class="welcome-box">
      <div class="welcome-text">
        <h2>Halo, {{ authStore.user?.full_name || 'Teknisi Bengkel' }}! 🔧</h2>
        <p>Tinjau dan selesaikan antrean unit armada yang ditugaskan untuk Anda tangani hari ini.</p>
      </div>
      <div class="welcome-decor" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
        </svg>
      </div>
    </div>

    <!-- Active Tasks Table -->
    <div class="card-table">
      <div class="card-header">
        <div>
          <h3>Antrean Unit Servis Aktif (In Progress)</h3>
          <p class="card-subtitle">Daftar perbaikan fisik &amp; perawatan berkala yang sedang berlangsung.</p>
        </div>
        <button @click="fetchMyTasks" class="btn-refresh" :disabled="loading">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon-refresh" :class="{ 'spinning': loading }">
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
          </svg>
          <span>Refresh Data</span>
        </button>
      </div>

      <div class="table-responsive">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Armada / Model</th>
              <th>Keluhan &amp; Masalah</th>
              <th>Tindakan / Solusi</th>
              <th>Odometer Unit</th>
              <th>Tanggal Mulai</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="6" class="text-center py-4">Memuat antrean tugas perbaikan...</td>
            </tr>
            <tr v-else-if="activeTasks.length === 0">
              <td colspan="6" class="text-center py-4 text-muted">
                Tidak ada unit armada yang sedang dalam antrean perbaikan Anda. 👍
              </td>
            </tr>
            <tr v-for="item in activeTasks" :key="item.id">
              <td>
                <div class="cell-stack">
                  <span class="main-text">{{ item.vehicles?.model_name || '-' }}</span>
                  <small class="sub-plate">{{ item.vehicles?.plate_number || '-' }}</small>
                </div>
              </td>
              <td>
                <span class="problem-text">{{ item.problem_description || 'Servis Rutin' }}</span>
              </td>
              <td>
                <span class="action-text">{{ item.action_taken || 'Sedang proses inspeksi' }}</span>
              </td>
              <td class="font-bold">{{ Number(item.mileage_at_service || 0).toLocaleString('id-ID') }} km</td>
              <td>{{ formatDate(item.started_at) }}</td>
              <td>
                <span class="badge-status status-progress">In Progress</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mechanic-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.welcome-box {
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #0e3a2c 0%, #15803d 100%);
  padding: 2rem;
  border-radius: 16px;
  color: #ffffff;
  box-shadow: 0 8px 24px rgba(14, 58, 44, 0.18);
}

.welcome-text h2 {
  font-size: 1.6rem;
  font-weight: 700;
  margin-bottom: 0.4rem;
}

.welcome-text p {
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.95rem;
}

.welcome-decor {
  position: absolute;
  right: 1rem;
  bottom: -1rem;
  color: rgba(255, 255, 255, 0.08);
}
.welcome-decor svg {
  width: 140px;
  height: 140px;
}

.card-table {
  background: #ffffff;
  border: 1px solid #e6f4ea;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(15, 61, 46, 0.04);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
}

.card-header h3 {
  font-size: 1.1rem;
  font-weight: 700;
  color: #0f172a;
}

.card-subtitle {
  font-size: 0.8rem;
  color: #64748b;
  margin-top: 0.15rem;
}

.btn-refresh {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  background: #ffffff;
  border: 1px solid #d1e7dd;
  color: #0f3d2e;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-refresh:hover { background: #f0fdf6; }

.icon-refresh { width: 15px; height: 15px; }
.icon-refresh.spinning { animation: spin 1s linear infinite; }
@keyframes spin { 100% { transform: rotate(360deg); } }

.custom-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.custom-table th {
  background: #f8fafc;
  padding: 0.85rem 1.25rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  border-bottom: 1px solid #e2e8f0;
}

.custom-table td {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.875rem;
  color: #334155;
}

.cell-stack {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.main-text {
  font-weight: 600;
  color: #0f172a;
}

.sub-plate {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 700;
}

.problem-text {
  font-weight: 600;
  color: #0f172a;
}

.action-text {
  color: #64748b;
  font-size: 0.825rem;
}

.font-bold {
  font-weight: 700;
}

.badge-status {
  display: inline-flex;
  padding: 0.25rem 0.65rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
}

.status-progress {
  background: #fef3c7;
  color: #b45309;
}

.text-center { text-align: center; }
.text-muted { color: #94a3b8; }
.py-4 { padding-top: 1.5rem; padding-bottom: 1.5rem; }
</style>