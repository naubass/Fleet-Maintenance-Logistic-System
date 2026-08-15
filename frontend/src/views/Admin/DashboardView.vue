<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useAuthStore } from '../../stores/authStore'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const authStore = useAuthStore()
const loading = ref(true)
const stats = ref({
  summary: {
    totalVehicles: 0,
    readyVehicles: 0,
    maintenanceVehicles: 0,
    criticalPartsCount: 0,
    pendingSchedules: 0,
    totalCost: 0
  },
  fleetDistribution: {
    ready: 0,
    inMaintenance: 0,
    other: 0
  },
  recentRecords: []
})

const fleetChartCanvas = ref(null)
let fleetChartInstance = null

const formatRupiah = (val) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0)
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const fetchDashboardStats = async () => {
  loading.value = true;
  try {
    const res = await fetch("http://localhost:5000/api/dashboard", {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        "Content-Type": "application/json",
      },
    });
    const json = await res.json();
    if (json.success) {
      stats.value = json.data;
      await nextTick();
      renderChart();
    }
  } catch (err) {
    console.error("Gagal mengambil data dashboard:", err);
  } finally {
    loading.value = false;
  }
};

const renderChart = () => {
  if (!fleetChartCanvas.value) return
  if (fleetChartInstance) {
    fleetChartInstance.destroy()
  }

  const { ready, inMaintenance, other } = stats.value.fleetDistribution

  fleetChartInstance = new Chart(fleetChartCanvas.value, {
    type: 'doughnut',
    data: {
      labels: ['Siap Beroperasi', 'Dalam Perawatan', 'Lainnya / Nonaktif'],
      datasets: [
        {
          data: [ready, inMaintenance, other],
          backgroundColor: ['#16a34a', '#84cc16', '#facc15'],
          borderWidth: 0,
          hoverOffset: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            boxWidth: 12,
            padding: 16,
            font: { family: 'Inter', size: 12 }
          }
        }
      },
      cutout: '70%'
    }
  })
}

onMounted(() => {
  fetchDashboardStats()
})
</script>

<template>
  <div class="dashboard-page">
    <!-- Welcome Header -->
    <div class="welcome-card">
      <div class="welcome-text">
        <h2>Selamat Datang Kembali, {{ authStore.userName || authStore.user?.full_name || 'Naufal Admin' }}! 👋</h2>
        <p>Kelola perbaikan armada dan pantau performa operasional dengan efisien.</p>
        <div class="welcome-actions">
          <router-link to="/admin/vehicles" class="btn-primary">Lihat Armada</router-link>
          <!-- Sesuaikan path jadwal -->
          <router-link to="/admin/schedules" class="btn-secondary">Jadwal Servis</router-link>
        </div>
      </div>
      <div class="welcome-decor" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/>
          <path d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1h2m4 0h1a1 1 0 001-1v-4a1 1 0 00-.293-.707l-3-3A1 1 0 0016.586 7H13"/>
        </svg>
      </div>
    </div>

    <!-- Stat Cards Grid -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon bg-green">🚗</div>
        <div class="stat-details">
          <span class="stat-label">Total Armada</span>
          <h3 class="stat-value">{{ stats.summary.totalVehicles }} <span class="unit">Unit</span></h3>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon bg-emerald">✅</div>
        <div class="stat-details">
          <span class="stat-label">Armada Siap Pakai</span>
          <h3 class="stat-value text-emerald">{{ stats.summary.readyVehicles }} <span class="unit">Unit</span></h3>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon bg-amber">🛠️</div>
        <div class="stat-details">
          <span class="stat-label">Jadwal Servis Mendatang</span>
          <h3 class="stat-value text-amber">{{ stats.summary.pendingSchedules }} <span class="unit">Antrean</span></h3>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon bg-rose">⚠️</div>
        <div class="stat-details">
          <span class="stat-label">Stok Sparepart Kritis</span>
          <h3 class="stat-value text-rose">{{ stats.summary.criticalPartsCount }} <span class="unit">Item</span></h3>
        </div>
      </div>
    </div>

    <!-- Analytics & Activity Section -->
    <div class="dashboard-split">
      <!-- Chart Card -->
      <div class="card chart-card">
        <div class="card-header">
          <h3>Status Kondisi Armada</h3>
          <span class="badge">Realtime</span>
        </div>
        <div class="chart-container">
          <canvas ref="fleetChartCanvas"></canvas>
          
          <!-- Teks & Angka di Tengah Donut -->
          <div class="chart-center-label">
            <span class="center-number">{{ stats.summary.totalVehicles }}</span>
            <span class="center-text">Total Unit</span>
          </div>
        </div>
      </div>

      <!-- Recent Maintenance Activity Card -->
      <div class="card activity-card">
        <div class="card-header">
          <h3>Perawatan Terbaru</h3>
          <!-- Path rute yang sudah sesuai dengan router/index.js -->
          <router-link to="/admin/maintenance-records" class="link-more">Lihat Semua →</router-link>
        </div>

        <div class="table-responsive">
          <table class="recent-table">
            <thead>
              <tr>
                <th>Kendaraan</th>
                <th>Tanggal</th>
                <th>Biaya</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="stats.recentRecords.length === 0">
                <td colspan="3" class="text-center py-4 text-muted">Belum ada data perawatan.</td>
              </tr>
              <tr v-for="item in stats.recentRecords" :key="item.id">
                <td>
                  <strong>{{ item.vehicles?.model_name || '-' }}</strong>
                  <div class="plate-sub">{{ item.vehicles?.plate_number || '-' }}</div>
                </td>
                <td>{{ formatDate(item.started_at || item.created_at) }}</td>
                <td class="font-semibold text-slate-800">{{ formatRupiah(item.total_cost || item.cost) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.welcome-card {
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #0e3a2c 0%, #15803d 100%);
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(14, 58, 44, 0.18);
}

.welcome-text h2 {
  font-size: 1.65rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 0.5rem;
  letter-spacing: -0.02em;
}

.welcome-text p {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.95rem;
  margin-bottom: 1.5rem;
  max-width: 480px;
}

.welcome-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  padding: 0.625rem 1.25rem;
  background-color: #22c55e;
  color: #0a2e22;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.875rem;
  text-decoration: none;
  transition: background-color 0.2s;
}

.btn-primary:hover {
  background-color: #4ade80;
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  padding: 0.625rem 1.25rem;
  background-color: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.875rem;
  border: 1px solid rgba(255, 255, 255, 0.25);
  text-decoration: none;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background-color: rgba(255, 255, 255, 0.18);
}

.welcome-decor {
  position: absolute;
  right: -1rem;
  bottom: -1.5rem;
  color: rgba(255, 255, 255, 0.08);
}
.welcome-decor svg { width: 180px; height: 180px; }

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 1.25rem;
}

.stat-card {
  background: #ffffff;
  padding: 1.25rem;
  border-radius: 14px;
  border: 1px solid #e6f4ea;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 1px 3px rgba(15, 61, 46, 0.04);
  transition: box-shadow 0.2s, transform 0.2s;
}
.stat-card:hover {
  box-shadow: 0 6px 16px rgba(15, 61, 46, 0.08);
  transform: translateY(-2px);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.35rem;
}

.bg-green { background-color: #dcfce7; }
.bg-emerald { background-color: #d1fae5; }
.bg-amber { background-color: #fef3c7; }
.bg-rose { background-color: #ffe4e6; }

.stat-details {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.stat-value {
  font-size: 1.45rem;
  font-weight: 700;
  color: #0f172a;
  margin-top: 0.15rem;
}

.stat-value .unit {
  font-size: 0.85rem;
  font-weight: 500;
  color: #94a3b8;
}

.text-emerald { color: #059669; }
.text-amber { color: #d97706; }
.text-rose { color: #e11d48; }

/* Dashboard Split Grid */
.dashboard-split {
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: 1.5rem;
}

@media (max-width: 1024px) {
  .dashboard-split {
    grid-template-columns: 1fr;
  }
}

.card {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e6f4ea;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(15, 61, 46, 0.04);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.card-header h3 {
  font-size: 1.05rem;
  font-weight: 700;
  color: #0f172a;
}

.badge {
  font-size: 0.72rem;
  padding: 0.2rem 0.5rem;
  background-color: #dcfce7;
  color: #15803d;
  border-radius: 6px;
  font-weight: 600;
}

.chart-container {
  height: 250px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.link-more {
  font-size: 0.82rem;
  color: #15803d;
  text-decoration: none;
  font-weight: 600;
}

.recent-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.recent-table th {
  text-align: left;
  padding: 0.6rem 0.75rem;
  color: #64748b;
  font-size: 0.75rem;
  text-transform: uppercase;
  border-bottom: 1px solid #f1f5f9;
}

.recent-table td {
  padding: 0.75rem;
  border-bottom: 1px solid #f8fafc;
  color: #334155;
}

.plate-sub {
  font-size: 0.75rem;
  color: #94a3b8;
}

.text-center { text-align: center; }
.text-muted { color: #94a3b8; }

.chart-center-label {
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none; /* Supaya tooltip hover chart tetap berfungsi */
  display: flex;
  flex-direction: column;
  align-items: center;
}

.center-number {
  font-size: 1.75rem;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.1;
}

.center-text {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-top: 2px;
}
</style>