/**
 * Story Service
 * Handles AI story generation and story management
 */

import axios from 'axios';
import { prisma } from './databaseService';
import { config } from '../config/config';
import { APIError } from '../middleware/errorHandler';
import { aiLogger } from '../utils/logger';

export interface GenerateStoryRequest {
  vocabularyIds: string[];
  difficulty?: number;
  storyType?: string;
  maxLength?: number;
  userId?: string;
}

export interface GeneratedStory {
  id: string;
  content: string;
  title?: string;
  vocabularyUsed: string[];
  wordCount: number;
  difficulty: number;
  qualityScore: number;
  audioUrl?: string;
  createdAt: Date;
}

export class StoryService {
  /**
   * Generate a new story using AI service
   */
  static async generateStory(request: GenerateStoryRequest): Promise<GeneratedStory> {
    const {
      vocabularyIds,
      difficulty = 2,
      storyType = 'general',
      maxLength = 800,
      userId
    } = request;

    aiLogger.info('Story generation requested', {
      vocabularyCount: vocabularyIds.length,
      difficulty,
      storyType,
      userId
    });

    // Validate vocabulary IDs
    if (!vocabularyIds || vocabularyIds.length === 0) {
      throw new APIError('Vocabulary IDs are required', 400);
    }

    if (vocabularyIds.length > 20) {
      throw new APIError('Too many vocabulary words (maximum 20)', 400);
    }

    // Get vocabulary words from database
    const vocabularies = await prisma.vocabulary.findMany({
      where: {
        id: { in: vocabularyIds }
      },
      select: {
        id: true,
        word: true,
        definition: true,
        difficultyLevel: true
      }
    });

    if (vocabularies.length !== vocabularyIds.length) {
      throw new APIError('Some vocabulary words not found', 404);
    }

    const vocabularyWords = vocabularies.map(v => v.word);

    try {
      // Call AI service
      const aiResponse = await axios.post(
        `${config.aiService.baseUrl}/generate-story`,
        {
          vocabulary: vocabularyWords,
          difficulty,
          story_type: storyType,
          max_length: maxLength
        },
        {
          timeout: config.aiService.timeout,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      const aiStoryData = aiResponse.data;

      // Generate a simple title if not provided
      const title = this.generateTitle(vocabularyWords, storyType);

      // Save story to database
      const savedStory = await prisma.story.create({
        data: {
          title,
          content: aiStoryData.content,
          vocabularyIds: vocabularyIds,
          difficultyLevel: difficulty,
          storyType: storyType,
          wordCount: aiStoryData.word_count,
          qualityScore: aiStoryData.quality_score,
          audioUrl: aiStoryData.audio_url,
          isPublic: false, // User-generated stories are private by default
        }
      });

      aiLogger.info('Story generated and saved successfully', {
        storyId: savedStory.id,
        wordCount: savedStory.wordCount,
        qualityScore: savedStory.qualityScore,
        userId
      });

      // Log AI usage for cost tracking
      if (userId) {
        await this.logAiUsage(userId, 'openai_generation', aiStoryData.word_count);
      }

      return {
        id: savedStory.id,
        content: savedStory.content,
        title: savedStory.title || undefined,
        vocabularyUsed: aiStoryData.vocabulary_used || vocabularyWords,
        wordCount: savedStory.wordCount,
        difficulty: savedStory.difficultyLevel,
        qualityScore: Number(savedStory.qualityScore) || 0,
        audioUrl: savedStory.audioUrl || undefined,
        createdAt: savedStory.createdAt
      };

    } catch (error: any) {
      aiLogger.error('Story generation failed', {
        error: error.message,
        vocabularyWords: vocabularyWords.slice(0, 3),
        difficulty,
        storyType,
        userId
      });

      if (error.code === 'ECONNREFUSED') {
        throw new APIError('AI service is not available', 503);
      }

      if (error.response?.status === 400) {
        throw new APIError(error.response.data.detail || 'Invalid request to AI service', 400);
      }

      if (error.response?.status === 500) {
        throw new APIError('AI service error', 500);
      }

      throw new APIError('Failed to generate story', 500);
    }
  }

  /**
   * Get story by ID
   */
  static async getStoryById(storyId: string, userId?: string): Promise<GeneratedStory> {
    const story = await prisma.story.findUnique({
      where: { id: storyId },
      include: {
        _count: {
          select: { learningSessions: true }
        }
      }
    });

    if (!story) {
      throw new APIError('Story not found', 404);
    }

    // Check if user has access to this story
    if (!story.isPublic && userId) {
      const hasAccess = await prisma.learningSession.findFirst({
        where: {
          storyId: story.id,
          userId: userId
        }
      });

      if (!hasAccess) {
        throw new APIError('Access denied to this story', 403);
      }
    }

    // Get vocabulary words
    const vocabularies = await prisma.vocabulary.findMany({
      where: {
        id: { in: story.vocabularyIds }
      },
      select: { word: true }
    });

    return {
      id: story.id,
      content: story.content,
      title: story.title || undefined,
      vocabularyUsed: vocabularies.map(v => v.word),
      wordCount: story.wordCount,
      difficulty: story.difficultyLevel,
      qualityScore: Number(story.qualityScore) || 0,
      audioUrl: story.audioUrl || undefined,
      createdAt: story.createdAt
    };
  }

  /**
   * Get user's story history
   */
  static async getUserStoryHistory(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    stories: GeneratedStory[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const offset = (page - 1) * limit;

    // Get stories from user's learning sessions
    const [sessions, totalCount] = await Promise.all([
      prisma.learningSession.findMany({
        where: { userId },
        include: {
          story: {
            include: {
              _count: {
                select: { learningSessions: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
        distinct: ['storyId'] // Avoid duplicate stories
      }),
      prisma.learningSession.count({
        where: { userId },
        distinct: ['storyId']
      })
    ]);

    const stories: GeneratedStory[] = [];

    for (const session of sessions) {
      if (session.story) {
        // Get vocabulary words for this story
        const vocabularies = await prisma.vocabulary.findMany({
          where: {
            id: { in: session.story.vocabularyIds }
          },
          select: { word: true }
        });

        stories.push({
          id: session.story.id,
          content: session.story.content,
          title: session.story.title || undefined,
          vocabularyUsed: vocabularies.map(v => v.word),
          wordCount: session.story.wordCount,
          difficulty: session.story.difficultyLevel,
          qualityScore: Number(session.story.qualityScore) || 0,
          audioUrl: session.story.audioUrl || undefined,
          createdAt: session.story.createdAt
        });
      }
    }

    return {
      stories,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    };
  }

  /**
   * Generate a simple title for the story
   */
  private static generateTitle(vocabularyWords: string[], storyType: string): string {
    const titleTemplates = {
      adventure: ['The Great Adventure', 'An Exciting Journey', 'The Quest for Knowledge'],
      daily_life: ['A Day to Remember', 'Life Lessons', 'Everyday Stories'],
      science: ['Scientific Discovery', 'The World of Science', 'Exploring Nature'],
      history: ['Tales from the Past', 'Historical Moments', 'Through Time'],
      general: ['A Learning Story', 'Words in Action', 'The Story of Learning']
    };

    const templates = titleTemplates[storyType as keyof typeof titleTemplates] || titleTemplates.general;
    const randomTemplate = templates[Math.floor(Math.random() * templates.length)];

    // If we have specific vocabulary, try to incorporate it
    if (vocabularyWords.length > 0) {
      const firstWord = vocabularyWords[0];
      const capitalizedWord = firstWord.charAt(0).toUpperCase() + firstWord.slice(1);
      
      if (Math.random() > 0.5) {
        return `The ${capitalizedWord} Story`;
      }
    }

    return randomTemplate;
  }

  /**
   * Log AI usage for cost tracking
   */
  private static async logAiUsage(
    userId: string,
    serviceType: string,
    tokensUsed: number
  ): Promise<void> {
    try {
      // Estimate cost (approximate values)
      const costPerToken = serviceType === 'openai_generation' ? 0.002 / 1000 : 0.001 / 1000;
      const estimatedCost = tokensUsed * costPerToken;

      await prisma.aiUsageLog.create({
        data: {
          userId,
          serviceType,
          tokensUsed,
          costUsd: estimatedCost,
          requestDetails: {
            model: 'gpt-4o-mini',
            timestamp: new Date().toISOString()
          }
        }
      });

      aiLogger.info('AI usage logged', {
        userId,
        serviceType,
        tokensUsed,
        estimatedCost
      });
    } catch (error) {
      aiLogger.error('Failed to log AI usage', { error: (error as Error).message });
    }
  }

  /**
   * Get popular stories
   */
  static async getPopularStories(limit: number = 10): Promise<GeneratedStory[]> {
    const stories = await prisma.story.findMany({
      where: { isPublic: true },
      orderBy: { viewCount: 'desc' },
      take: limit,
      include: {
        _count: {
          select: { learningSessions: true }
        }
      }
    });

    const result: GeneratedStory[] = [];

    for (const story of stories) {
      const vocabularies = await prisma.vocabulary.findMany({
        where: {
          id: { in: story.vocabularyIds }
        },
        select: { word: true }
      });

      result.push({
        id: story.id,
        content: story.content,
        title: story.title || undefined,
        vocabularyUsed: vocabularies.map(v => v.word),
        wordCount: story.wordCount,
        difficulty: story.difficultyLevel,
        qualityScore: Number(story.qualityScore) || 0,
        audioUrl: story.audioUrl || undefined,
        createdAt: story.createdAt
      });
    }

    return result;
  }
}