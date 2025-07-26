/**
 * 用户进度跟踪服务
 * 管理用户学习进度、成就和详细分析
 */

export interface UserProgress {
  userId: string;
  totalWordsStudied: number;
  totalStoriesRead: number;
  totalTestsCompleted: number;
  currentStreak: number;
  longestStreak: number;
  totalStudyTime: number; // in minutes
  level: number;
  experience: number;
  experienceToNextLevel: number;
  createdAt: Date;
  lastActive: Date;
  weeklyGoal: number;
  monthlyGoal: number;
}

export interface LearningSession {
  id: string;
  userId: string;
  type: 'story' | 'test' | 'vocabulary' | 'review';
  contentId: string;
  startTime: Date;
  endTime: Date;
  duration: number; // in minutes
  score?: number;
  wordsLearned: number;
  correctAnswers: number;
  totalQuestions: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isCompleted: boolean;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  unlockedAt: Date;
  progress: number;
  isCompleted: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'learning' | 'streak' | 'mastery' | 'social' | 'time';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  requirements: {
    type: string;
    target: number;
    timeframe?: string;
  };
  rewards: {
    experience: number;
    title?: string;
  };
}

export interface DetailedStats {
  daily: {
    date: string;
    wordsLearned: number;
    studyTime: number;
    testsCompleted: number;
    accuracy: number;
  }[];
  weekly: {
    week: string;
    totalWords: number;
    totalTime: number;
    averageAccuracy: number;
    streak: number;
  }[];
  monthly: {
    month: string;
    wordsLearned: number;
    storiesRead: number;
    testsCompleted: number;
    averageScore: number;
  }[];
  categoryBreakdown: {
    category: string;
    wordsLearned: number;
    accuracy: number;
    timeSpent: number;
  }[];
  difficultyProgression: {
    difficulty: string;
    wordsLearned: number;
    averageScore: number;
    timeSpent: number;
  }[];
}

class UserProgressService {
  private userProgress: Map<string, UserProgress> = new Map();
  private learningSessions: Map<string, LearningSession[]> = new Map();
  private userAchievements: Map<string, UserAchievement[]> = new Map();
  private achievements: Map<string, Achievement> = new Map();

  constructor() {
    this.initializeAchievements();
  }

  /**
   * 初始化成就系统
   */
  private initializeAchievements(): void {
    const achievementsList: Achievement[] = [
      {
        id: 'first_word',
        name: 'First Steps',
        description: 'Learn your first vocabulary word',
        icon: '🌱',
        category: 'learning',
        rarity: 'common',
        requirements: { type: 'words_learned', target: 1 },
        rewards: { experience: 10 }
      },
      {
        id: 'word_master_100',
        name: 'Century Scholar',
        description: 'Learn 100 vocabulary words',
        icon: '📚',
        category: 'learning',
        rarity: 'rare',
        requirements: { type: 'words_learned', target: 100 },
        rewards: { experience: 100, title: 'Scholar' }
      },
      {
        id: 'streak_7',
        name: 'Week Warrior',
        description: 'Maintain a 7-day learning streak',
        icon: '🔥',
        category: 'streak',
        rarity: 'rare',
        requirements: { type: 'streak_days', target: 7 },
        rewards: { experience: 50 }
      },
      {
        id: 'streak_30',
        name: 'Monthly Master',
        description: 'Maintain a 30-day learning streak',
        icon: '⚡',
        category: 'streak',
        rarity: 'epic',
        requirements: { type: 'streak_days', target: 30 },
        rewards: { experience: 200, title: 'Dedicated Learner' }
      },
      {
        id: 'perfect_test',
        name: 'Perfectionist',
        description: 'Score 100% on a test',
        icon: '💯',
        category: 'mastery',
        rarity: 'rare',
        requirements: { type: 'perfect_score', target: 1 },
        rewards: { experience: 75 }
      },
      {
        id: 'speed_demon',
        name: 'Speed Demon',
        description: 'Complete a test in under 5 minutes',
        icon: '⚡',
        category: 'time',
        rarity: 'epic',
        requirements: { type: 'fast_completion', target: 5 },
        rewards: { experience: 100 }
      },
      {
        id: 'early_bird',
        name: 'Early Bird',
        description: 'Study before 8 AM',
        icon: '🌅',
        category: 'time',
        rarity: 'common',
        requirements: { type: 'early_study', target: 1 },
        rewards: { experience: 25 }
      },
      {
        id: 'night_owl',
        name: 'Night Owl',
        description: 'Study after 10 PM',
        icon: '🦉',
        category: 'time',
        rarity: 'common',
        requirements: { type: 'late_study', target: 1 },
        rewards: { experience: 25 }
      }
    ];

    achievementsList.forEach(achievement => {
      this.achievements.set(achievement.id, achievement);
    });
  }

  /**
   * 获取用户进度
   */
  async getUserProgress(userId: string): Promise<UserProgress> {
    let progress = this.userProgress.get(userId);
    
    if (!progress) {
      progress = {
        userId,
        totalWordsStudied: 0,
        totalStoriesRead: 0,
        totalTestsCompleted: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalStudyTime: 0,
        level: 1,
        experience: 0,
        experienceToNextLevel: 100,
        createdAt: new Date(),
        lastActive: new Date(),
        weeklyGoal: 50,
        monthlyGoal: 200
      };
      
      this.userProgress.set(userId, progress);
    }

    return progress;
  }

  /**
   * 记录学习会话
   */
  async recordLearningSession(session: Omit<LearningSession, 'id'>): Promise<LearningSession> {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullSession: LearningSession = {
      ...session,
      id: sessionId
    };

    const userSessions = this.learningSessions.get(session.userId) || [];
    userSessions.push(fullSession);
    this.learningSessions.set(session.userId, userSessions);

    // 更新用户进度
    await this.updateProgressFromSession(fullSession);

    return fullSession;
  }

  /**
   * 从学习会话更新用户进度
   */
  private async updateProgressFromSession(session: LearningSession): Promise<void> {
    const progress = await this.getUserProgress(session.userId);
    
    // 更新基本统计
    progress.totalStudyTime += session.duration;
    progress.lastActive = session.endTime;

    if (session.type === 'story') {
      progress.totalStoriesRead++;
    } else if (session.type === 'test') {
      progress.totalTestsCompleted++;
    }

    progress.totalWordsStudied += session.wordsLearned;

    // 更新连胜记录
    const today = new Date().toDateString();
    const lastActiveDay = progress.lastActive.toDateString();
    
    if (today === lastActiveDay) {
      // 同一天，保持连胜
    } else if (this.isConsecutiveDay(progress.lastActive, new Date())) {
      progress.currentStreak++;
      progress.longestStreak = Math.max(progress.longestStreak, progress.currentStreak);
    } else {
      progress.currentStreak = 1;
    }

    // 计算经验值和等级
    const experienceGained = this.calculateExperience(session);
    progress.experience += experienceGained;

    // 检查升级
    while (progress.experience >= progress.experienceToNextLevel) {
      progress.experience -= progress.experienceToNextLevel;
      progress.level++;
      progress.experienceToNextLevel = this.calculateNextLevelRequirement(progress.level);
    }

    this.userProgress.set(session.userId, progress);

    // 检查成就解锁
    await this.checkAchievements(session.userId);
  }

  /**
   * 计算经验值
   */
  private calculateExperience(session: LearningSession): number {
    let baseExp = 10;
    
    // 根据学习类型调整
    if (session.type === 'test') baseExp *= 2;
    if (session.type === 'review') baseExp *= 1.5;
    
    // 根据难度调整
    const difficultyMultiplier = {
      beginner: 1,
      intermediate: 1.5,
      advanced: 2
    };
    baseExp *= difficultyMultiplier[session.difficulty];
    
    // 根据正确率调整
    if (session.score && session.score >= 90) baseExp *= 1.2;
    else if (session.score && session.score >= 80) baseExp *= 1.1;
    
    // 根据学习的单词数量调整
    baseExp += session.wordsLearned * 2;
    
    return Math.round(baseExp);
  }

  /**
   * 计算下一级所需经验
   */
  private calculateNextLevelRequirement(level: number): number {
    return 100 * Math.pow(1.1, level - 1);
  }

  /**
   * 检查是否为连续日期
   */
  private isConsecutiveDay(date1: Date, date2: Date): boolean {
    const oneDay = 24 * 60 * 60 * 1000;
    const diffDays = Math.round(Math.abs((date1.getTime() - date2.getTime()) / oneDay));
    return diffDays === 1;
  }

  /**
   * 检查成就解锁
   */
  private async checkAchievements(userId: string): Promise<UserAchievement[]> {
    const progress = await this.getUserProgress(userId);
    const userAchievements = this.userAchievements.get(userId) || [];
    const newAchievements: UserAchievement[] = [];

    for (const [achievementId, achievement] of this.achievements) {
      // 检查是否已经解锁
      const existing = userAchievements.find(ua => ua.achievementId === achievementId);
      if (existing && existing.isCompleted) continue;

      let currentProgress = 0;
      let isCompleted = false;

      // 根据成就类型检查进度
      switch (achievement.requirements.type) {
        case 'words_learned':
          currentProgress = progress.totalWordsStudied;
          break;
        case 'streak_days':
          currentProgress = progress.currentStreak;
          break;
        case 'tests_completed':
          currentProgress = progress.totalTestsCompleted;
          break;
        case 'stories_read':
          currentProgress = progress.totalStoriesRead;
          break;
      }

      isCompleted = currentProgress >= achievement.requirements.target;

      if (existing) {
        existing.progress = currentProgress;
        existing.isCompleted = isCompleted;
        if (isCompleted && !existing.isCompleted) {
          existing.unlockedAt = new Date();
          progress.experience += achievement.rewards.experience;
        }
      } else if (currentProgress > 0) {
        const newAchievement: UserAchievement = {
          id: `ua_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId,
          achievementId,
          unlockedAt: isCompleted ? new Date() : new Date(0),
          progress: currentProgress,
          isCompleted
        };
        
        userAchievements.push(newAchievement);
        newAchievements.push(newAchievement);
        
        if (isCompleted) {
          progress.experience += achievement.rewards.experience;
        }
      }
    }

    this.userAchievements.set(userId, userAchievements);
    return newAchievements;
  }

  /**
   * 获取用户成就
   */
  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    return this.userAchievements.get(userId) || [];
  }

  /**
   * 获取所有成就定义
   */
  async getAllAchievements(): Promise<Achievement[]> {
    return Array.from(this.achievements.values());
  }

  /**
   * 获取详细学习统计
   */
  async getDetailedStats(userId: string, timeframe: 'week' | 'month' | 'year' = 'month'): Promise<DetailedStats> {
    const sessions = this.learningSessions.get(userId) || [];
    const now = new Date();
    const startDate = new Date();
    
    // 设置时间范围
    switch (timeframe) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    const filteredSessions = sessions.filter(s => s.endTime >= startDate);

    // 生成日统计
    const daily = this.generateDailyStats(filteredSessions, startDate, now);
    
    // 生成周统计
    const weekly = this.generateWeeklyStats(filteredSessions);
    
    // 生成月统计
    const monthly = this.generateMonthlyStats(filteredSessions);
    
    // 分类统计
    const categoryBreakdown = this.generateCategoryStats(filteredSessions);
    
    // 难度进展
    const difficultyProgression = this.generateDifficultyStats(filteredSessions);

    return {
      daily,
      weekly,
      monthly,
      categoryBreakdown,
      difficultyProgression
    };
  }

  /**
   * 生成每日统计
   */
  private generateDailyStats(sessions: LearningSession[], startDate: Date, endDate: Date): DetailedStats['daily'] {
    const daily: DetailedStats['daily'] = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      const dayStr = current.toISOString().split('T')[0];
      const daySessions = sessions.filter(s => 
        s.endTime.toISOString().split('T')[0] === dayStr
      );

      daily.push({
        date: dayStr,
        wordsLearned: daySessions.reduce((sum, s) => sum + s.wordsLearned, 0),
        studyTime: daySessions.reduce((sum, s) => sum + s.duration, 0),
        testsCompleted: daySessions.filter(s => s.type === 'test').length,
        accuracy: this.calculateAverageAccuracy(daySessions)
      });

      current.setDate(current.getDate() + 1);
    }

    return daily;
  }

  /**
   * 生成周统计
   */
  private generateWeeklyStats(sessions: LearningSession[]): DetailedStats['weekly'] {
    // 简化实现
    return [];
  }

  /**
   * 生成月统计
   */
  private generateMonthlyStats(sessions: LearningSession[]): DetailedStats['monthly'] {
    // 简化实现
    return [];
  }

  /**
   * 生成分类统计
   */
  private generateCategoryStats(sessions: LearningSession[]): DetailedStats['categoryBreakdown'] {
    // 简化实现
    return [];
  }

  /**
   * 生成难度统计
   */
  private generateDifficultyStats(sessions: LearningSession[]): DetailedStats['difficultyProgression'] {
    return ['beginner', 'intermediate', 'advanced'].map(difficulty => {
      const difficultySessions = sessions.filter(s => s.difficulty === difficulty);
      return {
        difficulty,
        wordsLearned: difficultySessions.reduce((sum, s) => sum + s.wordsLearned, 0),
        averageScore: this.calculateAverageScore(difficultySessions),
        timeSpent: difficultySessions.reduce((sum, s) => sum + s.duration, 0)
      };
    });
  }

  /**
   * 计算平均准确率
   */
  private calculateAverageAccuracy(sessions: LearningSession[]): number {
    const testSessions = sessions.filter(s => s.totalQuestions > 0);
    if (testSessions.length === 0) return 0;

    const totalAccuracy = testSessions.reduce((sum, s) => 
      sum + (s.correctAnswers / s.totalQuestions * 100), 0
    );
    
    return Math.round(totalAccuracy / testSessions.length);
  }

  /**
   * 计算平均分数
   */
  private calculateAverageScore(sessions: LearningSession[]): number {
    const scoredSessions = sessions.filter(s => s.score !== undefined);
    if (scoredSessions.length === 0) return 0;

    const totalScore = scoredSessions.reduce((sum, s) => sum + (s.score || 0), 0);
    return Math.round(totalScore / scoredSessions.length);
  }

  /**
   * 设置学习目标
   */
  async setLearningGoals(userId: string, weeklyGoal: number, monthlyGoal: number): Promise<UserProgress> {
    const progress = await this.getUserProgress(userId);
    progress.weeklyGoal = weeklyGoal;
    progress.monthlyGoal = monthlyGoal;
    this.userProgress.set(userId, progress);
    return progress;
  }

  /**
   * 获取排行榜
   */
  async getLeaderboard(type: 'words' | 'streak' | 'level' | 'time', limit: number = 10): Promise<UserProgress[]> {
    const allProgress = Array.from(this.userProgress.values());
    
    allProgress.sort((a, b) => {
      switch (type) {
        case 'words':
          return b.totalWordsStudied - a.totalWordsStudied;
        case 'streak':
          return b.currentStreak - a.currentStreak;
        case 'level':
          return b.level - a.level || b.experience - a.experience;
        case 'time':
          return b.totalStudyTime - a.totalStudyTime;
        default:
          return 0;
      }
    });

    return allProgress.slice(0, limit);
  }
}

export default new UserProgressService();