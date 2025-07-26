/**
 * Authentication Service
 * Handles user authentication and session management
 */

import { apiClient, ApiResponse, LoginRequest, LoginResponse, RegisterRequest, User } from '@/lib/api';

class AuthService {
  // Login user
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', credentials);
      
      if (response.success && response.data) {
        // Store token and user data
        apiClient.setToken(response.data.token);
        this.setUser(response.data.user);
        return response.data;
      }
      
      throw new Error(response.message || 'Login failed');
    } catch (error) {
      // Fallback for development - simulate successful login
      if (process.env.NODE_ENV === 'development') {
        const mockResponse: LoginResponse = {
          user: {
            id: 'demo-user-1',
            email: credentials.email,
            username: credentials.email.split('@')[0],
            firstName: 'Demo',
            lastName: 'User',
            level: 'intermediate',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          token: 'demo-jwt-token-' + Date.now(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        };
        
        // Store token and user data
        apiClient.setToken(mockResponse.token);
        this.setUser(mockResponse.user);
        return mockResponse;
      }
      
      throw error;
    }
  }

  // Register new user
  async register(userData: RegisterRequest): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<ApiResponse<{ message: string }>>('/auth/register', userData);
      
      if (response.success) {
        return response.data;
      }
      
      throw new Error(response.message || 'Registration failed');
    } catch (error) {
      // Fallback for development
      if (process.env.NODE_ENV === 'development') {
        // Simulate successful registration
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { message: 'Registration successful! Please check your email to verify your account.' };
      }
      
      throw error;
    }
  }

  // Request password reset
  async forgotPassword(email: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<ApiResponse<{ message: string }>>('/auth/forgot-password', { email });
      
      if (response.success) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to send reset email');
    } catch (error) {
      // Fallback for development
      if (process.env.NODE_ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 1500));
        return { message: 'Password reset email sent successfully!' };
      }
      
      throw error;
    }
  }

  // Reset password with token
  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<ApiResponse<{ message: string }>>('/auth/reset-password', {
        token,
        password: newPassword,
      });
      
      if (response.success) {
        return response.data;
      }
      
      throw new Error(response.message || 'Password reset failed');
    } catch (error) {
      // Fallback for development
      if (process.env.NODE_ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { message: 'Password reset successful!' };
      }
      
      throw error;
    }
  }

  // Get current user profile
  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiClient.get<ApiResponse<User>>('/auth/me');
      
      if (response.success && response.data) {
        this.setUser(response.data);
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to get user profile');
    } catch (error) {
      // Fallback for development
      if (process.env.NODE_ENV === 'development') {
        const storedUser = this.getStoredUser();
        if (storedUser) {
          return storedUser;
        }
      }
      
      throw error;
    }
  }

  // Update user profile
  async updateProfile(userData: Partial<User>): Promise<User> {
    try {
      const response = await apiClient.put<ApiResponse<User>>('/auth/profile', userData);
      
      if (response.success && response.data) {
        this.setUser(response.data);
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to update profile');
    } catch (error) {
      // Fallback for development
      if (process.env.NODE_ENV === 'development') {
        const currentUser = this.getStoredUser();
        if (currentUser) {
          const updatedUser = { ...currentUser, ...userData, updatedAt: new Date().toISOString() };
          this.setUser(updatedUser);
          return updatedUser;
        }
      }
      
      throw error;
    }
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      // Continue with logout even if API call fails
      console.warn('Logout API call failed:', error);
    } finally {
      // Always clear local data
      apiClient.clearToken();
      this.clearUser();
    }
  }

  // Verify email
  async verifyEmail(token: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<ApiResponse<{ message: string }>>('/auth/verify-email', { token });
      
      if (response.success) {
        return response.data;
      }
      
      throw new Error(response.message || 'Email verification failed');
    } catch (error) {
      // Fallback for development
      if (process.env.NODE_ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { message: 'Email verified successfully!' };
      }
      
      throw error;
    }
  }

  // Refresh authentication token
  async refreshToken(): Promise<string> {
    try {
      const response = await apiClient.post<ApiResponse<{ token: string }>>('/auth/refresh');
      
      if (response.success && response.data) {
        apiClient.setToken(response.data.token);
        return response.data.token;
      }
      
      throw new Error('Token refresh failed');
    } catch (error) {
      // If refresh fails, clear auth data
      this.logout();
      throw error;
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    return Boolean(token && user);
  }

  // Get stored user data
  getStoredUser(): User | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Failed to parse stored user data:', error);
      return null;
    }
  }

  // Store user data locally
  private setUser(user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }

  // Clear stored user data
  private clearUser(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
    }
  }

  // Setup automatic token refresh
  setupTokenRefresh(): void {
    if (typeof window === 'undefined') return;

    // Refresh token every 23 hours (assuming 24h expiry)
    const refreshInterval = 23 * 60 * 60 * 1000; // 23 hours in milliseconds
    
    setInterval(async () => {
      if (this.isAuthenticated()) {
        try {
          await this.refreshToken();
          console.log('Token refreshed successfully');
        } catch (error) {
          console.error('Failed to refresh token:', error);
        }
      }
    }, refreshInterval);
  }

  // Handle authentication errors globally
  handleAuthError(error: any): void {
    if (error.status === 401) {
      // Unauthorized - redirect to login
      this.logout();
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login?expired=true';
      }
    }
  }
}

export const authService = new AuthService();
export default authService;