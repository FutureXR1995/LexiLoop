/**
 * Enhanced Reading Page
 * Immersive reading experience with AI-generated stories
 */

'use client';

import React, { useState, useEffect } from 'react';
import { ImmersiveReader } from '@/components/features/reading/ImmersiveReader';

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

interface StoryData {
  id: string;
  title: string;
  content: string;
  vocabularyIds: string[];
  difficulty: string;
  wordCount: number;
  readingTime: number;
}

export default function ReadingPage() {
  const [story, setStory] = useState<StoryData | null>(null);
  const [vocabularyWords, setVocabularyWords] = useState<VocabularyWord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [readingProgress, setReadingProgress] = useState(0);
  const [wordsLearned, setWordsLearned] = useState(0);

  // Mock data - in real app, this would come from API
  useEffect(() => {
    // Simulate loading delay
    setTimeout(() => {
      setStory({
        id: 'story-1',
        title: 'The Mysterious Adventure',
        content: `Once upon a time, in a small village nestled between rolling hills and mysterious forests, there lived a young girl named Elena who possessed an insatiable curiosity about the world around her. Every morning, she would embark on fascinating expeditions to explore the hidden secrets of nature that surrounded her peaceful home.

One particularly enchanting morning, Elena discovered a peculiar artifact buried beneath the ancient oak tree in her backyard. The mysterious object seemed to radiate an extraordinary energy that filled her with both excitement and trepidation. As she carefully examined the intricate patterns carved into its surface, she realized this was no ordinary discovery.

The artifact appeared to be some kind of ancient compass, but instead of pointing north, its needle consistently indicated the direction of the most profound learning opportunities in the vicinity. Elena's adventurous spirit compelled her to follow the compass's guidance, leading her on an incredible journey of intellectual discovery.

Through dense forests and across babbling brooks, the compass led Elena to encounter various challenges that tested not only her physical courage but also her mental agility. Each obstacle she overcame enhanced her understanding of the natural world and strengthened her problem-solving abilities in remarkable ways.

As the sun began to set on her extraordinary adventure, Elena reflected on the valuable lessons she had learned. The mysterious compass had not only guided her through physical terrain but had also illuminated the path to personal growth and self-discovery. She realized that true adventure lies not just in exploring external landscapes, but in the continuous quest for knowledge and understanding that defines our human experience.`,
        vocabularyIds: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
        difficulty: 'intermediate',
        wordCount: 267,
        readingTime: 3
      });

      setVocabularyWords([
        {
          id: '1',
          word: 'mysterious',
          definition: 'Full of mystery; difficult to understand or explain',
          pronunciation: 'mɪˈstɪriəs',
          partOfSpeech: 'adjective',
          examples: [
            'The mysterious stranger disappeared into the night.',
            'There was something mysterious about her smile.'
          ],
          difficulty: 'intermediate'
        },
        {
          id: '2',
          word: 'insatiable',
          definition: 'Impossible to satisfy; having an appetite or desire that cannot be satisfied',
          pronunciation: 'ɪnˈseɪʃəbəl',
          partOfSpeech: 'adjective',
          examples: [
            'She had an insatiable appetite for knowledge.',
            'His insatiable curiosity led him to many discoveries.'
          ],
          difficulty: 'advanced'
        },
        {
          id: '3',
          word: 'curiosity',
          definition: 'A strong desire to know or learn something',
          pronunciation: 'ˌkjʊriˈɒsɪti',
          partOfSpeech: 'noun',
          examples: [
            'Curiosity killed the cat, but satisfaction brought it back.',
            'Her curiosity about science began at an early age.'
          ],
          difficulty: 'beginner'
        },
        {
          id: '4',
          word: 'embark',
          definition: 'To begin a journey or start an enterprise',
          pronunciation: 'ɪmˈbɑːk',
          partOfSpeech: 'verb',
          examples: [
            'We will embark on our journey at dawn.',
            'She decided to embark on a new career path.'
          ],
          difficulty: 'intermediate'
        },
        {
          id: '5',
          word: 'fascinating',
          definition: 'Extremely interesting and captivating',
          pronunciation: 'ˈfæsɪneɪtɪŋ',
          partOfSpeech: 'adjective',
          examples: [
            'The documentary was absolutely fascinating.',
            'She told us fascinating stories about her travels.'
          ],
          difficulty: 'beginner'
        },
        {
          id: '6',
          word: 'expeditions',
          definition: 'Journeys undertaken by a group of people with a particular purpose',
          pronunciation: 'ˌekspɪˈdɪʃənz',
          partOfSpeech: 'noun',
          examples: [
            'The explorers planned several expeditions to the Arctic.',
            'Scientific expeditions often lead to important discoveries.'
          ],
          difficulty: 'intermediate'
        },
        {
          id: '7',
          word: 'peculiar',
          definition: 'Strange or odd; unusual',
          pronunciation: 'pɪˈkjuːliə',
          partOfSpeech: 'adjective',
          examples: [
            'There was something peculiar about his behavior.',
            'The house had a peculiar smell.'
          ],
          difficulty: 'intermediate'
        },
        {
          id: '8',
          word: 'artifact',
          definition: 'An object made by humans, typically of cultural or historical interest',
          pronunciation: 'ˈɑːtɪfækt',
          partOfSpeech: 'noun',
          examples: [
            'The museum displayed ancient artifacts from Egypt.',
            'Each artifact tells a story about past civilizations.'
          ],
          difficulty: 'intermediate'
        },
        {
          id: '9',
          word: 'extraordinary',
          definition: 'Very unusual or remarkable; going beyond what is normal',
          pronunciation: 'ɪkˈstrɔːdənəri',
          partOfSpeech: 'adjective',
          examples: [
            'She has an extraordinary talent for music.',
            'The view from the mountain was extraordinary.'
          ],
          difficulty: 'intermediate'
        },
        {
          id: '10',
          word: 'trepidation',
          definition: 'A feeling of fear or anxiety about something that may happen',
          pronunciation: 'ˌtrepɪˈdeɪʃən',
          partOfSpeech: 'noun',
          examples: [
            'She approached the interview with some trepidation.',
            'Despite his trepidation, he decided to give the speech.'
          ],
          difficulty: 'advanced'
        }
      ]);

      setIsLoading(false);
    }, 1500);
  }, []);

  const handleWordClick = (word: VocabularyWord) => {
    console.log('Word clicked:', word);
    // Track word interaction analytics
  };

  const handleReadingProgress = (progress: number) => {
    setReadingProgress(progress);
  };

  const handleReadingComplete = () => {
    console.log('Reading completed!');
    // Show completion dialog or redirect to test
  };

  const handleWordLearned = () => {
    setWordsLearned(prev => prev + 1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin text-6xl">📖</div>
          <div>
            <h2 className="text-xl font-semibold">Loading your story...</h2>
            <p className="text-gray-600">Preparing immersive reading experience</p>
          </div>
          <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full animate-pulse" style={{ width: '60%' }} />
          </div>
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl">❌</div>
          <div>
            <h2 className="text-xl font-semibold">Story not found</h2>
            <p className="text-gray-600">The requested story could not be loaded</p>
          </div>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Story Header - only shown briefly */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-100 py-8">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {story.title}
          </h1>
          <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
            <span>📚 {story.wordCount} words</span>
            <span>⏱️ {story.readingTime} min read</span>
            <span>📊 {story.difficulty} level</span>
            <span>🎯 {vocabularyWords.length} vocabulary words</span>
          </div>
        </div>
      </div>

      {/* Immersive Reader */}
      <ImmersiveReader
        storyContent={story.content}
        vocabularyWords={vocabularyWords}
        onWordClick={handleWordClick}
        onReadingProgress={handleReadingProgress}
        onReadingComplete={handleReadingComplete}
        settings={{
          fontSize: 18,
          lineHeight: 1.7,
          theme: 'light',
          readingMode: 'focus'
        }}
      />
    </div>
  );
}