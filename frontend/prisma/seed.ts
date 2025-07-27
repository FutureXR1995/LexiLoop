/**
 * Database Seed Script
 * Populates the database with initial data for development and testing
 */

import { PrismaClient, LearningLevel, MasteryLevel, TestType, QuestionType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create test users
  const hashedPassword = await bcrypt.hash('password123', 12);

  const testUser = await prisma.user.upsert({
    where: { email: 'test@lexiloop.com' },
    update: {},
    create: {
      email: 'test@lexiloop.com',
      hashedPassword,
      name: 'Test User',
      username: 'testuser',
      learningLevel: LearningLevel.BEGINNER,
      preferredLanguage: 'en',
      isActive: true
    }
  });

  const advancedUser = await prisma.user.upsert({
    where: { email: 'advanced@lexiloop.com' },
    update: {},
    create: {
      email: 'advanced@lexiloop.com',
      hashedPassword,
      name: 'Advanced Learner',
      username: 'advanced',
      learningLevel: LearningLevel.ADVANCED,
      preferredLanguage: 'en',
      isActive: true
    }
  });

  console.log('✅ Created test users');

  // Create vocabulary collections
  const beginnerCollection = await prisma.vocabularyCollection.create({
    data: {
      title: 'Essential English Words',
      description: 'Common words every English learner should know',
      category: 'general',
      level: LearningLevel.BEGINNER,
      isPublic: true,
      userId: testUser.id,
      wordCount: 0
    }
  });

  const businessCollection = await prisma.vocabularyCollection.create({
    data: {
      title: 'Business English',
      description: 'Professional vocabulary for workplace communication',
      category: 'business',
      level: LearningLevel.INTERMEDIATE,
      isPublic: true,
      userId: advancedUser.id,
      wordCount: 0
    }
  });

  const academicCollection = await prisma.vocabularyCollection.create({
    data: {
      title: 'Academic Vocabulary',
      description: 'Advanced words for academic writing and research',
      category: 'academic',
      level: LearningLevel.ADVANCED,
      isPublic: true,
      userId: advancedUser.id,
      wordCount: 0
    }
  });

  console.log('✅ Created vocabulary collections');

  // Add words to beginner collection
  const beginnerWords = [
    {
      word: 'hello',
      definition: 'a greeting used when meeting someone',
      pronunciation: '/həˈloʊ/',
      partOfSpeech: 'interjection',
      examples: ['Hello, how are you today?', 'She said hello to everyone in the room.'],
      difficulty: LearningLevel.BEGINNER,
      collectionId: beginnerCollection.id
    },
    {
      word: 'beautiful',
      definition: 'pleasing to the senses or mind aesthetically',
      pronunciation: '/ˈbjuːtɪfəl/',
      partOfSpeech: 'adjective',
      examples: ['The sunset was beautiful tonight.', 'She has a beautiful singing voice.'],
      difficulty: LearningLevel.BEGINNER,
      collectionId: beginnerCollection.id
    },
    {
      word: 'important',
      definition: 'of great significance or value',
      pronunciation: '/ɪmˈpɔːrtənt/',
      partOfSpeech: 'adjective',
      examples: ['Education is very important for success.', 'This is an important meeting.'],
      difficulty: LearningLevel.BEGINNER,
      collectionId: beginnerCollection.id
    },
    {
      word: 'understand',
      definition: 'to perceive the intended meaning of words or actions',
      pronunciation: '/ˌʌndərˈstænd/',
      partOfSpeech: 'verb',
      examples: ['Do you understand the instructions?', 'I understand your concern.'],
      difficulty: LearningLevel.BEGINNER,
      collectionId: beginnerCollection.id
    },
    {
      word: 'different',
      definition: 'not the same as another or each other; unlike in nature',
      pronunciation: '/ˈdɪfərənt/',
      partOfSpeech: 'adjective',
      examples: ['Everyone has different opinions.', 'This book is different from the others.'],
      difficulty: LearningLevel.BEGINNER,
      collectionId: beginnerCollection.id
    }
  ];

  await prisma.word.createMany({
    data: beginnerWords
  });

  // Add words to business collection
  const businessWords = [
    {
      word: 'collaboration',
      definition: 'the action of working with someone to produce something',
      pronunciation: '/kəˌlæbəˈreɪʃən/',
      partOfSpeech: 'noun',
      examples: ['The project was a result of collaboration between teams.', 'We value collaboration in our workplace.'],
      difficulty: LearningLevel.INTERMEDIATE,
      collectionId: businessCollection.id
    },
    {
      word: 'efficiency',
      definition: 'the state of achieving maximum productivity with minimum effort',
      pronunciation: '/ɪˈfɪʃənsi/',
      partOfSpeech: 'noun',
      examples: ['We need to improve the efficiency of our processes.', 'The new system increased our efficiency by 30%.'],
      difficulty: LearningLevel.INTERMEDIATE,
      collectionId: businessCollection.id
    },
    {
      word: 'negotiate',
      definition: 'to discuss something with someone in order to reach an agreement',
      pronunciation: '/nɪˈɡoʊʃieɪt/',
      partOfSpeech: 'verb',
      examples: ['We need to negotiate the terms of the contract.', 'She negotiated a better salary.'],
      difficulty: LearningLevel.INTERMEDIATE,
      collectionId: businessCollection.id
    },
    {
      word: 'stakeholder',
      definition: 'a person with an interest or concern in something',
      pronunciation: '/ˈsteɪkhoʊldər/',
      partOfSpeech: 'noun',
      examples: ['All stakeholders agreed to the proposal.', 'We consulted with key stakeholders.'],
      difficulty: LearningLevel.INTERMEDIATE,
      collectionId: businessCollection.id
    }
  ];

  await prisma.word.createMany({
    data: businessWords
  });

  // Add words to academic collection
  const academicWords = [
    {
      word: 'hypothesis',
      definition: 'a supposition or proposed explanation made on the basis of limited evidence',
      pronunciation: '/haɪˈpɑːθəsɪs/',
      partOfSpeech: 'noun',
      examples: ['The scientist tested her hypothesis through experiments.', 'Our hypothesis was confirmed by the data.'],
      difficulty: LearningLevel.ADVANCED,
      collectionId: academicCollection.id
    },
    {
      word: 'paradigm',
      definition: 'a typical example or pattern of something; a model',
      pronunciation: '/ˈpærədaɪm/',
      partOfSpeech: 'noun',
      examples: ['The new research challenged the existing paradigm.', 'This represents a paradigm shift in thinking.'],
      difficulty: LearningLevel.ADVANCED,
      collectionId: academicCollection.id
    },
    {
      word: 'empirical',
      definition: 'based on, concerned with, or verifiable by observation or experience',
      pronunciation: '/ɪmˈpɪrɪkəl/',
      partOfSpeech: 'adjective',
      examples: ['The study provided empirical evidence for the theory.', 'Empirical research is essential in science.'],
      difficulty: LearningLevel.ADVANCED,
      collectionId: academicCollection.id
    }
  ];

  await prisma.word.createMany({
    data: academicWords
  });

  // Update word counts
  await prisma.vocabularyCollection.update({
    where: { id: beginnerCollection.id },
    data: { wordCount: beginnerWords.length }
  });

  await prisma.vocabularyCollection.update({
    where: { id: businessCollection.id },
    data: { wordCount: businessWords.length }
  });

  await prisma.vocabularyCollection.update({
    where: { id: academicCollection.id },
    data: { wordCount: academicWords.length }
  });

  console.log('✅ Added vocabulary words');

  // Create user word progress
  const words = await prisma.word.findMany({
    where: { collectionId: beginnerCollection.id }
  });

  const userWordProgress = words.slice(0, 3).map(word => ({
    userId: testUser.id,
    wordId: word.id,
    masteryLevel: MasteryLevel.LEARNING,
    correctCount: Math.floor(Math.random() * 5),
    incorrectCount: Math.floor(Math.random() * 3),
    lastReviewed: new Date(),
    nextReview: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    easinessFactor: 2.5,
    interval: 1,
    repetition: 1
  }));

  await prisma.userWord.createMany({
    data: userWordProgress
  });

  console.log('✅ Created user word progress');

  // Create sample stories
  const story1 = await prisma.story.create({
    data: {
      title: 'A Day at the Market',
      content: `Sarah walked through the busy market on a beautiful sunny morning. She needed to buy fresh vegetables for dinner. The market was full of different colors and smells. 

She approached a friendly vendor who was selling beautiful tomatoes and fresh lettuce. "Hello," she said with a smile. "These vegetables look very fresh and important for my healthy dinner."

The vendor understood her needs and helped her choose the best items. "These are different varieties," he explained, showing her various types of tomatoes. Sarah was happy with her purchases and thanked the vendor before continuing her shopping.

This simple interaction helped Sarah understand how important it is to be friendly when shopping. She learned that different people can be very helpful when you approach them with kindness.`,
      difficulty: LearningLevel.BEGINNER,
      wordCount: 127,
      readingTime: 1,
      vocabularyWords: ['beautiful', 'important', 'different', 'understand', 'hello'],
      userId: testUser.id,
      readCount: 15,
      likeCount: 8
    }
  });

  const story2 = await prisma.story.create({
    data: {
      title: 'The Team Project',
      content: `The quarterly business meeting required extensive collaboration between departments. Sarah, the project manager, needed to negotiate deadlines with various stakeholders while maintaining efficiency across all teams.

"We must improve our efficiency," she announced during the presentation. "This project demands collaboration from every stakeholder involved." The team understood the importance of working together to meet their ambitious goals.

Through careful negotiation and transparent communication, they established a framework that would benefit all parties involved. The collaboration proved successful, demonstrating how effective teamwork can overcome complex business challenges.`,
      difficulty: LearningLevel.INTERMEDIATE,
      wordCount: 89,
      readingTime: 1,
      vocabularyWords: ['collaboration', 'efficiency', 'negotiate', 'stakeholder'],
      userId: advancedUser.id,
      readCount: 23,
      likeCount: 12
    }
  });

  console.log('✅ Created sample stories');

  // Create learning progress records
  const progressDates = [];
  for (let i = 7; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    progressDates.push(date);
  }

  const progressRecords = progressDates.map((date, index) => ({
    userId: testUser.id,
    date,
    wordsStudied: Math.floor(Math.random() * 15) + 5,
    wordsLearned: Math.floor(Math.random() * 8) + 2,
    testsTaken: Math.floor(Math.random() * 3),
    averageScore: Math.random() * 40 + 60, // 60-100%
    timeSpent: Math.floor(Math.random() * 45) + 15, // 15-60 minutes
    streakCount: Math.max(0, 7 - index)
  }));

  await prisma.learningProgress.createMany({
    data: progressRecords
  });

  console.log('✅ Created learning progress records');

  // Create sample test session
  const testSession = await prisma.testSession.create({
    data: {
      type: TestType.VOCABULARY,
      difficulty: LearningLevel.BEGINNER,
      totalQuestions: 5,
      userId: testUser.id,
      storyId: story1.id,
      score: 80,
      correctAnswers: 4,
      timeSpent: 120,
      isCompleted: true
    }
  });

  // Add test questions
  const testQuestions = [
    {
      type: QuestionType.MULTIPLE_CHOICE,
      question: 'What does "beautiful" mean?',
      options: ['ugly', 'pleasing to look at', 'expensive', 'old'],
      correctAnswer: 'pleasing to look at',
      explanation: 'Beautiful means pleasing to the senses or mind aesthetically.',
      testSessionId: testSession.id,
      wordId: words.find(w => w.word === 'beautiful')?.id,
      userAnswer: 'pleasing to look at',
      isCorrect: true,
      timeSpent: 25
    },
    {
      type: QuestionType.FILL_BLANK,
      question: 'It is very _____ to study English vocabulary.',
      options: ['important', 'beautiful', 'different', 'hello'],
      correctAnswer: 'important',
      explanation: 'Important means of great significance or value.',
      testSessionId: testSession.id,
      wordId: words.find(w => w.word === 'important')?.id,
      userAnswer: 'important',
      isCorrect: true,
      timeSpent: 20
    }
  ];

  await prisma.testQuestion.createMany({
    data: testQuestions
  });

  console.log('✅ Created test session and questions');

  // Create error reviews
  const errorReview = await prisma.errorReview.create({
    data: {
      userId: testUser.id,
      wordId: words.find(w => w.word === 'different')?.id || words[0].id,
      questionType: QuestionType.MULTIPLE_CHOICE,
      userAnswer: 'same',
      correctAnswer: 'not the same',
      errorReason: 'Confused antonym with synonym',
      isReviewed: false,
      isMastered: false,
      reviewCount: 0
    }
  });

  console.log('✅ Created error reviews');

  console.log('🎉 Database seed completed successfully!');
  console.log('\n📊 Seed Summary:');
  console.log(`- Users: 2`);
  console.log(`- Collections: 3`);
  console.log(`- Words: ${beginnerWords.length + businessWords.length + academicWords.length}`);
  console.log(`- Stories: 2`);
  console.log(`- Progress Records: ${progressRecords.length}`);
  console.log(`- Test Sessions: 1`);
  console.log(`- Test Questions: ${testQuestions.length}`);
  console.log(`- Error Reviews: 1`);
  console.log('\n🔑 Test Accounts:');
  console.log('- test@lexiloop.com / password123 (Beginner)');
  console.log('- advanced@lexiloop.com / password123 (Advanced)');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });