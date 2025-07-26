/**
 * LexiLoop Backend Server
 * Main entry point for the Express API server
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config/config';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';

// Performance optimization imports
import { 
  createCompressionMiddleware, 
  responseSizeMiddleware, 
  compressionAnalyzer,
  staticCompressionMiddleware,
  adaptiveCompressionMiddleware 
} from './middleware/compressionMiddleware';
import { 
  rateLimitManager, 
  rateLimitConfigs 
} from './middleware/advancedRateLimitMiddleware';
import { realDatabaseService } from './services/realDatabaseService';
import { cacheManager } from './services/cacheService';

// Import routes
import authRoutes from './routes/auth';
import vocabularyRoutes from './routes/vocabularies';
import storyRoutes from './routes/stories';
import testRoutes from './routes/tests';
import progressRoutes from './routes/progress';
import wordBookRoutes from './routes/wordBooks';
import socialRoutes from './routes/socialRoutes';
import advancedTestRoutes from './routes/advancedTestRoutes';
import vocabularyLibraryRoutes from './routes/vocabularyLibrary';
import adminModerationRoutes from './routes/adminModeration';
import userBehaviorMonitoringRoutes from './routes/userBehaviorMonitoring';
import contentApprovalWorkflowRoutes from './routes/contentApprovalWorkflow';

const app = express();

// Initialize performance optimizations
async function initializePerformanceOptimizations() {
  try {
    // Initialize real database service
    await realDatabaseService.initialize();
    logger.info('Real database service initialized');
  } catch (error) {
    logger.error('Failed to initialize database service', { error });
  }
}

// Performance monitoring middleware
app.use(responseSizeMiddleware);
app.use(compressionAnalyzer.middleware());

// Compression middleware (before other middleware)
app.use(createCompressionMiddleware({
  level: parseInt(process.env.COMPRESSION_LEVEL || '6'),
  threshold: parseInt(process.env.COMPRESSION_THRESHOLD || '1024')
}));
app.use(staticCompressionMiddleware);
app.use(adaptiveCompressionMiddleware);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Advanced rate limiting
const globalRateLimit = rateLimitManager.createBasicRateLimit(rateLimitConfigs.standard);
const authRateLimit = rateLimitManager.createEndpointSpecificRateLimit(rateLimitConfigs.endpointConfigs);
const roleBasedRateLimit = rateLimitManager.createRoleBasedRateLimit(rateLimitConfigs.roleBasedConfigs);

app.use('/api/', globalRateLimit);
app.use('/api/auth/', authRateLimit);
app.use('/api/', roleBasedRateLimit);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(requestLogger);

// Health check endpoint with performance metrics
app.get('/health', async (req, res) => {
  try {
    const dbHealth = await realDatabaseService.healthCheck();
    const cacheStats = cacheManager.getAllStats();
    const rateLimitStats = rateLimitManager.getStats();
    const compressionStats = compressionAnalyzer.getStats();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '0.2.0',
      performance: {
        database: dbHealth.details,
        cache: Object.keys(cacheStats).reduce((acc, key) => {
          acc[key] = {
            hitRate: cacheStats[key].hitRate,
            totalItems: cacheStats[key].totalItems,
            memoryUsage: cacheStats[key].memoryUsage.percentage
          };
          return acc;
        }, {} as any),
        rateLimiting: {
          totalRequests: rateLimitStats.totalRequests,
          blockedRequests: rateLimitStats.blockedRequests,
          blockRate: rateLimitStats.totalRequests > 0 
            ? (rateLimitStats.blockedRequests / rateLimitStats.totalRequests) * 100 
            : 0
        },
        compression: {
          compressionRate: compressionStats.compressionRate,
          averageCompressionRatio: compressionStats.averageCompressionRatio,
          totalSavings: compressionStats.totalSavings
        }
      }
    });
  } catch (error) {
    logger.error('Health check error', { error });
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Performance metrics unavailable'
    });
  }
});

// Performance monitoring endpoints
app.get('/api/admin/performance/cache', async (req, res) => {
  try {
    const stats = cacheManager.getAllStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get cache stats' });
  }
});

app.get('/api/admin/performance/database', async (req, res) => {
  try {
    const health = await realDatabaseService.healthCheck();
    const stats = await realDatabaseService.getDatabaseStats();
    const connectionStatus = realDatabaseService.getConnectionStatus();
    
    res.json({ 
      success: true, 
      data: { 
        health, 
        databaseStats: stats,
        connectionStatus
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get database stats' });
  }
});

app.get('/api/admin/performance/rate-limit', (req, res) => {
  try {
    const stats = rateLimitManager.getStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get rate limit stats' });
  }
});

app.get('/api/admin/performance/compression', (req, res) => {
  try {
    const stats = compressionAnalyzer.getStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get compression stats' });
  }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/vocabularies', vocabularyRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/word-books', wordBookRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/advanced-tests', advancedTestRoutes);
app.use('/api/vocabulary-library', vocabularyLibraryRoutes);
app.use('/api/admin/moderation', adminModerationRoutes);
app.use('/api/admin/behavior-monitoring', userBehaviorMonitoringRoutes);
app.use('/api/admin/workflow', contentApprovalWorkflowRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
  });
});

// Global error handler
app.use(errorHandler);

// Graceful shutdown
async function gracefulShutdown(signal: string) {
  logger.info(`${signal} received, shutting down gracefully`);
  
  try {
    // Close database connections
    await realDatabaseService.close();
    
    // Destroy cache services
    cacheManager.destroyAll();
    
    logger.info('All services shut down successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Error during graceful shutdown', { error });
    process.exit(1);
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server with performance optimizations
async function startServer() {
  const PORT = process.env.PORT || 8000;
  
  try {
    // Initialize performance optimizations
    await initializePerformanceOptimizations();
    
    // Start the server
    const server = app.listen(PORT, () => {
      logger.info(`🚀 LexiLoop API server running on port ${PORT}`);
      logger.info(`📖 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🌐 CORS origin: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
      logger.info(`⚡ Performance optimizations enabled:`);
      logger.info(`   - Database connection pooling`);
      logger.info(`   - Multi-level caching`);
      logger.info(`   - Advanced rate limiting`);
      logger.info(`   - Response compression`);
      logger.info(`   - Performance monitoring`);
    });

    // Handle server errors
    server.on('error', (error) => {
      logger.error('Server error', { error });
    });

    // Log performance metrics periodically
    setInterval(async () => {
      try {
        const dbHealth = await realDatabaseService.healthCheck();
        const connectionStatus = realDatabaseService.getConnectionStatus();
        const cacheStats = cacheManager.getAllStats();
        const rateLimitStats = rateLimitManager.getStats();
        
        logger.info('Performance metrics', {
          database: {
            status: dbHealth.status,
            isConnected: connectionStatus.isConnected,
            uptime: connectionStatus.uptime,
            errorCount: connectionStatus.errorCount,
            averageResponseTime: dbHealth.details.performance.averageResponseTime
          },
          cache: Object.keys(cacheStats).reduce((acc, key) => {
            acc[key] = cacheStats[key].hitRate;
            return acc;
          }, {} as any),
          rateLimiting: {
            totalRequests: rateLimitStats.totalRequests,
            blockedRequests: rateLimitStats.blockedRequests
          }
        });
      } catch (error) {
        logger.error('Error logging performance metrics', { error });
      }
    }, 300000); // 每5分钟记录一次
    
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
}

// Start the server
startServer();

export default app;