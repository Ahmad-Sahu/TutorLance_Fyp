import dotenv from 'dotenv';
dotenv.config();
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export const sendOtpEmail = async (to, code) => {
  if (!resend) {
    console.warn('⚠️ RESEND_API_KEY not set — skipping OTP email.');
    return false;
  }
  const from = process.env.FROM_EMAIL || 'no-reply@tutorlance.com';
  try {
    const result = await resend.emails.send({
      from,
      to,
      subject: 'TutorLance Email Verification Code',
      text: `Your TutorLance verification code is: ${code}\n\nThis code will expire in 10 minutes.`,
    });
    console.log('Resend email result:', result);
    return true;
  } catch (error) {
    console.error('⚠️ Failed to send verification email via Resend:', error);
    return false;
  }
};
