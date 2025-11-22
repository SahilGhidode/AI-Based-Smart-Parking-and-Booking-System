import express from "express";
import { getFloorSlots } from "../controllers/floorController.js";

const router = express.Router();

router.get("/:id/slots", getFloorSlots);

export default router;
