import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const prisma = new PrismaClient();

// Create an Express application
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// FUNGSI UNTUK MENGETES KONEKSI DATABASE
async function testDbConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("✅ Database connection successful!");
  } catch (error) {
    console.error("❌ Failed to connect to the database.");
    console.error(error);
    process.exit(1);
  }
}

testDbConnection();

// Main route
app.get("/", (req, res) => {
  res.send("Hello, World from the API!");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// export default app;
