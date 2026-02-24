import express from "express";
import { createComplaint, getMyComplaints } from "../controllers/complaint.controller.js";
import { getAllComplaints, updateComplaint } from "../controllers/complaint.controller.js";
import { authenticateStudentOrTutorOrFreelancer } from "../middleware/auth.js";
import { authenticateAdmin } from "../middleware/auth.js";

const router = express.Router();

router.post("/", authenticateStudentOrTutorOrFreelancer, createComplaint);
router.get("/my", authenticateStudentOrTutorOrFreelancer, getMyComplaints);

router.get("/admin", authenticateAdmin, getAllComplaints);
router.put("/admin/:id", authenticateAdmin, updateComplaint);

export default router;
