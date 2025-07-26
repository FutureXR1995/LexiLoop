/**
 * 词汇库管理服务
 * 提供词汇集合的创建、管理和分组功能
 * 使用真实MongoDB数据库
 */

import { realDatabaseService } from './realDatabaseService';
import { Vocabulary, IVocabulary } from '../models/Vocabulary';
import { UserProgress, IUserProgress } from '../models/UserProgress';
import { User, IUser } from '../models/User';
import mongoose from 'mongoose';

// Using MongoDB model interfaces directly
export type VocabularyWord = IVocabulary;

export interface VocabularyCollection {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  words: VocabularyWord[];
  isPublic: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  stats: {
    totalWords: number;
    averageDifficulty: number;
    completionRate: number;
  };
}

// Using MongoDB model interfaces directly
export type WordProgress = IUserProgress;

class VocabularyLibraryService {
  private initialized = false;

  constructor() {
    // Don't initialize immediately, wait for explicit call
  }

  async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initializeDefaultVocabulary();
      this.initialized = true;
    }
  }

  /**
   * 初始化默认词汇
   */
  private async initializeDefaultVocabulary(): Promise<void> {
    try {
      // Check if MongoDB is connected
      if (!mongoose.connection.readyState) {
        console.log('MongoDB not connected, skipping vocabulary initialization');
        return;
      }

      // Check if we already have vocabulary
      const existingCount = await realDatabaseService.aggregate(Vocabulary, [
        { $count: "total" }
      ]);
      
      if (existingCount && existingCount.length > 0 && (existingCount[0] as any)?.total > 0) {
        return; // Already initialized
      }

      // Create a system user for default vocabulary
      let systemUser = await realDatabaseService.findOneWithCache<IUser>(
        User, 
        { username: 'system' }
      );

      if (!systemUser) {
        systemUser = await realDatabaseService.create<IUser>(User, {
          username: 'system',
          email: 'system@lexiloop.com',
          password: 'system_password_hash',
          role: 'admin',
          preferences: {
            language: 'en',
            difficulty: 'intermediate',
            dailyGoal: 10,
            notifications: { email: false, push: false, reminders: false },
            learningMode: 'standard'
          },
          subscription: {
            plan: 'pro',
            status: 'active',
            features: ['unlimited_words', 'advanced_analytics']
          },
          profile: {},
          learningStats: {
            totalWordsLearned: 0,
            currentStreak: 0,
            longestStreak: 0,
            totalStudyTime: 0,
            averageAccuracy: 0
          }
        });
      }

      // Create TOEFL vocabulary entries
      const toeflVocabulary = [
        {
          word: 'abandon',
          definitions: [{
            meaning: 'to give up completely; to desert',
            example: 'The sailors had to abandon the sinking ship.'
          }],
          pronunciation: '/əˈbændən/',
          partOfSpeech: ['verb'],
          difficulty: 'intermediate',
          categories: ['TOEFL', 'Academic English'],
          tags: ['academic', 'formal'],
          frequency: 7,
          usage: { formal: true, informal: false, academic: true, business: false, technical: false },
          createdBy: systemUser._id,
          isPublic: true,
          isVerified: true
        },
        {
          word: 'accommodate',
          definitions: [{
            meaning: 'to provide lodging or sufficient space for; to adapt or adjust',
            example: 'The hotel can accommodate 500 guests.'
          }],
          pronunciation: '/əˈkɒmədeɪt/',
          partOfSpeech: ['verb'],
          difficulty: 'advanced',
          categories: ['TOEFL', 'Academic English'],
          tags: ['academic', 'business'],
          frequency: 6,
          usage: { formal: true, informal: false, academic: true, business: true, technical: false },
          createdBy: systemUser._id,
          isPublic: true,
          isVerified: true
        },
        {
          word: 'acquire',
          definitions: [{
            meaning: 'to obtain or gain possession of',
            example: 'The company plans to acquire its main competitor.'
          }],
          pronunciation: '/əˈkwaɪər/',
          partOfSpeech: ['verb'],
          difficulty: 'intermediate',
          categories: ['TOEFL', 'Academic English'],
          tags: ['academic', 'business'],
          frequency: 8,
          usage: { formal: true, informal: false, academic: true, business: true, technical: false },
          createdBy: systemUser._id,
          isPublic: true,
          isVerified: true
        }
      ];

      // Add GRE vocabulary
      const greVocabulary = [
        {
          word: 'abate',
          definitions: [{
            meaning: 'to reduce in intensity or amount',
            example: 'The storm began to abate after midnight.'
          }],
          pronunciation: '/əˈbeɪt/',
          partOfSpeech: ['verb'],
          difficulty: 'advanced',
          categories: ['GRE', 'Graduate English'],
          tags: ['academic', 'formal'],
          frequency: 5,
          usage: { formal: true, informal: false, academic: true, business: false, technical: false },
          createdBy: systemUser._id,
          isPublic: true,
          isVerified: true
        },
        {
          word: 'aberrant',
          definitions: [{
            meaning: 'departing from an established course; deviant',
            example: 'The aberrant behavior concerned his teachers.'
          }],
          pronunciation: '/əˈberənt/',
          partOfSpeech: ['adjective'],
          difficulty: 'advanced',
          categories: ['GRE', 'Graduate English'],
          tags: ['academic', 'psychology'],
          frequency: 4,
          usage: { formal: true, informal: false, academic: true, business: false, technical: true },
          createdBy: systemUser._id,
          isPublic: true,
          isVerified: true
        }
      ];

      // Add Business vocabulary
      const businessVocabulary = [
        {
          word: 'quarterly',
          definitions: [{
            meaning: 'occurring every three months',
            example: 'The company releases quarterly earnings reports.'
          }],
          pronunciation: '/ˈkwɔːtərli/',
          partOfSpeech: ['adjective', 'adverb'],
          difficulty: 'intermediate',
          categories: ['Business English', 'Finance'],
          tags: ['business', 'finance'],
          frequency: 6,
          usage: { formal: true, informal: false, academic: false, business: true, technical: false },
          createdBy: systemUser._id,
          isPublic: true,
          isVerified: true
        },
        {
          word: 'revenue',
          definitions: [{
            meaning: 'income generated from business operations',
            example: 'The company\'s revenue exceeded expectations.'
          }],
          pronunciation: '/ˈrevənjuː/',
          partOfSpeech: ['noun'],
          difficulty: 'intermediate',
          categories: ['Business English', 'Finance'],
          tags: ['business', 'finance'],
          frequency: 8,
          usage: { formal: true, informal: false, academic: false, business: true, technical: false },
          createdBy: systemUser._id,
          isPublic: true,
          isVerified: true
        }
      ];

      // Bulk insert all vocabulary
      const allVocabulary = [...toeflVocabulary, ...greVocabulary, ...businessVocabulary];
      await realDatabaseService.bulkWrite(Vocabulary, 
        allVocabulary.map(vocab => ({
          insertOne: { document: vocab }
        }))
      );

    } catch (error) {
      console.error('Error initializing default vocabulary:', error);
    }
  }

  /**
   * 获取所有词汇集合 (基于分类分组)
   */
  async getAllCollections(): Promise<VocabularyCollection[]> {
    await this.ensureInitialized();
    const categories = await realDatabaseService.aggregate<{
      _id: string;
      words: IVocabulary[];
      totalWords: number;
      averageDifficulty: number;
    }>(Vocabulary, [
      { $match: { isPublic: true } },
      { $unwind: '$categories' },
      { $group: {
        _id: '$categories',
        words: { $push: '$$ROOT' },
        totalWords: { $sum: 1 },
        averageDifficulty: { $avg: { $cond: [
          { $eq: ['$difficulty', 'beginner'] }, 1,
          { $cond: [{ $eq: ['$difficulty', 'intermediate'] }, 2, 3] }
        ]} }
      }},
      { $sort: { totalWords: -1 } }
    ]);

    return categories.map(category => ({
      id: category._id.toLowerCase().replace(/\s+/g, '_'),
      name: `${category._id} Collection`,
      description: `Vocabulary collection for ${category._id}`,
      category: category._id,
      difficulty: category.averageDifficulty <= 1.5 ? 'beginner' : 
                  category.averageDifficulty <= 2.5 ? 'intermediate' : 'advanced',
      words: category.words,
      isPublic: true,
      createdBy: 'system',
      createdAt: new Date(),
      updatedAt: new Date(),
      stats: {
        totalWords: category.totalWords,
        averageDifficulty: Math.round(category.averageDifficulty * 10) / 10,
        completionRate: 0
      }
    }));
  }

  /**
   * 根据ID获取词汇集合
   */
  async getCollectionById(id: string): Promise<VocabularyCollection | null> {
    const categoryName = id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const words = await realDatabaseService.findWithCache<IVocabulary>(
      Vocabulary,
      { categories: categoryName, isPublic: true },
      { sort: { frequency: -1 } }
    );
    
    if (words.length === 0) return null;
    
    const avgDifficulty = words.reduce((sum, word) => {
      const difficultyMap = { beginner: 1, intermediate: 2, advanced: 3 };
      return sum + difficultyMap[word.difficulty];
    }, 0) / words.length;
    
    return {
      id,
      name: `${categoryName} Collection`,
      description: `Vocabulary collection for ${categoryName}`,
      category: categoryName,
      difficulty: avgDifficulty <= 1.5 ? 'beginner' : avgDifficulty <= 2.5 ? 'intermediate' : 'advanced',
      words,
      isPublic: true,
      createdBy: 'system',
      createdAt: new Date(),
      updatedAt: new Date(),
      stats: {
        totalWords: words.length,
        averageDifficulty: Math.round(avgDifficulty * 10) / 10,
        completionRate: 0
      }
    };
  }

  /**
   * 根据分类筛选词汇集合
   */
  async getCollectionsByCategory(category: string): Promise<VocabularyCollection[]> {
    const words = await realDatabaseService.findWithCache<IVocabulary>(
      Vocabulary,
      { categories: category, isPublic: true },
      { sort: { frequency: -1 } }
    );
    
    if (words.length === 0) return [];
    
    const avgDifficulty = words.reduce((sum, word) => {
      const difficultyMap = { beginner: 1, intermediate: 2, advanced: 3 };
      return sum + difficultyMap[word.difficulty];
    }, 0) / words.length;
    
    return [{
      id: category.toLowerCase().replace(/\s+/g, '_'),
      name: `${category} Collection`,
      description: `Vocabulary collection for ${category}`,
      category,
      difficulty: avgDifficulty <= 1.5 ? 'beginner' : avgDifficulty <= 2.5 ? 'intermediate' : 'advanced',
      words,
      isPublic: true,
      createdBy: 'system',
      createdAt: new Date(),
      updatedAt: new Date(),
      stats: {
        totalWords: words.length,
        averageDifficulty: Math.round(avgDifficulty * 10) / 10,
        completionRate: 0
      }
    }];
  }

  /**
   * 根据难度筛选词汇集合
   */
  async getCollectionsByDifficulty(difficulty: string): Promise<VocabularyCollection[]> {
    const categories = await realDatabaseService.aggregate<{
      _id: string;
      words: IVocabulary[];
      totalWords: number;
    }>(Vocabulary, [
      { $match: { difficulty, isPublic: true } },
      { $unwind: '$categories' },
      { $group: {
        _id: '$categories',
        words: { $push: '$$ROOT' },
        totalWords: { $sum: 1 }
      }},
      { $sort: { totalWords: -1 } }
    ]);
    
    const difficultyMap = { beginner: 1, intermediate: 2, advanced: 3 };
    
    return categories.map(category => ({
      id: category._id.toLowerCase().replace(/\s+/g, '_'),
      name: `${category._id} Collection`,
      description: `${difficulty} level vocabulary for ${category._id}`,
      category: category._id,
      difficulty: difficulty as 'beginner' | 'intermediate' | 'advanced',
      words: category.words,
      isPublic: true,
      createdBy: 'system',
      createdAt: new Date(),
      updatedAt: new Date(),
      stats: {
        totalWords: category.totalWords,
        averageDifficulty: difficultyMap[difficulty as keyof typeof difficultyMap],
        completionRate: 0
      }
    }));
  }

  /**
   * 搜索词汇集合
   */
  async searchCollections(query: string): Promise<VocabularyCollection[]> {
    const words = await realDatabaseService.findWithCache<IVocabulary>(
      Vocabulary,
      { 
        $or: [
          { word: { $regex: query, $options: 'i' } },
          { 'definitions.meaning': { $regex: query, $options: 'i' } },
          { categories: { $regex: query, $options: 'i' } },
          { tags: { $regex: query, $options: 'i' } }
        ],
        isPublic: true 
      },
      { sort: { frequency: -1 }, limit: 50 }
    );
    
    if (words.length === 0) return [];
    
    // Group by categories
    const categoryGroups = words.reduce((groups, word) => {
      word.categories.forEach(category => {
        if (!groups[category]) {
          groups[category] = [];
        }
        groups[category].push(word);
      });
      return groups;
    }, {} as Record<string, IVocabulary[]>);
    
    return Object.entries(categoryGroups).map(([category, categoryWords]) => {
      const avgDifficulty = categoryWords.reduce((sum, word) => {
        const difficultyMap = { beginner: 1, intermediate: 2, advanced: 3 };
        return sum + difficultyMap[word.difficulty];
      }, 0) / categoryWords.length;
      
      return {
        id: category.toLowerCase().replace(/\s+/g, '_'),
        name: `${category} Collection`,
        description: `Search results for "${query}" in ${category}`,
        category,
        difficulty: avgDifficulty <= 1.5 ? 'beginner' : avgDifficulty <= 2.5 ? 'intermediate' : 'advanced',
        words: categoryWords,
        isPublic: true,
        createdBy: 'system',
        createdAt: new Date(),
        updatedAt: new Date(),
        stats: {
          totalWords: categoryWords.length,
          averageDifficulty: Math.round(avgDifficulty * 10) / 10,
          completionRate: 0
        }
      };
    });
  }

  /**
   * 创建新词汇
   */
  async createVocabulary(vocabularyData: Partial<IVocabulary>): Promise<VocabularyWord> {
    return await realDatabaseService.create<IVocabulary>(Vocabulary, vocabularyData);
  }

  /**
   * 添加单词到数据库
   */
  async addWord(wordData: Partial<IVocabulary>): Promise<VocabularyWord | null> {
    try {
      return await realDatabaseService.create<IVocabulary>(Vocabulary, wordData);
    } catch (error) {
      console.error('Error adding word:', error);
      return null;
    }
  }

  /**
   * 获取用户的词汇学习进度
   */
  async getUserProgress(userId: string): Promise<WordProgress[]> {
    return await realDatabaseService.findWithCache<IUserProgress>(
      UserProgress,
      { userId: new mongoose.Types.ObjectId(userId) },
      { sort: { updatedAt: -1 } }
    );
  }

  /**
   * 更新用户单词学习进度
   */
  async updateWordProgress(userId: string, wordId: string, isCorrect: boolean): Promise<WordProgress> {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const vocabularyObjectId = new mongoose.Types.ObjectId(wordId);

    // Find existing progress
    let progress = await realDatabaseService.findOneWithCache<IUserProgress>(
      UserProgress,
      { userId: userObjectId, vocabularyId: vocabularyObjectId }
    );

    if (!progress) {
      // Create new progress record
      progress = await realDatabaseService.create<IUserProgress>(UserProgress, {
        userId: userObjectId,
        vocabularyId: vocabularyObjectId,
        status: 'learning',
        difficulty: 'intermediate',
        stats: {
          totalAttempts: 1,
          correctAttempts: isCorrect ? 1 : 0,
          consecutiveCorrect: isCorrect ? 1 : 0,
          lastAttemptCorrect: isCorrect,
          averageResponseTime: 3000,
          lastReviewedAt: new Date()
        },
        spacedRepetition: {
          easeFactor: 2.5,
          interval: 1,
          repetitions: 0,
          nextReview: new Date(Date.now() + 24 * 60 * 60 * 1000),
          quality: isCorrect ? 4 : 2
        },
        learningModes: {
          flashcard: { attempts: 1, correct: isCorrect ? 1 : 0, lastUsed: new Date() },
          typing: { attempts: 0, correct: 0 },
          listening: { attempts: 0, correct: 0 },
          speaking: { attempts: 0, correct: 0 }
        },
        errors: [],
        bookmarks: { isBookmarked: false }
      });
    } else {
      // Update existing progress
      const updates: any = {
        'stats.totalAttempts': progress.stats.totalAttempts + 1,
        'stats.lastAttemptCorrect': isCorrect,
        'stats.lastReviewedAt': new Date(),
        'learningModes.flashcard.attempts': progress.learningModes.flashcard.attempts + 1,
        'learningModes.flashcard.lastUsed': new Date()
      };

      if (isCorrect) {
        updates['stats.correctAttempts'] = progress.stats.correctAttempts + 1;
        updates['stats.consecutiveCorrect'] = progress.stats.consecutiveCorrect + 1;
        updates['learningModes.flashcard.correct'] = progress.learningModes.flashcard.correct + 1;
        
        // Update spaced repetition
        const newInterval = Math.min(progress.spacedRepetition.interval * progress.spacedRepetition.easeFactor, 30);
        updates['spacedRepetition.interval'] = newInterval;
        updates['spacedRepetition.repetitions'] = progress.spacedRepetition.repetitions + 1;
        updates['spacedRepetition.nextReview'] = new Date(Date.now() + newInterval * 24 * 60 * 60 * 1000);
        updates['spacedRepetition.quality'] = 4;
        
        if (progress.stats.correctAttempts + 1 >= 5 && 
            (progress.stats.correctAttempts + 1) / (progress.stats.totalAttempts + 1) >= 0.8) {
          updates.status = 'mastered';
        }
      } else {
        updates['stats.consecutiveCorrect'] = 0;
        updates['spacedRepetition.interval'] = 1;
        updates['spacedRepetition.nextReview'] = new Date(Date.now() + 24 * 60 * 60 * 1000);
        updates['spacedRepetition.quality'] = 2;
        updates.status = 'reviewing';
      }

      await realDatabaseService.updateOne(UserProgress, 
        { userId: userObjectId, vocabularyId: vocabularyObjectId },
        { $set: updates }
      );

      // Fetch updated progress
      progress = await realDatabaseService.findOneWithCache<IUserProgress>(
        UserProgress,
        { userId: userObjectId, vocabularyId: vocabularyObjectId },
        {},
        undefined,
        0 // No cache for updated data
      );
    }

    return progress!;
  }

  /**
   * 获取需要复习的单词
   */
  async getWordsForReview(userId: string): Promise<VocabularyWord[]> {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const now = new Date();
    
    // Get progress records that need review
    const progressRecords = await realDatabaseService.findWithCache<IUserProgress>(
      UserProgress,
      { 
        userId: userObjectId,
        'spacedRepetition.nextReview': { $lte: now }
      },
      { sort: { 'spacedRepetition.nextReview': 1 }, limit: 20 }
    );

    if (progressRecords.length === 0) return [];

    // Get vocabulary words for these progress records
    const vocabularyIds = progressRecords.map(p => p.vocabularyId);
    const words = await realDatabaseService.findWithCache<IVocabulary>(
      Vocabulary,
      { _id: { $in: vocabularyIds } }
    );

    return words;
  }

  /**
   * 计算平均难度
   */
  private calculateAverageDifficulty(words: VocabularyWord[]): number {
    if (words.length === 0) return 0;
    
    const difficultyMap = { beginner: 1, intermediate: 2, advanced: 3 };
    const total = words.reduce((sum, word) => sum + difficultyMap[word.difficulty], 0);
    return total / words.length;
  }

  /**
   * 获取学习统计
   */
  async getLearnStats(userId: string): Promise<{
    totalWordsStudied: number;
    masteredWords: number;
    averageMastery: number;
    streakDays: number;
  }> {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    
    const stats = await realDatabaseService.aggregate<{
      totalWordsStudied: number;
      masteredWords: number;
      averageAccuracy: number;
    }>(UserProgress, [
      { $match: { userId: userObjectId } },
      { $group: {
        _id: null,
        totalWordsStudied: { $sum: 1 },
        masteredWords: { $sum: { $cond: [{ $eq: ['$status', 'mastered'] }, 1, 0] } },
        averageAccuracy: { 
          $avg: { 
            $cond: [
              { $gt: ['$stats.totalAttempts', 0] },
              { $multiply: [{ $divide: ['$stats.correctAttempts', '$stats.totalAttempts'] }, 100] },
              0
            ]
          }
        }
      }}
    ]);

    const result = stats[0] || { totalWordsStudied: 0, masteredWords: 0, averageAccuracy: 0 };
    
    return {
      totalWordsStudied: result.totalWordsStudied,
      masteredWords: result.masteredWords,
      averageMastery: Math.round(result.averageAccuracy || 0),
      streakDays: await this.calculateStreakDays(userId)
    };
  }

  /**
   * 计算连续学习天数
   */
  private async calculateStreakDays(userId: string): Promise<number> {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const recentProgress = await realDatabaseService.findWithCache<IUserProgress>(
      UserProgress,
      { 
        userId: userObjectId,
        'stats.lastReviewedAt': { $gte: sevenDaysAgo }
      }
    );

    // Simple streak calculation based on recent activity
    return Math.min(recentProgress.length, 7);
  }
}

export default new VocabularyLibraryService();