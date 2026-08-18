<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../../stores/authStore'

const authStore = useAuthStore()
const schedules = ref([])
const loading = ref(true)

const fetchSchedules = async () => {
  try {
    loading.value = true
    const res = await fetch("http://localhost:5000/api/schedules?limit=50", {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        "Content-Type": "application/json"
      }
    })
    const json = await res.json()
    if (json.success) {
      schedules.value = json.data
    }
  } catch (err) {
    console.error('Gagal mengambil jadwal servis:', err)
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
  fetchSchedules()
})
</script>

<template>
  <div class="manager-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Jadwal & Approval Perawatan</h1>
        <p class="page-subtitle">Tinjau antrean pemeliharaan preventif yang dijadwalkan teknisi.</p>
      </div>
      <button class="btn-refresh" @click="fetchSchedules" :disabled="loading">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon-refresh" :class="{ 'spinning': loading }">
          <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
        </svg>
        <span>Refresh Data</span>
      </button>
    </div>

    <div class="card-table">
      <div class="table-responsive">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Armada / Kendaraan</th>
              <th>Jenis Servis</th>
              <th>Interval (KM)</th>
              <th>Servis Terakhir</th>
              <th>Jatuh Tempo (KM & Tanggal)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="6" class="text-center py-4">Memuat jadwal servis...</td>
            </tr>
            <tr v-else-if="schedules.length === 0">
              <td colspan="6" class="text-center py-4 text-muted">Tidak ada jadwal perawatan aktif.</td>
            </tr>
            <tr v-for="item in schedules" :key="item.id">
              <td>
                <div class="cell-stack">
                  <span class="main-text">{{ item.vehicles?.model_name || '-' }}</span>
                  <small class="sub-plate">{{ item.vehicles?.plate_number || '-' }}</small>
                </div>
              </td>
              <td>{{ item.service_name }}</td>
              <td>{{ Number(item.interval_km || 0).toLocaleString('id-ID') }} km</td>
              <td>
                <div class="cell-stack">
                  <span>{{ Number(item.last_serviced_km || 0).toLocaleString('id-ID') }} km</span>
                  <small class="text-muted">{{ formatDate(item.last_serviced_date) }}</small>
                </div>
              </td>
              <td>
                <div class="cell-stack">
                  <span class="font-bold text-blue">{{ Number(item.next_due_km || 0).toLocaleString('id-ID') }} km</span>
                  <small class="text-muted">{{ formatDate(item.next_due_date) }}</small>
                </div>
              </td>
              <td>
                <span class="badge-scheduled">{{ item.status }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.manager-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
}

.page-subtitle {
  font-size: 0.875rem;
  color: #64748b;
  margin-top: 0.25rem;
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

.icon-refresh { width: 16px; height: 16px; }
.icon-refresh.spinning { animation: spin 1s linear infinite; }

@keyframes spin {
  100% { transform: rotate(360deg); }
}

.card-table {
  background: #ffffff;
  border: 1px solid #e6f4ea;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(15, 61, 46, 0.04);
}

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

.text-muted {
  color: #64748b;
  font-size: 0.75rem;
}

.text-blue {
  color: #2563eb;
}

.font-bold {
  font-weight: 700;
}

.badge-scheduled {
  display: inline-flex;
  background: #e0f2fe;
  color: #0369a1;
  padding: 0.25rem 0.65rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
}

.text-center { text-align: center; }
.py-4 { padding-top: 1rem; padding-bottom: 1rem; }
</style>