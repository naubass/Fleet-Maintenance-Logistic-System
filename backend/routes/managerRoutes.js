import express from "express";
import { getManagerStats } from "../controllers/ManagerDashboardController.js";
import { 
  getBudgetThreshold, 
  setBudgetThreshold, 
  exportMaintenanceReport 
} from "../controllers/ManagerActionsController.js";
import { authenticateUser, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authenticateUser, authorizeRoles("manager", "admin"));

router.get("/dashboard", getManagerStats);
router.get("/budget-threshold", getBudgetThreshold);
router.post("/budget-threshold", setBudgetThreshold);
router.get("/export/maintenance", exportMaintenanceReport);

export default router;