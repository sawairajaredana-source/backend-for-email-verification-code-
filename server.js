import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import admin from "firebase-admin";
import { readFileSync } from "fs";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ---------------------------------------------------------------------------
// Firebase Admin SDK init
// ---------------------------------------------------------------------------
const serviceAccount = JSON.parse(
  readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH, "utf8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// ---------------------------------------------------------------------------
// Brevo SMTP transporter
// ---------------------------------------------------------------------------
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_PASS,
  },
});

// ---------------------------------------------------------------------------
// Helper: generate 6-digit OTP
// ---------------------------------------------------------------------------
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ---------------------------------------------------------------------------
// Helper: send OTP email
// ---------------------------------------------------------------------------
async function sendOTPEmail(email, otp) {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Verification Code</title>
  <style>
    body { margin:0; padding:0; background:#f4f4f7; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif; color:#333; }
    .wrapper { max-width:520px; margin:48px auto; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08); }
    .header { background:#0f0f0f; padding:28px 40px; text-align:center; }
    .header h1 { margin:0; color:#fff; font-size:20px; letter-spacing:2px; text-transform:uppercase; }
    .body { padding:40px; text-align:center; }
    .body p { margin:0 0 16px; font-size:16px; line-height:1.6; color:#555; }
    .otp { display:inline-block; font-size:36px; font-weight:700; letter-spacing:10px; color:#0f0f0f; background:#f4f4f7; padding:16px 32px; border-radius:8px; margin:16px 0; }
    .expire { font-size:13px; color:#999; }
    .footer { padding:20px 40px; background:#f4f4f7; text-align:center; font-size:13px; color:#999; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header"><h1>GETXH</h1></div>
    <div class="body">
      <p>Your verification code is:</p>
      <div class="otp">${otp}</div>
      <p class="expire">This code expires in <strong>5 minutes</strong>.</p>
      <p>If you did not request this, please ignore this email.</p>
    </div>
    <div class="footer">&copy; ${new Date().getFullYear()} GETXH. All rights reserved.</div>
  </div>
</body>
</html>`.trim();

  await transporter.sendMail({
    from: '"GETXH" <agency@getxh.in>',
    to: email,
    subject: "Your Verification Code",
    html,
  });
}

// ---------------------------------------------------------------------------
// POST /send-verification-email  (alias for /send-otp, accepts optional name)
// ---------------------------------------------------------------------------
app.post("/send-verification-email", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required." });
  }

  const otp = generateOTP();
  const expiry = admin.firestore.Timestamp.fromDate(
    new Date(Date.now() + 5 * 60 * 1000)
  );

  try {
    await db.collection("otp_codes").doc(email).set({ email, otp, expiry });
    await sendOTPEmail(email, otp);
    return res.status(200).json({ success: true, message: "OTP sent to your email." });
  } catch (error) {
    console.error("Send OTP error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to send OTP. Please try again." });
  }
});

// ---------------------------------------------------------------------------
// POST /send-otp
// ---------------------------------------------------------------------------
app.post("/send-otp", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required." });
  }

  const otp = generateOTP();
  const expiry = admin.firestore.Timestamp.fromDate(
    new Date(Date.now() + 5 * 60 * 1000) // 5 minutes from now
  );

  try {
    await db.collection("otp_codes").doc(email).set({ email, otp, expiry });
    await sendOTPEmail(email, otp);
    return res.status(200).json({ success: true, message: "OTP sent to your email." });
  } catch (error) {
    console.error("Send OTP error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to send OTP. Please try again." });
  }
});

// ---------------------------------------------------------------------------
// POST /verify-otp
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
