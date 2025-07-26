/**
 * Voice Interaction Component
 * Combines TTS and Speech Recognition for complete voice learning experience
 */

'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { VoiceButton, VoiceControlPanel } from './VoiceButton';
import { SpeechRecognition } from './SpeechRecognition';
import { Settings, BookOpen, Mic } from 'lucide-react';

interface VoiceInteractionProps {
  word: string;
  definition?: string;
  exampleSentence?: string;
  onPronunciationScore?: (score: number) => void;
  showAdvancedControls?: boolean;
  className?: string;
}

export function VoiceInteraction({
  word,
  definition,
  exampleSentence,
  onPronunciationScore,
  showAdvancedControls = false,
  className = ''
}: VoiceInteractionProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [showPronunciationPractice, setShowPronunciationPractice] = useState(false);
  const [voiceOptions, setVoiceOptions] = useState({
    voice: '',
    rate: 0.9,
    volume: 1.0
  });

  const handleVoiceSettings = (setting: string, value: any) => {
    setVoiceOptions(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handlePronunciationResult = (accuracy: number, transcript: string) => {
    if (onPronunciationScore) {
      onPronunciationScore(accuracy);
    }
    
    // Auto-hide pronunciation practice after successful attempt
    if (accuracy >= 0.8) {
      setTimeout(() => {
        setShowPronunciationPractice(false);
      }, 2000);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Voice Learning Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <BookOpen size={20} />
              <span>Voice Learning</span>
            </CardTitle>
            
            {showAdvancedControls && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings size={16} />
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Word Display with Voice Controls */}
          <div className="text-center space-y-4">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-blue-600">{word}</h2>
              
              {/* Voice Controls */}
              <div className="flex justify-center items-center space-x-2">
                <VoiceButton
                  text={word}
                  options={voiceOptions}
                  size="lg"
                  variant="default"
                />
                
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12"
                  onClick={() => setShowPronunciationPractice(!showPronunciationPractice)}
                  title="Practice pronunciation"
                >
                  <Mic size={20} />
                </Button>
              </div>
            </div>

            {/* Definition */}
            {definition && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                  Definition
                </h3>
                <p className="text-gray-800">{definition}</p>
                <VoiceButton
                  text={definition}
                  options={{ ...voiceOptions, rate: 0.8 }}
                  size="sm"
                  variant="ghost"
                />
              </div>
            )}

            {/* Example Sentence */}
            {exampleSentence && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                  Example
                </h3>
                <p className="text-gray-800 italic">"{exampleSentence}"</p>
                <VoiceButton
                  text={exampleSentence}
                  options={{ ...voiceOptions, rate: 0.85 }}
                  size="sm"
                  variant="ghost"
                />
              </div>
            )}
          </div>

          {/* Voice Settings Panel */}
          {showSettings && showAdvancedControls && (
            <VoiceControlPanel
              onVoiceChange={(voice) => handleVoiceSettings('voice', voice)}
              onRateChange={(rate) => handleVoiceSettings('rate', rate)}
              onVolumeChange={(volume) => handleVoiceSettings('volume', volume)}
            />
          )}
        </CardContent>
      </Card>

      {/* Pronunciation Practice */}
      {showPronunciationPractice && (
        <SpeechRecognition
          targetWord={word}
          onAccuracyScore={handlePronunciationResult}
          onComplete={(success) => {
            console.log(`Pronunciation practice ${success ? 'completed successfully' : 'needs more work'}`);
          }}
          showTranscript={true}
        />
      )}
    </div>
  );
}

/**
 * Compact Voice Learning Component
 * For use in flashcards, word lists, etc.
 */
interface CompactVoiceInteractionProps {
  word: string;
  showPronunciationButton?: boolean;
  onPronunciationScore?: (score: number) => void;
  className?: string;
}

export function CompactVoiceInteraction({
  word,
  showPronunciationButton = true,
  onPronunciationScore,
  className = ''
}: CompactVoiceInteractionProps) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <VoiceButton
        text={word}
        size="sm"
        variant="ghost"
      />
      
      {showPronunciationButton && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => {
            // This could trigger a modal or inline pronunciation practice
            console.log(`Starting pronunciation practice for: ${word}`);
          }}
          title="Practice pronunciation"
        >
          <Mic size={14} />
        </Button>
      )}
    </div>
  );
}

/**
 * Voice Quiz Component
 * For pronunciation-based quizzes
 */
interface VoiceQuizProps {
  word: string;
  onCorrectPronunciation: () => void;
  onIncorrectPronunciation: (accuracy: number) => void;
  accuracyThreshold?: number;
  className?: string;
}

export function VoiceQuiz({
  word,
  onCorrectPronunciation,
  onIncorrectPronunciation,
  accuracyThreshold = 0.75,
  className = ''
}: VoiceQuizProps) {
  const [showHint, setShowHint] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 3;

  const handlePronunciationResult = (accuracy: number, transcript: string) => {
    setAttempts(prev => prev + 1);

    if (accuracy >= accuracyThreshold) {
      onCorrectPronunciation();
    } else {
      onIncorrectPronunciation(accuracy);
      
      // Show hint after 2 failed attempts
      if (attempts >= 1) {
        setShowHint(true);
      }
    }
  };

  return (
    <Card className={`${className}`}>
      <CardHeader>
        <CardTitle className="text-center">
          Pronunciation Quiz
        </CardTitle>
        <p className="text-center text-gray-600">
          Pronounce the word correctly to continue
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="text-center">
          <span className="text-2xl font-bold text-blue-600">{word}</span>
          
          {showHint && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-700 mb-2">
                Need help? Listen to the correct pronunciation:
              </p>
              <VoiceButton
                text={word}
                options={{ rate: 0.7 }}
                variant="outline"
              />
            </div>
          )}
        </div>

        <SpeechRecognition
          targetWord={word}
          onAccuracyScore={handlePronunciationResult}
          showTranscript={false}
        />

        <div className="text-center text-sm text-gray-500">
          Attempt {attempts} of {maxAttempts}
        </div>
      </CardContent>
    </Card>
  );
}