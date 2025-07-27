/**
 * Claude AI Test Page
 * Test Claude AI integration for story and vocabulary generation
 */

'use client';

import React, { useState } from 'react';

interface GeneratedStory {
  title: string;
  content: string;
  vocabularyWords: any[];
  difficulty: string;
  wordCount: number;
  readingTime: number;
  generatedAt: string;
}

interface VocabularyResult {
  vocabulary: any[];
  generatedAt: string;
  difficulty: string;
  wordCount: number;
}

export default function ClaudeAITestPage() {
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [isGeneratingVocab, setIsGeneratingVocab] = useState(false);
  const [generatedStory, setGeneratedStory] = useState<GeneratedStory | null>(null);
  const [generatedVocab, setGeneratedVocab] = useState<VocabularyResult | null>(null);
  const [error, setError] = useState<string>('');

  // Story generation form state
  const [storyTopic, setStoryTopic] = useState('adventure in a mysterious forest');
  const [storyDifficulty, setStoryDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [storyWordCount, setStoryWordCount] = useState(300);
  const [storyVocabulary, setStoryVocabulary] = useState('mysterious, adventure, discover, fascinating, extraordinary');

  // Vocabulary generation form state
  const [vocabWords, setVocabWords] = useState('mysterious, fascinating, extraordinary, adventure, discover');
  const [vocabDifficulty, setVocabDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');

  const handleGenerateStory = async () => {
    setIsGeneratingStory(true);
    setError('');
    
    try {
      const vocabularyWords = storyVocabulary
        .split(',')
        .map(word => word.trim())
        .filter(word => word.length > 0);

      const response = await fetch('/api/ai/generate-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: storyTopic,
          difficulty: storyDifficulty,
          wordCount: storyWordCount,
          vocabularyWords: vocabularyWords
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      setGeneratedStory(result);
    } catch (error) {
      console.error('Story generation error:', error);
      setError(`Story generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGeneratingStory(false);
    }
  };

  const handleGenerateVocabulary = async () => {
    setIsGeneratingVocab(true);
    setError('');

    try {
      const words = vocabWords
        .split(',')
        .map(word => word.trim())
        .filter(word => word.length > 0);

      if (words.length === 0) {
        throw new Error('Please enter at least one word');
      }

      const response = await fetch('/api/ai/generate-vocabulary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          words: words,
          difficulty: vocabDifficulty
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      setGeneratedVocab(result);
    } catch (error) {
      console.error('Vocabulary generation error:', error);
      setError(`Vocabulary generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGeneratingVocab(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Claude AI Integration Test
          </h1>
          <p className="text-gray-600">
            Test AI-powered story and vocabulary generation for LexiLoop
          </p>
        </div>

        {/* Navigation */}
        <div className="mb-6">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            ← Back to Application
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Story Generation */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Story Generation</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Topic/Theme
                  </label>
                  <input
                    type="text"
                    value={storyTopic}
                    onChange={(e) => setStoryTopic(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., adventure in a mysterious forest"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Difficulty
                    </label>
                    <select
                      value={storyDifficulty}
                      onChange={(e) => setStoryDifficulty(e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Word Count
                    </label>
                    <input
                      type="number"
                      value={storyWordCount}
                      onChange={(e) => setStoryWordCount(parseInt(e.target.value))}
                      min="100"
                      max="1000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Vocabulary (comma-separated)
                  </label>
                  <textarea
                    value={storyVocabulary}
                    onChange={(e) => setStoryVocabulary(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="mysterious, adventure, discover..."
                  />
                </div>

                <button
                  onClick={handleGenerateStory}
                  disabled={isGeneratingStory}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isGeneratingStory ? 'Generating Story...' : '🤖 Generate Story'}
                </button>
              </div>
            </div>

            {/* Generated Story Display */}
            {generatedStory && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Generated Story</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-800">{generatedStory.title}</h4>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <span>📊 {generatedStory.difficulty}</span>
                      <span>📝 {generatedStory.wordCount} words</span>
                      <span>⏱️ {generatedStory.readingTime} min</span>
                    </div>
                  </div>
                  
                  <div className="prose prose-sm max-w-none">
                    {generatedStory.content.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-3 text-gray-700 leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>

                  {generatedStory.vocabularyWords.length > 0 && (
                    <div>
                      <h5 className="font-medium text-gray-800 mb-2">Vocabulary ({generatedStory.vocabularyWords.length})</h5>
                      <div className="space-y-2">
                        {generatedStory.vocabularyWords.slice(0, 3).map((vocab, index) => (
                          <div key={index} className="text-sm bg-gray-50 p-2 rounded">
                            <span className="font-medium">{vocab.word}</span>: {vocab.definition}
                          </div>
                        ))}
                        {generatedStory.vocabularyWords.length > 3 && (
                          <p className="text-sm text-gray-500">
                            +{generatedStory.vocabularyWords.length - 3} more vocabulary words
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Vocabulary Generation */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Vocabulary Generation</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Words (comma-separated)
                  </label>
                  <textarea
                    value={vocabWords}
                    onChange={(e) => setVocabWords(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="mysterious, fascinating, extraordinary..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty Level
                  </label>
                  <select
                    value={vocabDifficulty}
                    onChange={(e) => setVocabDifficulty(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <button
                  onClick={handleGenerateVocabulary}
                  disabled={isGeneratingVocab}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isGeneratingVocab ? 'Generating Vocabulary...' : '📚 Generate Vocabulary'}
                </button>
              </div>
            </div>

            {/* Generated Vocabulary Display */}
            {generatedVocab && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Generated Vocabulary ({generatedVocab.vocabulary.length} words)
                </h3>
                
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {generatedVocab.vocabulary.map((vocab, index) => (
                    <div key={index} className="border-b border-gray-100 pb-3 last:border-b-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-800">{vocab.word}</h4>
                        <span className="text-sm text-gray-500">({vocab.partOfSpeech})</span>
                        <span className="text-xs text-blue-600">{vocab.pronunciation}</span>
                      </div>
                      
                      <p className="text-sm text-gray-700 mb-2">{vocab.definition}</p>
                      
                      <div className="text-xs text-gray-600">
                        <p><strong>Examples:</strong></p>
                        <ul className="list-disc list-inside ml-2">
                          {vocab.examples.map((example: string, exIndex: number) => (
                            <li key={exIndex}>{example}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Configuration Status */}
        <div className="mt-8 bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">API Configuration Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Claude API Key</span>
              <span className={`text-sm ${
                process.env.NEXT_PUBLIC_ENABLE_REAL_AI === 'true' ? 'text-green-600' : 'text-red-600'
              }`}>
                {process.env.NEXT_PUBLIC_ENABLE_REAL_AI === 'true' ? '✅ Configured' : '❌ Missing'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">AI Generation</span>
              <span className={`text-sm ${
                process.env.NEXT_PUBLIC_ENABLE_REAL_AI === 'true' ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {process.env.NEXT_PUBLIC_ENABLE_REAL_AI === 'true' ? '✅ Enabled' : '⚠️ Disabled'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}