// import express from "express";
// import { createGig, getRelevantGigs } from "../controllers/Student_Gig.controller.js";

// const router = express.Router();

// // Student creates gig
// router.post("/create", createGig);

// // Freelancer sees relevant gigs
// router.get("/relevant/:id", getRelevantGigs);

// export default router;



// import express from "express";
// import StudentGig from "../models/Student_Gig.model.js";
// import { createGig, getRelevantGigs } from "../controllers/Student_Gig.controller.js";

// const router = express.Router();

// // router.post("/create", createGig);
// // POST: create gig
// router.post("/create", async (req, res) => {
//   try {
//     const gig = await StudentGig.create(req.body);
//     res.status(201).json({ success: true, gig });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// router.get("/relevant/:id", getRelevantGigs);

// // IMPORTANT: Default export
// export default router;




import express from "express";
import { createGig, getRelevantGigs, getGigsByStudent, updateGig, deleteGig } from "../controllers/Student_Gig.controller.js";

const router = express.Router();

// Create gig
router.post("/create", createGig);

// Get gigs for freelancer relevance
router.get("/relevant/:id", getRelevantGigs);

// Management: get gigs by student (query param studentId)
router.get("/", getGigsByStudent);

// Update a gig
router.put("/:id", updateGig);

// Delete a gig
router.delete("/:id", deleteGig);

export default router;

