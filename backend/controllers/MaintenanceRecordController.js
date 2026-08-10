import { MaintenanceRecordModel } from "../models/MaintenanceRecordModel.js";

export const getAllRecords = async (req, res) => {
    try {
        const { page, limit, search, status } = req.query;
        const result = await MaintenanceRecordModel.findAll({
            page: page || 1,
            limit: limit || 10,
            search: search || "",
            status: status || "all"
        });
        
        return res.status(200).json({ success: true, ...result });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
}

// Controller create maintenance records
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

        const data = await MaintenanceRecordModel.create({
            vehicle_id,
            reported_by: req.user?.id || null, // Diambil dari token auth
            assigned_mechanic_id: assigned_mechanic_id || null,
            problem_description,
            action_taken: action_taken || "",
            mileage_at_service: Number(mileage_at_service) || 0,
            total_cost: Number(total_cost) || 0,
            status: status || "completed",
            started_at: started_at || new Date().toISOString(),
            completed_at: status === "completed" ? (completed_at || new Date().toISOString()) : null
        });

        return res.status(201).json({ success: true, data, message: "Catatan Maintenance berhasil ditambahkan" });
    } catch (err) {
        return res.status(400).json({ success: false, message: err.message });
    }
}

// Controller update maintenance records
export const updateRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            assigned_mechanic_id, 
            problem_description, 
            action_taken, 
            mileage_at_service, 
            total_cost, 
            status, 
            started_at, 
            completed_at
        } = req.body;

        const data = await MaintenanceRecordModel.update(id, {
            assigned_mechanic_id: assigned_mechanic_id || null,
            problem_description,
            action_taken: action_taken || "",
            mileage_at_service: Number(mileage_at_service) || 0,
            total_cost: Number(total_cost) || 0,
            status: status || "completed",
            started_at: started_at || new Date().toISOString(),
            completed_at: status === "completed" ? (completed_at || new Date().toISOString()) : null
        });

        return res.status(200).json({ success: true, data, message: "Catatan Maintenance berhasil diperbarui" });
    } catch (err) {
        return res.status(400).json({ success: false, message: err.message });
    }
}

// Controller delete maintenance records
export const deleteRecord = async (req, res) => {
    try {
        const { id } = req.params;
        await MaintenanceRecordModel.delete(id);

        return res.status(200).json({ success: true, message: "Catatan Maintenance berhasil dihapus" });
    } catch (err) {
        return res.status(400).json({ success: false, message: err.message });
    }
}