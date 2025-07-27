/**
 * Error Review Page
 * Error analysis and review interface for incorrect answers
 */

'use client';

import React, { useState, useEffect } from 'react';
import { ResponsiveContainer } from '@/components/layout/ResponsiveLayout';
import { useAuthState } from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { 
  AlertTriangle, 
  RotateCcw, 
  TrendingDown, 
  BookOpen,
  Clock,
  Target,
  CheckCircle,
  XCircle,
  Eye,
  Filter,
  Calendar
} from 'lucide-react';

interface ErrorItem {
  id: string;
  word: string;
  correctAnswer: string;
  userAnswer: string;
  question: string;
  testType: 'meaning' | 'typing' | 'comprehension';
  storyTitle: string;
  timestamp: string;
  reviewCount: number;
  lastReviewed?: string;
  mastered: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface ErrorStats {
  totalErrors: number;
  errorsByType: {
    meaning: number;
    typing: number;
    comprehension: number;
  };
  masteredCount: number;
  needsReview: number;
  improvementRate: number;
}

export default function ErrorReviewPage() {
  const { user, isLoading } = useAuthState();
  const [activeTab, setActiveTab] = useState('overview');
  const [errors, setErrors] = useState<ErrorItem[]>([]);
  const [filteredErrors, setFilteredErrors] = useState<ErrorItem[]>([]);
  const [stats, setStats] = useState<ErrorStats | null>(null);
  const [filters, setFilters] = useState({
    testType: 'all',
    status: 'all',
    difficulty: 'all',
    timeRange: 'all'
  });
  const [selectedError, setSelectedError] = useState<ErrorItem | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);

  // Mock data - replace with API calls
  const mockErrors: ErrorItem[] = [
    {
      id: '1',
      word: 'ubiquitous',
      correctAnswer: 'existing or being everywhere at the same time',
      userAnswer: 'very common',
      question: 'What does "ubiquitous" mean?',
      testType: 'meaning',
      storyTitle: 'The Digital Age Revolution',
      timestamp: '2024-01-20T10:30:00Z',
      reviewCount: 2,
      lastReviewed: '2024-01-22T15:20:00Z',
      mastered: false,
      difficulty: 'hard'
    },
    {
      id: '2',
      word: 'ephemeral',
      correctAnswer: 'ephemeral',
      userAnswer: 'efemeral',
      question: 'Type the word: lasting for a very short time',
      testType: 'typing',
      storyTitle: 'Seasons of Change',
      timestamp: '2024-01-19T14:15:00Z',
      reviewCount: 3,
      lastReviewed: '2024-01-23T09:45:00Z',
      mastered: true,
      difficulty: 'medium'
    },
    {
      id: '3',
      word: 'serendipity',
      correctAnswer: 'The discovery was made by pure serendipity.',
      userAnswer: 'The discovery was made by accident.',
      question: 'Complete the sentence using "serendipity"',
      testType: 'comprehension',
      storyTitle: 'Unexpected Discoveries',
      timestamp: '2024-01-18T16:45:00Z',
      reviewCount: 1,
      mastered: false,
      difficulty: 'easy'
    }
  ];

  const mockStats: ErrorStats = {
    totalErrors: 45,
    errorsByType: {
      meaning: 18,
      typing: 12,
      comprehension: 15
    },
    masteredCount: 23,
    needsReview: 22,
    improvementRate: 67
  };

  useEffect(() => {
    // Load error data
    setErrors(mockErrors);
    setStats(mockStats);
  }, []);

  useEffect(() => {
    // Apply filters
    let filtered = errors;

    if (filters.testType !== 'all') {
      filtered = filtered.filter(error => error.testType === filters.testType);
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(error => {
        if (filters.status === 'mastered') return error.mastered;
        if (filters.status === 'needs-review') return !error.mastered;
        return true;
      });
    }

    if (filters.difficulty !== 'all') {
      filtered = filtered.filter(error => error.difficulty === filters.difficulty);
    }

    setFilteredErrors(filtered);
  }, [errors, filters]);

  const handleReviewError = async (errorId: string) => {
    setIsReviewing(true);
    
    try {
      // API call to mark error as reviewed
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock delay
      
      setErrors(prev => prev.map(error => 
        error.id === errorId 
          ? { ...error, reviewCount: error.reviewCount + 1, lastReviewed: new Date().toISOString() }
          : error
      ));
    } catch (error) {
      console.error('Failed to review error:', error);
    } finally {
      setIsReviewing(false);
    }
  };

  const handleMarkMastered = async (errorId: string) => {
    try {
      // API call to mark as mastered
      await new Promise(resolve => setTimeout(resolve, 500)); // Mock delay
      
      setErrors(prev => prev.map(error => 
        error.id === errorId 
          ? { ...error, mastered: true }
          : error
      ));
    } catch (error) {
      console.error('Failed to mark as mastered:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 mx-auto">
            <div className="w-full h-full border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-900">Loading Error Review</h2>
            <p className="text-sm text-gray-600">Analyzing your learning mistakes...</p>
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
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-900">Authentication Required</h2>
            <p className="text-sm text-gray-600">Please log in to access your error review.</p>
            <a 
              href="/auth/login" 
              className="inline-block mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Go to Login
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
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
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                  <span>Error Review</span>
                </h1>
                <p className="text-sm text-gray-600 mt-1">Learn from your mistakes and improve</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Signed in as</span>
              <span className="font-medium text-red-600">{user.email}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ResponsiveContainer maxWidth="max-w-6xl">
          <div className="space-y-8">
            {/* Tabs Navigation */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3 h-auto p-1 bg-gray-100 rounded-lg">
                <TabsTrigger 
                  value="overview" 
                  className="flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-md transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <TrendingDown className="w-4 h-4" />
                  <span className="hidden sm:inline">Overview</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="errors" 
                  className="flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-md transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <XCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">Error List</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="review" 
                  className="flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-md transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span className="hidden sm:inline">Review Session</span>
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="mt-8 space-y-6">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total Errors</p>
                          <p className="text-2xl font-bold text-red-600">{stats?.totalErrors}</p>
                        </div>
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Mastered</p>
                          <p className="text-2xl font-bold text-green-600">{stats?.masteredCount}</p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-500" />
                      </div>
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${((stats?.masteredCount || 0) / (stats?.totalErrors || 1)) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Needs Review</p>
                          <p className="text-2xl font-bold text-orange-600">{stats?.needsReview}</p>
                        </div>
                        <Clock className="w-8 h-8 text-orange-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Improvement</p>
                          <p className="text-2xl font-bold text-blue-600">{stats?.improvementRate}%</p>
                        </div>
                        <Target className="w-8 h-8 text-blue-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Error Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Error Distribution by Test Type</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(stats?.errorsByType || {}).map(([type, count]) => (
                        <div key={type} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${
                              type === 'meaning' ? 'bg-red-500' :
                              type === 'typing' ? 'bg-orange-500' : 'bg-blue-500'
                            }`}></div>
                            <span className="text-sm font-medium text-gray-700 capitalize">{type}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">{count} errors</span>
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  type === 'meaning' ? 'bg-red-500' :
                                  type === 'typing' ? 'bg-orange-500' : 'bg-blue-500'
                                }`}
                                style={{ width: `${(count / (stats?.totalErrors || 1)) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Error List Tab */}
              <TabsContent value="errors" className="mt-8 space-y-6">
                {/* Filters */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <Filter className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Filters</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <select
                        value={filters.testType}
                        onChange={(e) => setFilters(prev => ({ ...prev, testType: e.target.value }))}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      >
                        <option value="all">All Types</option>
                        <option value="meaning">Meaning</option>
                        <option value="typing">Typing</option>
                        <option value="comprehension">Comprehension</option>
                      </select>

                      <select
                        value={filters.status}
                        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      >
                        <option value="all">All Status</option>
                        <option value="needs-review">Needs Review</option>
                        <option value="mastered">Mastered</option>
                      </select>

                      <select
                        value={filters.difficulty}
                        onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value }))}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      >
                        <option value="all">All Difficulties</option>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>

                      <select
                        value={filters.timeRange}
                        onChange={(e) => setFilters(prev => ({ ...prev, timeRange: e.target.value }))}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      >
                        <option value="all">All Time</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>

                {/* Error List */}
                <div className="space-y-4">
                  {filteredErrors.map((error) => (
                    <Card key={error.id} className={`transition-all duration-200 hover:shadow-md ${
                      error.mastered ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                    }`}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">{error.word}</h3>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                error.testType === 'meaning' ? 'bg-red-100 text-red-700' :
                                error.testType === 'typing' ? 'bg-orange-100 text-orange-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {error.testType}
                              </span>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                error.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                                error.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {error.difficulty}
                              </span>
                              {error.mastered && (
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                                  Mastered
                                </span>
                              )}
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-2">{error.question}</p>
                            
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <XCircle className="w-4 h-4 text-red-500" />
                                <span className="text-sm text-gray-600">Your answer:</span>
                                <span className="text-sm font-medium text-red-600">{error.userAnswer}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span className="text-sm text-gray-600">Correct answer:</span>
                                <span className="text-sm font-medium text-green-600">{error.correctAnswer}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-4 mt-4 text-xs text-gray-500">
                              <span>From: {error.storyTitle}</span>
                              <span>•</span>
                              <span>Reviewed {error.reviewCount} times</span>
                              <span>•</span>
                              <span>{new Date(error.timestamp).toLocaleDateString()}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => setSelectedError(error)}
                              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                              title="View details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            
                            <button
                              onClick={() => handleReviewError(error.id)}
                              disabled={isReviewing}
                              className="px-3 py-1 text-xs font-medium text-orange-700 bg-orange-100 hover:bg-orange-200 rounded-md transition-colors disabled:opacity-50"
                            >
                              Review
                            </button>
                            
                            {!error.mastered && (
                              <button
                                onClick={() => handleMarkMastered(error.id)}
                                className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-md transition-colors"
                              >
                                Mark Mastered
                              </button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Review Session Tab */}
              <TabsContent value="review" className="mt-8 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <RotateCcw className="w-5 h-5" />
                      <span>Review Session</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 mx-auto bg-orange-100 rounded-full flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-orange-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Focused Review Session</h3>
                      <p className="text-gray-600 max-w-md mx-auto">
                        Start a focused review session to practice your most challenging words and improve your understanding.
                      </p>
                      
                      <div className="flex justify-center space-x-4 mt-6">
                        <button className="px-6 py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors">
                          Start Review Session
                        </button>
                        <button className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors">
                          Quick Practice
                        </button>
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