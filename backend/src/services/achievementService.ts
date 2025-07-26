/**
 * Achievement Service
 * Handles the gamification system with achievements, badges, and rewards
 */

import { prisma } from './databaseService';
import { logger } from '../utils/logger';

export interface AchievementDefinition {
  name: string;
  title: string;
  description: string;
  category: 'learning' | 'social' | 'streak' | 'mastery' | 'milestone';
  icon: string;
  color: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  criteria: {
    type: string;
    target: number;
    timeframe?: string;
  };
  rewards: {
    points: number;
    badges: string[];
  };
}

export interface UserAchievementProgress {
  achievement: {
    id: string;
    name: string;
    title: string;
    description: string;
    category: string;
    icon: string;
    color: string;
    rarity: string;
  };
  earned: boolean;
  earnedAt?: Date;
  progress: number;
  target: number;
}

export class AchievementService {
  private defaultAchievements: AchievementDefinition[] = [
    // Learning Achievements
    {
      name: 'first_word',
      title: 'First Steps',
      description: 'Learn your first word',
      category: 'learning',
      icon: '🌱',
      color: '#10B981',
      rarity: 'common',
      criteria: { type: 'words_learned', target: 1 },
      rewards: { points: 10, badges: ['beginner'] }
    },
    {
      name: 'word_collector_10',
      title: 'Word Collector',
      description: 'Learn 10 words',
      category: 'learning',
      icon: '📚',
      color: '#3B82F6',
      rarity: 'common',
      criteria: { type: 'words_learned', target: 10 },
      rewards: { points: 25, badges: ['collector'] }
    },
    {
      name: 'vocabulary_master_100',
      title: 'Vocabulary Master',
      description: 'Learn 100 words',
      category: 'mastery',
      icon: '👑',
      color: '#F59E0B',
      rarity: 'rare',
      criteria: { type: 'words_learned', target: 100 },
      rewards: { points: 100, badges: ['master'] }
    },
    {
      name: 'scholar_500',
      title: 'Scholar',
      description: 'Learn 500 words',
      category: 'mastery',
      icon: '🎓',
      color: '#8B5CF6',
      rarity: 'epic',
      criteria: { type: 'words_learned', target: 500 },
      rewards: { points: 250, badges: ['scholar'] }
    },
    {
      name: 'linguist_1000',
      title: 'Linguist',
      description: 'Learn 1000 words',
      category: 'mastery',
      icon: '🏆',
      color: '#EF4444',
      rarity: 'legendary',
      criteria: { type: 'words_learned', target: 1000 },
      rewards: { points: 500, badges: ['linguist', 'legend'] }
    },

    // Streak Achievements
    {
      name: 'consistent_learner_3',
      title: 'Consistent Learner',
      description: 'Study for 3 days in a row',
      category: 'streak',
      icon: '🔥',
      color: '#F97316',
      rarity: 'common',
      criteria: { type: 'study_streak', target: 3 },
      rewards: { points: 15, badges: ['consistent'] }
    },
    {
      name: 'dedicated_student_7',
      title: 'Dedicated Student',
      description: 'Study for 7 days in a row',
      category: 'streak',
      icon: '⚡',
      color: '#EAB308',
      rarity: 'rare',
      criteria: { type: 'study_streak', target: 7 },
      rewards: { points: 35, badges: ['dedicated'] }
    },
    {
      name: 'streak_master_30',
      title: 'Streak Master',
      description: 'Study for 30 days in a row',
      category: 'streak',
      icon: '💎',
      color: '#06B6D4',
      rarity: 'epic',
      criteria: { type: 'study_streak', target: 30 },
      rewards: { points: 150, badges: ['streak_master'] }
    },

    // Social Achievements
    {
      name: 'social_butterfly',
      title: 'Social Butterfly',
      description: 'Add your first friend',
      category: 'social',
      icon: '🦋',
      color: '#EC4899',
      rarity: 'common',
      criteria: { type: 'friends_count', target: 1 },
      rewards: { points: 20, badges: ['social'] }
    },
    {
      name: 'team_player',
      title: 'Team Player',
      description: 'Join a study group',
      category: 'social',
      icon: '🤝',
      color: '#84CC16',
      rarity: 'common',
      criteria: { type: 'groups_joined', target: 1 },
      rewards: { points: 25, badges: ['team_player'] }
    },

    // Time-based Achievements
    {
      name: 'marathon_learner',
      title: 'Marathon Learner',
      description: 'Study for 60 minutes in one session',
      category: 'milestone',
      icon: '🏃‍♂️',
      color: '#6366F1',
      rarity: 'rare',
      criteria: { type: 'session_duration', target: 60 },
      rewards: { points: 50, badges: ['marathon'] }
    },
    {
      name: 'time_master_10h',
      title: 'Time Master',
      description: 'Study for a total of 10 hours',
      category: 'milestone',
      icon: '⏰',
      color: '#059669',
      rarity: 'rare',
      criteria: { type: 'total_study_time', target: 600 }, // 10 hours = 600 minutes
      rewards: { points: 75, badges: ['time_master'] }
    }
  ];

  /**
   * Initialize default achievements in database
   */
  async initializeAchievements(): Promise<void> {
    logger.info('Initializing default achievements');

    try {
      for (const achievement of this.defaultAchievements) {
        await prisma.achievement.upsert({
          where: { name: achievement.name },
          update: {
            title: achievement.title,
            description: achievement.description,
            category: achievement.category,
            icon: achievement.icon,
            color: achievement.color,
            rarity: achievement.rarity,
            criteria: achievement.criteria,
            rewards: achievement.rewards
          },
          create: {
            ...achievement,
            criteria: achievement.criteria,
            rewards: achievement.rewards
          }
        });
      }

      logger.info('Default achievements initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize achievements', { error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Check and award achievements for a user
   */
  async checkAndAwardAchievements(userId: string): Promise<string[]> {
    logger.info('Checking achievements for user', { userId });

    try {
      const newAchievements: string[] = [];

      // Get user stats
      const userStats = await prisma.userStats.findUnique({
        where: { userId }
      });

      if (!userStats) {
        return newAchievements;
      }

      // Get user's existing achievements
      const existingAchievements = await prisma.userAchievement.findMany({
        where: { userId },
        select: { achievementId: true }
      });
      const existingIds = new Set(existingAchievements.map(a => a.achievementId));

      // Get all achievements
      const achievements = await prisma.achievement.findMany({
        where: { isActive: true }
      });

      // Check each achievement
      for (const achievement of achievements) {
        if (existingIds.has(achievement.id)) {
          continue; // Already earned
        }

        const criteria = achievement.criteria as any;
        let earned = false;

        switch (criteria.type) {
          case 'words_learned':
            earned = userStats.totalWordsLearned >= criteria.target;
            break;
          case 'study_streak':
            earned = userStats.currentStreak >= criteria.target;
            break;
          case 'total_study_time':
            earned = userStats.totalStudyTimeMinutes >= criteria.target;
            break;
          case 'friends_count':
            const friendsCount = await this.getFriendsCount(userId);
            earned = friendsCount >= criteria.target;
            break;
          case 'groups_joined':
            const groupsCount = await this.getGroupsCount(userId);
            earned = groupsCount >= criteria.target;
            break;
          case 'session_duration':
            const hasLongSession = await this.hasSessionOfDuration(userId, criteria.target);
            earned = hasLongSession;
            break;
        }

        if (earned) {
          await this.awardAchievement(userId, achievement.id);
          newAchievements.push(achievement.name);
        }
      }

      if (newAchievements.length > 0) {
        logger.info('Awarded new achievements', { userId, achievements: newAchievements });
      }

      return newAchievements;
    } catch (error) {
      logger.error('Failed to check achievements', { userId, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Award achievement to user
   */
  private async awardAchievement(userId: string, achievementId: string): Promise<void> {
    try {
      const achievement = await prisma.achievement.findUnique({
        where: { id: achievementId }
      });

      if (!achievement) {
        throw new Error('Achievement not found');
      }

      // Award the achievement
      await prisma.userAchievement.create({
        data: {
          userId,
          achievementId,
          progress: {},
          metadata: { awardedAt: new Date().toISOString() }
        }
      });

      // Award points
      const rewards = achievement.rewards as any;
      if (rewards.points) {
        await prisma.userStats.update({
          where: { userId },
          data: {
            totalPoints: { increment: rewards.points },
            experiencePoints: { increment: rewards.points }
          }
        });
      }

      // Log activity
      await prisma.userActivity.create({
        data: {
          userId,
          activityType: 'achievement_earned',
          description: `Earned achievement: ${achievement.title}`,
          points: rewards.points || 0,
          metadata: {
            achievementId,
            achievementName: achievement.name,
            rarity: achievement.rarity
          }
        }
      });

      logger.info('Achievement awarded', { userId, achievementId, achievementName: achievement.name });
    } catch (error) {
      logger.error('Failed to award achievement', { userId, achievementId, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Get user's achievements with progress
   */
  async getUserAchievements(userId: string): Promise<UserAchievementProgress[]> {
    try {
      // Get user stats for progress calculation
      const userStats = await prisma.userStats.findUnique({
        where: { userId }
      });

      // Get all achievements
      const achievements = await prisma.achievement.findMany({
        where: { isActive: true }
      });

      // Get user's earned achievements
      const userAchievements = await prisma.userAchievement.findMany({
        where: { userId },
        include: { achievement: true }
      });

      const earnedMap = new Map(userAchievements.map(ua => [ua.achievementId, ua]));

      const result: UserAchievementProgress[] = [];

      for (const achievement of achievements) {
        const earned = earnedMap.get(achievement.id);
        const criteria = achievement.criteria as any;
        
        let progress = 0;
        if (userStats) {
          switch (criteria.type) {
            case 'words_learned':
              progress = Math.min(userStats.totalWordsLearned, criteria.target);
              break;
            case 'study_streak':
              progress = Math.min(userStats.currentStreak, criteria.target);
              break;
            case 'total_study_time':
              progress = Math.min(userStats.totalStudyTimeMinutes, criteria.target);
              break;
            case 'friends_count':
              progress = Math.min(await this.getFriendsCount(userId), criteria.target);
              break;
            case 'groups_joined':
              progress = Math.min(await this.getGroupsCount(userId), criteria.target);
              break;
            default:
              progress = earned ? criteria.target : 0;
          }
        }

        result.push({
          achievement: {
            id: achievement.id,
            name: achievement.name,
            title: achievement.title,
            description: achievement.description,
            category: achievement.category,
            icon: achievement.icon,
            color: achievement.color,
            rarity: achievement.rarity
          },
          earned: !!earned,
          earnedAt: earned?.earnedAt,
          progress,
          target: criteria.target
        });
      }

      return result.sort((a, b) => {
        if (a.earned && !b.earned) return 1;
        if (!a.earned && b.earned) return -1;
        return b.progress - a.progress;
      });
    } catch (error) {
      logger.error('Failed to get user achievements', { userId, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Get achievement leaderboard
   */
  async getAchievementLeaderboard(limit: number = 10): Promise<any[]> {
    try {
      const leaderboard = await prisma.user.findMany({
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          userAchievements: {
            include: {
              achievement: {
                select: {
                  rarity: true,
                  rewards: true
                }
              }
            }
          }
        },
        take: limit
      });

      return leaderboard.map(user => {
        const achievementStats = user.userAchievements.reduce((acc, ua) => {
          acc.total++;
          acc.rarityCount[ua.achievement.rarity] = (acc.rarityCount[ua.achievement.rarity] || 0) + 1;
          
          const rewards = ua.achievement.rewards as any;
          acc.totalPoints += rewards.points || 0;
          
          return acc;
        }, {
          total: 0,
          rarityCount: {} as Record<string, number>,
          totalPoints: 0
        });

        return {
          user: {
            id: user.id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName
          },
          achievements: {
            total: achievementStats.total,
            common: achievementStats.rarityCount.common || 0,
            rare: achievementStats.rarityCount.rare || 0,
            epic: achievementStats.rarityCount.epic || 0,
            legendary: achievementStats.rarityCount.legendary || 0,
            totalPoints: achievementStats.totalPoints
          }
        };
      }).sort((a, b) => b.achievements.total - a.achievements.total);
    } catch (error) {
      logger.error('Failed to get achievement leaderboard', { error: (error as Error).message });
      throw error;
    }
  }

  // Helper methods
  private async getFriendsCount(userId: string): Promise<number> {
    return await prisma.userRelationship.count({
      where: { userId, status: 'accepted' }
    });
  }

  private async getGroupsCount(userId: string): Promise<number> {
    return await prisma.studyGroupMember.count({
      where: { userId, isActive: true }
    });
  }

  private async hasSessionOfDuration(userId: string, durationMinutes: number): Promise<boolean> {
    const session = await prisma.learningSession.findFirst({
      where: {
        userId,
        totalTimeSeconds: { gte: durationMinutes * 60 }
      }
    });
    return !!session;
  }
}