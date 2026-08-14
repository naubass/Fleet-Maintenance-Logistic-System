import { redis } from "../config/redisClient.js";

// Mengambil dari Redis atau Query Database
export const getOrSetCache = async (key, fetchCallback, ttl = 300) => {
  try {
    const cachedData = await redis.get(key);

    if (cachedData !== null && cachedData !== undefined) {
      return typeof cachedData === "string" ? JSON.parse(cachedData) : cachedData;
    }

    // Cache miss, fetch from DB
    const freshData = await fetchCallback();

    if (freshData !== null && freshData !== undefined) {
      await redis.set(key, JSON.stringify(freshData), { ex: ttl });
    }

    return freshData;
  } catch (err) {
    console.error("Redis Error (Fallback to DB):", err);
    return await fetchCallback();
  }
};

// Hapus cache berdasarkan key 
export const invalidateCache = async (keys = []) => {
  try {
    const targetKeys = Array.isArray(keys) ? keys : [keys];

    if (targetKeys.length > 0 && targetKeys[0]) {
      await redis.del(...targetKeys);
    }
  } catch (err) {
    console.error("Redis Invalidate Error:", err);
  }
};