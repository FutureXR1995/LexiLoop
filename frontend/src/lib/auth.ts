/**
 * Authentication Utilities
 * JWT token validation and user session management
 */

import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { db } from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret-key';

export interface AuthUser {
  userId: string;
  email: string;
  name?: string;
  learningLevel: string;
}

/**
 * Extract and verify JWT token from request
 */
export function getTokenFromRequest(request: NextRequest): string | null {
  // Try Authorization header first
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Try cookie as fallback
  const cookie = request.cookies.get('auth-token');
  if (cookie) {
    return cookie.value;
  }

  return null;
}

/**
 * Verify JWT token and return user data
 */
export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Validate token payload structure
    if (!decoded.userId || !decoded.email) {
      return null;
    }

    return {
      userId: decoded.userId,
      email: decoded.email,
      name: decoded.name,
      learningLevel: decoded.learningLevel || 'BEGINNER'
    };
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Get authenticated user from request
 */
export function getAuthUser(request: NextRequest): AuthUser | null {
  const token = getTokenFromRequest(request);
  if (!token) {
    return null;
  }

  return verifyToken(token);
}

/**
 * Generate JWT token for user
 */
export function generateToken(user: {
  id: string;
  email: string;
  name?: string;
  learningLevel?: string;
}): string {
  const payload = {
    userId: user.id,
    email: user.email,
    name: user.name,
    learningLevel: user.learningLevel || 'BEGINNER'
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d'
  });
}

/**
 * Middleware function to protect API routes
 */
export async function requireAuth(request: NextRequest): Promise<{
  user: AuthUser;
  error?: never;
} | {
  user?: never;
  error: Response;
}> {
  const user = getAuthUser(request);
  
  if (!user) {
    return {
      error: new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    };
  }

  // Verify user still exists and is active
  try {
    const dbUser = await db.user.findById(user.userId);
    if (!dbUser || !dbUser.isActive) {
      return {
        error: new Response(
          JSON.stringify({ error: 'User account not found or inactive' }),
          { 
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      };
    }
  } catch (error) {
    console.error('Error verifying user:', error);
    return {
      error: new Response(
        JSON.stringify({ error: 'Authentication verification failed' }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    };
  }

  return { user };
}

/**
 * Hash password utility
 */
export async function hashPassword(password: string): Promise<string> {
  const bcrypt = await import('bcryptjs');
  return bcrypt.hash(password, 12);
}

/**
 * Verify password utility
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const bcrypt = await import('bcryptjs');
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Session management utilities
 */
export const session = {
  /**
   * Create session response with token
   */
  createSessionResponse(user: AuthUser, token: string) {
    const response = new Response(
      JSON.stringify({
        message: 'Authentication successful',
        user,
        token
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

    // Set HTTP-only cookie
    const cookieOptions = [
      'HttpOnly',
      'SameSite=Strict',
      `Max-Age=${7 * 24 * 60 * 60}`, // 7 days
      'Path=/'
    ];

    if (process.env.NODE_ENV === 'production') {
      cookieOptions.push('Secure');
    }

    response.headers.set(
      'Set-Cookie',
      `auth-token=${token}; ${cookieOptions.join('; ')}`
    );

    return response;
  },

  /**
   * Clear session response
   */
  clearSessionResponse() {
    const response = new Response(
      JSON.stringify({ message: 'Session cleared' }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

    response.headers.set(
      'Set-Cookie',
      'auth-token=; HttpOnly; SameSite=Strict; Max-Age=0; Path=/'
    );

    return response;
  }
};

/**
 * Password validation
 */
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/(?=.*[@$!%*?&])/.test(password)) {
    errors.push('Password must contain at least one special character (@$!%*?&)');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Email validation
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}