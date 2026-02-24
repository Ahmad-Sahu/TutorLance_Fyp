import mongoose from 'mongoose';
import { Tutor } from './models/tutors.model.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const createTestTutor = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const hashedPassword = await bcrypt.hash('password123', 10);

    const testTutor = new Tutor({
      role: 'tutor',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: hashedPassword,
      subjects: ['Mathematics', 'Physics'],
      hourlyRate: 1500,
      countryOfBirth: 'Pakistan',
      specialities: ['Beginner', 'Advanced'],
      languages: ['English', 'Urdu'],
      availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      bio: 'Experienced math tutor with 5 years of teaching experience',
      profileCompleted: true,
      averageRating: 4.5,
      reviews: [],
      notifications: [],
      earnings: 0,
      deliveredSessions: 0
    });

    await testTutor.save();
    console.log('Test tutor created successfully');
  } catch (error) {
    console.error('Error creating test tutor:', error);
  } finally {
    mongoose.connection.close();
  }
};

createTestTutor();