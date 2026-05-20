import React, { useState } from "react";
import { Elements, useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { toast } from "react-hot-toast";

const stripePromise = import.meta.env.VITE_STRIPE_KEY ? loadStripe(import.meta.env.VITE_STRIPE_KEY) : null;

function WithdrawModal({ open, onClose, maxAmount, onWithdraw }) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const stripe = useStripe();
  const elements = useElements();

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const amt = Number(amount);
    if (!amt || amt <= 0 || amt > maxAmount) {
      setError(`Enter a valid amount (max PKR ${maxAmount})`);
      return;
    }
    if (!stripe || !elements) {
      setError("Stripe not loaded");
      return;
    }
    setLoading(true);
    try {
      const cardElement = elements.getElement(CardElement);
      // Call parent to handle backend withdrawal logic
      await onWithdraw(amt, cardElement, stripe);
      setAmount("");
      onClose();
    } catch (err) {
      setError(err.message || "Withdrawal failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-black">✖</button>
        <h2 className="text-2xl font-bold mb-4">Withdraw Earnings</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-semibold">Amount to Withdraw (PKR)</label>
            <input
              type="number"
              min="1"
              max={maxAmount}
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full border rounded p-2"
              required
            />
            <div className="text-xs text-gray-500">Available: PKR {maxAmount}</div>
          </div>
          <div>
            <label className="block mb-1 font-semibold">Stripe Card Details</label>
            <CardElement className="border rounded p-2" options={{hidePostalCode: true}} />
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 rounded font-semibold hover:bg-green-700 transition disabled:opacity-50"
          >
            {loading ? "Processing..." : "Withdraw"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function WithdrawModalWithStripe(props) {
  if (!stripePromise) {
    return props.open ? (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <p className="text-red-600 font-semibold">Stripe is not configured. Set VITE_STRIPE_KEY in your .env.local file.</p>
          <button onClick={props.onClose} className="mt-4 bg-gray-500 text-white px-4 py-2 rounded">Close</button>
        </div>
      </div>
    ) : null;
  }
  return (
    <Elements stripe={stripePromise}>
      <WithdrawModal {...props} />
    </Elements>
  );
}
