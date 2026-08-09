import { supabase } from "../config/supabaseClient.js";

export const authenticateUser = async (req, res, next) => {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, message: "Akses ditolak token tidak ditemukan" });
    }

    const token = authHeader.split(" ")[1]

    try {
        const { data: { user }, error } = await supabase.auth.getUser(token)

        if (error || !user) {
            return res.status(401).json({ success: false, message: "Akses ditolak token tidak valid" });
        }

        // Ambil roles dari data profiles
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("full_name, role")
            .eq("id", user.id)
            .single();

        if (profileError) {
            return res.status(400).json({ success: false, message: "Profile user tidak ditemukan di database" });
        }
        
        req.user = {
            id: user.id,
            email: user.email,
            full_name: profile?.full_name,
            role: profile?.role
        };

        next();
    } catch (err) {
        return res.status(500).json({ 
            success: false, 
            message: err.message || "Terjadi kesalahan pada server" 
        });
    }
}

export const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: "Akses ditolak: Anda tidak memiliki wewenang" 
            });
        }
        next();
    };
};