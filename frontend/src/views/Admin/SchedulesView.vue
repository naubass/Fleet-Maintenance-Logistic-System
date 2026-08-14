<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { scheduleService } from '../../services/scheduleService'

const schedules = ref([])
const vehicles = ref([])
const isModalOpen = ref(false)
const isEdit = ref(false)
const selectedId = ref(null)

// State Filter & Server-Side Pagination
const searchQuery = ref('')
const filterStatus = ref('all')
const startDate = ref('')
const endDate = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)
const totalData = ref(0)
const totalPages = ref(1)

// Helper tanggal hari ini dalam format YYYY-MM-DD
const getTodayDate = () => new Date().toISOString().split('T')[0]

// Form State dengan Field Tanggal
const form = ref({
  vehicle_id: '',
  service_type: 'Ganti Oli Mesin',
  interval_km: 10000,
  last_serviced_km: 0,
  next_due_km: 10000,
  last_serviced_date: getTodayDate(),
  next_due_date: '',
  status: 'scheduled'
})

// Load Data Jadwal Servis
const loadSchedules = async () => {
  try {
    const result = await scheduleService.getAll({
      page: currentPage.value,
      limit: itemsPerPage.value,
      search: searchQuery.value,
      status: filterStatus.value,
      startDate: startDate.value || '', // Gunakan startDate (bukan start_date)
      endDate: endDate.value || ''       // Gunakan endDate (bukan end_date)
    })

    if (result && result.success) {
      schedules.value = result.data || []
      totalData.value = Number(result.totalData) || 0
      totalPages.value = Number(result.totalPages) || 1
      currentPage.value = Number(result.currentPage) || 1
    }
  } catch (err) {
    console.error('Error loading schedules:', err)
  }
}

// Reset Filter Tanggal
const clearDateFilter = () => {
  startDate.value = ''
  endDate.value = ''
}

// Fetch List Armada untuk Dropdown
const loadVehicles = async () => {
  try {
    const res = await fetch('http://localhost:5000/api/vehicles', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    const result = await res.json()
    if (result.success) {
      vehicles.value = result.data
    }
  } catch (err) {
    console.error('Error loading vehicles:', err)
  }
}

// Debounce Real-time Search & Filter Watcher
let searchTimeout = null
watch([searchQuery, filterStatus, startDate, endDate], () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    loadSchedules()
  }, 300)
})

// Auto-calculate Jatuh Tempo KM saat interval/last_serviced diisi
const calculateNextDue = () => {
  form.value.next_due_km = Number(form.value.last_serviced_km || 0) + Number(form.value.interval_km || 0)
}

// Format Tanggal Indonesia
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

// Handlers Modal & CRUD
const openModal = (item = null) => {
  if (item) {
    isEdit.value = true
    selectedId.value = item.id
    form.value = { 
      vehicle_id: item.vehicle_id,
      service_type: item.service_type,
      interval_km: item.interval_km || 0,
      last_serviced_km: item.last_serviced_km || 0,
      next_due_km: item.next_due_km || 0,
      last_serviced_date: item.last_serviced_date ? item.last_serviced_date.split('T')[0] : getTodayDate(),
      next_due_date: item.next_due_date ? item.next_due_date.split('T')[0] : '',
      status: item.status || 'pending'
    }
  } else {
    isEdit.value = false
    selectedId.value = null
    form.value = {
      vehicle_id: vehicles.value.length > 0 ? vehicles.value[0].id : '',
      service_type: 'Ganti Oli Mesin',
      interval_km: 10000,
      last_serviced_km: 0,
      next_due_km: 10000,
      last_serviced_date: getTodayDate(),
      next_due_date: '',
      status: 'scheduled'
    }
  }
  isModalOpen.value = true
}

const handleSave = async () => {
  if (!form.value.vehicle_id) return alert('Silakan pilih armada terlebih dahulu.')

  const res = isEdit.value 
    ? await scheduleService.update(selectedId.value, form.value)
    : await scheduleService.create(form.value)

  if (res.success) {
    isModalOpen.value = false
    loadSchedules()
  } else {
    alert(`Gagal menyimpan: ${res.message || 'Terjadi kesalahan'}`)
  }
}

const handleDelete = async (id) => {
  if (!confirm('Hapus jadwal perawatan ini?')) return
  const res = await scheduleService.delete(id)
  if (res.success) loadSchedules()
}

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    loadSchedules()
  }
}

// Helper Format Status Label
const formatStatus = (status) => {
  const map = {
    scheduled: 'Dijadwalkan',
    due: 'Mendekati Tempo',
    overdue: 'Terlambat',
    completed: 'Selesai'
  }
  return map[status] || status
}

// Pagination Numbers Windowing
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

onMounted(() => {
  loadSchedules()
  loadVehicles()
})
</script>

<template>
  <div class="page-container">
    <!-- Header Halaman -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Jadwal Perawatan Berkala</h1>
        <p class="page-subtitle">Konfigurasi interval kilometer dan batas tanggal servis armada.</p>
      </div>
      <button @click="openModal()" class="btn-primary">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
        Tambah Jadwal
      </button>
    </div>

    <!-- Control Bar UI (Search & Filter) -->
    <div class="control-bar">
      <div class="search-box">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        <input v-model="searchQuery" type="text" placeholder="Cari armada, plat, atau jenis servis..." />
      </div>

      <div class="filter-group">
        <!-- Filter Tanggal Jatuh Tempo -->
        <div class="date-filter-box">
          <input v-model="startDate" type="date" class="date-input" title="Tanggal Awal" />
          <span class="date-separator">s/d</span>
          <input v-model="endDate" type="date" class="date-input" title="Tanggal Akhir" />
          <button 
            v-if="startDate || endDate" 
            @click="clearDateFilter" 
            class="btn-reset-date" 
            title="Reset Filter Tanggal"
          >
            &times;
          </button>
        </div>

        <!-- Filter Status -->
        <select v-model="filterStatus" class="filter-select">
          <option value="all">Semua Status</option>
          <option value="scheduled">Dijadwalkan</option>
          <option value="due">Mendekati Tempo</option>
          <option value="overdue">Terlambat</option>
          <option value="completed">Selesai</option>
        </select>
      </div>
    </div>

    <!-- Table Card -->
    <div class="card-table">
      <div class="table-responsive">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Kendaraan / Armada</th>
              <th>Jenis Perawatan</th>
              <th>Interval (KM)</th>
              <th>Servis Terakhir</th>
              <th>Jatuh Tempo (KM & Tgl)</th>
              <th>Status</th>
              <th style="text-align: right;">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in schedules" :key="item.id">
              <td>
                <div class="vehicle-info">
                  <span class="font-bold-title">{{ item.vehicles?.model_name || '-' }}</span>
                  <span class="plate-badge">{{ item.vehicles?.plate_number || '-' }}</span>
                </div>
              </td>
              <td class="font-bold-title">{{ item.service_type }}</td>
              <td>{{ item.interval_km ? item.interval_km.toLocaleString('id-ID') + ' km' : '-' }}</td>
              <td>
                <div class="cell-stack">
                  <span>{{ item.last_serviced_km ? item.last_serviced_km.toLocaleString('id-ID') + ' km' : '0 km' }}</span>
                  <small class="sub-date">{{ formatDate(item.last_serviced_date) }}</small>
                </div>
              </td>
              <td>
                <div class="cell-stack">
                  <span class="due-badge">{{ item.next_due_km ? item.next_due_km.toLocaleString('id-ID') + ' km' : '-' }}</span>
                  <small class="sub-date highlight">{{ formatDate(item.next_due_date) }}</small>
                </div>
              </td>
              <td>
                <span :class="`badge badge-${item.status}`">
                  <span class="badge-dot"></span>
                  {{ formatStatus(item.status) }}
                </span>
              </td>
              <td style="text-align: right;">
                <div class="action-buttons">
                  <button @click="openModal(item)" class="btn-icon edit" title="Edit">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                  </button>
                  <button @click="handleDelete(item.id)" class="btn-icon delete" title="Hapus">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="schedules.length === 0">
              <td colspan="7" class="empty-state">
                <div class="empty-box">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  <p>Tidak ada jadwal perawatan yang ditemukan.</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer -->
      <div v-if="schedules.length > 0" class="pagination-footer">
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
          <div>
            <h3>{{ isEdit ? 'Edit Jadwal Perawatan' : 'Tambah Jadwal Perawatan' }}</h3>
            <p class="modal-subtitle">Atur interval kilometer dan batas tanggal servis armada.</p>
          </div>
          <button @click="isModalOpen = false" class="btn-close">&times;</button>
        </div>

        <form @submit.prevent="handleSave" class="form-container">
          <div class="form-group">
            <label>Pilih Armada</label>
            <select v-model="form.vehicle_id" class="custom-select" required :disabled="isEdit">
              <option value="" disabled>-- Pilih Kendaraan --</option>
              <option v-for="v in vehicles" :key="v.id" :value="v.id">
                {{ v.model_name }} ({{ v.plate_number }})
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Jenis Perawatan / Servis</label>
            <input v-model="form.service_type" type="text" required placeholder="Ganti Oli Mesin, Tune Up, Cek Rem, dll" />
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label>Interval (KM)</label>
              <input v-model="form.interval_km" type="number" required @input="calculateNextDue" placeholder="10000" />
            </div>
            <div class="form-group">
              <label>KM Servis Terakhir</label>
              <input v-model="form.last_serviced_km" type="number" required @input="calculateNextDue" placeholder="0" />
            </div>
          </div>

          <!-- Section Input Tanggal Servis -->
          <div class="form-grid">
            <div class="form-group">
              <label>Tanggal Servis Terakhir</label>
              <input v-model="form.last_serviced_date" type="date" />
            </div>
            <div class="form-group">
              <label>Target Tanggal Jatuh Tempo</label>
              <input v-model="form.next_due_date" type="date" />
            </div>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label>Jatuh Tempo (KM)</label>
              <input v-model="form.next_due_km" type="number" required placeholder="10000" />
            </div>
            <div class="form-group">
              <label>Status Perawatan</label>
              <select v-model="form.status" class="custom-select">
                <option value="scheduled">Dijadwalkan (Scheduled)</option>
                <option value="due">Mendekati Tempo (Due)</option>
                <option value="overdue">Terlambat (Overdue)</option>
                <option value="completed">Selesai (Completed)</option>
                </select>
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" @click="isModalOpen = false" class="btn-secondary">Batal</button>
            <button type="submit" class="btn-primary">Simpan Jadwal</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

.page-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  font-family: 'Plus Jakarta Sans', sans-serif;
  color: #0f172a;
}

.page-header { display: flex; justify-content: space-between; align-items: center; }
.page-title { font-size: 1.35rem; font-weight: 700; letter-spacing: -0.02em; color: #0f172a; }
.page-subtitle { font-size: 0.85rem; color: #64748b; margin-top: 2px; }

/* Control Bar UI (Search Box & Filter) */
.control-bar { display: flex; justify-content: space-between; align-items: center; gap: 1rem; }

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

.filter-group { display: flex; gap: 0.75rem; }

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

/* Style Filter Tanggal Kalender */
.date-filter-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 0 0.625rem;
  height: 42px;
  box-sizing: border-box;
}

.date-input {
  border: none;
  outline: none;
  font-size: 0.8rem;
  font-family: inherit;
  color: #334155;
  background: transparent;
  cursor: pointer;
}

.date-separator {
  font-size: 0.75rem;
  font-weight: 600;
  color: #94a3b8;
}

.btn-reset-date {
  background: #f1f5f9;
  border: none;
  color: #64748b;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  cursor: pointer;
}

.btn-reset-date:hover {
  background: #e2e8f0;
  color: #0f172a;
}

/* Table UI */
.card-table { background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05); overflow: hidden; }
.table-responsive { width: 100%; overflow-x: auto; }
.custom-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem; }
.custom-table th { background: #f8fafc; padding: 0.875rem 1.25rem; font-weight: 600; color: #475569; border-bottom: 1px solid #e2e8f0; white-space: nowrap; }
.custom-table td { padding: 0.875rem 1.25rem; border-bottom: 1px solid #f1f5f9; color: #334155; white-space: nowrap; }

.vehicle-info { display: flex; flex-direction: column; gap: 0.25rem; }
.font-bold-title { font-weight: 600; color: #0f172a; }
.plate-badge { background: #f1f5f9; color: #334155; padding: 0.2rem 0.5rem; border-radius: 6px; font-family: monospace; font-weight: 600; font-size: 0.8rem; border: 1px solid #cbd5e1; width: fit-content; }

/* Cell Stacking for KM & Date */
.cell-stack { display: flex; flex-direction: column; gap: 0.15rem; }
.sub-date { font-size: 0.75rem; color: #64748b; }
.sub-date.highlight { color: #2563eb; font-weight: 500; }
.due-badge { font-weight: 700; color: #2563eb; }

/* Status Badges */
.badge { display: inline-flex; align-items: center; gap: 0.375rem; padding: 0.3rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; text-transform: capitalize; }
.badge-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }

.badge-scheduled { background: #e0f2fe; color: #0369a1; } .badge-scheduled .badge-dot { background: #0284c7; }
.badge-due { background: #fef3c7; color: #b45309; } .badge-due .badge-dot { background: #d97706; }
.badge-completed { background: #dcfce7; color: #15803d; } .badge-completed .badge-dot { background: #16a34a; }
.badge-overdue { background: #fee2e2; color: #b91c1c; } .badge-overdue .badge-dot { background: #dc2626; }

/* Pagination UI */
.pagination-footer { display: flex; justify-content: space-between; align-items: center; padding: 0.875rem 1.25rem; background: #f8fafc; border-top: 1px solid #e2e8f0; flex-wrap: wrap; gap: 0.75rem; }
.pagination-info { font-size: 0.825rem; color: #64748b; }
.pagination-buttons { display: flex; align-items: center; gap: 0.25rem; }
.btn-page { min-width: 32px; height: 32px; padding: 0 0.5rem; border: 1px solid #cbd5e1; background: #ffffff; border-radius: 6px; font-size: 0.825rem; font-weight: 600; color: #475569; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; }
.btn-page.icon-btn { font-size: 1rem; color: #64748b; }
.btn-page:hover:not(:disabled) { background: #f1f5f9; color: #0f172a; border-color: #94a3b8; }
.btn-page:disabled { opacity: 0.4; cursor: not-allowed; }
.btn-page.active { background: #2563eb; color: #ffffff; border-color: #2563eb; }
.page-ellipsis { padding: 0 0.35rem; color: #94a3b8; font-size: 0.85rem; }

/* Buttons & Action Controls */
.action-buttons { display: flex; justify-content: flex-end; gap: 0.5rem; }
.btn-icon { width: 34px; height: 34px; border-radius: 8px; border: 1px solid #e2e8f0; background: #ffffff; display: flex; align-items: center; justify-content: center; cursor: pointer; }
.btn-icon svg { width: 16px !important; height: 16px !important; min-width: 16px; min-height: 16px; flex-shrink: 0; }
.btn-icon.edit:hover { background: #eff6ff; color: #2563eb; border-color: #bfdbfe; }
.btn-icon.delete:hover { background: #fef2f2; color: #dc2626; border-color: #fecaca; }

.btn-primary { display: inline-flex; align-items: center; gap: 0.5rem; background: #2563eb; color: #ffffff; border: none; padding: 0 1.25rem; height: 42px; border-radius: 10px; font-weight: 600; font-size: 0.875rem; cursor: pointer; }
.btn-primary svg { width: 18px !important; height: 18px !important; flex-shrink: 0; }
.btn-secondary { background: #ffffff; color: #475569; border: 1px solid #cbd5e1; padding: 0 1.25rem; height: 42px; border-radius: 10px; font-weight: 600; font-size: 0.875rem; cursor: pointer; }

/* Modal Form UI */
.modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 50; padding: 1rem; }
.modal-card { background: #ffffff; padding: 2rem; border-radius: 16px; width: 100%; max-width: 520px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); }
.modal-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
.modal-header h3 { font-size: 1.15rem; font-weight: 700; color: #0f172a; }
.modal-subtitle { font-size: 0.825rem; color: #64748b; margin-top: 2px; }
.btn-close { background: none; border: none; font-size: 1.5rem; color: #94a3b8; cursor: pointer; }

.form-container { display: flex; flex-direction: column; gap: 1rem; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.form-group { display: flex; flex-direction: column; gap: 0.375rem; }
.form-group label { font-size: 0.8rem; font-weight: 600; color: #475569; }
.form-group input, .custom-select { height: 40px; padding: 0 0.875rem; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.875rem; color: #0f172a; outline: none; }
.modal-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1rem; }

.empty-state { text-align: center; padding: 3rem !important; }
.empty-box { display: flex; flex-direction: column; align-items: center; color: #94a3b8; gap: 0.5rem; }
.empty-box svg { width: 48px !important; height: 48px !important; }

@media (max-width: 768px) {
  .page-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
  .control-bar { flex-direction: column; align-items: stretch; }
  .search-box { max-width: 100%; }
  .filter-group { width: 100%; }
  .filter-select { flex: 1; }
  .form-grid { grid-template-columns: 1fr; }
}
</style>