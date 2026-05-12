import dotenv from 'dotenv';
dotenv.config();
import nodemailer from 'nodemailer';

const transporter = process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    })
  : null;

if (!transporter) {
  console.warn('⚠️ GMAIL_USER or GMAIL_APP_PASSWORD not set — OTP emails will be skipped.');
}

export const sendOtpEmail = async (to, code) => {
  if (!transporter) {
    console.warn('⚠️ Email not configured — skipping OTP email to', to);
    return false;
  }
  try {
    await transporter.sendMail({
      from: `"TutorLance" <${process.env.GMAIL_USER}>`,
      to,
      subject: 'TutorLance Email Verification Code',
      text: `Your TutorLance verification code is: ${code}\n\nThis code will expire in 10 minutes.`,
    });
    console.log(`OTP email sent to ${to}`);
    return true;
  } catch (error) {
    console.error('⚠️ Failed to send OTP email:', error.message);
    return false;
  }
};
