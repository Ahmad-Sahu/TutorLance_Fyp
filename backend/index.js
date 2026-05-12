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

import dns from 'dns';
dns.setServers(["1.1.1.1", "8.8.8.8"]);

dotenv.config()

const app = express()
app.use(express.json())

// Startup environment warnings
if (!process.env.MONGO_URI) console.warn("⚠️ MONGO_URI not set. MongoDB connection may fail.");
if (!process.env.STRIPE_SECRET_KEY) console.warn("⚠️ STRIPE_SECRET_KEY not set. Stripe payments will be disabled.");

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // non-browser / server-to-server requests

    try {
      const url = new URL(origin);
      const isLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
      if (isLocalhost) return callback(null, true);
    } catch (e) {}

    if (origin === process.env.FRONTEND_URL) return callback(null, true);

    // Do not throw — return false so the cors package sends a proper rejection
    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Handle preflight OPTIONS requests on all routes before anything else
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

// Lazy MongoDB connection — reuses the connection across serverless invocations
let dbConnected = false;
const connectDB = async () => {
  if (dbConnected || mongoose.connection.readyState === 1) return;
  if (process.env.MONGO_URI) {
    await mongoose.connect(process.env.MONGO_URI);
    dbConnected = true;
    console.log("Connected to MongoDB successfully");
  } else {
    console.warn("⚠️ MONGO_URI not set. Server will run but database operations will fail.");
  }
};

app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
  next();
});

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

// Only bind to a port when running locally (not in Vercel serverless)
if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 3000;
  console.log(`Starting backend. PORT=${port}, MONGO_URI=${!!process.env.MONGO_URI}, STRIPE=${!!process.env.STRIPE_SECRET_KEY}`);
  connectDB().catch((err) => console.error("Error connecting to MongoDB:", err));
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
  });
}

export default app;
