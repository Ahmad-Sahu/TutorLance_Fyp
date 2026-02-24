import mongoose from "mongoose";

const studentGigSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  domain: { type: String, required: true },  
  budget: Number,
  // Deadline by which freelancer must deliver (optional)
  deadline: Date,
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  studentName: String,
  createdAt: { type: Date, default: Date.now },
});

// FIX: Prevent OverwriteModelError
const StudentGig =
  mongoose.models.StudentGig ||
  mongoose.model("StudentGig", studentGigSchema);

export default StudentGig;
