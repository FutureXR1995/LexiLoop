/**
 * Advanced Test Service
 * Provides intelligent testing modes and adaptive questioning
 */

import { prisma } from './databaseService';
import { logger } from '../utils/logger';

export interface AdvancedTestQuestion {
  id: string;
  type: TestType;
  vocabularyId: string;
  vocabulary: {
    word: string;
    definition: string;
    partOfSpeech?: string;
    pronunciation?: string;
    exampleSentences: string[];
  };
  question: string;
  options?: string[];
  correctAnswer: string;
  difficulty: number;
  timeLimit?: number;
  hints?: string[];
  explanation?: string;
  context?: string;
}

export type TestType = 
  | 'word_meaning'          // 选择词义
  | 'typing'               // 拼写练习
  | 'comprehension'        // 阅读理解
  | 'listening'            // 听力识别
  | 'synonym_antonym'      // 同义词/反义词
  | 'context_fill'         // 语境填空
  | 'image_recognition'    // 图片识别
  | 'pronunciation'        // 发音练习
  | 'sentence_building'    // 造句练习
  | 'word_association'     // 词汇联想
  | 'grammar_usage'        // 语法使用
  | 'speed_recognition';   // 快速识别

export interface TestSession {
  id: string;
  userId: string;
  testMode: TestMode;
  vocabularyIds: string[];
  questions: AdvancedTestQuestion[];
  currentQuestionIndex: number;
  startedAt: Date;
  timeLimit?: number;
  settings: TestSettings;
}

export type TestMode = 
  | 'adaptive'        // 自适应测试
  | 'mastery'         // 掌握度测试
  | 'speed_drill'     // 速度训练
  | 'comprehensive'   // 综合测试
  | 'weakness_focus'  // 弱项专攻
  | 'review_mode'     // 复习模式
  | 'challenge_mode'; // 挑战模式

export interface TestSettings {
  questionCount: number;
  timeLimit?: number;
  difficultyRange: [number, number];
  testTypes: TestType[];
  enableHints: boolean;
  enableExplanations: boolean;
  adaptiveDifficulty: boolean;
  focusWeakAreas: boolean;
}

export interface TestResult {
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
  responseTime: number;
  hintsUsed: number;
  confidence: number;
}

export class AdvancedTestService {
  /**
   * Create adaptive test session
   */
  async createTestSession(
    userId: string, 
    testMode: TestMode, 
    vocabularyIds: string[], 
    settings: Partial<TestSettings>
  ): Promise<TestSession> {
    logger.info('Creating advanced test session', { userId, testMode, vocabularyIds: vocabularyIds.length });

    try {
      // Get user's learning profile for adaptive testing
      const userProfile = await this.getUserLearningProfile(userId);
      
      // Merge settings with defaults
      const defaultSettings: TestSettings = {
        questionCount: 20,
        timeLimit: undefined,
        difficultyRange: [1, 5],
        testTypes: ['word_meaning', 'typing', 'comprehension'],
        enableHints: true,
        enableExplanations: true,
        adaptiveDifficulty: true,
        focusWeakAreas: true,
      };

      const finalSettings = { ...defaultSettings, ...settings };

      // Generate questions based on test mode
      const questions = await this.generateQuestions(
        userId,
        testMode,
        vocabularyIds,
        finalSettings,
        userProfile
      );

      const session: TestSession = {
        id: this.generateSessionId(),
        userId,
        testMode,
        vocabularyIds,
        questions,
        currentQuestionIndex: 0,
        startedAt: new Date(),
        timeLimit: finalSettings.timeLimit,
        settings: finalSettings,
      };

      // Save session to database
      await this.saveTestSession(session);

      logger.info('Test session created', { sessionId: session.id, questionCount: questions.length });
      return session;
    } catch (error) {
      logger.error('Failed to create test session', { userId, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Generate questions based on test mode and user profile
   */
  private async generateQuestions(
    userId: string,
    testMode: TestMode,
    vocabularyIds: string[],
    settings: TestSettings,
    userProfile: any
  ): Promise<AdvancedTestQuestion[]> {
    // Get vocabulary data
    const vocabularies = await prisma.vocabulary.findMany({
      where: { id: { in: vocabularyIds } },
      include: {
        userProgress: {
          where: { userId },
          select: {
            masteryLevel: true,
            correctCount: true,
            incorrectCount: true,
            confidenceScore: true,
          }
        }
      }
    });

    let questions: AdvancedTestQuestion[] = [];

    // Generate questions based on test mode
    switch (testMode) {
      case 'adaptive':
        questions = await this.generateAdaptiveQuestions(vocabularies, settings, userProfile);
        break;
      case 'mastery':
        questions = await this.generateMasteryQuestions(vocabularies, settings);
        break;
      case 'speed_drill':
        questions = await this.generateSpeedDrillQuestions(vocabularies, settings);
        break;
      case 'comprehensive':
        questions = await this.generateComprehensiveQuestions(vocabularies, settings);
        break;
      case 'weakness_focus':
        questions = await this.generateWeaknessQuestions(vocabularies, settings, userProfile);
        break;
      case 'review_mode':
        questions = await this.generateReviewQuestions(vocabularies, settings, userId);
        break;
      case 'challenge_mode':
        questions = await this.generateChallengeQuestions(vocabularies, settings);
        break;
    }

    // Shuffle questions for better experience
    return this.shuffleArray(questions).slice(0, settings.questionCount);
  }

  /**
   * Generate adaptive questions that adjust to user performance
   */
  private async generateAdaptiveQuestions(
    vocabularies: any[],
    settings: TestSettings,
    userProfile: any
  ): Promise<AdvancedTestQuestion[]> {
    const questions: AdvancedTestQuestion[] = [];

    for (const vocab of vocabularies) {
      const userProgress = vocab.userProgress[0];
      const masteryLevel = userProgress?.masteryLevel || 0;
      
      // Adapt question types based on mastery level
      let questionTypes: TestType[];
      if (masteryLevel < 2) {
        questionTypes = ['word_meaning', 'context_fill'];
      } else if (masteryLevel < 4) {
        questionTypes = ['typing', 'synonym_antonym', 'sentence_building'];
      } else {
        questionTypes = ['comprehension', 'speed_recognition', 'grammar_usage'];
      }

      // Generate multiple questions per vocabulary
      for (const questionType of questionTypes) {
        if (settings.testTypes.includes(questionType)) {
          const question = await this.generateQuestionByType(vocab, questionType, masteryLevel + 1);
          if (question) questions.push(question);
        }
      }
    }

    return questions;
  }

  /**
   * Generate mastery test questions to evaluate comprehensive understanding
   */
  private async generateMasteryQuestions(
    vocabularies: any[],
    settings: TestSettings
  ): Promise<AdvancedTestQuestion[]> {
    const questions: AdvancedTestQuestion[] = [];
    const testTypes: TestType[] = ['word_meaning', 'typing', 'comprehension', 'synonym_antonym'];

    for (const vocab of vocabularies) {
      for (const testType of testTypes) {
        if (settings.testTypes.includes(testType)) {
          const question = await this.generateQuestionByType(vocab, testType, 3);
          if (question) questions.push(question);
        }
      }
    }

    return questions;
  }

  /**
   * Generate speed drill questions for quick recognition
   */
  private async generateSpeedDrillQuestions(
    vocabularies: any[],
    settings: TestSettings
  ): Promise<AdvancedTestQuestion[]> {
    const questions: AdvancedTestQuestion[] = [];

    for (const vocab of vocabularies) {
      // Speed questions have shorter time limits
      const question = await this.generateQuestionByType(vocab, 'speed_recognition', 2);
      if (question) {
        question.timeLimit = 5; // 5 seconds per question
        questions.push(question);
      }
    }

    return questions;
  }

  /**
   * Generate comprehensive test questions covering all aspects
   */
  private async generateComprehensiveQuestions(
    vocabularies: any[],
    settings: TestSettings
  ): Promise<AdvancedTestQuestion[]> {
    const questions: AdvancedTestQuestion[] = [];
    const allTestTypes: TestType[] = [
      'word_meaning', 'typing', 'comprehension', 'synonym_antonym',
      'context_fill', 'sentence_building', 'grammar_usage'
    ];

    for (const vocab of vocabularies) {
      const availableTypes = allTestTypes.filter(type => settings.testTypes.includes(type));
      const selectedType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
      
      const question = await this.generateQuestionByType(vocab, selectedType, 3);
      if (question) questions.push(question);
    }

    return questions;
  }

  /**
   * Generate questions focusing on user's weak areas
   */
  private async generateWeaknessQuestions(
    vocabularies: any[],
    settings: TestSettings,
    userProfile: any
  ): Promise<AdvancedTestQuestion[]> {
    const questions: AdvancedTestQuestion[] = [];
    
    // Focus on words with low mastery or high error rates
    const weakVocabularies = vocabularies.filter(vocab => {
      const progress = vocab.userProgress[0];
      return !progress || progress.masteryLevel < 3 || 
             (progress.correctCount / (progress.correctCount + progress.incorrectCount)) < 0.7;
    });

    for (const vocab of weakVocabularies) {
      // Generate more questions for weak areas
      const questionCount = Math.min(3, settings.questionCount / weakVocabularies.length);
      
      for (let i = 0; i < questionCount; i++) {
        const testType = settings.testTypes[Math.floor(Math.random() * settings.testTypes.length)];
        const question = await this.generateQuestionByType(vocab, testType, 2);
        if (question) questions.push(question);
      }
    }

    return questions;
  }

  /**
   * Generate review questions for spaced repetition
   */
  private async generateReviewQuestions(
    vocabularies: any[],
    settings: TestSettings,
    userId: string
  ): Promise<AdvancedTestQuestion[]> {
    const questions: AdvancedTestQuestion[] = [];

    // Get vocabularies due for review
    const dueForReview = await prisma.userProgress.findMany({
      where: {
        userId,
        vocabularyId: { in: vocabularies.map(v => v.id) },
        nextReviewAt: { lte: new Date() }
      },
      include: { vocabulary: true }
    });

    for (const progress of dueForReview) {
      const testType = this.selectTestTypeForReview(progress.masteryLevel);
      const question = await this.generateQuestionByType(
        progress.vocabulary, 
        testType, 
        progress.masteryLevel
      );
      if (question) questions.push(question);
    }

    return questions;
  }

  /**
   * Generate challenge questions with increased difficulty
   */
  private async generateChallengeQuestions(
    vocabularies: any[],
    settings: TestSettings
  ): Promise<AdvancedTestQuestion[]> {
    const questions: AdvancedTestQuestion[] = [];
    const challengeTypes: TestType[] = ['comprehension', 'sentence_building', 'grammar_usage'];

    for (const vocab of vocabularies) {
      const testType = challengeTypes[Math.floor(Math.random() * challengeTypes.length)];
      const question = await this.generateQuestionByType(vocab, testType, 5); // Max difficulty
      if (question) {
        question.timeLimit = question.timeLimit ? question.timeLimit * 0.7 : 30; // Shorter time
        questions.push(question);
      }
    }

    return questions;
  }

  /**
   * Generate question by specific type
   */
  private async generateQuestionByType(
    vocabulary: any,
    type: TestType,
    difficulty: number
  ): Promise<AdvancedTestQuestion | null> {
    const baseQuestion: Partial<AdvancedTestQuestion> = {
      id: this.generateQuestionId(),
      type,
      vocabularyId: vocabulary.id,
      vocabulary: {
        word: vocabulary.word,
        definition: vocabulary.definition,
        partOfSpeech: vocabulary.partOfSpeech,
        pronunciation: vocabulary.pronunciation,
        exampleSentences: vocabulary.exampleSentences,
      },
      difficulty,
    };

    switch (type) {
      case 'word_meaning':
        return this.generateWordMeaningQuestion(baseQuestion, vocabulary);
      
      case 'typing':
        return this.generateTypingQuestion(baseQuestion, vocabulary);
      
      case 'comprehension':
        return this.generateComprehensionQuestion(baseQuestion, vocabulary);
      
      case 'synonym_antonym':
        return this.generateSynonymAntonymQuestion(baseQuestion, vocabulary);
      
      case 'context_fill':
        return this.generateContextFillQuestion(baseQuestion, vocabulary);
      
      case 'sentence_building':
        return this.generateSentenceBuildingQuestion(baseQuestion, vocabulary);
      
      case 'speed_recognition':
        return this.generateSpeedRecognitionQuestion(baseQuestion, vocabulary);
      
      case 'grammar_usage':
        return this.generateGrammarUsageQuestion(baseQuestion, vocabulary);
      
      default:
        return null;
    }
  }

  private generateWordMeaningQuestion(base: Partial<AdvancedTestQuestion>, vocab: any): AdvancedTestQuestion {
    const distractors = this.generateDistractors(vocab.definition, 3);
    const options = this.shuffleArray([vocab.definition, ...distractors]);
    
    return {
      ...base,
      question: `What does "${vocab.word}" mean?`,
      options,
      correctAnswer: vocab.definition,
      timeLimit: 15,
      hints: [`Part of speech: ${vocab.partOfSpeech || 'unknown'}`],
      explanation: `"${vocab.word}" means ${vocab.definition}.`,
    } as AdvancedTestQuestion;
  }

  private generateTypingQuestion(base: Partial<AdvancedTestQuestion>, vocab: any): AdvancedTestQuestion {
    return {
      ...base,
      question: `Spell the word that means: "${vocab.definition}"`,
      correctAnswer: vocab.word.toLowerCase(),
      timeLimit: 20,
      hints: [`The word starts with "${vocab.word[0]}"`, `The word has ${vocab.word.length} letters`],
      explanation: `The correct spelling is "${vocab.word}".`,
    } as AdvancedTestQuestion;
  }

  private generateComprehensionQuestion(base: Partial<AdvancedTestQuestion>, vocab: any): AdvancedTestQuestion {
    const sentence = vocab.exampleSentences[0] || `The ${vocab.word} was very important.`;
    const maskedSentence = sentence.replace(new RegExp(vocab.word, 'gi'), '______');
    
    const distractors = this.generateWordDistractors(vocab.word, 3);
    const options = this.shuffleArray([vocab.word, ...distractors]);
    
    return {
      ...base,
      question: `Fill in the blank: "${maskedSentence}"`,
      options,
      correctAnswer: vocab.word,
      timeLimit: 25,
      context: sentence,
      explanation: `In this context, "${vocab.word}" fits perfectly because ${vocab.definition}.`,
    } as AdvancedTestQuestion;
  }

  private generateSynonymAntonymQuestion(base: Partial<AdvancedTestQuestion>, vocab: any): AdvancedTestQuestion {
    const isAntonym = Math.random() > 0.5;
    const targets = isAntonym ? vocab.antonyms : vocab.synonyms;
    
    if (!targets || targets.length === 0) {
      // Fallback to word meaning if no synonyms/antonyms
      return this.generateWordMeaningQuestion(base, vocab);
    }
    
    const correctAnswer = targets[0];
    const distractors = this.generateWordDistractors(correctAnswer, 3);
    const options = this.shuffleArray([correctAnswer, ...distractors]);
    
    return {
      ...base,
      question: `Which word is a ${isAntonym ? 'antonym' : 'synonym'} of "${vocab.word}"?`,
      options,
      correctAnswer,
      timeLimit: 20,
      explanation: `"${correctAnswer}" is a ${isAntonym ? 'antonym' : 'synonym'} of "${vocab.word}".`,
    } as AdvancedTestQuestion;
  }

  private generateContextFillQuestion(base: Partial<AdvancedTestQuestion>, vocab: any): AdvancedTestQuestion {
    const context = `The situation required a ${vocab.partOfSpeech === 'adjective' ? '' : 'very'} ______ approach.`;
    
    return {
      ...base,
      question: `Complete the sentence with the correct form of "${vocab.word}": "${context}"`,
      correctAnswer: vocab.word,
      timeLimit: 20,
      hints: [`Think about the part of speech: ${vocab.partOfSpeech}`],
      explanation: `"${vocab.word}" fits here because ${vocab.definition}.`,
    } as AdvancedTestQuestion;
  }

  private generateSentenceBuildingQuestion(base: Partial<AdvancedTestQuestion>, vocab: any): AdvancedTestQuestion {
    const words = [`the`, vocab.word, `was`, `very`, `important`];
    const scrambled = this.shuffleArray([...words]);
    
    return {
      ...base,
      question: `Arrange these words to make a sentence: ${scrambled.join(', ')}`,
      correctAnswer: words.join(' '),
      timeLimit: 30,
      hints: [`Start with "The"`],
      explanation: `The correct sentence demonstrates proper usage of "${vocab.word}".`,
    } as AdvancedTestQuestion;
  }

  private generateSpeedRecognitionQuestion(base: Partial<AdvancedTestQuestion>, vocab: any): AdvancedTestQuestion {
    const options = this.shuffleArray([
      vocab.definition,
      ...this.generateDistractors(vocab.definition, 2)
    ]);
    
    return {
      ...base,
      question: vocab.word,
      options,
      correctAnswer: vocab.definition,
      timeLimit: 5,
      explanation: `Quick! "${vocab.word}" means ${vocab.definition}.`,
    } as AdvancedTestQuestion;
  }

  private generateGrammarUsageQuestion(base: Partial<AdvancedTestQuestion>, vocab: any): AdvancedTestQuestion {
    const sentence = `She felt ______ about the decision.`;
    const correctForm = this.getCorrectGrammaticalForm(vocab.word, vocab.partOfSpeech);
    const distractors = this.generateGrammaticalDistractors(vocab.word, 3);
    const options = this.shuffleArray([correctForm, ...distractors]);
    
    return {
      ...base,
      question: `Choose the correct grammatical form: "${sentence}"`,
      options,
      correctAnswer: correctForm,
      timeLimit: 25,
      hints: [`Consider the part of speech needed in this context`],
      explanation: `"${correctForm}" is the correct form because it functions as ${vocab.partOfSpeech} in this sentence.`,
    } as AdvancedTestQuestion;
  }

  // Helper methods
  private generateSessionId(): string {
    return `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateQuestionId(): string {
    return `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private generateDistractors(correctAnswer: string, count: number): string[] {
    // This would typically use a more sophisticated approach
    // For now, return placeholder distractors
    const distractors = [
      'An incorrect definition',
      'Another wrong meaning',
      'Not the right answer',
      'Different meaning entirely'
    ];
    return distractors.slice(0, count);
  }

  private generateWordDistractors(correctWord: string, count: number): string[] {
    // Generate similar-looking or similar-meaning words
    const distractors = [
      correctWord.split('').reverse().join(''), // reversed
      correctWord + 'ing', // with suffix
      correctWord.slice(1), // without first letter
    ];
    return distractors.slice(0, count);
  }

  private getCorrectGrammaticalForm(word: string, partOfSpeech?: string): string {
    // Simplified grammatical form generation
    switch (partOfSpeech) {
      case 'adjective':
        return word;
      case 'noun':
        return word;
      case 'verb':
        return word + 'ed'; // past tense
      default:
        return word;
    }
  }

  private generateGrammaticalDistractors(word: string, count: number): string[] {
    return [
      word + 'ly',
      word + 'ing',
      word + 's',
    ].slice(0, count);
  }

  private selectTestTypeForReview(masteryLevel: number): TestType {
    if (masteryLevel < 2) return 'word_meaning';
    if (masteryLevel < 4) return 'typing';
    return 'comprehension';
  }

  private async getUserLearningProfile(userId: string): Promise<any> {
    // Get user's learning profile from the learning analyzer
    const userStats = await prisma.userStats.findUnique({
      where: { userId }
    });

    return {
      preferredDifficulty: 3,
      weakAreas: [],
      strongAreas: [],
      averageResponseTime: 3000,
      ...userStats
    };
  }

  private async saveTestSession(session: TestSession): Promise<void> {
    // Save session to database (simplified)
    await prisma.learningSession.create({
      data: {
        id: session.id,
        userId: session.userId,
        storyId: 'test-session', // placeholder
        vocabularyIds: session.vocabularyIds,
        sessionType: `advanced_test_${session.testMode}`,
        metadata: {
          testSession: session
        }
      }
    });
  }
}