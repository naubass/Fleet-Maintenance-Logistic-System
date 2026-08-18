import { supabase } from "../config/supabaseClient.js";

export const ActivityLogModel = {
  async findAll({ page = 1, limit = 20, search = "", entity = "all", action = "all" }) {
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    let query = supabase
      .from("activity_logs")
      .select(`
        id,
        action,
        entity,
        entity_id,
        description,
        ip_address,
        created_at,
        user:profiles!user_id ( full_name, role )
      `);

    // Filter Entitas
    if (entity && entity !== "all") {
      query = query.eq("entity", entity.toUpperCase());
    }

    // Filter Aksi
    if (action && action !== "all") {
      query = query.eq("action", action.toUpperCase());
    }

    // Filter Search Text
    if (search) {
      query = query.ilike("description", `%${search}%`);
    }

    const { data, error } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw error;

    return {
      data: data || [],
      currentPage: pageNum,
      limit: limitNum
    };
  }
};