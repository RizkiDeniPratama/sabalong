import app from "./src/app.js";
import doteenv from "dotenv";

doteenv.config();

// Create an Express application
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📚 API Docs: http://localhost:${port}/api-docs`);
});
