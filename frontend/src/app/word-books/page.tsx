'use client';

import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Filter, 
  Star, 
  Users, 
  Calendar,
  TrendingUp,
  Eye,
  Download,
  Share2,
  Edit3,
  Trash2,
  MoreHorizontal
} from 'lucide-react';

// 接口定义
interface WordBook {
  id: string;
  title: string;
  description: string;
  author: string;
  authorAvatar: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  wordCount: number;
  createdAt: string;
  updatedAt: string;
  rating: number;
  downloads: number;
  isPublic: boolean;
  isFavorite: boolean;
  tags: string[];
  progress: {
    learned: number;
    total: number;
    percentage: number;
  };
  cover: string;
}

const WordBooksPage: React.FC = () => {
  const [wordBooks, setWordBooks] = useState<WordBook[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<WordBook[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);

  // 模拟数据
  useEffect(() => {
    const fetchWordBooks = async () => {
      const mockBooks: WordBook[] = [
        {
          id: 'book_001',
          title: 'TOEFL Essential Vocabulary',
          description: 'Comprehensive collection of essential TOEFL vocabulary words with examples and practice exercises.',
          author: 'Dr. Sarah Johnson',
          authorAvatar: '/api/placeholder/32/32',
          category: 'Test Preparation',
          difficulty: 'Intermediate',
          wordCount: 1200,
          createdAt: '2024-01-15',
          updatedAt: '2024-01-20',
          rating: 4.8,
          downloads: 15420,
          isPublic: true,
          isFavorite: true,
          tags: ['TOEFL', 'Academic', 'Test Prep'],
          progress: {
            learned: 450,
            total: 1200,
            percentage: 37.5
          },
          cover: '/api/placeholder/200/280'
        },
        {
          id: 'book_002',
          title: 'Business English Mastery',
          description: 'Professional vocabulary for business communication, presentations, and negotiations.',
          author: 'Michael Chen',
          authorAvatar: '/api/placeholder/32/32',
          category: 'Business',
          difficulty: 'Advanced',
          wordCount: 800,
          createdAt: '2024-01-10',
          updatedAt: '2024-01-18',
          rating: 4.6,
          downloads: 8930,
          isPublic: true,
          isFavorite: false,
          tags: ['Business', 'Professional', 'Corporate'],
          progress: {
            learned: 200,
            total: 800,
            percentage: 25
          },
          cover: '/api/placeholder/200/280'
        },
        {
          id: 'book_003',
          title: 'Daily Conversation Starter',
          description: 'Common words and phrases for everyday English conversations and social interactions.',
          author: 'Emma Wilson',
          authorAvatar: '/api/placeholder/32/32',
          category: 'General',
          difficulty: 'Beginner',
          wordCount: 500,
          createdAt: '2024-01-12',
          updatedAt: '2024-01-22',
          rating: 4.9,
          downloads: 22100,
          isPublic: true,
          isFavorite: true,
          tags: ['Conversation', 'Daily Use', 'Beginner'],
          progress: {
            learned: 480,
            total: 500,
            percentage: 96
          },
          cover: '/api/placeholder/200/280'
        },
        {
          id: 'book_004',
          title: 'Academic Writing Vocabulary',
          description: 'Advanced vocabulary for academic writing, research papers, and scholarly communication.',
          author: 'Prof. David Lee',
          authorAvatar: '/api/placeholder/32/32',
          category: 'Academic',
          difficulty: 'Advanced',
          wordCount: 950,
          createdAt: '2024-01-08',
          updatedAt: '2024-01-19',
          rating: 4.7,
          downloads: 12300,
          isPublic: true,
          isFavorite: false,
          tags: ['Academic', 'Writing', 'Research'],
          progress: {
            learned: 120,
            total: 950,
            percentage: 12.6
          },
          cover: '/api/placeholder/200/280'
        },
        {
          id: 'book_005',
          title: 'My Personal Collection',
          description: 'Custom vocabulary collection created for personal study goals.',
          author: 'You',
          authorAvatar: '/api/placeholder/32/32',
          category: 'Personal',
          difficulty: 'Intermediate',
          wordCount: 300,
          createdAt: '2024-01-25',
          updatedAt: '2024-01-26',
          rating: 0,
          downloads: 0,
          isPublic: false,
          isFavorite: true,
          tags: ['Personal', 'Custom'],
          progress: {
            learned: 85,
            total: 300,
            percentage: 28.3
          },
          cover: '/api/placeholder/200/280'
        }
      ];

      setWordBooks(mockBooks);
      setFilteredBooks(mockBooks);
      setLoading(false);
    };

    fetchWordBooks();
  }, []);

  // 过滤功能
  useEffect(() => {
    let filtered = wordBooks;

    if (searchQuery) {
      filtered = filtered.filter(book =>
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(book => book.category === selectedCategory);
    }

    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(book => book.difficulty === selectedDifficulty);
    }

    setFilteredBooks(filtered);
  }, [wordBooks, searchQuery, selectedCategory, selectedDifficulty]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategories = () => {
    const categories = Array.from(new Set(wordBooks.map(book => book.category)));
    return categories;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading word books...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-indigo-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Word Books</h1>
                <p className="text-sm text-gray-600">Organize and study your vocabulary collections</p>
              </div>
            </div>
            <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              <Plus className="h-4 w-4 mr-2" />
              Create New Book
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search word books..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Categories</option>
              {getCategories().map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            {/* Difficulty Filter */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 rounded-l-lg ${
                  viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 rounded-r-lg ${
                  viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                List
              </button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-indigo-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Books</p>
                <p className="text-2xl font-bold text-gray-900">{wordBooks.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Words Learned</p>
                <p className="text-2xl font-bold text-gray-900">
                  {wordBooks.reduce((sum, book) => sum + book.progress.learned, 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Favorites</p>
                <p className="text-2xl font-bold text-gray-900">
                  {wordBooks.filter(book => book.isFavorite).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Public Books</p>
                <p className="text-2xl font-bold text-gray-900">
                  {wordBooks.filter(book => book.isPublic).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Word Books Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBooks.map(book => (
              <div key={book.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="relative">
                  <div className="h-48 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-t-lg flex items-center justify-center">
                    <BookOpen className="h-16 w-16 text-white opacity-80" />
                  </div>
                  {book.isFavorite && (
                    <Star className="absolute top-2 right-2 h-5 w-5 text-yellow-400 fill-current" />
                  )}
                  <span className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(book.difficulty)}`}>
                    {book.difficulty}
                  </span>
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{book.title}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{book.description}</p>
                  
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <Users className="h-4 w-4 mr-1" />
                    <span className="mr-3">{book.author}</span>
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span>{book.wordCount} words</span>
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex justify-between items-center text-sm mb-1">
                      <span className="text-gray-600">Progress</span>
                      <span className="text-gray-900 font-medium">{Math.round(book.progress.percentage)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{ width: `${book.progress.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <button className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors mr-2">
                      Study Now
                    </button>
                    <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-200">
              {filteredBooks.map(book => (
                <div key={book.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <BookOpen className="h-8 w-8 text-white" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 mr-3">{book.title}</h3>
                          {book.isFavorite && (
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          )}
                          <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(book.difficulty)}`}>
                            {book.difficulty}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 mb-2">{book.description}</p>
                        
                        <div className="flex items-center text-sm text-gray-500 space-x-4">
                          <span>{book.author}</span>
                          <span>{book.wordCount} words</span>
                          <span>{book.category}</span>
                          <span>Updated {new Date(book.updatedAt).toLocaleDateString()}</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-1 mt-2">
                          {book.tags.map(tag => (
                            <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <div className="text-right mr-4">
                        <div className="text-sm font-medium text-gray-900">
                          {Math.round(book.progress.percentage)}% Complete
                        </div>
                        <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className="bg-indigo-600 h-2 rounded-full"
                            style={{ width: `${book.progress.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                        Study
                      </button>
                      
                      <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {filteredBooks.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No word books found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || selectedCategory !== 'all' || selectedDifficulty !== 'all'
                ? 'Try adjusting your search filters.'
                : 'Create your first word book to get started.'}
            </p>
            <button className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              <Plus className="h-4 w-4 mr-2" />
              Create Word Book
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default WordBooksPage;