// import express from "express";
// import { login, signup } from "../controllers/tutors.controller.js";


// const router = express.Router();

// router.post("/signup", signup);
// router.post("/signup", login);

// export default router;

import express from "express";
import { tutorLogin, tutorSignup, getTutorProfile, getPublicTutorProfile, getTutors, updateTutorProfile, getTutorBookings, getPublicBookingsForTutor, updateBookingStatus, createSession, markSessionDone, withdrawEarnings, negotiateBooking, verifyTutorEmail } from "../controllers/tutors.controller.js";
import { authenticateTutor } from "../middleware/auth.js";

const router = express.Router();

// Tutor Signup Route
router.post("/signup", tutorSignup);
router.post("/verify-email", verifyTutorEmail);

// Tutor Login Route
router.post("/login", tutorLogin);

// Get Tutor Profile
router.get("/profile", authenticateTutor, getTutorProfile);

// Update Tutor Profile
router.put("/profile", authenticateTutor, updateTutorProfile);

// Get all tutors with filters
router.get("/", getTutors);

// Get single tutor profile (public)
router.get("/:id", getPublicTutorProfile);

// Get tutor bookings
router.get("/bookings", authenticateTutor, getTutorBookings);

// Public bookings for tutor by id (no auth) - useful as fallback
router.get("/:id/bookings-public", getPublicBookingsForTutor);

// Negotiate booking (counter offer)
router.put("/booking/:id/negotiate", authenticateTutor, negotiateBooking);

// Update booking status
router.put("/booking/:id/status", authenticateTutor, updateBookingStatus);

// Create session
router.post("/session/:bookingId", authenticateTutor, createSession);

// Mark session done
router.put("/session/:bookingId/done", authenticateTutor, markSessionDone);

// Withdraw earnings
router.post("/withdraw", authenticateTutor, withdrawEarnings);

export default router;

