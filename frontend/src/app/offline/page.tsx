/**
 * Offline Page
 * Displayed when user is offline and no cached content is available
 */

'use client';

import { useEffect, useState } from 'react';
import { Wifi, WifiOff, RefreshCw, BookOpen, Target, TrendingUp } from 'lucide-react';

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(true);
  const [retryAttempts, setRetryAttempts] = useState(0);

  useEffect(() => {
    // Check initial online status
    setIsOnline(navigator.onLine);

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      // Automatically redirect when back online
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = async () => {
    setRetryAttempts(prev => prev + 1);
    
    try {
      // Try to fetch a simple endpoint to test connectivity
      const response = await fetch('/api/health', { cache: 'no-cache' });
      if (response.ok) {
        window.location.href = '/';
      }
    } catch (error) {
      console.log('Still offline, retry failed');
    }
  };

  const offlineFeatures = [
    {
      icon: BookOpen,
      title: 'Cached Content',
      description: 'Previously viewed stories and vocabulary remain available'
    },
    {
      icon: Target,
      title: 'Practice Mode',
      description: 'Continue practicing with downloaded vocabulary words'
    },
    {
      icon: TrendingUp,
      title: 'Progress Tracking',
      description: 'Your learning progress is saved locally and will sync when online'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Status Icon */}
        <div className="mb-6">
          {isOnline ? (
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
              <Wifi className="w-10 h-10 text-green-600" />
            </div>
          ) : (
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
              <WifiOff className="w-10 h-10 text-gray-600" />
            </div>
          )}
        </div>

        {/* Status Message */}
        {isOnline ? (
          <>
            <h1 className="text-2xl font-bold text-green-800 mb-2">
              Back Online!
            </h1>
            <p className="text-green-600 mb-6">
              Redirecting you to LexiLoop...
            </p>
            <div className="flex justify-center">
              <RefreshCw className="w-6 h-6 text-green-600 animate-spin" />
            </div>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              You're Offline
            </h1>
            <p className="text-gray-600 mb-6">
              No internet connection detected. Some features may be limited.
            </p>

            {/* Retry Button */}
            <button
              onClick={handleRetry}
              className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium mb-8 hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Try Again
              {retryAttempts > 0 && (
                <span className="text-indigo-200">({retryAttempts})</span>
              )}
            </button>

            {/* Offline Features */}
            <div className="text-left space-y-4 mb-8">
              <h2 className="font-semibold text-gray-800 text-center mb-4">
                What you can still do:
              </h2>
              
              {offlineFeatures.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <feature.icon className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800 text-sm">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-xs">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Options */}
            <div className="space-y-2">
              <button
                onClick={() => window.history.back()}
                className="w-full py-2 px-4 text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                Go Back
              </button>
              
              <button
                onClick={() => window.location.href = '/learn'}
                className="w-full py-2 px-4 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Continue Learning Offline
              </button>
            </div>
          </>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
            <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
            <span>LexiLoop</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Learning continues, online or offline
          </p>
        </div>
      </div>
    </div>
  );
}