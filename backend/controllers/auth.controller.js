import bcrypt from "bcryptjs";
import { z } from "zod";
import { Student } from "../models/students.model.js";
import { Tutor } from "../models/tutors.model.js";
import { Freelancer } from "../models/freelancers.model.js";
import { Admin } from "../models/admin.model.js";
import { emailSchema, normalizeEmail, passwordSchema } from "../utils/authValidation.js";

// Handle forgot password for any role
export const forgotPassword = async (req, res) => {
  const schema = z.object({
    role: z.enum(["tutor", "student", "freelancer", "admin"]),
    email: emailSchema,
    newPassword: passwordSchema,
    confirmPassword: passwordSchema,
  });

  const validation = schema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ errors: validation.error.issues.map(i => i.message) });
  }

  let { role, email, newPassword, confirmPassword } = req.body;
  email = normalizeEmail(email);

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  try {
    // choose model
    let Model = null;
    if (role === "student") Model = Student;
    else if (role === "tutor") Model = Tutor;
    else if (role === "freelancer") Model = Freelancer;
    else if (role === "admin") Model = Admin;

    if (!Model) return res.status(400).json({ message: "Invalid role" });

    const user = await Model.findOne({ email });
    if (!user) return res.status(404).json({ message: "No user found with this email" });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    // NOTE: sending the new password by email would be implemented here (SMTP). For now we return success.
    return res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Forgot password error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default { forgotPassword };
