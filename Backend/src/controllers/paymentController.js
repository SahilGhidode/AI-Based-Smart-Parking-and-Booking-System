import Payment from "../models/paymentModel.js";

export const createPayment = async (req, res) => {
  try {
    const { booking_id, amount, payment_status } = req.body;
    const payment = await Payment.create(booking_id, amount, payment_status);
    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPaymentsByBooking = async (req, res) => {
  try {
    const { booking_id } = req.params;
    const payments = await Payment.getByBooking(booking_id);
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
