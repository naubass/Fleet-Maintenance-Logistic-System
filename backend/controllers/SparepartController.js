import { SparepartModel } from "../models/SparepartModel.js";
import { getOrSetCache, invalidateCache } from "../utils/cacheHelper.js";

// GET /api/spareparts/
export const generateCode = async (req, res) => {
  try {
    const { category } = req.query;

    const prefixes = {
      'Oli & Cairan': 'OIL',
      'Sistem Rem': 'BRK',
      'Filter': 'FLT',
      'Mesin': 'ENG',
      'Kelistrikan': 'ELC',
      'Ban & Aksesoris': 'TIR'
    };

    const prefix = prefixes[category] || 'PRT';
    const year = new Date().getFullYear();
    const randomNum = Math.floor(1000 + Math.random() * 9000);

    const generatedCode = `${prefix}-${year}-${randomNum}`;

    return res.status(200).json({
      success: true,
      code: generatedCode
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/spareparts 
export const getAllSpareparts = async (req, res) => {
  try {
    const { page, limit, search, category } = req.query;

    // Cache key unik mencakup parameter filter & pagination
    const cacheKey = `spareparts:list:p${page || 1}:l${limit || 10}:s${search || "all"}:c${category || "all"}`;

    const result = await getOrSetCache(cacheKey, async () => {
      return await SparepartModel.findAll({
        page: page || 1,
        limit: limit || 10,
        search: search || "",
        category: category || "all"
      });
    }, 300); // Disimpan di Redis selama 300 detik (5 menit)

    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/spareparts 
export const createSparepart = async (req, res) => {
  try {
    const { part_number, name } = req.body;
    if (!part_number || !name) {
      return res.status(400).json({ success: false, message: "Kode sparepart dan nama wajib diisi." });
    }

    const data = await SparepartModel.create(req.body);

    // Hapus cache list default agar barang baru langsung tampil
    await invalidateCache([
      "spareparts:list:p1:l10:sall:call",
      "spareparts:list:p1:l10:s:call",
      "spareparts:list:p1:l50:sall:call",
      "spareparts:list:p1:l100:sall:call",
      "dashboard:stats:summary"
    ]);

    return res.status(201).json({ success: true, data, message: "Sparepart berhasil ditambahkan." });
  } catch (err) {
    if (err.code === '23505' || err.message?.includes('unique constraint')) {
      return res.status(400).json({
        success: false,
        message: `Kode Sparepart '${req.body.part_number}' sudah terdaftar. Gunakan kode lain!`
      });
    }
    return res.status(400).json({ success: false, message: err.message });
  }
};

// PUT /api/spareparts/:id 
export const updateSparepart = async (req, res) => {
  try {
    const { id } = req.params;
    const { part_number, name } = req.body;
    if (!part_number || !name) {
      return res.status(400).json({ success: false, message: "Kode sparepart dan nama wajib diisi." });
    }

    const data = await SparepartModel.update(id, req.body);

    // Invalidate cache list dan cache barang spesifik
    await invalidateCache([
      "spareparts:list:p1:l10:sall:call",
      `spareparts:${id}`,
      "dashboard:stats:summary"
    ]);

    return res.status(200).json({ success: true, data, message: "Sparepart berhasil diperbarui." });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE /api/spareparts/:id 
export const deleteSparepart = async (req, res) => {
  try {
    const { id } = req.params;
    await SparepartModel.delete(id);

    // Invalidate cache list agar barang yang terhapus langsung hilang
    await invalidateCache([
      "spareparts:list:p1:l10:sall:call",
      `spareparts:${id}`,
      "dashboard:stats:summary"
    ]);

    return res.status(200).json({ success: true, message: "Sparepart berhasil dihapus." });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};