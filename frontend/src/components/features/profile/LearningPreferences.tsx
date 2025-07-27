/**
 * Learning Preferences Component
 * User learning settings and preferences
 */

'use client';

import React, { useState } from 'react';
import { User } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { ResponsiveButton } from '@/components/layout/ResponsiveLayout';
import { Brain, Clock, Target, Volume2, Palette, Loader2 } from 'lucide-react';

interface LearningPreferencesProps {
  user: User;
  onSave: (userData: Partial<User>) => Promise<void>;
  isLoading?: boolean;
}

export function LearningPreferences({ user, onSave, isLoading = false }: LearningPreferencesProps) {
  const [preferences, setPreferences] = useState({
    dailyGoal: 20,
    sessionDuration: 30,
    difficulty: 'adaptive',
    voiceEnabled: true,
    autoPlay: false,
    theme: 'light',
    notifications: true,
    reminderTime: '18:00',
    weeklyGoal: 100,
    preferredTopics: [] as string[],
    studyMode: 'mixed'
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handlePreferenceChange = (key: string, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleTopicToggle = (topic: string) => {
    setPreferences(prev => ({
      ...prev,
      preferredTopics: prev.preferredTopics.includes(topic)
        ? prev.preferredTopics.filter(t => t !== topic)
        : [...prev.preferredTopics, topic]
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // In a real app, this would save learning preferences
      await new Promise(resolve => setTimeout(resolve, 1000));
      setHasChanges(false);
      alert('Learning preferences saved successfully!');
    } catch (error) {
      console.error('Failed to save preferences:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const topicOptions = [
    'Business', 'Technology', 'Science', 'Arts', 'Sports', 
    'Travel', 'Health', 'Education', 'Environment', 'Culture'
  ];

  return (
    <div className="space-y-6">
      {/* Learning Goals */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5" />
            <span>Learning Goals</span>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Daily Word Goal
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={preferences.dailyGoal}
                  onChange={(e) => handlePreferenceChange('dailyGoal', parseInt(e.target.value))}
                  className="flex-1"
                  disabled={isLoading}
                />
                <span className="w-12 text-sm font-medium text-center">{preferences.dailyGoal}</span>
              </div>
              <p className="text-xs text-gray-500">Words to learn per day</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Session Duration
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="10"
                  max="120"
                  step="10"
                  value={preferences.sessionDuration}
                  onChange={(e) => handlePreferenceChange('sessionDuration', parseInt(e.target.value))}
                  className="flex-1"
                  disabled={isLoading}
                />
                <span className="w-12 text-sm font-medium text-center">{preferences.sessionDuration}m</span>
              </div>
              <p className="text-xs text-gray-500">Minutes per study session</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Weekly Goal
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="50"
                max="500"
                step="25"
                value={preferences.weeklyGoal}
                onChange={(e) => handlePreferenceChange('weeklyGoal', parseInt(e.target.value))}
                className="flex-1"
                disabled={isLoading}
              />
              <span className="w-16 text-sm font-medium text-center">{preferences.weeklyGoal} words</span>
            </div>
            <p className="text-xs text-gray-500">Total words to learn per week</p>
          </div>
        </CardContent>
      </Card>

      {/* Learning Preferences */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="w-5 h-5" />
            <span>Learning Style</span>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-3 block">
                Difficulty Level
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                {[
                  { value: 'easy', label: 'Easy', description: 'Comfortable pace' },
                  { value: 'medium', label: 'Medium', description: 'Balanced challenge' },
                  { value: 'hard', label: 'Hard', description: 'Push your limits' },
                  { value: 'adaptive', label: 'Adaptive', description: 'AI adjusts for you' }
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`cursor-pointer rounded-lg border p-3 text-center hover:bg-gray-50 transition-colors ${
                      preferences.difficulty === option.value
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="difficulty"
                      value={option.value}
                      checked={preferences.difficulty === option.value}
                      onChange={(e) => handlePreferenceChange('difficulty', e.target.value)}
                      className="sr-only"
                      disabled={isLoading}
                    />
                    <div className="font-medium text-sm">{option.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{option.description}</div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-3 block">
                Study Mode
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { value: 'reading', label: 'Reading Focus', description: 'Stories and articles' },
                  { value: 'testing', label: 'Test Focus', description: 'Quizzes and exercises' },
                  { value: 'mixed', label: 'Mixed Mode', description: 'Balanced approach' }
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`cursor-pointer rounded-lg border p-3 text-center hover:bg-gray-50 transition-colors ${
                      preferences.studyMode === option.value
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="studyMode"
                      value={option.value}
                      checked={preferences.studyMode === option.value}
                      onChange={(e) => handlePreferenceChange('studyMode', e.target.value)}
                      className="sr-only"
                      disabled={isLoading}
                    />
                    <div className="font-medium text-sm">{option.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{option.description}</div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interface Preferences */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Palette className="w-5 h-5" />
            <span>Interface & Audio</span>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Voice Pronunciation</label>
                  <p className="text-xs text-gray-500">Enable audio pronunciation</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.voiceEnabled}
                  onChange={(e) => handlePreferenceChange('voiceEnabled', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  disabled={isLoading}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Auto-play Audio</label>
                  <p className="text-xs text-gray-500">Automatically play pronunciations</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.autoPlay}
                  onChange={(e) => handlePreferenceChange('autoPlay', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  disabled={isLoading}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Push Notifications</label>
                  <p className="text-xs text-gray-500">Daily study reminders</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.notifications}
                  onChange={(e) => handlePreferenceChange('notifications', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Daily Reminder Time
                </label>
                <input
                  type="time"
                  value={preferences.reminderTime}
                  onChange={(e) => handlePreferenceChange('reminderTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Theme Preference
                </label>
                <select
                  value={preferences.theme}
                  onChange={(e) => handlePreferenceChange('theme', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={isLoading}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="sepia">Sepia</option>
                  <option value="auto">Auto (System)</option>
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preferred Topics */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Preferred Topics</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {topicOptions.map((topic) => (
              <label
                key={topic}
                className={`cursor-pointer rounded-lg border p-3 text-center text-sm hover:bg-gray-50 transition-colors ${
                  preferences.preferredTopics.includes(topic)
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200'
                }`}
              >
                <input
                  type="checkbox"
                  checked={preferences.preferredTopics.includes(topic)}
                  onChange={() => handleTopicToggle(topic)}
                  className="sr-only"
                  disabled={isLoading}
                />
                <div className="font-medium">{topic}</div>
              </label>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Select topics you&apos;re interested in for personalized content
          </p>
        </CardContent>

        <CardFooter>
          <ResponsiveButton
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300"
          >
            {isSaving ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </div>
            ) : (
              'Save Preferences'
            )}
          </ResponsiveButton>
        </CardFooter>
      </Card>
    </div>
  );
}