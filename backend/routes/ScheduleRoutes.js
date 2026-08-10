import { Router } from "express";
import { authenticateUser } from "../middlewares/authMiddleware.js";
import {
    getAllSchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule
} from "../controllers/ScheduleController.js";

const router = Router();

router.use(authenticateUser);

router.get("/", getAllSchedules);
router.post("/", createSchedule);
router.put("/:id", updateSchedule);
router.delete("/:id", deleteSchedule);

export default router;