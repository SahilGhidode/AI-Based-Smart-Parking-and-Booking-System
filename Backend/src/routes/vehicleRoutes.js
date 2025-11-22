import express from "express";
import { addVehicle, getUserVehicles } from "../controllers/vehicleController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/add", verifyToken, addVehicle);
router.get("/", verifyToken, getUserVehicles);

export default router;
