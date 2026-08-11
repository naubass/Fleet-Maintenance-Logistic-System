import { supabase } from "../config/supabaseClient.js";

export const SparepartModel = {
  async findAll({ page = 1, limit = 10, search = "", category = "all" }) {
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    let query = supabase
      .from("spareparts")
      .select("*", { count: "exact" });

    if (category && category !== "all") {
      query = query.eq("category", category);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,part_number.ilike.%${search}%,supplier.ilike.%${search}%`);
    }

    const { data, count, error } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw error;

    return {
      data: data || [],
      totalData: count || 0,
      totalPages: Math.ceil((count || 0) / limitNum) || 1,
      currentPage: pageNum
    };
  },

  async create(payload) {
    const { data, error } = await supabase
      .from("spareparts")
      .insert([{
        part_number: payload.part_number,
        name: payload.name,
        category: payload.category || 'Umum',
        stock: Number(payload.stock) || 0,
        min_stock: Number(payload.min_stock) || 5,
        unit: payload.unit || 'Pcs',
        unit_price: Number(payload.unit_price) || 0,
        supplier: payload.supplier || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id, payload) {
    const { data, error } = await supabase
      .from("spareparts")
      .update({
        part_number: payload.part_number,
        name: payload.name,
        category: payload.category || 'Umum',
        stock: Number(payload.stock) || 0,
        min_stock: Number(payload.min_stock) || 5,
        unit: payload.unit || 'Pcs',
        unit_price: Number(payload.unit_price) || 0,
        supplier: payload.supplier || null,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from("spareparts")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return true;
  }
};