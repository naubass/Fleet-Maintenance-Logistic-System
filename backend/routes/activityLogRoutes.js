import express from "express";
import { getAllActivityLogs } from "../controllers/ActivityLogController.js";
import { authenticateUser, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Hanya role 'admin' yang dapat mengakses Log Aktivitas
router.use(authenticateUser, authorizeRoles("admin"));

router.get("/", getAllActivityLogs);

export default router;