import multer from "multer";
import path from "path";

// Store uploads in /uploads folder
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // unique name
  },
});

export const upload = multer({ storage });

export const detectFileType = (mimetype) => {
  if (mimetype.startsWith("image/")) return "image";
  if (mimetype === "application/pdf") return "pdf";
  if (
    mimetype === "application/msword" ||
    mimetype.includes("officedocument")
  )
    return "doc";
  if (mimetype.startsWith("text/")) return "text";
  return "other";
};