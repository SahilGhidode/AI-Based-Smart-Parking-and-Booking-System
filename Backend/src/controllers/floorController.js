import ParkingSlot from "../models/parkingSlotModel.js";

export const getFloorSlots = async (req, res) => {
  const floor_id = req.params.id;
  const slots = await ParkingSlot.getSlotsByFloor(floor_id);
  res.json(slots);
};
