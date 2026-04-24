import express    from "express";
import cors       from "cors";
import nodemailer from "nodemailer";
import dotenv     from "dotenv";
import admin      from "firebase-admin";
import { readFileSync, writeFileSync } from "fs";
import { createSign, createHash } from "crypto";
import { getVerifyEmailTemplate, getResetPasswordTemplate } from "./emailTemplate.js";

dotenv.config();

// ── Firebase Admin init ──────────────────────────────────────────────────────
let serviceAccount = null;
const _saRaw = process.env.FIREBASE_SERVICE_ACCOUNT_B64
  || process.env.FIREBASE_SERVICE_ACCOUNT
  || process.env.FIREBASE_SERVICE_KEY;
if (_saRaw) {
  try {
    const isB64 = process.env.FIREBASE_SERVICE_ACCOUNT_B64 ? true : false;
    const raw = isB64 ? Buffer.from(_saRaw, "base64").toString("utf8") : _saRaw;
    serviceAccount = JSON.parse(raw);
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
    }
    console.log("Firebase: loaded from env var" + (isB64 ? " (base64)" : ""));
  } catch (e) {
    console.error("Firebase: failed to parse service account env var:", e.message);
  }
}

if (!serviceAccount) {
  try {
    serviceAccount = JSON.parse(readFileSync("./firebase-service-account.json", "utf8"));
    console.log("Firebase: loaded from file");
  } catch (e) {
    console.error("Firebase: service account not found anywhere — Admin SDK disabled");
  }
}

if (serviceAccount) {
  try {
    const tmpPath = "/tmp/firebase-sa.json";
    writeFileSync(tmpPath, JSON.stringify(serviceAccount));
    process.env.GOOGLE_APPLICATION_CREDENTIALS = tmpPath;
    admin.initializeApp({ credential: admin.credential.applicationDefault() });
    console.log("Firebase Admin initialized via ADC ✓");
  } catch (e) {
    console.error("Firebase Admin init failed:", e.message);
    serviceAccount = null;
  }
}

// ── Express setup ────────────────────────────────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json());

const otpStore      = {};
const verifiedResets = {};

const transporter = nodemailer.createTransport({
  host:   "smtp-relay.brevo.com",
  port:   587,
  secure: false,
  auth: {
    user: decodeURIComponent(process.env.BREVO_USER || ""),
    pass: process.env.BREVO_PASS,
  },
});

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOTPEmail(email, otp, type) {
  const html    = type === "reset" ? getResetPasswordTemplate(otp) : getVerifyEmailTemplate(otp);
  const subject = type === "reset" ? "Reset your password" : "Verify your email";
  await transporter.sendMail({ from: '"GETXH" <agency@getxh.in>', to: email, subject, html });
}

// ── Routes ───────────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  const pkHash = serviceAccount?.private_key ? createHash("md5").update(serviceAccount.private_key).digest("hex") : "none";
  res.json({ status: "running", version: "v26", nodeVersion: process.version, pkHash, pkLen: serviceAccount?.private_key?.length || 0, keyId: serviceAccount?.private_key_id || "none", serverTime: new Date().toISOString() });
});

app.get("/test-jwt", async (req, res) => {
  if (!serviceAccount) return res.json({ error: "no service account loaded" });
  try {
    const { JWT } = await import("google-auth-library");
    const jwtClient = new JWT({
      email: serviceAccount.client_email,
      key:   serviceAccount.private_key,
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    });
    const tokenInfo = await jwtClient.getAccessToken();
    res.json({ success: !!tokenInfo.token, tokenPrefix: tokenInfo.token?.substring(0, 20) });
  } catch(e) {
    res.json({ error: e.message, code: e.code });
  }
});

app.post("/check-email", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: "Email required." });

  try {
    await admin.auth().getUserByEmail(email);
    return res.json({ success: true, registered: true });
  } catch (err) {
    if (err.code === "auth/user-not-found") {
      return res.json({ success: true, registered: false });
    }
    return res.status(500).json({ success: false, message: "Cannot check email. Try again.", errorCode: err.code, errorMsg: err.message });
  }
});

app.post("/send-otp", async (req, res) => {
  const { email, type } = req.body;
  console.log("send-otp → email:", email, "| type:", type);
  if (!email) return res.status(400).json({ success: false, message: "Email is required." });

  if (type === "reset") {
    try {
      await admin.auth().getUserByEmail(email);
    } catch (err) {
      return res.status(400).json({ success: false, message: "Please enter a registered email." });
    }
  }

  const otp = generateOTP();
  otpStore[email] = { otp, expiry: Date.now() + 5 * 60 * 1000, type: type || "signup" };

  try {
    await sendOTPEmail(email, otp, type);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Send OTP error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to send OTP.", error: error.message });
  }
});

app.post("/send-verification-email", async (req, res) => {
  const { email } = req.body;
  const type = req.body.type || "signup";
  if (!email) return res.status(400).json({ success: false, message: "Email is required." });

  const otp = generateOTP();
  otpStore[email] = { otp, expiry: Date.now() + 5 * 60 * 1000, type };

  try {
    await sendOTPEmail(email, otp, type);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Send OTP error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to send OTP.", error: error.message });
  }
});

app.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  console.log("verify-otp → email:", email, "| otp:", otp);
  if (!email || !otp) return res.status(400).json({ success: false, message: "Email and OTP required." });

  const stored = otpStore[email];
  if (!stored)              return res.status(400).json({ success: false, message: "Invalid or expired OTP." });
  if (stored.otp !== otp)   return res.status(400).json({ success: false, message: "Invalid OTP." });
  if (Date.now() > stored.expiry) {
    delete otpStore[email];
    return res.status(400).json({ success: false, message: "OTP expired. Request a new one." });
  }

  const type = stored.type;
  delete otpStore[email];

  if (type === "reset") {
    verifiedResets[email] = Date.now() + 10 * 60 * 1000;
  }

  return res.status(200).json({ success: true, type });
});

app.post("/update-password", async (req, res) => {
  const { email, password } = req.body;
  console.log("update-password → email:", email);

  if (!email || !password) return res.status(400).json({ success: false, message: "Email and password required." });

  if (!verifiedResets[email] || Date.now() > verifiedResets[email]) {
    delete verifiedResets[email];
    return res.status(403).json({ success: false, message: "Session expired. Please start again." });
  }

  if (password.length < 8) return res.status(400).json({ success: false, message: "Password must be at least 8 characters." });

  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().updateUser(user.uid, { password });
    delete verifiedResets[email];
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Update password error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to update password.", error: error.message });
  }
});

app.post("/reset-password", async (req, res) => {
  const { email, newPassword } = req.body;
  console.log("reset-password → email:", email);

  if (!email || !newPassword) return res.status(400).json({ success: false, message: "Email and password required." });

  if (!verifiedResets[email] || Date.now() > verifiedResets[email]) {
    delete verifiedResets[email];
    return res.status(403).json({ success: false, message: "Session expired. Please start again." });
  }

  if (newPassword.length < 8) return res.status(400).json({ success: false, message: "Password must be at least 8 characters." });

  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().updateUser(user.uid, { password: newPassword });
    delete verifiedResets[email];
    return res.status(200).json({ success: true, message: "Password updated successfully." });
  } catch (error) {
    console.error("Reset password error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to reset password." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
