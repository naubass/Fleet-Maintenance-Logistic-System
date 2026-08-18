import { ActivityLogModel } from "../models/ActivityLogModel.js";

export const getAllActivityLogs = async (req, res) => {
  try {
    const { page, limit, search, entity, action } = req.query;

    const result = await ActivityLogModel.findAll({
      page: page || 1,
      limit: limit || 20,
      search: search || "",
      entity: entity || "all",
      action: action || "all"
    });

    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};