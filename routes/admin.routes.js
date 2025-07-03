import express from 'express';
import { getAllUsers,getUserMoodLogs,getUserById } from '../controllers/admin.controller.js';
import { authenticate, authorizeRoles } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/users', authenticate, authorizeRoles('admin'), getAllUsers);
router.get('/users/:userId', authenticate, authorizeRoles('admin'), getUserById); 
router.get('/users/moodlogs/:userId', authenticate, authorizeRoles('admin'), getUserMoodLogs);

export default router;
