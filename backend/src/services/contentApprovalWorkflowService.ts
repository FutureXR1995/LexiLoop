import { ObjectId } from 'mongodb';

// 工作流状态枚举
export enum WorkflowStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  NEEDS_REVISION = 'needs_revision',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

// 审批步骤类型
export enum ApprovalStepType {
  AUTO_CHECK = 'auto_check',
  PEER_REVIEW = 'peer_review',
  EXPERT_REVIEW = 'expert_review',
  ADMIN_APPROVAL = 'admin_approval',
  FINAL_PUBLISH = 'final_publish'
}

// 审批动作
export enum ApprovalAction {
  SUBMIT = 'submit',
  APPROVE = 'approve',
  REJECT = 'reject',
  REQUEST_REVISION = 'request_revision',
  ESCALATE = 'escalate',
  PUBLISH = 'publish',
  ARCHIVE = 'archive'
}

// 内容类型
export enum ContentTypeWorkflow {
  VOCABULARY_COLLECTION = 'vocabulary_collection',
  VOCABULARY_WORD = 'vocabulary_word',
  LEARNING_MATERIAL = 'learning_material',
  QUIZ_QUESTION = 'quiz_question',
  USER_CONTRIBUTION = 'user_contribution'
}

// 审批步骤接口
export interface ApprovalStep {
  id: string;
  type: ApprovalStepType;
  name: string;
  description: string;
  required: boolean;
  autoExecute: boolean;
  assignedTo?: string[]; // 审批者用户ID列表
  roleRequired?: string[]; // 需要的角色权限
  timeLimit?: number; // 时间限制（小时）
  conditions?: {
    contentType?: ContentTypeWorkflow[];
    minScore?: number;
    maxComplexity?: number;
    authorLevel?: string[];
  };
  order: number;
}

// 工作流定义接口
export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  contentType: ContentTypeWorkflow;
  version: string;
  isActive: boolean;
  steps: ApprovalStep[];
  rules: {
    allowSkipSteps: boolean;
    requireAllApprovals: boolean;
    autoPublish: boolean;
    escalationRules: {
      timeoutHours: number;
      escalateTo: string[];
    };
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// 工作流实例接口
export interface WorkflowInstance {
  id: string;
  workflowDefinitionId: string;
  contentId: string;
  contentType: ContentTypeWorkflow;
  submitterId: string;
  currentStatus: WorkflowStatus;
  currentStepId?: string;
  startedAt: Date;
  completedAt?: Date;
  estimatedCompletionTime?: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  metadata: {
    title: string;
    description: string;
    tags: string[];
    contentSize: number;
    complexity: 'simple' | 'moderate' | 'complex';
  };
  stepHistory: StepExecution[];
  notifications: WorkflowNotification[];
}

// 步骤执行记录
export interface StepExecution {
  stepId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'failed';
  assignedTo: string[];
  startedAt: Date;
  completedAt?: Date;
  executedBy?: string;
  action: ApprovalAction;
  result: 'approved' | 'rejected' | 'revision_requested' | 'escalated';
  comments?: string;
  attachments?: string[];
  score?: number;
  timeSpent?: number; // 分钟
}

// 工作流通知
export interface WorkflowNotification {
  id: string;
  type: 'assignment' | 'reminder' | 'escalation' | 'completion';
  recipientId: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionRequired: boolean;
  actionURL?: string;
}

// 工作流统计
export interface WorkflowStatistics {
  totalInstances: number;
  activeInstances: number;
  completedToday: number;
  averageCompletionTime: number; // 小时
  approvalRate: number; // 百分比
  bottleneckSteps: {
    stepId: string;
    stepName: string;
    averageTime: number;
    pendingCount: number;
  }[];
  performanceByReviewer: {
    reviewerId: string;
    reviewerName: string;
    reviewsCompleted: number;
    averageTime: number;
    approvalRate: number;
  }[];
  contentTypeBreakdown: {
    [key in ContentTypeWorkflow]: {
      submitted: number;
      approved: number;
      rejected: number;
      pending: number;
    };
  };
}

export class ContentApprovalWorkflowService {
  private workflowDefinitions: Map<string, WorkflowDefinition> = new Map();
  private workflowInstances: Map<string, WorkflowInstance> = new Map();
  private statistics: WorkflowStatistics | null = null;

  constructor() {
    this.initializeDefaultWorkflows();
    this.initializeMockData();
  }

  // 初始化默认工作流定义
  private initializeDefaultWorkflows(): void {
    // 词汇集合审批工作流
    const vocabularyCollectionWorkflow: WorkflowDefinition = {
      id: 'wf_vocab_collection',
      name: 'Vocabulary Collection Approval',
      description: 'Standard approval process for vocabulary collections',
      contentType: ContentTypeWorkflow.VOCABULARY_COLLECTION,
      version: '1.0',
      isActive: true,
      steps: [
        {
          id: 'step_auto_check',
          type: ApprovalStepType.AUTO_CHECK,
          name: 'Automated Quality Check',
          description: 'Automated validation of content format and basic quality',
          required: true,
          autoExecute: true,
          order: 1
        },
        {
          id: 'step_peer_review',
          type: ApprovalStepType.PEER_REVIEW,
          name: 'Peer Review',
          description: 'Review by community members or peers',
          required: true,
          autoExecute: false,
          roleRequired: ['reviewer', 'expert'],
          timeLimit: 48,
          order: 2
        },
        {
          id: 'step_expert_review',
          type: ApprovalStepType.EXPERT_REVIEW,
          name: 'Expert Review',
          description: 'Review by subject matter experts',
          required: false,
          autoExecute: false,
          roleRequired: ['expert', 'educator'],
          timeLimit: 24,
          conditions: {
            contentType: [ContentTypeWorkflow.VOCABULARY_COLLECTION],
            maxComplexity: 2
          },
          order: 3
        },
        {
          id: 'step_admin_approval',
          type: ApprovalStepType.ADMIN_APPROVAL,
          name: 'Admin Final Approval',
          description: 'Final approval by system administrators',
          required: true,
          autoExecute: false,
          roleRequired: ['admin', 'moderator'],
          timeLimit: 12,
          order: 4
        },
        {
          id: 'step_publish',
          type: ApprovalStepType.FINAL_PUBLISH,
          name: 'Publish Content',
          description: 'Final publication step',
          required: true,
          autoExecute: true,
          order: 5
        }
      ],
      rules: {
        allowSkipSteps: true,
        requireAllApprovals: false,
        autoPublish: true,
        escalationRules: {
          timeoutHours: 72,
          escalateTo: ['admin_001', 'admin_002']
        }
      },
      createdBy: 'system',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    };

    // 词汇单词审批工作流
    const vocabularyWordWorkflow: WorkflowDefinition = {
      id: 'wf_vocab_word',
      name: 'Vocabulary Word Approval',
      description: 'Streamlined approval for individual vocabulary words',
      contentType: ContentTypeWorkflow.VOCABULARY_WORD,
      version: '1.0',
      isActive: true,
      steps: [
        {
          id: 'step_auto_validation',
          type: ApprovalStepType.AUTO_CHECK,
          name: 'Automated Validation',
          description: 'Check word format, definition, and examples',
          required: true,
          autoExecute: true,
          order: 1
        },
        {
          id: 'step_quick_review',
          type: ApprovalStepType.PEER_REVIEW,
          name: 'Quick Review',
          description: 'Fast review by qualified reviewers',
          required: true,
          autoExecute: false,
          roleRequired: ['reviewer'],
          timeLimit: 24,
          order: 2
        },
        {
          id: 'step_auto_publish',
          type: ApprovalStepType.FINAL_PUBLISH,
          name: 'Auto Publish',
          description: 'Automatic publication after approval',
          required: true,
          autoExecute: true,
          order: 3
        }
      ],
      rules: {
        allowSkipSteps: false,
        requireAllApprovals: true,
        autoPublish: true,
        escalationRules: {
          timeoutHours: 48,
          escalateTo: ['moderator_001']
        }
      },
      createdBy: 'system',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    };

    this.workflowDefinitions.set(vocabularyCollectionWorkflow.id, vocabularyCollectionWorkflow);
    this.workflowDefinitions.set(vocabularyWordWorkflow.id, vocabularyWordWorkflow);
  }

  // 初始化模拟数据
  private initializeMockData(): void {
    const mockInstances: WorkflowInstance[] = [
      {
        id: 'instance_001',
        workflowDefinitionId: 'wf_vocab_collection',
        contentId: 'content_001',
        contentType: ContentTypeWorkflow.VOCABULARY_COLLECTION,
        submitterId: 'user_001',
        currentStatus: WorkflowStatus.UNDER_REVIEW,
        currentStepId: 'step_peer_review',
        startedAt: new Date('2024-01-20T10:00:00'),
        estimatedCompletionTime: new Date('2024-01-23T10:00:00'),
        priority: 'medium',
        metadata: {
          title: 'Advanced Business Vocabulary',
          description: 'Comprehensive business terms collection',
          tags: ['business', 'professional', 'advanced'],
          contentSize: 150,
          complexity: 'moderate'
        },
        stepHistory: [
          {
            stepId: 'step_auto_check',
            status: 'completed',
            assignedTo: ['system'],
            startedAt: new Date('2024-01-20T10:00:00'),
            completedAt: new Date('2024-01-20T10:02:00'),
            executedBy: 'system',
            action: ApprovalAction.APPROVE,
            result: 'approved',
            comments: 'Automated checks passed',
            timeSpent: 2
          },
          {
            stepId: 'step_peer_review',
            status: 'in_progress',
            assignedTo: ['reviewer_001', 'reviewer_002'],
            startedAt: new Date('2024-01-20T10:02:00'),
            action: ApprovalAction.SUBMIT,
            result: 'approved'
          }
        ],
        notifications: [
          {
            id: 'notif_001',
            type: 'assignment',
            recipientId: 'reviewer_001',
            message: 'New vocabulary collection assigned for review',
            timestamp: new Date('2024-01-20T10:02:00'),
            read: false,
            actionRequired: true,
            actionURL: '/admin/review/instance_001'
          }
        ]
      },
      {
        id: 'instance_002',
        workflowDefinitionId: 'wf_vocab_word',
        contentId: 'content_002',
        contentType: ContentTypeWorkflow.VOCABULARY_WORD,
        submitterId: 'user_002',
        currentStatus: WorkflowStatus.NEEDS_REVISION,
        currentStepId: 'step_quick_review',
        startedAt: new Date('2024-01-21T14:30:00'),
        priority: 'low',
        metadata: {
          title: 'Word: Entrepreneur',
          description: 'Definition and examples for entrepreneur',
          tags: ['business', 'career'],
          contentSize: 1,
          complexity: 'simple'
        },
        stepHistory: [
          {
            stepId: 'step_auto_validation',
            status: 'completed',
            assignedTo: ['system'],
            startedAt: new Date('2024-01-21T14:30:00'),
            completedAt: new Date('2024-01-21T14:30:30'),
            executedBy: 'system',
            action: ApprovalAction.APPROVE,
            result: 'approved',
            timeSpent: 0.5
          },
          {
            stepId: 'step_quick_review',
            status: 'completed',
            assignedTo: ['reviewer_003'],
            startedAt: new Date('2024-01-21T14:30:30'),
            completedAt: new Date('2024-01-21T15:15:00'),
            executedBy: 'reviewer_003',
            action: ApprovalAction.REQUEST_REVISION,
            result: 'revision_requested',
            comments: 'Examples need improvement, pronunciation missing',
            timeSpent: 45
          }
        ],
        notifications: [
          {
            id: 'notif_002',
            type: 'assignment',
            recipientId: 'user_002',
            message: 'Your vocabulary word needs revision',
            timestamp: new Date('2024-01-21T15:15:00'),
            read: false,
            actionRequired: true,
            actionURL: '/content/edit/content_002'
          }
        ]
      }
    ];

    mockInstances.forEach(instance => {
      this.workflowInstances.set(instance.id, instance);
    });

    this.updateStatistics();
  }

  // 提交内容进入工作流
  async submitContent(
    contentId: string,
    contentType: ContentTypeWorkflow,
    submitterId: string,
    metadata: {
      title: string;
      description: string;
      tags?: string[];
      complexity?: 'simple' | 'moderate' | 'complex';
    },
    priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium'
  ): Promise<{ success: boolean; instanceId?: string; message: string }> {
    try {
      // 查找适用的工作流定义
      const workflowDef = Array.from(this.workflowDefinitions.values())
        .find(def => def.contentType === contentType && def.isActive);

      if (!workflowDef) {
        return {
          success: false,
          message: `No active workflow found for content type: ${contentType}`
        };
      }

      const instanceId = `instance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // 创建工作流实例
      const instance: WorkflowInstance = {
        id: instanceId,
        workflowDefinitionId: workflowDef.id,
        contentId,
        contentType,
        submitterId,
        currentStatus: WorkflowStatus.SUBMITTED,
        startedAt: new Date(),
        priority,
        metadata: {
          title: metadata.title,
          description: metadata.description,
          tags: metadata.tags || [],
          contentSize: this.calculateContentSize(contentType, metadata),
          complexity: metadata.complexity || 'moderate'
        },
        stepHistory: [],
        notifications: []
      };

      this.workflowInstances.set(instanceId, instance);

      // 开始执行第一个步骤
      await this.executeNextStep(instanceId);

      this.updateStatistics();

      return {
        success: true,
        instanceId,
        message: 'Content submitted successfully and workflow started'
      };
    } catch (error) {
      console.error('Error submitting content to workflow:', error);
      return {
        success: false,
        message: 'Failed to submit content to workflow'
      };
    }
  }

  // 执行审批动作
  async executeApprovalAction(
    instanceId: string,
    stepId: string,
    reviewerId: string,
    action: ApprovalAction,
    comments?: string,
    score?: number
  ): Promise<{ success: boolean; message: string }> {
    try {
      const instance = this.workflowInstances.get(instanceId);
      if (!instance) {
        return { success: false, message: 'Workflow instance not found' };
      }

      const currentStep = instance.stepHistory.find(step => step.stepId === stepId);
      if (!currentStep || currentStep.status !== 'in_progress') {
        return { success: false, message: 'Step not found or not in progress' };
      }

      // 验证审批者权限
      if (!currentStep.assignedTo.includes(reviewerId)) {
        return { success: false, message: 'User not authorized to approve this step' };
      }

      // 更新步骤执行记录
      currentStep.status = 'completed';
      currentStep.completedAt = new Date();
      currentStep.executedBy = reviewerId;
      currentStep.action = action;
      currentStep.comments = comments;
      currentStep.score = score;
      
      if (currentStep.startedAt) {
        currentStep.timeSpent = Math.round(
          (currentStep.completedAt.getTime() - currentStep.startedAt.getTime()) / (1000 * 60)
        );
      }

      // 根据动作确定结果和下一步状态
      switch (action) {
        case ApprovalAction.APPROVE:
          currentStep.result = 'approved';
          await this.executeNextStep(instanceId);
          break;
        
        case ApprovalAction.REJECT:
          currentStep.result = 'rejected';
          instance.currentStatus = WorkflowStatus.REJECTED;
          instance.completedAt = new Date();
          await this.notifySubmitter(instance, 'Content has been rejected');
          break;
        
        case ApprovalAction.REQUEST_REVISION:
          currentStep.result = 'revision_requested';
          instance.currentStatus = WorkflowStatus.NEEDS_REVISION;
          await this.notifySubmitter(instance, 'Content needs revision');
          break;
        
        case ApprovalAction.ESCALATE:
          currentStep.result = 'escalated';
          await this.escalateToNextLevel(instanceId, stepId);
          break;
      }

      this.updateStatistics();

      return { success: true, message: 'Approval action executed successfully' };
    } catch (error) {
      console.error('Error executing approval action:', error);
      return { success: false, message: 'Failed to execute approval action' };
    }
  }

  // 执行下一个步骤
  private async executeNextStep(instanceId: string): Promise<void> {
    const instance = this.workflowInstances.get(instanceId);
    if (!instance) return;

    const workflowDef = this.workflowDefinitions.get(instance.workflowDefinitionId);
    if (!workflowDef) return;

    // 找到下一个需要执行的步骤
    const completedSteps = instance.stepHistory
      .filter(step => step.status === 'completed')
      .map(step => step.stepId);

    const nextStep = workflowDef.steps
      .filter(step => !completedSteps.includes(step.id))
      .sort((a, b) => a.order - b.order)[0];

    if (!nextStep) {
      // 所有步骤完成，工作流结束
      instance.currentStatus = WorkflowStatus.APPROVED;
      instance.completedAt = new Date();
      
      if (workflowDef.rules.autoPublish) {
        instance.currentStatus = WorkflowStatus.PUBLISHED;
        await this.notifySubmitter(instance, 'Content has been published');
      }
      return;
    }

    // 创建步骤执行记录
    const stepExecution: StepExecution = {
      stepId: nextStep.id,
      status: nextStep.autoExecute ? 'completed' : 'in_progress',
      assignedTo: nextStep.autoExecute ? ['system'] : await this.assignReviewers(nextStep),
      startedAt: new Date(),
      action: ApprovalAction.SUBMIT,
      result: 'approved'
    };

    if (nextStep.autoExecute) {
      // 自动执行步骤
      stepExecution.completedAt = new Date();
      stepExecution.executedBy = 'system';
      stepExecution.timeSpent = 1;
      
      // 根据步骤类型执行自动检查
      const autoResult = await this.executeAutoStep(nextStep, instance);
      stepExecution.result = autoResult.success ? 'approved' : 'rejected';
      stepExecution.comments = autoResult.message;

      if (autoResult.success) {
        // 继续下一步
        instance.stepHistory.push(stepExecution);
        await this.executeNextStep(instanceId);
      } else {
        // 自动检查失败
        stepExecution.status = 'failed';
        instance.currentStatus = WorkflowStatus.REJECTED;
        instance.completedAt = new Date();
      }
    } else {
      // 需要人工审批
      instance.currentStepId = nextStep.id;
      instance.currentStatus = WorkflowStatus.UNDER_REVIEW;
      
      // 发送通知给审批者
      await this.notifyReviewers(instance, stepExecution.assignedTo, nextStep);
    }

    instance.stepHistory.push(stepExecution);
  }

  // 自动执行步骤
  private async executeAutoStep(
    step: ApprovalStep,
    instance: WorkflowInstance
  ): Promise<{ success: boolean; message: string }> {
    switch (step.type) {
      case ApprovalStepType.AUTO_CHECK:
        return await this.performAutoQualityCheck(instance);
      
      case ApprovalStepType.FINAL_PUBLISH:
        return await this.performAutoPublish(instance);
      
      default:
        return { success: true, message: 'Auto step completed' };
    }
  }

  // 执行自动质量检查
  private async performAutoQualityCheck(
    instance: WorkflowInstance
  ): Promise<{ success: boolean; message: string }> {
    const issues: string[] = [];

    // 检查标题
    if (!instance.metadata.title || instance.metadata.title.length < 5) {
      issues.push('Title too short');
    }

    // 检查描述
    if (!instance.metadata.description || instance.metadata.description.length < 20) {
      issues.push('Description too short');
    }

    // 检查内容大小
    if (instance.metadata.contentSize < 1) {
      issues.push('Content is empty');
    }

    // 检查标签
    if (!instance.metadata.tags.length) {
      issues.push('No tags provided');
    }

    if (issues.length > 0) {
      return {
        success: false,
        message: `Quality check failed: ${issues.join(', ')}`
      };
    }

    return {
      success: true,
      message: 'All automated quality checks passed'
    };
  }

  // 执行自动发布
  private async performAutoPublish(
    instance: WorkflowInstance
  ): Promise<{ success: boolean; message: string }> {
    // 模拟发布过程
    console.log(`Publishing content: ${instance.contentId}`);
    
    return {
      success: true,
      message: 'Content published successfully'
    };
  }

  // 分配审批者
  private async assignReviewers(step: ApprovalStep): Promise<string[]> {
    // 简化的审批者分配逻辑
    if (step.assignedTo && step.assignedTo.length > 0) {
      return step.assignedTo;
    }

    // 根据角色分配
    const mockReviewers = {
      'reviewer': ['reviewer_001', 'reviewer_002', 'reviewer_003'],
      'expert': ['expert_001', 'expert_002'],
      'educator': ['educator_001'],
      'admin': ['admin_001', 'admin_002'],
      'moderator': ['moderator_001']
    };

    if (step.roleRequired && step.roleRequired.length > 0) {
      const availableReviewers = step.roleRequired.flatMap(role => 
        mockReviewers[role as keyof typeof mockReviewers] || []
      );
      
      // 随机选择1-2个审批者
      const selectedCount = Math.min(2, availableReviewers.length);
      const shuffled = availableReviewers.sort(() => 0.5 - Math.random());
      return shuffled.slice(0, selectedCount);
    }

    return ['default_reviewer'];
  }

  // 通知审批者
  private async notifyReviewers(
    instance: WorkflowInstance,
    reviewerIds: string[],
    step: ApprovalStep
  ): Promise<void> {
    for (const reviewerId of reviewerIds) {
      const notification: WorkflowNotification = {
        id: `notif_${Date.now()}_${reviewerId}`,
        type: 'assignment',
        recipientId: reviewerId,
        message: `New ${step.name.toLowerCase()} assignment: ${instance.metadata.title}`,
        timestamp: new Date(),
        read: false,
        actionRequired: true,
        actionURL: `/admin/review/${instance.id}`
      };

      instance.notifications.push(notification);
    }
  }

  // 通知提交者
  private async notifySubmitter(instance: WorkflowInstance, message: string): Promise<void> {
    const notification: WorkflowNotification = {
      id: `notif_${Date.now()}_submitter`,
      type: 'completion',
      recipientId: instance.submitterId,
      message: `${instance.metadata.title}: ${message}`,
      timestamp: new Date(),
      read: false,
      actionRequired: false
    };

    instance.notifications.push(notification);
  }

  // 升级到下一级别
  private async escalateToNextLevel(instanceId: string, stepId: string): Promise<void> {
    const instance = this.workflowInstances.get(instanceId);
    if (!instance) return;

    const workflowDef = this.workflowDefinitions.get(instance.workflowDefinitionId);
    if (!workflowDef) return;

    // 升级到管理员
    const escalationReviewers = workflowDef.rules.escalationRules.escalateTo;
    
    const escalationNotification: WorkflowNotification = {
      id: `notif_escalation_${Date.now()}`,
      type: 'escalation',
      recipientId: escalationReviewers[0],
      message: `Workflow escalated: ${instance.metadata.title} requires immediate attention`,
      timestamp: new Date(),
      read: false,
      actionRequired: true,
      actionURL: `/admin/review/${instanceId}`
    };

    instance.notifications.push(escalationNotification);
    instance.priority = 'urgent';
  }

  // 计算内容大小
  private calculateContentSize(contentType: ContentTypeWorkflow, metadata: any): number {
    switch (contentType) {
      case ContentTypeWorkflow.VOCABULARY_COLLECTION:
        return metadata.wordCount || 100;
      case ContentTypeWorkflow.VOCABULARY_WORD:
        return 1;
      case ContentTypeWorkflow.LEARNING_MATERIAL:
        return metadata.pageCount || 10;
      default:
        return 1;
    }
  }

  // 获取工作流实例
  async getWorkflowInstance(instanceId: string): Promise<WorkflowInstance | null> {
    return this.workflowInstances.get(instanceId) || null;
  }

  // 获取用户的工作流实例
  async getUserWorkflowInstances(
    userId: string,
    filters: {
      status?: WorkflowStatus;
      contentType?: ContentTypeWorkflow;
      role?: 'submitter' | 'reviewer';
    } = {}
  ): Promise<WorkflowInstance[]> {
    const instances = Array.from(this.workflowInstances.values());
    
    return instances.filter(instance => {
      // 角色过滤
      if (filters.role === 'submitter' && instance.submitterId !== userId) return false;
      if (filters.role === 'reviewer') {
        const hasAssignment = instance.stepHistory.some(step => 
          step.assignedTo.includes(userId) && step.status === 'in_progress'
        );
        if (!hasAssignment) return false;
      }

      // 状态过滤
      if (filters.status && instance.currentStatus !== filters.status) return false;
      
      // 内容类型过滤
      if (filters.contentType && instance.contentType !== filters.contentType) return false;

      return true;
    }).sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
  }

  // 获取工作流统计
  async getWorkflowStatistics(): Promise<WorkflowStatistics> {
    if (!this.statistics) {
      this.updateStatistics();
    }
    return this.statistics!;
  }

  // 更新统计信息
  private updateStatistics(): void {
    const instances = Array.from(this.workflowInstances.values());
    const completedInstances = instances.filter(i => i.completedAt);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 计算完成时间
    const completionTimes = completedInstances
      .filter(i => i.completedAt && i.startedAt)
      .map(i => (i.completedAt!.getTime() - i.startedAt.getTime()) / (1000 * 60 * 60));

    const averageCompletionTime = completionTimes.length > 0
      ? completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length
      : 0;

    // 计算审批率
    const approvedInstances = instances.filter(i => 
      i.currentStatus === WorkflowStatus.APPROVED || 
      i.currentStatus === WorkflowStatus.PUBLISHED
    );
    const approvalRate = instances.length > 0 
      ? (approvedInstances.length / instances.length) * 100 
      : 0;

    // 内容类型分析
    const contentTypeBreakdown = {} as WorkflowStatistics['contentTypeBreakdown'];
    Object.values(ContentTypeWorkflow).forEach(type => {
      const typeInstances = instances.filter(i => i.contentType === type);
      contentTypeBreakdown[type] = {
        submitted: typeInstances.length,
        approved: typeInstances.filter(i => 
          i.currentStatus === WorkflowStatus.APPROVED || 
          i.currentStatus === WorkflowStatus.PUBLISHED
        ).length,
        rejected: typeInstances.filter(i => i.currentStatus === WorkflowStatus.REJECTED).length,
        pending: typeInstances.filter(i => 
          i.currentStatus === WorkflowStatus.SUBMITTED ||
          i.currentStatus === WorkflowStatus.UNDER_REVIEW ||
          i.currentStatus === WorkflowStatus.NEEDS_REVISION
        ).length
      };
    });

    this.statistics = {
      totalInstances: instances.length,
      activeInstances: instances.filter(i => !i.completedAt).length,
      completedToday: completedInstances.filter(i => 
        i.completedAt && i.completedAt >= today
      ).length,
      averageCompletionTime: Math.round(averageCompletionTime * 10) / 10,
      approvalRate: Math.round(approvalRate * 10) / 10,
      bottleneckSteps: [], // 简化版本
      performanceByReviewer: [], // 简化版本
      contentTypeBreakdown
    };
  }

  // 获取用户通知
  async getUserNotifications(userId: string, unreadOnly: boolean = false): Promise<WorkflowNotification[]> {
    const allNotifications: WorkflowNotification[] = [];
    
    Array.from(this.workflowInstances.values()).forEach(instance => {
      const userNotifications = instance.notifications.filter(notif => 
        notif.recipientId === userId && (!unreadOnly || !notif.read)
      );
      allNotifications.push(...userNotifications);
    });

    return allNotifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // 标记通知为已读
  async markNotificationAsRead(notificationId: string): Promise<{ success: boolean; message: string }> {
    for (const instance of this.workflowInstances.values()) {
      const notification = instance.notifications.find(n => n.id === notificationId);
      if (notification) {
        notification.read = true;
        return { success: true, message: 'Notification marked as read' };
      }
    }
    
    return { success: false, message: 'Notification not found' };
  }
}

export const contentApprovalWorkflowService = new ContentApprovalWorkflowService();