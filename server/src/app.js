// src/app.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import prisma from "./config/prisma.js";
import { errorHandler } from "./middlewares/errHandler.js";
import { notFoundHandler } from "./middlewares/notFoundHandler.js";

dotenv.config();

const app = express();

// --- Middlewares ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

// --- Database connection test (optional) ---
// async function testDbConnection() {
//   try {
//     await prisma.$queryRaw`SELECT 1`;
//     console.log("✅ Database connection successful!");
//   } catch (error) {
//     console.error("❌ Failed to connect to the database:", error.message);
//     process.exit(1);
//   }
// }
// testDbConnection();

// --- Root route ---
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Helpdesk API is running 🚀",
    version: "1.0.0",
  });
});

// --- Example routes (add later) ---
// import authRoutes from "./routes/auth.routes.js";
// app.use("/api/auth", authRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
