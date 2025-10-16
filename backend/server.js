import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";

import { connectDB } from "./db/db.js";
import authRoutes from "./routes/auth.js";
import taskRoutes from "./routes/taskroutes.js";
import groupRoutes from "./routes/group-routes.js";
import { authMiddleware } from "./middleware/authmiddleware.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

// --- Database ---
connectDB();

// --- CORS Setup ---
const allowedOrigins = [
  "https://project-final-darius.netlify.app",
  "https://project-final-darius-1.onrender.com"
];

app.use(cors({
  origin: (origin, callback) => {
    console.log("[CORS] Request origin:", origin);
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error("CORS not allowed"));
  },
  credentials: true,
}));

// --- Middleware ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Request Logger ---


// --- Auth Logger ---
app.use("/tasks", authMiddleware, (req, res, next) => {
  console.log("[Auth] req.user set:", req.user);
  next();
});

// --- Routes ---
app.use("/auth", authRoutes);
app.use("/tasks", taskRoutes);
app.use("/groups", groupRoutes);

// --- Root Route ---
app.get("/", (_, res) => {
  console.log("[Root] Accessed /");
  res.send("Hello Technigo!");
});

// --- Start Server ---
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log("NODE_ENV:", process.env.NODE_ENV);
  console.log("MONGO_URI:", process.env.MONGO_URI);
});

// --- Multer Setup Example for Logging ---
const upload = multer({ storage: multer.memoryStorage() });

app.post("/debug-upload", upload.single("file"), (req, res) => {
  console.log("[Upload] req.file:", req.file);
  console.log("[Upload] req.body:", req.body);
  res.json({ message: "Upload debug complete" });
});
