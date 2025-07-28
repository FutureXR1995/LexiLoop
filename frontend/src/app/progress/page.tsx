/**
 * Progress Page
 * Displays user learning progress and analytics
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import PageLayout, { PageContainer } from '@/components/PageLayout';

interface ProgressData {
  totalWordsLearned: number;
  wordsInProgress: number;
  masteredWords: number;
  currentStreak: number;
  bestStreak: number;
  averageAccuracy: number;
  totalStudyTime: number;
  level: string;
  nextReviewCount: number;
}

interface DailyStats {
  date: string;
  studyTime: number;
  wordsLearned: number;
  accuracy: number;
}

export default function ProgressPage() {
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('7d');

  useEffect(() => {
    fetchProgressData();
  }, [selectedPeriod]);

  const fetchProgressData = async () => {
    try {
      // Mock data - in real app, this would fetch from API
      const mockProgress: ProgressData = {
        totalWordsLearned: 124,
        wordsInProgress: 23,
        masteredWords: 101,
        currentStreak: 7,
        bestStreak: 15,
        averageAccuracy: 0.84,
        totalStudyTime: 1450, // minutes
        level: 'intermediate',
        nextReviewCount: 12
      };

      const mockDailyStats: DailyStats[] = [
        { date: '2024-01-20', studyTime: 45, wordsLearned: 8, accuracy: 0.87 },
        { date: '2024-01-21', studyTime: 30, wordsLearned: 5, accuracy: 0.82 },
        { date: '2024-01-22', studyTime: 60, wordsLearned: 12, accuracy: 0.91 },
        { date: '2024-01-23', studyTime: 35, wordsLearned: 6, accuracy: 0.78 },
        { date: '2024-01-24', studyTime: 40, wordsLearned: 7, accuracy: 0.85 },
        { date: '2024-01-25', studyTime: 55, wordsLearned: 9, accuracy: 0.89 },
        { date: '2024-01-26', studyTime: 25, wordsLearned: 4, accuracy: 0.80 },
      ];

      setProgress(mockProgress);
      setDailyStats(mockDailyStats);
    } catch (error) {
      console.error('Failed to fetch progress data:', error);
    }
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getLevelProgress = (level: string): number => {
    const levels = ['beginner', 'elementary', 'intermediate', 'upper-intermediate', 'advanced'];
    return ((levels.indexOf(level) + 1) / levels.length) * 100;
  };

  if (!progress) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin text-4xl mb-4">📊</div>
            <p>Loading your progress...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageContainer className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-indigo-600">
            📊 Your Progress
          </h1>
          <p className="text-gray-600">Track your vocabulary learning journey</p>
        </div>
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-2">
                {progress.totalWordsLearned}
              </div>
              <div className="text-sm text-gray-600">Total Words Learned</div>
              <div className="mt-2 text-xs text-green-600">
                +{progress.wordsInProgress} in progress
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {(progress.averageAccuracy * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-gray-600">Average Accuracy</div>
              <div className="mt-2 text-xs text-gray-500">
                Last 30 days
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {progress.currentStreak}
              </div>
              <div className="text-sm text-gray-600">Current Streak</div>
              <div className="mt-2 text-xs text-gray-500">
                Best: {progress.bestStreak} days
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {formatTime(progress.totalStudyTime)}
              </div>
              <div className="text-sm text-gray-600">Total Study Time</div>
              <div className="mt-2 text-xs text-gray-500">
                All time
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Level Progress */}
        <Card>
          <CardHeader>
            <CardTitle>🎯 Current Level: {progress.level.charAt(0).toUpperCase() + progress.level.slice(1)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Progress to next level</span>
                <span>{getLevelProgress(progress.level).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${getLevelProgress(progress.level)}%` }}
                />
              </div>
              <div className="grid grid-cols-5 gap-2 text-xs text-center">
                {['Beginner', 'Elementary', 'Intermediate', 'Upper-Int', 'Advanced'].map((level, index) => (
                  <div
                    key={level}
                    className={`p-2 rounded ${
                      index < (['beginner', 'elementary', 'intermediate', 'upper-intermediate', 'advanced'].indexOf(progress.level) + 1)
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {level}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Daily Activity */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>📈 Daily Activity</CardTitle>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value as '7d' | '30d' | '90d')}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                </select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dailyStats.map((day, index) => (
                  <div key={day.date} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="text-sm font-medium text-gray-900">
                        {new Date(day.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatTime(day.studyTime)}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-sm">
                        <span className="text-indigo-600 font-medium">{day.wordsLearned}</span>
                        <span className="text-gray-500 text-xs ml-1">words</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-green-600 font-medium">
                          {(day.accuracy * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Learning Stats */}
          <Card>
            <CardHeader>
              <CardTitle>🧠 Learning Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Mastery Distribution */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Word Mastery</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Mastered</span>
                    <span className="text-sm font-medium text-green-600">
                      {progress.masteredWords} words
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ 
                        width: `${(progress.masteredWords / progress.totalWordsLearned) * 100}%` 
                      }}
                    />
                  </div>
                  
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-sm text-gray-600">In Progress</span>
                    <span className="text-sm font-medium text-yellow-600">
                      {progress.wordsInProgress} words
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full"
                      style={{ 
                        width: `${(progress.wordsInProgress / progress.totalWordsLearned) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Review Schedule */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Review Schedule</h4>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-bold text-blue-800">
                        {progress.nextReviewCount}
                      </div>
                      <div className="text-sm text-blue-600">
                        words due for review
                      </div>
                    </div>
                    <a
                      href="/review"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
                    >
                      Start Review
                    </a>
                  </div>
                </div>
              </div>

              {/* Achievements */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Recent Achievements</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 p-2 bg-yellow-50 rounded-lg">
                    <span className="text-yellow-600">🏆</span>
                    <span className="text-sm">7-day learning streak!</span>
                  </div>
                  <div className="flex items-center space-x-3 p-2 bg-green-50 rounded-lg">
                    <span className="text-green-600">🎯</span>
                    <span className="text-sm">100 words learned milestone</span>
                  </div>
                  <div className="flex items-center space-x-3 p-2 bg-blue-50 rounded-lg">
                    <span className="text-blue-600">📚</span>
                    <span className="text-sm">Reached intermediate level</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-indigo-200 bg-indigo-50">
            <CardContent className="p-6 text-center">
              <div className="text-2xl mb-2">📖</div>
              <h3 className="font-semibold text-indigo-900 mb-2">Continue Learning</h3>
              <p className="text-sm text-indigo-700 mb-4">
                Generate new stories with AI and learn vocabulary in context
              </p>
              <a
                href="/learn"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
              >
                Start Learning
              </a>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-6 text-center">
              <div className="text-2xl mb-2">🔄</div>
              <h3 className="font-semibold text-green-900 mb-2">Review Words</h3>
              <p className="text-sm text-green-700 mb-4">
                Practice words due for review with spaced repetition
              </p>
              <a
                href="/review"
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700"
              >
                Start Review
              </a>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="p-6 text-center">
              <div className="text-2xl mb-2">🧪</div>
              <h3 className="font-semibold text-purple-900 mb-2">Take Test</h3>
              <p className="text-sm text-purple-700 mb-4">
                Test your knowledge with three-layer assessment
              </p>
              <a
                href="/test"
                className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700"
              >
                Take Test
              </a>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    </PageLayout>
  );
}