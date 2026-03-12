import dotenv from 'dotenv';
dotenv.config();
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendOtpEmail = async (to, code) => {
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
