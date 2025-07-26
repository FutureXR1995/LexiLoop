/**
 * Spaced Repetition Service
 * Implements SuperMemo2-inspired algorithm for optimal vocabulary review scheduling
 */

import { prisma } from './databaseService';
import { logger } from '../utils/logger';

export interface ReviewSchedule {
  vocabularyId: string;
  nextReviewAt: Date;
  intervalDays: number;
  easeFactor: number;
  reviewCount: number;
  lastReviewedAt: Date;
}

export interface ReviewResult {
  vocabularyId: string;
  quality: number; // 0-5 scale (0 = complete blackout, 5 = perfect response)
  responseTime: number;
  wasHintUsed: boolean;
  reviewedAt: Date;
}

export interface ReviewSession {
  userId: string;
  dueWords: ReviewItem[];
  totalDue: number;
  scheduledReviews: number;
  overdueReviews: number;
}

export interface ReviewItem {
  vocabularyId: string;
  word: string;
  definition: string;
  masteryLevel: number;
  daysSinceLastReview: number;
  isOverdue: boolean;
  priority: number;
}

export class SpacedRepetitionService {
  // SuperMemo2 constants
  private readonly MINIMUM_EF = 1.3;
  private readonly INITIAL_EF = 2.5;
  private readonly MINIMUM_INTERVAL = 1;
  private readonly MAXIMUM_INTERVAL = 365;

  /**
   * Get words due for review for a user
   */
  async getWordsForReview(userId: string, limit: number = 20): Promise<ReviewSession> {
    logger.info('Getting words for review', { userId, limit });

    try {
      const now = new Date();
      
      // Get all user's vocabulary progress
      const userProgress = await prisma.userProgress.findMany({
        where: { userId },
        include: {
          vocabulary: {
            select: {
              word: true,
              definition: true,
              difficultyLevel: true
            }
          }
        }
      });

      const dueWords: ReviewItem[] = [];
      let scheduledCount = 0;
      let overdueCount = 0;

      for (const progress of userProgress) {
        const daysSinceReview = this.getDaysSince(progress.lastReviewedAt || progress.createdAt);
        const isOverdue = progress.nextReviewAt ? progress.nextReviewAt <= now : false;
        const isDue = isOverdue || this.shouldReviewToday(progress, now);

        if (isDue) {
          const priority = this.calculateReviewPriority(progress, daysSinceReview, isOverdue);
          
          dueWords.push({
            vocabularyId: progress.vocabularyId,
            word: progress.vocabulary.word,
            definition: progress.vocabulary.definition,
            masteryLevel: progress.masteryLevel,
            daysSinceLastReview: daysSinceReview,
            isOverdue,
            priority
          });

          if (isOverdue) {
            overdueCount++;
          } else {
            scheduledCount++;
          }
        }
      }

      // Sort by priority (higher priority first)
      dueWords.sort((a, b) => b.priority - a.priority);

      // Limit the results
      const limitedDueWords = dueWords.slice(0, limit);

      const session: ReviewSession = {
        userId,
        dueWords: limitedDueWords,
        totalDue: dueWords.length,
        scheduledReviews: scheduledCount,
        overdueReviews: overdueCount
      };

      logger.info('Review session created', { 
        userId, 
        totalDue: session.totalDue, 
        scheduled: scheduledCount, 
        overdue: overdueCount 
      });

      return session;
    } catch (error) {
      logger.error('Failed to get words for review', { userId, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Process review result and update schedule
   */
  async processReviewResult(userId: string, result: ReviewResult): Promise<ReviewSchedule> {
    logger.info('Processing review result', { userId, vocabularyId: result.vocabularyId, quality: result.quality });

    try {
      // Get current progress
      const progress = await prisma.userProgress.findUnique({
        where: {
          userId_vocabularyId: {
            userId,
            vocabularyId: result.vocabularyId
          }
        }
      });

      if (!progress) {
        throw new Error('User progress not found');
      }

      // Calculate new schedule using SuperMemo2 algorithm
      const newSchedule = this.calculateNextReview(progress, result);

      // Update user progress
      await prisma.userProgress.update({
        where: {
          userId_vocabularyId: {
            userId,
            vocabularyId: result.vocabularyId
          }
        },
        data: {
          lastReviewedAt: result.reviewedAt,
          nextReviewAt: newSchedule.nextReviewAt,
          reviewIntervalHours: newSchedule.intervalDays * 24,
          masteryLevel: this.calculateNewMasteryLevel(progress.masteryLevel, result.quality),
          correctCount: result.quality >= 3 ? progress.correctCount + 1 : progress.correctCount,
          incorrectCount: result.quality < 3 ? progress.incorrectCount + 1 : progress.incorrectCount,
          totalAttempts: progress.totalAttempts + 1,
          confidenceScore: this.calculateConfidenceScore(result.quality, result.responseTime, result.wasHintUsed),
          // Store ease factor in metadata
          updatedAt: new Date()
        }
      });

      // Update streak
      await this.updateStreak(userId, progress.vocabularyId, result.quality >= 3);

      // Log the review
      await this.logReview(userId, result, newSchedule);

      logger.info('Review processed successfully', { 
        userId, 
        vocabularyId: result.vocabularyId, 
        nextReview: newSchedule.nextReviewAt 
      });

      return newSchedule;
    } catch (error) {
      logger.error('Failed to process review result', { userId, result, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Calculate next review using SuperMemo2 algorithm
   */
  private calculateNextReview(progress: any, result: ReviewResult): ReviewSchedule {
    // Get current ease factor (stored in metadata or use default)
    let easeFactor = this.getStoredEaseFactor(progress) || this.INITIAL_EF;
    let intervalDays = Math.ceil((progress.reviewIntervalHours || 24) / 24);
    let reviewCount = this.getReviewCount(progress) + 1;

    // SuperMemo2 algorithm
    if (result.quality >= 3) {
      // Correct response
      if (reviewCount === 1) {
        intervalDays = 1;
      } else if (reviewCount === 2) {
        intervalDays = 6;
      } else {
        intervalDays = Math.round(intervalDays * easeFactor);
      }
    } else {
      // Incorrect response - restart the learning process
      reviewCount = 1;
      intervalDays = 1;
    }

    // Update ease factor
    easeFactor = this.updateEaseFactor(easeFactor, result.quality);

    // Apply constraints
    intervalDays = Math.max(this.MINIMUM_INTERVAL, Math.min(this.MAXIMUM_INTERVAL, intervalDays));

    // Calculate next review date
    const nextReviewAt = new Date();
    nextReviewAt.setDate(nextReviewAt.getDate() + intervalDays);

    return {
      vocabularyId: result.vocabularyId,
      nextReviewAt,
      intervalDays,
      easeFactor,
      reviewCount,
      lastReviewedAt: result.reviewedAt
    };
  }

  /**
   * Update ease factor using SuperMemo2 formula
   */
  private updateEaseFactor(currentEF: number, quality: number): number {
    const newEF = currentEF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    return Math.max(this.MINIMUM_EF, newEF);
  }

  /**
   * Calculate new mastery level based on performance
   */
  private calculateNewMasteryLevel(currentLevel: number, quality: number): number {
    let newLevel = currentLevel;

    if (quality >= 4) {
      // Excellent performance - increase mastery
      newLevel = Math.min(5, currentLevel + 0.5);
    } else if (quality === 3) {
      // Good performance - slight increase
      newLevel = Math.min(5, currentLevel + 0.2);
    } else if (quality === 2) {
      // Poor performance - slight decrease
      newLevel = Math.max(0, currentLevel - 0.3);
    } else {
      // Very poor performance - significant decrease
      newLevel = Math.max(0, currentLevel - 0.5);
    }

    return Math.round(newLevel * 10) / 10; // Round to 1 decimal place
  }

  /**
   * Calculate confidence score based on performance metrics
   */
  private calculateConfidenceScore(quality: number, responseTime: number, wasHintUsed: boolean): number {
    let confidence = quality / 5; // Base confidence from quality

    // Adjust for response time (faster = more confident)
    const timeBonus = Math.max(0, (10000 - responseTime) / 10000 * 0.2);
    confidence += timeBonus;

    // Penalty for using hints
    if (wasHintUsed) {
      confidence -= 0.1;
    }

    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * Calculate review priority for sorting
   */
  private calculateReviewPriority(progress: any, daysSinceReview: number, isOverdue: boolean): number {
    let priority = 0;

    // Base priority on mastery level (lower mastery = higher priority)
    priority += (5 - progress.masteryLevel) * 20;

    // Add urgency for overdue items
    if (isOverdue) {
      priority += daysSinceReview * 10;
    }

    // Add priority for items with low confidence
    const confidenceScore = parseFloat(progress.confidenceScore?.toString() || '0.5');
    priority += (1 - confidenceScore) * 15;

    // Add priority for items with high error rate
    const totalAttempts = progress.totalAttempts || 1;
    const errorRate = progress.incorrectCount / totalAttempts;
    priority += errorRate * 25;

    return Math.round(priority);
  }

  /**
   * Check if word should be reviewed today
   */
  private shouldReviewToday(progress: any, now: Date): boolean {
    if (!progress.nextReviewAt) {
      // New word, should be reviewed
      return true;
    }

    return progress.nextReviewAt <= now;
  }

  /**
   * Update learning streak
   */
  private async updateStreak(userId: string, vocabularyId: string, wasCorrect: boolean): Promise<void> {
    const progress = await prisma.userProgress.findUnique({
      where: {
        userId_vocabularyId: { userId, vocabularyId }
      }
    });

    if (!progress) return;

    let newStreak = wasCorrect ? progress.streak + 1 : 0;
    let newBestStreak = Math.max(progress.bestStreak, newStreak);

    await prisma.userProgress.update({
      where: {
        userId_vocabularyId: { userId, vocabularyId }
      },
      data: {
        streak: newStreak,
        bestStreak: newBestStreak
      }
    });
  }

  /**
   * Log review for analytics
   */
  private async logReview(userId: string, result: ReviewResult, schedule: ReviewSchedule): Promise<void> {
    try {
      await prisma.userActivity.create({
        data: {
          userId,
          activityType: 'vocabulary_reviewed',
          description: `Reviewed vocabulary with quality ${result.quality}`,
          points: this.calculateReviewPoints(result.quality),
          metadata: {
            vocabularyId: result.vocabularyId,
            quality: result.quality,
            responseTime: result.responseTime,
            nextReviewDays: schedule.intervalDays,
            easeFactor: schedule.easeFactor
          }
        }
      });
    } catch (error) {
      logger.warn('Failed to log review activity', { error: (error as Error).message });
    }
  }

  /**
   * Calculate points earned from review
   */
  private calculateReviewPoints(quality: number): number {
    const basePoints = [0, 1, 2, 5, 8, 10]; // Points for each quality level
    return basePoints[quality] || 0;
  }

  /**
   * Get days since a date
   */
  private getDaysSince(date: Date): number {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Get stored ease factor from progress metadata
   */
  private getStoredEaseFactor(progress: any): number | null {
    try {
      const metadata = progress.metadata || {};
      return metadata.easeFactor || null;
    } catch {
      return null;
    }
  }

  /**
   * Get review count from progress metadata
   */
  private getReviewCount(progress: any): number {
    try {
      const metadata = progress.metadata || {};
      return metadata.reviewCount || 0;
    } catch {
      return 0;
    }
  }

  /**
   * Get optimal study schedule for user
   */
  async getStudySchedule(userId: string, daysAhead: number = 7): Promise<any> {
    const schedule = [];
    const now = new Date();

    for (let i = 0; i < daysAhead; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() + i);
      
      const reviewsForDay = await prisma.userProgress.count({
        where: {
          userId,
          nextReviewAt: {
            gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
            lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
          }
        }
      });

      schedule.push({
        date: date.toISOString().split('T')[0],
        reviewCount: reviewsForDay,
        workload: this.calculateWorkload(reviewsForDay)
      });
    }

    return schedule;
  }

  /**
   * Calculate workload level
   */
  private calculateWorkload(reviewCount: number): 'light' | 'moderate' | 'heavy' {
    if (reviewCount <= 10) return 'light';
    if (reviewCount <= 25) return 'moderate';
    return 'heavy';
  }

  /**
   * Reset vocabulary learning progress (for failed words)
   */
  async resetVocabularyProgress(userId: string, vocabularyId: string): Promise<void> {
    await prisma.userProgress.update({
      where: {
        userId_vocabularyId: { userId, vocabularyId }
      },
      data: {
        masteryLevel: 0,
        reviewIntervalHours: 24,
        nextReviewAt: new Date(),
        streak: 0,
        confidenceScore: 0
      }
    });
  }

  /**
   * Bulk update review schedules (for maintenance)
   */
  async recalculateAllSchedules(userId: string): Promise<number> {
    const userProgress = await prisma.userProgress.findMany({
      where: { userId }
    });

    let updated = 0;
    for (const progress of userProgress) {
      const mockResult: ReviewResult = {
        vocabularyId: progress.vocabularyId,
        quality: progress.masteryLevel >= 3 ? 4 : 2,
        responseTime: 3000,
        wasHintUsed: false,
        reviewedAt: progress.lastReviewedAt || new Date()
      };

      await this.processReviewResult(userId, mockResult);
      updated++;
    }

    return updated;
  }
}