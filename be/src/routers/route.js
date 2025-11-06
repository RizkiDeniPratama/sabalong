import express from "express";
import authRoutes from "./authRoutes.js";
import roleRoutes from "./roleRoutes.js";
import skillRoutes from "./skillRoutes.js";
import slaRoute from "./slaRoutes.js";
import serviceRoutes from "./serviceRoutes.js";
import userRoutes from "./userRoutes.js";
import ticketRoutes from "./ticketRoutes.js";
import feedbackRoutes from "./feedbackRoutes.js";
import notifRoutes from "./notifRoutes.js";
import dashboardAnalyticRoutes from "./dashboardAnalyticRoutes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/roles", roleRoutes);
router.use("/skills", skillRoutes);
router.use("/slas", slaRoute);
router.use("/services", serviceRoutes);
router.use("/users", userRoutes);
router.use("/tickets", ticketRoutes);
router.use("/feedbacks", feedbackRoutes);
router.use("/notifications", notifRoutes);
router.use("/dashboard-analytics", dashboardAnalyticRoutes);

export default router;
