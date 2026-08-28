<script setup>
import { ref, onMounted, watch } from 'vue'
import { useAuthStore } from '../../stores/authStore'

const authStore = useAuthStore()
const records = ref([])
const loading = ref(true)

const searchQuery = ref('')
const selectedStatus = ref('')
let searchTimeout = null

const fetchRecords = async () => {
  try {
    loading.value = true
    const params = new URLSearchParams({
      limit: '50',
      search: searchQuery.value.trim(),
      status: selectedStatus.value || 'all'
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
    console.error('Gagal mengambil riwayat servis:', err)
  } finally {
    loading.value = false
  }
}

watch(searchQuery, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchRecords()
  }, 400)
})

watch(selectedStatus, () => {
  fetchRecords()
})

const resetFilter = () => {
  searchQuery.value = ''
  selectedStatus.value = ''
  fetchRecords()
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
  <div class="mechanic-records-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Riwayat Tugas &amp; Pengerjaan</h1>
        <p class="page-subtitle">Semua log perbaikan dan pemeliharaan armada yang pernah ditugaskan kepada Anda.</p>
      </div>
      <button class="btn-refresh" @click="fetchRecords" :disabled="loading">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon-refresh" :class="{ 'spinning': loading }">
          <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
        </svg>
        <span>Refresh Data</span>
      </button>
    </div>

    <!-- Filter Bar -->
    <div class="filter-card">
      <div class="filter-grid">
        <div class="filter-group filter-search">
          <label>Cari Armada / Masalah</label>
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Cari tipe mobil, nomor plat, uraian masalah..." 
            class="input-control"
          />
        </div>

        <div class="filter-group">
          <label>Status Pengerjaan</label>
          <select v-model="selectedStatus" class="select-control">
            <option value="">Semua Status</option>
            <option value="completed">Selesai (Completed)</option>
            <option value="in_progress">Sedang Dikerjakan</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        <div class="filter-actions">
          <button @click="resetFilter" class="btn-reset" title="Reset Filter">
            Reset
          </button>
        </div>
      </div>
    </div>

    <!-- Tabel Riwayat -->
    <div class="card-table">
      <div class="table-responsive">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Armada / Model</th>
              <th>Kendala &amp; Tindakan</th>
              <th>Odometer Servis</th>
              <th>Tanggal Servis</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="5" class="text-center py-4">Memuat riwayat servis...</td>
            </tr>
            <tr v-else-if="records.length === 0">
              <td colspan="5" class="text-center py-4 text-muted">Belum ada riwayat perbaikan yang ditemukan.</td>
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
                  <span class="main-text">{{ item.problem_description || 'Servis Berkala' }}</span>
                  <small class="text-muted">{{ item.action_taken || '-' }}</small>
                </div>
              </td>
              <td class="font-bold">{{ Number(item.mileage_at_service || 0).toLocaleString('id-ID') }} km</td>
              <td>{{ formatDate(item.started_at) }}</td>
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
.mechanic-records-page {
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

.icon-refresh { width: 15px; height: 15px; }
.icon-refresh.spinning { animation: spin 1s linear infinite; }
@keyframes spin { 100% { transform: rotate(360deg); } }

/* Filter */
.filter-card {
  background: #ffffff;
  border: 1px solid #e6f4ea;
  border-radius: 14px;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(15, 61, 46, 0.04);
}

.filter-grid {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.filter-search {
  flex: 2;
}

.filter-group label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #475569;
  text-transform: uppercase;
}

.input-control, .select-control {
  height: 40px;
  padding: 0 0.875rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.875rem;
  outline: none;
  background: #ffffff;
}

.input-control:focus, .select-control:focus {
  border-color: #16a34a;
  box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.12);
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
}
.btn-reset:hover { background: #e2e8f0; }

/* Table */
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
.py-4 { padding-top: 1.5rem; padding-bottom: 1.5rem; }
</style>