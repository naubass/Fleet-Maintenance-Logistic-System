import { supabase } from "../config/supabaseClient.js";
import { MaintenanceRecordModel } from "../models/MaintenanceRecordModel.js";

export const getAllRecords = async (req, res) => {
    try {
        const { page, limit, search, status, startDate, endDate, start_date, end_date } = req.query;
        const result = await MaintenanceRecordModel.findAll({
            page: page || 1,
            limit: limit || 10,
            search: search || "",
            status: status || "all",
            startDate: startDate || start_date || "",
            endDate: endDate || end_date || ""
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

        const inputCost = Number(total_cost) || 0;

        const data = await MaintenanceRecordModel.create({
            vehicle_id,
            reported_by: req.user?.id || null,
            assigned_mechanic_id: assigned_mechanic_id || null,
            problem_description,
            action_taken: action_taken || "",
            mileage_at_service: Number(mileage_at_service) || 0,
            labor_cost: inputCost, // Simpan biaya jasa awal secara terpisah
            total_cost: inputCost, // Saat awal buat, total_cost = labor_cost (karena belum ada sparepart)
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

        // Tentukan biaya jasa murni dari input form
        const inputLaborCost = labor_cost !== undefined ? Number(labor_cost) : (Number(total_cost) || 0);
        const grandTotal = inputLaborCost + partsTotal;

        // Update data dengan labor_cost dan total_cost yang konsisten
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