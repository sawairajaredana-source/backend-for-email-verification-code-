import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import admin from "firebase-admin";
import { getVerifyEmailTemplate, getResetPasswordTemplate } from "./emailTemplate.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
  throw new Error("FIREBASE_SERVICE_ACCOUNT env variable is missing.");
}
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

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

async function handleSendOtp(req, res) {
  const { email, type } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required." });
  }

  const otp = generateOTP();
  const expiry = admin.firestore.Timestamp.fromDate(
    new Date(Date.now() + 5 * 60 * 1000)
  );

  try {
    await db.collection("otp_codes").doc(email).set({ email, otp, expiry, type: type || "signup" });
    await sendOTPEmail(email, otp, type);
    return res.status(200).json({ success: true, message: "OTP sent to your email." });
  } catch (error) {
    console.error("Send OTP error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to send OTP. Please try again.", error: error.message });
  }
}

app.post("/send-otp", handleSendOtp);
app.post("/send-verification-email", handleSendOtp);

app.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ success: false, message: "Email and OTP are required." });
  }

  try {
    const docRef = db.collection("otp_codes").doc(email);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP." });
    }

    const { otp: storedOtp, expiry } = doc.data();

    if (storedOtp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP." });
    }

    if (expiry.toDate() < new Date()) {
      await docRef.delete();
      return res.status(400).json({ success: false, message: "Invalid or expired OTP." });
    }

    await docRef.delete();
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Verify OTP error:", error.message);
    return res.status(500).json({ success: false, message: "Verification failed. Please try again." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
