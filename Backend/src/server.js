// ✅ Load environment variables first
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// 🗂 Resolve correct .env path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") }); // 👈 one level up

// 🚀 Core Imports
import express from "express";
import cors from "cors";
import pool from "./config/db.js"; // PostgreSQL connection
import http from "http";
import { Server as IOServer } from "socket.io";

// 🧩 Route Imports
import authRoutes from "./routes/authRoutes.js";
import otpRoutes from "./routes/otpRoutes.js";
import vehicleRoutes from "./routes/vehicleRoutes.js";
import parkingSpaceRoutes from "./routes/parkingSpaceRoutes.js";
import floorRoutes from "./routes/floorRoutes.js";
import parkingSlotRoutes from "./routes/parkingSlotRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

// ✅ Initialize Express App
const app = express();

// 🌍 Middleware
app.use(cors({
    origin: "*",
    credentials: true,
  }));
app.use(express.json());

// 🧭 Base Routes
app.use("/api/auth", authRoutes); // User authentication
app.use("/api/verify", otpRoutes); // OTP verification
app.use("/api/vehicles", vehicleRoutes); // Vehicle routes
app.use("/api/parking-spaces", parkingSpaceRoutes); // Parking space routes
app.use("/api/floors", floorRoutes); // Floor routes
app.use("/api/slots", parkingSlotRoutes); // Parking slot routes (with updates)
app.use("/api/bookings", bookingRoutes); // Booking routes
app.use("/api/payments", paymentRoutes); // Payment routes

// 🏠 Default route
app.get("/", (req, res) => {
  res.send("🚗 Smart Parking System Backend is running successfully!");
});

// ⚙️ Create HTTP server (Required for Socket.IO)
const server = http.createServer(app);

// 🔥 Initialize Socket.IO
export const io = new IOServer(server, {
  cors: {
    origin: "*", // ⚠️ frontend URL for production
    methods: ["GET", "POST", "PATCH"],
  },
});

// 🛜 Socket.IO Events
io.on("connection", (socket) => {
  console.log("🔌 Client connected:", socket.id);

  socket.on("joinFloor", (floorId) => {
    socket.join(`floor_${floorId}`);
    console.log(`📡 Client joined floor room: floor_${floorId}`);
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

// 🚦 Test DB Connection on Startup
(async () => {
  try {
    const client = await pool.connect();
    console.log("✅ PostgreSQL connected successfully!");
    client.release();
  } catch (err) {
    console.error("❌ PostgreSQL connection failed:", err.message);
  }
})();

// ⚙️ Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log("SMTP_USER:", process.env.SMTP_USER);
  console.log("SMTP_PASS:", process.env.SMTP_PASS ? "Loaded ✅" : "Missing ❌");
});
