/**
 * Vocabulary Collection Grid Component
 * Displays vocabulary collections in grid or list format
 */

'use client';

import React from 'react';
import { VocabularyCollection } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { 
  BookOpen, 
  Users, 
  Clock, 
  Star, 
  Lock, 
  Globe, 
  TrendingUp,
  Calendar,
  MoreHorizontal,
  Play
} from 'lucide-react';

interface VocabularyCollectionGridProps {
  collections: VocabularyCollection[];
  viewMode: 'grid' | 'list';
  onCollectionSelect: (collection: VocabularyCollection) => void;
}

export function VocabularyCollectionGrid({ 
  collections, 
  viewMode, 
  onCollectionSelect 
}: VocabularyCollectionGridProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-blue-100 text-blue-800';
      case 'advanced':
        return 'bg-purple-100 text-purple-800';
      case 'mixed':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return '🌱';
      case 'intermediate':
        return '🌿';
      case 'advanced':
        return '🌳';
      case 'mixed':
        return '🎯';
      default:
        return '📚';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getEstimatedTime = (wordCount: number) => {
    // Estimate 2 minutes per word for learning
    const minutes = wordCount * 2;
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  if (viewMode === 'list') {
    return (
      <div className="space-y-4">
        {collections.map((collection) => (
          <Card
            key={collection.id}
            className="hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 border-l-indigo-500"
            onClick={() => onCollectionSelect(collection)}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{getDifficultyIcon(collection.difficulty)}</span>
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {collection.name}
                      </h3>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(collection.difficulty)}`}>
                        {collection.difficulty}
                      </span>
                      
                      {collection.isPublic ? (
                        <div className="flex items-center space-x-1 text-green-600">
                          <Globe className="w-4 h-4" />
                          <span className="text-xs">Public</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1 text-gray-500">
                          <Lock className="w-4 h-4" />
                          <span className="text-xs">Private</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {collection.description}
                  </p>

                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <BookOpen className="w-4 h-4" />
                      <span>{collection.wordCount} words</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{getEstimatedTime(collection.wordCount)}</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>Created {formatDate(collection.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 ml-6">
                  <div className="text-right">
                    <div className="flex items-center space-x-1 text-yellow-500 mb-1">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm font-medium">4.8</span>
                    </div>
                    <div className="text-xs text-gray-500">1.2k learners</div>
                  </div>

                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>

                  <button className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                    <Play className="w-4 h-4" />
                    <span>Start</span>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {collections.map((collection) => (
        <Card
          key={collection.id}
          className="hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer overflow-hidden"
          onClick={() => onCollectionSelect(collection)}
        >
          {/* Card Header with gradient */}
          <div className="h-32 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 relative">
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
            <div className="relative p-4 h-full flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <span className="text-3xl">{getDifficultyIcon(collection.difficulty)}</span>
                <div className="flex items-center space-x-2">
                  {collection.isPublic ? (
                    <Globe className="w-4 h-4 text-white" />
                  ) : (
                    <Lock className="w-4 h-4 text-white" />
                  )}
                  <button className="text-white hover:text-gray-200 transition-colors">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-yellow-300 fill-current" />
                <span className="text-white text-sm font-medium">4.8</span>
                <span className="text-white text-opacity-75 text-xs">1.2k learners</span>
              </div>
            </div>
          </div>

          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Collection Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                  {collection.name}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                  {collection.description}
                </p>
                
                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(collection.difficulty)}`}>
                  {collection.difficulty}
                </span>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <BookOpen className="w-4 h-4" />
                  <span>{collection.wordCount} words</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{getEstimatedTime(collection.wordCount)}</span>
                </div>
              </div>

              {/* Progress Bar (Mock) */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Progress</span>
                  <span>23%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: '23%' }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 pt-2">
                <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                  <Play className="w-4 h-4" />
                  <span>Start Learning</span>
                </button>
                
                <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <BookOpen className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              {/* Footer Info */}
              <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                <span>Created {formatDate(collection.createdAt)}</span>
                <div className="flex items-center space-x-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>Popular</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}