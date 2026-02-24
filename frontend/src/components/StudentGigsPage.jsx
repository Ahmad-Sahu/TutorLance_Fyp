import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from 'react-hot-toast'
import { FaPlus, FaArrowRight, FaSearch, FaUserCircle } from "react-icons/fa";
import StudentGigOffers from "./StudentGigOffers";
import GigPayment from "./GigPayment";
import GigDelivery from "./GigDelivery";
import StudentGigCard from "./StudentGigCard";
import StudentCreateGig from "./Student_Gigs";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY || "pk_test_51234567890");

const StudentGigs = () => {
  const [gigs, setGigs] = useState([]);
  const [selectedGig, setSelectedGig] = useState(null);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("my-gigs"); // my-gigs, negotiations, delivery

  const BASE_URL = "http://localhost:3000/api/v1";

  const [showCreate, setShowCreate] = useState(false);
  const [editGig, setEditGig] = useState(null);

  useEffect(() => {
    fetchGigs();
  }, []);

  const fetchGigs = async () => {
    try {
      setLoading(true);
      const studentId = localStorage.getItem("studentId");
      const response = await axios.get(`${BASE_URL}/student-gigs?studentId=${studentId}`);
      setGigs(response.data && response.data.length ? response.data : response.data.gigs || response.data || []);
    } catch (err) {
      console.error("Error fetching gigs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (gig) => {
    setEditGig(gig);
    setShowCreate(true);
  };

  const handleDelete = async (gigId) => {
    if (!confirm("Are you sure you want to delete this gig? This will remove the gig for all users and refund payments if any.")) return;
    try {
      const studentId = JSON.parse(localStorage.getItem('student'))?._id || '';
      await axios.delete(`${BASE_URL}/student-gigs/${gigId}?studentId=${studentId}`);
      fetchGigs();
      toast.success("Gig deleted and related offers cleaned up");
    } catch (err) {
      console.error("Error deleting gig:", err);
      toast.error("Failed to delete gig: " + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return <div className="text-center py-12">Loading gigs...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Top Navbar */}
      <header className="bg-white shadow-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-2xl font-bold text-blue-600">TutorLance</div>
            <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-3 py-1 gap-2">
              <FaSearch className="text-gray-400" />
              <input placeholder="Search gigs or keywords" className="bg-transparent outline-none text-sm" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => setShowCreate(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2">
              <FaPlus /> New Gig
            </button>
            <div className="flex items-center gap-2">
              <FaUserCircle className="text-2xl text-gray-600" />
              <div className="text-sm">
                <div className="font-semibold">{JSON.parse(localStorage.getItem("student") || "{}").name || "Student"}</div>
                <div className="text-xs text-gray-500">Manage your gigs</div>
              </div>
            </div>
            <button onClick={() => { localStorage.removeItem('student'); toast.success('Logged out'); window.location.href = '/login'; }} className="ml-4 px-3 py-1 rounded bg-red-50 text-red-700">Logout</button>
          </div>
        </div>
      </header>

      <main className="p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold text-gray-800">📚 My Gigs</h1>
          <div className="flex items-center gap-3">
            <button onClick={() => { setTab("my-gigs"); }} className={`px-4 py-2 rounded-lg ${tab === "my-gigs" ? "bg-white border border-blue-300" : "bg-blue-600 text-white"}`}>My Gigs</button>
            <button onClick={() => { setTab("negotiations"); }} className={`px-4 py-2 rounded-lg ${tab === "negotiations" ? "bg-white border border-blue-300" : "bg-blue-600 text-white"}`}>Negotiations</button>
            <button onClick={() => { setTab("delivery"); }} className={`px-4 py-2 rounded-lg ${tab === "delivery" ? "bg-white border border-blue-300" : "bg-blue-600 text-white"}`}>Delivery & Payment</button>
            <button onClick={() => setShowCreate(true)} className="ml-4 px-4 py-2 rounded-lg bg-white border border-blue-300 text-blue-700">+ New Gig</button>
          </div>
        </div>

        {/* Content */}
        <div>
          {tab === "my-gigs" && (
            <div>
              {gigs.length === 0 ? (
                <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                  <p className="text-gray-600 mb-4">You have not posted any gigs yet.</p>
                  <button onClick={() => setShowCreate(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg inline-flex items-center gap-2">
                    <FaPlus /> Create New Gig
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {gigs.map((gig) => (
                    <StudentGigCard key={gig._id} gig={gig} onViewOffers={(g) => { setSelectedGig(g); setTab("negotiations"); }} onEdit={(g) => handleEdit(g)} onDelete={(id) => handleDelete(id)} />
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "negotiations" && (
            <div className="space-y-8">
              {gigs.length === 0 ? (
                <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                  <p className="text-gray-600 mb-4">No gigs posted yet.</p>
                </div>
              ) : !selectedGig ? (
                <div className="space-y-4">
                  <p className="text-gray-700 font-semibold">Select a gig to view offers:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {gigs.map((gig) => (
                      <button
                        key={gig._id}
                        onClick={() => setSelectedGig(gig)}
                        className="bg-white rounded-lg shadow p-4 text-left hover:shadow-lg transition border-l-4 border-blue-500"
                      >
                        <h4 className="font-bold text-gray-800">{gig.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{gig.description}</p>
                        <p className="text-blue-600 font-bold mt-2">PKR {gig.budget}</p>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <button
                    onClick={() => setSelectedGig(null)}
                    className="mb-4 px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
                  >
                    ← Back to Gigs
                  </button>
                  <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-300 mb-8">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">{selectedGig.title}</h3>
                    <p className="text-gray-600 mb-4">{selectedGig.description}</p>
                    <div className="flex gap-8">
                      <div>
                        <p className="text-sm text-gray-600">Domain</p>
                        <p className="text-lg font-bold text-gray-800">{selectedGig.domain}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Budget</p>
                        <p className="text-lg font-bold text-blue-600">PKR {selectedGig.budget}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Posted</p>
                        <p className="text-lg font-bold text-gray-800">{new Date(selectedGig.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                  <StudentGigOffers gigId={selectedGig._id} studentId={localStorage.getItem("studentId")} onOfferSelect={(offer) => { setSelectedOffer(offer); setTab("delivery"); }} />
                </div>
              )}
            </div>
          )}

          {tab === "delivery" && selectedOffer && (
            <div className="space-y-8">
              <Elements stripe={stripePromise}>
                {selectedOffer.status === "accepted" && selectedOffer.paymentStatus === "pending" && (
                  <GigPayment offer={selectedOffer} onPaymentSuccess={(updatedOffer) => setSelectedOffer(updatedOffer)} />
                )}
              </Elements>
              <GigDelivery offer={selectedOffer} onDeliverySubmit={(updatedOffer) => setSelectedOffer(updatedOffer)} isFreelancer={false} />
            </div>
          )}
              {/* Create Gig Modal */}
              {showCreate && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                  <div className="bg-white rounded-xl w-full max-w-2xl p-6 shadow-2xl relative">
                    <button onClick={() => { setShowCreate(false); setEditGig(null); }} className="absolute right-4 top-4 text-gray-500 hover:text-gray-800">✕</button>
                    <StudentCreateGig
                      existingGig={editGig}
                      onCreated={() => {
                        setShowCreate(false);
                        fetchGigs();
                      }}
                      onUpdated={() => {
                        setShowCreate(false);
                        setEditGig(null);
                        fetchGigs();
                      }}
                      onCancel={() => { setShowCreate(false); setEditGig(null); }}
                    />
                  </div>
                </div>
              )}
        </div>
      </main>
    </div>
  );
};

export default StudentGigs;
