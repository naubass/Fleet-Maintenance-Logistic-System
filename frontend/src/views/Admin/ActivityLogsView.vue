<script setup>
import { ref, onMounted, watch } from 'vue'
import { useAuthStore } from '../../stores/authStore'

const authStore = useAuthStore()
const logs = ref([])
const loading = ref(true)

const searchQuery = ref('')
const selectedEntity = ref('')
const selectedAction = ref('')
let searchTimeout = null

const fetchLogs = async () => {
  try {
    loading.value = true
    const params = new URLSearchParams({
      limit: '50',
      search: searchQuery.value.trim(),
      entity: selectedEntity.value || 'all',
      action: selectedAction.value || 'all'
    })

    const res = await fetch(`http://localhost:5000/api/activity-logs?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        'Content-Type': 'application/json'
      }
    })
    const json = await res.json()
    if (json.success) {
      logs.value = json.data
    }
  } catch (err) {
    console.error('Gagal mengambil activity logs:', err)
  } finally {
    loading.value = false
  }
}

watch(searchQuery, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchLogs()
  }, 400)
})

watch([selectedEntity, selectedAction], () => {
  fetchLogs()
})

const resetFilter = () => {
  searchQuery.value = ''
  selectedEntity.value = ''
  selectedAction.value = ''
  fetchLogs()
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

onMounted(() => {
  fetchLogs()
})
</script>

<template>
  <div class="activity-logs-page">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Audit Trail &amp; Log Aktivitas</h1>
        <p class="page-subtitle">Monitoring seluruh riwayat aksi operasional yang dilakukan oleh admin, manager, dan mekanik.</p>
      </div>
      <button @click="fetchLogs" class="btn-refresh" :disabled="loading">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon-refresh" :class="{ 'spinning': loading }">
          <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
        </svg>
        <span>Refresh Log</span>
      </button>
    </div>

    <!-- Filter Bar -->
    <div class="filter-card">
      <div class="filter-grid">
        <div class="filter-group filter-search">
          <label>Cari Uraian Aktivitas</label>
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Cari kata kunci deskripsi aktivitas..." 
            class="input-control"
          />
        </div>

        <div class="filter-group">
          <label>Filter Entitas / Modul</label>
          <select v-model="selectedEntity" class="select-control">
            <option value="">Semua Modul</option>
            <option value="VEHICLE">Armada Kendaraan</option>
            <option value="MAINTENANCE">Catatan Servis</option>
            <option value="SCHEDULE">Jadwal Servis</option>
            <option value="SPAREPART">Suku Cadang</option>
            <option value="USER">Pengguna</option>
            <option value="BUDGET">Anggaran</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Tipe Aksi</label>
          <select v-model="selectedAction" class="select-control">
            <option value="">Semua Aksi</option>
            <option value="CREATE">CREATE (Tambah)</option>
            <option value="UPDATE">UPDATE (Ubah)</option>
            <option value="DELETE">DELETE (Hapus)</option>
            <option value="LOGIN">LOGIN (Masuk)</option>
          </select>
        </div>

        <div class="filter-actions">
          <button @click="resetFilter" class="btn-reset">Reset</button>
        </div>
      </div>
    </div>

    <!-- Tabel Activity Logs -->
    <div class="card-table">
      <div class="table-responsive">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Waktu &amp; Tanggal</th>
              <th>Pengguna (Pelaku)</th>
              <th>Aksi</th>
              <th>Modul</th>
              <th>Deskripsi Aktivitas</th>
              <th>IP Address</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="6" class="text-center py-4">Memuat data log aktivitas...</td>
            </tr>
            <tr v-else-if="logs.length === 0">
              <td colspan="6" class="text-center py-4 text-muted">Belum ada riwayat aktivitas yang tercatat.</td>
            </tr>
            <tr v-for="log in logs" :key="log.id">
              <td class="cell-time">{{ formatDate(log.created_at) }}</td>
              <td>
                <div class="cell-user">
                  <strong>{{ log.user?.full_name || 'Sistem / Anonim' }}</strong>
                  <span class="badge-role">{{ log.user?.role || 'System' }}</span>
                </div>
              </td>
              <td>
                <span :class="['badge-action', `action-${(log.action || '').toLowerCase()}`]">
                  {{ log.action }}
                </span>
              </td>
              <td>
                <span class="badge-entity">{{ log.entity }}</span>
              </td>
              <td class="cell-desc">{{ log.description }}</td>
              <td class="cell-ip">{{ log.ip_address || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.activity-logs-page { display: flex; flex-direction: column; gap: 1.5rem; }

.page-header { display: flex; justify-content: space-between; align-items: center; }
.page-title { font-size: 1.5rem; font-weight: 700; color: #0f172a; }
.page-subtitle { font-size: 0.875rem; color: #64748b; margin-top: 0.25rem; }

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
.filter-grid { display: flex; gap: 1rem; align-items: flex-end; }
.filter-group { display: flex; flex-direction: column; gap: 0.35rem; }
.filter-search { flex: 2; }
.filter-group label { font-size: 0.75rem; font-weight: 600; color: #475569; text-transform: uppercase; }

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
.custom-table { width: 100%; border-collapse: collapse; text-align: left; }
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
  padding: 0.9rem 1.25rem;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.875rem;
  color: #334155;
}

.cell-time { font-size: 0.8rem; color: #64748b; font-variant-numeric: tabular-nums; white-space: nowrap; }
.cell-user { display: flex; flex-direction: column; gap: 0.2rem; }
.cell-user strong { color: #0f172a; font-size: 0.875rem; }
.badge-role { font-size: 0.68rem; color: #64748b; text-transform: uppercase; font-weight: 600; }

.badge-action {
  display: inline-flex;
  padding: 0.2rem 0.55rem;
  border-radius: 6px;
  font-size: 0.72rem;
  font-weight: 700;
}
.action-create { background: #dcfce7; color: #15803d; }
.action-update { background: #fef3c7; color: #b45309; }
.action-delete { background: #fee2e2; color: #b91c1c; }
.action-login { background: #e0f2fe; color: #0369a1; }

.badge-entity {
  background: #f1f5f9;
  color: #334155;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  font-size: 0.72rem;
  font-weight: 600;
}

.cell-desc { font-weight: 500; color: #0f172a; }
.cell-ip { font-size: 0.75rem; color: #94a3b8; font-family: monospace; }

.text-center { text-align: center; }
.text-muted { color: #94a3b8; }
.py-4 { padding-top: 1.5rem; padding-bottom: 1.5rem; }
</style>