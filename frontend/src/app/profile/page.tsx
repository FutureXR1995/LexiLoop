/**
 * User Profile Settings Page
 * Comprehensive user account management and preferences
 */

'use client';

import React, { useState, useEffect } from 'react';
import { ProfileHeader } from '@/components/features/profile/ProfileHeader';
import { ProfileForm } from '@/components/features/profile/ProfileForm';
import { SecuritySettings } from '@/components/features/profile/SecuritySettings'; 
import { LearningPreferences } from '@/components/features/profile/LearningPreferences';
import { AccountStats } from '@/components/features/profile/AccountStats';
import { ResponsiveContainer } from '@/components/layout/ResponsiveLayout';
import { useAuthState } from '@/hooks/useAuth';
import { User } from '@/lib/api';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Settings, User as UserIcon, Shield, Brain, BarChart3 } from 'lucide-react';
import PageLayout, { PageContainer } from '@/components/PageLayout';

export default function ProfilePage() {
  const { user, updateProfile, isLoading } = useAuthState();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState<Partial<User>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (user) {
      setProfileData(user);
    }
  }, [user]);

  const handleSaveProfile = async (updatedData: Partial<User>) => {
    setIsSaving(true);
    setMessage(null);

    try {
      await updateProfile(updatedData);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Profile update error:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to update profile'
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 mx-auto">
              <div className="w-full h-full border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-gray-900">Loading Profile</h2>
              <p className="text-sm text-gray-600">Fetching your account information...</p>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!user) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-4 p-8">
            <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-red-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-gray-900">Authentication Required</h2>
              <p className="text-sm text-gray-600">Please log in to access your profile settings.</p>
              <a 
                href="/auth/login" 
                className="inline-block mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Go to Login
              </a>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageContainer>
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.history.back()}
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                ← Back
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                  <Settings className="w-6 h-6" />
                  <span>Account Settings</span>
                </h1>
                <p className="text-sm text-gray-600 mt-1">Manage your profile and preferences</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Signed in as</span>
              <span className="font-medium text-indigo-600">{user.email}</span>
            </div>
          </div>
        </div>
        
        <ResponsiveContainer maxWidth="max-w-6xl">
          <div className="space-y-8">
            {/* Profile Header */}
            <ProfileHeader user={user} />

            {/* Global Message */}
            {message && (
              <div className={`p-4 rounded-lg border ${
                message.type === 'success' 
                  ? 'bg-green-50 border-green-200 text-green-700' 
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}>
                {message.text}
              </div>
            )}

            {/* Tabs Navigation */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 h-auto p-1 bg-gray-100 rounded-lg">
                <TabsTrigger 
                  value="profile" 
                  className="flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-md transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <UserIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Profile</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="security" 
                  className="flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-md transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <Shield className="w-4 h-4" />
                  <span className="hidden sm:inline">Security</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="learning" 
                  className="flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-md transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <Brain className="w-4 h-4" />
                  <span className="hidden sm:inline">Learning</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="stats" 
                  className="flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-md transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Statistics</span>
                </TabsTrigger>

                <TabsTrigger 
                  value="preferences" 
                  className="flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-md transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Preferences</span>
                </TabsTrigger>
              </TabsList>

              {/* Profile Information Tab */}
              <TabsContent value="profile" className="mt-8 space-y-6">
                <ProfileForm 
                  user={profileData as User}
                  onSave={handleSaveProfile}
                  isLoading={isSaving}
                />
              </TabsContent>

              {/* Security Settings Tab */}
              <TabsContent value="security" className="mt-8 space-y-6">
                <SecuritySettings 
                  user={user}
                  onSave={handleSaveProfile}
                  isLoading={isSaving}
                />
              </TabsContent>

              {/* Learning Preferences Tab */}
              <TabsContent value="learning" className="mt-8 space-y-6">
                <LearningPreferences 
                  user={user}
                  onSave={handleSaveProfile}
                  isLoading={isSaving}
                />
              </TabsContent>

              {/* Account Statistics Tab */}
              <TabsContent value="stats" className="mt-8 space-y-6">
                <AccountStats user={user} />
              </TabsContent>

              {/* General Preferences Tab */}
              <TabsContent value="preferences" className="mt-8 space-y-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Preferences</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Email Notifications</label>
                        <p className="text-xs text-gray-500">Receive learning progress updates</p>
                      </div>
                      <input type="checkbox" className="rounded border-gray-300" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Weekly Summary</label>
                        <p className="text-xs text-gray-500">Get weekly learning reports</p>
                      </div>
                      <input type="checkbox" className="rounded border-gray-300" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Achievement Alerts</label>
                        <p className="text-xs text-gray-500">Notifications for milestones</p>
                      </div>
                      <input type="checkbox" className="rounded border-gray-300" defaultChecked />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </ResponsiveContainer>
      </PageContainer>
    </PageLayout>
  );
}