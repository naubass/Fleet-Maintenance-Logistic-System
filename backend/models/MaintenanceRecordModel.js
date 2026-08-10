import { supabase } from "../config/supabaseClient.js";

export const MaintenanceRecordModel = {
    async findAll({ page = 1, limit = 10, search = "", status = "all" }) {
        const pageNum = Number(page);
        const limitNum = Number(limit);
        const from = (pageNum - 1) * limitNum;
        const to = from + limitNum - 1;

        let query = supabase
            .from("maintenance_records")
            .select(`
                *,
                vehicles!inner ( model_name, plate_number ),
                reporter:profiles!reported_by ( full_name ),
                mechanic:profiles!assigned_mechanic_id ( full_name )
            `, { count: "exact" });

        // Filter status
        if (status && status !== "all") {
            query = query.eq("status", status);
        }

        // Filter search yang diperbaiki untuk relasi Supabase
        if (search) {
            const { data: vehicleMatch} = await supabase
                .from("vehicles")
                .select("*")
                .or(`model_name.ilike.%${search}%,plate_number.ilike.%${search}%`);

            const vehicleIds = (vehicleMatch || []).map((v) => v.id);

            if (vehicleIds.length > 0) {
                query = query.or(
                `problem_description.ilike.%${search}%,action_taken.ilike.%${search}%,vehicle_id.in.(${vehicleIds.join(",")})`
                );
            } else {
                query = query.or(`problem_description.ilike.%${search}%,action_taken.ilike.%${search}%`);
            }
        }

        const { data, count, error } = await query
            .order("created_at", { ascending: false })
            .range(from, to);

        if (error) throw error;
        return {
            data,
            totalData: count || 0,
            totalPages: Math.ceil((count || 0) / limitNum),
            currentPage: pageNum,
        };
    },

    // Create maintenance record
    async create(payload) {
        const { data, error } = await supabase
            .from("maintenance_records")
            .insert([payload])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Update maintenance record
    async update(id, payload) {
        const { data, error } = await supabase
            .from("maintenance_records")
            .update(payload)
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Delete maintenance record
    async delete(id) {
        const { error } = await supabase
            .from("maintenance_records")
            .delete()
            .eq("id", id);

        if (error) throw error;
        return true;
    },
};