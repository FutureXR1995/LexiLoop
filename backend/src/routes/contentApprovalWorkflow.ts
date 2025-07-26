import express from 'express';
import { 
  contentApprovalWorkflowService,
  ContentTypeWorkflow,
  WorkflowStatus,
  ApprovalAction
} from '../services/contentApprovalWorkflowService';

const router = express.Router();

// 提交内容到工作流
router.post('/submit', async (req, res) => {
  try {
    const { contentId, contentType, submitterId, metadata, priority } = req.body;

    if (!contentId || !contentType || !submitterId || !metadata) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: contentId, contentType, submitterId, metadata'
      });
    }

    if (!Object.values(ContentTypeWorkflow).includes(contentType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid content type'
      });
    }

    if (!metadata.title || !metadata.description) {
      return res.status(400).json({
        success: false,
        message: 'Metadata must include title and description'
      });
    }

    const result = await contentApprovalWorkflowService.submitContent(
      contentId,
      contentType as ContentTypeWorkflow,
      submitterId,
      metadata,
      priority || 'medium'
    );

    if (result.success) {
      res.json({
        success: true,
        data: { instanceId: result.instanceId },
        message: result.message
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Error submitting content to workflow:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit content to workflow'
    });
  }
});

// 执行审批动作
router.post('/instance/:instanceId/approve', async (req, res) => {
  try {
    const { instanceId } = req.params;
    const { stepId, reviewerId, action, comments, score } = req.body;

    if (!stepId || !reviewerId || !action) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: stepId, reviewerId, action'
      });
    }

    if (!Object.values(ApprovalAction).includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid approval action'
      });
    }

    const result = await contentApprovalWorkflowService.executeApprovalAction(
      instanceId,
      stepId,
      reviewerId,
      action as ApprovalAction,
      comments,
      score
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
    console.error('Error executing approval action:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to execute approval action'
    });
  }
});

// 获取工作流实例详情
router.get('/instance/:instanceId', async (req, res) => {
  try {
    const { instanceId } = req.params;
    const instance = await contentApprovalWorkflowService.getWorkflowInstance(instanceId);

    if (!instance) {
      return res.status(404).json({
        success: false,
        message: 'Workflow instance not found'
      });
    }

    res.json({
      success: true,
      data: instance
    });
  } catch (error) {
    console.error('Error fetching workflow instance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch workflow instance'
    });
  }
});

// 获取用户的工作流实例
router.get('/user/:userId/instances', async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, contentType, role } = req.query;

    const filters: any = {};
    if (status) filters.status = status as WorkflowStatus;
    if (contentType) filters.contentType = contentType as ContentTypeWorkflow;
    if (role) filters.role = role as 'submitter' | 'reviewer';

    const instances = await contentApprovalWorkflowService.getUserWorkflowInstances(
      userId,
      filters
    );

    res.json({
      success: true,
      data: instances,
      total: instances.length
    });
  } catch (error) {
    console.error('Error fetching user workflow instances:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user workflow instances'
    });
  }
});

// 获取待审批项目（审批者视角）
router.get('/pending-reviews/:reviewerId', async (req, res) => {
  try {
    const { reviewerId } = req.params;
    const { contentType, priority } = req.query;

    const instances = await contentApprovalWorkflowService.getUserWorkflowInstances(
      reviewerId,
      { role: 'reviewer', contentType: contentType as ContentTypeWorkflow }
    );

    // 过滤优先级
    let filteredInstances = instances;
    if (priority && priority !== 'all') {
      filteredInstances = instances.filter(instance => instance.priority === priority);
    }

    // 按优先级和提交时间排序
    const priorityOrder = { 'urgent': 4, 'high': 3, 'medium': 2, 'low': 1 };
    filteredInstances.sort((a, b) => {
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.startedAt.getTime() - a.startedAt.getTime();
    });

    res.json({
      success: true,
      data: {
        instances: filteredInstances,
        total: filteredInstances.length,
        summary: {
          urgent: instances.filter(i => i.priority === 'urgent').length,
          high: instances.filter(i => i.priority === 'high').length,
          medium: instances.filter(i => i.priority === 'medium').length,
          low: instances.filter(i => i.priority === 'low').length
        }
      }
    });
  } catch (error) {
    console.error('Error fetching pending reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending reviews'
    });
  }
});

// 获取工作流统计
router.get('/statistics', async (req, res) => {
  try {
    const stats = await contentApprovalWorkflowService.getWorkflowStatistics();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching workflow statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch workflow statistics'
    });
  }
});

// 获取用户通知
router.get('/user/:userId/notifications', async (req, res) => {
  try {
    const { userId } = req.params;
    const { unreadOnly } = req.query;

    const notifications = await contentApprovalWorkflowService.getUserNotifications(
      userId,
      unreadOnly === 'true'
    );

    res.json({
      success: true,
      data: notifications,
      total: notifications.length,
      unreadCount: notifications.filter(n => !n.read).length
    });
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user notifications'
    });
  }
});

// 标记通知为已读
router.put('/notification/:notificationId/read', async (req, res) => {
  try {
    const { notificationId } = req.params;

    const result = await contentApprovalWorkflowService.markNotificationAsRead(notificationId);

    if (result.success) {
      res.json({
        success: true,
        message: result.message
      });
    } else {
      res.status(404).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read'
    });
  }
});

// 获取工作流进度
router.get('/instance/:instanceId/progress', async (req, res) => {
  try {
    const { instanceId } = req.params;
    const instance = await contentApprovalWorkflowService.getWorkflowInstance(instanceId);

    if (!instance) {
      return res.status(404).json({
        success: false,
        message: 'Workflow instance not found'
      });
    }

    // 计算进度信息
    const totalSteps = instance.stepHistory.length;
    const completedSteps = instance.stepHistory.filter(step => step.status === 'completed').length;
    const progressPercentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

    const currentStep = instance.stepHistory.find(step => step.status === 'in_progress');
    const estimatedTimeRemaining = currentStep && instance.estimatedCompletionTime
      ? Math.max(0, instance.estimatedCompletionTime.getTime() - Date.now())
      : null;

    const progress = {
      instanceId: instance.id,
      status: instance.currentStatus,
      progressPercentage,
      completedSteps,
      totalSteps,
      currentStepName: currentStep ? 'Current Step' : null,
      estimatedTimeRemaining: estimatedTimeRemaining ? Math.round(estimatedTimeRemaining / (1000 * 60 * 60)) : null, // hours
      stepHistory: instance.stepHistory.map(step => ({
        stepId: step.stepId,
        status: step.status,
        startedAt: step.startedAt,
        completedAt: step.completedAt,
        executedBy: step.executedBy,
        result: step.result,
        timeSpent: step.timeSpent
      }))
    };

    res.json({
      success: true,
      data: progress
    });
  } catch (error) {
    console.error('Error fetching workflow progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch workflow progress'
    });
  }
});

// 获取内容类型枚举
router.get('/enums/content-types', (req, res) => {
  res.json({
    success: true,
    data: Object.values(ContentTypeWorkflow)
  });
});

// 获取工作流状态枚举
router.get('/enums/workflow-status', (req, res) => {
  res.json({
    success: true,
    data: Object.values(WorkflowStatus)
  });
});

// 获取审批动作枚举
router.get('/enums/approval-actions', (req, res) => {
  res.json({
    success: true,
    data: Object.values(ApprovalAction)
  });
});

// 批量审批
router.post('/bulk-approve', async (req, res) => {
  try {
    const { instanceIds, reviewerId, action, comments } = req.body;

    if (!instanceIds || !Array.isArray(instanceIds) || instanceIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'instanceIds must be a non-empty array'
      });
    }

    if (!reviewerId || !action) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: reviewerId, action'
      });
    }

    const results = {
      successful: 0,
      failed: 0,
      errors: [] as string[]
    };

    for (const instanceId of instanceIds) {
      try {
        const instance = await contentApprovalWorkflowService.getWorkflowInstance(instanceId);
        if (!instance || !instance.currentStepId) {
          results.failed++;
          results.errors.push(`Instance ${instanceId}: No current step or instance not found`);
          continue;
        }

        const result = await contentApprovalWorkflowService.executeApprovalAction(
          instanceId,
          instance.currentStepId,
          reviewerId,
          action as ApprovalAction,
          comments
        );

        if (result.success) {
          results.successful++;
        } else {
          results.failed++;
          results.errors.push(`Instance ${instanceId}: ${result.message}`);
        }
      } catch (error) {
        results.failed++;
        results.errors.push(`Instance ${instanceId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    res.json({
      success: true,
      data: results,
      message: `Bulk approval completed: ${results.successful} successful, ${results.failed} failed`
    });
  } catch (error) {
    console.error('Error in bulk approval:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform bulk approval'
    });
  }
});

export default router;