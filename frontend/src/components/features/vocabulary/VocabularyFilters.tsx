/**
 * Vocabulary Filters Component
 * Advanced filtering options for vocabulary collections
 */

'use client';

import React from 'react';
import { Filter, ChevronDown } from 'lucide-react';

interface VocabularyFiltersProps {
  filters: {
    difficulty: string;
    type: string;
    category: string;
  };
  onChange: (filters: any) => void;
}

export function VocabularyFilters({ filters, onChange }: VocabularyFiltersProps) {
  const handleFilterChange = (key: string, value: string) => {
    onChange({
      ...filters,
      [key]: value
    });
  };

  const difficultyOptions = [
    { value: 'all', label: 'All Levels' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'mixed', label: 'Mixed' }
  ];

  const typeOptions = [
    { value: 'all', label: 'All Collections' },
    { value: 'public', label: 'Public Collections' },
    { value: 'private', label: 'My Collections' },
    { value: 'featured', label: 'Featured' }
  ];

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'academic', label: 'Academic' },
    { value: 'business', label: 'Business' },
    { value: 'conversation', label: 'Conversation' },
    { value: 'test-prep', label: 'Test Preparation' },
    { value: 'specialized', label: 'Specialized' }
  ];

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.difficulty !== 'all') count++;
    if (filters.type !== 'all') count++;
    if (filters.category !== 'all') count++;
    return count;
  };

  const clearAllFilters = () => {
    onChange({
      difficulty: 'all',
      type: 'all',
      category: 'all'
    });
  };

  const activeCount = getActiveFiltersCount();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
      <div className="flex items-center space-x-2">
        <Filter className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">Filters</span>
        {activeCount > 0 && (
          <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
            {activeCount}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Difficulty Filter */}
        <div className="relative">
          <select
            value={filters.difficulty}
            onChange={(e) => handleFilterChange('difficulty', e.target.value)}
            className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
          >
            {difficultyOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>

        {/* Type Filter */}
        <div className="relative">
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
          >
            {typeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
          >
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>

        {/* Clear Filters */}
        {activeCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium px-3 py-2 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}