import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  offerId: { type: mongoose.Schema.Types.ObjectId, ref: "GigOffer", required: true },
  paymentIntentId: String,
  amount: Number,
  method: { type: String }, // 'card', 'jazzcash', 'easypaisa', 'offline'
  status: { type: String, enum: ["pending", "held", "captured", "canceled", "refunded"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
  capturedAt: Date,
  updatedAt: { type: Date, default: Date.now }
});

const Payment = mongoose.models.Payment || mongoose.model("Payment", paymentSchema);

export default Payment;
