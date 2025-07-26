/**
 * Story Service
 * Handles story content and reading sessions
 */

import { apiClient, ApiResponse, PaginatedResponse, Story } from '@/lib/api';

interface StoryFilters {
  difficulty?: string;
  wordCount?: { min?: number; max?: number };
  readingTime?: { min?: number; max?: number };
  search?: string;
}

interface StoryQueryParams extends StoryFilters {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface ReadingSession {
  id: string;
  storyId: string;
  userId: string;
  startedAt: string;
  completedAt?: string;
  progress: number;
  vocabularyEncountered: string[];
  readingTime: number;
}

class StoryService {
  // Get all stories with filtering and pagination
  async getStories(params: StoryQueryParams = {}): Promise<PaginatedResponse<Story>> {
    try {
      const queryString = new URLSearchParams();
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (typeof value === 'object' && 'min' in value) {
            // Handle range filters
            if (value.min !== undefined) queryString.append(`${key}_min`, String(value.min));
            if (value.max !== undefined) queryString.append(`${key}_max`, String(value.max));
          } else {
            queryString.append(key, String(value));
          }
        }
      });

      const endpoint = `/stories?${queryString.toString()}`;
      const response = await apiClient.get<ApiResponse<PaginatedResponse<Story>>>(endpoint);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to fetch stories');
    } catch (error) {
      // Fallback with mock data for development
      if (process.env.NODE_ENV === 'development') {
        return this.getMockStories(params);
      }
      
      throw error;
    }
  }

  // Get a specific story by ID
  async getStory(id: string): Promise<Story> {
    try {
      const response = await apiClient.get<ApiResponse<Story>>(`/stories/${id}`);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || 'Story not found');
    } catch (error) {
      // Fallback with mock data for development
      if (process.env.NODE_ENV === 'development') {
        return this.getMockStory(id);
      }
      
      throw error;
    }
  }

  // Start a reading session
  async startReadingSession(storyId: string): Promise<ReadingSession> {
    try {
      const response = await apiClient.post<ApiResponse<ReadingSession>>('/reading/sessions', {
        storyId,
        startedAt: new Date().toISOString(),
      });
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to start reading session');
    } catch (error) {
      // Fallback for development
      if (process.env.NODE_ENV === 'development') {
        return {
          id: `session-${Date.now()}`,
          storyId,
          userId: 'demo-user-1',
          startedAt: new Date().toISOString(),
          progress: 0,
          vocabularyEncountered: [],
          readingTime: 0,
        };
      }
      
      throw error;
    }
  }

  // Update reading session progress
  async updateReadingProgress(
    sessionId: string, 
    progress: number, 
    vocabularyEncountered: string[] = []
  ): Promise<ReadingSession> {
    try {
      const response = await apiClient.patch<ApiResponse<ReadingSession>>(`/reading/sessions/${sessionId}`, {
        progress,
        vocabularyEncountered,
        lastUpdated: new Date().toISOString(),
      });
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to update reading progress');
    } catch (error) {
      // Fallback for development
      if (process.env.NODE_ENV === 'development') {
        return {
          id: sessionId,
          storyId: 'story-1',
          userId: 'demo-user-1',
          startedAt: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
          progress,
          vocabularyEncountered,
          readingTime: Math.floor(Math.random() * 600) + 300, // 5-15 minutes
        };
      }
      
      throw error;
    }
  }

  // Complete reading session
  async completeReadingSession(sessionId: string): Promise<ReadingSession> {
    try {
      const response = await apiClient.patch<ApiResponse<ReadingSession>>(`/reading/sessions/${sessionId}/complete`, {
        completedAt: new Date().toISOString(),
        progress: 100,
      });
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to complete reading session');
    } catch (error) {
      // Fallback for development
      if (process.env.NODE_ENV === 'development') {
        return {
          id: sessionId,
          storyId: 'story-1',
          userId: 'demo-user-1',
          startedAt: new Date(Date.now() - 900000).toISOString(), // 15 minutes ago
          completedAt: new Date().toISOString(),
          progress: 100,
          vocabularyEncountered: ['mysterious', 'fascinating', 'extraordinary'],
          readingTime: 900, // 15 minutes
        };
      }
      
      throw error;
    }
  }

  // Get user's reading history
  async getReadingHistory(limit: number = 10): Promise<ReadingSession[]> {
    try {
      const response = await apiClient.get<ApiResponse<ReadingSession[]>>(`/reading/history?limit=${limit}`);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to fetch reading history');
    } catch (error) {
      // Fallback with mock data for development
      if (process.env.NODE_ENV === 'development') {
        return this.getMockReadingHistory(limit);
      }
      
      throw error;
    }
  }

  // Search stories
  async searchStories(query: string, limit: number = 10): Promise<Story[]> {
    try {
      const response = await apiClient.get<ApiResponse<Story[]>>(`/stories/search?q=${encodeURIComponent(query)}&limit=${limit}`);
      
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

  // Get recommended stories for user
  async getRecommendedStories(limit: number = 5): Promise<Story[]> {
    try {
      const response = await apiClient.get<ApiResponse<Story[]>>(`/stories/recommended?limit=${limit}`);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to get recommendations');
    } catch (error) {
      // Fallback with mock data for development
      if (process.env.NODE_ENV === 'development') {
        return this.getMockRecommendations(limit);
      }
      
      throw error;
    }
  }

  // Mock data methods for development
  private getMockStories(params: StoryQueryParams): PaginatedResponse<Story> {
    const mockStories: Story[] = [
      {
        id: '1',
        title: 'The Mysterious Library',
        content: 'In the heart of the ancient city stood a mysterious library that held secrets beyond imagination...',
        vocabularyIds: ['1', '2', '3'],
        difficulty: 'intermediate',
        wordCount: 1250,
        readingTime: 8,
        createdAt: '2024-01-15T10:00:00Z',
      },
      {
        id: '2',
        title: 'Adventures in Science',
        content: 'The fascinating world of scientific discovery awaits those brave enough to explore...',
        vocabularyIds: ['2', '4', '5'],
        difficulty: 'beginner',
        wordCount: 980,
        readingTime: 6,
        createdAt: '2024-01-14T14:30:00Z',
      },
      {
        id: '3',
        title: 'The Extraordinary Journey',
        content: 'What started as an ordinary day became an extraordinary adventure that would change everything...',
        vocabularyIds: ['3', '6', '7'],
        difficulty: 'advanced',
        wordCount: 1850,
        readingTime: 12,
        createdAt: '2024-01-13T09:15:00Z',
      },
    ];

    const filteredStories = mockStories.filter(story => {
      if (params.difficulty && story.difficulty !== params.difficulty) return false;
      if (params.search && !story.title.toLowerCase().includes(params.search.toLowerCase())) return false;
      if (params.wordCount?.min && story.wordCount < params.wordCount.min) return false;
      if (params.wordCount?.max && story.wordCount > params.wordCount.max) return false;
      if (params.readingTime?.min && story.readingTime < params.readingTime.min) return false;
      if (params.readingTime?.max && story.readingTime > params.readingTime.max) return false;
      return true;
    });

    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedStories = filteredStories.slice(startIndex, endIndex);

    return {
      data: paginatedStories,
      pagination: {
        page,
        pageSize,
        total: filteredStories.length,
        totalPages: Math.ceil(filteredStories.length / pageSize),
      },
    };
  }

  private getMockStory(id: string): Story {
    return {
      id,
      title: 'Sample Story',
      content: `This is a sample story for development purposes. The story contains various vocabulary words that users can learn while reading. It's an engaging narrative that combines entertainment with education, making vocabulary learning more enjoyable and effective.

The story unfolds in a mysterious setting where the protagonist encounters fascinating characters and extraordinary situations. Each paragraph is carefully crafted to introduce new vocabulary in context, helping readers understand meanings naturally through comprehension rather than rote memorization.

As the adventure continues, readers will discover that learning can be both challenging and rewarding. The comprehensive approach ensures that every word learned becomes part of their permanent vocabulary arsenal.`,
      vocabularyIds: ['1', '2', '3', '4', '5'],
      difficulty: 'intermediate',
      wordCount: 1200,
      readingTime: 8,
      createdAt: '2024-01-15T10:00:00Z',
    };
  }

  private getMockReadingHistory(limit: number): ReadingSession[] {
    const sessions: ReadingSession[] = [
      {
        id: 'session-1',
        storyId: '1',
        userId: 'demo-user-1',
        startedAt: '2024-01-15T14:00:00Z',
        completedAt: '2024-01-15T14:15:00Z',
        progress: 100,
        vocabularyEncountered: ['mysterious', 'fascinating'],
        readingTime: 900,
      },
      {
        id: 'session-2',
        storyId: '2',
        userId: 'demo-user-1',
        startedAt: '2024-01-14T16:30:00Z',
        completedAt: '2024-01-14T16:42:00Z',
        progress: 100,
        vocabularyEncountered: ['adventure', 'discover'],
        readingTime: 720,
      },
    ];

    return sessions.slice(0, limit);
  }

  private getMockSearchResults(query: string, limit: number): Story[] {
    const allStories = this.getMockStories({}).data;
    return allStories
      .filter(story => 
        story.title.toLowerCase().includes(query.toLowerCase()) ||
        story.content.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, limit);
  }

  private getMockRecommendations(limit: number): Story[] {
    const allStories = this.getMockStories({}).data;
    return allStories.slice(0, limit);
  }
}

export const storyService = new StoryService();
export default storyService;