import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

// ✅ Checks if token is valid
export const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ msg: 'Unauthorized: No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ msg: 'Unauthorized: User not found' });
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Invalid token', error: err.message });
  }
}
  
  // ✅ Checks if user's role matches required roles
  export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ msg: 'Access denied: insufficient role' });
      }
      next();
    };
  };