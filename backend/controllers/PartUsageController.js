import { PartUsageModel } from "../models/PartUsageModel.js";
import { invalidateCache } from "../utils/cacheHelper.js";

export const getByMaintenanceRecord = async (req, res) => {
  try {
    const { recordId } = req.params;
    const data = await PartUsageModel.findByRecordId(recordId);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const createPartUsage = async (req, res) => {
  try {
    const { maintenance_record_id, sparepart_id, quantity } = req.body;

    if (!maintenance_record_id || !sparepart_id || !quantity) {
      return res.status(400).json({
        success: false,
        message: "Record perbaikan, suku cadang, dan jumlah pemakaian wajib diisi."
      });
    }

    const data = await PartUsageModel.create(req.body);

    // Invalidate cache maintenance records, spareparts (karena stok berkurang), dan dashboard
    await invalidateCache([
      "maintenance_records:list:p1:l10:sall:stall:sdall:edall",
      `maintenance_records:${maintenance_record_id}`,
      "spareparts:list:p1:l10:s:call",           // Format tanpa search
      "spareparts:list:p1:l10:sall:call",        // Fallback format
      `spareparts:${sparepart_id}`,
      "dashboard:stats:summary"
    ]);

    return res.status(201).json({
      success: true,
      data,
      message: "Pemakaian suku cadang berhasil dicatat dan stok diperbarui."
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const deletePartUsage = async (req, res) => {
  try {
    const { id } = req.params;
    await PartUsageModel.delete(id);

    // Invalidate cache agar biaya dan stok yang dikembalikan langsung sinkron
    await invalidateCache([
      "maintenance_records:list:p1:l10:sall:stall:sdall:edall",
      "spareparts:list:p1:l10:s:call",           // Format tanpa search
      "spareparts:list:p1:l10:sall:call",        // Fallback format
      "dashboard:stats:summary"
    ]);

    return res.status(200).json({
      success: true,
      message: "Pemakaian suku cadang dihapus dan stok dikembalikan."
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};