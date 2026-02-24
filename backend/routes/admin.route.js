import express from "express";
import { login, signup, getAdminStats, getAllUsers, getAllBookings, getTutorsWithRatings, manageUserStatus, adminReleasePayment, adminRefundPayment, removeUser } from "../controllers/admin.controller.js";
import { authenticateAdmin } from "../middleware/auth.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

router.get("/stats", authenticateAdmin, getAdminStats);
router.get("/users", authenticateAdmin, getAllUsers);
router.get("/bookings", authenticateAdmin, getAllBookings);
router.get("/tutors-ratings", authenticateAdmin, getTutorsWithRatings);
router.put("/users/:role/:userId/status", authenticateAdmin, manageUserStatus);
router.delete("/users/:role/:userId", authenticateAdmin, removeUser);
router.post("/payments/release/:bookingId", authenticateAdmin, adminReleasePayment);
router.post("/payments/refund/:bookingId", authenticateAdmin, adminRefundPayment);

export default router;
