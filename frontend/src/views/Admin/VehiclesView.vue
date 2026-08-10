<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { vehicleService } from '../../services/vehicleService'

const vehicles = ref([])
const isModalOpen = ref(false)
const isEdit = ref(false)
const selectedId = ref(null)

// State Filter & Server-Side Pagination
const searchQuery = ref('')
const filterCategory = ref('all')
const filterStatus = ref('all')
const currentPage = ref(1)
const itemsPerPage = ref(5)
const totalData = ref(0)
const totalPages = ref(1)

const form = ref({
  model_name: '',
  plate_number: '',
  category: 'Truck',
  current_mileage: 0,
  status: 'ready'
})

const loadVehicles = async () => {
  try {
    const result = await vehicleService.getAll({
      page: currentPage.value,
      limit: itemsPerPage.value,
      search: searchQuery.value,
      category: filterCategory.value,
      status: filterStatus.value
    })

    if (result.success) {
      vehicles.value = result.data
      totalData.value = result.totalData
      totalPages.value = result.totalPages
      currentPage.value = result.currentPage
    }
  } catch (err) {
    console.error('Fetch error:', err)
  }
}

// Re-fetch saat pencarian atau filter kategori/status berubah
watch([searchQuery, filterCategory, filterStatus], () => {
  currentPage.value = 1
  loadVehicles()
})

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    loadVehicles()
  }
}

const openModal = (item = null) => {
  if (item) {
    isEdit.value = true
    selectedId.value = item.id
    form.value = { ...item }
  } else {
    isEdit.value = false
    selectedId.value = null
    form.value = { 
      model_name: '', 
      plate_number: '', 
      category: 'Truck', 
      current_mileage: 0, 
      status: 'ready' 
    }
  }
  isModalOpen.value = true
}

const saveVehicle = async () => {
  const res = isEdit.value
    ? await vehicleService.update(selectedId.value, form.value)
    : await vehicleService.create(form.value)

  if (res.success) {
    isModalOpen.value = false
    loadVehicles()
  } else {
    alert(`Gagal menyimpan: ${res.message || 'Terjadi kesalahan'}`)
  }
}

const removeVehicle = async (id) => {
  if (!confirm('Yakin ingin menghapus kendaraan ini?')) return
  const res = await vehicleService.delete(id)
  if (res.success) loadVehicles()
}

const formatStatus = (status) => {
  const map = {
    ready: 'Ready',
    in_use: 'In Use',
    under_maintenance: 'Maintenance',
    breakdown: 'Breakdown'
  }
  return map[status] || status
}

const visiblePages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  const delta = 1
  const range = []

  for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
    range.push(i)
  }

  if (current - delta > 2) range.unshift('...')
  if (current + delta < total - 1) range.push('...')

  range.unshift(1)
  if (total > 1) range.push(total)

  return range
})

onMounted(loadVehicles)
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h1 class="page-title">Manajemen Armada</h1>
        <p class="page-subtitle">Kelola daftar kendaraan operasional dan status kesiapannya.</p>
      </div>
      <button @click="openModal()" class="btn-primary">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
        Tambah Kendaraan
      </button>
    </div>

    <div class="control-bar">
      <div class="search-box">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Cari model atau plat nomor..." 
        />
      </div>

      <div class="filter-group">
        <select v-model="filterCategory" class="filter-select">
          <option value="all">Semua Kategori</option>
          <option value="Truck">Truck</option>
          <option value="Van">Van</option>
          <option value="Pickup">Pickup</option>
          <option value="Bus">Bus / Minibus</option>
          <option value="Container">Container / Trailer</option>
          <option value="Car">Mobil Operasional</option>
        </select>

        <select v-model="filterStatus" class="filter-select">
          <option value="all">Semua Status</option>
          <option value="ready">Ready (Siap)</option>
          <option value="in_use">In Use (Digunakan)</option>
          <option value="under_maintenance">Maintenance (Servis)</option>
          <option value="breakdown">Breakdown (Rusak)</option>
        </select>
      </div>
    </div>

    <div class="card-table">
      <div class="table-responsive">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Model Armada</th>
              <th>Plat Nomor</th>
              <th>Kategori</th>
              <th>Mileage</th>
              <th>Status</th>
              <th style="text-align: right;">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in vehicles" :key="item.id">
              <td class="font-bold-title">{{ item.model_name }}</td>
              <td><span class="plate-badge">{{ item.plate_number }}</span></td>
              <td class="capitalize">{{ item.category }}</td>
              <td>{{ item.current_mileage ? item.current_mileage.toLocaleString('id-ID') + ' km' : '0 km' }}</td>
              <td>
                <span :class="`badge badge-${item.status}`">
                  <span class="badge-dot"></span>
                  {{ formatStatus(item.status) }}
                </span>
              </td>
              <td style="text-align: right;">
                <div class="action-buttons">
                  <button @click="openModal(item)" class="btn-icon edit"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg></button>
                  <button @click="removeVehicle(item.id)" class="btn-icon delete"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
                </div>
              </td>
            </tr>
            <tr v-if="vehicles.length === 0">
              <td colspan="6" class="empty-state">
                <div class="empty-box">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/><path d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1h2m4 0h1a1 1 0 001-1v-4a1 1 0 00-.293-.707l-3-3A1 1 0 0016.586 7H13"/></svg>
                  <p>Tidak ada data armada yang sesuai.</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="vehicles.length > 0" class="pagination-footer">
        <span class="pagination-info">
          Menampilkan {{ (currentPage - 1) * itemsPerPage + 1 }} - 
          {{ Math.min(currentPage * itemsPerPage, totalData) }} dari {{ totalData }} data
        </span>
        <div class="pagination-buttons">
          <button @click="changePage(1)" :disabled="currentPage === 1" class="btn-page icon-btn">«</button>
          <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1" class="btn-page icon-btn">‹</button>

          <template v-for="(page, index) in visiblePages" :key="index">
            <span v-if="page === '...'" class="page-ellipsis">...</span>
            <button v-else @click="changePage(page)" :class="['btn-page', { active: currentPage === page }]">
              {{ page }}
            </button>
          </template>

          <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages" class="btn-page icon-btn">›</button>
          <button @click="changePage(totalPages)" :disabled="currentPage === totalPages" class="btn-page icon-btn">»</button>
        </div>
      </div>
    </div>

    <!-- Modal Form -->
    <div v-if="isModalOpen" class="modal-overlay" @click.self="isModalOpen = false">
      <div class="modal-card">
        <div class="modal-header">
          <h3>{{ isEdit ? 'Edit Data Kendaraan' : 'Tambah Kendaraan Baru' }}</h3>
          <button @click="isModalOpen = false" class="btn-close">&times;</button>
        </div>

        <form @submit.prevent="saveVehicle" class="form-container">
          <div class="form-group">
            <label>Model / Nama Kendaraan</label>
            <input v-model="form.model_name" type="text" required placeholder="Truk Hino 300 / Isuzu Traga" />
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label>Plat Nomor</label>
              <input v-model="form.plate_number" type="text" required placeholder="B 1234 CD" />
            </div>
            <div class="form-group">
              <label>Kategori Armada</label>
              <select v-model="form.category" class="custom-select" required>
                <option value="Truck">Truck</option>
                <option value="Van">Van</option>
                <option value="Pickup">Pickup</option>
                <option value="Bus">Bus / Minibus</option>
                <option value="Container">Container / Trailer</option>
                <option value="Car">Mobil Operasional</option>
              </select>
            </div>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label>Kilometer (Mileage)</label>
              <input v-model="form.current_mileage" type="number" required placeholder="15000" />
            </div>
            <div class="form-group">
              <label>Status Kendaraan</label>
              <select v-model="form.status" class="custom-select">
                <option value="ready">Ready (Siap)</option>
                <option value="in_use">In Use (Digunakan)</option>
                <option value="under_maintenance">Maintenance (Servis)</option>
                <option value="breakdown">Breakdown (Rusak)</option>
              </select>
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" @click="isModalOpen = false" class="btn-secondary">Batal</button>
            <button type="submit" class="btn-primary">Simpan Kendaraan</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

/* Main Container Layout */
.page-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  font-family: 'Plus Jakarta Sans', sans-serif;
  color: #0f172a;
}

/* Page Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 1.35rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #0f172a;
}

.page-subtitle {
  font-size: 0.85rem;
  color: #64748b;
  margin-top: 2px;
}

/* Control Bar UI (Search Box & Filter) */
.control-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 0 0.875rem;
  flex: 1;
  max-width: 380px;
  height: 42px;
  box-sizing: border-box;
}

/* Kunci Ukuran SVG Kaca Pembesar */
.search-box svg {
  width: 18px !important;
  height: 18px !important;
  min-width: 18px;
  min-height: 18px;
  color: #94a3b8;
  flex-shrink: 0;
}

.search-box input {
  border: none;
  outline: none;
  width: 100%;
  font-size: 0.875rem;
  color: #0f172a;
  background: transparent;
}

.filter-group {
  display: flex;
  gap: 0.75rem;
}

.filter-select {
  height: 42px;
  padding: 0 0.875rem;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  font-size: 0.875rem;
  background: #ffffff;
  color: #334155;
  outline: none;
  cursor: pointer;
}

/* Table Card & Responsive UI */
.card-table {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.table-responsive {
  width: 100%;
  overflow-x: auto;
}

.custom-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.9rem;
}

.custom-table th {
  background: #f8fafc;
  padding: 0.875rem 1.25rem;
  font-weight: 600;
  color: #475569;
  border-bottom: 1px solid #e2e8f0;
  white-space: nowrap;
}

.custom-table td {
  padding: 0.875rem 1.25rem;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
  white-space: nowrap;
}

.vehicle-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.font-bold-title {
  font-weight: 600;
  color: #0f172a;
}

.plate-badge {
  background: #f1f5f9;
  color: #334155;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  font-family: monospace;
  font-weight: 600;
  font-size: 0.8rem;
  border: 1px solid #cbd5e1;
  width: fit-content;
}

.capitalize {
  text-transform: capitalize;
}

.due-badge {
  font-weight: 700;
  color: #2563eb;
}

/* Status Badges */
.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.3rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
}

.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* Badge Color Varieties */
.badge-ready, .badge-completed { background: #dcfce7; color: #15803d; }
.badge-ready .badge-dot, .badge-completed .badge-dot { background: #16a34a; }

.badge-in_use, .badge-pending { background: #e0f2fe; color: #0369a1; }
.badge-in_use .badge-dot, .badge-pending .badge-dot { background: #0284c7; }

.badge-under_maintenance { background: #fef9c3; color: #a16207; }
.badge-under_maintenance .badge-dot { background: #d97706; }

.badge-breakdown, .badge-overdue { background: #fee2e2; color: #b91c1c; }
.badge-breakdown .badge-dot, .badge-overdue .badge-dot { background: #dc2626; }

/* Buttons & Action Controls */
.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.btn-icon {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

/* Kunci Ukuran SVG Icon Edit/Delete */
.btn-icon svg {
  width: 16px !important;
  height: 16px !important;
  min-width: 16px;
  min-height: 16px;
  flex-shrink: 0;
}

.btn-icon.edit:hover { background: #eff6ff; color: #2563eb; border-color: #bfdbfe; }
.btn-icon.delete:hover { background: #fef2f2; color: #dc2626; border-color: #fecaca; }

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #2563eb;
  color: #ffffff;
  border: none;
  padding: 0 1.25rem;
  height: 42px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary svg {
  width: 18px !important;
  height: 18px !important;
  flex-shrink: 0;
}

.btn-primary:hover { background: #1d4ed8; }

.btn-secondary {
  background: #ffffff;
  color: #475569;
  border: 1px solid #cbd5e1;
  padding: 0 1.25rem;
  height: 42px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
}

/* Pagination UI */
.pagination-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.875rem 1.25rem;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.pagination-info {
  font-size: 0.825rem;
  color: #64748b;
}

.pagination-buttons {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.btn-page {
  min-width: 32px;
  height: 32px;
  padding: 0 0.5rem;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  border-radius: 6px;
  font-size: 0.825rem;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.btn-page.icon-btn { font-size: 1rem; color: #64748b; }
.btn-page:hover:not(:disabled) { background: #f1f5f9; color: #0f172a; border-color: #94a3b8; }
.btn-page:disabled { opacity: 0.4; cursor: not-allowed; }
.btn-page.active { background: #2563eb; color: #ffffff; border-color: #2563eb; }
.page-ellipsis { padding: 0 0.35rem; color: #94a3b8; font-size: 0.85rem; }

/* Modal Form UI */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 1rem;
}

.modal-card {
  background: #ffffff;
  padding: 2rem;
  border-radius: 16px;
  width: 100%;
  max-width: 520px;
  box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.modal-header h3 { font-size: 1.15rem; font-weight: 700; color: #0f172a; }
.btn-close { background: none; border: none; font-size: 1.5rem; color: #94a3b8; cursor: pointer; }

.form-container { display: flex; flex-direction: column; gap: 1rem; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.form-group { display: flex; flex-direction: column; gap: 0.375rem; }
.form-group label { font-size: 0.8rem; font-weight: 600; color: #475569; }
.form-group input, .custom-select {
  height: 40px;
  padding: 0 0.875rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #0f172a;
  outline: none;
}

.modal-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1rem; }

.empty-state { text-align: center; padding: 3rem !important; }
.empty-box { display: flex; flex-direction: column; align-items: center; color: #94a3b8; gap: 0.5rem; }

/* Kunci Ukuran SVG Empty State */
.empty-box svg {
  width: 48px !important;
  height: 48px !important;
}

/* Responsive Rules */
@media (max-width: 768px) {
  .page-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
  .control-bar { flex-direction: column; align-items: stretch; }
  .search-box { max-width: 100%; }
  .filter-group { width: 100%; }
  .filter-select { flex: 1; }
  .form-grid { grid-template-columns: 1fr; }
}
</style>