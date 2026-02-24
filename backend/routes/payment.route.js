import express from 'express';
import { createPaymentIntent, confirmPayment, releasePayment, refundPayment, handleWebhook, processExpiredBookings } from '../controllers/payment.controller.js';
import { authenticateStudent } from '../middleware/auth.js';

const router = express.Router();

// ✅ Stripe Webhook (no auth needed)
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// ✅ Create Payment Intent (Student)
router.post('/create-intent', authenticateStudent, createPaymentIntent);

// ✅ Confirm Payment (Student)
router.post('/confirm', authenticateStudent, confirmPayment);

// ✅ Release Payment (Admin/Tutor)
router.post('/release/:bookingId', releasePayment);

// ✅ Refund Payment (Admin)
router.post('/refund/:bookingId', refundPayment);

// Process expired session deadlines (refund student if class not done by deadline)
router.post('/process-expired', processExpiredBookings);

export default router;