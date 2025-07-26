/**
 * 词汇库管理API路由
 * 提供词汇集合和单词管理的REST接口
 */

import express from 'express';
import vocabularyLibraryService from '../services/vocabularyLibraryService';

const router = express.Router();

/**
 * 获取所有词汇集合
 * GET /api/vocabulary-library/collections
 */
router.get('/collections', async (req, res) => {
  try {
    const { category, difficulty, search } = req.query;
    
    let collections;
    
    if (search) {
      collections = await vocabularyLibraryService.searchCollections(search as string);
    } else if (category) {
      collections = await vocabularyLibraryService.getCollectionsByCategory(category as string);
    } else if (difficulty) {
      collections = await vocabularyLibraryService.getCollectionsByDifficulty(difficulty as string);
    } else {
      collections = await vocabularyLibraryService.getAllCollections();
    }

    res.json({
      success: true,
      data: collections,
      message: 'Collections retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching collections:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch collections',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * 根据ID获取词汇集合详情
 * GET /api/vocabulary-library/collections/:id
 */
router.get('/collections/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const collection = await vocabularyLibraryService.getCollectionById(id);

    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found'
      });
    }

    res.json({
      success: true,
      data: collection,
      message: 'Collection retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching collection:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch collection',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * 创建新的词汇集合
 * POST /api/vocabulary-library/collections
 */
router.post('/collections', async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      difficulty,
      words = [],
      isPublic = true,
      createdBy = 'user'
    } = req.body;

    if (!name || !description || !category || !difficulty) {
      return res.status(400).json({
        success: false,
        message: 'Name, description, category, and difficulty are required'
      });
    }

    const collection = await vocabularyLibraryService.createCollection({
      name,
      description,
      category,
      difficulty,
      words,
      isPublic,
      createdBy
    });

    res.status(201).json({
      success: true,
      data: collection,
      message: 'Collection created successfully'
    });
  } catch (error) {
    console.error('Error creating collection:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create collection',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * 向集合添加新单词
 * POST /api/vocabulary-library/collections/:id/words
 */
router.post('/collections/:id/words', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      word,
      definition,
      pronunciation,
      partOfSpeech,
      difficulty,
      tags = [],
      examples = []
    } = req.body;

    if (!word || !definition || !partOfSpeech || !difficulty) {
      return res.status(400).json({
        success: false,
        message: 'Word, definition, part of speech, and difficulty are required'
      });
    }

    const newWord = await vocabularyLibraryService.addWordToCollection(id, {
      word,
      definition,
      pronunciation,
      partOfSpeech,
      difficulty,
      tags,
      examples
    });

    if (!newWord) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found'
      });
    }

    res.status(201).json({
      success: true,
      data: newWord,
      message: 'Word added to collection successfully'
    });
  } catch (error) {
    console.error('Error adding word to collection:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add word to collection',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * 获取用户的学习进度
 * GET /api/vocabulary-library/progress/:userId
 */
router.get('/progress/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const progress = await vocabularyLibraryService.getUserProgress(userId);

    res.json({
      success: true,
      data: progress,
      message: 'User progress retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching user progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user progress',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * 更新单词学习进度
 * POST /api/vocabulary-library/progress/:userId/words/:wordId
 */
router.post('/progress/:userId/words/:wordId', async (req, res) => {
  try {
    const { userId, wordId } = req.params;
    const { isCorrect } = req.body;

    if (typeof isCorrect !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isCorrect field is required and must be a boolean'
      });
    }

    const progress = await vocabularyLibraryService.updateWordProgress(userId, wordId, isCorrect);

    res.json({
      success: true,
      data: progress,
      message: 'Word progress updated successfully'
    });
  } catch (error) {
    console.error('Error updating word progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update word progress',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * 获取需要复习的单词
 * GET /api/vocabulary-library/review/:userId
 */
router.get('/review/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const wordsToReview = await vocabularyLibraryService.getWordsForReview(userId);

    res.json({
      success: true,
      data: wordsToReview,
      message: 'Review words retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching review words:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch review words',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * 获取用户学习统计
 * GET /api/vocabulary-library/stats/:userId
 */
router.get('/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const stats = await vocabularyLibraryService.getLearnStats(userId);

    res.json({
      success: true,
      data: stats,
      message: 'Learning statistics retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching learning stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch learning statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * 获取词汇集合的分类列表
 * GET /api/vocabulary-library/categories
 */
router.get('/categories', async (req, res) => {
  try {
    const collections = await vocabularyLibraryService.getAllCollections();
    const categories = [...new Set(collections.map(c => c.category))];

    res.json({
      success: true,
      data: categories,
      message: 'Categories retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * 获取难度级别列表
 * GET /api/vocabulary-library/difficulties
 */
router.get('/difficulties', async (req, res) => {
  try {
    const difficulties = ['beginner', 'intermediate', 'advanced'];

    res.json({
      success: true,
      data: difficulties,
      message: 'Difficulty levels retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch difficulty levels'
    });
  }
});

export default router;