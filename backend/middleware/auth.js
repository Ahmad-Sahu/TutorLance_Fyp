import jwt from "jsonwebtoken";
import { Tutor } from "../models/tutors.model.js";
import { Student } from "../models/students.model.js";
import { Admin } from "../models/admin.model.js";
import { Freelancer } from "../models/freelancers.model.js";

export const authenticateTutor = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "tutor") {
      return res.status(403).json({ message: "Access denied. Not a tutor." });
    }
    const tutor = await Tutor.findById(decoded.id);
    if (!tutor) {
      return res.status(404).json({ message: "Tutor not found." });
    }
    req.tutor = tutor;
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid token." });
  }
};

export const authenticateStudent = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "student") {
      return res.status(403).json({ message: "Access denied. Not a student." });
    }
    const student = await Student.findById(decoded.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }
    req.student = student;
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid token." });
  }
};

export const authenticateAdmin = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Not an admin." });
    }
    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found." });
    }
    req.admin = admin;
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid token." });
  }
};

export const authenticateStudentOrTutorOrFreelancer = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ message: "Access denied. No token provided." });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role === "student") {
      const user = await Student.findById(decoded.id);
      if (!user) return res.status(404).json({ message: "User not found." });
      req.student = user;
    } else if (decoded.role === "tutor") {
      const user = await Tutor.findById(decoded.id);
      if (!user) return res.status(404).json({ message: "User not found." });
      req.tutor = user;
    } else if (decoded.role === "freelancer") {
      const user = await Freelancer.findById(decoded.id);
      if (!user) return res.status(404).json({ message: "User not found." });
      req.freelancer = user;
    } else {
      return res.status(403).json({ message: "Access denied." });
    }
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid token." });
  }
};