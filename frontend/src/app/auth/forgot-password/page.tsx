/**
 * Forgot Password Page
 * Enhanced password reset functionality
 */

'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ResponsiveContainer, ResponsiveHeading, ResponsiveButton } from '@/components/layout/ResponsiveLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ArrowLeft, Mail, Check, AlertCircle } from 'lucide-react';
import { authService } from '@/services/authService';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!email) {
      setError('Email is required');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      // Use the authentication service
      const response = await authService.forgotPassword(email);
      setIsEmailSent(true);
    } catch (error) {
      console.error('Forgot password error:', error);
      setError(error instanceof Error ? error.message : 'Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setIsLoading(true);
    // Simulate resend delay
    setTimeout(() => {
      setIsLoading(false);
      // Show success message
    }, 2000);
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

          {/* Reset Password Card */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="space-y-2 text-center p-4 sm:p-6">
              <div className="mx-auto w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                {isEmailSent ? (
                  <Check className="w-6 h-6 text-indigo-600" />
                ) : (
                  <Mail className="w-6 h-6 text-indigo-600" />
                )}
              </div>
              
              <CardTitle className="text-xl sm:text-2xl">
                {isEmailSent ? 'Check your email' : 'Reset your password'}
              </CardTitle>
              
              <CardDescription className="text-sm sm:text-base">
                {isEmailSent
                  ? `We&apos;ve sent a password reset link to ${email}`
                  : 'Enter your email address and we&apos;ll send you a link to reset your password'
                }
              </CardDescription>
            </CardHeader>

            {!isEmailSent ? (
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4 p-4 sm:p-6">
                  {error && (
                    <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                      <span className="text-sm text-red-700">{error}</span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email address
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      className="h-12"
                      required
                    />
                  </div>
                </CardContent>

                <CardFooter className="space-y-4 p-4 sm:p-6">
                  <ResponsiveButton
                    type="submit"
                    disabled={isLoading}
                    fullWidth
                    size="lg"
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    {isLoading ? 'Sending...' : 'Send reset link'}
                  </ResponsiveButton>
                </CardFooter>
              </form>
            ) : (
              <CardContent className="space-y-4 p-4 sm:p-6">
                <div className="text-center space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="text-sm font-medium text-green-800 mb-1">
                      Email sent successfully!
                    </h4>
                    <p className="text-xs text-green-700">
                      Check your inbox and spam folder for the password reset link.
                    </p>
                  </div>

                  <div className="text-sm text-gray-600">
                    <p>Didn&apos;t receive the email?</p>
                    <button
                      onClick={handleResendEmail}
                      disabled={isLoading}
                      className="mt-2 text-indigo-600 hover:text-indigo-700 font-medium disabled:opacity-50"
                    >
                      {isLoading ? 'Sending...' : 'Resend email'}
                    </button>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Back to Login */}
          <div className="text-center">
            <button
              onClick={() => router.push('/auth/login')}
              className="inline-flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to sign in</span>
            </button>
          </div>

          {/* Development Notice */}
          <div className="p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="text-sm font-medium text-yellow-800 mb-2">
              🚧 Development Phase
            </h3>
            <p className="text-xs text-yellow-700">
              Password reset functionality is partially implemented. 
              Email sending will be integrated with the backend API.
            </p>
          </div>
        </div>
      </ResponsiveContainer>
    </div>
  );
}