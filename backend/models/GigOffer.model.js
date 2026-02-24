import mongoose from "mongoose";

const gigOfferSchema = new mongoose.Schema({
  // Reference to the original gig
  gigId: { type: mongoose.Schema.Types.ObjectId, ref: "StudentGig", required: true },
  
  // Freelancer sending the offer
  freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: "Freelancer", required: true },
  freelancerName: String,
  
  // Student receiving the offer
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  studentName: String,
  
  // Offer details
  originalBudget: Number,
  offeredAmount: { type: Number, required: true }, // Counter offer amount
  status: { 
    type: String, 
    enum: ["pending", "accepted", "rejected", "delivered", "completed", "paid"],
    default: "pending" 
  },
  
  // Negotiation tracking
  negotiationHistory: [
    {
      updatedBy: { type: String, enum: ["freelancer", "student"] },
      amount: Number,
      timestamp: { type: Date, default: Date.now },
      comment: String
    }
  ],
  
  // Payment info
  paymentIntentId: String, // Stripe payment intent ID
  paymentStatus: { type: String, enum: ["pending", "held", "released", "paid"], default: "pending" },
  
  // Delivery info
  deliveryLink: String, // YouTube link or file URL
  deliveryProof: String, // Video URL or document
  deliveredAt: Date,
  
  // Acceptance tracking
  freelancerAcceptedAt: Date,
  studentAcceptedAt: Date,
  bothAccepted: { type: Boolean, default: false },

  // Feedback tracking
  feedbackGiven: { type: Boolean, default: false },
  feedback: {
    rating: Number,
    comment: String,
    createdAt: Date,
  },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const GigOffer = mongoose.models.GigOffer || mongoose.model("GigOffer", gigOfferSchema);

export default GigOffer;
