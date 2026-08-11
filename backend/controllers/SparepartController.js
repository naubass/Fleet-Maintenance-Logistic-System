import { SparepartModel } from "../models/SparepartModel.js";

// GET /api/spareparts/generate-code?category=Filter
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
    const randomNum = Math.floor(1000 + Math.random() * 9000); // Atau urutan incremental dari DB
    
    const generatedCode = `${prefix}-${year}-${randomNum}`;

    return res.status(200).json({
      success: true,
      code: generatedCode
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getAllSpareparts = async (req, res) => {
  try {
    const { page, limit, search, category } = req.query;
    const result = await SparepartModel.findAll({ page, limit, search, category });
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const createSparepart = async (req, res) => {
  try {
    const { part_number, name } = req.body;
    if (!part_number || !name) {
      return res.status(400).json({ success: false, message: "Kode sparepart dan nama wajib diisi." });
    }

    const data = await SparepartModel.create(req.body);
    return res.status(201).json({ success: true, data, message: "Sparepart berhasil ditambahkan." });
  } catch (err) {
    // Tangkap error duplikat dari PostgreSQL
    if (err.code === '23505' || err.message?.includes('unique constraint')) {
      return res.status(400).json({
        success: false,
        message: `Kode Sparepart '${req.body.part_number}' sudah terdaftar. Gunakan kode lain!`
      });
    }
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const updateSparepart = async (req, res) => {
  try {
    const { id } = req.params;
    const { part_number, name } = req.body;
    if (!part_number || !name) {
      return res.status(400).json({ success: false, message: "Kode sparepart dan nama wajib diisi." });
    }
    const data = await SparepartModel.update(id, req.body);
    return res.status(200).json({ success: true, data, message: "Sparepart berhasil diperbarui." });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const deleteSparepart = async (req, res) => {
  try {
    const { id } = req.params;
    await SparepartModel.delete(id);
    return res.status(200).json({ success: true, message: "Sparepart berhasil dihapus." });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};