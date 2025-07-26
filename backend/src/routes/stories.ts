/**
 * Story routes
 */

import { Router } from 'express';
import Joi from 'joi';
import { asyncHandler, APIError } from '../middleware/errorHandler';
import { authenticateToken, optionalAuth } from '../middleware/authMiddleware';
import { StoryService } from '../services/storyService';
import { aiLogger } from '../utils/logger';

const router = Router();

// Validation schemas
const generateStorySchema = Joi.object({
  vocabularyIds: Joi.array().items(Joi.string().uuid()).min(1).max(20).required(),
  difficulty: Joi.number().integer().min(1).max(5).optional(),
  storyType: Joi.string().valid('general', 'adventure', 'daily_life', 'science', 'history').optional(),
  maxLength: Joi.number().integer().min(200).max(1500).optional()
});

// Generate a new story
router.post('/generate', authenticateToken, asyncHandler(async (req, res) => {
  // Validate request data
  const { error, value } = generateStorySchema.validate(req.body);
  if (error) {
    throw new APIError(`Validation error: ${error.details[0].message}`, 400);
  }

  const story = await StoryService.generateStory({
    ...value,
    userId: req.user!.id
  });

  res.json({
    success: true,
    message: 'Story generated successfully',
    data: { story }
  });
}));

// Get story by ID
router.get('/:id', optionalAuth, asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
    throw new APIError('Invalid story ID format', 400);
  }

  const story = await StoryService.getStoryById(id, req.user?.id);

  // Increment view count for public stories
  if (!req.user) {
    // TODO: Implement view count increment
    aiLogger.info('Story viewed', { storyId: id, userId: req.user?.id });
  }

  res.json({
    success: true,
    data: { story }
  });
}));

// Get user's story history
router.get('/user/history', authenticateToken, asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = Math.min(parseInt(limit as string), 50); // Max 50 per page

  if (pageNum < 1 || limitNum < 1) {
    throw new APIError('Invalid pagination parameters', 400);
  }

  const result = await StoryService.getUserStoryHistory(
    req.user!.id,
    pageNum,
    limitNum
  );

  res.json({
    success: true,
    data: result
  });
}));

// Get popular stories (public endpoint)
router.get('/public/popular', asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;
  const limitNum = Math.min(parseInt(limit as string), 20); // Max 20

  const stories = await StoryService.getPopularStories(limitNum);

  res.json({
    success: true,
    data: { stories }
  });
}));

// Regenerate story with same vocabulary
router.post('/:id/regenerate', authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { storyType, difficulty } = req.body;

  // Get original story to extract vocabulary
  const originalStory = await StoryService.getStoryById(id, req.user!.id);

  // Get vocabulary IDs from the original story
  // This would require storing vocabulary IDs in the story or reconstructing them
  // For now, return an error as this feature needs more implementation
  throw new APIError('Story regeneration not yet implemented', 501);

  // TODO: Implement story regeneration
  // const newStory = await StoryService.generateStory({
  //   vocabularyIds: originalStory.vocabularyIds,
  //   difficulty: difficulty || originalStory.difficulty,
  //   storyType: storyType || 'general',
  //   userId: req.user!.id
  // });

  // res.json({
  //   success: true,
  //   message: 'Story regenerated successfully',
  //   data: { story: newStory }
  // });
}));

export default router;