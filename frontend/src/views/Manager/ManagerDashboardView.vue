<script setup>
import { ref, onMounted, nextTick, computed } from 'vue'
import { useAuthStore } from '../../stores/authStore'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const authStore = useAuthStore()
const loading = ref(true)
const isExporting = ref(false)

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

// State Threshold Anggaran
const annualBudgetLimit = ref(0)
const budgetInput = ref(0)
const isEditingBudget = ref(false)
const isSavingBudget = ref(false)

const costChartCanvas = ref(null)
let costChartInstance = null

const formatCurrency = (val) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(val || 0)
}

// Perhitungan Persentase Penggunaan Pagu Anggaran
const budgetUsagePercent = computed(() => {
  if (!annualBudgetLimit.value || annualBudgetLimit.value <= 0) return 0
  const pct = (stats.value.summary.totalMaintenanceExpense / annualBudgetLimit.value) * 100
  return Math.round(pct)
})

// Ambil Ambang Batas Anggaran
const fetchBudgetThreshold = async () => {
  try {
    const res = await fetch(`/api/manager/budget-threshold?year=${new Date().getFullYear()}`, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    const json = await res.json()
    if (json.success) {
      annualBudgetLimit.value = Number(json.data.annual_budget_limit || 0)
      budgetInput.value = annualBudgetLimit.value
    }
  } catch (err) {
    console.error('Gagal mengambil budget threshold:', err)
  }
}

// Simpan Ambang Batas Anggaran
const saveBudgetThreshold = async () => {
  try {
    isSavingBudget.value = true
    const res = await fetch('/api/manager/budget-threshold', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        year: new Date().getFullYear(),
        annual_budget_limit: budgetInput.value
      })
    })
    const json = await res.json()
    if (json.success) {
      annualBudgetLimit.value = Number(budgetInput.value)
      isEditingBudget.value = false
    }
  } catch (err) {
    console.error('Gagal menyimpan threshold:', err)
  } finally {
    isSavingBudget.value = false
  }
}

// Ekspor Laporan Excel (.xlsx)
const handleExportReport = async () => {
  try {
    isExporting.value = true
    const res = await fetch('/api/manager/export/maintenance', {
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    
    if (!res.ok) throw new Error('Gagal mengunduh file laporan Excel')

    const blob = await res.blob()
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = `Laporan_Perawatan_Armada_${new Date().getFullYear()}.xlsx`
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(downloadUrl)
  } catch (err) {
    console.error('Export error:', err)
    alert('Gagal mengekspor laporan Excel.')
  } finally {
    isExporting.value = false
  }
}

const fetchManagerDashboard = async () => {
  loading.value = true
  try {
    const res = await fetch('/api/manager/dashboard', {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        'Content-Type': 'application/json'
      }
    })
    const json = await res.json()
    if (json.success) {
      stats.value = json.data
      await nextTick()
      renderCostChart()
    }
  } catch (err) {
    console.error('Gagal memuat analitik manager:', err)
  } finally {
    loading.value = false
  }
}

const renderCostChart = () => {
  if (!costChartCanvas.value) return
  if (costChartInstance) costChartInstance.destroy()

  costChartInstance = new Chart(costChartCanvas.value, {
    type: 'doughnut',
    data: {
      labels: ['Biaya Jasa & Mekanik', 'Biaya Suku Cadang'],
      datasets: [
        {
          data: [stats.value.summary.totalLaborExpense, stats.value.summary.totalPartsExpense],
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
        legend: { position: 'bottom', labels: { boxWidth: 12, padding: 16 } },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${ctx.label}: ${formatCurrency(ctx.raw)}`
          }
        }
      },
      cutout: '70%'
    }
  })
}

onMounted(() => {
  fetchManagerDashboard()
  fetchBudgetThreshold()
})
</script>

<template>
  <div class="dashboard-page">
    <!-- Welcome Header -->
    <div class="welcome-card">
      <div class="welcome-text">
        <h2>Executive Dashboard, {{ authStore.userName || authStore.user?.full_name || 'Manager' }}! 📊</h2>
        <p>Tinjauan strategis alokasi biaya, kontrol pagu anggaran servis, dan efisiensi kesiapan armada.</p>
        <div class="welcome-actions">
          <button @click="handleExportReport" class="btn-primary" :disabled="isExporting">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="btn-icon">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
            </svg>
            <span>{{ isExporting ? 'Memproses Ekspor...' : 'Ekspor Laporan (Excel)' }}</span>
          </button>
          <router-link to="/manager/maintenance-records" class="btn-secondary">Audit Rekap Servis</router-link>
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

    <!-- Ambang Batas Anggaran (Threshold Card) -->
    <div class="card threshold-card">
      <div class="threshold-header">
        <div>
          <h3 class="card-heading">Pagu Anggaran Servis (Tahun {{ new Date().getFullYear() }})</h3>
        </div>
        <button v-if="!isEditingBudget" @click="isEditingBudget = true" class="btn-edit-threshold">
          ⚙️ Atur Limit Pagu
        </button>
      </div>

      <div v-if="isEditingBudget" class="threshold-edit-box">
        <div class="input-group">
          <span class="input-prefix">Rp</span>
          <input 
            type="number" 
            v-model="budgetInput" 
            placeholder="Masukkan nominal batas tahunan..." 
            class="input-budget"
          />
        </div>
        <button @click="saveBudgetThreshold" class="btn-save" :disabled="isSavingBudget">
          {{ isSavingBudget ? 'Menyimpan...' : 'Simpan Limit' }}
        </button>
        <button @click="isEditingBudget = false" class="btn-cancel">Batal</button>
      </div>

      <div v-else class="threshold-display">
        <div class="threshold-metrics">
          <div>
            <span class="sub-label">Pengeluaran Berjalan</span>
            <strong class="metric-val text-success">{{ formatCurrency(stats.summary.totalMaintenanceExpense) }}</strong>
          </div>
          <div class="text-right">
            <span class="sub-label">Target Limit Pagu</span>
            <strong class="metric-val text-slate">{{ formatCurrency(annualBudgetLimit) }}</strong>
          </div>
        </div>

        <div class="progress-bar-bg">
          <div 
            class="progress-bar-fill" 
            :class="{
              'fill-safe': budgetUsagePercent < 80,
              'fill-warning': budgetUsagePercent >= 80 && budgetUsagePercent < 100,
              'fill-danger': budgetUsagePercent >= 100
            }"
            :style="{ width: `${Math.min(100, budgetUsagePercent)}%` }"
          ></div>
        </div>

        <div class="threshold-footer">
          <span>Penggunaan Anggaran: <strong>{{ budgetUsagePercent }}%</strong></span>
          <span v-if="annualBudgetLimit === 0" class="badge-neutral">Limit belum diatur</span>
          <span v-else-if="budgetUsagePercent >= 100" class="badge-danger">🚨 Anggaran Melebihi Batas Pagu!</span>
          <span v-else-if="budgetUsagePercent >= 80" class="badge-warning">⚠️ Mendekati Batas Maksimal ({{ budgetUsagePercent }}%)</span>
          <span v-else class="badge-safe">✓ Dalam Batas Aman</span>
        </div>
      </div>
    </div>

    <!-- 4 Metrik Kartu -->
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

    <!-- Split Visualisasi & Top Cost Fleet -->
    <div class="dashboard-split">
      <div class="card chart-card">
        <div class="card-header">
          <h3>Proporsi Alokasi Biaya</h3>
          <span class="badge">Audited</span>
        </div>
        <div class="chart-container">
          <canvas ref="costChartCanvas"></canvas>
          
          <!-- Teks di Tengah Donut Chart -->
          <div class="chart-center-text">
            <span class="center-val">{{ formatCurrency(stats.summary.totalMaintenanceExpense) }}</span>
            <span class="center-label">TOTAL ANGGARAN</span>
          </div>
        </div>
      </div>

      <div class="card activity-card">
        <div class="card-header">
          <h3>Top 5 Armada Pengeluaran Tertinggi</h3>
          <router-link to="/manager/vehicles" class="link-more">Semua Unit →</router-link>
        </div>

        <div class="table-responsive">
          <table class="recent-table">
            <thead>
              <tr>
                <th>Peringkat &amp; Unit</th>
                <th>Total Pengeluaran</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="stats.topCostVehicles.length === 0">
                <td colspan="2" class="text-center py-4 text-muted">Belum ada data pengeluaran armada.</td>
              </tr>
              <tr v-for="(v, index) in stats.topCostVehicles" :key="index">
                <td><strong>#{{ index + 1 }} {{ v.name }}</strong></td>
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
.dashboard-page { display: flex; flex-direction: column; gap: 1.5rem; }

/* Welcome Card */
.welcome-card {
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #0e3a2c 0%, #15803d 100%);
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(14, 58, 44, 0.18);
}
.welcome-text h2 { font-size: 1.65rem; font-weight: 700; color: #ffffff; margin-bottom: 0.5rem; }
.welcome-text p { color: rgba(255, 255, 255, 0.8); font-size: 0.95rem; margin-bottom: 1.5rem; max-width: 520px; }
.welcome-actions { display: flex; gap: 0.75rem; flex-wrap: wrap; }
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.25rem;
  background-color: #22c55e;
  color: #0a2e22;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-primary:hover:not(:disabled) { background-color: #16a34a; color: #ffffff; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-secondary {
  display: inline-flex;
  align-items: center;
  padding: 0.65rem 1.25rem;
  background-color: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.875rem;
  border: 1px solid rgba(255, 255, 255, 0.25);
  text-decoration: none;
}
.btn-icon { width: 18px; height: 18px; }
.welcome-decor { position: absolute; right: 0.5rem; bottom: -1rem; color: rgba(255, 255, 255, 0.08); }
.welcome-decor svg { width: 170px; height: 170px; }

/* Threshold Section */
.threshold-card {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e6f4ea;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}
.threshold-header { display: flex; justify-content: space-between; align-items: flex-start; }
.card-heading { font-size: 1.1rem; font-weight: 700; color: #0f172a; }
.btn-edit-threshold {
  padding: 0.45rem 0.85rem;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #15803d;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.8rem;
  cursor: pointer;
}
.threshold-edit-box { display: flex; gap: 0.75rem; align-items: center; }
.input-group { display: flex; align-items: center; flex: 1; border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; }
.input-prefix { background: #f8fafc; padding: 0.6rem 0.85rem; font-weight: 700; color: #64748b; font-size: 0.875rem; border-right: 1px solid #cbd5e1; }
.input-budget { flex: 1; border: none; padding: 0.6rem 0.85rem; font-size: 0.9rem; outline: none; }
.btn-save { padding: 0.65rem 1.25rem; background: #16a34a; color: #ffffff; border: none; border-radius: 8px; font-weight: 700; font-size: 0.85rem; cursor: pointer; }
.btn-cancel { padding: 0.65rem 1rem; background: #f1f5f9; color: #475569; border: none; border-radius: 8px; font-weight: 600; font-size: 0.85rem; cursor: pointer; }

.threshold-metrics { display: flex; justify-content: space-between; }
.sub-label { display: block; font-size: 0.75rem; font-weight: 600; color: #64748b; text-transform: uppercase; margin-bottom: 0.2rem; }
.metric-val { font-size: 1.15rem; font-weight: 700; }
.text-success { color: #15803d; }
.text-slate { color: #1e293b; }

.progress-bar-bg { width: 100%; height: 10px; background: #f1f5f9; border-radius: 99px; overflow: hidden; margin-top: 0.5rem; }
.progress-bar-fill { height: 100%; border-radius: 99px; transition: width 0.5s ease-in-out; }
.fill-safe { background: #22c55e; }
.fill-warning { background: #f59e0b; }
.fill-danger { background: #e11d48; }

.threshold-footer { display: flex; justify-content: space-between; align-items: center; font-size: 0.82rem; color: #475569; }
.badge-safe { color: #15803d; font-weight: 700; }
.badge-warning { color: #d97706; font-weight: 700; }
.badge-danger { color: #e11d48; font-weight: 700; }
.badge-neutral { color: #94a3b8; font-style: italic; }

/* Grid & Split */
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 1.25rem; }
.stat-card { background: #ffffff; padding: 1.25rem; border-radius: 14px; border: 1px solid #e6f4ea; display: flex; align-items: center; gap: 1rem; }
.stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.35rem; }
.bg-green { background-color: #dcfce7; }
.bg-emerald { background-color: #d1fae5; }
.bg-amber { background-color: #fef3c7; }
.bg-rose { background-color: #ffe4e6; }
.stat-label { font-size: 0.78rem; font-weight: 600; color: #64748b; text-transform: uppercase; }
.stat-value { font-size: 1.3rem; font-weight: 700; color: #0f172a; }
.stat-value .unit { font-size: 0.8rem; font-weight: 500; color: #94a3b8; }
.text-emerald { color: #059669; }
.text-amber { color: #d97706; }
.text-rose { color: #e11d48; }

.dashboard-split { display: grid; grid-template-columns: 1fr 1.4fr; gap: 1.5rem; }
@media (max-width: 1024px) { .dashboard-split { grid-template-columns: 1fr; } }
.card { background: #ffffff; border-radius: 16px; border: 1px solid #e6f4ea; padding: 1.5rem; }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; }
.card-header h3 { font-size: 1.05rem; font-weight: 700; color: #0f172a; }
.badge { font-size: 0.72rem; padding: 0.2rem 0.5rem; background-color: #dcfce7; color: #15803d; border-radius: 6px; font-weight: 600; }
.chart-container { height: 240px; position: relative; }
.recent-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
.recent-table th { text-align: left; padding: 0.6rem 0.75rem; color: #64748b; font-size: 0.75rem; text-transform: uppercase; border-bottom: 1px solid #f1f5f9; }
.recent-table td { padding: 0.75rem; border-bottom: 1px solid #f8fafc; }
.link-more { font-size: 0.82rem; color: #15803d; text-decoration: none; font-weight: 600; }
.text-right { text-align: right; }
.text-center { text-align: center; }
.text-muted { color: #94a3b8; }

.chart-container { 
  height: 240px; 
  position: relative; 
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-center-text {
  position: absolute;
  top: 42%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
  text-align: center;
}

.center-val {
  font-size: 1.05rem;
  font-weight: 700;
  color: #0f172a;
}

.center-label {
  font-size: 0.65rem;
  font-weight: 700;
  color: #64748b;
  letter-spacing: 0.05em;
}
</style>