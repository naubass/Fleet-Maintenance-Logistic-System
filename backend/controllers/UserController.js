import { UserModel } from "../models/UserModel.js";

// GET /api/users
export const getAllUsers = async (req, res) => {
  try {
    const { page, limit, search, role } = req.query;
    
    // Meneruskan 'role' ke Model
    const result = await UserModel.findAll({
      page: page || 1,
      limit: limit || 10,
      search: search || "",
      role: role || "all"
    });

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

    return res.status(200).json({
      success: true,
      message: "Pengguna berhasil dihapus."
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};