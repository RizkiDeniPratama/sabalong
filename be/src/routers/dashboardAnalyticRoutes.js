import express from "express";
import * as dashboardAnalyticController from "../controllers/dashboardAnalyticController.js";
import { authenticate, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authenticate);

router.get(
  "/",
  authorize("admin", "petugas"),
  dashboardAnalyticController.getDashboardAnalytics
);

export default router;
