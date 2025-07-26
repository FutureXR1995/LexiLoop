/**
 * Authentication Provider
 * Provides authentication context to the entire application
 */

'use client';

import React, { createContext, useContext } from 'react';
import { useAuthState } from '@/hooks/useAuth';
import { User } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: any) => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuthState();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

// Loading component for auth initialization
export function AuthLoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 mx-auto">
          <div className="w-full h-full border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-900">Loading LexiLoop</h2>
          <p className="text-sm text-gray-600">Initializing your learning environment...</p>
        </div>
      </div>
    </div>
  );
}

// Protected route wrapper
interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return fallback || <AuthLoadingScreen />;
  }

  if (!isAuthenticated) {
    // Redirect to login
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
    return fallback || <AuthLoadingScreen />;
  }

  return <>{children}</>;
}

// Guest only route wrapper (redirects authenticated users)
interface GuestOnlyRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function GuestOnlyRoute({ children, redirectTo = '/dashboard' }: GuestOnlyRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  if (isAuthenticated) {
    // Redirect authenticated users
    if (typeof window !== 'undefined') {
      window.location.href = redirectTo;
    }
    return <AuthLoadingScreen />;
  }

  return <>{children}</>;
}