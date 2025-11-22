import express from "express";
import { createBooking, getUserBookings } from "../controllers/bookingController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Create new booking
router.post("/add", verifyToken, createBooking);

// ✅ Get all bookings of a user
router.get("/", verifyToken, getUserBookings);

export default router;
