// import mongoose from "mongoose";

// const tutorSchema = new mongoose.Schema({
//     role: {
//     type: String,
//     enum: ['tutor', 'student', 'admin', 'freelancer'],
//     required: true,
//   },

//   firstName: {
//     type: String,
//     required: true,
//   },

//   lastName: {
//     type: String,
//     required: true,
//   },

//     email: {
//         type: String,
//         required: true,
//         unique: true,
//     },

//     password: {
//         type: String,
//         required: true,
//     }
// })

// export const Tutor = mongoose.model("Tutor", tutorSchema);

import mongoose from "mongoose";

const tutorSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["tutor", "student", "admin", "freelancer"],
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
  subjects: [{
    type: String,
    required: true,
  }],
  hourlyRate: {
    type: Number,
    required: true,
  },
  availability: [{
    type: String,
    enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
  }],
  languages: [{
    type: String,
    required: true,
  }],
  bio: {
    type: String,
  },
  qualifications: {
    type: String,
  },
  youtubeLink: {
    type: String,
  },
  countryOfBirth: {
    type: String,
  },
  specialities: [{
    type: String,
  }],
  ratings: [{
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    studentName: { type: String },
    rating: { type: Number, min: 1, max: 5 },
    review: { type: String },
    date: { type: Date, default: Date.now },
  }],
  averageRating: {
    type: Number,
    default: 0,
  },
  totalReviews: {
    type: Number,
    default: 0,
  },
  earnings: {
    type: Number,
    default: 0,
  },
  deliveredSessions: {
    type: Number,
    default: 0,
  },
  profileCompleted: {
    type: Boolean,
    default: false,
  },
  profilePicture: {
    type: String,
  },
  notifications: [
    {
      message: String,
      read: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now }
    }
  ],
}, { timestamps: true });

export const Tutor = mongoose.model("Tutor", tutorSchema);
