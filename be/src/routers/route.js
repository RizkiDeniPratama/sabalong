import express from "express";
import authRoutes from "./authRoutes.js";
import roleRoutes from "./roleRoutes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/roles", roleRoutes);

export default router;
