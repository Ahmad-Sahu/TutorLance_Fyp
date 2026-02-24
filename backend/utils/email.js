import nodemailer from 'nodemailer';

let transporter = null;

if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
  console.warn('⚠️ SMTP not fully configured. Email sending is disabled.');
} else {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export const sendVerificationEmail = async (to, code) => {
  if (!transporter) {
    console.warn('⚠️ sendVerificationEmail called but transporter is not configured.');
    throw new Error('Email not configured on server');
  }

  const from = process.env.FROM_EMAIL || process.env.SMTP_USER;

  await transporter.sendMail({
    from,
    to,
    subject: 'TutorLance Email Verification Code',
    text: `Your TutorLance verification code is: ${code}\n\nThis code will expire in 10 minutes.`,
  });
};

