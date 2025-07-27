/**
 * Create Collection Modal Component
 * Modal for creating new vocabulary collections
 */

'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ResponsiveButton } from '@/components/layout/ResponsiveLayout';
import { X, BookOpen, Globe, Lock, Loader2 } from 'lucide-react';

interface CreateCollectionModalProps {
  onClose: () => void;
  onCreate: (collectionData: any) => Promise<void>;
}

export function CreateCollectionModal({ onClose, onCreate }: CreateCollectionModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    difficulty: 'intermediate',
    isPublic: false,
    category: 'general',
    tags: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCreating, setIsCreating] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Collection name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsCreating(true);
    
    try {
      const tagsArray = formData.tags
        ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        : [];

      await onCreate({
        name: formData.name,
        description: formData.description,
        difficulty: formData.difficulty,
        isPublic: formData.isPublic,
        category: formData.category,
        tags: tagsArray,
        wordCount: 0 // New collection starts with 0 words
      });
    } catch (error) {
      console.error('Failed to create collection:', error);
      setErrors({ submit: 'Failed to create collection. Please try again.' });
    } finally {
      setIsCreating(false);
    }
  };

  const difficultyOptions = [
    { value: 'beginner', label: 'Beginner', description: 'Basic vocabulary', icon: '🌱' },
    { value: 'intermediate', label: 'Intermediate', description: 'Moderate difficulty', icon: '🌿' },
    { value: 'advanced', label: 'Advanced', description: 'Complex vocabulary', icon: '🌳' },
    { value: 'mixed', label: 'Mixed', description: 'Various levels', icon: '🎯' }
  ];

  const categoryOptions = [
    { value: 'general', label: 'General' },
    { value: 'academic', label: 'Academic' },
    { value: 'business', label: 'Business' },
    { value: 'conversation', label: 'Conversation' },
    { value: 'test-prep', label: 'Test Preparation' },
    { value: 'specialized', label: 'Specialized' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <Card className="border-0 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5" />
              <span>Create New Collection</span>
            </CardTitle>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {/* Collection Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Collection Name *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter collection name"
                  className={errors.name ? 'border-red-300' : ''}
                  disabled={isCreating}
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Description *
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe what this collection is about and who it's for..."
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none ${
                    errors.description ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={isCreating}
                />
                {errors.description && (
                  <p className="text-sm text-red-600">{errors.description}</p>
                )}
              </div>

              {/* Difficulty Level */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">
                  Difficulty Level
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {difficultyOptions.map((option) => (
                    <label
                      key={option.value}
                      className={`relative cursor-pointer rounded-lg border p-4 hover:bg-gray-50 transition-colors ${
                        formData.difficulty === option.value
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="difficulty"
                        value={option.value}
                        checked={formData.difficulty === option.value}
                        onChange={(e) => handleInputChange('difficulty', e.target.value)}
                        className="sr-only"
                        disabled={isCreating}
                      />
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{option.icon}</span>
                        <div>
                          <div className="font-medium text-gray-900">{option.label}</div>
                          <div className="text-sm text-gray-500">{option.description}</div>
                        </div>
                      </div>
                      {formData.difficulty === option.value && (
                        <div className="absolute top-2 right-2 text-indigo-500">
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                            <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                          </svg>
                        </div>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  disabled={isCreating}
                >
                  {categoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Tags (Optional)
                </label>
                <Input
                  value={formData.tags}
                  onChange={(e) => handleInputChange('tags', e.target.value)}
                  placeholder="Enter tags separated by commas (e.g., business, professional, communication)"
                  disabled={isCreating}
                />
                <p className="text-xs text-gray-500">
                  Tags help others discover your collection
                </p>
              </div>

              {/* Visibility */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">
                  Visibility
                </label>
                <div className="space-y-3">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="visibility"
                      checked={!formData.isPublic}
                      onChange={() => handleInputChange('isPublic', false)}
                      className="mt-1"
                      disabled={isCreating}
                    />
                    <div className="flex items-center space-x-2">
                      <Lock className="w-4 h-4 text-gray-500" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">Private</div>
                        <div className="text-sm text-gray-500">Only you can access this collection</div>
                      </div>
                    </div>
                  </label>
                  
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="visibility"
                      checked={formData.isPublic}
                      onChange={() => handleInputChange('isPublic', true)}
                      className="mt-1"
                      disabled={isCreating}
                    />
                    <div className="flex items-center space-x-2">
                      <Globe className="w-4 h-4 text-gray-500" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">Public</div>
                        <div className="text-sm text-gray-500">Anyone can discover and use this collection</div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {errors.submit && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{errors.submit}</p>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                disabled={isCreating}
              >
                Cancel
              </button>
              
              <ResponsiveButton
                type="submit"
                disabled={isCreating}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300"
              >
                {isCreating ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating...</span>
                  </div>
                ) : (
                  'Create Collection'
                )}
              </ResponsiveButton>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}