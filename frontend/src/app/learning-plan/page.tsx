/**
 * Learning Plan Settings Page
 * Personalized learning configuration and plan management
 */

'use client';

import React, { useState, useEffect } from 'react';
import { ResponsiveContainer } from '@/components/layout/ResponsiveLayout';
import { useAuthState } from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { 
  Brain, 
  Target, 
  Calendar, 
  Clock, 
  Settings, 
  TrendingUp,
  BookOpen,
  Award,
  BarChart3
} from 'lucide-react';

interface LearningPlan {
  id: string;
  name: string;
  description: string;
  targetWordsPerDay: number;
  sessionDuration: number; // minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'mixed';
  focus: 'vocabulary' | 'reading' | 'comprehension' | 'balanced';
  schedule: {
    days: string[];
    reminders: boolean;
    preferredTime: string;
  };
  goals: {
    weekly: number;
    monthly: number;
    streakTarget: number;
  };
}

export default function LearningPlanPage() {
  const { user, isLoading } = useAuthState();
  const [activeTab, setActiveTab] = useState('overview');
  const [currentPlan, setCurrentPlan] = useState<LearningPlan | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Mock data - replace with API calls
  const mockPlan: LearningPlan = {
    id: '1',
    name: 'Intermediate Vocabulary Builder',
    description: 'Focused on building intermediate-level vocabulary through stories and tests',
    targetWordsPerDay: 15,
    sessionDuration: 30,
    difficulty: 'intermediate',
    focus: 'balanced',
    schedule: {
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      reminders: true,
      preferredTime: '19:00'
    },
    goals: {
      weekly: 105,
      monthly: 450,
      streakTarget: 30
    }
  };

  useEffect(() => {
    // Load user's current learning plan
    setCurrentPlan(mockPlan);
  }, []);

  const handlePlanUpdate = async (updatedPlan: Partial<LearningPlan>) => {
    setIsSaving(true);
    setMessage(null);

    try {
      // API call to update learning plan
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock delay
      
      setCurrentPlan(prev => ({ ...prev!, ...updatedPlan }));
      setMessage({ type: 'success', text: 'Learning plan updated successfully!' });
      
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update learning plan. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 mx-auto">
            <div className="w-full h-full border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-900">Loading Learning Plan</h2>
            <p className="text-sm text-gray-600">Setting up your personalized learning configuration...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center space-y-4 p-8">
          <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
            <Brain className="w-8 h-8 text-red-600" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-900">Authentication Required</h2>
            <p className="text-sm text-gray-600">Please log in to access your learning plan settings.</p>
            <a 
              href="/auth/login" 
              className="inline-block mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Go to Login
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.history.back()}
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                ← Back
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                  <Brain className="w-6 h-6" />
                  <span>Learning Plan</span>
                </h1>
                <p className="text-sm text-gray-600 mt-1">Customize your learning experience</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Signed in as</span>
              <span className="font-medium text-indigo-600">{user.email}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ResponsiveContainer maxWidth="max-w-6xl">
          <div className="space-y-8">
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
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto p-1 bg-gray-100 rounded-lg">
                <TabsTrigger 
                  value="overview" 
                  className="flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-md transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Overview</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="goals" 
                  className="flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-md transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <Target className="w-4 h-4" />
                  <span className="hidden sm:inline">Goals</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="schedule" 
                  className="flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-md transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <Calendar className="w-4 h-4" />
                  <span className="hidden sm:inline">Schedule</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="preferences" 
                  className="flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-md transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Preferences</span>
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="mt-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Current Streak */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Current Streak</p>
                          <p className="text-2xl font-bold text-orange-600">12 days</p>
                        </div>
                        <Award className="w-8 h-8 text-orange-500" />
                      </div>
                      <div className="mt-4">
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Goal: {currentPlan?.goals.streakTarget} days</span>
                          <span>{Math.round((12 / (currentPlan?.goals.streakTarget || 30)) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(12 / (currentPlan?.goals.streakTarget || 30)) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Words This Week */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">This Week</p>
                          <p className="text-2xl font-bold text-green-600">89 words</p>
                        </div>
                        <BookOpen className="w-8 h-8 text-green-500" />
                      </div>
                      <div className="mt-4">
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Goal: {currentPlan?.goals.weekly} words</span>
                          <span>{Math.round((89 / (currentPlan?.goals.weekly || 105)) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(89 / (currentPlan?.goals.weekly || 105)) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Session Time */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Avg. Session</p>
                          <p className="text-2xl font-bold text-blue-600">28 min</p>
                        </div>
                        <Clock className="w-8 h-8 text-blue-500" />
                      </div>
                      <div className="mt-4">
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Target: {currentPlan?.sessionDuration} min</span>
                          <span>{Math.round((28 / (currentPlan?.sessionDuration || 30)) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(28 / (currentPlan?.sessionDuration || 30)) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Current Plan Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="w-5 h-5" />
                      <span>Current Learning Plan</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">{currentPlan?.name}</h3>
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-full">
                        {currentPlan?.difficulty}
                      </span>
                    </div>
                    <p className="text-gray-600">{currentPlan?.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-gray-900">{currentPlan?.targetWordsPerDay}</p>
                        <p className="text-sm text-gray-600">Words per day</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-gray-900">{currentPlan?.sessionDuration}</p>
                        <p className="text-sm text-gray-600">Minutes per session</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-gray-900">{currentPlan?.schedule.days.length}</p>
                        <p className="text-sm text-gray-600">Days per week</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Goals Tab */}
              <TabsContent value="goals" className="mt-8 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Learning Goals</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Words per day
                        </label>
                        <input
                          type="number"
                          min="5"
                          max="50"
                          value={currentPlan?.targetWordsPerDay || 15}
                          onChange={(e) => handlePlanUpdate({ targetWordsPerDay: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">Recommended: 10-20 words per day</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Session duration (minutes)
                        </label>
                        <input
                          type="number"
                          min="15"
                          max="120"
                          value={currentPlan?.sessionDuration || 30}
                          onChange={(e) => handlePlanUpdate({ sessionDuration: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">Optimal learning sessions: 20-45 minutes</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Streak target (days)
                        </label>
                        <input
                          type="number"
                          min="7"
                          max="365"
                          value={currentPlan?.goals.streakTarget || 30}
                          onChange={(e) => handlePlanUpdate({ 
                            goals: { ...currentPlan!.goals, streakTarget: parseInt(e.target.value) }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">Challenge yourself with a streak goal</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Schedule Tab */}
              <TabsContent value="schedule" className="mt-8 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Learning Schedule</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Learning days
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                        {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                          <label key={day} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={currentPlan?.schedule.days.includes(day) || false}
                              onChange={(e) => {
                                const updatedDays = e.target.checked
                                  ? [...(currentPlan?.schedule.days || []), day]
                                  : (currentPlan?.schedule.days || []).filter(d => d !== day);
                                handlePlanUpdate({
                                  schedule: { ...currentPlan!.schedule, days: updatedDays }
                                });
                              }}
                              className="rounded border-gray-300"
                            />
                            <span className="text-sm capitalize">{day.slice(0, 3)}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preferred learning time
                      </label>
                      <input
                        type="time"
                        value={currentPlan?.schedule.preferredTime || '19:00'}
                        onChange={(e) => handlePlanUpdate({
                          schedule: { ...currentPlan!.schedule, preferredTime: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="reminders"
                        checked={currentPlan?.schedule.reminders || false}
                        onChange={(e) => handlePlanUpdate({
                          schedule: { ...currentPlan!.schedule, reminders: e.target.checked }
                        })}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor="reminders" className="text-sm font-medium text-gray-700">
                        Enable learning reminders
                      </label>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Preferences Tab */}
              <TabsContent value="preferences" className="mt-8 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Learning Preferences</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Difficulty level
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                          { value: 'beginner', label: 'Beginner', desc: 'Basic vocabulary and simple stories' },
                          { value: 'intermediate', label: 'Intermediate', desc: 'Moderate complexity with varied topics' },
                          { value: 'advanced', label: 'Advanced', desc: 'Complex vocabulary and sophisticated content' },
                          { value: 'mixed', label: 'Mixed', desc: 'Adaptive difficulty based on performance' }
                        ].map((option) => (
                          <label
                            key={option.value}
                            className={`cursor-pointer rounded-lg border p-4 hover:bg-gray-50 transition-colors ${
                              currentPlan?.difficulty === option.value
                                ? 'border-indigo-500 bg-indigo-50'
                                : 'border-gray-200'
                            }`}
                          >
                            <input
                              type="radio"
                              name="difficulty"
                              value={option.value}
                              checked={currentPlan?.difficulty === option.value}
                              onChange={(e) => handlePlanUpdate({ difficulty: e.target.value as any })}
                              className="sr-only"
                            />
                            <div>
                              <div className="font-medium text-gray-900">{option.label}</div>
                              <div className="text-sm text-gray-500">{option.desc}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Learning focus
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                          { value: 'vocabulary', label: 'Vocabulary Building', desc: 'Focus on learning new words' },
                          { value: 'reading', label: 'Reading Comprehension', desc: 'Improve reading and understanding' },
                          { value: 'comprehension', label: 'Context Understanding', desc: 'Master word usage in context' },
                          { value: 'balanced', label: 'Balanced Approach', desc: 'Equal focus on all aspects' }
                        ].map((option) => (
                          <label
                            key={option.value}
                            className={`cursor-pointer rounded-lg border p-4 hover:bg-gray-50 transition-colors ${
                              currentPlan?.focus === option.value
                                ? 'border-indigo-500 bg-indigo-50'
                                : 'border-gray-200'
                            }`}
                          >
                            <input
                              type="radio"
                              name="focus"
                              value={option.value}
                              checked={currentPlan?.focus === option.value}
                              onChange={(e) => handlePlanUpdate({ focus: e.target.value as any })}
                              className="sr-only"
                            />
                            <div>
                              <div className="font-medium text-gray-900">{option.label}</div>
                              <div className="text-sm text-gray-500">{option.desc}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </ResponsiveContainer>
      </main>
    </div>
  );
}