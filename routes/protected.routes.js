import express from 'express';
import { authenticate, authorizeRoles } from '../middleware/auth.middleware.js';

const router = express.Router();

// Admin-only route
router.get('/admin/dashboard', authenticate, authorizeRoles('admin'), (req, res) => {
  res.json({ msg: `Welcome Admin ${req.user.username}`, user: req.user });
});

// User-only route
router.get('/user/dashboard', authenticate, authorizeRoles('user'), (req, res) => {
    res.json({ msg: `Welcome User ${req.user.username}`, user: req.user });
  });

export default router;
