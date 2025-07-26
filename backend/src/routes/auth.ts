/**
 * Authentication routes
 */

import { Router } from 'express';
import Joi from 'joi';
import { asyncHandler, APIError } from '../middleware/errorHandler';
import { authenticateToken } from '../middleware/authMiddleware';
import { AuthService } from '../services/authService';
import { authLogger } from '../utils/logger';

const router = Router();

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  username: Joi.string().min(3).max(30).alphanum().required(),
  firstName: Joi.string().min(1).max(50).required(),
  lastName: Joi.string().min(1).max(50).required(),
  password: Joi.string().min(8).max(100).required(),
  level: Joi.string().valid('beginner', 'elementary', 'intermediate', 'upper-intermediate', 'advanced').required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).max(100).required()
});

const updateProfileSchema = Joi.object({
  firstName: Joi.string().min(1).max(50).optional(),
  lastName: Joi.string().min(1).max(50).optional(),
  username: Joi.string().min(3).max(30).alphanum().optional(),
  level: Joi.string().valid('beginner', 'elementary', 'intermediate', 'upper-intermediate', 'advanced').optional(),
  preferences: Joi.object().optional()
});

// Register endpoint
router.post('/register', asyncHandler(async (req, res) => {
  // Validate request data
  const { error, value } = registerSchema.validate(req.body);
  if (error) {
    throw new APIError(`Validation error: ${error.details[0].message}`, 400);
  }

  const result = await AuthService.register(value);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: result.user,
      token: result.token
    }
  });
}));

// Login endpoint
router.post('/login', asyncHandler(async (req, res) => {
  // Validate request data
  const { error, value } = loginSchema.validate(req.body);
  if (error) {
    throw new APIError(`Validation error: ${error.details[0].message}`, 400);
  }

  const result = await AuthService.login(value);

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: result.user,
      token: result.token
    }
  });
}));

// Get current user profile
router.get('/me', authenticateToken, asyncHandler(async (req, res) => {
  const user = await AuthService.getUserById(req.user!.id);

  res.json({
    success: true,
    data: { user }
  });
}));

// Update user profile
router.put('/profile', authenticateToken, asyncHandler(async (req, res) => {
  // Validate request data
  const { error, value } = updateProfileSchema.validate(req.body);
  if (error) {
    throw new APIError(`Validation error: ${error.details[0].message}`, 400);
  }

  const updatedUser = await AuthService.updateProfile(req.user!.id, value);

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: { user: updatedUser }
  });
}));

// Change password
router.post('/change-password', authenticateToken, asyncHandler(async (req, res) => {
  // Validate request data
  const { error, value } = changePasswordSchema.validate(req.body);
  if (error) {
    throw new APIError(`Validation error: ${error.details[0].message}`, 400);
  }

  await AuthService.changePassword(
    req.user!.id,
    value.currentPassword,
    value.newPassword
  );

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
}));

// Logout endpoint (client-side token removal)
router.post('/logout', authenticateToken, asyncHandler(async (req, res) => {
  authLogger.info('User logout', { userId: req.user!.id });
  
  // Note: With JWT, logout is typically handled client-side by removing the token
  // For enhanced security, you could implement a token blacklist here
  
  res.json({
    success: true,
    message: 'Logout successful'
  });
}));

// Verify token endpoint
router.post('/verify', asyncHandler(async (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    throw new APIError('Token is required', 400);
  }

  try {
    const userData = AuthService.verifyToken(token);
    const user = await AuthService.getUserById(userData.id);

    res.json({
      success: true,
      message: 'Token is valid',
      data: { user }
    });
  } catch (error) {
    throw new APIError('Invalid token', 401);
  }
}));

export default router;