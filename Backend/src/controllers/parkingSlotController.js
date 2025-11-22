import ParkingSlot from "../models/parkingSlotModel.js";
import { io } from "../server.js";  // 🔥 import socket.io instance

// ===============================
// 1️⃣ Add Parking Slot (Optional API)
// ===============================
export const addParkingSlot = async (req, res) => {
  try {
    const { space_id, floor_id, slot_number, is_occupied = false } = req.body;

    const slot = await ParkingSlot.create(space_id, floor_id, slot_number, is_occupied);

    return res.status(201).json(slot);
  } catch (error) {
    console.error("❌ addParkingSlot error:", error);
    return res.status(500).json({ message: error.message });
  }
};

// ===============================
// 2️⃣ Get all slots of a floor
// ===============================
export const getSlotsByFloor = async (req, res) => {
  try {
    const { floor_id } = req.params;

    const slots = await ParkingSlot.getByFloor(floor_id);

    return res.json(slots);
  } catch (error) {
    console.error("❌ getSlotsByFloor error:", error);
    return res.status(500).json({ message: error.message });
  }
};

// ===============================
// 3️⃣ Real-time slot status update
// ===============================
export const updateSlotStatus = async (req, res) => {
  try {
    const { slot_id, status } = req.body;

    if (!slot_id || !status) {
      return res.status(400).json({ message: "slot_id and status are required" });
    }

    // 🔥 Update DB Slot (Model function you will add)
    const updatedSlot = await ParkingSlot.updateStatus(slot_id, status);

    if (!updatedSlot) {
      return res.status(404).json({ message: "Slot not found" });
    }

    // 🔥 Send to ALL connected clients
    io.emit("slot:update", updatedSlot);

    // 🔥 Send ONLY to clients watching this floor
    io.to(`floor_${updatedSlot.floor_id}`).emit("slot:update", updatedSlot);

    return res.json({
      message: "Slot updated",
      slot: updatedSlot,
    });

  } catch (error) {
    console.error("❌ updateSlotStatus error:", error);
    return res.status(500).json({ message: error.message });
  }
};
