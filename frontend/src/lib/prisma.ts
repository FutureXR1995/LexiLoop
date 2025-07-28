/**
 * Prisma Database Client Configuration
 * Handles database connection and provides singleton client instance
 */

import { PrismaClient } from '@prisma/client';

// Extend global object for development hot reload
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create Prisma client with optimized configuration
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  errorFormat: 'pretty',
});

// Prevent multiple instances in development
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Connection health check
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Graceful shutdown
export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    console.log('Database disconnected successfully');
  } catch (error) {
    console.error('Error disconnecting from database:', error);
  }
}

// Database utilities
export const db = {
  // User operations
  user: {
    async findByEmail(email: string) {
      return prisma.user.findUnique({
        where: { email },
        include: {
          vocabularyCollections: true,
          learningProgress: {
            orderBy: { date: 'desc' },
            take: 30 // Last 30 days
          }
        }
      });
    },

    async findById(id: string) {
      return prisma.user.findUnique({
        where: { id },
        include: {
          vocabularyCollections: true,
          userWords: {
            include: { word: true }
          }
        }
      });
    },

    async findByUsername(username: string) {
      return prisma.user.findUnique({
        where: { username },
        include: {
          vocabularyCollections: true,
          learningProgress: {
            orderBy: { date: 'desc' },
            take: 30
          }
        }
      });
    },

    async create(data: {
      email: string;
      hashedPassword: string;
      name?: string;
      username?: string;
    }) {
      return prisma.user.create({
        data,
        include: {
          vocabularyCollections: true
        }
      });
    },

    async updateProfile(id: string, data: {
      name?: string;
      username?: string;
      preferredLanguage?: string;
      learningLevel?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
    }) {
      return prisma.user.update({
        where: { id },
        data,
        include: {
          vocabularyCollections: true
        }
      });
    }
  },

  // Vocabulary operations
  vocabulary: {
    async getCollections(userId: string, filters?: {
      category?: string;
      level?: string;
      search?: string;
    }) {
      const where: any = {
        OR: [
          { userId },
          { isPublic: true }
        ]
      };

      if (filters?.category) {
        where.category = filters.category;
      }

      if (filters?.level) {
        where.level = filters.level;
      }

      if (filters?.search) {
        where.OR = [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } }
        ];
      }

      return prisma.vocabularyCollection.findMany({
        where,
        include: {
          words: true,
          user: {
            select: { id: true, name: true, username: true }
          }
        },
        orderBy: { updatedAt: 'desc' }
      });
    },

    async createCollection(data: {
      title: string;
      description?: string;
      category?: string;
      level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
      userId: string;
      isPublic?: boolean;
    }) {
      return prisma.vocabularyCollection.create({
        data,
        include: { words: true }
      });
    },

    async addWordsToCollection(collectionId: string, words: Array<{
      word: string;
      definition: string;
      pronunciation?: string;
      partOfSpeech?: string;
      examples?: string[];
      difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
    }>) {
      return prisma.word.createMany({
        data: words.map(word => ({
          ...word,
          collectionId,
          examples: word.examples || []
        })),
        skipDuplicates: true
      });
    },

    async getWordsInCollection(collectionId: string) {
      return prisma.word.findMany({
        where: { collectionId },
        include: {
          userWords: true
        },
        orderBy: { createdAt: 'asc' }
      });
    },

    async updateCollection(collectionId: string, data: {
      title?: string;
      description?: string;
      category?: string;
      level?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
      wordCount?: number;
    }) {
      return prisma.vocabularyCollection.update({
        where: { id: collectionId },
        data,
        include: { words: true }
      });
    }
  },

  // Learning progress
  progress: {
    async recordDailyProgress(userId: string, data: {
      wordsStudied: number;
      wordsLearned: number;
      testsTaken: number;
      averageScore?: number;
      timeSpent: number;
    }) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return prisma.learningProgress.upsert({
        where: {
          userId_date: {
            userId,
            date: today
          }
        },
        update: data,
        create: {
          userId,
          date: today,
          ...data
        }
      });
    },

    async getProgressHistory(userId: string, days: number = 30) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      return prisma.learningProgress.findMany({
        where: {
          userId,
          date: { gte: startDate }
        },
        orderBy: { date: 'asc' }
      });
    },

    async getUserStats(userId: string) {
      const [
        totalWords,
        masteredWords,
        collections,
        testsCompleted,
        currentStreak
      ] = await Promise.all([
        prisma.userWord.count({ where: { userId } }),
        prisma.userWord.count({ 
          where: { 
            userId, 
            masteryLevel: 'MASTERED' 
          } 
        }),
        prisma.vocabularyCollection.count({ where: { userId } }),
        prisma.testSession.count({ 
          where: { 
            userId, 
            isCompleted: true 
          } 
        }),
        prisma.learningProgress.findMany({
          where: { userId },
          orderBy: { date: 'desc' },
          take: 365
        })
      ]);

      // Calculate current streak
      let streak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (const progress of currentStreak) {
        const progressDate = new Date(progress.date);
        const daysDiff = Math.floor((today.getTime() - progressDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === streak && progress.wordsStudied > 0) {
          streak++;
        } else {
          break;
        }
      }

      return {
        totalWords,
        masteredWords,
        collections,
        testsCompleted,
        currentStreak: streak,
        masteryRate: totalWords > 0 ? (masteredWords / totalWords) * 100 : 0
      };
    }
  },

  // Test sessions
  test: {
    async createSession(data: {
      userId: string;
      type: 'VOCABULARY' | 'COMPREHENSION' | 'PRONUNCIATION' | 'MIXED';
      difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
      totalQuestions: number;
      storyId?: string;
    }) {
      return prisma.testSession.create({
        data,
        include: { questions: true }
      });
    },

    async addQuestion(sessionId: string, data: {
      type: 'MULTIPLE_CHOICE' | 'FILL_BLANK' | 'PRONUNCIATION' | 'DEFINITION' | 'USAGE';
      question: string;
      options: string[];
      correctAnswer: string;
      explanation?: string;
      wordId?: string;
    }) {
      return prisma.testQuestion.create({
        data: {
          ...data,
          testSessionId: sessionId
        }
      });
    },

    async submitAnswer(questionId: string, data: {
      userAnswer: string;
      timeSpent?: number;
    }) {
      const question = await prisma.testQuestion.findUnique({
        where: { id: questionId }
      });

      if (!question) {
        throw new Error('Question not found');
      }

      const isCorrect = question.correctAnswer === data.userAnswer;

      return prisma.testQuestion.update({
        where: { id: questionId },
        data: {
          userAnswer: data.userAnswer,
          isCorrect,
          timeSpent: data.timeSpent
        }
      });
    },

    async completeSession(sessionId: string) {
      const questions = await prisma.testQuestion.findMany({
        where: { testSessionId: sessionId }
      });

      const correctAnswers = questions.filter(q => q.isCorrect).length;
      const score = (correctAnswers / questions.length) * 100;

      return prisma.testSession.update({
        where: { id: sessionId },
        data: {
          isCompleted: true,
          correctAnswers,
          score
        },
        include: { questions: true }
      });
    }
  },

  // Error reviews
  errors: {
    async recordError(data: {
      userId: string;
      wordId: string;
      questionType: 'MULTIPLE_CHOICE' | 'FILL_BLANK' | 'PRONUNCIATION' | 'DEFINITION' | 'USAGE';
      userAnswer: string;
      correctAnswer: string;
      errorReason?: string;
    }) {
      return prisma.errorReview.create({ data });
    },

    async getUnreviewedErrors(userId: string) {
      return prisma.errorReview.findMany({
        where: {
          userId,
          isReviewed: false
        },
        include: {
          word: {
            include: { collection: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    },

    async markReviewed(errorId: string) {
      return prisma.errorReview.update({
        where: { id: errorId },
        data: {
          isReviewed: true,
          reviewCount: { increment: 1 },
          lastReviewed: new Date()
        }
      });
    }
  }
};

export default prisma;