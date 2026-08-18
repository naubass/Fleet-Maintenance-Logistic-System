<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../../stores/authStore'

const authStore = useAuthStore()
const records = ref([])
const loading = ref(true)

const fetchRecords = async () => {
  try {
    loading.value = true
    const res = await fetch("http://localhost:5000/api/maintenance-records?limit=50", {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        "Content-Type": "application/json"
      }
    })
    const json = await res.json()
    if (json.success) {
      records.value = json.data
    }
  } catch (err) {
    console.error('Gagal mengambil rekaman perbaikan:', err)
  } finally {
    loading.value = false
  }
}

const formatCurrency = (val) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(val || 0)
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
  fetchRecords()
})
</script>

<template>
  <div class="manager-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Rekap Pengeluaran & Riwayat Servis</h1>
        <p class="page-subtitle">Laporan log perbaikan teknis armada beserta audit total biaya yang dikeluarkan.</p>
      </div>
      <button class="btn-refresh" @click="fetchRecords" :disabled="loading">
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
              <th>Kendaraan / Armada</th>
              <th>Masalah & Tindakan</th>
              <th>Mekanik Penanggung Jawab</th>
              <th>Tanggal Servis</th>
              <th>Total Biaya</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="6" class="text-center py-4">Memuat catatan perbaikan...</td>
            </tr>
            <tr v-else-if="records.length === 0">
              <td colspan="6" class="text-center py-4 text-muted">Tidak ada rekaman perbaikan.</td>
            </tr>
            <tr v-for="item in records" :key="item.id">
              <td>
                <div class="cell-stack">
                  <span class="main-text">{{ item.vehicles?.model_name || '-' }}</span>
                  <small class="sub-plate">{{ item.vehicles?.plate_number || '-' }}</small>
                </div>
              </td>
              <td>
                <div class="cell-stack">
                  <span class="main-text">{{ item.description || 'Servis Rutin' }}</span>
                  <small class="text-muted">{{ item.action_taken || '-' }}</small>
                </div>
              </td>
              <td>{{ item.profiles?.full_name || 'Mekanik' }}</td>
              <td>{{ formatDate(item.started_at || item.created_at) }}</td>
              <td class="font-bold text-success">{{ formatCurrency(item.total_cost) }}</td>
              <td>
                <span class="badge-completed">{{ item.status || 'Selesai' }}</span>
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

.text-success {
  color: #15803d;
}

.font-bold {
  font-weight: 700;
}

.badge-completed {
  display: inline-flex;
  background: #dcfce7;
  color: #15803d;
  padding: 0.25rem 0.65rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
}

.text-center { text-align: center; }
.py-4 { padding-top: 1rem; padding-bottom: 1rem; }
</style>