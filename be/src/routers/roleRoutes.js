import express from "express";
import * as roleController from "../controllers/roleController.js";
import { authenticate, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Semua rute di bawah ini memerlukan login (authenticate)
router.use(authenticate);

// GET /api/roles - Bisa diakses semua role yang login
router.get("/", roleController.getAllRoles);

// POST, PUT, DELETE /api/roles - HANYA BISA DIAKSES ADMIN
router.post("/", authorize("admin"), roleController.createRole);
router.put("/:id", authorize("admin"), roleController.updateRole);
router.delete("/:id", authorize("admin"), roleController.deleteRole);

export default router;
