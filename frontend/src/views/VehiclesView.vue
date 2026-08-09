<script setup>
import { ref, onMounted } from 'vue'

const vehicles = ref([])
const isModalOpen = ref(false)
const isEdit = ref(false)
const selectedId = ref(null)

const form = ref({
  model_name: '',
  plate_number: '',
  category: 'Truck',
  current_mileage: 0,
  status: 'ready'
})

const getToken = () => localStorage.getItem('token')

const fetchVehicles = async () => {
  try {
    const res = await fetch('http://localhost:5000/api/vehicles', {
      headers: { Authorization: `Bearer ${getToken()}` }
    })
    const result = await res.json()
    if (result.success) vehicles.value = result.data
  } catch (err) {
    console.error(err)
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
    form.value = { model_name: '', plate_number: '', category: 'Truck', current_mileage: 0, status: 'ready' }
  }
  isModalOpen.value = true
}

const saveVehicle = async () => {
  const url = isEdit.value
    ? `http://localhost:5000/api/vehicles/${selectedId.value}`
    : 'http://localhost:5000/api/vehicles'
  const method = isEdit.value ? 'PUT' : 'POST'

  try {
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`
      },
      body: JSON.stringify(form.value)
    })

    const result = await res.json()

    if (res.ok && result.success) {
      isModalOpen.value = false
      fetchVehicles()
    } else {
      alert(`Gagal menyimpan: ${result.message || 'Terjadi kesalahan'}`)
    }
  } catch (err) {
    console.error('Fetch error:', err)
    alert('Gagal terhubung ke server backend.')
  }
}

const removeVehicle = async (id) => {
  if (!confirm('Yakin ingin menghapus kendaraan ini?')) return
  try {
    const res = await fetch(`http://localhost:5000/api/vehicles/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` }
    })
    const result = await res.json()
    if (result.success) fetchVehicles()
  } catch (err) {
    console.error(err)
  }
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

onMounted(fetchVehicles)
</script>

<template>
  <div class="dashboard-wrapper">
    <!-- Sidebar Navigation -->
    <aside class="sidebar">
      <div class="sidebar-brand">
        <div class="brand-logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 17.5V14M19 14C20.1046 14 21 13.1046 21 12V6C21 4.89543 20.1046 4 19 4H5C3.89543 4 3 4.89543 3 6V18C3 19.1046 3.89543 20 5 20H13.5M19 14H15.5M13 10V6M9 10V6M5 10V6M5 10C5 11.1046 5.89543 12 7 12H9C10.1046 12 11 11.1046 11 10M11 10C11 11.1046 11.8954 12 13 12H15C16.1046 12 17 11.1046 17 10V6M19 17.5L21.5 20M19 17.5L16.5 20"/></svg>
        </div>
        <h2>FleetRepair</h2>
      </div>
      <nav class="sidebar-nav">
        <router-link to="/" class="nav-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
          <span>Dashboard</span>
        </router-link>
        <router-link to="/vehicles" class="nav-item active">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/><path d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1h2m4 0h1a1 1 0 001-1v-4a1 1 0 00-.293-.707l-3-3A1 1 0 0016.586 7H13"/></svg>
          <span>Armada (Vehicles)</span>
        </router-link>
      </nav>
    </aside>

    <!-- Main Content Area -->
    <div class="main-area">
      <header class="navbar-modern">
        <div>
          <h1 class="page-title">Manajemen Armada</h1>
          <p class="page-subtitle">Kelola daftar kendaraan operasional dan status kesiapannya.</p>
        </div>
        <button @click="openModal()" class="btn-primary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
          Tambah Kendaraan
        </button>
      </header>

      <main class="content-modern">
        <div class="card-table">
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
                    <button @click="openModal(item)" class="btn-icon edit" title="Edit">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                    </button>
                    <button @click="removeVehicle(item.id)" class="btn-icon delete" title="Hapus">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="vehicles.length === 0">
                <td colspan="6" class="empty-state">
                  <div class="empty-box">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/><path d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1h2m4 0h1a1 1 0 001-1v-4a1 1 0 00-.293-.707l-3-3A1 1 0 0016.586 7H13"/></svg>
                    <p>Belum ada data armada tersimpan.</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>

    <!-- Modal Form -->
    <div v-if="isModalOpen" class="modal-overlay" @click.self="isModalOpen = false">
      <div class="modal-card">
        <div class="modal-header">
          <div>
            <h3>{{ isEdit ? 'Edit Data Kendaraan' : 'Tambah Kendaraan Baru' }}</h3>
            <p>Isi formulir di bawah ini dengan lengkap.</p>
          </div>
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

.dashboard-wrapper {
  display: flex;
  min-height: 100vh;
  background-color: #f8fafc;
  font-family: 'Plus Jakarta Sans', sans-serif;
  color: #0f172a;
}

/* Sidebar Styling */
.sidebar {
  width: 260px;
  background: #ffffff;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
}

.sidebar-brand {
  height: 80px;
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0 1.5rem;
  border-bottom: 1px solid #f1f5f9;
}

.brand-logo {
  width: 38px;
  height: 38px;
  background: #2563eb;
  color: white;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-logo svg {
  width: 22px;
  height: 22px;
}

.sidebar-brand h2 {
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #0f172a;
}

.sidebar-nav {
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: #64748b;
  font-weight: 600;
  font-size: 0.9rem;
  border-radius: 10px;
  text-decoration: none;
  transition: all 0.2s ease;
}

.nav-item svg {
  width: 20px;
  height: 20px;
}

.nav-item:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.nav-item.active {
  background: #eff6ff;
  color: #2563eb;
}

/* Main Content Area */
.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.navbar-modern {
  height: 80px;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2.5rem;
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

.content-modern {
  padding: 2.5rem;
}

/* Card & Table */
.card-table {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.custom-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.9rem;
}

.custom-table th {
  background: #f8fafc;
  padding: 1rem 1.5rem;
  font-weight: 600;
  color: #475569;
  border-bottom: 1px solid #e2e8f0;
}

.custom-table td {
  padding: 1.125rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
}

.font-bold-title {
  font-weight: 600;
  color: #0f172a;
}

.plate-badge {
  background: #f1f5f9;
  color: #334155;
  padding: 0.25rem 0.625rem;
  border-radius: 6px;
  font-family: monospace;
  font-weight: 600;
  font-size: 0.85rem;
  border: 1px solid #cbd5e1;
}

.capitalize { text-transform: capitalize; }

/* Status Badges */
.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.35rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.badge-ready { background: #dcfce7; color: #15803d; }
.badge-ready .badge-dot { background: #16a34a; }

.badge-in_use { background: #e0f2fe; color: #0369a1; }
.badge-in_use .badge-dot { background: #0284c7; }

.badge-under_maintenance { background: #fef9c3; color: #a16207; }
.badge-under_maintenance .badge-dot { background: #d97706; }

.badge-breakdown { background: #fee2e2; color: #b91c1c; }
.badge-breakdown .badge-dot { background: #dc2626; }

/* Action Buttons */
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
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon svg { width: 16px; height: 16px; }

.btn-icon.edit:hover { background: #eff6ff; color: #2563eb; border-color: #bfdbfe; }
.btn-icon.delete:hover { background: #fef2f2; color: #dc2626; border-color: #fecaca; }

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #2563eb;
  color: white;
  border: none;
  padding: 0.625rem 1.25rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary svg { width: 18px; height: 18px; }
.btn-primary:hover { background: #1d4ed8; }

.btn-secondary {
  background: white;
  color: #475569;
  border: 1px solid #cbd5e1;
  padding: 0.625rem 1.25rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
}

/* Modal Styling */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.modal-card {
  background: white;
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
.modal-header p { font-size: 0.825rem; color: #64748b; margin-top: 2px; }

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #94a3b8;
  cursor: pointer;
}

.form-container { display: flex; flex-direction: column; gap: 1.125rem; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

.form-group { display: flex; flex-direction: column; gap: 0.375rem; }
.form-group label { font-size: 0.8rem; font-weight: 600; color: #475569; }

.form-group input, .custom-select {
  padding: 0.625rem 0.875rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #0f172a;
  outline: none;
  transition: border-color 0.2s;
}

.form-group input:focus, .custom-select:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1rem;
}

.empty-state { text-align: center; padding: 3rem !important; }
.empty-box { display: flex; flex-direction: column; align-items: center; color: #94a3b8; gap: 0.5rem; }
.empty-box svg { width: 48px; height: 48px; }
</style>