/**
 * Authentication Service
 * Handles user registration, login, and token management
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { config } from '../config/config';
import { APIError } from '../middleware/errorHandler';
import { authLogger } from '../utils/logger';

const prisma = new PrismaClient();

export interface RegisterData {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  password: string;
  level: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UserTokenData {
  id: string;
  email: string;
  username: string;
  level: string;
  subscriptionType: string;
}

export class AuthService {
  /**
   * Register a new user
   */
  static async register(userData: RegisterData) {
    const { email, username, firstName, lastName, password, level } = userData;

    authLogger.info('User registration attempt', { email, username });

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { username: username.toLowerCase() }
        ]
      }
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        throw new APIError('Email already registered', 409);
      }
      if (existingUser.username === username.toLowerCase()) {
        throw new APIError('Username already taken', 409);
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, config.bcrypt.saltRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        firstName,
        lastName,
        passwordHash,
        level: level as any,
        emailVerified: false, // Email verification to be implemented
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        level: true,
        subscriptionType: true,
        createdAt: true,
      }
    });

    authLogger.info('User registered successfully', { 
      userId: user.id, 
      email: user.email 
    });

    // Generate JWT token
    const token = this.generateToken({
      id: user.id,
      email: user.email,
      username: user.username,
      level: user.level,
      subscriptionType: user.subscriptionType
    });

    return {
      user,
      token
    };
  }

  /**
   * Login user
   */
  static async login(loginData: LoginData) {
    const { email, password } = loginData;

    authLogger.info('User login attempt', { email });

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        passwordHash: true,
        level: true,
        subscriptionType: true,
        isActive: true,
        lastLoginAt: true,
      }
    });

    if (!user) {
      authLogger.warn('Login attempt with non-existent email', { email });
      throw new APIError('Invalid email or password', 401);
    }

    if (!user.isActive) {
      authLogger.warn('Login attempt for inactive user', { email });
      throw new APIError('Account is deactivated', 401);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      authLogger.warn('Login attempt with invalid password', { email });
      throw new APIError('Invalid email or password', 401);
    }

    // Update last login time
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    authLogger.info('User logged in successfully', { 
      userId: user.id, 
      email: user.email 
    });

    // Generate JWT token
    const token = this.generateToken({
      id: user.id,
      email: user.email,
      username: user.username,
      level: user.level,
      subscriptionType: user.subscriptionType
    });

    // Remove password hash from response
    const { passwordHash, ...userWithoutPassword } = user;

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
      config.jwt.secret,
      { 
        expiresIn: config.jwt.expiresIn,
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
      const decoded = jwt.verify(token, config.jwt.secret, {
        issuer: 'lexiloop',
        audience: 'lexiloop-users'
      }) as UserTokenData;
      
      return decoded;
    } catch (error) {
      authLogger.warn('Token verification failed', { error: (error as Error).message });
      throw new APIError('Invalid or expired token', 401);
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        level: true,
        subscriptionType: true,
        preferences: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        lastLoginAt: true,
      }
    });

    if (!user) {
      throw new APIError('User not found', 404);
    }

    return user;
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId: string, updateData: {
    firstName?: string;
    lastName?: string;
    username?: string;
    level?: string;
    preferences?: any;
  }) {
    authLogger.info('Updating user profile', { userId });

    // Check if username is being updated and is available
    if (updateData.username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username: updateData.username.toLowerCase(),
          NOT: { id: userId }
        }
      });

      if (existingUser) {
        throw new APIError('Username already taken', 409);
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...updateData,
        username: updateData.username?.toLowerCase(),
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        level: true,
        subscriptionType: true,
        preferences: true,
        updatedAt: true,
      }
    });

    authLogger.info('User profile updated successfully', { userId });

    return updatedUser;
  }

  /**
   * Change user password
   */
  static async changePassword(userId: string, currentPassword: string, newPassword: string) {
    authLogger.info('Password change attempt', { userId });

    // Get user's current password hash
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true }
    });

    if (!user) {
      throw new APIError('User not found', 404);
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      authLogger.warn('Password change with invalid current password', { userId });
      throw new APIError('Current password is incorrect', 401);
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, config.bcrypt.saltRounds);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash }
    });

    authLogger.info('Password changed successfully', { userId });

    return { success: true };
  }
}