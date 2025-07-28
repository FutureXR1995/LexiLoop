'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Filter, Plus, Users, TrendingUp, Clock, Star } from 'lucide-react';
import PageLayout, { PageContainer } from '@/components/PageLayout';

interface VocabularyWord {
  id: string;
  word: string;
  definition: string;
  pronunciation?: string;
  partOfSpeech: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  examples: string[];
}

interface VocabularyCollection {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  words: VocabularyWord[];
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
  stats: {
    totalWords: number;
    averageDifficulty: number;
    completionRate: number;
  };
}

const VocabularyLibraryPage: React.FC = () => {
  const [collections, setCollections] = useState<VocabularyCollection[]>([]);
  const [filteredCollections, setFilteredCollections] = useState<VocabularyCollection[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // 模拟数据加载
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 模拟API调用
        const mockCollections: VocabularyCollection[] = [
          {
            id: 'toefl_core',
            name: 'TOEFL Core Vocabulary',
            description: 'Essential vocabulary words for TOEFL preparation',
            category: 'Academic English',
            difficulty: 'intermediate',
            words: [],
            isPublic: true,
            createdBy: 'system',
            createdAt: '2024-01-15',
            stats: {
              totalWords: 1500,
              averageDifficulty: 2.3,
              completionRate: 45
            }
          },
          {
            id: 'gre_advanced',
            name: 'GRE Advanced Vocabulary',
            description: 'High-level vocabulary for GRE test preparation',
            category: 'Graduate English',
            difficulty: 'advanced',
            words: [],
            isPublic: true,
            createdBy: 'system',
            createdAt: '2024-01-10',
            stats: {
              totalWords: 2000,
              averageDifficulty: 3.0,
              completionRate: 23
            }
          },
          {
            id: 'business_english',
            name: 'Business English Essentials',
            description: 'Key vocabulary for professional business communication',
            category: 'Business English',
            difficulty: 'intermediate',
            words: [],
            isPublic: true,
            createdBy: 'system',
            createdAt: '2024-01-20',
            stats: {
              totalWords: 800,
              averageDifficulty: 2.0,
              completionRate: 67
            }
          },
          {
            id: 'daily_conversation',
            name: 'Daily Conversation',
            description: 'Common words and phrases for everyday communication',
            category: 'General English',
            difficulty: 'beginner',
            words: [],
            isPublic: true,
            createdBy: 'system',
            createdAt: '2024-01-25',
            stats: {
              totalWords: 600,
              averageDifficulty: 1.5,
              completionRate: 89
            }
          }
        ];

        setCollections(mockCollections);
        setFilteredCollections(mockCollections);
        
        const uniqueCategories = Array.from(new Set(mockCollections.map(c => c.category)));
        setCategories(uniqueCategories);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching collections:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 过滤和搜索
  useEffect(() => {
    let filtered = collections;

    if (searchQuery) {
      filtered = filtered.filter(collection =>
        collection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        collection.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        collection.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(collection => collection.category === selectedCategory);
    }

    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(collection => collection.difficulty === selectedDifficulty);
    }

    setFilteredCollections(filtered);
  }, [collections, searchQuery, selectedCategory, selectedDifficulty]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getProgressColor = (rate: number) => {
    if (rate >= 80) return 'bg-green-500';
    if (rate >= 60) return 'bg-yellow-500';
    if (rate >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading vocabulary library...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageContainer>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-indigo-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Vocabulary Library</h1>
              <p className="text-sm text-gray-600">Discover and manage your vocabulary collections</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Collection
          </button>
        </div>
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search collections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="lg:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div className="lg:w-40">
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCollections.map(collection => (
            <div key={collection.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {collection.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {collection.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{collection.category}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(collection.difficulty)}`}>
                        {collection.difficulty}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Words</span>
                    <span className="font-medium">{collection.stats.totalWords}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium">{collection.stats.completionRate}%</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getProgressColor(collection.stats.completionRate)}`}
                      style={{ width: `${collection.stats.completionRate}%` }}
                    ></div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
                    Start Learning
                  </button>
                  <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <BookOpen className="h-4 w-4" />
                  </button>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center text-xs text-gray-500">
                    <Users className="h-3 w-3 mr-1" />
                    {collection.isPublic ? 'Public' : 'Private'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(collection.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCollections.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No collections found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || selectedCategory !== 'all' || selectedDifficulty !== 'all'
                ? 'Try adjusting your search filters.'
                : 'Create your first vocabulary collection to get started.'
              }
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Collection
            </button>
          </div>
        )}
      </main>

      {/* Quick Stats Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center">
              <BookOpen className="h-4 w-4 mr-1" />
              {collections.length} Collections
            </div>
            <div className="flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" />
              {collections.reduce((sum, c) => sum + c.stats.totalWords, 0)} Words
            </div>
            <div className="flex items-center">
              <Star className="h-4 w-4 mr-1" />
              {Math.round(collections.reduce((sum, c) => sum + c.stats.completionRate, 0) / collections.length)}% Avg Progress
            </div>
          </div>
          <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
            View Analytics
          </button>
        </div>
      </PageContainer>
    </PageLayout>
  );
};

export default VocabularyLibraryPage;