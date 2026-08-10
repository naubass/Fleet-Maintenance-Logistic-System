import { Router } from "express";
import { authenticateUser } from "../middlewares/authMiddleware.js";

import {
    getAllRecords,
    createRecord,
    updateRecord,
    deleteRecord
} from "../controllers/MaintenanceRecordController.js";

const router = Router();

router.use(authenticateUser);

router.get("/", getAllRecords);
router.post("/", createRecord);
router.put("/:id", updateRecord);
router.delete("/:id", deleteRecord);

export default router;