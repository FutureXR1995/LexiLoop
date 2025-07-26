/**
 * Social Service
 * Handles user relationships, study groups, and social features
 */

import { prisma } from './databaseService';
import { logger } from '../utils/logger';

export interface FriendRequest {
  id: string;
  userId: string;
  friendId: string;
  status: 'pending' | 'accepted' | 'blocked';
  user: {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
  };
  friend: {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
  };
  createdAt: Date;
}

export interface StudyGroupInfo {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  maxMembers: number;
  memberCount: number;
  creator: {
    id: string;
    username: string;
  };
  createdAt: Date;
}

export interface UserStatsInfo {
  totalWordsLearned: number;
  totalStudyTimeMinutes: number;
  currentStreak: number;
  longestStreak: number;
  totalPoints: number;
  level: number;
  experiencePoints: number;
  averageAccuracy: number;
}

export class SocialService {
  /**
   * Send friend request
   */
  async sendFriendRequest(userId: string, friendEmail: string): Promise<FriendRequest> {
    logger.info('Sending friend request', { userId, friendEmail });

    try {
      // Find the target user
      const targetUser = await prisma.user.findUnique({
        where: { email: friendEmail },
        select: { id: true, username: true, firstName: true, lastName: true }
      });

      if (!targetUser) {
        throw new Error('User not found');
      }

      if (targetUser.id === userId) {
        throw new Error('Cannot send friend request to yourself');
      }

      // Check if relationship already exists
      const existingRelation = await prisma.userRelationship.findFirst({
        where: {
          OR: [
            { userId, friendId: targetUser.id },
            { userId: targetUser.id, friendId: userId }
          ]
        }
      });

      if (existingRelation) {
        throw new Error('Relationship already exists');
      }

      // Create friend request
      const friendRequest = await prisma.userRelationship.create({
        data: {
          userId,
          friendId: targetUser.id,
          status: 'pending'
        },
        include: {
          user: {
            select: { id: true, username: true, firstName: true, lastName: true }
          },
          friend: {
            select: { id: true, username: true, firstName: true, lastName: true }
          }
        }
      });

      logger.info('Friend request sent', { userId, friendId: targetUser.id });
      return friendRequest as FriendRequest;
    } catch (error) {
      logger.error('Failed to send friend request', { userId, friendEmail, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Accept friend request
   */
  async acceptFriendRequest(userId: string, requestId: string): Promise<void> {
    logger.info('Accepting friend request', { userId, requestId });

    try {
      const request = await prisma.userRelationship.findUnique({
        where: { id: requestId }
      });

      if (!request || request.friendId !== userId) {
        throw new Error('Friend request not found or unauthorized');
      }

      if (request.status !== 'pending') {
        throw new Error('Friend request is not pending');
      }

      // Update request status
      await prisma.userRelationship.update({
        where: { id: requestId },
        data: { status: 'accepted' }
      });

      // Create reciprocal relationship
      await prisma.userRelationship.create({
        data: {
          userId: request.friendId,
          friendId: request.userId,
          status: 'accepted'
        }
      });

      // Log activity
      await this.logUserActivity(userId, 'friend_accepted', `Accepted friend request`, 10);
      await this.logUserActivity(request.userId, 'friend_gained', `New friend connection`, 10);

      logger.info('Friend request accepted', { userId, requestId });
    } catch (error) {
      logger.error('Failed to accept friend request', { userId, requestId, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Get user's friends
   */
  async getFriends(userId: string): Promise<any[]> {
    const friends = await prisma.userRelationship.findMany({
      where: {
        userId,
        status: 'accepted'
      },
      include: {
        friend: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            userStats: {
              select: {
                totalPoints: true,
                currentStreak: true,
                level: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return friends.map(f => f.friend);
  }

  /**
   * Get pending friend requests
   */
  async getPendingRequests(userId: string): Promise<FriendRequest[]> {
    const requests = await prisma.userRelationship.findMany({
      where: {
        friendId: userId,
        status: 'pending'
      },
      include: {
        user: {
          select: { id: true, username: true, firstName: true, lastName: true }
        },
        friend: {
          select: { id: true, username: true, firstName: true, lastName: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return requests as FriendRequest[];
  }

  /**
   * Create study group
   */
  async createStudyGroup(userId: string, groupData: {
    name: string;
    description?: string;
    isPublic?: boolean;
    maxMembers?: number;
  }): Promise<StudyGroupInfo> {
    logger.info('Creating study group', { userId, groupName: groupData.name });

    try {
      const group = await prisma.studyGroup.create({
        data: {
          name: groupData.name,
          description: groupData.description,
          isPublic: groupData.isPublic ?? true,
          maxMembers: groupData.maxMembers ?? 50,
          createdBy: userId
        },
        include: {
          creator: {
            select: { id: true, username: true }
          },
          _count: {
            select: { members: true }
          }
        }
      });

      // Add creator as admin member
      await prisma.studyGroupMember.create({
        data: {
          groupId: group.id,
          userId,
          role: 'admin'
        }
      });

      // Log activity
      await this.logUserActivity(userId, 'group_created', `Created study group: ${group.name}`, 25);

      return {
        ...group,
        memberCount: 1
      } as StudyGroupInfo;
    } catch (error) {
      logger.error('Failed to create study group', { userId, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Join study group
   */
  async joinStudyGroup(userId: string, groupId: string): Promise<void> {
    logger.info('Joining study group', { userId, groupId });

    try {
      const group = await prisma.studyGroup.findUnique({
        where: { id: groupId },
        include: {
          _count: { select: { members: true } }
        }
      });

      if (!group) {
        throw new Error('Study group not found');
      }

      if (!group.isPublic) {
        throw new Error('Cannot join private group without invitation');
      }

      if (group._count.members >= group.maxMembers) {
        throw new Error('Study group is full');
      }

      // Check if already a member
      const existingMember = await prisma.studyGroupMember.findUnique({
        where: {
          groupId_userId: {
            groupId,
            userId
          }
        }
      });

      if (existingMember) {
        throw new Error('Already a member of this group');
      }

      // Add as member
      await prisma.studyGroupMember.create({
        data: {
          groupId,
          userId,
          role: 'member'
        }
      });

      // Log activity
      await this.logUserActivity(userId, 'group_joined', `Joined study group: ${group.name}`, 15);

      logger.info('Successfully joined study group', { userId, groupId });
    } catch (error) {
      logger.error('Failed to join study group', { userId, groupId, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Get user's study groups
   */
  async getUserGroups(userId: string): Promise<StudyGroupInfo[]> {
    const memberships = await prisma.studyGroupMember.findMany({
      where: {
        userId,
        isActive: true
      },
      include: {
        group: {
          include: {
            creator: {
              select: { id: true, username: true }
            },
            _count: {
              select: { members: true }
            }
          }
        }
      },
      orderBy: { joinedAt: 'desc' }
    });

    return memberships.map(m => ({
      ...m.group,
      memberCount: m.group._count.members
    })) as StudyGroupInfo[];
  }

  /**
   * Get or create user stats
   */
  async getUserStats(userId: string): Promise<UserStatsInfo> {
    let stats = await prisma.userStats.findUnique({
      where: { userId }
    });

    if (!stats) {
      stats = await prisma.userStats.create({
        data: { userId }
      });
    }

    return {
      totalWordsLearned: stats.totalWordsLearned,
      totalStudyTimeMinutes: stats.totalStudyTimeMinutes,
      currentStreak: stats.currentStreak,
      longestStreak: stats.longestStreak,
      totalPoints: stats.totalPoints,
      level: stats.level,
      experiencePoints: stats.experiencePoints,
      averageAccuracy: parseFloat(stats.averageAccuracy.toString())
    };
  }

  /**
   * Update user stats
   */
  async updateUserStats(userId: string, updates: {
    wordsLearned?: number;
    studyTimeMinutes?: number;
    points?: number;
    accuracy?: number;
  }): Promise<void> {
    try {
      const currentStats = await this.getUserStats(userId);
      
      const newTotalWords = currentStats.totalWordsLearned + (updates.wordsLearned || 0);
      const newTotalTime = currentStats.totalStudyTimeMinutes + (updates.studyTimeMinutes || 0);
      const newTotalPoints = currentStats.totalPoints + (updates.points || 0);
      
      // Calculate new level based on experience points
      const newExperience = currentStats.experiencePoints + (updates.points || 0);
      const newLevel = Math.floor(newExperience / 100) + 1;

      // Update streak logic (simplified)
      const today = new Date().toDateString();
      const lastActive = new Date(currentStats.totalStudyTimeMinutes > 0 ? Date.now() : 0).toDateString();
      const newStreak = today === lastActive ? currentStats.currentStreak : 
                        (updates.studyTimeMinutes || 0) > 0 ? currentStats.currentStreak + 1 : 0;

      await prisma.userStats.update({
        where: { userId },
        data: {
          totalWordsLearned: newTotalWords,
          totalStudyTimeMinutes: newTotalTime,
          totalPoints: newTotalPoints,
          experiencePoints: newExperience,
          level: newLevel,
          currentStreak: newStreak,
          longestStreak: Math.max(currentStats.longestStreak, newStreak),
          averageAccuracy: updates.accuracy || currentStats.averageAccuracy,
          lastActiveDate: new Date()
        }
      });
    } catch (error) {
      logger.error('Failed to update user stats', { userId, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(type: 'points' | 'streak' | 'words' = 'points', limit: number = 10): Promise<any[]> {
    const orderBy = type === 'points' ? { totalPoints: 'desc' } :
                    type === 'streak' ? { currentStreak: 'desc' } :
                    { totalWordsLearned: 'desc' };

    const leaderboard = await prisma.userStats.findMany({
      orderBy,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    return leaderboard.map((entry, index) => ({
      rank: index + 1,
      user: entry.user,
      stats: {
        totalPoints: entry.totalPoints,
        currentStreak: entry.currentStreak,
        totalWordsLearned: entry.totalWordsLearned,
        level: entry.level
      }
    }));
  }

  /**
   * Log user activity
   */
  async logUserActivity(userId: string, activityType: string, description: string, points: number = 0): Promise<void> {
    try {
      await prisma.userActivity.create({
        data: {
          userId,
          activityType,
          description,
          points
        }
      });

      // Update user stats with points
      if (points > 0) {
        await this.updateUserStats(userId, { points });
      }
    } catch (error) {
      logger.error('Failed to log user activity', { userId, activityType, error: (error as Error).message });
    }
  }

  /**
   * Get user activity feed
   */
  async getUserActivityFeed(userId: string, limit: number = 20): Promise<any[]> {
    // Get user's friends
    const friends = await this.getFriends(userId);
    const friendIds = friends.map(f => f.id);
    
    // Get activities from user and friends
    const activities = await prisma.userActivity.findMany({
      where: {
        userId: { in: [userId, ...friendIds] },
        isPublic: true
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    return activities;
  }
}