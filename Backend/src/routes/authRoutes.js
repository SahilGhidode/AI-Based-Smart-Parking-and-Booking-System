import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

// ✅ Protected route example
router.get("/profile", verifyToken, (req, res) => {
  res.json({
    message: "Welcome to your protected profile!",
    user: req.user, // shows decoded info from token
  });
});

export default router;
