import express from "express";
import { authenticateTutor } from "../middleware/auth.js";
import { negotiateBooking } from "../controllers/tutors.controller.js";
import { createSession, markSessionDone } from "../controllers/tutors.controller.js";

const router = express.Router();

// Negotiate booking (tutor only)
router.post("/:id/negotiate", authenticateTutor, negotiateBooking);

// Create session (tutor only)
router.post("/:id/session", authenticateTutor, createSession);

// Mark session done (tutor only)
router.post("/:id/done", authenticateTutor, markSessionDone);

export default router;