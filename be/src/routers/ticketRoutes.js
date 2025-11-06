import express from "express";
import * as ticketController from "../controllers/ticketController.js";
import { authenticate, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authenticate);

// --- CREATE ---
router.post("/", authorize("user"), ticketController.createTicket);

// --- READ ---
router.get("/", ticketController.getAllTickets);
router.get("/:id", ticketController.getTicketById);

// --- UPDATE (ACTIONS) ---

router.put("/:id/assign", authorize("admin"), ticketController.assignTicket);
router.put(
  "/:id/status",
  authorize("admin", "petugas"),
  ticketController.updateTicketStatus
);
router.put(
  "/:id/escalate",
  authorize("petugas"),
  ticketController.escalateTicket
);
router.post(
  "/:id/logs",
  authorize("admin", "petugas", "user"),
  ticketController.addTicketLog
);

export default router;
