import express from "express";
import authRoutes from "./authRoutes.js";
import roleRoutes from "./roleRoutes.js";
import skillRoutes from "./skillRoutes.js";
import slaRoute from "./slaRoutes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/roles", roleRoutes);
router.use("/skills", skillRoutes);
router.use("/slas", slaRoute);

export default router;
