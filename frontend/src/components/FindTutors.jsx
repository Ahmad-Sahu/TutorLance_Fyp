import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SiStudyverse } from "react-icons/si";
import { LuArrowRightToLine } from "react-icons/lu";
import { MdExpandMore } from "react-icons/md";
import { FaSearch, FaFilter, FaStar, FaMapMarkerAlt, FaClock, FaLanguage, FaGraduationCap } from "react-icons/fa";
import { toast } from 'react-hot-toast';
import axios from 'axios';
import Avatar from './Avatar';

function FindTutors() {
    const navigate = useNavigate();
    const [tutors, setTutors] = useState([]);
    const [loading, setLoading] = useState(false);
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
    const [showFilters, setShowFilters] = useState(false);

    // Available filter options
    const subjects = [
        'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Computer Science',
        'History', 'Geography', 'Economics', 'Psychology', 'Art', 'Music', 'Programming'
    ];

    const countries = [
        'Pakistan', 'India', 'Bangladesh', 'United States', 'United Kingdom', 'Canada',
        'Australia', 'Germany', 'France', 'Italy', 'Spain', 'Netherlands'
    ];

    const languages = [
        'English', 'Urdu', 'Hindi', 'Arabic', 'French', 'German', 'Spanish', 'Italian'
    ];

    const specialities = [
        'IB Curriculum', 'A-Levels', 'O-Levels', 'SAT Preparation', 'GRE Preparation',
        'IELTS Preparation', 'TOEFL Preparation', 'Programming', 'Web Development'
    ];

    const availabilityOptions = [
        'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
    ];

    const fetchTutors = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams();

            Object.entries(filters).forEach(([key, value]) => {
                if (value && value.trim() !== '') {
                    queryParams.append(key, value);
                }
            });

            // normalize subject query to lowercase so it matches tutors registered with varying case
            if (queryParams.has('subject')) {
                queryParams.set('subject', queryParams.get('subject'));
            }
            const response = await axios.get(`http://localhost:3000/api/v1/tutors?${queryParams}`);
            setTutors(response.data.tutors || []);
        } catch (error) {
            console.error('Error fetching tutors:', error);
            toast.error('Failed to fetch tutors');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTutors();
    }, [filters]);

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const clearFilters = () => {
        setFilters({
            subject: '',
            priceMin: '',
            priceMax: '',
            countryOfBirth: '',
            specialities: '',
            languages: '',
            availability: '',
            search: ''
        });
    };

    const handleBookTutor = (tutorId) => {
        // Check if user is logged in
        const studentId = localStorage.getItem('studentId');
        if (!studentId) {
            toast.error('Please login as a student to book a tutor');
            return;
        }
        // Open tutor profile (booking modal available there)
        navigate(`/tutor/${tutorId}`);
    };

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
                        <button type="button" className='flex bg-blue-600 text-white py-3 px-6 border-4 border-white rounded-full font-semibold hover:bg-blue-700 transition-colors cursor-pointer'>
                            <span className='text-2xl mr-4 mt-1'><LuArrowRightToLine /></span>Login
                        </button>
                    </Link>
                </div>
            </div>

            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-6xl font-bold mb-4">
                            Find Your Perfect Tutor
                        </h1>
                        <p className="text-xl md:text-2xl mb-8 text-blue-100">
                            Connect with experienced tutors worldwide
                        </p>

                        {/* Search Bar */}
                        <div className="max-w-2xl mx-auto mb-8">
                            <div className="flex">
                                <div className="flex-1 relative">
                                    <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by name, subject, or specialty..."
                                        className="w-full pl-12 pr-4 py-4 rounded-l-lg text-gray-900 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={filters.search}
                                        onChange={(e) => handleFilterChange('search', e.target.value)}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="bg-blue-600 hover:bg-blue-700 px-6 py-4 rounded-r-lg transition-colors flex items-center cursor-pointer"
                                >
                                    <FaFilter className="mr-2" />
                                    Filters
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters Section */}
            {showFilters && (
                <div className="bg-white border-b shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Subject Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <FaGraduationCap className="inline mr-2" />
                                    Subject
                                </label>
                                <select
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={filters.subject}
                                    onChange={(e) => handleFilterChange('subject', e.target.value)}
                                >
                                    <option value="">All Subjects</option>
                                    {subjects.map(subject => (
                                        <option key={subject} value={subject}>{subject}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Price Range */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Price Range (per hour)
                                </label>
                                <div className="flex space-x-2">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        className="w-1/2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        value={filters.priceMin}
                                        onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        className="w-1/2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        value={filters.priceMax}
                                        onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Country Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <FaMapMarkerAlt className="inline mr-2" />
                                    Country
                                </label>
                                <select
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={filters.countryOfBirth}
                                    onChange={(e) => handleFilterChange('countryOfBirth', e.target.value)}
                                >
                                    <option value="">All Countries</option>
                                    {countries.map(country => (
                                        <option key={country} value={country}>{country}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Language Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <FaLanguage className="inline mr-2" />
                                    Language
                                </label>
                                <select
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={filters.languages}
                                    onChange={(e) => handleFilterChange('languages', e.target.value)}
                                >
                                    <option value="">All Languages</option>
                                    {languages.map(language => (
                                        <option key={language} value={language}>{language}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Specialities Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Specialities
                                </label>
                                <select
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={filters.specialities}
                                    onChange={(e) => handleFilterChange('specialities', e.target.value)}
                                >
                                    <option value="">All Specialities</option>
                                    {specialities.map(speciality => (
                                        <option key={speciality} value={speciality}>{speciality}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Availability Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <FaClock className="inline mr-2" />
                                    Availability
                                </label>
                                <select
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={filters.availability}
                                    onChange={(e) => handleFilterChange('availability', e.target.value)}
                                >
                                    <option value="">Any Day</option>
                                    {availabilityOptions.map(day => (
                                        <option key={day} value={day}>{day}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Clear Filters Button */}
                            <div className="flex items-end">
                                <button
                                    onClick={clearFilters}
                                    className="w-full bg-gray-500 hover:bg-gray-600 text-white py-3 px-4 rounded-lg transition-colors"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tutors Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Finding tutors...</p>
                    </div>
                ) : (
                    <>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {tutors.length} Tutor{tutors.length !== 1 ? 's' : ''} Found
                            </h2>
                        </div>

                        {tutors.length === 0 ? (
                            <div className="text-center py-12">
                                <FaSearch className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No tutors found</h3>
                                <p className="mt-1 text-sm text-gray-500">Try adjusting your filters or search terms.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {tutors.map((tutor) => (
                                    <div key={tutor._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                                        <div className="p-6">
                                            {/* Tutor Header */}
                                            <div className="flex items-center mb-4">
                                                <Avatar src={tutor.profilePicture} firstName={tutor.firstName} lastName={tutor.lastName} size="lg" />
                                                <div className="ml-4">
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        {tutor.firstName} {tutor.lastName}
                                                    </h3>
                                                    <div className="flex items-center">
                                                        <FaStar className="text-yellow-400 mr-1" />
                                                        <span className="text-sm text-gray-600">
                                                            {tutor.averageRating?.toFixed(1) || '0.0'} ({tutor.totalReviews || 0} reviews)
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Subjects */}
                                            <div className="mb-3">
                                                <p className="text-sm text-gray-600 mb-1">Subjects:</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {tutor.subjects?.slice(0, 3).map((subject, index) => (
                                                        <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                                            {subject}
                                                        </span>
                                                    ))}
                                                    {tutor.subjects?.length > 3 && (
                                                        <span className="text-xs text-gray-500">+{tutor.subjects.length - 3} more</span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Languages */}
                                            <div className="mb-3">
                                                <p className="text-sm text-gray-600 mb-1">Languages:</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {tutor.languages?.map((language, index) => (
                                                        <span key={index} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                                                            {language}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Price and Location */}
                                            <div className="flex justify-between items-center mb-4">
                                                <div className="text-lg font-bold text-blue-600">
                                                    PKR {tutor.hourlyRate}/hr
                                                </div>
                                                {tutor.countryOfBirth && (
                                                    <div className="flex items-center text-sm text-gray-600">
                                                        <FaMapMarkerAlt className="mr-1" />
                                                        {tutor.countryOfBirth}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Bio */}
                                            {tutor.bio && (
                                                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                                    {tutor.bio}
                                                </p>
                                            )}

                                            {/* Action Buttons */}
                                            <div className="flex space-x-2">
                                                <Link
                                                    to={`/tutor/${tutor._id}`}
                                                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors text-center"
                                                >
                                                    View Profile
                                                </Link>
                                                <button
                                                    onClick={() => handleBookTutor(tutor._id)}
                                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                                                >
                                                    Book Now
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default FindTutors;