import { Router } from "express";
import { authenticateUser } from "../middlewares/authMiddleware.js";
import { getDashboardStats } from "../controllers/DashboardController.js";

const router = Router();

// Proteksi semua endpoint dashboard dengan middleware auth
router.use(authenticateUser);

// GET /api/dashboard
router.get("/", getDashboardStats);

export default router;