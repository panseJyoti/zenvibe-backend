import dotenv from 'dotenv';
dotenv.config();
import User from '../models/user.model.js';
import crypto from "crypto";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendVerificationMail, sendResetPasswordMail } from '../utils/email.js';

// Password Reset Request 
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found" });
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
    user.resetToken = otpHash;
    user.resetTokenExpiration = Date.now() + 600000;
    await user.save();
    await sendResetPasswordMail(email, otp);
    res.status(200).json({ msg: "Password reset OTP sent!" });
  } catch (err) {
    res.status(500).json({ msg: "Error during password reset", error: err.message });
  }
};

// OTP Verification 
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    console.log(email);
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found" });
    if (user.resetTokenExpiration < Date.now()) {
      return res.status(400).json({ msg: "OTP expired" });
    }
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");
    if (user.resetToken !== hashedOtp) {
      return res.status(400).json({ msg: "Invalid OTP" });
    }
    const resetToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "10m" });
    res.status(200).json({ msg: "OTP verified", resetToken });
  } catch (err) {
    res.status(500).json({ msg: "Error verifying OTP", error: err.message });
  }
};

// New Password Set 
export const resetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    console.log(newPassword);
    const token = req.headers.authorization?.split(" ")[1];
    console.log(token);
    if (!token) return res.status(401).json({ msg: "No token provided" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { email } = decoded;
    console.log(email);
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found" });
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();
    res.status(200).json({ msg: "Password reset successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Error resetting password", error: err.message });
  }
};

//register 
export const register = async (req, res) => {
  try {
    const { username, email, password, isGoogle, role = "user" } = req.body;

    const userExists = await User.findOne({ email });

    if (isGoogle) {
      let user = userExists;

      if (!user) {
       
        user = await User.create({
          username,
          email,
          password,
          verified: true,
          role,
        });
      } else {
        if (!user.verified) {
          user.verified = true;
          await user.save();
        }
      }

      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.status(200).json({
        msg: 'Google login successful',
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          verified: user.verified
        }
      });
    }

  
    if (userExists) return res.status(400).json({ msg: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);

   
    const tokenMail = jwt.sign(
      { username, email, password: hashed, role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const emailSent = await sendVerificationMail(email, tokenMail);

    if (!emailSent?.accepted?.length) {
      return res.status(500).json({ msg: 'Verification email failed' });
    }

    return res.status(200).json({ msg: 'Verification email sent.' });

  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ msg: 'Error during registration', error: err.message });
  }
};


// Email Verification Controller
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    console.log('🔍 Incoming verify token:', token);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded payload:", decoded);
    console.log("Redirecting to:", `${process.env.CLIENT_URL}/verify-email?status=success&msg=verified`);

    const { username, email, password, role } = decoded;

    const userExists = await User.findOne({ email });

    if (userExists) {
      if (!userExists.verified) {
        userExists.verified = true;
        await userExists.save();
        return res.redirect(`${process.env.CLIENT_URL}/verify-email?status=success&msg=verified`);
      } else {
        return res.redirect(`${process.env.CLIENT_URL}/verify-email?status=already&msg=already_verified`);
      }
    }

    await User.create({
      username,
      email,
      password,
      role: role || 'user',
      verified: true
    });

    return res.redirect(`${process.env.CLIENT_URL}/verify-email?status=success&msg=user_created`);
  } catch (err) {
     console.error(" Email verification failed:", err.message);
    return res.redirect(`${process.env.CLIENT_URL}/verify-email?status=failed&msg=invalid_token`);
  }
};

//  Login Controller
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ msg: "User not found" });
    if (!user.verified) return res.status(403).json({ msg: "Please verify your email first" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      msg: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        verified: user.verified
      }
    });

  } catch (err) {
    res.status(500).json({ msg: "Login failed", error: err.message });
  }
};
