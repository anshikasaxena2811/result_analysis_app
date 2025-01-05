import jwt from 'jsonwebtoken';
import { createError } from '../utils/error.js';
import User from '../models/User.js';

// Protect routes
export const protect = async (req, res, next) => {
  try {
    // Get token from cookie
    const token = req?.cookies?.token

    // Check if token exists
    if (!token) {
      return next(createError(401, 'No token provided'));
    }
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return next(createError(401, 'User no longer exists'));
      }

      // Check if token is valid
      const isValidToken = user.hasValidToken(token);
      
      if (!isValidToken) {
        return next(createError(401, 'Token has expired or is no longer valid'));
      }

      // Check if user changed password after token was issued
      if (user.changedPasswordAfter(decoded.iat)) {
        return next(createError(401, 'Password was changed, please login again'));
      }

      // Update last used timestamp for this token
      const tokenDoc = user.tokens.find(t => t.token === token);
      if (tokenDoc) {
        tokenDoc.lastUsed = new Date();
        await User.findByIdAndUpdate(user._id, { lastActive: new Date() });
      }

      // Update the req.user with fresh user data
      req.user = user;
      next();
  } catch (error) {
    next(error);
  }
};

// Grant access to specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(createError(403, `User role ${req.user.role} is not authorized to access this route`));
    }
    next();
  };
}; 