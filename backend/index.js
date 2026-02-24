import express from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import cors from 'cors'
import studentRoutes from './routes/students.route.js'
import tutorsRoutes from './routes/tutors.route.js'
import freelancersRoutes from './routes/freelancers.route.js'
import adminRoutes from './routes/admin.route.js'
import authRoutes from './routes/auth.route.js'
import student_GigRoutes from "./routes/Student_Gig.route.js";
import gigOfferRoutes from "./routes/GigOffer.route.js";
import paymentRoutes from './routes/payment.route.js';
import bookingsRoutes from './routes/bookings.route.js';
import complaintRoutes from './routes/complaint.route.js';

dotenv.config()

const app = express()
app.use(express.json())

// Startup environment warnings
if (!process.env.MONGO_URI) console.warn("⚠️ MONGO_URI not set. MongoDB connection may fail.");
if (!process.env.STRIPE_SECRET_KEY) console.warn("⚠️ STRIPE_SECRET_KEY not set. Stripe payments will be disabled.");

app.use(
  cors({
    origin: function (origin, callback) {
      // Development convenience: allow any localhost origin (any port)
      // and allow the configured FRONTEND_URL. In production, FRONTEND_URL
      // should be set to the real hostname and this code will still allow it.
      if (!origin) return callback(null, true); // non-browser requests

      try {
        const url = new URL(origin);
        const isLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
        if (isLocalhost) return callback(null, true);
      } catch (e) {
        // If origin isn't a valid URL we'll fall back to explicit match below
      }

      // Fallback: allow exact FRONTEND_URL match
      if (origin === process.env.FRONTEND_URL) return callback(null, true);

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// app.use(cors({
//     origin: process.env.FRONTEND_URL
// }))

const port = process.env.PORT || 3000

const DB_URI = process.env.MONGO_URI

// Start server after attempting to connect to DB (if configured). If DB fails, we still start server but warn.
const start = async () => {
  console.log(`Starting backend. PORT=${port}, MONGO_URI=${!!DB_URI}, STRIPE=${!!process.env.STRIPE_SECRET_KEY}`);
  try {
    if (DB_URI) {
      await mongoose.connect(DB_URI);
      console.log("Connected to MongoDB successfully");
    } else {
      console.warn("⚠️ MONGO_URI not set. Server will run but database operations will fail.");
    }
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }

  app.use("/api/v1/students", studentRoutes);
  app.use("/api/v1/tutors", tutorsRoutes);
  app.use("/api/v1/freelancers", freelancersRoutes);
  app.use("/api/v1/admin", adminRoutes);
  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1/student-gigs", student_GigRoutes);
  app.use("/api/v1/gig-offers", gigOfferRoutes);
  app.use("/api/v1/payments", paymentRoutes);
  app.use("/api/bookings", bookingsRoutes);
  app.use("/api/v1/complaints", complaintRoutes);

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
  });
};

start();