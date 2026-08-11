import { Router } from "express";
import { authenticateUser } from "../middlewares/authMiddleware.js";
import {
  getByMaintenanceRecord,
  createPartUsage,
  deletePartUsage
} from "../controllers/PartUsageController.js";

const router = Router();

router.use(authenticateUser);

router.get("/record/:recordId", getByMaintenanceRecord);
router.post("/", createPartUsage);
router.delete("/:id", deletePartUsage);

export default router;