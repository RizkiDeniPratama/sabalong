import express from "express";
import * as userController from "../controllers/userController.js";
import { authenticate, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Lindungi semua rute di bawah ini dengan autentikasi (harus login)
router.use(authenticate);

router.get("/", userController.getAllUsers);
router.get("/:id", authorize("admin", "petugas"), userController.getUserById);
router.get("/profile", userController.getProfile);

// Hanya ADMIN yang bisa Create, Update, dan Delete
router.post("/", authorize("admin"), userController.createUser);
router.put("/:id", authorize("admin"), userController.updateUser);
router.delete("/:id", authorize("admin"), userController.deleteUser);

export default router;
