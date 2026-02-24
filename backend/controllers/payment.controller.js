import Stripe from 'stripe';
import { Booking } from '../models/Booking.model.js';

// Safely initialize Stripe so backend can run even if key is missing
let stripe = null;
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('⚠️ STRIPE_SECRET_KEY not set. Stripe payments are disabled.');
} else {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
}

// ✅ Handle Stripe Webhooks
export const handleWebhook = async (req, res) => {
  if (!stripe) {
    return res.status(400).json({ message: "Stripe not configured on server" });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('Payment succeeded:', paymentIntent.id);

      // Find booking and update payment status
      try {
        const booking = await Booking.findOne({ paymentIntentId: paymentIntent.id });
        if (booking) {
          booking.paymentStatus = 'captured';
          await booking.save();
          console.log('Booking payment status updated to captured');
        }
      } catch (error) {
        console.error('Error updating booking payment status:', error);
      }
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('Payment failed:', failedPayment.id);

      try {
        const booking = await Booking.findOne({ paymentIntentId: failedPayment.id });
        if (booking) {
          booking.paymentStatus = 'failed';
          await booking.save();
          console.log('Booking payment status updated to failed');
        }
      } catch (error) {
        console.error('Error updating booking payment status:', error);
      }
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};

// ✅ Create Payment Intent
export const createPaymentIntent = async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ message: "Payments are disabled: STRIPE_SECRET_KEY not configured" });
    }
    const { bookingId } = req.body;
    const studentId = req.student.id;

    const booking = await Booking.findOne({ _id: bookingId, studentId });
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(booking.proposedPrice * 100), // PKR paisa (100 paisa = 1 PKR)
      currency: 'pkr',
      metadata: { bookingId: booking._id.toString() },
      capture_method: 'manual', // Hold the payment
    });

    booking.paymentIntentId = paymentIntent.id;
    await booking.save();

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during creating payment intent" });
  }
};

// ✅ Confirm Payment
export const confirmPayment = async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ message: "Payments are disabled: STRIPE_SECRET_KEY not configured" });
    }
    const { paymentIntentId } = req.body;
    const studentId = req.student.id;

    const booking = await Booking.findOne({ paymentIntentId, studentId });
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId);
    booking.paymentStatus = 'captured';
    booking.status = 'confirmed';
    if (!booking.classDueBy) {
      const d = new Date();
      d.setDate(d.getDate() + 7);
      booking.classDueBy = d;
    }
    await booking.save();

    res.status(200).json({ message: "Payment confirmed", paymentIntent });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during confirming payment" });
  }
};

// ✅ Release Payment (after session completion)
export const releasePayment = async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ message: "Payments are disabled: STRIPE_SECRET_KEY not configured" });
    }
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.paymentIntentId) {
      await stripe.paymentIntents.capture(booking.paymentIntentId);
      booking.paymentStatus = 'released';
      await booking.save();
    }

    res.status(200).json({ message: "Payment released" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during releasing payment" });
  }
};

// ✅ Refund Payment
export const refundPayment = async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ message: "Payments are disabled: STRIPE_SECRET_KEY not configured" });
    }
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.paymentIntentId) {
      await stripe.refunds.create({ payment_intent: booking.paymentIntentId });
      booking.paymentStatus = 'refunded';
      await booking.save();
    }

    res.status(200).json({ message: "Payment refunded" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during refunding payment" });
  }
};

// Process expired session deadlines: refund to student if link not used / class not done by deadline, or link not sent by tutor by due date
export const processExpiredBookings = async (req, res) => {
  try {
    if (!stripe) {
      return res.status(200).json({ message: "Stripe not configured; skipped processing expired bookings" });
    }
    const now = new Date();
    const expiredByDeadline = await Booking.find({
      sessionLinkDeadline: { $exists: true, $ne: null, $lt: now },
      status: { $ne: 'completed' },
      paymentStatus: { $in: ['held', 'captured'] }
    });
    const expiredNoLink = await Booking.find({
      status: 'confirmed',
      paymentStatus: { $in: ['held', 'captured'] },
      $or: [
        { sessionLink: { $in: [null, ''] } },
        { sessionLink: { $exists: false } }
      ],
      classDueBy: { $exists: true, $ne: null, $lt: now }
    });
    const allExpired = [...expiredByDeadline];
    expiredNoLink.forEach((b) => { if (!allExpired.find((x) => x._id.toString() === b._id.toString())) allExpired.push(b); });
    for (const booking of allExpired) {
      try {
        if (booking.paymentIntentId) {
          await stripe.refunds.create({ payment_intent: booking.paymentIntentId });
          booking.paymentStatus = 'refunded';
          booking.status = 'cancelled';
          await booking.save();
        }
      } catch (e) {
        console.error('Refund failed for booking', booking._id, e.message);
      }
    }
    res.status(200).json({ message: `Processed ${allExpired.length} expired bookings` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};