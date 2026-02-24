// import express from "express";
// import { login, signup } from "../controllers/freelancers.controller.js";

// const router = express.Router();

// router.post("/signup", signup);
// router.post("/login", login);

// export default router;

import express from "express";
import {
  registerFreelancer,
  loginFreelancer,
  getFreelancerProfile,
  updateFreelancerProfile,
  addGig,
  deleteGig,
  addFeedback,
  addOrder,
  getFreelancerDashboard,
  getRandomFreelancers,
} from "../controllers/freelancers.controller.js";

const router = express.Router();

// Authentication
router.post("/register", registerFreelancer);
router.post("/login", loginFreelancer);

// Profile
router.get("/:id", getFreelancerProfile);
router.put("/:id", updateFreelancerProfile);

// Gigs
router.post("/:id/gigs", addGig);
router.delete("/:id/gigs/:gigId", deleteGig);

// Orders
router.post("/:id/orders", addOrder);

// Feedback
router.post("/:id/feedback", addFeedback);

// Dashboard Summary
router.get("/:id/dashboard", getFreelancerDashboard);

// Get random freelancers for UI
router.get("/random/list", getRandomFreelancers);

router.get("/", async (req, res) => {
  try {
    const { skill } = req.query;
    const gigs = await StudentGig.find(
      skill ? { domain: skill } : {}
    );
    res.json(gigs);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;


