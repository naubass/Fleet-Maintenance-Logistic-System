<script setup>
import { ref, onMounted, watch } from 'vue'
import { useAuthStore } from '../../stores/authStore'

const authStore = useAuthStore()
const records = ref([])
const loading = ref(true)

// State Filter
const searchQuery = ref('')
const selectedStatus = ref('')
const startDate = ref('')
const endDate = ref('')

let searchTimeout = null

const fetchRecords = async () => {
  try {
    loading.value = true

    // Parameter Query dinamis untuk backend
    const params = new URLSearchParams({
      limit: '50',
      search: searchQuery.value.trim(),
      status: selectedStatus.value || 'all',
      startDate: startDate.value,
      endDate: endDate.value
    })

    const res = await fetch(`/api/maintenance-records?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        'Content-Type': 'application/json'
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

// Debounce untuk filter search
watch(searchQuery, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchRecords()
  }, 400)
})

// Trigger fetch otomatis saat filter status atau tanggal berubah
watch([selectedStatus, startDate, endDate], () => {
  fetchRecords()
})

const resetFilter = () => {
  searchQuery.value = ''
  selectedStatus.value = ''
  startDate.value = ''
  endDate.value = ''
  fetchRecords()
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
        <h1 class="page-title">Rekap Pengeluaran &amp; Riwayat Servis</h1>
        <p class="page-subtitle">Laporan log perbaikan teknis armada beserta audit total biaya yang dikeluarkan.</p>
      </div>
      <button class="btn-refresh" @click="fetchRecords" :disabled="loading">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon-refresh" :class="{ 'spinning': loading }">
          <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
        </svg>
        <span>Refresh Data</span>
      </button>
    </div>

    <!-- Filter Card: Search, Status, Start Date, End Date -->
    <div class="filter-card">
      <div class="filter-grid">
        <div class="filter-group filter-search">
          <label>Cari Armada / Perbaikan</label>
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Cari unit, plat nomor, deskripsi masalah..." 
            class="input-control"
          />
        </div>

        <div class="filter-group">
          <label>Status Servis</label>
          <select v-model="selectedStatus" class="select-control">
            <option value="">Semua Status</option>
            <option value="completed">Completed</option>
            <option value="in_progress">In Progress</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Dari Tanggal</label>
          <input type="date" v-model="startDate" class="input-control" />
        </div>

        <div class="filter-group">
          <label>Sampai Tanggal</label>
          <input type="date" v-model="endDate" class="input-control" />
        </div>

        <div class="filter-actions">
          <button @click="resetFilter" class="btn-reset" title="Reset Filter">
            Reset
          </button>
        </div>
      </div>
    </div>

    <!-- Tabel Rekapan Perbaikan -->
    <div class="card-table">
      <div class="table-responsive">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Kendaraan / Armada</th>
              <th>Masalah &amp; Tindakan</th>
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
              <td colspan="6" class="text-center py-4 text-muted">Tidak ada rekaman perbaikan ditemukan.</td>
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
                  <!-- Tampilkan problem_description sebenarnya -->
                  <span class="main-text">{{ item.problem_description || 'Servis Rutin' }}</span>
                  <small class="text-muted">{{ item.action_taken || '-' }}</small>
                </div>
              </td>
              <td>
                <!-- Tampilkan nama mekanik dari relasi mechanic / profiles -->
                <div class="mechanic-name">
                  {{ item.mechanic?.full_name || item.profiles?.full_name || 'Mekanik Tidak Ditugaskan' }}
                </div>
              </td>
              <td>{{ formatDate(item.started_at || item.created_at) }}</td>
              <td class="font-bold text-success">{{ formatCurrency(item.total_cost) }}</td>
              <td>
                <span :class="['badge-status', `status-${(item.status || 'completed').toLowerCase()}`]">
                  {{ item.status || 'completed' }}
                </span>
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

/* Filter Card */
.filter-card {
  background: #ffffff;
  border: 1px solid #e6f4ea;
  border-radius: 14px;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(15, 61, 46, 0.04);
}

.filter-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr auto;
  gap: 1rem;
  align-items: flex-end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.filter-group label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.input-control, .select-control {
  height: 40px;
  padding: 0 0.875rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.875rem;
  outline: none;
  background: #ffffff;
  transition: border-color 0.2s;
}

.input-control:focus, .select-control:focus {
  border-color: #16a34a;
  box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.12);
}

.filter-actions {
  display: flex;
  align-items: center;
}

.btn-reset {
  height: 40px;
  padding: 0 1rem;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  color: #475569;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-reset:hover {
  background: #e2e8f0;
}

/* Tabel */
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

.mechanic-name {
  font-weight: 600;
  color: #1e293b;
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

.badge-status {
  display: inline-flex;
  padding: 0.25rem 0.65rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: capitalize;
}

.status-completed { background: #dcfce7; color: #15803d; }
.status-in_progress { background: #fef3c7; color: #b45309; }
.status-pending { background: #e0f2fe; color: #0369a1; }

.text-center { text-align: center; }
.py-4 { padding-top: 1rem; padding-bottom: 1rem; }

@media (max-width: 1024px) {
  .filter-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 640px) {
  .filter-grid {
    grid-template-columns: 1fr;
  }
}
</style>