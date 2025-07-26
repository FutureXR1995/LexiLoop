import { ObjectId } from 'mongodb';

// 用户行为事件类型
export enum UserBehaviorEvent {
  LOGIN = 'login',
  LOGOUT = 'logout',
  VOCABULARY_SEARCH = 'vocabulary_search',
  VOCABULARY_VIEW = 'vocabulary_view',
  VOCABULARY_LEARN = 'vocabulary_learn',
  TEST_START = 'test_start',
  TEST_COMPLETE = 'test_complete',
  CONTENT_CREATE = 'content_create',
  CONTENT_EDIT = 'content_edit',
  CONTENT_DELETE = 'content_delete',
  CONTENT_SHARE = 'content_share',
  COMMENT_POST = 'comment_post',
  PROFILE_UPDATE = 'profile_update',
  SUBSCRIPTION_CHANGE = 'subscription_change',
  ERROR_ENCOUNTER = 'error_encounter',
  PAGE_VIEW = 'page_view',
  FEATURE_USE = 'feature_use'
}

// 用户行为严重性等级
export enum BehaviorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  SUSPICIOUS = 'suspicious',
  CRITICAL = 'critical'
}

// 用户行为记录接口
export interface UserBehaviorRecord {
  id: string;
  userId: string;
  userInfo: {
    username: string;
    email: string;
    accountCreated: Date;
    lastActive: Date;
  };
  event: UserBehaviorEvent;
  severity: BehaviorSeverity;
  timestamp: Date;
  metadata: {
    ip: string;
    userAgent: string;
    location?: {
      country: string;
      city: string;
      coordinates?: [number, number];
    };
    device: {
      type: 'desktop' | 'mobile' | 'tablet';
      os: string;
      browser: string;
    };
    sessionId: string;
    duration?: number; // 持续时间（毫秒）
  };
  details: any; // 具体事件数据
  flags: string[]; // 自动标记的异常行为
  reviewed: boolean;
  reviewedBy?: string;
  reviewedAt?: Date;
  notes?: string;
}

// 用户会话信息
export interface UserSession {
  sessionId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  deviceInfo: {
    type: 'desktop' | 'mobile' | 'tablet';
    os: string;
    browser: string;
    ip: string;
    location?: string;
  };
  activities: UserBehaviorEvent[];
  isActive: boolean;
  totalActions: number;
  suspiciousActivity: boolean;
}

// 用户行为模式
export interface UserBehaviorPattern {
  userId: string;
  period: {
    start: Date;
    end: Date;
  };
  statistics: {
    totalSessions: number;
    totalActivities: number;
    averageSessionDuration: number;
    mostActiveHour: number;
    mostCommonDevice: string;
    uniqueIPs: number;
    suspiciousActivities: number;
  };
  patterns: {
    activityFrequency: { [key in UserBehaviorEvent]?: number };
    timeDistribution: { [hour: number]: number };
    locationDistribution: { [location: string]: number };
    deviceDistribution: { [device: string]: number };
  };
  anomalies: {
    type: string;
    description: string;
    severity: BehaviorSeverity;
    detectedAt: Date;
    count: number;
  }[];
}

// 实时监控指标
export interface MonitoringMetrics {
  activeUsers: number;
  activeSessions: number;
  recentActivities: number;
  suspiciousActivities: number;
  topActivities: { event: UserBehaviorEvent; count: number }[];
  topDevices: { device: string; count: number }[];
  topLocations: { location: string; count: number }[];
  alerts: {
    type: string;
    message: string;
    severity: BehaviorSeverity;
    timestamp: Date;
    userId?: string;
  }[];
}

export class UserBehaviorMonitoringService {
  private behaviorRecords: Map<string, UserBehaviorRecord> = new Map();
  private activeSessions: Map<string, UserSession> = new Map();
  private userPatterns: Map<string, UserBehaviorPattern> = new Map();
  private monitoringMetrics: MonitoringMetrics;

  constructor() {
    this.monitoringMetrics = {
      activeUsers: 0,
      activeSessions: 0,
      recentActivities: 0,
      suspiciousActivities: 0,
      topActivities: [],
      topDevices: [],
      topLocations: [],
      alerts: []
    };
    this.initializeMockData();
    this.startRealTimeMonitoring();
  }

  // 初始化模拟数据
  private initializeMockData(): void {
    const mockRecords: UserBehaviorRecord[] = [
      {
        id: 'behavior_001',
        userId: 'user_001',
        userInfo: {
          username: 'john_learner',
          email: 'john@example.com',
          accountCreated: new Date('2024-01-15'),
          lastActive: new Date()
        },
        event: UserBehaviorEvent.LOGIN,
        severity: BehaviorSeverity.INFO,
        timestamp: new Date(),
        metadata: {
          ip: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          location: {
            country: 'United States',
            city: 'New York'
          },
          device: {
            type: 'desktop',
            os: 'Windows 10',
            browser: 'Chrome'
          },
          sessionId: 'session_001'
        },
        details: {
          loginMethod: 'email',
          rememberMe: true
        },
        flags: [],
        reviewed: false
      },
      {
        id: 'behavior_002',
        userId: 'user_002',
        userInfo: {
          username: 'suspicious_user',
          email: 'suspicious@example.com',
          accountCreated: new Date('2024-01-20'),
          lastActive: new Date()
        },
        event: UserBehaviorEvent.VOCABULARY_SEARCH,
        severity: BehaviorSeverity.SUSPICIOUS,
        timestamp: new Date(Date.now() - 3600000),
        metadata: {
          ip: '10.0.0.1',
          userAgent: 'curl/7.68.0',
          device: {
            type: 'desktop',
            os: 'Linux',
            browser: 'Unknown'
          },
          sessionId: 'session_002'
        },
        details: {
          searchQuery: 'automated_query_123',
          resultsCount: 1000,
          rapidRequests: true
        },
        flags: ['rapid_requests', 'automated_behavior', 'unusual_user_agent'],
        reviewed: false
      },
      {
        id: 'behavior_003',
        userId: 'user_003',
        userInfo: {
          username: 'student_mary',
          email: 'mary@student.edu',
          accountCreated: new Date('2023-12-01'),
          lastActive: new Date()
        },
        event: UserBehaviorEvent.TEST_COMPLETE,
        severity: BehaviorSeverity.INFO,
        timestamp: new Date(Date.now() - 1800000),
        metadata: {
          ip: '203.0.113.50',
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)',
          location: {
            country: 'Canada',
            city: 'Toronto'
          },
          device: {
            type: 'mobile',
            os: 'iOS 14.7.1',
            browser: 'Safari'
          },
          sessionId: 'session_003',
          duration: 1200000
        },
        details: {
          testType: 'vocabulary_quiz',
          score: 85,
          timeSpent: 20,
          questionsAnswered: 50
        },
        flags: [],
        reviewed: false
      }
    ];

    mockRecords.forEach(record => {
      this.behaviorRecords.set(record.id, record);
    });

    // 初始化活跃会话
    const mockSessions: UserSession[] = [
      {
        sessionId: 'session_001',
        userId: 'user_001',
        startTime: new Date(Date.now() - 7200000),
        deviceInfo: {
          type: 'desktop',
          os: 'Windows 10',
          browser: 'Chrome',
          ip: '192.168.1.100',
          location: 'New York, US'
        },
        activities: [UserBehaviorEvent.LOGIN, UserBehaviorEvent.VOCABULARY_SEARCH, UserBehaviorEvent.VOCABULARY_LEARN],
        isActive: true,
        totalActions: 15,
        suspiciousActivity: false
      },
      {
        sessionId: 'session_002',
        userId: 'user_002',
        startTime: new Date(Date.now() - 3600000),
        deviceInfo: {
          type: 'desktop',
          os: 'Linux',
          browser: 'Unknown',
          ip: '10.0.0.1',
          location: 'Unknown'
        },
        activities: [UserBehaviorEvent.VOCABULARY_SEARCH],
        isActive: true,
        totalActions: 100,
        suspiciousActivity: true
      }
    ];

    mockSessions.forEach(session => {
      this.activeSessions.set(session.sessionId, session);
    });

    this.updateMetrics();
  }

  // 记录用户行为
  async recordBehavior(
    userId: string,
    event: UserBehaviorEvent,
    details: any,
    metadata: {
      ip: string;
      userAgent: string;
      sessionId: string;
      [key: string]: any;
    }
  ): Promise<UserBehaviorRecord> {
    const recordId = `behavior_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 获取用户信息
    const userInfo = await this.getUserInfo(userId);
    
    // 解析设备信息
    const deviceInfo = this.parseDeviceInfo(metadata.userAgent);
    
    // 检测异常行为
    const flags = await this.detectAnomalies(userId, event, details, metadata);
    
    // 确定严重性等级
    const severity = this.calculateSeverity(flags, event, details);

    const record: UserBehaviorRecord = {
      id: recordId,
      userId,
      userInfo,
      event,
      severity,
      timestamp: new Date(),
      metadata: {
        ...metadata,
        device: deviceInfo,
        location: await this.getLocationFromIP(metadata.ip)
      },
      details,
      flags,
      reviewed: false
    };

    this.behaviorRecords.set(recordId, record);
    
    // 更新会话信息
    await this.updateSession(metadata.sessionId, userId, event, deviceInfo);
    
    // 更新用户行为模式
    await this.updateUserPattern(userId, record);
    
    // 更新实时指标
    this.updateMetrics();
    
    // 如果是可疑行为，发送警报
    if (severity === BehaviorSeverity.SUSPICIOUS || severity === BehaviorSeverity.CRITICAL) {
      await this.sendAlert(record);
    }

    return record;
  }

  // 获取用户信息
  private async getUserInfo(userId: string): Promise<UserBehaviorRecord['userInfo']> {
    // 模拟数据库查询
    const mockUserData = {
      'user_001': {
        username: 'john_learner',
        email: 'john@example.com',
        accountCreated: new Date('2024-01-15'),
        lastActive: new Date()
      },
      'user_002': {
        username: 'suspicious_user',
        email: 'suspicious@example.com',
        accountCreated: new Date('2024-01-20'),
        lastActive: new Date()
      },
      'user_003': {
        username: 'student_mary',
        email: 'mary@student.edu',
        accountCreated: new Date('2023-12-01'),
        lastActive: new Date()
      }
    };

    return mockUserData[userId as keyof typeof mockUserData] || {
      username: 'unknown_user',
      email: 'unknown@example.com',
      accountCreated: new Date(),
      lastActive: new Date()
    };
  }

  // 解析设备信息
  private parseDeviceInfo(userAgent: string): UserBehaviorRecord['metadata']['device'] {
    // 简化的用户代理解析
    const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent);
    const isTablet = /iPad|Tablet/.test(userAgent);
    
    let deviceType: 'desktop' | 'mobile' | 'tablet' = 'desktop';
    if (isTablet) deviceType = 'tablet';
    else if (isMobile) deviceType = 'mobile';

    let os = 'Unknown';
    if (/Windows NT/.test(userAgent)) os = 'Windows';
    else if (/Mac OS X/.test(userAgent)) os = 'macOS';
    else if (/Linux/.test(userAgent)) os = 'Linux';
    else if (/Android/.test(userAgent)) os = 'Android';
    else if (/iPhone OS/.test(userAgent)) os = 'iOS';

    let browser = 'Unknown';
    if (/Chrome/.test(userAgent)) browser = 'Chrome';
    else if (/Firefox/.test(userAgent)) browser = 'Firefox';
    else if (/Safari/.test(userAgent) && !/Chrome/.test(userAgent)) browser = 'Safari';
    else if (/Edge/.test(userAgent)) browser = 'Edge';

    return { type: deviceType, os, browser };
  }

  // 获取IP位置信息
  private async getLocationFromIP(ip: string): Promise<UserBehaviorRecord['metadata']['location']> {
    // 模拟地理位置查询
    const mockLocations = {
      '192.168.1.100': { country: 'United States', city: 'New York' },
      '10.0.0.1': { country: 'Unknown', city: 'Unknown' },
      '203.0.113.50': { country: 'Canada', city: 'Toronto' }
    };

    return mockLocations[ip as keyof typeof mockLocations] || {
      country: 'Unknown',
      city: 'Unknown'
    };
  }

  // 检测异常行为
  private async detectAnomalies(
    userId: string,
    event: UserBehaviorEvent,
    details: any,
    metadata: any
  ): Promise<string[]> {
    const flags: string[] = [];

    // 1. 检测自动化行为
    if (metadata.userAgent && (
      metadata.userAgent.includes('curl') ||
      metadata.userAgent.includes('wget') ||
      metadata.userAgent.includes('bot')
    )) {
      flags.push('automated_behavior');
    }

    // 2. 检测异常频率
    const recentRecords = Array.from(this.behaviorRecords.values())
      .filter(r => r.userId === userId && Date.now() - r.timestamp.getTime() < 60000);
    
    if (recentRecords.length > 10) {
      flags.push('rapid_requests');
    }

    // 3. 检测异常时间
    const hour = new Date().getHours();
    if (hour < 6 || hour > 23) {
      flags.push('unusual_time');
    }

    // 4. 检测异常IP变化
    const userRecords = Array.from(this.behaviorRecords.values())
      .filter(r => r.userId === userId)
      .slice(-10);
    
    const uniqueIPs = new Set(userRecords.map(r => r.metadata.ip));
    if (uniqueIPs.size > 3) {
      flags.push('multiple_ips');
    }

    // 5. 检测异常内容操作
    if (event === UserBehaviorEvent.CONTENT_CREATE && details.rapidCreation) {
      flags.push('rapid_content_creation');
    }

    // 6. 检测异常搜索行为
    if (event === UserBehaviorEvent.VOCABULARY_SEARCH && details.resultsCount > 500) {
      flags.push('bulk_data_access');
    }

    return flags;
  }

  // 计算严重性等级
  private calculateSeverity(flags: string[], event: UserBehaviorEvent, details: any): BehaviorSeverity {
    if (flags.length === 0) return BehaviorSeverity.INFO;
    
    const criticalFlags = ['automated_behavior', 'bulk_data_access', 'rapid_content_creation'];
    const suspiciousFlags = ['rapid_requests', 'multiple_ips', 'unusual_time'];
    
    if (flags.some(flag => criticalFlags.includes(flag))) {
      return BehaviorSeverity.CRITICAL;
    }
    
    if (flags.some(flag => suspiciousFlags.includes(flag)) || flags.length >= 2) {
      return BehaviorSeverity.SUSPICIOUS;
    }
    
    return BehaviorSeverity.WARNING;
  }

  // 更新会话信息
  private async updateSession(
    sessionId: string,
    userId: string,
    event: UserBehaviorEvent,
    deviceInfo: any
  ): Promise<void> {
    let session = this.activeSessions.get(sessionId);
    
    if (!session) {
      session = {
        sessionId,
        userId,
        startTime: new Date(),
        deviceInfo: {
          ...deviceInfo,
          ip: '0.0.0.0',
          location: 'Unknown'
        },
        activities: [],
        isActive: true,
        totalActions: 0,
        suspiciousActivity: false
      };
    }

    session.activities.push(event);
    session.totalActions++;
    session.isActive = true;

    // 检测可疑会话活动
    if (session.totalActions > 50 || session.activities.length > 100) {
      session.suspiciousActivity = true;
    }

    this.activeSessions.set(sessionId, session);
  }

  // 更新用户行为模式
  private async updateUserPattern(userId: string, record: UserBehaviorRecord): Promise<void> {
    const now = new Date();
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    let pattern = this.userPatterns.get(userId);
    
    if (!pattern) {
      pattern = {
        userId,
        period: { start: weekStart, end: now },
        statistics: {
          totalSessions: 0,
          totalActivities: 0,
          averageSessionDuration: 0,
          mostActiveHour: 0,
          mostCommonDevice: '',
          uniqueIPs: 0,
          suspiciousActivities: 0
        },
        patterns: {
          activityFrequency: {},
          timeDistribution: {},
          locationDistribution: {},
          deviceDistribution: {}
        },
        anomalies: []
      };
    }

    // 更新活动频率
    pattern.patterns.activityFrequency[record.event] = 
      (pattern.patterns.activityFrequency[record.event] || 0) + 1;

    // 更新时间分布
    const hour = record.timestamp.getHours();
    pattern.patterns.timeDistribution[hour] = 
      (pattern.patterns.timeDistribution[hour] || 0) + 1;

    // 更新设备分布
    const device = record.metadata.device.type;
    pattern.patterns.deviceDistribution[device] = 
      (pattern.patterns.deviceDistribution[device] || 0) + 1;

    // 更新统计信息
    pattern.statistics.totalActivities++;
    if (record.severity === BehaviorSeverity.SUSPICIOUS || record.severity === BehaviorSeverity.CRITICAL) {
      pattern.statistics.suspiciousActivities++;
    }

    // 检测新异常
    if (record.flags.length > 0) {
      pattern.anomalies.push({
        type: record.flags.join(', '),
        description: `Anomalous behavior detected: ${record.flags.join(', ')}`,
        severity: record.severity,
        detectedAt: record.timestamp,
        count: 1
      });
    }

    this.userPatterns.set(userId, pattern);
  }

  // 发送警报
  private async sendAlert(record: UserBehaviorRecord): Promise<void> {
    const alert = {
      type: 'behavior_alert',
      message: `Suspicious activity detected for user ${record.userInfo.username}: ${record.flags.join(', ')}`,
      severity: record.severity,
      timestamp: new Date(),
      userId: record.userId
    };

    this.monitoringMetrics.alerts.unshift(alert);
    
    // 保持警报列表在合理大小
    if (this.monitoringMetrics.alerts.length > 100) {
      this.monitoringMetrics.alerts = this.monitoringMetrics.alerts.slice(0, 100);
    }

    console.log(`ALERT: ${alert.message}`);
  }

  // 获取用户行为记录
  async getUserBehaviorRecords(
    userId: string,
    filters: {
      event?: UserBehaviorEvent;
      severity?: BehaviorSeverity;
      dateFrom?: Date;
      dateTo?: Date;
      flagsOnly?: boolean;
    } = {},
    pagination: { page: number; limit: number } = { page: 1, limit: 50 }
  ): Promise<{ records: UserBehaviorRecord[]; total: number }> {
    let records = Array.from(this.behaviorRecords.values())
      .filter(r => r.userId === userId);

    // 应用过滤器
    if (filters.event) {
      records = records.filter(r => r.event === filters.event);
    }
    if (filters.severity) {
      records = records.filter(r => r.severity === filters.severity);
    }
    if (filters.dateFrom) {
      records = records.filter(r => r.timestamp >= filters.dateFrom!);
    }
    if (filters.dateTo) {
      records = records.filter(r => r.timestamp <= filters.dateTo!);
    }
    if (filters.flagsOnly) {
      records = records.filter(r => r.flags.length > 0);
    }

    // 按时间倒序排序
    records.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    const total = records.length;
    const startIndex = (pagination.page - 1) * pagination.limit;
    const paginatedRecords = records.slice(startIndex, startIndex + pagination.limit);

    return { records: paginatedRecords, total };
  }

  // 获取系统监控指标
  async getMonitoringMetrics(): Promise<MonitoringMetrics> {
    return { ...this.monitoringMetrics };
  }

  // 获取用户行为模式
  async getUserBehaviorPattern(userId: string): Promise<UserBehaviorPattern | null> {
    return this.userPatterns.get(userId) || null;
  }

  // 更新实时指标
  private updateMetrics(): void {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 3600000);
    const recentRecords = Array.from(this.behaviorRecords.values())
      .filter(r => r.timestamp >= oneHourAgo);

    this.monitoringMetrics.activeUsers = new Set(
      Array.from(this.activeSessions.values())
        .filter(s => s.isActive)
        .map(s => s.userId)
    ).size;

    this.monitoringMetrics.activeSessions = Array.from(this.activeSessions.values())
      .filter(s => s.isActive).length;

    this.monitoringMetrics.recentActivities = recentRecords.length;

    this.monitoringMetrics.suspiciousActivities = recentRecords
      .filter(r => r.severity === BehaviorSeverity.SUSPICIOUS || r.severity === BehaviorSeverity.CRITICAL)
      .length;

    // 计算热门活动
    const activityCounts = new Map<UserBehaviorEvent, number>();
    recentRecords.forEach(r => {
      activityCounts.set(r.event, (activityCounts.get(r.event) || 0) + 1);
    });
    
    this.monitoringMetrics.topActivities = Array.from(activityCounts.entries())
      .map(([event, count]) => ({ event, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // 计算热门设备
    const deviceCounts = new Map<string, number>();
    recentRecords.forEach(r => {
      const device = r.metadata.device.type;
      deviceCounts.set(device, (deviceCounts.get(device) || 0) + 1);
    });
    
    this.monitoringMetrics.topDevices = Array.from(deviceCounts.entries())
      .map(([device, count]) => ({ device, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  // 启动实时监控
  private startRealTimeMonitoring(): void {
    // 每分钟更新指标
    setInterval(() => {
      this.updateMetrics();
    }, 60000);

    // 每5分钟清理过期会话
    setInterval(() => {
      this.cleanupInactiveSessions();
    }, 300000);
  }

  // 清理非活跃会话
  private cleanupInactiveSessions(): void {
    const now = new Date();
    const inactiveThreshold = new Date(now.getTime() - 30 * 60 * 1000); // 30分钟

    for (const [sessionId, session] of this.activeSessions.entries()) {
      if (session.startTime < inactiveThreshold) {
        session.isActive = false;
        session.endTime = now;
        session.duration = now.getTime() - session.startTime.getTime();
      }
    }
  }

  // 获取异常行为报告
  async getAnomalousActivityReport(
    dateFrom: Date = new Date(Date.now() - 24 * 60 * 60 * 1000),
    dateTo: Date = new Date()
  ): Promise<{
    totalAnomalies: number;
    criticalAnomalies: number;
    suspiciousAnomalies: number;
    topAnomalyTypes: { type: string; count: number }[];
    affectedUsers: number;
    topOffendingUsers: { userId: string; username: string; anomalyCount: number }[];
  }> {
    const records = Array.from(this.behaviorRecords.values())
      .filter(r => r.timestamp >= dateFrom && r.timestamp <= dateTo && r.flags.length > 0);

    const anomalyTypes = new Map<string, number>();
    const userAnomalies = new Map<string, number>();

    records.forEach(record => {
      record.flags.forEach(flag => {
        anomalyTypes.set(flag, (anomalyTypes.get(flag) || 0) + 1);
      });
      userAnomalies.set(record.userId, (userAnomalies.get(record.userId) || 0) + 1);
    });

    return {
      totalAnomalies: records.length,
      criticalAnomalies: records.filter(r => r.severity === BehaviorSeverity.CRITICAL).length,
      suspiciousAnomalies: records.filter(r => r.severity === BehaviorSeverity.SUSPICIOUS).length,
      topAnomalyTypes: Array.from(anomalyTypes.entries())
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      affectedUsers: userAnomalies.size,
      topOffendingUsers: Array.from(userAnomalies.entries())
        .map(([userId, anomalyCount]) => ({
          userId,
          username: `user_${userId}`, // 简化版本
          anomalyCount
        }))
        .sort((a, b) => b.anomalyCount - a.anomalyCount)
        .slice(0, 10)
    };
  }
}

export const userBehaviorMonitoringService = new UserBehaviorMonitoringService();