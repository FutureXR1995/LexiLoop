/**
 * Database Initialization Script
 * Sets up the database with initial data
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

async function seedVocabularies() {
  logger.info('Seeding vocabulary data...');

  const vocabularies = [
    // Beginner level
    { word: 'hello', definition: 'A greeting used to acknowledge someone', pronunciation: '/həˈloʊ/', partOfSpeech: 'interjection', difficultyLevel: 1, frequencyRank: 1, category: 'greetings', exampleSentences: ['Hello, how are you?', 'She said hello to her friend.'], synonyms: ['hi', 'greetings'] },
    { word: 'good', definition: 'Having the right or desired qualities; satisfactory', pronunciation: '/ɡʊd/', partOfSpeech: 'adjective', difficultyLevel: 1, frequencyRank: 2, category: 'descriptive', exampleSentences: ['This is a good book.', 'She is a good student.'], synonyms: ['excellent', 'great', 'fine'] },
    { word: 'water', definition: 'A colorless, transparent liquid', pronunciation: '/ˈwɔːtər/', partOfSpeech: 'noun', difficultyLevel: 1, frequencyRank: 3, category: 'nature', exampleSentences: ['I need to drink water.', 'The water is cold.'], synonyms: ['H2O', 'liquid'] },
    { word: 'house', definition: 'A building for human habitation', pronunciation: '/haʊs/', partOfSpeech: 'noun', difficultyLevel: 1, frequencyRank: 4, category: 'home', exampleSentences: ['I live in a big house.', 'The house has three bedrooms.'], synonyms: ['home', 'dwelling', 'residence'] },
    { word: 'friend', definition: 'A person you know well and like', pronunciation: '/frend/', partOfSpeech: 'noun', difficultyLevel: 1, frequencyRank: 5, category: 'relationships', exampleSentences: ['She is my best friend.', 'I met my friend at school.'], synonyms: ['companion', 'buddy', 'pal'] },

    // Elementary level
    { word: 'adventure', definition: 'An exciting or remarkable experience', pronunciation: '/ədˈventʃər/', partOfSpeech: 'noun', difficultyLevel: 2, frequencyRank: 100, category: 'activities', exampleSentences: ['The trip was a great adventure.', 'He loves adventure stories.'], synonyms: ['journey', 'expedition', 'quest'] },
    { word: 'mysterious', definition: 'Full of mystery; difficult to understand', pronunciation: '/mɪˈstɪriəs/', partOfSpeech: 'adjective', difficultyLevel: 2, frequencyRank: 150, category: 'descriptive', exampleSentences: ['The old house looked mysterious.', 'She gave him a mysterious smile.'], synonyms: ['enigmatic', 'puzzling', 'strange'] },
    { word: 'explore', definition: 'To travel through an area to learn about it', pronunciation: '/ɪkˈsplɔːr/', partOfSpeech: 'verb', difficultyLevel: 2, frequencyRank: 200, category: 'activities', exampleSentences: ['Let\'s explore the forest.', 'Scientists explore new theories.'], synonyms: ['investigate', 'discover', 'examine'] },
    { word: 'discover', definition: 'To find something for the first time', pronunciation: '/dɪˈskʌvər/', partOfSpeech: 'verb', difficultyLevel: 2, frequencyRank: 250, category: 'activities', exampleSentences: ['They discovered a new planet.', 'I discovered a great restaurant.'], synonyms: ['find', 'uncover', 'reveal'] },
    { word: 'important', definition: 'Having great significance or value', pronunciation: '/ɪmˈpɔːrtənt/', partOfSpeech: 'adjective', difficultyLevel: 2, frequencyRank: 50, category: 'descriptive', exampleSentences: ['This is an important meeting.', 'Education is important.'], synonyms: ['significant', 'crucial', 'vital'] },

    // Intermediate level
    { word: 'fascinating', definition: 'Extremely interesting and captivating', pronunciation: '/ˈfæsəneɪtɪŋ/', partOfSpeech: 'adjective', difficultyLevel: 3, frequencyRank: 500, category: 'descriptive', exampleSentences: ['The documentary was fascinating.', 'She has a fascinating personality.'], synonyms: ['captivating', 'intriguing', 'absorbing'] },
    { word: 'accomplish', definition: 'To complete something successfully', pronunciation: '/əˈkʌmplɪʃ/', partOfSpeech: 'verb', difficultyLevel: 3, frequencyRank: 600, category: 'achievement', exampleSentences: ['She accomplished her goals.', 'We need to accomplish this task.'], synonyms: ['achieve', 'complete', 'fulfill'] },
    { word: 'magnificent', definition: 'Extremely beautiful and impressive', pronunciation: '/mæɡˈnɪfəsənt/', partOfSpeech: 'adjective', difficultyLevel: 3, frequencyRank: 700, category: 'descriptive', exampleSentences: ['The view was magnificent.', 'It\'s a magnificent building.'], synonyms: ['splendid', 'spectacular', 'impressive'] },
    { word: 'perspective', definition: 'A way of thinking about something', pronunciation: '/pərˈspektɪv/', partOfSpeech: 'noun', difficultyLevel: 3, frequencyRank: 800, category: 'thinking', exampleSentences: ['From his perspective, it made sense.', 'Different perspectives are valuable.'], synonyms: ['viewpoint', 'outlook', 'angle'] },
    { word: 'challenge', definition: 'A difficult task that tests ability', pronunciation: '/ˈtʃæləndʒ/', partOfSpeech: 'noun', difficultyLevel: 3, frequencyRank: 300, category: 'activities', exampleSentences: ['This project is a real challenge.', 'She accepted the challenge.'], synonyms: ['obstacle', 'difficulty', 'test'] },
  ];

  for (const vocab of vocabularies) {
    await prisma.vocabulary.upsert({
      where: { word: vocab.word },
      update: vocab,
      create: vocab,
    });
  }

  logger.info(`Seeded ${vocabularies.length} vocabulary words`);
}

async function seedWordBooks() {
  logger.info('Seeding word books...');

  const wordBooks = [
    {
      name: 'Essential Beginner Words',
      description: 'Core vocabulary for English language learners starting their journey',
      category: 'General',
      difficultyLevel: 1,
      isPublic: true,
    },
    {
      name: 'Adventure Stories Vocabulary',
      description: 'Words commonly used in adventure and exploration stories',
      category: 'Literature',
      difficultyLevel: 2,
      isPublic: true,
    },
    {
      name: 'Intermediate Expressions',
      description: 'Vocabulary for intermediate English learners',
      category: 'General',
      difficultyLevel: 3,
      isPublic: true,
    },
  ];

  for (const book of wordBooks) {
    const createdBook = await prisma.wordBook.upsert({
      where: { name: book.name },
      update: book,
      create: book,
    });

    // Add vocabulary words to the book based on difficulty level
    const vocabularies = await prisma.vocabulary.findMany({
      where: { difficultyLevel: book.difficultyLevel },
      orderBy: { frequencyRank: 'asc' },
    });

    // Clear existing contents and add new ones
    await prisma.wordBookContent.deleteMany({
      where: { wordBookId: createdBook.id }
    });

    for (let i = 0; i < vocabularies.length; i++) {
      await prisma.wordBookContent.create({
        data: {
          wordBookId: createdBook.id,
          vocabularyId: vocabularies[i].id,
          orderIndex: i + 1,
        },
      });
    }

    // Update word count
    await prisma.wordBook.update({
      where: { id: createdBook.id },
      data: { wordCount: vocabularies.length },
    });
  }

  logger.info(`Seeded ${wordBooks.length} word books`);
}

async function seedTestUser() {
  logger.info('Creating test user...');

  const testUserData = {
    email: 'demo@lexiloop.com',
    username: 'demouser',
    firstName: 'Demo',
    lastName: 'User',
    passwordHash: await bcrypt.hash('demo123456', 12),
    level: 'intermediate',
    emailVerified: true,
    isActive: true,
  };

  const testUser = await prisma.user.upsert({
    where: { email: testUserData.email },
    update: testUserData,
    create: testUserData,
  });

  // Add some sample progress for the test user
  const vocabularies = await prisma.vocabulary.findMany({
    where: { difficultyLevel: { lte: 2 } },
    take: 10,
  });

  for (const vocab of vocabularies) {
    await prisma.userProgress.upsert({
      where: {
        userId_vocabularyId: {
          userId: testUser.id,
          vocabularyId: vocab.id,
        },
      },
      update: {},
      create: {
        userId: testUser.id,
        vocabularyId: vocab.id,
        masteryLevel: Math.floor(Math.random() * 3) + 1,
        correctCount: Math.floor(Math.random() * 10) + 1,
        incorrectCount: Math.floor(Math.random() * 3),
        totalAttempts: Math.floor(Math.random() * 13) + 1,
        firstLearnedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        lastReviewedAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
        confidenceScore: Math.random() * 0.5 + 0.5,
      },
    });
  }

  logger.info('Test user created with sample progress data');
}

async function seedSampleStories() {
  logger.info('Creating sample stories...');

  const sampleStories = [
    {
      title: 'The Young Explorer',
      content: 'Once upon a time, there lived a young explorer who dreamed of going on a great adventure. Every day, she would look at maps and imagine the mysterious places she could explore. One morning, she decided to discover what lay beyond the hills near her house. As she walked through the forest, she found beautiful flowers and heard strange sounds. This adventure taught her that the world is full of wonderful things waiting to be discovered.',
      vocabularyIds: [],
      difficultyLevel: 2,
      storyType: 'adventure',
      wordCount: 80,
      qualityScore: 0.85,
      cacheKey: 'sample_story_1',
      isPublic: true,
    },
    {
      title: 'The Power of Words',
      content: 'Learning new words can be a fascinating challenge that helps us accomplish great things. From a different perspective, each word we learn opens up new ways to express our thoughts and feelings. The magnificent power of language allows us to communicate complex ideas and connect with others in meaningful ways.',
      vocabularyIds: [],
      difficultyLevel: 3,
      storyType: 'educational',
      wordCount: 60,
      qualityScore: 0.78,
      cacheKey: 'sample_story_2',
      isPublic: true,
    },
  ];

  for (const story of sampleStories) {
    await prisma.story.upsert({
      where: { cacheKey: story.cacheKey },
      update: story,
      create: story,
    });
  }

  logger.info(`Seeded ${sampleStories.length} sample stories`);
}

async function main() {
  try {
    logger.info('🚀 Starting database initialization...');

    await seedVocabularies();
    await seedWordBooks();
    await seedTestUser();
    await seedSampleStories();

    logger.info('✅ Database initialization completed successfully!');
  } catch (error) {
    logger.error('❌ Database initialization failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the initialization
if (require.main === module) {
  main()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default main;