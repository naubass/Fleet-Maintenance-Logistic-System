import { supabase } from "../config/supabaseClient.js";

// Get API Endpoint
export const getAllVehicles = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("vehicles")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) throw error
        return res.status(200).json({ success: true, data });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
}

// POST API Endpoint
export const createVehicles = async (req, res) => {
    try {
        const { model_name, plate_number, category, status, current_mileage} = req.body;

        const { data, error } = await supabase
            .from("vehicles")
            .insert([{ 
                model_name, 
                plate_number, 
                category, 
                status, 
                current_mileage: Number(current_mileage) || 0 
            }])
            .select()
            .single();

        if (error) throw error
        return res.status(201).json({ success: true, data, message: "Kendaraan berhasil ditambahkan" });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
}

// PUT API Endpoint
export const updateVehicles = async (req, res) => {
    try {
        const { id } = req.params;
        const { model_name, plate_number, category, status, current_mileage } = req.body;

        const { data, error } = await supabase
            .from("vehicles")
            .update([{ model_name, plate_number, category, status, current_mileage: Number(current_mileage) || 0 }])
            .eq("id", id)
            .select()
            .single();

        if (error) throw error
        return res.status(200).json({ success: true, data, message: "Kendaraan berhasil diperbarui" });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
}

// DELETE API Endpoint
export const deleteVehicles = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from("vehicles")
            .delete()
            .eq("id", id);
            
        if (error) throw error
        return res.status(200).json({ success: true, data, message: "Kendaraan berhasil dihapus" });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
}