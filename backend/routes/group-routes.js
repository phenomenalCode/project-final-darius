import express from "express";
import Group from "../model/groups.js";
import { authMiddleware } from "../middleware/authmiddleware.js";

const router = express.Router();

/**
 * CREATE a new group
 * POST /groups
 * Body: { name, currentProject (optional) }
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, currentProject } = req.body;
    if (!name) return res.status(400).json({ error: "Group name is required" });

    const existing = await Group.findOne({ name });
    if (existing) return res.status(409).json({ error: "Group name already exists" });

    const group = await Group.create({
      name,
      currentProject: currentProject || null,
      members: [req.user.id], // creator automatically joins
    });

    res.status(201).json(group);
  } catch (err) {
    console.error("Create group error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /groups/:id
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ error: "Group not found" });

    // Optional: Check if user is group creator
    if (group.members[0].toString() !== req.user.id) {
      return res.status(403).json({ error: "Only group creator can delete" });
    }

    await group.deleteOne();
    res.json({ message: "Group deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET all groups
 * GET /groups
 */
router.get("/", authMiddleware, async (req, res) => {

  try {
    const groups = await Group.find().populate("members", "username");
    
    console.log("Fetched groups:", JSON.stringify(groups, null, 2));

    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * JOIN a group
 * PUT /groups/:id/join
 */
router.put("/:id/join", authMiddleware, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ error: "Group not found" });

    if (!group.members.includes(req.user.id)) {
      group.members.push(req.user.id);
      await group.save();
    }

    res.json(group);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * LEAVE a group
 * PUT /groups/:id/leave
 */
router.put("/:id/leave", authMiddleware, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ error: "Group not found" });

    group.members = group.members.filter((id) => id.toString() !== req.user.id);
    await group.save();

    res.json({ message: "Left group successfully", group });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * SET current project for group
 * PUT /groups/:id/project
 * Body: { projectName }
 */
router.put("/:id/project", authMiddleware, async (req, res) => {
  try {
    const { projectName } = req.body;
    if (!projectName) return res.status(400).json({ error: "Project name required" });

    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ error: "Group not found" });

    group.currentProject = projectName;
    await group.save();

    res.json(group);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET single group by ID
 * GET /groups/:id
 */
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id).populate("members", "username");
    if (!group) return res.status(404).json({ error: "Group not found" });
    res.json(group);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id/project", authMiddleware, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ error: "Group not found" });

    group.currentProject = null;
    await group.save();

    res.json({ message: "Project removed", group });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
