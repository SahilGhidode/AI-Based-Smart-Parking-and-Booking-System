import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { googleAuthRedirect, googleAuthCallback } from "../controllers/googleController.js";

const router = express.Router();

// Normal auth
router.post("/register", registerUser);
router.post("/login", loginUser);

// Google Auth Routes
router.get("/google", googleAuthRedirect);              // start Google sign-in
router.get("/google/callback", googleAuthCallback);     // Google returns user

// Protected Route
router.get("/profile", verifyToken, (req, res) => {
  res.json({
    message: "Welcome to your protected profile!",
    user: req.user,
  });
});

export default router;
