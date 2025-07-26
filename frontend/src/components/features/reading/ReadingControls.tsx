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
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left Section - Navigation */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.history.back()}
              className={getButtonClasses()}
            >
              ← Back
            </button>
            
            <div className="h-6 w-px bg-gray-300 mx-2" />
            
            {/* TTS Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePreviousSentence}
                disabled={currentSentence <= 0}
                className={`${getButtonClasses()} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                ⏮
              </button>
              
              <button
                onClick={onPlayPause}
                className={getButtonClasses(isPlaying)}
              >
                {isPlaying ? '⏸' : '▶️'}
              </button>
              
              <button
                onClick={handleNextSentence}
                disabled={currentSentence >= totalSentences - 1}
                className={`${getButtonClasses()} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                ⏭
              </button>
              
              <span className="text-xs opacity-75 ml-2">
                {currentSentence + 1} / {totalSentences}
              </span>
            </div>
          </div>

          {/* Center Section - Reading Mode */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSettingsChange({ readingMode: 'normal' })}
              className={getButtonClasses(settings.readingMode === 'normal')}
            >
              Normal
            </button>
            <button
              onClick={() => onSettingsChange({ readingMode: 'focus' })}
              className={getButtonClasses(settings.readingMode === 'focus')}
            >
              Focus
            </button>
            <button
              onClick={() => onSettingsChange({ readingMode: 'zen' })}
              className={getButtonClasses(settings.readingMode === 'zen')}
            >
              Zen
            </button>
          </div>

          {/* Right Section - Settings */}
          <div className="flex items-center gap-2">
            {/* Quick Theme Toggle */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => onSettingsChange({ theme: 'light' })}
                className={`w-8 h-8 rounded-full bg-white border-2 ${
                  settings.theme === 'light' ? 'border-blue-500' : 'border-gray-300'
                }`}
              />
              <button
                onClick={() => onSettingsChange({ theme: 'sepia' })}
                className={`w-8 h-8 rounded-full bg-amber-100 border-2 ${
                  settings.theme === 'sepia' ? 'border-blue-500' : 'border-gray-300'
                }`}
              />
              <button
                onClick={() => onSettingsChange({ theme: 'dark' })}
                className={`w-8 h-8 rounded-full bg-gray-800 border-2 ${
                  settings.theme === 'dark' ? 'border-blue-500' : 'border-gray-300'
                }`}
              />
            </div>

            <div className="h-6 w-px bg-gray-300 mx-2" />

            {/* Settings Toggle */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={getButtonClasses(showSettings)}
            >
              ⚙️ Settings
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={handleFullscreen}
              className={getButtonClasses(isFullscreen)}
            >
              {isFullscreen ? '⤨' : '⛶'}
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className={`
            mt-4 p-4 rounded-lg border
            ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 
              theme === 'sepia' ? 'bg-amber-50 border-amber-200' :
              'bg-gray-50 border-gray-200'}
          `}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Font Size */}
              <div>
                <label className="block text-sm font-medium mb-2">
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
                <label className="block text-sm font-medium mb-2">
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
                <label className="block text-sm font-medium mb-2">
                  Font Family
                </label>
                <select
                  value={settings.fontFamily}
                  onChange={(e) => onSettingsChange({ fontFamily: e.target.value })}
                  className={`
                    w-full px-2 py-1 rounded border text-sm
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
                  <span className="text-sm">Auto Highlight</span>
                </label>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.showDefinitions}
                    onChange={(e) => onSettingsChange({ showDefinitions: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">Show Definitions</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}