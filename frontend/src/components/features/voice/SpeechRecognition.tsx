/**
 * Speech Recognition Component
 * Provides pronunciation practice with accuracy feedback
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Mic, MicOff, RotateCcw, Volume2 } from 'lucide-react';
import { voiceService, SpeechResult } from '@/services/voiceService';

interface SpeechRecognitionProps {
  targetWord: string;
  onAccuracyScore?: (score: number, transcript: string) => void;
  onComplete?: (success: boolean) => void;
  showTranscript?: boolean;
  className?: string;
}

export function SpeechRecognition({
  targetWord,
  onAccuracyScore,
  onComplete,
  showTranscript = true,
  className = ''
}: SpeechRecognitionProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [accuracyScore, setAccuracyScore] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  useEffect(() => {
    setIsSupported(voiceService.isSpeechRecognitionSupported());
  }, []);

  const startListening = async () => {
    if (!isSupported) {
      setError('Speech recognition is not supported in this browser');
      return;
    }

    try {
      setIsListening(true);
      setError(null);
      setTranscript('');
      setAccuracyScore(null);
      setFeedbackMessage('Listening... Please say the word clearly');

      await voiceService.startListening(
        (result: SpeechResult) => {
          setTranscript(result.transcript);
          
          if (result.isFinal) {
            const accuracy = calculateAccuracy(targetWord, result.transcript);
            setAccuracyScore(accuracy);
            setIsListening(false);
            
            // Provide feedback
            const feedback = getFeedbackMessage(accuracy);
            setFeedbackMessage(feedback);
            
            if (onAccuracyScore) {
              onAccuracyScore(accuracy, result.transcript);
            }
            
            if (onComplete) {
              onComplete(accuracy >= 0.7); // 70% threshold for success
            }
          }
        },
        (error: string) => {
          setError(error);
          setIsListening(false);
          setFeedbackMessage('');
        },
        {
          lang: 'en-US',
          continuous: false,
          interimResults: true
        }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Speech recognition failed');
      setIsListening(false);
      setFeedbackMessage('');
    }
  };

  const stopListening = () => {
    voiceService.stopListening();
    setIsListening(false);
    setFeedbackMessage('');
  };

  const resetPractice = () => {
    setTranscript('');
    setAccuracyScore(null);
    setError(null);
    setFeedbackMessage('');
    stopListening();
  };

  const playTargetWord = async () => {
    try {
      await voiceService.speak(targetWord, { rate: 0.8 });
    } catch (err) {
      console.error('Failed to play target word:', err);
    }
  };

  const calculateAccuracy = (target: string, spoken: string): number => {
    const targetLower = target.toLowerCase().trim();
    const spokenLower = spoken.toLowerCase().trim();

    if (targetLower === spokenLower) {
      return 1.0; // Perfect match
    }

    // Simple Levenshtein distance-based accuracy
    const distance = levenshteinDistance(targetLower, spokenLower);
    const maxLength = Math.max(targetLower.length, spokenLower.length);
    const similarity = 1 - (distance / maxLength);

    return Math.max(0, similarity);
  };

  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  };

  const getFeedbackMessage = (accuracy: number): string => {
    if (accuracy >= 0.9) return 'Excellent pronunciation! 🎉';
    if (accuracy >= 0.7) return 'Good job! Very close pronunciation.';
    if (accuracy >= 0.5) return 'Not bad, but try to pronounce more clearly.';
    return 'Keep practicing! Listen to the word again and try once more.';
  };

  const getAccuracyColor = (score: number): string => {
    if (score >= 0.9) return 'text-green-600';
    if (score >= 0.7) return 'text-blue-600';
    if (score >= 0.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAccuracyPercentage = (score: number): string => {
    return `${Math.round(score * 100)}%`;
  };

  if (!isSupported) {
    return (
      <Card className={`${className}`}>
        <CardContent className="p-6 text-center">
          <MicOff className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-600">
            Speech recognition is not supported in this browser.
            Please try using Chrome, Edge, or Safari.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className}`}>
      <CardHeader>
        <CardTitle className="text-center">
          Practice Pronunciation
        </CardTitle>
        <div className="text-center">
          <span className="text-2xl font-bold text-blue-600">{targetWord}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={playTargetWord}
            className="ml-2"
            title="Listen to correct pronunciation"
          >
            <Volume2 size={16} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Control Buttons */}
        <div className="flex justify-center space-x-4">
          <Button
            onClick={isListening ? stopListening : startListening}
            variant={isListening ? "destructive" : "default"}
            className="flex items-center space-x-2"
            disabled={!!error}
          >
            {isListening ? (
              <>
                <MicOff size={20} />
                <span>Stop</span>
              </>
            ) : (
              <>
                <Mic size={20} />
                <span>Start Recording</span>
              </>
            )}
          </Button>

          <Button
            onClick={resetPractice}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <RotateCcw size={16} />
            <span>Reset</span>
          </Button>
        </div>

        {/* Status Messages */}
        {feedbackMessage && (
          <div className="text-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-700 text-sm">{feedbackMessage}</p>
          </div>
        )}

        {error && (
          <div className="text-center p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Transcript Display */}
        {showTranscript && transcript && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">What you said:</h4>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-gray-800">{transcript}</p>
            </div>
          </div>
        )}

        {/* Accuracy Score */}
        {accuracyScore !== null && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Accuracy Score:</h4>
            <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <span className={`text-lg font-bold ${getAccuracyColor(accuracyScore)}`}>
                {getAccuracyPercentage(accuracyScore)}
              </span>
              
              {/* Visual Progress Bar */}
              <div className="flex-1 mx-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      accuracyScore >= 0.9 ? 'bg-green-500' :
                      accuracyScore >= 0.7 ? 'bg-blue-500' :
                      accuracyScore >= 0.5 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${accuracyScore * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="text-center text-sm text-gray-600 space-y-1">
          <p>Click &ldquo;Start Recording&rdquo; and clearly pronounce the word.</p>
          <p>Make sure your microphone is enabled.</p>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Compact Speech Recognition Button
 * For inline pronunciation practice
 */
interface SpeechRecognitionButtonProps {
  targetWord: string;
  onResult?: (accuracy: number, transcript: string) => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
}

export function SpeechRecognitionButton({
  targetWord,
  onResult,
  size = 'md',
  variant = 'outline',
  className = ''
}: SpeechRecognitionButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported] = useState(voiceService.isSpeechRecognitionSupported());

  const handleClick = async () => {
    if (!isSupported || isListening) return;

    try {
      setIsListening(true);
      
      await voiceService.startListening(
        (result: SpeechResult) => {
          if (result.isFinal) {
            const accuracy = calculatePronunciationAccuracy(targetWord, result.transcript);
            setIsListening(false);
            
            if (onResult) {
              onResult(accuracy, result.transcript);
            }
          }
        },
        (error: string) => {
          console.error('Speech recognition error:', error);
          setIsListening(false);
        },
        { continuous: false, interimResults: false }
      );
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      setIsListening(false);
    }
  };

  const calculatePronunciationAccuracy = (target: string, spoken: string): number => {
    const targetLower = target.toLowerCase().trim();
    const spokenLower = spoken.toLowerCase().trim();
    
    if (targetLower === spokenLower) return 1.0;
    
    const distance = levenshteinDistance(targetLower, spokenLower);
    const maxLength = Math.max(targetLower.length, spokenLower.length);
    return Math.max(0, 1 - (distance / maxLength));
  };

  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix = [];
    for (let i = 0; i <= str2.length; i++) matrix[i] = [i];
    for (let j = 0; j <= str1.length; j++) matrix[0][j] = j;
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[str2.length][str1.length];
  };

  if (!isSupported) return null;

  const getSizeClass = () => {
    switch (size) {
      case 'sm': return 'h-8 w-8';
      case 'lg': return 'h-12 w-12';
      default: return 'h-10 w-10';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm': return 16;
      case 'lg': return 24;
      default: return 20;
    }
  };

  return (
    <Button
      variant={variant}
      size="icon"
      className={`${getSizeClass()} ${className} ${isListening ? 'animate-pulse bg-red-100' : ''}`}
      onClick={handleClick}
      disabled={isListening}
      title={isListening ? 'Recording...' : 'Practice pronunciation'}
    >
      {isListening ? (
        <MicOff size={getIconSize()} className="text-red-600" />
      ) : (
        <Mic size={getIconSize()} />
      )}
    </Button>
  );
}