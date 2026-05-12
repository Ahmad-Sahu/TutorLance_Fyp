import dotenv from 'dotenv';
dotenv.config();
import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  console.warn('⚠️ RESEND_API_KEY is missing. Email sending will be disabled.');
}

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export const sendVerificationEmail = async (to, code) => {
  if (!resend) throw new Error('Email service not configured (RESEND_API_KEY missing)');
  const from = process.env.FROM_EMAIL || 'no-reply@tutorlance.com';
  try {
    await resend.emails.send({
      from,
      to,
      subject: 'TutorLance Email Verification Code',
      text: `Your TutorLance verification code is: ${code}\n\nThis code will expire in 10 minutes.`,
    });
  } catch (error) {
    console.warn('⚠️ Failed to send verification email via Resend:', error.message);
    throw new Error('Email sending failed');
  }
};

