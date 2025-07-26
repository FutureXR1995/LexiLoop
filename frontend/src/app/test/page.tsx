/**
 * Test Page
 * Main page for taking vocabulary tests
 */

'use client';

import { useState, useEffect } from 'react';
import { TestComponent } from '@/components/features/test/TestComponent';
import { TestResults } from '@/components/features/test/TestResults';

interface TestResult {
  questionId: string;
  vocabularyId: string;
  testType: string;
  isCorrect: boolean;
  responseTime: number;
  userAnswer: string;
  correctAnswer: string;
}

export default function TestPage() {
  const [isTestActive, setIsTestActive] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [selectedVocabulary, setSelectedVocabulary] = useState<string[]>([]);

  // Mock vocabulary IDs for demo
  useEffect(() => {
    setSelectedVocabulary([
      'vocab-1', 'vocab-2', 'vocab-3', 'vocab-4'
    ]);
  }, []);

  const handleStartTest = () => {
    setIsTestActive(true);
    setTestResults([]);
  };

  const handleTestComplete = (results: TestResult[]) => {
    setTestResults(results);
    setIsTestActive(false);
    
    // TODO: Save results to backend
    console.log('Test completed:', results);
  };

  const handleRetryTest = () => {
    setIsTestActive(true);
    setTestResults([]);
  };

  const handleContinueLearning = () => {
    // Redirect to learning page or show new content
    window.location.href = '/learn';
  };

  // If test is completed, show results
  if (testResults.length > 0 && !isTestActive) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <TestResults
          results={testResults}
          onRetry={handleRetryTest}
          onContinueLearning={handleContinueLearning}
        />
      </div>
    );
  }

  // If test is active, show test component
  if (isTestActive) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <TestComponent
          storyId="demo-story"
          vocabularyIds={selectedVocabulary}
          onComplete={handleTestComplete}
        />
      </div>
    );
  }

  // Show test start screen
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8 px-4">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🧠 Vocabulary Test
          </h1>
          <p className="text-lg text-gray-600">
            Test your knowledge with our three-layer assessment system
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-xl font-semibold mb-6">
            What to Expect
          </h2>
          
          <div className="space-y-4 text-left">
            <div className="flex items-start space-x-3">
              <div className="bg-indigo-100 text-indigo-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <div>
                <h3 className="font-medium">Word Meaning</h3>
                <p className="text-gray-600 text-sm">
                  Choose the correct definition from multiple options
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="bg-indigo-100 text-indigo-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <div>
                <h3 className="font-medium">Typing Practice</h3>
                <p className="text-gray-600 text-sm">
                  Type the correct word based on the given prompt
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="bg-indigo-100 text-indigo-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <div>
                <h3 className="font-medium">Reading Comprehension</h3>
                <p className="text-gray-600 text-sm">
                  Answer questions about the story context
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-800 mb-2">
            📊 Test Information
          </h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p>• {selectedVocabulary.length} vocabulary words</p>
            <p>• 3 layers of testing</p>
            <p>• Estimated time: 5-10 minutes</p>
            <p>• Results saved to your progress</p>
          </div>
        </div>

        <button
          onClick={handleStartTest}
          className="bg-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-indigo-700 transition-colors"
        >
          🚀 Start Test
        </button>

        <div className="text-center">
          <a
            href="/learn"
            className="text-indigo-600 hover:underline"
          >
            ← Back to Learning
          </a>
        </div>
      </div>
    </div>
  );
}