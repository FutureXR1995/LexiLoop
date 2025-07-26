/**
 * Authentication Service
 * Handles user registration, login, and token management
 * Updated to use MongoDB with realDatabaseService
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { APIError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { realDatabaseService } from './realDatabaseService';
import { User, IUser } from '../models/User';
import mongoose from 'mongoose';

export interface RegisterData {
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  password: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UserTokenData {
  id: string;
  email: string;
  username: string;
  role: 'user' | 'admin' | 'moderator';
  subscriptionPlan: 'free' | 'premium' | 'pro';
}

export class AuthService {
  /**
   * Register a new user
   */
  static async register(userData: RegisterData) {
    const { email, username, firstName, lastName, password, difficulty = 'intermediate' } = userData;

    logger.info('User registration attempt', { email, username });

    // Check if user already exists by email
    const existingUserByEmail = await realDatabaseService.findOneWithCache<IUser>(
      User,
      { email: email.toLowerCase() }
    );

    if (existingUserByEmail) {
      throw new APIError('Email already registered', 409);
    }

    // Check if username is taken
    const existingUserByUsername = await realDatabaseService.findOneWithCache<IUser>(
      User,
      { username: username.toLowerCase() }
    );

    if (existingUserByUsername) {
      throw new APIError('Username already taken', 409);
    }

    // Create user data
    const newUserData = {
      email: email.toLowerCase(),
      username: username.toLowerCase(),
      password, // Will be hashed by pre-save middleware
      firstName: firstName || '',
      lastName: lastName || '',
      role: 'user' as const,
      isActive: true,
      emailVerified: false,
      preferences: {
        language: 'en',
        difficulty,
        dailyGoal: 10,
        notifications: {
          email: true,
          push: true,
          reminders: true
        },
        learningMode: 'adaptive' as const
      },
      subscription: {
        plan: 'free' as const,
        status: 'active' as const,
        features: []
      },
      profile: {},
      learningStats: {
        totalWordsLearned: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalStudyTime: 0,
        averageAccuracy: 0
      },
      achievements: []
    };

    // Create user
    const user = await realDatabaseService.create<IUser>(User, newUserData);

    logger.info('User registered successfully', { 
      userId: user._id, 
      email: user.email 
    });

    // Generate JWT token
    const token = this.generateToken({
      id: user._id.toString(),
      email: user.email,
      username: user.username,
      role: user.role,
      subscriptionPlan: user.subscription.plan
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user.toObject();

    return {
      user: userWithoutPassword,
      token
    };
  }

  /**
   * Login user
   */
  static async login(loginData: LoginData) {
    const { email, password } = loginData;

    logger.info('User login attempt', { email });

    // Find user by email
    const user = await realDatabaseService.findOneWithCache<IUser>(
      User,
      { email: email.toLowerCase() }
    );

    if (!user) {
      logger.warn('Login attempt with non-existent email', { email });
      throw new APIError('Invalid email or password', 401);
    }

    if (!user.isActive) {
      logger.warn('Login attempt for inactive user', { email });
      throw new APIError('Account is deactivated', 401);
    }

    // Verify password using the model method
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      logger.warn('Login attempt with invalid password', { email });
      throw new APIError('Invalid email or password', 401);
    }

    // Update last login time
    await realDatabaseService.updateOne(
      User,
      { _id: user._id },
      { $set: { lastLoginAt: new Date() } }
    );

    logger.info('User logged in successfully', { 
      userId: user._id, 
      email: user.email 
    });

    // Generate JWT token
    const token = this.generateToken({
      id: user._id.toString(),
      email: user.email,
      username: user.username,
      role: user.role,
      subscriptionPlan: user.subscription.plan
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user.toObject();

    return {
      user: userWithoutPassword,
      token
    };
  }

  /**
   * Generate JWT token
   */
  static generateToken(userData: UserTokenData): string {
    return jwt.sign(
      userData,
      process.env.JWT_SECRET || 'fallback-secret-key',
      { 
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
        issuer: 'lexiloop',
        audience: 'lexiloop-users'
      }
    );
  }

  /**
   * Verify JWT token
   */
  static verifyToken(token: string): UserTokenData {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key', {
        issuer: 'lexiloop',
        audience: 'lexiloop-users'
      }) as UserTokenData;
      
      return decoded;
    } catch (error) {
      logger.warn('Token verification failed', { error: (error as Error).message });
      throw new APIError('Invalid or expired token', 401);
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string) {
    const user = await realDatabaseService.findOneWithCache<IUser>(
      User,
      { _id: new mongoose.Types.ObjectId(userId) }
    );

    if (!user) {
      throw new APIError('User not found', 404);
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword;
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId: string, updateData: {
    firstName?: string;
    lastName?: string;
    username?: string;
    preferences?: any;
    profile?: any;
  }) {
    logger.info('Updating user profile', { userId });

    // Check if username is being updated and is available
    if (updateData.username) {
      const existingUser = await realDatabaseService.findOneWithCache<IUser>(
        User,
        { 
          username: updateData.username.toLowerCase(),
          _id: { $ne: new mongoose.Types.ObjectId(userId) }
        }
      );

      if (existingUser) {
        throw new APIError('Username already taken', 409);
      }
    }

    const updateFields: any = {};
    if (updateData.firstName !== undefined) updateFields.firstName = updateData.firstName;
    if (updateData.lastName !== undefined) updateFields.lastName = updateData.lastName;
    if (updateData.username !== undefined) updateFields.username = updateData.username.toLowerCase();
    if (updateData.preferences !== undefined) updateFields.preferences = updateData.preferences;
    if (updateData.profile !== undefined) updateFields.profile = updateData.profile;

    await realDatabaseService.updateOne(
      User,
      { _id: new mongoose.Types.ObjectId(userId) },
      { $set: updateFields }
    );

    logger.info('User profile updated successfully', { userId });

    // Get updated user
    const updatedUser = await this.getUserById(userId);
    return updatedUser;
  }

  /**
   * Change user password
   */
  static async changePassword(userId: string, currentPassword: string, newPassword: string) {
    logger.info('Password change attempt', { userId });

    // Get user
    const user = await realDatabaseService.findOneWithCache<IUser>(
      User,
      { _id: new mongoose.Types.ObjectId(userId) }
    );

    if (!user) {
      throw new APIError('User not found', 404);
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      logger.warn('Password change with invalid current password', { userId });
      throw new APIError('Current password is incorrect', 401);
    }

    // Update password (will be hashed by pre-save middleware)
    await realDatabaseService.updateOne(
      User,
      { _id: new mongoose.Types.ObjectId(userId) },
      { $set: { password: newPassword } }
    );

    logger.info('Password changed successfully', { userId });

    return { success: true };
  }

  /**
   * Request password reset
   */
  static async requestPasswordReset(email: string) {
    logger.info('Password reset requested', { email });

    const user = await realDatabaseService.findOneWithCache<IUser>(
      User,
      { email: email.toLowerCase() }
    );

    if (!user) {
      // Don't reveal if email exists
      logger.warn('Password reset requested for non-existent email', { email });
      return { success: true, message: 'If the email exists, reset instructions have been sent' };
    }

    // Generate reset token (implement email sending later)
    const resetToken = jwt.sign(
      { userId: user._id.toString(), purpose: 'password-reset' },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '1h' }
    );

    logger.info('Password reset token generated', { userId: user._id, email });

    // TODO: Send email with reset link
    // For now, return the token (in production, this would be sent via email)
    return { 
      success: true, 
      message: 'Password reset instructions sent',
      // Remove this in production:
      resetToken: resetToken 
    };
  }

  /**
   * Reset password with token
   */
  static async resetPassword(token: string, newPassword: string) {
    logger.info('Password reset attempt with token');

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key') as any;
      
      if (decoded.purpose !== 'password-reset') {
        throw new Error('Invalid token purpose');
      }

      // Update password
      await realDatabaseService.updateOne(
        User,
        { _id: new mongoose.Types.ObjectId(decoded.userId) },
        { $set: { password: newPassword } }
      );

      logger.info('Password reset successful', { userId: decoded.userId });

      return { success: true, message: 'Password reset successful' };
    } catch (error) {
      logger.warn('Password reset failed', { error: (error as Error).message });
      throw new APIError('Invalid or expired reset token', 401);
    }
  }
}