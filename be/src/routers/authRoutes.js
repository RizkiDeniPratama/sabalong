import express from "express";
import * as authController from "../controllers/authController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

// router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authenticate, authController.logout); // Logout butuh token

export default router;
