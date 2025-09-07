import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  currentProject: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Group", groupSchema);
