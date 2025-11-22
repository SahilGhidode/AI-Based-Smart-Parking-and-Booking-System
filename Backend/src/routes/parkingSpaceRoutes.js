import express from "express";
import { 
  getAllParkingSpaces, 
  getParkingWithFloors, 
  getSlotsForParking 
} from "../controllers/parkingSpaceController.js";

const router = express.Router();

router.get("/", getAllParkingSpaces);
router.get("/:id", getParkingWithFloors);
router.get("/:id/slots", getSlotsForParking);

export default router;
