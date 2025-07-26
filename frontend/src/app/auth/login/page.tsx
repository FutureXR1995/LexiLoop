/**
 * Login Page
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from '@/components/features/auth/LoginForm';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // TODO: Implement actual login API call
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // TODO: Store authentication token
        localStorage.setItem('token', data.token);
        
        // Redirect to dashboard or learning page
        router.push('/learn');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      // TODO: Show error message to user
      alert('Login failed. Please check your credentials and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-indigo-600">LexiLoop</h1>
          <p className="mt-2 text-gray-600">AI-powered vocabulary learning</p>
        </div>

        {/* Login Form */}
        <LoginForm onSubmit={handleLogin} isLoading={isLoading} />

        {/* Demo Account Info */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800 mb-2">
            📝 Demo Account (Phase 1)
          </h3>
          <div className="text-xs text-blue-700 space-y-1">
            <p><strong>Email:</strong> demo@lexiloop.com</p>
            <p><strong>Password:</strong> demo123456</p>
            <p className="text-blue-600 mt-2">
              * This is a development version. Authentication is partially implemented.
            </p>
          </div>
        </div>

        {/* Links */}
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">
            <a href="/" className="text-indigo-600 hover:underline">
              ← Back to Homepage
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}