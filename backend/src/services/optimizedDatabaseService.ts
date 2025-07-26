import { MongoClient, Db, Collection, MongoClientOptions } from 'mongodb';
import { logger } from '../utils/logger';
import { vocabularyCache, userCache, apiCache } from './cacheService';

// 连接池配置接口
interface DatabasePoolConfig {
  uri: string;
  maxPoolSize: number;
  minPoolSize: number;
  maxIdleTimeMS: number;
  waitQueueTimeoutMS: number;
  serverSelectionTimeoutMS: number;
  heartbeatFrequencyMS: number;
  retryReads: boolean;
  retryWrites: boolean;
  readPreference: 'primary' | 'secondary' | 'primaryPreferred' | 'secondaryPreferred' | 'nearest';
}

// 查询性能统计
interface QueryPerformanceStats {
  operation: string;
  collection: string;
  executionTime: number;
  cacheHit: boolean;
  timestamp: Date;
  queryType: 'read' | 'write' | 'update' | 'delete';
}

// 数据库健康状态
interface DatabaseHealth {
  isConnected: boolean;
  connectionCount: number;
  avgResponseTime: number;
  errorRate: number;
  totalQueries: number;
  cacheHitRate: number;
  replicationLag?: number;
}

export class OptimizedDatabaseService {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private config: DatabasePoolConfig;
  private queryStats: QueryPerformanceStats[] = [];
  private healthMetrics = {
    totalQueries: 0,
    totalErrors: 0,
    totalExecutionTime: 0,
    cacheHits: 0
  };

  constructor(config: Partial<DatabasePoolConfig> = {}) {
    this.config = {
      uri: config.uri || process.env.MONGODB_URI || 'mongodb://localhost:27017/lexiloop',
      maxPoolSize: config.maxPoolSize || 100,
      minPoolSize: config.minPoolSize || 5,
      maxIdleTimeMS: config.maxIdleTimeMS || 300000, // 5分钟
      waitQueueTimeoutMS: config.waitQueueTimeoutMS || 30000, // 30秒
      serverSelectionTimeoutMS: config.serverSelectionTimeoutMS || 10000, // 10秒
      heartbeatFrequencyMS: config.heartbeatFrequencyMS || 10000, // 10秒
      retryReads: config.retryReads ?? true,
      retryWrites: config.retryWrites ?? true,
      readPreference: config.readPreference || 'primaryPreferred'
    };
  }

  // 初始化数据库连接
  async initialize(): Promise<void> {
    try {
      const options: MongoClientOptions = {
        maxPoolSize: this.config.maxPoolSize,
        minPoolSize: this.config.minPoolSize,
        maxIdleTimeMS: this.config.maxIdleTimeMS,
        waitQueueTimeoutMS: this.config.waitQueueTimeoutMS,
        serverSelectionTimeoutMS: this.config.serverSelectionTimeoutMS,
        heartbeatFrequencyMS: this.config.heartbeatFrequencyMS,
        retryReads: this.config.retryReads,
        retryWrites: this.config.retryWrites,
        readPreference: this.config.readPreference,
        // 启用监控
        monitorCommands: true,
        // 压缩传输
        compressors: ['zstd', 'snappy', 'zlib']
      };

      this.client = new MongoClient(this.config.uri, options);
      await this.client.connect();
      
      // 获取数据库实例
      const dbName = this.extractDatabaseName(this.config.uri);
      this.db = this.client.db(dbName);

      // 设置事件监听器
      this.setupEventListeners();

      logger.info('Database connection initialized successfully', {
        uri: this.config.uri.replace(/\/\/.*@/, '//***@'), // 隐藏凭据
        config: this.config
      });

    } catch (error) {
      logger.error('Failed to initialize database connection', { error });
      throw error;
    }
  }

  // 优化的查询方法（带缓存）
  async findWithCache<T>(
    collectionName: string,
    query: any,
    options: any = {},
    cacheKey?: string,
    cacheTTL: number = 300000 // 5分钟默认缓存
  ): Promise<T[]> {
    const startTime = Date.now();
    const operation = 'find';
    let cacheHit = false;

    try {
      // 生成缓存键
      const key = cacheKey || this.generateCacheKey(collectionName, operation, query, options);
      
      // 尝试从缓存获取
      const cachedResult = apiCache.get<T[]>(key);
      if (cachedResult) {
        cacheHit = true;
        this.recordQueryStats(operation, collectionName, Date.now() - startTime, cacheHit, 'read');
        return cachedResult;
      }

      // 从数据库查询
      const collection = this.getCollection(collectionName);
      const cursor = collection.find(query, options);
      const results = await cursor.toArray() as T[];

      // 缓存结果
      apiCache.set(key, results, cacheTTL);

      this.recordQueryStats(operation, collectionName, Date.now() - startTime, cacheHit, 'read');
      return results;

    } catch (error) {
      this.healthMetrics.totalErrors++;
      logger.error('Database query error', { 
        operation, 
        collectionName, 
        query, 
        error 
      });
      throw error;
    }
  }

  // 优化的单文档查询
  async findOneWithCache<T>(
    collectionName: string,
    query: any,
    options: any = {},
    cacheKey?: string,
    cacheTTL: number = 300000
  ): Promise<T | null> {
    const startTime = Date.now();
    const operation = 'findOne';
    let cacheHit = false;

    try {
      // 生成缓存键
      const key = cacheKey || this.generateCacheKey(collectionName, operation, query, options);
      
      // 尝试从缓存获取
      const cachedResult = apiCache.get<T>(key);
      if (cachedResult !== null) {
        cacheHit = true;
        this.recordQueryStats(operation, collectionName, Date.now() - startTime, cacheHit, 'read');
        return cachedResult;
      }

      // 从数据库查询
      const collection = this.getCollection(collectionName);
      const result = await collection.findOne(query, options) as T | null;

      // 缓存结果（包括null结果）
      apiCache.set(key, result, cacheTTL);

      this.recordQueryStats(operation, collectionName, Date.now() - startTime, cacheHit, 'read');
      return result;

    } catch (error) {
      this.healthMetrics.totalErrors++;
      logger.error('Database findOne error', { 
        operation, 
        collectionName, 
        query, 
        error 
      });
      throw error;
    }
  }

  // 批量插入优化
  async insertMany<T>(
    collectionName: string,
    documents: T[],
    options: any = {}
  ): Promise<any> {
    const startTime = Date.now();
    const operation = 'insertMany';

    try {
      const collection = this.getCollection(collectionName);
      
      // 使用批量操作选项优化性能
      const optimizedOptions = {
        ordered: false, // 允许并行插入
        bypassDocumentValidation: false,
        ...options
      };

      const result = await collection.insertMany(documents, optimizedOptions);

      // 清理相关缓存
      this.invalidateCache(collectionName);

      this.recordQueryStats(operation, collectionName, Date.now() - startTime, false, 'write');
      return result;

    } catch (error) {
      this.healthMetrics.totalErrors++;
      logger.error('Database insertMany error', { 
        operation, 
        collectionName, 
        documentCount: documents.length, 
        error 
      });
      throw error;
    }
  }

  // 优化的更新操作
  async updateWithCache(
    collectionName: string,
    filter: any,
    update: any,
    options: any = {}
  ): Promise<any> {
    const startTime = Date.now();
    const operation = 'update';

    try {
      const collection = this.getCollection(collectionName);
      const result = await collection.updateMany(filter, update, options);

      // 清理相关缓存
      this.invalidateCache(collectionName);

      this.recordQueryStats(operation, collectionName, Date.now() - startTime, false, 'update');
      return result;

    } catch (error) {
      this.healthMetrics.totalErrors++;
      logger.error('Database update error', { 
        operation, 
        collectionName, 
        filter, 
        update, 
        error 
      });
      throw error;
    }
  }

  // 聚合查询优化
  async aggregateWithCache<T>(
    collectionName: string,
    pipeline: any[],
    options: any = {},
    cacheKey?: string,
    cacheTTL: number = 600000 // 10分钟缓存聚合结果
  ): Promise<T[]> {
    const startTime = Date.now();
    const operation = 'aggregate';
    let cacheHit = false;

    try {
      // 生成缓存键
      const key = cacheKey || this.generateCacheKey(collectionName, operation, pipeline, options);
      
      // 尝试从缓存获取
      const cachedResult = apiCache.get<T[]>(key);
      if (cachedResult) {
        cacheHit = true;
        this.recordQueryStats(operation, collectionName, Date.now() - startTime, cacheHit, 'read');
        return cachedResult;
      }

      // 优化聚合选项
      const optimizedOptions = {
        allowDiskUse: true, // 允许使用磁盘进行大数据聚合
        maxTimeMS: 30000, // 30秒超时
        ...options
      };

      const collection = this.getCollection(collectionName);
      const cursor = collection.aggregate(pipeline, optimizedOptions);
      const results = await cursor.toArray() as T[];

      // 缓存结果
      apiCache.set(key, results, cacheTTL);

      this.recordQueryStats(operation, collectionName, Date.now() - startTime, cacheHit, 'read');
      return results;

    } catch (error) {
      this.healthMetrics.totalErrors++;
      logger.error('Database aggregate error', { 
        operation, 
        collectionName, 
        pipeline, 
        error 
      });
      throw error;
    }
  }

  // 事务支持
  async withTransaction<T>(callback: (session: any) => Promise<T>): Promise<T> {
    if (!this.client) {
      throw new Error('Database not initialized');
    }

    const session = this.client.startSession();
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

  // 健康检查
  async getHealthStatus(): Promise<DatabaseHealth> {
    try {
      if (!this.db) {
        throw new Error('Database not initialized');
      }

      // 执行ping检查
      const pingStart = Date.now();
      await this.db.admin().ping();
      const pingTime = Date.now() - pingStart;

      // 获取连接统计
      const serverStatus = await this.db.admin().serverStatus();
      
      const totalQueries = this.healthMetrics.totalQueries;
      const errorRate = totalQueries > 0 
        ? (this.healthMetrics.totalErrors / totalQueries) * 100 
        : 0;

      const avgResponseTime = totalQueries > 0 
        ? this.healthMetrics.totalExecutionTime / totalQueries 
        : 0;

      const cacheHitRate = totalQueries > 0 
        ? (this.healthMetrics.cacheHits / totalQueries) * 100 
        : 0;

      return {
        isConnected: true,
        connectionCount: serverStatus.connections?.current || 0,
        avgResponseTime: Math.round(avgResponseTime),
        errorRate: Math.round(errorRate * 100) / 100,
        totalQueries,
        cacheHitRate: Math.round(cacheHitRate * 100) / 100
      };

    } catch (error) {
      logger.error('Database health check failed', { error });
      return {
        isConnected: false,
        connectionCount: 0,
        avgResponseTime: 0,
        errorRate: 100,
        totalQueries: this.healthMetrics.totalQueries,
        cacheHitRate: 0
      };
    }
  }

  // 获取查询性能统计
  getQueryStats(limit: number = 100): QueryPerformanceStats[] {
    return this.queryStats
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // 获取慢查询
  getSlowQueries(thresholdMs: number = 1000): QueryPerformanceStats[] {
    return this.queryStats
      .filter(stat => stat.executionTime > thresholdMs)
      .sort((a, b) => b.executionTime - a.executionTime);
  }

  // 私有方法

  private getCollection(name: string): Collection {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    return this.db.collection(name);
  }

  private generateCacheKey(collection: string, operation: string, query: any, options: any = {}): string {
    const queryString = JSON.stringify({ query, options });
    const hash = this.simpleHash(queryString);
    return `db:${collection}:${operation}:${hash}`;
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为32位整数
    }
    return Math.abs(hash).toString(36);
  }

  private invalidateCache(collectionName: string): void {
    // 清理相关集合的缓存
    apiCache.deletePattern(`db:${collectionName}:.*`);
  }

  private recordQueryStats(
    operation: string,
    collection: string,
    executionTime: number,
    cacheHit: boolean,
    queryType: 'read' | 'write' | 'update' | 'delete'
  ): void {
    // 更新健康指标
    this.healthMetrics.totalQueries++;
    this.healthMetrics.totalExecutionTime += executionTime;
    if (cacheHit) {
      this.healthMetrics.cacheHits++;
    }

    // 记录详细统计
    const stat: QueryPerformanceStats = {
      operation,
      collection,
      executionTime,
      cacheHit,
      timestamp: new Date(),
      queryType
    };

    this.queryStats.push(stat);

    // 保持统计记录在合理大小
    if (this.queryStats.length > 1000) {
      this.queryStats = this.queryStats.slice(-500);
    }

    // 记录慢查询
    if (executionTime > 1000) {
      logger.warn('Slow query detected', stat);
    }
  }

  private extractDatabaseName(uri: string): string {
    const match = uri.match(/\/([^?]+)(\?|$)/);
    return match ? match[1] : 'lexiloop';
  }

  private setupEventListeners(): void {
    if (!this.client) return;

    this.client.on('commandStarted', (event) => {
      logger.debug('Database command started', {
        command: event.commandName,
        collection: event.command.collection || event.command[event.commandName]
      });
    });

    this.client.on('commandSucceeded', (event) => {
      logger.debug('Database command succeeded', {
        command: event.commandName,
        duration: event.duration
      });
    });

    this.client.on('commandFailed', (event) => {
      logger.error('Database command failed', {
        command: event.commandName,
        error: event.failure
      });
    });

    this.client.on('connectionPoolCreated', (event) => {
      logger.info('Database connection pool created', {
        address: event.address,
        options: event.options
      });
    });

    this.client.on('connectionPoolClosed', (event) => {
      logger.info('Database connection pool closed', {
        address: event.address
      });
    });
  }

  // 优雅关闭
  async close(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
      logger.info('Database connection closed');
    }
  }
}

// 创建优化的数据库服务实例
export const optimizedDatabaseService = new OptimizedDatabaseService({
  maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE || '50'),
  minPoolSize: parseInt(process.env.DB_MIN_POOL_SIZE || '5'),
  maxIdleTimeMS: parseInt(process.env.DB_MAX_IDLE_TIME_MS || '300000'),
  readPreference: (process.env.DB_READ_PREFERENCE as any) || 'primaryPreferred'
});