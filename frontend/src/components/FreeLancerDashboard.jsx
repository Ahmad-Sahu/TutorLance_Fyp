import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from 'react-hot-toast'
import {
  FaUserCircle,
  FaTasks,
  FaCogs,
  FaBriefcase,
  FaHandshake,
  FaPlus,
  FaMinus,
  FaCheck,
  FaHistory,
} from "react-icons/fa";
import { MdFeedback } from "react-icons/md";
import GigNegotiation from "./GigNegotiation";
import FreelancerOrders from "./FreelancerOrders";

const FreelancerDashboard = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [freelancer, setFreelancer] = useState(null);
  const [dashboardData, setDashboardData] = useState({});
  const [studentGigs, setStudentGigs] = useState([]); // 🎯 Added
  const [freelancerOffers, setFreelancerOffers] = useState([]);
  const [offersLoading, setOffersLoading] = useState(false);
  const [highlightedGig, setHighlightedGig] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [updatedProfile, setUpdatedProfile] = useState({});
  const [newGig, setNewGig] = useState({ title: "", description: "", price: "" });
  const [complaintText, setComplaintText] = useState("");
  const [myComplaints, setMyComplaints] = useState([]);

  // Fetch notifications
  const [notifications, setNotifications] = useState([]);
  const unreadNotificationCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (activeSection === "complaints" && localStorage.getItem("token")) {
      axios.get("http://localhost:3000/api/v1/complaints/my", { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } })
        .then((r) => setMyComplaints(r.data.complaints || []))
        .catch(() => {});
    }
  }, [activeSection]);

  const handleSendComplaint = async () => {
    if (!complaintText.trim()) return;
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:3000/api/v1/complaints", { message: complaintText }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Complaint sent");
      setComplaintText("");
      const r = await axios.get("http://localhost:3000/api/v1/complaints/my", { headers: { Authorization: `Bearer ${token}` } });
      setMyComplaints(r.data.complaints || []);
    } catch (e) {
      toast.error("Failed to send");
    }
  };

  const fetchOffersForFreelancer = async () => {
    try {
      const id = localStorage.getItem("freelancerId");
      if (!id) return;
      setOffersLoading(true);
      const res = await axios.get(`http://localhost:3000/api/v1/gig-offers/freelancer/${id}`);
      setFreelancerOffers(res.data || []);
    } catch (err) {
      console.error('❌ Error fetching freelancer offers', err);
    } finally {
      setOffersLoading(false);
    }
  };

  // Scroll into view when a highlighted gig is set
  React.useEffect(() => {
    if (!highlightedGig) return;
    setTimeout(() => {
      const el = document.getElementById(`gig-${highlightedGig}`);
      if (el && typeof el.scrollIntoView === 'function') {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);
  }, [highlightedGig]);

  const BASE_URL = "http://localhost:3000/api/v1/freelancers";

  useEffect(() => {
    const id = localStorage.getItem("freelancerId");
    if (!id) return alert("Please log in again!");

    // Try to load from localStorage first (faster)
    const storedFreelancer = localStorage.getItem("freelancer");
    if (storedFreelancer) {
      try {
        const parsed = JSON.parse(storedFreelancer);
        setFreelancer(parsed);
        setUpdatedProfile(parsed);
      } catch (err) {
        console.warn("Error parsing stored freelancer:", err);
      }
    }

    const fetchFreelancer = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/${id}`);
        setFreelancer(res.data);
        setUpdatedProfile(res.data);
      } catch (err) {
        console.error("❌ Error fetching freelancer:", err);
      }
    };

    const fetchDashboard = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/${id}/dashboard`);
        setDashboardData(res.data);
      } catch (err) {
        console.error("❌ Error fetching dashboard data:", err);
      }
    };

    // 🎯 Fetch Student Gigs Relevant to Freelancer's Skill/Domain
    const fetchStudentGigs = async (skill) => {
      if (!skill) return;
      try {
        const res = await axios.get(
          `http://localhost:3000/api/v1/student-gigs/relevant/${id}`
        );
        // Filter out gigs where deadline has passed
        const now = new Date();
        const filtered = (res.data.gigs || []).filter(g => !g.deadline || new Date(g.deadline) > now);
        setStudentGigs(filtered);
      } catch (err) {
        console.error("❌ Error fetching student gigs:", err);
      }
    };

    fetchFreelancer();
    fetchDashboard();
    fetchOffersForFreelancer();
    
    // Fetch notifications
    const fetchNotifications = async () => {
      try {
        const id = localStorage.getItem("freelancerId");
        if (!id) return;
        const res = await axios.get(`http://localhost:3000/api/v1/freelancers/${id}`);
        const notifs = (res.data.notifications || []).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
        setNotifications(notifs);
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    };
    fetchNotifications();

    const skillToMatch = storedFreelancer ? JSON.parse(storedFreelancer).domain || JSON.parse(storedFreelancer).skills : null;
    if (skillToMatch) fetchStudentGigs(skillToMatch);
  }, []);

  const handleProfileUpdate = async () => {
    try {
      const id = localStorage.getItem("freelancerId");
      
      // Convert DOB from dd/mm/yyyy to ISO format if it's in dd/mm/yyyy
      let profileToSave = { ...updatedProfile };
      if (profileToSave.dob && profileToSave.dob.includes("/")) {
        const [day, month, year] = profileToSave.dob.split("/");
        profileToSave.dob = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      }
      
      const res = await axios.put(`${BASE_URL}/${id}`, profileToSave);
      setFreelancer(profileToSave);
      setUpdatedProfile(profileToSave);
      localStorage.setItem("freelancer", JSON.stringify(profileToSave));
      setEditMode(false);
      toast.success("✅ Profile updated successfully!");
    } catch (err) {
      console.error("❌ Error updating profile:", err);
      alert("❌ Error updating profile: " + (err.response?.data?.message || err.message));
    }
  };

  const handleAddGig = async () => {
    try {
      const id = localStorage.getItem("freelancerId");
      const res = await axios.post(`${BASE_URL}/${id}/gigs`, newGig);
      setFreelancer({ ...freelancer, gigs: res.data.gigs });
      setNewGig({ title: "", description: "", price: "" });
      toast.success("✅ New gig added!");
    } catch (err) {
      console.error("❌ Error adding gig:", err);
    }
  };

  const handleDeleteGig = async (gigId) => {
    try {
      const id = localStorage.getItem("freelancerId");
      await axios.delete(`${BASE_URL}/${id}/gigs/${gigId}`);
      setFreelancer({
        ...freelancer,
        gigs: freelancer.gigs.filter((g) => g._id !== gigId),
      });
      toast.success("🗑️ Gig deleted successfully!");
    } catch (err) {
      console.error("❌ Error deleting gig:", err);
    }
  };

  // Quick Apply: send an offer equal to the gig budget
  const handleQuickApply = async (gig) => {
    try {
      const freelancerId = localStorage.getItem("freelancerId");
      if (!freelancerId) return alert("Please log in again to apply.");
      
      console.log("🚀 Quick Apply - gigId:", gig._id, "budget:", gig.budget, "freelancerId:", freelancerId);
      
      const res = await axios.post(`http://localhost:3000/api/v1/gig-offers/${freelancerId}/create`, {
        gigId: gig._id,
        offeredAmount: gig.budget,
      });
      
      console.log("✅ Offer response:", res.data);
      toast.success("✅ Quick Apply sent — student will be notified.");
      // refresh freelancer offers
      fetchOffersForFreelancer();
    } catch (err) {
      console.error("❌ Quick Apply failed:", err);
      alert("❌ Quick Apply failed: " + (err.response?.data?.message || err.message));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("freelancerId");
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const Card = ({ children }) => (
    <div className="bg-white shadow-md rounded-2xl p-6 mb-6 border border-gray-100">
      {children}
    </div>
  );

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 to-purple-50">
      {/* ===== Sidebar ===== */}
      <div className="w-64 bg-white shadow-lg border-r border-gray-200 p-6 flex flex-col justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-600 mb-8 text-center">
            TutorLance
          </h1>

          <nav className="space-y-4">
            {[
              ["dashboard", "Dashboard", <FaTasks />],
              ["profile", "Profile", <FaUserCircle />],
              ["available-gigs", "Available Gigs", <FaHandshake />],
              ["offers", "Offers", <FaHandshake />],
              ["gigs", "Delivered Gigs", <FaBriefcase />],
              ["orders", "Orders", <FaTasks />],
              ["feedback", "Feedback", <MdFeedback />],
              ["settings", "Settings", <FaCogs />],
              ["complaints", "Complaints", <span>📩</span>],
            ].map(([section, label, icon]) => (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-left transition-all relative ${
                  activeSection === section
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {icon} {label}
                {section === "orders" && unreadNotificationCount > 0 && (
                  <span className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                    {unreadNotificationCount}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="text-red-500 mt-10 font-semibold hover:underline"
        >
          Logout
        </button>
      </div>

      {/* ===== Main Content ===== */}
      <div className="flex-1 p-10 overflow-y-auto">
        {/* ✅ Dashboard Overview */}
        {activeSection === "dashboard" && (
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              Dashboard Overview
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              <Card>
                <p className="text-gray-500">Total Gigs</p>
                <h3 className="text-3xl font-bold text-blue-600">
                  {dashboardData.totalGigs || 0}
                </h3>
              </Card>
              <Card>
                <p className="text-gray-500">Total Orders</p>
                <h3 className="text-3xl font-bold text-blue-600">
                  {dashboardData.totalOrders || 0}
                </h3>
              </Card>
              <Card>
                <p className="text-gray-500">Earnings</p>
                <h3 className="text-3xl font-bold text-green-600">
                  Rs. {dashboardData.totalEarnings || 0}
                </h3>
              </Card>
              <Card>
                <p className="text-gray-500">Feedbacks</p>
                <h3 className="text-3xl font-bold text-purple-600">
                  {dashboardData.feedbackCount || 0}
                </h3>
              </Card>
              <Card>
                <p className="text-gray-500">Rating</p>
                <h3 className="text-3xl font-bold text-yellow-500">
                  ⭐ {dashboardData.rating || 0}
                </h3>
              </Card>
            </div>

            {/* 🎯 Added Section: Relevant Student Gigs */}
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Relevant Student Gigs ({freelancer?.skills || "General"})
            </h2>

            {studentGigs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {studentGigs.map((gig) => (
                  <Card key={gig._id}>
                    <div id={`gig-${gig._id}`} className={`${highlightedGig === gig._id ? 'ring-4 ring-yellow-300' : ''}`}>
                      <h3 className="text-xl font-semibold text-gray-800">
                        {gig.title}
                      </h3>
                      <p className="text-gray-600 mt-2">{gig.description}</p>
                      <p className="mt-2 text-green-600 font-medium">
                        Budget: Rs. {gig.budget}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        Posted by: {gig.studentName}
                      </p>
                      <div className="mt-4 flex gap-3">
                        <button onClick={() => { setHighlightedGig(gig._id); setActiveSection('available-gigs'); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                          View
                        </button>
                        <button
                          onClick={() => handleQuickApply(gig)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                        >
                          Quick Apply
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No gigs available for your domain yet.</p>
        )}

        {/* ===== Offers for Freelancer ===== */}
        {activeSection === 'offers' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Offers Received</h2>
            {offersLoading ? (
              <div>Loading offers...</div>
            ) : freelancerOffers && freelancerOffers.length === 0 ? (
              <div className="bg-white p-6 rounded shadow">No offers yet.</div>
            ) : (
              <div className="space-y-4">
                {freelancerOffers.map((offer) => (
                  <div key={offer._id} className="bg-white p-4 rounded shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold">{offer.freelancerName} — {offer.studentName}</h4>
                        <p className="text-sm text-gray-600">Offered: PKR {offer.offeredAmount} (Original: PKR {offer.originalBudget})</p>
                        <p className="text-sm text-gray-500">Status: {offer.status}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={async () => {
                          try {
                            await axios.put(`http://localhost:3000/api/v1/gig-offers/${offer._id}/accept`, { acceptedBy: 'freelancer' });
                            toast.success('Offer accepted');
                            fetchOffersForFreelancer();
                          } catch (err) { alert('❌ ' + (err.response?.data?.message || err.message)); }
                        }} className="px-3 py-2 bg-green-600 text-white rounded">Accept</button>
                        <button onClick={async () => {
                          try {
                            await axios.put(`http://localhost:3000/api/v1/gig-offers/${offer._id}/reject`, { rejectedBy: 'freelancer' });
                            toast.success('Offer rejected');
                            fetchOffersForFreelancer();
                          } catch (err) { alert('❌ ' + (err.response?.data?.message || err.message)); }
                        }} className="px-3 py-2 bg-red-600 text-white rounded">Reject</button>
                      </div>
                    </div>

                    {offer.negotiationHistory && offer.negotiationHistory.length > 0 && (
                      <div className="mt-3 text-sm text-gray-600">
                        <strong>Negotiation History:</strong>
                        <div className="space-y-1 mt-1">
                          {offer.negotiationHistory.map((h, idx) => (
                            <div key={idx} className="flex justify-between">
                              <div>{h.updatedBy}: PKR {h.amount} {h.comment ? `- ${h.comment}` : ''}</div>
                              <div className="text-xs text-gray-400">{new Date(h.timestamp).toLocaleString()}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {offer.status === 'pending' && (
                      <div className="mt-3 flex gap-2">
                        <input type="number" placeholder="Enter counter amount" className="border p-2 rounded flex-1" id={`counter-${offer._id}`} />
                        <button onClick={async () => {
                          const el = document.getElementById(`counter-${offer._id}`);
                          const amount = parseInt(el?.value || '0');
                          if (!amount || amount <= 0) return alert('Enter a valid amount');
                          try {
                            await axios.put(`http://localhost:3000/api/v1/gig-offers/${offer._id}/update-amount`, { newAmount: amount, updatedBy: 'freelancer', comment: 'Freelancer counter' });
                            toast.success('✅ Counter offer sent successfully!');
                            fetchOffersForFreelancer();
                          } catch (err) { alert('❌ ' + (err.response?.data?.message || err.message)); }
                        }} className="px-4 py-2 bg-blue-600 text-white rounded">Counter</button>
                      </div>
                    )}

                  </div>
                ))}
              </div>
            )}
          </div>
        )}
          </div>
        )}

        {/* ✅ Profile Section */}
        {activeSection === "profile" && freelancer && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800">My Profile</h2>
              <button
                onClick={() => {
                  if (!editMode) {
                    setUpdatedProfile(freelancer);
                  }
                  setEditMode(!editMode);
                }}
                className={`px-6 py-2 rounded-lg font-semibold transition ${
                  editMode
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {editMode ? "Cancel" : "✏️ Edit Profile"}
              </button>
            </div>

            {/* Beautiful Profile Card */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-lg p-8 border border-blue-100">
              {editMode ? (
                /* Edit Mode */
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={updatedProfile.name || ""}
                        onChange={(e) => setUpdatedProfile({ ...updatedProfile, name: e.target.value })}
                        className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Domain</label>
                      <input
                        type="text"
                        value={updatedProfile.domain || ""}
                        onChange={(e) => setUpdatedProfile({ ...updatedProfile, domain: e.target.value })}
                        className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Skills</label>
                      <input
                        type="text"
                        value={updatedProfile.skills || ""}
                        onChange={(e) => setUpdatedProfile({ ...updatedProfile, skills: e.target.value })}
                        className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Birth (dd/mm/yyyy)</label>
                      <input
                        type="text"
                        value={updatedProfile.dob 
                          ? updatedProfile.dob.includes("/") 
                            ? updatedProfile.dob 
                            : new Date(updatedProfile.dob).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" })
                          : ""}
                        onChange={(e) => setUpdatedProfile({ ...updatedProfile, dob: e.target.value })}
                        placeholder="25/12/1990"
                        className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">CNIC Number</label>
                      <input
                        type="text"
                        value={updatedProfile.cnicNumber || ""}
                        onChange={(e) => setUpdatedProfile({ ...updatedProfile, cnicNumber: e.target.value })}
                        className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                      <select
                        value={updatedProfile.status || "Available"}
                        onChange={(e) => setUpdatedProfile({ ...updatedProfile, status: e.target.value })}
                        className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-blue-500 focus:outline-none"
                      >
                        <option value="Available">Available</option>
                        <option value="Busy">Busy</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description / About</label>
                    <textarea
                      value={updatedProfile.description || ""}
                      onChange={(e) => setUpdatedProfile({ ...updatedProfile, description: e.target.value })}
                      rows={4}
                      className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">YouTube URL</label>
                    <input
                      type="url"
                      value={updatedProfile.youtubeUrl || ""}
                      onChange={(e) => setUpdatedProfile({ ...updatedProfile, youtubeUrl: e.target.value })}
                      placeholder="https://youtube.com/..."
                      className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={handleProfileUpdate}
                      className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
                    >
                      ✅ Save Changes
                    </button>
                    <button
                      onClick={() => setEditMode(false)}
                      className="flex-1 bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-500 transition"
                    >
                      ❌ Discard
                    </button>
                  </div>
                </div>
              ) : (
                /* View Mode */
                <div>
                  <div className="flex flex-col md:flex-row gap-8">
                    {/* Profile Picture Section */}
                    <div className="flex-shrink-0 text-center">
                      {freelancer.picture ? (
                        <img
                          src={freelancer.picture}
                          alt="Profile"
                          className="w-48 h-48 rounded-2xl object-cover shadow-lg border-4 border-white"
                        />
                      ) : (
                        <div className="w-48 h-48 rounded-2xl bg-gradient-to-br from-blue-200 to-purple-200 flex items-center justify-center shadow-lg border-4 border-white">
                          <FaUserCircle className="text-8xl text-blue-500" />
                        </div>
                      )}
                      <div className="mt-4 text-center">
                        <span className={`inline-block px-4 py-2 rounded-full font-semibold text-white ${
                          freelancer.status === "Available" ? "bg-green-500" : "bg-orange-500"
                        }`}>
                          ● {freelancer.status}
                        </span>
                      </div>
                    </div>

                    {/* Profile Info Section */}
                    <div className="flex-1">
                      <div className="mb-6">
                        <h3 className="text-4xl font-bold text-gray-900">{freelancer.name || "N/A"}</h3>
                        <p className="text-lg text-gray-600 mt-2">📧 {freelancer.email}</p>
                      </div>

                      {/* Domain & Skills Badge */}
                      <div className="flex gap-4 mb-6">
                        <span className="bg-blue-600 text-white px-4 py-2 rounded-full font-semibold">
                          💼 {freelancer.domain || "Not specified"}
                        </span>
                        <span className="bg-purple-600 text-white px-4 py-2 rounded-full font-semibold">
                          🎯 {freelancer.skills || "Not specified"}
                        </span>
                      </div>

                      {/* Info Grid */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-white p-4 rounded-lg shadow">
                          <p className="text-sm text-gray-600">Date of Birth</p>
                          <p className="text-lg font-semibold text-gray-900 mt-1">
                            {freelancer.dob 
                              ? (freelancer.dob.includes("/") 
                                ? freelancer.dob 
                                : new Date(freelancer.dob).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }))
                              : "Not specified"
                            }
                          </p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow">
                          <p className="text-sm text-gray-600">CNIC Number</p>
                          <p className="text-lg font-semibold text-gray-900 mt-1">{freelancer.cnicNumber || "Not specified"}</p>
                        </div>
                      </div>

                      {/* About Section */}
                      {freelancer.description && (
                        <div className="bg-white p-6 rounded-lg shadow mb-6">
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">📝 About Me</h4>
                          <p className="text-gray-700">{freelancer.description}</p>
                        </div>
                      )}

                      {/* YouTube Link */}
                      {freelancer.youtubeUrl && (
                        <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500 mb-6">
                          <a
                            href={freelancer.youtubeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-red-600 hover:text-red-800 font-semibold flex items-center gap-2"
                          >
                            🎥 View Work Sample on YouTube →
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* CNIC Image */}
                  {freelancer.cnicImage && (
                    <div className="mt-8 pt-8 border-t border-gray-300">
                      <p className="text-sm font-semibold text-gray-600 mb-4">📄 CNIC Image</p>
                      <img src={freelancer.cnicImage} alt="CNIC" className="h-32 rounded-lg shadow-lg border-2 border-gray-300" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Available Gigs Section */}
        {activeSection === "available-gigs" && (
          <div className="flex-1 overflow-auto p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">🎯 Available Gigs Matching Your Skills</h2>

            {studentGigs.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <p className="text-gray-600 mb-4">No gigs matching your domain yet.</p>
                <p className="text-sm text-gray-500">Gigs will appear here as students post them in your domain.</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {studentGigs.map((gig) => (
                  <div key={gig._id} className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-lg p-6 border-2 border-blue-200">
                    {/* Gig Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800">{gig.title}</h3>
                        <p className="text-gray-600 mt-1">{gig.description}</p>
                        <p className="text-sm text-blue-600 font-semibold mt-2">👤 Posted by: <span className="text-gray-800">{gig.studentName || "Unknown Student"}</span></p>
                      </div>
                      <span className="bg-green-600 text-white px-4 py-2 rounded-full font-semibold text-lg">
                        PKR {gig.budget}
                      </span>
                    </div>

                    {/* Gig Meta Info */}
                    <div className="bg-white rounded-lg p-4 mb-6 grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Domain</p>
                        <p className="font-bold text-gray-800">{gig.domain}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Posted Date</p>
                        <p className="font-bold text-gray-800">{new Date(gig.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Status</p>
                        <p className="font-bold text-green-600">Available</p>
                      </div>
                    </div>

                    <div className="flex gap-3 items-center mb-4">
                      <button
                        onClick={() => { setHighlightedGig(gig._id); setActiveSection('available-gigs'); }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleQuickApply(gig)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                      >
                        Quick Apply
                      </button>

                      {offersLoading ? (
                        <div className="text-sm text-gray-500 ml-2">Checking offers...</div>
                      ) : null}
                    </div>

                    {/* If freelancer already made an offer for this gig, show it and allow negotiation */}
                    {(() => {
                      const matchingOffer = freelancerOffers.find(o => {
                        const gid = o.gigId && (o.gigId._id || o.gigId);
                        return String(gid) === String(gig._id);
                      });

                      if (matchingOffer) {
                        return (
                          <div className="mb-4 p-4 rounded bg-white border">
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="text-sm text-gray-600">Your offer</div>
                                <div className="font-bold">PKR {matchingOffer.offeredAmount}</div>
                                <div className="text-xs text-gray-500">Status: {matchingOffer.status}</div>
                                {matchingOffer.negotiationHistory && matchingOffer.negotiationHistory.length > 0 && (
                                  <div className="text-sm text-gray-600 mt-2">
                                    Latest: {matchingOffer.negotiationHistory[matchingOffer.negotiationHistory.length - 1].updatedBy}: PKR {matchingOffer.negotiationHistory[matchingOffer.negotiationHistory.length - 1].amount}
                                  </div>
                                )}
                              </div>
                              <div>
                                <GigNegotiation
                                  gig={gig}
                                  freelancer={freelancer}
                                  offerId={matchingOffer._id}
                                  existingOffer={matchingOffer}
                                  onOfferSent={() => fetchOffersForFreelancer()}
                                  isFreelancer={true}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      }

                      return null;
                    })()}

                    {/* GigNegotiation Component for new offers */}
                    {!freelancerOffers.find(o => String(o.gigId && (o.gigId._id || o.gigId)) === String(gig._id)) && (
                      <GigNegotiation
                        gig={gig}
                        freelancer={freelancer}
                        onOfferSent={(offer) => {
                          toast.success("✅ Counter offer sent successfully!");
                          fetchOffersForFreelancer();
                        }}
                        isFreelancer={true}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Feedback Section */}
        {activeSection === "feedback" && freelancer && (
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Feedback & Reviews</h2>
            {freelancer.feedbacks && freelancer.feedbacks.length > 0 ? (
              <div className="space-y-4">
                {freelancer.feedbacks.map((fb, idx) => (
                  <div key={idx} className="bg-white rounded-lg shadow p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold">{fb.client || 'Student'}</div>
                        <div className="text-sm text-gray-600">{fb.comment}</div>
                      </div>
                      <div className="text-xl font-bold text-yellow-500">{fb.rating} ★</div>
                    </div>
                    <div className="text-xs text-gray-400 mt-2">{fb.createdAt ? new Date(fb.createdAt).toLocaleDateString() : ''}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-6 rounded shadow">No feedback yet.</div>
            )}
          </div>
        )}

        {/* Gigs Section (show only completed gigs) */}
        {activeSection === "gigs" && freelancer && (
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Completed Gigs</h2>

            {/* Display Completed Orders (treated as completed gigs) */}
            {freelancer.orders && freelancer.orders.filter(o => o.status === "Completed").length > 0 ? (
              freelancer.orders.filter(o => o.status === "Completed").map((order, idx) => (
                <Card key={idx}>
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-700">{order.project || 'Project'}</h3>
                      <p className="text-gray-500">Client: {order.clientName}</p>
                      <p className="font-medium text-green-600">Rs. {order.payment}</p>
                      <p className="text-sm text-gray-500">Completed on: {order.completedAt ? new Date(order.completedAt).toLocaleDateString() : new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <p className="text-gray-600">No completed gigs yet. Completed orders will appear here.</p>
            )}
          </div>
        )}

        {/* Notifications Section */}
        {activeSection === "orders" && (
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Orders & Notifications</h2>
            
            {/* Notifications List */}
            {notifications && notifications.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4">Recent Notifications</h3>
                <div className="space-y-3">
                  {notifications.map((n, idx) => (
                    <div key={idx} className={`p-4 rounded-lg ${n.read ? 'bg-gray-100' : 'bg-blue-50 border-l-4 border-blue-600'}`}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className={`text-sm ${n.read ? 'text-gray-600' : 'text-gray-800 font-semibold'}`}>{n.message}</p>
                          <p className="text-xs text-gray-400 mt-1">{n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}</p>
                        </div>
                        {!n.read && <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded">New</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Orders Queue */}
            <h3 className="text-xl font-bold mb-4">Orders Queue</h3>
            <FreelancerOrders freelancerId={freelancer?._id} />
          </div>
        )}

        {/* Complaints Section */}
        {activeSection === "complaints" && (
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Complaints</h2>
            <p className="text-gray-600 mb-4">Send a complaint to admin (e.g. student not releasing payment for gig delivery).</p>
            <div className="flex flex-wrap gap-2 mb-4">
              <textarea value={complaintText} onChange={(e) => setComplaintText(e.target.value)} placeholder="Describe your complaint..." className="border rounded px-3 py-2 w-full max-w-xl" rows={3} />
              <button type="button" onClick={handleSendComplaint} className="bg-blue-600 text-white px-4 py-2 rounded h-fit cursor-pointer hover:bg-blue-700">Send</button>
            </div>
            <div className="space-y-2">
              {myComplaints.length === 0 ? <p className="text-gray-500">No complaints yet.</p> : myComplaints.map((c) => (
                <div key={c._id} className="bg-white p-3 rounded shadow text-sm border">
                  <p className="font-medium">{c.message}</p>
                  <p className="text-gray-500 text-xs mt-1">{new Date(c.createdAt).toLocaleString()} • {c.status}</p>
                  {c.adminResponse && <p className="mt-2 text-indigo-600">Admin: {c.adminResponse}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default FreelancerDashboard;