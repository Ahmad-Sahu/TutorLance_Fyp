import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  tutorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tutor',
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  topicDescription: {
    type: String,
  },
  proposedPrice: {
    type: Number,
    required: true,
  },
  proposedDate: {
    type: Date,
  },
  proposedDay: {
    type: String,
    enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
  },
  proposedTime: {
    type: String,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected", "negotiating", "confirmed", "completed", "cancelled"],
    default: "pending",
  },
  negotiationHistory: [{
    from: { type: String, enum: ["student", "tutor"] },
    proposedPrice: { type: Number },
    message: { type: String },
    date: { type: Date, default: Date.now },
  }],
  paymentIntentId: {
    type: String,
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "held", "released", "refunded"],
    default: "pending",
  },
  sessionLink: {
    type: String,
  },
  sessionLinkDeadline: { type: Date },
  classDueBy: { type: Date },
  sessionScheduledAt: {
    type: Date,
  },
  sessionCompletedAt: {
    type: Date,
  },
  studentMarkedDone: {
    type: Boolean,
    default: false,
  },
  tutorMarkedDone: {
    type: Boolean,
    default: false,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  review: {
    type: String,
  },
}, { timestamps: true });

export const Booking = mongoose.model("Booking", bookingSchema);