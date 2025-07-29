/**
 * Learning Page
 * Main interface for vocabulary learning with AI-generated stories
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PageLayout, { PageContainer } from '@/components/PageLayout';

interface VocabularyWord {
  id: string;
  word: string;
  definition: string;
  selected: boolean;
}

interface GeneratedStory {
  content: string;
  wordCount: number;
  qualityScore: number;
  vocabularyUsed: string[];
}

export default function LearnPage() {
  const [selectedWords, setSelectedWords] = useState<VocabularyWord[]>([]);
  const [difficulty, setDifficulty] = useState(2);
  const [storyType, setStoryType] = useState('general');
  const [generatedStory, setGeneratedStory] = useState<GeneratedStory | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sample vocabulary words for demonstration
  const sampleWords: VocabularyWord[] = [
    { id: '1', word: 'adventure', definition: 'An exciting or remarkable experience', selected: false },
    { id: '2', word: 'mysterious', definition: 'Full of mystery; difficult to understand', selected: false },
    { id: '3', word: 'explore', definition: 'To travel through an area to learn about it', selected: false },
    { id: '4', word: 'discover', definition: 'To find something for the first time', selected: false },
    { id: '5', word: 'fascinating', definition: 'Extremely interesting and captivating', selected: false },
  ];

  const handleWordToggle = (wordId: string) => {
    setSelectedWords(prev => 
      prev.map(word => 
        word.id === wordId 
          ? { ...word, selected: !word.selected }
          : word
      )
    );
  };

  const handleGenerateStory = async () => {
    const selected = selectedWords.filter(word => word.selected);
    
    if (selected.length === 0) {
      setError('Please select at least one vocabulary word');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Call real AI story generation API
      const response = await fetch('/api/ai/generate-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          words: selected.map(w => w.word),
          level: difficulty,
          genre: storyType,
          length: 100
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success && data.story) {
        const generatedStory: GeneratedStory = {
          content: data.story,
          wordCount: data.metadata?.length || data.story.split(' ').length,
          qualityScore: 0.8,
          vocabularyUsed: data.metadata?.wordsUsed || selected.map(w => w.word)
        };
        setGeneratedStory(generatedStory);
      } else {
        throw new Error(data.error || 'Failed to generate story');
      }
    } catch (err) {
      console.error('Story generation error:', err);
      setError(`Failed to generate story: ${err}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Load vocabulary words from API
  useEffect(() => {
    const loadVocabulary = async () => {
      try {
        const response = await fetch('/api/vocabulary/words?limit=20&difficulty=' + difficulty);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.words) {
            const apiWords: VocabularyWord[] = data.words.map((word: any) => ({
              id: word.id,
              word: word.word,
              definition: word.definition,
              selected: false
            }));
            setSelectedWords(apiWords);
            return;
          }
        }
      } catch (error) {
        console.error('Failed to load vocabulary from API:', error);
      }
      
      // Fallback to sample words if API fails
      setSelectedWords(sampleWords);
    };

    loadVocabulary();
  }, [difficulty]);

  return (
    <PageLayout>
      <PageContainer className="max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Word Selection */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              📚 Choose Your Vocabulary
            </h2>

            {/* Difficulty Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty Level
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={1}>Beginner</option>
                <option value={2}>Elementary</option>
                <option value={3}>Intermediate</option>
                <option value={4}>Upper-Intermediate</option>
                <option value={5}>Advanced</option>
              </select>
            </div>

            {/* Story Type Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Story Type
              </label>
              <select
                value={storyType}
                onChange={(e) => setStoryType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="general">General</option>
                <option value="adventure">Adventure</option>
                <option value="daily_life">Daily Life</option>
                <option value="science">Science</option>
                <option value="history">History</option>
              </select>
            </div>

            {/* Word Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Words ({selectedWords.filter(w => w.selected).length}/20)
              </label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {selectedWords.map((word) => (
                  <div
                    key={word.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      word.selected
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-300 hover:border-indigo-300'
                    }`}
                    onClick={() => handleWordToggle(word.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium text-gray-900">
                          {word.word}
                        </span>
                        <p className="text-sm text-gray-600 mt-1">
                          {word.definition}
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={word.selected}
                        onChange={() => handleWordToggle(word.id)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerateStory}
              disabled={isGenerating || selectedWords.filter(w => w.selected).length === 0}
              className={`w-full py-3 px-4 rounded-md font-medium ${
                isGenerating || selectedWords.filter(w => w.selected).length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {isGenerating ? '🤖 Generating Story...' : '✨ Generate AI Story'}
            </button>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
          </div>

          {/* Right Panel - Generated Story */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              📖 Your AI-Generated Story
            </h2>

            {!generatedStory && !isGenerating && (
              <div className="text-center py-12 text-gray-500">
                <div className="text-6xl mb-4">📚</div>
                <p className="text-lg">Select vocabulary words and click &ldquo;Generate AI Story&rdquo; to begin!</p>
              </div>
            )}

            {isGenerating && (
              <div className="text-center py-12">
                <div className="animate-spin text-6xl mb-4">🤖</div>
                <p className="text-lg text-gray-600">Creating your personalized story...</p>
                <div className="mt-4 bg-gray-200 rounded-full h-2">
                  <div className="bg-indigo-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                </div>
              </div>
            )}

            {generatedStory && (
              <div>
                {/* Story Stats */}
                <div className="mb-4 p-3 bg-indigo-50 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span>📝 Words: {generatedStory.wordCount}</span>
                    <span>⭐ Quality: {(generatedStory.qualityScore * 100).toFixed(0)}%</span>
                    <span>🎯 Used: {generatedStory.vocabularyUsed.length} words</span>
                  </div>
                </div>

                {/* Story Content */}
                <div className="prose max-w-none">
                  <div className="text-gray-800 leading-relaxed text-lg">
                    {generatedStory.content.split(' ').map((word, index) => {
                      const cleanWord = word.replace(/[.,!?;]/g, '').toLowerCase();
                      const isVocabWord = generatedStory.vocabularyUsed.some(
                        vocabWord => vocabWord.toLowerCase() === cleanWord
                      );
                      
                      return isVocabWord ? (
                        <span
                          key={index}
                          className="bg-yellow-200 px-1 rounded cursor-pointer hover:bg-yellow-300"
                          title={`Vocabulary word: ${cleanWord}`}
                        >
                          {word}
                        </span>
                      ) : (
                        <span key={index}>{word}</span>
                      );
                    }).reduce((prev: any, curr: any, index: number) => index === 0 ? [curr] : [...prev, ' ', curr], [])}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex space-x-3">
                  <Link 
                    href="/reading"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 text-center"
                  >
                    📖 Immersive Reading
                  </Link>
                  <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700">
                    🎧 Listen to Audio
                  </button>
                  <Link
                    href="/test"
                    className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 text-center"
                  >
                    🧠 Start Test
                  </Link>
                </div>

                {/* Vocabulary Used */}
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Vocabulary Words Used:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {generatedStory.vocabularyUsed.map((word, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
                      >
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </PageContainer>
    </PageLayout>
  );
}