/**
 * Test Results Component
 * Displays test completion results and analysis
 */

'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

interface TestResult {
  questionId: string;
  vocabularyId: string;
  testType: string;
  isCorrect: boolean;
  responseTime: number;
  userAnswer: string;
  correctAnswer: string;
}

interface TestResultsProps {
  results: TestResult[];
  onRetry: () => void;
  onContinueLearning: () => void;
}

export function TestResults({ results, onRetry, onContinueLearning }: TestResultsProps) {
  // Calculate statistics
  const totalQuestions = results.length;
  const correctAnswers = results.filter(r => r.isCorrect).length;
  const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
  const averageResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / totalQuestions;

  // Group results by test type
  const resultsByType = results.reduce((acc, result) => {
    if (!acc[result.testType]) {
      acc[result.testType] = [];
    }
    acc[result.testType].push(result);
    return acc;
  }, {} as Record<string, TestResult[]>);

  // Get performance level
  const getPerformanceLevel = (accuracy: number) => {
    if (accuracy >= 90) return { level: 'Excellent', color: 'text-green-600', bg: 'bg-green-50' };
    if (accuracy >= 80) return { level: 'Good', color: 'text-green-600', bg: 'bg-green-50' };
    if (accuracy >= 70) return { level: 'Fair', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    if (accuracy >= 60) return { level: 'Needs Practice', color: 'text-orange-600', bg: 'bg-orange-50' };
    return { level: 'Keep Trying', color: 'text-red-600', bg: 'bg-red-50' };
  };

  const performance = getPerformanceLevel(accuracy);

  // Get words that need more practice
  const wordsNeedingPractice = results
    .filter(r => !r.isCorrect)
    .map(r => ({ vocabularyId: r.vocabularyId, testType: r.testType }));

  const testTypeNames = {
    word_meaning: 'Word Meaning',
    typing: 'Typing Practice',
    comprehension: 'Reading Comprehension'
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Overall Results */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">🎉 Test Complete!</CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className={`text-center p-6 rounded-lg ${performance.bg}`}>
            <div className="text-4xl font-bold mb-2">
              {accuracy.toFixed(0)}%
            </div>
            <div className={`text-xl font-semibold mb-2 ${performance.color}`}>
              {performance.level}
            </div>
            <div className="text-gray-600">
              {correctAnswers} out of {totalQuestions} questions correct
            </div>
          </div>

          {/* Detailed Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-indigo-600">
                {totalQuestions}
              </div>
              <div className="text-sm text-gray-600">Total Questions</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {correctAnswers}
              </div>
              <div className="text-sm text-gray-600">Correct Answers</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {(averageResponseTime / 1000).toFixed(1)}s
              </div>
              <div className="text-sm text-gray-600">Avg Response Time</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance by Layer */}
      <Card>
        <CardHeader>
          <CardTitle>Performance by Test Layer</CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {Object.entries(resultsByType).map(([testType, layerResults]) => {
              const layerCorrect = layerResults.filter(r => r.isCorrect).length;
              const layerTotal = layerResults.length;
              const layerAccuracy = (layerCorrect / layerTotal) * 100;
              
              return (
                <div key={testType} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">
                      {testTypeNames[testType as keyof typeof testTypeNames]}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {layerCorrect}/{layerTotal} correct
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{ width: `${layerAccuracy}%` }}
                      />
                    </div>
                    <span className="font-semibold text-lg">
                      {layerAccuracy.toFixed(0)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Words Needing Practice */}
      {wordsNeedingPractice.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>📚 Words for Review</CardTitle>
          </CardHeader>
          
          <CardContent>
            <p className="text-gray-600 mb-4">
              These words need more practice. They&apos;ll be included in your next review session.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {wordsNeedingPractice.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                >
                  <span className="font-medium">
                    Vocabulary ID: {item.vocabularyId}
                  </span>
                  <span className="text-sm text-yellow-700 bg-yellow-100 px-2 py-1 rounded">
                    {testTypeNames[item.testType as keyof typeof testTypeNames]}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {accuracy < 80 && (
          <Button
            onClick={onRetry}
            variant="outline"
            className="px-8 py-3"
          >
            🔄 Retry Test
          </Button>
        )}
        
        <Button
          onClick={onContinueLearning}
          className="px-8 py-3"
        >
          ✨ Continue Learning
        </Button>
      </div>

      {/* Motivational Message */}
      <Card className="bg-gradient-to-r from-indigo-50 to-blue-50">
        <CardContent className="text-center py-6">
          <div className="text-2xl mb-2">
            {accuracy >= 90 ? '🌟' : accuracy >= 70 ? '👏' : '💪'}
          </div>
          <p className="text-lg font-medium text-gray-800">
            {accuracy >= 90
              ? 'Outstanding work! You\'ve mastered these words!'
              : accuracy >= 70
              ? 'Great job! Keep practicing to improve even more.'
              : 'Good effort! Regular practice will help you improve.'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}