import dotenv from 'dotenv';
dotenv.config();
import nodemailer from 'nodemailer';

if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
  console.warn('⚠️ GMAIL_USER or GMAIL_APP_PASSWORD is missing. Email sending will be disabled.');
}

const transporter = process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    })
  : null;

export const sendVerificationEmail = async (to, code) => {
  if (!transporter) throw new Error('Email service not configured (GMAIL credentials missing)');
  try {
    await transporter.sendMail({
      from: `"TutorLance" <${process.env.GMAIL_USER}>`,
      to,
      subject: 'TutorLance Email Verification Code',
      text: `Your TutorLance verification code is: ${code}\n\nThis code will expire in 10 minutes.`,
    });
  } catch (error) {
    console.warn('⚠️ Failed to send verification email:', error.message);
    throw new Error('Email sending failed');
  }
};
