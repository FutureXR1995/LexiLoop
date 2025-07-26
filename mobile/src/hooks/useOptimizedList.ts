/**
 * useOptimizedList Hook
 * Performance-optimized list rendering hook
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Dimensions } from 'react-native';
import { performanceOptimizer } from '../utils/PerformanceOptimizer';

interface OptimizedListConfig {
  data: any[];
  itemHeight: number;
  containerHeight?: number;
  windowSize?: number;
  keyExtractor?: (item: any, index: number) => string;
  enableVirtualization?: boolean;
}

interface OptimizedListReturn {
  visibleItems: any[];
  totalHeight: number;
  shouldVirtualize: boolean;
  windowSize: number;
  scrollOffset: number;
  onScroll: (event: any) => void;
  getItemLayout: (data: any, index: number) => {
    length: number;
    offset: number;
    index: number;
  };
}

export const useOptimizedList = ({
  data,
  itemHeight,
  containerHeight,
  windowSize,
  keyExtractor = (item, index) => index.toString(),
  enableVirtualization = true,
}: OptimizedListConfig): OptimizedListReturn => {
  const [scrollOffset, setScrollOffset] = useState(0);
  const { height: screenHeight } = Dimensions.get('window');

  // Calculate optimal configuration
  const config = useMemo(() => {
    const shouldVirtualize = enableVirtualization && 
      performanceOptimizer.shouldVirtualizeList(data.length);
    
    const optimalWindowSize = windowSize || 
      performanceOptimizer.getOptimalWindowSize(data.length);
    
    const effectiveContainerHeight = containerHeight || screenHeight;

    return {
      shouldVirtualize,
      windowSize: optimalWindowSize,
      containerHeight: effectiveContainerHeight,
    };
  }, [data.length, windowSize, containerHeight, screenHeight, enableVirtualization]);

  // Calculate visible items for virtualization
  const visibleItems = useMemo(() => {
    if (!config.shouldVirtualize) {
      return data;
    }

    const viewportTop = scrollOffset;
    const viewportBottom = scrollOffset + config.containerHeight;
    
    // Add buffer for smooth scrolling
    const bufferSize = Math.ceil(config.windowSize / 4);
    
    const startIndex = Math.max(0, 
      Math.floor(viewportTop / itemHeight) - bufferSize
    );
    
    const endIndex = Math.min(data.length, 
      Math.ceil(viewportBottom / itemHeight) + bufferSize
    );

    return data.slice(startIndex, endIndex).map((item, index) => ({
      ...item,
      _originalIndex: startIndex + index,
      _key: keyExtractor(item, startIndex + index),
    }));
  }, [
    data, 
    scrollOffset, 
    itemHeight, 
    config.shouldVirtualize, 
    config.containerHeight, 
    config.windowSize,
    keyExtractor,
  ]);

  // Total list height
  const totalHeight = useMemo(() => {
    return data.length * itemHeight;
  }, [data.length, itemHeight]);

  // Optimized scroll handler
  const onScroll = useCallback((event: any) => {
    const newOffset = event.nativeEvent.contentOffset.y;
    
    // Throttle scroll updates for performance
    requestAnimationFrame(() => {
      setScrollOffset(newOffset);
    });
  }, []);

  // Item layout calculator for FlatList optimization
  const getItemLayout = useCallback((data: any, index: number) => ({
    length: itemHeight,
    offset: itemHeight * index,
    index,
  }), [itemHeight]);

  return {
    visibleItems,
    totalHeight,
    shouldVirtualize: config.shouldVirtualize,
    windowSize: config.windowSize,
    scrollOffset,
    onScroll,
    getItemLayout,
  };
};