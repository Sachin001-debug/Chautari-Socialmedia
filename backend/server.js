import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

dotenv.config();

import pool from "./config/db.js";       // Neon Postgres
import { PFP_BUCKET, verifyImagePostBucket, verifyPfpBucket } from "./supabase/supabase.js"; // Supabase Storage
import userRouter from "./src/routes/userRoute.js";
import uploadRouter from "./src/routes/uploadRoute.js";
import postImageRoute from "./src/routes/PostRoutes.js";

const app = express();

const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // allow same-origin/server-to-server calls that send no Origin header
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));
app.use(cookieParser());

const PORT = process.env.PORT;

app.use('/api/user', userRouter)
app.use('/api/upload', uploadRouter); //this is for pfp
app.use('/api/image-post', postImageRoute);

app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);

  // Test DB connection on startup
  try {
    await pool.query("SELECT NOW()");
    console.log(" Neon Postgres connected");
  } catch (err) {
    console.error("Neon connection failed:", err.message);
  }
  

  //conforming if bucket is loaded!, so we know prior
  try {
    const pfpBucket = await verifyPfpBucket();
    const imagePostBucket = await verifyImagePostBucket();
    console.log(`Supabase bucket "${pfpBucket.name}" ready (public: ${pfpBucket.public})`);
     console.log(`Supabase bucket "${imagePostBucket.name}" ready (public: ${imagePostBucket.public})`);
  } catch (err) {
    console.error("Supabase bucket not usable:", err.message);
  }
});