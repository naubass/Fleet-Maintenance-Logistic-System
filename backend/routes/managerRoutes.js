import express from "express";
import { getManagerStats } from "../controllers/ManagerDashboardController.js";
import { authenticateUser, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Role 'manager' dan 'admin' diizinkan mengakses dashboard analitik ini
router.get("/dashboard", authenticateUser, authorizeRoles("manager", "admin"), getManagerStats);

export default router;