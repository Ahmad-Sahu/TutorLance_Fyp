import GigOffer from "../models/GigOffer.model.js";
import StudentGig from "../models/Student_Gig.model.js";
import { Freelancer } from "../models/freelancers.model.js";
import { Student } from "../models/students.model.js";
import Stripe from "stripe";
import Payment from "../models/Payment.model.js";

let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  try {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  } catch (err) {
    console.warn('⚠️ Stripe initialization failed in GigOffer.controller.js:', err.message);
    stripe = null;
  }
} else {
  console.warn('⚠️ STRIPE_SECRET_KEY not set. Stripe operations will be skipped.');
}

// Create counter offer
export const createCounterOffer = async (req, res) => {
  try {
    const { gigId, offeredAmount } = req.body;
    const freelancerId = req.params.freelancerId;

    console.log("📝 Creating offer - gigId:", gigId, "freelancerId:", freelancerId, "offeredAmount:", offeredAmount);

    // Get gig details
    const gig = await StudentGig.findById(gigId);
    if (!gig) {
      console.error("❌ Gig not found:", gigId);
      return res.status(404).json({ message: "Gig not found" });
    }

    console.log("✅ Gig found:", gig._id, "StudentId:", gig.studentId, "StudentName:", gig.studentName);

    // Get freelancer details
    const freelancer = await Freelancer.findById(freelancerId);
    if (!freelancer) {
      console.error("❌ Freelancer not found:", freelancerId);
      return res.status(404).json({ message: "Freelancer not found" });
    }

    console.log("✅ Freelancer found:", freelancer.name);

    // Check if offer already exists
    const existingOffer = await GigOffer.findOne({ gigId, freelancerId });
    if (existingOffer) {
      console.warn("⚠️ Offer already exists for this gig");
      return res.status(400).json({ message: "Offer already sent for this gig" });
    }

    // Create new offer
    const newOffer = new GigOffer({
      gigId,
      freelancerId,
      freelancerName: freelancer.name || `${freelancer.firstname} ${freelancer.lastname}`,
      studentId: gig.studentId,
      studentName: gig.studentName,
      originalBudget: gig.budget,
      offeredAmount,
      negotiationHistory: [
        {
          updatedBy: "freelancer",
          amount: offeredAmount,
          comment: "Initial counter offer"
        }
      ]
    });

    console.log("💾 Saving offer with studentId:", newOffer.studentId);
    await newOffer.save();
    console.log("✅ Offer saved successfully:", newOffer._id);
    
    res.status(201).json({ message: "Counter offer sent successfully", offer: newOffer });
  } catch (err) {
    console.error("❌ Error creating counter offer:", err);
    res.status(500).json({ message: "Error creating counter offer", error: err.message });
  }
};

// Get all offers for a gig (for student) - ONLY returns offers for the student who posted the gig
export const getOffersForGig = async (req, res) => {
  try {
    const { gigId } = req.params;
    const { studentId } = req.query; // Verify studentId matches
    
    console.log("🔍 Fetching offers for gigId:", gigId, "studentId:", studentId);
    
    // Get the gig first to verify studentId
    const gig = await StudentGig.findById(gigId);
    if (!gig) {
      console.error("❌ Gig not found:", gigId);
      return res.status(404).json({ message: "Gig not found" });
    }
    
    console.log("✅ Gig found - belongs to studentId:", gig.studentId, "type:", typeof gig.studentId);
    console.log("   Query studentId:", studentId, "type:", typeof studentId);
    
    // Only allow the student who posted this gig to see offers
    // Convert both to strings for comparison to avoid type mismatch issues
    if (studentId) {
      const gigStudentId = gig.studentId.toString();
      const queryStudentId = String(studentId);
      
      console.log("   Comparing: gigStudentId =", gigStudentId, "queryStudentId =", queryStudentId, "Match:", gigStudentId === queryStudentId);
      
      if (gigStudentId !== queryStudentId) {
        console.warn("⚠️ Unauthorized access - gig studentId:", gigStudentId, "doesn't match query studentId:", queryStudentId);
        return res.status(403).json({ message: "You can only view offers for your own gigs" });
      }
    }
    
    // Find all offers for this gigId
    const offers = await GigOffer.find({ gigId }).lean(); // Use .lean() for better performance
    console.log("✅ Database query found", offers.length, "offers");
    
    if (offers.length > 0) {
      offers.forEach(o => {
        console.log("   - Offer ID:", o._id, "from", o.freelancerName, "amount:", o.offeredAmount, "studentId:", o.studentId);
      });
    } else {
      console.log("   No offers found for this gig in database");
    }
    
    res.status(200).json(offers);
  } catch (err) {
    console.error("❌ Error fetching offers:", err);
    res.status(500).json({ message: "Error fetching offers", error: err.message });
  }
};

// Get offers received by freelancer
export const getOffersForFreelancer = async (req, res) => {
  try {
    const { freelancerId } = req.params;
    const offers = await GigOffer.find({ freelancerId }).sort({ createdAt: -1 });
    res.status(200).json(offers);
  } catch (err) {
    console.error("❌ Error fetching offers:", err);
    res.status(500).json({ message: "Error fetching offers", error: err.message });
  }
};

// Get all offers received by a student across all their gigs
export const getOffersForStudent = async (req, res) => {
  try {
    const { studentId } = req.query;
    if (!studentId) return res.status(400).json({ message: "studentId query parameter is required" });

    console.log("🔍 Fetching offers for studentId:", studentId);

    // Find offers where studentId matches and include gig title for context
    const offers = await GigOffer.find({ studentId }).sort({ createdAt: -1 }).populate('gigId', 'title').lean();

    console.log("✅ Found", offers.length, "offers for student");
    res.status(200).json(offers);
  } catch (err) {
    console.error("❌ Error fetching student offers:", err);
    res.status(500).json({ message: "Error fetching student offers", error: err.message });
  }
};

// Get single offer by ID
export const getOfferById = async (req, res) => {
  try {
    const { offerId } = req.params;
    const offer = await GigOffer.findById(offerId).populate('gigId', 'title').lean();
    if (!offer) return res.status(404).json({ message: 'Offer not found' });
    res.status(200).json(offer);
  } catch (err) {
    console.error('❌ Error fetching offer by id:', err);
    res.status(500).json({ message: 'Error fetching offer', error: err.message });
  }
};

// Add feedback to an offer and to freelancer (student submits feedback after completion)
export const addFeedbackToOffer = async (req, res) => {
  try {
    const { offerId } = req.params;
    const { rating, comment, studentName } = req.body;

    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be a number between 1 and 5' });
    }

    const offer = await GigOffer.findById(offerId);
    if (!offer) return res.status(404).json({ message: 'Offer not found' });

    if (offer.feedbackGiven) return res.status(400).json({ message: 'Feedback already submitted for this offer' });

    // Add feedback to freelancer
    const freelancer = await Freelancer.findById(offer.freelancerId);
    if (!freelancer) return res.status(404).json({ message: 'Freelancer not found' });

    freelancer.feedbacks = freelancer.feedbacks || [];
    freelancer.feedbacks.push({ client: studentName || offer.studentName, rating, comment, createdAt: new Date() });

    // Recalculate rating
    const totalRatings = freelancer.feedbacks.reduce((acc, fb) => acc + (fb.rating || 0), 0);
    freelancer.rating = totalRatings / freelancer.feedbacks.length;

    await freelancer.save();

    // Mark offer as feedbackGiven and save a copy
    offer.feedbackGiven = true;
    offer.feedback = { rating, comment, createdAt: new Date() };
    await offer.save();

    res.status(200).json({ message: 'Feedback submitted successfully' });
  } catch (err) {
    console.error('❌ Error adding feedback to offer:', err);
    res.status(500).json({ message: 'Error adding feedback', error: err.message });
  }
};

// Update offer amount (negotiation)
export const updateOfferAmount = async (req, res) => {
  try {
    const { offerId } = req.params;
    const { newAmount, updatedBy, comment } = req.body;

    const offer = await GigOffer.findById(offerId);
    if (!offer) return res.status(404).json({ message: "Offer not found" });

    // Disallow negotiation on delivered/completed/rejected offers or when payment is held/captured
    if (["delivered", "completed", "rejected"].includes(offer.status)) {
      return res.status(400).json({ message: "Cannot negotiate on delivered or completed offers" });
    }
    if (["held", "captured", "paid", "released"].includes(offer.paymentStatus)) {
      return res.status(400).json({ message: "Cannot negotiate when payment is held or completed" });
    }

    // Add to negotiation history
    offer.negotiationHistory.push({
      updatedBy,
      amount: newAmount,
      comment
    });

    offer.offeredAmount = newAmount;
    offer.updatedAt = new Date();
    await offer.save();

    res.status(200).json({ message: "Offer amount updated", offer });
  } catch (err) {
    console.error("❌ Error updating offer:", err);
    res.status(500).json({ message: "Error updating offer", error: err.message });
  }
};

// Accept offer (freelancer or student)
export const acceptOffer = async (req, res) => {
  try {
    const { offerId } = req.params;
    const { acceptedBy } = req.body; // "freelancer" or "student"

    const offer = await GigOffer.findById(offerId);
    if (!offer) return res.status(404).json({ message: "Offer not found" });

    // Prevent duplicate accepts
    if (acceptedBy === "freelancer" && offer.freelancerAcceptedAt) {
      return res.status(400).json({ message: "Freelancer already accepted this offer" });
    }
    if (acceptedBy === "student") {
      if (offer.studentAcceptedAt) return res.status(400).json({ message: "Student already accepted this offer" });
      // Disallow student 'accept' if gig is already delivered or completed; for deliveries use accept-delivery
      if (["delivered", "completed"].includes(offer.status)) {
        return res.status(400).json({ message: "Cannot accept this offer: the gig has already been delivered or completed. Use accept-delivery if necessary." });
      }
      offer.studentAcceptedAt = new Date();
    }

    if (acceptedBy === "freelancer") {
      offer.freelancerAcceptedAt = new Date();
    }

    // Check if both have accepted
    if (offer.freelancerAcceptedAt && offer.studentAcceptedAt) {
      offer.bothAccepted = true;
      offer.status = "accepted";
    }

    offer.updatedAt = new Date();
    await offer.save();

    // Notify student when freelancer accepts
    try {
      const student = await Student.findById(offer.studentId);
      if (student) {
        student.notifications = student.notifications || [];
        student.notifications.push({ message: `Freelancer accepted the offer for your gig. You may accept and pay to start the work.`, read: false, createdAt: new Date() });
        await student.save();
      }
    } catch (err) {
      console.error('⚠️ Error notifying student of freelancer acceptance:', err);
    }

    res.status(200).json({ message: "Offer accepted", offer });
  } catch (err) {
    console.error("❌ Error accepting offer:", err);
    res.status(500).json({ message: "Error accepting offer", error: err.message });
  }
};

// Reject offer
export const rejectOffer = async (req, res) => {
  try {
    const { offerId } = req.params;
    const { rejectedBy } = req.body;

    const offer = await GigOffer.findById(offerId);
    if (!offer) return res.status(404).json({ message: "Offer not found" });

    offer.status = "rejected";
    offer.updatedAt = new Date();
    await offer.save();

    res.status(200).json({ message: "Offer rejected", offer });
  } catch (err) {
    console.error("❌ Error rejecting offer:", err);
    res.status(500).json({ message: "Error rejecting offer", error: err.message });
  }
};

// Create payment intent (hold amount on card)
export const createPaymentIntent = async (req, res) => {
  try {
    const { offerId } = req.params;
    const { paymentMethodId, paymentMethodType, amount } = req.body; // paymentMethodType: 'card'|'jazzcash'|'easypaisa'|'offline'

    const offer = await GigOffer.findById(offerId);
    if (!offer) return res.status(404).json({ message: "Offer not found" });

    // Validate amount matches the agreed offer amount
    const requestedAmount = Number(amount ?? offer.offeredAmount);
    if (requestedAmount !== Number(offer.offeredAmount)) {
      return res.status(400).json({ message: `Incorrect amount. Please pay the agreed amount: PKR ${offer.offeredAmount}` });
    }

    // Handle card payments via Stripe (if paymentMethodType === 'card' and paymentMethodId provided)
    if (paymentMethodType === "card") {
      if (!stripe) return res.status(500).json({ message: 'Stripe not configured. Cannot process card payments.' });
      // Create PaymentIntent server-side and return client secret for client-side confirmation
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(offer.offeredAmount * 100), // Amount in cents
        currency: "pkr",
        capture_method: "manual",
        description: `Gig payment for ${offer.gigId}`,
        metadata: {
          offerId: offerId.toString(),
          freelancerId: offer.freelancerId.toString(),
          studentId: offer.studentId.toString()
        }
      });

      // Return client secret to the client to confirm the payment
      return res.status(200).json({
        message: "Payment intent created",
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret
      });
    }

    // For offline methods (JazzCash, Easypaisa) simulate a hold (store an offline id)
    const offlineId = `offline_${Date.now()}`;
    offer.paymentIntentId = offlineId;
    offer.paymentStatus = "held";
    offer.studentAcceptedAt = new Date();
    offer.status = "accepted";
    offer.paymentMethod = paymentMethodType || "offline";
    await offer.save();

    // Create payment record for offline hold
    try {
      await Payment.create({
        offerId: offer._id,
        paymentIntentId: offlineId,
        amount: offer.offeredAmount,
        method: offer.paymentMethod || "offline",
        status: "held"
      });
    } catch (err) {
      console.error("⚠️ Error creating offline payment record:", err);
    }

    // Add order to freelancer.orders
    try {
      const freelancer = await Freelancer.findById(offer.freelancerId);
      if (freelancer) {
        freelancer.orders = freelancer.orders || [];
        freelancer.orders.push({
          offerId: offer._id,
          clientName: offer.studentName,
          project: `Gig ${offer.gigId}`,
          payment: offer.offeredAmount,
          status: "In Progress",
        });
        await freelancer.save();
      }
    } catch (err) {
      console.error("⚠️ Error adding order to freelancer:", err);
    }

    // Notify student
    try {
      const student = await Student.findById(offer.studentId);
      if (student) {
        student.notifications = student.notifications || [];
        student.notifications.push({ message: `Payment of PKR ${offer.offeredAmount} recorded (offline). Order created for your gig.`, read: false, createdAt: new Date() });
        await student.save();
      }
    } catch (err) {
      console.error("⚠️ Error adding student notification:", err);
    }

    res.status(200).json({ message: "Payment held (offline)", paymentIntentId: offlineId });
  } catch (err) {
    console.error("❌ Error creating payment intent:", err);
    res.status(500).json({ message: "Error processing payment", error: err.message });
  }
};

// Finalize payment after client-side confirmation
export const finalizePayment = async (req, res) => {
  try {
    const { offerId } = req.params;
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) return res.status(400).json({ message: 'paymentIntentId is required' });

    const offer = await GigOffer.findById(offerId);
    if (!offer) return res.status(404).json({ message: 'Offer not found' });

    // Retrieve PaymentIntent from Stripe to verify status
    if (!stripe) return res.status(500).json({ message: 'Stripe not configured. Cannot finalize payments.' });
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (!pi) return res.status(400).json({ message: 'PaymentIntent not found' });

    // If authentication is still required, inform client
    if (pi.status === 'requires_action' || pi.status === 'requires_source_action') {
      return res.status(200).json({ requires_action: true, clientSecret: pi.client_secret });
    }

    if (pi.status === 'requires_payment_method' || pi.status === 'canceled') {
      return res.status(400).json({ message: 'Payment failed or requires a valid payment method' });
    }

    // For manual capture flow, after confirmation the PI will be 'requires_capture'
    // Save payment details and mark offer as held
    offer.paymentIntentId = pi.id;
    offer.paymentStatus = 'held';
    offer.studentAcceptedAt = new Date();
    offer.status = 'accepted';
    await offer.save();

    try {
      await Payment.create({
        offerId: offer._id,
        paymentIntentId: pi.id,
        amount: offer.offeredAmount,
        method: 'card',
        status: 'held'
      });
    } catch (err) {
      console.error('⚠️ Error creating payment record:', err);
    }

    // Add order to freelancer.orders and notify student
    try {
      const freelancer = await Freelancer.findById(offer.freelancerId);
      if (freelancer) {
        freelancer.orders = freelancer.orders || [];
        freelancer.orders.push({
          offerId: offer._id,
          clientName: offer.studentName,
          project: pi.description || `Gig ${offer.gigId}`,
          payment: offer.offeredAmount,
          status: 'In Progress'
        });
        await freelancer.save();
      }
    } catch (err) {
      console.error('⚠️ Error adding order to freelancer:', err);
    }

    try {
      const student = await Student.findById(offer.studentId);
      if (student) {
        student.notifications = student.notifications || [];
        student.notifications.push({ message: `Payment of PKR ${offer.offeredAmount} held. Order created for your gig.`, read: false, createdAt: new Date() });
        await student.save();
      }
    } catch (err) {
      console.error('⚠️ Error adding student notification:', err);
    }

    res.status(200).json({ message: 'Payment held and order created', offer, paymentIntentId: pi.id });
  } catch (err) {
    console.error('❌ Error finalizing payment:', err);
    res.status(500).json({ message: 'Error finalizing payment', error: err.message });
  }
};

// Deliver gig (freelancer submits delivery)
export const deliverGig = async (req, res) => {
  try {
    const { offerId } = req.params;
    const { deliveryLink } = req.body;

    const offer = await GigOffer.findById(offerId);
    if (!offer) return res.status(404).json({ message: "Offer not found" });

    // Ensure the gig wasn't past its deadline
    const gig = await StudentGig.findById(offer.gigId);
    if (gig && gig.deadline) {
      const now = new Date();
      if (now > new Date(gig.deadline)) {
        // If payment was held, cancel/return it
        if (offer.paymentStatus === "held" && offer.paymentIntentId) {
          try {
            if (offer.paymentIntentId.startsWith("pi_")) {
              if (stripe) {
                try {
                  await stripe.paymentIntents.cancel(offer.paymentIntentId);
                } catch (err) {
                  console.error("⚠️ Error cancelling Stripe payment intent after deadline:", err);
                }
              } else {
                console.warn("⚠️ Stripe not configured - cannot cancel payment intent. Marking payment as canceled locally.");
              }

              // update payment record
              try {
                const p = await Payment.findOne({ offerId: offer._id });
                if (p) {
                  p.status = "canceled";
                  p.updatedAt = new Date();
                  await p.save();
                }
              } catch (err) {
                console.error("⚠️ Error updating payment record after cancel:", err);
              }
            }
          } catch (err) {
            console.error("⚠️ Error cancelling payment intent after deadline:", err);
          }
          // persist changes to offer using findByIdAndUpdate to ensure update
          const updated = await GigOffer.findByIdAndUpdate(offerId, {
            paymentStatus: "released",
            status: "rejected",
            updatedAt: new Date()
          }, { new: true });

          // Notify the student about refund/return
          try {
            const student = await Student.findById(offer.studentId);
            if (student) {
              student.notifications = student.notifications || [];
              student.notifications.push({ message: `Your payment for gig ${gig.title} has been returned since delivery was attempted after the deadline.`, read: false, createdAt: new Date() });
              await student.save();
            }
          } catch (err) {
            console.error("⚠️ Error notifying student about refund:", err);
          }

          return res.status(400).json({ message: "Cannot deliver after deadline. Payment returned to student.", offer: updated });
        }
      }
    }

    // Prevent duplicate deliveries: if already delivered or completed, reject
    if (offer.status === 'delivered' || offer.status === 'completed') {
      return res.status(400).json({ message: 'Offer already delivered' , offer });
    }

    if (!offer.bothAccepted) {
      // Allow delivery when payment has been held by the student
      if (offer.paymentStatus !== "held") {
        return res.status(400).json({ message: "Offer must be accepted by both parties or payment must be held before delivery" });
      }
    }

    // Build update payload and persist using findByIdAndUpdate to avoid transient in-memory doc issues
    const updatePayload = {
      deliveryLink,
      deliveredAt: new Date(),
      status: "delivered",
      updatedAt: new Date(),
      freelancerAcceptedAt: offer.freelancerAcceptedAt || new Date(),
      bothAccepted: !!(offer.freelancerAcceptedAt || offer.studentAcceptedAt)
    };

    const updatedOffer = await GigOffer.findByIdAndUpdate(offerId, updatePayload, { new: true });

    // Update freelancer order status if linked
    try {
      const freelancer = await Freelancer.findById(offer.freelancerId);
      if (freelancer && Array.isArray(freelancer.orders)) {
        const o = freelancer.orders.find(x => String(x.offerId) === String(offer._id));
        if (o) {
          o.status = "Delivered";
          o.deliveredAt = updatePayload.deliveredAt;
        }
        await freelancer.save();
      }
    } catch (err) {
      console.error("⚠️ Error updating freelancer order status on delivery:", err);
    }

    res.status(200).json({ message: "Gig delivered successfully", offer: updatedOffer });
  } catch (err) {
    console.error("❌ Error delivering gig:", err);
    res.status(500).json({ message: "Error delivering gig", error: err.message });
  }
};

// Student accepts delivery and releases payment
export const acceptDelivery = async (req, res) => {
  try {
    const { offerId } = req.params;

    const offer = await GigOffer.findById(offerId);
    if (!offer) return res.status(404).json({ message: "Offer not found" });

    if (offer.status !== "delivered") {
      return res.status(400).json({ message: "Gig must be delivered first" });
    }

    // Confirm payment intent to charge the customer
    if (offer.paymentIntentId) {
      try {
        if (offer.paymentIntentId.startsWith("pi_")) {
          // For Stripe-based payment intents, attempt to capture if configured
          if (stripe) {
            try {
              await stripe.paymentIntents.capture(offer.paymentIntentId);
            } catch (err) {
              console.error("⚠️ Error capturing Stripe payment intent:", err);
            }
          } else {
            console.warn("⚠️ Stripe not configured - marking payment as captured in DB for manual settlement");
          }

          // Update payment record to 'captured' in DB
          try {
            const p = await Payment.findOne({ offerId: offer._id });
            if (p) {
              p.status = "captured";
              p.capturedAt = new Date();
              p.updatedAt = new Date();
              await p.save();
            }
          } catch (err) {
            console.error("⚠️ Error updating payment record after capture:", err);
          }
        } else {
          // Offline holds are considered released on acceptance - mark captured locally
          try {
            const p = await Payment.findOne({ offerId: offer._id });
            if (p) {
              p.status = "captured";
              p.capturedAt = new Date();
              p.updatedAt = new Date();
              await p.save();
            }
          } catch (err) {
            console.error("⚠️ Error updating offline payment record on acceptance:", err);
          }
        }
      } catch (err) {
        console.error("Stripe capture error:", err);
      }
    }

    offer.status = "completed";
    offer.paymentStatus = "released";
    offer.studentAcceptedAt = new Date();
    offer.updatedAt = new Date();
    await offer.save();

    // Reward freelancer earnings and update freelancer order status
    try {
      const freelancer = await Freelancer.findById(offer.freelancerId);
      if (freelancer) {
        freelancer.earnings = (freelancer.earnings || 0) + (offer.offeredAmount || 0);
        // mark matching order as completed
        if (Array.isArray(freelancer.orders)) {
          const o = freelancer.orders.find(x => x.payment === offer.offeredAmount && x.clientName === offer.studentName && x.status === "In Progress");
          if (o) { o.status = "Completed"; o.completedAt = new Date(); }
        }
        await freelancer.save();
      }
    } catch (err) {
      console.error("⚠️ Error updating freelancer on delivery acceptance:", err);
    }

    // Notify student and freelancer
    try {
      const student = await Student.findById(offer.studentId);
      if (student) {
        student.notifications = student.notifications || [];
        student.notifications.push({ message: `You accepted delivery for gig. PKR ${offer.offeredAmount} released to freelancer.`, read: false, createdAt: new Date() });
        await student.save();
      }
    } catch (err) {
      console.error("⚠️ Error notifying student on delivery acceptance:", err);
    }

    res.status(200).json({ message: "Delivery accepted and payment released", offer });
  } catch (err) {
    console.error("❌ Error accepting delivery:", err);
    res.status(500).json({ message: "Error accepting delivery", error: err.message });
  }
};
