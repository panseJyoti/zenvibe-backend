import express from 'express';
import { getAllSuggestion } from '../controllers/suggestion.Controller.js';
import { authenticate, authorizeRoles} from '../middleware/auth.middleware.js';

const router = express.Router();
//get all suggestion
router.get('/viwe',authenticate, authorizeRoles('user'), getAllSuggestion);
export default router;
