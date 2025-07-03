import express from 'express';
import { createMood,deleteMood, getAllMoods,restoreMood } from '../controllers/mood.controller.js';
import { authenticate, authorizeRoles } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/add',authenticate, authorizeRoles('admin'), createMood);
router.delete('/delete/:moodId',authenticate, authorizeRoles('admin'), deleteMood);
router.get('/list',authenticate, authorizeRoles('admin'), getAllMoods);
router.patch('/restore/:moodId',authenticate, authorizeRoles('admin'), restoreMood);

export default router;
