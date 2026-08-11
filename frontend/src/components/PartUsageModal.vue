<script setup>
import { ref, watch, onMounted } from 'vue'
import { partUsageService } from '../services/partUsageService'
import { sparepartService } from '../services/sparepartService'

const props = defineProps({
  isOpen: Boolean,
  maintenanceRecord: Object
})

const emit = defineEmits(['close', 'updated'])

const usageList = ref([])
const availableSpareparts = ref([])
const selectedPart = ref(null)

const form = ref({
  sparepart_id: '',
  quantity: 1,
  price_per_unit: 0
})

const loadUsages = async () => {
  if (!props.maintenanceRecord?.id) return
  const res = await partUsageService.getByRecord(props.maintenanceRecord.id)
  if (res && res.success) {
    usageList.value = res.data || []
  }
}

const loadSpareparts = async () => {
  const res = await sparepartService.getAll({ limit: 100 })
  if (res && res.success) {
    availableSpareparts.value = res.data || []
  }
}

const onPartSelect = () => {
  const found = availableSpareparts.value.find(p => p.id === form.value.sparepart_id)
  if (found) {
    selectedPart.value = found
    form.value.price_per_unit = found.unit_price || 0
  } else {
    selectedPart.value = null
    form.value.price_per_unit = 0
  }
}

const handleAdd = async () => {
  if (!form.value.sparepart_id || form.value.quantity <= 0) {
    return alert('Pilih sparepart dan masukkan jumlah yang valid.')
  }

  const payload = {
    maintenance_record_id: props.maintenanceRecord.id,
    sparepart_id: form.value.sparepart_id,
    quantity: form.value.quantity,
    price_per_unit: form.value.price_per_unit
  }

  const res = await partUsageService.create(payload)
  if (res && res.success) {
    form.value.sparepart_id = ''
    form.value.quantity = 1
    form.value.price_per_unit = 0
    selectedPart.value = null
    await loadUsages()
    await loadSpareparts()
    emit('updated')
  } else {
    alert(`Gagal: ${res?.message || 'Terjadi kesalahan'}`)
  }
}

const handleDelete = async (id) => {
  if (!confirm('Hapus pemakaian sparepart ini? Stok akan dikembalikan.')) return
  const res = await partUsageService.delete(id)
  if (res && res.success) {
    await loadUsages()
    await loadSpareparts()
    emit('updated')
  }
}

const formatRupiah = (val) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0)
}

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    loadUsages()
    loadSpareparts()
  }
})
</script>

<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="emit('close')">
    <div class="modal-card">
      <div class="modal-header">
        <div>
          <h3>Rincian Pemakaian Suku Cadang</h3>
          <p class="subtitle">Record Perbaikan ID: {{ maintenanceRecord?.id?.substring(0, 8) }}...</p>
        </div>
        <button @click="emit('close')" class="btn-close">&times;</button>
      </div>

      <!-- Form Tambah Sparepart -->
      <form @submit.prevent="handleAdd" class="add-part-form">
        <div class="form-row">
          <div class="form-group flex-2">
            <label>Pilih Suku Cadang</label>
            <select v-model="form.sparepart_id" @change="onPartSelect" class="custom-select" required>
                <option value="">-- Pilih Sparepart --</option>
                <option 
                    v-for="part in availableSpareparts" 
                    :key="part.id" 
                    :value="part.id"
                    :disabled="part.stock === 0"
                >
                    {{ part.part_number }} - {{ part.name }} 
                    {{ part.stock === 0 ? '(HABIS)' : `(Stok: ${part.stock} ${part.unit})` }}
                </option>
            </select>
          </div>

          <div class="form-group flex-1">
            <label>Jumlah Usul</label>
            <input v-model.number="form.quantity" type="number" min="1" required placeholder="1" />
          </div>

          <div class="form-group flex-1">
            <label>Harga @ (Rp)</label>
            <input v-model.number="form.price_per_unit" type="number" min="0" required />
          </div>

          <div class="form-group btn-align">
            <button type="submit" class="btn-primary-sm">+ Gunakan</button>
          </div>
        </div>
      </form>

      <!-- Tabel Daftar Pemakaian -->
      <div class="table-container">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Kode</th>
              <th>Nama Sparepart</th>
              <th>Qty</th>
              <th>Harga Satuan</th>
              <th>Subtotal</th>
              <th style="text-align: right;">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in usageList" :key="item.id">
              <td class="id-text">{{ item.spareparts?.part_number }}</td>
              <td class="font-bold">{{ item.spareparts?.name }}</td>
              <td>{{ item.quantity }} {{ item.spareparts?.unit || 'Pcs' }}</td>
              <td>{{ formatRupiah(item.price_per_unit) }}</td>
              <td class="price-bold">{{ formatRupiah(item.quantity * item.price_per_unit) }}</td>
              <td style="text-align: right;">
                <button @click="handleDelete(item.id)" class="btn-delete" title="Hapus Pemakaian">
                  &times;
                </button>
              </td>
            </tr>
            <tr v-if="usageList.length === 0">
              <td colspan="6" class="empty-text">Belum ada suku cadang yang dicatat untuk perbaikan ini.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="modal-footer">
        <button @click="emit('close')" class="btn-secondary">Selesai</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 60; padding: 1rem; }
.modal-card { background: #ffffff; padding: 1.75rem; border-radius: 16px; width: 100%; max-width: 720px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); }
.modal-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.25rem; }
.subtitle { font-size: 0.8rem; color: #64748b; margin-top: 2px; }
.btn-close { background: none; border: none; font-size: 1.5rem; color: #94a3b8; cursor: pointer; }

.add-part-form { background: #f8fafc; padding: 1rem; border-radius: 10px; border: 1px solid #e2e8f0; margin-bottom: 1.25rem; }
.form-row { display: flex; gap: 0.75rem; align-items: flex-end; }
.flex-2 { flex: 2; } .flex-1 { flex: 1; }
.form-group label { font-size: 0.75rem; font-weight: 600; color: #475569; display: block; margin-bottom: 0.25rem; }
.form-group input, .custom-select { height: 38px; width: 100%; padding: 0 0.625rem; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.825rem; background: #ffffff; outline: none; box-sizing: border-radius; }
.btn-align { display: flex; align-items: flex-end; }
.btn-primary-sm { height: 38px; padding: 0 1rem; background: #2563eb; color: #ffffff; border: none; border-radius: 8px; font-weight: 600; font-size: 0.8rem; cursor: pointer; white-space: nowrap; }

.table-container { border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; max-height: 260px; overflow-y: auto; }
.custom-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; text-align: left; }
.custom-table th { background: #f1f5f9; padding: 0.625rem 0.875rem; color: #475569; font-weight: 600; }
.custom-table td { padding: 0.625rem 0.875rem; border-bottom: 1px solid #f1f5f9; }
.id-text { font-family: monospace; color: #2563eb; font-weight: 600; }
.font-bold { font-weight: 600; }
.price-bold { font-weight: 600; color: #166534; }
.empty-text { text-align: center; padding: 1.5rem !important; color: #94a3b8; }
.btn-delete { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; width: 26px; height: 26px; border-radius: 6px; cursor: pointer; font-weight: 700; }

.modal-footer { display: flex; justify-content: flex-end; margin-top: 1.25rem; }
.btn-secondary { background: #ffffff; color: #475569; border: 1px solid #cbd5e1; padding: 0 1.25rem; height: 38px; border-radius: 8px; font-weight: 600; cursor: pointer; }
</style>