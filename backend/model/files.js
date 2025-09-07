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


export default mongoose.model("File", fileSchema);
