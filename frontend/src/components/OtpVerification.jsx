import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { sanitizeEmailInput, validateEmail } from "../utils/authValidation";
import { API_BASE } from "../config.js";

const OtpVerification = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { email: initialEmail, role: initialRole } = location.state || {};

  const [email, setEmail] = useState(initialEmail || "");
  const [role, setRole] = useState(initialRole || "student");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const resolveEndpoints = () => {
    if (role === "student") {
      return {
        verify: `${API_BASE}/api/v1/students/verify-otp`,
        resend: `${API_BASE}/api/v1/students/resend-otp`,
      };
    }
    if (role === "tutor") {
      return {
        verify: `${API_BASE}/api/v1/tutors/verify-otp`,
        resend: `${API_BASE}/api/v1/tutors/resend-otp`,
      };
    }
    if (role === "freelancer") {
      return {
        verify: `${API_BASE}/api/v1/freelancers/verify-otp`,
        resend: `${API_BASE}/api/v1/freelancers/resend-otp`,
      };
    }

    return {
      verify: `${API_BASE}/api/v1/students/verify-otp`,
      resend: `${API_BASE}/api/v1/students/resend-otp`,
    };
  };

  const handleVerify = async () => {
    const emailError = validateEmail(email);
    if (emailError) {
      toast.error(emailError);
      return;
    }

    if (otp.length !== 6) {
      toast.error("Enter your 6-digit OTP.");
      return;
    }

    const { verify } = resolveEndpoints();

    try {
      setLoading(true);
      const res = await axios.post(verify, { email, code: otp });
      toast.success(res.data.message || "Email verified successfully");
      if (role === "freelancer" && localStorage.getItem("freelancerId")) {
        navigate("/freelancer-info");
      } else {
        navigate("/login");
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Failed to verify OTP. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    const emailError = validateEmail(email);
    if (emailError) {
      toast.error(emailError);
      return;
    }

    const { resend } = resolveEndpoints();

    try {
      setLoading(true);
      const res = await axios.post(resend, { email });
      toast.success(res.data.message || "New OTP sent to your email.");
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Failed to resend OTP. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white w-full max-w-[400px] rounded-xl shadow-lg border border-gray-200 p-6 mx-4">
        <h1 className="text-2xl font-bold text-center mb-4">Verify your email</h1>
        <p className="text-sm text-gray-600 mb-4 text-center">
          We have sent a 6-digit OTP to{" "}
          <span className="font-semibold">{initialEmail || "your email"}</span>.
          Enter it below to complete your registration.
        </p>

        <label className="block mb-2 text-sm font-semibold">Role</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-2 mb-4 bg-white"
        >
          <option value="student">Student</option>
          <option value="tutor">Tutor</option>
          <option value="freelancer">Freelancer</option>
        </select>

        <label className="block mb-2 text-sm font-semibold">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(sanitizeEmailInput(e.target.value))}
          className="w-full border border-gray-300 rounded-lg p-2 mb-4"
          placeholder="user@example.com"
        />

        <label className="block mb-2 text-sm font-semibold">6-digit OTP</label>
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={otp}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, "");
            if (value.length <= 6) setOtp(value);
          }}
          className="w-full border border-gray-300 rounded-lg p-2 mb-4 tracking-[0.5em] text-center text-lg"
          placeholder="......"
        />

        <button
          type="button"
          onClick={handleVerify}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>

        <button
          type="button"
          onClick={handleResend}
          disabled={loading}
          className="w-full mt-3 text-sm text-blue-600 hover:text-blue-800"
        >
          Resend OTP
        </button>
      </div>
    </div>
  );
};

export default OtpVerification;
