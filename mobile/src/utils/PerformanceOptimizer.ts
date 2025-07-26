/**
 * Performance Optimizer
 * Mobile-specific performance optimization utilities
 */

import { InteractionManager, Platform } from 'react-native';
import { MMKV } from 'react-native-mmkv';

// Initialize performance storage
const performanceStorage = new MMKV({
  id: 'performance-metrics',
});

export interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  cacheSize: number;
  lastOptimization: number;
}

class PerformanceOptimizer {
  private renderStartTime: number = 0;
  private memoryWarningThreshold: number = 100 * 1024 * 1024; // 100MB
  private cacheCleanupInterval: NodeJS.Timeout | null = null;
  private optimizationQueue: (() => void)[] = [];

  constructor() {
    this.initializeOptimization();
  }

  private initializeOptimization() {
    // Start periodic optimization
    this.startPeriodicOptimization();

    // Monitor memory warnings on iOS
    if (Platform.OS === 'ios') {
      // Note: Would need native module for actual memory warning detection
      this.simulateMemoryMonitoring();
    }
  }

  /**
   * Image Optimization
   */
  optimizeImageUri(uri: string, width: number, height: number): string {
    // For production, this would integrate with image optimization service
    const params = new URLSearchParams({
      w: width.toString(),
      h: height.toString(),
      q: '80', // Quality
      f: 'webp', // Format
    });

    return `${uri}?${params.toString()}`;
  }

  resizeImageForDevice(originalWidth: number, originalHeight: number): {
    width: number;
    height: number;
  } {
    const devicePixelRatio = Platform.select({
      ios: 2, // Most iOS devices
      android: 2.5, // Average Android density
      default: 2,
    });

    const maxWidth = 400 * devicePixelRatio;
    const maxHeight = 300 * devicePixelRatio;

    const aspectRatio = originalWidth / originalHeight;

    let newWidth = originalWidth;
    let newHeight = originalHeight;

    if (newWidth > maxWidth) {
      newWidth = maxWidth;
      newHeight = newWidth / aspectRatio;
    }

    if (newHeight > maxHeight) {
      newHeight = maxHeight;
      newWidth = newHeight * aspectRatio;
    }

    return {
      width: Math.round(newWidth),
      height: Math.round(newHeight),
    };
  }

  /**
   * Memory Management
   */
  getEstimatedMemoryUsage(): number {
    // Rough estimation based on cached data
    try {
      const cacheKeys = performanceStorage.getAllKeys();
      let totalSize = 0;

      cacheKeys.forEach(key => {
        const value = performanceStorage.getString(key);
        if (value) {
          totalSize += value.length * 2; // Rough character to byte conversion
        }
      });

      return totalSize;
    } catch (error) {
      console.error('Failed to estimate memory usage:', error);
      return 0;
    }
  }

  async cleanupMemory(): Promise<void> {
    try {
      // Clear old cached images
      this.clearOldImageCache();

      // Clear temporary data
      this.clearTemporaryData();

      // Force garbage collection (if available)
      if (global.gc) {
        global.gc();
      }

      // Update metrics
      const metrics: PerformanceMetrics = {
        renderTime: 0,
        memoryUsage: this.getEstimatedMemoryUsage(),
        cacheSize: 0,
        lastOptimization: Date.now(),
      };

      performanceStorage.set('metrics', JSON.stringify(metrics));
      
      console.log('Memory cleanup completed');
    } catch (error) {
      console.error('Memory cleanup failed:', error);
    }
  }

  private clearOldImageCache(): void {
    // Clear images older than 7 days
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const cacheKeys = performanceStorage.getAllKeys();

    cacheKeys.forEach(key => {
      if (key.startsWith('image_cache_')) {
        const cacheData = performanceStorage.getString(key);
        if (cacheData) {
          try {
            const data = JSON.parse(cacheData);
            if (data.timestamp < oneWeekAgo) {
              performanceStorage.delete(key);
            }
          } catch (error) {
            // Invalid cache data, remove it
            performanceStorage.delete(key);
          }
        }
      }
    });
  }

  private clearTemporaryData(): void {
    const tempKeys = performanceStorage.getAllKeys().filter(key =>
      key.startsWith('temp_') || key.startsWith('session_')
    );

    tempKeys.forEach(key => {
      performanceStorage.delete(key);
    });
  }

  /**
   * Render Performance
   */
  startRenderMeasurement(): void {
    this.renderStartTime = Date.now();
  }

  endRenderMeasurement(componentName: string): void {
    if (this.renderStartTime === 0) return;

    const renderTime = Date.now() - this.renderStartTime;
    this.renderStartTime = 0;

    // Log slow renders
    if (renderTime > 16) { // 16ms for 60fps
      console.warn(`Slow render detected in ${componentName}: ${renderTime}ms`);
    }

    // Store render metrics
    const key = `render_${componentName}_${Date.now()}`;
    performanceStorage.set(key, renderTime.toString());

    // Keep only recent render metrics (last 100)
    this.cleanupRenderMetrics();
  }

  private cleanupRenderMetrics(): void {
    const renderKeys = performanceStorage.getAllKeys()
      .filter(key => key.startsWith('render_'))
      .sort()
      .reverse();

    // Keep only the latest 100 render metrics
    renderKeys.slice(100).forEach(key => {
      performanceStorage.delete(key);
    });
  }

  /**
   * List Optimization
   */
  getOptimalItemSize(): { itemHeight: number; containerHeight: number } {
    const screenDensity = Platform.select({
      ios: 2,
      android: 2.5,
      default: 2,
    });

    return {
      itemHeight: 80 * screenDensity,
      containerHeight: 400 * screenDensity,
    };
  }

  shouldVirtualizeList(itemCount: number): boolean {
    // Virtualize lists with more than 20 items
    return itemCount > 20;
  }

  getOptimalWindowSize(totalItems: number): number {
    // Dynamic window size based on total items
    if (totalItems < 50) return 10;
    if (totalItems < 200) return 20;
    return 50;
  }

  /**
   * Network Optimization
   */
  shouldUseCache(url: string, maxAge: number = 300000): boolean {
    const cacheKey = `network_cache_${this.hashString(url)}`;
    const cachedData = performanceStorage.getString(cacheKey);

    if (!cachedData) return false;

    try {
      const data = JSON.parse(cachedData);
      return Date.now() - data.timestamp < maxAge;
    } catch (error) {
      return false;
    }
  }

  cacheNetworkResponse(url: string, response: any): void {
    const cacheKey = `network_cache_${this.hashString(url)}`;
    const cacheData = {
      response,
      timestamp: Date.now(),
    };

    performanceStorage.set(cacheKey, JSON.stringify(cacheData));
  }

  getCachedResponse(url: string): any | null {
    const cacheKey = `network_cache_${this.hashString(url)}`;
    const cachedData = performanceStorage.getString(cacheKey);

    if (!cachedData) return null;

    try {
      const data = JSON.parse(cachedData);
      return data.response;
    } catch (error) {
      return null;
    }
  }

  private hashString(str: string): string {
    let hash = 0;
    if (str.length === 0) return hash.toString();
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString();
  }

  /**
   * Animation Optimization
   */
  getOptimalAnimationConfig(): {
    useNativeDriver: boolean;
    duration: number;
    easing: string;
  } {
    return {
      useNativeDriver: true, // Always use native driver when possible
      duration: Platform.select({
        ios: 300,
        android: 250, // Slightly faster on Android
        default: 300,
      }),
      easing: 'ease-out',
    };
  }

  scheduleAnimation(animationFn: () => void): void {
    InteractionManager.runAfterInteractions(() => {
      requestAnimationFrame(animationFn);
    });
  }

  /**
   * Bundle Size Optimization
   */
  lazyImport<T>(importFn: () => Promise<T>): () => Promise<T> {
    let cachedModule: T | null = null;
    
    return async (): Promise<T> => {
      if (cachedModule) {
        return cachedModule;
      }

      cachedModule = await importFn();
      return cachedModule;
    };
  }

  /**
   * Periodic Optimization
   */
  private startPeriodicOptimization(): void {
    // Run optimization every 5 minutes
    this.cacheCleanupInterval = setInterval(() => {
      this.performPeriodicOptimization();
    }, 5 * 60 * 1000);
  }

  private async performPeriodicOptimization(): Promise<void> {
    const memoryUsage = this.getEstimatedMemoryUsage();
    
    if (memoryUsage > this.memoryWarningThreshold) {
      console.log('Memory threshold exceeded, performing cleanup...');
      await this.cleanupMemory();
    }

    // Process optimization queue
    while (this.optimizationQueue.length > 0) {
      const task = this.optimizationQueue.shift();
      if (task) {
        try {
          task();
        } catch (error) {
          console.error('Optimization task failed:', error);
        }
      }
    }
  }

  private simulateMemoryMonitoring(): void {
    // Simulate memory monitoring for demonstration
    setInterval(() => {
      const usage = this.getEstimatedMemoryUsage();
      if (usage > this.memoryWarningThreshold) {
        console.warn('High memory usage detected:', usage);
        this.cleanupMemory();
      }
    }, 30000); // Check every 30 seconds
  }

  /**
   * Public API
   */
  queueOptimization(task: () => void): void {
    this.optimizationQueue.push(task);
  }

  getPerformanceMetrics(): PerformanceMetrics | null {
    try {
      const metrics = performanceStorage.getString('metrics');
      return metrics ? JSON.parse(metrics) : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.cacheCleanupInterval) {
      clearInterval(this.cacheCleanupInterval);
      this.cacheCleanupInterval = null;
    }

    this.optimizationQueue = [];
    console.log('PerformanceOptimizer destroyed');
  }
}

// Export singleton instance
export const performanceOptimizer = new PerformanceOptimizer();
export default performanceOptimizer;