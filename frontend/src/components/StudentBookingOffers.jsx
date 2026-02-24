import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { FaCheck, FaTimes, FaSync, FaHistory } from "react-icons/fa";

const API = "http://localhost:3000/api/v1";

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

const StudentBookingOffers = ({ studentId }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [negotiatingId, setNegotiatingId] = useState(null);
  const [negotiationPrice, setNegotiationPrice] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
  }, [studentId]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/students/bookings`, authHeaders());
      setBookings(res.data.bookings || []);
    } catch (err) {
      toast.error("Error fetching bookings");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchBookings();
    setRefreshing(false);
  };

  const handleAccept = async (booking) => {
    if (booking.paymentStatus === "held" || booking.paymentStatus === "captured") {
      toast.success("You have already paid for this booking");
      return;
    }
    try {
      await axios.put(`${API}/students/booking/${booking._id}/accept`, {}, authHeaders());
      toast.success("Booking accepted — complete payment now");
      fetchBookings();
      navigate(`/booking-payment/${booking._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to accept");
    }
  };

  const handleReject = async (bookingId) => {
    if (!window.confirm("Reject this booking?")) return;
    try {
      await axios.put(`${API}/students/booking/${bookingId}/reject`, {}, authHeaders());
      toast.success("Booking rejected");
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reject");
    }
  };

  const adjustPrice = (bookingId, delta) => {
    const b = bookings.find((x) => x._id === bookingId);
    const current = negotiationPrice[bookingId] ?? b?.proposedPrice ?? 0;
    setNegotiationPrice((prev) => ({ ...prev, [bookingId]: Math.max(0, current + delta) }));
  };

  const handleSendCounter = async (bookingId) => {
    const price = negotiationPrice[bookingId];
    const b = bookings.find((x) => x._id === bookingId);
    if (price == null || price <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    try {
      await axios.put(
        `${API}/students/booking/${bookingId}/negotiate`,
        { proposedPrice: price, message: "Student counter offer" },
        authHeaders()
      );
      toast.success("Counter offer sent to tutor");
      setNegotiatingId(null);
      setNegotiationPrice((prev) => ({ ...prev, [bookingId]: undefined }));
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send counter");
    }
  };

  const relevant = (bookings || []).filter(
    (b) => b.status === "pending" || b.status === "negotiating"
  );

  if (loading) {
    return (
      <div className="text-center py-12">
        <FaSync className="animate-spin text-3xl text-blue-600 mx-auto" />
        <div>Loading booking offers...</div>
      </div>
    );
  }

  if (relevant.length === 0) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border-2 border-blue-200 text-center">
        No booking requests or counter offers from tutors yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">📚 Booking Counter Offers ({relevant.length})</h3>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition"
        >
          <FaSync className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>
      {relevant.map((booking) => {
        const tutorName =
          booking.tutorId?.firstName && booking.tutorId?.lastName
            ? `${booking.tutorId.firstName} ${booking.tutorId.lastName}`
            : "Tutor";
        const currentPrice = negotiationPrice[booking._id] ?? booking.proposedPrice;
        const isNegotiating = negotiatingId === booking._id;

        return (
          <div
            key={booking._id}
            className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border-2 border-blue-200"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-lg font-bold text-gray-800">{tutorName}</h4>
                <p className="text-sm text-gray-600">
                  Subject: <span className="font-semibold">{booking.subject}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Current offer: <span className="font-bold text-blue-600">PKR {booking.proposedPrice}</span>
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  booking.status === "negotiating"
                    ? "bg-yellow-200 text-yellow-800"
                    : "bg-blue-200 text-blue-800"
                }`}
              >
                {booking.status.toUpperCase()}
              </span>
            </div>

            {booking.negotiationHistory?.length > 0 && (
              <div className="bg-white rounded-lg p-3 mb-4 text-sm">
                <p className="font-semibold text-gray-700 flex items-center gap-2 mb-2">
                  <FaHistory /> Negotiation History
                </p>
                <div className="space-y-1 text-gray-600">
                  {booking.negotiationHistory.map((entry, idx) => (
                    <p key={idx}>
                      <strong>{entry.from}</strong>: PKR {entry.proposedPrice}
                      {entry.message && ` — ${entry.message}`}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {booking.status !== "rejected" && booking.status !== "cancelled" && (
              <div className="flex flex-wrap gap-3">
                {booking.paymentStatus !== "held" && booking.paymentStatus !== "captured" && (
                  <>
                    <button
                      onClick={() => handleAccept(booking)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition"
                    >
                      <FaCheck /> Accept & Pay
                    </button>
                    <button
                      onClick={() => {
                        setNegotiatingId(booking._id);
                        setNegotiationPrice((prev) => ({ ...prev, [booking._id]: booking.proposedPrice }));
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition"
                    >
                      Counter
                    </button>
                    <button
                      onClick={() => handleReject(booking._id)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition"
                    >
                      <FaTimes /> Reject
                    </button>
                  </>
                )}
              </div>
            )}

            {isNegotiating && (
              <div className="flex flex-wrap gap-2 mt-3 items-center">
                <button
                  onClick={() => adjustPrice(booking._id, -50)}
                  className="px-3 py-2 bg-gray-100 rounded font-bold"
                >
                  -50
                </button>
                <div className="px-4 py-2 border rounded bg-white font-semibold">
                  PKR {currentPrice}
                </div>
                <button
                  onClick={() => adjustPrice(booking._id, 50)}
                  className="px-3 py-2 bg-gray-100 rounded font-bold"
                >
                  +50
                </button>
                <button
                  onClick={() => handleSendCounter(booking._id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
                >
                  Send Counter Offer
                </button>
                <button
                  onClick={() => {
                    setNegotiatingId(null);
                    setNegotiationPrice((prev) => ({ ...prev, [booking._id]: undefined }));
                  }}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            )}

            {(booking.paymentStatus === "held" || booking.paymentStatus === "captured") && (
              <div className="bg-green-50 p-3 rounded-lg text-sm text-green-700 mt-2">
                ✓ Payment completed for this booking.
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StudentBookingOffers;
