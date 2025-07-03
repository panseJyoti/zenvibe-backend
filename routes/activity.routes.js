import express from 'express';
import { createActivity, getAllActivities ,updateActivity ,getSingleActivity, deleteActivityById} from '../controllers/activity.controller.js';
import { authenticate, authorizeRoles } from '../middleware/auth.middleware.js';
import upload from '../middleware/uploadImage.middleware.js';

const router = express.Router();

router.post('/add',authenticate,upload.single('image'), authorizeRoles('admin'), createActivity);
router.get('/list',authenticate, authorizeRoles('admin'), getAllActivities);
router.get('/:id',authenticate, authorizeRoles('admin'), getSingleActivity);
router.put('/update/:id',authenticate, authorizeRoles('admin'), upload.single('image'), updateActivity);
router.delete('/delete/:id',authenticate, authorizeRoles('admin'), deleteActivityById);

export default router;
