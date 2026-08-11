import { PartUsageModel } from "../models/PartUsageModel.js";

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
    return res.status(200).json({
      success: true,
      message: "Pemakaian suku cadang dihapus dan stok dikembalikan."
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};