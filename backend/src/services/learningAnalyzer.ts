/**
 * Learning Analyzer Service
 * Analyzes user learning patterns and provides personalized recommendations
 */

import { prisma } from './databaseService';
import { logger } from '../utils/logger';

export interface UserLearningProfile {
  userId: string;
  learningStyle: 'visual' | 'auditory' | 'reading' | 'kinesthetic';
  preferredDifficulty: number;
  averageResponseTime: number;
  accuracyTrend: number[];
  strengthAreas: string[];
  weaknessAreas: string[];
  optimalSessionLength: number; // in minutes
  bestLearningTimes: string[];
  retentionRate: number;
  learningVelocity: number; // words per hour
  consistencyScore: number;
}

export interface LearningRecommendation {
  recommendedWords: string[];
  suggestedDifficulty: number;
  optimalStoryType: string;
  recommendedSessionLength: number;
  bestTimeToStudy: string;
  focusAreas: string[];
}

export class LearningAnalyzer {
  /**
   * Analyze user learning behavior and create profile
   */
  async analyzeUserBehavior(userId: string): Promise<UserLearningProfile> {
    logger.info('Analyzing user learning behavior', { userId });

    try {
      // Get user's learning data
      const [sessions, testResults, progress] = await Promise.all([
        this.getUserLearningSessions(userId),
        this.getUserTestResults(userId),
        this.getUserProgress(userId)
      ]);

      if (sessions.length === 0) {
        // Return default profile for new users
        return this.getDefaultProfile(userId);
      }

      const profile: UserLearningProfile = {
        userId,
        learningStyle: this.identifyLearningStyle(testResults),
        preferredDifficulty: this.calculateOptimalDifficulty(testResults, progress),
        averageResponseTime: this.calculateAverageResponseTime(testResults),
        accuracyTrend: this.calculateAccuracyTrend(testResults),
        strengthAreas: this.identifyStrengths(progress),
        weaknessAreas: this.identifyWeaknesses(progress),
        optimalSessionLength: this.calculateOptimalSessionLength(sessions),
        bestLearningTimes: this.identifyBestTimes(sessions),
        retentionRate: this.calculateRetentionRate(progress),
        learningVelocity: this.calculateLearningVelocity(sessions, progress),
        consistencyScore: this.calculateConsistencyScore(sessions)
      };

      // Save profile to database
      await this.saveUserProfile(profile);

      logger.info('User learning profile created', { 
        userId, 
        learningStyle: profile.learningStyle,
        preferredDifficulty: profile.preferredDifficulty 
      });

      return profile;
    } catch (error) {
      logger.error('Failed to analyze user behavior', { userId, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Generate personalized learning recommendations
   */
  async generateRecommendations(userId: string): Promise<LearningRecommendation> {
    const profile = await this.analyzeUserBehavior(userId);
    
    const recommendations: LearningRecommendation = {
      recommendedWords: await this.getRecommendedWords(userId, profile),
      suggestedDifficulty: this.adjustDifficulty(profile),
      optimalStoryType: this.getOptimalStoryType(profile),
      recommendedSessionLength: profile.optimalSessionLength,
      bestTimeToStudy: profile.bestLearningTimes[0] || 'morning',
      focusAreas: profile.weaknessAreas.slice(0, 3)
    };

    logger.info('Generated learning recommendations', { userId, recommendations });
    return recommendations;
  }

  private async getUserLearningSessions(userId: string) {
    return await prisma.learningSession.findMany({
      where: { userId },
      include: {
        testResults: true,
        story: true
      },
      orderBy: { startedAt: 'desc' },
      take: 50 // Last 50 sessions
    });
  }

  private async getUserTestResults(userId: string) {
    return await prisma.testResult.findMany({
      where: { userId },
      include: {
        vocabulary: true
      },
      orderBy: { createdAt: 'desc' },
      take: 200 // Last 200 test results
    });
  }

  private async getUserProgress(userId: string) {
    return await prisma.userProgress.findMany({
      where: { userId },
      include: {
        vocabulary: true
      }
    });
  }

  /**
   * Identify user's learning style based on test performance
   */
  private identifyLearningStyle(testResults: any[]): 'visual' | 'auditory' | 'reading' | 'kinesthetic' {
    if (testResults.length < 10) {
      return 'reading'; // Default for new users
    }

    const performanceByType = testResults.reduce((acc, result) => {
      if (!acc[result.testType]) {
        acc[result.testType] = { correct: 0, total: 0 };
      }
      acc[result.testType].total++;
      if (result.isCorrect) {
        acc[result.testType].correct++;
      }
      return acc;
    }, {} as Record<string, { correct: number; total: number }>);

    // Analyze performance patterns
    const wordMeaningAccuracy = performanceByType.word_meaning?.correct / performanceByType.word_meaning?.total || 0;
    const typingAccuracy = performanceByType.typing?.correct / performanceByType.typing?.total || 0;
    const comprehensionAccuracy = performanceByType.comprehension?.correct / performanceByType.comprehension?.total || 0;

    // Determine learning style based on strongest performance
    if (wordMeaningAccuracy > typingAccuracy && wordMeaningAccuracy > comprehensionAccuracy) {
      return 'visual';
    } else if (typingAccuracy > comprehensionAccuracy) {
      return 'kinesthetic';
    } else {
      return 'reading';
    }
  }

  /**
   * Calculate optimal difficulty level for user
   */
  private calculateOptimalDifficulty(testResults: any[], progress: any[]): number {
    if (testResults.length < 5) {
      return 2; // Default intermediate level
    }

    // Recent performance analysis
    const recentResults = testResults.slice(0, 20);
    const accuracy = recentResults.filter(r => r.isCorrect).length / recentResults.length;

    // Vocabulary mastery analysis
    const averageMastery = progress.reduce((sum, p) => sum + p.masteryLevel, 0) / progress.length;

    // Adjust difficulty based on performance
    if (accuracy > 0.9 && averageMastery > 3) {
      return Math.min(5, Math.floor(averageMastery) + 1);
    } else if (accuracy < 0.6) {
      return Math.max(1, Math.floor(averageMastery) - 1);
    } else {
      return Math.floor(averageMastery) || 2;
    }
  }

  /**
   * Calculate average response time
   */
  private calculateAverageResponseTime(testResults: any[]): number {
    if (testResults.length === 0) return 3000; // 3 seconds default

    const validResults = testResults.filter(r => r.responseTimeMs && r.responseTimeMs > 0);
    if (validResults.length === 0) return 3000;

    const totalTime = validResults.reduce((sum, r) => sum + r.responseTimeMs, 0);
    return totalTime / validResults.length;
  }

  /**
   * Calculate accuracy trend over time
   */
  private calculateAccuracyTrend(testResults: any[]): number[] {
    const batchSize = 10;
    const trend: number[] = [];

    for (let i = 0; i < testResults.length; i += batchSize) {
      const batch = testResults.slice(i, i + batchSize);
      const accuracy = batch.filter(r => r.isCorrect).length / batch.length;
      trend.push(accuracy);
    }

    return trend.reverse(); // Oldest to newest
  }

  /**
   * Identify strength areas
   */
  private identifyStrengths(progress: any[]): string[] {
    const categoryPerformance = progress.reduce((acc, p) => {
      const category = p.vocabulary.category || 'general';
      if (!acc[category]) {
        acc[category] = { totalMastery: 0, count: 0 };
      }
      acc[category].totalMastery += p.masteryLevel;
      acc[category].count++;
      return acc;
    }, {} as Record<string, { totalMastery: number; count: number }>);

    return Object.entries(categoryPerformance)
      .map(([category, data]) => ({
        category,
        averageMastery: data.totalMastery / data.count
      }))
      .filter(item => item.averageMastery > 3)
      .sort((a, b) => b.averageMastery - a.averageMastery)
      .map(item => item.category)
      .slice(0, 5);
  }

  /**
   * Identify weakness areas
   */
  private identifyWeaknesses(progress: any[]): string[] {
    const categoryPerformance = progress.reduce((acc, p) => {
      const category = p.vocabulary.category || 'general';
      if (!acc[category]) {
        acc[category] = { totalMastery: 0, count: 0 };
      }
      acc[category].totalMastery += p.masteryLevel;
      acc[category].count++;
      return acc;
    }, {} as Record<string, { totalMastery: number; count: number }>);

    return Object.entries(categoryPerformance)
      .map(([category, data]) => ({
        category,
        averageMastery: data.totalMastery / data.count
      }))
      .filter(item => item.averageMastery < 2)
      .sort((a, b) => a.averageMastery - b.averageMastery)
      .map(item => item.category)
      .slice(0, 3);
  }

  /**
   * Calculate optimal session length
   */
  private calculateOptimalSessionLength(sessions: any[]): number {
    if (sessions.length < 3) return 15; // Default 15 minutes

    const completedSessions = sessions.filter(s => s.completedAt && s.totalTimeSeconds);
    if (completedSessions.length === 0) return 15;

    // Find sessions with best performance
    const performanceByLength = completedSessions.map(session => {
      const sessionMinutes = Math.ceil(session.totalTimeSeconds / 60);
      const testResults = session.testResults || [];
      const accuracy = testResults.length > 0 
        ? testResults.filter((r: any) => r.isCorrect).length / testResults.length 
        : 0;
      
      return { length: sessionMinutes, accuracy };
    });

    // Find optimal length (best accuracy)
    const bestPerformance = performanceByLength
      .sort((a, b) => b.accuracy - a.accuracy)
      .slice(0, Math.ceil(performanceByLength.length / 3)); // Top 1/3

    const averageOptimalLength = bestPerformance.reduce((sum, p) => sum + p.length, 0) / bestPerformance.length;
    
    return Math.min(45, Math.max(10, Math.round(averageOptimalLength)));
  }

  /**
   * Identify best learning times
   */
  private identifyBestTimes(sessions: any[]): string[] {
    const timePerformance = sessions.reduce((acc, session) => {
      const hour = new Date(session.startedAt).getHours();
      const timeSlot = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
      
      if (!acc[timeSlot]) {
        acc[timeSlot] = { sessions: 0, totalAccuracy: 0 };
      }
      
      const testResults = session.testResults || [];
      const accuracy = testResults.length > 0 
        ? testResults.filter((r: any) => r.isCorrect).length / testResults.length 
        : 0;
      
      acc[timeSlot].sessions++;
      acc[timeSlot].totalAccuracy += accuracy;
      
      return acc;
    }, {} as Record<string, { sessions: number; totalAccuracy: number }>);

    return Object.entries(timePerformance)
      .map(([time, data]) => ({
        time,
        averageAccuracy: data.totalAccuracy / data.sessions
      }))
      .sort((a, b) => b.averageAccuracy - a.averageAccuracy)
      .map(item => item.time);
  }

  /**
   * Calculate retention rate
   */
  private calculateRetentionRate(progress: any[]): number {
    if (progress.length === 0) return 0;

    const wordsWithRetention = progress.filter(p => p.masteryLevel >= 3);
    return wordsWithRetention.length / progress.length;
  }

  /**
   * Calculate learning velocity (words per hour)
   */
  private calculateLearningVelocity(sessions: any[], progress: any[]): number {
    if (sessions.length === 0) return 0;

    const totalHours = sessions.reduce((sum, s) => sum + (s.totalTimeSeconds || 0), 0) / 3600;
    const wordsLearned = progress.filter(p => p.masteryLevel > 0).length;

    return totalHours > 0 ? wordsLearned / totalHours : 0;
  }

  /**
   * Calculate consistency score
   */
  private calculateConsistencyScore(sessions: any[]): number {
    if (sessions.length < 7) return 0.5; // Not enough data

    // Check if user has consistent learning patterns
    const last30Days = sessions.filter(s => {
      const sessionDate = new Date(s.startedAt);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - sessionDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 30;
    });

    const activeDays = new Set(last30Days.map(s => 
      new Date(s.startedAt).toDateString()
    )).size;

    return Math.min(1, activeDays / 30);
  }

  private getDefaultProfile(userId: string): UserLearningProfile {
    return {
      userId,
      learningStyle: 'reading',
      preferredDifficulty: 2,
      averageResponseTime: 3000,
      accuracyTrend: [],
      strengthAreas: [],
      weaknessAreas: [],
      optimalSessionLength: 15,
      bestLearningTimes: ['morning', 'afternoon', 'evening'],
      retentionRate: 0,
      learningVelocity: 0,
      consistencyScore: 0
    };
  }

  private async saveUserProfile(profile: UserLearningProfile): Promise<void> {
    // Save profile to user preferences
    await prisma.user.update({
      where: { id: profile.userId },
      data: {
        preferences: {
          learningProfile: profile
        }
      }
    });
  }

  private async getRecommendedWords(userId: string, profile: UserLearningProfile): Promise<string[]> {
    // Get words user hasn't learned yet
    const unlearnedWords = await prisma.vocabulary.findMany({
      where: {
        difficultyLevel: {
          lte: profile.preferredDifficulty + 1,
          gte: Math.max(1, profile.preferredDifficulty - 1)
        },
        category: {
          in: profile.weaknessAreas.length > 0 ? profile.weaknessAreas : undefined
        },
        NOT: {
          userProgress: {
            some: {
              userId,
              masteryLevel: { gte: 3 }
            }
          }
        }
      },
      take: 10,
      orderBy: { frequencyRank: 'asc' }
    });

    return unlearnedWords.map(w => w.word);
  }

  private adjustDifficulty(profile: UserLearningProfile): number {
    // Dynamically adjust difficulty based on recent performance
    const trend = profile.accuracyTrend;
    if (trend.length < 2) return profile.preferredDifficulty;

    const recentAccuracy = trend[trend.length - 1];
    const previousAccuracy = trend[trend.length - 2];

    if (recentAccuracy > 0.9 && recentAccuracy > previousAccuracy) {
      return Math.min(5, profile.preferredDifficulty + 1);
    } else if (recentAccuracy < 0.6) {
      return Math.max(1, profile.preferredDifficulty - 1);
    }

    return profile.preferredDifficulty;
  }

  private getOptimalStoryType(profile: UserLearningProfile): string {
    const storyTypes = ['general', 'adventure', 'daily_life', 'science', 'history'];
    
    // If user has strength areas, prefer those
    if (profile.strengthAreas.includes('science')) return 'science';
    if (profile.strengthAreas.includes('history')) return 'history';
    if (profile.strengthAreas.includes('activities')) return 'adventure';
    
    // Default based on learning style
    switch (profile.learningStyle) {
      case 'visual': return 'adventure';
      case 'auditory': return 'daily_life';
      case 'kinesthetic': return 'adventure';
      default: return 'general';
    }
  }
}