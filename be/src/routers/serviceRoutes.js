import express from "express";
import * as serviceController from "../controllers/serviceController.js";
import { authenticate, authorize } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

// Semua rute di bawah ini memerlukan login (authenticate)
router.get("/:id", serviceController.getServiceById);
router.use(authenticate);

// GET /api/roles - Bisa diakses semua role yang login
router.get("/", serviceController.getAllServices);

const serviceUpload = upload.fields([
  { name: "icon", maxCount: 1 },
  { name: "flowchart", maxCount: 1 },
  { name: "sop_file", maxCount: 1 },
]);

// POST, PUT, DELETE /api/roles - HANYA BISA DIAKSES ADMIN
router.post(
  "/",
  authorize("admin"),
  serviceUpload,
  serviceController.createService
);
router.put(
  "/:id",
  authorize("admin"),
  serviceUpload,
  serviceController.updateService
);
router.delete("/:id", authorize("admin"), serviceController.deleteService);

export default router;
