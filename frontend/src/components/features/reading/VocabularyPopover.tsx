/**
 * Vocabulary Popover Component
 * Interactive word definition and learning interface
 */

'use client';

import React, { forwardRef, useState, useEffect } from 'react';
import { VoiceButton } from '../voice/VoiceButton';

interface VocabularyWord {
  id: string;
  word: string;
  definition: string;
  pronunciation?: string;
  audioUrl?: string;
  partOfSpeech: string;
  examples: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface VocabularyPopoverProps {
  word: VocabularyWord;
  position: { x: number; y: number };
  onClose: () => void;
  onMarkLearned: () => void;
  theme?: 'light' | 'dark' | 'sepia';
}

export const VocabularyPopover = forwardRef<HTMLDivElement, VocabularyPopoverProps>(
  function VocabularyPopover({ word, position, onClose, onMarkLearned, theme = 'light' }, ref) {
    const [isVisible, setIsVisible] = useState(false);
    const [showExamples, setShowExamples] = useState(false);

    useEffect(() => {
      setIsVisible(true);
    }, []);

    const getDifficultyColor = (difficulty: string) => {
      switch (difficulty) {
        case 'beginner':
          return 'text-green-600 bg-green-100';
        case 'intermediate':
          return 'text-yellow-600 bg-yellow-100';
        case 'advanced':
          return 'text-red-600 bg-red-100';
        default:
          return 'text-gray-600 bg-gray-100';
      }
    };

    const getThemeClasses = () => {
      switch (theme) {
        case 'dark':
          return 'bg-gray-800 text-white border-gray-600 shadow-2xl';
        case 'sepia':
          return 'bg-amber-100 text-amber-900 border-amber-300 shadow-xl';
        default:
          return 'bg-white text-gray-900 border-gray-200 shadow-xl';
      }
    };

    const handleMarkLearned = () => {
      onMarkLearned();
    };

    // Calculate position to avoid going off-screen
    const calculatePosition = () => {
      const popoverWidth = 320;
      const popoverHeight = showExamples ? 400 : 300;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let x = position.x - popoverWidth / 2;
      let y = position.y - popoverHeight - 10;

      // Adjust horizontal position if going off-screen
      if (x < 10) x = 10;
      if (x + popoverWidth > viewportWidth - 10) {
        x = viewportWidth - popoverWidth - 10;
      }

      // Adjust vertical position if going off-screen
      if (y < 10) {
        y = position.y + 30; // Show below the word instead
      }

      return { x, y };
    };

    const adjustedPosition = calculatePosition();

    return (
      <div
        ref={ref}
        className={`
          fixed z-50 w-80 rounded-lg border-2 p-4 transition-all duration-200
          ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
          ${getThemeClasses()}
        `}
        style={{
          left: `${adjustedPosition.x}px`,
          top: `${adjustedPosition.y}px`,
          maxHeight: '80vh',
          overflow: 'auto'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`
            absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center
            hover:bg-gray-200 transition-colors text-gray-400 hover:text-gray-600
            ${theme === 'dark' ? 'hover:bg-gray-700 text-gray-300' : ''}
          `}
        >
          ×
        </button>

        {/* Word Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold">{word.word}</h3>
            <span className={`
              px-2 py-1 rounded-full text-xs font-medium capitalize
              ${getDifficultyColor(word.difficulty)}
            `}>
              {word.difficulty}
            </span>
          </div>

          {/* Pronunciation and Audio */}
          <div className="flex items-center gap-2 mb-2">
            {word.pronunciation && (
              <span className="text-sm text-gray-600 font-mono">
                /{word.pronunciation}/
              </span>
            )}
            <VoiceButton
              text={word.word}
              size="sm"
              variant="outline"
            />
          </div>

          {/* Part of Speech */}
          <span className={`
            inline-block px-2 py-1 rounded text-xs font-medium
            ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}
          `}>
            {word.partOfSpeech}
          </span>
        </div>

        {/* Definition */}
        <div className="mb-4">
          <h4 className="font-semibold mb-2 text-sm uppercase tracking-wide opacity-75">
            Definition
          </h4>
          <p className="text-sm leading-relaxed">
            {word.definition}
          </p>
        </div>

        {/* Examples Toggle */}
        {word.examples.length > 0 && (
          <div className="mb-4">
            <button
              onClick={() => setShowExamples(!showExamples)}
              className={`
                flex items-center gap-2 text-sm font-medium hover:underline
                ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}
              `}
            >
              <span>Examples ({word.examples.length})</span>
              <span className={`transition-transform ${showExamples ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>

            {showExamples && (
              <div className="mt-3 space-y-2">
                {word.examples.map((example, index) => (
                  <div
                    key={index}
                    className={`
                      p-2 rounded text-sm italic border-l-2
                      ${theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600' 
                        : 'bg-gray-50 border-gray-300'
                      }
                    `}
                  >
                    &ldquo;{example}&rdquo;
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleMarkLearned}
            className="
              flex-1 bg-green-600 text-white py-2 px-3 rounded-md text-sm font-medium
              hover:bg-green-700 transition-colors flex items-center justify-center gap-1
            "
          >
            <span>✓</span>
            Mark as Learned
          </button>
          
          <button
            onClick={onClose}
            className={`
              px-3 py-2 rounded-md text-sm font-medium border transition-colors
              ${theme === 'dark' 
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }
            `}
          >
            Close
          </button>
        </div>

        {/* Arrow pointer */}
        <div
          className={`
            absolute w-3 h-3 transform rotate-45 border-r border-b
            ${adjustedPosition.y > position.y 
              ? 'top-0 -mt-2 border-t border-l border-r-0 border-b-0' 
              : 'bottom-0 -mb-2'
            }
            ${theme === 'dark' ? 'bg-gray-800 border-gray-600' : 
              theme === 'sepia' ? 'bg-amber-100 border-amber-300' : 
              'bg-white border-gray-200'
            }
          `}
          style={{
            left: '50%',
            marginLeft: '-6px'
          }}
        />
      </div>
    );
  }
);

VocabularyPopover.displayName = 'VocabularyPopover';