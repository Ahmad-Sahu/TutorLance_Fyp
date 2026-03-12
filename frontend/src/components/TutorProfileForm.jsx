import React, { useState, useEffect } from "react";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { SiStudyverse } from "react-icons/si";
import { uploadToCloudinary } from "../utils/cloudinary.js";

const TutorProfileForm = ({
    initialValues = {},
    editMode = false,
    onSave,
    onCancel
}) => {
    const navigate = useNavigate();
    const subjectOptions = [
        { value: "Mathematics", label: "Mathematics" },
        { value: "Physics", label: "Physics" },
        { value: "Chemistry", label: "Chemistry" },
        { value: "Biology", label: "Biology" },
        { value: "English", label: "English" },
        { value: "Computer Science", label: "Computer Science" },
        { value: "Economics", label: "Economics" },
        { value: "Business", label: "Business" },
        { value: "History", label: "History" },
        { value: "Other", label: "Other" },
    ];
    const specialityOptions = [
        { value: "beginner", label: "Beginner" },
        { value: "advance", label: "Advance" },
        { value: "expert", label: "Expert" },
    ];
    const languageOptions = [
        { value: "English", label: "English" },
        { value: "Urdu", label: "Urdu" },
    ];
    const availabilityOptions = [
        "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
    ];
    const [formData, setFormData] = useState({
        subjects: initialValues.subjects || [],
        hourlyRate: initialValues.hourlyRate || "",
        countryOfBirth: initialValues.countryOfBirth || "",
        specialities: initialValues.specialities || [],
        languages: initialValues.languages || [],
        availability: initialValues.availability || [],
        bio: initialValues.bio || "",
        qualifications: initialValues.qualifications || "",
        youtubeLink: initialValues.youtubeLink || "",
        profilePicture: initialValues.profilePicture || ""
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
    }, [navigate]);

    // Strict text validation: only spaces between words, no leading/trailing/multiple spaces, max 20 words
    const isValidText = (val) => {
        if (!val) return false;
        const trimmed = val.trim();
        if (!trimmed) return false;
        if (/  +/.test(trimmed)) return false;
        if (!/^[A-Za-z0-9]+( [A-Za-z0-9]+)*$/.test(trimmed)) return false;
        if (trimmed.split(' ').length > 20) return false;
        return true;
    };
    // Payment validation: min 300, max 3000
    const isValidAmount = (val) => {
        const num = Number(val);
        return !isNaN(num) && num >= 300 && num <= 3000;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        // For hourlyRate, validate amount
        if (name === "hourlyRate") {
            if (!isValidAmount(value)) return;
        }
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleArrayInput = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value.split(',').map(item => item.trim()).filter(isValidText)
        }));
    };

    // Subjects dropdown (max 3)
    const handleSubjectsChange = (selected) => {
        if (selected.length > 3) return;
        setFormData(prev => ({ ...prev, subjects: selected.map(s => s.value) }));
    };
    // Specialities dropdown (single select)
    const handleSpecialityChange = (selected) => {
        setFormData(prev => ({ ...prev, specialities: selected ? [selected.value] : [] }));
    };
    // Languages dropdown (multi-select)
    const handleLanguagesChange = (selected) => {
        setFormData(prev => ({ ...prev, languages: selected ? selected.map(s => s.value) : [] }));
    };
    // Availability (min 2, max 7, 'All Days')
    const handleAvailabilityChange = (day) => {
        if (day === 'All Days') {
            setFormData(prev => ({ ...prev, availability: [...availabilityOptions] }));
            return;
        }
        setFormData(prev => {
            const already = prev.availability.includes(day);
            let updated = already
                ? prev.availability.filter(d => d !== day)
                : [...prev.availability, day];
            // Remove 'All Days' if present
            updated = updated.filter(d => d !== 'All Days');
            return { ...prev, availability: updated };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Validate all fields
        if (!formData.subjects.length) return toast.error("Select at least 1 subject");
        if (formData.subjects.length > 3) return toast.error("Select up to 3 subjects");
        if (!isValidAmount(formData.hourlyRate)) return toast.error("Hourly rate must be between 300 and 3000");
        if (!isValidText(formData.countryOfBirth)) return toast.error("Country of birth required");
        if (!formData.specialities.length) return toast.error("Select a speciality");
        if (!formData.languages.length) return toast.error("Select at least one language");
        if (formData.availability.length < 2) return toast.error("Select at least 2 days for availability");
        if (formData.availability.length > 7) return toast.error("Select up to all days");
        if (!isValidText(formData.bio)) return toast.error("Bio required");
        if (!isValidText(formData.qualifications)) return toast.error("Qualifications required");

        setLoading(true);
        try {
            let profilePictureUrl = formData.profilePicture;
            if (profilePictureFile) {
                const url = await uploadToCloudinary(profilePictureFile);
                if (url) profilePictureUrl = url;
                else toast.error("Image upload failed. Saving without new photo.");
            }
            const payload = {
                ...formData,
                profilePicture: profilePictureUrl,
                profileCompleted: true
            };
            if (onSave) {
                await onSave(payload);
            } else {
                // fallback: default behavior (for standalone use)
                const token = localStorage.getItem("token");
                const response = await fetch("http://localhost:3000/api/v1/tutors/profile", {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                });
                const data = await response.json();
                if (response.ok) {
                    toast.success("Profile completed successfully!");
                    // Do not redirect, stay on same page
                } else {
                    toast.error(data.message || "Failed to update profile");
                }
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
                <h2 className="text-3xl font-bold text-gray-900 mb-8">{editMode ? "Edit Tutor Profile" : "Complete Your Tutor Profile"}</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Subjects (Dropdown, max 3) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Subjects you teach (select up to 3)
                        </label>
                        <Select
                            isMulti
                            options={subjectOptions}
                            value={subjectOptions.filter(opt => formData.subjects.includes(opt.value))}
                            onChange={handleSubjectsChange}
                            className="mb-2"
                            closeMenuOnSelect={false}
                            placeholder="Select subjects..."
                            required
                        />
                        <div className="text-xs text-gray-500">Max 3 subjects</div>
                    </div>

                    {/* Hourly Rate */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Hourly Rate (PKR, 300-2500)
                        </label>
                        <input
                            type="number"
                            placeholder="e.g., 1500"
                            value={formData.hourlyRate}
                            onChange={handleInputChange}
                            name="hourlyRate"
                            min={300}
                            max={2500}
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

                    {/* Specialities (Dropdown) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Speciality
                        </label>
                        <Select
                            options={specialityOptions}
                            value={specialityOptions.find(opt => formData.specialities[0] === opt.value) || null}
                            onChange={handleSpecialityChange}
                            className="mb-2"
                            placeholder="Select speciality..."
                            isClearable
                            required
                        />
                    </div>

                    {/* Languages (Dropdown) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Languages you speak
                        </label>
                        <Select
                            isMulti
                            options={languageOptions}
                            value={languageOptions.filter(opt => formData.languages.includes(opt.value))}
                            onChange={handleLanguagesChange}
                            className="mb-2"
                            closeMenuOnSelect={false}
                            placeholder="Select languages..."
                            required
                        />
                    </div>

                    {/* Availability (Checkboxes, min 2, max 7, All Days) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Availability (select at least 2 days)
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={formData.availability.length === 7}
                                    onChange={() => handleAvailabilityChange('All Days')}
                                    className="mr-2"
                                />
                                All Days
                            </label>
                            {availabilityOptions.map(day => (
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
                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (editMode ? "Saving..." : "Saving...") : (editMode ? "Save Changes" : "Complete Profile")}
                            </button>
                            {editMode && (
                                <button
                                    type="button"
                                    onClick={onCancel}
                                    className="w-full bg-gray-300 text-gray-800 py-3 px-6 rounded-lg font-semibold hover:bg-gray-400 transition"
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TutorProfileForm;