import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast'
import { loadStripe } from '@stripe/stripe-js';
import { Elements, useStripe, useElements, CardElement } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY || 'pk_test_51234567890');

const PaymentPage = () => {
  const { offerId } = useParams();
  const navigate = useNavigate();
  const [offer, setOffer] = useState(null);
  const [method, setMethod] = useState('card');
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOffer = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/v1/gig-offers/${offerId}`);
        setOffer(res.data);
        setAmount(res.data.offeredAmount);
      } catch (err) {
        console.error('Error fetching offer', err);
        alert('Error fetching offer');
      }
    };
    fetchOffer();
  }, [offerId]);

  const PaymentCardForm = () => {
    const stripe = useStripe();
    const elements = useElements();
    const [cardComplete, setCardComplete] = useState(false);

    const handleCardPay = async () => {
      if (!offer) return;
      if (Number(amount) !== Number(offer.offeredAmount)) return alert(`Please pay the exact amount: PKR ${offer.offeredAmount}`);
      if (!stripe || !elements) return alert('Stripe not ready');

      try {
        setLoading(true);
        // 1️⃣ Create PaymentIntent on server
        const res = await axios.post(`http://localhost:3000/api/v1/gig-offers/${offerId}/payment`, { amount, paymentMethodType: 'card' });

        // 2️⃣ Confirm payment on frontend with retries to avoid 'element not mounted' races
        const confirmWithRetries = async (clientSecret, maxAttempts = 5) => {
          let attempt = 0;
          while (attempt < maxAttempts) {
            const cardEl = elements.getElement(CardElement);
            if (!cardEl) {
              attempt++;
              console.warn('CardElement not mounted yet, waiting...', attempt);
              await new Promise((r) => setTimeout(r, 200 * attempt));
              continue;
            }
            try {
              try { cardEl.blur(); } catch (e) {}
              await new Promise((r) => setTimeout(r, 150 * (attempt + 1)));
              const confirmResult = await stripe.confirmCardPayment(clientSecret, { payment_method: { card: cardEl } });
              if (confirmResult.error) {
                const msg = (confirmResult.error.message || '').toLowerCase();
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

        const confirmResult = await confirmWithRetries(res.data.clientSecret);
        if (confirmResult.error) {
          alert('Payment confirmation failed: ' + confirmResult.error.message);
          setLoading(false);
          return;
        }

        // 3️⃣ Finalize on server so it persists payment and creates order/notification
        const paymentIntentId = confirmResult.paymentIntent?.id || res.data.paymentIntentId;
        await axios.post(`http://localhost:3000/api/v1/gig-offers/${offerId}/payment/confirm`, { paymentIntentId });

        toast.success('Payment authorized & held!');
        navigate('/studentdashboard');
      } catch (err) {
        console.error('Payment card error', err);
        alert(err.response?.data?.message || err.message || 'Payment failed');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div>
        <div className="mb-3">
          <label className="block mb-2 font-semibold">Card Details</label>
          {/* hidden field to prevent browser autofill */}
          <input type="text" name="no_autofill" autoComplete="off" style={{ display: 'none' }} />
          <div className="p-3 border rounded">
            <CardElement options={{ style: { base: { fontSize: '16px' } } }} onChange={(e) => setCardComplete(!!e.complete)} />
          </div>
          {!cardComplete && <p className="text-sm text-gray-500 mt-2">Enter complete card details to enable payment.</p>}
        </div>
        <button onClick={handleCardPay} disabled={loading || !cardComplete} className="bg-blue-600 text-white px-4 py-2 rounded">
          {loading ? 'Processing...' : `Pay PKR ${offer.offeredAmount}`}
        </button>
      </div>
    );
  };

  const handlePay = async () => {
    if (!offer) return;
    if (Number(amount) !== Number(offer.offeredAmount)) return alert(`Please pay the exact amount: PKR ${offer.offeredAmount}`);
    try {
      setLoading(true);
      const res = await axios.post(`http://localhost:3000/api/v1/gig-offers/${offerId}/payment`, { paymentMethodType: method, amount });
      toast.success(res.data.message || 'Payment held');
      navigate('/studentdashboard');
    } catch (err) {
      console.error('Payment error', err);
      alert(err.response?.data?.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  if (!offer) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Pay for Offer</h2>
      <div className="bg-white p-4 rounded shadow mb-4">
        <div className="mb-2">Gig: {offer.gig?.title || offer.gigTitle || 'Gig'}</div>
        <div className="mb-2">Freelancer: {offer.freelancerName}</div>
        <div className="mb-2 font-bold text-lg">Amount: PKR {offer.offeredAmount}</div>
      </div>

      <div className="bg-white p-4 rounded shadow mb-4">
        <label className="block mb-2 font-semibold">Select Payment Method</label>
        <select value={method} onChange={e => setMethod(e.target.value)} className="w-full border rounded p-2 mb-3">
          <option value="card">Card</option>
          <option value="jazzcash">JazzCash</option>
          <option value="easypaisa">EasyPaisa</option>
        </select>
        <label className="block mb-2 font-semibold">Amount</label>
        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full border rounded p-2 mb-3" />
        {method === 'card' ? (
          <Elements stripe={stripePromise}>
            <PaymentCardForm />
          </Elements>
        ) : (
          <button onClick={handlePay} disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">
            {loading ? 'Processing...' : `Pay PKR ${offer.offeredAmount}`}
          </button>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;