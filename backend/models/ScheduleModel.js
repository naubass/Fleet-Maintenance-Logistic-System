import { supabase } from "../config/supabaseClient.js";

export const ScheduleModel = {
    async findAll({ page = 1, limit = 10, search = "", status = "all" }) {
        const pageNum = Number(page);
        const limitNum = Number(limit);
        const from = (pageNum - 1) * limitNum;
        const to = from + limitNum - 1;

        let query = supabase
        .from("preventive_schedules")
        .select(`
            *,
            vehicles!inner ( model_name, plate_number, current_mileage )
        `, { count: "exact" });

        // Filter status
        if (status && status !== "all") {
        query = query.eq("status", status);
        }

        // Filter search yang diperbaiki untuk relasi Supabase
        if (search) {
        query = query.or(
            `service_type.ilike.%${search}%,vehicles.model_name.ilike.%${search}%,vehicles.plate_number.ilike.%${search}%`
        );
        }

        const { data, count, error } = await query
        .order("created_at", { ascending: false })
        .range(from, to);

        if (error) {
        const { data: vehicleMatch } = await supabase
            .from("vehicles")
            .select("id")
            .or(`model_name.ilike.%${search}%,plate_number.ilike.%${search}%`);

        const vehicleIds = (vehicleMatch || []).map((v) => v.id);

        let fallbackQuery = supabase
            .from("preventive_schedules")
            .select(`
            *,
            vehicles!inner ( model_name, plate_number, current_mileage )
            `, { count: "exact" });

        if (status && status !== "all") {
            fallbackQuery = fallbackQuery.eq("status", status);
        }

        if (vehicleIds.length > 0) {
            fallbackQuery = fallbackQuery.or(
            `service_type.ilike.%${search}%,vehicle_id.in.(${vehicleIds.join(",")})`
            );
        } else {
            fallbackQuery = fallbackQuery.ilike("service_type", `%${search}%`);
        }

        const { data: fbData, count: fbCount, error: fbError } = await fallbackQuery
            .order("created_at", { ascending: false })
            .range(from, to);

        if (fbError) throw fbError;

        return {
            data: fbData,
            totalData: fbCount || 0,
            totalPages: Math.ceil((fbCount || 0) / limitNum),
            currentPage: pageNum,
        };
        }

        return {
        data,
        totalData: count || 0,
        totalPages: Math.ceil((count || 0) / limitNum),
        currentPage: pageNum,
        };
    },

    // Create preventive schedule
    async create(payload) {
        const { data, error } = await supabase
            .from("preventive_schedules")
            .insert([payload])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Update preventive schedule
    async update(id, payload) {
        const { data, error } = await supabase
            .from("preventive_schedules")
            .update(payload)
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Delete preventive schedule
    async delete(id) {
        const { error } = await supabase
            .from("preventive_schedules")
            .delete()
            .eq("id", id);

        if (error) throw error;
        return true;
    }
}
