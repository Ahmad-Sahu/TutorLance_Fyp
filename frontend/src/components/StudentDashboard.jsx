import { API_BASE } from '../config.js';
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FindTutors from "./FindTutors";
import StudentAllOffers from "./StudentAllOffers";
import StudentBookingOffers from "./StudentBookingOffers";
import Avatar from "./Avatar";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from 'react-hot-toast'
import { SiStudyverse } from "react-icons/si";
import { FaPhoneAlt, FaWhatsapp, FaBell } from "react-icons/fa";

const StudentProfileSection = ({ student }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        firstName: student?.firstName || '',
        lastName: student?.lastName || '',
        dateOfBirth: student?.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split('T')[0] : '',
        profilePicture: null
    });
    const [profilePicturePreview, setProfilePicturePreview] = useState(student?.profilePicture || '');
    const [loading, setLoading] = useState(false);

    // Strict text validation: only English letters and single spaces, no leading/trailing/multiple spaces, max 15 chars
    const isValidName = (val) => {
        if (!val) return false;
        const trimmed = val.trim();
        if (!trimmed) return false;
        if (/  +/.test(trimmed)) return false;
        if (!/^[A-Za-z]+( [A-Za-z]+)*$/.test(trimmed)) return false;
        if (trimmed.length > 15) return false;
        return true;
    };
    const handleInputChange = (field, value) => {
        if (field === 'firstName' || field === 'lastName') {
            // Only allow letters and single spaces
            value = value.replace(/[^A-Za-z ]/g, "");
            value = value.replace(/  +/g, " ");
            value = value.replace(/^ +/, "");
        }
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                profilePicture: file
            }));
            
            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setProfilePicturePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCloudinaryUpload = async (file) => {
        const { uploadToCloudinary } = await import('../utils/cloudinary.js');
        try {
            const url = await uploadToCloudinary(file);
            return url || student?.profilePicture;
        } catch (error) {
            console.error('Error uploading to Cloudinary:', error);
            toast.error('Image upload failed. Save without new photo or try again.');
            return student?.profilePicture;
        }
    };

    const handleSave = async () => {
        // Validate names
        if (!isValidName(formData.firstName)) return toast.error(formData.firstName.trim().length > 15 ? 'First name cannot exceed 15 characters.' : 'First name must contain only letters, no symbols.');
        if (!isValidName(formData.lastName)) return toast.error(formData.lastName.trim().length > 15 ? 'Last name cannot exceed 15 characters.' : 'Last name must contain only letters, no symbols.');
        setLoading(true);
        try {
            let profilePictureUrl = student?.profilePicture;
            // Upload new profile picture if selected (Cloudinary)
            if (formData.profilePicture) {
                profilePictureUrl = await handleCloudinaryUpload(formData.profilePicture);
            }
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/api/v1/students/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    dateOfBirth: formData.dateOfBirth,
                    profilePicture: profilePictureUrl
                })
            });
            const data = await response.json();
            if (response.ok) {
                toast.success('Profile updated successfully!');
                setIsEditing(false);
                // Update local storage
                const updatedStudent = { ...student, ...data.student };
                localStorage.setItem('student', JSON.stringify(updatedStudent));
                // Do not reload, stay on same page
            } else {
                toast.error(data.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Error updating profile');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            firstName: student?.firstName || '',
            lastName: student?.lastName || '',
            dateOfBirth: student?.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split('T')[0] : '',
            profilePicture: null
        });
        setProfilePicturePreview(student?.profilePicture || '');
        setIsEditing(false);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
                    {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            Edit Profile
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Profile Picture */}
                    <div className="md:col-span-2 flex flex-col items-center">
                        <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mb-4 overflow-hidden">
                            {profilePicturePreview ? (
                                <img 
                                    src={profilePicturePreview} 
                                    alt="Profile" 
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-4xl font-bold text-gray-600">
                                    {student?.firstName?.[0]}{student?.lastName?.[0]}
                                </span>
                            )}
                        </div>
                        {isEditing && (
                            <div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="profile-picture"
                                />
                                <label
                                    htmlFor="profile-picture"
                                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors"
                                >
                                    Change Picture
                                </label>
                            </div>
                        )}
                    </div>

                    {/* First Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            First Name
                        </label>
                        {isEditing ? (
                            <>
                                <input
                                    type="text"
                                    value={formData.firstName}
                                    maxLength={15}
                                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                {formData.firstName.length >= 15 && <p className="text-red-500 text-xs mt-1">First name cannot exceed 15 characters.</p>}
                            </>
                        ) : (
                            <p className="text-gray-900 p-3 bg-gray-50 rounded-lg">{student?.firstName}</p>
                        )}
                    </div>

                    {/* Last Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Last Name
                        </label>
                        {isEditing ? (
                            <>
                                <input
                                    type="text"
                                    value={formData.lastName}
                                    maxLength={15}
                                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                {formData.lastName.length >= 15 && <p className="text-red-500 text-xs mt-1">Last name cannot exceed 15 characters.</p>}
                            </>
                        ) : (
                            <p className="text-gray-900 p-3 bg-gray-50 rounded-lg">{student?.lastName}</p>
                        )}
                    </div>

                    {/* Email (Read-only) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                        </label>
                        <p className="text-gray-900 p-3 bg-gray-50 rounded-lg">{student?.email}</p>
                    </div>

                    {/* Date of Birth */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Date of Birth
                        </label>
                        {isEditing ? (
                            <input
                                type="date"
                                value={formData.dateOfBirth}
                                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        ) : (
                            <p className="text-gray-900 p-3 bg-gray-50 rounded-lg">
                                {student?.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'Not set'}
                            </p>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                {isEditing && (
                    <div className="flex justify-end space-x-3 mt-6">
                        <button
                            onClick={handleCancel}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const StudentDashboard = () => {
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [tutors, setTutors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeSection, setActiveSection] = useState('find-tutors');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [filters, setFilters] = useState({
        subject: '',
        priceMin: '',
        priceMax: '',
        countryOfBirth: '',
        specialities: '',
        languages: '',
        availability: '',
        search: ''
    });
    const [isFavorite, setIsFavorite] = useState(false);
    const [selectedDelivery, setSelectedDelivery] = useState(null);
    const [selectedTutor, setSelectedTutor] = useState(null);
    const [bookingModal, setBookingModal] = useState(false);
    const [proposedPrice, setProposedPrice] = useState('');
    const [bookingMessage, setBookingMessage] = useState('');
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [savedTutors, setSavedTutors] = useState([]);
    const [studentBookings, setStudentBookings] = useState([]);
    const [ratingModal, setRatingModal] = useState(null);
    const [complaintText, setComplaintText] = useState("");
    const [myComplaints, setMyComplaints] = useState([]);

    // ====================== CHECK LOGIN ======================
    useEffect(() => {
        const studentData = localStorage.getItem("student");
        console.log("localStorage student:", studentData); // Debug

        if (!studentData || studentData === "undefined") {
            alert("Student information missing. Please login again.");
            navigate("/login");
            return;
        }

        try {
            const parsedStudent = JSON.parse(studentData);

            if (!parsedStudent || parsedStudent.role !== "student") {
                alert("Student information missing. Please login again.");
                navigate("/login");
                return;
            }

            setStudent(parsedStudent);
        } catch (error) {
            console.error("Error parsing student data:", error);
            alert("Student information missing. Please login again.");
            navigate("/login");
        }
    }, [navigate]);

    // ====================== FETCH TUTORS ======================
    useEffect(() => {
        const fetchTutors = async () => {
            try {
                const query = new URLSearchParams(filters).toString();
                const response = await fetch(`${API_BASE}/api/v1/tutors?${query}`);
                const data = await response.json();
                if (response.ok) {
                    setTutors(data.tutors);
                } else {
                    toast.error(data.message || 'Failed to fetch tutors');
                }
            } catch (error) {
                console.error('Error fetching tutors:', error);
                toast.error('Error fetching tutors');
            } finally {
                setLoading(false);
            }
        };

        fetchTutors();
    }, [filters]);

    // ====================== FETCH NOTIFICATIONS ======================
    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token || !student?._id) {
                console.log('No token or studentId found, skipping notifications fetch');
                return;
            }

            const response = await fetch(`${API_BASE}/api/v1/students/notifications?studentId=${student._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setNotifications(data.notifications);
            } else {
                console.log('Failed to fetch notifications:', data);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    useEffect(() => {
        if (student) {
            fetchNotifications();
        }
    }, [student]);

    const fetchSavedTutors = async () => {
        const token = localStorage.getItem('token');
        if (!token || !student) return;
        try {
            const res = await axios.get(`${API_BASE}/api/v1/students/saved-tutors`, { headers: { Authorization: `Bearer ${token}` } });
            setSavedTutors(res.data.savedTutors || []);
        } catch (e) {
            setSavedTutors([]);
        }
    };

    useEffect(() => {
        if (activeSection === 'saved' && student) fetchSavedTutors();
    }, [activeSection, student]);

    useEffect(() => {
        if (activeSection === 'complaints' && student) {
            const token = localStorage.getItem('token');
            if (token) axios.get(`${API_BASE}/api/v1/complaints/my`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => setMyComplaints(r.data.complaints || [])).catch(() => {});
        }
    }, [activeSection, student]);

    const handleSendComplaint = async () => {
        if (!complaintText.trim()) return;
        try {
            await axios.post(`${API_BASE}/api/v1/complaints`, { message: complaintText }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
            toast.success('Complaint sent');
            setComplaintText('');
            const r = await axios.get(`${API_BASE}/api/v1/complaints/my`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
            setMyComplaints(r.data.complaints || []);
        } catch (e) {
            toast.error('Failed to send');
        }
    };

    const fetchStudentBookings = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            // Try to load from cache if not logged in
            const cached = localStorage.getItem('studentBookings');
            if (cached) setStudentBookings(JSON.parse(cached));
            return;
        }
        try {
            await axios.post(`${API_BASE}/api/v1/payments/process-expired`).catch(() => {});
            const res = await axios.get(`${API_BASE}/api/v1/students/bookings`, { headers: { Authorization: `Bearer ${token}` } });
            setStudentBookings(res.data.bookings || []);
            localStorage.setItem('studentBookings', JSON.stringify(res.data.bookings || []));
        } catch (e) {
            // On error, load from cache if available
            const cached = localStorage.getItem('studentBookings');
            if (cached) setStudentBookings(JSON.parse(cached));
            else setStudentBookings([]);
        }
    };

    useEffect(() => {
        if ((activeSection === 'my-bookings' || activeSection === 'my-classes') && student) fetchStudentBookings();
    }, [activeSection, student]);

    const submitRating = async (bookingId, rating, review) => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            await axios.post(`${API_BASE}/api/v1/students/rate/${bookingId}`, { rating, review }, { headers: { Authorization: `Bearer ${token}` } });
            toast.success('Thank you for your review!');
            setRatingModal(null);
            fetchStudentBookings();
        } catch (e) {
            toast.error(e.response?.data?.message || 'Failed to submit rating');
        }
    };

    if (!student) return null; // Don't render until student is loaded

    return (
        <>
            <div className="bg-gray-200 min-h-screen">
                {/* ====================== HEADER ====================== */}
                <div className="bg-blue-950 text-white font-semibold text-base md:text-2xl px-4 md:p-10 py-4 flex justify-between items-center">
                    <div className="flex items-center">
                        <button
                            className="md:hidden mr-3 text-2xl focus:outline-none"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            aria-label="Toggle sidebar"
                        >
                            {sidebarOpen ? '✕' : '☰'}
                        </button>
                        <SiStudyverse className="mr-2 text-2xl md:text-3xl" />
                        <h1 className="mr-4 md:mr-10 text-lg md:text-2xl">TutorLance</h1>
                    </div>
                    <div className="flex items-center space-x-2 md:space-x-4">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="relative bg-blue-800 px-2 md:px-4 py-2 rounded hover:bg-blue-900"
                            aria-label="Notifications"
                        >
                            <FaBell className="text-lg md:text-xl" />
                            {notifications.length > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                    {notifications.length}
                                </span>
                            )}
                        </button>
                        <span className="hidden sm:inline text-sm md:text-base">Welcome, {student.firstName}!</span>
                        <button
                            onClick={() => {
                                localStorage.removeItem('token');
                                localStorage.removeItem('student');
                                navigate('/login');
                            }}
                            className="bg-red-600 px-2 md:px-4 py-2 rounded hover:bg-red-700 text-sm md:text-base"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {/* Main Layout with Sidebar */}
                <div className="flex min-h-screen relative">
                    {/* Mobile Overlay */}
                    {sidebarOpen && (
                        <div
                            className="md:hidden fixed inset-0 bg-black bg-opacity-40 z-20"
                            onClick={() => setSidebarOpen(false)}
                        />
                    )}
                    {/* Sidebar */}
                    <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:relative z-30 md:z-auto w-64 bg-white shadow-lg min-h-screen transition-transform duration-300`}>
                        <div className="p-6">
                            <h2 className="text-lg font-semibold mb-4">Student Dashboard</h2>
                            <nav className="space-y-2">
                                <button
                                    onClick={() => { setActiveSection('find-tutors'); setSidebarOpen(false); }}
                                    className={`w-full text-left px-4 py-3 rounded-lg transition ${
                                        activeSection === 'find-tutors'
                                            ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-700'
                                            : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    🔍 Find Tutors
                                </button>
                                <button
                                    onClick={() => { setActiveSection('my-bookings'); setSidebarOpen(false); }}
                                    className={`w-full text-left px-4 py-3 rounded-lg transition ${
                                        activeSection === 'my-bookings'
                                            ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-700'
                                            : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    📅 My Bookings
                                </button>
                                <button
                                    onClick={() => { setActiveSection('my-classes'); setSidebarOpen(false); }}
                                    className={`w-full text-left px-4 py-3 rounded-lg transition ${
                                        activeSection === 'my-classes'
                                            ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-700'
                                            : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    📺 My Classes
                                </button>
                                <button
                                    onClick={() => { setActiveSection('negotiation'); setSidebarOpen(false); }}
                                    className={`w-full text-left px-4 py-3 rounded-lg transition ${
                                        activeSection === 'negotiation'
                                            ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-700'
                                            : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    🤝 Negotiation / Counter Offers
                                </button>
                                <button
                                    onClick={() => { setActiveSection('saved'); setSidebarOpen(false); }}
                                    className={`w-full text-left px-4 py-3 rounded-lg transition ${
                                        activeSection === 'saved'
                                            ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-700'
                                            : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    ❤️ Saved Tutors
                                </button>
                                <button
                                    onClick={() => { setActiveSection('my-gigs'); setSidebarOpen(false); }}
                                    className={`w-full text-left px-4 py-3 rounded-lg transition ${
                                        activeSection === 'my-gigs'
                                            ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-700'
                                            : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    💼 My Gigs
                                </button>
                                <button
                                    onClick={() => { setActiveSection('profile'); setSidebarOpen(false); }}
                                    className={`w-full text-left px-4 py-3 rounded-lg transition ${
                                        activeSection === 'profile'
                                            ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-700'
                                            : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    👤 Profile
                                </button>
                                <button
                                    onClick={() => { setActiveSection('complaints'); setSidebarOpen(false); }}
                                    className={`w-full text-left px-4 py-3 rounded-lg transition ${
                                        activeSection === 'complaints'
                                            ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-700'
                                            : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    📩 Complaints
                                </button>
                            </nav>
                        </div>
                    </div>

                {/* Notifications Dropdown */}
                {showNotifications && (
                    <div className="fixed top-16 right-2 md:right-10 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-72 md:w-80 max-h-96 overflow-y-auto">
                        <div className="p-4 border-b">
                            <h3 className="font-semibold">Notifications</h3>
                        </div>
                        {notifications.length === 0 ? (
                            <div className="p-4 text-gray-500">No notifications</div>
                        ) : (
                            notifications.map((notification, index) => (
                                <div key={index} className="p-4 border-b hover:bg-gray-50">
                                    <p className="text-sm">{notification.message}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {new Date(notification.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                )}

                    {/* Main Content */}
                    <div className="flex-1 p-4 md:p-6 min-w-0 w-full">
                        {/* Find Tutors Section */}
                        {activeSection === 'find-tutors' && (
                            <div className="py-8">
                                <FindTutors />
                            </div>
                        )}

                        {/* My Classes Section (bookings with session link from tutor) */}
                        {activeSection === 'my-classes' && (
                            <div className="py-8">
                                <h2 className="text-2xl font-bold mb-4">My Classes</h2>
                                <p className="text-gray-600 mb-4">Classes or lessons where your tutor has sent a meeting link. Join from here when it’s time.</p>
                                {studentBookings.filter((b) => b.sessionLink && b.status === 'completed' && b.studentMarkedDone && b.tutorMarkedDone && b.paymentStatus === 'released').length === 0 ? (
                                    <p className="text-gray-500">No delivered classes yet. When both you and your tutor mark a class as done, and payment is released, it will appear here.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {studentBookings.filter((b) => b.sessionLink && b.status === 'completed' && b.studentMarkedDone && b.tutorMarkedDone && b.paymentStatus === 'released').map((b) => (
                                            <div key={b._id} className="bg-white rounded-lg shadow p-4 flex flex-wrap items-center justify-between gap-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar src={b.tutorId?.profilePicture} firstName={b.tutorId?.firstName} lastName={b.tutorId?.lastName} size="lg" />
                                                    <div>
                                                        <p className="font-semibold">{b.tutorId?.firstName} {b.tutorId?.lastName}</p>
                                                        <p className="text-sm text-gray-600">{b.subject} — PKR {b.proposedPrice}</p>
                                                        <p className="text-xs text-gray-500">{b.proposedDate ? new Date(b.proposedDate).toLocaleDateString() : (b.proposedDay || '') + ' ' + (b.proposedTime || '')}</p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-2 items-end">
                                                    {b.paymentStatus && b.paymentStatus !== 'pending' ? (
                                                        b.sessionLinkDeadline && new Date() > new Date(b.sessionLinkDeadline) ? (
                                                            <span className="bg-gray-400 text-white font-semibold px-5 py-2 rounded-lg inline-flex items-center gap-2 cursor-not-allowed">
                                                                Class Done / Link Expired
                                                            </span>
                                                        ) : (
                                                            <a href={b.sessionLink} target="_blank" rel="noopener noreferrer" className="bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2 rounded-lg inline-flex items-center gap-2">
                                                                Join class →
                                                            </a>
                                                        )
                                                    ) : (
                                                        <span className="text-red-600 font-semibold">You must pay for this class to join</span>
                                                    )}
                                                    {/* Mark as Done button only if not already released or marked done */}
                                                    {(!b.studentMarkedDone || !b.tutorMarkedDone || b.paymentStatus !== 'released') && (
                                                        <span className="text-yellow-600 font-semibold">Waiting for both to mark done & payment release</span>
                                                    )}
                                                    {b.studentMarkedDone && b.tutorMarkedDone && b.paymentStatus === 'released' && (
                                                        <span className="text-green-600 font-semibold">Payment Released</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Saved Tutors Section */}
                        {activeSection === 'saved' && (
                            <div className="py-8">
                                <h2 className="text-2xl font-bold mb-4">Saved Tutors</h2>
                                {savedTutors.length === 0 ? (
                                    <p className="text-gray-500">No saved tutors. Save tutors from their profile (heart icon).</p>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {savedTutors.map((t) => (
                                            <div key={t._id} className="bg-white rounded-lg shadow p-4 flex items-center gap-4">
                                                <Avatar src={t.profilePicture} firstName={t.firstName} lastName={t.lastName} size="lg" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold truncate">{t.firstName} {t.lastName}</p>
                                                    <p className="text-sm text-gray-600">PKR {t.hourlyRate}/hr</p>
                                                </div>
                                                <Link to={`/tutor/${t._id}`} className="bg-blue-600 text-white px-3 py-2 rounded text-sm">View</Link>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Negotiation / Counter Offers Section */}
                        {activeSection === 'negotiation' && (
                            <div className="py-8">
                                <h2 className="text-2xl font-bold mb-4 text-center">Negotiation / Counter Offers</h2>
                                <div className="max-w-3xl mx-auto space-y-8">
                                    <StudentBookingOffers studentId={student?._id} />
                                    <div className="border-t pt-8">
                                        <h3 className="text-lg font-semibold mb-4">Gig Counter Offers</h3>
                                        <StudentAllOffers studentId={student?._id} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* My Bookings Section */}
                        {activeSection === 'my-bookings' && (
                            <div className="py-8">
                                <h2 className="text-2xl font-bold mb-4">My Bookings</h2>
                                {studentBookings.length === 0 ? (
                                    <p className="text-gray-500">No bookings yet.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {studentBookings.map((b) => (
                                            <div key={b._id} className="bg-white rounded-lg shadow p-4 flex justify-between items-center flex-wrap gap-2">
                                                <div className="flex items-center gap-3">
                                                    <Avatar src={b.tutorId?.profilePicture} firstName={b.tutorId?.firstName} lastName={b.tutorId?.lastName} size="md" />
                                                    <div>
                                                        <p className="font-semibold">{b.tutorId?.firstName} {b.tutorId?.lastName}</p>
                                                        <p className="text-sm text-gray-600">{b.subject} — PKR {b.proposedPrice}</p>
                                                        <p className="text-xs text-gray-500">{b.status} {b.sessionLink && (
                                                            b.sessionLinkDeadline && new Date() > new Date(b.sessionLinkDeadline) ? (
                                                                <span className="text-gray-400 ml-2 cursor-not-allowed">Class Done / Link Expired</span>
                                                            ) : (
                                                                <a href={b.sessionLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 ml-2">Join class</a>
                                                            )
                                                        )}</p>
                                                    </div>
                                                </div>
                                                {/* Payment, Accept, Reject options for accepted/confirmed bookings that are not paid, not completed, not marked done */}
                                                {(b.status === 'accepted' || b.status === 'confirmed') &&
                                                  b.paymentStatus !== 'held' &&
                                                  b.paymentStatus !== 'captured' &&
                                                  b.paymentStatus !== 'released' &&
                                                  b.status !== 'completed' &&
                                                  !b.studentMarkedDone &&
                                                  !b.tutorMarkedDone && (
                                                    <div className="flex gap-2">
                                                        <button
                                                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
                                                            onClick={() => navigate(`/booking-payment/${b._id}`)}
                                                        >
                                                            Pay
                                                        </button>
                                                        <button
                                                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
                                                            onClick={async () => {
                                                                try {
                                                                    await axios.put(`${API_BASE}/api/v1/students/booking/${b._id}/accept`, {}, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
                                                                    toast.success('Booking accepted — complete payment now');
                                                                    // Refresh bookings
                                                                    const res = await axios.get(`${API_BASE}/api/v1/students/bookings`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
                                                                    setStudentBookings(res.data.bookings || []);
                                                                    localStorage.setItem('studentBookings', JSON.stringify(res.data.bookings || []));
                                                                } catch (err) {
                                                                    toast.error(err.response?.data?.message || 'Failed to accept');
                                                                }
                                                            }}
                                                        >
                                                            Accept
                                                        </button>
                                                        <button
                                                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
                                                            onClick={async () => {
                                                                if (!window.confirm('Reject this booking?')) return;
                                                                try {
                                                                    await axios.put(`${API_BASE}/api/v1/students/booking/${b._id}/reject`, {}, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
                                                                    toast.success('Booking rejected');
                                                                    // Refresh bookings
                                                                    const res = await axios.get(`${API_BASE}/api/v1/students/bookings`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
                                                                    setStudentBookings(res.data.bookings || []);
                                                                    localStorage.setItem('studentBookings', JSON.stringify(res.data.bookings || []));
                                                                } catch (err) {
                                                                    toast.error(err.response?.data?.message || 'Failed to reject');
                                                                }
                                                            }}
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                )}

                                                {/* Mark as Done for all paid bookings, not already marked done or completed */}
                                                {(b.paymentStatus === 'held' || b.paymentStatus === 'captured' || b.paymentStatus === 'released') &&
                                                  !b.studentMarkedDone &&
                                                  b.status !== 'completed' && (
                                                    <button
                                                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded text-sm"
                                                        onClick={async () => {
                                                            try {
                                                                await axios.put(`${API_BASE}/api/v1/students/session/${b._id}/done`, {}, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
                                                                toast.success('Marked as done! Payment will release if tutor also marks done.');
                                                                // Refresh bookings
                                                                const res = await axios.get(`${API_BASE}/api/v1/students/bookings`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
                                                                setStudentBookings(res.data.bookings || []);
                                                                localStorage.setItem('studentBookings', JSON.stringify(res.data.bookings || []));
                                                            } catch (err) {
                                                                toast.error(err.response?.data?.message || 'Failed to mark as done');
                                                            }
                                                        }}
                                                    >
                                                        Mark as Done
                                                    </button>
                                                )}
                                                {b.status === 'completed' && (
                                                    b.rating ? (
                                                        <span className="text-sm text-gray-500">Rated {b.rating}★</span>
                                                    ) : (
                                                        <button onClick={() => setRatingModal(b)} className="bg-amber-500 text-white px-4 py-2 rounded text-sm">Rate & Review</button>
                                                    )
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {ratingModal && (
                                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                                        <div className="bg-white rounded-xl p-6 max-w-md w-full">
                                            <h3 className="text-lg font-bold mb-2">Rate this class</h3>
                                            <p className="text-sm text-gray-600 mb-4">{ratingModal.tutorId?.firstName} {ratingModal.tutorId?.lastName} — {ratingModal.subject}</p>
                                            <div className="flex gap-2 mb-4">
                                                {[1,2,3,4,5].map((star) => (
                                                    <button key={star} type="button" onClick={() => setRatingModal((m) => ({ ...m, _rating: star }))} className="text-2xl text-gray-300 hover:text-yellow-500">{(ratingModal._rating || 0) >= star ? '★' : '☆'}</button>
                                                ))}
                                            </div>
                                            <textarea placeholder="Write a review (optional)" value={ratingModal._review || ''} onChange={(e) => setRatingModal((m) => ({ ...m, _review: e.target.value }))} className="w-full border rounded p-2 mb-4" rows={3} />
                                            <div className="flex gap-2">
                                                <button onClick={() => submitRating(ratingModal._id, ratingModal._rating || 5, ratingModal._review)} className="bg-blue-600 text-white px-4 py-2 rounded">Submit</button>
                                                <button onClick={() => setRatingModal(null)} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* My Gigs Section */}
                        {activeSection === 'my-gigs' && (
                            <div className="text-center py-8">
                                <h2 className="text-2xl font-bold mb-4">My Gigs</h2>
                                <p>Manage your posted gigs here.</p>
                                <button
                                    onClick={() => navigate('/student_gigs')}
                                    className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                                >
                                    Create New Gig
                                </button>
                            </div>
                        )}

                        {/* Profile Section */}
                        {activeSection === 'profile' && (
                            <StudentProfileSection student={student} />
                        )}

                        {/* Complaints Section */}
                        {activeSection === 'complaints' && (
                            <div className="py-8">
                                <h2 className="text-2xl font-bold mb-4">Complaints</h2>
                                <p className="text-gray-600 mb-4">Send a complaint to admin (e.g. tutor not sending link, payment not released).</p>
                                <div className="flex flex-wrap gap-2 mb-4">
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
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </>
    );
};

export default StudentDashboard;
