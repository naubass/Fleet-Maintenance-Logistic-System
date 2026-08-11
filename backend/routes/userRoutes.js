import { Router } from "express";
import { authenticateUser } from "../middlewares/authMiddleware.js";
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser
} from "../controllers/UserController.js";

const router = Router();

router.use(authenticateUser);

router.get("/", getAllUsers);
router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;