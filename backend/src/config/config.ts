/**
 * Configuration settings for the LexiLoop backend
 */

import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
  // Server configuration
  port: parseInt(process.env.PORT || '8000'),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',

  // Database configuration
  databaseUrl: process.env.DATABASE_URL || 'postgresql://lexiloop:lexiloop_password@localhost:5432/lexiloop',

  // Redis configuration
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',

  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshExpiresIn: '30d',
  },

  // Rate limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  },

  // AI service configuration
  aiService: {
    baseUrl: process.env.AI_SERVICE_URL || 'http://localhost:8001',
    timeout: 30000, // 30 seconds
  },

  // OpenAI configuration (for direct calls if needed)
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4o-mini',
    maxTokens: 1200,
    temperature: 0.7,
  },

  // Azure Speech Service
  azure: {
    speechKey: process.env.AZURE_SPEECH_KEY,
    speechRegion: process.env.AZURE_SPEECH_REGION || 'eastus',
  },

  // Cost control
  costControl: {
    dailyBudget: parseFloat(process.env.DAILY_AI_BUDGET || '100'),
    hourlyLimit: parseFloat(process.env.HOURLY_AI_LIMIT || '10'),
  },

  // Security
  bcrypt: {
    saltRounds: 12,
  },

  // Pagination defaults
  pagination: {
    defaultLimit: 20,
    maxLimit: 100,
  },

  // File uploads (for future use)
  uploads: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'audio/mpeg'],
  },

  // Email configuration (for future use)
  email: {
    from: process.env.EMAIL_FROM || 'noreply@lexiloop.com',
    smtpHost: process.env.SMTP_HOST,
    smtpPort: parseInt(process.env.SMTP_PORT || '587'),
    smtpUser: process.env.SMTP_USER,
    smtpPass: process.env.SMTP_PASS,
  },

  // Feature flags
  features: {
    enableAudio: process.env.ENABLE_AUDIO !== 'false',
    enableSocialFeatures: process.env.ENABLE_SOCIAL_FEATURES === 'true',
    enableAnalytics: process.env.ENABLE_ANALYTICS !== 'false',
  },
};

// Validate required environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
];

const missingEnvVars = requiredEnvVars.filter(
  (envVar) => !process.env[envVar]
);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars);
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  } else {
    console.warn('⚠️  Running in development mode with missing env vars');
  }
}

export default config;