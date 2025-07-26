/**
 * Authentication Context
 * Manages user authentication state and operations
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiService } from '../services/ApiService';

export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  level: string;
  preferences: any;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  updateUser: (userData: Partial<User>) => Promise<boolean>;
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
  firstName?: string;
  lastName?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const [storedToken, storedUser] = await Promise.all([
        AsyncStorage.getItem('auth_token'),
        AsyncStorage.getItem('user_data'),
      ]);

      if (storedToken && storedUser) {
        const user = JSON.parse(storedUser);
        setAuthState({
          user,
          token: storedToken,
          isLoading: false,
          isAuthenticated: true,
        });
        
        // Set token for API requests
        ApiService.setAuthToken(storedToken);
        
        // Verify token is still valid
        const isValid = await refreshToken();
        if (!isValid) {
          await logout();
        }
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Failed to load stored auth:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      const response = await ApiService.post('/auth/login', { email, password });
      
      if (response.success) {
        const { user, token } = response.data;
        
        // Store auth data
        await Promise.all([
          AsyncStorage.setItem('auth_token', token),
          AsyncStorage.setItem('user_data', JSON.stringify(user)),
        ]);
        
        // Set token for API requests
        ApiService.setAuthToken(token);
        
        setAuthState({
          user,
          token,
          isLoading: false,
          isAuthenticated: true,
        });
        
        return true;
      }
      
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  }, []);

  const register = useCallback(async (userData: RegisterData): Promise<boolean> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      const response = await ApiService.post('/auth/register', userData);
      
      if (response.success) {
        const { user, token } = response.data;
        
        // Store auth data
        await Promise.all([
          AsyncStorage.setItem('auth_token', token),
          AsyncStorage.setItem('user_data', JSON.stringify(user)),
        ]);
        
        // Set token for API requests
        ApiService.setAuthToken(token);
        
        setAuthState({
          user,
          token,
          isLoading: false,
          isAuthenticated: true,
        });
        
        return true;
      }
      
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return false;
    } catch (error) {
      console.error('Registration failed:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      // Clear stored data
      await Promise.all([
        AsyncStorage.removeItem('auth_token'),
        AsyncStorage.removeItem('user_data'),
      ]);
      
      // Clear API token
      ApiService.setAuthToken(null);
      
      setAuthState({
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, []);

  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      if (!authState.token) return false;
      
      const response = await ApiService.post('/auth/refresh');
      
      if (response.success) {
        const { token } = response.data;
        
        await AsyncStorage.setItem('auth_token', token);
        ApiService.setAuthToken(token);
        
        setAuthState(prev => ({ ...prev, token }));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }, [authState.token]);

  const updateUser = useCallback(async (userData: Partial<User>): Promise<boolean> => {
    try {
      const response = await ApiService.put('/auth/profile', userData);
      
      if (response.success) {
        const updatedUser = { ...authState.user, ...response.data };
        
        await AsyncStorage.setItem('user_data', JSON.stringify(updatedUser));
        
        setAuthState(prev => ({ ...prev, user: updatedUser }));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('User update failed:', error);
      return false;
    }
  }, [authState.user]);

  const contextValue: AuthContextType = {
    ...authState,
    login,
    register,
    logout,
    refreshToken,
    updateUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};