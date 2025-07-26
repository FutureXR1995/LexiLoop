/**
 * Enhanced Login Page
 * Modern authentication with improved UX
 */

'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoginForm } from '@/components/features/auth/LoginForm';
import { ResponsiveContainer, ResponsiveHeading } from '@/components/layout/ResponsiveLayout';
import { authService } from '@/services/authService';

function LoginContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check for success messages from URL params
  React.useEffect(() => {
    const registered = searchParams.get('registered');
    const resetSuccess = searchParams.get('reset-success');
    
    if (registered === 'true') {
      setSuccessMessage('Account created successfully! Please sign in.');
    } else if (resetSuccess === 'true') {
      setSuccessMessage('Password reset successful! Please sign in with your new password.');
    }
  }, [searchParams]);

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    setError('');
    
    try {
      // Use the authentication service
      const response = await authService.login({ email, password });
      
      // Show success and redirect
      setSuccessMessage('Welcome back! Redirecting...');
      
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (error) {
      console.error('Login error:', error);
      setError(error instanceof Error ? error.message : 'Login failed. Please check your credentials and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <ResponsiveContainer maxWidth="max-w-md">
        <div className="space-y-6 sm:space-y-8">
          {/* Logo */}
          <div className="text-center">
            <ResponsiveHeading level={1} className="text-indigo-600">
              LexiLoop
            </ResponsiveHeading>
            <p className="mt-2 text-sm sm:text-base text-gray-600">
              AI-powered vocabulary learning
            </p>
          </div>

          {/* Login Form */}
          <LoginForm 
            onSubmit={handleLogin} 
            isLoading={isLoading}
            error={error}
            successMessage={successMessage}
          />

          {/* Demo Account Info */}
          <div className="p-3 sm:p-4 bg-blue-50/80 border border-blue-200 rounded-lg backdrop-blur-sm">
            <h3 className="text-sm font-medium text-blue-800 mb-2 flex items-center space-x-1">
              <span>📝</span>
              <span>Demo Account</span>
            </h3>
            <div className="text-xs text-blue-700 space-y-1">
              <p><strong>Email:</strong> demo@lexiloop.com</p>
              <p><strong>Password:</strong> demo123456</p>
              <p className="text-blue-600 mt-2 italic">
                * Development version - Authentication system in progress
              </p>
            </div>
          </div>

          {/* Social Login Options (Future) */}
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-3">Or continue with</p>
            <div className="flex justify-center space-x-3">
              <button 
                disabled
                className="p-2 border border-gray-200 rounded-lg opacity-50 cursor-not-allowed"
                title="Coming soon"
              >
                <div className="w-5 h-5 bg-gray-300 rounded" />
              </button>
              <button 
                disabled
                className="p-2 border border-gray-200 rounded-lg opacity-50 cursor-not-allowed"
                title="Coming soon"
              >
                <div className="w-5 h-5 bg-gray-300 rounded" />
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">Social login coming soon</p>
          </div>

          {/* Links */}
          <div className="text-center">
            <a 
              href="/" 
              className="inline-flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              <span>←</span>
              <span>Back to Homepage</span>
            </a>
          </div>
        </div>
      </ResponsiveContainer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}