/**
 * Enhanced Login Form Component
 * Improved UI/UX with better error handling and accessibility
 */

'use client';

import React, { useState, useEffect } from 'react';
import { ResponsiveButton } from '@/components/layout/ResponsiveLayout';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Eye, EyeOff, AlertCircle, CheckCircle, Mail, Lock, Loader2 } from 'lucide-react';
import { authService } from '@/services/authService';

interface LoginFormProps {
  onSubmit?: (email: string, password: string) => Promise<void>;
  isLoading?: boolean;
  error?: string;
  successMessage?: string;
}

export function LoginForm({ onSubmit, isLoading = false, error, successMessage }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isFormValid, setIsFormValid] = useState(false);

  // Form validation
  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    setIsFormValid(isValid);
    return isValid;
  };

  // Real-time validation
  useEffect(() => {
    if (email || password) {
      const newErrors: { email?: string; password?: string } = {};
      
      if (!email) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(email)) {
        newErrors.email = 'Please enter a valid email address';
      }
      
      if (!password) {
        newErrors.password = 'Password is required';
      } else if (password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
      
      setErrors(newErrors);
      setIsFormValid(Object.keys(newErrors).length === 0);
    }
  }, [email, password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (onSubmit) {
      try {
        await onSubmit(email, password);
        
        // Store remember me preference
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
          localStorage.setItem('rememberedEmail', email);
        } else {
          localStorage.removeItem('rememberMe');
          localStorage.removeItem('rememberedEmail');
        }
      } catch (error) {
        console.error('Login failed:', error);
      }
    }
  };

  // Load remembered email on mount
  useEffect(() => {
    const remembered = localStorage.getItem('rememberMe');
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    
    if (remembered === 'true' && rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl border-0 bg-white/90 backdrop-blur-sm">
      <CardHeader className="space-y-3 text-center p-4 sm:p-6">
        <CardTitle className="text-xl sm:text-2xl font-bold">Welcome back</CardTitle>
        <CardDescription className="text-sm sm:text-base">
          Sign in to continue your vocabulary learning journey
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 p-4 sm:p-6">
          {/* Global Success Message */}
          {successMessage && (
            <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
              <span className="text-sm text-green-700">{successMessage}</span>
            </div>
          )}

          {/* Global Error Message */}
          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          {/* Email Field */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center space-x-1">
              <Mail className="w-4 h-4" />
              <span>Email address</span>
            </label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className={`h-12 pl-4 ${errors.email ? 'border-red-300 focus:border-red-500' : ''}`}
                required
              />
              {email && !errors.email && (
                <CheckCircle className="absolute right-3 top-3.5 w-5 h-5 text-green-500" />
              )}
            </div>
            {errors.email && (
              <p className="text-sm text-red-600 flex items-center space-x-1">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.email}</span>
              </p>
            )}
          </div>
          
          {/* Password Field */}
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-gray-700 flex items-center space-x-1">
              <Lock className="w-4 h-4" />
              <span>Password</span>
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className={`h-12 pl-4 pr-12 ${errors.password ? 'border-red-300 focus:border-red-500' : ''}`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-700 transition-colors"
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-600 flex items-center space-x-1">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.password}</span>
              </p>
            )}
          </div>
          
          {/* Remember Me & Forgot Password */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                disabled={isLoading}
              />
              <span className="text-gray-600">Remember me</span>
            </label>
            <a 
              href="/auth/forgot-password" 
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
            >
              Forgot password?
            </a>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4 p-4 sm:p-6">
          <ResponsiveButton
            type="submit"
            disabled={isLoading || !isFormValid}
            fullWidth
            size="lg"
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 transition-colors"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing in...</span>
              </div>
            ) : (
              'Sign in'
            )}
          </ResponsiveButton>
          
          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">New to LexiLoop?</span>
            </div>
          </div>

          <div className="text-center">
            <a 
              href="/auth/register" 
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              Create an account →
            </a>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}