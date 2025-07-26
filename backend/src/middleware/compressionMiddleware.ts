import compression from 'compression';
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

// 压缩配置接口
interface CompressionConfig {
  level: number; // 压缩级别 1-9
  threshold: number; // 最小压缩阈值（字节）
  filter: (req: Request, res: Response) => boolean;
  chunkSize: number;
  windowBits: number;
  memLevel: number;
}

// 默认配置
const defaultConfig: CompressionConfig = {
  level: 6, // 平衡压缩率和性能
  threshold: 1024, // 1KB以上才压缩
  chunkSize: 16 * 1024, // 16KB块大小
  windowBits: 15, // 窗口大小
  memLevel: 8, // 内存级别
  filter: (req: Request, res: Response) => {
    // 自定义过滤逻辑
    if (req.headers['x-no-compression']) {
      return false;
    }
    
    // 检查Content-Type
    const contentType = res.getHeader('Content-Type') as string;
    if (contentType) {
      // 压缩文本类型内容
      return /text|json|javascript|css|xml|svg/.test(contentType);
    }
    
    return compression.filter(req, res);
  }
};

// 创建智能压缩中间件
export function createCompressionMiddleware(config: Partial<CompressionConfig> = {}) {
  const finalConfig = { ...defaultConfig, ...config };
  
  return compression({
    level: finalConfig.level,
    threshold: finalConfig.threshold,
    filter: finalConfig.filter,
    chunkSize: finalConfig.chunkSize,
    windowBits: finalConfig.windowBits,
    memLevel: finalConfig.memLevel
  });
}

// 响应大小统计中间件
export function responseSizeMiddleware(req: Request, res: Response, next: NextFunction) {
  const originalSend = res.send;
  const originalJson = res.json;
  
  // 重写send方法
  res.send = function(body: any) {
    const originalSize = Buffer.byteLength(body || '');
    
    // 记录响应大小
    res.setHeader('X-Original-Size', originalSize);
    
    // 调用原始send方法
    return originalSend.call(this, body);
  };
  
  // 重写json方法
  res.json = function(obj: any) {
    const jsonString = JSON.stringify(obj);
    const originalSize = Buffer.byteLength(jsonString);
    
    // 记录响应大小
    res.setHeader('X-Original-Size', originalSize);
    
    // 调用原始json方法
    return originalJson.call(this, obj);
  };
  
  // 记录压缩效果
  res.on('finish', () => {
    const originalSize = res.getHeader('X-Original-Size') as number;
    const contentEncoding = res.getHeader('Content-Encoding');
    const responseSize = res.getHeader('Content-Length') as number;
    
    if (originalSize && contentEncoding && responseSize) {
      const compressionRatio = ((originalSize - responseSize) / originalSize) * 100;
      
      logger.debug('Response compression stats', {
        path: req.path,
        method: req.method,
        originalSize,
        compressedSize: responseSize,
        compressionRatio: Math.round(compressionRatio * 100) / 100,
        encoding: contentEncoding
      });
    }
  });
  
  next();
}

// 压缩分析中间件
export class CompressionAnalyzer {
  private stats: {
    totalRequests: number;
    compressedRequests: number;
    totalOriginalSize: number;
    totalCompressedSize: number;
    averageCompressionRatio: number;
    compressionsByType: { [contentType: string]: number };
  } = {
    totalRequests: 0,
    compressedRequests: 0,
    totalOriginalSize: 0,
    totalCompressedSize: 0,
    averageCompressionRatio: 0,
    compressionsByType: {}
  };

  middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      this.stats.totalRequests++;
      
      res.on('finish', () => {
        const originalSize = res.getHeader('X-Original-Size') as number;
        const contentEncoding = res.getHeader('Content-Encoding');
        const responseSize = res.getHeader('Content-Length') as number;
        const contentType = res.getHeader('Content-Type') as string;
        
        if (originalSize) {
          this.stats.totalOriginalSize += originalSize;
          
          if (contentEncoding && responseSize) {
            this.stats.compressedRequests++;
            this.stats.totalCompressedSize += responseSize;
            
            // 按内容类型统计
            const baseContentType = contentType?.split(';')[0] || 'unknown';
            this.stats.compressionsByType[baseContentType] = 
              (this.stats.compressionsByType[baseContentType] || 0) + 1;
            
            // 更新平均压缩率
            if (this.stats.totalOriginalSize > 0) {
              this.stats.averageCompressionRatio = 
                ((this.stats.totalOriginalSize - this.stats.totalCompressedSize) / 
                 this.stats.totalOriginalSize) * 100;
            }
          }
        }
      });
      
      next();
    };
  }

  getStats() {
    return {
      ...this.stats,
      compressionRate: this.stats.totalRequests > 0 
        ? (this.stats.compressedRequests / this.stats.totalRequests) * 100 
        : 0,
      averageCompressionRatio: Math.round(this.stats.averageCompressionRatio * 100) / 100,
      totalSavings: this.stats.totalOriginalSize - this.stats.totalCompressedSize
    };
  }

  reset() {
    this.stats = {
      totalRequests: 0,
      compressedRequests: 0,
      totalOriginalSize: 0,
      totalCompressedSize: 0,
      averageCompressionRatio: 0,
      compressionsByType: {}
    };
  }
}

// 静态资源压缩优化
export function staticCompressionMiddleware(req: Request, res: Response, next: NextFunction) {
  const isStaticAsset = /\.(js|css|html|json|xml|txt)$/.test(req.path);
  
  if (isStaticAsset) {
    // 为静态资源设置更强的压缩
    res.setHeader('Vary', 'Accept-Encoding');
    
    // 设置缓存头
    const oneYear = 365 * 24 * 60 * 60 * 1000;
    res.setHeader('Cache-Control', `public, max-age=${oneYear}`);
    res.setHeader('Expires', new Date(Date.now() + oneYear).toUTCString());
  }
  
  next();
}

// Brotli压缩支持检测
export function brotliSupportMiddleware(req: Request, res: Response, next: NextFunction) {
  const acceptEncoding = req.headers['accept-encoding'] || '';
  
  if (acceptEncoding.includes('br')) {
    // 客户端支持Brotli，设置标识
    (req as any).supportsBrotli = true;
  }
  
  next();
}

// 压缩策略选择器
export function adaptiveCompressionMiddleware(req: Request, res: Response, next: NextFunction) {
  const userAgent = req.headers['user-agent'] || '';
  const acceptEncoding = req.headers['accept-encoding'] || '';
  
  // 根据客户端特性调整压缩策略
  if (userAgent.includes('Mobile')) {
    // 移动设备使用更高压缩比
    res.setHeader('X-Compression-Strategy', 'mobile-optimized');
  } else if (acceptEncoding.includes('gzip') && !acceptEncoding.includes('br')) {
    // 只支持gzip的老客户端
    res.setHeader('X-Compression-Strategy', 'legacy-compatible');
  } else {
    // 现代客户端使用标准策略
    res.setHeader('X-Compression-Strategy', 'standard');
  }
  
  next();
}

export const compressionAnalyzer = new CompressionAnalyzer();