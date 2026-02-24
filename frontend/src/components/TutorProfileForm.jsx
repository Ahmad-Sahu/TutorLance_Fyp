import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { SiStudyverse } from "react-icons/si";
import { uploadToCloudinary } from "../utils/cloudinary.js";

const TutorProfileForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        subjects: [],
        hourlyRate: "",
        countryOfBirth: "",
        specialities: [],
        languages: [],
        availability: [],
        bio: "",
        qualifications: "",
        youtubeLink: "",
        profilePicture: ""
    });
    const [profilePictureFile, setProfilePictureFile] = useState(null);
    const [profilePicturePreview, setProfilePicturePreview] = useState("");
    const [loading, setLoading] = useState(false);

    // Check if tutor is logged in
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }
        // You could verify the token here if needed
    }, [navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleArrayInput = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value.split(',').map(item => item.trim()).filter(item => item)
        }));
    };

    const handleAvailabilityChange = (day) => {
        setFormData(prev => ({
            ...prev,
            availability: prev.availability.includes(day)
                ? prev.availability.filter(d => d !== day)
                : [...prev.availability, day]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let profilePictureUrl = formData.profilePicture;
            if (profilePictureFile) {
                const url = await uploadToCloudinary(profilePictureFile);
                if (url) profilePictureUrl = url;
                else toast.error("Image upload failed. Saving without new photo.");
            }

            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:3000/api/v1/tutors/profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    profilePicture: profilePictureUrl,
                    profileCompleted: true
                })
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("Profile completed successfully!");
                navigate("/tutordashboard");
            } else {
                toast.error(data.message || "Failed to update profile");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("Error updating profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <div className="bg-blue-950 text-white font-semibold text-2xl p-10 flex justify-between">
                <div className="flex items-center">
                    <SiStudyverse className="mr-2 text-3xl" />
                    <h1 className="mr-10">TutorLance</h1>
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-6">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Complete Your Tutor Profile</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Subjects */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Subjects you teach (comma-separated)
                        </label>
                        <input
                            type="text"
                            placeholder="e.g., Mathematics, Physics, Chemistry"
                            value={formData.subjects.join(', ')}
                            onChange={(e) => handleArrayInput('subjects', e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                    </div>

                    {/* Hourly Rate */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Hourly Rate (PKR)
                        </label>
                        <input
                            type="number"
                            placeholder="e.g., 1500"
                            value={formData.hourlyRate}
                            onChange={handleInputChange}
                            name="hourlyRate"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                    </div>

                    {/* Country of Birth */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Country of Birth
                        </label>
                        <select
                            value={formData.countryOfBirth}
                            onChange={handleInputChange}
                            name="countryOfBirth"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        >
                            <option value="">Select country</option>
                            <option value="Pakistan">Pakistan</option>
                            <option value="India">India</option>
                            <option value="USA">USA</option>
                            <option value="UK">UK</option>
                            <option value="Canada">Canada</option>
                            <option value="Australia">Australia</option>
                        </select>
                    </div>

                    {/* Specialities */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Specialities (comma-separated)
                        </label>
                        <input
                            type="text"
                            placeholder="e.g., Beginner, Advanced, Interview Prep"
                            value={formData.specialities.join(', ')}
                            onChange={(e) => handleArrayInput('specialities', e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Languages */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Languages you speak (comma-separated)
                        </label>
                        <input
                            type="text"
                            placeholder="e.g., English, Urdu, Hindi"
                            value={formData.languages.join(', ')}
                            onChange={(e) => handleArrayInput('languages', e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                    </div>

                    {/* Availability */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Availability (select days)
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                                <label key={day} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={formData.availability.includes(day)}
                                        onChange={() => handleAvailabilityChange(day)}
                                        className="mr-2"
                                    />
                                    {day}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Bio */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Bio
                        </label>
                        <textarea
                            placeholder="Tell students about yourself and your teaching experience..."
                            value={formData.bio}
                            onChange={handleInputChange}
                            name="bio"
                            rows="4"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                    </div>

                    {/* Qualifications */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Qualifications
                        </label>
                        <textarea
                            placeholder="Your educational background and certifications..."
                            value={formData.qualifications}
                            onChange={handleInputChange}
                            name="qualifications"
                            rows="3"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* YouTube Link */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            YouTube Channel Link (optional)
                        </label>
                        <input
                            type="url"
                            placeholder="https://youtube.com/channel/..."
                            value={formData.youtubeLink}
                            onChange={handleInputChange}
                            name="youtubeLink"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Profile Picture (Cloudinary - import from device) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Profile Picture (optional) — upload from device
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                setProfilePictureFile(file || null);
                                if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (ev) => setProfilePicturePreview(ev.target?.result || "");
                                    reader.readAsDataURL(file);
                                } else setProfilePicturePreview("");
                            }}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {profilePicturePreview && (
                            <img src={profilePicturePreview} alt="Preview" className="mt-2 h-24 w-24 object-cover rounded-lg border" />
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="pt-6">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Saving..." : "Complete Profile"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TutorProfileForm;