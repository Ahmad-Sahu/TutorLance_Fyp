import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema({
  fromRole: { type: String, enum: ["student", "tutor", "freelancer"], required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  userName: { type: String },
  message: { type: String, required: true },
  status: { type: String, enum: ["open", "closed"], default: "open" },
  adminResponse: { type: String },
  closedAt: { type: Date },
}, { timestamps: true });

export const Complaint = mongoose.model("Complaint", complaintSchema);
