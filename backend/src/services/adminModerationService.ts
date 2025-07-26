import { ObjectId } from 'mongodb';

// 内容状态枚举
export enum ContentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  FLAGGED = 'flagged',
  UNDER_REVIEW = 'under_review'
}

// 内容类型枚举
export enum ContentType {
  VOCABULARY_COLLECTION = 'vocabulary_collection',
  VOCABULARY_WORD = 'vocabulary_word',
  USER_SUBMISSION = 'user_submission',
  COMMENT = 'comment',
  REVIEW = 'review'
}

// 审核动作枚举
export enum ModerationAction {
  APPROVE = 'approve',
  REJECT = 'reject',
  FLAG = 'flag',
  DELETE = 'delete',
  EDIT = 'edit',
  WARN_USER = 'warn_user',
  SUSPEND_USER = 'suspend_user'
}

// 举报原因枚举
export enum ReportReason {
  INAPPROPRIATE_CONTENT = 'inappropriate_content',
  SPAM = 'spam',
  COPYRIGHT_VIOLATION = 'copyright_violation',
  INCORRECT_INFORMATION = 'incorrect_information',
  OFFENSIVE_LANGUAGE = 'offensive_language',
  OTHER = 'other'
}

// 内容审核项接口
export interface ModerationItem {
  id: string;
  contentId: string;
  contentType: ContentType;
  content: any;
  authorId: string;
  authorInfo: {
    username: string;
    email: string;
    registrationDate: Date;
    previousViolations: number;
  };
  status: ContentStatus;
  priority: 'low' | 'medium' | 'high' | 'critical';
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  moderatorNotes?: string;
  autoFlagReason?: string;
  reportCount: number;
  reports: ModerationReport[];
}

// 举报接口
export interface ModerationReport {
  id: string;
  reporterId: string;
  reason: ReportReason;
  description: string;
  reportedAt: Date;
  reviewed: boolean;
}

// 审核历史接口
export interface ModerationHistory {
  id: string;
  contentId: string;
  moderatorId: string;
  action: ModerationAction;
  reason: string;
  timestamp: Date;
  previousStatus: ContentStatus;
  newStatus: ContentStatus;
}

// 用户违规记录接口
export interface UserViolation {
  id: string;
  userId: string;
  violationType: string;
  description: string;
  severity: 'minor' | 'moderate' | 'major' | 'severe';
  timestamp: Date;
  moderatorId: string;
  action: ModerationAction;
}

// 管理员统计接口
export interface ModerationStats {
  totalPending: number;
  totalReviewed: number;
  totalFlagged: number;
  reviewedToday: number;
  averageReviewTime: number;
  contentBreakdown: {
    [key in ContentType]: {
      pending: number;
      approved: number;
      rejected: number;
      flagged: number;
    };
  };
  moderatorActivity: {
    moderatorId: string;
    reviewsToday: number;
    averageTime: number;
  }[];
}

export class AdminModerationService {
  private moderationItems: Map<string, ModerationItem> = new Map();
  private moderationHistory: ModerationHistory[] = [];
  private userViolations: Map<string, UserViolation[]> = new Map();
  private moderationStats: ModerationStats | null = null;

  constructor() {
    this.initializeMockData();
  }

  // 初始化模拟数据
  private initializeMockData(): void {
    const mockItems: ModerationItem[] = [
      {
        id: 'mod_001',
        contentId: 'vocab_001',
        contentType: ContentType.VOCABULARY_COLLECTION,
        content: {
          name: 'Advanced Business Terms',
          description: 'Professional vocabulary for business communication',
          words: 150,
          isPublic: true
        },
        authorId: 'user_001',
        authorInfo: {
          username: 'john_learner',
          email: 'john@example.com',
          registrationDate: new Date('2024-01-15'),
          previousViolations: 0
        },
        status: ContentStatus.PENDING,
        priority: 'medium',
        submittedAt: new Date('2024-01-20T10:30:00'),
        reportCount: 0,
        reports: []
      },
      {
        id: 'mod_002',
        contentId: 'vocab_002',
        contentType: ContentType.VOCABULARY_WORD,
        content: {
          word: 'inappropriate_term',
          definition: 'This contains offensive content',
          examples: ['Inappropriate example']
        },
        authorId: 'user_002',
        authorInfo: {
          username: 'problematic_user',
          email: 'problem@example.com',
          registrationDate: new Date('2024-01-10'),
          previousViolations: 2
        },
        status: ContentStatus.FLAGGED,
        priority: 'high',
        submittedAt: new Date('2024-01-21T14:15:00'),
        autoFlagReason: 'Inappropriate language detected',
        reportCount: 3,
        reports: [
          {
            id: 'report_001',
            reporterId: 'user_003',
            reason: ReportReason.OFFENSIVE_LANGUAGE,
            description: 'Contains inappropriate language',
            reportedAt: new Date('2024-01-21T15:00:00'),
            reviewed: false
          }
        ]
      },
      {
        id: 'mod_003',
        contentId: 'collection_003',
        contentType: ContentType.VOCABULARY_COLLECTION,
        content: {
          name: 'TOEFL Preparation Set',
          description: 'Comprehensive TOEFL vocabulary with examples',
          words: 500,
          isPublic: true
        },
        authorId: 'user_004',
        authorInfo: {
          username: 'teacher_mike',
          email: 'mike@school.edu',
          registrationDate: new Date('2023-12-01'),
          previousViolations: 0
        },
        status: ContentStatus.UNDER_REVIEW,
        priority: 'low',
        submittedAt: new Date('2024-01-19T09:00:00'),
        reportCount: 1,
        reports: [
          {
            id: 'report_002',
            reporterId: 'user_005',
            reason: ReportReason.COPYRIGHT_VIOLATION,
            description: 'May contain copyrighted material from ETS',
            reportedAt: new Date('2024-01-20T11:30:00'),
            reviewed: true
          }
        ]
      }
    ];

    mockItems.forEach(item => {
      this.moderationItems.set(item.id, item);
    });

    // 初始化统计数据
    this.updateStats();
  }

  // 获取待审核内容列表
  async getPendingItems(
    filters: {
      contentType?: ContentType;
      priority?: string;
      status?: ContentStatus;
      authorId?: string;
    } = {},
    pagination: { page: number; limit: number } = { page: 1, limit: 20 }
  ): Promise<{ items: ModerationItem[]; total: number; hasMore: boolean }> {
    let items = Array.from(this.moderationItems.values());

    // 应用过滤器
    if (filters.contentType) {
      items = items.filter(item => item.contentType === filters.contentType);
    }
    if (filters.priority) {
      items = items.filter(item => item.priority === filters.priority);
    }
    if (filters.status) {
      items = items.filter(item => item.status === filters.status);
    }
    if (filters.authorId) {
      items = items.filter(item => item.authorId === filters.authorId);
    }

    // 按优先级和提交时间排序
    items.sort((a, b) => {
      const priorityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.submittedAt.getTime() - a.submittedAt.getTime();
    });

    const total = items.length;
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    const paginatedItems = items.slice(startIndex, endIndex);

    return {
      items: paginatedItems,
      total,
      hasMore: endIndex < total
    };
  }

  // 审核内容
  async moderateContent(
    itemId: string,
    moderatorId: string,
    action: ModerationAction,
    reason: string,
    notes?: string
  ): Promise<{ success: boolean; message: string }> {
    const item = this.moderationItems.get(itemId);
    if (!item) {
      return { success: false, message: 'Moderation item not found' };
    }

    const previousStatus = item.status;
    let newStatus: ContentStatus;

    // 根据动作确定新状态
    switch (action) {
      case ModerationAction.APPROVE:
        newStatus = ContentStatus.APPROVED;
        break;
      case ModerationAction.REJECT:
        newStatus = ContentStatus.REJECTED;
        break;
      case ModerationAction.FLAG:
        newStatus = ContentStatus.FLAGGED;
        break;
      case ModerationAction.DELETE:
        // 删除内容
        this.moderationItems.delete(itemId);
        break;
      default:
        newStatus = ContentStatus.UNDER_REVIEW;
    }

    // 更新审核项
    if (action !== ModerationAction.DELETE) {
      item.status = newStatus;
      item.reviewedAt = new Date();
      item.reviewedBy = moderatorId;
      item.moderatorNotes = notes;
    }

    // 记录审核历史
    const historyEntry: ModerationHistory = {
      id: `history_${Date.now()}`,
      contentId: item.contentId,
      moderatorId,
      action,
      reason,
      timestamp: new Date(),
      previousStatus,
      newStatus: action === ModerationAction.DELETE ? previousStatus : newStatus
    };
    this.moderationHistory.push(historyEntry);

    // 如果需要对用户采取行动
    if ([ModerationAction.WARN_USER, ModerationAction.SUSPEND_USER].includes(action)) {
      await this.recordUserViolation(item.authorId, action, reason, moderatorId);
    }

    // 更新统计
    this.updateStats();

    return { success: true, message: 'Content moderated successfully' };
  }

  // 记录用户违规
  private async recordUserViolation(
    userId: string,
    action: ModerationAction,
    reason: string,
    moderatorId: string
  ): Promise<void> {
    const violation: UserViolation = {
      id: `violation_${Date.now()}`,
      userId,
      violationType: action === ModerationAction.WARN_USER ? 'warning' : 'suspension',
      description: reason,
      severity: action === ModerationAction.WARN_USER ? 'moderate' : 'major',
      timestamp: new Date(),
      moderatorId,
      action
    };

    if (!this.userViolations.has(userId)) {
      this.userViolations.set(userId, []);
    }
    this.userViolations.get(userId)!.push(violation);
  }

  // 获取用户违规历史
  async getUserViolations(userId: string): Promise<UserViolation[]> {
    return this.userViolations.get(userId) || [];
  }

  // 批量审核
  async bulkModerate(
    itemIds: string[],
    moderatorId: string,
    action: ModerationAction,
    reason: string
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const itemId of itemIds) {
      try {
        const result = await this.moderateContent(itemId, moderatorId, action, reason);
        if (result.success) {
          success++;
        } else {
          failed++;
          errors.push(`${itemId}: ${result.message}`);
        }
      } catch (error) {
        failed++;
        errors.push(`${itemId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return { success, failed, errors };
  }

  // 获取审核统计
  async getModerationStats(): Promise<ModerationStats> {
    if (!this.moderationStats) {
      this.updateStats();
    }
    return this.moderationStats!;
  }

  // 更新统计信息
  private updateStats(): void {
    const items = Array.from(this.moderationItems.values());
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalPending = items.filter(item => item.status === ContentStatus.PENDING).length;
    const totalFlagged = items.filter(item => item.status === ContentStatus.FLAGGED).length;
    const reviewedItems = items.filter(item => item.reviewedAt);
    const reviewedToday = reviewedItems.filter(item => 
      item.reviewedAt && item.reviewedAt >= today
    ).length;

    // 计算平均审核时间
    const reviewTimes = reviewedItems
      .filter(item => item.reviewedAt && item.submittedAt)
      .map(item => item.reviewedAt!.getTime() - item.submittedAt.getTime());
    const averageReviewTime = reviewTimes.length > 0 
      ? reviewTimes.reduce((sum, time) => sum + time, 0) / reviewTimes.length 
      : 0;

    // 内容类型分析
    const contentBreakdown = {} as ModerationStats['contentBreakdown'];
    Object.values(ContentType).forEach(type => {
      const typeItems = items.filter(item => item.contentType === type);
      contentBreakdown[type] = {
        pending: typeItems.filter(item => item.status === ContentStatus.PENDING).length,
        approved: typeItems.filter(item => item.status === ContentStatus.APPROVED).length,
        rejected: typeItems.filter(item => item.status === ContentStatus.REJECTED).length,
        flagged: typeItems.filter(item => item.status === ContentStatus.FLAGGED).length
      };
    });

    this.moderationStats = {
      totalPending,
      totalReviewed: reviewedItems.length,
      totalFlagged,
      reviewedToday,
      averageReviewTime: Math.round(averageReviewTime / (1000 * 60)), // 转换为分钟
      contentBreakdown,
      moderatorActivity: [] // 简化版本，实际应用中需要跟踪审核员活动
    };
  }

  // 获取审核历史
  async getModerationHistory(
    filters: {
      contentId?: string;
      moderatorId?: string;
      action?: ModerationAction;
      dateFrom?: Date;
      dateTo?: Date;
    } = {},
    pagination: { page: number; limit: number } = { page: 1, limit: 50 }
  ): Promise<{ history: ModerationHistory[]; total: number }> {
    let history = [...this.moderationHistory];

    // 应用过滤器
    if (filters.contentId) {
      history = history.filter(h => h.contentId === filters.contentId);
    }
    if (filters.moderatorId) {
      history = history.filter(h => h.moderatorId === filters.moderatorId);
    }
    if (filters.action) {
      history = history.filter(h => h.action === filters.action);
    }
    if (filters.dateFrom) {
      history = history.filter(h => h.timestamp >= filters.dateFrom!);
    }
    if (filters.dateTo) {
      history = history.filter(h => h.timestamp <= filters.dateTo!);
    }

    // 按时间倒序排序
    history.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    const total = history.length;
    const startIndex = (pagination.page - 1) * pagination.limit;
    const paginatedHistory = history.slice(startIndex, startIndex + pagination.limit);

    return { history: paginatedHistory, total };
  }

  // 自动标记可疑内容
  async autoFlagContent(): Promise<{ flagged: number; reasons: string[] }> {
    const items = Array.from(this.moderationItems.values())
      .filter(item => item.status === ContentStatus.PENDING);

    let flagged = 0;
    const reasons: string[] = [];

    for (const item of items) {
      const flagReason = this.detectInappropriateContent(item.content);
      if (flagReason) {
        item.status = ContentStatus.FLAGGED;
        item.autoFlagReason = flagReason;
        item.priority = 'high';
        flagged++;
        reasons.push(flagReason);
      }
    }

    if (flagged > 0) {
      this.updateStats();
    }

    return { flagged, reasons };
  }

  // 检测不当内容
  private detectInappropriateContent(content: any): string | null {
    const inappropriateWords = ['inappropriate', 'offensive', 'spam', 'copyright'];
    const contentStr = JSON.stringify(content).toLowerCase();

    for (const word of inappropriateWords) {
      if (contentStr.includes(word)) {
        return `Potential ${word} content detected`;
      }
    }

    return null;
  }
}

export const adminModerationService = new AdminModerationService();