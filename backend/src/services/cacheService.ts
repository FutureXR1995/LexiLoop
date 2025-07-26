import { logger } from '../utils/logger';

// 缓存项接口
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // 生存时间（毫秒）
  accessCount: number;
  lastAccessed: number;
}

// 缓存统计接口
interface CacheStats {
  totalItems: number;
  totalSize: number; // 估算字节数
  hitCount: number;
  missCount: number;
  hitRate: number;
  memoryUsage: {
    used: number;
    total: number;
    percentage: number;
  };
  topKeys: {
    key: string;
    accessCount: number;
    lastAccessed: number;
  }[];
}

// 缓存配置接口
interface CacheConfig {
  maxItems: number;
  defaultTTL: number; // 默认TTL（毫秒）
  cleanupInterval: number; // 清理间隔（毫秒）
  maxMemoryUsage: number; // 最大内存使用（字节）
}

export class CacheService {
  private cache: Map<string, CacheItem<any>> = new Map();
  private hitCount: number = 0;
  private missCount: number = 0;
  private cleanupTimer: NodeJS.Timeout | null = null;
  private config: CacheConfig;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxItems: config.maxItems || 10000,
      defaultTTL: config.defaultTTL || 3600000, // 1小时
      cleanupInterval: config.cleanupInterval || 300000, // 5分钟
      maxMemoryUsage: config.maxMemoryUsage || 100 * 1024 * 1024 // 100MB
    };

    this.startCleanupTimer();
    logger.info('Cache service initialized', { config: this.config });
  }

  // 设置缓存项
  set<T>(key: string, data: T, ttl: number = this.config.defaultTTL): void {
    try {
      // 如果缓存已满，执行LRU清理
      if (this.cache.size >= this.config.maxItems) {
        this.evictLRU();
      }

      const now = Date.now();
      const item: CacheItem<T> = {
        data,
        timestamp: now,
        ttl,
        accessCount: 0,
        lastAccessed: now
      };

      this.cache.set(key, item);
      
      // 检查内存使用
      this.checkMemoryUsage();
      
      logger.debug('Cache item set', { key, ttl, cacheSize: this.cache.size });
    } catch (error) {
      logger.error('Error setting cache item', { key, error });
    }
  }

  // 获取缓存项
  get<T>(key: string): T | null {
    try {
      const item = this.cache.get(key) as CacheItem<T> | undefined;
      
      if (!item) {
        this.missCount++;
        logger.debug('Cache miss', { key });
        return null;
      }

      const now = Date.now();
      
      // 检查是否过期
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
        this.missCount++;
        logger.debug('Cache expired', { key, age: now - item.timestamp });
        return null;
      }

      // 更新访问统计
      item.accessCount++;
      item.lastAccessed = now;
      this.hitCount++;
      
      logger.debug('Cache hit', { key, accessCount: item.accessCount });
      return item.data;
    } catch (error) {
      logger.error('Error getting cache item', { key, error });
      this.missCount++;
      return null;
    }
  }

  // 删除缓存项
  delete(key: string): boolean {
    const result = this.cache.delete(key);
    if (result) {
      logger.debug('Cache item deleted', { key });
    }
    return result;
  }

  // 清除所有缓存
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    this.hitCount = 0;
    this.missCount = 0;
    logger.info('Cache cleared', { previousSize: size });
  }

  // 检查缓存项是否存在且未过期
  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;
    
    const now = Date.now();
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  // 获取缓存统计
  getStats(): CacheStats {
    const now = Date.now();
    let totalSize = 0;
    
    // 估算内存使用
    for (const [key, item] of this.cache.entries()) {
      totalSize += this.estimateSize(key) + this.estimateSize(item);
    }

    // 获取访问频率最高的缓存项
    const topKeys = Array.from(this.cache.entries())
      .map(([key, item]) => ({
        key,
        accessCount: item.accessCount,
        lastAccessed: item.lastAccessed
      }))
      .sort((a, b) => b.accessCount - a.accessCount)
      .slice(0, 10);

    const totalRequests = this.hitCount + this.missCount;
    const hitRate = totalRequests > 0 ? (this.hitCount / totalRequests) * 100 : 0;

    return {
      totalItems: this.cache.size,
      totalSize,
      hitCount: this.hitCount,
      missCount: this.missCount,
      hitRate: Math.round(hitRate * 100) / 100,
      memoryUsage: {
        used: totalSize,
        total: this.config.maxMemoryUsage,
        percentage: Math.round((totalSize / this.config.maxMemoryUsage) * 100 * 100) / 100
      },
      topKeys
    };
  }

  // 批量设置缓存项
  setMultiple<T>(items: { key: string; data: T; ttl?: number }[]): void {
    items.forEach(({ key, data, ttl }) => {
      this.set(key, data, ttl);
    });
    logger.debug('Multiple cache items set', { count: items.length });
  }

  // 批量获取缓存项
  getMultiple<T>(keys: string[]): { [key: string]: T | null } {
    const result: { [key: string]: T | null } = {};
    keys.forEach(key => {
      result[key] = this.get<T>(key);
    });
    return result;
  }

  // 根据模式删除缓存项
  deletePattern(pattern: string): number {
    const regex = new RegExp(pattern);
    const keysToDelete: string[] = [];
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
    
    if (keysToDelete.length > 0) {
      logger.info('Cache items deleted by pattern', { 
        pattern, 
        deletedCount: keysToDelete.length 
      });
    }
    
    return keysToDelete.length;
  }

  // 预热缓存
  async warmup(keys: string[], dataLoader: (key: string) => Promise<any>): Promise<void> {
    logger.info('Cache warmup started', { keyCount: keys.length });
    
    const promises = keys.map(async (key) => {
      try {
        if (!this.has(key)) {
          const data = await dataLoader(key);
          this.set(key, data);
        }
      } catch (error) {
        logger.error('Cache warmup error', { key, error });
      }
    });
    
    await Promise.all(promises);
    logger.info('Cache warmup completed');
  }

  // LRU清理策略
  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, item] of this.cache.entries()) {
      if (item.lastAccessed < oldestTime) {
        oldestTime = item.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      logger.debug('LRU eviction', { evictedKey: oldestKey });
    }
  }

  // 检查内存使用
  private checkMemoryUsage(): void {
    const stats = this.getStats();
    if (stats.totalSize > this.config.maxMemoryUsage) {
      // 清理最少使用的缓存项
      const itemsToEvict = Math.ceil(this.cache.size * 0.1); // 清理10%
      this.evictMultipleLRU(itemsToEvict);
      
      logger.warn('Cache memory limit exceeded, evicted items', { 
        evictedCount: itemsToEvict,
        memoryUsage: stats.memoryUsage
      });
    }
  }

  // 批量LRU清理
  private evictMultipleLRU(count: number): void {
    const items = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed)
      .slice(0, count);

    items.forEach(([key]) => {
      this.cache.delete(key);
    });
  }

  // 估算对象大小
  private estimateSize(obj: any): number {
    const jsonString = JSON.stringify(obj);
    return jsonString ? jsonString.length * 2 : 0; // 假设每个字符2字节
  }

  // 清理过期项
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));

    if (keysToDelete.length > 0) {
      logger.debug('Cache cleanup completed', { 
        expiredItems: keysToDelete.length,
        remainingItems: this.cache.size
      });
    }
  }

  // 启动定时清理
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  // 停止缓存服务
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.cache.clear();
    logger.info('Cache service destroyed');
  }
}

// 创建不同类型的缓存实例
export const vocabularyCache = new CacheService({
  maxItems: 5000,
  defaultTTL: 1800000, // 30分钟
  cleanupInterval: 600000 // 10分钟
});

export const userCache = new CacheService({
  maxItems: 2000,
  defaultTTL: 900000, // 15分钟
  cleanupInterval: 300000 // 5分钟
});

export const sessionCache = new CacheService({
  maxItems: 10000,
  defaultTTL: 3600000, // 1小时
  cleanupInterval: 300000 // 5分钟
});

export const apiCache = new CacheService({
  maxItems: 3000,
  defaultTTL: 600000, // 10分钟
  cleanupInterval: 180000 // 3分钟
});

// 全局缓存管理器
export class CacheManager {
  private caches: Map<string, CacheService> = new Map();

  constructor() {
    this.caches.set('vocabulary', vocabularyCache);
    this.caches.set('user', userCache);
    this.caches.set('session', sessionCache);
    this.caches.set('api', apiCache);
  }

  // 获取缓存实例
  getCache(name: string): CacheService | null {
    return this.caches.get(name) || null;
  }

  // 获取所有缓存统计
  getAllStats(): { [name: string]: CacheStats } {
    const stats: { [name: string]: CacheStats } = {};
    for (const [name, cache] of this.caches.entries()) {
      stats[name] = cache.getStats();
    }
    return stats;
  }

  // 清理所有缓存
  clearAll(): void {
    for (const cache of this.caches.values()) {
      cache.clear();
    }
    logger.info('All caches cleared');
  }

  // 销毁所有缓存
  destroyAll(): void {
    for (const cache of this.caches.values()) {
      cache.destroy();
    }
    this.caches.clear();
    logger.info('All caches destroyed');
  }
}

export const cacheManager = new CacheManager();