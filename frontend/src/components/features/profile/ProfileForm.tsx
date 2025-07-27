/**
 * Profile Form Component
 * User information editing form
 */

'use client';

import React, { useState, useEffect } from 'react';
import { User } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ResponsiveButton } from '@/components/layout/ResponsiveLayout';
import { User as UserIcon, Mail, MapPin, Phone, Calendar, Loader2 } from 'lucide-react';

interface ProfileFormProps {
  user: User;
  onSave: (userData: Partial<User>) => Promise<void>;
  isLoading?: boolean;
}

export function ProfileForm({ user, onSave, isLoading = false }: ProfileFormProps) {
  const [formData, setFormData] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    username: user.username || '',
    email: user.email || '',
    phone: '',
    location: '',
    bio: '',
    website: '',
    birthDate: '',
    level: user.level || 'beginner'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      username: user.username || '',
      email: user.email || '',
      phone: '',
      location: '',
      bio: '',
      website: '',
      birthDate: '',
      level: user.level || 'beginner'
    });
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.website && !formData.website.startsWith('http')) {
      newErrors.website = 'Website must start with http:// or https://';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSave({
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        email: formData.email,
        level: formData.level
      });
      
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  };

  const levelOptions = [
    { value: 'beginner', label: 'Beginner', description: 'Just starting out' },
    { value: 'intermediate', label: 'Intermediate', description: 'Building vocabulary' },
    { value: 'advanced', label: 'Advanced', description: 'Expanding knowledge' },
    { value: 'expert', label: 'Expert', description: 'Mastering nuances' }
  ];

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <UserIcon className="w-5 h-5" />
          <span>Personal Information</span>
        </CardTitle>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                First Name *
              </label>
              <Input
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                placeholder="Enter your first name"
                className={errors.firstName ? 'border-red-300' : ''}
                disabled={isLoading}
              />
              {errors.firstName && (
                <p className="text-sm text-red-600">{errors.firstName}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Last Name *
              </label>
              <Input
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder="Enter your last name"
                className={errors.lastName ? 'border-red-300' : ''}
                disabled={isLoading}
              />
              {errors.lastName && (
                <p className="text-sm text-red-600">{errors.lastName}</p>
              )}
            </div>
          </div>

          {/* Username and Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center space-x-1">
                <UserIcon className="w-4 h-4" />
                <span>Username *</span>
              </label>
              <Input
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="Choose a username"
                className={errors.username ? 'border-red-300' : ''}
                disabled={isLoading}
              />
              {errors.username && (
                <p className="text-sm text-red-600">{errors.username}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center space-x-1">
                <Mail className="w-4 h-4" />
                <span>Email Address *</span>
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter your email"
                className={errors.email ? 'border-red-300' : ''}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email}</p>
              )}
            </div>
          </div>

          {/* Learning Level */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Learning Level
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {levelOptions.map((option) => (
                <label
                  key={option.value}
                  className={`relative cursor-pointer rounded-lg border p-4 hover:bg-gray-50 transition-colors ${
                    formData.level === option.value
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="level"
                    value={option.value}
                    checked={formData.level === option.value}
                    onChange={(e) => handleInputChange('level', e.target.value)}
                    className="sr-only"
                    disabled={isLoading}
                  />
                  <div className="text-center">
                    <div className="font-medium text-gray-900">{option.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{option.description}</div>
                  </div>
                  {formData.level === option.value && (
                    <div className="absolute top-2 right-2 text-indigo-500">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                        <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                      </svg>
                    </div>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Optional Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center space-x-1">
                <Phone className="w-4 h-4" />
                <span>Phone Number</span>
              </label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Your phone number"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span>Location</span>
              </label>
              <Input
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="City, Country"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Bio
            </label>
            <textarea
              rows={4}
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Tell us about yourself and your learning goals..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
              disabled={isLoading}
            />
          </div>

          {/* Website */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Website
            </label>
            <Input
              type="url"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              placeholder="https://your-website.com"
              className={errors.website ? 'border-red-300' : ''}
              disabled={isLoading}
            />
            {errors.website && (
              <p className="text-sm text-red-600">{errors.website}</p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <button
            type="button"
            onClick={() => setFormData({
              firstName: user.firstName || '',
              lastName: user.lastName || '',
              username: user.username || '',
              email: user.email || '',
              phone: '',
              location: '',
              bio: '',
              website: '',
              birthDate: '',
              level: user.level || 'beginner'
            })}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            disabled={isLoading}
          >
            Reset
          </button>

          <ResponsiveButton
            type="submit"
            disabled={isLoading || !hasChanges}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </div>
            ) : (
              'Save Changes'
            )}
          </ResponsiveButton>
        </CardFooter>
      </form>
    </Card>
  );
}