/**
 * Monitoring and Logging Service
 * Error tracking, performance monitoring, and analytics
 */

// Error tracking and logging service
export class ErrorTracker {
  private static instance: ErrorTracker;
  private isInitialized = false;

  static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker();
    }
    return ErrorTracker.instance;
  }

  init() {
    if (this.isInitialized) return;

    // Initialize error tracking (Sentry, LogRocket, etc.)
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      this.setupGlobalErrorHandlers();
      this.setupPerformanceMonitoring();
      this.isInitialized = true;
    }
  }

  private setupGlobalErrorHandlers() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError(event.reason, {
        type: 'unhandledrejection',
        url: window.location.href,
        timestamp: new Date().toISOString(),
      });
    });

    // Handle JavaScript errors
    window.addEventListener('error', (event) => {
      this.captureError(event.error, {
        type: 'javascript_error',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        url: window.location.href,
        timestamp: new Date().toISOString(),
      });
    });
  }

  private setupPerformanceMonitoring() {
    if ('performance' in window) {
      // Monitor Core Web Vitals
      this.observeWebVitals();
      
      // Monitor resource loading
      this.observeResourceTiming();
      
      // Monitor navigation timing
      this.observeNavigationTiming();
    }
  }

  private observeWebVitals() {
    // Monitor Largest Contentful Paint (LCP)
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        this.captureMetric('LCP', entry.startTime, {
          element: (entry as any).element?.tagName,
          url: window.location.href,
        });
      });
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // Monitor First Input Delay (FID)
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        this.captureMetric('FID', (entry as any).processingStart - entry.startTime, {
          eventType: (entry as any).name,
          url: window.location.href,
        });
      });
    }).observe({ entryTypes: ['first-input'] });

    // Monitor Cumulative Layout Shift (CLS)
    let clsValue = 0;
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      });
      
      this.captureMetric('CLS', clsValue, {
        url: window.location.href,
      });
    }).observe({ entryTypes: ['layout-shift'] });
  }

  private observeResourceTiming() {
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        if (entry.duration > 1000) { // Log slow resources (>1s)
          this.captureMetric('slow_resource', entry.duration, {
            name: entry.name,
            type: (entry as any).initiatorType,
            size: (entry as any).transferSize,
            url: window.location.href,
          });
        }
      });
    }).observe({ entryTypes: ['resource'] });
  }

  private observeNavigationTiming() {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        this.captureMetric('page_load_time', navigation.loadEventEnd - navigation.fetchStart, {
          url: window.location.href,
          dns_time: navigation.domainLookupEnd - navigation.domainLookupStart,
          tcp_time: navigation.connectEnd - navigation.connectStart,
          server_time: navigation.responseStart - navigation.requestStart,
          dom_time: navigation.domContentLoadedEventEnd - navigation.responseEnd,
        });
      }, 0);
    });
  }

  captureError(error: Error | any, context?: Record<string, any>) {
    const errorInfo = {
      message: error?.message || String(error),
      stack: error?.stack,
      name: error?.name,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
      userId: this.getCurrentUserId(),
      context: context || {},
    };

    console.error('Error captured:', errorInfo);

    // Send to error tracking service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToErrorService(errorInfo);
    }
  }

  captureMetric(name: string, value: number, metadata?: Record<string, any>) {
    const metricInfo = {
      name,
      value,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : '',
      userId: this.getCurrentUserId(),
      metadata: metadata || {},
    };

    console.log('Metric captured:', metricInfo);

    // Send to analytics service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalyticsService(metricInfo);
    }
  }

  captureUserAction(action: string, data?: Record<string, any>) {
    const actionInfo = {
      action,
      data: data || {},
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : '',
      userId: this.getCurrentUserId(),
    };

    console.log('User action captured:', actionInfo);

    // Send to analytics service
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalyticsService(actionInfo);
    }
  }

  private getCurrentUserId(): string | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user).id : null;
    } catch {
      return null;
    }
  }

  private async sendToErrorService(errorInfo: any) {
    try {
      await fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorInfo),
      });
    } catch (error) {
      console.error('Failed to send error to service:', error);
    }
  }

  private async sendToAnalyticsService(data: any) {
    try {
      await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Failed to send analytics data:', error);
    }
  }

  // Public methods for manual tracking
  trackPageView(page: string, additionalData?: Record<string, any>) {
    this.captureUserAction('page_view', {
      page,
      referrer: typeof document !== 'undefined' ? document.referrer : '',
      ...additionalData,
    });
  }

  trackButtonClick(buttonName: string, additionalData?: Record<string, any>) {
    this.captureUserAction('button_click', {
      button_name: buttonName,
      ...additionalData,
    });
  }

  trackFormSubmission(formName: string, success: boolean, additionalData?: Record<string, any>) {
    this.captureUserAction('form_submission', {
      form_name: formName,
      success,
      ...additionalData,
    });
  }

  trackFeatureUsage(feature: string, additionalData?: Record<string, any>) {
    this.captureUserAction('feature_usage', {
      feature,
      ...additionalData,
    });
  }
}

// Performance monitoring utilities
export class PerformanceMonitor {
  private static marks: Map<string, number> = new Map();

  static startTiming(name: string) {
    this.marks.set(name, performance.now());
  }

  static endTiming(name: string): number {
    const startTime = this.marks.get(name);
    if (!startTime) {
      console.warn(`No start time found for ${name}`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.marks.delete(name);

    // Log slow operations
    if (duration > 100) {
      ErrorTracker.getInstance().captureMetric('slow_operation', duration, {
        operation: name,
      });
    }

    return duration;
  }

  static measureFunction<T extends (...args: any[]) => any>(
    functionName: string,
    fn: T
  ): T {
    return ((...args: any[]) => {
      PerformanceMonitor.startTiming(functionName);
      try {
        const result = fn(...args);
        if (result instanceof Promise) {
          return result.finally(() => {
            PerformanceMonitor.endTiming(functionName);
          });
        }
        PerformanceMonitor.endTiming(functionName);
        return result;
      } catch (error) {
        PerformanceMonitor.endTiming(functionName);
        throw error;
      }
    }) as T;
  }
}

// Logger utility
export class Logger {
  private static levels = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
  };

  private static currentLevel = process.env.NODE_ENV === 'production' 
    ? Logger.levels.WARN 
    : Logger.levels.DEBUG;

  static debug(message: string, data?: any) {
    if (Logger.currentLevel <= Logger.levels.DEBUG) {
      console.debug(`[DEBUG] ${message}`, data);
    }
  }

  static info(message: string, data?: any) {
    if (Logger.currentLevel <= Logger.levels.INFO) {
      console.info(`[INFO] ${message}`, data);
    }
  }

  static warn(message: string, data?: any) {
    if (Logger.currentLevel <= Logger.levels.WARN) {
      console.warn(`[WARN] ${message}`, data);
    }
  }

  static error(message: string, error?: Error | any, data?: any) {
    if (Logger.currentLevel <= Logger.levels.ERROR) {
      console.error(`[ERROR] ${message}`, error, data);
      
      // Also send to error tracking
      ErrorTracker.getInstance().captureError(error || new Error(message), {
        message,
        data,
      });
    }
  }
}

// Export singleton instance
export const errorTracker = ErrorTracker.getInstance();

// Simple error handler for components
export function createErrorHandler() {
  return (error: Error, errorInfo?: any) => {
    errorTracker.captureError(error, {
      componentStack: errorInfo?.componentStack,
      errorBoundary: true,
    });
  };
}

// Initialize monitoring when module loads
if (typeof window !== 'undefined') {
  errorTracker.init();
}