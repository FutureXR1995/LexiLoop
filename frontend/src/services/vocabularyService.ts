/**
 * Vocabulary Service
 * Handles vocabulary management and learning progress
 */

import { apiClient, ApiResponse, PaginatedResponse, VocabularyWord, VocabularyCollection } from '@/lib/api';

interface VocabularyFilters {
  difficulty?: string;
  partOfSpeech?: string;
  masteryLevel?: number;
  search?: string;
  collectionId?: string;
}

interface VocabularyQueryParams extends VocabularyFilters {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

class VocabularyService {
  // Get vocabulary words with filtering and pagination
  async getVocabulary(params: VocabularyQueryParams = {}): Promise<PaginatedResponse<VocabularyWord>> {
    try {
      const queryString = new URLSearchParams();
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryString.append(key, String(value));
        }
      });

      const endpoint = `/vocabulary?${queryString.toString()}`;
      const response = await apiClient.get<ApiResponse<PaginatedResponse<VocabularyWord>>>(endpoint);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to fetch vocabulary');
    } catch (error) {
      // Fallback with mock data for development
      if (process.env.NODE_ENV === 'development') {
        return this.getMockVocabulary(params);
      }
      
      throw error;
    }
  }

  // Get a specific vocabulary word
  async getVocabularyWord(id: string): Promise<VocabularyWord> {
    try {
      const response = await apiClient.get<ApiResponse<VocabularyWord>>(`/vocabulary/${id}`);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || 'Vocabulary word not found');
    } catch (error) {
      // Fallback with mock data for development
      if (process.env.NODE_ENV === 'development') {
        return this.getMockVocabularyWord(id);
      }
      
      throw error;
    }
  }

  // Update vocabulary word mastery level
  async updateMasteryLevel(wordId: string, masteryLevel: number): Promise<VocabularyWord> {
    try {
      const response = await apiClient.patch<ApiResponse<VocabularyWord>>(`/vocabulary/${wordId}/mastery`, {
        masteryLevel,
        lastReviewed: new Date().toISOString(),
      });
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to update mastery level');
    } catch (error) {
      // Fallback for development
      if (process.env.NODE_ENV === 'development') {
        const mockWord = this.getMockVocabularyWord(wordId);
        return {
          ...mockWord,
          masteryLevel,
          lastReviewed: new Date().toISOString(),
        };
      }
      
      throw error;
    }
  }

  // Get vocabulary collections
  async getCollections(): Promise<VocabularyCollection[]> {
    try {
      const response = await apiClient.get<ApiResponse<VocabularyCollection[]>>('/vocabulary/collections');
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to fetch collections');
    } catch (error) {
      // Fallback with mock data for development
      if (process.env.NODE_ENV === 'development') {
        return this.getMockCollections();
      }
      
      throw error;
    }
  }

  // Create a new vocabulary collection
  async createCollection(collectionData: Omit<VocabularyCollection, 'id' | 'createdBy' | 'createdAt'>): Promise<VocabularyCollection> {
    try {
      const response = await apiClient.post<ApiResponse<VocabularyCollection>>('/vocabulary/collections', collectionData);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to create collection');
    } catch (error) {
      // Fallback for development
      if (process.env.NODE_ENV === 'development') {
        return {
          id: `collection-${Date.now()}`,
          createdBy: 'demo-user-1',
          createdAt: new Date().toISOString(),
          ...collectionData,
        };
      }
      
      throw error;
    }
  }

  // Add word to collection
  async addWordToCollection(collectionId: string, wordId: string): Promise<void> {
    try {
      const response = await apiClient.post<ApiResponse<void>>(`/vocabulary/collections/${collectionId}/words`, {
        wordId,
      });
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to add word to collection');
      }
    } catch (error) {
      // Fallback for development
      if (process.env.NODE_ENV === 'development') {
        console.log(`Added word ${wordId} to collection ${collectionId}`);
        return;
      }
      
      throw error;
    }
  }

  // Get words due for review
  async getWordsForReview(limit: number = 20): Promise<VocabularyWord[]> {
    try {
      const response = await apiClient.get<ApiResponse<VocabularyWord[]>>(`/vocabulary/review?limit=${limit}`);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to fetch words for review');
    } catch (error) {
      // Fallback with mock data for development
      if (process.env.NODE_ENV === 'development') {
        return this.getMockReviewWords(limit);
      }
      
      throw error;
    }
  }

  // Search vocabulary words
  async searchVocabulary(query: string, limit: number = 10): Promise<VocabularyWord[]> {
    try {
      const response = await apiClient.get<ApiResponse<VocabularyWord[]>>(`/vocabulary/search?q=${encodeURIComponent(query)}&limit=${limit}`);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || 'Search failed');
    } catch (error) {
      // Fallback with mock data for development
      if (process.env.NODE_ENV === 'development') {
        return this.getMockSearchResults(query, limit);
      }
      
      throw error;
    }
  }

  // Get vocabulary statistics
  async getVocabularyStats(): Promise<{
    totalWords: number;
    masteredWords: number;
    wordsInProgress: number;
    averageMastery: number;
    dailyProgress: number;
  }> {
    try {
      const response = await apiClient.get<ApiResponse<any>>('/vocabulary/stats');
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to fetch vocabulary stats');
    } catch (error) {
      // Fallback with mock data for development
      if (process.env.NODE_ENV === 'development') {
        return {
          totalWords: 1247,
          masteredWords: 342,
          wordsInProgress: 156,
          averageMastery: 2.8,
          dailyProgress: 12,
        };
      }
      
      throw error;
    }
  }

  // Mock data methods for development
  private getMockVocabulary(params: VocabularyQueryParams): PaginatedResponse<VocabularyWord> {
    const mockWords: VocabularyWord[] = [
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
        difficulty: 'intermediate',
        masteryLevel: 2,
        lastReviewed: '2024-01-15T10:30:00Z',
        createdAt: '2024-01-10T08:00:00Z',
      },
      {
        id: '2',
        word: 'fascinating',
        definition: 'Extremely interesting and captivating',
        pronunciation: 'ˈfæsɪneɪtɪŋ',
        partOfSpeech: 'adjective',
        examples: [
          'The documentary was absolutely fascinating.',
          'She told us fascinating stories about her travels.'
        ],
        difficulty: 'beginner',
        masteryLevel: 4,
        lastReviewed: '2024-01-16T14:20:00Z',
        createdAt: '2024-01-08T12:00:00Z',
      },
      {
        id: '3',
        word: 'extraordinary',
        definition: 'Very unusual or remarkable; going beyond what is normal',
        pronunciation: 'ɪkˈstrɔːdənəri',
        partOfSpeech: 'adjective',
        examples: [
          'She has an extraordinary talent for music.',
          'The view from the mountain was extraordinary.'
        ],
        difficulty: 'advanced',
        masteryLevel: 1,
        createdAt: '2024-01-12T16:45:00Z',
      },
    ];

    const filteredWords = mockWords.filter(word => {
      if (params.difficulty && word.difficulty !== params.difficulty) return false;
      if (params.partOfSpeech && word.partOfSpeech !== params.partOfSpeech) return false;
      if (params.masteryLevel !== undefined && word.masteryLevel !== params.masteryLevel) return false;
      if (params.search && !word.word.toLowerCase().includes(params.search.toLowerCase())) return false;
      return true;
    });

    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedWords = filteredWords.slice(startIndex, endIndex);

    return {
      data: paginatedWords,
      pagination: {
        page,
        pageSize,
        total: filteredWords.length,
        totalPages: Math.ceil(filteredWords.length / pageSize),
      },
    };
  }

  private getMockVocabularyWord(id: string): VocabularyWord {
    return {
      id,
      word: 'adventure',
      definition: 'An exciting or remarkable experience',
      pronunciation: 'ədˈvɛntʃər',
      partOfSpeech: 'noun',
      examples: [
        'Their trip to the mountains was quite an adventure.',
        'She loves reading adventure stories.'
      ],
      difficulty: 'intermediate',
      masteryLevel: 3,
      lastReviewed: '2024-01-15T10:30:00Z',
      createdAt: '2024-01-10T08:00:00Z',
    };
  }

  private getMockCollections(): VocabularyCollection[] {
    return [
      {
        id: 'collection-1',
        name: 'Essential Academic Words',
        description: 'Core vocabulary for academic writing and reading',
        wordCount: 570,
        difficulty: 'intermediate',
        isPublic: true,
        createdBy: 'system',
        createdAt: '2024-01-01T00:00:00Z',
      },
      {
        id: 'collection-2',
        name: 'Business English',
        description: 'Professional vocabulary for business communication',
        wordCount: 423,
        difficulty: 'advanced',
        isPublic: true,
        createdBy: 'system',
        createdAt: '2024-01-01T00:00:00Z',
      },
      {
        id: 'collection-3',
        name: 'My Personal Collection',
        description: 'Words I want to focus on',
        wordCount: 25,
        difficulty: 'mixed',
        isPublic: false,
        createdBy: 'demo-user-1',
        createdAt: '2024-01-15T12:00:00Z',
      },
    ];
  }

  private getMockReviewWords(limit: number): VocabularyWord[] {
    const reviewWords: VocabularyWord[] = [
      {
        id: '4',
        word: 'comprehension',
        definition: 'The ability to understand something',
        partOfSpeech: 'noun',
        examples: ['Reading comprehension is important for academic success.'],
        difficulty: 'intermediate',
        masteryLevel: 1,
        lastReviewed: '2024-01-10T08:00:00Z',
        createdAt: '2024-01-08T10:00:00Z',
      },
      {
        id: '5',
        word: 'articulate',
        definition: 'Having or showing the ability to speak fluently and coherently',
        partOfSpeech: 'adjective',
        examples: ['She gave an articulate presentation.'],
        difficulty: 'advanced',
        masteryLevel: 2,
        lastReviewed: '2024-01-12T15:30:00Z',
        createdAt: '2024-01-05T14:00:00Z',
      },
    ];

    return reviewWords.slice(0, limit);
  }

  private getMockSearchResults(query: string, limit: number): VocabularyWord[] {
    const allWords = this.getMockVocabulary({}).data;
    return allWords
      .filter(word => 
        word.word.toLowerCase().includes(query.toLowerCase()) ||
        word.definition.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, limit);
  }
}

export const vocabularyService = new VocabularyService();
export default vocabularyService;