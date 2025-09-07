import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
email: { type: String, lowercase: true } ,// remove required
  passwordHash: { type: String, required: true },
  group: { type: mongoose.Schema.Types.ObjectId, ref: "Group" },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("User", userSchema);
