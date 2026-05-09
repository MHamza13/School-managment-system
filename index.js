const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");

const app = express();
const Routes = require("./routes/route.js");

dotenv.config();

const PORT = process.env.PORT || 6000;

// Uploads folder check
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
  console.log("✅ 'uploads' folder created successfully.");
}

// Middlewares
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cors());

// Static Images Serve
app.use("/uploads", express.static(uploadDir));

// =========================================================
// 👇 1. DIST FOLDER (FRONTEND) STATIC FILES SERVE KARNA 👇
// =========================================================
const distPath = path.join(process.cwd(), "dist");
app.use(express.static(distPath));

// Database Connection
mongoose
  .connect(process.env.MONGO_URL, {})
  .then(() => {
    console.log("✅ Connected to MongoDB");
  })
  .catch((err) => {
    console.error("❌ NOT CONNECTED TO NETWORK", err);
  });

// Routes (API)
// Dhyan rahe: API routes pehle aane chahiye, frontend route se
app.use("/", Routes);

// =========================================================
// 👇 2. FRONTEND ROUTING HANDLING (WILDCARD ROUTE) 👇
// =========================================================
// Agar koi aisa URL hit ho jo API routes mein nahi hai,
// to use frontend ka index.html bhej do (React/Vue routing ke liye zaroori hai)
app.get("*", (req, res) => {
  const indexPath = path.join(distPath, "index.html");
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res
      .status(404)
      .send("Frontend build not found. Make sure 'dist' folder exists.");
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server started at port no. ${PORT}`);
  console.log(`📂 Image Upload Path: ${uploadDir}`);
  console.log(`🌐 Frontend served from: ${distDir}`);
});
