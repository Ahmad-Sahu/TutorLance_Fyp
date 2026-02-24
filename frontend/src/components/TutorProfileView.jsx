import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SiStudyverse } from "react-icons/si";
import { LuArrowRightToLine } from "react-icons/lu";
import { MdExpandMore } from "react-icons/md";
import { FaStar, FaMapMarkerAlt, FaClock, FaLanguage, FaGraduationCap, FaUser, FaCalendarAlt, FaBook, FaHeart } from "react-icons/fa";
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import Avatar from './Avatar';

function TutorProfileView() {
    const { tutorId } = useParams();
    const navigate = useNavigate();
    const [tutor, setTutor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [bookingData, setBookingData] = useState({
        subject: '',
        topicDescription: '',
        proposedPrice: '',
        proposedDate: '',
        proposedDay: '',
        proposedTime: '',
        message: ''
    });
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        fetchTutorProfile();
    }, [tutorId]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const student = localStorage.getItem('student');
        if (!token || !student || !tutorId) return;
        axios.get('http://localhost:3000/api/v1/students/saved-tutors', { headers: { Authorization: `Bearer ${token}` } })
            .then((res) => {
                const ids = (res.data.savedTutors || []).map((t) => t._id || t);
                setSaved(ids.includes(tutorId));
            })
            .catch(() => {});
    }, [tutorId]);

    const fetchTutorProfile = async () => {
        try {
            const response = await fetch(`http://localhost:3000/api/v1/tutors/${tutorId}`);
            const data = await response.json();
            if (response.ok) {
                setTutor(data.tutor);
            } else {
                toast.error('Failed to fetch tutor profile');
                navigate('/find-tutors');
            }
        } catch (error) {
            console.error('Error fetching tutor profile:', error);
            toast.error('Error fetching tutor profile');
        } finally {
            setLoading(false);
        }
    };

    const handleBookTutor = async () => {
        const studentId = localStorage.getItem('studentId');
        const token = localStorage.getItem('token');

        if (!studentId || !token) {
            toast.error('Please login as a student to book a tutor');
            navigate('/login');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/v1/students/booking', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    tutorId,
                    ...bookingData
                })
            });

            const data = await response.json();
            if (response.ok) {
                toast.success('Booking request sent successfully!');
                setShowBookingModal(false);
                setBookingData({
                    subject: '',
                    topicDescription: '',
                    proposedPrice: '',
                    proposedDate: '',
                    proposedDay: '',
                    proposedTime: '',
                    message: ''
                });
            } else {
                toast.error(data.message || 'Failed to send booking request');
            }
        } catch (error) {
            console.error('Error sending booking request:', error);
            toast.error('Error sending booking request');
        }
    };

    const handleInputChange = (field, value) => {
        setBookingData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!tutor) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Tutor not found</h2>
                    <Link to="/find-tutors" className="text-blue-600 hover:text-blue-800">
                        Back to Find Tutors
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation Bar */}
            <div className='bg-blue-950 text-white font-semibold text-2xl p-20 py-15 flex justify-between'>
                <div className='flex items-center'>
                    <div className='flex items-center'>
                        <h1 className='mr-2'><SiStudyverse /></h1>
                        <h1 className='mr-10'>TutorLance</h1>
                    </div>
                    <div>
                        <Link className='mr-10 text-yellow-300' to="/find-tutors">Find Tutor</Link>
                        <Link to="/signup">Become a Tutor</Link>
                    </div>
                </div>

                <div className='flex items-center justify-between'>
                    <a className='flex items-center mr-8 font-semibold' href="">English <span className='text-4xl ml-2 font-bold'><MdExpandMore /></span></a>
                    <Link to="/login">
                        <button className='flex bg-blue-600 text-white py-3 px-6 border-4 border-white rounded-full font-semibold hover:bg-blue-700 transition-colors'>
                            <span className='text-2xl mr-4 mt-1'><LuArrowRightToLine /></span>Login
                        </button>
                    </Link>
                </div>
            </div>

            {/* Tutor Profile Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Header Section */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8">
                        <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
                            <div className="flex-shrink-0">
                                <Avatar src={tutor.profilePicture} firstName={tutor.firstName} lastName={tutor.lastName} size="xl" className="w-32 h-32 border-4 border-white shadow-lg" />
                            </div>
                            <div className="text-center md:text-left">
                                <h1 className="text-3xl font-bold mb-2">
                                    {tutor.firstName} {tutor.lastName}
                                </h1>
                                <div className="flex items-center justify-center md:justify-start mb-4">
                                    <FaStar className="text-yellow-400 mr-1" />
                                    <span className="text-lg">
                                        {tutor.averageRating?.toFixed(1) || '0.0'} ({tutor.totalReviews || 0} reviews)
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-4 text-sm">
                                    <div className="flex items-center">
                                        <span className="mr-1 font-semibold">PKR</span>
                                        {tutor.hourlyRate}/hour
                                    </div>
                                    {tutor.countryOfBirth && (
                                        <div className="flex items-center">
                                            <FaMapMarkerAlt className="mr-1" />
                                            {tutor.countryOfBirth}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="md:ml-auto flex items-center gap-3">
                                {localStorage.getItem('token') && localStorage.getItem('student') && (
                                    <button
                                        onClick={async () => {
                                            const token = localStorage.getItem('token');
                                            if (saved) {
                                                await axios.delete(`http://localhost:3000/api/v1/students/saved-tutors/${tutorId}`, { headers: { Authorization: `Bearer ${token}` } });
                                                setSaved(false);
                                                toast.success('Removed from saved');
                                            } else {
                                                await axios.post('http://localhost:3000/api/v1/students/saved-tutors', { tutorId }, { headers: { Authorization: `Bearer ${token}` } });
                                                setSaved(true);
                                                toast.success('Tutor saved');
                                            }
                                        }}
                                        className={`p-3 rounded-full transition ${saved ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'}`}
                                        title={saved ? 'Unsave tutor' : 'Save tutor'}
                                    >
                                        <FaHeart className={saved ? 'fill-current' : ''} />
                                    </button>
                                )}
                                <button
                                    onClick={() => setShowBookingModal(true)}
                                    className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                                >
                                    Book Now
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Main Content */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* About Section */}
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
                                    {tutor.bio ? (
                                        <p className="text-gray-700 leading-relaxed">{tutor.bio}</p>
                                    ) : (
                                        <p className="text-gray-500 italic">No bio available</p>
                                    )}
                                </div>

                                {/* Subjects */}
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                                        <FaBook className="mr-2" />
                                        Subjects
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {tutor.subjects?.map((subject, index) => (
                                            <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                                                {subject}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Qualifications */}
                                {tutor.qualifications && (
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                                            <FaGraduationCap className="mr-2" />
                                            Qualifications
                                        </h3>
                                        <p className="text-gray-700">{tutor.qualifications}</p>
                                    </div>
                                )}

                                {/* Specialities */}
                                {tutor.specialities && tutor.specialities.length > 0 && (
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-3">Specialities</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {tutor.specialities.map((speciality, index) => (
                                                <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                                                    {speciality}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Sidebar */}
                            <div className="space-y-6">
                                {/* Languages */}
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                                        <FaLanguage className="mr-2" />
                                        Languages
                                    </h3>
                                    <div className="space-y-2">
                                        {tutor.languages?.map((language, index) => (
                                            <div key={index} className="flex items-center text-gray-700">
                                                <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                                                {language}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Availability */}
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                                        <FaClock className="mr-2" />
                                        Availability
                                    </h3>
                                    <div className="space-y-2">
                                        {tutor.availability?.map((day, index) => (
                                            <div key={index} className="flex items-center text-gray-700">
                                                <span className="w-2 h-2 bg-green-600 rounded-full mr-3"></span>
                                                {day}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Reviews */}
                                {tutor.ratings && tutor.ratings.length > 0 && (
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-3">Reviews</h3>
                                        <div className="space-y-3 max-h-48 overflow-y-auto">
                                            {tutor.ratings.slice().reverse().slice(0, 5).map((r, idx) => (
                                                <div key={idx} className="p-2 bg-gray-50 rounded">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-medium text-sm">{r.studentName || 'Student'}</span>
                                                        <span className="text-yellow-500 text-sm">{Array(5).fill(0).map((_, k) => (k < (r.rating || 0) ? '★' : '☆')).join('')}</span>
                                                    </div>
                                                    {r.review && <p className="text-sm text-gray-600">{r.review}</p>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* YouTube Link */}
                                {tutor.youtubeLink && (
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-3">Demo Video</h3>
                                        <a
                                            href={tutor.youtubeLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-800 underline"
                                        >
                                            Watch Demo Video
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Booking Modal */}
            {showBookingModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h3 className="text-xl font-bold mb-4">Book Tutor Session</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                <select
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    value={bookingData.subject}
                                    onChange={(e) => handleInputChange('subject', e.target.value)}
                                >
                                    <option value="">Select Subject</option>
                                    {tutor.subjects?.map(subject => (
                                        <option key={subject} value={subject}>{subject}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Topic Description</label>
                                <textarea
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    rows="3"
                                    placeholder="Describe what you want to learn..."
                                    value={bookingData.topicDescription}
                                    onChange={(e) => handleInputChange('topicDescription', e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Proposed Price (PKR)</label>
                                <input
                                    type="number"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="Your offer"
                                    value={bookingData.proposedPrice}
                                    onChange={(e) => handleInputChange('proposedPrice', e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Date</label>
                                    <input
                                        type="date"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        value={bookingData.proposedDate}
                                        onChange={(e) => handleInputChange('proposedDate', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Time</label>
                                    <input
                                        type="time"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        value={bookingData.proposedTime}
                                        onChange={(e) => handleInputChange('proposedTime', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Day of Week</label>
                                <select
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    value={bookingData.proposedDay}
                                    onChange={(e) => handleInputChange('proposedDay', e.target.value)}
                                >
                                    <option value="">Select Day</option>
                                    <option value="Monday">Monday</option>
                                    <option value="Tuesday">Tuesday</option>
                                    <option value="Wednesday">Wednesday</option>
                                    <option value="Thursday">Thursday</option>
                                    <option value="Friday">Friday</option>
                                    <option value="Saturday">Saturday</option>
                                    <option value="Sunday">Sunday</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Message (Optional)</label>
                                <textarea
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    rows="2"
                                    placeholder="Any additional requirements..."
                                    value={bookingData.message}
                                    onChange={(e) => handleInputChange('message', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex space-x-3 mt-6">
                            <button
                                onClick={() => setShowBookingModal(false)}
                                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleBookTutor}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                            >
                                Send Request
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TutorProfileView;