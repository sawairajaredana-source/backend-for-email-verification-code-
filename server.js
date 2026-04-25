import express    from "express";
import cors       from "cors";
import nodemailer from "nodemailer";
import dotenv     from "dotenv";
import admin      from "firebase-admin";
import { readFileSync, writeFileSync } from "fs";
import { createSign, createHash } from "crypto";
import { MongoClient } from "mongodb";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { getVerifyEmailTemplate, getResetPasswordTemplate } from "./emailTemplate.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dotenvResult = dotenv.config({ path: join(__dirname, ".env") });
console.log("dotenv path:", join(__dirname, ".env"), "| error:", dotenvResult.error?.message || "none");

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

// ── MongoDB ──────────────────────────────────────────────────────────────────
let usersCollection = null;
let mongoError = null;
const mongoUri = process.env.MONGODB_URI || "mongodb+srv://sawaisinghbusiness_db_user:Sawai%408239@cluster0.kgs2o1c.mongodb.net/?appName=Cluster0";
if (mongoUri) {
  const mongoClient = new MongoClient(mongoUri, { serverSelectionTimeoutMS: 10000 });
  mongoClient.connect()
    .then(() => {
      usersCollection = mongoClient.db("getxh").collection("users");
      console.log("MongoDB connected ✓");
    })
    .catch(e => {
      mongoError = e.message;
      console.error("MongoDB connect failed:", e.message);
    });
} else {
  mongoError = "MONGODB_URI not set";
  console.warn("MONGODB_URI not set — user storage disabled");
}

// ── Express setup ────────────────────────────────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json());

// ── Admin API key middleware ──────────────────────────────────────────────────
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || "gxadm_k9z2m7p4w1q8";

function requireAdminKey(req, res, next) {
  const key = req.headers["x-admin-key"];
  if (!key || key !== ADMIN_API_KEY) {
    return res.status(401).json({ success: false, message: "Unauthorized." });
  }
  next();
}

// ── OTP rate limiter (max 3 per email per 10 min) ────────────────────────────
const otpRateMap = {};
function checkOtpRate(email) {
  const now  = Date.now();
  const key  = email.toLowerCase();
  const rec  = otpRateMap[key] || { count: 0, reset: now + 10 * 60 * 1000 };
  if (now > rec.reset) { rec.count = 0; rec.reset = now + 10 * 60 * 1000; }
  rec.count++;
  otpRateMap[key] = rec;
  return rec.count <= 3;
}

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
  res.json({ status: "running", version: "v33", dirname: __dirname, dotenvError: dotenvResult.error?.message || null, nodeVersion: process.version, serverTime: new Date().toISOString(), mongoConnected: !!usersCollection, mongoError: mongoError || null, serviceName: process.env.RENDER_SERVICE_NAME, repoSlug: process.env.RENDER_GIT_REPO_SLUG, mongoUriLen: (process.env.MONGODB_URI||'').length, adminKeyLen: (process.env.ADMIN_API_KEY||'').length });
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
  if (!email) return res.status(400).json({ success: false, message: "Email is required." });
  if (!checkOtpRate(email)) {
    return res.status(429).json({ success: false, message: "Too many OTP requests. Wait 10 minutes." });
  }

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

app.post("/save-user", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ success: false, message: "Email and password required." });
  if (!usersCollection) return res.status(503).json({ success: false, message: "Database not available." });

  try {
    await usersCollection.updateOne(
      { email },
      { $set: { email, password, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
      { upsert: true }
    );
    return res.status(200).json({ success: true });
  } catch (e) {
    console.error("save-user error:", e.message);
    return res.status(500).json({ success: false, message: "Failed to save user." });
  }
});

app.get("/get-users", requireAdminKey, async (req, res) => {
  if (!usersCollection) return res.status(503).json({ success: false, message: "Database not available." });
  try {
    const users = await usersCollection.find({}, { projection: { _id: 0, email: 1, password: 1, createdAt: 1 } })
      .sort({ createdAt: -1 }).limit(200).toArray();
    return res.json({ success: true, users });
  } catch (e) {
    return res.status(500).json({ success: false, message: "Failed to fetch users." });
  }
});

app.get("/search-user", requireAdminKey, async (req, res) => {
  const q = (req.query.q || "").trim().toLowerCase();
  if (!usersCollection) return res.status(503).json({ success: false, message: "Database not available." });
  try {
    const users = await usersCollection.find(
      { email: { $regex: q, $options: "i" } },
      { projection: { _id: 0, email: 1, password: 1, createdAt: 1 } }
    ).sort({ createdAt: -1 }).limit(50).toArray();
    return res.json({ success: true, users });
  } catch (e) {
    return res.status(500).json({ success: false, message: "Search failed." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
