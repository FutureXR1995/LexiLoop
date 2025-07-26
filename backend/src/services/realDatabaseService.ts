import mongoose from 'mongoose';
import { logger } from '../utils/logger';
import { vocabularyCache, userCache, apiCache } from './cacheService';

// 数据库配置接口
interface DatabaseConfig {
  uri: string;
  options: mongoose.ConnectOptions;
  retryAttempts: number;
  retryDelay: number;
}

// 连接状态
interface ConnectionStatus {
  isConnected: boolean;
  connectionState: string;
  host?: string;
  port?: number;
  databaseName?: string;
  uptime: number;
  errorCount: number;
  lastError?: string;
}

export class RealDatabaseService {
  private config: DatabaseConfig;
  private connectionAttempts: number = 0;
  private startTime: number = Date.now();
  private errorCount: number = 0;
  private lastError?: string;

  constructor() {
    this.config = {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/lexiloop',
      options: {
        // 连接池设置
        maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE || '50'),
        minPoolSize: parseInt(process.env.DB_MIN_POOL_SIZE || '5'),
        maxIdleTimeMS: parseInt(process.env.DB_MAX_IDLE_TIME_MS || '300000'),
        
        // 连接超时设置
        serverSelectionTimeoutMS: parseInt(process.env.DB_SERVER_SELECTION_TIMEOUT_MS || '10000'),
        socketTimeoutMS: parseInt(process.env.DB_SOCKET_TIMEOUT_MS || '45000'),
        connectTimeoutMS: parseInt(process.env.DB_CONNECT_TIMEOUT_MS || '10000'),
        
        // 重试设置
        retryReads: true,
        retryWrites: true,
        
        // 读偏好
        readPreference: (process.env.DB_READ_PREFERENCE as any) || 'primaryPreferred',
        
        // 写关注
        writeConcern: {
          w: 'majority',
          j: true,
          wtimeoutMS: 30000
        },
        
        // 读关注
        readConcern: {
          level: 'local'
        },
        
        // 压缩
        compressors: ['zstd', 'snappy', 'zlib'],
        
        // 其他选项
        heartbeatFrequencyMS: 10000
      },
      retryAttempts: parseInt(process.env.DB_RETRY_ATTEMPTS || '5'),
      retryDelay: parseInt(process.env.DB_RETRY_DELAY || '5000')
    };
  }

  // 初始化数据库连接
  async initialize(): Promise<void> {
    try {
      logger.info('Initializing MongoDB connection...', {
        uri: this.config.uri.replace(/\/\/.*@/, '//***@'), // 隐藏凭据
        options: {
          maxPoolSize: this.config.options.maxPoolSize,
          minPoolSize: this.config.options.minPoolSize,
          readPreference: this.config.options.readPreference
        }
      });

      // 设置事件监听器
      this.setupEventListeners();

      // 尝试连接
      await this.connectWithRetry();

      // 验证连接
      await this.validateConnection();

      logger.info('MongoDB connection initialized successfully', {
        state: mongoose.connection.readyState,
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        name: mongoose.connection.name
      });

    } catch (error) {
      this.errorCount++;
      this.lastError = error instanceof Error ? error.message : 'Unknown error';
      logger.warn('MongoDB connection failed, continuing in mock mode', { 
        error: this.lastError,
        attempts: this.connectionAttempts
      });
      // Don't throw error to allow server to start without MongoDB
    }
  }

  // 带重试的连接
  private async connectWithRetry(): Promise<void> {
    while (this.connectionAttempts < this.config.retryAttempts) {
      try {
        this.connectionAttempts++;
        
        logger.info(`MongoDB connection attempt ${this.connectionAttempts}/${this.config.retryAttempts}`);
        
        await mongoose.connect(this.config.uri, this.config.options);
        
        logger.info('MongoDB connected successfully');
        return;
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        logger.warn(`MongoDB connection attempt ${this.connectionAttempts} failed`, {
          error: errorMessage,
          nextRetryIn: this.config.retryDelay
        });

        if (this.connectionAttempts >= this.config.retryAttempts) {
          throw new Error(`Failed to connect to MongoDB after ${this.config.retryAttempts} attempts: ${errorMessage}`);
        }

        // 等待后重试
        await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
      }
    }
  }

  // 验证连接
  private async validateConnection(): Promise<void> {
    try {
      // 执行简单的ping操作
      await mongoose.connection.db?.admin().ping();
      
      // 检查数据库权限
      const collections = await mongoose.connection.db?.listCollections().toArray();
      logger.debug('Database validation successful', {
        collectionsCount: collections?.length || 0,
        collections: collections?.map(c => c.name) || []
      });
      
    } catch (error) {
      throw new Error(`Database validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // 设置事件监听器
  private setupEventListeners(): void {
    // 连接成功
    mongoose.connection.on('connected', () => {
      logger.info('MongoDB connected successfully');
    });

    // 连接错误
    mongoose.connection.on('error', (error) => {
      this.errorCount++;
      this.lastError = error.message;
      logger.error('MongoDB connection error', { error: error.message });
    });

    // 连接断开
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    // 重新连接
    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });

    // 连接关闭
    mongoose.connection.on('close', () => {
      logger.info('MongoDB connection closed');
    });

    // 全缓冲区警告
    mongoose.connection.on('fullsetup', () => {
      logger.info('MongoDB replica set connection established');
    });

    // 连接超时
    mongoose.connection.on('timeout', () => {
      logger.warn('MongoDB connection timeout');
    });
  }

  // 获取连接状态
  getConnectionStatus(): ConnectionStatus {
    const connection = mongoose.connection;
    const uptime = Date.now() - this.startTime;
    
    return {
      isConnected: connection.readyState === 1,
      connectionState: this.getConnectionStateString(connection.readyState),
      host: connection.host,
      port: connection.port,
      databaseName: connection.name,
      uptime,
      errorCount: this.errorCount,
      lastError: this.lastError
    };
  }

  // 获取连接状态字符串
  private getConnectionStateString(state: number): string {
    switch (state) {
      case 0: return 'disconnected';
      case 1: return 'connected';
      case 2: return 'connecting';
      case 3: return 'disconnecting';
      default: return 'unknown';
    }
  }

  // 健康检查
  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    details: {
      connection: ConnectionStatus;
      performance: {
        averageResponseTime: number;
        activeConnections: number;
        availableConnections: number;
      };
      errors: {
        recent: number;
        total: number;
      };
    };
  }> {
    try {
      const startTime = Date.now();
      
      // 执行ping测试
      await mongoose.connection.db?.admin().ping();
      const responseTime = Date.now() - startTime;
      
      // 获取服务器状态
      const serverStatus = await mongoose.connection.db?.admin().serverStatus();
      const connectionStatus = this.getConnectionStatus();
      
      return {
        status: connectionStatus.isConnected ? 'healthy' : 'unhealthy',
        details: {
          connection: connectionStatus,
          performance: {
            averageResponseTime: responseTime,
            activeConnections: (serverStatus as any)?.connections?.current || 0,
            availableConnections: (serverStatus as any)?.connections?.available || 0
          },
          errors: {
            recent: this.errorCount,
            total: this.errorCount
          }
        }
      };
      
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          connection: this.getConnectionStatus(),
          performance: {
            averageResponseTime: -1,
            activeConnections: 0,
            availableConnections: 0
          },
          errors: {
            recent: this.errorCount,
            total: this.errorCount
          }
        }
      };
    }
  }

  // 优化的查询方法（带缓存）
  async findWithCache<T>(
    model: any,
    query: any,
    options: any = {},
    cacheKey?: string,
    cacheTTL: number = 300000
  ): Promise<T[]> {
    try {
      // 生成缓存键
      const key = cacheKey || this.generateCacheKey(model.modelName, 'find', query, options);
      
      // 尝试从缓存获取
      const cachedResult = apiCache.get<T[]>(key);
      if (cachedResult) {
        return cachedResult;
      }

      // 从数据库查询
      const results = await model.find(query, null, options).lean().exec();

      // 缓存结果
      apiCache.set(key, results, cacheTTL);

      return results;
      
    } catch (error) {
      logger.error('Database query error', { 
        model: model.modelName,
        query,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  // 优化的单文档查询
  async findOneWithCache<T>(
    model: any,
    query: any,
    options: any = {},
    cacheKey?: string,
    cacheTTL: number = 300000
  ): Promise<T | null> {
    try {
      // 生成缓存键
      const key = cacheKey || this.generateCacheKey(model.modelName, 'findOne', query, options);
      
      // 尝试从缓存获取
      const cachedResult = apiCache.get<T>(key);
      if (cachedResult !== null) {
        return cachedResult;
      }

      // 从数据库查询
      const result = await model.findOne(query, null, options).lean().exec();

      // 缓存结果
      apiCache.set(key, result, cacheTTL);

      return result;
      
    } catch (error) {
      logger.error('Database findOne error', { 
        model: model.modelName,
        query,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  // 创建文档
  async create<T>(model: any, data: any): Promise<T> {
    try {
      const result = await model.create(data);
      
      // 清理相关缓存
      this.invalidateModelCache(model.modelName);
      
      return result.toObject();
      
    } catch (error) {
      logger.error('Database create error', {
        model: model.modelName,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  // 更新文档
  async updateOne(
    model: any,
    filter: any,
    update: any,
    options: any = {}
  ): Promise<any> {
    try {
      const result = await model.updateOne(filter, update, options);
      
      // 清理相关缓存
      this.invalidateModelCache(model.modelName);
      
      return result;
      
    } catch (error) {
      logger.error('Database update error', {
        model: model.modelName,
        filter,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  // 删除文档
  async deleteOne(model: any, filter: any): Promise<any> {
    try {
      const result = await model.deleteOne(filter);
      
      // 清理相关缓存
      this.invalidateModelCache(model.modelName);
      
      return result;
      
    } catch (error) {
      logger.error('Database delete error', {
        model: model.modelName,
        filter,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  // 聚合查询
  async aggregate<T>(
    model: any,
    pipeline: any[],
    cacheKey?: string,
    cacheTTL: number = 600000
  ): Promise<T[]> {
    try {
      // 生成缓存键
      const key = cacheKey || this.generateCacheKey(model.modelName, 'aggregate', pipeline);
      
      // 尝试从缓存获取
      const cachedResult = apiCache.get<T[]>(key);
      if (cachedResult) {
        return cachedResult;
      }

      // 执行聚合查询
      const results = await model.aggregate(pipeline).exec();

      // 缓存结果
      apiCache.set(key, results, cacheTTL);

      return results;
      
    } catch (error) {
      logger.error('Database aggregate error', {
        model: model.modelName,
        pipeline,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  // 事务支持
  async withTransaction<T>(callback: (session: mongoose.ClientSession) => Promise<T>): Promise<T> {
    const session = await mongoose.startSession();
    try {
      return await session.withTransaction(callback, {
        readPreference: 'primary',
        readConcern: { level: 'local' },
        writeConcern: { w: 'majority' }
      });
    } finally {
      await session.endSession();
    }
  }

  // 批量操作
  async bulkWrite(model: any, operations: any[], options: any = {}): Promise<any> {
    try {
      const result = await model.bulkWrite(operations, {
        ordered: false,
        ...options
      });
      
      // 清理相关缓存
      this.invalidateModelCache(model.modelName);
      
      return result;
      
    } catch (error) {
      logger.error('Database bulk write error', {
        model: model.modelName,
        operationsCount: operations.length,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  // 生成缓存键
  private generateCacheKey(modelName: string, operation: string, query: any, options: any = {}): string {
    const queryString = JSON.stringify({ query, options });
    const hash = this.simpleHash(queryString);
    return `db:${modelName}:${operation}:${hash}`;
  }

  // 简单哈希函数
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  // 清理模型缓存
  private invalidateModelCache(modelName: string): void {
    apiCache.deletePattern(`db:${modelName}:.*`);
  }

  // 数据库统计
  async getDatabaseStats(): Promise<any> {
    try {
      const stats = await mongoose.connection.db?.stats();
      return {
        collections: stats?.collections || 0,
        objects: stats?.objects || 0,
        dataSize: stats?.dataSize || 0,
        storageSize: stats?.storageSize || 0,
        indexes: stats?.indexes || 0,
        indexSize: stats?.indexSize || 0,
        avgObjSize: stats?.avgObjSize || 0
      };
    } catch (error) {
      logger.error('Failed to get database stats', { error });
      return null;
    }
  }

  // 优雅关闭
  async close(): Promise<void> {
    try {
      logger.info('Closing MongoDB connection...');
      await mongoose.connection.close();
      logger.info('MongoDB connection closed successfully');
    } catch (error) {
      logger.error('Error closing MongoDB connection', { 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }
}

// 创建全局实例
export const realDatabaseService = new RealDatabaseService();