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
import { sendVerificationEmail } from "../utils/email.js";
const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();
dotenv.config();

/* ==============================
   REGISTER FREELANCER
============================== */
export const registerFreelancer = async (req, res) => {
  try {
    // Accept both formats: (firstName + lastName) or (name)
    let { name, email, password, skills, experience, firstName, lastName } = req.body;
    
    // If firstName and lastName provided, combine them into name
    if (!name && firstName && lastName) {
      name = `${firstName} ${lastName}`;
    }
    
    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }
    
    const existing = await Freelancer.findOne({ email });
    if (existing) {
      return res.status(400).json({
        message: "Freelancer with this email already exists. Please login or use a different email.",
        field: "email",
        role: "freelancer"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const code = generateCode();
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    const newFreelancer = new Freelancer({
      firstname: firstName || name.split(" ")[0] || name,
      lastname: lastName || name.split(" ").slice(1).join(" ") || "",
      name,
      email,
      password: hashedPassword,
      skills,
      experience,
      isEmailVerified: false,
      emailVerificationCode: code,
      emailVerificationExpires: expires,
    });

    await newFreelancer.save();

    try {
      await sendVerificationEmail(email, code);
    } catch (e) {
      console.warn("⚠️ Failed to send verification email to freelancer:", e.message);
    }

    // Return the created freelancer so frontend can redirect and store id
    res.status(201).json({ message: "Freelancer registered. Please verify your email with the OTP sent.", freelancer: newFreelancer, requiresEmailVerification: true });
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
    const { email, password } = req.body;
    const freelancer = await Freelancer.findOne({ email });
    if (!freelancer) return res.status(404).json({ message: "No freelancer found with this email. Please check your credentials or sign up first.", field: "email", role: "freelancer" });

    if (!freelancer.isEmailVerified) {
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
      freelancer,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Verify freelancer email with OTP
export const verifyFreelancerEmail = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ message: "Email and code are required" });
    }

    const freelancer = await Freelancer.findOne({ email });
    if (!freelancer) return res.status(404).json({ message: "Freelancer not found" });

    if (freelancer.isEmailVerified) {
      return res.status(200).json({ message: "Email already verified" });
    }

    if (!freelancer.emailVerificationCode || !freelancer.emailVerificationExpires) {
      return res.status(400).json({ message: "No verification code found. Please sign up again." });
    }

    if (freelancer.emailVerificationExpires < new Date()) {
      return res.status(400).json({ message: "Verification code has expired. Please sign up again." });
    }

    if (freelancer.emailVerificationCode !== code) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    freelancer.isEmailVerified = true;
    freelancer.emailVerificationCode = undefined;
    freelancer.emailVerificationExpires = undefined;
    await freelancer.save();

    return res.status(200).json({ message: "Email verified successfully" });
  } catch (err) {
    console.error("verifyFreelancerEmail error:", err);
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
    res.status(200).json(freelancer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ==============================
   UPDATE FREELANCER PROFILE
============================== */
export const updateFreelancerProfile = async (req, res) => {
  try {
    const updated = await Freelancer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updated);
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


