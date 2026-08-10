import { Router } from "express";
import { authenticateUser } from "../middlewares/authMiddleware.js";
import {
  getAllVehicles,
  createVehicles,
  updateVehicles,
  deleteVehicles
} from "../controllers/VehicleController.js";

const router = Router(); 

router.use(authenticateUser);

router.get("/", getAllVehicles);
router.post("/", createVehicles);
router.put("/:id", updateVehicles);
router.delete("/:id", deleteVehicles);

export default router; 