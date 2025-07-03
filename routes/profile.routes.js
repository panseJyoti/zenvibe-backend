import express from 'express';
import upload from '../middleware/uploadImage.middleware.js';
import { createOrUpdateProfile,uploadProfileImage,deleteProfile,viewProfile } from '../controllers/createProfile.controller.js';
import { authenticate, authorizeRoles } from '../middleware/auth.middleware.js';
const router = express.Router();

router.put('/create', authenticate, authorizeRoles('user', 'admin'), createOrUpdateProfile);
router.delete('/delete', authenticate, authorizeRoles('user', 'admin'), deleteProfile);
router.put('/upload-profile-image', authenticate, authorizeRoles('user', 'admin'), upload.single('profileImage'), uploadProfileImage);
router.get('/viewprofile', authenticate, authorizeRoles('user', 'admin'), viewProfile);

export default router;
