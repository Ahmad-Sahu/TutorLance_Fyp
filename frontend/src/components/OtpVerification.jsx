import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";

const API_BASE = "http://localhost:3000/api/v1";

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
        verify: `${API_BASE}/students/verify-otp`,
        resend: `${API_BASE}/students/resend-otp`,
      };
    }
    if (role === "tutor") {
      return {
        verify: `${API_BASE}/tutors/verify-otp`,
        resend: `${API_BASE}/tutors/resend-otp`,
      };
    }
    if (role === "freelancer") {
      return {
        verify: `${API_BASE}/freelancers/verify-otp`,
        resend: `${API_BASE}/freelancers/resend-otp`,
      };
    }
    // default fallback
    return {
      verify: `${API_BASE}/students/verify-otp`,
      resend: `${API_BASE}/students/resend-otp`,
    };
  };

  const handleVerify = async () => {
    if (!email || otp.length !== 6) {
      toast.error("Enter your email and 6‑digit OTP.");
      return;
    }
    const { verify } = resolveEndpoints();
    try {
      setLoading(true);
      const res = await axios.post(verify, { email, code: otp });
      toast.success(res.data.message || "Email verified successfully");
      navigate("/login");
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
    if (!email) {
      toast.error("Enter your email first.");
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
      <div className="bg-white w-[400px] rounded-xl shadow-lg border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-center mb-4">
          Verify your email
        </h1>
        <p className="text-sm text-gray-600 mb-4 text-center">
          We have sent a 6‑digit OTP to{" "}
          <span className="font-semibold">{initialEmail || "your email"}</span>.
          Enter it below to complete your registration.
        </p>

        {/* Role (readonly when coming from signup) */}
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

        {/* Email */}
        <label className="block mb-2 text-sm font-semibold">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-2 mb-4"
          placeholder="user@example.com"
        />

        {/* 6‑digit OTP input */}
        <label className="block mb-2 text-sm font-semibold">6‑digit OTP</label>
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={otp}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "");
            if (v.length <= 6) setOtp(v);
          }}
          className="w-full border border-gray-300 rounded-lg p-2 mb-4 tracking-[0.5em] text-center text-lg"
          placeholder="••••••"
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

