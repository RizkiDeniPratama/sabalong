// src/app.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { errorHandler } from "./middlewares/errHandler.js";
import { notFoundHandler } from "./middlewares/notFoundHandler.js";
import routes from "./routers/route.js";

dotenv.config();

const app = express();

// --- Middlewares ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

// --- Root route ---
app.use("/api", routes);
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Helpdesk API is running 🚀",
    version: "1.0.0",
  });
});

// --- Error handlers ---
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
