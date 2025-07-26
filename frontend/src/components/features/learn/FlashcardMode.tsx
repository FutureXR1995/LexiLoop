/**
 * Enhanced Flashcard Learning Mode with Voice Integration
 * Provides interactive vocabulary learning with TTS and speech recognition
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { VoiceInteraction } from '@/components/features/voice';
import { RotateCcw, ArrowLeft, ArrowRight, Eye, EyeOff, Star } from 'lucide-react';

interface Vocabulary {
  id: string;
  word: string;
  definition: string;
  exampleSentence?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  pronunciation?: string;
  partOfSpeech?: string;
  synonyms?: string[];
  antonyms?: string[];
}

interface FlashcardModeProps {
  vocabularyList: Vocabulary[];
  onProgress?: (wordId: string, correct: boolean) => void;
  onComplete?: (results: FlashcardResult[]) => void;
  showVoiceFeatures?: boolean;
  className?: string;
}

interface FlashcardResult {
  wordId: string;
  word: string;
  attempts: number;
  correctAttempts: number;
  pronunciationScore?: number;
  timeSpent: number;
}

export function FlashcardMode({
  vocabularyList,
  onProgress,
  onComplete,
  showVoiceFeatures = true,
  className = ''
}: FlashcardModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDefinition, setShowDefinition] = useState(false);
  const [results, setResults] = useState<FlashcardResult[]>([]);
  const [currentStartTime, setCurrentStartTime] = useState(Date.now());
  const [sessionStats, setSessionStats] = useState({
    totalCards: 0,
    completedCards: 0,
    correctAnswers: 0,
    totalPronunciationScore: 0,
    pronunciationAttempts: 0
  });

  const currentVocab = vocabularyList[currentIndex];

  // Initialize results for all vocabulary
  useEffect(() => {
    const initialResults = vocabularyList.map(vocab => ({
      wordId: vocab.id,
      word: vocab.word,
      attempts: 0,
      correctAttempts: 0,
      pronunciationScore: 0,
      timeSpent: 0
    }));
    setResults(initialResults);
    setSessionStats(prev => ({ ...prev, totalCards: vocabularyList.length }));
  }, [vocabularyList]);

  const updateCurrentResult = (updates: Partial<FlashcardResult>) => {
    setResults(prev => prev.map((result, index) => 
      index === currentIndex 
        ? { ...result, ...updates }
        : result
    ));
  };

  const handleShowDefinition = () => {
    setShowDefinition(true);
    updateCurrentResult({ 
      attempts: results[currentIndex].attempts + 1 
    });
  };

  const handleCorrect = () => {
    const timeSpent = Date.now() - currentStartTime;
    updateCurrentResult({
      correctAttempts: results[currentIndex].correctAttempts + 1,
      timeSpent: results[currentIndex].timeSpent + timeSpent
    });
    
    setSessionStats(prev => ({
      ...prev,
      correctAnswers: prev.correctAnswers + 1
    }));

    if (onProgress) {
      onProgress(currentVocab.id, true);
    }

    moveToNextCard();
  };

  const handleIncorrect = () => {
    const timeSpent = Date.now() - currentStartTime;
    updateCurrentResult({
      timeSpent: results[currentIndex].timeSpent + timeSpent
    });

    if (onProgress) {
      onProgress(currentVocab.id, false);
    }

    moveToNextCard();
  };

  const moveToNextCard = () => {
    if (currentIndex < vocabularyList.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowDefinition(false);
      setCurrentStartTime(Date.now());
    } else {
      // Session complete
      setSessionStats(prev => ({ ...prev, completedCards: prev.totalCards }));
      if (onComplete) {
        onComplete(results);
      }
    }
  };

  const moveToPreviousCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowDefinition(false);
      setCurrentStartTime(Date.now());
    }
  };

  const handlePronunciationScore = (score: number) => {
    updateCurrentResult({
      pronunciationScore: score
    });

    setSessionStats(prev => ({
      ...prev,
      totalPronunciationScore: prev.totalPronunciationScore + score,
      pronunciationAttempts: prev.pronunciationAttempts + 1
    }));
  };

  const resetCurrentCard = () => {
    setShowDefinition(false);
    setCurrentStartTime(Date.now());
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressPercentage = () => {
    return Math.round((currentIndex / vocabularyList.length) * 100);
  };

  if (!currentVocab) {
    return (
      <div className={`text-center p-8 ${className}`}>
        <h3 className="text-xl font-semibold text-gray-700 mb-4">
          Flashcard Session Complete! 🎉
        </h3>
        <div className="space-y-2 text-gray-600">
          <p>Cards reviewed: {sessionStats.completedCards}</p>
          <p>Correct answers: {sessionStats.correctAnswers}</p>
          <p>Accuracy: {Math.round((sessionStats.correctAnswers / sessionStats.completedCards) * 100)}%</p>
          {sessionStats.pronunciationAttempts > 0 && (
            <p>Average pronunciation: {Math.round((sessionStats.totalPronunciationScore / sessionStats.pronunciationAttempts) * 100)}%</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-4xl mx-auto space-y-6 ${className}`}>
      {/* Progress Header */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Flashcard Learning</h2>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {currentIndex + 1} of {vocabularyList.length}
            </span>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(currentVocab.difficulty)}`}>
              {currentVocab.difficulty}
            </div>
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>
      </div>

      {/* Main Flashcard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Word Side */}
        <Card className="h-96">
          <CardHeader>
            <CardTitle className="text-center text-3xl font-bold text-blue-600">
              {currentVocab.word}
            </CardTitle>
            {currentVocab.partOfSpeech && (
              <p className="text-center text-gray-500 italic">
                ({currentVocab.partOfSpeech})
              </p>
            )}
          </CardHeader>
          
          <CardContent className="flex flex-col justify-center items-center space-y-6 h-full">
            {/* Voice Interaction */}
            {showVoiceFeatures && (
              <VoiceInteraction
                word={currentVocab.word}
                definition={showDefinition ? currentVocab.definition : undefined}
                exampleSentence={showDefinition ? currentVocab.exampleSentence : undefined}
                onPronunciationScore={handlePronunciationScore}
                showAdvancedControls={false}
              />
            )}

            {/* Show Definition Button */}
            {!showDefinition && (
              <Button
                onClick={handleShowDefinition}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <Eye size={16} />
                <span>Show Definition</span>
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Definition Side */}
        <Card className="h-96">
          <CardHeader>
            <CardTitle className="text-center text-xl">
              {showDefinition ? 'Definition' : 'Think about the meaning...'}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="flex flex-col justify-center space-y-4 h-full">
            {showDefinition ? (
              <div className="space-y-4">
                <p className="text-lg text-gray-800 text-center">
                  {currentVocab.definition}
                </p>
                
                {currentVocab.exampleSentence && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-medium text-blue-800 mb-1">Example:</p>
                    <p className="text-blue-700 italic">&ldquo;{currentVocab.exampleSentence}&rdquo;</p>
                  </div>
                )}

                {(currentVocab.synonyms || currentVocab.antonyms) && (
                  <div className="space-y-3">
                    {currentVocab.synonyms && (
                      <div>
                        <p className="text-sm font-medium text-gray-600">Synonyms:</p>
                        <p className="text-gray-700">{currentVocab.synonyms.join(', ')}</p>
                      </div>
                    )}
                    {currentVocab.antonyms && (
                      <div>
                        <p className="text-sm font-medium text-gray-600">Antonyms:</p>
                        <p className="text-gray-700">{currentVocab.antonyms.join(', ')}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Knowledge Assessment */}
                <div className="flex justify-center space-x-4 pt-4">
                  <Button
                    onClick={handleIncorrect}
                    variant="outline"
                    className="flex items-center space-x-2 text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <span>😕</span>
                    <span>Still Learning</span>
                  </Button>
                  
                  <Button
                    onClick={handleCorrect}
                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
                  >
                    <span>✅</span>
                    <span>Got It!</span>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 space-y-4">
                <div className="text-6xl">🤔</div>
                <p>Try to recall the meaning of this word before revealing the definition.</p>
                <p className="text-sm">Use voice features to practice pronunciation!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Navigation Controls */}
      <div className="flex justify-between items-center">
        <Button
          onClick={moveToPreviousCard}
          disabled={currentIndex === 0}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <ArrowLeft size={16} />
          <span>Previous</span>
        </Button>

        <div className="flex space-x-2">
          <Button
            onClick={resetCurrentCard}
            variant="ghost"
            className="flex items-center space-x-2"
          >
            <RotateCcw size={16} />
            <span>Reset</span>
          </Button>
          
          {showDefinition && (
            <Button
              onClick={() => setShowDefinition(false)}
              variant="ghost"
              className="flex items-center space-x-2"
            >
              <EyeOff size={16} />
              <span>Hide</span>
            </Button>
          )}
        </div>

        <Button
          onClick={moveToNextCard}
          disabled={currentIndex === vocabularyList.length - 1}
          className="flex items-center space-x-2"
        >
          <span>Next</span>
          <ArrowRight size={16} />
        </Button>
      </div>

      {/* Session Stats */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">{sessionStats.correctAnswers}</p>
              <p className="text-sm text-gray-600">Correct</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-700">{currentIndex + 1}</p>
              <p className="text-sm text-gray-600">Reviewed</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {currentIndex > 0 ? Math.round((sessionStats.correctAnswers / currentIndex) * 100) : 0}%
              </p>
              <p className="text-sm text-gray-600">Accuracy</p>
            </div>
            {sessionStats.pronunciationAttempts > 0 && (
              <div>
                <p className="text-2xl font-bold text-purple-600">
                  {Math.round((sessionStats.totalPronunciationScore / sessionStats.pronunciationAttempts) * 100)}%
                </p>
                <p className="text-sm text-gray-600">Pronunciation</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}