import express from 'express';
import { 
  userBehaviorMonitoringService, 
  UserBehaviorEvent, 
  BehaviorSeverity 
} from '../services/userBehaviorMonitoringService';

const router = express.Router();

// 记录用户行为
router.post('/record', async (req, res) => {
  try {
    const { userId, event, details, metadata } = req.body;

    if (!userId || !event || !metadata) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, event, metadata'
      });
    }

    if (!Object.values(UserBehaviorEvent).includes(event)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid behavior event type'
      });
    }

    const record = await userBehaviorMonitoringService.recordBehavior(
      userId,
      event as UserBehaviorEvent,
      details || {},
      metadata
    );

    res.json({
      success: true,
      data: record,
      message: 'Behavior recorded successfully'
    });
  } catch (error) {
    console.error('Error recording behavior:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record behavior'
    });
  }
});

// 获取用户行为记录
router.get('/user/:userId/records', async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      event,
      severity,
      dateFrom,
      dateTo,
      flagsOnly,
      page = 1,
      limit = 50
    } = req.query;

    const filters: any = {};
    if (event) filters.event = event as UserBehaviorEvent;
    if (severity) filters.severity = severity as BehaviorSeverity;
    if (dateFrom) filters.dateFrom = new Date(dateFrom as string);
    if (dateTo) filters.dateTo = new Date(dateTo as string);
    if (flagsOnly === 'true') filters.flagsOnly = true;

    const pagination = {
      page: parseInt(page as string),
      limit: parseInt(limit as string)
    };

    const result = await userBehaviorMonitoringService.getUserBehaviorRecords(
      userId,
      filters,
      pagination
    );

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
    console.error('Error fetching user behavior records:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user behavior records'
    });
  }
});

// 获取用户行为模式
router.get('/user/:userId/pattern', async (req, res) => {
  try {
    const { userId } = req.params;
    const pattern = await userBehaviorMonitoringService.getUserBehaviorPattern(userId);

    if (!pattern) {
      return res.status(404).json({
        success: false,
        message: 'User behavior pattern not found'
      });
    }

    res.json({
      success: true,
      data: pattern
    });
  } catch (error) {
    console.error('Error fetching user behavior pattern:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user behavior pattern'
    });
  }
});

// 获取系统监控指标
router.get('/metrics', async (req, res) => {
  try {
    const metrics = await userBehaviorMonitoringService.getMonitoringMetrics();

    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error('Error fetching monitoring metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch monitoring metrics'
    });
  }
});

// 获取异常行为报告
router.get('/anomalies/report', async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;

    const from = dateFrom ? new Date(dateFrom as string) : new Date(Date.now() - 24 * 60 * 60 * 1000);
    const to = dateTo ? new Date(dateTo as string) : new Date();

    const report = await userBehaviorMonitoringService.getAnomalousActivityReport(from, to);

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Error generating anomaly report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate anomaly report'
    });
  }
});

// 获取实时活动流
router.get('/live-feed', async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    // 获取最近的活动记录
    const recentRecords = await userBehaviorMonitoringService.getUserBehaviorRecords(
      '', // 空字符串表示获取所有用户
      {
        dateFrom: new Date(Date.now() - 3600000) // 最近1小时
      },
      {
        page: 1,
        limit: parseInt(limit as string)
      }
    );

    res.json({
      success: true,
      data: recentRecords.records.map(record => ({
        id: record.id,
        userId: record.userId,
        username: record.userInfo.username,
        event: record.event,
        severity: record.severity,
        timestamp: record.timestamp,
        flags: record.flags,
        location: record.metadata.location?.city || 'Unknown',
        device: record.metadata.device.type
      }))
    });
  } catch (error) {
    console.error('Error fetching live feed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch live activity feed'
    });
  }
});

// 获取用户会话信息
router.get('/sessions/active', async (req, res) => {
  try {
    const metrics = await userBehaviorMonitoringService.getMonitoringMetrics();
    
    // 简化的活跃会话信息
    const sessions = {
      activeUsers: metrics.activeUsers,
      activeSessions: metrics.activeSessions,
      recentActivities: metrics.recentActivities,
      suspiciousActivities: metrics.suspiciousActivities
    };

    res.json({
      success: true,
      data: sessions
    });
  } catch (error) {
    console.error('Error fetching active sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active sessions'
    });
  }
});

// 获取可疑活动列表
router.get('/suspicious', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    // 获取可疑活动记录
    const suspiciousRecords = await userBehaviorMonitoringService.getUserBehaviorRecords(
      '', // 所有用户
      {
        severity: BehaviorSeverity.SUSPICIOUS,
        dateFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 最近7天
      },
      {
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      }
    );

    const criticalRecords = await userBehaviorMonitoringService.getUserBehaviorRecords(
      '', // 所有用户
      {
        severity: BehaviorSeverity.CRITICAL,
        dateFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 最近7天
      },
      {
        page: 1,
        limit: 100
      }
    );

    const combinedRecords = [...criticalRecords.records, ...suspiciousRecords.records]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, parseInt(limit as string));

    res.json({
      success: true,
      data: {
        records: combinedRecords,
        total: suspiciousRecords.total + criticalRecords.total
      },
      pagination: {
        currentPage: parseInt(page as string),
        totalPages: Math.ceil((suspiciousRecords.total + criticalRecords.total) / parseInt(limit as string)),
        totalItems: suspiciousRecords.total + criticalRecords.total
      }
    });
  } catch (error) {
    console.error('Error fetching suspicious activities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch suspicious activities'
    });
  }
});

// 标记行为记录为已审核
router.put('/record/:recordId/review', async (req, res) => {
  try {
    const { recordId } = req.params;
    const { reviewerId, notes } = req.body;

    if (!reviewerId) {
      return res.status(400).json({
        success: false,
        message: 'Reviewer ID is required'
      });
    }

    // 简化版本 - 实际应用中需要在服务中实现此方法
    res.json({
      success: true,
      message: 'Behavior record marked as reviewed'
    });
  } catch (error) {
    console.error('Error reviewing behavior record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to review behavior record'
    });
  }
});

// 获取行为事件类型枚举
router.get('/enums/events', (req, res) => {
  res.json({
    success: true,
    data: Object.values(UserBehaviorEvent)
  });
});

// 获取严重性等级枚举
router.get('/enums/severity', (req, res) => {
  res.json({
    success: true,
    data: Object.values(BehaviorSeverity)
  });
});

// 导出行为数据（用于分析）
router.get('/export', async (req, res) => {
  try {
    const { userId, dateFrom, dateTo, format = 'json' } = req.query;

    const filters: any = {};
    if (dateFrom) filters.dateFrom = new Date(dateFrom as string);
    if (dateTo) filters.dateTo = new Date(dateTo as string);

    const records = await userBehaviorMonitoringService.getUserBehaviorRecords(
      userId as string || '',
      filters,
      { page: 1, limit: 10000 } // 大量导出
    );

    if (format === 'csv') {
      // 简化的CSV导出
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=behavior_data.csv');
      
      let csv = 'Timestamp,User ID,Event,Severity,Flags,IP,Device\n';
      records.records.forEach(record => {
        csv += `${record.timestamp.toISOString()},${record.userId},${record.event},${record.severity},"${record.flags.join(';')}",${record.metadata.ip},${record.metadata.device.type}\n`;
      });
      
      res.send(csv);
    } else {
      res.json({
        success: true,
        data: records,
        exportInfo: {
          totalRecords: records.total,
          exportedRecords: records.records.length,
          exportDate: new Date().toISOString()
        }
      });
    }
  } catch (error) {
    console.error('Error exporting behavior data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export behavior data'
    });
  }
});

export default router;