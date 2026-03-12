import dotenv from 'dotenv';
dotenv.config();
import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  console.error('❌ RESEND_API_KEY is missing from environment. Check .env and dotenv config.');
  throw new Error('RESEND_API_KEY missing');
}
console.log('✅ RESEND_API_KEY loaded:', process.env.RESEND_API_KEY);

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = async (to, code) => {
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

