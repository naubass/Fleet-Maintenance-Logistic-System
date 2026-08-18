import { Router } from "express";
import { supabase } from "../config/supabaseClient.js";
import { authenticateUser } from "../middlewares/authMiddleware.js";
import { logActivity } from "../services/activityLoggerService.js";

const router = Router();

// Endpoint Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    return res.status(400).json({ success: false, message: error.message });
  }

  // Ambil roles dari data profiles
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .single();
  
  if (profileError) {
    return res.status(400).json({ success: false, message: "Profile user tidak ditemukan di database" });
  }

  // Catat Log Aktivitas LOGIN
  await logActivity({
    userId: data.user.id,
    action: "LOGIN",
    entity: "USER",
    entityId: data.user.id,
    description: `${profile?.full_name || email} berhasil masuk ke sistem (${profile?.role || 'user'})`,
    req
  });

  return res.status(200).json({
    success: true,
    token: data.session.access_token,
    user: { ...data.user, profile }
  });
});

// Endpoint cek profile aktif
router.get('/me', authenticateUser, async (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user
  });
});

export default router;