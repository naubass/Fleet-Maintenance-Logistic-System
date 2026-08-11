<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { userService } from '../../services/userService'
import { useAuthStore } from '../../stores/authStore' 

const authStore = useAuthStore() 

const users = ref([])
const isModalOpen = ref(false)
const isEdit = ref(false)
const selectedId = ref(null)

const searchQuery = ref('')
const filterRole = ref('all')
const currentPage = ref(1)
const itemsPerPage = ref(10)
const totalData = ref(0)
const totalPages = ref(1)

const form = ref({
  email: '',
  password: '',
  full_name: '',
  role: 'mechanic',
  phone: ''
})

const loadUsers = async () => {
  try {
    const result = await userService.getAll({
      page: currentPage.value,
      limit: itemsPerPage.value,
      search: searchQuery.value,
      role: filterRole.value
    })

    if (result && result.success) {
      users.value = result.data || []
      totalData.value = Number(result.totalData) || 0
      totalPages.value = Number(result.totalPages) || 1
      currentPage.value = Number(result.currentPage) || 1
    } else {
      users.value = []
      totalData.value = 0
      totalPages.value = 1
    }
  } catch (err) {
    console.error('Error loading users:', err)
    users.value = []
  }
}

let searchTimeout = null
watch([searchQuery, filterRole], () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    loadUsers()
  }, 300)
})

const openModal = (item = null) => {
  if (item) {
    isEdit.value = true
    selectedId.value = item.id
    form.value = {
      email: '',
      password: '',
      full_name: item.full_name || '',
      role: item.role || 'mechanic',
      phone: item.phone || ''
    }
  } else {
    isEdit.value = false
    selectedId.value = null
    form.value = {
      email: '',
      password: '',
      full_name: '',
      role: 'mechanic',
      phone: ''
    }
  }
  isModalOpen.value = true
}

// 3. Perbaikan fungsi handleSave dengan try...catch & authStore
const handleSave = async () => {
  try {
    if (!form.value.full_name) return alert('Nama lengkap wajib diisi.')
    if (!isEdit.value && (!form.value.email || !form.value.password)) {
      return alert('Email dan password wajib diisi untuk pengguna baru.')
    }

    const res = isEdit.value
      ? await userService.update(selectedId.value, form.value)
      : await userService.create(form.value)

    if (res && res.success) {
      // Jika user mengedit profilnya sendiri, update state Pinia & Navbar
      if (isEdit.value && selectedId.value === authStore.user?.id) {
        authStore.updateUserData({
          full_name: form.value.full_name,
          role: form.value.role,
          phone: form.value.phone
        })
      }

      isModalOpen.value = false
      await loadUsers()
    } else {
      alert(`Gagal menyimpan: ${res?.message || 'Terjadi kesalahan'}`)
    }
  } catch (err) {
    console.error('Error saving user:', err)
    alert('Terjadi kesalahan sistem saat menyimpan data.')
  }
}

const handleDelete = async (id) => {
  if (!confirm('Hapus profil pengguna ini?')) return
  const res = await userService.delete(id)
  if (res && res.success) loadUsers()
}

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    loadUsers()
  }
}

const formatRole = (role) => {
  const map = { admin: 'Administrator', mechanic: 'Mekanik', manager: 'Manager' }
  return map[role] || role
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
  loadUsers()
})
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h1 class="page-title">Kelola Pengguna</h1>
        <p class="page-subtitle">Atur profil, role akses (Admin, Mekanik, Manager), dan kontak pengguna.</p>
      </div>
      <button @click="openModal()" class="btn-primary">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
        Tambah Pengguna
      </button>
    </div>

    <div class="control-bar">
      <div class="search-box">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        <input v-model="searchQuery" type="text" placeholder="Cari nama atau no. telepon..." />
      </div>

      <div class="filter-group">
        <select v-model="filterRole" class="filter-select">
          <option value="all">Semua Role</option>
          <option value="admin">Admin</option>
          <option value="mechanic">Mekanik</option>
          <option value="manager">Manager</option>
        </select>
      </div>
    </div>

    <div class="card-table">
      <div class="table-responsive">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Nama Lengkap</th>
              <th>Role Akses</th>
              <th>Telepon / Whatsapp</th>
              <th>ID User</th>
              <th style="text-align: right;">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in users" :key="item.id">
              <td class="font-bold-title">{{ item.full_name || '-' }}</td>
              <td>
                <span :class="`badge badge-${item.role}`">
                  <span class="badge-dot"></span>
                  {{ formatRole(item.role) }}
                </span>
              </td>
              <td>{{ item.phone || '-' }}</td>
              <td class="id-text">{{ item.id }}</td>
              <td style="text-align: right;">
                <div class="action-buttons">
                  <button @click="openModal(item)" class="btn-icon edit" title="Edit Pengguna">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                  </button>
                  <button @click="handleDelete(item.id)" class="btn-icon delete" title="Hapus">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="users.length === 0">
              <td colspan="5" class="empty-state">
                <p>Tidak ada data pengguna ditemukan.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="users.length > 0" class="pagination-footer">
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

    <!-- Modal Form -->
    <div v-if="isModalOpen" class="modal-overlay" @click.self="isModalOpen = false">
      <div class="modal-card">
        <div class="modal-header">
          <h3>{{ isEdit ? 'Edit Pengguna' : 'Tambah Pengguna Baru' }}</h3>
          <button @click="isModalOpen = false" class="btn-close">&times;</button>
        </div>

        <form @submit.prevent="handleSave" class="form-container">
          <template v-if="!isEdit">
            <div class="form-group">
              <label>Email Pengguna</label>
              <input v-model="form.email" type="email" required placeholder="mekanik@fleetrepair.com" />
            </div>
            <div class="form-group">
              <label>Password Login</label>
              <input v-model="form.password" type="password" required placeholder="Minimal 6 karakter" />
            </div>
          </template>

          <div class="form-group">
            <label>Nama Lengkap</label>
            <input v-model="form.full_name" type="text" required placeholder="Budi Santoso" />
          </div>

          <div class="form-group">
            <label>Role Akses</label>
            <select v-model="form.role" class="custom-select" required>
              <option value="admin">Administrator (Admin)</option>
              <option value="mechanic">Mekanik (Mechanic)</option>
              <option value="manager">Manager / Supervisor</option>
            </select>
          </div>

          <div class="form-group">
            <label>Nomor Telepon / WA</label>
            <input v-model="form.phone" type="text" placeholder="081234567890" />
          </div>

          <div class="modal-actions">
            <button type="button" @click="isModalOpen = false" class="btn-secondary">Batal</button>
            <button type="submit" class="btn-primary">{{ isEdit ? 'Simpan Perubahan' : 'Buat Pengguna' }}</button>
          </div>
        </form>
      </div>
    </div>
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

.font-bold-title { font-weight: 600; color: #0f172a; }
.id-text { font-family: monospace; font-size: 0.8rem; color: #64748b; }

.badge { display: inline-flex; align-items: center; gap: 0.375rem; padding: 0.3rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
.badge-dot { width: 6px; height: 6px; border-radius: 50%; }
.badge-admin { background: #fef3c7; color: #b45309; } .badge-admin .badge-dot { background: #d97706; }
.badge-mechanic { background: #e0f2fe; color: #0369a1; } .badge-mechanic .badge-dot { background: #0284c7; }
.badge-manager { background: #f3e8ff; color: #6b21a8; } .badge-manager .badge-dot { background: #9333ea; }

.pagination-footer { display: flex; justify-content: space-between; align-items: center; padding: 0.875rem 1.25rem; background: #f8fafc; border-top: 1px solid #e2e8f0; }
.pagination-info { font-size: 0.825rem; color: #64748b; }
.pagination-buttons { display: flex; gap: 0.25rem; }
.btn-page { min-width: 32px; height: 32px; border: 1px solid #cbd5e1; background: #ffffff; border-radius: 6px; font-size: 0.825rem; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; }
.btn-page.active { background: #2563eb; color: #ffffff; border-color: #2563eb; }

.action-buttons { display: flex; justify-content: flex-end; gap: 0.5rem; }
.btn-icon { width: 34px; height: 34px; border-radius: 8px; border: 1px solid #e2e8f0; background: #ffffff; display: flex; align-items: center; justify-content: center; cursor: pointer; }
.btn-icon svg { width: 16px; height: 16px; }

.btn-primary { display: inline-flex; align-items: center; gap: 0.5rem; background: #2563eb; color: #ffffff; border: none; padding: 0 1.25rem; height: 42px; border-radius: 10px; font-weight: 600; cursor: pointer; }
.btn-secondary { background: #ffffff; color: #475569; border: 1px solid #cbd5e1; padding: 0 1.25rem; height: 42px; border-radius: 10px; font-weight: 600; cursor: pointer; }

.modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 50; padding: 1rem; }
.modal-card { background: #ffffff; padding: 2rem; border-radius: 16px; width: 100%; max-width: 480px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); }
.modal-header { display: flex; justify-content: space-between; margin-bottom: 1.5rem; }
.btn-close { background: none; border: none; font-size: 1.5rem; color: #94a3b8; cursor: pointer; }

/* Penutup Style yang Terpotong */
.form-container { display: flex; flex-direction: column; gap: 1rem; }
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
.form-group input:focus, .custom-select:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}
.modal-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1rem; }

.empty-state { text-align: center; padding: 2.5rem !important; color: #94a3b8; }
.page-ellipsis { padding: 0 0.35rem; color: #94a3b8; font-size: 0.85rem; }

@media (max-width: 768px) {
  .page-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
  .control-bar { flex-direction: column; align-items: stretch; }
  .search-box { max-width: 100%; }
  .filter-select { flex: 1; }
}
</style>