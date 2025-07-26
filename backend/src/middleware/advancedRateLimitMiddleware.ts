import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { sessionCache } from '../services/cacheService';

// 限流配置接口
interface RateLimitConfig {
  windowMs: number;
  max: number;
  message: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: Request) => string;
  skip?: (req: Request) => boolean;
  onLimitReached?: (req: Request, res: Response) => void;
}

// 限流统计接口
interface RateLimitStats {
  totalRequests: number;
  blockedRequests: number;
  uniqueIPs: number;
  topOffenders: {
    key: string;
    requests: number;
    blocked: number;
  }[];
  rateLimitsByEndpoint: {
    [endpoint: string]: {
      requests: number;
      blocked: number;
      avgResponseTime: number;
    };
  };
}

// 智能限流管理器
export class AdvancedRateLimitManager {
  private stats: RateLimitStats = {
    totalRequests: 0,
    blockedRequests: 0,
    uniqueIPs: 0,
    topOffenders: [],
    rateLimitsByEndpoint: {}
  };
  
  private requestCounts: Map<string, number> = new Map();
  private blockedCounts: Map<string, number> = new Map();
  private responseTimes: Map<string, number[]> = new Map();

  // 创建基础限流中间件
  createBasicRateLimit(config: RateLimitConfig): RateLimitRequestHandler {
    return rateLimit({
      windowMs: config.windowMs,
      max: config.max,
      message: { error: config.message },
      standardHeaders: true,
      legacyHeaders: false,
      skipSuccessfulRequests: config.skipSuccessfulRequests || false,
      skipFailedRequests: config.skipFailedRequests || false,
      keyGenerator: config.keyGenerator || this.defaultKeyGenerator,
      skip: config.skip || (() => false),
      onLimitReached: (req: Request, res: Response) => {
        this.recordBlocked(req);
        if (config.onLimitReached) {
          config.onLimitReached(req, res);
        }
        logger.warn('Rate limit exceeded', {
          ip: req.ip,
          path: req.path,
          method: req.method,
          userAgent: req.get('User-Agent')
        });
      }
    });
  }

  // 创建自适应限流中间件
  createAdaptiveRateLimit(baseConfig: RateLimitConfig): RateLimitRequestHandler {
    return (req: Request, res: Response, next: NextFunction) => {
      const key = baseConfig.keyGenerator ? baseConfig.keyGenerator(req) : this.defaultKeyGenerator(req);
      
      // 根据历史行为调整限制
      const adjustedMax = this.calculateAdaptiveLimit(key, baseConfig.max);
      
      // 创建动态限流器
      const dynamicLimiter = rateLimit({
        ...baseConfig,
        max: adjustedMax,
        keyGenerator: () => key,
        onLimitReached: (req: Request, res: Response) => {
          this.recordBlocked(req);
          logger.warn('Adaptive rate limit exceeded', {
            ip: req.ip,
            path: req.path,
            originalLimit: baseConfig.max,
            adjustedLimit: adjustedMax
          });
        }
      });

      this.recordRequest(req);
      dynamicLimiter(req, res, next);
    };
  }

  // 创建滑动窗口限流
  createSlidingWindowRateLimit(config: RateLimitConfig): (req: Request, res: Response, next: NextFunction) => void {
    return (req: Request, res: Response, next: NextFunction) => {
      const key = config.keyGenerator ? config.keyGenerator(req) : this.defaultKeyGenerator(req);
      const now = Date.now();
      const windowStart = now - config.windowMs;
      
      // 获取请求历史
      const requestHistory = this.getRequestHistory(key);
      
      // 清理过期请求
      const recentRequests = requestHistory.filter(timestamp => timestamp > windowStart);
      
      if (recentRequests.length >= config.max) {
        // 超出限制
        this.recordBlocked(req);
        res.status(429).json({
          error: config.message,
          retryAfter: Math.ceil((recentRequests[0] + config.windowMs - now) / 1000)
        });
        return;
      }
      
      // 记录当前请求
      recentRequests.push(now);
      this.setRequestHistory(key, recentRequests);
      this.recordRequest(req);
      
      next();
    };
  }

  // 基于用户角色的限流
  createRoleBasedRateLimit(roleConfigs: { [role: string]: RateLimitConfig }): (req: Request, res: Response, next: NextFunction) => void {
    return (req: Request, res: Response, next: NextFunction) => {
      const userRole = this.getUserRole(req);
      const config = roleConfigs[userRole] || roleConfigs['default'];
      
      if (!config) {
        return next();
      }
      
      const roleLimiter = this.createBasicRateLimit(config);
      roleLimiter(req, res, next);
    };
  }

  // 地理位置基础限流
  createGeoBasedRateLimit(geoConfigs: { [region: string]: RateLimitConfig }): (req: Request, res: Response, next: NextFunction) => void {
    return (req: Request, res: Response, next: NextFunction) => {
      const region = this.getRegionFromIP(req.ip);
      const config = geoConfigs[region] || geoConfigs['default'];
      
      if (!config) {
        return next();
      }
      
      const geoLimiter = this.createBasicRateLimit({
        ...config,
        keyGenerator: (req) => `geo:${region}:${req.ip}`
      });
      
      geoLimiter(req, res, next);
    };
  }

  // 端点特定限流
  createEndpointSpecificRateLimit(endpointConfigs: { [pattern: string]: RateLimitConfig }): (req: Request, res: Response, next: NextFunction) => void {
    return (req: Request, res: Response, next: NextFunction) => {
      const path = req.path;
      let matchedConfig: RateLimitConfig | null = null;
      
      // 查找匹配的端点配置
      for (const [pattern, config] of Object.entries(endpointConfigs)) {
        if (this.matchPath(path, pattern)) {
          matchedConfig = config;
          break;
        }
      }
      
      if (!matchedConfig) {
        return next();
      }
      
      const endpointLimiter = this.createBasicRateLimit({
        ...matchedConfig,
        keyGenerator: (req) => `endpoint:${path}:${req.ip}`
      });
      
      endpointLimiter(req, res, next);
    };
  }

  // 创建令牌桶限流
  createTokenBucketRateLimit(capacity: number, refillRate: number, refillInterval: number): (req: Request, res: Response, next: NextFunction) => void {
    const buckets = new Map<string, { tokens: number; lastRefill: number }>();
    
    return (req: Request, res: Response, next: NextFunction) => {
      const key = this.defaultKeyGenerator(req);
      const now = Date.now();
      
      // 获取或创建令牌桶
      let bucket = buckets.get(key);
      if (!bucket) {
        bucket = { tokens: capacity, lastRefill: now };
        buckets.set(key, bucket);
      }
      
      // 计算应该添加的令牌数
      const timePassed = now - bucket.lastRefill;
      const tokensToAdd = Math.floor(timePassed / refillInterval) * refillRate;
      
      if (tokensToAdd > 0) {
        bucket.tokens = Math.min(capacity, bucket.tokens + tokensToAdd);
        bucket.lastRefill = now;
      }
      
      // 检查是否有可用令牌
      if (bucket.tokens < 1) {
        this.recordBlocked(req);
        res.status(429).json({
          error: 'Rate limit exceeded - no tokens available',
          retryAfter: Math.ceil(refillInterval / 1000)
        });
        return;
      }
      
      // 消费一个令牌
      bucket.tokens--;
      this.recordRequest(req);
      next();
    };
  }

  // 分布式限流（使用缓存）
  createDistributedRateLimit(config: RateLimitConfig): (req: Request, res: Response, next: NextFunction) => void {
    return async (req: Request, res: Response, next: NextFunction) => {
      const key = config.keyGenerator ? config.keyGenerator(req) : this.defaultKeyGenerator(req);
      const cacheKey = `ratelimit:${key}`;
      const now = Date.now();
      
      try {
        // 获取当前计数
        const currentData = sessionCache.get<{ count: number; resetTime: number }>(cacheKey);
        
        let count = 0;
        let resetTime = now + config.windowMs;
        
        if (currentData) {
          if (now < currentData.resetTime) {
            count = currentData.count;
            resetTime = currentData.resetTime;
          }
        }
        
        if (count >= config.max) {
          this.recordBlocked(req);
          res.status(429).json({
            error: config.message,
            retryAfter: Math.ceil((resetTime - now) / 1000)
          });
          return;
        }
        
        // 增加计数
        count++;
        sessionCache.set(cacheKey, { count, resetTime }, resetTime - now);
        
        // 设置响应头
        res.setHeader('X-RateLimit-Limit', config.max);
        res.setHeader('X-RateLimit-Remaining', Math.max(0, config.max - count));
        res.setHeader('X-RateLimit-Reset', Math.ceil(resetTime / 1000));
        
        this.recordRequest(req);
        next();
        
      } catch (error) {
        logger.error('Distributed rate limit error', { error });
        next(); // 发生错误时不阻止请求
      }
    };
  }

  // 获取限流统计
  getStats(): RateLimitStats {
    // 计算Top违规者
    const topOffenders = Array.from(this.requestCounts.entries())
      .map(([key, requests]) => ({
        key,
        requests,
        blocked: this.blockedCounts.get(key) || 0
      }))
      .sort((a, b) => b.blocked - a.blocked)
      .slice(0, 10);

    // 计算端点统计
    const rateLimitsByEndpoint: { [endpoint: string]: any } = {};
    for (const [endpoint, times] of this.responseTimes.entries()) {
      const requests = this.requestCounts.get(endpoint) || 0;
      const blocked = this.blockedCounts.get(endpoint) || 0;
      const avgResponseTime = times.length > 0 
        ? times.reduce((sum, time) => sum + time, 0) / times.length 
        : 0;
      
      rateLimitsByEndpoint[endpoint] = {
        requests,
        blocked,
        avgResponseTime: Math.round(avgResponseTime)
      };
    }

    return {
      ...this.stats,
      topOffenders,
      rateLimitsByEndpoint,
      uniqueIPs: this.requestCounts.size
    };
  }

  // 重置统计
  resetStats(): void {
    this.stats = {
      totalRequests: 0,
      blockedRequests: 0,
      uniqueIPs: 0,
      topOffenders: [],
      rateLimitsByEndpoint: {}
    };
    this.requestCounts.clear();
    this.blockedCounts.clear();
    this.responseTimes.clear();
  }

  // 私有方法
  private defaultKeyGenerator(req: Request): string {
    return req.ip || 'unknown';
  }

  private recordRequest(req: Request): void {
    const key = this.defaultKeyGenerator(req);
    const endpoint = `${req.method} ${req.path}`;
    
    this.stats.totalRequests++;
    this.requestCounts.set(key, (this.requestCounts.get(key) || 0) + 1);
    
    // 记录响应时间
    const startTime = Date.now();
    req.on('end', () => {
      const responseTime = Date.now() - startTime;
      const times = this.responseTimes.get(endpoint) || [];
      times.push(responseTime);
      if (times.length > 100) times.shift(); // 保持最近100个记录
      this.responseTimes.set(endpoint, times);
    });
  }

  private recordBlocked(req: Request): void {
    const key = this.defaultKeyGenerator(req);
    this.stats.blockedRequests++;
    this.blockedCounts.set(key, (this.blockedCounts.get(key) || 0) + 1);
  }

  private calculateAdaptiveLimit(key: string, baseLimit: number): number {
    const requests = this.requestCounts.get(key) || 0;
    const blocked = this.blockedCounts.get(key) || 0;
    
    // 如果用户频繁被阻止，降低限制
    if (blocked > 5) {
      return Math.max(1, Math.floor(baseLimit * 0.5));
    }
    
    // 如果用户行为良好，可以适当提高限制
    if (requests > 100 && blocked === 0) {
      return Math.floor(baseLimit * 1.2);
    }
    
    return baseLimit;
  }

  private getRequestHistory(key: string): number[] {
    const cacheKey = `history:${key}`;
    return sessionCache.get<number[]>(cacheKey) || [];
  }

  private setRequestHistory(key: string, history: number[]): void {
    const cacheKey = `history:${key}`;
    sessionCache.set(cacheKey, history, 3600000); // 1小时缓存
  }

  private getUserRole(req: Request): string {
    // 从JWT token或session中获取用户角色
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
      // 简化的角色检测逻辑
      try {
        // 在实际应用中应该验证JWT token
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        return payload.role || 'user';
      } catch {
        return 'anonymous';
      }
    }
    return 'anonymous';
  }

  private getRegionFromIP(ip: string): string {
    // 简化的地理位置检测
    // 实际应用中应该使用GeoIP数据库
    if (ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
      return 'local';
    }
    return 'default';
  }

  private matchPath(path: string, pattern: string): boolean {
    // 简单的路径匹配逻辑
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return regex.test(path);
  }
}

// 预定义的限流配置
export const rateLimitConfigs = {
  // 严格限流 - 用于敏感操作
  strict: {
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 5,
    message: 'Too many requests, please try again later'
  },
  
  // 标准限流 - 用于一般API
  standard: {
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 100,
    message: 'Rate limit exceeded'
  },
  
  // 宽松限流 - 用于公共资源
  lenient: {
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 1000,
    message: 'Rate limit exceeded'
  },
  
  // 用户角色限流
  roleBasedConfigs: {
    admin: {
      windowMs: 15 * 60 * 1000,
      max: 1000,
      message: 'Admin rate limit exceeded'
    },
    user: {
      windowMs: 15 * 60 * 1000,
      max: 100,
      message: 'User rate limit exceeded'
    },
    anonymous: {
      windowMs: 15 * 60 * 1000,
      max: 20,
      message: 'Anonymous user rate limit exceeded'
    },
    default: {
      windowMs: 15 * 60 * 1000,
      max: 50,
      message: 'Default rate limit exceeded'
    }
  },
  
  // 端点特定限流
  endpointConfigs: {
    '/api/auth/login': {
      windowMs: 15 * 60 * 1000,
      max: 5,
      message: 'Too many login attempts'
    },
    '/api/auth/register': {
      windowMs: 60 * 60 * 1000, // 1小时
      max: 3,
      message: 'Too many registration attempts'
    },
    '/api/admin/*': {
      windowMs: 15 * 60 * 1000,
      max: 200,
      message: 'Admin API rate limit exceeded'
    },
    '/api/search': {
      windowMs: 60 * 1000, // 1分钟
      max: 30,
      message: 'Search rate limit exceeded'
    }
  }
};

// 创建全局限流管理器实例
export const rateLimitManager = new AdvancedRateLimitManager();