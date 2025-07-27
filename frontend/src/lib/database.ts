/**
 * Database Integration Layer
 * Handles connection to PostgreSQL database and real API endpoints
 */

import api from './api';

// Database connection configuration
export const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'lexiloop',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  ssl: process.env.NODE_ENV === 'production'
};

// Real API endpoints
export const endpoints = {
  // Authentication
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    verifyEmail: '/auth/verify-email'
  },

  // User management
  users: {
    profile: '/users/profile',
    updateProfile: '/users/profile',
    preferences: '/users/preferences',
    stats: '/users/stats',
    learningPlan: '/users/learning-plan'
  },

  // Vocabulary management
  vocabulary: {
    collections: '/vocabulary/collections',
    words: '/vocabulary/words',
    search: '/vocabulary/search',
    userWords: '/vocabulary/user-words',
    mastery: '/vocabulary/mastery'
  },

  // Stories and content
  stories: {
    list: '/stories',
    byId: '/stories/:id',
    generate: '/stories/generate',
    userStories: '/stories/user'
  },

  // Testing system
  tests: {
    create: '/tests/create',
    submit: '/tests/submit',
    results: '/tests/results',
    history: '/tests/history'
  },

  // Progress tracking
  progress: {
    overview: '/progress/overview',
    detailed: '/progress/detailed',
    streaks: '/progress/streaks',
    achievements: '/progress/achievements'
  },

  // Error tracking
  errors: {
    list: '/errors',
    review: '/errors/review',
    mastery: '/errors/mastery'
  }
};

// Database service class
export class DatabaseService {
  private static instance: DatabaseService;
  private isConnected: boolean = false;

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  async connect(): Promise<void> {
    try {
      // Test API connection
      await api.get('/health');
      this.isConnected = true;
      console.log('Database connection established');
    } catch (error) {
      console.error('Database connection failed:', error);
      this.isConnected = false;
      throw new Error('Failed to connect to database');
    }
  }

  async disconnect(): Promise<void> {
    this.isConnected = false;
    console.log('Database connection closed');
  }

  isConnectionActive(): boolean {
    return this.isConnected;
  }

  // User operations
  async createUser(userData: any) {
    return api.post(endpoints.auth.register, userData);
  }

  async authenticateUser(credentials: any) {
    return api.post(endpoints.auth.login, credentials);
  }

  async getUserProfile(userId: string) {
    return api.get(`${endpoints.users.profile}/${userId}`);
  }

  async updateUserProfile(userId: string, updates: any) {
    return api.put(`${endpoints.users.profile}/${userId}`, updates);
  }

  // Vocabulary operations
  async getVocabularyCollections(filters?: any) {
    const params = new URLSearchParams(filters).toString();
    return api.get(`${endpoints.vocabulary.collections}?${params}`);
  }

  async createVocabularyCollection(collectionData: any) {
    return api.post(endpoints.vocabulary.collections, collectionData);
  }

  async getWords(collectionId: string) {
    return api.get(`${endpoints.vocabulary.words}?collection=${collectionId}`);
  }

  async searchWords(query: string) {
    return api.get(`${endpoints.vocabulary.search}?q=${encodeURIComponent(query)}`);
  }

  // Story operations
  async getStories(filters?: any) {
    const params = new URLSearchParams(filters).toString();
    return api.get(`${endpoints.stories.list}?${params}`);
  }

  async getStoryById(storyId: string) {
    return api.get(endpoints.stories.byId.replace(':id', storyId));
  }

  async generateStory(prompt: any) {
    return api.post(endpoints.stories.generate, prompt);
  }

  // Test operations
  async createTest(testData: any) {
    return api.post(endpoints.tests.create, testData);
  }

  async submitTestResults(testId: string, results: any) {
    return api.post(`${endpoints.tests.submit}/${testId}`, results);
  }

  async getTestHistory(userId: string) {
    return api.get(`${endpoints.tests.history}/${userId}`);
  }

  // Progress operations
  async getProgressOverview(userId: string) {
    return api.get(`${endpoints.progress.overview}/${userId}`);
  }

  async getDetailedProgress(userId: string, timeRange?: string) {
    const params = timeRange ? `?range=${timeRange}` : '';
    return api.get(`${endpoints.progress.detailed}/${userId}${params}`);
  }

  // Error tracking operations
  async getErrorList(userId: string, filters?: any) {
    const params = new URLSearchParams({ userId, ...filters }).toString();
    return api.get(`${endpoints.errors.list}?${params}`);
  }

  async markErrorReviewed(errorId: string) {
    return api.post(`${endpoints.errors.review}/${errorId}`);
  }

  async markErrorMastered(errorId: string) {
    return api.post(`${endpoints.errors.mastery}/${errorId}`);
  }
}

// Export singleton instance
export const db = DatabaseService.getInstance();

// Migration utilities
export async function runMigrations() {
  try {
    await api.post('/admin/migrations/run');
    console.log('Database migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

export async function seedDatabase() {
  try {
    await api.post('/admin/seed');
    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Database seeding failed:', error);
    throw error;
  }
}

// Health check
export async function checkDatabaseHealth() {
  try {
    const response = await api.get('/health/database');
    return response;
  } catch (error: any) {
    console.error('Database health check failed:', error);
    return { status: 'unhealthy', error: error?.message || 'Unknown error' };
  }
}