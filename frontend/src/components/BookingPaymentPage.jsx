import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, useStripe, useElements, CardElement } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY || "pk_test_51234567890");
const API = "http://localhost:3000/api/v1";

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

const BookingPaymentForm = ({ booking, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [cardComplete, setCardComplete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePay = async (e) => {
    e.preventDefault();
    if (!booking || !stripe || !elements) return;
    setLoading(true);
    setError("");

    try {
      const { data } = await axios.post(
        `${API}/payments/create-intent`,
        { bookingId: booking._id },
        authHeaders()
      );
      const clientSecret = data.clientSecret;
      if (!clientSecret) {
        setError("Could not create payment session");
        setLoading(false);
        return;
      }

      const cardEl = elements.getElement(CardElement);
      if (!cardEl) {
        setError("Card input not ready. Please try again.");
        setLoading(false);
        return;
      }

      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: cardEl },
      });

      if (confirmError) {
        setError(confirmError.message || "Payment failed");
        setLoading(false);
        return;
      }

      const paymentIntentId = paymentIntent?.id || booking.paymentIntentId;
      if (paymentIntentId) {
        await axios.post(
          `${API}/payments/confirm`,
          { paymentIntentId },
          authHeaders()
        );
      }
      toast.success("Payment successful!");
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="mb-3">
        <label className="block mb-2 font-semibold">Card Details</label>
        <div className="p-3 border rounded bg-white">
          <CardElement
            options={{ style: { base: { fontSize: "16px" } } }}
            onChange={(e) => setCardComplete(!!e.complete)}
          />
        </div>
        {!cardComplete && (
          <p className="text-sm text-gray-500 mt-2">Enter complete card details to enable payment.</p>
        )}
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button
        onClick={handlePay}
        disabled={loading || !cardComplete}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-6 rounded-lg"
      >
        {loading ? "Processing..." : `Pay PKR ${booking?.proposedPrice || 0}`}
      </button>
    </div>
  );
};

const BookingPaymentPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    const fetchBooking = async () => {
      try {
        const res = await axios.get(`${API}/students/bookings`, authHeaders());
        const list = res.data.bookings || [];
        const b = list.find((x) => x._id === bookingId);
        setBooking(b || null);
      } catch (err) {
        toast.error("Error loading booking");
        setBooking(null);
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [bookingId, navigate]);

  const handleSuccess = () => {
    navigate("/studentdashboard");
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!booking) {
    return (
      <div className="p-8 text-center">
        <p>Booking not found.</p>
        <button
          onClick={() => navigate("/studentdashboard")}
          className="mt-4 text-blue-600 underline"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const tutorName =
    booking.tutorId?.firstName && booking.tutorId?.lastName
      ? `${booking.tutorId.firstName} ${booking.tutorId.lastName}`
      : "Tutor";

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Pay for Lesson</h2>
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <p className="font-semibold">Tutor: {tutorName}</p>
          <p className="text-gray-600">Subject: {booking.subject}</p>
          <p className="text-lg font-bold text-blue-600">Amount: PKR {booking.proposedPrice}</p>
        </div>
        <Elements stripe={stripePromise}>
          <BookingPaymentForm booking={booking} onSuccess={handleSuccess} />
        </Elements>
        <button
          onClick={() => navigate("/studentdashboard")}
          className="mt-6 text-gray-600 hover:text-gray-800 underline"
        >
          Cancel and go back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default BookingPaymentPage;
