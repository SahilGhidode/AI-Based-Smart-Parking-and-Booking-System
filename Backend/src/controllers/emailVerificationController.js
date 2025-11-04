import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { createUser, findUserByEmail } from "../models/userModel.js";

dotenv.config();

const otpStore = {}; // temporary in-memory store

// 🟢 Step 1: Send OTP
export const sendVerificationOTP = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    otpStore[email] = { otp, username, password };

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"SmartPark Verification" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Verify your SmartPark account",
      text: `Your OTP for verification is: ${otp}`,
    });

    res.json({ success: true, message: "OTP sent to email" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to send OTP" });
  }
};

// 🟣 Step 2: Verify OTP + Create User
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ error: "Email and OTP required" });

    const storedData = otpStore[email];
    if (!storedData || storedData.otp.toString() !== otp.toString()) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    const hashedPassword = await bcrypt.hash(storedData.password, 10);
    const user = await createUser(storedData.username, email, hashedPassword);

    delete otpStore[email];

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({
      success: true,
      message: "Email verified and user registered successfully",
      token,
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Verification failed" });
  }
};
