import express from "express";
import * as notifController from "../controllers/notifController.js";
import { authenticate, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authenticate);

// GET /api/notifications - Dapat notifikasi milik sendiri
router.get("/", notifController.getAllNotifications);

router.put("/read-all", notifController.markAllAsRead);
router.put("/:id/read", notifController.markAsRead);

export default router;
