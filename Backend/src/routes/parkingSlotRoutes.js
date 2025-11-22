import express from "express";
import {
  addParkingSlot,
  getSlotsByFloor,
  updateSlotStatus
} from "../controllers/parkingSlotController.js";

const router = express.Router();

router.post("/add", addParkingSlot);
router.get("/floor/:floor_id", getSlotsByFloor);
router.patch("/update", updateSlotStatus);

export default router;
