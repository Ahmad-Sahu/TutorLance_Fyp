import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from 'react-hot-toast'
import { FaCheck, FaTimes, FaHistory, FaSync } from "react-icons/fa";

const StudentGigOffers = ({ gigId, studentId, onOfferSelect = () => {} }) => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);

  const BASE_URL = "http://localhost:3000/api/v1/gig-offers";

  useEffect(() => {
    fetchOffers();
  }, [gigId]);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const studentId = localStorage.getItem("studentId");
      console.log("🔍 Fetching offers for gigId:", gigId, "studentId:", studentId);
      const response = await axios.get(`${BASE_URL}/gig/${gigId}?studentId=${studentId}`);
      console.log("✅ Offers fetched:", response.data.length, "offers");
      setOffers(response.data);
    } catch (err) {
      console.error("❌ Error fetching offers:", err);
      if (err.response?.status === 403) {
        alert("❌ Unauthorized: You can only view offers for your own gigs");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOffers();
    setRefreshing(false);
  };

  const handleAcceptOffer = async (offerId) => {
    try {
      await axios.put(`${BASE_URL}/${offerId}/accept`, {
        acceptedBy: "student"
      });
      toast.success("✅ Offer accepted!");
      fetchOffers();
    } catch (err) {
      alert("❌ " + (err.response?.data?.message || "Error accepting offer"));
    }
  };

  const handleRejectOffer = async (offerId) => {
    try {
      await axios.put(`${BASE_URL}/${offerId}/reject`, {
        rejectedBy: "student"
      });
      toast.success("✅ Offer rejected");
      fetchOffers();
    } catch (err) {
      alert("❌ " + (err.response?.data?.message || "Error rejecting offer"));
    }
  };

  const handleUpdateAmount = async (offerId, newAmount) => {
    try {
      await axios.put(`${BASE_URL}/${offerId}/update-amount`, {
        newAmount,
        updatedBy: "student",
        comment: `Student updated to PKR ${newAmount}`
      });
      toast.success("✅ Counter amount sent!");
      fetchOffers();
    } catch (err) {
      alert("❌ " + (err.response?.data?.message || "Error updating offer"));
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center gap-3">
          <div className="animate-spin">
            <FaSync className="text-3xl text-blue-600" />
          </div>
          <div>
            <p className="text-gray-700 font-semibold">Loading offers...</p>
            <p className="text-sm text-gray-500">Checking for freelancer applications</p>
          </div>
        </div>
      </div>
    );
  }

  if (offers.length === 0) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border-2 border-blue-200">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-600 font-semibold">No offers received yet</p>
            <p className="text-sm text-gray-500 mt-1">Freelancers will see this gig and send counter offers.</p>
            <p className="text-xs text-gray-400 mt-2">DEBUG: /gig/{gigId}?studentId={localStorage.getItem("studentId")}</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg text-sm transition"
          >
            <FaSync className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">💼 Counter Offers Received ({offers.length})</h3>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition"
        >
          <FaSync className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {offers.map((offer) => (
        <div key={offer._id} className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border-2 border-blue-200">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <h4 className="text-lg font-bold text-gray-800">{offer.freelancerName}</h4>
              <p className="text-sm text-gray-600">Offered: <span className="font-bold text-blue-600">PKR {offer.offeredAmount}</span></p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              offer.status === "accepted" ? "bg-green-200 text-green-800" :
              offer.status === "rejected" ? "bg-red-200 text-red-800" :
              offer.status === "delivered" ? "bg-blue-200 text-blue-800" :
              offer.status === "completed" ? "bg-emerald-200 text-emerald-800" :
              "bg-yellow-200 text-yellow-800"
            }`}>
              {offer.status.toUpperCase()}
            </span>
          </div>

          {/* Negotiation History */}
          {offer.negotiationHistory.length > 1 && (
            <div className="bg-white rounded-lg p-3 mb-4 text-sm">
              <p className="font-semibold text-gray-700 flex items-center gap-2 mb-2">
                <FaHistory /> Negotiation History
              </p>
              <div className="space-y-1 text-gray-600">
                {offer.negotiationHistory.map((entry, idx) => (
                  <p key={idx}>
                    <strong>{entry.updatedBy}</strong>: PKR {entry.amount} 
                    {entry.comment && ` - ${entry.comment}`}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Amount Negotiation */}
          {offer.status === "pending" && (
            <div className="bg-white rounded-lg p-4 mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Negotiate Amount</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Enter new amount"
                  defaultValue={offer.offeredAmount}
                  onChange={(e) => setSelectedOffer({ id: offer._id, amount: parseInt(e.target.value) })}
                  className="flex-1 border-2 border-gray-300 rounded-lg p-2 focus:border-blue-500 focus:outline-none"
                />
                <button
                  onClick={() => handleUpdateAmount(offer._id, selectedOffer?.amount || offer.offeredAmount)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition"
                >
                  Counter
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {offer.status === "pending" && (
            <div className="flex gap-3">
              <button
                onClick={() => handleAcceptOffer(offer._id)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition"
              >
                <FaCheck /> Accept
              </button>
              <button
                onClick={() => handleRejectOffer(offer._id)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition"
              >
                <FaTimes /> Reject
              </button>
            </div>
          )}

          {offer.status === "accepted" && (
            <div className="bg-green-50 p-3 rounded-lg text-sm text-green-700">
              ✓ Both parties have accepted. Ready for payment!
            </div>
          )}

          <div className="mt-3">
            <button onClick={() => onOfferSelect(offer)} className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">Manage</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StudentGigOffers;
