/**
 * Social API Routes
 * Handles social features like friends, groups, and leaderboards
 */

import express from 'express';
import { SocialService } from '../services/socialService';
import { AchievementService } from '../services/achievementService';
import { authMiddleware } from '../middleware/authMiddleware';
import { logger } from '../utils/logger';

const router = express.Router();
const socialService = new SocialService();
const achievementService = new AchievementService();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Friend Management Routes

/**
 * Send friend request
 * POST /api/social/friends/request
 */
router.post('/friends/request', async (req, res) => {
  try {
    const { friendEmail } = req.body;
    const userId = req.user.id;

    if (!friendEmail) {
      return res.status(400).json({ error: 'Friend email is required' });
    }

    const friendRequest = await socialService.sendFriendRequest(userId, friendEmail);
    
    // Check for achievements
    await achievementService.checkAndAwardAchievements(userId);
    
    res.json({
      success: true,
      data: friendRequest
    });
  } catch (error) {
    logger.error('Failed to send friend request', { error: (error as Error).message });
    res.status(400).json({ 
      error: error.message || 'Failed to send friend request' 
    });
  }
});

/**
 * Accept friend request
 * POST /api/social/friends/accept/:requestId
 */
router.post('/friends/accept/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id;

    await socialService.acceptFriendRequest(userId, requestId);
    
    // Check for achievements
    await achievementService.checkAndAwardAchievements(userId);
    
    res.json({ success: true });
  } catch (error) {
    logger.error('Failed to accept friend request', { error: (error as Error).message });
    res.status(400).json({ 
      error: error.message || 'Failed to accept friend request' 
    });
  }
});

/**
 * Get user's friends
 * GET /api/social/friends
 */
router.get('/friends', async (req, res) => {
  try {
    const userId = req.user.id;
    const friends = await socialService.getFriends(userId);
    
    res.json({
      success: true,
      data: friends
    });
  } catch (error) {
    logger.error('Failed to get friends', { error: (error as Error).message });
    res.status(500).json({ 
      error: 'Failed to get friends' 
    });
  }
});

/**
 * Get pending friend requests
 * GET /api/social/friends/requests
 */
router.get('/friends/requests', async (req, res) => {
  try {
    const userId = req.user.id;
    const requests = await socialService.getPendingRequests(userId);
    
    res.json({
      success: true,
      data: requests
    });
  } catch (error) {
    logger.error('Failed to get friend requests', { error: (error as Error).message });
    res.status(500).json({ 
      error: 'Failed to get friend requests' 
    });
  }
});

// Study Group Routes

/**
 * Create study group
 * POST /api/social/groups
 */
router.post('/groups', async (req, res) => {
  try {
    const { name, description, isPublic, maxMembers } = req.body;
    const userId = req.user.id;

    if (!name) {
      return res.status(400).json({ error: 'Group name is required' });
    }

    const group = await socialService.createStudyGroup(userId, {
      name,
      description,
      isPublic,
      maxMembers
    });
    
    // Check for achievements
    await achievementService.checkAndAwardAchievements(userId);
    
    res.json({
      success: true,
      data: group
    });
  } catch (error) {
    logger.error('Failed to create study group', { error: (error as Error).message });
    res.status(400).json({ 
      error: error.message || 'Failed to create study group' 
    });
  }
});

/**
 * Join study group
 * POST /api/social/groups/:groupId/join
 */
router.post('/groups/:groupId/join', async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    await socialService.joinStudyGroup(userId, groupId);
    
    // Check for achievements
    await achievementService.checkAndAwardAchievements(userId);
    
    res.json({ success: true });
  } catch (error) {
    logger.error('Failed to join study group', { error: (error as Error).message });
    res.status(400).json({ 
      error: error.message || 'Failed to join study group' 
    });
  }
});

/**
 * Get user's study groups
 * GET /api/social/groups
 */
router.get('/groups', async (req, res) => {
  try {
    const userId = req.user.id;
    const groups = await socialService.getUserGroups(userId);
    
    res.json({
      success: true,
      data: groups
    });
  } catch (error) {
    logger.error('Failed to get study groups', { error: (error as Error).message });
    res.status(500).json({ 
      error: 'Failed to get study groups' 
    });
  }
});

// Stats and Leaderboard Routes

/**
 * Get user stats
 * GET /api/social/stats
 */
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user.id;
    const stats = await socialService.getUserStats(userId);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Failed to get user stats', { error: (error as Error).message });
    res.status(500).json({ 
      error: 'Failed to get user stats' 
    });
  }
});

/**
 * Get leaderboard
 * GET /api/social/leaderboard
 */
router.get('/leaderboard', async (req, res) => {
  try {
    const { type = 'points', limit = 10 } = req.query;
    const leaderboard = await socialService.getLeaderboard(
      type as 'points' | 'streak' | 'words',
      parseInt(limit as string)
    );
    
    res.json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    logger.error('Failed to get leaderboard', { error: (error as Error).message });
    res.status(500).json({ 
      error: 'Failed to get leaderboard' 
    });
  }
});

/**
 * Get activity feed
 * GET /api/social/feed
 */
router.get('/feed', async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20 } = req.query;
    
    const activities = await socialService.getUserActivityFeed(
      userId,
      parseInt(limit as string)
    );
    
    res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    logger.error('Failed to get activity feed', { error: (error as Error).message });
    res.status(500).json({ 
      error: 'Failed to get activity feed' 
    });
  }
});

// Achievement Routes

/**
 * Get user achievements
 * GET /api/social/achievements
 */
router.get('/achievements', async (req, res) => {
  try {
    const userId = req.user.id;
    const achievements = await achievementService.getUserAchievements(userId);
    
    res.json({
      success: true,
      data: achievements
    });
  } catch (error) {
    logger.error('Failed to get achievements', { error: (error as Error).message });
    res.status(500).json({ 
      error: 'Failed to get achievements' 
    });
  }
});

/**
 * Get achievement leaderboard
 * GET /api/social/achievements/leaderboard
 */
router.get('/achievements/leaderboard', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const leaderboard = await achievementService.getAchievementLeaderboard(
      parseInt(limit as string)
    );
    
    res.json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    logger.error('Failed to get achievement leaderboard', { error: (error as Error).message });
    res.status(500).json({ 
      error: 'Failed to get achievement leaderboard' 
    });
  }
});

/**
 * Manually trigger achievement check (for testing)
 * POST /api/social/achievements/check
 */
router.post('/achievements/check', async (req, res) => {
  try {
    const userId = req.user.id;
    const newAchievements = await achievementService.checkAndAwardAchievements(userId);
    
    res.json({
      success: true,
      data: {
        newAchievements,
        count: newAchievements.length
      }
    });
  } catch (error) {
    logger.error('Failed to check achievements', { error: (error as Error).message });
    res.status(500).json({ 
      error: 'Failed to check achievements' 
    });
  }
});

export default router;