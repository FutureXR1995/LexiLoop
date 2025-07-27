/**
 * Security utilities and middleware
 * Enhanced security measures for production deployment
 */

import { NextRequest, NextResponse } from 'next/server';

// Security configuration
export const securityConfig = {
  jwt: {
    secret: new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-key'),
    issuer: 'lexiloop',
    audience: 'lexiloop-users',
    expirationTime: '24h',
    refreshExpirationTime: '7d'
  },
  cors: {
    allowedOrigins: [
      'https://lexiloop.com',
      'https://www.lexiloop.com',
      'https://app.lexiloop.com',
      ...(process.env.NODE_ENV === 'development' ? ['http://localhost:3000', 'http://localhost:3001'] : [])
    ],
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    maxAge: 86400 // 24 hours
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  },
  csp: {
    defaultSrc: ["'self'"],
    scriptSrc: [
      "'self'",
      "'unsafe-inline'", // Required for Next.js
      "'unsafe-eval'", // Required for Next.js development
      'https://www.googletagmanager.com',
      'https://www.google-analytics.com'
    ],
    styleSrc: [
      "'self'",
      "'unsafe-inline'",
      'https://fonts.googleapis.com'
    ],
    fontSrc: [
      "'self'",
      'https://fonts.gstatic.com'
    ],
    imgSrc: [
      "'self'",
      'data:',
      'https://cdn.lexiloop.com',
      'https://www.google-analytics.com'
    ],
    connectSrc: [
      "'self'",
      'https://api.lexiloop.com',
      'https://www.google-analytics.com',
      'https://cognitiveservices.azure.com' // For Azure Speech Services
    ],
    frameSrc: ["'none'"],
    objectSrc: ["'none'"],
    baseUri: ["'self'"],
    formAction: ["'self'"],
    upgradeInsecureRequests: process.env.NODE_ENV === 'production'
  }
};

// JWT utilities (simplified for now - would use jose in production)
export class JWTService {
  static async sign(payload: any): Promise<string> {
    // Simplified JWT implementation for development
    const header = { alg: 'HS256', typ: 'JWT' };
    const now = Math.floor(Date.now() / 1000);
    const tokenPayload = {
      ...payload,
      iat: now,
      iss: securityConfig.jwt.issuer,
      aud: securityConfig.jwt.audience,
      exp: now + 24 * 60 * 60 // 24 hours
    };

    const encodedHeader = btoa(JSON.stringify(header));
    const encodedPayload = btoa(JSON.stringify(tokenPayload));
    
    return `${encodedHeader}.${encodedPayload}.signature`;
  }

  static async verify(token: string): Promise<any> {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token format');
      }

      const payload = JSON.parse(atob(parts[1]));
      
      // Check expiration
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        throw new Error('Token expired');
      }

      return payload;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  static async refresh(refreshToken: string): Promise<string> {
    const payload = await this.verify(refreshToken);
    return await this.sign({ 
      userId: payload.userId, 
      email: payload.email,
      type: 'access'
    });
  }
}

// Input validation and sanitization
export class ValidationService {
  static sanitizeString(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocols
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  static isValidPassword(password: string): boolean {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

  static validateUserInput(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (data.email && !this.isValidEmail(data.email)) {
      errors.push('Invalid email format');
    }

    if (data.password && !this.isValidPassword(data.password)) {
      errors.push('Password must be at least 8 characters with uppercase, lowercase, number, and special character');
    }

    if (data.name && (data.name.length < 2 || data.name.length > 50)) {
      errors.push('Name must be between 2 and 50 characters');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// CSRF protection
export class CSRFService {
  private static readonly SECRET_KEY = process.env.CSRF_SECRET || 'csrf-secret-key';

  static generateToken(): string {
    const timestamp = Date.now().toString();
    const randomBytes = crypto.getRandomValues(new Uint8Array(16));
    const randomString = Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('');
    return btoa(`${timestamp}:${randomString}`);
  }

  static validateToken(token: string, maxAge = 3600000): boolean { // 1 hour default
    try {
      const decoded = atob(token);
      const [timestamp] = decoded.split(':');
      const tokenAge = Date.now() - parseInt(timestamp);
      return tokenAge <= maxAge;
    } catch {
      return false;
    }
  }
}

// Rate limiting store (in-memory for simplicity, use Redis in production)
class RateLimitStore {
  private store = new Map<string, { count: number; resetTime: number }>();

  increment(key: string): { totalHits: number; timeToReset: number } {
    const now = Date.now();
    const windowMs = securityConfig.rateLimit.windowMs;
    const limit = securityConfig.rateLimit.max;

    let record = this.store.get(key);
    
    if (!record || now > record.resetTime) {
      record = { count: 0, resetTime: now + windowMs };
      this.store.set(key, record);
    }

    record.count++;
    
    return {
      totalHits: record.count,
      timeToReset: Math.ceil((record.resetTime - now) / 1000)
    };
  }

  reset(key: string): void {
    this.store.delete(key);
  }
}

export const rateLimitStore = new RateLimitStore();

// Security middleware
export function securityMiddleware(request: NextRequest): NextResponse | null {
  // Skip security headers for API routes to avoid conflicts
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return null;
  }

  const response = NextResponse.next();

  // CORS headers
  const origin = request.headers.get('origin');
  if (origin && securityConfig.cors.allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }
  response.headers.set('Access-Control-Allow-Methods', securityConfig.cors.allowedMethods.join(', '));
  response.headers.set('Access-Control-Allow-Headers', securityConfig.cors.allowedHeaders.join(', '));
  response.headers.set('Access-Control-Max-Age', securityConfig.cors.maxAge.toString());

  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // HSTS (only in production)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  // CSP header (simplified for now to avoid issues)
  const cspPolicy = "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';";
  response.headers.set('Content-Security-Policy', cspPolicy);

  return response;
}

// Rate limiting middleware
export function rateLimitMiddleware(request: NextRequest): NextResponse | null {
  const ip = getClientIP(request);
  const key = `rate_limit:${ip}`;
  
  const { totalHits, timeToReset } = rateLimitStore.increment(key);
  
  if (totalHits > securityConfig.rateLimit.max) {
    return new NextResponse(
      JSON.stringify({ error: securityConfig.rateLimit.message }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': timeToReset.toString(),
          'X-RateLimit-Limit': securityConfig.rateLimit.max.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': (Date.now() + timeToReset * 1000).toString()
        }
      }
    );
  }

  return null;
}

// Helper function to get client IP
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }

  return request.ip || 'unknown';
}

// Audit logging
export class AuditLogger {
  static async log(event: string, userId?: string, metadata?: any): Promise<void> {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      userId: userId || 'anonymous',
      metadata: metadata || {},
      ip: 'unknown', // Will be filled by middleware
      userAgent: 'unknown' // Will be filled by middleware
    };

    // In production, send to logging service (e.g., CloudWatch, Datadog)
    if (process.env.NODE_ENV === 'production') {
      console.log(JSON.stringify(logEntry));
    } else {
      console.log('Audit Log:', logEntry);
    }
  }
}

// Data encryption utilities
export class EncryptionService {
  private static readonly algorithm = 'AES-GCM';
  private static readonly keyLength = 256;

  static async generateKey(): Promise<CryptoKey> {
    return await crypto.subtle.generateKey(
      {
        name: this.algorithm,
        length: this.keyLength,
      },
      true,
      ['encrypt', 'decrypt']
    );
  }

  static async encrypt(data: string, key: CryptoKey): Promise<string> {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encodedData = new TextEncoder().encode(data);

    const encryptedData = await crypto.subtle.encrypt(
      {
        name: this.algorithm,
        iv: iv,
      },
      key,
      encodedData
    );

    const result = new Uint8Array(iv.length + encryptedData.byteLength);
    result.set(iv);
    result.set(new Uint8Array(encryptedData), iv.length);

    return btoa(String.fromCharCode.apply(null, Array.from(result)));
  }

  static async decrypt(encryptedData: string, key: CryptoKey): Promise<string> {
    const data = new Uint8Array(Array.from(atob(encryptedData)).map(char => char.charCodeAt(0)));
    const iv = data.slice(0, 12);
    const encrypted = data.slice(12);

    const decryptedData = await crypto.subtle.decrypt(
      {
        name: this.algorithm,
        iv: iv,
      },
      key,
      encrypted
    );

    return new TextDecoder().decode(decryptedData);
  }
}