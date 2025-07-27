/**
 * Immersive Reader Component
 * Enhanced reading experience with vocabulary highlighting and interactive features
 */

'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { VocabularyPopover } from './VocabularyPopover';
import { ReadingControls } from './ReadingControls';
import { ReadingProgress } from './ReadingProgress';
import azureSpeechService from '@/services/azureSpeechService';

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

interface ReadingSettings {
  fontSize: number;
  lineHeight: number;
  fontFamily: string;
  theme: 'light' | 'dark' | 'sepia';
  showDefinitions: boolean;
  autoHighlight: boolean;
  readingMode: 'normal' | 'focus' | 'zen';
}

interface ImmersiveReaderProps {
  storyContent: string;
  vocabularyWords: VocabularyWord[];
  onWordClick?: (word: VocabularyWord) => void;
  onReadingProgress?: (progress: number) => void;
  onReadingComplete?: () => void;
  settings?: Partial<ReadingSettings>;
}

export function ImmersiveReader({
  storyContent,
  vocabularyWords,
  onWordClick,
  onReadingProgress,
  onReadingComplete,
  settings = {}
}: ImmersiveReaderProps) {
  const [readerSettings, setReaderSettings] = useState<ReadingSettings>({
    fontSize: 18,
    lineHeight: 1.6,
    fontFamily: 'Inter',
    theme: 'light',
    showDefinitions: true,
    autoHighlight: true,
    readingMode: 'normal',
    ...settings
  });

  const [selectedWord, setSelectedWord] = useState<VocabularyWord | null>(null);
  const [popoverPosition, setPopoverPosition] = useState<{ x: number; y: number } | null>(null);
  const [readingProgress, setReadingProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSentence, setCurrentSentence] = useState(-1);
  const [wordsLearned, setWordsLearned] = useState<Set<string>>(new Set());

  const contentRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Split content into sentences for better TTS control
  const sentences = storyContent.split(/[.!?]+/).filter(s => s.trim().length > 0);

  // Create vocabulary lookup map
  const vocabularyMap = useMemo(() => new Map(
    vocabularyWords.map(word => [word.word.toLowerCase(), word])
  ), [vocabularyWords]);

  // Handle word click
  const handleWordClick = useCallback((word: string, event: React.MouseEvent) => {
    const vocabularyWord = vocabularyMap.get(word.toLowerCase());
    if (!vocabularyWord) return;

    const rect = (event.target as HTMLElement).getBoundingClientRect();
    setPopoverPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    });
    setSelectedWord(vocabularyWord);

    if (onWordClick) {
      onWordClick(vocabularyWord);
    }
  }, [vocabularyMap, onWordClick]);

  // Close popover
  const closePopover = useCallback(() => {
    setSelectedWord(null);
    setPopoverPosition(null);
  }, []);

  // Mark word as learned
  const markWordAsLearned = useCallback((wordId: string) => {
    setWordsLearned(prev => new Set([...Array.from(prev), wordId]));
    closePopover();
  }, [closePopover]);

  // Handle scroll progress
  const handleScroll = useCallback(() => {
    if (!contentRef.current) return;

    const element = contentRef.current;
    const scrollTop = element.scrollTop;
    const scrollHeight = element.scrollHeight - element.clientHeight;
    const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;

    setReadingProgress(progress);
    
    if (onReadingProgress) {
      onReadingProgress(progress);
    }

    if (progress >= 95 && onReadingComplete) {
      onReadingComplete();
    }
  }, [onReadingProgress, onReadingComplete]);

  // Settings handlers
  const updateSettings = useCallback((newSettings: Partial<ReadingSettings>) => {
    setReaderSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // TTS Control Functions with Azure Speech Services
  const speakSentence = useCallback(async (sentenceIndex: number) => {
    if (sentenceIndex >= sentences.length) {
      setIsPlaying(false);
      return;
    }

    const sentence = sentences[sentenceIndex].trim();
    if (!sentence) {
      // Skip empty sentences
      setTimeout(() => speakSentence(sentenceIndex + 1), 100);
      return;
    }

    try {
      setCurrentSentence(sentenceIndex);
      
      // Use Azure Speech Services for TTS
      const success = await azureSpeechService.speakText(sentence, {
        rate: '0.8',
        pitch: '0%',
        volume: '100',
        voice: 'en-US-AriaNeural'
      });

      if (!success) {
        console.warn('Azure TTS failed, sentence:', sentence);
      }

      // Auto-advance to next sentence if still playing
      if (isPlaying && sentenceIndex < sentences.length - 1) {
        setTimeout(() => speakSentence(sentenceIndex + 1), 300);
      } else {
        setIsPlaying(false);
        setCurrentSentence(-1);
      }
    } catch (error) {
      console.error('Error speaking sentence with Azure TTS:', error);
      setIsPlaying(false);
      setCurrentSentence(-1);
    }
  }, [sentences, isPlaying]);

  const handlePlayPause = useCallback(async () => {
    if (isPlaying) {
      // Stop current speech with Azure TTS
      azureSpeechService.stopSpeaking();
      setIsPlaying(false);
    } else {
      // Start reading from current sentence (default to 0 if none selected)
      const startSentence = currentSentence >= 0 ? currentSentence : 0;
      try {
        setIsPlaying(true);
        setCurrentSentence(startSentence);
        await speakSentence(startSentence);
      } catch (error) {
        console.error('Azure TTS playback error:', error);
        setIsPlaying(false);
      }
    }
  }, [isPlaying, currentSentence, sentences, speakSentence]);

  const handleSentenceChange = useCallback((newSentence: number) => {
    setCurrentSentence(newSentence);
    
    // If currently playing, restart from new sentence
    if (isPlaying) {
      azureSpeechService.stopSpeaking();
      setTimeout(() => speakSentence(newSentence), 100);
    }
  }, [isPlaying, speakSentence]);

  // Cleanup Azure TTS on unmount
  useEffect(() => {
    return () => {
      azureSpeechService.stopSpeaking();
      azureSpeechService.dispose();
    };
  }, []);

  // Render highlighted text
  const renderHighlightedText = useCallback((text: string, sentenceIndex?: number) => {
    const words = text.split(/(\s+)/);
    
    return words.map((segment, index) => {
      if (!/\w/.test(segment)) {
        return <span key={index}>{segment}</span>;
      }

      const cleanWord = segment.replace(/[^\w]/g, '').toLowerCase();
      const vocabularyWord = vocabularyMap.get(cleanWord);
      const isLearned = vocabularyWord ? wordsLearned.has(vocabularyWord.id) : false;
      const isHighlighted = vocabularyWord && readerSettings.autoHighlight;
      const isCurrentSentence = sentenceIndex === currentSentence;

      return (
        <span
          key={index}
          className={`
            ${isHighlighted ? 'vocabulary-word' : ''}
            ${isLearned ? 'learned-word' : ''}
            ${isCurrentSentence ? 'current-sentence' : ''}
            ${vocabularyWord ? 'cursor-pointer' : ''}
          `}
          onClick={vocabularyWord ? (e) => handleWordClick(cleanWord, e) : undefined}
          data-word={cleanWord}
          data-difficulty={vocabularyWord?.difficulty}
        >
          {segment}
        </span>
      );
    });
  }, [vocabularyMap, wordsLearned, readerSettings.autoHighlight, currentSentence, handleWordClick]);

  // Theme classes
  const getThemeClasses = () => {
    switch (readerSettings.theme) {
      case 'dark':
        return 'bg-gray-900 text-white';
      case 'sepia':
        return 'bg-amber-50 text-amber-900';
      default:
        return 'bg-white text-gray-900';
    }
  };

  const getReadingModeClasses = () => {
    switch (readerSettings.readingMode) {
      case 'focus':
        return 'max-w-2xl mx-auto px-8';
      case 'zen':
        return 'max-w-xl mx-auto px-12';
      default:
        return 'max-w-4xl mx-auto px-6';
    }
  };

  useEffect(() => {
    const element = contentRef.current;
    if (element) {
      element.addEventListener('scroll', handleScroll);
      return () => element.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  // Close popover on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        closePopover();
      }
    };

    if (selectedWord) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [selectedWord, closePopover]);

  return (
    <div className={`min-h-screen transition-all duration-300 ${getThemeClasses()}`}>
      {/* Reading Controls */}
      <ReadingControls
        settings={readerSettings}
        onSettingsChange={updateSettings}
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        currentSentence={currentSentence}
        totalSentences={sentences.length}
        onSentenceChange={handleSentenceChange}
        theme={readerSettings.theme}
      />

      {/* Reading Progress */}
      <ReadingProgress
        progress={readingProgress}
        wordsLearned={wordsLearned.size}
        totalWords={vocabularyWords.length}
        theme={readerSettings.theme}
      />

      {/* Main Content */}
      <div className={`pt-20 pb-12 ${getReadingModeClasses()}`}>
        <div
          ref={contentRef}
          className="reading-content overflow-y-auto"
          style={{
            maxHeight: 'calc(100vh - 200px)',
            fontSize: `${readerSettings.fontSize}px`,
            lineHeight: readerSettings.lineHeight,
            fontFamily: readerSettings.fontFamily
          }}
        >
          <div className="prose prose-lg max-w-none">
            {sentences.map((sentence, index) => (
              <p
                key={index}
                className={`mb-6 leading-relaxed transition-all duration-300 ${
                  currentSentence === index ? 'highlight-sentence' : ''
                }`}
              >
                {renderHighlightedText(sentence.trim() + '.', index)}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* Vocabulary Popover */}
      {selectedWord && popoverPosition && (
        <VocabularyPopover
          ref={popoverRef}
          word={selectedWord}
          position={popoverPosition}
          onClose={closePopover}
          onMarkLearned={() => markWordAsLearned(selectedWord.id)}
          theme={readerSettings.theme}
        />
      )}

      <style jsx>{`
        .vocabulary-word {
          @apply bg-blue-100 border-b-2 border-blue-300 rounded-sm px-1 hover:bg-blue-200 transition-colors;
        }
        
        .learned-word {
          @apply bg-green-100 border-green-300 text-green-800;
        }
        
        .current-sentence {
          @apply bg-yellow-50 px-2 py-1 rounded-md;
        }
        
        .highlight-sentence {
          @apply ring-2 ring-yellow-300 ring-opacity-50 bg-yellow-50 px-4 py-2 rounded-lg;
        }
        
        .vocabulary-word[data-difficulty="beginner"] {
          @apply border-green-300 bg-green-50;
        }
        
        .vocabulary-word[data-difficulty="intermediate"] {
          @apply border-yellow-300 bg-yellow-50;
        }
        
        .vocabulary-word[data-difficulty="advanced"] {
          @apply border-red-300 bg-red-50;
        }
        
        /* Dark theme styles */
        .bg-gray-900 .vocabulary-word {
          @apply bg-blue-900 border-blue-600 text-blue-100;
        }
        
        .bg-gray-900 .learned-word {
          @apply bg-green-900 border-green-600 text-green-100;
        }
        
        .bg-gray-900 .current-sentence {
          @apply bg-yellow-900 bg-opacity-30;
        }
        
        /* Sepia theme styles */
        .bg-amber-50 .vocabulary-word {
          @apply bg-amber-200 border-amber-400;
        }
        
        .bg-amber-50 .learned-word {
          @apply bg-yellow-200 border-yellow-400;
        }
        
        /* Smooth scrolling */
        .reading-content {
          scroll-behavior: smooth;
        }
        
        /* Custom scrollbar */
        .reading-content::-webkit-scrollbar {
          width: 8px;
        }
        
        .reading-content::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .reading-content::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.4);
          border-radius: 4px;
        }
        
        .reading-content::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.6);
        }
      `}</style>
    </div>
  );
}