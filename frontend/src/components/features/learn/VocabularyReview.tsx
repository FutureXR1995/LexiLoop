/**
 * Voice-Enhanced Vocabulary Review Component
 * Provides comprehensive vocabulary review with pronunciation practice
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  VoiceButton, 
  SpeechRecognition, 
  CompactVoiceInteraction 
} from '@/components/features/voice';
import { 
  Search, 
  Filter, 
  BookOpen, 
  Mic, 
  Volume2, 
  Star, 
  Trophy,
  BarChart3
} from 'lucide-react';

interface VocabularyItem {
  id: string;
  word: string;
  definition: string;
  exampleSentence?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  masteryLevel: number; // 0-100
  lastReviewed?: Date;
  pronunciationScore?: number;
  partOfSpeech?: string;
  tags?: string[];
}

interface VocabularyReviewProps {
  vocabularyList: VocabularyItem[];
  onVocabularyUpdate?: (id: string, updates: Partial<VocabularyItem>) => void;
  showPronunciationPractice?: boolean;
  className?: string;
}

type SortOption = 'alphabetical' | 'difficulty' | 'mastery' | 'recent';
type FilterOption = 'all' | 'beginner' | 'intermediate' | 'advanced' | 'needs-review';

export function VocabularyReview({
  vocabularyList,
  onVocabularyUpdate,
  showPronunciationPractice = true,
  className = ''
}: VocabularyReviewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('alphabetical');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [selectedWord, setSelectedWord] = useState<VocabularyItem | null>(null);
  const [showPronunciationModal, setShowPronunciationModal] = useState(false);
  const [reviewStats, setReviewStats] = useState({
    totalWords: 0,
    masteredWords: 0,
    averageMastery: 0,
    needsReview: 0
  });

  // Calculate stats
  useEffect(() => {
    const stats = vocabularyList.reduce((acc, word) => ({
      totalWords: acc.totalWords + 1,
      masteredWords: acc.masteredWords + (word.masteryLevel >= 80 ? 1 : 0),
      averageMastery: acc.averageMastery + word.masteryLevel,
      needsReview: acc.needsReview + (word.masteryLevel < 60 ? 1 : 0)
    }), { totalWords: 0, masteredWords: 0, averageMastery: 0, needsReview: 0 });

    setReviewStats({
      ...stats,
      averageMastery: stats.totalWords > 0 ? Math.round(stats.averageMastery / stats.totalWords) : 0
    });
  }, [vocabularyList]);

  // Filter and sort vocabulary
  const filteredAndSortedVocabulary = React.useMemo(() => {
    let filtered = vocabularyList.filter(word => {
      const matchesSearch = word.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           word.definition.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterBy === 'all' || 
                           filterBy === word.difficulty ||
                           (filterBy === 'needs-review' && word.masteryLevel < 60);
      
      return matchesSearch && matchesFilter;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'alphabetical':
          return a.word.localeCompare(b.word);
        case 'difficulty':
          const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 };
          return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        case 'mastery':
          return b.masteryLevel - a.masteryLevel;
        case 'recent':
          const aDate = a.lastReviewed?.getTime() || 0;
          const bDate = b.lastReviewed?.getTime() || 0;
          return bDate - aDate;
        default:
          return 0;
      }
    });

    return filtered;
  }, [vocabularyList, searchTerm, sortBy, filterBy]);

  const handlePronunciationScore = (wordId: string, score: number) => {
    if (onVocabularyUpdate) {
      onVocabularyUpdate(wordId, {
        pronunciationScore: score,
        lastReviewed: new Date(),
        masteryLevel: Math.min(100, (score * 20) + (Math.random() * 20)) // Simple mastery calculation
      });
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getMasteryColor = (level: number) => {
    if (level >= 80) return 'text-green-600';
    if (level >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMasteryIcon = (level: number) => {
    if (level >= 80) return <Trophy size={16} className="text-yellow-500" />;
    if (level >= 60) return <Star size={16} className="text-blue-500" />;
    return <BookOpen size={16} className="text-gray-500" />;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{reviewStats.totalWords}</p>
            <p className="text-sm text-gray-600">Total Words</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{reviewStats.masteredWords}</p>
            <p className="text-sm text-gray-600">Mastered</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{reviewStats.averageMastery}%</p>
            <p className="text-sm text-gray-600">Avg Mastery</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{reviewStats.needsReview}</p>
            <p className="text-sm text-gray-600">Need Review</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  placeholder="Search vocabulary..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="alphabetical">A-Z</option>
                <option value="difficulty">Difficulty</option>
                <option value="mastery">Mastery</option>
                <option value="recent">Recent</option>
              </select>
              
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as FilterOption)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="needs-review">Needs Review</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vocabulary List */}
      <div className="grid gap-4">
        {filteredAndSortedVocabulary.map((word) => (
          <Card key={word.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  {/* Word Header */}
                  <div className="flex items-center space-x-3">
                    <h3 className="text-xl font-bold text-gray-900">{word.word}</h3>
                    {word.partOfSpeech && (
                      <span className="text-sm text-gray-500 italic">({word.partOfSpeech})</span>
                    )}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(word.difficulty)}`}>
                      {word.difficulty}
                    </span>
                    {getMasteryIcon(word.masteryLevel)}
                  </div>

                  {/* Definition */}
                  <p className="text-gray-700">{word.definition}</p>

                  {/* Example Sentence */}
                  {word.exampleSentence && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm font-medium text-blue-800 mb-1">Example:</p>
                      <p className="text-blue-700 italic">&ldquo;{word.exampleSentence}&rdquo;</p>
                    </div>
                  )}

                  {/* Tags */}
                  {word.tags && word.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {word.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <BarChart3 size={14} />
                      <span className={getMasteryColor(word.masteryLevel)}>
                        {word.masteryLevel}% mastery
                      </span>
                    </div>
                    {word.pronunciationScore && (
                      <div className="flex items-center space-x-1">
                        <Mic size={14} />
                        <span>{Math.round(word.pronunciationScore * 100)}% pronunciation</span>
                      </div>
                    )}
                    {word.lastReviewed && (
                      <span>Last reviewed: {word.lastReviewed.toLocaleDateString()}</span>
                    )}
                  </div>
                </div>

                {/* Voice Controls */}
                <div className="flex flex-col items-end space-y-2 ml-4">
                  <CompactVoiceInteraction
                    word={word.word}
                    showPronunciationButton={showPronunciationPractice}
                    onPronunciationScore={(score) => handlePronunciationScore(word.id, score)}
                  />
                  
                  {showPronunciationPractice && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedWord(word);
                        setShowPronunciationModal(true);
                      }}
                      className="flex items-center space-x-1"
                    >
                      <Mic size={14} />
                      <span>Practice</span>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {filteredAndSortedVocabulary.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No vocabulary found</h3>
            <p className="text-gray-600">
              Try adjusting your search terms or filters to find vocabulary words.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Pronunciation Practice Modal */}
      {showPronunciationModal && selectedWord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Pronunciation Practice</h2>
                <Button
                  variant="ghost"
                  onClick={() => setShowPronunciationModal(false)}
                  className="text-gray-500"
                >
                  ✕
                </Button>
              </div>
              
              <SpeechRecognition
                targetWord={selectedWord.word}
                onAccuracyScore={(score, transcript) => {
                  handlePronunciationScore(selectedWord.id, score);
                }}
                onComplete={(success) => {
                  if (success) {
                    setTimeout(() => setShowPronunciationModal(false), 2000);
                  }
                }}
                showTranscript={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}