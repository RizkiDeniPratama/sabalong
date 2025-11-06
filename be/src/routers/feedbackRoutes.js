import express from "express";
import * as feedbackController from "../controllers/feedbackController.js";
import { authenticate, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authenticate);

router.get(
  "/",
  authorize("admin", "petugas"),
  feedbackController.getAllFeedbacks
);
router.post("/", authorize("user"), feedbackController.createFeedback);
// router.put("/:id", authorize("user"), feedbackController.updateRole);
// router.delete("/:id", authorize("user"), feedbackController.deleteRole);

export default router;
