import { VehicleModel } from "../models/VehicleModel.js";
import { getOrSetCache, invalidateCache } from "../utils/cacheHelper.js";
import { logActivity } from "../services/activityLoggerService.js";

// GET all vehicles
export const getAllVehicles = async (req, res) => {
  try {
    const { page, limit, search, category, status } = req.query;

    // Cache key unik mencakup semua parameter filter & pagination
    const cacheKey = `vehicles:list:p${page || 1}:l${limit || 10}:s${search || "all"}:c${category || "all"}:st${status || "all"}`;

    const result = await getOrSetCache(cacheKey, async () => {
      return await VehicleModel.findAll({
        page: page || 1,
        limit: limit || 10,
        search: search || "",
        category: category || "all",
        status: status || "all"
      });
    }, 300); // Disimpan di Redis selama 300 detik / (5 menit)

    return res.status(200).json({ 
      success: true, 
      ...result 
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Create vehicle
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

    // Hapus cache list default agar armada baru langsung tampil di tabel & dropdown
    await invalidateCache([
      "vehicles:list:p1:l10:sall:call:stall",
      "dashboard:stats:summary"
    ]);

    // Catat Log Aktivitas
    logActivity({
      userId: req.user?.id,
      action: "CREATE",
      entity: "VEHICLE",
      entityId: data.id,
      description: `${req.user?.full_name || 'Admin'} menambahkan unit armada baru ${data.model_name} (${data.plate_number})`,
      req
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

// Update vehicle
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

    // Hapus cache data list dan cache spesifik ID kendaraan
    await invalidateCache([
      "vehicles:list:p1:l10:sall:call:stall",
      `vehicles:${id}`,
      "dashboard:stats:summary"
    ]);

    // Catat Log Aktivitas
    logActivity({
      userId: req.user?.id,
      action: "UPDATE",
      entity: "VEHICLE",
      entityId: data.id,
      description: `${req.user?.full_name || 'Admin'} memperbarui unit armada baru ${data.model_name} (${data.plate_number})`,
      req
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

// Hapus vehicle
export const deleteVehicles = async (req, res) => {
  try {
    const { id } = req.params;
    await VehicleModel.delete(id);

    // Hapus cache agar data yang dihapus tidak muncul dari memori cache
    await invalidateCache([
      "vehicles:list:p1:l10:sall:call:stall",
      `vehicles:${id}`,
      "dashboard:stats:summary"
    ]);

    // Catat Log Aktivitas
    logActivity({
      userId: req.user?.id,
      action: "DELETE",
      entity: "VEHICLE",
      entityId: data.id,
      description: `${req.user?.full_name || 'Admin'} menghapus unit armada baru ${data.model_name} (${data.plate_number})`,
      req
    });

    return res.status(200).json({ 
      success: true, 
      message: "Kendaraan berhasil dihapus" 
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};