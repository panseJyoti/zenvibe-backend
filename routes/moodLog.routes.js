import express from 'express';
import { logMoodAndGetSuggestions ,getMoodHistory,getMoodAnalytics,getAllMoods,getMoodLogsByDate } from '../controllers/moodLog.controller.js';
import { authenticate, authorizeRoles } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/log', authenticate, authorizeRoles('user'),logMoodAndGetSuggestions);        
router.get('/history', authenticate, authorizeRoles('user'), getMoodHistory);     
router.get('/mood-analytics', authenticate, authorizeRoles('user'), getMoodAnalytics); 
router.get('/user-moods',authenticate, authorizeRoles('user'),getAllMoods);
router.get('/calendar/by-date',authenticate,authorizeRoles('user'), getMoodLogsByDate);
export default router;
