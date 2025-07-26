/**
 * Reading Controls Component
 * Comprehensive controls for reading experience customization
 */

'use client';

import React, { useState } from 'react';

interface ReadingSettings {
  fontSize: number;
  lineHeight: number;
  fontFamily: string;
  theme: 'light' | 'dark' | 'sepia';
  showDefinitions: boolean;
  autoHighlight: boolean;
  readingMode: 'normal' | 'focus' | 'zen';
}

interface ReadingControlsProps {
  settings: ReadingSettings;
  onSettingsChange: (settings: Partial<ReadingSettings>) => void;
  isPlaying: boolean;
  onPlayPause: () => void;
  currentSentence: number;
  totalSentences: number;
  onSentenceChange: (sentence: number) => void;
  theme: 'light' | 'dark' | 'sepia';
}

export function ReadingControls({
  settings,
  onSettingsChange,
  isPlaying,
  onPlayPause,
  currentSentence,
  totalSentences,
  onSentenceChange,
  theme
}: ReadingControlsProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handlePreviousSentence = () => {
    if (currentSentence > 0) {
      onSentenceChange(currentSentence - 1);
    }
  };

  const handleNextSentence = () => {
    if (currentSentence < totalSentences - 1) {
      onSentenceChange(currentSentence + 1);
    }
  };

  const getThemeClasses = () => {
    switch (theme) {
      case 'dark':
        return 'bg-gray-800 text-white border-gray-700 shadow-lg';
      case 'sepia':
        return 'bg-amber-100 text-amber-900 border-amber-300 shadow-lg';
      default:
        return 'bg-white text-gray-900 border-gray-200 shadow-lg';
    }
  };

  const getButtonClasses = (active = false) => {
    const base = 'px-3 py-2 rounded-md text-sm font-medium transition-all duration-200';
    
    if (active) {
      switch (theme) {
        case 'dark':
          return `${base} bg-blue-600 text-white`;
        case 'sepia':
          return `${base} bg-amber-600 text-white`;
        default:
          return `${base} bg-blue-600 text-white`;
      }
    }

    switch (theme) {
      case 'dark':
        return `${base} bg-gray-700 text-gray-300 hover:bg-gray-600`;
      case 'sepia':
        return `${base} bg-amber-200 text-amber-800 hover:bg-amber-300`;
      default:
        return `${base} bg-gray-100 text-gray-700 hover:bg-gray-200`;
    }
  };

  return (
    <div className={`
      fixed top-0 left-0 right-0 z-40 border-b backdrop-blur-sm bg-opacity-95
      ${getThemeClasses()}
    `}>
      <div className="max-w-6xl mx-auto px-2 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center justify-between">
          {/* Left Section - Navigation (Responsive) */}
          <div className="flex items-center gap-1 sm:gap-3">
            <button
              onClick={() => window.history.back()}
              className={`${getButtonClasses()} text-xs sm:text-sm px-2 sm:px-3`}
            >
              <span className="hidden sm:inline">← Back</span>
              <span className="sm:hidden">←</span>
            </button>
            
            <div className="h-4 sm:h-6 w-px bg-gray-300 mx-1 sm:mx-2" />
            
            {/* TTS Controls (Mobile Optimized) */}
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={handlePreviousSentence}
                disabled={currentSentence <= 0}
                className={`${getButtonClasses()} disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base px-2 sm:px-3 py-1 sm:py-2`}
              >
                ⏮
              </button>
              
              <button
                onClick={onPlayPause}
                className={`${getButtonClasses(isPlaying)} text-sm sm:text-base px-2 sm:px-3 py-1 sm:py-2`}
              >
                {isPlaying ? '⏸' : '▶️'}
              </button>
              
              <button
                onClick={handleNextSentence}
                disabled={currentSentence >= totalSentences - 1}
                className={`${getButtonClasses()} disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base px-2 sm:px-3 py-1 sm:py-2`}
              >
                ⏭
              </button>
              
              <span className="text-xs opacity-75 ml-1 sm:ml-2 hidden sm:inline">
                {currentSentence + 1} / {totalSentences}
              </span>
            </div>
          </div>

          {/* Center Section - Reading Mode (Hidden on mobile) */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            <button
              onClick={() => onSettingsChange({ readingMode: 'normal' })}
              className={`${getButtonClasses(settings.readingMode === 'normal')} text-xs lg:text-sm px-2 lg:px-3`}
            >
              Normal
            </button>
            <button
              onClick={() => onSettingsChange({ readingMode: 'focus' })}
              className={`${getButtonClasses(settings.readingMode === 'focus')} text-xs lg:text-sm px-2 lg:px-3`}
            >
              Focus
            </button>
            <button
              onClick={() => onSettingsChange({ readingMode: 'zen' })}
              className={`${getButtonClasses(settings.readingMode === 'zen')} text-xs lg:text-sm px-2 lg:px-3`}
            >
              Zen
            </button>
          </div>

          {/* Right Section - Settings (Mobile Optimized) */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Quick Theme Toggle (Compact on mobile) */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => onSettingsChange({ theme: 'light' })}
                className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white border-2 ${
                  settings.theme === 'light' ? 'border-blue-500' : 'border-gray-300'
                }`}
              />
              <button
                onClick={() => onSettingsChange({ theme: 'sepia' })}
                className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-amber-100 border-2 ${
                  settings.theme === 'sepia' ? 'border-blue-500' : 'border-gray-300'
                }`}
              />
              <button
                onClick={() => onSettingsChange({ theme: 'dark' })}
                className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-800 border-2 ${
                  settings.theme === 'dark' ? 'border-blue-500' : 'border-gray-300'
                }`}
              />
            </div>

            <div className="h-4 sm:h-6 w-px bg-gray-300 mx-1 sm:mx-2" />

            {/* Settings Toggle */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`${getButtonClasses(showSettings)} text-xs sm:text-sm px-2 sm:px-3`}
            >
              <span className="hidden sm:inline">⚙️ Settings</span>
              <span className="sm:hidden">⚙️</span>
            </button>

            {/* Fullscreen Toggle (Hidden on mobile) */}
            <button
              onClick={handleFullscreen}
              className={`${getButtonClasses(isFullscreen)} hidden sm:inline-flex text-xs sm:text-sm px-2 sm:px-3`}
            >
              {isFullscreen ? '⤨' : '⛶'}
            </button>
          </div>
        </div>

        {/* Enhanced Settings Panel (Mobile Responsive) */}
        {showSettings && (
          <div className={`
            mt-3 sm:mt-4 p-3 sm:p-4 rounded-lg border mx-2 sm:mx-0
            ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 
              theme === 'sepia' ? 'bg-amber-50 border-amber-200' :
              'bg-gray-50 border-gray-200'}
          `}>
            {/* Mobile Reading Mode Selection (Only visible on mobile) */}
            <div className="md:hidden mb-4">
              <label className="block text-sm font-medium mb-2">Reading Mode</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => onSettingsChange({ readingMode: 'normal' })}
                  className={`${getButtonClasses(settings.readingMode === 'normal')} text-xs px-2 py-1`}
                >
                  Normal
                </button>
                <button
                  onClick={() => onSettingsChange({ readingMode: 'focus' })}
                  className={`${getButtonClasses(settings.readingMode === 'focus')} text-xs px-2 py-1`}
                >
                  Focus
                </button>
                <button
                  onClick={() => onSettingsChange({ readingMode: 'zen' })}
                  className={`${getButtonClasses(settings.readingMode === 'zen')} text-xs px-2 py-1`}
                >
                  Zen
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Font Size */}
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-2">
                  Font Size: {settings.fontSize}px
                </label>
                <input
                  type="range"
                  min="14"
                  max="24"
                  value={settings.fontSize}
                  onChange={(e) => onSettingsChange({ fontSize: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>

              {/* Line Height */}
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-2">
                  Line Height: {settings.lineHeight}
                </label>
                <input
                  type="range"
                  min="1.2"
                  max="2.0"
                  step="0.1"
                  value={settings.lineHeight}
                  onChange={(e) => onSettingsChange({ lineHeight: parseFloat(e.target.value) })}
                  className="w-full"
                />
              </div>

              {/* Font Family */}
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-2">
                  Font Family
                </label>
                <select
                  value={settings.fontFamily}
                  onChange={(e) => onSettingsChange({ fontFamily: e.target.value })}
                  className={`
                    w-full px-2 py-1 rounded border text-xs sm:text-sm
                    ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' :
                      'bg-white border-gray-300 text-gray-900'}
                  `}
                >
                  <option value="Inter">Inter</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Arial">Arial</option>
                  <option value="Helvetica">Helvetica</option>
                </select>
              </div>

              {/* Feature Toggles */}
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.autoHighlight}
                    onChange={(e) => onSettingsChange({ autoHighlight: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-xs sm:text-sm">Auto Highlight</span>
                </label>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.showDefinitions}
                    onChange={(e) => onSettingsChange({ showDefinitions: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-xs sm:text-sm">Show Definitions</span>
                </label>
              </div>
            </div>

            {/* Current sentence counter for mobile */}
            <div className="sm:hidden mt-3 pt-3 border-t border-gray-200 text-center">
              <span className="text-xs text-gray-600">
                Sentence: {currentSentence + 1} / {totalSentences}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}