import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { createUser, findUserByEmail } from "../models/userModel.js";

dotenv.config({ path: ".env" });

// 🟢 REGISTER USER
export const registerUser = async (req, res) => {
  try {
    let { username, email, password } = req.body;

    // ✅ Auto-generate username if not provided
    if (!username) {
      username = email.split("@")[0]; // e.g. sahilghidode12@gmail.com → sahilghidode12
    }

    // Check if email already exists
    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Create user
    const user = await createUser(username, email, hashed);

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🟠 LOGIN USER
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Send full response
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
