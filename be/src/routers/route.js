import express from "express";
import authRoutes from "./authRoutes.js";
import roleRoutes from "./roleRoutes.js";
import skillRoutes from "./skillRoutes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/roles", roleRoutes);
router.use("/skills", skillRoutes);

export default router;
