import { api, ApiError } from '../api';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('API Client', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    localStorage.clear();
  });

  describe('GET requests', () => {
    it('should make successful GET request', async () => {
      const mockResponse = { data: 'test' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValueOnce(mockResponse),
      });

      const result = await api.get('/test');
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should include authorization header when token exists', async () => {
      localStorage.setItem('authToken', 'test-token');
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValueOnce({}),
      });

      await api.get('/test');
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token',
          }),
        })
      );
    });
  });

  describe('POST requests', () => {
    it('should make successful POST request with data', async () => {
      const mockData = { name: 'test' };
      const mockResponse = { id: 1, ...mockData };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: jest.fn().mockResolvedValueOnce(mockResponse),
      });

      const result = await api.post('/test', mockData);
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify(mockData),
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Error handling', () => {
    it('should throw ApiError for 4xx status codes', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: jest.fn().mockResolvedValueOnce({ message: 'Bad Request' }),
      });

      await expect(api.get('/test')).rejects.toThrow(ApiError);
    });

    it('should throw ApiError for 5xx status codes', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: jest.fn().mockResolvedValueOnce({ message: 'Server Error' }),
      });

      await expect(api.get('/test')).rejects.toThrow(ApiError);
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network Error'));

      await expect(api.get('/test')).rejects.toThrow('Network Error');
    });
  });

  describe('Token refresh', () => {
    it('should retry request with new token after 401 error', async () => {
      localStorage.setItem('authToken', 'expired-token');
      localStorage.setItem('refreshToken', 'valid-refresh-token');

      // First call returns 401
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: jest.fn().mockResolvedValueOnce({ message: 'Unauthorized' }),
      });

      // Refresh token call
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValueOnce({ 
          token: 'new-token',
          refreshToken: 'new-refresh-token'
        }),
      });

      // Retry original request
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValueOnce({ data: 'success' }),
      });

      const result = await api.get('/test');
      
      expect(mockFetch).toHaveBeenCalledTimes(3);
      expect(result).toEqual({ data: 'success' });
      expect(localStorage.getItem('authToken')).toBe('new-token');
    });
  });
});