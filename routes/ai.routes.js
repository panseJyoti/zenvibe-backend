import express from 'express';
import { suggestActivityBasedOnMood } from '../controllers/aiSuggestion.Controller.js';
import { authenticate, authorizeRoles } from '../middleware/auth.middleware.js';
const router = express.Router();

router.post('/suggest-activity',authenticate,authorizeRoles('user'), suggestActivityBasedOnMood);

export default router;
