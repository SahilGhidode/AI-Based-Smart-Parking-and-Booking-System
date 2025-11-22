import express from "express";
import { createPayment, getPaymentsByBooking } from "../controllers/paymentController.js";

const router = express.Router();

// ✅ Create new payment
router.post("/add", createPayment);

// ✅ Get payment details for a booking
router.get("/:booking_id", getPaymentsByBooking);

export default router;
