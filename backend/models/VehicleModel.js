import { supabase } from "../config/supabaseClient.js";

export const VehicleModel = {
  async findAll({ page = 1, limit = 10, search = "", category = "all", status = "all" }) {
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    let query = supabase
      .from("vehicles")
      .select("*", { count: "exact" });

    // Filter Kategori
    if (category && category !== "all") {
      query = query.ilike("category", category);
    }

    // Filter Status
    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    // Filter Search (Model atau Plat)
    if (search) {
      query = query.or(`model_name.ilike.%${search}%,plate_number.ilike.%${search}%`);
    }

    const { data, count, error } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw error;

    return {
      data: data || [],
      totalData: count || 0,
      totalPages: Math.ceil((count || 0) / limitNum),
      currentPage: pageNum
    };
  },

  async create(payload) {
    const { data, error } = await supabase
      .from("vehicles")
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id, payload) {
    const { data, error } = await supabase
      .from("vehicles")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from("vehicles")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return true;
  }
};