import { supabase } from "../config/supabaseClient.js";

export const PartUsageModel = {
  // Get daftar pemakaian sparepart
  async findByRecordId(maintenanceRecordId) {
    const { data, error } = await supabase
      .from("part_usages")
      .select(`
        *,
        spareparts (
          id,
          part_number,
          name,
          unit
        )
      `)
      .eq("maintenance_record_id", maintenanceRecordId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Tambah pemakaian sparepart
  async create(payload) {
    const { maintenance_record_id, sparepart_id, quantity, price_per_unit } = payload;
    const qtyNum = Number(quantity);
    const priceNum = Number(price_per_unit);

    const { data: sparepart, error: spError } = await supabase
      .from("spareparts")
      .select("stock, name")
      .eq("id", sparepart_id)
      .single();

    if (spError || !sparepart) throw new Error("Data sparepart tidak ditemukan.");
    if (sparepart.stock < qtyNum) {
      throw new Error(`Stok ${sparepart.name} tidak mencukupi (Tersedia: ${sparepart.stock}).`);
    }

    const { data: newUsage, error: usageError } = await supabase
      .from("part_usages")
      .insert([{
        maintenance_record_id,
        sparepart_id,
        quantity: qtyNum,
        price_per_unit: priceNum,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (usageError) throw usageError;

    await supabase
      .from("spareparts")
      .update({ 
        stock: sparepart.stock - qtyNum,
        updated_at: new Date().toISOString()
      })
      .eq("id", sparepart_id);

    await this.recalculateTotalCost(maintenance_record_id);

    return newUsage;
  },

  // Hapus pemakaian sparepart (Kembalikan Stok & Rekalkulasi Biaya)
  async delete(id) {
    const { data: usage, error: getError } = await supabase
      .from("part_usages")
      .select("sparepart_id, quantity, maintenance_record_id")
      .eq("id", id)
      .single();

    if (getError || !usage) throw new Error("Data pemakaian sparepart tidak ditemukan.");

    const { error: delError } = await supabase
      .from("part_usages")
      .delete()
      .eq("id", id);

    if (delError) throw delError;

    const { data: sparepart } = await supabase
      .from("spareparts")
      .select("stock")
      .eq("id", usage.sparepart_id)
      .single();

    if (sparepart) {
      await supabase
        .from("spareparts")
        .update({ 
          stock: sparepart.stock + usage.quantity,
          updated_at: new Date().toISOString()
        })
        .eq("id", usage.sparepart_id);
    }

    // Rekalkulasi biaya total setelah item dihapus
    await this.recalculateTotalCost(usage.maintenance_record_id);

    return true;
  },

  // Helper kalkulasi total_cost murni: (Labor Cost Asli) + (Total Spareparts)
    async recalculateTotalCost(maintenanceRecordId) {
    // 1. Hitung total semua sparepart aktif
    const { data: usages } = await supabase
        .from("part_usages")
        .select("quantity, price_per_unit")
        .eq("maintenance_record_id", maintenanceRecordId);

    const partsTotal = (usages || []).reduce((acc, curr) => {
        return acc + (Number(curr.quantity) * Number(curr.price_per_unit));
    }, 0);

    // 2. Ambil data record saat ini
    const { data: record } = await supabase
        .from("maintenance_records")
        .select("labor_cost, total_cost")
        .eq("id", maintenanceRecordId)
        .single();

    let laborCost = Number(record?.labor_cost) || 0;
    
    // Fallback aman: jika labor_cost 0 tapi total_cost ada, kurangi total_cost dengan partsTotal
    if (laborCost === 0 && Number(record?.total_cost) > 0) {
        laborCost = Math.max(0, Number(record.total_cost) - partsTotal);
    }

    const grandTotal = laborCost + partsTotal;

    // 3. Update data tanpa merusak nilai labor_cost asli
    await supabase
        .from("maintenance_records")
        .update({ 
        labor_cost: laborCost,
        total_cost: grandTotal 
        })
        .eq("id", maintenanceRecordId);
    }
};