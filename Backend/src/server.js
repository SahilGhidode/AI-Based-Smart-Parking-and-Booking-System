import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import pool from "./config/db.js"; // ensures DB connects

dotenv.config({ path: ".env" });

const app = express();
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

// Start server
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
