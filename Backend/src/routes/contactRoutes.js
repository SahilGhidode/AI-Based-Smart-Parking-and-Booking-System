import express from "express";
import { sendContactForm } from "../controllers/contactController.js";

const router = express.Router();

router.post("/send-contact", sendContactForm);

export default router;