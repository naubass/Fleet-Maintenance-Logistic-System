import { ScheduleModel } from "../models/ScheduleModel.js";

export const getAllSchedules = async (req, res) => {
    try {
        const { page, limit, search, status } = req.query;
        const result = await ScheduleModel.findAll({
            page: page || 1,
            limit: limit || 10,
            search: search || "",
            status: status || "all"
        });

        return res.status(200).json({ success: true, ...result });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// Controller create schedules
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

        return res.status(201).json({ success: true, data, message: "Jadwal berhasil ditambahkan" });
    } catch (err) {
        return res.status(400).json({ success: false, message: err.message });
    }
};

// Controller update schedules
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

        return res.status(200).json({ success: true, data, message: "Jadwal Service berhasil diperbarui" });
    } catch (err) {
        return res.status(400).json({ success: false, message: err.message });
    }
};

// Controller delete schedules
export const deleteSchedule = async (req, res) => {
    try {
        const { id } = req.params;
        await ScheduleModel.delete(id);

        return res.status(200).json({ success: true, message: "Jadwal berhasil dihapus" });
    } catch (err) {
        return res.status(400).json({ success: false, message: err.message });
    }
};