import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import { Task } from "../model/tasks.js";
import Group from "../model/groups.js";
import { authMiddleware } from "../middleware/authmiddleware.js";

const router = express.Router();

// ------------------ MONGODB GRIDFS SETUP ------------------
const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/taskmanager";
const conn = mongoose.createConnection(mongoURI, {});

let gfs;
conn.once("open", () => {
  gfs = new mongoose.mongo.GridFSBucket(conn.db, { bucketName: "uploads" });
  console.log("✅ GridFS initialized");
});

// ------------------ MULTER MEMORY STORAGE ------------------
const upload = multer({ storage: multer.memoryStorage() });

// ------------------ HELPERS ------------------
const waitForGFS = () =>
  new Promise((resolve) => {
    if (gfs) return resolve();
    conn.once("open", () => {
      gfs = new mongoose.mongo.GridFSBucket(conn.db, { bucketName: "uploads" });
      console.log("✅ GridFS initialized");
      resolve();
    });
  });

const saveFileToGridFS = async (file) => {
  await waitForGFS();
  return new Promise((resolve, reject) => {
    try {
      const filename = `${Date.now()}-${file.originalname}`;
      const uploadStream = gfs.openUploadStream(filename, { contentType: file.mimetype });
      uploadStream.end(file.buffer);

      uploadStream.on("finish", () =>
        resolve({
          name: file.originalname,
          filename,
          url: `/tasks/files/${filename}`,
          contentType: file.mimetype,
          size: file.size,
          folder: "root",
        })
      );

      uploadStream.on("error", reject);
    } catch (err) {
      reject(err);
    }
  });
};

// ------------------ ROUTES ------------------

// --- Serve files from GridFS ---
router.get("/files/:filename", async (req, res) => {
  try {
    await waitForGFS();
    const { filename } = req.params;

    const files = await gfs.find({ filename }).toArray();
    if (!files.length) return res.status(404).json({ error: "File not found" });

    const file = files[0];
    res.set({
      "Content-Type": file.contentType || "application/octet-stream",
      "Content-Disposition": `inline; filename="${file.filename}"`,
    });

    gfs.openDownloadStreamByName(filename).pipe(res).on("error", (err) => {
      console.error("❌ Error streaming file:", err);
      if (!res.headersSent) res.status(500).json({ error: "Error streaming file" });
      else res.destroy(err);
    });
  } catch (err) {
    console.error("❌ Error serving file:", err);
    res.status(500).json({ error: err.message });
  }
});

// --- Create task ---
router.post("/", authMiddleware, upload.array("files", 5), async (req, res) => {
  try {
    const { task: title, category, projectId, dueDate, description } = req.body;
    const files = await Promise.all((req.files || []).map(saveFileToGridFS));

    const safeCategory = category?.trim() || "Other";
    const groupId = req.user.groupId || (await Group.findOne({ name: "Default Group" }))._id;

    const task = await Task.create({
      title,
      description,
      category: safeCategory,
      dueDate,
      files,
      createdBy: req.user.id,
      group: groupId,
    });

    res.status(201).json(task);
  } catch (err) {
    console.error("❌ Error creating task:", err);
    res.status(400).json({ error: err.message });
  }
});
 


// --- Upload file to existing task ---
router.post("/:taskId/files", authMiddleware, upload.single("file"), async (req, res) => {
  try {
    
  console.log("[File GET] Filename:", req.params.filename);
  console.log("[File GET] req.user:", req.user);
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ error: "Task not found" });

    const fileMeta = await saveFileToGridFS(req.file);
    task.files.push(fileMeta);
    await task.save();

    res.json({ message: "File uploaded", task });
  } catch (err) {
    console.error("❌ Error uploading file:", err);
    res.status(500).json({ error: err.message });
  }
});

// --- Get all tasks ---
router.get("/", authMiddleware, async (req, res) => {
  try {
    const tasks = await Task.find({ group: req.user.groupId })
      .populate("createdBy", "username")
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    console.error("❌ Error fetching tasks:", err);
    res.status(500).json({ error: err.message });
  }
});

// --- Get single task ---
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });

    res.json(task);
  } catch (err) {
    console.error("❌ Error fetching task:", err);
    res.status(500).json({ error: err.message });
  }
});

// --- Update task ---
router.put("/:id", authMiddleware, upload.array("files", 5), async (req, res) => {
  try {
    const { title, description, priority, dueDate, completed, folder } = req.body;
    const newFiles = await Promise.all((req.files || []).map(saveFileToGridFS));

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: { title, description, priority, dueDate, completed }, $push: { files: { $each: newFiles } } },
      { new: true }
    );

    if (!task) return res.status(404).json({ error: "Task not found" });

    res.json(task);
  } catch (err) {
    console.error("❌ Error updating task:", err);
    res.status(400).json({ error: err.message });
  }
});

// --- Delete task ---
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });

    res.json({ message: "Task deleted" });
  } catch (err) {
    console.error("❌ Error deleting task:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
