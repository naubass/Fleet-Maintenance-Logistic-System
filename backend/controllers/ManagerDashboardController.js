import { ManagerDashboardModel } from "../models/ManagerDashboardModel.js";
import { getOrSetCache } from "../utils/cacheHelper.js";

export const getManagerStats = async (req, res) => {
  try {
    const cacheKey = "dashboard:manager:summary";

    const stats = await getOrSetCache(cacheKey, async () => {
      return await ManagerDashboardModel.getManagerStats();
    }, 180); // Cache 3 menit

    return res.status(200).json({
      success: true,
      data: stats
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};