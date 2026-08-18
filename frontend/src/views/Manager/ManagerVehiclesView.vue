<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '../../stores/authStore'

const authStore = useAuthStore()
const vehicles = ref([])
const loading = ref(true)
const searchQuery = ref('')
const selectedStatus = ref('')

const fetchVehicles = async () => {
  try {
    loading.value = true
    const res = await fetch("http://localhost:5000/api/vehicles?limit=100", {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        "Content-Type": "application/json"
      }
    })
    const json = await res.json()
    if (json.success) {
      vehicles.value = json.data
    }
  } catch (err) {
    console.error('Gagal mengambil armada:', err)
  } finally {
    loading.value = false
  }
}

const filteredVehicles = computed(() => {
  return vehicles.value.filter(v => {
    const matchSearch = (v.model_name || '').toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                        (v.plate_number || '').toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchStatus = !selectedStatus.value || v.status === selectedStatus.value
    return matchSearch && matchStatus
  })
})

onMounted(() => {
  fetchVehicles()
})
</script>

<template>
  <div class="manager-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Monitoring Kesiapan Armada</h1>
        <p class="page-subtitle">Tinjauan status operasional dan kilometer jarak tempuh seluruh unit kendaraan.</p>
      </div>
      <button class="btn-refresh" @click="fetchVehicles" :disabled="loading">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon-refresh" :class="{ 'spinning': loading }">
          <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
        </svg>
        <span>Refresh Data</span>
      </button>
    </div>

    <!-- Filter Bar -->
    <div class="filter-bar">
      <input 
        type="text" 
        v-model="searchQuery" 
        placeholder="Cari armada atau plat nomor..." 
        class="input-search"
      />
      <select v-model="selectedStatus" class="select-filter">
        <option value="">Semua Status</option>
        <option value="Ready">Ready</option>
        <option value="Maintenance">Maintenance</option>
        <option value="Breakdown">Breakdown</option>
      </select>
    </div>

    <!-- Tabel Armada Read-Only -->
    <div class="card-table">
      <div class="table-responsive">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Armada / Model</th>
              <th>Kategori</th>
              <th>Odometer (KM)</th>
              <th>Status Operasional</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="4" class="text-center py-4">Memuat data armada...</td>
            </tr>
            <tr v-else-if="filteredVehicles.length === 0">
              <td colspan="4" class="text-center py-4 text-muted">Tidak ada unit ditemukan.</td>
            </tr>
            <tr v-for="item in filteredVehicles" :key="item.id">
              <td>
                <div class="cell-stack">
                  <span class="main-text">{{ item.model_name }}</span>
                  <small class="sub-plate">{{ item.plate_number }}</small>
                </div>
              </td>
              <td>{{ item.category || '-' }}</td>
              <td class="font-bold">{{ Number(item.current_mileage || 0).toLocaleString('id-ID') }} km</td>
              <td>
                <span :class="['badge-status', `status-${(item.status || '').toLowerCase()}`]">
                  {{ item.status }}
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

.filter-bar {
  display: flex;
  gap: 1rem;
}

.input-search {
  flex: 1;
  padding: 0.65rem 1rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.875rem;
  outline: none;
  background: #ffffff;
}
.input-search:focus {
  border-color: #16a34a;
  box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.12);
}

.select-filter {
  padding: 0.65rem 1rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.875rem;
  outline: none;
  background: #ffffff;
}
.select-filter:focus {
  border-color: #16a34a;
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
.status-ready { background: #dcfce7; color: #15803d; }
.status-maintenance { background: #fef3c7; color: #b45309; }
.status-breakdown { background: #fee2e2; color: #dc2626; }

.text-center { text-align: center; }
.text-muted { color: #94a3b8; }
.py-4 { padding-top: 1rem; padding-bottom: 1rem; }
</style>