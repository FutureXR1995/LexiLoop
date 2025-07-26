import express from 'express';
import { 
  adminModerationService, 
  ContentType, 
  ContentStatus, 
  ModerationAction 
} from '../services/adminModerationService';

const router = express.Router();

// 获取待审核内容列表
router.get('/pending', async (req, res) => {
  try {
    const {
      contentType,
      priority,
      status,
      authorId,
      page = 1,
      limit = 20
    } = req.query;

    const filters: any = {};
    if (contentType) filters.contentType = contentType as ContentType;
    if (priority) filters.priority = priority as string;
    if (status) filters.status = status as ContentStatus;
    if (authorId) filters.authorId = authorId as string;

    const pagination = {
      page: parseInt(page as string),
      limit: parseInt(limit as string)
    };

    const result = await adminModerationService.getPendingItems(filters, pagination);

    res.json({
      success: true,
      data: result,
      pagination: {
        currentPage: pagination.page,
        totalPages: Math.ceil(result.total / pagination.limit),
        totalItems: result.total,
        hasMore: result.hasMore
      }
    });
  } catch (error) {
    console.error('Error fetching pending items:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending items'
    });
  }
});

// 审核单个内容
router.post('/moderate/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    const { moderatorId, action, reason, notes } = req.body;

    if (!moderatorId || !action || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: moderatorId, action, reason'
      });
    }

    if (!Object.values(ModerationAction).includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid moderation action'
      });
    }

    const result = await adminModerationService.moderateContent(
      itemId,
      moderatorId,
      action as ModerationAction,
      reason,
      notes
    );

    if (result.success) {
      res.json({
        success: true,
        message: result.message
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Error moderating content:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to moderate content'
    });
  }
});

// 批量审核
router.post('/bulk-moderate', async (req, res) => {
  try {
    const { itemIds, moderatorId, action, reason } = req.body;

    if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'itemIds must be a non-empty array'
      });
    }

    if (!moderatorId || !action || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: moderatorId, action, reason'
      });
    }

    if (!Object.values(ModerationAction).includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid moderation action'
      });
    }

    const result = await adminModerationService.bulkModerate(
      itemIds,
      moderatorId,
      action as ModerationAction,
      reason
    );

    res.json({
      success: true,
      data: result,
      message: `Bulk moderation completed: ${result.success} succeeded, ${result.failed} failed`
    });
  } catch (error) {
    console.error('Error in bulk moderation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform bulk moderation'
    });
  }
});

// 获取审核统计
router.get('/stats', async (req, res) => {
  try {
    const stats = await adminModerationService.getModerationStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching moderation stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch moderation statistics'
    });
  }
});

// 获取用户违规历史
router.get('/user/:userId/violations', async (req, res) => {
  try {
    const { userId } = req.params;
    const violations = await adminModerationService.getUserViolations(userId);
    
    res.json({
      success: true,
      data: violations
    });
  } catch (error) {
    console.error('Error fetching user violations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user violations'
    });
  }
});

// 获取审核历史
router.get('/history', async (req, res) => {
  try {
    const {
      contentId,
      moderatorId,
      action,
      dateFrom,
      dateTo,
      page = 1,
      limit = 50
    } = req.query;

    const filters: any = {};
    if (contentId) filters.contentId = contentId as string;
    if (moderatorId) filters.moderatorId = moderatorId as string;
    if (action) filters.action = action as ModerationAction;
    if (dateFrom) filters.dateFrom = new Date(dateFrom as string);
    if (dateTo) filters.dateTo = new Date(dateTo as string);

    const pagination = {
      page: parseInt(page as string),
      limit: parseInt(limit as string)
    };

    const result = await adminModerationService.getModerationHistory(filters, pagination);

    res.json({
      success: true,
      data: result,
      pagination: {
        currentPage: pagination.page,
        totalPages: Math.ceil(result.total / pagination.limit),
        totalItems: result.total
      }
    });
  } catch (error) {
    console.error('Error fetching moderation history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch moderation history'
    });
  }
});

// 自动标记可疑内容
router.post('/auto-flag', async (req, res) => {
  try {
    const result = await adminModerationService.autoFlagContent();
    
    res.json({
      success: true,
      data: result,
      message: `Auto-flagging completed: ${result.flagged} items flagged`
    });
  } catch (error) {
    console.error('Error in auto-flagging:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to auto-flag content'
    });
  }
});

// 获取内容类型枚举
router.get('/enums/content-types', (req, res) => {
  res.json({
    success: true,
    data: Object.values(ContentType)
  });
});

// 获取内容状态枚举
router.get('/enums/content-status', (req, res) => {
  res.json({
    success: true,
    data: Object.values(ContentStatus)
  });
});

// 获取审核动作枚举
router.get('/enums/moderation-actions', (req, res) => {
  res.json({
    success: true,
    data: Object.values(ModerationAction)
  });
});

export default router;