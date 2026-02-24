import {Admin} from '../models/admin.model.js';
import {Tutor} from '../models/tutors.model.js';
import {Student} from '../models/students.model.js';
import {Freelancer} from '../models/freelancers.model.js';
import {Booking} from '../models/Booking.model.js';
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {z} from "zod";



export const signup = async (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    const role = 'admin';

    const signupSchema = z.object({
    firstName: z.string().min(2, { message: "First name must be at least 2 characters long" }).max(100),
    lastName: z.string().min(2, { message: "Last name must be at least 2 characters long" }).max(100),
    email: z.string().email({ message: "Invalid email format" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters long" }).max(100)
});

const validation = signupSchema.safeParse({ firstName, lastName, email, password });
    if (!validation.success) {
        return res.status(400).json({ errors: validation.error.issues.map(err => err.message) });
    }

    try {
        const existingAdmin = await Admin.findOne({ email : email });
        if (existingAdmin) {
            return res.status(400).json({ message: "Admin already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const newAdmin = new Admin({
            role,
            firstName,
            lastName,
            email,
            password : hashedPassword
        });

        await newAdmin.save();
        return res.status(201).json({ message: "Admin registered successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body;

    const loginSchema = z.object({
        email: z.string().email({ message: "Invalid email format" }),
        password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
    });

    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
        return res.status(400).json({ errors: validation.error.issues.map(err => err.message) });
    }

    try {
        const admin = await Admin.findOne({ email: email });
        if (!admin) {
            return res.status(400).json({ success: false, message: "Invalid email or password", role: "admin" });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid email or password", role: "admin" });
        }

        const token = jwt.sign({ id: admin._id, role: "admin" }, process.env.JWT_SECRET || "secret", { expiresIn: "7d" });

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            admin: {
                _id: admin._id,
                name: `${admin.firstName} ${admin.lastName}`,
                firstName: admin.firstName,
                lastName: admin.lastName,
                email: admin.email,
                role: "admin"
            }
        });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
};

// ✅ Get Admin Stats
export const getAdminStats = async (req, res) => {
  try {
    const tutors = await Tutor.countDocuments();
    const students = await Student.countDocuments();
    const freelancers = await Freelancer.countDocuments();
    const bookings = await Booking.countDocuments();
    const completedBookings = await Booking.countDocuments({ status: 'completed' });
    const totalPayments = await Booking.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$proposedPrice' } } }
    ]);

    res.status(200).json({
      tutors,
      students,
      freelancers,
      bookings,
      completedBookings,
      totalPayments: totalPayments[0]?.total || 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during fetching stats" });
  }
};

// ✅ Get All Users
export const getAllUsers = async (req, res) => {
  try {
    const tutors = await Tutor.find().select('-password');
    const students = await Student.find().select('-password');
    const freelancers = await Freelancer.find().select('-password');

    res.status(200).json({
      tutors,
      students,
      freelancers
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during fetching users" });
  }
};

// ✅ Get All Bookings (with status filter optional)
export const getAllBookings = async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};
    const bookings = await Booking.find(query)
      .populate('studentId', 'firstName lastName email')
      .populate('tutorId', 'firstName lastName email profilePicture')
      .sort({ createdAt: -1 });
    res.status(200).json({ bookings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during fetching bookings" });
  }
};

// ✅ Get all tutors with ratings (for admin view)
export const getTutorsWithRatings = async (req, res) => {
  try {
    const tutors = await Tutor.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({ tutors });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Manage User Status
export const manageUserStatus = async (req, res) => {
  try {
    const { userId, role } = req.params;
    const { active } = req.body;

    let Model;
    if (role === 'tutor') Model = Tutor;
    else if (role === 'student') Model = Student;
    else if (role === 'freelancer') Model = Freelancer;
    else return res.status(400).json({ message: "Invalid role" });

    const user = await Model.findByIdAndUpdate(userId, { active }, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "User status updated", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during updating user status" });
  }
};

// ✅ Release Payment (Admin) - release to tutor
export const adminReleasePayment = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId).populate('tutorId');
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.paymentIntentId) {
      const stripe = (await import('stripe')).default(process.env.STRIPE_SECRET_KEY);
      await stripe.paymentIntents.capture(booking.paymentIntentId);
      booking.paymentStatus = 'released';
      if (booking.tutorId) {
        booking.tutorId.earnings = (booking.tutorId.earnings || 0) + booking.proposedPrice;
        await booking.tutorId.save();
      }
      await booking.save();
    }
    res.status(200).json({ message: "Payment released" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during releasing payment" });
  }
};

// ✅ Refund Payment (Admin) - return to student
export const adminRefundPayment = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.paymentIntentId) {
      const stripe = (await import('stripe')).default(process.env.STRIPE_SECRET_KEY);
      await stripe.refunds.create({ payment_intent: booking.paymentIntentId });
      booking.paymentStatus = 'refunded';
      booking.status = 'cancelled';
      await booking.save();
    }
    res.status(200).json({ message: "Payment refunded to student" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during refund" });
  }
};

// ✅ Remove (delete) user
export const removeUser = async (req, res) => {
  try {
    const { role, userId } = req.params;
    let Model;
    if (role === 'tutor') Model = Tutor;
    else if (role === 'student') Model = Student;
    else if (role === 'freelancer') Model = Freelancer;
    else return res.status(400).json({ message: "Invalid role" });

    const user = await Model.findByIdAndDelete(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User removed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};