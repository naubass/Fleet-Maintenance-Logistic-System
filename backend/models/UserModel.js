import { supabase } from "../config/supabaseClient.js";

export const UserModel = {
    // Parameter disamakan menggunakan 'role' (bukan status)
    async findAll({ page = 1, limit = 10, search = "", role = "all" }) {
        const pageNum = Number(page);
        const limitNum = Number(limit);
        const from = (pageNum - 1) * limitNum;
        const to = from + limitNum - 1;

        let query = supabase
            .from("profiles")
            .select("*", { count: "exact" });
        
        // Filter Role (Case insensitive)
        if (role && role !== "all") {
            query = query.eq("role", role.toLowerCase());
        }

        // Filter Search (Hanya full_name & phone karena 'email' ada di auth.users)
        if (search) {
            query = query.or(`full_name.ilike.%${search}%,phone.ilike.%${search}%`);
        }

        const { data, count, error } = await query
            .order("created_at", { ascending: false })
            .range(from, to);
        
        if (error) throw error;
        
        // Return key disamakan: totalData, totalPages, currentPage
        return { 
            data: data || [], 
            totalData: count || 0, 
            totalPages: Math.ceil((count || 0) / limitNum) || 1, 
            currentPage: pageNum 
        };
    },

    // Create User (Auth Admin API + Profiles Table)
    async create({ email, password, full_name, role, phone }) {
        // Buat user di Auth
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name, role: role || 'mechanic' }
        });

        if (authError) throw authError;

        const userId = authData.user?.id;
        if (!userId) throw new Error("Gagal mendapatkan User ID.");

        // Simpan ke tabel profiles
        const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .upsert([{
                id: userId,
                full_name,
                role: role || 'mechanic',
                phone: phone || null,
                updated_at: new Date().toISOString()
            }])
            .select()
            .single();

        // Rollback otomatis jika tabel profiles gagal menyimpan
        if (profileError) {
            await supabase.auth.admin.deleteUser(userId);
            throw profileError;
        }

        return profileData;
    },
    
    // Update User
    async update(id, { full_name, role, phone }) {
        const { data, error } = await supabase
            .from("profiles")
            .update({
                full_name,
                role,
                phone: phone || null,
                updated_at: new Date().toISOString()
            })
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Delete User
    async delete(id) {
        // Hapus user dari Supabase Auth 
        const { error: authError } = await supabase.auth.admin.deleteUser(id);
        if (authError) {
            console.error("Gagal menghapus dari Auth, mencoba hapus profil:", authError.message);
        }

        // Hapus baris dari tabel profiles 
        const { error: profileError } = await supabase
            .from("profiles")
            .delete()
            .eq("id", id);
        
        if (profileError) throw profileError;
        return true;
    }
};