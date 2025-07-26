/**
 * API Client
 * Centralized API communication with the backend
 */

interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
}

class ApiClient {
  private config: ApiConfig;
  private token: string | null = null;

  constructor(config: ApiConfig) {
    this.config = config;
    
    // Load token from localStorage on initialization
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  // Set authentication token
  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  // Clear authentication token
  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  // Get authorization headers
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Generic request method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    // Add timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
    config.signal = controller.signal;

    try {
      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 401) {
          // Unauthorized - clear token and redirect to login
          this.clearToken();
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login';
          }
        }
        
        const error = await response.json().catch(() => ({}));
        throw new ApiError(
          response.status,
          error.message || `HTTP ${response.status}`,
          error
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError(408, 'Request timeout');
      }
      
      throw new ApiError(500, 'Network error', error);
    }
  }

  // HTTP methods
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // File upload method
  async uploadFile<T>(endpoint: string, file: File, additionalData?: Record<string, any>): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    const headers: Record<string, string> = {};
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return this.request<T>(endpoint, {
      method: 'POST',
      body: formData,
      headers,
    });
  }
}

// Custom API Error class
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// API configuration
const apiConfig: ApiConfig = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  timeout: 30000, // 30 seconds
  retries: 3,
};

// Create and export API client instance
export const apiClient = new ApiClient(apiConfig);

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// User types
export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  level: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  expiresAt: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  password: string;
  level: string;
}

// Vocabulary types
export interface VocabularyWord {
  id: string;
  word: string;
  definition: string;
  pronunciation?: string;
  audioUrl?: string;
  partOfSpeech: string;
  examples: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  masteryLevel: number;
  lastReviewed?: string;
  createdAt: string;
}

export interface VocabularyCollection {
  id: string;
  name: string;
  description: string;
  wordCount: number;
  difficulty: string;
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
}

// Story types
export interface Story {
  id: string;
  title: string;
  content: string;
  vocabularyIds: string[];
  difficulty: string;
  wordCount: number;
  readingTime: number;
  createdAt: string;
}

// Test types
export interface TestSession {
  id: string;
  storyId: string;
  vocabularyIds: string[];
  startedAt: string;
  completedAt?: string;
  results: TestResult[];
}

export interface TestResult {
  questionId: string;
  vocabularyId: string;
  testType: string;
  isCorrect: boolean;
  responseTime: number;
  userAnswer: string;
  correctAnswer: string;
}

// Progress types
export interface LearningProgress {
  totalWords: number;
  masteredWords: number;
  wordsInProgress: number;
  dailyStreak: number;
  weeklyGoal: number;
  weeklyProgress: number;
  recentSessions: SessionSummary[];
}

export interface SessionSummary {
  id: string;
  type: 'reading' | 'test' | 'review';
  date: string;
  duration: number;
  wordsLearned: number;
  accuracy: number;
}

export default apiClient;