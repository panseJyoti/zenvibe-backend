import express from 'express';
import { register, login,verifyEmail,forgotPassword,verifyOtp,resetPassword } from '../controllers/auth.controller.js';

const router = express.Router();

router.post("/register", register);
router.get("/verify-email", verifyEmail);
router.post("/login", login);

router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);

export default router;
