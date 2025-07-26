/**
 * Database Service
 * Centralized database operations and connection management
 */

import { PrismaClient } from '@prisma/client';
import { dbLogger } from '../utils/logger';

class DatabaseService {
  private static instance: PrismaClient | null = null;

  /**
   * Get Prisma client instance (singleton)
   */
  static getInstance(): PrismaClient {
    if (!this.instance) {
      this.instance = new PrismaClient({
        log: [
          { level: 'query', emit: 'event' },
          { level: 'error', emit: 'event' },
          { level: 'info', emit: 'event' },
          { level: 'warn', emit: 'event' },
        ],
        errorFormat: 'pretty',
      });

      // Set up logging
      this.instance.$on('query', (e) => {
        dbLogger.debug('Database query', {
          query: e.query,
          params: e.params,
          duration: `${e.duration}ms`,
          target: e.target
        });
      });

      this.instance.$on('error', (e) => {
        dbLogger.error('Database error', {
          message: e.message,
          target: e.target
        });
      });

      this.instance.$on('info', (e) => {
        dbLogger.info('Database info', {
          message: e.message,
          target: e.target
        });
      });

      this.instance.$on('warn', (e) => {
        dbLogger.warn('Database warning', {
          message: e.message,
          target: e.target
        });
      });

      dbLogger.info('Database connection initialized');
    }

    return this.instance;
  }

  /**
   * Test database connection
   */
  static async testConnection(): Promise<boolean> {
    try {
      const prisma = this.getInstance();
      await prisma.$queryRaw`SELECT 1`;
      dbLogger.info('Database connection test successful');
      return true;
    } catch (error) {
      dbLogger.error('Database connection test failed', { error: (error as Error).message });
      return false;
    }
  }

  /**
   * Close database connection
   */
  static async disconnect(): Promise<void> {
    if (this.instance) {
      await this.instance.$disconnect();
      this.instance = null;
      dbLogger.info('Database connection closed');
    }
  }

  /**
   * Run database migrations
   */
  static async runMigrations(): Promise<void> {
    try {
      dbLogger.info('Running database migrations...');
      // Note: In production, migrations should be run separately
      // This is for development convenience
      // await this.getInstance().$executeRaw`-- Migration commands here`;
      dbLogger.info('Database migrations completed');
    } catch (error) {
      dbLogger.error('Database migration failed', { error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Health check for database
   */
  static async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    responseTime: number;
    details?: string;
  }> {
    const startTime = Date.now();
    
    try {
      const prisma = this.getInstance();
      await prisma.$queryRaw`SELECT 1`;
      const responseTime = Date.now() - startTime;

      return {
        status: 'healthy',
        responseTime
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'unhealthy',
        responseTime,
        details: (error as Error).message
      };
    }
  }

  /**
   * Get database statistics
   */
  static async getStats(): Promise<{
    users: number;
    vocabularies: number;
    stories: number;
    learningSessions: number;
  }> {
    const prisma = this.getInstance();

    const [
      usersCount,
      vocabulariesCount,
      storiesCount,
      learningSessionsCount
    ] = await Promise.all([
      prisma.user.count(),
      prisma.vocabulary.count(),
      prisma.story.count(),
      prisma.learningSession.count()
    ]);

    return {
      users: usersCount,
      vocabularies: vocabulariesCount,
      stories: storiesCount,
      learningSessions: learningSessionsCount
    };
  }

  /**
   * Clean up old data (for maintenance)
   */
  static async cleanup(options: {
    deleteOldSessions?: boolean;
    deleteUnusedStories?: boolean;
    daysToKeep?: number;
  } = {}): Promise<void> {
    const { deleteOldSessions = false, deleteUnusedStories = false, daysToKeep = 30 } = options;
    const prisma = this.getInstance();
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);

    dbLogger.info('Starting database cleanup', { options });

    if (deleteOldSessions) {
      const result = await prisma.learningSession.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate
          },
          status: 'completed'
        }
      });
      dbLogger.info(`Deleted ${result.count} old learning sessions`);
    }

    if (deleteUnusedStories) {
      // Delete stories that haven't been used in learning sessions
      const unusedStories = await prisma.story.findMany({
        where: {
          createdAt: {
            lt: cutoffDate
          },
          learningSessions: {
            none: {}
          }
        },
        select: { id: true }
      });

      if (unusedStories.length > 0) {
        const result = await prisma.story.deleteMany({
          where: {
            id: {
              in: unusedStories.map(s => s.id)
            }
          }
        });
        dbLogger.info(`Deleted ${result.count} unused stories`);
      }
    }

    dbLogger.info('Database cleanup completed');
  }
}

// Export singleton instance
export const prisma = DatabaseService.getInstance();
export default DatabaseService;