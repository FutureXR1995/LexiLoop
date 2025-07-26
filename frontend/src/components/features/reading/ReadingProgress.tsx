/**
 * Reading Progress Component
 * Visual progress indicator for reading sessions
 */

'use client';

import React, { useState, useEffect } from 'react';

interface ReadingProgressProps {
  progress: number; // 0-100
  wordsLearned: number;
  totalWords: number;
  theme?: 'light' | 'dark' | 'sepia';
  showDetails?: boolean;
}

export function ReadingProgress({
  progress,
  wordsLearned,
  totalWords,
  theme = 'light',
  showDetails = true
}: ReadingProgressProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [readingTime, setReadingTime] = useState(0);

  // Track reading time
  useEffect(() => {
    const interval = setInterval(() => {
      setReadingTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getThemeClasses = () => {
    switch (theme) {
      case 'dark':
        return 'bg-gray-800 text-white border-gray-700';
      case 'sepia':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      default:
        return 'bg-white text-gray-900 border-gray-200';
    }
  };

  const getProgressBarColor = () => {
    switch (theme) {
      case 'dark':
        return 'bg-blue-500';
      case 'sepia':
        return 'bg-amber-600';
      default:
        return 'bg-blue-600';
    }
  };

  const getProgressBackgroundColor = () => {
    switch (theme) {
      case 'dark':
        return 'bg-gray-700';
      case 'sepia':
        return 'bg-amber-200';
      default:
        return 'bg-gray-200';
    }
  };

  const learningProgress = totalWords > 0 ? (wordsLearned / totalWords) * 100 : 0;

  if (!isVisible) return null;

  return (
    <div className={`
      fixed bottom-0 left-0 right-0 z-30 border-t backdrop-blur-sm bg-opacity-95
      ${getThemeClasses()}
    `}>
      {/* Main Progress Bar */}
      <div className={`
        h-1 w-full ${getProgressBackgroundColor()} relative overflow-hidden
      `}>
        <div
          className={`
            h-full ${getProgressBarColor()} transition-all duration-300 ease-out
          `}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
        
        {/* Reading progress indicator */}
        <div
          className="absolute top-0 h-full w-1 bg-yellow-400 transition-all duration-300"
          style={{ left: `${Math.min(progress, 100)}%` }}
        />
      </div>

      {showDetails && (
        <div className="max-w-6xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between text-sm">
            {/* Left Section - Progress Stats */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="opacity-75">Reading:</span>
                <span className="font-medium">{Math.round(progress)}%</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="opacity-75">Time:</span>
                <span className="font-medium font-mono">{formatTime(readingTime)}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="opacity-75">Words learned:</span>
                <span className="font-medium">
                  {wordsLearned}/{totalWords}
                </span>
                {totalWords > 0 && (
                  <span className="text-xs opacity-60">
                    ({Math.round(learningProgress)}%)
                  </span>
                )}
              </div>
            </div>

            {/* Center Section - Progress Visualization */}
            <div className="hidden md:flex items-center gap-2">
              {/* Mini vocabulary progress */}
              <div className="flex items-center gap-1">
                <span className="text-xs opacity-75">Vocabulary:</span>
                <div className={`w-20 h-2 ${getProgressBackgroundColor()} rounded-full overflow-hidden`}>
                  <div
                    className={`h-full ${getProgressBarColor()} transition-all duration-300`}
                    style={{ width: `${learningProgress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Right Section - Actions */}
            <div className="flex items-center gap-2">
              {/* Reading speed indicator */}
              <div className="text-xs opacity-75">
                {readingTime > 0 && (
                  <span>
                    ~{Math.round(progress / (readingTime / 60))} %/min
                  </span>
                )}
              </div>

              {/* Toggle visibility */}
              <button
                onClick={() => setIsVisible(false)}
                className={`
                  px-2 py-1 rounded text-xs hover:bg-opacity-20 hover:bg-gray-500
                  ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
                `}
              >
                Hide
              </button>
            </div>
          </div>

          {/* Achievements/Milestones */}
          {(progress >= 25 || progress >= 50 || progress >= 75 || progress >= 100) && (
            <div className="mt-2 flex items-center gap-2">
              {progress >= 25 && (
                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                  📚 Quarter way there!
                </span>
              )}
              {progress >= 50 && (
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                  💪 Halfway done!
                </span>
              )}
              {progress >= 75 && (
                <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                  🔥 Almost there!
                </span>
              )}
              {progress >= 100 && (
                <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full">
                  🎉 Completed!
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Show button when hidden */}
      {!isVisible && (
        <button
          onClick={() => setIsVisible(true)}
          className={`
            fixed bottom-4 right-4 px-3 py-2 rounded-full shadow-lg
            ${getThemeClasses()} border hover:shadow-xl transition-all
          `}
        >
          📊 Progress
        </button>
      )}
    </div>
  );
}