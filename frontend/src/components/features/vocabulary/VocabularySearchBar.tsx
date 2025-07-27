/**
 * Vocabulary Search Bar Component
 * Advanced search functionality for vocabulary collections
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Clock, TrendingUp } from 'lucide-react';

interface VocabularySearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function VocabularySearchBar({ 
  value, 
  onChange, 
  placeholder = 'Search collections...' 
}: VocabularySearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mock recent searches and popular searches
  const recentSearches = [
    'Business English',
    'TOEFL Vocabulary',
    'Academic Writing'
  ];

  const popularSearches = [
    'SAT Words',
    'Daily Conversation',
    'Medical Terms',
    'Technology Vocabulary',
    'Travel Phrases'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setShowSuggestions(newValue.length > 0 || isFocused);
  };

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  const handleFocus = () => {
    setIsFocused(true);
    setShowSuggestions(true);
  };

  const handleBlur = () => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => {
      setIsFocused(false);
      setShowSuggestions(false);
    }, 200);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowSuggestions(false);
        inputRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative">
      <div className={`relative transition-all duration-200 ${
        isFocused ? 'scale-105' : ''
      }`}>
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className={`w-5 h-5 transition-colors ${
            isFocused ? 'text-indigo-500' : 'text-gray-400'
          }`} />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`block w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
            isFocused
              ? 'border-indigo-500 ring-indigo-500 ring-opacity-50 shadow-lg'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        />
        
        {value && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Search Suggestions Dropdown */}
      {showSuggestions && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="max-h-96 overflow-y-auto">
            {value.length === 0 && (
              <>
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div className="p-3 border-b border-gray-100">
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">Recent Searches</span>
                    </div>
                    <div className="space-y-1">
                      {recentSearches.map((search, index) => (
                        <button
                          key={`recent-${index}`}
                          onClick={() => handleSuggestionClick(search)}
                          className="block w-full text-left px-2 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded transition-colors"
                        >
                          {search}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Popular Searches */}
                <div className="p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Popular Searches</span>
                  </div>
                  <div className="space-y-1">
                    {popularSearches.map((search, index) => (
                      <button
                        key={`popular-${index}`}
                        onClick={() => handleSuggestionClick(search)}
                        className="block w-full text-left px-2 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded transition-colors"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Search Results/Suggestions */}
            {value.length > 0 && (
              <div className="p-3">
                <div className="text-sm text-gray-500 mb-2">
                  Search suggestions for &quot;{value}&quot;
                </div>
                <div className="space-y-1">
                  {[
                    `${value} - Advanced`,
                    `${value} - Beginner`,
                    `${value} - Business`,
                    `${value} - Academic`
                  ].map((suggestion, index) => (
                    <button
                      key={`suggestion-${index}`}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="flex items-center w-full text-left px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors"
                    >
                      <Search className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
                      <span className="truncate">{suggestion}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {value.length > 2 && (
              <div className="p-3 text-center text-sm text-gray-500">
                <div className="py-4">
                  <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p>No collections found for &quot;{value}&quot;</p>
                  <p className="text-xs mt-1">Try different keywords or browse popular collections</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}