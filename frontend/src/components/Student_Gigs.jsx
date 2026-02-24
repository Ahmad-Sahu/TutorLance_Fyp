import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from 'react-hot-toast'
import GigPayment from "./GigPayment";
import { useNavigate } from "react-router-dom";
import { FaList, FaHandshake, FaBell, FaCheck, FaTimes } from "react-icons/fa";

const StudentCreateGig = ({ onCreated, existingGig, onUpdated, onCancel }) => {
    const [gig, setGig] = useState({
        title: "",
        description: "",
        domain: "",
        budget: "",
        deadline: ""
    });

    // Navigation state
    const [activePage, setActivePage] = useState("my-gigs"); // "my-gigs" | "counter-offers" | "orders" | "notifications"
    const [myGigs, setMyGigs] = useState([]);
    const [offers, setOffers] = useState([]);
    const [orders, setOrders] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loadingNav, setLoadingNav] = useState(false);

    // Freelancers profiles display
    const [randomFreelancers, setRandomFreelancers] = useState([]);
    const [freelancersLoading, setFreelancersLoading] = useState(false);

    // Selected freelancer modal state
    const [selectedFreelancer, setSelectedFreelancer] = useState(null);
    const [showProfileModal, setShowProfileModal] = useState(false);

    // Router navigation
    const navigate = useNavigate();

    // Calculate unread notifications
    const unreadCount = notifications.filter(n => !n.read).length; 

    // Negotiation UI state
    const [negotiatingOfferId, setNegotiatingOfferId] = useState(null);
    const [negotiationInputs, setNegotiationInputs] = useState({});

    const handleStartNegotiation = (offerId, currentAmount) => {
        setNegotiatingOfferId(offerId);
        setNegotiationInputs(prev => ({ ...prev, [offerId]: currentAmount || 0 }));
    };

    const handleNegotiationInputChange = (offerId, value) => {
        setNegotiationInputs(prev => ({ ...prev, [offerId]: value }));
    };

    const handleStudentCounter = async (offerId) => {
        const raw = negotiationInputs[offerId];
        const newAmount = parseInt(raw, 10);
        if (!newAmount || newAmount <= 0) return alert('Enter a valid counter amount');
        try {
            await axios.put(`http://localhost:3000/api/v1/gig-offers/${offerId}/update-amount`, { newAmount, updatedBy: 'student', comment: 'Student counter' });
            toast.success('✅ Counter offer sent to freelancer');
            // refresh offers
            const studentId = JSON.parse(localStorage.getItem("student"))?._id || "";
            const res = await axios.get("http://localhost:3000/api/v1/gig-offers/student?studentId=" + studentId);
            setOffers(res.data && Array.isArray(res.data) ? res.data : res.data.offers || []);
            setNegotiatingOfferId(null);
        } catch (err) {
            console.error('Error sending counter', err);
            alert('Error sending counter: ' + (err.response?.data?.message || err.message));
        }
    };

    // Logout handler for student
    const handleStudentLogout = () => {
        localStorage.removeItem('student');
        toast.success('Logged out');
        navigate('/login');
    };


    // Fetch random freelancers to display
    useEffect(() => {
        const fetchRandomFreelancers = async () => {
            try {
                setFreelancersLoading(true);
                const res = await axios.get('http://localhost:3000/api/v1/freelancers/random/list?limit=4');
                setRandomFreelancers(res.data || []);
            } catch (err) {
                console.error('Error fetching random freelancers:', err);
            } finally {
                setFreelancersLoading(false);
            }
        };
        fetchRandomFreelancers();
    }, []);

    // Helper to extract YouTube embed URL if present
    const getYouTubeEmbedUrl = (url) => {
        if (!url) return null;
        const match = url.match(/(?:v=|v\/|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
        if (match && match[1]) return `https://www.youtube.com/embed/${match[1]}`;
        return null;
    };

    // Handlers for viewing freelancer profile in a modal
    const handleViewProfile = (freelancer) => {
        setSelectedFreelancer(freelancer);
        setShowProfileModal(true);
    };

    const closeProfileModal = () => {
        setSelectedFreelancer(null);
        setShowProfileModal(false);
    }; 

    // Fetch gigs and offers (simulate API)
    useEffect(() => {
        if (activePage === "my-gigs") {
            setLoadingNav(true);
            // TODO: Replace with real API call
            axios.get("http://localhost:3000/api/v1/student-gigs?studentId=" + (JSON.parse(localStorage.getItem("student"))?._id || "")).then(res => {
                setMyGigs(res.data && Array.isArray(res.data) ? res.data : res.data.gigs || []);
                setLoadingNav(false);
            }).catch(() => setLoadingNav(false));
        } else if (activePage === "counter-offers") {
            setLoadingNav(true);
            // TODO: Replace with real API call for offers
                axios.get("http://localhost:3000/api/v1/gig-offers/student?studentId=" + (JSON.parse(localStorage.getItem("student"))?._id || "")).then(res => {
                    setOffers(res.data && Array.isArray(res.data) ? res.data : res.data.offers || []);
                    setLoadingNav(false);
                }).catch(() => setLoadingNav(false));
        } else if (activePage === "orders") {
            setLoadingNav(true);
            const studentId = JSON.parse(localStorage.getItem("student"))?._id || "";
            axios.get("http://localhost:3000/api/v1/gig-offers/student?studentId=" + studentId).then(res => {
                const all = res.data && Array.isArray(res.data) ? res.data : res.data.offers || [];
                // show delivered and completed orders so they remain visible after student accepts
                setOrders(all.filter(o => o.status === 'delivered' || o.status === 'completed'));
                setLoadingNav(false);
            }).catch(() => setLoadingNav(false));
        } else if (activePage === "notifications") {
            setLoadingNav(true);
            const studentId = JSON.parse(localStorage.getItem("student"))?._id || "";
            axios.get("http://localhost:3000/api/v1/students/notifications?studentId=" + studentId).then(res => {
                const notifs = (res.data.notifications || []).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
                setNotifications(notifs);
                setLoadingNav(false);
            }).catch(() => setLoadingNav(false));
        }
    }, [activePage]);

// Payment modal state
const [paymentOffer, setPaymentOffer] = useState(null);
const [loading, setLoading] = useState(false);

// Open payment page for an offer
const handleAccept = (offer) => {
    // Prevent double payment
    if (offer.paymentStatus === 'held' || offer.status === 'accepted' || offer.paymentStatus === 'paid' || offer.status === 'completed') {
        toast.success('You have already accepted or paid for this offer');
        return;
    }

    // If freelancer already accepted, allow student to proceed to payment
    navigate(`/payment/${offer._id}`);
} 

// Reject an offer as the student
const handleReject = async (offerId) => {
    if (!window.confirm('Reject this offer?')) return;
    try {
        await axios.put(`http://localhost:3000/api/v1/gig-offers/${offerId}/reject`, { rejectedBy: 'student' });
        // Refresh offers
        const studentId = JSON.parse(localStorage.getItem("student"))?._id || "";
        const res = await axios.get("http://localhost:3000/api/v1/gig-offers/student?studentId=" + studentId);
        setOffers(res.data && Array.isArray(res.data) ? res.data : res.data.offers || []);
        toast.success('Offer rejected');
    } catch (err) {
        console.error('Error rejecting offer', err);
        alert('Error rejecting offer');
    }
}

// Called after successful payment hold
const onPaymentSuccess = async (data) => {
    // Refresh offers
    const studentId = JSON.parse(localStorage.getItem("student"))?._id || "";
    try {
        const res = await axios.get("http://localhost:3000/api/v1/gig-offers/student?studentId=" + studentId);
        setOffers(res.data && Array.isArray(res.data) ? res.data : res.data.offers || []);
    } catch (err) {
        console.error('Error refreshing offers after payment', err);
        alert('Error refreshing offers after payment');
    }
    setPaymentOffer(null);
    toast.success('Payment held and order created');
}

// Handle create/update gig form submit
const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (!gig.title || !gig.description || !gig.domain || !gig.budget) {
        alert("Please fill all fields!");
        setLoading(false);
        return;
    }

    try {
        const student = JSON.parse(localStorage.getItem("student"));

        if (!student || !student._id) {
            alert("Student information missing. Please login again.");
            setLoading(false);
            return;
        }

        const studentId = student._id;
        const studentName = student.name || `${student.firstName || ""} ${student.lastName || ""}`.trim();

        let res;

        if (existingGig && existingGig._id) {
            // Update existing gig
            res = await axios.put(`http://localhost:3000/api/v1/student-gigs/${existingGig._id}`, {
                ...gig,
            });
            toast.success("Gig updated successfully!");
            if (typeof onUpdated === "function") onUpdated(res.data.gig || res.data);
        } else {
            res = await axios.post(
                "http://localhost:3000/api/v1/student-gigs/create",
                {
                    ...gig,
                    studentId,
                    studentName,
                    createdAt: new Date(),
                }
            );
            toast.success("Gig created successfully!");
            if (typeof onCreated === "function") onCreated();
        }

        // Reset input fields
        setGig({
            title: "",
            description: "",
            domain: "",
            budget: "",
        });
    } catch (error) {
        console.log("❌ Error creating/updating gig:", error);
        alert("Error creating gig. Check console.");
    } finally {
        setLoading(false);
    }
};


    // If editing, prefill fields when component mounts
    useEffect(() => {
        if (existingGig) {
            setGig({
                title: existingGig.title || "",
                description: existingGig.description || "",
                domain: existingGig.domain || "",
                budget: existingGig.budget || "",
                deadline: existingGig.deadline || ""
            });
        }
    }, [existingGig]);

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar Navigation */}
            <aside className="w-64 bg-white shadow-lg border-r border-gray-200 p-6 flex flex-col">
                <h2 className="text-2xl font-bold text-blue-600 mb-8 text-center">Student Panel</h2>
                <div className="mb-4">
                    <div className="text-lg font-semibold text-gray-700 mb-2">My Gigs</div>
                    <nav className="space-y-2">
                        <button onClick={() => setActivePage("my-gigs")}
                            className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-left transition-all ${activePage === "my-gigs" ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-100"}`}
                        >
                            <FaList /> My Gigs
                        </button>
                        <button onClick={() => setActivePage("counter-offers")}
                            className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-left transition-all ${activePage === "counter-offers" ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-100"}`}
                        >
                            <FaHandshake /> Counter Offers
                        </button>
                        <button onClick={() => setActivePage("orders")}
                            className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-left transition-all ${activePage === "orders" ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-100"}`}
                        >
                            <FaList /> Orders
                        </button>
                        <button onClick={() => setActivePage("notifications")}
                            className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-left transition-all relative ${activePage === "notifications" ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-100"}`}
                        >
                            <FaBell /> Notifications
                            {unreadCount > 0 && (
                                <span className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        <button onClick={handleStudentLogout} className="flex items-center gap-3 w-full px-3 py-2 mt-4 rounded-lg text-left transition-all bg-red-50 text-red-700 hover:bg-red-100">
                            Logout
                        </button>
                    </nav>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-10">
                {activePage === "my-gigs" && (
                    <div>
                        <h2 className="text-3xl font-bold mb-6">My Gigs</h2>
                        {loadingNav ? <div>Loading...</div> : (
                            <div className="space-y-4">
                                {myGigs.length === 0 ? <div className="text-gray-500">No gigs posted yet.</div> : myGigs.map(gig => (
                                    <div key={gig._id} className="bg-white rounded-lg shadow p-4 flex justify-between items-center">
                                        <div>
                                            <div className="font-semibold text-lg">{gig.title}</div>
                                            <div className="text-gray-600">{gig.description}</div>
                                            <div className="text-blue-600 font-bold">PKR {gig.budget}</div>
                                            {gig.deadline && <div className="text-sm text-gray-500">Deadline: {new Date(gig.deadline).toLocaleString()}</div>}
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={async () => {
                                                if (!window.confirm('Delete this gig? This will remove the gig for all users and refund payments if any.')) return;
                                                try {
                                                    const studentId = JSON.parse(localStorage.getItem('student'))?._id || '';
                                                    await axios.delete(`http://localhost:3000/api/v1/student-gigs/${gig._id}?studentId=${studentId}`);
                                                    setMyGigs(myGigs.filter(g => g._id !== gig._id));
                                                    toast.success('Gig deleted and related offers cleaned up');
                                                    // Refresh offers and orders if currently viewing those sections
                                                    if (activePage === 'orders' || activePage === 'counter-offers') {
                                                        setActivePage('my-gigs');
                                                    }
                                                } catch (err) {
                                                    console.error('Error deleting gig', err);
                                                    toast.error('Error deleting gig: ' + (err.response?.data?.message || err.message));
                                                }
                                            }} className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600">Delete</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {/* Create New Gig form (now shown above recommended freelancers) */}
                        <div className="mt-10">
                            <h3 className="text-xl font-bold mb-2">Create New Gig</h3>
                            {/* ...existing code... */}
                            <form onSubmit={handleSubmit}>
                                <input
                                    type="text"
                                    placeholder="Gig Title"
                                    value={gig.title}
                                    onChange={(e) => setGig({ ...gig, title: e.target.value })}
                                    className="w-full border rounded p-2 mb-3"
                                />
                                <textarea
                                    placeholder="Description"
                                    value={gig.description}
                                    onChange={(e) => setGig({ ...gig, description: e.target.value })}
                                    className="w-full border rounded p-2 mb-3"
                                />
                                <select
                                    value={gig.domain}
                                    onChange={(e) => setGig({ ...gig, domain: e.target.value })}
                                    className="w-full border rounded p-2 mb-3"
                                >
                                    <option value="">Select Domain</option>
                                    <option value="Flutter">Flutter</option>
                                    <option value="Web Development">Web Development</option>
                                    <option value="UI/UX">UI/UX</option>
                                    <option value="Python">Python</option>
                                    <option value="Mobile Development">Mobile Development</option>
                                    <option value="Data Science">Data Science</option>
                                    <option value="Machine Learning">Machine Learning</option>
                                    <option value="JavaScript">JavaScript</option>
                                    <option value="Java">Java</option>
                                    <option value="C++">C++</option>
                                    <option value="Other">Other</option>
                                </select>
                                <input
                                    type="number"
                                    placeholder="Budget"
                                    value={gig.budget}
                                    onChange={(e) => setGig({ ...gig, budget: e.target.value })}
                                    className="w-full border rounded p-2 mb-3"
                                />
                                    <input
                                        type="datetime-local"
                                        placeholder="Deadline"
                                        value={gig.deadline}
                                        onChange={(e) => setGig({ ...gig, deadline: e.target.value })}
                                        className="w-full border rounded p-2 mb-3"
                                    />
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700 transition"
                                >
                                    {loading ? (existingGig ? "Saving..." : "Creating...") : (existingGig ? "Save Changes" : "Create Gig")}
                                </button>
                                {existingGig && (
                                    <button
                                        type="button"
                                        onClick={() => typeof onCancel === "function" ? onCancel() : null}
                                        className="mt-2 bg-gray-200 text-gray-800 px-4 py-2 rounded w-full hover:bg-gray-300 transition"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </form>
                        </div>

                        {/* Recommended Freelancers (moved below the Create form) */}
                        <div className="mt-10">
                            <h3 className="text-xl font-bold mb-4">Recommended Freelancers</h3>
                            {freelancersLoading ? (
                                <div className="text-gray-500">Loading freelancers...</div>
                            ) : randomFreelancers.length === 0 ? (
                                <div className="text-gray-500">No freelancers available.</div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                                    {randomFreelancers.map((freelancer) => (
                                        <div key={freelancer._id} className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg shadow-lg p-4 border border-blue-200 hover:shadow-xl transition">
                                            {/* Profile Picture */}
                                            <div className="mb-3 text-center">
                                                {freelancer.picture ? (
                                                    <img src={freelancer.picture} alt={freelancer.name} className="w-32 h-32 rounded-full object-cover mx-auto mb-2" />
                                                ) : (
                                                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-300 to-purple-300 flex items-center justify-center mb-2 text-white text-4xl">👤</div>
                                                )}
                                            </div>

                                            {/* Name */}
                                            <h4 className="text-lg font-bold text-gray-800 text-center mb-1">{freelancer.name || 'Freelancer'}</h4>

                                            {/* Domain */}
                                            <div className="text-center mb-2">
                                                <span className="inline-block bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
                                                    {freelancer.domain || 'General'}
                                                </span>
                                            </div>

                                            {/* Description */}
                                            <p className="text-sm text-gray-600 text-center mb-3 line-clamp-2">{freelancer.description || 'No description'}</p>

                                            {/* Stats */}
                                            <div className="bg-white rounded p-2 mb-3 space-y-2">
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-gray-600">Orders:</span>
                                                    <span className="font-bold text-blue-600">{(freelancer.orders && freelancer.orders.length) || 0}</span>
                                                </div>
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-gray-600">Rating:</span>
                                                    <span className="font-bold text-yellow-500">{freelancer.rating ? freelancer.rating.toFixed(1) : 'N/A'} ⭐</span>
                                                </div>
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-gray-600">Feedbacks:</span>
                                                    <span className="font-bold text-green-600">{(freelancer.feedbacks && freelancer.feedbacks.length) || 0}</span>
                                                </div>
                                            </div>

                                            {/* View Profile Button */}
                                            <button onClick={() => handleViewProfile(freelancer)} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition text-sm font-semibold">
                                                View Profile
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Freelancer Profile Modal */}
                        {showProfileModal && selectedFreelancer && (
                            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                                <div className="bg-white rounded-lg max-w-xl w-full p-6 relative">
                                    <button onClick={closeProfileModal} className="absolute top-3 right-3 text-gray-500">Close ✖</button>
                                    <div className="text-center">
                                        {selectedFreelancer.picture ? (
                                            <img src={selectedFreelancer.picture} alt={selectedFreelancer.name} className="w-32 h-32 rounded-full object-cover mx-auto mb-3" />
                                        ) : (
                                            <div className="w-32 h-32 rounded-full bg-gray-200 mx-auto mb-3 flex items-center justify-center text-2xl">👤</div>
                                        )}
                                        <h3 className="text-xl font-bold">{selectedFreelancer.name}</h3>
                                        <p className="text-sm text-gray-600">{selectedFreelancer.domain}</p>
                                        <p className="mt-3 text-gray-700">{selectedFreelancer.description}</p>
                                        <div className="mt-4 flex justify-center gap-4">
                                            <div className="text-sm">Rating: <strong>{selectedFreelancer.rating ? selectedFreelancer.rating.toFixed(1) : 'N/A'} ⭐</strong></div>
                                            <div className="text-sm">Orders: <strong>{(selectedFreelancer.orders && selectedFreelancer.orders.length) || 0}</strong></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activePage === "orders" && (
                    <div>
                        <h2 className="text-3xl font-bold mb-6">Orders (Delivered)</h2>
                        {loadingNav ? <div>Loading...</div> : (
                            <div className="space-y-4">
                                {orders.length === 0 ? <div className="text-gray-500">No delivered orders.</div> : orders.map(o => (
                                    <div key={o._id} className="bg-white rounded-lg shadow p-4 flex justify-between items-center">
                                        <div>
                                            <div className="font-semibold text-lg">{o.gig?.title || 'Gig'}</div>
                                            <div className="text-gray-600">Delivered by: {o.freelancerName}</div>
                                            <div className="text-blue-600 font-bold">PKR {o.offeredAmount}</div>
                                            <div className="text-sm text-gray-500">Delivered At: {o.deliveredAt ? new Date(o.deliveredAt).toLocaleString() : 'N/A'}</div>

                                            {o.deliveryLink && (
                                                <div className="mt-2">
                                                    <div className="text-sm font-semibold">Delivery:</div>
                                                    <a href={o.deliveryLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-words">{o.deliveryLink}</a>
                                                    {getYouTubeEmbedUrl(o.deliveryLink) && (
                                                        <div className="mt-3 w-full" style={{maxWidth: 560}}>
                                                            <div className="aspect-w-16 aspect-h-9">
                                                                <iframe
                                                                    src={getYouTubeEmbedUrl(o.deliveryLink)}
                                                                    title="Delivery Preview"
                                                                    frameBorder="0"
                                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                                    allowFullScreen
                                                                    className="w-full h-56 rounded"
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            {o.status === 'delivered' && <button onClick={async () => {
                                                try {
                                                    const res = await axios.put(`http://localhost:3000/api/v1/gig-offers/${o._id}/accept-delivery`);
                                                    toast.success('Order accepted and payment released');
                                                    // refresh orders list
                                                    const studentId = JSON.parse(localStorage.getItem("student"))?._id || "";
                                                    const all = (await axios.get("http://localhost:3000/api/v1/gig-offers/student?studentId=" + studentId)).data;
                                                    const arr = all && Array.isArray(all) ? all : all.offers || [];
                                                    setOrders(arr.filter(x => x.status === 'delivered' || x.status === 'completed'));
                                                } catch (err) { console.error(err); alert('Error accepting delivery'); }
                                            }} className="bg-green-600 text-white px-3 py-2 rounded">Accept & Release Payment</button>}

                                            {o.status === 'completed' && <div className="text-sm text-green-600 font-semibold">Completed</div>}

                                            {/* Feedback form: allow student to submit rating & comment once */}
                                            { (o.status === 'completed' || o.status === 'delivered') && !o.feedbackGiven && (
                                                <div className="mt-3 w-full">
                                                    <div className="text-sm font-semibold mb-2">Leave feedback</div>
                                                    <div className="flex gap-2 mb-2">
                                                        <select id={`rating-${o._id}`} className="border p-2 rounded">
                                                            <option value="5">5 ★</option>
                                                            <option value="4">4 ★</option>
                                                            <option value="3">3 ★</option>
                                                            <option value="2">2 ★</option>
                                                            <option value="1">1 ★</option>
                                                        </select>
                                                        <input id={`comment-${o._id}`} placeholder="Write a short feedback" className="flex-1 border p-2 rounded" />
                                                        <button onClick={async () => {
                                                            const rating = parseInt(document.getElementById(`rating-${o._id}`).value, 10);
                                                            const comment = document.getElementById(`comment-${o._id}`).value;
                                                            try {
                                                                await axios.post(`http://localhost:3000/api/v1/gig-offers/${o._id}/feedback`, { rating, comment, studentName: (JSON.parse(localStorage.getItem('student'))?.name) });
                                                                toast.success('Feedback submitted');
                                                                const studentId = JSON.parse(localStorage.getItem("student"))?._id || "";
                                                                const all = (await axios.get("http://localhost:3000/api/v1/gig-offers/student?studentId=" + studentId)).data;
                                                                const arr = all && Array.isArray(all) ? all : all.offers || [];
                                                                setOrders(arr.filter(x => x.status === 'delivered' || x.status === 'completed'));
                                                            } catch (err) {
                                                                console.error('Error submitting feedback', err);
                                                                alert('Error submitting feedback: ' + (err.response?.data?.message || err.message));
                                                            }
                                                        }} className="bg-yellow-500 px-3 py-2 rounded">Send</button>
                                                    </div>
                                                </div>
                                            ) }
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activePage === "notifications" && (
                    <div>
                        <h2 className="text-3xl font-bold mb-6">Notifications</h2>
                        {loadingNav ? <div>Loading...</div> : (
                            <div className="space-y-2">
                                {notifications.length === 0 ? <div className="text-gray-500">No notifications</div> : notifications.map((n, idx) => (
                                    <div key={idx} className={`p-3 rounded ${n.read ? 'bg-gray-50' : 'bg-blue-50 border'}`}>
                                        <div className="text-sm text-gray-700">{n.message}</div>
                                        <div className="text-xs text-gray-400">{n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activePage === "counter-offers" && (
                    <div>
                        <h2 className="text-3xl font-bold mb-6">Counter Offers</h2>
                        {loadingNav ? <div>Loading...</div> : (
                            <div className="space-y-4">
                                {offers.length === 0 ? <div className="text-gray-500">No counter offers yet.</div> : offers.map((offer) => {
                                    const canNegotiate = !["delivered","completed","rejected"].includes(offer.status) && !["held","captured","paid","released"].includes(offer.paymentStatus);
                                    return (
                                    <div key={offer._id} className="bg-white rounded-lg shadow p-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="font-semibold text-lg">{offer.gigTitle || offer.gig?.title || "Gig"}</div>
                                                <div className="text-gray-600">Offered by: {offer.freelancerName || offer.freelancer?.name || "Freelancer"}</div>
                                                <div className="text-blue-600 font-bold">PKR {offer.offeredAmount}</div>
                                            <div className="text-gray-500 text-sm">Status: {offer.status}{offer.freelancerAcceptedAt ? ' (Freelancer accepted)' : ''}{offer.paymentStatus === 'held' ? ' (Paid/Held)' : ''}</div>
                                                {offer.negotiationHistory && offer.negotiationHistory.length > 0 && (
                                                    <div className="mt-2 text-sm text-gray-600">
                                                        <strong>Negotiation History:</strong>
                                                        <div className="space-y-1 mt-1">
                                                            {offer.negotiationHistory.map((h, idx) => (
                                                                <div key={idx} className="flex justify-between">
                                                                    <div>{h.updatedBy}: PKR {h.amount} {h.comment ? `- ${h.comment}` : ''}</div>
                                                                    <div className="text-xs text-gray-400">{(h.timestamp || h.createdAt) ? new Date(h.timestamp || h.createdAt).toLocaleString() : ''}</div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-col gap-2 ml-4" style={{minWidth: 220}}>
                                                <div className="flex gap-2">
                                            <button
                                                className={`bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 flex items-center gap-1 ${ (offer.paymentStatus === 'held' || offer.status === 'accepted' || offer.paymentStatus === 'paid' || offer.status === 'completed') ? 'opacity-50 cursor-not-allowed' : '' }`}
                                                onClick={() => handleAccept(offer)}
                                                disabled={offer.paymentStatus === 'held' || offer.status === 'accepted' || offer.paymentStatus === 'paid' || offer.status === 'completed'}
                                            ><FaCheck /> { (offer.paymentStatus === 'held' || offer.status === 'accepted' || offer.paymentStatus === 'paid' || offer.status === 'completed') ? 'Accepted' : 'Accept'}</button>
                                                </div>

                                                {negotiatingOfferId === offer._id ? (
                                                    <div className="flex gap-2">
                                                        <input type="number" value={negotiationInputs[offer._id] ?? offer.offeredAmount} onChange={(e) => handleNegotiationInputChange(offer._id, e.target.value)} className="border p-2 rounded flex-1" />
                                                        <button disabled={!(!["delivered","completed","rejected"].includes(offer.status) && !["held","captured","paid","released"].includes(offer.paymentStatus))} onClick={() => handleStudentCounter(offer._id)} className={`px-3 py-2 ${(!["delivered","completed","rejected"].includes(offer.status) && !["held","captured","paid","released"].includes(offer.paymentStatus)) ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600 cursor-not-allowed'} rounded`}>Send Counter</button>
                                                        <button onClick={() => setNegotiatingOfferId(null)} className="px-3 py-2 bg-gray-300 rounded">Cancel</button>
                                                    </div>
                                                ) : (
                                                    <button
                                                      disabled={!canNegotiate}
                                                      onClick={() => handleStartNegotiation(offer._id, offer.offeredAmount)}
                                                      className={`px-3 py-2 ${canNegotiate ? 'bg-orange-500 text-white hover:opacity-90' : 'bg-gray-300 text-gray-600 cursor-not-allowed'} rounded`}
                                                    >
                                                      {canNegotiate ? 'Negotiate' : 'Not Available'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                                })}
                            </div>
                        )}
                        {/* Payment handled on dedicated page */}
                    </div>
                )}
            </main>
        </div>
    );
};

export default StudentCreateGig;
