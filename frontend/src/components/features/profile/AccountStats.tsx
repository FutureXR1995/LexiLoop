/**
 * Account Statistics Component
 * Displays user learning progress and achievements
 */

'use client';

import React, { useState, useEffect } from 'react';
import { User } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { BarChart3, TrendingUp, Clock, Calendar, Award, Book, Target, Zap } from 'lucide-react';
import { progressService } from '@/services/progressService';

interface AccountStatsProps {
  user: User;
}

export function AccountStats({ user }: AccountStatsProps) {
  const [stats, setStats] = useState<any>(null);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [progressStats, userAchievements] = await Promise.all([
          progressService.getProgressStats(),
          progressService.getAchievements()
        ]);
        
        setStats(progressStats);
        setAchievements(userAchievements);
      } catch (error) {
        console.error('Failed to load stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="shadow-lg">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const progressData = [
    { day: 'Mon', words: 12, time: 25 },
    { day: 'Tue', words: 18, time: 35 },
    { day: 'Wed', words: 8, time: 20 },
    { day: 'Thu', words: 22, time: 40 },
    { day: 'Fri', words: 15, time: 30 },
    { day: 'Sat', words: 28, time: 45 },
    { day: 'Sun', words: 20, time: 38 }
  ];

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Study Time</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatTime(stats?.totalStudyTime || 2450)}
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+12% this week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Words Learned</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.wordsLearned || 342}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <Book className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+8 today</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Accuracy Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.averageAccuracy || 78.5}%
                </p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+2.1% this week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Current Streak</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.streakDays || 12} days
                </p>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <Zap className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <Calendar className="w-4 h-4 text-gray-500 mr-1" />
              <span className="text-gray-600">Best: 28 days</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Progress Chart */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>Weekly Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Words learned this week</span>
              <span>Study time this week</span>
            </div>
            
            <div className="grid grid-cols-7 gap-2">
              {progressData.map((day, index) => (
                <div key={day.day} className="text-center space-y-2">
                  <div className="text-xs font-medium text-gray-600">{day.day}</div>
                  
                  {/* Words Bar */}
                  <div className="relative h-20 bg-gray-100 rounded-md overflow-hidden">
                    <div
                      className="absolute bottom-0 w-full bg-blue-500 transition-all duration-300"
                      style={{ height: `${(day.words / 30) * 100}%` }}
                    />
                    <div className="absolute inset-0 flex items-end justify-center pb-1">
                      <span className="text-xs font-medium text-gray-700">{day.words}</span>
                    </div>
                  </div>
                  
                  {/* Time Bar */}
                  <div className="relative h-12 bg-gray-100 rounded-md overflow-hidden">
                    <div
                      className="absolute bottom-0 w-full bg-green-500 transition-all duration-300"
                      style={{ height: `${(day.time / 50) * 100}%` }}
                    />
                    <div className="absolute inset-0 flex items-end justify-center pb-1">
                      <span className="text-xs font-medium text-gray-700">{day.time}m</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex items-center justify-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span>Words</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>Time (minutes)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="w-5 h-5" />
            <span>Recent Achievements</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.slice(0, 6).map((achievement) => (
              <div
                key={achievement.id}
                className={`p-4 rounded-lg border-2 ${
                  achievement.unlockedAt
                    ? 'border-yellow-200 bg-yellow-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{achievement.unlockedAt ? '🏆' : '🔒'}</div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{achievement.title}</h4>
                    <p className="text-xs text-gray-600 mt-1">{achievement.description}</p>
                    
                    {achievement.progress !== undefined && !achievement.unlockedAt && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{achievement.progress}/{achievement.target}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                    
                    {achievement.unlockedAt && (
                      <p className="text-xs text-yellow-600 mt-1">
                        Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Level Progress */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Learning Level Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-lg">
                  {user.level.charAt(0).toUpperCase() + user.level.slice(1)} Learner
                </h3>
                <p className="text-sm text-gray-600">
                  {stats?.nextLevelProgress || 65.8}% to next level
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-indigo-600">
                  Level {user.level === 'beginner' ? '1' : user.level === 'intermediate' ? '2' : '3'}
                </div>
                <div className="text-sm text-gray-600">342 XP</div>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${stats?.nextLevelProgress || 65.8}%` }}
              />
            </div>
            
            <div className="flex justify-between text-sm text-gray-600">
              <span>Current Level</span>
              <span>158 XP to next level</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}