import { Router } from "express";
import { authenticateUser } from "../middlewares/authMiddleware.js";
import {
  generateCode,
  getAllSpareparts,
  createSparepart,
  updateSparepart,
  deleteSparepart
} from "../controllers/SparepartController.js";

const router = Router();

router.use(authenticateUser);

router.get("/generate-code", generateCode);
router.get("/", getAllSpareparts);
router.post("/", createSparepart);
router.put("/:id", updateSparepart);
router.delete("/:id", deleteSparepart);

export default router;