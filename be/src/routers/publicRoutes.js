import express from "express";
import * as publicController from "../controllers/publicController.js";

const router = express.Router();

router.get("/services", publicController.getPublicServices);
router.get("/feedbacks", publicController.getLatestFeedbacks);
router.get("/tracking/:ticket_number", publicController.trackTicket);

export default router;
