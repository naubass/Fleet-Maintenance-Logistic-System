import { supabase } from "../config/supabaseClient.js";

export const VehicleModel = {
  // Ambil semua data
  async findAll() {
    const { data, error } = await supabase
      .from("vehicles")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  // Tambah data baru
  async create(payload) {
    const { data, error } = await supabase
      .from("vehicles")
      .insert([payload])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Update data
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

  // Hapus data
  async delete(id) {
    const { error } = await supabase
      .from("vehicles")
      .delete()
      .eq("id", id);
    if (error) throw error;
    return true;
  }
};