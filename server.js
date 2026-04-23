import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { getVerifyEmailTemplate, getResetPasswordTemplate } from "./emailTemplate.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "running", version: "v3-no-firebase" });
});

const otpStore = {};

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_PASS,
  },
});

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOTPEmail(email, otp, type) {
  const html = type === "reset"
    ? getResetPasswordTemplate(otp)
    : getVerifyEmailTemplate(otp);

  const subject = type === "reset"
    ? "Reset your password"
    : "Verify your email";

  await transporter.sendMail({
    from: '"GETXH" <agency@getxh.in>',
    to: email,
    subject,
    html,
  });
}

app.post("/send-otp", async (req, res) => {
  const { email, type } = req.body;
  console.log("send-otp → email:", email, "| type:", type);

  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required." });
  }

  const otp = generateOTP();
  const expiry = Date.now() + 5 * 60 * 1000;

  otpStore[email] = { otp, expiry, type: type || "signup" };

  try {
    await sendOTPEmail(email, otp, type);
    return res.status(200).json({ success: true, message: "OTP sent to your email." });
  } catch (error) {
    console.error("Send OTP error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to send OTP. Please try again.", error: error.message });
  }
});

app.post("/send-verification-email", async (req, res) => {
  req.body.type = req.body.type || "signup";
  const { email, type } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required." });
  }

  const otp = generateOTP();
  const expiry = Date.now() + 5 * 60 * 1000;
  otpStore[email] = { otp, expiry, type };

  try {
    await sendOTPEmail(email, otp, type);
    return res.status(200).json({ success: true, message: "OTP sent to your email." });
  } catch (error) {
    console.error("Send OTP error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to send OTP. Please try again.", error: error.message });
  }
});

app.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  console.log("verify-otp → email:", email, "| otp:", otp);

  if (!email || !otp) {
    return res.status(400).json({ success: false, message: "Email and OTP are required." });
  }

  const stored = otpStore[email];

  if (!stored) {
    return res.status(400).json({ success: false, message: "Invalid or expired OTP." });
  }

  if (stored.otp !== otp) {
    return res.status(400).json({ success: false, message: "Invalid or expired OTP." });
  }

  if (Date.now() > stored.expiry) {
    delete otpStore[email];
    return res.status(400).json({ success: false, message: "OTP expired. Please request a new one." });
  }

  delete otpStore[email];
  return res.status(200).json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
