import React, { useState } from "react";
import { Link } from "react-router-dom";
import { IoMdArrowRoundBack } from "react-icons/io";
import { SiStudyverse } from "react-icons/si";
import { LuArrowRightToLine } from "react-icons/lu";
import { MdExpandMore } from "react-icons/md";
import { FaPhoneAlt, FaWhatsapp, FaEye, FaEyeSlash } from "react-icons/fa";

import { useNavigate } from "react-router-dom";

import axios from "axios";
import { toast } from 'react-hot-toast'

function Login() {
    // State for form fields
    const [role, setRole] = useState("student");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showForgot, setShowForgot] = useState(false);
    const [forgotEmail, setForgotEmail] = useState("");
    const [forgotNewPassword, setForgotNewPassword] = useState("");
    const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage(""); // Clear previous errors

        // Validate inputs
        if (!email || !password) {
            const missingField = !email ? "Email" : "Password";
            setErrorMessage(`${missingField} is required.`);
            return;
        }

        if (password.length < 6) {
            setErrorMessage("Password must be at least 6 characters long.");
            return;
        }

        try {
            let endpoint = "";

            // Determine endpoint based on role
            if (role === "student") {
                endpoint = "http://localhost:3000/api/v1/students/login";
            } else if (role === "tutor") {
                endpoint = "http://localhost:3000/api/v1/tutors/login";
            } else if (role === "freelancer") {
                endpoint = "http://localhost:3000/api/v1/freelancers/login";
            } else if (role === "admin") {
                endpoint = "http://localhost:3000/api/v1/admin/login";
            } else {
                alert("Please select a valid role!");
                return;
            }

            // if (role === "student" && response.data.student) {
            //     localStorage.setItem("student", JSON.stringify(response.data.student));
            // } else if (role === "tutor" && response.data.tutor) {
            //     localStorage.setItem("tutor", JSON.stringify(response.data.tutor));
            // } else if (role === "freelancer" && response.data.freelancer) {
            //     localStorage.setItem("freelancer", JSON.stringify(response.data.freelancer));
            // } else if (role === "admin" && response.data.admin) {
            //     localStorage.setItem("admin", JSON.stringify(response.data.admin));
            // } else {
            //     alert("Login failed: User data missing.");
            //     return;
            // }

            // Make login request
            const response = await axios.post(
                endpoint,
                { role, email, password },
                {
                    withCredentials: true,
                    headers: { "Content-Type": "application/json" },
                }
            );

            // Show success message
            //toast.success(response.data.message || "Login successful");

            // Save user info in localStorage safely (use role as key)
            let userData = null;

            if (role === "student" && response.data.student) userData = response.data.student;
            else if (role === "tutor" && response.data.tutor) userData = response.data.tutor;
            else if (role === "freelancer" && response.data.freelancer) userData = response.data.freelancer;
            else if (role === "admin" && response.data.admin) userData = response.data.admin;

            if (userData) {
                localStorage.setItem(role, JSON.stringify(userData)); // store keyed by role
                // store id under role-specific key so other components can find it
                if (userData._id) localStorage.setItem(`${role}Id`, userData._id);
                // store token if backend returned one
                if (response.data.token) localStorage.setItem("token", response.data.token);
                console.log("Logged in user stored:", role, userData);
                // Show success toast
                toast.success(response.data.message || "Login successful");
            } else {
                console.log("Login response received but user data missing:", response.data);
                alert("Login failed: User data missing.");
                return;
            }

            // Redirect user after successful login
            if (role === "tutor" && userData && !userData.profileCompleted) {
                navigate("/tutor-profile");
            } else {
                const routes = {
                    student: "/studentdashboard",
                    tutor: "/tutordashboard",
                    freelancer: "/freelancerdashboard",
                    admin: "/admindashboard",
                };
                navigate(routes[role]);
            }

        } catch (error) {
            if (error.response) {
                // Show field-specific and role-specific error if present
                const data = error.response.data;
                let messages = "Login failed!";
                if (Array.isArray(data.errors)) {
                    messages = data.errors.join("\n");
                } else if (data.message) {
                    messages = data.message;
                }
                // Do NOT proceed with login on any error
                setErrorMessage(messages);
                console.log("Login error:", error.response.status, messages);
                // Clear password field on wrong credentials for security
                if (data.field === "password") {
                    setPassword("");
                }
            } else {
                setErrorMessage("Login failed! Please check your network connection.");
            }
        }
    };



    return (
        <>
            {/* Nav Bar */}
            <div className=' text-black font-semibold text-2xl px-20 py-12 flex justify-between'>

                <div className='flex items-center'>
                    <div className='flex items-center'>
                        <h1 className='mr-2'><SiStudyverse /></h1>
                        <h1 className='mr-10'>TutorLance</h1>
                    </div>
                    <div>
                        <Link className='mr-10' to="/find-tutors">Find Tutor</Link>
                        <Link to="/signup">Become a Tutor</Link>
                    </div>
                </div>

                <div className='flex items-center justify-between'>
                    <a className='flex items-center mr-8 font-semibold' href="">English <span className='text-4xl ml-2 font-bold'><MdExpandMore /></span></a>
                    <Link to="/login"><button className='flex 0 text-black py-3 px-6 border-4 border-black rounded-full font-semibold'>
                        <span className='text-2xl mr-4 mt-1'><LuArrowRightToLine /></span>Login</button></Link>
                </div>

            </div>


            {/* Back Button */}
            <div className="px-28">
                <Link to="/">
                    <IoMdArrowRoundBack className="text-3xl" />
                </Link>
            </div>

            {/* Centered Login Card */}
            <div className="-mt-28 flex justify-center items-center min-h-screen bg-slate-50">
                <div className="bg-white w-[400px] rounded-xl shadow-lg border border-gray-200 p-6">
                    {/* Title */}
                    <h1 className="text-3xl font-bold text-center mb-6">Login</h1>

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        {/* Login As Dropdown */}
                        <label className="block mb-2 font-semibold">Login as (Select a Role)</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-2 mb-4 cursor-pointer bg-white"
                        >
                            <option value="tutor">Tutor</option>
                            <option value="student">Student</option>
                            <option value="admin">Admin</option>
                            <option value="freelancer">FreeLancer</option>
                        </select>

                        {/* Email */}
                        <label className="block mb-2 font-semibold">Email</label>
                        <input
                            type="email"
                            placeholder="Enter your email (e.g. user@example.com)"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border rounded p-2 mb-4"
                            required
                        />

                        {/* Password */}
                        <label className="block mb-2 font-semibold">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full border rounded p-2 mb-6"
                                required
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-600">
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>

                        <div className="flex justify-between items-center mb-4">
                            <div></div>
                            <button type="button" onClick={() => { setShowForgot(!showForgot); setForgotEmail(email); setForgotNewPassword(""); setForgotConfirmPassword(""); setErrorMessage(""); }} className="text-sm text-blue-700 underline">
                                Forgot password?
                            </button>
                        </div>

                        {showForgot && (
                            <div className="bg-white p-4 rounded border mb-4">
                                <label className="block mb-2 font-semibold">Email</label>
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={forgotEmail}
                                    onChange={(e) => setForgotEmail(e.target.value)}
                                    className="w-full border rounded p-2 mb-3"
                                />

                                <label className="block mb-2 font-semibold">New Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter new password"
                                        value={forgotNewPassword}
                                        onChange={(e) => setForgotNewPassword(e.target.value)}
                                        className="w-full border rounded p-2 mb-3"
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-600">
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>

                                <label className="block mb-2 font-semibold">Confirm New Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Confirm new password"
                                        value={forgotConfirmPassword}
                                        onChange={(e) => setForgotConfirmPassword(e.target.value)}
                                        className="w-full border rounded p-2 mb-3"
                                    />
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            setErrorMessage("");
                                            try {
                                                if (!forgotEmail) { setErrorMessage("Email is required for password reset"); return; }
                                                if (!forgotNewPassword || forgotNewPassword.length < 6) { setErrorMessage("New password must be at least 6 characters"); return; }
                                                if (forgotNewPassword !== forgotConfirmPassword) { setErrorMessage("Passwords do not match"); return; }

                                                const endpoint = "http://localhost:3000/api/v1/auth/forgot-password";
                                                const payload = { role, email: forgotEmail, newPassword: forgotNewPassword, confirmPassword: forgotConfirmPassword };
                                                const resp = await axios.post(endpoint, payload, { headers: { "Content-Type": "application/json" } });
                                                alert(resp.data.message || "Password updated successfully. Please login with your new password.");
                                                setShowForgot(false);
                                                setForgotNewPassword("");
                                                setForgotConfirmPassword("");
                                            } catch (err) {
                                                console.error(err);
                                                if (err.response && err.response.data) {
                                                    const d = err.response.data;
                                                    const msg = d.message || (Array.isArray(d.errors) ? d.errors.join(" ") : "Password reset failed");
                                                    setErrorMessage(msg);
                                                } else {
                                                    setErrorMessage("Password reset failed. Check console for details.");
                                                }
                                            }
                                        }}
                                        className="bg-blue-700 text-white py-1 px-3 rounded"
                                    >
                                        Reset Password
                                    </button>
                                </div>
                            </div>
                        )}

                        {errorMessage && <p className='text-red-500 text-sm mb-4 text-center'>{errorMessage}</p>}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 cursor-pointer font-semibold"
                        >
                            Login
                        </button>
                    </form>

                    {/* Sign Up Link */}
                    <p className="text-center mt-4 text-sm">
                        Don’t have an account?{" "}
                        <Link to="/signup" className="text-blue-700 underline">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>

            <div>
                {/* Footer */}
                <div className='bg-blue-950 h-lvh text-white px-40 py-14 flex justify-between'>
                    <div>
                        <h1 className='font-bold text-3xl'>About</h1>
                        <p className='mt-4 underline text-2xl text-light'>
                            Who we are?
                        </p>
                        <p className='underline text-2xl text-light'>
                            How it works?
                        </p>
                        <p className='underline text-2xl text-light'>
                            TutorLance reviews
                        </p>
                        <p className='underline text-2xl text-light'>
                            Work at TutorLance
                        </p>
                        <p className='text-2xl text-light'>
                            Status
                        </p>
                        <p className='text-light text-xl'>
                            We stand with Palestine
                        </p>
                        <p className='text-light text-xl'>
                            Affiliate Program
                        </p>

                        <div>
                            <h1 className='mt-20 font-bold text-3xl'>For Tutors</h1>
                            <p className='mt-4 underline text-2xl text-light'>
                                Become an Online Tutor
                            </p>
                            <p className='underline text-2xl text-light'>
                                Teach CS courses online
                            </p>
                            <p className='underline text-2xl text-light'>
                                Teach Mathematics online
                            </p>
                            <p className='underline text-2xl text-light'>
                                Teach Science Online
                            </p>
                            <p className='underline text-2xl text-light'>
                                See all online tutoring jobs
                            </p>
                        </div>
                    </div>

                    <div>
                        <h1 className='font-bold text-3xl'>For Students</h1>
                        <p className='mt-4 underline text-xl text-light'>
                            TutorLance Blog
                        </p>
                        <p className='underline text-2xl text-light'>
                            Questions and Answers
                        </p>
                        <p className='underline text-2xl text-light'>
                            Student discount
                        </p>
                        <p className='underline text-2xl text-light'>
                            Test your English for free
                        </p>
                        <p className='underline text-2xl text-light'>
                            TutorLance discounts
                        </p>

                        <div>
                            <h1 className='mt-36 font-bold text-3xl'>Learn</h1>
                            <p className='mt-4 underline text-xl text-light'>
                                Learn Programming Online
                            </p>
                            <p className='underline text-2xl text-light'>
                                Learn Mathametics Online
                            </p>
                            <p className='underline text-2xl text-light'>
                                Learn Software Engineering <br /> courses Online
                            </p>
                            <p className='underline text-2xl text-light'>
                                Learn Mobile Application Online
                            </p>
                            <p className='underline text-2xl text-light'>
                                Learn Python Online
                            </p>
                        </div>
                    </div>

                    <div>
                        <h1 className='font-bold text-2xl'>Support</h1>
                        <p className='mt-4 underline text-2xl text-light'>
                            Need any Help?
                        </p>

                        <h1 className='mt-10 text-3xl font-bold'>
                            Contacts
                        </h1>
                        <p className='mt-4 text-2xl text-light'>
                            Gmail: abc@gmail.com
                        </p>
                        <p className='mt-4 underline text-2xl text-light flex'>
                            <FaPhoneAlt /> <span className='ml-4'>+92-300-7674574</span>
                        </p>
                        <p className='mt-4 underline text-2xl text-light flex'>
                            <FaWhatsapp /> <span className='ml-4'>+92-300-7674574</span>
                        </p>
                        <div>
                            <h1 className='mt-14 font-bold text-3xl'>Tutors near you</h1>
                            <p className='mt-4 underline text-xl text-light'>
                                Tutors in Multan
                            </p>
                            <p className='underline text-2xl text-light'>
                                Tutors in Islamabad
                            </p>
                            <p className='underline text-2xl text-light'>
                                Tutors in Lahore
                            </p>
                            <p className='underline text-2xl text-light'>
                                Tutors in Faislabad
                            </p>
                            <p className='underline text-2xl text-light'>
                                Tutors in Peshawar
                            </p>
                        </div>
                    </div>

                </div>
                {/* Lower Footer */}
                <div className='flex items-center justify-center bg-blue-950 text-white -mt-20 py-20'>
                    <h1 className='underline text-xl'>Legal Center</h1>
                    <h1 className='ml-12 underline text-xl'>Privacy Policy</h1>
                    <h1 className='ml-12 underline text-xl'>Cookies Policy</h1>
                </div>
            </div>
        </>
    );
}

export default Login;
