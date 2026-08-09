import { VehicleModel } from "../models/VehicleModel.js";

// GET /api/vehicles - Ambil semua kendaraan
export const getAllVehicles = async (req, res) => {
  try {
    const data = await VehicleModel.findAll();
    return res.status(200).json({ 
      success: true, 
      data 
    });
  } catch (err) {
    return res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

// GET /api/vehicles/:id - Ambil detail 1 kendaraan
export const getVehicleById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await VehicleModel.findById(id);
    
    if (!data) {
      return res.status(404).json({ success: false, message: "Kendaraan tidak ditemukan" });
    }

    return res.status(200).json({ 
      success: true, 
      data 
    });
  } catch (err) {
    return res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

// POST /api/vehicles - Tambah kendaraan baru
export const createVehicles = async (req, res) => {
  try {
    const { model_name, plate_number, category, status, current_mileage } = req.body;

    const data = await VehicleModel.create({
      model_name,
      plate_number,
      category,
      status: status || 'ready',
      current_mileage: Number(current_mileage) || 0
    });

    return res.status(201).json({ 
      success: true, 
      data, 
      message: "Kendaraan berhasil ditambahkan" 
    });
  } catch (err) {
    return res.status(400).json({ 
      success: false, 
      message: err.message 
    });
  }
};

// PUT /api/vehicles/:id - Update data kendaraan
export const updateVehicles = async (req, res) => {
  try {
    const { id } = req.params;
    const { model_name, plate_number, category, status, current_mileage } = req.body;

    const data = await VehicleModel.update(id, {
      model_name,
      plate_number,
      category,
      status,
      current_mileage: Number(current_mileage) || 0
    });

    return res.status(200).json({ 
      success: true, 
      data, 
      message: "Kendaraan berhasil diperbarui" 
    });
  } catch (err) {
    return res.status(400).json({ 
      success: false, 
      message: err.message 
    });
  }
};

// DELETE /api/vehicles/:id - Hapus kendaraan
export const deleteVehicles = async (req, res) => {
  try {
    const { id } = req.params;
    await VehicleModel.delete(id);

    return res.status(200).json({ 
      success: true, 
      message: "Kendaraan berhasil dihapus" 
    });
  } catch (err) {
    return res.status(400).json({ 
      success: false, 
      message: err.message 
    });
  }
};