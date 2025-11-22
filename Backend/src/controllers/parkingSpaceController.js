import ParkingSpace from "../models/parkingSpaceModel.js";
import Floor from "../models/floorModel.js";
import ParkingSlot from "../models/parkingSlotModel.js";

export const getAllParkingSpaces = async (req, res) => {
  const spaces = await ParkingSpace.getAll();
  res.json(spaces);
};

export const getParkingWithFloors = async (req, res) => {
  const id = req.params.id;

  const space = await ParkingSpace.getById(id);
  if (!space) return res.status(404).json({ msg: "Parking space not found" });

  const floors = await Floor.getBySpaceId(id);

  res.json({ space, floors });
};

export const getSlotsForParking = async (req, res) => {
  const id = req.params.id;

  const slots = await ParkingSlot.getSlotsBySpace(id);
  res.json(slots);
};
