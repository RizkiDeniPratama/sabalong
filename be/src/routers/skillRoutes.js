import express from "express";
import * as skillController from "../controllers/skillController.js";
import { authenticate, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Semua rute di bawah ini memerlukan login (authenticate)
router.use(authenticate);

// GET /api/roles - Bisa diakses semua role yang login
router.get("/", skillController.getAllSkills);
router.get("/:id", skillController.getSkillById);

// POST, PUT, DELETE /api/roles - HANYA BISA DIAKSES ADMIN
router.post("/", authorize("admin"), skillController.createSkill);
router.put("/:id", authorize("admin"), skillController.updateSkill);
router.delete("/:id", authorize("admin"), skillController.deleteSkill);

export default router;
