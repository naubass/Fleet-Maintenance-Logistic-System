<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useAuthStore } from '../../stores/authStore'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const authStore = useAuthStore()
const loading = ref(true)

const stats = ref({
  summary: {
    totalFleet: 0,
    readyFleet: 0,
    fleetAvailabilityRate: 0,
    totalMaintenanceExpense: 0,
    totalLaborExpense: 0,
    totalPartsExpense: 0
  },
  costBreakdown: [],
  topCostVehicles: []
})

const costChartCanvas = ref(null)
let costChartInstance = null

const formatCurrency = (val) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(val || 0)
}

const fetchManagerDashboard = async () => {
  loading.value = true
  try {
    const res = await fetch("http://localhost:5000/api/manager/dashboard", {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        "Content-Type": "application/json"
      }
    })
    const json = await res.json()
    if (json.success) {
      stats.value = json.data
      await nextTick()
      renderCostChart()
    }
  } catch (err) {
    console.error("Gagal memuat analitik manager:", err)
  } finally {
    loading.value = false
  }
}

const renderCostChart = () => {
  if (!costChartCanvas.value) return
  if (costChartInstance) {
    costChartInstance.destroy()
  }

  const laborExpense = stats.value.summary?.totalLaborExpense || 0
  const partsExpense = stats.value.summary?.totalPartsExpense || 0

  costChartInstance = new Chart(costChartCanvas.value, {
    type: 'doughnut',
    data: {
      labels: ['Biaya Jasa & Mekanik', 'Biaya Suku Cadang'],
      datasets: [
        {
          data: [laborExpense, partsExpense],
          backgroundColor: ['#22c55e', '#0e3a2c'],
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
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const value = context.raw || 0
              return ` ${context.label}: ${formatCurrency(value)}`
            }
          }
        }
      },
      cutout: '70%'
    }
  })
}

onMounted(() => {
  fetchManagerDashboard()
})
</script>

<template>
  <div class="dashboard-page">
    <!-- Welcome Header / Executive Banner -->
    <div class="welcome-card">
      <div class="welcome-text">
        <h2>Executive Dashboard, {{ authStore.userName || authStore.user?.full_name || 'Manager' }}! 📊</h2>
        <p>Tinjauan strategis biaya perawatan, efisiensi anggaran suku cadang, dan kesiapan operasional armada.</p>
        <div class="welcome-actions">
          <router-link to="/manager/maintenance-records" class="btn-primary">Audit Rekap Servis</router-link>
          <router-link to="/manager/vehicles" class="btn-secondary">Kesiapan Armada</router-link>
        </div>
      </div>
      <div class="welcome-decor" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      </div>
    </div>

    <!-- 4 Stat Cards Grid -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon bg-emerald">💰</div>
        <div class="stat-details">
          <span class="stat-label">Total Biaya Servis</span>
          <h3 class="stat-value">{{ formatCurrency(stats.summary.totalMaintenanceExpense) }}</h3>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon bg-green">🛡️</div>
        <div class="stat-details">
          <span class="stat-label">Fleet Availability</span>
          <h3 class="stat-value text-emerald">
            {{ stats.summary.fleetAvailabilityRate }}% 
            <span class="unit">({{ stats.summary.readyFleet }}/{{ stats.summary.totalFleet }} Unit)</span>
          </h3>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon bg-amber">🔧</div>
        <div class="stat-details">
          <span class="stat-label">Total Biaya Jasa</span>
          <h3 class="stat-value text-amber">{{ formatCurrency(stats.summary.totalLaborExpense) }}</h3>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon bg-rose">📦</div>
        <div class="stat-details">
          <span class="stat-label">Total Suku Cadang</span>
          <h3 class="stat-value text-rose">{{ formatCurrency(stats.summary.totalPartsExpense) }}</h3>
        </div>
      </div>
    </div>

    <!-- Analytics & Breakdown Section -->
    <div class="dashboard-split">
      <!-- Chart Proporsi Biaya -->
      <div class="card chart-card">
        <div class="card-header">
          <h3>Proporsi Alokasi Biaya</h3>
          <span class="badge">Audited</span>
        </div>
        <div class="chart-container">
          <canvas ref="costChartCanvas"></canvas>
          
          <div class="chart-center-label">
            <span class="center-number">{{ formatCurrency(stats.summary.totalMaintenanceExpense) }}</span>
            <span class="center-text">Total Anggaran</span>
          </div>
        </div>
      </div>

      <!-- Top 5 Unit Maintenance Expense -->
      <div class="card activity-card">
        <div class="card-header">
          <h3>Top 5 Armada Tertinggi Biaya Servis</h3>
          <router-link to="/manager/vehicles" class="link-more">Semua Unit →</router-link>
        </div>

        <div class="table-responsive">
          <table class="recent-table">
            <thead>
              <tr>
                <th>Peringkat & Unit</th>
                <th>Proporsi Biaya</th>
                <th>Total Pengeluaran</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="stats.topCostVehicles.length === 0">
                <td colspan="3" class="text-center py-4 text-muted">Belum ada data pengeluaran armada.</td>
              </tr>
              <tr v-for="(v, index) in stats.topCostVehicles" :key="index">
                <td>
                  <strong>#{{ index + 1 }} {{ v.name }}</strong>
                </td>
                <td style="width: 35%;">
                  <div class="progress-bar-bg">
                    <div 
                      class="progress-bar-fill" 
                      :style="{ width: `${Math.min(100, Math.round((v.cost / (stats.summary.totalMaintenanceExpense || 1)) * 100))}%` }"
                    ></div>
                  </div>
                </td>
                <td class="font-semibold text-slate-800">{{ formatCurrency(v.cost) }}</td>
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
  max-width: 520px;
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
  right: 0.5rem;
  bottom: -1rem;
  color: rgba(255, 255, 255, 0.08);
}
.welcome-decor svg { width: 170px; height: 170px; }

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
  font-size: 0.78rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.stat-value {
  font-size: 1.3rem;
  font-weight: 700;
  color: #0f172a;
  margin-top: 0.15rem;
}

.stat-value .unit {
  font-size: 0.8rem;
  font-weight: 500;
  color: #94a3b8;
}

.text-emerald { color: #059669; }
.text-amber { color: #d97706; }
.text-rose { color: #e11d48; }

/* Split Grid */
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

.progress-bar-bg {
  width: 100%;
  height: 7px;
  background: #f1f5f9;
  border-radius: 99px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: #22c55e;
  border-radius: 99px;
}

.text-center { text-align: center; }
.text-muted { color: #94a3b8; }

.chart-center-label {
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.center-number {
  font-size: 1.15rem;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.1;
}

.center-text {
  font-size: 0.7rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-top: 2px;
}
</style>    