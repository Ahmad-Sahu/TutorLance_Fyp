// import mongoose from "mongoose";

// const freelancerSchema = new mongoose.Schema({
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

// export const Freelancer = mongoose.model("Freelancer", freelancerSchema);

import mongoose from "mongoose";

/* GIG SCHEMA */
const gigSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  price: Number,
  status: { type: String, default: "Active" },
  createdAt: { type: Date, default: Date.now },
});

/* ORDER SCHEMA */
const orderSchema = new mongoose.Schema({
  clientName: String,
  project: String,
  payment: Number,
  status: { type: String, default: "In Progress" },
  createdAt: { type: Date, default: Date.now },
  completedAt: Date,
});

/* FEEDBACK */
const feedbackSchema = new mongoose.Schema({
  client: String,
  rating: Number,
  comment: String,
  createdAt: { type: Date, default: Date.now },
});

/* FREELANCER SCHEMA */
const freelancerSchema = new mongoose.Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
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
  // Primary domain or skills (used for matching student gigs)
  skills: String,
  // Friendly full name (optional) - backend may set this from firstname+lastname
  name: String,
  // Date of birth
  dob: Date,
  // Profile picture URL (Cloudinary)
  picture: String,
  // CNIC / national ID
  cnicNumber: String,
  // CNIC image URL
  cnicImage: String,
  // Primary domain such as "Flutter" or "Web Development" (duplicate of skills for clarity)
  domain: String,
  // Short description / bio
  description: String,
  // YouTube URL for sample work or references
  youtubeUrl: String,
  experience: String,
  status: { type: String, default: "Available" },
  rating: { type: Number, default: 0 },
  earnings: { type: Number, default: 0 },
  gigs: [gigSchema],
  orders: [orderSchema],
  feedbacks: [feedbackSchema],
  notifications: [
    {
      message: String,
      read: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now },
    }
  ],
});

// prevent OverwriteModelError
const Freelancer =
  mongoose.models.Freelancer ||
  mongoose.model("Freelancer", freelancerSchema);

export { Freelancer };

