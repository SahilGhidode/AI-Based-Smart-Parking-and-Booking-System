// src/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

// Middleware to verify JWT token
export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check if token is provided
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach user info to request object

    next(); // proceed to the next middleware or route
  } catch (error) {
    console.error("JWT verification failed:", error.message);
    res.status(403).json({ message: "Invalid or expired token" });
  }
};
