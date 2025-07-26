/**
 * API Service
 * Handles all HTTP requests to the backend API
 */

import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

class ApiServiceClass {
  private baseURL: string;
  private authToken: string | null = null;
  private requestQueue: Array<() => Promise<any>> = [];
  private isOnline: boolean = true;

  constructor() {
    // Development URL - should be configurable for production
    this.baseURL = __DEV__ 
      ? 'http://localhost:8000/api' 
      : 'https://api.lexiloop.com/api';
    
    // Monitor network status
    this.initializeNetworkMonitoring();
  }

  private initializeNetworkMonitoring() {
    NetInfo.addEventListener(state => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected ?? false;
      
      // Process queued requests when coming back online
      if (wasOffline && this.isOnline) {
        this.processRequestQueue();
      }
    });
  }

  private async processRequestQueue() {
    const queue = [...this.requestQueue];
    this.requestQueue = [];
    
    for (const request of queue) {
      try {
        await request();
      } catch (error) {
        console.warn('Queued request failed:', error);
      }
    }
  }

  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    // Check network connectivity
    if (!this.isOnline) {
      throw new ApiError({
        message: 'No internet connection',
        code: 'NETWORK_ERROR',
      });
    }

    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new ApiError({
          message: data.error || data.message || 'Request failed',
          status: response.status,
          code: data.code,
        });
      }

      return {
        success: true,
        data,
        message: data.message,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      // Network or parsing error
      throw new ApiError({
        message: error.message || 'Network request failed',
        code: 'NETWORK_ERROR',
      });
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'DELETE' });
  }

  // Offline support methods
  async cacheRequest(key: string, data: any): Promise<void> {
    try {
      await AsyncStorage.setItem(`cache_${key}`, JSON.stringify({
        data,
        timestamp: Date.now(),
      }));
    } catch (error) {
      console.warn('Failed to cache request:', error);
    }
  }

  async getCachedRequest(key: string, maxAge: number = 300000): Promise<any> {
    try {
      const cached = await AsyncStorage.getItem(`cache_${key}`);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp > maxAge) {
        await AsyncStorage.removeItem(`cache_${key}`);
        return null;
      }

      return data;
    } catch (error) {
      console.warn('Failed to get cached request:', error);
      return null;
    }
  }

  // Specific API methods for common operations
  async getStories(params?: any): Promise<ApiResponse> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.get(`/stories${queryString}`);
  }

  async generateStory(vocabularyIds: string[], options?: any): Promise<ApiResponse> {
    return this.post('/stories/generate', { vocabularyIds, ...options });
  }

  async getVocabularies(params?: any): Promise<ApiResponse> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.get(`/vocabularies${queryString}`);
  }

  async getUserProgress(): Promise<ApiResponse> {
    return this.get('/progress');
  }

  async submitTestResult(data: any): Promise<ApiResponse> {
    return this.post('/tests/submit', data);
  }

  // Social features
  async getFriends(): Promise<ApiResponse> {
    return this.get('/social/friends');
  }

  async sendFriendRequest(friendEmail: string): Promise<ApiResponse> {
    return this.post('/social/friends/request', { friendEmail });
  }

  async acceptFriendRequest(requestId: string): Promise<ApiResponse> {
    return this.post(`/social/friends/accept/${requestId}`);
  }

  async getUserStats(): Promise<ApiResponse> {
    return this.get('/social/stats');
  }

  async getAchievements(): Promise<ApiResponse> {
    return this.get('/social/achievements');
  }

  async getLeaderboard(type: string = 'points', limit: number = 10): Promise<ApiResponse> {
    return this.get(`/social/leaderboard?type=${type}&limit=${limit}`);
  }
}

class ApiError extends Error {
  status?: number;
  code?: string;

  constructor({ message, status, code }: { message: string; status?: number; code?: string }) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

export const ApiService = new ApiServiceClass();
export { ApiError };