/**
 * Vocabulary Library Page
 * Browse, select and manage vocabulary collections
 */

'use client';

import React, { useState, useEffect } from 'react';
import { VocabularyCollectionGrid } from '@/components/features/vocabulary/VocabularyCollectionGrid';
import { VocabularySearchBar } from '@/components/features/vocabulary/VocabularySearchBar';
import { VocabularyFilters } from '@/components/features/vocabulary/VocabularyFilters';
import { CreateCollectionModal } from '@/components/features/vocabulary/CreateCollectionModal';
import { ResponsiveContainer } from '@/components/layout/ResponsiveLayout';
import { vocabularyService } from '@/services/vocabularyService';
import { VocabularyCollection } from '@/lib/api';
import { Library, Plus, Filter, Search, BookOpen, Users, Star } from 'lucide-react';

export default function VocabularyPage() {
  const [collections, setCollections] = useState<VocabularyCollection[]>([]);
  const [filteredCollections, setFilteredCollections] = useState<VocabularyCollection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    difficulty: 'all',
    type: 'all',
    category: 'all'
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('popular');

  // Load collections on mount
  useEffect(() => {
    const loadCollections = async () => {
      try {
        const data = await vocabularyService.getCollections();
        setCollections(data);
        setFilteredCollections(data);
      } catch (error) {
        console.error('Failed to load vocabulary collections:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCollections();
  }, []);

  // Filter and search collections
  useEffect(() => {
    let filtered = [...collections];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(collection =>
        collection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        collection.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply difficulty filter
    if (selectedFilters.difficulty !== 'all') {
      filtered = filtered.filter(collection => 
        collection.difficulty === selectedFilters.difficulty
      );
    }

    // Apply type filter (public/private)
    if (selectedFilters.type !== 'all') {
      if (selectedFilters.type === 'public') {
        filtered = filtered.filter(collection => collection.isPublic);
      } else if (selectedFilters.type === 'private') {
        filtered = filtered.filter(collection => !collection.isPublic);
      }
    }

    // Sort collections
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'wordCount':
          return b.wordCount - a.wordCount;
        default: // popular
          return b.wordCount - a.wordCount; // Use word count as popularity proxy
      }
    });

    setFilteredCollections(filtered);
  }, [collections, searchQuery, selectedFilters, sortBy]);

  const handleCreateCollection = async (collectionData: any) => {
    try {
      const newCollection = await vocabularyService.createCollection(collectionData);
      setCollections(prev => [newCollection, ...prev]);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create collection:', error);
      alert('Failed to create collection. Please try again.');
    }
  };

  const stats = {
    totalCollections: collections.length,
    publicCollections: collections.filter(c => c.isPublic).length,
    privateCollections: collections.filter(c => !c.isPublic).length,
    totalWords: collections.reduce((sum, c) => sum + c.wordCount, 0)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.history.back()}
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                ← Back
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                  <Library className="w-6 h-6" />
                  <span>Vocabulary Library</span>
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Discover and manage your vocabulary collections
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Create Collection</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ResponsiveContainer maxWidth="max-w-none">
          {/* Stats Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-4 border">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Collections</p>
                  <p className="text-xl font-bold text-gray-900">{stats.totalCollections}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-4 border">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Public</p>
                  <p className="text-xl font-bold text-gray-900">{stats.publicCollections}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-4 border">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Star className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">My Collections</p>
                  <p className="text-xl font-bold text-gray-900">{stats.privateCollections}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-4 border">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Library className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Words</p>
                  <p className="text-xl font-bold text-gray-900">{stats.totalWords.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              {/* Search Bar */}
              <div className="flex-1 lg:max-w-md">
                <VocabularySearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search collections..."
                />
              </div>

              {/* View Controls */}
              <div className="flex items-center space-x-4">
                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="popular">Most Popular</option>
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name">Alphabetical</option>
                  <option value="wordCount">Word Count</option>
                </select>

                {/* View Mode Toggle */}
                <div className="flex border border-gray-300 rounded-md overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-2 text-sm ${
                      viewMode === 'grid'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Grid
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-2 text-sm ${
                      viewMode === 'list'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    List
                  </button>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="mt-4 pt-4 border-t">
              <VocabularyFilters
                filters={selectedFilters}
                onChange={setSelectedFilters}
              />
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between mb-6">
            <div className="text-sm text-gray-600">
              Showing {filteredCollections.length} of {collections.length} collections
              {searchQuery && (
                <span> for &quot;{searchQuery}&quot;</span>
              )}
            </div>
            
            {(searchQuery || selectedFilters.difficulty !== 'all' || selectedFilters.type !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedFilters({ difficulty: 'all', type: 'all', category: 'all' });
                }}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Collections Grid/List */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                    <div className="flex justify-between">
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredCollections.length === 0 ? (
            <div className="text-center py-12">
              <Library className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No collections found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || selectedFilters.difficulty !== 'all' || selectedFilters.type !== 'all'
                  ? 'Try adjusting your search or filters.'
                  : 'Create your first vocabulary collection to get started.'}
              </p>
              {(!searchQuery && selectedFilters.difficulty === 'all' && selectedFilters.type === 'all') && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Create Your First Collection
                </button>
              )}
            </div>
          ) : (
            <VocabularyCollectionGrid
              collections={filteredCollections}
              viewMode={viewMode}
              onCollectionSelect={(collection) => {
                // Navigate to collection detail or start learning
                window.location.href = `/vocabulary/${collection.id}`;
              }}
            />
          )}
        </ResponsiveContainer>
      </main>

      {/* Create Collection Modal */}
      {showCreateModal && (
        <CreateCollectionModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateCollection}
        />
      )}
    </div>
  );
}