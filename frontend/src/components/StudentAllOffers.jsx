import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { FaCheck, FaTimes, FaSync, FaHistory } from "react-icons/fa";

const StudentAllOffers = ({ studentId }) => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [negotiating, setNegotiating] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchOffers();
    // eslint-disable-next-line
  }, [studentId]);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:3000/api/v1/gig-offers/student?studentId=${studentId}`);
      setOffers(res.data && Array.isArray(res.data) ? res.data : res.data.offers || []);
    } catch (err) {
      toast.error("Error fetching offers");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOffers();
    setRefreshing(false);
  };

  const handleAccept = (offer) => {
    if (offer.paymentStatus === 'held' || offer.status === 'accepted' || offer.paymentStatus === 'paid' || offer.status === 'completed') {
      toast.success('You have already accepted or paid for this offer');
      return;
    }
    navigate(`/payment/${offer._id}`);
  };

  const handleReject = async (offerId) => {
    if (!window.confirm('Reject this offer?')) return;
    try {
      await axios.put(`http://localhost:3000/api/v1/gig-offers/${offerId}/reject`, { rejectedBy: 'student' });
      fetchOffers();
      toast.success('Offer rejected');
    } catch (err) {
      toast.error('Error rejecting offer');
    }
  };

  const handleCounter = async (offerId, amount) => {
    if (!amount || amount <= 0) return toast.error('Enter a valid counter amount');
    try {
      await axios.put(`http://localhost:3000/api/v1/gig-offers/${offerId}/update-amount`, { newAmount: amount, updatedBy: 'student', comment: 'Student counter' });
      fetchOffers();
      setNegotiating((prev) => ({ ...prev, [offerId]: undefined }));
      toast.success('Counter offer sent');
    } catch (err) {
      toast.error('Error sending counter');
    }
  };

  if (loading) return <div className="text-center py-12"><FaSync className="animate-spin text-3xl text-blue-600 mx-auto" /><div>Loading offers...</div></div>;

  if (offers.length === 0) return <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border-2 border-blue-200 text-center">No offers received yet.</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">₨ Counter Offers Received ({offers.length})</h3>
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
          <div className="flex justify-between items-start mb-4">
            <div>
              <h4 className="text-lg font-bold text-gray-800">{offer.freelancerName}</h4>
              <p className="text-sm text-gray-600">Offered: <span className="font-bold text-blue-600">₨ {offer.offeredAmount}</span></p>
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
          {offer.negotiationHistory?.length > 1 && (
            <div className="bg-white rounded-lg p-3 mb-4 text-sm">
              <p className="font-semibold text-gray-700 flex items-center gap-2 mb-2">
                <FaHistory /> Negotiation History
              </p>
              <div className="space-y-1 text-gray-600">
                {offer.negotiationHistory.map((entry, idx) => (
                  <p key={idx}>
                    <strong>{entry.updatedBy}</strong>: ₨ {entry.amount} {entry.comment && ` - ${entry.comment}`}
                  </p>
                ))}
              </div>
            </div>
          )}
          {offer.status === "pending" && (
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => handleAccept(offer)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition"
              >
                <FaCheck /> Accept & Pay
              </button>
              <button
                onClick={() => setNegotiating((prev) => ({ ...prev, [offer._id]: offer.offeredAmount }))}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition"
              >
                Counter
              </button>
              <button
                onClick={() => handleReject(offer._id)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition"
              >
                <FaTimes /> Reject
              </button>
            </div>
          )}
          {negotiating[offer._id] !== undefined && (
            <div className="flex gap-2 mt-3">
              <input
                type="number"
                value={negotiating[offer._id]}
                onChange={e => setNegotiating(prev => ({ ...prev, [offer._id]: parseInt(e.target.value) }))}
                className="flex-1 border-2 border-gray-300 rounded-lg p-2 focus:border-blue-500 focus:outline-none"
              />
              <button
                onClick={() => handleCounter(offer._id, negotiating[offer._id])}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition"
              >
                Send Counter
              </button>
              <button
                onClick={() => setNegotiating(prev => ({ ...prev, [offer._id]: undefined }))}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          )}
          {offer.status === "accepted" && (
            <div className="bg-green-50 p-3 rounded-lg text-sm text-green-700">
              ✓ Both parties have accepted. Ready for payment!
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default StudentAllOffers;
