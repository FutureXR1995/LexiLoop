/**
 * Three-Layer Testing Component
 * Implements word meaning, typing, and comprehension tests
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

interface Question {
  id: string;
  type: 'word_meaning' | 'typing' | 'comprehension';
  vocabularyId: string;
  question: string;
  options?: string[];
  correctAnswer: string;
  userAnswer?: string;
  isCorrect?: boolean;
  responseTime?: number;
}

interface TestComponentProps {
  storyId: string;
  vocabularyIds: string[];
  onComplete: (results: TestResult[]) => void;
}

interface TestResult {
  questionId: string;
  vocabularyId: string;
  testType: string;
  isCorrect: boolean;
  responseTime: number;
  userAnswer: string;
  correctAnswer: string;
}

export function TestComponent({ storyId, vocabularyIds, onComplete }: TestComponentProps) {
  const [currentLayer, setCurrentLayer] = useState<1 | 2 | 3>(1);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [userAnswer, setUserAnswer] = useState('');
  const [results, setResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());

  const generateQuestions = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Mock questions generation - in real app, this would call the API
      const mockQuestions: Question[] = [];
      
      vocabularyIds.forEach((vocabId, index) => {
        if (currentLayer === 1) {
          // Layer 1: Word meaning choice
          mockQuestions.push({
            id: `q${currentLayer}_${index}`,
            type: 'word_meaning',
            vocabularyId: vocabId,
            question: 'What does "adventure" mean?',
            options: [
              'An exciting or remarkable experience',
              'A type of food',
              'A mathematical concept',
              'A musical instrument'
            ],
            correctAnswer: 'An exciting or remarkable experience'
          });
        } else if (currentLayer === 2) {
          // Layer 2: Typing test
          mockQuestions.push({
            id: `q${currentLayer}_${index}`,
            type: 'typing',
            vocabularyId: vocabId,
            question: 'Type the word: "adventure"',
            correctAnswer: 'adventure'
          });
        } else if (currentLayer === 3) {
          // Layer 3: Comprehension
          mockQuestions.push({
            id: `q${currentLayer}_${index}`,
            type: 'comprehension',
            vocabularyId: vocabId,
            question: 'In the story, what did the explorer discover?',
            options: [
              'Beautiful flowers',
              'A treasure chest',
              'A hidden cave',
              'Ancient ruins'
            ],
            correctAnswer: 'Beautiful flowers'
          });
        }
      });
      
      setQuestions(mockQuestions);
      setCurrentQuestionIndex(0);
      setUserAnswer('');
      setStartTime(Date.now());
    } catch (error) {
      console.error('Failed to generate questions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentLayer, vocabularyIds]);

  // Generate questions for each layer
  useEffect(() => {
    generateQuestions();
  }, [generateQuestions]);

  const handleAnswer = () => {
    const currentQuestion = questions[currentQuestionIndex];
    const responseTime = Date.now() - startTime;
    const isCorrect = userAnswer.toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase().trim();

    const result: TestResult = {
      questionId: currentQuestion.id,
      vocabularyId: currentQuestion.vocabularyId,
      testType: currentQuestion.type,
      isCorrect,
      responseTime,
      userAnswer,
      correctAnswer: currentQuestion.correctAnswer
    };

    const newResults = [...results, result];
    setResults(newResults);

    // Move to next question
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setUserAnswer('');
      setStartTime(Date.now());
    } else {
      // Move to next layer or complete test
      if (currentLayer < 3) {
        setCurrentLayer((currentLayer + 1) as 1 | 2 | 3);
      } else {
        // Test completed
        onComplete(newResults);
      }
    }
  };

  const handleOptionSelect = (option: string) => {
    setUserAnswer(option);
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentLayer - 1) * vocabularyIds.length + currentQuestionIndex + 1) / (3 * vocabularyIds.length) * 100;

  const layerNames = {
    1: 'Word Meaning',
    2: 'Typing Practice', 
    3: 'Reading Comprehension'
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="animate-spin text-4xl mb-4">🧠</div>
          <p>Generating test questions...</p>
        </CardContent>
      </Card>
    );
  }

  if (!currentQuestion) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <p>No questions available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Progress Bar */}
      <div className="bg-gray-200 rounded-full h-3">
        <div 
          className="bg-indigo-600 h-3 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Test Info */}
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900">
          Layer {currentLayer}: {layerNames[currentLayer]}
        </h2>
        <p className="text-gray-600">
          Question {currentQuestionIndex + 1} of {questions.length}
        </p>
      </div>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{currentQuestion.question}</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Multiple Choice Questions */}
          {currentQuestion.options && (
            <div className="space-y-2">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleOptionSelect(option)}
                  className={`w-full p-3 text-left border rounded-lg transition-colors ${
                    userAnswer === option
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-300 hover:border-indigo-300'
                  }`}
                >
                  <span className="font-medium text-gray-700">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  <span className="ml-2">{option}</span>
                </button>
              ))}
            </div>
          )}

          {/* Text Input Questions */}
          {!currentQuestion.options && (
            <div>
              <Input
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Type your answer here..."
                className="text-lg p-4"
                onKeyDown={(e) => e.key === 'Enter' && userAnswer.trim() && handleAnswer()}
                autoFocus
              />
              <p className="text-sm text-gray-500 mt-2">
                Press Enter or click Submit when you&apos;re ready
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={() => {
                // Skip question (for demo purposes)
                setUserAnswer(currentQuestion.correctAnswer);
                handleAnswer();
              }}
            >
              Skip Question
            </Button>
            
            <Button
              onClick={handleAnswer}
              disabled={!userAnswer.trim()}
              className="px-8"
            >
              {currentQuestionIndex === questions.length - 1 && currentLayer === 3
                ? 'Complete Test'
                : 'Next Question'
              }
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Layer Progress */}
      <div className="flex justify-center space-x-4">
        {[1, 2, 3].map((layer) => (
          <div
            key={layer}
            className={`px-3 py-1 rounded-full text-sm ${
              layer < currentLayer
                ? 'bg-green-100 text-green-800'
                : layer === currentLayer
                ? 'bg-indigo-100 text-indigo-800'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            Layer {layer}
            {layer < currentLayer && ' ✓'}
            {layer === currentLayer && ' 🎯'}
          </div>
        ))}
      </div>
    </div>
  );
}