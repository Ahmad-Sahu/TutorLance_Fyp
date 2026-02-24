import {Student} from '../models/students.model.js';
import {Tutor} from '../models/tutors.model.js';
import {Booking} from '../models/Booking.model.js';
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {z} from "zod";
import { sendVerificationEmail } from "../utils/email.js";

const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

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
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({
        message: "Student with this email already exists. Please login or use a different email.",
        field: "email",
        role: "student"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const code = generateCode();
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    const newStudent = new Student({
      role,
      firstName,
      lastName,
      email,
      password: hashedPassword,
      isEmailVerified: false,
      emailVerificationCode: code,
      emailVerificationExpires: expires,
    });

    await newStudent.save();

    try {
      await sendVerificationEmail(email, code);
    } catch (e) {
      console.warn("⚠️ Failed to send verification email to student:", e.message);
    }

    return res.status(201).json({
      message: "Student registered. Please verify your email with the OTP sent.",
      requiresEmailVerification: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const student = await Student.findOne({ email });
        if (!student) {
            return res.status(400).json({ success: false, message: "No student found with this email. Please check your credentials or sign up first.", field: "email", role: "student" });
        }

        if (!student.isEmailVerified) {
            return res.status(403).json({
                success: false,
                message: "Please verify your email before logging in.",
                field: "email",
                role: "student",
            });
        }

        const isMatch = await bcrypt.compare(password, student.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Incorrect password. Please try again.", field: "password", role: "student" });
        }

        // Create JWT token
        const token = jwt.sign(
            { id: student._id, role: "student" },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            student: {
                _id: student._id,
                name: `${student.firstName} ${student.lastName}`,
                firstName: student.firstName,
                lastName: student.lastName,
                email: student.email,
                role: "student"
            }
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// ✅ Verify student email with OTP
export const verifyStudentEmail = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ message: "Email and code are required" });
    }

    const student = await Student.findOne({ email });
    if (!student) return res.status(404).json({ message: "Student not found" });

    if (student.isEmailVerified) {
      return res.status(200).json({ message: "Email already verified" });
    }

    if (!student.emailVerificationCode || !student.emailVerificationExpires) {
      return res.status(400).json({ message: "No verification code found. Please sign up again." });
    }

    if (student.emailVerificationExpires < new Date()) {
      return res.status(400).json({ message: "Verification code has expired. Please sign up again." });
    }

    if (student.emailVerificationCode !== code) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    student.isEmailVerified = true;
    student.emailVerificationCode = undefined;
    student.emailVerificationExpires = undefined;
    await student.save();

    return res.status(200).json({ message: "Email verified successfully" });
  } catch (err) {
    console.error("verifyStudentEmail error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Get student notifications
export const getNotifications = async (req, res) => {
    try {
        const { studentId } = req.query;
        if (!studentId) return res.status(400).json({ message: "studentId query parameter is required" });

        const student = await Student.findById(studentId).lean();
        if (!student) return res.status(404).json({ message: "Student not found" });

        const notifications = (student.notifications || []).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
        res.status(200).json({ notifications });
    } catch (err) {
        console.error("❌ Error fetching notifications:", err);
        res.status(500).json({ message: "Error fetching notifications" });
    }
};


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
//         const student = await Student.findOne({ email: email });
//         if (!student) {
//             return res.status(400).json({ message: "Invalid email or password" });
//         }

//         const isMatch = await bcrypt.compare(password, student.password);
//         if (!isMatch) {
//             return res.status(400).json({ message: "Invalid email or password" });
//         }

//         return res.status(200).json({ message: "Login successful" });
//     } catch (error) {
//         return res.status(500).json({ message: "Internal server error" });
//     }
// };

// ✅ Get Student Profile
export const getStudentProfile = async (req, res) => {
  try {
    const studentId = req.student.id;
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.status(200).json({ student });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during fetching student profile" });
  }
};

// ✅ Update Student Profile
export const updateStudentProfile = async (req, res) => {
  try {
    const studentId = req.student.id;
    const updates = req.body;

    const student = await Student.findByIdAndUpdate(studentId, updates, { new: true });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json({ message: "Profile updated successfully", student });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during updating profile" });
  }
};

// ✅ Create Booking
export const createBooking = async (req, res) => {
  try {
    const studentId = req.student.id;
    const { tutorId, subject, topicDescription, proposedPrice, proposedDate, proposedDay, proposedTime, message } = req.body;

    const tutor = await Tutor.findById(tutorId);
    if (!tutor) {
      return res.status(404).json({ message: "Tutor not found" });
    }

    const newBooking = new Booking({
      studentId,
      tutorId,
      subject,
      topicDescription,
      proposedPrice,
      proposedDate,
      proposedDay,
      proposedTime,
      negotiationHistory: [{ from: 'student', proposedPrice, message }]
    });

    await newBooking.save();

    // Notify tutor
    tutor.notifications.push({
      message: `New booking request from student for ${subject}`,
      createdAt: new Date()
    });
    await tutor.save();

    console.log(`New booking created: id=${newBooking._id} tutor=${tutorId} student=${studentId} subject=${subject} price=${proposedPrice}`);

    res.status(201).json({ message: "Booking request sent successfully", booking: newBooking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during creating booking" });
  }
};

// ✅ Negotiate Booking
export const negotiateBooking = async (req, res) => {
  try {
    const studentId = req.student.id;
    const { id } = req.params;
    const { proposedPrice, message } = req.body;

    const booking = await Booking.findOne({ _id: id, studentId });
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.negotiationHistory.push({ from: 'student', proposedPrice, message });
    booking.proposedPrice = proposedPrice;
    booking.status = 'negotiating';

    await booking.save();

    // Notify tutor
    const tutor = await Tutor.findById(booking.tutorId);
    if (tutor) {
      tutor.notifications.push({ message: `Student negotiated booking` });
      await tutor.save();
    }

    res.status(200).json({ message: "Negotiation sent", booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during negotiation" });
  }
};

// ✅ Confirm Booking
export const confirmBooking = async (req, res) => {
  try {
    const studentId = req.student.id;
    const { id } = req.params;

    const booking = await Booking.findOne({ _id: id, studentId });
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.status = 'confirmed';
    await booking.save();

    // Notify tutor
    const tutor = await Tutor.findById(booking.tutorId);
    if (tutor) {
      tutor.notifications.push({ message: `Student confirmed booking` });
      await tutor.save();
    }

    res.status(200).json({ message: "Booking confirmed", booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during confirming booking" });
  }
};

// ✅ Cancel Booking
export const cancelBooking = async (req, res) => {
  try {
    const studentId = req.student.id;
    const { id } = req.params;

    const booking = await Booking.findOne({ _id: id, studentId });
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.status = 'cancelled';
    await booking.save();

    // Notify tutor
    const tutor = await Tutor.findById(booking.tutorId);
    if (tutor) {
      tutor.notifications.push({ message: `Student cancelled booking` });
      await tutor.save();
    }

    res.status(200).json({ message: "Booking cancelled", booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during cancelling booking" });
  }
};

// ✅ Rate Tutor
export const rateTutor = async (req, res) => {
  try {
    const studentId = req.student.id;
    const { bookingId } = req.params;
    const { rating, review } = req.body;

    const booking = await Booking.findOne({ _id: bookingId, studentId, status: 'completed' });
    if (!booking) {
      return res.status(404).json({ message: "Booking not found or not completed" });
    }
    if (booking.rating != null) {
      return res.status(400).json({ message: "You have already rated this booking" });
    }

    booking.rating = rating;
    booking.review = review;
    await booking.save();

    const tutor = await Tutor.findById(booking.tutorId);
    if (tutor) {
      const student = await Student.findById(studentId);
      const studentName = student ? `${student.firstName || ''} ${student.lastName || ''}`.trim() : 'Student';
      const allRatings = await Booking.find({ tutorId: booking.tutorId, rating: { $exists: true, $ne: null } }).select('rating');
      const avgRating = allRatings.length ? allRatings.reduce((sum, b) => sum + b.rating, 0) / allRatings.length : rating;
      tutor.averageRating = Math.round(avgRating * 10) / 10;
      tutor.totalReviews = (tutor.totalReviews || 0) + 1;
      tutor.ratings = tutor.ratings || [];
      tutor.ratings.push({ studentId, studentName, rating, review });
      await tutor.save();
    }

    res.status(200).json({ message: "Rating submitted", booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during rating" });
  }
};

// ✅ Mark Session Done
export const markSessionDone = async (req, res) => {
  try {
    const studentId = req.student.id;
    const { bookingId } = req.params;

    const booking = await Booking.findOne({ _id: bookingId, studentId });
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.studentMarkedDone = true;
    if (booking.tutorMarkedDone) {
      booking.status = 'completed';
      booking.sessionCompletedAt = new Date();
      // Release payment
      booking.paymentStatus = 'released';
      const tutor = await Tutor.findById(booking.tutorId);
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

// ✅ Get Student Bookings
export const getStudentBookings = async (req, res) => {
  try {
    const studentId = req.student.id;
    const bookings = await Booking.find({ studentId }).populate('tutorId', 'firstName lastName email profilePicture');
    res.status(200).json({ bookings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during fetching bookings" });
  }
};

// ✅ Save Tutor (add to saved list)
export const saveTutor = async (req, res) => {
  try {
    const studentId = req.student.id;
    const { tutorId } = req.body;
    if (!tutorId) return res.status(400).json({ message: "tutorId required" });
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });
    student.savedTutors = student.savedTutors || [];
    if (student.savedTutors.some(id => id.toString() === tutorId)) {
      return res.status(200).json({ message: "Already saved", savedTutors: student.savedTutors });
    }
    student.savedTutors.push(tutorId);
    await student.save();
    res.status(200).json({ message: "Tutor saved", savedTutors: student.savedTutors });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Unsave Tutor
export const unsaveTutor = async (req, res) => {
  try {
    const studentId = req.student.id;
    const { tutorId } = req.params;
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });
    student.savedTutors = (student.savedTutors || []).filter(id => id.toString() !== tutorId);
    await student.save();
    res.status(200).json({ message: "Tutor removed from saved", savedTutors: student.savedTutors });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get Saved Tutors
export const getSavedTutors = async (req, res) => {
  try {
    const studentId = req.student.id;
    const student = await Student.findById(studentId).populate('savedTutors', 'firstName lastName email profilePicture subjects hourlyRate');
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.status(200).json({ savedTutors: student.savedTutors || [] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};