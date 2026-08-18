import { supabase } from "../config/supabaseClient.js";
import { MaintenanceRecordModel } from "../models/MaintenanceRecordModel.js";
import { getOrSetCache, invalidateCache } from "../utils/cacheHelper.js";
import { logActivity } from "../services/activityLoggerService.js";

// GET /api/maintenance-records (Dengan Caching Redis Terisolasi per Role/User)
export const getAllRecords = async (req, res) => {
  try {
    const { page, limit, search, status, startDate, endDate, start_date, end_date, mechanicId } = req.query;
    
    // Jika role akun yang login adalah 'mechanic', paksa gunakan ID mekanik login
    const targetMechanicId = (req.user?.role === "mechanic") ? req.user.id : (mechanicId || "");

    const pageVal = page || 1;
    const limitVal = limit || 10;
    const searchVal = search || "all";
    const statusVal = status || "all";
    const startVal = startDate || start_date || "all";
    const endVal = endDate || end_date || "all";
    const mecVal = targetMechanicId || "all";

    // Cache key unik menyertakan identifier mekanik
    const cacheKey = `maintenance_records:list:p${pageVal}:l${limitVal}:s${searchVal}:st${statusVal}:sd${startVal}:ed${endVal}:m${mecVal}`;

    const result = await getOrSetCache(cacheKey, async () => {
      return await MaintenanceRecordModel.findAll({
        page: pageVal,
        limit: limitVal,
        search: search || "",
        status: status || "all",
        startDate: startDate || start_date || "",
        endDate: endDate || end_date || "",
        mechanicId: targetMechanicId
      });
    }, 300); // Cache Redis selama 5 menit
    
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/maintenance-records (Tambah Data + Invalidate Cache)
export const createRecord = async (req, res) => {
  try {
    const { 
      vehicle_id, 
      assigned_mechanic_id, 
      problem_description, 
      action_taken, 
      mileage_at_service, 
      total_cost, 
      status, 
      started_at, 
      completed_at
    } = req.body;

    if (!vehicle_id || !problem_description) {
      return res.status(400).json({ success: false, message: "Armada dan deskripsi masalah harus diisi" });
    }

    const inputCost = Number(total_cost) || 0;

    const data = await MaintenanceRecordModel.create({
      vehicle_id,
      reported_by: req.user?.id || null,
      assigned_mechanic_id: assigned_mechanic_id || null,
      problem_description,
      action_taken: action_taken || "",
      mileage_at_service: Number(mileage_at_service) || 0,
      labor_cost: inputCost,
      total_cost: inputCost,
      status: status || "completed",
      started_at: started_at || new Date().toISOString(),
      completed_at: status === "completed" ? (completed_at || new Date().toISOString()) : null
    });

    // Invalidate seluruh cache list terkait
    await invalidateCache([
      "maintenance_records:list:p1:l10:sall:stall:sdall:edall:mall",
      "dashboard:stats:summary"
    ]);

    // Catat Log Aktivitas: CREATE MAINTENANCE RECORD
    logActivity({
      userId: req.user?.id,
      action: "CREATE",
      entity: "MAINTENANCE",
      entityId: data?.id,
      description: `${req.user?.full_name || 'Pengguna'} membuat catatan servis baru: "${problem_description}" (Status: ${data?.status || status || 'completed'})`,
      req
    });

    return res.status(201).json({ success: true, data, message: "Catatan Maintenance berhasil ditambahkan" });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

// PUT /api/maintenance-records/:id (Update Data + Invalidate Cache)
export const updateRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      assigned_mechanic_id, 
      problem_description, 
      action_taken, 
      mileage_at_service, 
      total_cost, 
      labor_cost, 
      status, 
      started_at, 
      completed_at
    } = req.body;

    // Hitung total spareparts aktif
    const { data: usages } = await supabase
      .from("part_usages")
      .select("quantity, price_per_unit")
      .eq("maintenance_record_id", id);

    const partsTotal = (usages || []).reduce((acc, curr) => {
      return acc + (Number(curr.quantity) * Number(curr.price_per_unit));
    }, 0);

    const inputLaborCost = labor_cost !== undefined ? Number(labor_cost) : (Number(total_cost) || 0);
    const grandTotal = inputLaborCost + partsTotal;

    const data = await MaintenanceRecordModel.update(id, {
      assigned_mechanic_id: assigned_mechanic_id || null,
      problem_description,
      action_taken: action_taken || "",
      mileage_at_service: Number(mileage_at_service) || 0,
      labor_cost: inputLaborCost, 
      total_cost: grandTotal,     
      status: status || "completed",
      started_at: started_at || new Date().toISOString(),
      completed_at: status === "completed" ? (completed_at || new Date().toISOString()) : null
    });

    // Invalidate cache
    await invalidateCache([
      "maintenance_records:list:p1:l10:sall:stall:sdall:edall:mall",
      `maintenance_records:${id}`,
      "dashboard:stats:summary"
    ]);

    // Catat Log Aktivitas: UPDATE MAINTENANCE RECORD
    logActivity({
      userId: req.user?.id,
      action: "UPDATE",
      entity: "MAINTENANCE",
      entityId: id,
      description: `${req.user?.full_name || 'Pengguna'} memperbarui servis ID #${id} (Status: ${status || data?.status || 'completed'}, Total Biaya: Rp ${grandTotal.toLocaleString('id-ID')})`,
      req
    });

    return res.status(200).json({ success: true, data, message: "Catatan Maintenance berhasil diperbarui" });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE /api/maintenance-records/:id (Hapus Data + Invalidate Cache)
export const deleteRecord = async (req, res) => {
  try {
    const { id } = req.params;
    await MaintenanceRecordModel.delete(id);

    await invalidateCache([
      "maintenance_records:list:p1:l10:sall:stall:sdall:edall:mall",
      `maintenance_records:${id}`,
      "dashboard:stats:summary"
    ]);

    // Catat Log Aktivitas: DELETE MAINTENANCE RECORD
    logActivity({
      userId: req.user?.id,
      action: "DELETE",
      entity: "MAINTENANCE",
      entityId: id,
      description: `${req.user?.full_name || 'Admin'} menghapus catatan servis ID #${id}`,
      req
    });

    return res.status(200).json({ success: true, message: "Catatan Maintenance berhasil dihapus" });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};