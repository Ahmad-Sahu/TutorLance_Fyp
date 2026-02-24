import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
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

  // Email verification
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationCode: {
    type: String,
  },
  emailVerificationExpires: {
    type: Date,
  },

  profilePicture: {
    type: String, // Cloudinary URL
  },

  dateOfBirth: {
    type: Date,
  },

  savedTutors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tutor' }],
  notifications: [
    {
      message: String,
      read: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true })

export const Student = mongoose.model("Student", studentSchema);