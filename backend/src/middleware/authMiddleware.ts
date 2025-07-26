/**
 * Authentication Middleware
 * Validates JWT tokens and protects routes
 */

import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { APIError } from './errorHandler';
import { authLogger } from '../utils/logger';

// Extend Express Request interface to include user data
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        username: string;
        level: string;
        subscriptionType: string;
      };
    }
  }
}

/**
 * Middleware to authenticate requests using JWT
 */
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    authLogger.warn('Request without authentication token', {
      url: req.url,
      method: req.method,
      ip: req.ip
    });
    return next(new APIError('Access token required', 401));
  }

  try {
    const userData = AuthService.verifyToken(token);
    req.user = userData;
    
    authLogger.debug('Token authenticated successfully', {
      userId: userData.id,
      username: userData.username
    });
    
    next();
  } catch (error) {
    authLogger.warn('Token authentication failed', {
      error: (error as Error).message,
      url: req.url,
      method: req.method,
      ip: req.ip
    });
    next(error);
  }
};

/**
 * Middleware for optional authentication (doesn't fail if token is missing)
 */
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next(); // Continue without user data
  }

  try {
    const userData = AuthService.verifyToken(token);
    req.user = userData;
    
    authLogger.debug('Optional auth successful', {
      userId: userData.id,
      username: userData.username
    });
  } catch (error) {
    authLogger.debug('Optional auth failed, continuing without user', {
      error: (error as Error).message
    });
    // Continue without user data - don't throw error
  }

  next();
};

/**
 * Middleware to check if user has required subscription level
 */
export const requireSubscription = (requiredLevel: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new APIError('Authentication required', 401));
    }

    const subscriptionHierarchy = {
      'free': 0,
      'standard': 1,
      'professional': 2,
      'teacher': 3
    };

    const userLevel = subscriptionHierarchy[req.user.subscriptionType as keyof typeof subscriptionHierarchy] || 0;
    const requiredLevelValue = subscriptionHierarchy[requiredLevel as keyof typeof subscriptionHierarchy] || 0;

    if (userLevel < requiredLevelValue) {
      authLogger.warn('Insufficient subscription level', {
        userId: req.user.id,
        userLevel: req.user.subscriptionType,
        requiredLevel
      });
      return next(new APIError('Subscription upgrade required', 403));
    }

    next();
  };
};

/**
 * Middleware to check if user has admin privileges
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new APIError('Authentication required', 401));
  }

  // For now, check if user has teacher subscription (highest level)
  // In future, implement proper admin role system
  if (req.user.subscriptionType !== 'teacher') {
    authLogger.warn('Admin access attempt by non-admin user', {
      userId: req.user.id,
      subscriptionType: req.user.subscriptionType
    });
    return next(new APIError('Admin privileges required', 403));
  }

  next();
};

/**
 * Middleware to rate limit requests per user
 */
export const userRateLimit = (maxRequests: number, windowMs: number) => {
  const userRequests = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(); // Skip rate limiting for unauthenticated users
    }

    const userId = req.user.id;
    const now = Date.now();
    const userLimit = userRequests.get(userId);

    if (!userLimit || now > userLimit.resetTime) {
      // First request or window expired
      userRequests.set(userId, {
        count: 1,
        resetTime: now + windowMs
      });
      return next();
    }

    if (userLimit.count >= maxRequests) {
      authLogger.warn('User rate limit exceeded', {
        userId,
        count: userLimit.count,
        maxRequests
      });
      return next(new APIError('Rate limit exceeded', 429));
    }

    // Increment count
    userLimit.count++;
    next();
  };
};