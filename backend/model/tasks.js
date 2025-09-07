import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
  name: String, // original file name
  filename: String, // GridFS stored filename (with timestamp prefix)
  url: String, // `/tasks/files/:filename` for frontend
  contentType: String, // MIME type (e.g., text/plain, application/pdf)
  size: Number, // file size in bytes
  type: {
    type: String,
    enum: ["image", "pdf", "doc", "text", "other"],
    default: "other"
  },
  folder: { type: String, default: "root" },
});


const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String },
category: { type: String, enum: ["Work","Home","Health","Errands","Leisure","Other",""], default: "Other" } ,
priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
  dueDate: { type: Date },
  completed: { type: Boolean, default: false },
  files: [fileSchema], // structured files
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  group: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Task = mongoose.model("Task", taskSchema);
