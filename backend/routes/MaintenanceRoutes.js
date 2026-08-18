import { Router } from "express";
import { authenticateUser, authorizeRoles } from "../middlewares/authMiddleware.js";

import {
  getAllRecords,
  createRecord,
  updateRecord,
  deleteRecord
} from "../controllers/MaintenanceRecordController.js";

const router = Router();

// Wajib login untuk semua endpoint
router.use(authenticateUser);

// Tinjau Catatan (Admin, Manager, Mechanic)
router.get("/", authorizeRoles("admin", "manager", "mechanic"), getAllRecords);

// Buat Catatan (Admin & Mechanic)
router.post("/", authorizeRoles("admin", "mechanic"), createRecord);

// Update Catatan (Admin & Mechanic)
router.put("/:id", authorizeRoles("admin", "mechanic"), updateRecord);

// Hapus Catatan (Hanya Admin)
router.delete("/:id", authorizeRoles("admin"), deleteRecord);

export default router;