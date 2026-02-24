import {Tutor} from '../models/tutors.model.js';
import { Booking } from '../models/Booking.model.js';
import { Student } from '../models/students.model.js';
import bcrypt from "bcryptjs";
import {z} from "zod";


export const signup = async (req, res) => {
    const {role, firstName, lastName, email, password} = req.body;

    const signupSchema = z.object({
    role: z.enum(["tutor", "student", "freelancer", "admin"]),
    firstName: z.string().min(2,{message : "First name must be at least 2 characters long"}).max(100),
    lastName: z.string().min(2,{message : "Last name must be at least 2 characters long"}).max(100),
    email: z.string().email({message : "Invalid email format"}),
    password: z.string().min(6,{message : "Password must be at least 6 characters long"}).max(100)
});

const validation = signupSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({ errors: validation.error.issues.map(err => err.message) });
    }

    try {
        const existingTutor = await Tutor.findOne({ email });
        if (existingTutor) {
            return res.status(400).json({
                message: "User with this email already exists in tutor role. Please change your email.",
                field: "email",
                role: "tutor"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const newTutor = new Tutor({
            role,
            firstName,
            lastName,
            email,
            password : hashedPassword
        });

        await newTutor.save();
        return res.status(201).json({ message: "Tutor registered successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
}

// export const login = async (req, res) => {
//     const { email, password } = req.body;

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
//         const tutor = await Tutor.findOne({ email: email });
//         if (!tutor) {
//             return res.status(400).json({ message: "Invalid email or password" });
//         }

//         const isMatch = await bcrypt.compare(password, tutor.password);
//         if (!isMatch) {
//             return res.status(400).json({ message: "Invalid email or password" });
//         }

//         return res.status(200).json({ message: "Login successful" });
//     } catch (error) {
//         return res.status(500).json({ message: "Internal server error" });
//     }
// };

import jwt from "jsonwebtoken";

// ✅ Tutor Signup Controller
export const tutorSignup = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Check if tutor already exists
    const existingTutor = await Tutor.findOne({ email });
    if (existingTutor) {
      return res.status(400).json({ message: "Tutor already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create tutor with default values for required fields
    const tutor = await Tutor.create({
      role: "tutor",
      firstName,
      lastName,
      email,
      password: hashedPassword,
      subjects: [], // Will be filled during profile completion
      languages: [], // Will be filled during profile completion
      hourlyRate: 0, // Will be set during profile completion
      availability: [], // Will be set during profile completion
      profileCompleted: false,
    });

    res.status(201).json({ message: "Tutor registered successfully", tutor });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during tutor signup" });
  }
};

// ✅ Tutor Login Controller
export const tutorLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if tutor exists
    const tutor = await Tutor.findOne({ email });
    if (!tutor) {
      return res.status(404).json({ message: "Tutor not found" });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, tutor.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: tutor._id, role: "tutor" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Send response
    res.status(200).json({
      message: "Tutor login successful",
      token,
      tutor: {
        _id: tutor._id,
        firstName: tutor.firstName,
        lastName: tutor.lastName,
        email: tutor.email,
        profileCompleted: tutor.profileCompleted || false,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during tutor login" });
  }
};

// ✅ Get Tutor Profile (Public)
export const getPublicTutorProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const tutor = await Tutor.findById(id).select('-password');
    if (!tutor) {
      return res.status(404).json({ message: "Tutor not found" });
    }
    res.status(200).json({ tutor });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during fetching tutor profile" });
  }
};

// ✅ Get Tutor Profile (Authenticated)
export const getTutorProfile = async (req, res) => {
  try {
    const tutorId = req.tutor.id;
    const tutor = await Tutor.findById(tutorId).select('-password');
    if (!tutor) {
      return res.status(404).json({ message: "Tutor not found" });
    }
    res.status(200).json({ tutor });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during fetching tutor profile" });
  }
};

// ✅ Get all tutors with filters
export const getTutors = async (req, res) => {
  try {
    const { subject, priceMin, priceMax, countryOfBirth, specialities, languages, availability, search } = req.query;

    let query = { profileCompleted: true };

    if (subject) {
      // Case-insensitive match for subjects (student input may vary in casing)
      query.subjects = { $in: [new RegExp(subject, 'i')] };
    }

    if (priceMin || priceMax) {
      query.hourlyRate = {};
      if (priceMin) query.hourlyRate.$gte = parseInt(priceMin);
      if (priceMax) query.hourlyRate.$lte = parseInt(priceMax);
    }

    if (countryOfBirth) {
      query.countryOfBirth = countryOfBirth;
    }

    if (specialities) {
      query.specialities = { $in: specialities.split(',') };
    }

    if (languages) {
      query.languages = { $in: languages.split(',') };
    }

    if (availability) {
      query.availability = { $in: availability.split(',') };
    }

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { subjects: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const tutors = await Tutor.find(query).select('-password');
    res.status(200).json({ tutors });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during fetching tutors" });
  }
};

// ✅ Update Tutor Profile
export const updateTutorProfile = async (req, res) => {
  try {
    const tutorId = req.tutor.id;
    const updates = req.body;

    const tutor = await Tutor.findByIdAndUpdate(tutorId, updates, { new: true });
    if (!tutor) {
      return res.status(404).json({ message: "Tutor not found" });
    }

    res.status(200).json({ message: "Profile updated successfully", tutor });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during updating profile" });
  }
};

// ✅ Get Tutor Bookings
export const getTutorBookings = async (req, res) => {
  try {
    // Defensive check for tutorId
    const tutorId = req.tutor && (req.tutor._id || req.tutor.id) ? (req.tutor._id || req.tutor.id).toString() : null;
    console.log(`[getTutorBookings] tutorId from req.tutor:`, req.tutor);
    if (!tutorId || tutorId === 'null' || tutorId === 'undefined') {
      console.error(`[getTutorBookings] tutorId is missing or invalid:`, tutorId);
      return res.status(400).json({ message: "Tutor ID missing or invalid in token. Please re-login." });
    }
    // Find tutor and get subjects/domains
    const tutor = await Tutor.findById(tutorId);
    if (!tutor) {
      return res.status(404).json({ message: "Tutor not found" });
    }
    // Find only this tutor's bookings (by tutorId)
    const bookings = await Booking.find({ tutorId })
      .populate('studentId', 'firstName lastName email')
      .sort({ createdAt: -1 });
    console.log("✅ Found", bookings.length, "bookings for tutor", tutor.firstName, tutor.lastName);
    bookings.forEach(b => {
      console.log("   - Booking:", b.subject, "by", b.studentId?.firstName || "(NO NAME)", "Price:", b.proposedPrice);
    });
    res.status(200).json({ bookings });
  } catch (error) {
    console.error(`[getTutorBookings] Exception:`, error);
    res.status(500).json({ message: "Server error during fetching bookings", error: error.message });
  }
};

// Public: get bookings for a tutor by tutorId (useful when tutor's token isn't available)
export const getPublicBookingsForTutor = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`[getPublicBookingsForTutor] tutorId param:`, id);
    if (!id || id === 'null' || id === 'undefined') {
      console.error(`[getPublicBookingsForTutor] tutorId param is missing or invalid:`, id);
      return res.status(400).json({ message: "Tutor ID missing or invalid in URL." });
    }
    const bookings = await Booking.find({ tutorId: id }).populate('studentId', 'firstName lastName email');
    console.log(`[getPublicBookingsForTutor] Found ${bookings.length} bookings for tutorId=${id}`);
    res.status(200).json({ bookings });
  } catch (error) {
    console.error('[getPublicBookingsForTutor] Exception:', error);
    res.status(500).json({ message: 'Server error fetching public bookings', error: error.message });
  }
};

// ✅ Negotiate Booking (Tutor Counter Offer)
export const negotiateBooking = async (req, res) => {
  try {
    const tutorId = req.tutor.id;
    const { id } = req.params;
    const { proposedPrice, message } = req.body;

    // Find booking by id and ensure it belongs to this tutor
    const booking = await Booking.findOne({ _id: id, tutorId });
    if (!booking) {
      return res.status(404).json({ message: "Booking not found or not yours" });
    }

    booking.negotiationHistory.push({ from: 'tutor', proposedPrice, message });
    booking.proposedPrice = proposedPrice;
    booking.status = 'negotiating';

    await booking.save();

    // Notify student
    const student = await Student.findById(booking.studentId);
    if (student) {
      student.notifications.push({
        message: `Tutor sent a counter offer for your booking request`,
        createdAt: new Date()
      });
      await student.save();
    }

    res.status(200).json({ message: "Counter offer sent", booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during negotiation" });
  }
};

// ✅ Update Booking Status
export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, counterPrice, classDueBy: classDueByInput } = req.body;
    const tutorId = req.tutor.id;

    // Find booking by id and ensure it belongs to this tutor
    const booking = await Booking.findOne({ _id: id, tutorId });
    if (!booking) {
      return res.status(404).json({ message: "Booking not found or not yours" });
    }

    booking.status = status;
    if (counterPrice) {
      booking.negotiationHistory.push({
        from: 'tutor',
        proposedPrice: counterPrice,
        message: 'Counter offer from tutor'
      });
      booking.proposedPrice = counterPrice;
    }
    if (status === 'confirmed' && !booking.classDueBy) {
      if (classDueByInput) {
        booking.classDueBy = new Date(classDueByInput);
      } else {
        const d = new Date();
        d.setDate(d.getDate() + 7);
        booking.classDueBy = d;
      }
    }

    await booking.save();

    // Notify student
    const student = await Student.findById(booking.studentId);
    if (student) {
      student.notifications.push({ message: `Tutor updated booking status to ${status}` });
      await student.save();
    }

    res.status(200).json({ message: "Booking updated", booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during updating booking" });
  }
};

// ✅ Create Session (link + deadline; after deadline unpaid/not-completed can be refunded)
export const createSession = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { link, sessionLinkDeadline } = req.body;
    const tutorId = req.tutor.id;

    const booking = await Booking.findOne({ _id: bookingId, tutorId, status: 'confirmed' });
    if (!booking) {
      return res.status(404).json({ message: "Booking not found or not confirmed" });
    }

    booking.sessionLink = link;
    booking.sessionScheduledAt = new Date();
    if (sessionLinkDeadline) booking.sessionLinkDeadline = new Date(sessionLinkDeadline);
    await booking.save();

    const student = await Student.findById(booking.studentId);
    if (student) {
      student.notifications.push({
        message: `Your tutor created a class/lesson. Join here: ${link}`,
        read: false,
        createdAt: new Date()
      });
      await student.save();
    }

    res.status(200).json({ message: "Session link sent to student", booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during creating session" });
  }
};

// ✅ Mark Session Done
export const markSessionDone = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const tutorId = req.tutor.id;

    const booking = await Booking.findOne({ _id: bookingId, tutorId });
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.tutorMarkedDone = true;
    if (booking.studentMarkedDone) {
      booking.status = 'completed';
      booking.sessionCompletedAt = new Date();
      // Release payment
      booking.paymentStatus = 'released';
      const tutor = await Tutor.findById(tutorId);
      tutor.earnings += booking.proposedPrice;
      tutor.deliveredSessions += 1;
      await tutor.save();
    }
    await booking.save();

    res.status(200).json({ message: "Session marked done", booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during marking session done" });
  }
};

// ✅ Withdraw Earnings
export const withdrawEarnings = async (req, res) => {
  try {
    const tutorId = req.tutor.id;
    const tutor = await Tutor.findById(tutorId);
    if (!tutor) {
      return res.status(404).json({ message: "Tutor not found" });
    }

    // Implement Stripe payout here
    // For now, just reset earnings
    tutor.earnings = 0;
    await tutor.save();

    res.status(200).json({ message: "Earnings withdrawn" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during withdrawing earnings" });
  }
};
