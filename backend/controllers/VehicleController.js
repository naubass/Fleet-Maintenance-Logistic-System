import { VehicleModel } from "../models/VehicleModel.js";

export const getAllVehicles = async (req, res) => {
  try {
    const { page, limit, search, category, status } = req.query;

    const result = await VehicleModel.findAll({
      page: page || 1,
      limit: limit || 5,
      search: search || "",
      category: category || "all",
      status: status || "all"
    });

    return res.status(200).json({ 
      success: true, 
      ...result 
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

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
    return res.status(400).json({ success: false, message: err.message });
  }
};

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
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const deleteVehicles = async (req, res) => {
  try {
    const { id } = req.params;
    await VehicleModel.delete(id);

    return res.status(200).json({ 
      success: true, 
      message: "Kendaraan berhasil dihapus" 
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};