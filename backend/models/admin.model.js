import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['tutor', 'student', 'admin', 'freelancer'],
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  otp: {
    type: String,
  },
  otpExpiry: {
    type: Date,
  }
})

export const Admin = mongoose.model("Admin", adminSchema);