import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { SiStudyverse } from "react-icons/si";
import { FaClipboardList, FaRegHandshake, FaInbox, FaBell, FaThumbsUp, FaUser, FaCoins, FaVideo } from "react-icons/fa";
import axios from "axios";
import Avatar from "./Avatar";
import TutorProfileForm from "./TutorProfileForm";
import WithdrawModal from "./WithdrawModal";

const API = "http://localhost:3000/api/v1";

const TutorDashboard = () => {
  const navigate = useNavigate();
  const [tutor, setTutor] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("requests");
  const [negotiatingBookingId, setNegotiatingBookingId] = useState(null);
  const [negotiationMap, setNegotiationMap] = useState({});
  const [showNotifications, setShowNotifications] = useState(false);
  const [sessionLinkInput, setSessionLinkInput] = useState({});
  const [sessionDeadlineInput, setSessionDeadlineInput] = useState({});
  const [profileEditing, setProfileEditing] = useState(false);
  const [complaintText, setComplaintText] = useState("");
  const [myComplaints, setMyComplaints] = useState([]);
  const [acceptClassDueBy, setAcceptClassDueBy] = useState({});
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");
    fetchAll();
    axios.post(`${API}/payments/process-expired`).catch(() => {});
    const interval = setInterval(() => fetchBookings(), 8000);
    return () => clearInterval(interval);
  }, [navigate]);

  useEffect(() => {
    if (!loading && bookings.length === 0) fetchBookingsFallback();
  }, [loading]);

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchTutorData(), fetchBookings()]);
    setLoading(false);
  };

  const authHeaders = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });

  const fetchTutorData = async () => {
    try {
      const res = await axios.get(`${API}/tutors/profile`, authHeaders());
      if (res.status === 200) setTutor(res.data.tutor);
      else if (res.status === 401 || res.status === 403) {
        toast.error("Authentication required. Please login as tutor.");
        navigate("/login");
      }
    } catch (err) {
      if (err.response && (err.response.status === 401 || err.response.status === 403)) navigate("/login");
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await axios.get(`${API}/tutors/bookings`, authHeaders());
      setBookings(res.data.bookings || []);
      // Only initialise entries that the tutor has NOT yet manually edited
      setNegotiationMap((prev) => {
        const next = { ...prev };
        (res.data.bookings || []).forEach((b) => {
          if (next[b._id] === undefined) {
            next[b._id] = b.proposedPrice;
          }
        });
        return next;
      });
      if (!res.data.bookings?.length) fetchBookingsFallback();
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) navigate("/login");
    }
  };

  const fetchBookingsFallback = async () => {
    const tutorId = localStorage.getItem("tutorId") || tutor?._id;
    if (!tutorId) return;
    try {
      const res = await axios.get(`${API}/tutors/${tutorId}/bookings-public`);
      setBookings(res.data.bookings || []);
      setNegotiationMap((prev) => {
        const next = { ...prev };
        (res.data.bookings || []).forEach((b) => {
          if (next[b._id] === undefined) {
            next[b._id] = b.proposedPrice;
          }
        });
        return next;
      });
    } catch (err) {}
  };

  const acceptBooking = async (id, classDueBy) => {
    try {
      const payload = { status: "confirmed" };
      if (classDueBy) payload.classDueBy = classDueBy;
      await axios.put(`${API}/tutors/booking/${id}/status`, payload, authHeaders());
      toast.success("Booking accepted — student will be notified");
      setAcceptClassDueBy((p) => ({ ...p, [id]: "" }));
      fetchBookings();
    } catch (err) {
      toast.error("Failed to accept");
    }
  };

  const rejectBooking = async (id) => {
    try {
      await axios.put(`${API}/tutors/booking/${id}/status`, { status: "rejected" }, authHeaders());
      toast.success("Booking rejected");
      fetchBookings();
    } catch (err) {
      toast.error("Failed to reject");
    }
  };

  const adjustCounter = (id, delta) => {
    setNegotiationMap((prev) => ({
      ...prev,
      [id]: Math.min(2500, Math.max(300, (Number(prev[id]) || 300) + delta))
    }));
  };

  const setCounterDirect = (id, value) => {
    // Allow free typing; enforce range on send
    if (value === '' || /^\d+$/.test(value)) {
      setNegotiationMap((prev) => ({ ...prev, [id]: value === '' ? '' : Number(value) }));
    }
  };

  const sendCounterOffer = async (id) => {
    try {
      const proposedPrice = negotiationMap[id];
      await axios.put(`${API}/tutors/booking/${id}/negotiate`, { proposedPrice, message: "Counter offer from tutor" }, authHeaders());
      toast.success("Counter offer sent to student");
      fetchBookings();
    } catch (err) {
      toast.error("Failed to send counter offer");
    }
  };

  const sendSessionLink = async (bookingId) => {
    const link = sessionLinkInput[bookingId]?.trim();
    if (!link) return toast.error("Enter a meeting link (e.g. Google Meet)");
    const deadline = sessionDeadlineInput[bookingId]; // ISO string or null
    try {
      await axios.post(`${API}/tutors/session/${bookingId}`, { link, sessionLinkDeadline: deadline || undefined }, authHeaders());
      toast.success("Class link sent to student");
      setSessionLinkInput((prev) => ({ ...prev, [bookingId]: "" }));
      setSessionDeadlineInput((prev) => ({ ...prev, [bookingId]: "" }));
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send link");
    }
  };

  const markSessionDone = async (bookingId) => {
    try {
      await axios.put(`${API}/tutors/session/${bookingId}/done`, {}, authHeaders());
      toast.success("Marked as done. Payment will release when student also marks done.");
      fetchBookings();
      fetchTutorData();
    } catch (err) {
      toast.error("Failed to mark done");
    }
  };


  // New withdraw handler using modal and Stripe
  const handleWithdraw = async (amount, cardElement, stripe) => {
    try {
      // 1. Create payment method with Stripe
      const { paymentMethod, error: pmError } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });
      if (pmError) throw new Error(pmError.message);

      // 2. Call backend to process withdrawal
      const res = await axios.post(`${API}/tutors/withdraw`, {
        amount,
        paymentMethodId: paymentMethod.id,
      }, authHeaders());

      // 3. Update UI and notify
      toast.success(`Withdrawal of PKR ${amount} requested. Admin will review and process.`);
      fetchTutorData();

      // 4. Optionally: notify admin (handled backend)
    } catch (err) {
      throw new Error(err.response?.data?.message || err.message || "Withdrawal failed");
    }
  };

  const handleSendComplaint = async () => {
    if (!complaintText.trim()) return;
    try {
      await axios.post(`${API}/complaints`, { message: complaintText }, authHeaders());
      toast.success("Complaint sent");
      setComplaintText("");
      const r = await axios.get(`${API}/complaints/my`, authHeaders());
      setMyComplaints(r.data.complaints || []);
    } catch (e) {
      toast.error("Failed to send");
    }
  };

  const handleProfileSave = async () => {
    try {
      let profilePictureUrl = tutor?.profilePicture;
      if (profilePictureFile) {
        profilePictureUrl = await uploadToCloudinary(profilePictureFile) || profilePictureUrl;
      }
      const payload = { ...profileForm, profilePicture: profilePictureUrl };
      await axios.put(`${API}/tutors/profile`, payload, authHeaders());
      toast.success("Profile updated");
      setProfileEditing(false);
      setProfilePictureFile(null);
      setProfilePicturePreview("");
      fetchTutorData();
    } catch (err) {
      toast.error("Failed to update profile");
    }
  };

  // Only show bookings in requests if paymentStatus is 'pending' (not paid)
  const pendingRequests = bookings.filter((b) => (b.status === "pending" || b.status === "accepted" || b.status === "negotiating") && (b.paymentStatus === 'pending' || !b.paymentStatus));
  const negotiating = bookings.filter((b) => b.status === "negotiating" && (b.paymentStatus === 'pending' || !b.paymentStatus));
  // Only show bookings in queue if paymentStatus is 'held', 'captured', or 'confirmed' (paid)
  const queue = bookings.filter((b) => (b.status === "confirmed" || b.paymentStatus === "captured" || b.paymentStatus === 'held') && b.paymentStatus && b.paymentStatus !== 'pending');
  const delivered = bookings.filter((b) => b.status === "completed" && b.studentMarkedDone && b.tutorMarkedDone && b.paymentStatus === 'released');
  const notifications = tutor?.notifications || [];

  if (loading) return <div className="p-8">Loading dashboard...</div>;
  if (!tutor) return <div className="p-8">Please complete your profile first.</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-white">
      <header className="bg-blue-950 text-white px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SiStudyverse className="text-3xl" />
          <h1 className="text-2xl font-bold">TutorLance — Tutor Dashboard</h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded hover:bg-white/10"
            aria-label="Notifications"
          >
            <FaBell className="text-xl" />
            {notifications.filter((n) => !n.read).length > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {notifications.filter((n) => !n.read).length}
              </span>
            )}
          </button>
          <div className="text-sm">Hello, <strong>{tutor.firstName}</strong></div>
          <button className="bg-red-600 px-3 py-1 rounded" onClick={() => { localStorage.removeItem("token"); navigate("/login"); }}>
            Logout
          </button>
        </div>
      </header>

      {showNotifications && (
        <div className="absolute top-20 right-8 z-50 w-96 max-h-80 bg-white border rounded-lg shadow-lg overflow-auto">
          <div className="p-3 border-b font-semibold">Notifications</div>
          {notifications.length === 0 ? (
            <div className="p-4 text-gray-500">No notifications</div>
          ) : (
            notifications.slice().reverse().map((n, i) => (
              <div key={i} className="p-3 border-b text-sm hover:bg-gray-50">
                <p>{n.message}</p>
                <p className="text-xs text-gray-500 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
            ))
          )}
        </div>
      )}

      <div className="flex">
        <aside className="w-80 p-6 bg-white shadow-lg">
          <div className="mb-6 flex items-center gap-3">
            <Avatar src={tutor.profilePicture} firstName={tutor.firstName} lastName={tutor.lastName} size="lg" />
            <div>
              <div className="text-xs text-gray-500">Earnings</div>
              <div className="text-2xl font-bold">PKR {tutor.earnings ?? 0}</div>
            </div>
          </div>
          <button
            onClick={() => setWithdrawOpen(true)}
            disabled={!(tutor.earnings > 0)}
            className="w-full mb-4 py-2 rounded bg-green-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Withdraw (Stripe)
          </button>
          <WithdrawModal
            open={withdrawOpen}
            onClose={() => setWithdrawOpen(false)}
            maxAmount={tutor.earnings ?? 0}
            onWithdraw={handleWithdraw}
          />

          <nav className="space-y-2">
            <button onClick={() => setActiveSection("profile")} className={`w-full text-left p-3 rounded flex items-center gap-3 ${activeSection === "profile" ? "bg-blue-50" : ""}`}>
              <FaUser /> <span>Profile</span>
            </button>
            <button onClick={() => setActiveSection("requests")} className={`w-full text-left p-3 rounded flex items-center gap-3 ${activeSection === "requests" ? "bg-blue-50" : ""}`}>
              <FaInbox /> <span>Booking Requests ({pendingRequests.length})</span>
            </button>
            <button onClick={() => setActiveSection("counterOffers")} className={`w-full text-left p-3 rounded flex items-center gap-3 ${activeSection === "counterOffers" ? "bg-blue-50" : ""}`}>
              <FaRegHandshake /> <span>Counter Offers ({negotiating.length})</span>
            </button>
            <button onClick={() => setActiveSection("queue")} className={`w-full text-left p-3 rounded flex items-center gap-3 ${activeSection === "queue" ? "bg-blue-50" : ""}`}>
              <FaClipboardList /> <span>Booking Queue ({queue.length})</span>
            </button>
            <button onClick={() => setActiveSection("delivered")} className={`w-full text-left p-3 rounded flex items-center gap-3 ${activeSection === "delivered" ? "bg-blue-50" : ""}`}>
              <FaVideo /> <span>Delivered Classes ({delivered.length})</span>
            </button>
            <button onClick={() => setActiveSection("reviews")} className={`w-full text-left p-3 rounded flex items-center gap-3 ${activeSection === "reviews" ? "bg-blue-50" : ""}`}>
              <FaThumbsUp /> <span>Reviews</span>
            </button>
            <button onClick={() => { setActiveSection("complaints"); axios.get(`${API}/complaints/my`, authHeaders()).then((r) => setMyComplaints(r.data.complaints || [])).catch(() => {}); }} className={`w-full text-left p-3 rounded flex items-center gap-3 ${activeSection === "complaints" ? "bg-blue-50" : ""}`}>
              📩 Complaints
            </button>
          </nav>
        </aside>

        <main className="flex-1 p-8">
          {activeSection === "profile" && (
            <section>
              <h2 className="text-2xl font-bold mb-4">Profile</h2>
              {!profileEditing ? (
                <div className="bg-white p-6 rounded shadow max-w-2xl">
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar src={tutor.profilePicture} firstName={tutor.firstName} lastName={tutor.lastName} size="xl" />
                    <div>
                      <p className="text-lg font-semibold">{tutor.firstName} {tutor.lastName}</p>
                      <p className="text-gray-600">{tutor.email}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-2">{tutor.bio}</p>
                  <p className="text-sm text-gray-500">Subjects: {tutor.subjects?.join(", ")}</p>
                  <p className="text-sm text-gray-500">PKR {tutor.hourlyRate}/hr</p>
                  <button onClick={() => setProfileEditing(true)} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">
                    Edit Profile
                  </button>
                </div>
              ) : (
                <div className="bg-white p-6 rounded shadow max-w-2xl">
                  <TutorProfileForm
                    initialValues={tutor}
                    editMode={true}
                    onSave={async (payload) => {
                      try {
                        await axios.put(`${API}/tutors/profile`, payload, authHeaders());
                        toast.success("Profile updated");
                        setProfileEditing(false);
                        fetchTutorData();
                      } catch (err) {
                        toast.error("Failed to update profile");
                      }
                    }}
                    onCancel={() => setProfileEditing(false)}
                  />
                </div>
              )}
            </section>
          )}

          {activeSection === "requests" && (
            <section>
              <h2 className="text-2xl font-bold mb-4">Booking Requests</h2>
              {pendingRequests.length === 0 ? <div className="text-gray-500">No new requests.</div> : (
                <div className="space-y-6">
                  {pendingRequests.map((b) => (
                    <div key={b._id} className="bg-white p-5 rounded-lg shadow border-l-4 border-blue-500">
                      {/* Student Info */}
                      <div className="flex justify-between items-start flex-wrap gap-4 mb-4">
                        <div className="flex-1 min-w-0">
                          <div className="text-xl font-bold text-gray-900 mb-3">
                            {b.studentId?.firstName} {b.studentId?.lastName}
                            {b.studentId?.email && <span className="ml-2 text-sm font-normal text-gray-500">({b.studentId.email})</span>}
                          </div>

                          {/* Full Booking Details Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm mb-3">
                            <div><span className="font-semibold text-gray-700">📚 Subject:</span> <span className="text-gray-800">{b.subject || '—'}</span></div>
                            <div><span className="font-semibold text-gray-700">💰 Proposed Amount:</span> <span className="text-green-700 font-semibold">PKR {b.proposedPrice}</span></div>
                            <div><span className="font-semibold text-gray-700">📅 Preferred Date:</span> <span className="text-gray-800">{b.proposedDate ? new Date(b.proposedDate).toLocaleDateString('en-PK', {weekday:'long', year:'numeric', month:'long', day:'numeric'}) : '—'}</span></div>
                            <div><span className="font-semibold text-gray-700">📆 Preferred Day:</span> <span className="text-gray-800">{b.proposedDay || '—'}</span></div>
                            <div><span className="font-semibold text-gray-700">🕐 Preferred Time:</span> <span className="text-gray-800">{b.proposedTime || '—'}</span></div>
                            <div><span className="font-semibold text-gray-700">📌 Status:</span> <span className={`px-2 py-0.5 rounded text-xs font-semibold ${b.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : b.status === 'negotiating' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>{b.status}</span></div>
                          </div>

                          {b.topicDescription && (
                            <div className="bg-blue-50 border border-blue-100 rounded p-3 mb-2">
                              <p className="text-xs font-semibold text-blue-700 mb-1">📝 Topic Description:</p>
                              <p className="text-sm text-gray-800">{b.topicDescription}</p>
                            </div>
                          )}
                          {b.message && (
                            <div className="bg-gray-50 border border-gray-200 rounded p-3 mb-2">
                              <p className="text-xs font-semibold text-gray-600 mb-1">💬 Student Message:</p>
                              <p className="text-sm text-gray-700">{b.message}</p>
                            </div>
                          )}
                          {b.negotiationHistory?.length > 0 && (
                            <div className="bg-blue-50 border border-blue-200 rounded p-3">
                              <p className="text-xs font-semibold text-blue-800 mb-2">🔄 Negotiation History:</p>
                              <div className="space-y-1 text-xs text-gray-700">
                                {b.negotiationHistory.map((entry, idx) => (
                                  <p key={idx}>
                                    <strong className="text-blue-900">{entry.from === 'student' ? 'Student' : 'You'}</strong>: PKR {entry.proposedPrice}
                                    {entry.message && <span className="text-gray-600"> — "{entry.message}"</span>}
                                  </p>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-2 min-w-[160px]">
                          <label className="text-xs text-gray-500">Link must be sent by (optional)</label>
                          <input type="datetime-local" value={acceptClassDueBy[b._id] || ""} onChange={(e) => setAcceptClassDueBy((p) => ({ ...p, [b._id]: e.target.value }))} className="border rounded px-2 py-1 text-sm" />
                          <button onClick={() => acceptBooking(b._id, acceptClassDueBy[b._id] || undefined)} className="bg-green-600 text-white px-4 py-2 rounded font-semibold">✅ Accept</button>
                          <button onClick={() => rejectBooking(b._id)} className="bg-red-500 text-white px-4 py-2 rounded font-semibold">❌ Reject</button>
                          <button onClick={() => setNegotiatingBookingId(negotiatingBookingId === b._id ? null : b._id)} className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded font-semibold">🤝 Negotiate</button>
                        </div>
                      </div>

                      {/* Negotiate Panel */}
                      {negotiatingBookingId === b._id && (
                        <div className="mt-3 bg-gray-50 p-4 rounded border">
                          <p className="text-sm font-semibold text-gray-700 mb-2">Set Counter Offer Amount (PKR 300 – 2500):</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <button onClick={() => adjustCounter(b._id, -50)} className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded font-bold">−50</button>
                            <input
                              type="number"
                              min={300}
                              max={2500}
                              value={negotiationMap[b._id] ?? ''}
                              onChange={(e) => setCounterDirect(b._id, e.target.value)}
                              className="w-32 text-center border-2 border-blue-400 rounded px-3 py-2 font-bold text-lg"
                            />
                            <button onClick={() => adjustCounter(b._id, 50)} className="px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded font-bold">+50</button>
                            <span className="text-sm text-gray-500">PKR</span>
                          </div>
                          {(negotiationMap[b._id] < 300 || negotiationMap[b._id] > 2500) && negotiationMap[b._id] !== '' && (
                            <p className="text-red-500 text-xs mt-1">Amount must be between PKR 300 and 2500</p>
                          )}
                          <button
                            onClick={() => {
                              const amt = Number(negotiationMap[b._id]);
                              if (amt < 300 || amt > 2500) { toast.error('Amount must be between PKR 300 and 2500'); return; }
                              sendCounterOffer(b._id);
                              setNegotiatingBookingId(null);
                            }}
                            className="mt-3 bg-blue-600 text-white px-5 py-2 rounded font-semibold"
                          >
                            Send Counter Offer
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeSection === "counterOffers" && (
            <section>
              <h2 className="text-2xl font-bold mb-4">Counter Offers / Negotiations</h2>
              {negotiating.length === 0 ? <div className="text-gray-500">No active negotiations.</div> : (
                <div className="space-y-6">
                  {negotiating.map((b) => (
                    <div key={b._id} className="bg-white p-5 rounded-lg shadow border-l-4 border-purple-500">
                      <div className="flex justify-between items-start flex-wrap gap-4 mb-4">
                        <div className="flex-1 min-w-0">
                          <div className="text-xl font-bold text-gray-900 mb-3">
                            {b.studentId?.firstName} {b.studentId?.lastName}
                            {b.studentId?.email && <span className="ml-2 text-sm font-normal text-gray-500">({b.studentId.email})</span>}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm mb-3">
                            <div><span className="font-semibold text-gray-700">📚 Subject:</span> <span className="text-gray-800">{b.subject || '—'}</span></div>
                            <div><span className="font-semibold text-gray-700">💰 Current Price:</span> <span className="text-green-700 font-semibold">PKR {b.proposedPrice}</span></div>
                            <div><span className="font-semibold text-gray-700">📅 Date:</span> <span>{b.proposedDate ? new Date(b.proposedDate).toLocaleDateString() : '—'}</span></div>
                            <div><span className="font-semibold text-gray-700">📆 Day:</span> <span>{b.proposedDay || '—'}</span></div>
                            <div><span className="font-semibold text-gray-700">🕐 Time:</span> <span>{b.proposedTime || '—'}</span></div>
                          </div>
                          {b.topicDescription && (
                            <div className="bg-blue-50 border border-blue-100 rounded p-3 mb-2">
                              <p className="text-xs font-semibold text-blue-700 mb-1">📝 Topic:</p>
                              <p className="text-sm text-gray-800">{b.topicDescription}</p>
                            </div>
                          )}
                          {b.negotiationHistory?.length > 0 && (
                            <div className="mt-3 p-3 bg-gray-50 rounded border text-sm">
                              <p className="font-semibold text-gray-700 mb-1">Negotiation History:</p>
                              {b.negotiationHistory.map((entry, idx) => (
                                <p key={idx} className={`py-1 border-b last:border-0 ${entry.from === 'tutor' ? 'text-blue-700' : 'text-gray-700'}`}>
                                  <strong>{entry.from === 'tutor' ? 'You' : 'Student'}:</strong> PKR {entry.proposedPrice} {entry.message ? `— ${entry.message}` : ""}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-2 min-w-[160px]">
                          <label className="text-xs text-gray-500">Link must be sent by (optional)</label>
                          <input type="datetime-local" value={acceptClassDueBy[b._id] || ""} onChange={(e) => setAcceptClassDueBy((p) => ({ ...p, [b._id]: e.target.value }))} className="border rounded px-2 py-1 text-sm" />
                          <button onClick={() => acceptBooking(b._id, acceptClassDueBy[b._id] || undefined)} className="bg-green-600 text-white px-4 py-2 rounded font-semibold">✅ Accept</button>
                          <button onClick={() => rejectBooking(b._id)} className="bg-red-500 text-white px-4 py-2 rounded font-semibold">❌ Reject</button>
                        </div>
                      </div>

                      {/* Counter Offer Controls */}
                      <div className="bg-gray-50 p-4 rounded border">
                        <p className="text-sm font-semibold text-gray-700 mb-2">Update Counter Offer (PKR 300 – 2500):</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <button onClick={() => adjustCounter(b._id, -50)} className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded font-bold">−50</button>
                          <input
                            type="number"
                            min={300}
                            max={2500}
                            value={negotiationMap[b._id] ?? ''}
                            onChange={(e) => setCounterDirect(b._id, e.target.value)}
                            className="w-32 text-center border-2 border-purple-400 rounded px-3 py-2 font-bold text-lg"
                          />
                          <button onClick={() => adjustCounter(b._id, 50)} className="px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded font-bold">+50</button>
                          <span className="text-sm text-gray-500">PKR</span>
                          <button
                            onClick={() => {
                              const amt = Number(negotiationMap[b._id]);
                              if (amt < 300 || amt > 2500) { toast.error('Amount must be between PKR 300 and 2500'); return; }
                              sendCounterOffer(b._id);
                            }}
                            className="ml-2 bg-blue-600 text-white px-5 py-2 rounded font-semibold"
                          >
                            Send Counter Offer
                          </button>
                        </div>
                        {(negotiationMap[b._id] < 300 || negotiationMap[b._id] > 2500) && negotiationMap[b._id] !== '' && (
                          <p className="text-red-500 text-xs mt-1">Amount must be between PKR 300 and 2500</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeSection === "queue" && (
            <section>
              <h2 className="text-2xl font-bold mb-4">Booking Queue (Confirmed / Paid)</h2>
              {queue.length === 0 ? <div className="text-gray-500">No confirmed bookings.</div> : (
                <div className="space-y-4">
                  {queue.map((b) => (
                    <div key={b._id} className="bg-white p-4 rounded shadow">
                      <div className="flex justify-between items-start flex-wrap gap-4">
                        <div>
                          <div className="text-lg font-semibold">{b.studentId?.firstName} {b.studentId?.lastName}</div>
                          <div className="text-sm text-gray-600">PKR {b.proposedPrice} • {b.proposedDate ? new Date(b.proposedDate).toLocaleString() : (b.proposedDay || "") + " " + (b.proposedTime || "")}</div>
                          {b.sessionLink && (
                              b.sessionLinkDeadline && new Date() > new Date(b.sessionLinkDeadline) ? (
                                  <span className="text-gray-400 text-sm cursor-not-allowed">Class Done / Link Expired</span>
                              ) : (
                                  <a href={b.sessionLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm">Join class link</a>
                              )
                          )}
                        </div>
                        <div className="flex flex-col gap-2">
                          {(b.status === 'completed' || (b.studentMarkedDone && b.tutorMarkedDone)) ? (
                            <span className="bg-green-100 text-green-700 px-4 py-2 rounded font-semibold">Class Done</span>
                          ) : (
                            <>
                              <div className="flex flex-wrap gap-2 items-center">
                                <a
                                  href="https://meet.google.com/new"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded inline-flex items-center gap-2 text-sm font-medium"
                                >
                                  Create Class (Google Meet)
                                </a>
                                <input
                                  type="url"
                                  placeholder="Paste meeting link and send to student"
                                  value={sessionLinkInput[b._id] || ""}
                                  onChange={(e) => setSessionLinkInput((p) => ({ ...p, [b._id]: e.target.value }))}
                                  className="border rounded px-3 py-2 w-72"
                                />
                                <input
                                  type="datetime-local"
                                  placeholder="Deadline"
                                  value={sessionDeadlineInput[b._id] || ""}
                                  onChange={(e) => setSessionDeadlineInput((p) => ({ ...p, [b._id]: e.target.value }))}
                                  className="border rounded px-3 py-2"
                                  title="Link expires after this time; student refunded if class not done"
                                />
                                <button onClick={() => sendSessionLink(b._id)} className="bg-indigo-600 text-white px-4 py-2 rounded">Send Link</button>
                              </div>
                              {b.sessionLinkDeadline && (
                                <p className="text-xs text-gray-500">Deadline: {new Date(b.sessionLinkDeadline).toLocaleString()}. After this, link expires and payment may be refunded if class not completed.</p>
                              )}
                              <button onClick={() => markSessionDone(b._id)} className="bg-green-600 text-white px-4 py-2 rounded text-sm">Mark class done</button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeSection === "delivered" && (
            <section>
              <h2 className="text-2xl font-bold mb-4">Delivered Classes</h2>
              {delivered.length === 0 ? <div className="text-gray-500">No delivered classes yet.</div> : (
                <div className="space-y-4">
                  {delivered.map((b) => (
                    <div key={b._id} className="bg-white p-4 rounded shadow flex justify-between items-center">
                      <div>
                        <div className="font-semibold">{b.studentId?.firstName} {b.studentId?.lastName}</div>
                        <div className="text-sm text-gray-600">{b.subject} — PKR {b.proposedPrice}</div>
                        <div className="text-xs text-gray-500">{b.sessionCompletedAt ? new Date(b.sessionCompletedAt).toLocaleString() : ""}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeSection === "complaints" && (
            <section>
              <h2 className="text-2xl font-bold mb-4">Complaints</h2>
              <p className="text-gray-600 mb-4">Send a complaint to admin (e.g. student not marking class done, payment issues).</p>
              <div className="flex gap-2 mb-4">
                <textarea value={complaintText} onChange={(e) => setComplaintText(e.target.value)} placeholder="Describe your complaint..." className="border rounded px-3 py-2 w-full max-w-xl" rows={3} />
                <button onClick={handleSendComplaint} className="bg-blue-600 text-white px-4 py-2 rounded h-fit">Send</button>
              </div>
              <div className="space-y-2">
                {myComplaints.length === 0 ? <p className="text-gray-500">No complaints yet.</p> : myComplaints.map((c) => (
                  <div key={c._id} className="bg-white p-3 rounded shadow text-sm">
                    <p className="font-medium">{c.message}</p>
                    <p className="text-gray-500 text-xs mt-1">{new Date(c.createdAt).toLocaleString()} • {c.status}</p>
                    {c.adminResponse && <p className="mt-2 text-indigo-600">Admin: {c.adminResponse}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeSection === "reviews" && (
            <section>
              <h2 className="text-2xl font-bold mb-4">Reviews & Ratings</h2>
              {(tutor.ratings || []).length === 0 ? <div className="text-gray-500">No reviews yet.</div> : (
                <div className="space-y-3">
                  {(tutor.ratings || []).slice().reverse().map((r, i) => (
                    <div key={i} className="bg-white p-4 rounded shadow">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{r.studentName || "Student"}</span>
                        <span className="text-yellow-500">{Array(5).fill(0).map((_, k) => (k < (r.rating || 0) ? "★" : "☆")).join("")}</span>
                      </div>
                      <p className="text-gray-600 text-sm">{r.review}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default TutorDashboard;
