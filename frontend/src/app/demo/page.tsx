'use client';

import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, BookOpen, Headphones, Mic, Volume2 } from 'lucide-react';

const DemoPage: React.FC = () => {
  const [currentDemo, setCurrentDemo] = useState<'vocabulary' | 'pronunciation' | 'test'>('vocabulary');
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  // 模拟演示数据
  const demoData = {
    vocabulary: {
      word: 'serendipity',
      pronunciation: '/ˌserənˈdipədē/',
      partOfSpeech: 'noun',
      definition: 'The occurrence and development of events by chance in a happy or beneficial way.',
      examples: [
        'A fortunate stroke of serendipity brought the two old friends together.',
        'The discovery was pure serendipity - they were looking for something else entirely.'
      ],
      difficulty: 'Advanced',
      tags: ['Academic', 'Literature', 'Abstract']
    },
    test: {
      question: 'What does "serendipity" mean?',
      options: [
        'A planned discovery',
        'A fortunate accident',
        'A scientific method',
        'A type of research'
      ],
      correct: 1
    }
  };

  useEffect(() => {
    if (isPlaying) {
      const timer = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 2;
        });
      }, 100);
      return () => clearInterval(timer);
    }
  }, [isPlaying]);

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      setProgress(0);
    }
  };

  const resetDemo = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Play className="h-8 w-8 text-indigo-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">LexiLoop Demo</h1>
                <p className="text-sm text-gray-600">Experience our interactive learning platform</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={resetDemo}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Demo Navigation */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Choose Demo Experience</h2>
          <div className="flex space-x-4">
            {[
              { id: 'vocabulary', label: 'Vocabulary Learning', icon: BookOpen },
              { id: 'pronunciation', label: 'Pronunciation Practice', icon: Headphones },
              { id: 'test', label: 'Interactive Testing', icon: Mic }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setCurrentDemo(id as any)}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  currentDemo === id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Demo Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Content */}
          <div className="space-y-6">
            {currentDemo === 'vocabulary' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {demoData.vocabulary.word}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {demoData.vocabulary.pronunciation} • {demoData.vocabulary.partOfSpeech}
                    </p>
                  </div>
                  <button
                    onClick={togglePlayback}
                    className="flex items-center justify-center w-12 h-12 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors"
                  >
                    <Volume2 className="h-5 w-5" />
                  </button>
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Definition</h4>
                  <p className="text-gray-700">{demoData.vocabulary.definition}</p>
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Examples</h4>
                  <ul className="space-y-2">
                    {demoData.vocabulary.examples.map((example, index) => (
                      <li key={index} className="text-gray-700 pl-4 border-l-2 border-indigo-200">
                        {example}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                    {demoData.vocabulary.difficulty}
                  </span>
                  {demoData.vocabulary.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {currentDemo === 'pronunciation' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Pronunciation Practice</h3>
                
                <div className="text-center mb-8">
                  <div className="text-4xl font-bold text-indigo-600 mb-2">
                    {demoData.vocabulary.word}
                  </div>
                  <div className="text-xl text-gray-600 mb-4">
                    {demoData.vocabulary.pronunciation}
                  </div>
                  
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={togglePlayback}
                      className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      {isPlaying ? <Pause className="h-5 w-5 mr-2" /> : <Play className="h-5 w-5 mr-2" />}
                      {isPlaying ? 'Stop' : 'Listen'}
                    </button>
                    
                    <button className="flex items-center px-6 py-3 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors">
                      <Mic className="h-5 w-5 mr-2" />
                      Record
                    </button>
                  </div>
                </div>

                {/* Audio Visualization */}
                <div className="bg-gray-100 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Audio Progress</span>
                    <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-100"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            {currentDemo === 'test' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Interactive Test</h3>
                
                <div className="mb-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">
                    {demoData.test.question}
                  </h4>
                  
                  <div className="space-y-3">
                    {demoData.test.options.map((option, index) => (
                      <button
                        key={index}
                        className={`w-full text-left p-4 rounded-lg border transition-colors ${
                          index === demoData.test.correct
                            ? 'border-green-500 bg-green-50 text-green-800'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <span className="font-medium mr-3">
                          {String.fromCharCode(65 + index)}.
                        </span>
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800">
                    <strong>Correct!</strong> &ldquo;Serendipity&rdquo; refers to a fortunate accident or pleasant surprise.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Features */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Platform Features</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                    <BookOpen className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Interactive Learning</h4>
                    <p className="text-sm text-gray-600">Engaging vocabulary lessons with multimedia content</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                    <Headphones className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Pronunciation Practice</h4>
                    <p className="text-sm text-gray-600">AI-powered speech recognition and feedback</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                    <Mic className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Adaptive Testing</h4>
                    <p className="text-sm text-gray-600">Personalized quizzes that adapt to your level</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-sm p-6 text-white">
              <h3 className="text-lg font-bold mb-2">Ready to Start Learning?</h3>
              <p className="text-indigo-100 mb-4">
                Join thousands of learners improving their vocabulary with LexiLoop
              </p>
              <button className="w-full bg-white text-indigo-600 font-medium py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors">
                Get Started Free
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Learning Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">95%</div>
                  <div className="text-sm text-gray-600">Retention Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">15min</div>
                  <div className="text-sm text-gray-600">Daily Average</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">50+</div>
                  <div className="text-sm text-gray-600">Words/Week</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">98%</div>
                  <div className="text-sm text-gray-600">User Satisfaction</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DemoPage;