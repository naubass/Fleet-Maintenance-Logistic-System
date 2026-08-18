import { ScheduleModel } from "../models/ScheduleModel.js";
import { getOrSetCache, invalidateCache } from "../utils/cacheHelper.js";
import { logActivity } from "../services/activityLoggerService.js";

// GET /api/schedules (Dengan Caching Redis)
export const getAllSchedules = async (req, res) => {
  try {
    const { page, limit, search, status, startDate, endDate, start_date, end_date } = req.query;

    const pageVal = page || 1;
    const limitVal = limit || 10;
    const searchVal = search || "all";
    const statusVal = status || "all";
    const startVal = startDate || start_date || "all";
    const endVal = endDate || end_date || "all";

    // Cache key unik mencakup pagination, pencarian, dan filter tanggal
    const cacheKey = `schedules:list:p${pageVal}:l${limitVal}:s${searchVal}:st${statusVal}:sd${startVal}:ed${endVal}`;

    const result = await getOrSetCache(cacheKey, async () => {
      return await ScheduleModel.findAll({
        page: pageVal,
        limit: limitVal,
        search: search || "",
        status: status || "all",
        startDate: startDate || start_date || "",
        endDate: endDate || end_date || ""
      });
    }, 300); // Disimpan selama 5 menit (300 detik)

    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/schedules (Tambah Jadwal + Invalidate Cache)
export const createSchedule = async (req, res) => {
  try {
    const { vehicle_id, service_type, interval_km, last_serviced_km, next_due_km, last_serviced_date, next_due_date, status } = req.body;

    if (!vehicle_id || !service_type || !interval_km) {
      return res.status(400).json({ success: false, message: "Armada, tipe servis, dan interval KM harus diisi" });
    }

    const data = await ScheduleModel.create({
      vehicle_id,
      service_type,
      interval_km: Number(interval_km) || 0,
      last_serviced_km: Number(last_serviced_km) || 0,
      next_due_km: Number(next_due_km) || (Number(last_serviced_km) + Number(interval_km)),
      last_serviced_date: last_serviced_date || null,
      next_due_date: next_due_date || null,
      status: status || "pending"
    });

    // Otomatis hapus cache list default & cache dashboard
    await invalidateCache([
      "schedules:list:p1:l10:sall:stall:sdall:edall",
      "dashboard:stats:summary"
    ]);

    // Catat Log Aktivitas: CREATE SCHEDULE
    logActivity({
      userId: req.user?.id,
      action: "CREATE",
      entity: "SCHEDULE",
      entityId: data?.id,
      description: `${req.user?.full_name || 'Admin'} membuat jadwal servis baru: ${service_type} (Status: ${data?.status || status || 'pending'})`,
      req
    });

    return res.status(201).json({ success: true, data, message: "Jadwal berhasil ditambahkan" });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

// PUT /api/schedules/:id (Update Jadwal + Invalidate Cache)
export const updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { vehicle_id, service_type, interval_km, last_serviced_km, next_due_km, last_serviced_date, next_due_date, status } = req.body;
    
    const data = await ScheduleModel.update(id, {
      service_type,
      interval_km: Number(interval_km) || 0,
      last_serviced_km: Number(last_serviced_km) || 0,
      next_due_km: Number(next_due_km) || 0,
      last_serviced_date: last_serviced_date || null,
      next_due_date: next_due_date || null,
      status
    });

    // Invalidate cache list, detail ID jadwal, dan ringkasan dashboard
    await invalidateCache([
      "schedules:list:p1:l10:sall:stall:sdall:edall",
      `schedules:${id}`,
      "dashboard:stats:summary"
    ]);

    // Catat Log Aktivitas: UPDATE SCHEDULE
    logActivity({
      userId: req.user?.id,
      action: "UPDATE",
      entity: "SCHEDULE",
      entityId: id,
      description: `${req.user?.full_name || 'Admin'} memperbarui jadwal servis ID #${id} (Status: ${status || data?.status})`,
      req
    });

    return res.status(200).json({ success: true, data, message: "Jadwal Service berhasil diperbarui" });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE /api/schedules/:id (Hapus Jadwal + Invalidate Cache)
export const deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    await ScheduleModel.delete(id);

    // Invalidate cache list, detail ID jadwal, dan ringkasan dashboard
    await invalidateCache([
      "schedules:list:p1:l10:sall:stall:sdall:edall",
      `schedules:${id}`,
      "dashboard:stats:summary"
    ]);

    // Catat Log Aktivitas: DELETE SCHEDULE
    logActivity({
      userId: req.user?.id,
      action: "DELETE",
      entity: "SCHEDULE",
      entityId: id,
      description: `${req.user?.full_name || 'Admin'} menghapus jadwal servis ID #${id}`,
      req
    });

    return res.status(200).json({ success: true, message: "Jadwal berhasil dihapus" });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};