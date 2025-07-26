/**
 * useMemoryWarning Hook
 * Memory management and warning system
 */

import { useState, useEffect, useCallback } from 'react';
import { Platform, AppState } from 'react-native';
import { performanceOptimizer, PerformanceMetrics } from '../utils/PerformanceOptimizer';

interface MemoryWarningState {
  isLowMemory: boolean;
  memoryUsage: number;
  lastCleanup: number;
  metrics: PerformanceMetrics | null;
}

interface MemoryWarningReturn extends MemoryWarningState {
  performCleanup: () => Promise<void>;
  addCleanupTask: (task: () => void) => void;
  isOptimizing: boolean;
}

export const useMemoryWarning = (): MemoryWarningReturn => {
  const [state, setState] = useState<MemoryWarningState>({
    isLowMemory: false,
    memoryUsage: 0,
    lastCleanup: 0,
    metrics: null,
  });
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [cleanupTasks, setCleanupTasks] = useState<(() => void)[]>([]);

  // Monitor memory usage
  useEffect(() => {
    const checkMemoryUsage = () => {
      const usage = performanceOptimizer.getEstimatedMemoryUsage();
      const metrics = performanceOptimizer.getPerformanceMetrics();
      const isLow = usage > 50 * 1024 * 1024; // 50MB threshold

      setState(prev => ({
        ...prev,
        memoryUsage: usage,
        isLowMemory: isLow,
        metrics,
      }));

      // Auto cleanup if memory is very high
      if (usage > 100 * 1024 * 1024) { // 100MB auto-cleanup threshold
        performCleanup();
      }
    };

    // Initial check
    checkMemoryUsage();

    // Periodic monitoring
    const interval = setInterval(checkMemoryUsage, 10000); // Every 10 seconds

    return () => clearInterval(interval);
  }, []);

  // Monitor app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'background') {
        // Perform cleanup when app goes to background
        performCleanup();
      } else if (nextAppState === 'active') {
        // Check memory when app becomes active
        const usage = performanceOptimizer.getEstimatedMemoryUsage();
        setState(prev => ({ ...prev, memoryUsage: usage }));
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);

  // Memory cleanup function
  const performCleanup = useCallback(async () => {
    if (isOptimizing) return;

    try {
      setIsOptimizing(true);

      // Run performance optimizer cleanup
      await performanceOptimizer.cleanupMemory();

      // Run custom cleanup tasks
      for (const task of cleanupTasks) {
        try {
          task();
        } catch (error) {
          console.error('Cleanup task failed:', error);
        }
      }

      // Update state
      const newUsage = performanceOptimizer.getEstimatedMemoryUsage();
      const newMetrics = performanceOptimizer.getPerformanceMetrics();

      setState(prev => ({
        ...prev,
        memoryUsage: newUsage,
        lastCleanup: Date.now(),
        isLowMemory: newUsage > 50 * 1024 * 1024,
        metrics: newMetrics,
      }));

      console.log('Memory cleanup completed');
    } catch (error) {
      console.error('Memory cleanup failed:', error);
    } finally {
      setIsOptimizing(false);
    }
  }, [isOptimizing, cleanupTasks]);

  // Add cleanup task
  const addCleanupTask = useCallback((task: () => void) => {
    setCleanupTasks(prev => [...prev, task]);
  }, []);

  // Platform-specific memory warning handling
  useEffect(() => {
    if (Platform.OS === 'ios') {
      // iOS memory warning simulation
      // In production, this would use native module
      const memoryWarningSimulation = setInterval(() => {
        if (state.memoryUsage > 80 * 1024 * 1024) {
          console.warn('iOS Memory Warning Simulated');
          performCleanup();
        }
      }, 30000);

      return () => clearInterval(memoryWarningSimulation);
    }
  }, [state.memoryUsage, performCleanup]);

  return {
    ...state,
    performCleanup,
    addCleanupTask,
    isOptimizing,
  };
};