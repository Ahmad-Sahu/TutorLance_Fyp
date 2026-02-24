import express from "express";
import GigOffer from "../models/GigOffer.model.js";
import {
  createCounterOffer,
  getOffersForGig,
  getOffersForStudent,
  getOffersForFreelancer,
  getOfferById,
  updateOfferAmount,
  acceptOffer,
  rejectOffer,
  createPaymentIntent,
  finalizePayment,
  deliverGig,
  acceptDelivery,
  addFeedbackToOffer
} from "../controllers/GigOffer.controller.js";

const router = express.Router();

// DEBUG: Get all offers (for testing)
router.get("/debug/all", async (req, res) => {
  try {
    const allOffers = await GigOffer.find({}).lean();
    console.log("🐛 DEBUG: Total offers in database:", allOffers.length);
    res.json({ total: allOffers.length, offers: allOffers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create counter offer
router.post("/:freelancerId/create", createCounterOffer);

// Get offers for a gig
router.get("/gig/:gigId", getOffersForGig);

// Get offers for a student (all offers across student's gigs)
router.get("/student", getOffersForStudent);

// Get offers for freelancer
router.get("/freelancer/:freelancerId", getOffersForFreelancer);

// Update offer amount
router.put("/:offerId/update-amount", updateOfferAmount);

// Accept offer
router.put("/:offerId/accept", acceptOffer);

// Reject offer
router.put("/:offerId/reject", rejectOffer);

// Create payment intent
router.post("/:offerId/payment", createPaymentIntent);
// Finalize payment after client-side confirmation
router.post("/:offerId/payment/confirm", finalizePayment);

// Deliver gig
router.put("/:offerId/deliver", deliverGig);

// Accept delivery
router.put("/:offerId/accept-delivery", acceptDelivery);

// Add feedback to an offer (student)
router.post("/:offerId/feedback", addFeedbackToOffer);

// Get single offer by ID
router.get("/:offerId", getOfferById);

export default router; 
