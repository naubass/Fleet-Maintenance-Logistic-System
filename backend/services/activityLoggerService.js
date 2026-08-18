import { supabase } from "../config/supabaseClient.js";

/**
 * Mencatat log aktivitas pengguna ke database
 * @param {Object} params
 * @param {string} params.userId - ID pengguna yang login
 * @param {string} params.action - CREATE | UPDATE | DELETE | LOGIN
 * @param {string} params.entity - VEHICLE | MAINTENANCE | SPAREPART | USER | SCHEDULE | BUDGET
 * @param {string} [params.entityId] - ID data yang dimanipulasi
 * @param {string} params.description - Uraian aktivitas
 * @param {Object} [params.req] - Objek express request (untuk ambil IP)
 */
export const logActivity = async ({ userId, action, entity, entityId = null, description, req = null }) => {
  try {
    const ipAddress = req ? (req.headers["x-forwarded-for"] || req.socket.remoteAddress || null) : null;

    await supabase.from("activity_logs").insert([
      {
        user_id: userId || null,
        action: action.toUpperCase(),
        entity: entity.toUpperCase(),
        entity_id: entityId ? String(entityId) : null,
        description,
        ip_address: ipAddress
      }
    ]);
  } catch (err) {
    console.error("Gagal mencatat log aktivitas:", err.message);
  }
};