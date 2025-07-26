/**
 * Advanced Test API Routes
 * Handles advanced testing modes and spaced repetition
 */

import express from 'express';
import { AdvancedTestService, TestMode, TestSettings } from '../services/advancedTestService';
import { SpacedRepetitionService } from '../services/spacedRepetitionService';
import { authMiddleware } from '../middleware/authMiddleware';
import { logger } from '../utils/logger';

const router = express.Router();
const advancedTestService = new AdvancedTestService();
const spacedRepetitionService = new SpacedRepetitionService();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Advanced Test Routes

/**
 * Create advanced test session
 * POST /api/advanced-tests/create
 */
router.post('/create', async (req, res) => {
  try {
    const { testMode, vocabularyIds, settings } = req.body;
    const userId = req.user.id;

    if (!testMode || !vocabularyIds || !Array.isArray(vocabularyIds)) {
      return res.status(400).json({ 
        error: 'Test mode and vocabulary IDs are required' 
      });
    }

    const testSession = await advancedTestService.createTestSession(
      userId,
      testMode as TestMode,
      vocabularyIds,
      settings as Partial<TestSettings>
    );

    res.json({
      success: true,
      data: testSession
    });
  } catch (error) {
    logger.error('Failed to create advanced test session', { error: (error as Error).message });
    res.status(500).json({
      error: 'Failed to create test session'
    });
  }
});

/**
 * Get available test modes
 * GET /api/advanced-tests/modes
 */
router.get('/modes', async (req, res) => {
  try {
    const testModes = [
      {
        id: 'adaptive',
        name: 'Adaptive Test',
        description: 'Questions adapt to your performance level',
        icon: '🧠',
        difficulty: 'Dynamic',
        estimatedTime: '15-20 min'
      },
      {
        id: 'mastery',
        name: 'Mastery Test',
        description: 'Comprehensive evaluation of your knowledge',
        icon: '🎯',
        difficulty: 'High',
        estimatedTime: '20-25 min'
      },
      {
        id: 'speed_drill',
        name: 'Speed Drill',
        description: 'Quick recognition and response training',
        icon: '⚡',
        difficulty: 'Medium',
        estimatedTime: '5-10 min'
      },
      {
        id: 'comprehensive',
        name: 'Comprehensive Test',
        description: 'All question types in one session',
        icon: '📚',
        difficulty: 'Medium',
        estimatedTime: '25-30 min'
      },
      {
        id: 'weakness_focus',
        name: 'Weakness Focus',
        description: 'Targeted practice for your weak areas',
        icon: '🎪',
        difficulty: 'Adaptive',
        estimatedTime: '10-15 min'
      },
      {
        id: 'review_mode',
        name: 'Review Mode',
        description: 'Practice words due for review',
        icon: '🔄',
        difficulty: 'Varied',
        estimatedTime: '10-20 min'
      },
      {
        id: 'challenge_mode',
        name: 'Challenge Mode',
        description: 'Maximum difficulty for experts',
        icon: '🏆',
        difficulty: 'Expert',
        estimatedTime: '20-30 min'
      }
    ];

    res.json({
      success: true,
      data: testModes
    });
  } catch (error) {
    logger.error('Failed to get test modes', { error: (error as Error).message });
    res.status(500).json({
      error: 'Failed to get test modes'
    });
  }
});

/**
 * Get available test types
 * GET /api/advanced-tests/types
 */
router.get('/types', async (req, res) => {
  try {
    const testTypes = [
      {
        id: 'word_meaning',
        name: 'Word Meaning',
        description: 'Choose the correct definition',
        icon: '📖'
      },
      {
        id: 'typing',
        name: 'Spelling',
        description: 'Type the correct spelling',
        icon: '⌨️'
      },
      {
        id: 'comprehension',
        name: 'Comprehension',
        description: 'Understand words in context',
        icon: '🧐'
      },
      {
        id: 'synonym_antonym',
        name: 'Synonyms & Antonyms',
        description: 'Find related or opposite words',
        icon: '🔄'
      },
      {
        id: 'context_fill',
        name: 'Context Fill',
        description: 'Complete sentences with correct words',
        icon: '🔤'
      },
      {
        id: 'sentence_building',
        name: 'Sentence Building',
        description: 'Arrange words to form sentences',
        icon: '🏗️'
      },
      {
        id: 'speed_recognition',
        name: 'Speed Recognition',
        description: 'Quick word identification',
        icon: '⚡'
      },
      {
        id: 'grammar_usage',
        name: 'Grammar Usage',
        description: 'Use correct grammatical forms',
        icon: '📝'
      }
    ];

    res.json({
      success: true,
      data: testTypes
    });
  } catch (error) {
    logger.error('Failed to get test types', { error: (error as Error).message });
    res.status(500).json({
      error: 'Failed to get test types'
    });
  }
});

// Spaced Repetition Routes

/**
 * Get words due for review
 * GET /api/advanced-tests/review/due
 */
router.get('/review/due', async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20 } = req.query;

    const reviewSession = await spacedRepetitionService.getWordsForReview(
      userId,
      parseInt(limit as string)
    );

    res.json({
      success: true,
      data: reviewSession
    });
  } catch (error) {
    logger.error('Failed to get words for review', { error: (error as Error).message });
    res.status(500).json({
      error: 'Failed to get words for review'
    });
  }
});

/**
 * Submit review result
 * POST /api/advanced-tests/review/submit
 */
router.post('/review/submit', async (req, res) => {
  try {
    const userId = req.user.id;
    const { vocabularyId, quality, responseTime, wasHintUsed } = req.body;

    if (!vocabularyId || quality === undefined) {
      return res.status(400).json({
        error: 'Vocabulary ID and quality are required'
      });
    }

    if (quality < 0 || quality > 5) {
      return res.status(400).json({
        error: 'Quality must be between 0 and 5'
      });
    }

    const reviewResult = {
      vocabularyId,
      quality: parseInt(quality),
      responseTime: parseInt(responseTime) || 3000,
      wasHintUsed: Boolean(wasHintUsed),
      reviewedAt: new Date()
    };

    const schedule = await spacedRepetitionService.processReviewResult(userId, reviewResult);

    res.json({
      success: true,
      data: {
        schedule,
        message: `Next review in ${schedule.intervalDays} day(s)`
      }
    });
  } catch (error) {
    logger.error('Failed to submit review result', { error: (error as Error).message });
    res.status(500).json({
      error: 'Failed to submit review result'
    });
  }
});

/**
 * Get study schedule
 * GET /api/advanced-tests/review/schedule
 */
router.get('/review/schedule', async (req, res) => {
  try {
    const userId = req.user.id;
    const { days = 7 } = req.query;

    const schedule = await spacedRepetitionService.getStudySchedule(
      userId,
      parseInt(days as string)
    );

    res.json({
      success: true,
      data: schedule
    });
  } catch (error) {
    logger.error('Failed to get study schedule', { error: (error as Error).message });
    res.status(500).json({
      error: 'Failed to get study schedule'
    });
  }
});

/**
 * Reset vocabulary progress
 * POST /api/advanced-tests/review/reset/:vocabularyId
 */
router.post('/review/reset/:vocabularyId', async (req, res) => {
  try {
    const userId = req.user.id;
    const { vocabularyId } = req.params;

    await spacedRepetitionService.resetVocabularyProgress(userId, vocabularyId);

    res.json({
      success: true,
      message: 'Vocabulary progress reset successfully'
    });
  } catch (error) {
    logger.error('Failed to reset vocabulary progress', { error: (error as Error).message });
    res.status(500).json({
      error: 'Failed to reset vocabulary progress'
    });
  }
});

/**
 * Recalculate all schedules (maintenance endpoint)
 * POST /api/advanced-tests/review/recalculate
 */
router.post('/review/recalculate', async (req, res) => {
  try {
    const userId = req.user.id;

    const updatedCount = await spacedRepetitionService.recalculateAllSchedules(userId);

    res.json({
      success: true,
      data: {
        updatedCount,
        message: `Recalculated ${updatedCount} vocabulary schedules`
      }
    });
  } catch (error) {
    logger.error('Failed to recalculate schedules', { error: (error as Error).message });
    res.status(500).json({
      error: 'Failed to recalculate schedules'
    });
  }
});

/**
 * Get review statistics
 * GET /api/advanced-tests/review/stats
 */
router.get('/review/stats', async (req, res) => {
  try {
    const userId = req.user.id;

    // Get basic review statistics
    const [totalWords, reviewsToday, masteredWords, reviewSession] = await Promise.all([
      // Total words in learning
      req.app.locals.prisma.userProgress.count({
        where: { userId }
      }),
      
      // Reviews completed today
      req.app.locals.prisma.userActivity.count({
        where: {
          userId,
          activityType: 'vocabulary_reviewed',
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      
      // Mastered words (mastery level >= 4)
      req.app.locals.prisma.userProgress.count({
        where: {
          userId,
          masteryLevel: { gte: 4 }
        }
      }),
      
      // Current review session
      spacedRepetitionService.getWordsForReview(userId, 1)
    ]);

    const stats = {
      totalWords,
      reviewsToday,
      masteredWords,
      wordsToReview: reviewSession.totalDue,
      overdueWords: reviewSession.overdueReviews,
      masteryRate: totalWords > 0 ? Math.round((masteredWords / totalWords) * 100) : 0
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Failed to get review statistics', { error: (error as Error).message });
    res.status(500).json({
      error: 'Failed to get review statistics'
    });
  }
});

export default router;