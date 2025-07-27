/**
 * Security Settings Component
 * Password and security management
 */

'use client';

import React, { useState } from 'react';
import { User } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ResponsiveButton } from '@/components/layout/ResponsiveLayout';
import { Shield, Key, Eye, EyeOff, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { authService } from '@/services/authService';

interface SecuritySettingsProps {
  user: User;
  onSave: (userData: Partial<User>) => Promise<void>;
  isLoading?: boolean;
}

export function SecuritySettings({ user, onSave, isLoading = false }: SecuritySettingsProps) {
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    return Math.min(100, strength);
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'newPassword') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validatePasswordForm = () => {
    const newErrors: Record<string, string> = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      return;
    }

    setIsChangingPassword(true);
    
    try {
      // In a real app, this would call a password change API
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      // Clear form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      alert('Password changed successfully!');
    } catch (error) {
      console.error('Password change failed:', error);
      setErrors({ submit: 'Failed to change password. Please try again.' });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const getPasswordStrengthColor = (strength: number) => {
    if (strength < 30) return 'bg-red-500';
    if (strength < 60) return 'bg-yellow-500';
    if (strength < 90) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = (strength: number) => {
    if (strength < 30) return 'Weak';
    if (strength < 60) return 'Fair';
    if (strength < 90) return 'Good';
    return 'Strong';
  };

  return (
    <div className="space-y-6">
      {/* Change Password */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Key className="w-5 h-5" />
            <span>Change Password</span>
          </CardTitle>
        </CardHeader>

        <form onSubmit={handlePasswordSubmit}>
          <CardContent className="space-y-4">
            {/* Current Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Current Password *
              </label>
              <div className="relative">
                <Input
                  type={showPasswords.current ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                  placeholder="Enter your current password"
                  className={errors.currentPassword ? 'border-red-300 pr-10' : 'pr-10'}
                  disabled={isChangingPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="text-sm text-red-600">{errors.currentPassword}</p>
              )}
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                New Password *
              </label>
              <div className="relative">
                <Input
                  type={showPasswords.new ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                  placeholder="Enter your new password"
                  className={errors.newPassword ? 'border-red-300 pr-10' : 'pr-10'}
                  disabled={isChangingPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {passwordData.newPassword && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Password Strength:</span>
                    <span className={`text-xs font-medium ${
                      passwordStrength < 30 ? 'text-red-600' :
                      passwordStrength < 60 ? 'text-yellow-600' :
                      passwordStrength < 90 ? 'text-blue-600' : 'text-green-600'
                    }`}>
                      {getPasswordStrengthText(passwordStrength)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrength)}`}
                      style={{ width: `${passwordStrength}%` }}
                    />
                  </div>
                </div>
              )}
              
              {errors.newPassword && (
                <p className="text-sm text-red-600">{errors.newPassword}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Confirm New Password *
              </label>
              <div className="relative">
                <Input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={passwordData.confirmPassword}
                  onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                  placeholder="Confirm your new password"
                  className={errors.confirmPassword ? 'border-red-300 pr-10' : 'pr-10'}
                  disabled={isChangingPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Password Requirements */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li className="flex items-center space-x-2">
                  <CheckCircle className={`w-3 h-3 ${passwordData.newPassword.length >= 8 ? 'text-green-500' : 'text-gray-400'}`} />
                  <span>At least 8 characters long</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className={`w-3 h-3 ${/[a-z]/.test(passwordData.newPassword) ? 'text-green-500' : 'text-gray-400'}`} />
                  <span>Contains lowercase letters</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className={`w-3 h-3 ${/[A-Z]/.test(passwordData.newPassword) ? 'text-green-500' : 'text-gray-400'}`} />
                  <span>Contains uppercase letters</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className={`w-3 h-3 ${/[0-9]/.test(passwordData.newPassword) ? 'text-green-500' : 'text-gray-400'}`} />
                  <span>Contains numbers</span>
                </li>
              </ul>
            </div>

            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{errors.submit}</p>
              </div>
            )}
          </CardContent>

          <CardFooter>
            <ResponsiveButton
              type="submit"
              disabled={isChangingPassword || passwordStrength < 60}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300"
            >
              {isChangingPassword ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Changing Password...</span>
                </div>
              ) : (
                'Change Password'
              )}
            </ResponsiveButton>
          </CardFooter>
        </form>
      </Card>

      {/* Security Status */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Account Security</span>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">Email Verified</p>
                <p className="text-sm text-green-600">Your email address has been verified</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800">Two-Factor Authentication</p>
                <p className="text-sm text-yellow-600">Add an extra layer of security to your account</p>
              </div>
            </div>
            <button className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 transition-colors">
              Enable
            </button>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Recent Activity</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>• Last login: Today at 2:30 PM from Chrome on macOS</p>
              <p>• Password last changed: 30 days ago</p>
              <p>• Account created: {new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}