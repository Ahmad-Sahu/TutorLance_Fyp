import StudentGig from "../models/Student_Gig.model.js";
import { Freelancer } from "../models/freelancers.model.js";
import { Student } from "../models/students.model.js";
import GigOffer from "../models/GigOffer.model.js";
import Payment from "../models/Payment.model.js";
import Stripe from "stripe";

import mongoose from "mongoose";

let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  try {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  } catch (err) {
    console.warn('⚠️ Stripe initialization failed in Student_Gig.controller.js:', err.message);
    stripe = null;
  }
} else {
  console.warn('⚠️ STRIPE_SECRET_KEY not set. Stripe operations will be skipped.');
}

// Create gig
export const createGig = async (req, res) => {
  try {
    const { title, description, domain, budget, studentId, studentName } = req.body;

    console.log("📝 Creating gig with studentId:", studentId, "type:", typeof studentId);

    // Convert studentId string to ObjectId using 'new'
    const gig = await StudentGig.create({
      title,
      description,
      domain,
      budget,
      studentId: new mongoose.Types.ObjectId(studentId),
      studentName,
    });

    console.log("✅ Gig created:", gig._id, "studentId:", gig.studentId);

    res.status(201).json({
      success: true,
      message: "Gig Created!",
      gig,
    });
  } catch (error) {
    console.log("Error creating gig:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};


// Get gigs for freelancer
export const getRelevantGigs = async (req, res) => {
  try {
    const freelancer = await Freelancer.findById(req.params.id);

    if (!freelancer)
      return res.status(404).json({ success: false, message: "Freelancer not found" });

    const skills = freelancer.skills.toLowerCase(); 

    console.log("🔍 Finding gigs for freelancer", freelancer.name, "with skills:", skills);

    // Find gigs matching the freelancer's domain/skills
    const gigs = await StudentGig.find({
      domain: { $regex: skills, $options: "i" },
    });

    console.log("✅ Found", gigs.length, "relevant gigs");
    gigs.forEach(gig => {
      console.log("   - Gig:", gig.title, "by", gig.studentName || "(NO NAME)", "Budget: PKR", gig.budget);
    });

    // Return gigs as-is. StudentName should already be saved when gig was created.
    // If it's missing, it means the gig was created with old code - that's ok, we show "Unknown Student"
    const enrichedGigs = gigs.map(gig => {
      return {
        ...gig.toObject(),
        studentName: gig.studentName || "Unknown Student"
      };
    });

    res.json({ success: true, gigs: enrichedGigs });
  } catch (error) {
    console.error("❌ Error in getRelevantGigs:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get gigs for a specific student (management view)
export const getGigsByStudent = async (req, res) => {
  try {
    const { studentId } = req.query;
    if (!studentId) return res.status(400).json({ success: false, message: "studentId is required" });

    const gigs = await StudentGig.find({ studentId });
    return res.json(gigs);
  } catch (error) {
    console.log("Error fetching student gigs:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Update a gig (student management)
export const updateGig = async (req, res) => {
  try {
    const gigId = req.params.id;
    const updates = req.body;

    const gig = await StudentGig.findByIdAndUpdate(gigId, updates, { new: true });
    if (!gig) return res.status(404).json({ success: false, message: "Gig not found" });

    return res.json({ success: true, message: "Gig updated", gig });
  } catch (error) {
    console.log("Error updating gig:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Delete a gig (with cascading cleanup and refunds)
export const deleteGig = async (req, res) => {
  try {
    const gigId = req.params.id;

    // Find gig
    const gig = await StudentGig.findById(gigId);
    if (!gig) return res.status(404).json({ success: false, message: "Gig not found" });

    // Authorization: ensure the requester is the gig owner (student)
    const { studentId } = req.query;
    if (!studentId || String(gig.studentId) !== String(studentId)) {
      return res.status(403).json({ success: false, message: 'Unauthorized: only the gig owner may delete this gig' });
    }

    // Find all offers related to this gig
    const offers = await GigOffer.find({ gigId });

    for (const offer of offers) {
      try {
        // Handle payments if any
        const payment = await Payment.findOne({ offerId: offer._id });
        if (payment && (payment.status === 'held' || payment.status === 'pending' || payment.status === 'captured')) {
          // If Stripe payment intent
          if (payment.paymentIntentId && payment.paymentIntentId.startsWith('pi_')) {
            try {
              if (stripe) {
                if (payment.status === 'captured') {
                  // Create refund for captured payment
                  await stripe.refunds.create({ payment_intent: payment.paymentIntentId });
                  payment.status = 'refunded';
                  payment.updatedAt = new Date();
                  await payment.save();

                  // Deduct freelancer earnings if already added
                  try {
                    const freelancer = await Freelancer.findById(offer.freelancerId);
                    if (freelancer) {
                      freelancer.earnings = Math.max(0, (freelancer.earnings || 0) - (offer.offeredAmount || 0));
                      // Remove order linked to this offer
                      if (Array.isArray(freelancer.orders)) {
                        freelancer.orders = freelancer.orders.filter(o => String(o.offerId) !== String(offer._id));
                      }
                      freelancer.notifications = freelancer.notifications || [];
                      freelancer.notifications.push({ message: `Gig '${gig.title}' was deleted and captured payment was refunded. Earnings adjusted.`, read: false, createdAt: new Date() });
                      await freelancer.save();
                    }
                  } catch (err) {
                    console.error('⚠️ Error adjusting freelancer earnings on refund:', err);
                  }

                  // Notify student
                  try {
                    const student = await Student.findById(offer.studentId);
                    if (student) {
                      student.notifications = student.notifications || [];
                      student.notifications.push({ message: `Your payment for gig '${gig.title}' has been refunded and the gig removed.`, read: false, createdAt: new Date() });
                      await student.save();
                    }
                  } catch (err) {
                    console.error('⚠️ Error notifying student on refund:', err);
                  }

                } else {
                  // If it was only held (not captured), cancel the intent to release funds
                  try {
                    await stripe.paymentIntents.cancel(payment.paymentIntentId);
                  } catch (err) {
                    console.error('⚠️ Error cancelling payment intent:', err);
                  }
                  payment.status = 'canceled';
                  payment.updatedAt = new Date();
                  await payment.save();

                  // Notify student
                  try {
                    const student = await Student.findById(offer.studentId);
                    if (student) {
                      student.notifications = student.notifications || [];
                      student.notifications.push({ message: `Payment hold for your gig '${gig.title}' has been released due to gig deletion.`, read: false, createdAt: new Date() });
                      await student.save();
                    }
                  } catch (err) {
                    console.error('⚠️ Error notifying student after cancellation:', err);
                  }

                  // Notify freelancer and remove order
                  try {
                    const freelancer = await Freelancer.findById(offer.freelancerId);
                    if (freelancer) {
                      freelancer.orders = (freelancer.orders || []).filter(o => String(o.offerId) !== String(offer._id));
                      freelancer.notifications = freelancer.notifications || [];
                      freelancer.notifications.push({ message: `Gig '${gig.title}' was deleted by the student. Any payment hold was released.`, read: false, createdAt: new Date() });
                      await freelancer.save();
                    }
                  } catch (err) {
                    console.error('⚠️ Error updating freelancer after payment cancellation:', err);
                  }
                }
              } else {
                // Stripe not configured - mark payment as canceled/refunded in DB and notify users for manual processing
                try {
                  if (payment.status === 'captured') {
                    payment.status = 'refunded';
                  } else {
                    payment.status = 'canceled';
                  }
                  payment.updatedAt = new Date();
                  await payment.save();

                  const freelancer = await Freelancer.findById(offer.freelancerId);
                  if (freelancer) {
                    freelancer.orders = (freelancer.orders || []).filter(o => String(o.offerId) !== String(offer._id));
                    freelancer.notifications = freelancer.notifications || [];
                    freelancer.notifications.push({ message: `Gig '${gig.title}' was deleted by the student. Refund will be processed manually by admin.`, read: false, createdAt: new Date() });
                    await freelancer.save();
                  }

                  const student = await Student.findById(offer.studentId);
                  if (student) {
                    student.notifications = student.notifications || [];
                    student.notifications.push({ message: `Payment hold for gig '${gig.title}' has been released due to gig deletion. Please contact support for refunds.`, read: false, createdAt: new Date() });
                    await student.save();
                  }
                } catch (err) {
                  console.error('⚠️ Error updating payment/freelancer/student records when Stripe not configured:', err);
                }
              }
            } catch (err) {
              console.error('⚠️ Error handling stripe refund/cancel for offer', offer._id, err);
            }
          } else {
            // Offline payments - mark canceled or refunded accordingly
            try {
              if (payment.status === 'captured') {
                payment.status = 'refunded';
              } else {
                payment.status = 'canceled';
              }
              payment.updatedAt = new Date();
              await payment.save();
            } catch (err) {
              console.error('⚠️ Error updating offline payment record:', err);
            }

            // Notify freelancer and remove order
            try {
              const freelancer = await Freelancer.findById(offer.freelancerId);
              if (freelancer) {
                freelancer.orders = (freelancer.orders || []).filter(o => String(o.offerId) !== String(offer._id));
                freelancer.notifications = freelancer.notifications || [];
                freelancer.notifications.push({ message: `Gig '${gig.title}' was deleted. Offline payment status updated.`, read: false, createdAt: new Date() });
                await freelancer.save();
              }
            } catch (err) {
              console.error('⚠️ Error updating freelancer for offline payment:', err);
            }

            try {
              const student = await Student.findById(offer.studentId);
              if (student) {
                student.notifications = student.notifications || [];
                student.notifications.push({ message: `Payment hold for gig '${gig.title}' has been released due to gig deletion.`, read: false, createdAt: new Date() });
                await student.save();
              }
            } catch (err) {
              console.error('⚠️ Error notifying student for offline payment:', err);
            }
          }
        } else {
          // No payment involved - just notify freelancer
          try {
            const freelancer = await Freelancer.findById(offer.freelancerId);
            if (freelancer) {
              freelancer.orders = (freelancer.orders || []).filter(o => String(o.offerId) !== String(offer._id));
              freelancer.notifications = freelancer.notifications || [];
              freelancer.notifications.push({ message: `Gig '${gig.title}' was deleted by the student.`, read: false, createdAt: new Date() });
              await freelancer.save();
            }
          } catch (err) {
            console.error('⚠️ Error notifying freelancer about gig deletion:', err);
          }
        }
      } catch (err) {
        console.error('⚠️ Error processing offer during gig deletion:', err);
      }
    }

    // Delete all offers for this gig now that cleanup is done
    try {
      await GigOffer.deleteMany({ gigId });
    } catch (err) {
      console.error('⚠️ Error deleting related offers:', err);
    }

    // Finally delete the student gig
    await StudentGig.findByIdAndDelete(gigId);

    res.json({ success: true, message: 'Gig deleted and related offers/payments cleaned up' });
  } catch (error) {
    console.log('Error deleting gig:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};
