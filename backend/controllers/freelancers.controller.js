// import {Freelancer} from '../models/freelancers.model.js';
// import bcrypt from "bcryptjs";
// import {z} from "zod";


// export const signup = async (req, res) => {
//     const {role, firstName, lastName, email, password} = req.body;

//     const signupSchema = z.object({
//     role: z.enum(["tutor", "student", "freelancer", "admin"]),
//     firstName: z.string().min(2,{message : "First name must be at least 2 characters long"}).max(100),
//     lastName: z.string().min(2,{message : "Last name must be at least 2 characters long"}).max(100),
//     email: z.string().email({message : "Invalid email format"}),
//     password: z.string().min(6,{message : "Password must be at least 6 characters long"}).max(100)
// });

// const validation = signupSchema.safeParse(req.body);
//     if (!validation.success) {
//         return res.status(400).json({ errors: validation.error.issues.map(err => err.message) });
//     }

//     try {
//         const existingfreelancer = await Freelancer.findOne({ email });
//         if (existingfreelancer) {
//             return res.status(400).json({ message: "freelancer already exists" });
//         }

//         // Hash password
//         const hashedPassword = await bcrypt.hash(password, 10);

//         const newfreelancer = new Freelancer({
//             role,
//             firstName,
//             lastName,
//             email,
//             password : hashedPassword
//         });

//         await newfreelancer.save();
//         return res.status(201).json({ message: "freelancer registered successfully" });
//     } catch (error) {
//         return res.status(500).json({ message: "Internal server error" });
//     }
// }

// export const login = async (req, res) => {
//     const {role, email, password } = req.body;

//     const loginSchema = z.object({
//         role: z.enum(["tutor", "student", "freelancer", "admin"]),
//         email: z.string().email({ message: "Invalid email format" }),
//         password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
//     });

//     const validation = loginSchema.safeParse(req.body);
//     if (!validation.success) {
//         return res.status(400).json({ errors: validation.error.issues.map(err => err.message) });
//     }

//     try {
//         const freelancer = await Freelancer.findOne({ email: email });
//         if (!freelancer) {
//             return res.status(400).json({ message: "Invalid email or password" });
//         }

//         const isMatch = await bcrypt.compare(password, freelancer.password);
//         if (!isMatch) {
//             return res.status(400).json({ message: "Invalid email or password" });
//         }

//         return res.status(200).json({ message: "Login successful" });
//     } catch (error) {
//         return res.status(500).json({ message: "Internal server error" });
//     }
// };

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Freelancer } from "../models/freelancers.model.js";
import { sendOtpEmail } from "../utils/send-email.js";
import { sendVerificationEmail } from "../utils/email.js";
import { z } from "zod";
import { emailSchema, nameSchema, normalizeEmail, normalizeName, passwordSchema } from "../utils/authValidation.js";
const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();
dotenv.config();

/* ==============================
   REGISTER FREELANCER
============================== */
export const registerFreelancer = async (req, res) => {
  try {
    // Accept both formats: (firstName + lastName) or (name)
    let { name, email, password, skills, experience, firstName, lastName } = req.body;
    email = normalizeEmail(email);

    // If firstName/lastName not provided, try to split from name
    if (!firstName && name) {
      const parts = normalizeName(name).split(" ");
      firstName = parts[0];
      lastName = parts.slice(1).join(" ") || "";
    }
    firstName = normalizeName(firstName);
    lastName = normalizeName(lastName);

    // Validate
    const freelancerSchema = z.object({
      firstName: nameSchema("First name"),
      lastName: nameSchema("Last name"),
      email: emailSchema,
      password: passwordSchema,
      skills: z.string().optional(),
      experience: z.string().optional(),
    });

    const validation = freelancerSchema.safeParse({ firstName, lastName, email, password, skills, experience });
    if (!validation.success) {
      return res.status(400).json({ errors: validation.error.issues.map(err => err.message) });
    }

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "First name, last name, email, and password are required" });
    }

    const existing = await Freelancer.findOne({ email });
    if (existing) {
      return res.status(400).json({
        message: "User with this email already exists in freelancer role, use another valid email.",
        field: "email",
        role: "freelancer"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const code = generateCode();
    const expires = new Date(Date.now() + 5 * 60 * 1000);

    const newFreelancer = new Freelancer({
      firstname: firstName || normalizeName(name).split(" ")[0] || name,
      lastname: lastName || normalizeName(name).split(" ").slice(1).join(" ") || "",
      name,
      email,
      password: hashedPassword,
      skills,
      experience,
      profileCompleted: false,
      isVerified: false,
      otp: code,
      otpExpiry: expires,
    });

    await newFreelancer.save();

    try {
      await sendOtpEmail(email, code);
    } catch (e) {
      console.warn("⚠️ Failed to send verification email to freelancer:", e.message);
    }

    // Return the created freelancer so frontend can redirect and store id
    res.status(201).json({ message: "Freelancer registered. Please verify your email with the OTP sent.", freelancer: newFreelancer, requiresOtp: true });
  } catch (error) {
    console.error("❌ Register freelancer error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* ==============================
   LOGIN FREELANCER
============================== */
export const loginFreelancer = async (req, res) => {
  try {
    let { email, password } = req.body;
    email = normalizeEmail(email);
    const freelancer = await Freelancer.findOne({ email });
    if (!freelancer) return res.status(404).json({ message: "No freelancer found with this email. Please check your credentials or sign up first.", field: "email", role: "freelancer" });

    if (!freelancer.isVerified) {
      return res.status(403).json({ message: "Please verify your email before logging in.", field: "email", role: "freelancer" });
    }

    const valid = await bcrypt.compare(password, freelancer.password);
    if (!valid) return res.status(401).json({ message: "Incorrect password. Please try again.", field: "password", role: "freelancer" });

    const token = jwt.sign(
      { id: freelancer._id, role: "freelancer" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      freelancer: {
        ...freelancer.toObject(),
        name: freelancer.name || `${freelancer.firstname} ${freelancer.lastname}`.trim(),
        profileCompleted: Boolean(freelancer.profileCompleted),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Verify freelancer OTP
export const verifyFreelancerOtp = async (req, res) => {
  try {
    let { email, code } = req.body;
    email = normalizeEmail(email);
    if (!email || !code) {
      return res.status(400).json({ message: "Email and code are required" });
    }

    const freelancer = await Freelancer.findOne({ email });
    if (!freelancer) return res.status(404).json({ message: "Freelancer not found" });

    if (freelancer.isVerified) {
      return res.status(200).json({ message: "Email already verified" });
    }

    if (!freelancer.otp || !freelancer.otpExpiry) {
      return res.status(400).json({ message: "No verification code found. Please sign up again." });
    }

    if (freelancer.otpExpiry < new Date()) {
      return res.status(400).json({ message: "Verification code has expired. Please request a new OTP." });
    }

    if (freelancer.otp !== code) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    freelancer.isVerified = true;
    freelancer.otp = undefined;
    freelancer.otpExpiry = undefined;
    await freelancer.save();

    return res.status(200).json({ message: "Email verified successfully" });
  } catch (err) {
    console.error("verifyFreelancerOtp error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Resend freelancer OTP
export const resendFreelancerOtp = async (req, res) => {
  try {
    let { email } = req.body;
    email = normalizeEmail(email);
    if (!email) return res.status(400).json({ message: "Email is required" });

    const freelancer = await Freelancer.findOne({ email });
    if (!freelancer) return res.status(404).json({ message: "Freelancer not found" });
    if (freelancer.isVerified) {
      return res.status(200).json({ message: "Email already verified" });
    }

    const code = generateCode();
    const expires = new Date(Date.now() + 5 * 60 * 1000);
    freelancer.otp = code;
    freelancer.otpExpiry = expires;
    await freelancer.save();

    try {
      await sendVerificationEmail(email, code);
    } catch (e) {
      console.warn("⚠️ Failed to resend verification email to freelancer:", e.message);
    }

    return res.status(200).json({ message: "A new OTP has been sent to your email." });
  } catch (err) {
    console.error("resendFreelancerOtp error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/* ==============================
   GET FREELANCER PROFILE
============================== */
export const getFreelancerProfile = async (req, res) => {
  try {
    const freelancer = await Freelancer.findById(req.params.id);
    if (!freelancer) return res.status(404).json({ message: "Freelancer not found" });
    // Sort notifications so frontend sees newest first
    freelancer.notifications = (freelancer.notifications || []).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.status(200).json({
      ...freelancer.toObject(),
      name: freelancer.name || `${freelancer.firstname} ${freelancer.lastname}`.trim(),
      profileCompleted: Boolean(freelancer.profileCompleted),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ==============================
   UPDATE FREELANCER PROFILE
============================== */
export const updateFreelancerProfile = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.firstName) updates.firstName = normalizeName(updates.firstName);
    if (updates.lastName) updates.lastName = normalizeName(updates.lastName);
    if (updates.firstname) updates.firstname = normalizeName(updates.firstname);
    if (updates.lastname) updates.lastname = normalizeName(updates.lastname);
    if (updates.email) updates.email = normalizeEmail(updates.email);
    if (updates.name) updates.name = normalizeName(updates.name);
    if (updates.domain) updates.domain = updates.domain.trim();
    if (updates.skills) updates.skills = updates.skills.trim();
    if (updates.description) updates.description = updates.description.trim();
    if (updates.cnicNumber) updates.cnicNumber = updates.cnicNumber.trim();
    if (updates.youtubeUrl) updates.youtubeUrl = updates.youtubeUrl.trim();

    if (updates.name && (!updates.firstname || !updates.lastname)) {
      const parts = normalizeName(updates.name).split(" ");
      updates.firstname = updates.firstname || parts[0] || "";
      updates.lastname = updates.lastname || parts.slice(1).join(" ") || "";
    }

    const nonEmptyTrimmedString = (label) =>
      z.string().trim().min(1, { message: `${label} is required` });

    const updateSchema = z.object({
      firstName: nameSchema("First name").optional(),
      lastName: nameSchema("Last name").optional(),
      firstname: nameSchema("First name").optional(),
      lastname: nameSchema("Last name").optional(),
      name: z
        .string()
        .trim()
        .min(3, { message: "Full name is required" })
        .max(31, { message: "Full name must be at most 31 characters" })
        .regex(/^[A-Za-z]+(?: [A-Za-z]+)+$/, {
          message: "Full name must contain only English letters and single spaces",
        })
        .optional(),
      email: emailSchema.optional(),
      password: passwordSchema.optional(),
      domain: nonEmptyTrimmedString("Domain")
        .max(30, { message: "Domain must be at most 30 characters" })
        .regex(/^[A-Za-z]+(?: [A-Za-z]+)*$/, {
          message: "Domain must contain only English letters and single spaces",
        })
        .optional(),
      skills: nonEmptyTrimmedString("Skills")
        .max(100, { message: "Skills must be at most 100 characters" })
        .regex(/^[A-Za-z]+(?: [A-Za-z]+)*(?:\s*,\s*[A-Za-z]+(?: [A-Za-z]+)*)*$/, {
          message: "Skills must contain only letters and commas (e.g. React, Node, Python)",
        })
        .optional(),
      cnicNumber: z
        .string()
        .trim()
        .regex(/^\d{5}-\d{7}-\d{1}$/, {
          message: "CNIC number must be in 12345-1234567-1 format",
        })
        .optional(),
      status: z.enum(["Available", "Busy"]).optional(),
      description: nonEmptyTrimmedString("Description").max(500, {
        message: "Description must be at most 500 characters",
      }).optional(),
      youtubeUrl: z.string().trim().url({ message: "YouTube URL must be valid" }).optional().or(z.literal("")),
      dob: z.union([z.string().trim().min(1), z.date()]).optional(),
      picture: z.string().trim().optional(),
      cnicImage: z.string().trim().optional(),
      experience: z.string().trim().optional(),
    });

    const validation = updateSchema.safeParse(updates);
    if (!validation.success) {
      return res.status(400).json({ errors: validation.error.issues.map(err => err.message) });
    }

    if (updates.dob && typeof updates.dob === "string") {
      const parsedDob = new Date(updates.dob);
      if (Number.isNaN(parsedDob.getTime())) {
        return res.status(400).json({ message: "Date of birth is invalid" });
      }
      updates.dob = parsedDob;
    }

    if (updates.firstname) updates.firstname = normalizeName(updates.firstname);
    if (updates.lastname) updates.lastname = normalizeName(updates.lastname);
    if (updates.firstname && updates.lastname) {
      updates.name = `${updates.firstname} ${updates.lastname}`.trim();
    }
    updates.profileCompleted = true;

    const updated = await Freelancer.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.status(200).json({
      ...updated.toObject(),
      name: updated.name || `${updated.firstname} ${updated.lastname}`.trim(),
      profileCompleted: Boolean(updated.profileCompleted),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ==============================
   ADD NEW GIG
============================== */
export const addGig = async (req, res) => {
  try {
    const freelancer = await Freelancer.findById(req.params.id);
    if (!freelancer) return res.status(404).json({ message: "Freelancer not found" });

    freelancer.gigs.push(req.body);
    await freelancer.save();

    res.status(200).json({ message: "Gig added successfully", gigs: freelancer.gigs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ==============================
   DELETE A GIG
============================== */
export const deleteGig = async (req, res) => {
  try {
    const freelancer = await Freelancer.findById(req.params.id);
    if (!freelancer) return res.status(404).json({ message: "Freelancer not found" });

    freelancer.gigs = freelancer.gigs.filter(
      (gig) => gig._id.toString() !== req.params.gigId
    );
    await freelancer.save();

    res.status(200).json({ message: "Gig deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ==============================
   ADD ORDER
============================== */
export const addOrder = async (req, res) => {
  try {
    const freelancer = await Freelancer.findById(req.params.id);
    if (!freelancer) return res.status(404).json({ message: "Freelancer not found" });

    freelancer.orders.push(req.body);
    freelancer.earnings += req.body.payment || 0;
    await freelancer.save();

    res.status(200).json({ message: "Order added successfully", orders: freelancer.orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ==============================
   ADD FEEDBACK
============================== */
export const addFeedback = async (req, res) => {
  try {
    const freelancer = await Freelancer.findById(req.params.id);
    if (!freelancer) return res.status(404).json({ message: "Freelancer not found" });

    freelancer.feedbacks.push(req.body);

    // update overall rating
    const totalRatings = freelancer.feedbacks.reduce((acc, fb) => acc + fb.rating, 0);
    freelancer.rating = totalRatings / freelancer.feedbacks.length;

    await freelancer.save();

    res.status(200).json({ message: "Feedback added successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ==============================
   GET DASHBOARD DATA
============================== */
export const getFreelancerDashboard = async (req, res) => {
  try {
    const freelancer = await Freelancer.findById(req.params.id);
    if (!freelancer) return res.status(404).json({ message: "Freelancer not found" });

    const dashboardData = {
      totalGigs: freelancer.gigs.length,
      totalOrders: freelancer.orders.length,
      totalEarnings: freelancer.earnings,
      rating: freelancer.rating.toFixed(1),
      feedbackCount: freelancer.feedbacks.length,
    };

    res.status(200).json(dashboardData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ==============================
   GET RANDOM FREELANCERS
============================== */
export const getRandomFreelancers = async (req, res) => {
  try {
    const { limit = 4 } = req.query;
    const freelancers = await Freelancer.find({}).select('name picture domain description orders rating feedbacks').limit(parseInt(limit) * 3);
    
    const shuffled = freelancers.sort(() => Math.random() - 0.5);
    const randomOnes = shuffled.slice(0, Math.min(parseInt(limit), shuffled.length));
    
    res.status(200).json(randomOnes);
  } catch (error) {
    console.error('❌ Error fetching random freelancers:', error);
    res.status(500).json({ message: error.message });
  }
};


