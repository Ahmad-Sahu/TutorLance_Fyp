import { Complaint } from '../models/Complaint.model.js';
import { Student } from '../models/students.model.js';
import { Tutor } from '../models/tutors.model.js';
import { Freelancer } from '../models/freelancers.model.js';

export const createComplaint = async (req, res) => {
  try {
    const role = req.student ? 'student' : req.tutor ? 'tutor' : req.freelancer ? 'freelancer' : null;
    const userId = req.student?.id || req.tutor?.id || req.freelancer?.id;
    if (!role || !userId) return res.status(401).json({ message: 'Unauthorized' });

    const { message } = req.body;
    if (!message || !message.trim()) return res.status(400).json({ message: 'Message required' });

    let userName = '';
    if (role === 'student') {
      const u = await Student.findById(userId).select('firstName lastName');
      userName = u ? `${u.firstName} ${u.lastName}` : 'Student';
    } else if (role === 'tutor') {
      const u = await Tutor.findById(userId).select('firstName lastName');
      userName = u ? `${u.firstName} ${u.lastName}` : 'Tutor';
    } else {
      const u = await Freelancer.findById(userId).select('firstname lastname');
      userName = u ? `${u.firstname} ${u.lastname}` : 'Freelancer';
    }

    const complaint = await Complaint.create({
      fromRole: role,
      userId,
      userName,
      message: message.trim(),
    });
    res.status(201).json({ message: 'Complaint submitted', complaint });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMyComplaints = async (req, res) => {
  try {
    const role = req.student ? 'student' : req.tutor ? 'tutor' : req.freelancer ? 'freelancer' : null;
    const userId = req.student?.id || req.tutor?.id || req.freelancer?.id;
    if (!role || !userId) return res.status(401).json({ message: 'Unauthorized' });

    const complaints = await Complaint.find({ userId, fromRole: role }).sort({ createdAt: -1 });
    res.status(200).json({ complaints });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    res.status(200).json({ complaints });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminResponse, status } = req.body;
    const complaint = await Complaint.findById(id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    if (adminResponse != null) complaint.adminResponse = adminResponse;
    if (status === 'closed') {
      complaint.status = 'closed';
      complaint.closedAt = new Date();
    }
    await complaint.save();
    res.status(200).json({ message: 'Complaint updated', complaint });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}
