/**
 * OptimizedImage Component
 * Memory-efficient image component with caching and optimization
 */

import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import FastImage, { FastImageProps } from 'react-native-fast-image';
import { Text } from 'react-native-paper';
import { MMKV } from 'react-native-mmkv';

import { performanceOptimizer } from '../utils/PerformanceOptimizer';
import { theme } from '../utils/theme';

const imageCache = new MMKV({ id: 'image-cache' });
const { width: screenWidth } = Dimensions.get('window');

interface OptimizedImageProps extends Omit<FastImageProps, 'source'> {
  uri: string;
  width?: number;
  height?: number;
  placeholder?: React.ReactNode;
  fallback?: React.ReactNode;
  cacheKey?: string;
  maxAge?: number;
  resizeMode?: 'contain' | 'cover' | 'stretch' | 'center';
  priority?: 'low' | 'normal' | 'high';
  onLoad?: () => void;
  onError?: (error: any) => void;
}

const OptimizedImage: React.FC<OptimizedImageProps> = memo(({
  uri,
  width = screenWidth,
  height = 200,
  placeholder,
  fallback,
  cacheKey,
  maxAge = 24 * 60 * 60 * 1000, // 24 hours
  resizeMode = 'cover',
  priority = 'normal',
  onLoad,
  onError,
  style,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [optimizedUri, setOptimizedUri] = useState<string>('');

  // Generate cache key
  const getCacheKey = useCallback((uri: string, width: number, height: number): string => {
    return cacheKey || `img_${performanceOptimizer['hashString'](uri)}_${width}x${height}`;
  }, [cacheKey]);

  // Check cache and optimize image
  useEffect(() => {
    const initializeImage = async () => {
      try {
        const key = getCacheKey(uri, width, height);
        const cached = imageCache.getString(key);

        // Check if we have valid cached data
        if (cached) {
          try {
            const cacheData = JSON.parse(cached);
            const isExpired = Date.now() - cacheData.timestamp > maxAge;

            if (!isExpired && cacheData.optimizedUri) {
              setOptimizedUri(cacheData.optimizedUri);
              setIsLoading(false);
              return;
            }
          } catch (error) {
            // Invalid cache data, remove it
            imageCache.delete(key);
          }
        }

        // Optimize image dimensions for device
        const optimizedDimensions = performanceOptimizer.resizeImageForDevice(width, height);
        
        // Generate optimized URI
        const newOptimizedUri = performanceOptimizer.optimizeImageUri(
          uri,
          optimizedDimensions.width,
          optimizedDimensions.height
        );

        // Cache the optimized URI
        const cacheData = {
          optimizedUri: newOptimizedUri,
          timestamp: Date.now(),
          dimensions: optimizedDimensions,
        };
        imageCache.set(key, JSON.stringify(cacheData));

        setOptimizedUri(newOptimizedUri);
      } catch (error) {
        console.error('Image optimization failed:', error);
        setOptimizedUri(uri); // Fallback to original URI
      }
    };

    if (uri) {
      initializeImage();
    }
  }, [uri, width, height, getCacheKey, maxAge]);

  // Handle image load
  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
    if (onLoad) {
      onLoad();
    }
  }, [onLoad]);

  // Handle image error
  const handleError = useCallback((error: any) => {
    setIsLoading(false);
    setHasError(true);
    if (onError) {
      onError(error);
    }
  }, [onError]);

  // Get FastImage priority
  const getFastImagePriority = useCallback((priority: string) => {
    switch (priority) {
      case 'low':
        return FastImage.priority.low;
      case 'high':
        return FastImage.priority.high;
      default:
        return FastImage.priority.normal;
    }
  }, []);

  // Get FastImage resize mode
  const getFastImageResizeMode = useCallback((mode: string) => {
    switch (mode) {
      case 'contain':
        return FastImage.resizeMode.contain;
      case 'cover':
        return FastImage.resizeMode.cover;
      case 'stretch':
        return FastImage.resizeMode.stretch;
      case 'center':
        return FastImage.resizeMode.center;
      default:
        return FastImage.resizeMode.cover;
    }
  }, []);

  // Render loading placeholder
  const renderPlaceholder = () => {
    if (placeholder) {
      return placeholder;
    }

    return (
      <View style={[styles.placeholder, { width, height }]}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  };

  // Render error fallback
  const renderFallback = () => {
    if (fallback) {
      return fallback;
    }

    return (
      <View style={[styles.fallback, { width, height }]}>
        <Text style={styles.fallbackText}>Image not available</Text>
      </View>
    );
  };

  // Don't render anything if no URI
  if (!uri) {
    return renderFallback();
  }

  // Show loading state
  if (isLoading && !optimizedUri) {
    return renderPlaceholder();
  }

  // Show error state
  if (hasError) {
    return renderFallback();
  }

  return (
    <View style={[{ width, height }, style]}>
      <FastImage
        {...props}
        source={{
          uri: optimizedUri,
          priority: getFastImagePriority(priority),
        }}
        style={[styles.image, { width, height }]}
        resizeMode={getFastImageResizeMode(resizeMode)}
        onLoad={handleLoad}
        onError={handleError}
      />
      
      {/* Show loading overlay while image loads */}
      {isLoading && (
        <View style={[styles.loadingOverlay, { width, height }]}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
        </View>
      )}
    </View>
  );
});

// Cache cleanup utility
export const clearImageCache = () => {
  try {
    const keys = imageCache.getAllKeys();
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);

    keys.forEach(key => {
      if (key.startsWith('img_')) {
        try {
          const cached = imageCache.getString(key);
          if (cached) {
            const cacheData = JSON.parse(cached);
            if (cacheData.timestamp < oneWeekAgo) {
              imageCache.delete(key);
            }
          }
        } catch (error) {
          // Invalid cache data, remove it
          imageCache.delete(key);
        }
      }
    });

    console.log('Image cache cleanup completed');
  } catch (error) {
    console.error('Image cache cleanup failed:', error);
  }
};

// Preload images utility
export const preloadImages = (uris: string[]) => {
  const imagesToPreload = uris.map(uri => ({ uri }));
  FastImage.preload(imagesToPreload);
};

const styles = StyleSheet.create({
  image: {
    backgroundColor: theme.colors.surface,
  },
  placeholder: {
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  fallback: {
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    borderStyle: 'dashed',
  },
  fallbackText: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;