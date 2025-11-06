import express from "express";
import * as serviceController from "../controllers/serviceController.js";
import { authenticate, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Semua rute di bawah ini memerlukan login (authenticate)
router.use(authenticate);

// GET /api/roles - Bisa diakses semua role yang login
router.get("/", serviceController.getAllServices);
router.get("/:id", serviceController.getServiceById);

// POST, PUT, DELETE /api/roles - HANYA BISA DIAKSES ADMIN
router.post("/", authorize("admin"), serviceController.createService);
router.put("/:id", authorize("admin"), serviceController.updateService);
router.delete("/:id", authorize("admin"), serviceController.deleteService);

export default router;
