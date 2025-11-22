import Booking from "../models/bookingModel.js";

export const createBooking = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { spot_id, start_time, end_time } = req.body;
    const booking = await Booking.create(user_id, spot_id, start_time, end_time);
    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserBookings = async (req, res) => {
  try {
    const user_id = req.user.id;
    const bookings = await Booking.getByUser(user_id);
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
