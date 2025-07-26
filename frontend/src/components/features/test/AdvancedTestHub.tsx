'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Target, 
  Zap, 
  BookOpen, 
  Focus, 
  RotateCcw, 
  Trophy,
  Clock,
  TrendingUp,
  Calendar,
  CheckCircle,
  AlertCircle,
  Play,
  Settings
} from 'lucide-react';

interface TestMode {
  id: string;
  name: string;
  description: string;
  icon: string;
  difficulty: string;
  estimatedTime: string;
}

interface ReviewStats {
  totalWords: number;
  reviewsToday: number;
  masteredWords: number;
  wordsToReview: number;
  overdueWords: number;
  masteryRate: number;
}

interface ReviewItem {
  vocabularyId: string;
  word: string;
  definition: string;
  masteryLevel: number;
  daysSinceLastReview: number;
  isOverdue: boolean;
  priority: number;
}

interface ScheduleItem {
  date: string;
  reviewCount: number;
  workload: 'light' | 'moderate' | 'heavy';
}

const AdvancedTestHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tests' | 'review' | 'schedule' | 'stats'>('tests');
  const [testModes, setTestModes] = useState<TestMode[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [reviewWords, setReviewWords] = useState<ReviewItem[]>([]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [modesRes, statsRes, reviewRes, scheduleRes] = await Promise.all([
        fetch('/api/advanced-tests/modes', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/advanced-tests/review/stats', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/advanced-tests/review/due?limit=5', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/advanced-tests/review/schedule', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      if (modesRes.ok) {
        const modes = await modesRes.json();
        setTestModes(modes.data);
      }

      if (statsRes.ok) {
        const stats = await statsRes.json();
        setReviewStats(stats.data);
      }

      if (reviewRes.ok) {
        const review = await reviewRes.json();
        setReviewWords(review.data.dueWords);
      }

      if (scheduleRes.ok) {
        const scheduleData = await scheduleRes.json();
        setSchedule(scheduleData.data);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: React.ComponentType<any> } = {
      '🧠': Brain,
      '🎯': Target,
      '⚡': Zap,
      '📚': BookOpen,
      '🎪': Focus,
      '🔄': RotateCcw,
      '🏆': Trophy,
    };
    
    const IconComponent = iconMap[iconName] || Brain;
    return <IconComponent className="w-6 h-6" />;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      case 'expert': return 'text-purple-600 bg-purple-100';
      case 'adaptive': return 'text-blue-600 bg-blue-100';
      case 'dynamic': return 'text-indigo-600 bg-indigo-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getWorkloadColor = (workload: string) => {
    switch (workload) {
      case 'light': return 'bg-green-500';
      case 'moderate': return 'bg-yellow-500';
      case 'heavy': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };

  const startTest = async (testMode: TestMode) => {
    // For demo purposes, we'll use some sample vocabulary IDs
    const sampleVocabIds = ['vocab1', 'vocab2', 'vocab3'];
    
    try {
      const response = await fetch('/api/advanced-tests/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          testMode: testMode.id,
          vocabularyIds: sampleVocabIds,
          settings: {
            questionCount: 20,
            enableHints: true,
            enableExplanations: true
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Test session created:', result.data);
        // Navigate to test screen or handle test session
      }
    } catch (error) {
      console.error('Failed to start test:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Advanced Learning Hub</h1>
        <p className="text-gray-600">Intelligent testing and spaced repetition system</p>
      </div>

      {/* Quick Stats */}
      {reviewStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Words</p>
                <p className="text-2xl font-bold text-gray-900">{reviewStats.totalWords}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Mastered</p>
                <p className="text-2xl font-bold text-gray-900">{reviewStats.masteredWords}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Due Today</p>
                <p className="text-2xl font-bold text-gray-900">{reviewStats.wordsToReview}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-gray-900">{reviewStats.overdueWords}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {[
          { id: 'tests', label: 'Test Modes', icon: Target },
          { id: 'review', label: 'Review', icon: RotateCcw },
          { id: 'schedule', label: 'Schedule', icon: Calendar },
          { id: 'stats', label: 'Statistics', icon: TrendingUp }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'tests' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testModes.map((mode) => (
              <div key={mode.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    {getIconComponent(mode.icon)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{mode.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(mode.difficulty)}`}>
                        {mode.difficulty}
                      </span>
                      <span className="text-xs text-gray-500">{mode.estimatedTime}</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-4">{mode.description}</p>
                
                <button
                  onClick={() => startTest(mode)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Play className="w-4 h-4" />
                  Start Test
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'review' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Words Due for Review</h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <Play className="w-4 h-4" />
                Start Review Session
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reviewWords.map((word) => (
                <div key={word.vocabularyId} className="bg-white rounded-lg shadow-md p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">{word.word}</h3>
                    <div className="flex items-center gap-1">
                      {word.isOverdue && <AlertCircle className="w-4 h-4 text-red-500" />}
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        word.masteryLevel >= 4 ? 'bg-green-100 text-green-600' :
                        word.masteryLevel >= 2 ? 'bg-yellow-100 text-yellow-600' :
                        'bg-red-100 text-red-600'
                      }`}>
                        Level {word.masteryLevel}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{word.definition}</p>
                  
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Last reviewed: {word.daysSinceLastReview} days ago</span>
                    <span className="font-medium">Priority: {word.priority}</span>
                  </div>
                </div>
              ))}
            </div>

            {reviewWords.length === 0 && (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-green-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
                <p className="text-gray-600">No words are due for review right now.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Review Schedule</h2>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                {schedule.map((day, index) => (
                  <div key={day.date} className="text-center">
                    <div className="text-sm font-medium text-gray-900 mb-2">
                      {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className="text-xs text-gray-500 mb-3">
                      {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    
                    <div className="space-y-2">
                      <div className={`w-full h-2 rounded-full ${getWorkloadColor(day.workload)}`}></div>
                      <div className="text-sm font-semibold text-gray-900">{day.reviewCount}</div>
                      <div className="text-xs text-gray-500 capitalize">{day.workload}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 flex justify-center gap-6 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Light (≤10)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span>Moderate (11-25)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>Heavy (&gt;25)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'stats' && reviewStats && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Learning Statistics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Mastery Progress */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Mastery Progress</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Overall Mastery Rate</span>
                    <span className="font-bold text-blue-600">{reviewStats.masteryRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-blue-600 h-3 rounded-full transition-all"
                      style={{ width: `${reviewStats.masteryRate}%` }}
                    ></div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{reviewStats.masteredWords}</div>
                      <div className="text-sm text-gray-600">Mastered</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{reviewStats.totalWords - reviewStats.masteredWords}</div>
                      <div className="text-sm text-gray-600">Learning</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Daily Activity */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Today&apos;s Activity</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-gray-600">Reviews Completed</span>
                    </div>
                    <span className="font-bold text-gray-900">{reviewStats.reviewsToday}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-orange-600" />
                      <span className="text-gray-600">Reviews Remaining</span>
                    </div>
                    <span className="font-bold text-gray-900">{reviewStats.wordsToReview}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <span className="text-gray-600">Overdue Words</span>
                    </div>
                    <span className="font-bold text-gray-900">{reviewStats.overdueWords}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AdvancedTestHub;