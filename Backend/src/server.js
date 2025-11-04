// ✅ Load environment variables first
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// ✅ resolve correct .env path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") }); // 👈 one level up



import express from "express";
import cors from "cors";
import pool from "./config/db.js"; // ✅ PostgreSQL pool import

import authRoutes from "./routes/authRoutes.js";
import otpRoutes from "./routes/otpRoutes.js"; // ✅ OTP routes

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/verify", otpRoutes); // ✅ OTP verify routes

// Default route
app.get("/", (req, res) => {
  res.send("🚀 Smart Parking System Backend is running...");
});

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>{
 console.log(`✅ Server running on port ${PORT}`)
  console.log("SMTP_USER:", process.env.SMTP_USER);
console.log("SMTP_PASS:", process.env.SMTP_PASS ? "Loaded ✅" : "Missing ❌");

});
