// backend/config/supabaseClient.js
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
// PASTIKAN menggunakan SERVICE_ROLE_KEY agar bisa bypass RLS
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; 

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});