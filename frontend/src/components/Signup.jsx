import { API_BASE } from '../config.js';
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoMdArrowRoundBack } from "react-icons/io";
import { SiStudyverse } from "react-icons/si";
import { LuArrowRightToLine } from "react-icons/lu";
import { MdExpandMore } from "react-icons/md";
import { FaPhoneAlt, FaWhatsapp, FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  sanitizeEmailInput,
  sanitizeNameInput,
  sanitizePasswordInput,
  validateEmail,
  validateName,
  validatePassword,
} from "../utils/authValidation";

function Signup() {
  const [role, setRole] = useState("tutor");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();

  const setSingleFieldError = (field, message = "") => {
    setFieldErrors((prev) => ({ ...prev, [field]: message }));
  };

  const handleNameChange = (field, setter, label) => (e) => {
    const cleanedValue = sanitizeNameInput(e.target.value);

    if (cleanedValue.length > 15) {
      setSingleFieldError(field, `${label} must not exceed 15 characters.`);
      return;
    }

    setter(cleanedValue);
    setSingleFieldError(field, cleanedValue ? validateName(label, cleanedValue) : "");
    setErrorMessage("");
  };

  const handlePasswordChange = (field, setter, label) => (e) => {
    const cleanedValue = sanitizePasswordInput(e.target.value);

    if (cleanedValue.length > 15) {
      setSingleFieldError(field, `${label} must not exceed 15 characters.`);
      return;
    }

    setter(cleanedValue);
    setSingleFieldError(field, cleanedValue ? validatePassword(cleanedValue, label) : "");
    setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nextErrors = {
      firstName: validateName("First name", firstName),
      lastName: validateName("Last name", lastName),
      email: validateEmail(email),
      password: validatePassword(password, "Password"),
      confirmPassword: validatePassword(confirmPassword, "Confirm password"),
    };

    if (password !== confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    setFieldErrors(nextErrors);

    const firstError = Object.values(nextErrors).find(Boolean);
    if (firstError) {
      setErrorMessage(firstError);
      return;
    }

    try {
      let endpoint = "";

      if (role === "student") {
        endpoint = `${API_BASE}/api/v1/students/signup`;
      } else if (role === "tutor") {
        endpoint = `${API_BASE}/api/v1/tutors/signup`;
      } else if (role === "freelancer") {
        endpoint = `${API_BASE}/api/v1/freelancers/register`;
      } else if (role === "admin") {
        endpoint = `${API_BASE}/api/v1/admin/signup`;
      } else {
        toast.error("Please select a valid role!");
        return;
      }

      const response = await axios.post(
        endpoint,
        { role, firstName, lastName, email, password },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      toast.success(response.data.message || "Signup successful");

      if (response.data.requiresOtp) {
        if (role === "freelancer" && response.data.freelancer) {
          localStorage.setItem("freelancer", JSON.stringify(response.data.freelancer));
          localStorage.setItem("freelancerId", response.data.freelancer._id);
        }
        navigate("/verify-otp", { state: { email, role } });
      } else {
        navigate("/login");
      }
    } catch (error) {
      if (error.response) {
        const data = error.response.data;
        let message = "Signup failed. Please try again.";

        if (Array.isArray(data.errors)) {
          message = data.errors.join("\n");
        } else if (data.message) {
          message = data.message;
        }

        setErrorMessage(message);
      } else {
        setErrorMessage("Signup failed. Please check your network connection.");
      }
    }
  };

  return (
    <>
      <div className=" text-black font-semibold text-2xl px-20 py-12 flex justify-between">
        <div className="flex items-center">
          <div className="flex items-center">
            <h1 className="mr-2">
              <SiStudyverse />
            </h1>
            <h1 className="mr-10">TutorLance</h1>
          </div>
          <div>
            <Link className="mr-10" to="/find-tutors">
              Find Tutor
            </Link>
            <Link to="/signup">Become a Tutor</Link>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <a className="flex items-center mr-8 font-semibold" href="">
            English{" "}
            <span className="text-4xl ml-2 font-bold">
              <MdExpandMore />
            </span>
          </a>
          <Link to="/login">
            <button className="flex bg-blue-6950 text-black py-3 px-6 border-4 border-black rounded-full font-semibold">
              <span className="text-2xl mr-4 mt-1">
                <LuArrowRightToLine />
              </span>
              Login
            </button>
          </Link>
        </div>
      </div>

      <div className="px-28">
        <Link to="/login">
          <IoMdArrowRoundBack className="text-3xl" />
        </Link>
      </div>

      <div className="-mt-12 mb-20 flex justify-center items-center min-h-screen bg-white">
        <div className="bg-gray-200 w-[400px] rounded shadow-md p-6">
          <h1 className="text-3xl font-bold text-center mb-6">Sign Up</h1>

          <form onSubmit={handleSubmit}>
            <label className="block mb-2 font-semibold">Sign up as (Select a Role)</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full border rounded p-2 mb-4"
            >
              <option value="tutor">Tutor</option>
              <option value="student">Student</option>
              <option value="freelancer">Freelancer</option>
            </select>

            <label className="block mb-2 font-semibold">First Name</label>
            <input
              type="text"
              placeholder="Enter your first name"
              value={firstName}
              onChange={handleNameChange("firstName", setFirstName, "First name")}
              className="w-full border rounded p-2 mb-1"
              required
            />
            {fieldErrors.firstName ? (
              <p className="text-red-500 text-xs mb-3">{fieldErrors.firstName}</p>
            ) : (
              <div className="mb-3"></div>
            )}

            <label className="block mb-2 font-semibold">Last Name</label>
            <input
              type="text"
              placeholder="Enter your last name"
              value={lastName}
              onChange={handleNameChange("lastName", setLastName, "Last name")}
              className="w-full border rounded p-2 mb-1"
              required
            />
            {fieldErrors.lastName ? (
              <p className="text-red-500 text-xs mb-3">{fieldErrors.lastName}</p>
            ) : (
              <div className="mb-3"></div>
            )}

            <label className="block mb-2 font-semibold">Email</label>
            <input
              type="email"
              placeholder="Enter your email (e.g. user@example.com)"
              value={email}
              onChange={(e) => {
                const value = sanitizeEmailInput(e.target.value);
                setEmail(value);
                setSingleFieldError("email", value ? validateEmail(value) : "");
                setErrorMessage("");
              }}
              className="w-full border rounded p-2 mb-1"
              required
            />
            {fieldErrors.email ? (
              <p className="text-red-500 text-xs mb-3">{fieldErrors.email}</p>
            ) : (
              <div className="mb-3"></div>
            )}

            <label className="block mb-2 font-semibold">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={handlePasswordChange("password", setPassword, "Password")}
                className="w-full border rounded p-2 mb-1"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-600"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {fieldErrors.password ? (
              <p className="text-red-500 text-xs mb-3">{fieldErrors.password}</p>
            ) : (
              <div className="mb-3"></div>
            )}

            <label className="block mb-2 font-semibold">Confirm Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={handlePasswordChange("confirmPassword", setConfirmPassword, "Confirm password")}
                className="w-full border rounded p-2 mb-1"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-600"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {fieldErrors.confirmPassword ? (
              <p className="text-red-500 text-xs mb-3">{fieldErrors.confirmPassword}</p>
            ) : (
              <div className="mb-3"></div>
            )}

            {errorMessage && <p className="text-red-500 text-sm mb-4 text-center">{errorMessage}</p>}

            <button
              type="submit"
              className="w-full bg-blue-700 text-white py-2 rounded hover:bg-blue-800"
            >
              Sign Up
            </button>
          </form>

          <p className="text-center mt-4 text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-700 underline">
              Login
            </Link>
          </p>
        </div>
      </div>

      <div>
        <div className="bg-blue-950 h-lvh text-white px-40 py-14 flex justify-between">
          <div>
            <h1 className="font-bold text-3xl">About</h1>
            <p className="mt-4 underline text-2xl text-light">Who we are?</p>
            <p className="underline text-2xl text-light">How it works?</p>
            <p className="underline text-2xl text-light">TutorLance reviews</p>
            <p className="underline text-2xl text-light">Work at TutorLance</p>
            <p className="text-2xl text-light">Status</p>
            <p className="text-light text-xl">We stand with Palestine</p>
            <p className="text-light text-xl">Affiliate Program</p>

            <div>
              <h1 className="mt-20 font-bold text-3xl">For Tutors</h1>
              <p className="mt-4 underline text-2xl text-light">Become an Online Tutor</p>
              <p className="underline text-2xl text-light">Teach CS courses online</p>
              <p className="underline text-2xl text-light">Teach Mathematics online</p>
              <p className="underline text-2xl text-light">Teach Science Online</p>
              <p className="underline text-2xl text-light">See all online tutoring jobs</p>
            </div>
          </div>

          <div>
            <h1 className="font-bold text-3xl">For Students</h1>
            <p className="mt-4 underline text-xl text-light">TutorLance Blog</p>
            <p className="underline text-2xl text-light">Questions and Answers</p>
            <p className="underline text-2xl text-light">Student discount</p>
            <p className="underline text-2xl text-light">Test your English for free</p>
            <p className="underline text-2xl text-light">TutorLance discounts</p>

            <div>
              <h1 className="mt-36 font-bold text-3xl">Learn</h1>
              <p className="mt-4 underline text-xl text-light">Learn Programming Online</p>
              <p className="underline text-2xl text-light">Learn Mathematics Online</p>
              <p className="underline text-2xl text-light">
                Learn Software Engineering <br /> courses Online
              </p>
              <p className="underline text-2xl text-light">Learn Mobile Application Online</p>
              <p className="underline text-2xl text-light">Learn Python Online</p>
            </div>
          </div>

          <div>
            <h1 className="font-bold text-2xl">Support</h1>
            <p className="mt-4 underline text-2xl text-light">Need any Help?</p>

            <h1 className="mt-10 text-3xl font-bold">Contacts</h1>
            <p className="mt-4 text-2xl text-light">Gmail: abc@gmail.com</p>
            <p className="mt-4 underline text-2xl text-light flex">
              <FaPhoneAlt /> <span className="ml-4">+92-300-7674574</span>
            </p>
            <p className="mt-4 underline text-2xl text-light flex">
              <FaWhatsapp /> <span className="ml-4">+92-300-7674574</span>
            </p>

            <div>
              <h1 className="mt-14 font-bold text-3xl">Tutors near you</h1>
              <p className="mt-4 underline text-xl text-light">Tutors in Multan</p>
              <p className="underline text-2xl text-light">Tutors in Islamabad</p>
              <p className="underline text-2xl text-light">Tutors in Lahore</p>
              <p className="underline text-2xl text-light">Tutors in Faislabad</p>
              <p className="underline text-2xl text-light">Tutors in Peshawar</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center bg-blue-950 text-white -mt-20 py-20">
          <h1 className="underline text-xl">Legal Center</h1>
          <h1 className="ml-12 underline text-xl">Privacy Policy</h1>
          <h1 className="ml-12 underline text-xl">Cookies Policy</h1>
        </div>
      </div>
    </>
  );
}

export default Signup;
