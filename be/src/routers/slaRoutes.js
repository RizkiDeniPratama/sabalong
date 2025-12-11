import express from "express";
import * as slaController from "../controllers/slaController.js";
import { authenticate, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Lindungi semua rute di bawah ini dengan autentikasi (harus login)
router.use(authenticate);

// GET /api/slas - Semua role yang login bisa melihat daftar SLA
router.get("/", slaController.getAllSlas);

// Hanya ADMIN yang bisa Create, Update, dan Delete
router.post("/", authorize("admin"), slaController.createSla);
router.put("/:id", authorize("admin"), slaController.updateSla);
router.delete("/:id", authorize("admin"), slaController.deleteSla);

// SLA Performance & Ranking (admin dan pimpinan)
router.get(
  "/ranking",
  authorize("admin", "pimpinan"),
  slaController.getPetugasSLARanking
);
router.get(
  "/response-performance",
  authorize("admin", "pimpinan"),
  slaController.getAdminResponsePerformance
);
router.get(
  "/petugas/:petugas_id/performance",
  authorize("admin", "pimpinan"),
  slaController.getPetugasSLAPerformance
);
router.get(
  "/ticket/:id",
  authorize("admin", "pimpinan", "petugas"),
  slaController.getTicketResolutionSLA
);

export default router;
