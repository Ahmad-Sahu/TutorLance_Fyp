import React, { useState } from "react";
import axios from "axios";
import { toast } from 'react-hot-toast'
import { FaPlus, FaMinus, FaCheck, FaTimes, FaHandshake } from "react-icons/fa";

const GigNegotiation = ({ gig, freelancer, onOfferSent, offerId = null, existingOffer = null, isFreelancer = false, onAcceptOffer = null }) => {
  const [offerAmount, setOfferAmount] = useState(existingOffer?.offeredAmount || gig.budget || 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const BASE_URL = "http://localhost:3000/api/v1/gig-offers";

  const handleIncrement = () => {
    setOfferAmount(prev => prev + 50);
  };

  const handleDecrement = () => {
    if (offerAmount - 50 >= 0) {
      setOfferAmount(prev => prev - 50);
    }
  };

  const handleSendOffer = async () => {
    try {
      setLoading(true);
      setError("");
      const freelancerId = localStorage.getItem("freelancerId");

      const response = await axios.post(`${BASE_URL}/${freelancerId}/create`, {
        gigId: gig._id,
        offeredAmount: offerAmount
      });

      toast.success("✅ Counter offer sent successfully!");
      onOfferSent(response.data.offer);
    } catch (err) {
      setError(err.response?.data?.message || "Error sending offer");
      alert("❌ " + (err.response?.data?.message || "Error sending offer"));
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOffer = async () => {
    if (!offerId) return alert("❌ No offer to accept");
    try {
      setLoading(true);
      await axios.put(`${BASE_URL}/${offerId}/accept`, {
        acceptedBy: "freelancer"
      });
      toast.success("✅ Offer accepted! Waiting for student acceptance...");
      if (onAcceptOffer) onAcceptOffer();
    } catch (err) {
      alert("❌ " + (err.response?.data?.message || "Error accepting offer"));
    } finally {
      setLoading(false);
    }
  };

  if (offerId) {
    const handleSendCounterAsFreelancer = async () => {
      try {
        setLoading(true);
        await axios.put(`${BASE_URL}/${offerId}/update-amount`, { newAmount: offerAmount, updatedBy: isFreelancer ? 'freelancer' : 'student', comment: isFreelancer ? 'Freelancer counter' : 'Counter' });
        toast.success('✅ Counter sent');
        if (onOfferSent) onOfferSent();
      } catch (err) {
        alert('❌ ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border-2 border-blue-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4">📊 Active Negotiation</h3>
        <div className="bg-white rounded-lg p-4 mb-4">
          <p className="text-sm text-gray-600">Current Offer Amount</p>
          <p className="text-3xl font-bold text-blue-600">PKR {offerAmount}</p>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={handleDecrement}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2"
          >
            <FaMinus /> -50 PKR
          </button>
          <button
            onClick={handleIncrement}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2"
          >
            <FaPlus /> +50 PKR
          </button>
        </div>

        {/* Show negotiation history when available */}
        {existingOffer?.negotiationHistory && existingOffer.negotiationHistory.length > 0 && (
          <div className="mb-4 text-sm text-gray-600">
            <strong>History:</strong>
            <div className="space-y-1 mt-1">
              {existingOffer.negotiationHistory.map((h, idx) => (
                <div key={idx} className="flex justify-between">
                  <div>{h.updatedBy}: PKR {h.amount} {h.comment ? `- ${h.comment}` : ''}</div>
                  <div className="text-xs text-gray-400">{h.timestamp ? new Date(h.timestamp).toLocaleString() : ''}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <button onClick={handleSendCounterAsFreelancer} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">{loading ? 'Sending...' : 'Send Counter'}</button>
          <button onClick={() => { if (onAcceptOffer) onAcceptOffer(); }} className="px-4 py-2 bg-green-600 text-white rounded">Accept</button>
        </div>

        {error && <div className="text-red-600 text-sm mt-4">⚠️ {error}</div>}
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border-2 border-blue-200">
      <h3 className="text-lg font-bold text-gray-800 mb-4">💰 Send Counter Offer</h3>
      
      {/* Amount Display */}
      <div className="bg-white rounded-lg p-4 mb-4">
        <p className="text-sm text-gray-600">Counter Offer Amount</p>
        <p className="text-4xl font-bold text-blue-600">PKR {offerAmount}</p>
        <p className="text-xs text-gray-500 mt-1">Original Budget: PKR {gig.budget}</p>
      </div>

      {/* Increment/Decrement Buttons */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button
          onClick={handleDecrement}
          disabled={offerAmount <= 0}
          className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition"
        >
          <FaMinus /> -50 PKR
        </button>
        <button
          onClick={handleIncrement}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition"
        >
          <FaPlus /> +50 PKR
        </button>
      </div>

      {/* Error Message */}
      {error && <div className="text-red-600 text-sm mb-4 bg-red-50 p-3 rounded-lg">⚠️ {error}</div>}

      {/* Send Button */}
      <button
        onClick={handleSendOffer}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition"
      >
        <FaCheck /> {loading ? "Sending..." : "Send Counter Offer"}
      </button>
    </div>
  );
};

export default GigNegotiation;
