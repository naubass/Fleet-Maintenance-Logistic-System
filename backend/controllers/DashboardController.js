import { DashboardModel } from "../models/DashboardModel.js";
import { getOrSetCache } from "../utils/cacheHelper.js";

export const getDashboardStats = async (req, res) => {
  try {
    const cacheKey = "dashboard:stats:summary";

    // Cache agregasi selama 180 detik (3 menit)
    const stats = await getOrSetCache(cacheKey, async () => {
      return await DashboardModel.getStats();
    }, 180);

    return res.status(200).json({
      success: true,
      data: stats
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};