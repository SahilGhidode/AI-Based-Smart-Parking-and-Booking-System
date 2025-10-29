import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import sequelize from "./config/db.js";
import authRoutes from "./routes/authRoutes.js"; // 🧩 import routes

// Load environment variables
dotenv.config({ path: ".env.local" });

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Default route
app.get("/", (req, res) => {
  res.send("🚗 Smart Parking Backend Running Successfully!");
});

// Authentication routes
app.use("/api/auth", authRoutes); // 🛠️ add API endpoints

// Port config
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");
    await sequelize.sync();
    console.log("✅ Tables synchronized");
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
  }

  console.log(`🚀 Server running on port ${PORT}`);
});
