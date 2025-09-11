import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../model/users.js";
import Group from "../model/groups.js";
import { authMiddleware } from "../middleware/authmiddleware.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "supersecret123";

// --- Register ---
router.post("/register", async (req, res) => {
  console.log("REQ.BODY:", req.body);

  try {
    const { username = "", password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ error: "Username already taken" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Find or create default group
    let defaultGroup = await Group.findOne({ name: "Default Group" });
    if (!defaultGroup) {
      defaultGroup = await Group.create({ name: "Default Group" });
    }

    // Create user
    const user = await User.create({
      username,
      passwordHash,
      group: defaultGroup._id,

    });

    res.status(201).json({ message: "User registered successfully", userId: user._id });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// --- Login ---
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!password || (!username)) {
      return res.status(400).json({ error: "Provide username and password" });
    }

    // Find user by username o
  const user = await User.findOne({ username }).populate("group");
console.log("[/auth/login] Fetched user:", user);
    if (!user) return res.status(401).json({ error: "User not found" });

    // Compare password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    
console.log("[/auth/login] Password match:", isMatch);
    if (!isMatch) return res.status(401).json({ error: "Invalid password" });
    

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, 
        groupId: user.group._id
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, user: { id: user._id, username: user.username, group: user.group } });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.get("/me", authMiddleware, async (req, res) => {
  try {
    // Fetch user data from database using the ID from the JWT
    const user = await User.findById(req.user.id).populate("group").select("-passwordHash");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Return user data in the expected format
    res.json({
      user: {
        id: user._id,
        username: user.username,
        group: user.group ? { id: user.group._id, name: user.group.name } : null,
      },
    });
  } catch (err) {
    console.error("Get user error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
