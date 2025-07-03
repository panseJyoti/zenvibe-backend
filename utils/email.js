import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_ID,
    pass: process.env.GMAIL_PASSWORD,
  },
});

// Verification email bhejna
const sendVerificationMail = async (email, token) => {
  const mailOptions = {
    from: process.env.GMAIL_ID,
    to: email,
    subject: 'Verify Your Email - ZenVibe',
    html: `
      <h3>Verify Your Email</h3>
      <p>Click the button below to verify your email:</p>
      <a href="${process.env.SERVER_URL}/verify-email?token=${token}">
        <button style="padding: 10px 20px; background: green; color: white;">Verify</button>
      </a>
    `,
  };
  return transporter.sendMail(mailOptions);
};

// Password reset sent otp
const sendResetPasswordMail = async (email, otp) => {
  const mailOptions = {
    from: process.env.GMAIL_ID,
    to: email,
    subject: 'Reset Your Password - ZenVibe',
    html: `
        <h3>Reset Your Password</h3>
        <p>Your OTP to reset the password is:</p>
        <h2>${otp}</h2>
        <p>This OTP is valid for 10 minutes.</p>
      `,
  };
  return transporter.sendMail(mailOptions);
};

export { sendVerificationMail, sendResetPasswordMail };
