/**
 * API Route: User Authentication - Registration
 * Handles new user registration with validation and JWT token generation
 */

import { NextRequest, NextResponse } from 'next/server';
import { db, checkDatabaseConnection } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret-key';

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password strength validation
function validatePassword(password: string): { isValid: boolean; message?: string } {
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }
  if (!/(?=.*[a-z])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!/(?=.*[A-Z])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/(?=.*\d)/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }
  return { isValid: true };
}

export async function POST(request: NextRequest) {
  try {
    // Check database connection
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { email, password, name, username, learningLevel } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: passwordValidation.message },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.user.findByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Check username uniqueness if provided
    if (username) {
      const existingUsername = await db.user.findByUsername(username);
      if (existingUsername) {
        return NextResponse.json(
          { error: 'Username is already taken' },
          { status: 409 }
        );
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await db.user.create({
      email: email.toLowerCase(),
      hashedPassword,
      name: name?.trim(),
      username: username?.toLowerCase()
    });

    // Update learning level if provided
    if (learningLevel && ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].includes(learningLevel)) {
      await db.user.updateProfile(user.id, { learningLevel });
    }

    // Generate JWT token
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      learningLevel: user.learningLevel
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, {
      expiresIn: '7d'
    });

    // Remove sensitive data
    const { hashedPassword: _, ...safeUser } = user;

    // Initialize user progress
    await db.progress.recordDailyProgress(user.id, {
      wordsStudied: 0,
      wordsLearned: 0,
      testsTaken: 0,
      timeSpent: 0
    });

    // Create welcome collection for new user
    const welcomeCollection = await db.vocabulary.createCollection({
      title: 'Welcome to LexiLoop',
      description: 'Your first vocabulary collection with essential words to get started',
      category: 'starter',
      level: learningLevel || 'BEGINNER',
      userId: user.id,
      isPublic: false
    });

    // Add some starter words
    const starterWords = [
      {
        word: 'welcome',
        definition: 'to greet someone in a friendly way when they arrive',
        pronunciation: '/ˈwelkəm/',
        partOfSpeech: 'verb',
        examples: ['Welcome to our English learning platform!', 'We welcome new students every day.'],
        difficulty: 'BEGINNER' as const
      },
      {
        word: 'learn',
        definition: 'to get knowledge or skill in a new subject or activity',
        pronunciation: '/lɜːrn/',
        partOfSpeech: 'verb',
        examples: ['I want to learn English vocabulary.', 'Children learn quickly when they have fun.'],
        difficulty: 'BEGINNER' as const
      },
      {
        word: 'vocabulary',
        definition: 'all the words that a person knows or uses',
        pronunciation: '/vəˈkæbjələri/',
        partOfSpeech: 'noun',
        examples: ['Building vocabulary is essential for language learning.', 'She has an extensive vocabulary in three languages.'],
        difficulty: 'INTERMEDIATE' as const
      }
    ];

    await db.vocabulary.addWordsToCollection(welcomeCollection.id, starterWords);

    // Set HTTP-only cookie
    const response = NextResponse.json({
      message: 'Registration successful',
      token,
      user: {
        ...safeUser,
        stats: {
          totalWords: 0,
          masteredWords: 0,
          collections: 1,
          testsCompleted: 0,
          currentStreak: 0,
          masteryRate: 0
        }
      }
    }, { status: 201 });

    // Set secure cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    return response;

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { 
        error: 'Registration failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}