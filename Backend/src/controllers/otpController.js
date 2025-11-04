import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const otpStore = {}; // Temporary in-memory storage

// 🟢 SEND OTP
export const sendVerificationOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    otpStore[email] = otp; // store temporarily
    console.log("SMTP_USER:", process.env.SMTP_USER);
console.log("SMTP_PASS:", process.env.SMTP_PASS ? "Loaded ✅" : "Missing ❌");


    // ✅ Setup transporter for Gmail SMTP (secure)
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // must be true for port 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Send mail
    await transporter.sendMail({
      from: `"SmartPark Verification" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Verify your SmartPark account",
      html: `
        <h2>SmartPark Email Verification</h2>
        <p>Your OTP for verification is: <b>${otp}</b></p>
        <p>This OTP is valid for 10 minutes.</p>
      `,
    });

    res.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("❌ OTP Send Error:", error.message);
    res.status(500).json({ error: "Failed to send OTP" });
  }
};

// 🟠 VERIFY OTP
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ error: "Email and OTP required" });

    if (otpStore[email] && otpStore[email].toString() === otp.toString()) {
      delete otpStore[email]; // remove after success

      const token = jwt.sign({ email }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      res.json({ success: true, message: "Email verified successfully", token });
    } else {
      res.status(400).json({ error: "Invalid or expired OTP" });
    }
  } catch (error) {
    console.error("❌ OTP Verify Error:", error.message);
    res.status(500).json({ error: "Verification failed" });
  }
};
