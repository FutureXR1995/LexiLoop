/**
 * Test Service
 * Handles vocabulary testing and assessments
 */

import { apiClient, ApiResponse, TestSession, TestResult } from '@/lib/api';

interface TestQuestion {
  id: string;
  vocabularyId: string;
  type: 'multiple_choice' | 'fill_blank' | 'matching';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
}

interface TestConfiguration {
  vocabularyIds: string[];
  testTypes: string[];
  questionCount: number;
  timeLimit?: number; // in seconds
}

interface TestAnalytics {
  accuracy: number;
  averageResponseTime: number;
  weakAreas: string[];
  strongAreas: string[];
  improvementSuggestions: string[];
}

class TestService {
  // Create a new test session
  async createTestSession(config: TestConfiguration): Promise<TestSession> {
    try {
      const response = await apiClient.post<ApiResponse<TestSession>>('/tests/sessions', {
        ...config,
        startedAt: new Date().toISOString(),
      });
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to create test session');
    } catch (error) {
      // Fallback for development
      if (process.env.NODE_ENV === 'development') {
        return {
          id: `test-${Date.now()}`,
          storyId: 'story-1',
          vocabularyIds: config.vocabularyIds,
          startedAt: new Date().toISOString(),
          results: [],
        };
      }
      
      throw error;
    }
  }

  // Get test questions for a session
  async getTestQuestions(sessionId: string): Promise<TestQuestion[]> {
    try {
      const response = await apiClient.get<ApiResponse<TestQuestion[]>>(`/tests/sessions/${sessionId}/questions`);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to fetch test questions');
    } catch (error) {
      // Fallback with mock data for development
      if (process.env.NODE_ENV === 'development') {
        return this.getMockTestQuestions(sessionId);
      }
      
      throw error;
    }
  }

  // Submit an answer for a test question
  async submitAnswer(
    sessionId: string,
    questionId: string,
    answer: string,
    responseTime: number
  ): Promise<TestResult> {
    try {
      const response = await apiClient.post<ApiResponse<TestResult>>(`/tests/sessions/${sessionId}/answers`, {
        questionId,
        userAnswer: answer,
        responseTime,
        submittedAt: new Date().toISOString(),
      });
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to submit answer');
    } catch (error) {
      // Fallback for development
      if (process.env.NODE_ENV === 'development') {
        const mockQuestions = this.getMockTestQuestions(sessionId);
        const question = mockQuestions.find(q => q.id === questionId);
        const isCorrect = question ? answer === question.correctAnswer : false;
        
        return {
          questionId,
          vocabularyId: question?.vocabularyId || 'vocab-1',
          testType: question?.type || 'multiple_choice',
          isCorrect,
          responseTime,
          userAnswer: answer,
          correctAnswer: question?.correctAnswer || 'correct',
        };
      }
      
      throw error;
    }
  }

  // Complete a test session
  async completeTestSession(sessionId: string): Promise<TestSession> {
    try {
      const response = await apiClient.patch<ApiResponse<TestSession>>(`/tests/sessions/${sessionId}/complete`, {
        completedAt: new Date().toISOString(),
      });
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to complete test session');
    } catch (error) {
      // Fallback for development
      if (process.env.NODE_ENV === 'development') {
        return {
          id: sessionId,
          storyId: 'story-1',
          vocabularyIds: ['1', '2', '3'],
          startedAt: new Date(Date.now() - 600000).toISOString(), // 10 minutes ago
          completedAt: new Date().toISOString(),
          results: this.getMockTestResults(),
        };
      }
      
      throw error;
    }
  }

  // Get test session details
  async getTestSession(sessionId: string): Promise<TestSession> {
    try {
      const response = await apiClient.get<ApiResponse<TestSession>>(`/tests/sessions/${sessionId}`);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || 'Test session not found');
    } catch (error) {
      // Fallback for development
      if (process.env.NODE_ENV === 'development') {
        return {
          id: sessionId,
          storyId: 'story-1',
          vocabularyIds: ['1', '2', '3'],
          startedAt: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
          results: [],
        };
      }
      
      throw error;
    }
  }

  // Get user's test history
  async getTestHistory(limit: number = 10): Promise<TestSession[]> {
    try {
      const response = await apiClient.get<ApiResponse<TestSession[]>>(`/tests/history?limit=${limit}`);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to fetch test history');
    } catch (error) {
      // Fallback with mock data for development
      if (process.env.NODE_ENV === 'development') {
        return this.getMockTestHistory(limit);
      }
      
      throw error;
    }
  }

  // Generate adaptive test based on user performance
  async generateAdaptiveTest(difficulty: string, wordCount: number = 20): Promise<TestConfiguration> {
    try {
      const response = await apiClient.post<ApiResponse<TestConfiguration>>('/tests/adaptive', {
        difficulty,
        wordCount,
        userLevel: 'intermediate', // Could be fetched from user profile
      });
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to generate adaptive test');
    } catch (error) {
      // Fallback for development
      if (process.env.NODE_ENV === 'development') {
        return {
          vocabularyIds: ['1', '2', '3', '4', '5'],
          testTypes: ['multiple_choice', 'fill_blank'],
          questionCount: wordCount,
          timeLimit: wordCount * 30, // 30 seconds per question
        };
      }
      
      throw error;
    }
  }

  // Get test analytics and performance insights
  async getTestAnalytics(timeRange: 'week' | 'month' | 'all' = 'month'): Promise<TestAnalytics> {
    try {
      const response = await apiClient.get<ApiResponse<TestAnalytics>>(`/tests/analytics?range=${timeRange}`);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to fetch test analytics');
    } catch (error) {
      // Fallback with mock data for development
      if (process.env.NODE_ENV === 'development') {
        return {
          accuracy: 78.5,
          averageResponseTime: 12.3,
          weakAreas: ['Advanced Vocabulary', 'Idiomatic Expressions'],
          strongAreas: ['Basic Grammar', 'Common Words'],
          improvementSuggestions: [
            'Focus more on advanced vocabulary practice',
            'Try reading more complex texts',
            'Practice with timed exercises'
          ],
        };
      }
      
      throw error;
    }
  }

  // Get incorrect answers for review
  async getIncorrectAnswers(limit: number = 50): Promise<TestResult[]> {
    try {
      const response = await apiClient.get<ApiResponse<TestResult[]>>(`/tests/incorrect?limit=${limit}`);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to fetch incorrect answers');
    } catch (error) {
      // Fallback with mock data for development
      if (process.env.NODE_ENV === 'development') {
        return this.getMockIncorrectAnswers(limit);
      }
      
      throw error;
    }
  }

  // Reset test progress for a vocabulary word
  async resetWordProgress(vocabularyId: string): Promise<void> {
    try {
      const response = await apiClient.post<ApiResponse<void>>(`/tests/reset/${vocabularyId}`);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to reset word progress');
      }
    } catch (error) {
      // Fallback for development
      if (process.env.NODE_ENV === 'development') {
        console.log(`Reset progress for vocabulary word: ${vocabularyId}`);
        return;
      }
      
      throw error;
    }
  }

  // Mock data methods for development
  private getMockTestQuestions(sessionId: string): TestQuestion[] {
    return [
      {
        id: 'q1',
        vocabularyId: '1',
        type: 'multiple_choice',
        question: 'What does "mysterious" mean?',
        options: [
          'Full of mystery; difficult to understand',
          'Very bright and colorful',
          'Extremely large in size',
          'Making a lot of noise'
        ],
        correctAnswer: 'Full of mystery; difficult to understand',
        explanation: 'Mysterious describes something that is full of mystery or difficult to understand or explain.'
      },
      {
        id: 'q2',
        vocabularyId: '2',
        type: 'fill_blank',
        question: 'The documentary was absolutely _______.',
        correctAnswer: 'fascinating',
        explanation: 'Fascinating means extremely interesting and captivating.'
      },
      {
        id: 'q3',
        vocabularyId: '3',
        type: 'multiple_choice',
        question: 'Choose the synonym for "extraordinary":',
        options: [
          'Ordinary',
          'Remarkable',
          'Common',
          'Simple'
        ],
        correctAnswer: 'Remarkable',
        explanation: 'Extraordinary means very unusual or remarkable, so "remarkable" is the correct synonym.'
      }
    ];
  }

  private getMockTestResults(): TestResult[] {
    return [
      {
        questionId: 'q1',
        vocabularyId: '1',
        testType: 'multiple_choice',
        isCorrect: true,
        responseTime: 8.5,
        userAnswer: 'Full of mystery; difficult to understand',
        correctAnswer: 'Full of mystery; difficult to understand',
      },
      {
        questionId: 'q2',
        vocabularyId: '2',
        testType: 'fill_blank',
        isCorrect: false,
        responseTime: 15.2,
        userAnswer: 'interesting',
        correctAnswer: 'fascinating',
      },
      {
        questionId: 'q3',
        vocabularyId: '3',
        testType: 'multiple_choice',
        isCorrect: true,
        responseTime: 12.1,
        userAnswer: 'Remarkable',
        correctAnswer: 'Remarkable',
      }
    ];
  }

  private getMockTestHistory(limit: number): TestSession[] {
    const sessions: TestSession[] = [
      {
        id: 'test-1',
        storyId: 'story-1',
        vocabularyIds: ['1', '2', '3'],
        startedAt: '2024-01-15T15:00:00Z',
        completedAt: '2024-01-15T15:12:00Z',
        results: this.getMockTestResults(),
      },
      {
        id: 'test-2',
        storyId: 'story-2',
        vocabularyIds: ['4', '5', '6'],
        startedAt: '2024-01-14T14:30:00Z',
        completedAt: '2024-01-14T14:45:00Z',
        results: [
          {
            questionId: 'q4',
            vocabularyId: '4',
            testType: 'multiple_choice',
            isCorrect: true,
            responseTime: 9.8,
            userAnswer: 'Correct answer',
            correctAnswer: 'Correct answer',
          }
        ],
      }
    ];

    return sessions.slice(0, limit);
  }

  private getMockIncorrectAnswers(limit: number): TestResult[] {
    const incorrectAnswers: TestResult[] = [
      {
        questionId: 'q2',
        vocabularyId: '2',
        testType: 'fill_blank',
        isCorrect: false,
        responseTime: 15.2,
        userAnswer: 'interesting',
        correctAnswer: 'fascinating',
      },
      {
        questionId: 'q5',
        vocabularyId: '5',
        testType: 'multiple_choice',
        isCorrect: false,
        responseTime: 18.7,
        userAnswer: 'Wrong answer',
        correctAnswer: 'Correct answer',
      }
    ];

    return incorrectAnswers.slice(0, limit);
  }
}

export const testService = new TestService();
export default testService;