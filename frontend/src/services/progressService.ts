/**
 * Progress Service
 * Handles learning progress tracking and analytics
 */

import { apiClient, ApiResponse, LearningProgress, SessionSummary } from '@/lib/api';

interface ProgressStats {
  totalStudyTime: number;
  wordsLearned: number;
  averageAccuracy: number;
  streakDays: number;
  level: string;
  nextLevelProgress: number;
}

interface WeeklyGoal {
  id: string;
  type: 'words' | 'time' | 'stories' | 'tests';
  target: number;
  current: number;
  startDate: string;
  endDate: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  iconUrl: string;
  unlockedAt?: string;
  progress?: number;
  target?: number;
}

interface StudyStreak {
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string;
  streakStartDate: string;
}

class ProgressService {
  // Get user's overall learning progress
  async getLearningProgress(): Promise<LearningProgress> {
    try {
      const response = await apiClient.get<ApiResponse<LearningProgress>>('/progress/overview');
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to fetch learning progress');
    } catch (error) {
      // Fallback with mock data for development
      if (process.env.NODE_ENV === 'development') {
        return this.getMockLearningProgress();
      }
      
      throw error;
    }
  }

  // Get detailed progress statistics
  async getProgressStats(): Promise<ProgressStats> {
    try {
      const response = await apiClient.get<ApiResponse<ProgressStats>>('/progress/stats');
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to fetch progress stats');
    } catch (error) {
      // Fallback with mock data for development
      if (process.env.NODE_ENV === 'development') {
        return {
          totalStudyTime: 2450, // minutes
          wordsLearned: 342,
          averageAccuracy: 78.5,
          streakDays: 12,
          level: 'Intermediate',
          nextLevelProgress: 65.8,
        };
      }
      
      throw error;
    }
  }

  // Get study streak information
  async getStudyStreak(): Promise<StudyStreak> {
    try {
      const response = await apiClient.get<ApiResponse<StudyStreak>>('/progress/streak');
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to fetch study streak');
    } catch (error) {
      // Fallback with mock data for development
      if (process.env.NODE_ENV === 'development') {
        return {
          currentStreak: 12,
          longestStreak: 28,
          lastStudyDate: new Date(Date.now() - 86400000).toISOString(), // Yesterday
          streakStartDate: new Date(Date.now() - 12 * 86400000).toISOString(), // 12 days ago
        };
      }
      
      throw error;
    }
  }

  // Log a study session
  async logStudySession(sessionData: {
    type: 'reading' | 'test' | 'review';
    duration: number;
    wordsEncountered?: string[];
    accuracy?: number;
    storyId?: string;
    testId?: string;
  }): Promise<SessionSummary> {
    try {
      const response = await apiClient.post<ApiResponse<SessionSummary>>('/progress/sessions', {
        ...sessionData,
        date: new Date().toISOString(),
      });
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to log study session');
    } catch (error) {
      // Fallback for development
      if (process.env.NODE_ENV === 'development') {
        return {
          id: `session-${Date.now()}`,
          type: sessionData.type,
          date: new Date().toISOString(),
          duration: sessionData.duration,
          wordsLearned: sessionData.wordsEncountered?.length || 0,
          accuracy: sessionData.accuracy || 0,
        };
      }
      
      throw error;
    }
  }

  // Get weekly goals
  async getWeeklyGoals(): Promise<WeeklyGoal[]> {
    try {
      const response = await apiClient.get<ApiResponse<WeeklyGoal[]>>('/progress/goals/weekly');
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to fetch weekly goals');
    } catch (error) {
      // Fallback with mock data for development
      if (process.env.NODE_ENV === 'development') {
        return this.getMockWeeklyGoals();
      }
      
      throw error;
    }
  }

  // Set or update a weekly goal
  async setWeeklyGoal(goal: Omit<WeeklyGoal, 'id' | 'current'>): Promise<WeeklyGoal> {
    try {
      const response = await apiClient.post<ApiResponse<WeeklyGoal>>('/progress/goals/weekly', goal);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to set weekly goal');
    } catch (error) {
      // Fallback for development
      if (process.env.NODE_ENV === 'development') {
        return {
          id: `goal-${Date.now()}`,
          current: 0,
          ...goal,
        };
      }
      
      throw error;
    }
  }

  // Get user achievements
  async getAchievements(): Promise<Achievement[]> {
    try {
      const response = await apiClient.get<ApiResponse<Achievement[]>>('/progress/achievements');
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to fetch achievements');
    } catch (error) {
      // Fallback with mock data for development
      if (process.env.NODE_ENV === 'development') {
        return this.getMockAchievements();
      }
      
      throw error;
    }
  }

  // Get progress analytics for charts
  async getProgressAnalytics(timeRange: 'week' | 'month' | 'year' = 'month'): Promise<{
    studyTime: { date: string; minutes: number }[];
    wordsLearned: { date: string; count: number }[];
    accuracy: { date: string; percentage: number }[];
  }> {
    try {
      const response = await apiClient.get<ApiResponse<any>>(`/progress/analytics?range=${timeRange}`);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to fetch progress analytics');
    } catch (error) {
      // Fallback with mock data for development
      if (process.env.NODE_ENV === 'development') {
        return this.getMockProgressAnalytics(timeRange);
      }
      
      throw error;
    }
  }

  // Get leaderboard (if feature exists)
  async getLeaderboard(type: 'words' | 'time' | 'streak' = 'words', limit: number = 10): Promise<{
    rank: number;
    username: string;
    value: number;
    isCurrentUser: boolean;
  }[]> {
    try {
      const response = await apiClient.get<ApiResponse<any[]>>(`/progress/leaderboard?type=${type}&limit=${limit}`);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to fetch leaderboard');
    } catch (error) {
      // Fallback with mock data for development
      if (process.env.NODE_ENV === 'development') {
        return this.getMockLeaderboard(type, limit);
      }
      
      throw error;
    }
  }

  // Export progress data
  async exportProgressData(format: 'json' | 'csv' = 'json'): Promise<Blob> {
    try {
      const response = await fetch(`${apiClient['config'].baseUrl}/progress/export?format=${format}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to export progress data');
      }
      
      return await response.blob();
    } catch (error) {
      // Fallback for development
      if (process.env.NODE_ENV === 'development') {
        const mockData = {
          exportDate: new Date().toISOString(),
          progress: this.getMockLearningProgress(),
          sessions: this.getMockLearningProgress().recentSessions,
        };
        
        const blob = new Blob([JSON.stringify(mockData, null, 2)], {
          type: format === 'json' ? 'application/json' : 'text/csv'
        });
        
        return blob;
      }
      
      throw error;
    }
  }

  // Mock data methods for development
  private getMockLearningProgress(): LearningProgress {
    return {
      totalWords: 1247,
      masteredWords: 342,
      wordsInProgress: 156,
      dailyStreak: 12,
      weeklyGoal: 50,
      weeklyProgress: 32,
      recentSessions: [
        {
          id: 'session-1',
          type: 'reading',
          date: '2024-01-15T14:00:00Z',
          duration: 25,
          wordsLearned: 8,
          accuracy: 85.5,
        },
        {
          id: 'session-2',
          type: 'test',
          date: '2024-01-15T15:30:00Z',
          duration: 12,
          wordsLearned: 5,
          accuracy: 78.2,
        },
        {
          id: 'session-3',
          type: 'review',
          date: '2024-01-14T16:45:00Z',
          duration: 18,
          wordsLearned: 3,
          accuracy: 92.1,
        },
      ],
    };
  }

  private getMockWeeklyGoals(): WeeklyGoal[] {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);

    return [
      {
        id: 'goal-words',
        type: 'words',
        target: 50,
        current: 32,
        startDate: startOfWeek.toISOString(),
        endDate: endOfWeek.toISOString(),
      },
      {
        id: 'goal-time',
        type: 'time',
        target: 300, // minutes
        current: 185,
        startDate: startOfWeek.toISOString(),
        endDate: endOfWeek.toISOString(),
      },
      {
        id: 'goal-stories',
        type: 'stories',
        target: 5,
        current: 3,
        startDate: startOfWeek.toISOString(),
        endDate: endOfWeek.toISOString(),
      },
    ];
  }

  private getMockAchievements(): Achievement[] {
    return [
      {
        id: 'first-word',
        title: 'First Steps',
        description: 'Learn your first vocabulary word',
        iconUrl: '/icons/first-word.svg',
        unlockedAt: '2024-01-10T10:00:00Z',
      },
      {
        id: 'week-streak',
        title: 'Week Warrior',
        description: 'Study for 7 consecutive days',
        iconUrl: '/icons/week-streak.svg',
        unlockedAt: '2024-01-12T15:30:00Z',
      },
      {
        id: 'hundred-words',
        title: 'Century Club',
        description: 'Master 100 vocabulary words',
        iconUrl: '/icons/hundred-words.svg',
        progress: 75,
        target: 100,
      },
      {
        id: 'perfect-test',
        title: 'Perfectionist',
        description: 'Score 100% on a vocabulary test',
        iconUrl: '/icons/perfect-test.svg',
      },
    ];
  }

  private getMockProgressAnalytics(timeRange: string) {
    const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 365;
    const studyTime = [];
    const wordsLearned = [];
    const accuracy = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      studyTime.push({
        date: dateStr,
        minutes: Math.floor(Math.random() * 60) + 10,
      });

      wordsLearned.push({
        date: dateStr,
        count: Math.floor(Math.random() * 15) + 2,
      });

      accuracy.push({
        date: dateStr,
        percentage: Math.floor(Math.random() * 30) + 70,
      });
    }

    return { studyTime, wordsLearned, accuracy };
  }

  private getMockLeaderboard(type: string, limit: number) {
    const users = [
      { username: 'Alex_Reader', value: 450 },
      { username: 'VocabMaster', value: 423 },
      { username: 'StudyBuddy', value: 398 },
      { username: 'WordExplorer', value: 376 },
      { username: 'YouCurrentUser', value: 342, isCurrentUser: true },
      { username: 'LanguageLover', value: 321 },
      { username: 'QuizKing', value: 298 },
      { username: 'BookwormBest', value: 276 },
    ];

    return users
      .sort((a, b) => b.value - a.value)
      .slice(0, limit)
      .map((user, index) => ({
        rank: index + 1,
        username: user.username,
        value: user.value,
        isCurrentUser: user.isCurrentUser || false,
      }));
  }
}

export const progressService = new ProgressService();
export default progressService;