<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { sparepartService } from '../../services/sparepartService'

const spareparts = ref([])
const isModalOpen = ref(false)
const isEdit = ref(false)
const selectedId = ref(null)

const searchQuery = ref('')
const filterCategory = ref('all')
const currentPage = ref(1)
const itemsPerPage = ref(10)
const totalData = ref(0)
const totalPages = ref(1)

const categories = ['Oli & Cairan', 'Sistem Rem', 'Filter', 'Mesin', 'Kelistrikan', 'Ban & Aksesoris']

const form = ref({
  part_number: '',
  name: '',
  category: 'Oli & Cairan',
  stock: 0,
  min_stock: 5,
  unit: 'Pcs',
  unit_price: 0,
  supplier: ''
})

const generatePartNumber = async () => {
  try {
    const res = await fetch(`http://localhost:5000/api/spareparts/generate-code?category=${encodeURIComponent(form.value.category)}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const data = await res.json();
    if (data.success) {
      form.value.part_number = data.code;
    }
  } catch (err) {
    console.error('Gagal generate kode:', err);
  }
};

const loadSpareparts = async () => {
  try {
    const result = await sparepartService.getAll({
      page: currentPage.value,
      limit: itemsPerPage.value,
      search: searchQuery.value,
      category: filterCategory.value
    })

    if (result && result.success) {
      spareparts.value = result.data || []
      totalData.value = Number(result.totalData) || 0
      totalPages.value = Number(result.totalPages) || 1
      currentPage.value = Number(result.currentPage) || 1
    } else {
      spareparts.value = []
      totalData.value = 0
      totalPages.value = 1
    }
  } catch (err) {
    console.error('Error loading spareparts:', err)
    spareparts.value = []
  }
}

let searchTimeout = null
watch([searchQuery, filterCategory], () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    loadSpareparts()
  }, 300)
})

const openModal = (item = null) => {
  if (item) {
    isEdit.value = true
    selectedId.value = item.id
    form.value = {
      part_number: item.part_number || '',
      name: item.name || '',
      category: item.category || 'Oli & Cairan',
      stock: item.stock || 0,
      min_stock: item.min_stock || 5,
      unit: item.unit || 'Pcs',
      unit_price: item.unit_price || 0,
      supplier: item.supplier || ''
    }
  } else {
    isEdit.value = false
    selectedId.value = null
    form.value = {
      part_number: '',
      name: '',
      category: 'Oli & Cairan',
      stock: 0,
      min_stock: 5,
      unit: 'Pcs',
      unit_price: 0,
      supplier: ''
    }
  }
  isModalOpen.value = true
}

const handleSave = async () => {
  try {
    if (!form.value.part_number || !form.value.name) {
      return alert('Kode sparepart dan nama suku cadang wajib diisi.')
    }

    const res = isEdit.value
      ? await sparepartService.update(selectedId.value, form.value)
      : await sparepartService.create(form.value)

    if (res && res.success) {
      isModalOpen.value = false
      await loadSpareparts()
    } else {
      alert(`Gagal menyimpan: ${res?.message || 'Terjadi kesalahan'}`)
    }
  } catch (err) {
    console.error('Error saving sparepart:', err)
    alert('Terjadi kesalahan saat menyimpan data.')
  }
}

const handleDelete = async (id) => {
  if (!confirm('Hapus data sparepart ini?')) return
  const res = await sparepartService.delete(id)
  if (res && res.success) loadSpareparts()
}

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    loadSpareparts()
  }
}

const formatRupiah = (val) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0)
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
  loadSpareparts()
})
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h1 class="page-title">Suku Cadang (Spareparts)</h1>
        <p class="page-subtitle">Kelola stok barang, harga komponen, dan inventaris bengkel armada.</p>
      </div>
      <button @click="openModal()" class="btn-primary">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
        Tambah Sparepart
      </button>
    </div>

    <div class="control-bar">
      <div class="search-box">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        <input v-model="searchQuery" type="text" placeholder="Cari nama, kode sparepart, atau supplier..." />
      </div>

      <div class="filter-group">
        <select v-model="filterCategory" class="filter-select">
          <option value="all">Semua Kategori</option>
          <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
      </div>
    </div>

    <div class="card-table">
      <div class="table-responsive">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Kode Barang</th>
              <th>Nama Sparepart</th>
              <th>Kategori</th>
              <th>Stok Tersedia</th>
              <th>Harga Satuan</th>
              <th>Supplier</th>
              <th style="text-align: right;">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in spareparts" :key="item.id">
              <td class="id-text">{{ item.part_number }}</td>
              <td class="font-bold-title">{{ item.name }}</td>
              <td><span class="category-badge">{{ item.category }}</span></td>
              <td>
                <!-- Di dalam <td> kolom Stok Tersedia -->
                <div class="stock-container">
                  <span class="stock-amount">{{ item.stock }} {{ item.unit }}</span>
                  
                  <span v-if="item.stock === 0" class="badge-out-of-stock">
                    🚫 Stok Habis
                  </span>
                  <span v-else-if="item.stock <= item.min_stock" class="badge-low-stock">
                    ⚠️ Stok Menipis
                  </span>
                </div>
                </td>
              <td class="price-text">{{ formatRupiah(item.unit_price) }}</td>
              <td>{{ item.supplier || '-' }}</td>
              <td style="text-align: right;">
                <div class="action-buttons">
                  <button @click="openModal(item)" class="btn-icon edit" title="Edit Sparepart">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                  </button>
                  <button @click="handleDelete(item.id)" class="btn-icon delete" title="Hapus">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="spareparts.length === 0">
              <td colspan="7" class="empty-state">
                <p>Tidak ada data sparepart ditemukan.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="spareparts.length > 0" class="pagination-footer">
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
          <h3>{{ isEdit ? 'Edit Sparepart' : 'Tambah Sparepart Baru' }}</h3>
          <button @click="isModalOpen = false" class="btn-close">&times;</button>
        </div>

        <form @submit.prevent="handleSave" class="form-container">
          <div class="form-row">
            <div class="form-group flex-1">
                <label>Kode Sparepart / Part Number</label>
                <div class="input-with-button">
                <input 
                    v-model="form.part_number" 
                    type="text" 
                    required 
                    placeholder="Contoh: FLT-OIL-001" 
                />
                <button 
                    type="button" 
                    @click="generatePartNumber" 
                    class="btn-generate"
                    title="Auto Generate Kode Unik"
                >
                    ⚡ Auto
                </button>
                </div>
            </div>

            <div class="form-group flex-1">
                <label>Kategori</label>
                <select v-model="form.category" class="custom-select" required>
                <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
                </select>
            </div>
            </div>

          <div class="form-group">
            <label>Nama Suku Cadang</label>
            <input v-model="form.name" type="text" required placeholder="Contoh: Filter Oli Hino Dutro 130" />
          </div>

          <div class="form-row">
            <div class="form-group flex-1">
                <label>Jumlah Stok</label>
                <input v-model.number="form.stock" type="number" min="0" required placeholder="0" />
            </div>
            <div class="form-group flex-1">
                <label>Batas Min. Stok</label>
                <input v-model.number="form.min_stock" type="number" min="1" required placeholder="5" />
            </div>
            <div class="form-group flex-1">
                <label>Satuan</label>
                <select v-model="form.unit" class="custom-select" required>
                <option value="Pcs">Pcs</option>
                <option value="Liter">Liter</option>
                <option value="Set">Set</option>
                <option value="Unit">Unit</option>
                <option value="Botol">Botol</option>
                <option value="Roll">Roll</option>
                <option value="Box">Box</option>
                </select>
            </div>
            </div>

          <div class="form-row">
            <div class="form-group flex-1">
              <label>Harga Satuan (Rp)</label>
              <input v-model.number="form.unit_price" type="number" min="0" required placeholder="125000" />
            </div>
            <div class="form-group flex-1">
              <label>Supplier / Vendor</label>
              <input v-model="form.supplier" type="text" placeholder="Contoh: PT Auto Parts Nusantara" />
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" @click="isModalOpen = false" class="btn-secondary">Batal</button>
            <button type="submit" class="btn-primary">{{ isEdit ? 'Simpan Perubahan' : 'Tambah Sparepart' }}</button>
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
.search-box { display: flex; align-items: center; gap: 0.625rem; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 10px; padding: 0 0.875rem; flex: 1; max-width: 420px; height: 42px; }
.search-box svg { width: 18px; height: 18px; color: #94a3b8; }
.search-box input { border: none; outline: none; width: 100%; font-size: 0.875rem; background: transparent; }
.filter-select { height: 42px; padding: 0 0.875rem; border: 1px solid #cbd5e1; border-radius: 10px; font-size: 0.875rem; background: #ffffff; cursor: pointer; }

.card-table { background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; }
.table-responsive { width: 100%; overflow-x: auto; }
.custom-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem; }
.custom-table th { background: #f8fafc; padding: 0.875rem 1.25rem; font-weight: 600; color: #475569; border-bottom: 1px solid #e2e8f0; }
.custom-table td { padding: 0.875rem 1.25rem; border-bottom: 1px solid #f1f5f9; color: #334155; }

.font-bold-title { font-weight: 600; color: #0f172a; }
.id-text { font-family: monospace; font-size: 0.8rem; font-weight: 600; color: #2563eb; }
.price-text { font-weight: 600; color: #166534; }
/* Badge Kategori satu baris utuh & rapi */
.category-badge { 
  display: inline-block;
  background: #f1f5f9; 
  color: #475569; 
  padding: 0.35rem 0.75rem; 
  border-radius: 6px; 
  font-size: 0.775rem; 
  font-weight: 600; 
  white-space: nowrap; /* Mencegah teks tertekuk ke bawah */
  line-height: 1.2;
}

/* Container stok menggunakan flex-direction row dengan wrap/gap yang aman */
.stock-container { 
  display: flex; 
  align-items: center; 
  gap: 0.625rem; 
  flex-wrap: nowrap;
}

.stock-amount { 
  font-weight: 600; 
  color: #0f172a;
  white-space: nowrap;
}

/* Badge Stok Menipis satu baris utuh & rapi */
.badge-low-stock { 
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background: #fef2f2; 
  color: #dc2626; 
  border: 1px solid #fecaca; 
  padding: 0.25rem 0.625rem; 
  border-radius: 6px; 
  font-size: 0.725rem; 
  font-weight: 700; 
  white-space: nowrap; /* Mencegah teks tertekuk ke bawah */
  line-height: 1;
}

.badge-out-of-stock {
  display: inline-flex;
  align-items: center;
  background: #450a0a;
  color: #fca5a5;
  border: 1px solid #991b1b;
  padding: 0.25rem 0.625rem;
  border-radius: 6px;
  font-size: 0.725rem;
  font-weight: 700;
  white-space: nowrap;
}

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
.modal-card { 
  background: #ffffff; 
  padding: 2rem; 
  border-radius: 16px; 
  width: 100%; 
  max-width: 640px; /* Diperlebar dari 580px ke 640px */
  box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); 
}
.modal-header { display: flex; justify-content: space-between; margin-bottom: 1.5rem; }
.btn-close { background: none; border: none; font-size: 1.5rem; color: #94a3b8; cursor: pointer; }

.form-container { display: flex; flex-direction: column; gap: 1rem; }
.form-row { 
  display: flex; 
  gap: 0.875rem; 
  width: 100%;
}
.flex-1 { 
  flex: 1; 
  min-width: 0; /* Mencegah overflow flex item */
}
.form-group { display: flex; flex-direction: column; gap: 0.375rem; }
.form-group label { font-size: 0.8rem; font-weight: 600; color: #475569; }
.form-group input, .custom-select { 
  height: 40px; 
  width: 100%; /* Pastikan elemen mengambil 100% lebar pembungkusnya */
  padding: 0 0.75rem; 
  border: 1px solid #cbd5e1; 
  border-radius: 8px; 
  font-size: 0.875rem; 
  color: #0f172a; 
  outline: none; 
  background-color: #ffffff;
  box-sizing: border-box;
}
.form-group input:focus, .custom-select:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }
.modal-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1rem; }

.empty-state { text-align: center; padding: 2.5rem !important; color: #94a3b8; }
.page-ellipsis { padding: 0 0.35rem; color: #94a3b8; font-size: 0.85rem; }

@media (max-width: 768px) {
  .page-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
  .control-bar { flex-direction: column; align-items: stretch; }
  .search-box { max-width: 100%; }
  .filter-select { flex: 1; }
  .form-row { flex-direction: column; }
}

/* Layout input gabungan dengan tombol generate */
.input-with-button {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.input-with-button input {
  flex: 1;
}

.btn-generate {
  height: 40px;
  padding: 0 0.875rem;
  background: #f1f5f9;
  color: #2563eb;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.btn-generate:hover {
  background: #e2e8f0;
  color: #1d4ed8;
  border-color: #94a3b8;
}
</style>