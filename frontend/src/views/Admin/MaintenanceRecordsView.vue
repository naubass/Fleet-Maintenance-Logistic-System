<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { maintenanceService } from '../../services/maintenanceService'
import PartUsageModal from '../../components/PartUsageModal.vue' // 1. Import Komponen Modal Part Usage

const records = ref([])
const vehicles = ref([])
const mechanics = ref([])
const isModalOpen = ref(false)
const isEdit = ref(false)
const selectedId = ref(null)

// State Modal Pemakaian Sparepart
const isPartModalOpen = ref(false)
const selectedRecordForParts = ref(null)

// State Pagination & Filter Server-Side
const searchQuery = ref('')
const filterStatus = ref('all')
const currentPage = ref(1)
const itemsPerPage = ref(10)
const totalData = ref(0)
const totalPages = ref(1)

const getTodayDate = () => new Date().toISOString().split('T')[0]

// Form State Sesuai Skema Database Supabase
const form = ref({
  vehicle_id: '',
  assigned_mechanic_id: '',
  problem_description: '',
  action_taken: '',
  mileage_at_service: 0,
  total_cost: 0,
  status: 'completed',
  started_at: getTodayDate()
})

// Load Catatan Perbaikan
const loadRecords = async () => {
  try {
    const result = await maintenanceService.getAll({
      page: currentPage.value,
      limit: itemsPerPage.value,
      search: searchQuery.value,
      status: filterStatus.value
    })

    if (result && result.success) {
      records.value = result.data || []
      totalData.value = Number(result.totalData) || 0
      totalPages.value = Number(result.totalPages) || 1
      currentPage.value = Number(result.currentPage) || 1
    }
  } catch (err) {
    console.error('Error loading maintenance records:', err)
  }
}

// Load List Armada untuk Dropdown
const loadVehicles = async () => {
  try {
    const res = await fetch('http://localhost:5000/api/vehicles', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    const result = await res.json()
    if (result.success) vehicles.value = result.data || []
  } catch (err) {
    console.error('Error loading vehicles:', err)
  }
}

// Load List Mekanik dari Profiles
const loadMechanics = async () => {
  try {
    const res = await fetch('http://localhost:5000/api/users?role=mechanic', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    const result = await res.json()
    if (result.success) mechanics.value = result.data || []
  } catch (err) {
    console.error('Error loading mechanics:', err)
  }
}

// Watcher Search & Filter
let searchTimeout = null
watch([searchQuery, filterStatus], () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    loadRecords()
  }, 300)
})

// Formatters
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount || 0)
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

const formatStatus = (status) => {
  const map = {
    pending: 'Menunggu',
    in_progress: 'Dikerjakan',
    completed: 'Selesai',
    cancelled: 'Dibatalkan'
  }
  return map[status] || status
}

// Handler Modal Perbaikan (Create / Edit)
const openModal = (item = null) => {
  if (item) {
    isEdit.value = true
    selectedId.value = item.id
    
    // Tentukan biaya jasa murni secara aman
    const currentLaborCost = (item.labor_cost && item.labor_cost > 0) 
      ? item.labor_cost 
      : (item.total_cost || 0)

    form.value = {
      vehicle_id: item.vehicle_id,
      assigned_mechanic_id: item.assigned_mechanic_id || '',
      problem_description: item.problem_description || '',
      action_taken: item.action_taken || '',
      mileage_at_service: item.mileage_at_service || 0,
      total_cost: currentLaborCost, // Mengisi input modal dengan biaya jasa murni
      status: item.status || 'completed',
      started_at: item.started_at ? item.started_at.split('T')[0] : getTodayDate()
    }
  } else {
    isEdit.value = false
    selectedId.value = null
    form.value = {
      vehicle_id: vehicles.value.length > 0 ? vehicles.value[0].id : '',
      assigned_mechanic_id: mechanics.value.length > 0 ? mechanics.value[0].id : '',
      problem_description: '',
      action_taken: '',
      mileage_at_service: 0,
      total_cost: 0,
      status: 'completed',
      started_at: getTodayDate()
    }
  }
  isModalOpen.value = true
}

const handleSave = async () => {
  if (!form.value.vehicle_id) return alert('Silakan pilih armada terlebih dahulu.')
  if (!form.value.problem_description) return alert('Deskripsi masalah wajib diisi.')

  const res = isEdit.value 
    ? await maintenanceService.update(selectedId.value, form.value)
    : await maintenanceService.create(form.value)

  if (res && res.success) {
    isModalOpen.value = false
    loadRecords()
  } else {
    alert(`Gagal menyimpan: ${res?.message || 'Terjadi kesalahan'}`)
  }
}

const handleDelete = async (id) => {
  if (!confirm('Hapus catatan perbaikan ini?')) return
  const res = await maintenanceService.delete(id)
  if (res && res.success) loadRecords()
}

// 2. Handler Modal Pemakaian Sparepart
const openPartUsageModal = (record) => {
  selectedRecordForParts.value = record
  isPartModalOpen.value = true
}

const onPartUsageUpdated = () => {
  loadRecords() // Refresh tabel agar total_cost terupdate otomatis
}

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    loadRecords()
  }
}

const visiblePages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  const delta = 1
  const range = []

  for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) range.push(i)
  if (current - delta > 2) range.unshift('...')
  if (current + delta < total - 1) range.push('...')
  range.unshift(1)
  if (total > 1) range.push(total)
  return range
})

onMounted(() => {
  loadRecords()
  loadVehicles()
  loadMechanics()
})
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h1 class="page-title">Catatan Perbaikan & Servis</h1>
        <p class="page-subtitle">Riwayat perbaikan teknis, biaya, dan mekanik penanggung jawab.</p>
      </div>
      <button @click="openModal()" class="btn-primary">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
        Tambah Catatan
      </button>
    </div>

    <div class="control-bar">
      <div class="search-box">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        <input v-model="searchQuery" type="text" placeholder="Cari armada, deskripsi, atau tindakan..." />
      </div>

      <div class="filter-group">
        <select v-model="filterStatus" class="filter-select">
          <option value="all">Semua Status</option>
          <option value="completed">Selesai</option>
          <option value="in_progress">Dikerjakan</option>
          <option value="pending">Menunggu</option>
          <option value="cancelled">Dibatalkan</option>
        </select>
      </div>
    </div>

    <div class="card-table">
      <div class="table-responsive">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Kendaraan / Armada</th>
              <th>Masalah & Perbaikan</th>
              <th>Mekanik</th>
              <th>KM Saat Servis</th>
              <th>Total Biaya</th>
              <th>Status</th>
              <th style="text-align: right;">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in records" :key="item.id">
              <td>
                <div class="vehicle-info">
                  <span class="font-bold-title">{{ item.vehicles?.model_name || '-' }}</span>
                  <span class="plate-badge">{{ item.vehicles?.plate_number || '-' }}</span>
                </div>
              </td>
              <td>
                <div class="cell-stack">
                  <span class="font-bold-title">{{ item.problem_description }}</span>
                  <small class="sub-date">Tindakan: {{ item.action_taken || '-' }} | {{ formatDate(item.started_at) }}</small>
                </div>
              </td>
              <td>{{ item.mechanic?.full_name || '-' }}</td>
              <td>{{ item.mileage_at_service ? item.mileage_at_service.toLocaleString('id-ID') + ' km' : '0 km' }}</td>
              <td class="cost-text">{{ formatCurrency(item.total_cost) }}</td>
              <td>
                <span :class="`badge badge-${item.status}`">
                  <span class="badge-dot"></span>
                  {{ formatStatus(item.status) }}
                </span>
              </td>
              <td style="text-align: right;">
                <div class="action-buttons">
                  <!-- 3. Tombol Kelola Pemakaian Sparepart -->
                  <button @click="openPartUsageModal(item)" class="btn-icon parts" title="Kelola Pemakaian Sparepart">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                  </button>
                  <button @click="openModal(item)" class="btn-icon edit" title="Edit Catatan">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                  </button>
                  <button @click="handleDelete(item.id)" class="btn-icon delete" title="Hapus">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="records.length === 0">
              <td colspan="7" class="empty-state">
                <div class="empty-box">
                  <p>Tidak ada catatan perbaikan yang ditemukan.</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="records.length > 0" class="pagination-footer">
        <span class="pagination-info">
          Menampilkan {{ (currentPage - 1) * itemsPerPage + 1 }} - 
          {{ Math.min(currentPage * itemsPerPage, totalData) }} dari {{ totalData }} data
        </span>
        <div class="pagination-buttons">
          <button @click="changePage(1)" :disabled="currentPage === 1" class="btn-page icon-btn">«</button>
          <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1" class="btn-page icon-btn">‹</button>
          <template v-for="(page, index) in visiblePages" :key="index">
            <span v-if="page === '...'" class="page-ellipsis">...</span>
            <button v-else @click="changePage(page)" :class="['btn-page', { active: currentPage === page }]">{{ page }}</button>
          </template>
          <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages" class="btn-page icon-btn">›</button>
          <button @click="changePage(totalPages)" :disabled="currentPage === totalPages" class="btn-page icon-btn">»</button>
        </div>
      </div>
    </div>

    <!-- Modal Form Catatan Perbaikan -->
    <div v-if="isModalOpen" class="modal-overlay" @click.self="isModalOpen = false">
      <div class="modal-card">
        <div class="modal-header">
          <h3>{{ isEdit ? 'Edit Catatan Perbaikan' : 'Tambah Catatan Perbaikan' }}</h3>
          <button @click="isModalOpen = false" class="btn-close">&times;</button>
        </div>

        <form @submit.prevent="handleSave" class="form-container">
          <div class="form-group">
            <label>Pilih Armada</label>
            <select v-model="form.vehicle_id" class="custom-select" required :disabled="isEdit">
              <option value="" disabled>-- Pilih Kendaraan --</option>
              <option v-for="v in vehicles" :key="v.id" :value="v.id">{{ v.model_name }} ({{ v.plate_number }})</option>
            </select>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label>Pilih Mekanik</label>
              <select v-model="form.assigned_mechanic_id" class="custom-select">
                <option value="">-- Pilih Mekanik --</option>
                <option v-for="m in mechanics" :key="m.id" :value="m.id">{{ m.full_name }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Tanggal Pengerjaan</label>
              <input v-model="form.started_at" type="date" required />
            </div>
          </div>

          <div class="form-group">
            <label>Deskripsi Masalah / Kerusakan</label>
            <input v-model="form.problem_description" type="text" required placeholder="Contoh: Rem bunyi decit dan kurang pakem" />
          </div>

          <div class="form-group">
            <label>Tindakan Perbaikan</label>
            <textarea v-model="form.action_taken" rows="2" class="custom-textarea" placeholder="Contoh: Pembersihan tromol dan penggantian kampas rem depan"></textarea>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label>KM Saat Servis</label>
              <input v-model="form.mileage_at_service" type="number" required placeholder="85000" />
            </div>
            <div class="form-group">
              <label>Total Biaya (Rp)</label>
              <input v-model="form.total_cost" type="number" required placeholder="1500000" />
            </div>
          </div>

          <div class="form-group">
            <label>Status Perbaikan</label>
            <select v-model="form.status" class="custom-select">
              <option value="pending">Menunggu (Pending)</option>
              <option value="in_progress">Sedang Dikerjakan (In Progress)</option>
              <option value="completed">Selesai (Completed)</option>
              <option value="cancelled">Dibatalkan (Cancelled)</option>
            </select>
          </div>

          <div class="modal-actions">
            <button type="button" @click="isModalOpen = false" class="btn-secondary">Batal</button>
            <button type="submit" class="btn-primary">Simpan Catatan</button>
          </div>
        </form>
      </div>
    </div>

    <!-- 4. Modal Pemakaian Sparepart Component -->
    <PartUsageModal
      :is-open="isPartModalOpen"
      :maintenance-record="selectedRecordForParts"
      @close="isPartModalOpen = false"
      @updated="onPartUsageUpdated"
    />
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

.page-container { display: flex; flex-direction: column; gap: 1.5rem; font-family: 'Plus Jakarta Sans', sans-serif; color: #0f172a; }
.page-header { display: flex; justify-content: space-between; align-items: center; }
.page-title { font-size: 1.35rem; font-weight: 700; color: #0f172a; }
.page-subtitle { font-size: 0.85rem; color: #64748b; margin-top: 2px; }

.control-bar { display: flex; justify-content: space-between; gap: 1rem; }
.search-box { display: flex; align-items: center; gap: 0.625rem; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 10px; padding: 0 0.875rem; flex: 1; max-width: 380px; height: 42px; }
.search-box svg { width: 18px; height: 18px; color: #94a3b8; }
.search-box input { border: none; outline: none; width: 100%; font-size: 0.875rem; background: transparent; }
.filter-select { height: 42px; padding: 0 0.875rem; border: 1px solid #cbd5e1; border-radius: 10px; font-size: 0.875rem; background: #ffffff; cursor: pointer; }

.card-table { background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; }
.table-responsive { width: 100%; overflow-x: auto; }
.custom-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem; }
.custom-table th { background: #f8fafc; padding: 0.875rem 1.25rem; font-weight: 600; color: #475569; border-bottom: 1px solid #e2e8f0; }
.custom-table td { padding: 0.875rem 1.25rem; border-bottom: 1px solid #f1f5f9; color: #334155; }

.vehicle-info { display: flex; flex-direction: column; gap: 0.25rem; }
.font-bold-title { font-weight: 600; color: #0f172a; }
.plate-badge { background: #f1f5f9; color: #334155; padding: 0.2rem 0.5rem; border-radius: 6px; font-family: monospace; font-weight: 600; font-size: 0.8rem; border: 1px solid #cbd5e1; width: fit-content; }
.cost-text { font-weight: 700; color: #059669; }

.cell-stack { display: flex; flex-direction: column; gap: 0.15rem; }
.sub-date { font-size: 0.75rem; color: #64748b; }

.badge { display: inline-flex; align-items: center; gap: 0.375rem; padding: 0.3rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
.badge-dot { width: 6px; height: 6px; border-radius: 50%; }
.badge-completed { background: #dcfce7; color: #15803d; } .badge-completed .badge-dot { background: #16a34a; }
.badge-in_progress { background: #fef3c7; color: #b45309; } .badge-in_progress .badge-dot { background: #d97706; }
.badge-pending { background: #e0f2fe; color: #0369a1; } .badge-pending .badge-dot { background: #0284c7; }
.badge-cancelled { background: #fee2e2; color: #b91c1c; } .badge-cancelled .badge-dot { background: #dc2626; }

.pagination-footer { display: flex; justify-content: space-between; align-items: center; padding: 0.875rem 1.25rem; background: #f8fafc; border-top: 1px solid #e2e8f0; }
.pagination-info { font-size: 0.825rem; color: #64748b; }
.pagination-buttons { display: flex; gap: 0.25rem; }
.btn-page { min-width: 32px; height: 32px; border: 1px solid #cbd5e1; background: #ffffff; border-radius: 6px; font-size: 0.825rem; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; }
.btn-page.active { background: #2563eb; color: #ffffff; border-color: #2563eb; }

.action-buttons { display: flex; justify-content: flex-end; gap: 0.5rem; }
.btn-icon { width: 34px; height: 34px; border-radius: 8px; border: 1px solid #e2e8f0; background: #ffffff; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s ease; }
.btn-icon svg { width: 16px; height: 16px; }

/* Style tombol kunci pas (parts) */
.btn-icon.parts:hover { background: #eff6ff; border-color: #bfdbfe; color: #2563eb; }

.btn-primary { display: inline-flex; align-items: center; gap: 0.5rem; background: #2563eb; color: #ffffff; border: none; padding: 0 1.25rem; height: 42px; border-radius: 10px; font-weight: 600; cursor: pointer; }
.btn-secondary { background: #ffffff; color: #475569; border: 1px solid #cbd5e1; padding: 0 1.25rem; height: 42px; border-radius: 10px; font-weight: 600; cursor: pointer; }

.modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 50; padding: 1rem; }
.modal-card { background: #ffffff; padding: 2rem; border-radius: 16px; width: 100%; max-width: 560px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); }
.modal-header { display: flex; justify-content: space-between; margin-bottom: 1.5rem; }
.btn-close { background: none; border: none; font-size: 1.5rem; color: #94a3b8; cursor: pointer; }

.form-container { display: flex; flex-direction: column; gap: 1rem; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.form-group { display: flex; flex-direction: column; gap: 0.375rem; }
.form-group label { font-size: 0.8rem; font-weight: 600; color: #475569; }
.form-group input, .custom-select, .custom-textarea { padding: 0.6rem 0.875rem; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.875rem; outline: none; font-family: inherit; }
.modal-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1rem; }

.empty-state { text-align: center; padding: 2.5rem !important; color: #94a3b8; }
.page-ellipsis { padding: 0 0.35rem; color: #94a3b8; font-size: 0.85rem; }
</style>