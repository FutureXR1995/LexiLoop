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
            id: '1',
            name: 'Business English Essentials',
            description: 'Essential vocabulary for professional business communication',
            category: 'Business',
            difficulty: 'intermediate',
            words: [],
            isPublic: true,
            createdBy: 'Admin',
            createdAt: '2024-01-15',
            stats: {
              totalWords: 150,
              averageDifficulty: 3.2,
              completionRate: 75
            }
          },
          {
            id: '2',
            name: 'Daily Conversation Starters',
            description: 'Common phrases and words for everyday conversations',
            category: 'Conversation',
            difficulty: 'beginner',
            words: [],
            isPublic: true,
            createdBy: 'Teacher Sarah',
            createdAt: '2024-01-10',
            stats: {
              totalWords: 120,
              averageDifficulty: 2.1,
              completionRate: 92
            }
          },
          {
            id: '3',
            name: 'Academic Writing Vocabulary',
            description: 'Advanced vocabulary for academic and research writing',
            category: 'Academic',
            difficulty: 'advanced',
            words: [],
            isPublic: true,
            createdBy: 'Dr. Johnson',
            createdAt: '2024-01-05',
            stats: {
              totalWords: 200,
              averageDifficulty: 4.5,
              completionRate: 45
            }
          }
        ];

        setCollections(mockCollections);
        setFilteredCollections(mockCollections);
        
        // Extract unique categories
        const uniqueCategories = Array.from(new Set(mockCollections.map(c => c.category)));
        setCategories(uniqueCategories);
        
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch collections:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 过滤功能
  useEffect(() => {
    let filtered = collections;

    // 搜索过滤
    if (searchQuery) {
      filtered = filtered.filter(collection =>
        collection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        collection.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 分类过滤
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(collection => collection.category === selectedCategory);
    }

    // 难度过滤
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(collection => collection.difficulty === selectedDifficulty);
    }

    setFilteredCollections(filtered);
  }, [collections, searchQuery, selectedCategory, selectedDifficulty]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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

            <button className="lg:w-auto w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </button>
          </div>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredCollections.map((collection) => (
            <div key={collection.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{collection.name}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{collection.description}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(collection.difficulty)}`}>
                  {collection.difficulty}
                </span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div className="flex items-center text-gray-600">
                  <BookOpen className="h-4 w-4 mr-1" />
                  {collection.stats.totalWords} words
                </div>
                <div className="flex items-center text-gray-600">
                  <Users className="h-4 w-4 mr-1" />
                  {collection.isPublic ? 'Public' : 'Private'}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-600">Progress</span>
                  <span className="text-xs text-gray-600">{collection.stats.completionRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getProgressColor(collection.stats.completionRate)}`}
                    style={{ width: `${collection.stats.completionRate}%` }}
                  ></div>
                </div>
              </div>

              {/* Meta Info */}
              <div className="flex justify-between items-center text-xs text-gray-500 mb-4">
                <span>By {collection.createdBy}</span>
                <span>{collection.createdAt}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button className="flex-1 bg-indigo-600 text-white py-2 px-3 rounded-lg hover:bg-indigo-700 transition-colors text-sm">
                  Start Learning
                </button>
                <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <BookOpen className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Statistics */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Library Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
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