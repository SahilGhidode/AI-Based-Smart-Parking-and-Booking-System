import Vehicle from "../models/vehicleModel.js";

export const addVehicle = async (req, res) => {
  try {
    const userId = req.user.id;
    const { vehicleNumber, vehicleType } = req.body;

    if (!vehicleNumber || !vehicleType) {
      return res.status(400).json({ message: "Vehicle number and type are required" });
    }

    const vehicle = await Vehicle.create(
      userId,
      vehicleNumber,
      vehicleType
    );

    res.status(201).json({
      message: "Vehicle added successfully",
      vehicle,
    });

  } catch (error) {
    console.error("Error adding vehicle:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getUserVehicles = async (req, res) => {
  try {
    const userId = req.user.id;
    const vehicles = await Vehicle.getByUser(userId);

    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
