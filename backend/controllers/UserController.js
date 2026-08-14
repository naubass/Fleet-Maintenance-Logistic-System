import { UserModel } from "../models/UserModel.js";
import { getOrSetCache, invalidateCache } from "../utils/cacheHelper.js";

// GET /api/users 
export const getAllUsers = async (req, res) => {
  try {
    const { page, limit, search, role } = req.query;

    // Cache key unik mencakup parameter pagination, search, dan filter role
    const cacheKey = `users:list:p${page || 1}:l${limit || 10}:s${search || "all"}:r${role || "all"}`;

    const result = await getOrSetCache(cacheKey, async () => {
      return await UserModel.findAll({
        page: page || 1,
        limit: limit || 10,
        search: search || "",
        role: role || "all"
      });
    }, 300); // Disimpan di Redis selama 300 detik (5 menit)

    return res.status(200).json({ 
      success: true, 
      data: result.data,
      totalData: result.totalData,
      totalPages: result.totalPages,
      currentPage: result.currentPage
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/users 
export const createUser = async (req, res) => {
  try {
    const { email, password, full_name, role, phone } = req.body;

    if (!email || !password || !full_name) {
      return res.status(400).json({
        success: false,
        message: "Email, password, dan nama lengkap wajib diisi."
      });
    }

    const data = await UserModel.create({
      email,
      password,
      full_name,
      role: role || 'mechanic',
      phone
    });

    // Invalidate cache list umum dan list dropdown mekanik
    await invalidateCache([
      "users:list:p1:l10:sall:rall",
      "users:list:p1:l10:sall:rmechanic"
    ]);

    return res.status(201).json({
      success: true,
      data,
      message: "Pengguna baru berhasil dibuat."
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

// PUT /api/users/:id 
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, role, phone } = req.body;

    if (!full_name) {
      return res.status(400).json({ success: false, message: "Nama lengkap wajib diisi." });
    }

    const data = await UserModel.update(id, { full_name, role, phone });

    // Invalidate cache list dan cache user spesifik
    await invalidateCache([
      "users:list:p1:l10:sall:rall",
      "users:list:p1:l10:sall:rmechanic",
      `users:${id}`
    ]);

    return res.status(200).json({
      success: true,
      data,
      message: "Data pengguna berhasil diperbarui."
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE /api/users/:id 
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await UserModel.delete(id);

    // Invalidate cache list agar data terhapus langsung hilang dari UI & dropdown
    await invalidateCache([
      "users:list:p1:l10:sall:rall",
      "users:list:p1:l10:sall:rmechanic",
      `users:${id}`
    ]);

    return res.status(200).json({
      success: true,
      message: "Pengguna berhasil dihapus."
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};