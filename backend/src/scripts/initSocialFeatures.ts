/**
 * Initialize Social Features
 * Sets up achievements and initializes social system
 */

import { PrismaClient } from '@prisma/client';
import { AchievementService } from '../services/achievementService';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();
const achievementService = new AchievementService();

async function initializeSocialFeatures() {
  try {
    logger.info('🎯 Initializing social features...');

    // Initialize achievements
    await achievementService.initializeAchievements();
    logger.info('✅ Achievements initialized');

    // Create user stats for existing users who don't have them
    const usersWithoutStats = await prisma.user.findMany({
      where: {
        userStats: null
      },
      select: { id: true }
    });

    for (const user of usersWithoutStats) {
      await prisma.userStats.create({
        data: {
          userId: user.id
        }
      });
    }

    logger.info(`✅ Created stats for ${usersWithoutStats.length} existing users`);

    // Check and award initial achievements for existing users
    const allUsers = await prisma.user.findMany({
      select: { id: true }
    });

    for (const user of allUsers) {
      await achievementService.checkAndAwardAchievements(user.id);
    }

    logger.info(`✅ Checked achievements for ${allUsers.length} users`);

    logger.info('🎉 Social features initialization completed!');
  } catch (error) {
    logger.error('❌ Failed to initialize social features:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  initializeSocialFeatures()
    .then(() => {
      logger.info('Social features initialization completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Social features initialization failed:', error);
      process.exit(1);
    });
}

export { initializeSocialFeatures };