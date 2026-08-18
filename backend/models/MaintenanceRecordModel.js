import { supabase } from "../config/supabaseClient.js";

export const MaintenanceRecordModel = {
  async findAll({ page = 1, limit = 10, search = "", status = "all", startDate = "", endDate = "", mechanicId = "" }) {
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    let query = supabase
      .from("maintenance_records")
      .select(`
        id,
        problem_description,
        action_taken,
        mileage_at_service,
        labor_cost,
        total_cost,
        status,
        started_at,
        created_at,
        vehicles!inner ( id, model_name, plate_number ),
        mechanic:profiles!assigned_mechanic_id ( full_name )
      `);

    // Filter Mekanik Spesifik
    if (mechanicId && mechanicId !== "all") {
      query = query.eq("assigned_mechanic_id", mechanicId);
    }

    // Filter Status
    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    // Filter Rentang Tanggal
    if (startDate) {
      query = query.gte("started_at", startDate);
    }
    if (endDate) {
      query = query.lte("started_at", `${endDate}T23:59:59`);
    }

    // Filter Search Aman & Cepat
    if (search) {
      query = query.or(`problem_description.ilike.%${search}%,action_taken.ilike.%${search}%`);
    }

    const { data, count, error } = await query
      .order("started_at", { ascending: false, nullsFirst: false })
      .range(from, to);

    if (error) throw error;

    return {
      data: data || [],
      totalData: count || (data ? data.length : 0),
      totalPages: Math.ceil((count || 0) / limitNum) || 1,
      currentPage: pageNum,
    };
  },

  async create(payload) {
    const { data, error } = await supabase
      .from("maintenance_records")
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

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

  async delete(id) {
    const { error } = await supabase
      .from("maintenance_records")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return true;
  }
};