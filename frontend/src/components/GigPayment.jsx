import React, { useState } from "react";
import axios from "axios";
import { toast } from 'react-hot-toast'
import { FaLock, FaCheckCircle } from "react-icons/fa";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";

const GigPayment = ({ offer, onPaymentSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [method, setMethod] = useState("card");
  const [amountInput, setAmountInput] = useState(offer.offeredAmount || 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [cardReady, setCardReady] = useState(false);

  const BASE_URL = "http://localhost:3000/api/v1/gig-offers";

  const handlePayment = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      // Validate exact amount
      const entered = Number(amountInput);
      if (entered !== Number(offer.offeredAmount)) {
        alert(`Please enter the exact agreed amount: PKR ${offer.offeredAmount}`);
        setLoading(false);
        return;
      }

      if (method === "card") {
        if (!stripe || !elements) {
          alert("Stripe not loaded yet. Please wait a moment and try again.");
          setLoading(false);
          return;
        }

        const cardElement = elements.getElement(CardElement);
        // ensure user has entered full card details
        if (!cardComplete) {
          alert('Please enter complete card details before confirming payment.');
          setLoading(false);
          return;
        }
        if (!cardElement) {
          setError('Card input not ready. Please re-open the payment form or refresh the page.');
          alert('Card input not ready. Please re-open the payment form or refresh the page.');
          setLoading(false);
          return;
        }

        // 1️⃣ Ask backend to create PaymentIntent
        const { data } = await axios.post(`${BASE_URL}/${offer._id}/payment`, { amount: entered, paymentMethodType: 'card' });

        // 2️⃣ Confirm payment on frontend using the CardElement (re-fetch element each attempt to avoid mount races)
        const confirmWithRetries = async (clientSecret, maxAttempts = 4) => {
          let attempt = 0;
          while (attempt < maxAttempts) {
            const el = elements.getElement(CardElement);
            if (!el) {
              attempt++;
              console.warn('CardElement missing, retrying...', attempt);
              await new Promise((r) => setTimeout(r, 200 * attempt));
              continue;
            }

            try {
              await new Promise((r) => setTimeout(r, 120 * (attempt + 1)));
              const confirmResult = await stripe.confirmCardPayment(clientSecret, { payment_method: { card: el } });
              if (confirmResult.error) {
                const code = confirmResult.error.code || '';
                const msg = (confirmResult.error.message || '').toLowerCase();
                if (code && ['incomplete_number', 'incomplete_cvc', 'incomplete_expiry', 'invalid_number', 'invalid_expiry_month', 'invalid_expiry_year', 'invalid_cvc'].includes(code)) {
                  try { if (el && typeof el.focus === 'function') el.focus(); } catch (e) {}
                  return confirmResult;
                }
                if (msg.includes('could not retrieve') || msg.includes('specified element')) {
                  attempt++;
                  console.warn('confirmCardPayment element retrieval failed, retrying...', attempt, msg);
                  await new Promise((r) => setTimeout(r, 200 * attempt));
                  continue;
                }
                return confirmResult;
              }
              return confirmResult;
            } catch (err) {
              const msg = (err?.message || '').toLowerCase();
              if (msg.includes('could not retrieve') || msg.includes('specified element')) {
                attempt++;
                console.warn('confirmCardPayment threw, retrying...', attempt, msg, err);
                await new Promise((r) => setTimeout(r, 200 * attempt));
                continue;
              }
              throw err;
            }
          }
          throw new Error('Card input not ready for confirmation');
        };

        const result = await confirmWithRetries(data.clientSecret);

        if (result.error) {
          const msg = result.error.message || 'Payment confirmation failed';
          setError(msg);
          console.warn('Stripe confirm error:', result.error);
          alert(msg);
          setLoading(false);
          return;
        }

        // 3️⃣ Notify backend to finalize and record the held payment
        const paymentIntentId = result.paymentIntent?.id || data.paymentIntentId;
        await axios.post(`${BASE_URL}/${offer._id}/payment/confirm`, { paymentIntentId });

        // Fetch updated offer and return
        const updated = await axios.get(`${BASE_URL}/${offer._id}`);
        setSuccess(true);
        toast.success('Payment authorized & held!');
        onPaymentSuccess(updated.data);
      } else {
        // Offline methods
        const payload = {
          paymentMethodType: method,
          amount: entered,
        };

      // Blur CardElement on unmount to avoid aria-hidden warnings when parent is hidden
      React.useEffect(() => {
        return () => {
          try {
            const el = elements?.getElement(CardElement);
            if (el && typeof el.blur === 'function') el.blur();
          } catch (e) {
            // ignore
          }
        };
      }, [elements]);
        const response = await axios.post(`${BASE_URL}/${offer._id}/payment`, payload);
        const updated = await axios.get(`${BASE_URL}/${offer._id}`);
        setSuccess(true);
        toast.success(response.data.message || "Payment held (offline)");
        onPaymentSuccess(updated.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Payment failed");
      alert("❌ " + (err.response?.data?.message || err.message || "Payment failed"));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-300">
        <div className="flex items-center gap-3 mb-4">
          <FaCheckCircle className="text-3xl text-green-600" />
          <h3 className="text-lg font-bold text-gray-800">Payment Held</h3>
        </div>
        <div className="bg-white rounded-lg p-4">
          <p className="text-sm text-gray-600">Amount Held on Card</p>
          <p className="text-3xl font-bold text-green-600">PKR {offer.offeredAmount}</p>
          <p className="text-xs text-gray-500 mt-2">
            Payment will be released once freelancer delivers the gig and you accept it.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handlePayment} className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border-2 border-blue-200">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <FaLock /> Secure Payment
      </h3>

      <div className="bg-white rounded-lg p-4 mb-4">
        <p className="text-sm text-gray-600">Agreed Amount</p>
        <input type="number" value={amountInput} onChange={(e) => setAmountInput(e.target.value)} className="w-full text-3xl font-bold text-blue-600" />
        <p className="text-xs text-gray-500 mt-2">Enter the exact agreed amount: PKR {offer.offeredAmount}</p>
      </div>

      {/* Payment Methods */}
      <div className="bg-white rounded-lg p-4 mb-4 border-2 border-gray-300">
        <label className="block mb-2 font-semibold">Payment Method</label>
        <select value={method} onChange={(e) => setMethod(e.target.value)} className="w-full border rounded p-2 mb-2">
          <option value="card">Card</option>
          <option value="jazzcash">JazzCash</option>
          <option value="easypaisa">EasyPaisa</option>
        </select>
        {method === "card" && (
          <div className="mb-3">
            <label className="block mb-2 font-semibold">Card Details</label>
            {/* hidden field to prevent browser autofill */}
            <input type="text" name="no_autofill" autoComplete="off" style={{ display: 'none' }} />
            <div className="p-3 border rounded">
              <CardElement
                options={{ style: { base: { fontSize: '16px' } } }}
                onReady={() => { console.log('CardElement mounted'); setCardReady(true); }}
                onChange={(e) => {
                  setCardComplete(!!e.complete);
                  if (e.error) setError(e.error.message);
                  else setError("");
                }}
                onBlur={() => console.log('CardElement blur')}
                onFocus={() => console.log('CardElement focus')}
              />
            </div>
            {!cardComplete && <p className="text-sm text-gray-500 mt-2">Enter complete card details to enable payment.</p>}
            {!cardReady && <p className="text-sm text-orange-500 mt-2">Card input is initializing, please wait...</p>}
          </div>
        )}
        <p className="text-xs text-gray-500">Note: For now payments are simulated for non-card methods and held by the platform.</p>
      </div>

      {/* Error Message */}
      {error && <div className="text-red-600 text-sm mb-4 bg-red-50 p-3 rounded-lg">⚠️ {error}</div>}

      {/* Payment Info */}
      <div className="bg-blue-50 p-3 rounded-lg mb-4 text-sm text-gray-700">
        <p className="mb-2">
          ✓ Amount will be <strong>held</strong> on your card (not charged immediately)
        </p>
        <p className="mb-2">
          ✓ Funds will be released to freelancer <strong>only after</strong> you accept the delivery
        </p>
        <p>✓ Use Stripe test card: <code className="bg-white px-2 py-1 rounded">4242 4242 4242 4242</code></p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || (method === 'card' && (!stripe || !cardReady || !cardComplete))}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition"
      >
        {loading ? "Processing..." : `Hold Payment - PKR ${offer.offeredAmount}`}
      </button>
    </form>
  );
};

export default GigPayment;
