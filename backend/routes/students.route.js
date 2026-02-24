import express from "express";
import { login, signup, getNotifications, getStudentProfile, updateStudentProfile, getStudentBookings, createBooking, negotiateBooking, confirmBooking, cancelBooking, markSessionDone, rateTutor, saveTutor, unsaveTutor, getSavedTutors } from "../controllers/students.controller.js";
import { authenticateStudent } from "../middleware/auth.js";

import { createGig, getRelevantGigs, getGigsByStudent, updateGig, deleteGig } from "../controllers/Student_Gig.controller.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

// Get student profile
router.get("/profile", authenticateStudent, getStudentProfile);

// Update student profile
router.put("/profile", authenticateStudent, updateStudentProfile);

// Get student bookings
router.get("/bookings", authenticateStudent, getStudentBookings);

// Create booking
router.post("/booking", authenticateStudent, createBooking);

// Negotiate booking
router.put("/booking/:id/negotiate", authenticateStudent, negotiateBooking);

// Accept counter offer
router.put("/booking/:id/accept", authenticateStudent, confirmBooking);

// Reject counter offer
router.put("/booking/:id/reject", authenticateStudent, cancelBooking);

// Mark session done
router.put("/session/:bookingId/done", authenticateStudent, markSessionDone);

// Rate tutor
router.post("/rate/:bookingId", authenticateStudent, rateTutor);

// Student creates gig
router.post("/create", createGig);

// Get gigs for a student
router.get("/gigs", getGigsByStudent);

// Update & delete a gig (student management)
router.put("/gigs/:id", updateGig);
router.delete("/gigs/:id", deleteGig);

// Student notifications
router.get("/notifications", authenticateStudent, getNotifications);

// Saved tutors
router.post("/saved-tutors", authenticateStudent, saveTutor);
router.delete("/saved-tutors/:tutorId", authenticateStudent, unsaveTutor);
router.get("/saved-tutors", authenticateStudent, getSavedTutors);

// Freelancer sees relevant gigs
router.get("/relevant/:id", getRelevantGigs);

export default router;

// import express from "express";
// import {
//   createGig,
//   getRelevantGigs,
// } from "../controllers/Student_Gig.controller.js";

// const router = express.Router();

// // Create gig
// router.post("/create", createGig);

// // Get relevant gigs for freelancer
// router.get("/relevant/:id", getRelevantGigs);

// // ✔ Export default
// export default router;

