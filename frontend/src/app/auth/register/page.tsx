/**
 * Registration Page
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RegisterForm } from '@/components/features/auth/RegisterForm';

interface RegisterData {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  password: string;
  level: string;
}

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (data: RegisterData) => {
    setIsLoading(true);
    
    try {
      // TODO: Implement actual registration API call
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const responseData = await response.json();
        
        // Show success message
        alert('Account created successfully! Please check your email to verify your account.');
        
        // Redirect to login page
        router.push('/auth/login?registered=true');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      // TODO: Show error message to user
      alert('Registration failed. Please try again.');
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
          <p className="mt-2 text-gray-600">Start your vocabulary learning journey</p>
        </div>

        {/* Registration Form */}
        <RegisterForm onSubmit={handleRegister} isLoading={isLoading} />

        {/* Development Notice */}
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-sm font-medium text-yellow-800 mb-2">
            🚧 Development Phase
          </h3>
          <p className="text-xs text-yellow-700">
            Registration is partially implemented. In the current phase, you can create an account 
            but some features like email verification are still in development.
          </p>
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